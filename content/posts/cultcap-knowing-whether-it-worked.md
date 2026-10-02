---
title: "CultCap: Knowing whether it worked"
publishDate: 2026-10-21T00:00:00+10:00
description: "PSNR, SSIM, held-out photos and novel views: what each measures, what a score looks like in practice, and the traps that had me adopting changes that made the number go up and the model go worse."
tags:
  - cultcap
  - gaussian-splatting
  - evaluation
  - metrics
draft: true
---

Every change to a reconstruction pipeline ends with the same question: is it better? For a
Gaussian splat that's genuinely hard to answer. "Better" is something you see, the numbers
are stand-ins for seeing, and the stand-ins have blind spots exactly where the interesting
failures live.

This is how I measure, what the numbers look like on real models, and the traps I fell into
on the way. Every figure comes from a real run.

## Three kinds of camera

A splat is trained to reproduce photographs. To judge one, you render it from some camera
and look at the result. Which camera you choose decides what you can learn.

![Top-down view of a capture around a bronze sculpture: blue dots for training photo positions in loops around the object, orange dots for held-out photos spread among them, and a dashed circle for a novel-view orbit.](/assets/images/cultcap/measuring/cameras.png)

- **Training photos** (blue). The model has seen these. Rendering from them tells you how
  well it memorised, and not much else.
- **Held-out photos** (orange). Every seventh photo is kept out of training. Rendering from
  those positions and comparing with the real photo is the basic honesty check: a model that
  memorised its training photos and fails in between gets caught here.
- **Novel views** (dashed). An orbit the model renders from where no photo was ever taken.
  There's nothing to compare against, so instead you ask whether neighbouring views agree
  with each other, and whether the object looks the same all the way round. Floaters and
  popping between the photos show up here and nowhere else.

## The numbers

**PSNR**, peak signal-to-noise ratio, is the mean squared difference between render and
photo, put on a log scale in decibels. Higher is better. Every 3 dB halves the squared
error. It's the default number in every paper and every trainer.

**SSIM**, structural similarity, compares small windows for brightness, contrast and
structure, and gives a number up to 1. It was designed to track human judgement better than
raw error, and on the distortions it was designed for, it does.

**LPIPS** and its relatives run both images through a neural network and compare what the
network sees. Closer still to "does this look like that", at the cost of being a black box.

**Masked scores.** CultCap captures objects, not rooms, so I only score the pixels inside
the object's mask. The background behind a sculpture isn't something I'm trying to
reconstruct. That choice has its own blind spot, below.

## What a score looks like

Numbers mean little until you've seen them. Here's one model of a bronze sculpture, scored
on five photos, with each photo above the model's render of the same view:

![Five pairs of images of a bronze sculpture, photo above render, at 25.6, 28.3, 31.0, 34.0 and 36.5 dB.](/assets/images/cultcap/measuring/psnr-ladder.jpg)

The same model ranges over 11 dB depending on the view. At the low end the render is softer
and the fine scratches in the patina are gone; at the high end you'd struggle to tell them
apart. Two things follow. A single average hides a lot: this model's held-out average of
about 32 dB includes views at both ends. And a difference of half a decibel between two models is
usually invisible by eye. The number is fine for catching regressions, but you have to look.

## Trap 1: a blurred photo can beat your model

In August I compared my trainer against another one, LichtFeld, on the same photos and
camera positions. Mine scored 1.94 dB higher. Then I looked at the renders:

![A lobster on sand, four ways: the photo; my model at 24.9 dB, a smeared shape; LichtFeld at 22.3 dB, with legs and antennae resolved; and the photo blurred at 26.1 dB.](/assets/images/cultcap/measuring/blur-trap.jpg)

Drag between the two models on the same view:

<img-comparison-slider aria-label="Drag to compare my model with LichtFeld's on the lobster">
  <figure slot="first" class="compare-pane">
    <img src="/assets/images/cultcap/measuring/lobster-ours.jpg" alt="My August model of the lobster: a smeared shape with no legs or sand texture.">
    <figcaption>My model, 24.9 dB</figcaption>
  </figure>
  <figure slot="second" class="compare-pane">
    <img src="/assets/images/cultcap/measuring/lobster-lichtfeld.jpg" alt="LichtFeld's model of the same view, with legs, antennae and sand grain resolved.">
    <figcaption>LichtFeld, 22.3 dB</figcaption>
  </figure>
</img-comparison-slider>

LichtFeld resolved the lobster's legs and antennae and the grain of the sand. Mine was a
smear. And a heavily blurred copy of the photograph outscored both. (The scores in the
figure are over the region shown.) Over whole frames, sampled across the capture, a single
flat colour scored 23.2 dB, my model 28.6 and the blurred photograph 30.6. On a
low-contrast scene like sand, the whole range from "one colour" to "perfect" is only a few
decibels, and a blur sits comfortably inside it.

The reason is how PSNR counts. Detail that's slightly out of place is penalised twice: once
where it is, once where it should be. Smooth and roughly right is penalised once. So any
change that adds real detail should be *expected* to lower PSNR on textured content, and a
rule of "adopt it if the number goes up" will reliably choose the blur.

The fix is cheap. Before trusting a margin, score something dumb, a flat colour or a blurred
copy of the photo, with the same metric on the same scene. If the dumb thing lands near the
model, the metric can't separate them there, and the margin means nothing.

## Trap 2: held-out photos are honest, but not free

Is it worth holding photos out, or could you just score the training photos? Across 313 of
my runs, here's how the two compare:

![Scatter plot of training-photo PSNR against held-out PSNR for 313 runs. Most lie just below the equality line; the worst tenth, in orange, sit 5 dB or more below it.](/assets/images/cultcap/measuring/train-vs-heldout.png)

Mostly they move together: a correlation of 0.85, with held-out typically 1.4 dB below
training. But in the worst tenth of runs, held-out is 5 dB or more below, and up to 20 dB.
I haven't diagnosed every one, but a gap like that is the signature of a model that fits the
photos it was given and not the views in between. Training-photo scores can't see that.
Held-out ones can, which is why the star rating uses them.

They cost something, though. Every photo held out is a photo the model never learns from.
On a dense walk-around that hardly matters: the nearest training photo is typically a couple
of degrees away. But on the bronze above, one held-out photo was nearly the only one bridging
a gap between two loops at different heights, so the model never saw the view that joined
them. I'm reworking how photos get held out so a photo that bridges a gap
never is.

And a held-out photo has to be scoreable. When the background removal fails on a photo, its
held-out score measures the mask, not the model. One such photo, scoring 8.6 dB, was pulling
a model's average down by most of a decibel.

## Trap 3: novel views only mean something where you looked

Here's the novel-view orbit of a painting, captured from the front, as paintings on walls
are:

![Six novel views of a painting model. The three from the front are sharp; the three from behind, where no photo was taken, are a smear of colour and spikes.](/assets/images/cultcap/measuring/one-sided.jpg)

From the front it's sharp. From behind it's a mess, because nothing was ever photographed
from there. A consistency score taken over the whole orbit rates this capture badly for a
problem it doesn't have: across my runs, that score's correlation with held-out PSNR is
essentially zero, and the lowest-scoring object captures are mostly one-sided ones like
this. The pipeline already measures which directions a capture covered, so the orbit, and its score, should stay
inside them. The [turntable clips in the gallery post](/posts/cultcap-newcastle-art-gallery/)
already do.

## More traps, briefly

**Matching each photo rewards the camera's mistakes.** If the camera exposed one photo
darker, a model that renders that view darker matches it perfectly. Every photo-referenced
score prefers it. The [bronze that changed its finish](/posts/cultcap-bronze-changed-its-finish/)
is exactly this, and the check that catches it is reference-free: does the object stay the
same brightness all the way round, apart from its real shading?

**A masked score can't see the outline.** Score only inside the mask, and a model that has
swollen past the object's silhouette scores the same as one that hasn't. The extra is
outside the scored region. I also measure the silhouette ratio and how much of the object
you can see through.

**A doubled reconstruction can score well.** If the camera solver folds a capture, every
camera sees its own copy of the object, and held-out scores can even improve. Nothing
image-based catches it. A check on the camera path itself, for a jump no person could have
walked, does.

**Borrowed thresholds are guesses.** My first star rating used an SSIM floor that sounded
reasonable. On my own runs it would have failed most of the good ones, because SSIM depends
on content: a smooth object scores lower than a textured one at the same visual quality.
Every threshold I use now is set from the distribution of my own runs.

## Renders are the metric

Every one of these traps was found the same way: a person looking at a render next to a
number that said "fine". So renders are first-class output, and they're automatic, because
the moment producing one takes effort, I stop doing it. Every run produces:

1. **Held-out comparisons.** The photo, the render and the difference, for the same fixed
   views, so any two runs line up.
2. **An orbit.** The same path, resolution and framing every time. Floaters and popping that
   no single view shows are obvious in two seconds of turntable.
3. **A scorecard, not a score.** Structure, colour, uniformity round the orbit, silhouette and
   see-through as separate numbers, because they fail independently and a single number
   averages them away.
4. **A camera check before training.** The camera path is checked for impossible jumps
   before any GPU time is spent fitting it.

And by hand, before trusting any margin: score a flat colour and a blurred photo on the same
scene with the same metric.

The rule I follow: sort by metric, judge by render. The numbers are the index. They tell me
which runs to look at first, and they catch regressions when I'm not looking. The verdict
comes from looking. For a change where I already suspect the metric can't see the
difference, such as anything that adds detail or touches appearance, I write the acceptance
criterion down *before* the run, so the number can't talk me out of what I can see.
