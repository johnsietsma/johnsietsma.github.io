---
title: "CultCap: Seeing the wobble"
publishDate: 2026-10-28T00:00:00+10:00
description: "Before-and-after evidence that exposure wobble is real, that the metadata fix removes it, and that the model stops baking it into its colour. With pictures this time."
tags:
  - cultcap
  - radiometry
  - colour
  - gaussian-splatting
draft: true
---

The last two posts made claims: the camera's recorded exposure is true, white balance
replay is noise, and a two-number correction at load time is all the colour machinery
this pipeline needs. Claims like that deserve pictures. This post is the eyeball check
-- the same evidence I used to convince myself, laid out so you can disagree.

Two capture sessions appear throughout. A vase of daffodils
(`20260804-080136`) is the stress test: the camera swung 2.65 stops of exposure while
orbiting it, the widest wobble in my capture library. A terracotta pipe elbow
(`20260805-060542`) is the control: its exposure barely moved (0.44 stops), so any
"fix" that changes it much is doing something wrong.

## What the wobble looks like

Eight real frames from the daffodil orbit, sorted by the exposure the camera recorded,
darkest-set frame to brightest-set. The chip on each frame is its exposure offset from
the session median, in stops, straight from the metadata.

![Eight daffodil frames sorted by recorded exposure, spanning a 3.3 stop swing.](/assets/images/cultcap/wobble/20260804-080136-wobble.jpg)

Here's the trap: the frames *don't* ramp from dark to bright, and that's the point.
Auto-exposure holds the frame average roughly flat by design -- when the camera swung
1.7 stops, it was compensating for how much light the scene in front of it had. The
frame looks fine. What wobbles is the *object*: the same daffodils are recorded at
different pixel values depending on what else was in frame. A model trained on these
has three hundred slightly different answers to "what colour is this vase".

## What the fix looks like

The same eight frames after exposure normalisation -- decode the tone curve, scale by
the recorded exposure ratio to the session median, re-encode. Two numbers per frame
that the camera wrote down anyway. No fitting, no learning, nothing estimated from
pixels.

![The same eight frames after metadata exposure normalisation.](/assets/images/cultcap/wobble/20260804-080136-normalised.jpg)

Read it the right way around: now the *backgrounds* differ -- normalisation restores
the true relative light of each moment -- and the object holds one appearance across
the strip. That's the trade the whole approach makes. Frames stop being individually
well-exposed photographs and become consistent observations of one object.

## What the model does about it

The strips above are training inputs. The question that matters is what the trained
models look like. Below: the same eight novel viewpoints around each model -- views no
photograph corresponds to, so every difference is the model's own. First the control,
trained on the raw frames:

![Orbit renders from the control model, luminance drifting around the orbit.](/assets/images/cultcap/wobble/20260804-080136-orbit-control.jpg)

Then the model trained on normalised targets, same viewpoints:

![Orbit renders from the exposure-normalised model, luminance held steady.](/assets/images/cultcap/wobble/20260804-080136-orbit-fixed.jpg)

The control model's brightness swings 2.9 stops as you circle it -- it absorbed the
capture wobble into view-dependent colour, and it will happily play it back at you
from whatever angle you render. The normalised model swings 1.67 stops. That residual
is not failure: a real object *has* a lit side and a shadowed side, and no correction
should remove actual shading. The number to read is the difference between the two
strips, not either strip against flat.

Two things you can't see in the strips, from the held-out numbers: the control model
carries a +0.55 dB recoverable exposure cast on frames it never trained on (a global
brightness fit improves it -- meaning its baseline is simply wrong), while the
normalised model's is +0.10, effectively zero. And the standard frame-matching score
*prefers* neither strongly -- which is the whole reason the previous post needed a
reference-free measure before any of this could be judged.

## The control session behaves like a control

The pipe elbow's exposure barely moved, so its before and after should look nearly
identical -- and do:

![Eight pipe-elbow frames sorted by recorded exposure, spanning under half a stop.](/assets/images/cultcap/wobble/20260805-060542-wobble.jpg)

![The same pipe-elbow frames after normalisation, nearly unchanged.](/assets/images/cultcap/wobble/20260805-060542-normalised.jpg)

This is what the earlier failure got wrong. The old correction -- exposure *and* white
balance replayed together -- visibly changed sessions like this one, where there was
nothing legitimate to change. When I re-scored those old models with the new
instruments, the combined correction had made orbit drift *worse* by 1.4 stops: the
white balance terms, replaying gains that never showed up in the pixels, pushed the
model to compensate with more view-dependent colour, not less. Exposure alone moves
everything the right way. The difference between those two corrections is one deleted
term, and it flips the sign of the result.

## Why not just lock the camera

The obvious alternative is locking exposure at capture and having nothing to correct.
That trades a recoverable problem for an unrecoverable one. A locked exposure clips
highlights on the lit side of the orbit and crushes shadows on the dark side, at
capture time, permanently. I've measured a version of this already: when I clamped the
shutter short to fight motion blur, the phone spent ISO to compensate and the model
trained on those noisier frames came out 3.5 dB worse than the auto-exposure control
(see [how a phone takes a photo](/posts/cultcap-how-a-phone-takes-a-photo/)). Every
camera setting is a trade, and auto-exposure keeps every frame inside the sensor's
usable window. The metadata -- which I can now show is accurate to a few percent --
makes the frames comparable afterwards.

The reconstruction literature has landed in the same place, by two routes. The
in-the-wild line -- [NeRF-W](https://openaccess.thecvf.com/content/CVPR2021/papers/Martin-Brualla_NeRF_in_the_Wild_Neural_Radiance_Fields_for_Unconstrained_Photo_CVPR_2021_paper.pdf),
[WildGaussians](https://wild-gaussians.github.io/), and the bilateral-grid and
appearance-code work that followed ([Unifying Appearance Codes and Bilateral
Grids](https://arxiv.org/abs/2506.05280), [Decoupling Appearance Variations in
3DGS](https://arxiv.org/pdf/2501.10788)) -- never locks anything, because it can't: the
photos come from strangers. It learns a per-image appearance term from the pixels
instead. gsplat ships the same idea as [exposure compensation and a bilateral
grid](https://github.com/nerfstudio-project/gsplat/blob/main/examples/simple_trainer.py),
and [Neural Exposure Fields](https://arxiv.org/abs/2510.08279) goes further still,
learning an exposure value per 3D point so the model can re-expose itself per region
at render time. The raw-sensor line --
[RawNeRF](https://bmild.github.io/rawnerf/) and [HDRSplat](https://arxiv.org/abs/2407.16503)
-- goes the other way: it reads shutter and gain from the metadata and scales each frame
into a common linear radiance before training, which is exactly the two-number
correction above, done on raw instead of encoded frames. I get the same quantity for
free, measured, from the camera, and the audit says it can be trusted.

The one automation I would still consider locking is white balance -- it protects
nothing (channel gains don't move the clipping window) and its recording can't be
verified against the pixels. That decision is waiting on one more measurement.

## Where this is up to

This is a gate in progress, not a concluded adoption. One session of three is fully
judged; the third is training as I write this. The decision rules were written down
before any run launched -- including the rule that the standard score is not a judge,
because it structurally rewards the model that bakes the wobble in. If the other
sessions hold the pattern, the two-number correction becomes the default and the
alternatives get deleted.

## The experiments behind this

All of these are written up as experiment records in the CultCap repo, each with its
inputs, commands and output directories, so the numbers above can be traced. The
earlier posts cover the reasoning; this is the trail.

- **Input radiometry audit.** Checked the camera's recorded exposure, white balance and
  colour matrix against the pixels across 69 sessions, without training anything.
  Exposure metadata true at unit gain and lag-free; white balance replay unsupported;
  colour matrix replay dead weight. The basis for trusting the two numbers.
- **Radiometry wobble and clamp.** Where the "model bakes the wobble into
  view-dependent colour" finding came from, and the retraction of a first pass that
  scored renders against each frame's own wobbled pixels and concluded there was no
  victim.
- **Exposure and white balance retest.** The gate this post reports on: exposure-only
  normalisation against a control and against the old combined correction, judged on
  orbit stability and the half-image protocol, with the decision rules written before
  the runs.
- **Capture fast-shutter A/B.** The locked-shutter experiment above. Same object,
  matched conditions, clamped versus auto-exposure.
- **Capture tone curve.** Locking the tone curve at capture, which is what makes the
  decode-scale-re-encode step exact rather than approximate.

## References

- Martin-Brualla et al., *NeRF in the Wild: Neural Radiance Fields for Unconstrained
  Photo Collections*, CVPR 2021.
  [paper](https://openaccess.thecvf.com/content/CVPR2021/papers/Martin-Brualla_NeRF_in_the_Wild_Neural_Radiance_Fields_for_Unconstrained_Photo_CVPR_2021_paper.pdf)
- Kulhanek et al., *WildGaussians: 3D Gaussian Splatting in the Wild*, NeurIPS 2024.
  [project page](https://wild-gaussians.github.io/)
- Mildenhall et al., *NeRF in the Dark: High Dynamic Range View Synthesis from Noisy Raw
  Images* (RawNeRF), CVPR 2022. [project page](https://bmild.github.io/rawnerf/)
- *HDRSplat: Gaussian Splatting for High Dynamic Range 3D Scene Reconstruction from Raw
  Images*. [arXiv](https://arxiv.org/abs/2407.16503)
- *Unifying Appearance Codes and Bilateral Grids for Driving Scene Gaussian Splatting*.
  [arXiv](https://arxiv.org/abs/2506.05280)
- *Decoupling Appearance Variations with 3D Consistent Features in Gaussian Splatting*.
  [arXiv](https://arxiv.org/pdf/2501.10788)
- Niemeyer et al., *Learning Neural Exposure Fields for View Synthesis*: exposure as a
  learned field over the scene rather than a per-image term.
  [arXiv](https://arxiv.org/abs/2510.08279)
- *MS-GS: Multi-Appearance Sparse-View 3D Gaussian Splatting in the Wild*, the source of
  the half-image evaluation protocol used in the gate.
  [arXiv](https://arxiv.org/pdf/2509.15548)
- gsplat `simple_trainer`: exposure compensation, appearance module and bilateral grid
  as reference implementations.
  [source](https://github.com/nerfstudio-project/gsplat/blob/main/examples/simple_trainer.py)
