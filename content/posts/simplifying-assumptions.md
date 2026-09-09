---
title: "The right assumption deletes the problem"
publishDate: 2026-08-26T00:00:00+10:00
description: "Trains can't turn fast, so rail point clouds are nearly 2D. CultCap captures one object at a time, so background removal is possible. Good assumptions don't shrink hard problems — they delete them."
tags:
  - cultcap
  - engineering
  - point-clouds
  - pipeline
draft: true
---

There's a kind of engineering win that doesn't come from a better algorithm or more
compute. It comes from noticing something true about your problem that the general version
of the problem doesn't get to assume — and then leaning on it so hard that a whole class
of difficulty disappears.

Not "makes it easier." Deletes it. The general problem stays unsolved and you ship anyway,
because you were never actually facing the general problem.

Two examples, a few years apart.

## Trains can't turn fast

At Cordel I led a team processing rail corridor point clouds — LiDAR captured from a
moving train, at a scale I hadn't worked at before. Point clouds in the billions of
points, and questions like: does anything intrude into the clearance envelope? Where is
the overhead wire relative to the track?

Asked in full 3D, these are miserable questions. Arbitrary geometry, arbitrary
orientation, huge search spaces.

But a train physically cannot turn fast. Track curvature is bounded by physics and by
standards — the geometry that keeps a hundred tonnes of rolling stock on the rails also
guarantees that over any short stretch, the corridor is very nearly straight. Which means
you can slice the cloud into thin cross-sections perpendicular to the track, and each
slice is honestly, usefully **2D**.

<!-- TODO: diagram — corridor sliced into cross-sections, one slice expanded as a 2D profile with the clearance envelope overlaid -->

Suddenly the hard 3D questions become 2D ones. A clearance envelope is a polygon.
"Does vegetation intrude?" is point-in-polygon. The wire is a point in a slice you can
track from one slice to the next. Every algorithm gets simpler, faster, and — the part
that matters most in infrastructure — *explainable*. You can show an engineer the slice.

<!-- TODO: check what I can say specifically about the Cordel pipeline publicly; keep it at this altitude otherwise -->

The assumption wasn't a shortcut we hoped would hold. It was load-bearing physics. The
train guarantees it, every metre, every capture.

## One object at a time

CultCap turns handheld phone footage of heritage objects into Gaussian splats and
archival-quality meshes. One of the standing problems in that pipeline is background
removal: the museum wants the object, not the storeroom shelf behind it.

General background segmentation is a research field. Segmenting *anything* from *anything*
in *any* footage — you can burn a career there, and the failure cases never stop coming.

But CultCap doesn't capture scenes. It captures **one object at a time**. That's not a
limitation I'm apologising for — it's the product. A museum digitises a collection object
by object, and the capture protocol is "walk around the thing."

Assume a single object and background removal stops being a perception problem and starts
being a geometry problem:

- The camera orbits a fixed subject, so the object is the thing every view converges on.
  The background moves through the frames; the object stays.
- The object occupies a bounded volume near the orbit centre. Anything reconstructed
  outside that volume is background by definition — not by classification.
- Ambiguous cases at the boundary are rare enough to handle, instead of being the whole
  job.

<!-- TODO: concrete pipeline details — how the bounding volume is estimated, what segmentation (if any) assists, before/after renders of a capture with a cluttered storeroom background -->

I don't need a model that understands what a "background" is. I need the capture protocol
to guarantee a geometric fact, and then I get to lean on it — the same way the train
guaranteed the corridor was straight.

## What makes an assumption good

The pattern in both cases, and the checklist I now run on purpose rather than by luck:

1. **It's enforced by something outside your code.** Physics and rail standards enforce
   the curvature bound. The capture protocol enforces one-object-at-a-time. An assumption
   only you promise to maintain is just a bug with good intentions.
2. **It deletes a problem class, not a constant factor.** 2D slices don't make the 3D
   algorithms faster — they make them unnecessary. That's the difference between an
   assumption and an optimisation.
3. **It's checkable.** When it fails, you want to *know*, not to get quietly wrong
   answers. Curvature is measurable per slice. "Is there one dominant object near the
   orbit centre?" is measurable per capture. The assumption comes with its own alarm.
4. **You'd defend it as a product decision, not just a technical one.** "CultCap does one
   object at a time" is a sentence a museum understands and agrees with. If explaining
   the assumption to a user makes the product sound worse, it's probably a shortcut, not
   an assumption.

The uncomfortable part is that finding these means arguing *against* generality, and
generality is what we're trained to admire. The general solution feels like the serious
one. But the general problem usually belongs to a research community with a decade of
runway. Your problem — the actual one, with its actual physics and its actual users —
is almost always smaller than the one you first wrote down.

The skill is noticing where.

<!-- TODO: possible closer — the failed version: an assumption I leaned on that *wasn't* enforced by anything, and what it cost. Candidates: [add one from games or Dekko days] -->
