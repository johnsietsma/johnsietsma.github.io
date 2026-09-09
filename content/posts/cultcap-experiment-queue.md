---
title: "CultCap: Every idea becomes a one-line job"
publishDate: 2026-08-26T00:00:00+10:00
description: "The experiment queue behind CultCap: turning 'I wonder if...' into a queued job spec, so decisions get made by results instead of by fiddling."
tags:
  - cultcap
  - gaussian-splatting
  - tooling
  - pipeline
draft: true
---

The bottleneck in a reconstruction pipeline isn't running experiments. It's deciding
between them — and before that, it's the friction of turning "I wonder if opacity pruning
at 15k iterations helps" into an actual answer.

Without tooling, that wonder costs an evening: edit a config, kick off training, remember
to come back, render something, eyeball it against... whichever previous run is still on
disk. Do that three times and the comparisons aren't comparable anymore. Most ideas don't
survive the friction, so they never get tested at all, and decisions get made by vibe.

The fix for CultCap was an experiment queue: **every idea becomes a one-line job spec, and
results show up in a gallery.**

## The shape of a job

A job is a named diff against a baseline config, plus the evaluation set to run it on:

```yaml
# TODO: replace with real spec format
name: opacity-prune-15k
base: baseline-v3
overrides:
  prune_opacity_iter: 15000
objects: [benchmark-shelf]
```

<!-- TODO: show the actual format — and the one-liner CLI that generates this from flags -->

That's the whole interaction. Everything downstream is automatic: training runs with the
merged config, the harness renders the fixed held-out views and turntable
(see [renders are the metric](/posts/cultcap-renders-are-the-metric/)), metrics land in the
run table, and the gallery gets a new row with new-vs-baseline comparison crops.

Three properties matter more than they look:

- **Named diffs, not edited configs.** The question being asked is recorded in the job
  itself. Six months later, `opacity-prune-15k` still says what it was for; a mutated
  `config_final_2.yaml` doesn't.
- **The baseline is pinned.** Every run compares against a declared baseline, not "whatever
  I ran last." When the baseline advances, that's an explicit, recorded decision.
- **The evaluation set is fixed.** Same objects, same capture footage, every time. My
  "benchmark shelf" — a handful of objects chosen to be deliberately nasty (specular metal,
  glass, dark wood, fine engraving) — probably deserves its own post.

## Queue while you think, decide when you look

The workflow this produces: ideas get queued the moment they occur, in one line, without
breaking whatever I'm actually doing. The machine churns through them overnight. In the
morning there's a gallery of comparable results, and the decision is usually obvious in
seconds per run.

<!-- TODO: screenshot of the gallery / run table -->

The queue also changes *what kinds* of questions get asked. Parameter sweeps stop being a
chore — `prune_opacity_iter: [10000, 15000, 20000]` is barely more typing than one value.
And risky ideas get tested instead of debated with myself, because the cost of a wrong
guess is one wasted GPU-night, not one wasted evening of my attention.

<!-- TODO: real example — a decision that went the opposite way I expected, with the gallery row that settled it -->

## Boring on purpose

There's no scheduler cleverness here — it's a directory of job specs and a worker loop.
The value isn't in the engineering, it's in the contract: *if an idea is worth wondering
about, it's worth one line, and one line is all it costs.*

Same bet as CultCap itself. A capture pipeline a regional museum actually uses wins on
cost-of-use, not peak quality. An experiment pipeline I actually use works the same way.

<!-- TODO: implementation notes — queue format, GPU worker, failure handling / retries, where run artifacts live -->
