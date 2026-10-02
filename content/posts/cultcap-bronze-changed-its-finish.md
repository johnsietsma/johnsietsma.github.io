---
title: "CultCap: The bronze that changed its finish"
publishDate: 2026-10-09T00:00:00+10:00
description: "In a steadily lit gallery, a bronze sculpture's model turned from matte to polished as it spun. The light didn't change. The camera did. Before-and-after evidence, and the two-number fix."
tags:
  - cultcap
  - radiometry
  - colour
  - gaussian-splatting
draft: true
---

In the [Newcastle Art Gallery post](/posts/cultcap-newcastle-art-gallery/) there's a bronze:
Guy Boyd's *Lovers' Metamorphosis* (1979), on a white plinth in the middle of a room. Watch
the model turn and something odd happens partway round. The metal goes from a soft matte
brown to something that looks freshly polished, then back again.

The sculpture didn't do that. Neither did the gallery lights, which were steady the whole
time. The camera did, and the model faithfully learned it.

Here's the same model trained twice, once without an exposure correction and once with it.
Same photographs, same camera positions, same training settings, same camera path for the
video.

<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="https://media.johnsietsma.com/video/cultcap/bronze-finish/bronze-correction-off-on.mp4" type="video/mp4">
  </video>
  <figcaption>Left: trained on the photographs as they came off the phone. Right: trained with each frame's recorded exposure accounted for. Watch the far side of the sculpture.</figcaption>
</figure>

In a moving clip the change is gradual, and your eye adapts to it. Hold one view still
and compare the two models directly. Drag the handle across the bronze:

<img-comparison-slider aria-label="Drag to compare the uncorrected and corrected models at a view inside the affected arc">
  <figure slot="first" class="compare-pane">
    <img src="/assets/images/cultcap/bronze-finish/slider-affected-off.jpg" alt="The bronze rendered by the uncorrected model, from a view inside the arc where the camera exposed down.">
    <figcaption>Correction off</figcaption>
  </figure>
  <figure slot="second" class="compare-pane">
    <img src="/assets/images/cultcap/bronze-finish/slider-affected-on.jpg" alt="The same view rendered by the corrected model.">
    <figcaption>Correction on</figcaption>
  </figure>
</img-comparison-slider>

Here the uncorrected bronze renders about half a stop darker. Now the same comparison from
the other side of the sculpture, where the camera's exposure didn't change:

<img-comparison-slider aria-label="Drag to compare the two models at a view outside the affected arc">
  <figure slot="first" class="compare-pane">
    <img src="/assets/images/cultcap/bronze-finish/slider-unaffected-off.jpg" alt="The bronze rendered by the uncorrected model, from the side where the camera's exposure stayed steady.">
    <figcaption>Correction off</figcaption>
  </figure>
  <figure slot="second" class="compare-pane">
    <img src="/assets/images/cultcap/bronze-finish/slider-unaffected-on.jpg" alt="The same view rendered by the corrected model.">
    <figcaption>Correction on</figcaption>
  </figure>
</img-comparison-slider>

The two models agree to within a hundredth of a stop, and the handle barely seems to move
anything. The correction only changes the views the camera got wrong.

## Steady light, moving camera

A phone's auto-exposure meters the whole frame. The bronze is small and dark: in this capture
it fills somewhere between a tenth and a sixth of each photo. Everything else in the frame is
the room. As I walked around, what filled the rest of the frame kept changing, and the camera
kept re-exposing for it.

Across the 201 photos the camera moved its exposure by about three quarters of a stop, all of
it in ISO (42 to 72, with the shutter fixed at 1/100 s). The lighting on the bronze never
changed. Here are three photos the camera exposed down, above three it didn't:

![Six capture frames. Top row: level shots with white walls, bright paintings and a light strip behind the bronze, exposed 0.4 to 0.5 stops down. Bottom row: shots looking down at the floor, exposed normally.](/assets/images/cultcap/bronze-finish/capture-exposure.jpg)

The top row are level shots from one side of the room, with white walls, bright paintings and
a vertical light strip in the corner behind the sculpture. The camera saw a bright scene and
turned its exposure down. The bottom row look down at the grey floor, and the camera left
its exposure alone. It isn't only which side you're standing on. It's what's behind the
object from where you hold the phone.

Auto-exposure did its job on the room. The background's brightness in the photos barely
follows the camera's exposure changes (a correlation of 0.07). The bronze does follow them (0.58). The camera
held the room steady, and the bronze came along for the ride: recorded darker in exactly
the photos where the room behind it was bright.

## Why the model learns it

Random exposure wobble would be harmless. Training would average it out. This wobble isn't
random. It's tied to where the camera was:

![Two charts sharing a horizontal axis of viewing direction. Top: the camera's exposure for each photo, flat except for a dip of up to 0.6 stops between about 110 and 190 degrees. Bottom: the rendered brightness of the bronze around an orbit for each model. The uncorrected model dips to -0.93 stops at 170 degrees, inside the band; the corrected model dips only to -0.4 stops at 200 degrees.](/assets/images/cultcap/bronze-finish/exposure-by-direction.png)

The top chart is the camera. Each dot is a photo, placed by the direction it was taken from.
Most sit within a tenth of a stop of the median. Between about 110 and 190 degrees, the level
shots drop to between a third and two thirds of a stop down.

The bottom chart is what each model learned: how bright the bronze renders, going round it.
Outside that band the two models track each other closely. Inside it, the
uncorrected model goes dark, sinking almost a full stop at 170 degrees. To a model, "every
photo from this side is darker" is indistinguishable from "this side of the bronze is
darker", so it learned a darker bronze on that side. Gaussian splats store colour that
varies with viewing direction. That's what lets them reproduce reflections, and it's exactly
the slot a direction-tied exposure error slides into.

The corrected model still has a darker side, around 200 degrees, just past the band where the
camera changed its exposure. Both models agree about it. That's the bronze's own shading, and
no correction should remove it.

So why does darker read as *shinier*? Because the highlights barely moved. They're the
reflections of the gallery lights in the metal, and both models render them at much the same
brightness. The uncorrected model darkened the body of the bronze on one side while leaving
its highlights alone. Bright highlights on a dark body read as polished metal. Bright highlights on a
lighter body read as matte. Around the orbit, the gap between highlight and body swings by
1.05 stops in the uncorrected model and 0.80 in the corrected one.

Strip away the shape and the highlights, and keep only the colour of the bronze's body at
every 10 degrees round the orbit. The bronze is dark, and small differences between dark
colours are hard to see, so both rows are brightened by the same amount (1.5 stops). The
ratio between them is unchanged:

![Two rows of colour swatches, one per 10 degrees of orbit. The uncorrected row darkens between about 120 and 190 degrees; the corrected row stays the same brown all the way round.](/assets/images/cultcap/bronze-finish/orbit-swatches.png)

The uncorrected model's bronze darkens by about a fifth across exactly the arc where the
camera exposed down. The corrected model's bronze is as bright in that arc as everywhere
else, to within one percent.

## Why the usual score misses it

The standard way to score a model like this is to render it from each photo's position and
compare with the photo. That can't see this problem. The photo from the dark side *is* darker,
so a model that learned a darker bronze on that side matches it beautifully. The score
rewards the model for learning the camera's mistake. Between these two models it barely
moved (31.6 against 31.9 dB on held-out photos).

What does see it is checking the model against itself: render a full orbit and ask whether
the object stays the same brightness as you go round, apart from its real shading. That's the
bottom chart above.

## The fix: two numbers per photo

The camera writes down its exposure for every frame: the ISO and the shutter time. I checked
those records against the pixels across my whole capture library before trusting them. When
the record says a frame was exposed a stop down, the pixels are a stop down, within a few
percent, with no timing lag.

That leaves a choice of where to apply them.

- **Correct the photographs.** Before training, scale every photo to a common exposure, so
  the model trains against consistent targets.
- **Correct the render.** Leave the photographs alone. During training, scale the model's
  render by each photo's recorded exposure before comparing them, so the loss compares like
  with like. The model learns one appearance, and the camera's exposure explains the
  differences between photos.

I tested both on three captures. They tied on every measure. I chose the render side for two
reasons. The photographs stay untouched, so every score stays comparable with everything
I've measured before. And it's the natural place to add a learned correction later, if the
recorded numbers ever stop being enough.

The bronze isn't the extreme case. On a vase of daffodils where the camera swung 2.65 stops,
the uncorrected model's brightness drifted 2.9 stops around the orbit. With the correction it
drifted 1.7, and what's left is the vase's real shading:

![Orbit renders of the daffodil model trained without correction, brightness drifting around the orbit.](/assets/images/cultcap/wobble/20260804-080136-orbit-control.jpg)

![The same viewpoints from the corrected model, brightness held steady.](/assets/images/cultcap/wobble/20260804-080136-orbit-fixed.jpg)

Two things went wrong on the way here, and both are worth knowing.

**Correct only what you can show happened.** My first version also replayed the camera's
recorded white balance. The camera records those gains faithfully, but they leave no
consistent trace in the pixels. Replaying them "undid" a change that never happened, and the
model compensated with *more* direction-dependent colour, not less. On the daffodils, that
version drifted 4.1 stops around the orbit, against 2.7 with no correction at all. Deleting
that one term flipped the result.

**Some captures barely need it.** The pink caravan, shot the same afternoon in the same
building, moved its exposure by under a quarter of a stop. It sits in a glass case and I shot
it from one side, so there's little for a correction to do.

## Why not just lock the exposure?

Locking exposure at capture would leave nothing to correct. It also trades a recoverable
problem for an unrecoverable one. Lock exposure for the bright side and the dark side comes
out crushed; lock it for the dark side and the highlights clip. Either way, the information
is gone at capture. When I clamped the shutter short to fight motion blur, the phone spent
ISO to compensate, and the model trained on those noisier photos came out 3.5 dB worse.
Auto-exposure keeps every frame inside the sensor's usable range, and the recorded numbers
make the frames comparable afterwards.

## Where this sits

The research literature reaches the same place by two routes. Methods built for photo
collections from many different cameras and days, such as
[NeRF in the Wild](https://openaccess.thecvf.com/content/CVPR2021/papers/Martin-Brualla_NeRF_in_the_Wild_Neural_Radiance_Fields_for_Unconstrained_Photo_CVPR_2021_paper.pdf)
and [WildGaussians](https://wild-gaussians.github.io/), learn a per-photo appearance
correction from the pixels, because they have nothing else to go on. gsplat ships the same
idea as [exposure compensation and a bilateral grid](https://github.com/nerfstudio-project/gsplat/blob/main/examples/simple_trainer.py).
Methods built on raw sensor data, such as [RawNeRF](https://bmild.github.io/rawnerf/) and
[HDRSplat](https://arxiv.org/abs/2407.16503), read the shutter and gain from the metadata
and scale each frame into common linear light. That's the same two-number correction as
here, done on raw frames instead of JPEGs. My capture app records the same numbers for every
photo, and they check out against the pixels.

Is anything left for a learned correction to do? I measured that too. On captures that
revisit the same angles, the leftover brightness inconsistency after correction is around
0.15 to 0.35 of a stop. Not nothing, but small: two numbers the camera wrote down anyway
did most of the work.

## References

- Martin-Brualla et al., *NeRF in the Wild: Neural Radiance Fields for Unconstrained Photo
  Collections*, CVPR 2021.
  [paper](https://openaccess.thecvf.com/content/CVPR2021/papers/Martin-Brualla_NeRF_in_the_Wild_Neural_Radiance_Fields_for_Unconstrained_Photo_CVPR_2021_paper.pdf)
- Kulhanek et al., *WildGaussians: 3D Gaussian Splatting in the Wild*, NeurIPS 2024.
  [project page](https://wild-gaussians.github.io/)
- Mildenhall et al., *NeRF in the Dark: High Dynamic Range View Synthesis from Noisy Raw
  Images* (RawNeRF), CVPR 2022. [project page](https://bmild.github.io/rawnerf/)
- *HDRSplat: Gaussian Splatting for High Dynamic Range 3D Scene Reconstruction from Raw
  Images*. [arXiv](https://arxiv.org/abs/2407.16503)
- *Unifying Appearance Codes and Bilateral Grids for Driving Scene Gaussian Splatting*.
  [arXiv](https://arxiv.org/abs/2506.05280)
- Niemeyer et al., *Learning Neural Exposure Fields for View Synthesis*.
  [arXiv](https://arxiv.org/abs/2510.08279)
- gsplat `simple_trainer`: exposure compensation, appearance module and bilateral grid.
  [source](https://github.com/nerfstudio-project/gsplat/blob/main/examples/simple_trainer.py)
