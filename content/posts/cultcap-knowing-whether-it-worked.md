---
title: "CultCap: Knowing whether it worked"
publishDate: 2026-10-21T00:00:00+10:00
description: "PSNR, SSIM, held-out views, novel-view consistency — what each metric measures, what it can't see, and the habits that stopped me adopting changes that made the number go up and the model go worse."
tags:
  - cultcap
  - gaussian-splatting
  - evaluation
  - metrics
draft: true
---

Every change to a reconstruction pipeline ends with the same question: is it better? For
a splat that's genuinely hard to answer, because "better" is something you *see*, the
numbers are proxies for seeing, and the proxies have blind spots exactly where the
interesting failures live.

I said some of this in [renders are the metric](/posts/cultcap-renders-are-the-metric/).
This post is the longer version: what the standard metrics actually compute, what each
one is blind to, and the small set of habits that keep me from fooling myself.

## The standard toolkit

**Held-out views.** Keep some photographs out of training. Render the model from those
cameras and compare to the photos. This is the basic honesty check — a model that
memorises its training frames and fails elsewhere is caught here.

**PSNR.** Peak signal-to-noise ratio. Take the mean squared pixel error and put it on a
log scale, in decibels. Higher is better. It's the default number in every paper and it's
what most trainers report.

**SSIM.** Structural similarity. Compares local windows on luminance, contrast and
structure, and returns a number between zero and one. Designed to match human perception
better than raw error, and it does, on the kinds of distortions it was designed for.

**Perceptual metrics.** LPIPS and its descendants run both images through a neural
network and compare the activations. Much closer to "does this look like that" than
either of the above, at the cost of being a black box.

**Novel-view consistency.** Render the model from a camera that *wasn't* a photograph,
then from a neighbouring one, and check the two renders agree with each other. No
reference photo required. This catches artefacts that only appear between the training
views — floaters, popping — which is exactly where a model can hide problems from every
photo-referenced metric.

<!-- TODO: diagram — training cameras, held-out cameras, and the orbit of novel views -->

## Why I care

I run experiments constantly and adopt changes based on the results. The rule is
test-then-adopt: a change earns its place by beating the baseline on a held-out set. That
rule only works if the number I'm looking at can see the thing I changed. Several times
now it couldn't, and the rule would have made the wrong call in both directions —
adopting a regression, or rejecting a genuine improvement.

## What I did

1. **Fixed render sets.** Every run renders the same held-out views, the same orbit, at
   the same resolution, automatically. Metrics are computed on exactly the images I look
   at, and any two runs are visually comparable without setup.

2. **A quality scorecard that separates the axes.** Instead of one number, several:
   structure (how sharp), colour (how close in brightness and hue), uniformity (does the
   model look the same all the way round), silhouette (has it bloated past its outline).
   A single metric collapses these, and they fail independently.

3. **Trivial baselines, every time.** Before trusting a margin, score something dumb —
   a flat colour, a blurred copy of the photograph — with the same metric on the same
   scene. If the dumb thing scores close to the model, the metric has no room to
   discriminate and the margin means nothing.

4. **Pose-health checks that don't use images at all.** The continuity ratio from the
   pose post. Frame count registered. Points per frame. Cheap, run before training, and
   they catch failures no render metric can.

5. **Calibrate thresholds on my own data.** Any star rating or pass/fail line is set by
   looking at the distribution of real runs, not borrowed from a paper or picked because
   it's a round number.

## Gotchas

**A blurred photograph can outscore your model.** On a low-contrast scene — sand, plain
fabric, matte stone — the whole range of PSNR between "one flat colour" and "perfect" is
only a few decibels. A heavily blurred copy of the ground truth sits comfortably inside
that range, often above a real model. If your model beats another by a decibel here, you
have learned nothing. Score the blur first.

**Two models, same poses, and the ranking is inverted.** I compared my trainer to an
external one on identical reconstructions. Mine scored higher. Theirs resolved individual
legs on a lobster and the grain of the sand; mine was a smear. The reason is the previous
post's: detail that can't be placed pixel-exactly is penalised, and flat isn't. Any
improvement that adds real detail should be *expected* to lower PSNR and SSIM on
textured content. If your adoption rule is "the number went up", it will reliably choose
the blur.

<!-- TODO: figure — the two renders side by side with their scores -->

**A masked score can't see the outline.** Score only inside the mask, and a model that
has grown to twice the object's silhouette scores identically to one that hasn't. The
extra geometry is outside the scored region. Add the silhouette ratio; it's one line.

**A doubled reconstruction can score better than a correct one.** If the pose solver
folds the capture, every camera sees its own perfect copy of the object. Held-out views
are fine. Sometimes better, because each copy is trained on fewer, closer views. Nothing
image-based will catch it. The trajectory check will.

**Borrowed thresholds are miscalibrated.** My first pass at a star rating used an SSIM
floor that sounded reasonable. On my own runs it would have flagged most of the
objectively fine captures, because SSIM is content-dependent and a smooth object scores
lower than a textured one at the same visual quality. The threshold the data supported
was well below the guess. This generalises: any number you didn't measure on your own
distribution is a guess wearing a decimal point.

**Only compare like with like.** Novel-view consistency is stable when two models share a
reconstruction and noisy when they don't — the noise between reconstructions is larger
than most of the effects I'm looking for. Same for any metric with a fitted component.
Resume both arms from the same poses, or the comparison is measuring the solver.

**Frame-referenced metrics reward matching the frame's mistakes.** If the photograph was
a stop overexposed, a model that renders a stop overexposed from that angle matches it.
The previous post covers why that's the wrong goal. Appearance needs a reference-free
check — orbit stability — or it will be scored backwards.

## The habit that matters

Every metric failure in this list was found by a person looking at a render next to a
number that said "fine". The decomposed scorecard shrinks that gap. The trivial-baseline
check shrinks it further. Neither closes it.

So the rule I actually follow: sort by metric, judge by render. The numbers are the
index. They tell me which runs to look at first, and they catch regressions when I'm not
looking. The verdict comes from the orbit. And for any change where I already suspect the
metric can't see the difference — anything that adds detail, anything that touches
appearance — the acceptance criterion is written down *before* the run, so the number
can't talk me out of what I can see.

That's the series. The pipeline, stage by stage, and at each stage the same question: what
did the camera do to these pixels, and does the pipeline know?
