---
title: "CultCap: Finding where the camera was"
publishDate: 2026-09-23T00:00:00+10:00
description: "Structure from motion from first principles — features, matching, incremental versus global solving — and the ways a pose solver will quietly cheat when you leave it a free parameter."
tags:
  - cultcap
  - photogrammetry
  - structure-from-motion
  - colmap
draft: true
---

Before you can train a splat you need to know where every photo was taken from. Not
roughly — to within a fraction of a pixel of reprojection error, for every frame,
consistently. The phone's IMU gives you an approximate answer that drifts within
seconds. The real answer comes from the images themselves, and the process of getting
it is called structure from motion (SfM).

This is the step people describe as "run COLMAP" and move on. It's also the step that
decides whether your splat *can* be sharp, because the model can't resolve detail finer
than the disagreement between its cameras.

## How it works

**Features.** Find distinctive points in each image — corners, blobs, texture patches —
and describe the neighbourhood around each one so it can be recognised in another image.
The classic detector is SIFT, hand-designed in the nineties and still good. The modern
ones are learned networks that find more, and more repeatable, points.

**Matching.** For a pair of images, find which features are the same physical point.
Learned matchers do this far better than nearest-neighbour descriptor search, especially
across viewpoint changes.

**Which pairs?** You can't match every image against every other; that's quadratic and
most pairs share nothing. So you match each frame against its neighbours in capture
order — a *sequential window* — and, if the capture revisits somewhere it's been, you
need a separate mechanism to notice. That's *retrieval*: a compact whole-image
descriptor, compared across the whole session, to propose long-range pairs.

**Two-view geometry.** From matches between two images you can recover their relative
rotation and the direction between them (not the distance — that's the scale ambiguity
of monocular vision), and reject matches that don't fit.

**Solving.** Now the big choice.

*Incremental* SfM starts from one good pair, triangulates points, adds the next best
image by finding where it must be to see those points, triangulates more, and repeats.
It's robust and well understood. It's also slow, and its result depends on which pair it
started from.

*Global* SfM takes all the pairwise rotations and translation directions at once and
solves for every camera simultaneously — first rotations, then positions. Much faster,
no dependence on a starting pair, and better at spreading error evenly. But it's solving
one big optimisation, and big optimisations have local minima.

**Bundle adjustment.** Finally, jointly refine every camera and every 3D point to
minimise reprojection error. This is where intrinsics get refined too, if you let it.

<!-- TODO: diagram — two frames, matched features, triangulated point, reprojection error arrows -->

## Why I care

For CultCap the capture is a person walking one or more loops around an object with a
phone. That shape has consequences. Consecutive frames are close together, so the
sequential window does most of the work. But a second loop at a different height revisits
the same views from different positions, and if nothing notices, the solver builds two
disconnected reconstructions and stitches them wherever it can. The object appears
twice. Each copy is internally perfect.

And I care about determinism. I'm running experiments — change one thing, compare the
result. If the pose solver gives a different answer on the same input, every downstream
comparison is contaminated.

## What I did

1. **Learned features and a learned matcher**, replacing SIFT. The immediate effect was
   registration: captures that SIFT registered a third of the frames on now register
   all of them. Smooth objects — bronze, polished wood — have few classic corners, and
   the learned detector finds points SIFT can't.

2. **A global solver.** Faster, and on repeated runs it registers exactly the same set of
   frames every time. Given the same match graph, the frame count is deterministic.

3. **Retrieval pairing** for multi-loop captures. Without it, a second orbit stays
   disconnected. With it, the loops knit. The fixed sequential window turned out to be
   fine, because the app already de-duplicates frames by rotation at save time, so frame
   index is a decent proxy for angular motion.

4. **A continuity check on the result.** The largest jump between consecutive camera
   positions, divided by the median step. A person walking around an object doesn't
   teleport. If the ratio spikes, the reconstruction has folded, and the run is stopped
   before it spends hours training on a doubled object.

5. **Fixed the intrinsics and refined only the poses.** See below.

## Gotchas

**Sharp isn't the same as matchable.** I spent weeks on frame sharpness before noticing
that the captures that failed to register weren't blurry — they were smooth. Matching
needs *texture*. A crisply focused photo of a plain surface gives the detector nothing to
hold on to. No amount of frame filtering fixes that; only a better detector, or a
capture protocol that puts something textured in the frame.

**A doubled reconstruction looks great by every metric.** Each camera sees its own copy
of the object and renders it perfectly. Held-out views score fine — sometimes better than
the correct model. The only thing that can see it is a check on the *trajectory*, which
is why the continuity ratio exists. If you don't have one, you have models that scored
well and are wrong.

<!-- TODO: image — a doubled reconstruction's camera path, with the fold circled -->

**Global solvers can be non-deterministic.** Same code, same matches, different random
seed, and the result goes from a clean walk-around to a folded mess. The match graph
was identical; the failure was inside the global positioning step finding a different
minimum. Any single-run comparison over the pose stage is one draw from a distribution.
Repeat it, or gate on continuity before believing it.

**Every free parameter is an invitation to cheat.** Bundle adjustment minimises
reprojection error, and it doesn't care how. Let it refine the focal length per image and
it will — not to track the lens's real focus breathing, but to exploit the dolly-zoom
ambiguity: stepping back and zooming in look nearly identical for a compact object, so
the solver slides each camera along that valley, trading distance for focal length. The
fitted focal lengths varied wildly across a capture and correlated *negatively* with what
the lens actually reported. Reprojection error went down. The geometry was fiction. The
same thing happened with higher-order distortion coefficients. Anything the data can't
independently constrain, hold fixed.

**There is no scale.** Monocular SfM tells you the shape of the camera path and the
object, but not the size. Everything is up to a global scale factor, which is why the
continuity check is a ratio and not a distance, and why "the object is 30 cm tall" needs
something external — a known object, the IMU, or a person with a tape measure.

## What I'd tell someone starting out

Use a learned matcher; the improvement on real, handheld, badly lit captures is not
subtle. Use a global solver, but check its output for folds. Seed it with the lens
values from the previous post, and don't let it refine what it can't measure. And keep
one plain-texture object in your test set, because it will fail in a way none of your
sharpness metrics predict.

Next: removing the room, and why one object at a time is the assumption that makes
everything else tractable.
