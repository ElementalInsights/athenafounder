# I Built an Enterprise SaaS With Claude. Here's What That Actually Looked Like.

Not vibes. Data.

---

There's a version of this post where I tell you AI is magic and everything was easy. That's not this post.

I'm one of two founders building AthenaForms. Enterprise safety compliance software for mid-market companies. Accessible pricing, serious product.

I built the core product using Claude Code as my primary development partner. We're launching March 16th.

This is what that actually looked like, down to the byte.

---

## The Numbers First

Before writing this I built a data visualization pulling from every single Claude Code session transcript stored on my machine. Turns out Claude Code saves everything locally as JSONL files. 45 of them. 0.87 GB total. An accidental record of the whole build.

Here's what it shows:

- **45 sessions** across 18 active working days
- **115,320 messages** exchanged (I was sending around 2,193 a day)
- **391 context resets** where Claude ran out of memory mid-session and had to summarize everything to keep going
- **6.7 hours** of active Claude compute per working day
- **$2,000** in total API spend

A dev shop would quote this at $300-500k and 12-18 months. I'm not saying AI replaced that. I'm saying something more interesting happened.

---

## What Actually Got Built

Classification-based access control (our core IP). An org tree with materialized paths. Forms with full version history. Document management with mail merge. A workflow engine with state machines and SLA tracking. A CMMS. Reference libraries. Work packets with document acknowledgements. A report builder. Full-text search and RAG indexing across all stored files. An AI assistant. An autonomous agent system. Enterprise SSO. Audit logging on every mutation. Four languages. Multi-tenant architecture with row-level security on every table.

That's not a side project.

---

## The System Behind It

Here's where I want to be really direct, because I think most "I built with AI" posts skip over the part that actually matters.

Claude will confidently build the wrong thing if you let it. Not because it can't code. Because it optimizes for completing the task as described rather than building the right system. Those aren't always the same thing.

Early on I lost half a day to a perfectly implemented feature that violated a core architectural principle. The code was clean. The approach was wrong. Claude had drifted over a long session, started reasoning from subtly different assumptions, and I didn't catch it until it was already built.

The fix wasn't being more careful. It was structural. I built a context system with four layers that made it much harder to go off the rails.

**CLAUDE.md**

A 300+ line living document covering the full architecture, database conventions, package patterns, and what not to do and why. Every session reads it first. Every significant decision gets written back into it. It's not a prompt. It's institutional memory. Without it Claude starts each session smart but contextless, capable of writing excellent code for the wrong version of the system.

**The specs folder**

Every feature gets a spec file before any code gets written. Not a vague description. A real document covering the data model, API surface, UI behavior, edge cases, and open questions. The spec is what you point Claude at when you say "implement this."

Writing specs caught problems early. When a spec was hard to write it usually meant the feature wasn't actually well understood yet. Better to find that out before building it.

**AGENTS.md files**

The codebase is organized into feature packages. Each one has an AGENTS.md: a concise guide explaining what the package does, how to use its API, what patterns to follow, and what to watch out for. When Claude is working inside a package it reads that file first. It knows the local territory without rediscovering it from the code. There are 26 of these across the codebase.

**The tasks folder**

For complex work I'd write out a structured task list before starting: what needs to happen, in what order, what done looks like. Claude would work through them and update status as it went. This sounds like overhead. It isn't. It's the difference between a session that ships something and a session that spirals.

These four things together made it possible to pick up after a gap, switch between features without losing thread, and catch Claude when it started drifting before it got too far.

---

## The 391 Number

Most Claude Code users never hit a context limit. It means a session ran so long and deep that the model's working memory filled up completely and had to summarize everything before continuing.

I hit it 391 times.

One session, a single day grinding through a security audit, generated 129 megabytes of conversation data and hit the limit 63 times. Each time Claude would write out what had been built, what decisions were made and why, what was left. Then keep going. The specs made those summaries more coherent because Claude always had something concrete to anchor to.

The longest single turn took 48.5 minutes. I sent a message, made coffee, went for a walk, came back, and it was still running.

---

## What the Data Shows

Tool calls across all 45 sessions:

1. Edit: 10,928
2. Read: 9,100
3. Bash: 7,268
4. Grep: 2,477
5. Write: 1,691

More reads than writes. More searches than writes. This isn't a system generating code blindly. The majority of operations were reading and understanding existing code before touching it. Direct result of the AGENTS.md system: Claude reads the package guide, reads the spec, reads the existing implementation, then acts.

One file got edited 262 times across the project. Not a sign of failure. A sign of something complex being iterated carefully, each session knowing exactly what the last one left behind.

---

## What Didn't Work

Long sessions degrade. After 60+ messages the reasoning about subtle constraints would start slipping. Shorter sessions with tight handoff documents beat marathons every time.

Schema drift is expensive. Moving fast it's easy to run a database migration and forget to update the canonical schema file. Twice this created cascading phantom DROP TABLE statements in diff checks that took hours to untangle. Schema file updated in the same commit as every migration, no exceptions. Learned that one the hard way.

You can't delegate judgment. There were moments where a confident suggestion was wrong for reasons Claude couldn't know: business domain specifics, a regulatory nuance, an edge case in how our customers actually work. Those moments required me to be the expert. The whole thing only works if you stay in the driver's seat.

---

## The Real Takeaway

AI didn't replace engineering judgment. It amplified it. Every architectural decision, every data model choice, every tradeoff was mine. Claude executed faster than any team I could have assembled but execution without judgment is just fast mistakes.

What changed is the cost of exploration. I could afford to be wrong, back up, and try a different approach because a wrong turn cost an afternoon not a sprint. That changes how you build. You take more swings. You question assumptions you'd have just accepted before. You build the better version instead of the expedient one.

The $2,000 didn't buy me a codebase. It bought me 18 days of thinking at scale with a system disciplined enough to keep the thinking coherent.

---

## What's Next

We launch March 16th.

If you're running safety compliance in spreadsheets, or paying enterprise prices for software that wasn't built for you: **athenaforms.com**

If you're a founder thinking about building with AI: the methodology matters as much as the model. The specs, the task system, the AGENTS.md files. That's the part that doesn't show up in demos. Happy to go deeper on any of it.

---

*The data in this post comes from actual Claude Code session transcripts, 45 JSONL files stored automatically on my local machine. Stack: Claude Code, MakerKit, Next.js 16, React 19, Supabase, Stripe.*
