---
title: "CultCap: How a phone takes a photo"
publishDate: 2026-09-09T00:00:00+10:00
description: "A Gaussian splat is a machine for reproducing photographs, so every step between the sensor and the JPEG ends up in the model. What the camera pipeline does, why I care, and the gotchas that bit me."
tags:
  - cultcap
  - photography
  - camera
  - gaussian-splatting
draft: true
---

A Gaussian splat is, at heart, a machine for reproducing photographs. You show it a few
hundred pictures of an object, and training pushes the model until its renders match
those pictures. That's the whole trick.

Which means everything the camera did to those pictures — every decision made between
light hitting the sensor and bytes landing in a JPEG — is now something the model has to
explain. If the camera brightened one frame and warmed another, the model learns an
object that is brighter from one side and warmer from the other. It isn't wrong. It's
faithfully reproducing what it was shown.

So before anything else in this series, I want to walk through what actually happens
when a phone takes a photo. Not the marketing version. The version that matters if you're
going to train on the output.

<!-- TODO: diagram — photons -> sensor -> binning -> exposure/ISO -> demosaic -> WB -> CCM -> tone curve -> NR -> JPEG, with "what the model sees" marked at the end -->

## From photons to pixels

**The sensor.** Light hits a grid of photosites, each behind a red, green or blue filter
(the Bayer pattern). Each site counts photons for as long as the shutter is open. Modern
phone sensors have far more sites than the images they output — a 48MP sensor typically
*bins* groups of four into one, trading resolution for a cleaner signal.

**Exposure and ISO.** How bright the image comes out depends on how long the shutter is
open and how much the signal is amplified afterwards. Longer exposure means more photons
and less noise, but more motion blur. Higher ISO means the same photons amplified harder,
which amplifies noise too. Auto-exposure (AE) picks the pair for you, and it picks
differently for every frame.

**Demosaic.** Each site only knows one colour. The processor interpolates the other two
from neighbours. This is where a lot of fine detail is invented or lost.

**White balance and the colour matrix.** The sensor's idea of "white" isn't yours. Auto
white balance (AWB) estimates the scene illuminant and scales the channels; a small
colour correction matrix (CCM) then rotates sensor colour into a standard colour space.
Both are per-frame estimates. Both can wander during a capture.

**The tone curve.** Sensor values are linear — twice the light, twice the number. Your
eyes and your screen aren't, so the processor applies a curve that compresses highlights
and stretches shadows. On most phones this curve is *adaptive*: it changes per frame to
make each photo look nice on its own.

**Noise reduction and sharpening.** Applied at output resolution, tuned to make a single
photo look good on a phone screen. Neither cares that you're about to compare 300 of
them against each other.

**Compression.** JPEG throws away detail it thinks you won't notice. Video codecs go much
further: most frames are *predicted* from their neighbours, and the encoder only stores
the difference.

Every one of these stages has the same design goal — make this one photo look good, now —
and none of them has the goal I actually have, which is: make 300 photos of the same
object agree with each other.

## Why I care

CultCap captures heritage objects with a phone and turns them into splats. The capture
is done by whoever is standing in the gallery, walking a loop around a sculpture. I
don't get to control the lighting, and I don't get to bring a rig.

What I *can* control is the app. Which means I get to decide what the camera does at
every stage above, and I get to write down what it decided. That turns out to be the
most valuable lever in the whole pipeline. A reconstruction step can only undo what it
knows about; a capture app can make sure it knows.

## What I did

1. **Locked the tone curve.** Android's Camera2 lets you hand the processor an explicit
   curve instead of letting it adapt per frame. I set a standard sRGB curve and verified
   the hardware actually applied it. Now every frame is encoded the same way, and the
   pipeline can undo the curve exactly when it needs linear values.

2. **Captured big, shrank on the phone.** Rather than asking the camera for the image
   size I wanted, I ask for the sensor's full binned output and average it down myself
   before saving. More on why below.

3. **Encoded once.** The first version asked for JPEG, decompressed it to resize, and
   re-encoded. Two lossy passes. Switching to raw YUV planes from the camera, resizing
   those, and encoding once was both faster and visibly sharper.

4. **Wrote everything down.** For every frame the app records exposure time, ISO, white
   balance gains, the colour matrix, focus distance, the lens intrinsics the camera
   reports *for that frame*, and the gyro and accelerometer readings around it. Even the
   values I don't use yet. Storage is cheap; a re-shoot in a regional museum is not.

<!-- TODO: screenshot of a frame_metadata.jsonl row, lightly annotated -->

## Gotchas

**Ask for a small image, get small-image errors.** When you request a 2000px-wide frame
from the camera, demosaic, noise reduction and sharpening all run at 2000px, and their
mistakes are baked in at that scale. Request the full binned frame and average it down
yourself, and those same mistakes get averaged down with it. Oversampling is why the
phone's own camera app bins 48 to 12 in the first place. Taking it one more step is
nearly free, and the frames are noticeably cleaner.

**Auto-exposure hides its own work.** AE's job is to keep the average brightness of the
frame constant. Walk past a window and the camera cuts exposure at exactly the moment
the window enters frame — the two changes cancel and the photo looks the same. But the
object in the middle of the frame just got a stop darker. Look at the exposure metadata
across a capture and you'll find swings of a full stop or more are completely normal
indoors. The pictures don't look it. The model notices.

**Video codecs invent pixels.** CultCap started as video capture, because it's easy and
the files are small. The frames pulled out of the video were consistently softer than
the sensor should produce, and the reason is temporal prediction: most frames are
reconstructed from their neighbours plus a residual, and fine texture is the first thing
the encoder decides you won't miss. Stills fixed it. If you must use video, use the
highest bitrate you can and expect to lose detail anyway.

<!-- TODO: side-by-side crop — frame extracted from H.265 vs still of the same scene -->

**A faster shutter isn't free.** I assumed motion blur was my enemy and clamped the
shutter short. Indoors, AE was already sitting at a fast exposure and spending ISO to
hold it; halving the exposure just doubled the ISO. The frames weren't sharper — they
were noisier, and the model trained against noisier targets came out worse. The lesson
generalises: every camera setting is a trade, and the phone has usually already made the
sensible one.

**"Blur score" measures texture, not blur.** The standard trick for detecting a blurry
frame is the variance of the Laplacian — how much high-frequency energy is in the image.
It works fine on a textured subject and fails completely on a smooth one. A perfectly
focused photo of a polished bronze scores as "blurry" because there's nothing in it to
be sharp. I built a whole gating system on that score before I audited what it was
actually rejecting. It was rejecting the smooth objects.

## Owning the capture side

There's a version of this project that takes any photos from anywhere and does its best.
That's the general problem, and it's a research field.

CultCap takes photos *from its own app*, on a phone it has configured, with metadata it
wrote itself. That's a much smaller problem, and nearly every hard thing in the rest of
this series gets easier because of it. The pose solver is seeded with the lens the phone
actually reported. The colour correction knows the exposure the camera actually used.
The tone curve can be inverted exactly because I chose it.

None of that is clever. It's just refusing to throw away information that was free at
the moment of capture and expensive to recover afterwards.

Next up: what the lens knows about itself, and why the number on the spec sheet isn't it.
