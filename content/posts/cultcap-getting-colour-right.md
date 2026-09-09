---
title: "CultCap: Getting colour right"
publishDate: 2026-10-14T00:00:00+10:00
description: "One object, one appearance, from every angle. What exposure and white balance do to your photographs, whether to correct the pictures or the trainer, and how I ended up with the simplest possible answer."
tags:
  - cultcap
  - radiometry
  - colour
  - gaussian-splatting
draft: true
---

Walk around a sculpture with a phone and take three hundred photos. No two of them were
taken with the same exposure, and probably not the same white balance either. The camera
was adjusting continuously, as it should. Now train a model whose job is to look like all
three hundred at once.

What do you want it to look like?

This is the question the previous post ended on, and it has a surprisingly precise answer.
It also has a long history in this project of me answering it wrong, in increasingly
sophisticated ways, before measuring my way back to something simple.

## Radiometry in one section

**Linear light.** A sensor counts photons. Twice the light, twice the number. That's
linear, and it's the space where exposure maths is honest: doubling the exposure time
doubles every value.

**Stops.** Photographers measure light in doublings. One stop brighter is twice the
light. It's a log scale, and it's the right unit here because both exposure time and ISO
act multiplicatively. The combination of the two is the *exposure value* (EV), and the
metadata tells you exactly what it was for each frame.

**Encoded light.** Your JPEG isn't linear. The tone curve from the first post has been
applied, so the values are compressed at the top and stretched at the bottom. To do any
exposure arithmetic you have to undo it first — which you can only do exactly if you know
what curve was applied. Locking the curve at capture is what makes this possible.

**White balance.** The illuminant has a colour. Daylight is blue, tungsten is orange. Auto
white balance estimates it per frame and scales the red and blue channels to compensate.
The gains are recorded. Whether the recording is *true* is a separate question.

**The colour matrix.** After white balance, a small matrix maps sensor colour to a
standard colour space. Also recorded. Also per frame.

<!-- TODO: diagram — linear sensor value -> tone curve -> encoded pixel, with "undo" arrow labelled 'only if you know the curve' -->

## Why I care

The model should have *one* appearance. Not the appearance from frame 47, not the
average of all frames — a single, canonical object colour that, when rendered from any
angle under the same virtual exposure, looks the same. Then the frame-to-frame variation
in the photographs is something the pipeline explains away, per frame, as "the camera
was set differently here", rather than something the model has to absorb.

That's the goal. It's the same goal as the "in the wild" reconstruction literature, where
photos come from different cameras on different days. My variation is milder, but it's
there, and I've measured the model soaking it up.

## Two places to fix it

**Correct the photographs.** Before training, use the recorded metadata to undo each
frame's exposure and white balance, bringing every frame to a common reference. The
model then trains against consistent targets and the loss stays simple. No extra
parameters, no fitting, nothing to go wrong at training time — as long as the metadata is
true.

**Correct inside the trainer.** Give each frame a small set of learnable parameters — a
gain, an offset, a colour transform, or a whole learned appearance embedding — and let
training fit them alongside the model. This handles variation the metadata doesn't
know about. It also gives the trainer a new way to cheat: any global colour shift in the
model can be absorbed by the per-frame parameters, so the model's own colour becomes
arbitrary unless you pin it down.

I tried both, in that order, and then the other order.

## What I did

1. **A learned per-frame correction.** First attempt: a small network per frame fitting
   the residual between render and photo. It worked in the sense that scores improved.
   It also had no idea what it was correcting, and it happily corrected things that
   weren't exposure.

2. **A deterministic correction in linear space** using the recorded exposure, white
   balance and colour matrix. Undo the tone curve, apply the inverse of what the camera
   did, re-encode. Principled, no fitting. Adopted as the default.

3. **Turned it off.** On a capture where the exposure barely moved, the correction
   visibly washed the render out — lower contrast, lifted shadows — while the held-out
   score moved by a hundredth of a decibel. The correction was moving the baseline with
   nothing legitimate to correct, and the metric couldn't see it. Off by default, pending
   understanding.

4. **Audited the metadata directly.** Instead of testing corrections through expensive
   training runs, check the camera's notes against the pixels: when the recorded exposure
   drops by a stop, do the pixels drop by a stop? The answer, across the whole capture
   library, was yes for exposure — within a few percent, with no timing lag — and no for
   white balance, whose recorded wander left no consistent trace in the images. The
   colour matrix barely moved at all.

5. **Normalise by exposure alone.** The current approach: bring every frame to the
   session's median exposure using the recorded ISO and shutter, nothing else, at load
   time. No white balance term, no matrix, no learned parameters. Any residual becomes a
   candidate for a learned correction later, with a measured ceiling on how much it could
   possibly help.

## Gotchas

**Correcting something that didn't happen adds noise.** The white balance gains were
recorded faithfully. The camera just didn't seem to apply them in a way that showed up in
the output. Replaying them "undid" a change that was never visible, and the result was a
colour cast that wasn't there before. If a correction term can't be shown to track the
pixels, delete it.

**A corrected model *should* look dimmer than some reference photos.** If you normalise
to the median exposure, half the photographs were brighter than the model's canonical
appearance. Comparing a render to one of those and calling the render "washed out" is a
mistake I made and then un-made. Judge colour against the orbit — is the model uniform
around itself? — not against any single frame.

**Frame-matching scores can't see appearance at all.** Every standard metric compares
the render to the photograph *from that frame*, and the photograph carries the frame's
exposure. A model that has baked the exposure swing into view-dependent colour matches
every frame beautifully and scores well. A model with one true colour matches each frame
slightly worse. The metric prefers the wrong one. You need a reference-free measure —
render an orbit and check the luminance is stable — before any appearance change can be
judged.

**Auto-exposure makes whole-frame brightness useless as a signal.** AE holds the frame
average flat by design, so if you want to check whether the recorded exposure is true,
you can't just track the mean. Look at the object only, or look at how the histogram
shifts between adjacent frames. The naive measurement gave me an answer that was half
right, which is the worst kind.

**Eight-bit linear is a bad idea.** It's tempting to skip the tone curve and capture
linear values. With eight bits, that wastes most of your codes on highlights and bands the
shadows. The requirement is a *known* curve, not a linear one. sRGB is a perfectly good
use of eight bits as long as you can invert it exactly.

## Where it landed

The correction I ended up with is two numbers per frame that the camera wrote down
anyway, applied once at load. It replaced a learned network, then a matrix pipeline, then
a period of nothing at all. Every step of that was a measurement showing the previous
step was doing less than I thought. I'd have got there faster by auditing the metadata
first and building the correction second. That's the order I'd recommend.

Next: knowing whether any of it worked.
