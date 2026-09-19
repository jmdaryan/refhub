let DATA=null;
let mode='rules';
let slides=[];
let current=0;
let touchStartX=null;

const $=id=>document.getElementById(id);

async function loadData(){
  const r=await fetch('data/content.json');
  DATA=await r.json();
}

function cleanTitle(t){return (t||'').replace(/\.{2,}\s*\d+\s*$/,'').replace(/\s+/g,' ').trim()}
function cleanText(t){return (t||'').replace(/\n{3,}/g,'\n\n').trim()}
function firstParagraph(t){let s=cleanText(t);let parts=s.split(/\n\s*\n|(?<=\.)\s+(?=[A-Z])/);return (parts[0]||s).slice(0,520)}
function category(n){
 const map={1:'FOUNDATIONS',2:'COURT & EQUIPMENT',3:'COURT & EQUIPMENT',4:'TEAMS',5:'PLAYERS',6:'TEAM OFFICIALS',7:'TEAM OFFICIALS',8:'GAME ADMINISTRATION',9:'GAME ADMINISTRATION',10:'THE BALL',11:'LOCATION',12:'GAME ADMINISTRATION',13:'THE BALL',14:'THE BALL',15:'SHOOTING',16:'SCORING',17:'THROW-IN',18:'GAME ADMINISTRATION',19:'GAME ADMINISTRATION',22:'VIOLATIONS',23:'VIOLATIONS',24:'VIOLATIONS',25:'VIOLATIONS',26:'VIOLATIONS',27:'VIOLATIONS',28:'VIOLATIONS',29:'VIOLATIONS',30:'VIOLATIONS',31:'VIOLATIONS',33:'FOULS',34:'FOULS',35:'FOULS',36:'FOULS',37:'FOULS',38:'FOULS',39:'FOULS',40:'FOULS',41:'FOULS',42:'GAME ADMINISTRATION',43:'SPECIAL SITUATIONS',44:'REFEREES',45:'REFEREES'};
 return map[n]||'OFFICIAL RULES';
}
function visualSVG(n,type='rule'){
 const c=['#ff6b2c','#5aa7ff','#65d8a2'][n%3];
 if([2,3,11,12,17,23,28,29,30].includes(n)) return `<svg viewBox="0 0 520 360" width="90%" aria-label="basketball court illustration"><rect x="55" y="35" width="410" height="290" rx="8" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="4"/><path d="M55 180h410M260 35v290" stroke="rgba(255,255,255,.18)" stroke-width="3"/><circle cx="260" cy="180" r="48" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3"/><rect x="55" y="105" width="85" height="150" fill="none" stroke="${c}" stroke-width="5"/><rect x="380" y="105" width="85" height="150" fill="none" stroke="${c}" stroke-width="5"/><circle cx="120" cy="180" r="10" fill="${c}"/><circle cx="400" cy="180" r="10" fill="${c}"/><circle cx="325" cy="125" r="10" fill="#fff"/><path d="M325 125 Q360 170 320 225" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/></svg>`;
 if([34,35,36,37,38,39,40].includes(n)) return `<svg viewBox="0 0 520 360" width="88%"><circle cx="260" cy="170" r="95" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="26"/><circle cx="260" cy="170" r="95" fill="none" stroke="${c}" stroke-width="7" stroke-dasharray="210 390" transform="rotate(-40 260 170)"/><circle cx="220" cy="145" r="28" fill="#c98d69"/><path d="M190 220 Q220 170 250 205 L300 235" fill="none" stroke="#e8edf5" stroke-width="25" stroke-linecap="round"/><path d="M315 115 L365 75 M315 120 L375 120" stroke="${c}" stroke-width="7" stroke-linecap="round"/><text x="260" y="320" text-anchor="middle" fill="rgba(255,255,255,.5)" font-size="15" font-family="sans-serif">CONTACT • DECISION • CONTROL</text></svg>`;
 if(n===1) return `<svg viewBox="0 0 520 360" width="90%"><circle cx="260" cy="175" r="130" fill="none" stroke="${c}" stroke-width="4"/><path d="M80 175h360M260 45v260" stroke="rgba(255,255,255,.15)" stroke-width="2"/><text x="260" y="172" text-anchor="middle" fill="#fff" font-size="42" font-weight="800">RULE 01</text><text x="260" y="205" text-anchor="middle" fill="rgba(255,255,255,.5)" font-size="14">DEFINITIONS</text></svg>`;
 return `<svg viewBox="0 0 520 360" width="82%"><circle cx="260" cy="170" r="92" fill="${c}" opacity=".14"/><circle cx="260" cy="170" r="70" fill="none" stroke="${c}" stroke-width="3"/><circle cx="260" cy="170" r="48" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3"/><path d="M220 115 Q260 85 300 115 M220 225 Q260 255 300 225" fill="none" stroke="#fff" stroke-width="5"/><circle cx="225" cy="165" r="8" fill="#fff"/><circle cx="295" cy="165" r="8" fill="#fff"/><text x="260" y="310" text-anchor="middle" fill="rgba(255,255,255,.45)" font-size="13">READ • SEE • APPLY</text></svg>`;
}

function makeSlides(items,type){
 let out=[];
 items.forEach((a,i)=>{
   const title=cleanTitle(a.title)||`Article ${a.number}`;
   const text=cleanText(a.text);
   out.push({kind:'intro',article:a,title,text,type,index:i,category:category(a.number)});
   out.push({kind:'rule',article:a,title,text,type,index:i,category:category(a.number)});
   out.push({kind:'practice',article:a,title,text,type,index:i,category:category(a.number)});
 });
 return out;
}

function chapterGroups(items){
 const groups={}; items.forEach(a=>{let c=category(a.number);(groups[c]??=[]).push(a)}); return groups;
}

function buildNav(){
 const items=DATA[mode].articles; const groups=chapterGroups(items); let html='';
 Object.entries(groups).forEach(([name,arr])=>{
   html+=`<div class="chapter"><div class="chapter-title">${name}</div>`;
   arr.forEach(a=>{let idx=slides.findIndex(s=>s.article.number===a.number&&s.kind==='intro');html+=`<button class="lesson-link" data-slide="${idx}" onclick="jumpTo(${idx})"><span class="n">${String(a.number).padStart(2,'0')}</span><span>${cleanTitle(a.title)}</span></button>`});
   html+='</div>';
 });
 $('chapterList').innerHTML=html;
}

function start(type='rules'){mode=type;slides=makeSlides(DATA[mode].articles,mode);current=0;$('home').classList.add('hidden');$('course').classList.remove('hidden');$('navMode').textContent=mode==='rules'?'RULES 2026':'INTERPRETATIONS 2026';buildNav();render();window.scrollTo(0,0)}
function startCourse(){start('rules')}
function startInterpretations(){start('interpretations')}
function goHome(){$('course').classList.add('hidden');$('home').classList.remove('hidden');window.scrollTo(0,0)}
function openLibrary(){start('rules');setTimeout(()=>jumpTo(1),50)}

function render(){
 const s=slides[current]; const total=slides.length;
 $('lessonIndex').textContent=`${String(current+1).padStart(2,'0')} / ${total}`;
 $('lessonType').textContent=s.type==='rules'?'OFFICIAL RULE':'OFFICIAL INTERPRETATION';
 let html='';
 if(s.kind==='intro') html=`<div class="slide-grid"><div class="slide-copy"><div class="kicker">${s.category} • ARTICLE ${s.article.number}</div><h2>${s.title.split(':')[0]}${s.title.includes(':')?`<br><span>${s.title.split(':').slice(1).join(':')}</span>`:''}</h2><p class="lead">${firstParagraph(s.text)}</p><span class="rule-chip">صفحه آموزشی ${s.index+1}</span></div><div class="visual-card"><span class="visual-label">VISUAL GUIDE</span>${visualSVG(s.article.number,s.type)}<span class="visual-number">${String(s.article.number).padStart(2,'0')}</span></div></div>`;
 else if(s.kind==='rule') html=`<div class="full-rule"><div class="rule-head"><div><span>${s.type==='rules'?'FIBA OFFICIAL BASKETBALL RULES 2026':'FIBA OFFICIAL BASKETBALL RULES INTERPRETATIONS 2026'}</span><h3>Article ${s.article.number} — ${s.title}</h3></div><span>${s.category}</span></div><div class="rule-text">${escapeHTML(s.text)}</div><div class="rule-foot">این متن از سند آموزشی بارگذاری‌شده استخراج شده است. برای نسخه رسمی و کامل، PDF را از کتابخانه باز کنید.</div></div>`;
 else html=`<div class="situation"><div class="scenario"><div class="q">THINK LIKE A REFEREE</div><h2>حالا این قانون را در زمین ببین.</h2><p>قبل از تصمیم‌گیری، به متن ماده نگاه کن و از خودت بپرس: «چه چیزی واقعاً اتفاق افتاده؟ کدام بازیکن کنترل دارد؟ وضعیت توپ چیست؟ و تصمیم من باید بر اساس کدام ماده باشد؟»</p><div class="rule-chip">Article ${s.article.number} • ${s.title}</div></div><div class="answer-card"><b>CLASSROOM CHECK</b><h3>قانون را به تصمیم تبدیل کن.</h3><p>یک موقعیت واقعی یا ویدئو پیدا کن و تصمیم را با شماره ماده ثبت کن. بعد، تفسیر رسمی مرتبط را جست‌وجو کن. در مراحل بعدی دوره، IOT و 3PO هم به همین صفحه اضافه می‌شوند.</p><button class="primary-btn" style="margin-top:12px" onclick="openSearchFor('${escapeAttr(s.title)}')">جستجوی این موضوع ←</button></div></div>`;
 $('slide').classList.remove('enter');void $('slide').offsetWidth;$('slide').classList.add('enter');$('slide').innerHTML=html;
 $('prevBtn').disabled=current===0;$('nextBtn').disabled=current===total-1;$('prevBtn').style.opacity=current===0?.45:1;$('nextBtn').style.opacity=current===total-1?.45:1;
 $('dots').style.setProperty('--progress',`${((current+1)/total)*100}%`);
 document.querySelectorAll('.lesson-link').forEach(x=>x.classList.toggle('active',Number(x.dataset.slide)===current));
 const active=document.querySelector('.lesson-link.active');if(active)active.scrollIntoView({block:'nearest'});
 $('navProgress').style.width=`${((current+1)/total)*100}%`;
}
function escapeHTML(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function escapeAttr(s){return String(s).replace(/'/g,"\\'")}
function nextSlide(){if(current<slides.length-1){current++;render()}}
function prevSlide(){if(current>0){current--;render()}}
function jumpTo(i){current=i;render();if(window.innerWidth<1050)$('courseNav').classList.remove('open')}
function toggleNav(){$('courseNav').classList.toggle('open')}

function openSearch(){ $('searchOverlay').classList.remove('hidden');$('searchInput').focus() }
function closeSearch(){ $('searchOverlay').classList.add('hidden') }
function openSearchFor(q){openSearch();$('searchInput').value=q;runSearch(q)}
function runSearch(q){
 q=q.toLowerCase().trim();let all=[...(DATA.rules.articles||[]).map(a=>({...a,type:'rules'})),...(DATA.interpretations.articles||[]).map(a=>({...a,type:'interpretations'}))];
 let results=all.filter(a=>(a.title+' '+a.text).toLowerCase().includes(q)).slice(0,15);
 $('searchResults').innerHTML=results.length?results.map(a=>`<div class="result" onclick="start('${a.type}');setTimeout(()=>{let i=slides.findIndex(s=>s.article.number===${a.number}&&s.kind==='intro');jumpTo(i)},20)"><div><b>Article ${a.number} — ${cleanTitle(a.title)}</b><small>${a.type==='rules'?'Official Rule':'Interpretation'}</small></div><span>→</span></div>`).join(''):`<div style="padding:25px;color:var(--muted);font-size:13px">نتیجه‌ای پیدا نشد.</div>`;
}

$('searchBtn').onclick=openSearch;$('themeBtn').onclick=()=>document.body.classList.toggle('light');$('menuBtn').onclick=toggleNav;
$('searchInput').addEventListener('input',e=>runSearch(e.target.value));
$('searchOverlay').addEventListener('click',e=>{if(e.target.id==='searchOverlay')closeSearch()});
document.addEventListener('keydown',e=>{if($('course').classList.contains('hidden'))return;if(e.key==='ArrowLeft')nextSlide();if(e.key==='ArrowRight')prevSlide();if(e.key==='Escape')closeSearch()});
document.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{if(touchStartX==null||$('course').classList.contains('hidden'))return;let dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>60){dx<0?nextSlide():prevSlide()}touchStartX=null},{passive:true});

loadData().catch(err=>{console.error(err);$('slide').innerHTML='<div class="info-card"><h3>خطا در بارگذاری</h3><p>فایل data/content.json پیدا نشد. مطمئن شوید پوشه data کنار index.html آپلود شده است.</p></div>'});
