const KEY="cypher4_state_v1";
const DOMAINS=["Cybersecurity","AI/ML","Full Stack","Cloud","System Software"];
const initial={settings:{running:false,seconds:64800},judges:[],submissions:[],studentAccounts:[],orgCode:"CYPHER-ADMIN"};
let state=JSON.parse(localStorage.getItem(KEY)||"null")||structuredClone(initial);
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const app=document.querySelector("#app");
let timer;

function nav(){return `<nav class="nav"><div class="brand">CYPHER 4.0</div><div class="navlinks">
<button onclick="go('home')">Home</button><button onclick="go('organizer')">Organizer</button><button onclick="go('results')">Results</button></div></nav>`}
function shell(content){return `<div class="wrap">${nav()}${content}<div class="footer">CYPHER 4.0 · local backup mode</div></div>`}
function go(page,id){location.hash=page+(id?`/${id}`:""); render()}
function fmt(s){s=Math.max(0,s);let h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return [h,m,x].map(v=>String(v).padStart(2,"0")).join(":")}
function tick(){if(state.settings.running&&state.settings.seconds>0){state.settings.seconds--;save();let e=document.querySelector("#digits");if(e)e.textContent=fmt(state.settings.seconds)}}
setInterval(tick,1000);

function home(){return shell(`<section class="hero"><div class="eyebrow">18-hour hackathon</div><h1>CYPHER 4.0</h1><p>Build. Break. Defend. Ship.</p>
<div class="timer"><div class="eyebrow">${state.settings.running?"SUBMISSIONS OPEN":"SUBMISSIONS CLOSED"}</div><div id="digits" class="digits">${fmt(state.settings.seconds)}</div></div>
<div class="cards"><div class="card action" onclick="go('student')"><h3>Join as Student</h3><p class="muted">Sign in and submit your project.</p></div><div class="card action" onclick="go('judge')"><h3>Join as Judge</h3><p class="muted">Enter your assigned judge profile.</p></div></div></section>`)}

function student(){
return shell(`<section class="section"><div class="eyebrow">STUDENT SUBMISSION</div><h1>Submit your project</h1>
${!state.settings.running?`<div class="notice dangerText">Submissions are currently closed by the organizer.</div>`:""}
<div class="card"><form onsubmit="submitStudent(event)">
<label>Google account email (temporary local testing)</label><input id="semail" type="email" placeholder="student@example.com" required>
<label>Team name</label><input id="team" required><label>Project name</label><input id="project" required>
<label>Team members</label><input id="members" placeholder="Names separated by commas">
<label>Technology / Domain</label><select id="domain" required>${DOMAINS.map(x=>`<option>${x}</option>`).join("")}</select>
<label>Project description</label><textarea id="desc" required></textarea>
<label>PPT / PDF file</label><input id="ppt" type="file" accept=".pdf,.ppt,.pptx" required>
<label>GitHub repository</label><input id="github" type="url" placeholder="https://github.com/..." required>
<label>Deployed link</label><input id="demo" type="url" placeholder="https://..." required>
<button ${state.settings.running?"":"disabled"}>${state.settings.running?"Submit project":"Submissions closed"}</button>
</form></div></section>`)}

function submitStudent(e){e.preventDefault();if(!state.settings.running)return alert("Submissions are closed.");let email=semail.value.trim().toLowerCase();if(state.studentAccounts.includes(email))return alert("This Google account has already submitted.");let s={id:crypto.randomUUID(),email,team:team.value,project:project.value,members:members.value,domain:domain.value,desc:desc.value,ppt:ppt.files[0]?.name||"",github:github.value,demo:demo.value,judgeScores:{},total:0,status:"Pending",createdAt:new Date().toISOString()};state.submissions.push(s);state.studentAccounts.push(email);save();alert("Submission saved locally.");go("home")}

function judge(){
let cards=state.judges.map(j=>`<div class="item row"><div><b>${esc(j.name)}</b><div class="muted small">${esc(j.domain)}</div></div><button class="btn secondary" onclick="go('judge-login','${j.id}')">Enter</button></div>`).join("");
return shell(`<section class="section"><div class="eyebrow">JUDGE ACCESS</div><h1>Choose your evaluator profile</h1>${cards||`<div class="notice">No judges allotted yet. The organizer has not created any judges.</div>`}</section>`)}

function judgeLogin(id){let j=state.judges.find(x=>x.id===id);return shell(`<section class="section"><div class="eyebrow">JUDGE ACCESS</div><h1>${esc(j?.name||"Judge")}</h1><div class="card"><p class="muted">Domain: ${esc(j?.domain||"")}</p><form onsubmit="enterJudge(event,'${id}')"><label>Access code</label><input id="jcode" required><button>Enter judge portal</button></form></div></section>`)}
function enterJudge(e,id){e.preventDefault();let j=state.judges.find(x=>x.id===id);if(!j||j.code!==jcode.value.trim())return alert("Invalid access code.");sessionStorage.setItem("judgeId",id);go("judge-dashboard")}

function judgeDashboard(){let j=state.judges.find(x=>x.id===sessionStorage.getItem("judgeId"));if(!j)return go("judge");let subs=state.submissions.filter(s=>s.domain===j.domain);return shell(`<section class="section"><div class="eyebrow">JUDGE · ${esc(j.domain)}</div><h1>${esc(j.name)}'s projects</h1><div class="list">${subs.map(s=>{let done=s.judgeScores[j.id];return `<div class="item row"><div><b>${esc(s.project)}</b><div class="muted">${esc(s.team)} · ${esc(s.domain)}</div></div><div>${done?'<span class="ok">✓ Reviewed</span>': '<span class="pill">Pending</span>'} <button class="btn secondary" onclick="go('evaluate','${s.id}')">Open</button></div></div>`}).join("")||`<div class="notice">No projects currently match your assigned domain.</div>`}</div></section>`)}

function evaluate(id){let j=state.judges.find(x=>x.id===sessionStorage.getItem("judgeId")),s=state.submissions.find(x=>x.id===id);if(!j||!s)return go("judge");let old=s.judgeScores[j.id]||{};return shell(`<section class="section"><div class="eyebrow">PROJECT REVIEW</div><h1>${esc(s.project)}</h1><div class="project-layout"><div class="card"><div class="eyebrow">PROJECT</div><h2>${esc(s.team)}</h2><p class="muted">${esc(s.desc)}</p><p>Domain: <span class="pill">${esc(s.domain)}</span></p><p>GitHub: <a href="${esc(s.github)}" target="_blank">${esc(s.github)}</a></p><p>Demo: <a href="${esc(s.demo)}" target="_blank">${esc(s.demo)}</a></p><p>PPT/PDF: ${esc(s.ppt||"Not supplied")}</p></div><div class="card"><div class="eyebrow">SUMMARY</div><p class="muted">AI project summary will be connected here later.</p></div></div>
<div class="card section"><div class="eyebrow">EVALUATION · /50</div><form onsubmit="saveScore(event,'${id}')"><div class="criteria">${["Innovation","Technical","Impact","Usability","Presentation"].map(k=>`<div><label>${k}</label><input id="sc_${k}" type="number" min="0" max="10" value="${old[k]??""}" required></div>`).join("")}</div><div style="margin-top:18px"><button>Submit evaluation</button></div></form></div></section>`)}

function saveScore(e,id){e.preventDefault();let j=state.judges.find(x=>x.id===sessionStorage.getItem("judgeId")),s=state.submissions.find(x=>x.id===id);let scores={};["Innovation","Technical","Impact","Usability","Presentation"].forEach(k=>scores[k]=Number(document.querySelector("#sc_"+k).value));scores.total=Object.values(scores).reduce((a,b)=>a+b,0);s.judgeScores[j.id]=scores;s.total=Object.values(s.judgeScores).reduce((max,x)=>Math.max(max,x.total||0),0);s.status="Reviewed";save();alert("Evaluation saved.");go("judge-dashboard")}

function organizer(){return shell(`<section class="section"><div class="eyebrow">ORGANIZER CONTROL</div><h1>Organizer panel</h1><div class="grid"><div class="card"><h3>Timer</h3><div class="digits">${fmt(state.settings.seconds)}</div><p class="muted">${state.settings.running?"Students can submit.":"Student submissions are closed. Judges remain active."}</p><div class="row"><button onclick="startTimer()">Start</button><button class="btn danger" onclick="stopTimer()">Stop</button></div></div><div class="card"><h3>Create Judge</h3><form onsubmit="createJudge(event)"><label>Judge name</label><input id="jn" required><label>Domain</label><select id="jd">${DOMAINS.map(x=>`<option>${x}</option>`).join("")}</select><label>Access code</label><input id="jc" required><button>Create Judge</button></form></div></div>
<div class="section"><h2>Active evaluators</h2><div class="list">${state.judges.map(j=>`<div class="item row"><div><b>${esc(j.name)}</b><div class="muted">${esc(j.domain)}</div></div><span class="pill">${esc(j.code)}</span></div>`).join("")||`<div class="notice">No judges created yet.</div>`}</div></div>
<div class="section"><div class="row"><h2>Submissions</h2><div><button class="btn secondary" onclick="downloadCSV('submissions')">Export CSV</button><button class="btn secondary" onclick="downloadCSV('results')">Results CSV</button></div></div><div class="list">${state.submissions.map(s=>`<div class="item row"><div><b>${esc(s.project)}</b><div class="muted">${esc(s.team)} · ${esc(s.domain)}</div></div><span>${s.status==="Reviewed"?'<span class="ok">✓</span>':'<span class="warn">Pending</span>'}</span></div>`).join("")||`<div class="notice">No submissions yet.</div>`}</div></div></section>`)}

function startTimer(){state.settings.running=true;save();render()}
function stopTimer(){state.settings.running=false;save();render()}
function createJudge(e){e.preventDefault();state.judges.push({id:crypto.randomUUID(),name:jn.value.trim(),domain:jd.value,code:jc.value.trim()});save();alert("Judge created.");render()}

function results(){let ranked=[...state.submissions].sort((a,b)=>(b.total||0)-(a.total||0));return shell(`<section class="section"><div class="eyebrow">PUBLIC RESULTS</div><h1>Final ranking</h1><div class="list">${ranked.map((s,i)=>`<div class="item row"><div class="row"><div class="rank">${i+1}</div><div><b>${esc(s.team)}</b><div class="muted">${esc(s.project)}</div></div></div><span class="pill">Rank ${i+1}</span></div>`).join("")||`<div class="notice">Results will appear after submissions are judged.</div>`}</div></section>`)}

function downloadCSV(kind){let rows;if(kind==="results"){rows=[["Rank","Team Name"],...[...state.submissions].sort((a,b)=>b.total-a.total).map((s,i)=>[i+1,s.team])]}else{rows=[["Team","Project","Domain","GitHub","Demo","Judge","Innovation","Technical","Impact","Usability","Presentation","Total","Status"],...state.submissions.map(s=>{let jids=Object.keys(s.judgeScores);let j=jids[0]?state.judges.find(x=>x.id===jids[0]):null;let sc=jids[0]?s.judgeScores[jids[0]]:{};return [s.team,s.project,s.domain,s.github,s.demo,j?.name||"",sc.Innovation??"",sc.Technical??"",sc.Impact??"",sc.Usability??"",sc.Presentation??"",s.total||0,s.status]})]};let csv=rows.map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(",")).join("\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=kind==="results"?"cypher_results.csv":"cypher_submissions.csv";a.click();URL.revokeObjectURL(a.href)}

function organizerLogin(){return shell(`<section class="section"><div class="eyebrow">ORGANIZER</div><h1>Organizer access</h1><div class="card"><form onsubmit="enterOrg(event)"><label>Organizer code</label><input id="ocode" required><button>Enter organizer panel</button></form></div></section>`)}
function enterOrg(e){e.preventDefault();if(ocode.value.trim()!==state.orgCode)return alert("Invalid organizer code.");sessionStorage.setItem("org","1");go("organizer-dashboard")}
function route(){let [p,id]=location.hash.slice(1).split("/");if(p==="student")return student();if(p==="judge")return judge();if(p==="judge-login")return judgeLogin(id);if(p==="judge-dashboard")return judgeDashboard();if(p==="evaluate")return evaluate(id);if(p==="organizer")return organizerLogin();if(p==="organizer-dashboard"){if(sessionStorage.getItem("org"))return organizer();return organizerLogin()}if(p==="results")return results();return home()}
function render(){app.innerHTML=route()}
window.go=go;window.submitStudent=submitStudent;window.enterJudge=enterJudge;window.saveScore=saveScore;window.startTimer=startTimer;window.stopTimer=stopTimer;window.createJudge=createJudge;window.enterOrg=enterOrg;window.downloadCSV=downloadCSV;
render();
