import { readFileSync, writeFileSync } from 'fs';
const slim = readFileSync('C:/Users/jebus/claude-viz-slim.json', 'utf8');
// Replace real newlines in sankey labels with a space so they're safe to embed
const sankeyRaw = JSON.parse(readFileSync('C:/Users/jebus/claude-sankey.json', 'utf8'));
sankeyRaw.nodes = sankeyRaw.nodes.map(n => ({ ...n, label: n.label.replace(/\n.*/g, '') }));
const sankey = JSON.stringify(sankeyRaw);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Life of Building AthenaForms</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></` + `script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></` + `script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></` + `script>
<script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></` + `script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#07080f;--border:#1e2235;--text:#e2e8f0;--muted:#64748b;--accent:#10b981;--teal:#06b6d4;--green:#10b981;--amber:#f59e0b}
body{background:var(--bg);color:var(--text);font-family:'SF Mono','Cascadia Code',monospace;min-height:100vh}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none}
.hero{padding:64px 56px 56px;border-bottom:1px solid var(--border);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-200px;left:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(16,185,129,.12) 0%,transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(6,182,212,.08) 0%,transparent 70%);pointer-events:none}
.lbl{font-size:11px;letter-spacing:.2em;color:var(--accent);text-transform:uppercase;margin-bottom:12px}
.ttl{font-size:clamp(32px,5vw,58px);font-weight:700;letter-spacing:-.02em;line-height:1.1;font-family:-apple-system,sans-serif;margin-bottom:8px}
.ttl span{color:var(--accent)}
.sub{color:var(--muted);font-size:13px;margin-bottom:48px}
.stats{display:flex;gap:48px;flex-wrap:wrap}
.stat{display:flex;flex-direction:column;gap:4px}
.val{font-size:clamp(28px,3.5vw,44px);font-weight:700;font-family:-apple-system,sans-serif;letter-spacing:-.03em;background:linear-gradient(135deg,var(--text),var(--muted));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.c1{background:linear-gradient(135deg,#34d399,#10b981)!important;-webkit-background-clip:text!important;background-clip:text!important}
.c2{background:linear-gradient(135deg,var(--green),var(--teal))!important;-webkit-background-clip:text!important;background-clip:text!important}
.c3{background:linear-gradient(135deg,var(--amber),#ec4899)!important;-webkit-background-clip:text!important;background-clip:text!important}
.c4{background:linear-gradient(135deg,var(--teal),var(--green))!important;-webkit-background-clip:text!important;background-clip:text!important}
.stat-lbl{font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}
.sk-wrap{padding:56px}
#sk-card{background:#0e1018;border:1px solid #1e2235;border-radius:12px;padding:32px 24px;overflow:hidden}
.slbl{font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.sttl{font-size:20px;font-weight:600;font-family:-apple-system,sans-serif;margin-bottom:4px}
.sdsc{font-size:12px;color:var(--muted);margin-bottom:32px}
#sk{width:100%;display:block;overflow:visible}
#tip{position:fixed;background:#0e1018;border:1px solid #1e2235;border-radius:8px;padding:12px 16px;font-size:12px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:1000;box-shadow:0 8px 32px rgba(0,0,0,.6)}
.tn{color:var(--accent);font-weight:600;margin-bottom:6px}
.tr{display:flex;justify-content:space-between;gap:16px;color:var(--muted)}
.tr span:last-child{color:var(--text)}
footer{border-top:1px solid var(--border);padding:20px 56px;color:var(--muted);font-size:11px;display:flex;justify-content:space-between}
.day-wrap{padding:0 56px 56px}
.day-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.day-card{background:#0e1018;border:1px solid #1e2235;border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:8px;position:relative;overflow:hidden}
.day-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--bar-color,#10b981)}
.day-emoji{font-size:28px;line-height:1;margin-bottom:4px}
.day-val{font-size:22px;font-weight:700;font-family:-apple-system,sans-serif;color:var(--text)}
.day-lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.day-analogy{font-size:12px;color:#475569;margin-top:4px;line-height:1.4}
.day-analogy strong{color:#64748b}
</style>
</head>
<body>
<div class="hero">
  <div class="lbl">Feb 3 → Feb 27, 2026</div>
  <div class="ttl">The Life of Building <span>AthenaForms</span></div>
  <div class="sub">Every conversation, every context reset</div>
  <div class="stats">
    <div class="stat"><div class="val c1" id="s1">0</div><div class="stat-lbl">Sessions</div></div>
    <div class="stat"><div class="val" id="s2">0</div><div class="stat-lbl">Messages</div></div>
    <div class="stat"><div class="val c2" id="s3">0</div><div class="stat-lbl">Records</div></div>
    <div class="stat"><div class="val c3" id="s4">0</div><div class="stat-lbl">Context Resets</div></div>
    <div class="stat"><div class="val c4" id="s5">0</div><div class="stat-lbl">GB of Context</div></div>
    <div class="stat"><div class="val" id="s6">0</div><div class="stat-lbl">Days</div></div>
  </div>
</div>
<div class="day-wrap">
  <div class="slbl" style="margin-bottom:6px">Your Average Day</div>
  <div class="sttl" style="margin-bottom:4px">What building AthenaForms actually looked like</div>
  <div class="sdsc" style="margin-bottom:24px">Across 18 active working days</div>
  <div class="day-grid">
    <div class="day-card" style="--bar-color:#10b981">
      <div class="day-emoji">☕</div>
      <div class="day-val">6.7 hrs</div>
      <div class="day-lbl">Claude active compute/day</div>
      <div class="day-analogy">Equivalent to <strong>a part-time employee</strong> who only codes, never sleeps, and never asks for a raise</div>
    </div>
    <div class="day-card" style="--bar-color:#06b6d4">
      <div class="day-emoji">💬</div>
      <div class="day-val">2,193</div>
      <div class="day-lbl">Your messages/day</div>
      <div class="day-analogy">More than <strong>the entire script of Inception</strong> — typed by you, every single day</div>
    </div>
    <div class="day-card" style="--bar-color:#f59e0b">
      <div class="day-emoji">🧠</div>
      <div class="day-val">21.7×</div>
      <div class="day-lbl">Context resets/day</div>
      <div class="day-analogy">Claude got <strong>total amnesia 22 times a day</strong> and picked back up like nothing happened</div>
    </div>
    <div class="day-card" style="--bar-color:#8b5cf6">
      <div class="day-emoji">📚</div>
      <div class="day-val">46 MB</div>
      <div class="day-lbl">Context generated/day</div>
      <div class="day-analogy">Roughly <strong>23 full novels</strong> worth of conversation — every day — for 18 days straight</div>
    </div>
    <div class="day-card" style="--bar-color:#ec4899">
      <div class="day-emoji">⏱️</div>
      <div class="day-val">48.5 min</div>
      <div class="day-lbl">Longest single turn</div>
      <div class="day-analogy"><strong>Longer than most meetings</strong> that could've been an email — but this one actually shipped code</div>
    </div>
    <div class="day-card" style="--bar-color:#34d399">
      <div class="day-emoji">⚡</div>
      <div class="day-val">3.0 min</div>
      <div class="day-lbl">Avg turn duration</div>
      <div class="day-analogy">Faster than <strong>brewing a cup of coffee</strong> — Claude read, thought, and wrote production code</div>
    </div>
  </div>
</div>
<div class="sk-wrap">
  <div class="slbl">The Flow of Work</div>
  <div class="sttl">How effort moved through the build</div>
  <div class="sdsc">Weeks &rarr; Tool type &rarr; Codebase area &nbsp;&middot;&nbsp; Width = volume &nbsp;&middot;&nbsp; Hover for totals</div>
  <div id="sk-card"><svg id="sk"></svg></div>
</div>
<footer>
  <span>AthenaForms &middot; 45 sessions &middot; 0.87 GB &middot; Feb 3&ndash;27 2026</span>
  <span>AthenaForms &copy; 2026</span>
</footer>
<div id="tip"></div>
<script>
const DATA=${slim};
const SANKEY=${sankey};
</` + `script>
<script>
gsap.registerPlugin(ScrollTrigger);
const sess=DATA.sessions;
function cu(id,val,dec){const el=document.getElementById(id),o={v:0};gsap.to(o,{v:val,duration:2.2,delay:.5,ease:'power2.out',onUpdate(){el.textContent=dec?o.v.toFixed(dec):Math.round(o.v).toLocaleString();}});}
cu('s1',sess.length);
cu('s2',sess.reduce((s,x)=>s+x.userMsgs+x.assistantMsgs,0));
cu('s3',sess.reduce((s,x)=>s+x.records,0));
cu('s4',sess.reduce((s,x)=>s+x.compacts,0));
cu('s5',sess.reduce((s,x)=>s+x.sizeMB,0)/1024,2);
cu('s6',25);
gsap.from('.lbl',{opacity:0,y:16,duration:.6,delay:.1});
gsap.from('.ttl',{opacity:0,y:20,duration:.7,delay:.2});
gsap.from('.sub',{opacity:0,y:16,duration:.6,delay:.3});
gsap.from('.stat',{opacity:0,y:20,duration:.6,delay:.4,stagger:.08});
function tip(e,label,val){const t=document.getElementById('tip');t.innerHTML='<div class="tn">'+label+'</div><div class="tr"><span>Volume</span><span>'+val.toLocaleString()+'</span></div>';t.style.opacity='1';t.style.left=(e.clientX+14)+'px';t.style.top=(e.clientY-14)+'px';}
function ht(){document.getElementById('tip').style.opacity='0';}
function draw(){
  const wrap=document.getElementById('sk').parentElement;
  const W=wrap.clientWidth-180,H=Math.max(460,window.innerHeight*.55);
  const svg=d3.select('#sk').attr('viewBox','0 0 '+W+' '+H).attr('height',H);
  const sk=d3.sankey().nodeWidth(20).nodePadding(20).nodeSort(null).extent([[1,28],[W-1,H-6]]);
  const g=sk({nodes:SANKEY.nodes.map(d=>({...d})),links:SANKEY.links.map(d=>({...d}))});
  const pal=[['#34d399','#10b981','#059669','#6ee7b7','#047857'],['#06b6d4','#10b981','#f59e0b','#8b5cf6','#ec4899','#64748b'],['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7']];
  const col=n=>pal[n.group][n.index%pal[n.group].length];
  const lG=svg.append('g');
  lG.selectAll('path').data(g.links).join('path')
    .attr('fill','none').attr('d',d3.sankeyLinkHorizontal())
    .attr('stroke-width',d=>Math.max(1,d.width))
    .attr('stroke',d=>col(g.nodes[d.source.index]))
    .attr('stroke-opacity',0)
    .on('mouseenter',function(e,d){d3.select(this).attr('stroke-opacity',.55);tip(e,g.nodes[d.source.index].label+' \u2192 '+g.nodes[d.target.index].label,d.value);})
    .on('mouseleave',function(){d3.select(this).attr('stroke-opacity',.18);ht();});
  gsap.to(lG.node().querySelectorAll('path'),{attr:{'stroke-opacity':.18},duration:1.6,stagger:.02,ease:'power2.out',delay:.3});

  // flow dots disabled
  if(false){ // avg turn duration per week (ms) → dot speed
  // group sessions by week, compute mean turn duration
  const weekAvg={};
  function getWk(iso){if(!iso)return null;const d=new Date(iso).getDate();if(d<=7)return'Week 1';if(d<=12)return'Week 2';if(d<=17)return'Week 3';if(d<=22)return'Week 4';return'Week 5';}
  DATA.sessions.forEach(s=>{
    const wk=getWk(s.start);if(!wk||!s.turns||!s.turns.length)return;
    if(!weekAvg[wk]){weekAvg[wk]={sum:0,count:0};}
    s.turns.forEach(t=>{weekAvg[wk].sum+=t;weekAvg[wk].count++;});
  });
  // ms → seconds for animation. longer avg turn = slower dots (more thinking)
  // clamp to 6–18s range
  const avgMs=Object.fromEntries(Object.entries(weekAvg).map(([k,v])=>[k,v.sum/v.count]));
  const minMs=Math.min(...Object.values(avgMs)),maxMs=Math.max(...Object.values(avgMs));
  const weekSpeed=k=>{const ms=avgMs[k]||minMs;return 6+((ms-minMs)/(maxMs-minMs||1))*12;};

  // animated flow dots (round linecap + tiny dashLen = circles)
  const fG=svg.append('g').attr('pointer-events','none');
  g.links.forEach((d,i)=>{
    const pathEl=lG.node().querySelectorAll('path')[i];
    if(!pathEl) return;
    const len=pathEl.getTotalLength()||200;
    const srcLabel=g.nodes[d.source.index].label;
    const dotR=Math.max(2, d.width*0.28);
    const gap=Math.max(50, len*0.2);
    const speed=weekSpeed(srcLabel);
    fG.append('path')
      .attr('fill','none')
      .attr('d', d3.sankeyLinkHorizontal()(d))
      .attr('stroke', col(g.nodes[d.source.index]))
      .attr('stroke-width', dotR*2)
      .attr('stroke-opacity', 0.75)
      .attr('stroke-linecap','round')
      .attr('stroke-dasharray', '1 '+gap)
      .attr('stroke-dashoffset', 0)
      .each(function() {
        const el=this;
        function animate() {
          d3.select(el)
            .attr('stroke-dashoffset', 0)
            .transition().duration(speed*1000).ease(d3.easeLinear)
            .attr('stroke-dashoffset', -(len+gap))
            .on('end', animate);
        }
        setTimeout(animate, i*180+(Math.random()*gap*10));
      });
  }); }
  const nG=svg.append('g');
  const ns=nG.selectAll('g').data(g.nodes).join('g')
    .attr('transform',d=>'translate('+d.x0+','+d.y0+')').attr('opacity',0);
  ns.append('rect').attr('height',d=>Math.max(2,d.y1-d.y0)).attr('width',d=>d.x1-d.x0).attr('fill',col).attr('rx',4).attr('opacity',.88);
  ns.append('text').attr('fill','#94a3b8').attr('font-size','11px').attr('font-family','SF Mono,monospace')
    .attr('x',d=>d.x0<W/2?(d.x1-d.x0)+10:-10)
    .attr('text-anchor',d=>d.x0<W/2?'start':'end')
    .attr('y',d=>(d.y1-d.y0)/2)
    .each(function(d){
      const lines=[d.label],el=d3.select(this);
      if(lines.length===1){el.attr('dy','.35em').text(lines[0]);return;}
      lines.forEach((l,i)=>el.append('tspan').text(l).attr('x',d.x0<W/2?(d.x1-d.x0)+10:-10).attr('dy',i===0?'-.25em':'1.15em'));
    });
  ns.on('mouseenter',(e,d)=>tip(e,d.label,d.value)).on('mouseleave',ht);
  gsap.to(nG.node().querySelectorAll('g'),{opacity:1,duration:.7,stagger:.05,ease:'power2.out',delay:.1});
  ['WEEKS','TOOL TYPE','CODEBASE AREA'].forEach((h,i)=>{
    const n=g.nodes.find(n=>n.group===i);if(!n)return;
    svg.append('text').attr('font-size','10px').attr('font-family','SF Mono,monospace').attr('fill','#6366f1').attr('letter-spacing','.12em').attr('x',n.x0).attr('y',16).text(h);
  });
}
gsap.from('.slbl,.sttl,.sdsc',{opacity:0,y:20,duration:.7,stagger:.1,scrollTrigger:{trigger:'.sk-wrap',start:'top 85%',once:true}});
ScrollTrigger.create({trigger:'.sk-wrap',start:'top 75%',once:true,onEnter:draw});
window.addEventListener('resize',()=>{d3.select('#sk').selectAll('*').remove();draw();});
</` + `script>
</body>
</html>`;

writeFileSync('C:/Users/jebus/athenaforms-life.html', html);
console.log('Done:', (html.length/1024).toFixed(1), 'KB');
