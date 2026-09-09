---
title: "CultCap: What the model is actually learning"
publishDate: 2026-10-07T00:00:00+10:00
description: "What a Gaussian is, what the training loss compares, how the model decides where to add detail — and why, left to itself, it will choose blur and call it correct."
tags:
  - cultcap
  - gaussian-splatting
  - training
  - loss-functions
draft: true
---

A trained splat is a few hundred thousand tiny blobs in space, each with a position, a
size, an orientation, an opacity and a colour. Render them from a camera and you get an
image. Training is the process of nudging every blob until the rendered image matches
the photograph taken from that camera — repeated, for every photograph, tens of
thousands of times.

That sounds simple, and the core of it is. The interesting part is that the model will
find the *cheapest* way to match the photographs, and cheapest is not the same as best.
This post is about what "match" means, how the model grows, and the two ways I was
accidentally asking for blur.

## The pieces

**A Gaussian.** A 3D ellipsoid with soft edges: a centre, three scales, a rotation, an
opacity. Plus colour — not one colour, but a set of spherical harmonic coefficients, so
the colour can vary with the direction you're looking from. That's how a splat
represents shine and reflection: the same blob is a different colour from different
angles.

**Rendering.** Project every Gaussian into the camera, sort by depth, and composite front
to back. It's differentiable, which is the whole reason this works: you can ask "if this
blob were slightly to the left, would the render be closer to the photo?" and get an
answer for every parameter of every blob at once.

**The loss.** The standard recipe compares render to photo with a mix of two terms.
L1 is the mean absolute pixel difference — simple and robust. SSIM, structural
similarity, compares local means, contrasts and correlations in small windows, and was
designed to track human judgement better than raw pixel error. Most trainers weight them
roughly four to one.

**Densification.** You don't start with enough Gaussians. Periodically the trainer looks
for places where the model is struggling and adds more — cloning small blobs, splitting
large ones — and prunes blobs that have faded to nothing. *How* it decides where to grow
is a strategy choice, and there are several. The original approach grows wherever the
gradient is large, meaning wherever the render is being pulled hardest. An alternative
keeps a fixed population and relocates dead blobs toward live ones.

<!-- TODO: diagram — one Gaussian's parameters, and the render/compare/update loop -->

## Why I care

The loss defines what "good" means. Everything else — the densification, the learning
rates, the number of steps — is machinery for getting there. If the loss can't tell a
sharp render from a soft one, the machinery has no reason to prefer sharp. And I care a
great deal about sharp: the point of CultCap is a curator zooming in on the tool marks.

I also care because the model is a black box that's very easy to blame. When the renders
came out flat, my first three hypotheses were about the model's capacity. All three were
wrong.

## What I did

1. **Give training the same per-frame cameras the solver found.** For a long time the
   trainer supervised every frame through one shared camera — the session's median lens —
   while the pose solver had produced a slightly different camera per frame. The poses
   were right *for their cameras*. Rendered through a different one, every frame was
   subtly misaligned with its own photograph, and the model split the difference. Fixing
   this was the single largest improvement in the project, and it wasn't a training
   change at all. It was plumbing.

2. **Switch densification strategy.** The population-based approach kept its budget
   saturated with faint, translucent blobs and never routed new ones to the places that
   needed them. Gradient-driven growth built a comparable model with a fraction of the
   Gaussians and a much healthier opacity distribution.

3. **Take appearance correction out of the loss.** Exposure and white balance are
   handled by normalising the photographs before training, not by fitting a correction
   inside the trainer. That's the next post.

4. **Train at a sensible resolution.** Bigger inputs did not help; the model has a
   working resolution beyond which extra pixels are just noise it has to explain.

## Gotchas

**Aligned blur beats misaligned detail.** Take a sharp photograph and shift it two
pixels. Take the same photograph and blur it past recognition. Score both against the
original with L1 and SSIM: the blurred one wins. This isn't a quirk; it's arithmetic.
Detail in the wrong place is penalised twice — once for being there, once for being
absent where it should be — while a smooth surface is penalised mildly, once. So when the
model can't place detail *exactly*, and with imperfect poses it never can, the loss
rewards it for not trying. That's not a bug in the model. It's the objective, doing what
it was told.

**SSIM doesn't reward texture. It rewards *correlated* texture.** I'd assumed SSIM was
the perceptual safeguard in the loss — the term that would stop the model settling for
mush. It isn't. Its structure term measures correlation with the target. A flat render
has zero variance and scores moderately. A render with real texture in the wrong place
has high variance and low correlation and scores *worse* than flat. Sand grain, fabric
weave, stone speckle — anything stochastic that can't be pinned to the same pixels from
every view — is punished for being present. Raising the SSIM weight makes this worse,
not better.

<!-- TODO: figure — GT / flat / uncorrelated texture / correlated texture, with scores -->

**The model will explain exposure with geometry if you let it.** Spherical harmonic
colour lets a blob look different from different directions. That's for shine. But the
camera's auto-exposure also makes the object look different from different directions,
because it changed the exposure as you walked. Given a set of photographs with a stop of
brightness swing across the orbit, the model learns an object that's *brighter on one
side*, encoded in view-dependent colour, and every frame-matching score says it's doing
great. The wobble hasn't been removed. It's been absorbed.

**More Gaussians don't go where you need them.** When a region of the object rendered
see-through, I raised the Gaussian cap. The model grew by half and the hole stayed. The
extra capacity went where the strategy sends it, which was not the thin, well-observed
rim that needed it. Capacity was never the constraint; allocation was.

**"Flat" usually means misaligned, not under-powered.** Every one of my capacity
hypotheses was really a symptom of the cameras. Before touching the model, check that
every frame is being rendered through exactly the camera it was solved with.

## The uncomfortable conclusion

A splat trainer, given standard losses, will produce the sharpest model *that its poses
allow* and no sharper — and then it will get rewarded for the blur. If you want detail,
the work is upstream: better cameras, better poses, better alignment. And when you do
finally get detail back, be ready for the numbers to go down. The next-but-one post is
about that.

Next: getting colour right.
