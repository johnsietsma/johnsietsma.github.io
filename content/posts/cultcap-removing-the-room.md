---
title: "CultCap: Removing the room"
publishDate: 2026-09-30T00:00:00+10:00
description: "The museum wants the object, not the storeroom behind it. How masking fits into a splat pipeline, the places a mask has to reach to actually work, and the ways a masked model quietly goes wrong."
tags:
  - cultcap
  - gaussian-splatting
  - masking
  - segmentation
draft: true
---

A splat trained on a walk-around video reconstructs everything the camera saw: the
object, the plinth, the wall behind it, the fire extinguisher, the other visitor. For a
scene capture that's the point. For CultCap it's the opposite of the point. A museum
wants the sculpture, cleanly, on any background they choose.

So somewhere in the pipeline, the room has to go. This post is about where, and about the
ways "just mask it out" turned out to be several different problems.

## What a mask is, and where it can act

A mask is a per-frame image saying which pixels are object and which are background.
Segmentation models produce these from a single photo, and the current generation is
very good at it for a clear, centred subject. That's the easy part.

The harder question is where in the pipeline the mask gets used, because there are
several candidates and they don't do the same thing:

- **Feature extraction and matching.** Only find and match points on the object, so the
  sparse reconstruction contains no background geometry.
- **Point cloud filtering.** Reconstruct everything, then drop the background points
  before initialising the model.
- **The training loss.** Only penalise the model for mismatches inside the mask, and
  penalise it for putting anything opaque outside.
- **Evaluation.** Score renders only inside the mask, so background reconstruction
  quality doesn't pollute the number.
- **Post-training pruning.** Delete Gaussians that ended up far from the object.

<!-- TODO: diagram — the pipeline with each of these five insertion points marked -->

A mask that only acts on the output image is a crop. A mask that acts on the loss shapes
what the model learns. A mask that acts on the features shapes what the solver can even
see. They compound.

## Why I care

I wrote about this in [the simplifying assumptions post](/posts/simplifying-assumptions/):
CultCap captures one object at a time, and that assumption is what turns background
removal from a perception problem into a geometry problem. The camera orbits a fixed
subject; the object is what every view converges on; anything far from the orbit centre
is background by construction.

That's true and it helps. What the assumption *doesn't* do is tell you the object's
outline in any given frame. For that you still need a segmenter, and a segmenter has no
idea it's looking at frame 140 of 300 of the same thing.

## What I did

1. **Segment every frame** with a general-purpose foreground model. It produces a soft
   matte, not a hard edge, which matters at hair, fringes and thin structures.

2. **Run pose finding on the whole frame, then re-triangulate through the mask.** The
   room is actually useful for finding where the camera was — walls and floors are full
   of matchable texture. So the solver sees everything, and only the 3D points that
   project inside the mask survive into the initial model.

3. **Mask the loss.** The model is scored against the photograph only where the mask
   says object, with a penalty for opacity where the mask says background. Without the
   penalty, the model has no reason not to grow a faint haze of Gaussians in the
   unsupervised region, and it does.

4. **Mask the evaluation** so held-out scores measure the object. And then, separately,
   measure the things a masked score *can't* see — more on that below.

## Gotchas

**Extract, then mask, and you've thrown away the budget.** Feature detectors work to a
per-image budget — find the best few thousand points. If the room is textured and the
object is a smooth bronze, most of that budget lands on the room, and then the mask
discards it. The object ends up represented by a few dozen points per frame, the model
initialises from a starved cloud, and densification has nothing to tell it where the
surface is. The fix is to mask *before* the detector spends its budget, so the points it
does find are all on the object. Obvious in hindsight. Invisible until I counted.

**Masks flicker.** A per-frame segmenter has no memory. A lobster's antennae are in the
mask in one frame and gone in the next. A second object on the table is included in one
frame out of a hundred. The model is trained against a target that disagrees with itself,
and the metrics score it against the same disagreement. There's a family of fixes —
temporal smoothing, propagating a mask from the previous frame, flagging and excluding
the outliers — and the first step is just measuring how much the mask area drifts between
neighbours.

<!-- TODO: image — three consecutive frames with masks overlaid, showing an antenna appear and vanish -->

**A masked score can't see the silhouette.** If you only score pixels inside the mask,
a model that has bloated to twice the object's real outline scores exactly the same as
one that hasn't. The extra Gaussians are outside the region being measured. Users see
it immediately. The metric can't. The rendered-area-to-mask-area ratio is a
one-line metric that catches it, and it took me an embarrassingly long time to add.

**Glass cases.** A museum object behind glass gives you reflections that move with the
camera, which the model will happily reconstruct as floating geometry in front of the
object, and a focus system that locks on the glass instead of the thing behind it.
There's no clever fix I know of yet; it's on the list.

**Thin things are hard twice.** Antennae, stems, wire — the segmenter loses them, and
then the model struggles to make them opaque even when they're in the mask. Both
problems show up as the same missing detail, so it's worth checking the mask before
blaming the trainer.

## The shape of the problem

The one-object assumption really does delete a class of problems. I don't need a model
that understands what a room is. But it replaces them with a smaller, more specific set:
the mask has to reach the right stages, it has to be consistent with itself across
frames, and the evaluation has to be able to see the failures it introduces. That's a
much better problem to have. It's still a problem.

Next: what the model is actually learning, and why it prefers blur.
