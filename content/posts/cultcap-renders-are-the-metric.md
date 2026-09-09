---
title: "CultCap: Renders are the metric"
publishDate: 2026-08-26T00:00:00+10:00
description: "Why my experiment tracker treats renders as first-class artifacts, and what to do when PSNR and your eyeballs disagree about splat quality."
tags:
  - cultcap
  - gaussian-splatting
  - photogrammetry
  - tooling
draft: true
---

Most experiment-tracking writeups are shaped like ML training: log a loss curve, log some
scalars, pick the run with the best number. I started there with CultCap and it fell apart
almost immediately, because Gaussian splat quality is a thing you *see*, and the numbers
lie just often enough to be dangerous.

Two runs can land within a fraction of a dB of each other on PSNR and look completely
different on the actual object. One has crisp edges and a floater cloud hovering off the
left shoulder; the other is slightly soft everywhere but clean. The metric calls it a tie.
A museum curator would not.

<!-- TODO: hero image — side-by-side of two runs with near-identical PSNR that look obviously different -->

## The disagreement problem

The standard metrics (PSNR, SSIM, LPIPS on held-out views) each fail in their own way on
heritage objects:

- PSNR rewards blur. A splat that smears fine engraving into mush can beat one that
  reconstructs it with slight noise.
- SSIM is better but still happily ignores small floaters that are glaring in a turntable.
- LPIPS is the closest to human judgement, but it's computed on the held-out camera poses —
  and floaters love to live exactly where no camera looked.

<!-- TODO: concrete example from a real run — the case where LPIPS picked run A and the turntable clearly favoured run B -->

Heritage objects make it worse. Specular gold, glass display cases, and dark polished wood
are all pathological for both the reconstruction *and* the metrics. That probably deserves
its own post.

## Renders as first-class artifacts

So the rule I settled on: **every experiment produces the same set of renders, automatically,
or it didn't happen.** For each run the harness generates:

1. **Held-out view renders** — the same fixed evaluation poses for every run, so images are
   directly comparable and the metrics are computed on exactly what I'm looking at.
2. **A turntable orbit** — same camera path, same lighting, same resolution, every time.
   Floaters and popping artifacts that no static metric catches are obvious in two seconds
   of orbit.
3. **A comparison grid** — new run vs. baseline vs. best-so-far, same crops, same zoom
   levels. Crops are defined per evaluation object (the engraving, the handle, the rim) so
   I'm always checking the regions that matter.

<!-- TODO: screenshot of the comparison grid page -->

The metrics still get logged — they're great for catching regressions and for triage when
there are twenty runs in the queue. But they're the index, not the verdict. The workflow is:
sort by metric, judge by render.

## Making it cheap enough to actually do

None of this is clever. The reason it works is that it's *automatic*. The moment producing
a turntable required me to open a viewer and set up a camera, I stopped doing it, and
decisions quietly degraded back to "stare at the loss curve and guess."

<!-- TODO: brief note on implementation — render pass runs headless after training, artifacts written next to run metadata, gallery is a static page -->

This is the same bet CultCap itself makes: the difference between a capture pipeline a
regional museum uses and one it doesn't isn't quality, it's cost-of-use. Applied to my own
experiments: reproducible comparisons I actually look at beat better metrics I don't.

## What's next

The renders tell me *which* run won. The other half of the harness is making it trivial to
queue the next question — that's the [experiment queue post](/posts/cultcap-experiment-queue/).

<!-- TODO: link check once queue post slug is final -->
