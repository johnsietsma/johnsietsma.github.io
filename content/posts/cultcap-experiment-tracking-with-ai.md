---
title: "CultCap: Experiment tracking with an AI in the loop"
publishDate: 2026-10-28T00:00:00+10:00
description: "Running a one-person research project with a coding agent doing the reading: where the tracker fell over, how the agent misreported numbers, the code structure that fixed it, and why a plain findings document turned out to be the most important tool."
tags:
  - cultcap
  - tooling
  - ai
  - experiment-tracking
draft: true
---

CultCap has produced several hundred pipeline runs. Each one is a directory with a hash
for a name, a dozen subdirectories of JSON, a job log, and some renders. The questions I
actually want answered — did this change help, on which captures, compared to what — are
all cross-run questions, and answering them by hand means opening a lot of directories.

For most of the project I haven't been doing that by hand. A coding agent does the
reading, the summarising, the comparison, and increasingly the proposing of the next
experiment. That's been an enormous accelerator, and it's also produced a specific
category of mistake I hadn't seen before. This post is about both.

## What experiment tracking is for

Every experiment answers a question: change one thing, hold everything else, compare.
Tracking is the bookkeeping that makes the comparison honest — what was changed, what
was held, what came out, and where the evidence lives. Without it you end up
re-running things you've already run because you can't remember the answer, or trusting
an answer you can't reconstruct.

The ML-flavoured tools for this (Weights & Biases, MLflow, and their lighter cousins) are
built around a training loop: log a scalar every step, plot curves, compare runs in a
dashboard. That's a good fit for a model with one loss going down. It's a weaker fit for
a pipeline with eight stages, where the interesting result is often "registration
dropped from 107 frames to 34" or "the mask flickered on frame 140", and the thing you
need to look at is an image.

<!-- TODO: screenshot of a run directory tree, annotated with which files carry which signals -->

## Why I care

I'm one person with one GPU. The bottleneck isn't compute; it's my attention. Every hour
spent reading logs to work out which of last night's five runs is the baseline is an hour
not spent deciding what to try next. And every conclusion I hold in my head instead of
on disk is a conclusion I'll re-derive, wrongly, in a month.

The agent changes the economics. Reading forty run directories and tabulating a metric
is a two-minute task for it and a two-hour one for me. But that only helps if what it
reads is right.

## What I did, in order

1. **A flat results table.** The first tracker was a script that regenerated a markdown
   table from every run's result JSON. It was a fine audit trail and useless for
   questions, because it recorded only the parameters I'd overridden on the command
   line, not the full config a run actually used, and nothing linked a row back to its
   renders.

2. **Trackio.** A local-first, pure-Python tracker with a wandb-shaped API — no
   database server, installs cleanly on Windows, logs images and tables. I promoted it
   to a proper pipeline step so every run reported its metrics, resolved config, git
   commit and comparison images. For a few dozen runs it was exactly right.

   <!-- TODO: be specific about where trackio stopped scaling — dashboard load time? query across runs? image volume? -->

   It stopped being the right tool when the questions became cross-run. The dashboard
   is built for looking at a handful of runs side by side; I wanted "every run on this
   session since the matcher changed, with registration count and held-out PSNR", and
   that's a query, not a chart.

3. **A typed run-reading library.** The turning point, and the part I'd recommend to
   anyone doing this with an agent. More below.

4. **Three kinds of document.** A proposal *before* an experiment saying what it tests
   and what result would change a decision. A record *per experiment* with the exact
   command, the exact output directories, and the numbers. And one curated *findings*
   document, organised by fact rather than by experiment, dated, and corrected in place
   when something is later shown wrong.

## The gotcha: the agent reads the wrong file and reports it confidently

Here's the failure mode. A run directory contains several JSON files with metrics in
them, produced at different stages: the trainer's own in-training evaluation, the
proper held-out evaluation, an evaluation rendered through a different camera for
comparison with an external model. They have similar names and similar fields. A resumed
run inherits some files from the run it resumed from and regenerates others.

Ask the agent for "the held-out PSNR of run X" and it will find a file, find a field
called PSNR, and report it. The number it reports is real. It's just not the number you
asked for — it's from the in-training eval, or from the parent run, or from a file the
pipeline was partway through overwriting when it was killed. And it's reported in the
same confident sentence as every correct number, so nothing about the answer tells you
to check.

I caught this several times by noticing a number that didn't match what I remembered,
and at least once I didn't catch it and recorded a conclusion that was later corrected.
Each hand-written analysis script had the same problem in a different shape: its own
glob, its own JSON parsing, its own guess about which file was authoritative, and in a
couple of cases a hardcoded output path that silently pointed at a different machine's
data.

<!-- TODO: a concrete example, anonymised if needed — the number that was reported, the file it came from, the file it should have come from -->

## The fix: make the right answer the only easy one

The library that fixed it does one thing. Given a run directory, it returns a typed
record — every metric the pipeline can produce, each with a single, documented source
file, and each `None` if that file is absent. Reading the whole library is one function
that yields those records. Nothing in it writes, launches, or guesses.

Three design rules made it work with an agent doing the reading:

- **One source per signal, named in code.** "Held-out PSNR comes from this file, this
  field." Not "look for PSNR". The agent calls `read_run` and gets a record; it never
  opens JSON itself. When I want a new signal, I add it to the library with its source,
  and every past and future analysis picks it up the same way.
- **Missing is a value, not an error.** Runs are routinely partial — killed mid-eval,
  resumed from a dump, produced by a recipe that skips a step. A reader that raises on
  the first incomplete run is useless for exactly the cross-run questions worth asking.
  Every field is optional, and absence means "this signal wasn't produced", which is
  itself information.
- **Provenance travels with the record.** Which session, which recipe, which commit,
  which run it was resumed from, and the free-text note I gave at launch. The agent's
  summary can then say "resumed from the same reconstruction as the baseline" or "these
  two runs don't share poses, so don't compare their consistency scores", because the
  record carries the fact.

The effect on the agent's reliability was immediate. It's not that it got smarter; it's
that the easy path and the correct path became the same path.

## Getting accuracy *and* speed

The thing I most want from the agent is the fast reasoning: the ability to read a night's
worth of logs, notice that three runs share a failure, and propose the discriminating
experiment. That reasoning is only as good as its inputs, so the workflow is arranged to
make the inputs boring and trustworthy:

- **Numbers come from the library, never from prose.** If the agent quotes a metric, it
  came through a typed record I can trace.
- **Every experiment is written down before it runs**, with its question, its baseline,
  and the criterion that would count as success. The agent fills in the findings after;
  it doesn't get to move the goalposts.
- **The findings document is curated, not generated.** It holds distilled facts, with
  dates and pointers to the evidence, and it's the first thing the agent reads before
  proposing anything. "Do not re-propose uninformed" is a heading in it. Negative
  results are recorded with the same care as positive ones, because they're the ones
  that get forgotten and re-run.
- **Corrections are made in place, loudly.** When a later measurement overturns an
  entry, the entry is edited to say so, with the date. A findings document with a
  RETRACTED entry is worth more than one that was never wrong, because it tells the
  reader — human or agent — how much to trust the rest.

## Why plain documents work

I expected the tracker to be the important tool and the documents to be paperwork. It
went the other way. A run directory is an opaque hash and the only trace of *why* it
exists is a note string buried in a manifest. Two minutes writing the experiment record
at launch is what stops the conclusion being reconstructed by archaeology three weeks
later, and it's what lets the agent answer "what did we learn about masking?" from a
document instead of from forty directories.

The documents also fit the agent's shape better than a dashboard does. It can read a
markdown file end to end, hold the whole findings index in context, and cite an entry
by date. It can't browse a chart. Structuring the project's memory as text made the
agent a better collaborator for free.

<!-- TODO: link to the experiment-queue post once its slug is final; this is the "results" half of that "queue" half -->

## What I'd tell someone starting out

Use whatever tracker you like for the first fifty runs. Then, before you let an agent
read results for you, write the typed reader — one source per signal, missing as a
value, provenance attached. Keep a findings document by hand, and put the corrections in
it. And when the agent gives you a number, ask which file it came from, at least until
it can't answer anything other than "the library".
