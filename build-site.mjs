import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';


const slim    = readFileSync('./claude-viz-slim.json',  'utf8');
const ctxRaw  = readFileSync('./claude-context-data.json', 'utf8');
const vizData = JSON.parse(readFileSync('./claude-viz-data.json', 'utf8'));
const totalLinesWritten = vizData.reduce((s, x) => s + (x.linesWritten || 0), 0);
const sankeyRaw = JSON.parse(readFileSync('./claude-sankey.json', 'utf8'));
sankeyRaw.nodes = sankeyRaw.nodes.map(n => ({ ...n, label: n.label.replace(/\n.*/g, '') }));
const sankey = JSON.stringify(sankeyRaw);

mkdirSync('./dist', { recursive: true });
copyFileSync('C:/Projects/athenaforms-master-plan/athenaforms/apps/web/public/images/athena-logo.png', './dist/athena-logo.png');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Building AthenaForms with Claude</title>
<meta name="description" content="How I built an enterprise SaaS with Claude Code. The data, the methodology, and what actually happened.">
<meta property="og:title" content="I Built an Enterprise SaaS With Claude">
<meta property="og:description" content="45 sessions. 393 context resets. 588,119 lines of code. One War &amp; Peace. Here's what that actually looked like.">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="I Built an Enterprise SaaS With Claude">
<meta name="twitter:description" content="45 sessions. 393 context resets. 588,119 lines of code. The data, the methodology, and what actually happened.">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></` + `script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></` + `script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></` + `script>
<script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></` + `script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#07080f;--surface:#0e1018;--border:#1e2235;
  --text:#e2e8f0;--muted:#64748b;--dim:#334155;
  --green:#10b981;--teal:#06b6d4;--amber:#f59e0b;--red:#ef4444;--purple:#8b5cf6;
}
html{scroll-behavior:smooth;zoom:1.25}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:18px;line-height:1.7;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(16,185,129,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.025) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 48px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(30,34,53,0);transition:border-color .3s,background .3s;backdrop-filter:blur(0px)}
nav.scrolled{border-color:var(--border);background:rgba(7,8,15,.85);backdrop-filter:blur(12px)}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.nav-logo img{height:28px;width:auto;filter:brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(400%) hue-rotate(120deg) brightness(90%)}
.nav-logo-name{font-size:15px;font-weight:700;color:var(--green);letter-spacing:-.01em}
.nav-cta{font-size:12px;padding:8px 20px;background:var(--green);color:#000;border-radius:6px;font-weight:600;text-decoration:none;letter-spacing:.01em;transition:opacity .2s}
.nav-cta:hover{opacity:.85}

/* SECTIONS */
section{position:relative;z-index:1}
.container{max-width:1000px;margin:0 auto;padding:0 48px}
.container-wide{max-width:1400px;margin:0 auto;padding:0 64px}

/* HERO */
.hero{padding:140px 0 100px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-300px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 65%);pointer-events:none}
.hero-eyebrow{font-size:13px;letter-spacing:.25em;text-transform:uppercase;color:var(--green);margin-bottom:20px;font-family:'SF Mono','Cascadia Code',monospace}
.hero-title{font-size:clamp(48px,7vw,96px);font-weight:800;letter-spacing:-.03em;line-height:1.05;margin-bottom:20px}
.hero-title span{color:var(--green)}
.hero-sub{font-size:22px;color:var(--muted);max-width:680px;margin:0 auto 60px;line-height:1.6}
.stats-row{display:flex;justify-content:center;gap:0;flex-wrap:nowrap;border:1px solid var(--border);border-radius:12px;overflow:hidden;max-width:900px;margin:0 auto;background:var(--surface)}
.stat{flex:1;padding:28px 24px;border-right:1px solid var(--border);text-align:center;min-width:0}
.stat:last-child{border-right:none}
.stat-val{font-size:clamp(16px,1.8vw,28px);font-weight:700;font-family:'SF Mono','Cascadia Code',monospace;letter-spacing:-.02em;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stat-val.g{color:var(--green)}
.stat-val.t{color:var(--teal)}
.stat-val.a{color:var(--amber)}
.stat-lbl{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-top:4px}

/* PROSE */
.prose{padding:80px 0}
.prose h2{font-size:36px;font-weight:700;letter-spacing:-.02em;margin-bottom:16px;margin-top:72px;color:var(--text)}
.prose h2:first-child{margin-top:0}
.prose p{color:#94a3b8;margin-bottom:24px;font-size:20px}
.prose p strong{color:var(--text)}
.prose ul,.prose ol{color:#94a3b8;padding-left:24px;margin-bottom:24px}
.prose li{margin-bottom:10px;font-size:20px}
.prose li strong{color:var(--text)}
.prose hr{border:none;border-top:1px solid var(--border);margin:48px 0}
.prose code{font-family:'SF Mono','Cascadia Code',monospace;font-size:13px;background:#0e1018;border:1px solid var(--border);padding:2px 6px;border-radius:4px;color:var(--green)}

/* LAYER CARDS */
.layer-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin:32px 0}
.layer-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:24px;position:relative;overflow:hidden}
.layer-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--green))}
.layer-tag{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--c,var(--green));font-family:'SF Mono','Cascadia Code',monospace;margin-bottom:10px}
.layer-title{font-size:20px;font-weight:700;margin-bottom:8px}
.layer-desc{font-size:17px;color:var(--muted);line-height:1.6}

/* DATA SECTION */
.data-section{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:80px 0}
.section-eyebrow{font-size:12px;letter-spacing:.25em;text-transform:uppercase;color:var(--green);font-family:'SF Mono','Cascadia Code',monospace;margin-bottom:8px}
.section-title{font-size:40px;font-weight:700;letter-spacing:-.02em;margin-bottom:8px}
.section-desc{color:var(--muted);font-size:18px;margin-bottom:40px}

/* SANKEY */
#sk-wrap{overflow:hidden}
#sk{width:100%;display:block;overflow:visible}

/* LEGEND */
.sk-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border);align-items:center}
.sk-sep{color:var(--border);font-size:16px;margin:0 2px;user-select:none}
.sk-dot-wrap{position:relative;display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--dim);cursor:default;font-family:'SF Mono','Cascadia Code',monospace;transition:color .15s}
.sk-dot-wrap:hover{color:var(--text)}
.sk-dot{width:9px;height:9px;border-radius:2px;flex-shrink:0}
.sk-dot-wrap::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:#1a1d2e;border:1px solid #2d3456;color:#94a3b8;font-size:12px;font-family:inherit;padding:5px 12px;border-radius:6px;opacity:0;pointer-events:none;transition:opacity .15s;z-index:200}
.sk-dot-wrap:hover::after{opacity:1}

/* DAY CARDS */
.day-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
@media(max-width:768px){.day-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.day-grid{grid-template-columns:1fr}}
.day-card{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:22px;position:relative;overflow:hidden}
.day-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--green))}
.day-emoji{font-size:22px;margin-bottom:12px}
.day-headline{font-size:17px;font-weight:500;color:var(--text);line-height:1.5;margin-bottom:14px}
.day-headline strong{color:var(--text);font-weight:700}
.day-stat{font-size:12px;font-family:'SF Mono','Cascadia Code',monospace;color:var(--dim);letter-spacing:.04em}

/* CTA */
.cta-section{padding:100px 0;text-align:center}
.cta-title{font-size:clamp(32px,5vw,60px);font-weight:700;letter-spacing:-.02em;margin-bottom:16px}
.cta-sub{color:var(--muted);font-size:19px;max-width:680px;margin:0 auto 32px;line-height:1.65}
.cta-chips{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;max-width:720px;margin:0 auto 40px}
.cta-chip{padding:5px 14px;border:1px solid rgba(16,185,129,0.25);border-radius:20px;background:rgba(16,185,129,0.06);font-size:13px;color:var(--muted);font-family:'SF Mono','Cascadia Code',monospace;letter-spacing:.01em;white-space:nowrap}
.cta-btn{display:inline-block;padding:16px 40px;background:var(--green);color:#000;font-weight:700;font-size:16px;border-radius:8px;text-decoration:none;letter-spacing:.01em;transition:opacity .2s,transform .2s}
.cta-btn:hover{opacity:.9;transform:translateY(-1px)}

/* CONTEXT PULSE */
.context-section{border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg);padding-bottom:80px}
.context-hero{padding:80px 0 48px;text-align:center}
.concept-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin:0 0 0}
.concept-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:24px;position:relative;overflow:hidden}
.concept-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--green))}
.concept-num{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--c,var(--green));font-family:'SF Mono','Cascadia Code',monospace;margin-bottom:10px}
.concept-title{font-size:18px;font-weight:700;margin-bottom:8px}
.concept-desc{font-size:15px;color:var(--muted);line-height:1.6}
.pulse-player{border:1px solid var(--border);border-radius:16px;overflow:hidden;background:var(--surface);margin-top:56px}
.pulse-player-top{display:flex;justify-content:space-between;align-items:center;padding:20px 32px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:12px}
.pulse-player-info{font-size:15px;color:var(--muted);font-family:'SF Mono','Cascadia Code',monospace}
.pulse-player-btns{display:flex;gap:8px}
.pl-btn{background:var(--bg);border:1px solid var(--border);color:var(--text);padding:8px 20px;border-radius:6px;font-family:'SF Mono','Cascadia Code',monospace;font-size:13px;cursor:pointer;transition:border-color .2s}
.pl-btn:hover{border-color:var(--green);color:var(--green)}
.pulse-fill-row{display:flex;align-items:center;gap:16px;padding:14px 32px;border-bottom:1px solid var(--border);background:var(--bg)}
.pulse-fill-label{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;font-family:'SF Mono','Cascadia Code',monospace;white-space:nowrap;min-width:150px}
.pulse-fill-track{flex:1;height:10px;background:#1e2235;border-radius:5px;overflow:hidden}
.pulse-fill-bar{height:100%;width:0%;border-radius:5px;transition:width .08s linear,background .15s ease}
.pulse-fill-pct{font-size:13px;font-weight:600;color:#e2e8f0;font-family:'SF Mono','Cascadia Code',monospace;min-width:44px;text-align:right}
#pulse-wrap{background:var(--bg)}
.pulse-legend{display:flex;gap:20px;padding:10px 32px;border-top:1px solid var(--border);flex-wrap:wrap;align-items:center}
.pleg{display:flex;align-items:center;gap:6px;font-size:12px;color:#94a3b8;font-family:'SF Mono','Cascadia Code',monospace;white-space:nowrap}
.pleg i{display:inline-block;width:12px;height:12px;border-radius:2px;flex-shrink:0}
.pulse-hint{font-size:13px;color:#475569;font-family:'SF Mono','Cascadia Code',monospace;padding:12px 32px;border-top:1px solid var(--border)}

/* FOUNDERS */
.founders-section{border-bottom:1px solid var(--border);padding:56px 0;background:var(--surface)}
.founders-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:1000px;margin:0 auto;padding:0 48px}
.founder-card{border:1px solid var(--border);border-radius:12px;padding:28px 32px;background:var(--bg);border-left-width:3px;transition:border-color .2s}
.founder-card:first-child{border-left-color:var(--green)}
.founder-card:last-child{border-left-color:var(--teal)}
.founder-card:hover{border-color:var(--muted);background:#111827}
.founder-name{font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px}
.founder-role{font-size:11px;color:var(--muted);font-family:'SF Mono','Cascadia Code',monospace;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
.founder-bio{font-size:15px;color:#94a3b8;line-height:1.75}
@media(max-width:640px){.founders-grid{grid-template-columns:1fr;padding:0 20px}}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:24px 48px;color:var(--muted);font-size:12px;display:flex;justify-content:space-between;font-family:'SF Mono','Cascadia Code',monospace}

/* TOOLTIP */
#tip{position:fixed;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 16px;font-size:12px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:1000;box-shadow:0 8px 32px rgba(0,0,0,.6);font-family:'SF Mono','Cascadia Code',monospace}
.tn{color:var(--green);font-weight:600;margin-bottom:6px}
.tr{display:flex;justify-content:space-between;gap:16px;color:var(--muted)}
.tr span:last-child{color:var(--text)}

/* ANIMATE IN */
.reveal{opacity:0;transform:translateY(24px)}

@media(max-width:640px){
  nav{padding:16px 20px}
  .container,.container-wide{padding:0 20px}
  .stats-row{flex-wrap:wrap}
  .stat{flex:none;width:calc(50% - 1px)}
  .hero{padding:100px 0 60px}
  footer{flex-direction:column;gap:8px}
}
</style>
</head>
<body>

<nav id="nav">
  <a class="nav-logo" href="https://elementalinsights.com">
    <img src="./athena-logo.png" alt="AthenaForms">
    <span class="nav-logo-name">AthenaForms&#x2122;</span>
  </a>
  <a class="nav-cta" href="https://elementalinsights.com">Get Early Access</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="container">
    <img src="./athena-logo.png" alt="AthenaForms" style="height:72px;width:auto;display:block;margin:0 auto 28px;filter:brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(400%) hue-rotate(120deg) brightness(90%)">
    <div class="hero-eyebrow">Building in Public</div>
    <h1 class="hero-title">I Built an Enterprise SaaS<br>With <span>Claude</span></h1>
    <p class="hero-sub">Not vibes. No hand-waving. Here's what building an enterprise SaaS with Claude actually looked like — down to the byte.</p>
    <div class="stats-row">
      <div class="stat"><div class="stat-val g" id="s1">0</div><div class="stat-lbl">Sessions</div></div>
      <div class="stat"><div class="stat-val" id="s2">0</div><div class="stat-lbl">Messages</div></div>
      <div class="stat"><div class="stat-val t" id="s3">0</div><div class="stat-lbl">Context Resets</div></div>
      <div class="stat"><div class="stat-val a" id="s4">0</div><div class="stat-lbl">GB Generated</div></div>
      <div class="stat" style="flex:1.4"><div class="stat-val" style="color:var(--purple)" id="s5">0</div><div class="stat-lbl">Lines Written</div></div>
    </div>
    <div id="wp-pill" style="text-align:center;margin-top:16px"><span style="display:inline-block;padding:5px 18px;border:1px solid rgba(139,92,246,0.35);border-radius:20px;background:rgba(139,92,246,0.08);font-size:13px;color:#a78bfa;font-family:'SF Mono','Cascadia Code',monospace;letter-spacing:.01em">One <em>War &amp; Peace</em>. Written in code.</span></div>
  </div>
</section>

<!-- STORY -->
<section class="prose">
  <div class="container">

    <h2>What got built</h2>
    <p>Let me just list it. Deep breath.</p>
    <p>Classification-based access control. An org tree with materialized paths. Forms with full version history. Document management with mail merge. A workflow engine with state machines and SLA tracking. A CMMS. Reference libraries. Work packets with document acknowledgements. A report builder. Full-text search and RAG indexing across stored files. An AI assistant. An autonomous agent system. Enterprise SSO. Audit logging on every mutation. Four languages. Multi-tenant with row-level security on every table.</p>
    <p><strong>I'm tired just reading that.</strong> One developer. One AI. That's the point.</p>

    <hr>

    <h2>The system that made it possible</h2>
    <p>Most "I built with AI" posts skip the part that actually matters. So let's start there.</p>
    <p><strong>Claude will confidently build the wrong thing if you let it.</strong> Not because it can't code. Because it optimizes for completing the task as described rather than building the right system. Early on I lost half a day to a perfectly implemented feature that violated a core architectural principle. The code was clean. The approach was wrong. Claude had drifted over a long session and I didn't catch it until it was already built.</p>
    <p>The fix wasn't being more careful. It was structural. Four layers of context that gave every session a complete map before writing a line of code.</p>

  </div>
</section>

<!-- LAYER CARDS -->
<div class="container" style="padding-bottom:80px">
  <div class="layer-grid">
    <div class="layer-card reveal" style="--c:#10b981">
      <div class="layer-tag">Layer 01</div>
      <div class="layer-title">CLAUDE.md</div>
      <div class="layer-desc">300+ line living document. Full architecture, database conventions, package patterns, what not to do and why. Every session reads it first. Every significant decision gets written back. Not a prompt. Institutional memory.</div>
    </div>
    <div class="layer-card reveal" style="--c:#06b6d4">
      <div class="layer-tag">Layer 02</div>
      <div class="layer-title">Specs Folder</div>
      <div class="layer-desc">Every feature gets a spec before any code gets written. Data model, API surface, UI behavior, edge cases, open questions. When a spec was hard to write it meant the feature wasn't well understood yet. Better to find that out first.</div>
    </div>
    <div class="layer-card reveal" style="--c:#8b5cf6">
      <div class="layer-tag">Layer 03</div>
      <div class="layer-title">AGENTS.md Files</div>
      <div class="layer-desc">26 feature packages. Each with its own AGENTS.md: what the package does, how to use its API, what patterns to follow. Claude reads the local map before touching anything. No rediscovering territory from scratch.</div>
    </div>
    <div class="layer-card reveal" style="--c:#f59e0b">
      <div class="layer-tag">Layer 04</div>
      <div class="layer-title">Tasks Folder</div>
      <div class="layer-desc">Complex work gets a structured task list before the session starts. What needs to happen, in what order, what done looks like. Claude updates status as it works through them. The difference between shipping and spiraling.</div>
    </div>
  </div>
</div>

<section class="prose" style="padding-top:0">
  <div class="container">

    <h2>The 393 number</h2>
    <p>Most Claude Code users never hit a context limit. It means a session ran so long and deep that the model's working memory filled up completely and had to summarize everything before continuing.</p>
    <p>I hit it <strong>393 times.</strong></p>
    <p>One session, a single day grinding through a security audit, generated <strong>123 megabytes</strong> of conversation data and hit the limit 63 times. Each time Claude would write out what had been built, what decisions were made and why, what was left. Then keep going. The specs made those summaries coherent because Claude always had something concrete to anchor to.</p>
    <p>The longest single turn took <strong>48.5 minutes.</strong> I sent a message, made coffee, went for a walk, came back, and it was still running.</p>

    <hr>

    <h2>What the data shows</h2>
    <p>Claude Code saves every session locally as JSONL files — a complete record of every message, tool call, and context reset. I didn't plan to analyze them. But after the build I realized I was sitting on 45 files and 0.82 GB of data about how I actually work. So I parsed all of it.</p>
    <p>The meta-analysis was as useful as the build itself. It showed which features required the most back-and-forth, where the context system helped and where it slipped, and how the rhythm of sessions changed as the codebase matured. The methodology got better because the data showed where it was breaking down.</p>
    <p>Tool calls across all 45 sessions tell their own story. More reads than writes. More searches than edits. The majority of operations were reading and understanding existing code before touching it.</p>
    <ul>
      <li><strong>Edit: 10,928</strong></li>
      <li><strong>Read: 9,100</strong></li>
      <li><strong>Bash: 7,268</strong></li>
      <li><strong>Grep: 2,477</strong></li>
      <li><strong>Write: 1,691</strong></li>
    </ul>
    <p>One file got edited 262 times across the project: <code>document-editor-page.tsx</code> — the living document editor with mail merge, version history, and policy acknowledgements. Not a sign of failure. A sign of something genuinely complex being iterated carefully, each session knowing exactly what the last one left behind. It is, for what it's worth, excellent now.</p>
    <p>Where all that effort actually landed is easier to show than describe.</p>

  </div>
</section>

<!-- DATA / VIZ -->
<section class="data-section">
  <div class="container-wide">
    <div class="section-eyebrow">The Flow of Work</div>
    <div class="section-title">How effort moved through the build</div>
    <div class="section-desc">Weeks &rarr; Tool type &rarr; Codebase area &nbsp;&middot;&nbsp; Width = volume &nbsp;&middot;&nbsp; Hover for totals</div>
    <div id="sk-wrap"><svg id="sk"></svg></div>

    <div class="sk-legend">
      <span class="sk-dot-wrap" data-tip="Read, search, understand before touching."><span class="sk-dot" style="background:#06b6d4"></span>Explore</span>
      <span class="sk-dot-wrap" data-tip="Edit, write. Actually making things."><span class="sk-dot" style="background:#10b981"></span>Build</span>
      <span class="sk-dot-wrap" data-tip="Bash. Run it and hope."><span class="sk-dot" style="background:#f59e0b"></span>Execute</span>
      <span class="sk-dot-wrap" data-tip="Task tools. Not winging it."><span class="sk-dot" style="background:#8b5cf6"></span>Plan</span>
      <span class="sk-dot-wrap" data-tip="Live database surgery."><span class="sk-dot" style="background:#ec4899"></span>Schema</span>
      <span class="sk-dot-wrap" data-tip="When even Claude needs to look it up."><span class="sk-dot" style="background:#64748b"></span>Research</span>
      <span class="sk-sep">·</span>
      <span class="sk-dot-wrap" data-tip="UI routes and page components."><span class="sk-dot" style="background:#ef4444"></span>App Pages</span>
      <span class="sk-dot-wrap" data-tip="@kit/* feature packages. The real work."><span class="sk-dot" style="background:#f97316"></span>Packages</span>
      <span class="sk-dot-wrap" data-tip="Written before every feature. Source of truth."><span class="sk-dot" style="background:#eab308"></span>Specs</span>
      <span class="sk-dot-wrap" data-tip="Migrations and schema files."><span class="sk-dot" style="background:#22c55e"></span>DB / Schema</span>
      <span class="sk-dot-wrap" data-tip="Four languages. Many files."><span class="sk-dot" style="background:#3b82f6"></span>i18n / Assets</span>
      <span class="sk-dot-wrap" data-tip="UI, infra, shared across everything."><span class="sk-dot" style="background:#a855f7"></span>Core Packages</span>
    </div>

    <div id="day-header" style="margin-top:80px">
      <div class="section-eyebrow">Your Average Day</div>
      <div class="section-title" style="font-size:24px">What building this actually looked like</div>
      <div class="day-grid">
        <div class="day-card reveal" style="--c:#10b981"><div class="day-emoji">☕</div><div class="day-headline">Six and a half hours of Claude <strong>actively thinking</strong> every day. Not wall clock.</div><div class="day-stat">6.7 hrs compute/day</div></div>
        <div class="day-card reveal" style="--c:#06b6d4"><div class="day-emoji">💬</div><div class="day-headline">More messages than <strong>the full script of Inception</strong>. Written every single day.</div><div class="day-stat">2,193 messages/day</div></div>
        <div class="day-card reveal" style="--c:#f59e0b"><div class="day-emoji">🧠</div><div class="day-headline"><strong>Total amnesia 22 times a day.</strong> Picked right back up every time.</div><div class="day-stat">21.7× context resets/day</div></div>
        <div class="day-card reveal" style="--c:#8b5cf6"><div class="day-emoji">📚</div><div class="day-headline">Roughly <strong>23 novels</strong> of conversation data, generated every single day.</div><div class="day-stat">46 MB context/day</div></div>
        <div class="day-card reveal" style="--c:#ec4899"><div class="day-emoji">⏱️</div><div class="day-headline">Started timing it. Made coffee. Ate lunch. Came back. <strong>Still running.</strong></div><div class="day-stat">48.5 min · longest single turn</div></div>
        <div class="day-card reveal" style="--c:#34d399"><div class="day-emoji">⚡</div><div class="day-headline">Read the codebase, wrote production code. <strong>Three minutes.</strong></div><div class="day-stat">3.0 min avg turn duration</div></div>
      </div>
    </div>
  </div>
</section>

<!-- CONTEXT PULSE -->
<section class="context-section">
  <div class="context-hero">
    <div class="container">
      <div class="section-eyebrow">Understanding AI Memory</div>
      <div class="section-title">The Context Pulse</div>
      <div class="section-desc">Every time you send a message, the model reads the entire conversation from scratch. Here's what that actually looks like across a full build.</div>
    </div>
  </div>

  <div class="container-wide">
    <div class="concept-grid">
      <div class="concept-card reveal" style="--c:#10b981">
        <div class="concept-num">Concept 01</div>
        <div class="concept-title">The Context Window</div>
        <div class="concept-desc">An LLM has no persistent memory. Every single response starts by reading the full conversation — every message, every reply — before generating the next word. That reading window has a hard size limit.</div>
      </div>
      <div class="concept-card reveal" style="--c:#06b6d4">
        <div class="concept-num">Concept 02</div>
        <div class="concept-title">Summarization</div>
        <div class="concept-desc">When the window fills completely, Claude pauses and writes a detailed summary — decisions made, code built, what's next. That summary becomes the new starting point. Work continues, but running on distilled memory rather than raw transcript.</div>
      </div>
      <div class="concept-card reveal" style="--c:#f59e0b">
        <div class="concept-num">Concept 03</div>
        <div class="concept-title">Why Structure Matters</div>
        <div class="concept-desc">Without specs and task lists, summaries are vague. With them, Claude always has something concrete to anchor to. The specs made those 393 resets coherent — instead of losing thread, each new window started with a clear map of where things stood.</div>
      </div>
      <div class="concept-card reveal" style="--c:#ef4444">
        <div class="concept-num" style="color:#ef4444">The Spike</div>
        <div class="concept-title">Security Audit Day</div>
        <div class="concept-desc"><strong style="color:#ef4444;font-size:22px;font-family:'SF Mono','Cascadia Code',monospace">63</strong> context resets in a single session. <strong>123 MB</strong> of conversation data. Every RLS policy, every auth boundary, every privilege escalation path — audited, fixed, re-audited. Claude hit its memory limit 63 times and kept going each time. The specs were the only reason the summaries stayed coherent.</div>
      </div>
    </div>
  </div>

  <div class="container-wide" style="margin-top:48px">
    <div class="pulse-player">
      <div class="pulse-player-top">
        <div class="pulse-player-info">
          <span id="pl-num" style="color:var(--text);font-weight:600">Session 1 / 45</span>
          &nbsp;&middot;&nbsp;<span id="pl-resets">0</span> resets
          &nbsp;&middot;&nbsp;<span id="pl-size">0</span> MB
          &nbsp;&middot;&nbsp;<span id="pl-msgs">0</span> messages
        </div>
        <div class="pulse-player-btns">
          <button class="pl-btn" id="pl-speed">0.25&times;</button>
          <button class="pl-btn" id="pl-btn">&#9646;&#9646;</button>
        </div>
      </div>
      <div id="pulse-wrap"><svg id="pulse-svg" style="cursor:pointer;display:block;width:100%"></svg></div>
      <div class="pulse-legend">
        <span class="pleg"><i style="background:#10b981"></i>1–5 resets</span>
        <span class="pleg"><i style="background:#06b6d4"></i>6–15 resets</span>
        <span class="pleg"><i style="background:#f59e0b"></i>16–30 resets</span>
        <span class="pleg"><i style="background:#ef4444"></i>31+ resets</span>
        <span class="pleg" style="margin-left:auto;color:#475569">Thin slices = many resets &nbsp;&middot;&nbsp; Fat blocks = calm session &nbsp;&middot;&nbsp; Click to scrub</span>
      </div>
    </div>
  </div>
</section>

<!-- LESSONS -->
<section class="prose">
  <div class="container">

    <h2>Hard lessons</h2>
    <p><strong>Long sessions degrade.</strong> After 60+ messages the reasoning about subtle constraints would start slipping — not dramatically, just quietly. You wouldn't notice until something was already built wrong. Shorter sessions with tight handoff documents beat marathons every single time. The model is better rested than you are; the problem is usually that you kept going past the point of diminishing returns.</p>
    <p><strong>The fix: the 80/20 rule.</strong> At roughly 80% context used — monitored manually — stop. Review open threads, update specs and task lists, write a clean handoff note for the next session. The model has no idea how full its context window is. That awareness has to be yours. The last 20% of the window is worth more spent on review than on code. Once this became habit, session quality improved noticeably. Fewer regressions. Cleaner continuity. Less staring at the screen at 11pm wondering where it went wrong.</p>
    <p><strong>Schema drift is a special kind of expensive.</strong> Moving fast, it's easy to run a database migration and forget to update the canonical schema file. Twice this created cascading phantom <code>DROP TABLE</code> statements that took hours to untangle — the database equivalent of a horror movie where everything looks fine until suddenly it really isn't. Schema file updated in the same commit as every migration, no exceptions. Learned that the hard way. Then wrote it into CLAUDE.md so it couldn't be forgotten again.</p>
    <p><strong>You can't delegate judgment.</strong> There were moments where a confident, well-reasoned suggestion was wrong for reasons Claude couldn't know: business domain specifics, a regulatory nuance, an edge case in how customers actually work in the field. Those moments required me to be the expert in the room. The whole system only works if you stay in the driver's seat. It's a very fast car. You still have to steer.</p>

    <hr>

    <h2>The real takeaway</h2>
    <p>AI didn't replace engineering judgment. It amplified it. Every architectural decision, every data model choice, every tradeoff was mine. Claude executed faster than any team I could have assembled — and unlike a team, it never pushed back on a 6am start time or had opinions about the sprint planning format. But execution without judgment is just fast mistakes.</p>
    <p>What changed is the cost of exploration. You can afford to be wrong, back up, and try a different approach when a wrong turn costs an afternoon instead of a sprint. You take more swings. You question assumptions you'd have just accepted before. Some of the best architectural decisions on this project came from asking "wait, what if we did it completely differently?" — a question I would never have had budget to ask with a traditional team.</p>
    <p><strong>You can't treat projects of this scale like a normal chat session. What made it work wasn't the model — it was the structure around it. The specs, the task lists, the AGENTS.md files. That's the part that doesn't show up in the demos. That's also the part we're taking into everything we build next.</strong></p>

  </div>
</section>

<!-- FOUNDERS -->
<div class="founders-section">
  <div class="founders-grid">
    <a href="https://www.linkedin.com/in/jake-edwards-a6a334a/" target="_blank" rel="noopener" class="founder-card" style="text-decoration:none;display:block;cursor:pointer">
      <div class="founder-name">Jake Edwards</div>
      <div class="founder-role">Co-Founder &nbsp;&middot;&nbsp; Engineering</div>
      <div class="founder-bio">Former Director of Engineering, principal engineer by nature. I've spent my career building complex systems — the kind that have to actually work in production. I know what it costs when architecture decisions are made wrong early. AthenaForms is me building the software I always wished existed.</div>
    </a>
    <a href="https://www.linkedin.com/in/tim-boyer-a0144114/" target="_blank" rel="noopener" class="founder-card" style="text-decoration:none;display:block;cursor:pointer">
      <div class="founder-name">Tim Boyer</div>
      <div class="founder-role">Co-Founder &nbsp;&middot;&nbsp; Safety &amp; Domain</div>
      <div class="founder-bio">Deep field experience in OSHA compliance, near-miss reporting, and serious injury and fatality prevention. Tim is the reason AthenaForms solves real problems instead of imagined ones — the domain knowledge that makes the difference between software that looks right and software that works in the field.</div>
    </a>
  </div>
</div>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <div class="cta-title">Get early access to AthenaForms.</div>
    <p class="cta-sub">Enterprise safety compliance built by engineers who care about the data model. Classification-based access control. Audit log on every mutation. API-first with webhooks, SSO, and real RLS — not bolted on after the fact. For safety teams that are tired of tools that don't.</p>
    <div class="cta-chips">
      <span class="cta-chip">Classification-based access control</span>
      <span class="cta-chip">Multi-tenant row-level security</span>
      <span class="cta-chip">Audit log on every mutation</span>
      <span class="cta-chip">API-first + webhooks</span>
      <span class="cta-chip">SSO / SAML 2.0</span>
      <span class="cta-chip">Form version history</span>
      <span class="cta-chip">Workflow engine + SLA tracking</span>
      <span class="cta-chip">Built-in report builder</span>
    </div>
    <p class="cta-launch" style="color:var(--green);font-family:'SF Mono','Cascadia Code',monospace;font-size:16px;font-weight:600;margin-bottom:32px;letter-spacing:.02em">Launching soon.</p>
    <a class="cta-btn" href="https://elementalinsights.com">Get Early Access</a>
  </div>
</section>

<footer>
  <span>&copy; 2026 Elemental Insights &middot; AthenaForms&#x2122;</span>
  <span style="display:flex;gap:20px;align-items:center">
    <a href="https://www.linkedin.com/in/jake-edwards-a6a334a/" target="_blank" rel="noopener" style="color:var(--muted);text-decoration:none">Jake ↗</a>
    <a href="https://www.linkedin.com/in/tim-boyer-a0144114/" target="_blank" rel="noopener" style="color:var(--muted);text-decoration:none">Tim ↗</a>
    <a href="https://elementalinsights.com" style="color:var(--muted);text-decoration:none">elementalinsights.com</a>
  </span>
</footer>

<div id="tip"></div>

<script>
const DATA=${slim};
const SANKEY=${sankey};
const CDATA=${ctxRaw};
</` + `script>
<script>
gsap.registerPlugin(ScrollTrigger);

// nav scroll
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('scrolled',window.scrollY>40);
});

// count-up
const sess=DATA.sessions;
function cu(id,val,dec,pre){
  const el=document.getElementById(id),o={v:0};
  gsap.to(o,{v:val,duration:2.4,delay:.6,ease:'power2.out',
    onUpdate(){el.textContent=(pre||'')+(dec?o.v.toFixed(dec):Math.round(o.v).toLocaleString());}});
}
cu('s1',sess.length);
cu('s2',sess.reduce((s,x)=>s+x.userMsgs+x.assistantMsgs,0));
cu('s3',sess.reduce((s,x)=>s+x.compacts,0));
cu('s4',sess.reduce((s,x)=>s+x.sizeMB,0)/1024,2);
cu('s5',${totalLinesWritten});

// hero entrance
gsap.from('.hero-eyebrow',{opacity:0,y:12,duration:.6,delay:.2});
gsap.from('.hero-title',  {opacity:0,y:20,duration:.7,delay:.3});
gsap.from('.hero-sub',    {opacity:0,y:16,duration:.6,delay:.4});
gsap.from('.stats-row',   {opacity:0,y:20,duration:.6,delay:.5});

// ── Staggered card group entrances ──────────────────────────────────────
[
  {sel:'.layer-grid',   dur:.65, stagger:.11, ease:'back.out(1.6)', y:50, scale:.94},
  {sel:'.concept-grid', dur:.60, stagger:.12, ease:'back.out(1.5)', y:44, scale:.95},
  {sel:'.day-grid',     dur:.55, stagger:.08, ease:'power3.out',    y:36, scale:.97},
].forEach(({sel,dur,stagger,ease,y,scale})=>{
  const grid=document.querySelector(sel);
  if(!grid)return;
  gsap.fromTo(grid.querySelectorAll('.reveal'),
    {opacity:0,y,scale},
    {opacity:1,y:0,scale:1,duration:dur,stagger,ease,
     scrollTrigger:{trigger:grid,start:'top 85%',once:true}});
});

// Founder cards — staggered entrance + hover lift
gsap.fromTo('.founder-card',
  {opacity:0,y:50,scale:.95},
  {opacity:1,y:0,scale:1,duration:.7,stagger:.15,ease:'back.out(1.5)',
   scrollTrigger:{trigger:'.founders-grid',start:'top 85%',once:true}});

document.querySelectorAll('.founder-card').forEach(card=>{
  card.addEventListener('mouseenter',()=>gsap.to(card,{y:-6,scale:1.02,duration:.3,ease:'power2.out'}));
  card.addEventListener('mouseleave',()=>gsap.to(card,{y:0, scale:1,   duration:.35,ease:'power2.inOut'}));
});

// Anything else with .reveal — simple scroll fade
document.querySelectorAll('.reveal').forEach(el=>{
  if(el.closest('.layer-grid,.concept-grid,.day-grid'))return;
  gsap.to(el,{opacity:1,y:0,duration:.7,ease:'power2.out',
    scrollTrigger:{trigger:el,start:'top 88%',once:true}});
});

// ── Section header cascades ──────────────────────────────────────────────
// Each section: eyebrow floats up first, then title, then desc
['.data-section', '.context-hero'].forEach(sel=>{
  const sec=document.querySelector(sel);
  if(!sec)return;
  const els=['.section-eyebrow','.section-title','.section-desc']
    .map(s=>sec.querySelector(s)).filter(Boolean);
  gsap.from(els,{opacity:0,y:24,duration:.65,stagger:.1,ease:'power3.out',
    scrollTrigger:{trigger:sec,start:'top 78%',once:true}});
});
// "Your Average Day" sub-header
const dayHdr=document.getElementById('day-header');
if(dayHdr){
  gsap.from(dayHdr.children,{opacity:0,y:20,duration:.55,stagger:.1,ease:'power3.out',
    scrollTrigger:{trigger:dayHdr,start:'top 85%',once:true}});
}


// ── War & Peace pill — fade up after stats ───────────────────────────────
gsap.from('#wp-pill',{opacity:0,y:12,duration:.6,delay:.9,ease:'power2.out'});

// ── Pulse player card — slide up ────────────────────────────────────────
gsap.from('.pulse-player',{opacity:0,y:40,duration:.7,ease:'power3.out',
  scrollTrigger:{trigger:'.pulse-player',start:'top 88%',once:true}});

// ── Sankey legend — fade in as one row ───────────────────────────────────
gsap.from('.sk-legend',{opacity:0,y:12,duration:.5,ease:'power2.out',
  scrollTrigger:{trigger:'.sk-legend',start:'top 92%',once:true}});

// ── CTA section — title → sub → chips → launch → button cascade ──────────
const ctaST={trigger:'.cta-section',start:'top 80%',once:true};
gsap.from('.cta-title',  {opacity:0,y:48,duration:.75,ease:'power3.out',scrollTrigger:ctaST});
gsap.from('.cta-sub',    {opacity:0,y:32,duration:.65,delay:.15,ease:'power2.out',scrollTrigger:ctaST});
gsap.from('.cta-chip',   {opacity:0,y:14,scale:.92,duration:.4,stagger:.04,delay:.3,ease:'back.out(1.4)',scrollTrigger:ctaST});
gsap.from('.cta-launch', {opacity:0,y:14,duration:.5,delay:.65,ease:'power2.out',scrollTrigger:ctaST});
gsap.from('.cta-btn',    {opacity:0,y:20,scale:.94,duration:.55,delay:.8,ease:'back.out(1.7)',scrollTrigger:ctaST});

// tip helpers
function tip(e,label,val){
  const t=document.getElementById('tip');
  t.innerHTML='<div class="tn">'+label+'</div><div class="tr"><span>Volume</span><span>'+val.toLocaleString()+'</span></div>';
  t.style.opacity='1';t.style.left=(e.clientX+14)+'px';t.style.top=(e.clientY-14)+'px';
}
function ht(){document.getElementById('tip').style.opacity='0';}

// sankey
function draw(){
  const wrap=document.getElementById('sk-wrap');
  const W=wrap.clientWidth,H=Math.max(400,window.innerHeight*.5);
  const svg=d3.select('#sk').attr('viewBox','0 0 '+W+' '+H).attr('height',H);
  const sk=d3.sankey().nodeWidth(18).nodePadding(18).nodeSort(null).extent([[1,28],[W-160,H-6]]);
  const g=sk({nodes:SANKEY.nodes.map(d=>({...d})),links:SANKEY.links.map(d=>({...d}))});
  const pal=[
    ['#34d399','#10b981','#059669','#6ee7b7','#047857'],
    ['#06b6d4','#10b981','#f59e0b','#8b5cf6','#ec4899','#64748b'],
    ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7']
  ];
  const col=n=>pal[n.group][n.index%pal[n.group].length];

  const lG=svg.append('g');
  lG.selectAll('path').data(g.links).join('path')
    .attr('fill','none').attr('d',d3.sankeyLinkHorizontal())
    .attr('stroke-width',d=>Math.max(1,d.width))
    .attr('stroke',d=>col(g.nodes[d.source.index]))
    .attr('stroke-opacity',0)
    .on('mouseenter',function(e,d){d3.select(this).attr('stroke-opacity',.55);tip(e,g.nodes[d.source.index].label+' \u2192 '+g.nodes[d.target.index].label,d.value);})
    .on('mouseleave',function(){d3.select(this).attr('stroke-opacity',.18);ht();});

  gsap.to(lG.node().querySelectorAll('path'),{attr:{'stroke-opacity':.18},duration:1.8,stagger:.02,ease:'power2.out',delay:.2,
    scrollTrigger:{trigger:'#sk-wrap',start:'top 80%',once:true}});

  const nG=svg.append('g');
  const ns=nG.selectAll('g').data(g.nodes).join('g')
    .attr('transform',d=>'translate('+d.x0+','+d.y0+')').attr('opacity',0);

  ns.append('rect').attr('height',d=>Math.max(2,d.y1-d.y0)).attr('width',d=>d.x1-d.x0)
    .attr('fill',col).attr('rx',3).attr('opacity',.9);

  ns.append('text')
    .attr('fill','#94a3b8').attr('font-size','11px')
    .attr('font-family','SF Mono,Cascadia Code,monospace')
    .attr('x',d=>d.x0<W/2?(d.x1-d.x0)+10:-10)
    .attr('text-anchor',d=>d.x0<W/2?'start':'end')
    .attr('y',d=>(d.y1-d.y0)/2).attr('dy','.35em')
    .text(d=>d.label);

  ns.on('mouseenter',(e,d)=>tip(e,d.label,d.value)).on('mouseleave',ht);

  gsap.to(nG.node().querySelectorAll('g'),{opacity:1,duration:.7,stagger:.05,ease:'power2.out',delay:.1,
    scrollTrigger:{trigger:'#sk-wrap',start:'top 80%',once:true}});

  ['WEEKS','TOOL TYPE','CODEBASE AREA'].forEach((h,i)=>{
    const n=g.nodes.find(n=>n.group===i);if(!n)return;
    svg.append('text').attr('font-size','10px').attr('font-family','SF Mono,monospace')
      .attr('fill','#10b981').attr('letter-spacing','.15em')
      .attr('x',n.x0).attr('y',16).text(h);
  });
}

ScrollTrigger.create({trigger:'#sk-wrap',start:'top 85%',once:true,onEnter:draw});
window.addEventListener('resize',()=>{d3.select('#sk').selectAll('*').remove();draw();});

// ── Context Pulse ──────────────────────────────────────────────────────
(function(){

  function barColor(c) {
    return c>30?'#ef4444':c>15?'#f59e0b':c>5?'#06b6d4':'#10b981';
  }

  // ── Animated player ──────────────────────────────────────────────────
  function initPlayer() {
    const wrap = document.getElementById('pulse-wrap');
    const svg  = document.getElementById('pulse-svg');
    const ML=68, MR=24, MT=48, MB=44;
    const PH = 400;

    function build() {
      const W = wrap.clientWidth;
      const H = PH + MT + MB;
      svg.setAttribute('viewBox','0 0 '+W+' '+H);
      svg.setAttribute('height', H);
      const PW = W - ML - MR;
      const sw = PW / CDATA.length;
      const sess = CDATA.map((s,i)=> Object.assign({},s,{sx0:ML+i*sw, sw}));
      const maxCompacts = Math.max(...sess.map(s=>s.compacts));
      const yBase=(MT+PH).toFixed(1);
      const yTop = MT;

      let h = '<defs>'
        +'<clipPath id="rc2"><rect id="rr2" x="'+ML+'" y="0" width="0" height="'+H+'"/></clipPath>'
        +'</defs>';

      // Y-axis labels — 100% stacked, so describe density not count
      h+='<text x="'+(ML-10)+'" y="'+(yTop+4)+'" fill="#64748b" font-size="11" text-anchor="end" font-family="SF Mono,monospace">dense</text>';
      h+='<text x="'+(ML-10)+'" y="'+yBase+'" fill="#64748b" font-size="11" text-anchor="end" font-family="SF Mono,monospace">light</text>';
      h+='<text x="16" y="'+(MT+PH/2)+'" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="SF Mono,monospace" transform="rotate(-90,16,'+(MT+PH/2)+')">Reset Density</text>';

      // Baseline
      h+='<line x1="'+ML+'" y1="'+yBase+'" x2="'+(W-MR)+'" y2="'+yBase+'" stroke="#334155" stroke-width="1"/>';

      // Session separators + labels every 5th
      sess.forEach((s,i)=>{
        h+='<line x1="'+s.sx0.toFixed(1)+'" y1="'+MT+'" x2="'+s.sx0.toFixed(1)+'" y2="'+yBase+'" stroke="#1e2235" stroke-width="0.5"/>';
        if(i%5===0){
          h+='<text x="'+(s.sx0+s.sw/2).toFixed(1)+'" y="'+(H-12)+'" fill="#64748b" font-size="11" text-anchor="middle" font-family="SF Mono,monospace">S'+(i+1)+'</text>';
        }
      });

      // 100% height stacked bars — every session fills full chart height
      // Thin segments = many resets (dense); fat segments = few resets (calm)
      const gap = Math.max(1, sw * 0.12);
      const SEG_GAP = 1;
      const FULL_H = PH * 0.95;
      h += '<g clip-path="url(#rc2)">';
      sess.forEach(s=>{
        const bx = (s.sx0 + gap/2).toFixed(1);
        const bw = Math.max(1, s.sw - gap);
        if(s.compacts === 0) {
          // Zero resets — thin gray baseline tick
          h += '<rect x="'+bx+'" y="'+(parseFloat(yBase)-4).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="4" rx="1" fill="#334155" opacity="0.5"/>';
          return;
        }
        const col = barColor(s.compacts);
        const totalGaps = SEG_GAP * (s.compacts - 1);
        const segH = (FULL_H - totalGaps) / s.compacts;
        for(let j = 0; j < s.compacts; j++) {
          const segY = (parseFloat(yBase) - FULL_H) + j * (segH + SEG_GAP);
          const op = j % 2 === 0 ? '0.85' : '0.55';
          h += '<rect x="'+bx+'" y="'+segY.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+segH.toFixed(1)+'" fill="'+col+'" opacity="'+op+'"/>';
        }
      });
      h += '</g>';

      // S38 annotation — security audit day, 63 resets
      const s38=sess[37];
      if(s38){
        const ax=(s38.sx0+s38.sw/2).toFixed(1);
        const annW=208;
        h+='<line x1="'+ax+'" y1="'+MT+'" x2="'+ax+'" y2="'+yBase+'" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>';
        h+='<rect x="'+(parseFloat(ax)-annW/2)+'" y="'+(MT-30)+'" width="'+annW+'" height="22" rx="4" fill="#1a0505" stroke="#ef4444" stroke-width="1" opacity="0.9"/>';
        h+='<text x="'+ax+'" y="'+(MT-14)+'" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle" font-family="SF Mono,monospace">Security Audit Day \u2014 63 resets</text>';
      }

      // Playhead
      h+='<line id="ph2" x1="'+ML+'" y1="'+MT+'" x2="'+ML+'" y2="'+yBase+'" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>';

      svg.innerHTML = h;

      // Fill bar: progress through current reset cycle (fills up → drops at each reset)
      function getFill(nx) {
        const px = ML + nx * PW;
        const s = sess.find(s=>px>=s.sx0 && px<s.sx0+s.sw) || sess[sess.length-1];
        const sp = Math.max(0, Math.min(1, (px - s.sx0) / s.sw));
        if(!s.positions || s.positions.length === 0) return sp;
        const bounds = [0, ...s.positions, 1.0];
        for(let i = 0; i < bounds.length - 1; i++) {
          if(sp >= bounds[i] && sp < bounds[i+1]) {
            return (sp - bounds[i]) / (bounds[i+1] - bounds[i]);
          }
        }
        return 0;
      }

      // Animation state
      let normX=0, playing=true, speedIdx=0;
      const speeds=[0.25,0.5,1,2,5];
      const BASE=0.00045;

      function getIdx(nx){
        const px=ML+nx*PW;
        const i=sess.findIndex(s=>px>=s.sx0&&px<s.sx0+s.sw);
        return i<0?sess.length-1:i;
      }

      function updateUI(nx){
        const i=getIdx(nx), s=sess[i];
        const c=barColor(s.compacts);
        document.getElementById('pl-num').innerHTML='Session <strong>'+(i+1)+'</strong> / 45';
        document.getElementById('pl-resets').innerHTML='<span style="color:'+c+'">'+s.compacts+'</span>';
        document.getElementById('pl-size').textContent=s.sizeMB.toFixed(0)+' MB';
        document.getElementById('pl-msgs').textContent=s.msgs.toLocaleString();
      }

      (function frame(){
        if(playing){normX+=BASE*speeds[speedIdx]; if(normX>1)normX=0;}
        const px=ML+normX*PW;
        const rr=document.getElementById('rr2'),ph=document.getElementById('ph2');
        if(rr)rr.setAttribute('width',(px-ML).toString());
        if(ph){ph.setAttribute('x1',px.toFixed(1));ph.setAttribute('x2',px.toFixed(1));}
        updateUI(normX);
        requestAnimationFrame(frame);
      })();

      document.getElementById('pl-btn').onclick=()=>{
        playing=!playing;
        document.getElementById('pl-btn').textContent=playing?'\u23f8':'\u25b6';
      };
      document.getElementById('pl-speed').onclick=()=>{
        speedIdx=(speedIdx+1)%speeds.length;
        document.getElementById('pl-speed').textContent=speeds[speedIdx]+'\xd7';
      };
      svg.addEventListener('click',e=>{
        const r=svg.getBoundingClientRect();
        normX=Math.max(0,Math.min(1,(e.clientX-r.left-ML)/PW));
      });
    }

    build();
    window.addEventListener('resize',()=>{svg.innerHTML='';build();});
  }

  ScrollTrigger.create({trigger:'#pulse-wrap',start:'top 85%',once:true,onEnter:initPlayer});
})();
</` + `script>
</body>
</html>`;

writeFileSync('./dist/index.html', html);
console.log('Built: dist/index.html', (html.length/1024).toFixed(1)+'KB');
