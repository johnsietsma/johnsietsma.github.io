---
title: "I made Mum an AI voice assistant. It didn't really work."
publishDate: 2026-10-01T00:00:00+10:00
description: "Mum was losing her sight, so the family built her a voice assistant to replace her paper diary. Siri, Vapi, an LLM and AWS Lambda. Then cataract surgery gave her enough sight to keep using paper."
tags:
  - voice
  - ai
  - accessibility
  - family
draft: true
---

<!-- TODO: check with Mum and Janet that they're happy with this post and the quotes -->

My mum has dry macular degeneration. She's losing her central vision, and early this year we were told she could be fully blind within a year or so.

Mum runs her life from a paper diary and a notepad. Appointments, the shopping list, things to ask the kids. When we asked her what she'd most want help with, she kept coming back to one thing: organisation. She wanted to keep doing it herself.

So we built her a voice assistant. We called it Helpen, which is Dutch for "to help".

<figure>
  <img src="/assets/images/helpen/icon.png" alt="The Sarene Helpen app icon: a microphone in an orange circle above the words Sarene Helpen." width="256" height="256">
</figure>
<!-- TODO: credit the icon design (Siewke?) -->

It was never a product. There was no business plan and no other users. It was a thing just for Mum. That made a lot of decisions easy: hard-code what suits her, use whatever the family already has, and skip anything that only matters at scale.

<!-- TODO: photo of the paper diary? -->

## The tech

Mum already used Siri to make phone calls, so that's how she opened it: "Hey Siri, open Helpen". There was nothing new to learn and no icon to find.

The app is a small React Native and Expo app. When it opens, it starts a voice call straight away. There's almost no screen, just a few audio tones.

The voice side is [Vapi](https://vapi.ai/). It handles speech-to-text, the conversation with an LLM, and text-to-speech. Most of what makes the assistant feel like anything is the system prompt.

When the assistant needs to do something, it calls tools on a small Python API running on AWS Lambda. I started by building those tools as an MCP server, then switched to plain HTTP endpoints because that's what Vapi wanted. I kept the MCP server for testing locally against a model running in Ollama.

There's no database. The backend is Todoist. The family already used it, and assigning a task to someone sends them a notification. So when Mum says "ask John to fix the gate", I get a ping on my phone.

![How Helpen fits together: Mum asks Siri to open the Helpen app, the app starts a Vapi voice call, Vapi calls tools on a Python API on AWS Lambda, the tools read and write Todoist, and Todoist notifies the family's phones.](/assets/images/helpen/flow.svg)

## What I learnt

### Getting in is the hardest part

The first real test was opening the app. Siri kept hearing "Helpen" as "health" and opening the Health app. The friendlier assistant name we'd picked didn't work either. What finally worked was "open the Sarene Helpen app".

All the careful conversation design was stuck behind the first five seconds.

### Voice only answers when asked

I think this is the big one.

A paper diary sits on the bench and reminds you just by being there. You walk past it and see Thursday. A voice assistant does nothing until you speak to it. It's driven entirely by requests.

Mum said her tasks were "hard to remember they are there". Out of sight, out of mind, literally.

The fix was to make it start the conversation: open with a short summary, like "You have one appointment today and three things on the shopping list." What she really wanted was proactive reminders the day before and three days before an appointment. That's the paper diary's job, done out loud.

### Time loses its shape

My sister Janet pointed out something I hadn't thought of. On a paper calendar you can see that something is two weeks away. You lose that when you can't see the page. "The twentieth" is just a date.

So the assistant should say "in two weeks" or "next Thursday". Mum also wanted to know if she was double-booking a day, which is obvious on paper and invisible in voice.

### Small wording decisions matter

"Send John a task" became "Ask John to…". It's how Mum talks, and it's kinder.

The assistant reads back anything important before acting on it: appointments, messages to family, anything being deleted. After a change, it says the new state: "You now have four things for John."

Replies are short, because every extra word costs her time. Dates and times are said as words. It uses her name, but sparingly.

### Speed

Mum found it slow to answer. In a voice conversation, even a short pause feels like you haven't been heard.

<!-- TODO: a line on where the delay came from, if known -->

### Testing something that only understands language

Unit tests can check the tools work. They can't tell you whether the LLM will pick the right tool when Mum says "I need more heart tablets".

I wrote prompt-driven integration tests that sent plain English requests to a local model through the MCP server and checked which tools it called. Useful, but the real testing was Mum on the phone with Janet taking notes. One call taught me more than the whole test suite.

### What she liked

She was surprised it could do everything. She said the voice was "very friendly and nice and makes you feel at ease", and she liked that it said her name.

## Working with family

This was a family project. Everyone had a role.

Mum gave the brief and had the final say. Her list of ideas set the scope (notes, diary, shopping, Uber), and "organisation is most important" set the priority.

My brother Kor is a solution architect. He pushed us to test first, with Mum involved, rather than diving straight into building. That's why we wrote out scenarios and tested with her before adding features.

My sister Siewke did the visual design from New York. She also brought her experience with AI to the prompt writing, which is a big part of why the assistant sounds warm and not robotic.

<!-- TODO: what Siewke designed specifically: icon, user guide, app screens? -->

Janet sat with Mum through the first real test and wrote it all down, including the things Mum wouldn't have thought to say.

I did the build, and turned everyone's notes into prompt and tool changes.

The questions and pushback were as useful as the ideas. They kept us honest about whether this was helping Mum or just interesting to me.

<!-- TODO: one concrete example of pushback, if there is one -->

## How it turned out

Mum had cataract surgery. It gave her back enough sight to keep using paper.

There's some irony in that. I built a voice agent with an LLM in the loop, running on Lambda, talking to Todoist. And the benchmark the whole time was a notebook.

Paper already reminds you just by being there. It shows you how far away next week is. It never mishears "health".

<!-- TODO: if true: her vision may still change, and Helpen is shelved, not gone -->

## What I'd take away

Start from the thing you're replacing, and work out what it does without anyone noticing. Most of the hard problems were things the paper diary did for free.

Use what people already know. Siri and Todoist did more for Mum than anything clever I built.

Test with the real person, early. Kor was right.

And sometimes the best outcome is that nobody needs the thing you made.
