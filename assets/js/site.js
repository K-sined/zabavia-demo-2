/* Забавия, вариант 2: анимации и поведение страниц. Без JS весь контент остаётся видимым. */
(function(){
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const G=window.gsap;

 /* QR на коробке ведёт на katalog.html#коллекция: доводим до неё и после загрузки картинок */
 const toHash=()=>{if(!location.hash)return;const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView({behavior:'auto'})};
 addEventListener('load',()=>setTimeout(toHash,60));

 /* меню и шапка */
 const bg=$('#burger'),menu=$('#menu'),top=$('#top');
 const setMenu=on=>{menu.classList.toggle('on',on);bg.setAttribute('aria-expanded',on);bg.setAttribute('aria-label',on?'Закрыть меню':'Открыть меню');document.body.style.overflow=on?'hidden':''};
 bg&&bg.addEventListener('click',()=>setMenu(!menu.classList.contains('on')));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('on'))setMenu(false)});
 const sentry=document.createElement('div');sentry.style.cssText='position:absolute;top:0;height:40px;width:1px';document.body.prepend(sentry);
 new IntersectionObserver(([e])=>top.classList.toggle('solid',!e.isIntersecting)).observe(sentry);

 /* диалог героя */
 const dlg=$('#dlg');
 if(dlg){
  $$('.card').forEach(c=>c.addEventListener('click',()=>{const d=c.dataset;$('#dimg').src=`assets/img/toys/${d.img}.webp`;$('#dimg').alt=d.n;$('#dk').textContent=`${d.c}, ${d.k}`;$('#dn').textContent=d.n;$('#dt').textContent=d.t;$('#dp').textContent=`${d.p} шт. в упаковке`;$('#da').href=`kontakty.html?c=${d.id}`;dlg.showModal()}));
  $('#dlgx').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
 }

 /* форма */
 const f=$('#form');
 if(f){
  const c=new URLSearchParams(location.search).get('c');
  if(c){const box=$(`input[value="${CSS.escape(c)}"]`,f);if(box)box.checked=true}
  f.addEventListener('submit',e=>{e.preventDefault();$('#fok').hidden=false;$('#fok').scrollIntoView({block:'nearest'})});
 }

 if(!G||calm)return;
 G.registerPlugin(ScrollTrigger);
 const EASE='expo.out';

 /* плавная прокрутка только на компьютере */
 if(window.Lenis&&innerWidth>1000){const l=new Lenis({lerp:.11});l.on('scroll',ScrollTrigger.update);G.ticker.add(t=>l.raf(t*1000));G.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=$(a.getAttribute('href'));if(el){e.preventDefault();l.scrollTo(el,{offset:-100})}}))}

 /* заголовки выезжают по словам из-под невидимой кромки; игрушки в заголовке остаются целыми */
 $$('.split').forEach(el=>{
  [...el.childNodes].forEach(n=>{
   if(n.nodeType!==3)return;
   const box=document.createDocumentFragment();
   /* неразрывный пробел остаётся внутри слова: предлог не отрывается */
   n.textContent.split(/( )/).forEach(p=>{
    if(!p)return;
    if(p===' '){box.append(p);return}
    const w=document.createElement('span');w.className='w';w.innerHTML='<span></span>';w.firstChild.textContent=p;box.append(w);
   });
   n.replaceWith(box);
  });
  const inner=$$('.w>span',el),slots=$$('.slot',el);
  const first=el.closest('.hero,.sub,.cont');
  const opt=first?{delay:.12}:{scrollTrigger:{trigger:el,start:'top 88%',once:true}};
  G.from(inner,{yPercent:118,duration:1.25,stagger:.045,ease:EASE,...opt});
  if(slots.length)G.from(slots,{scale:.4,opacity:0,duration:1.05,delay:.55,stagger:.14,ease:'back.out(1.6)'});
 });
 const lead=$$('.hero .lead,.hero .tlink,.hero-k,.sub .lead');
 if(lead.length)G.from(lead,{y:20,opacity:0,duration:1,delay:.55,stagger:.07,ease:EASE});
 /* у кнопки свой CSS-переход по transform: сдвиг GSAP с ним конфликтует, поэтому только прозрачность */
 $$('.hero .btn').forEach(b=>G.from(b,{opacity:0,duration:1,delay:.8,ease:EASE}));

 /* игрушка в заголовке сменяется: полка живёт, размер места не меняется */
 $$('.slot').forEach((s,idx)=>{
  const set=s.dataset.set.split(',');let i=0;
  set.forEach(n=>{new Image().src=`assets/img/toys/${n}.webp`});
  const swap=()=>{
   if(document.hidden)return;
   i=(i+1)%set.length;
   const old=$('img',s),nw=new Image();nw.alt='';nw.src=`assets/img/toys/${set[i]}.webp`;s.append(nw);
   G.set([old,nw],{xPercent:-50,x:0,transformOrigin:'50% 100%'});
   G.to(old,{scale:.6,opacity:0,duration:.45,ease:'power2.in',onComplete:()=>old.remove()});
   G.fromTo(nw,{scale:.55,opacity:0},{scale:1,opacity:1,duration:.75,delay:.28,ease:'back.out(1.8)'});
  };
  setTimeout(()=>setInterval(swap,3000),2600+idx*1500);
 });

 /* появление */
 $$('.rv').forEach(el=>G.from(el,{y:34,opacity:0,duration:1.1,ease:EASE,scrollTrigger:{trigger:el,start:'top 92%',once:true}}));

 /* вклейки проявляются снизу вверх */
 $$('.plate,.duo-a').forEach(el=>{
  const im=$('img',el);
  G.fromTo(el,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.35,ease:'expo.inOut',scrollTrigger:{trigger:el,start:'top 92%',once:true},onComplete:()=>{el.style.clipPath=''}});
  G.from(im,{scale:1.14,duration:1.9,ease:EASE,clearProps:'transform',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
 });

 /* манифест проявляется по словам */
 const w=$('#words');
 if(w){w.innerHTML=w.textContent.split(/\s+/).map(x=>`<span>${x}</span>`).join(' ');
  G.fromTo($$('span',w),{opacity:.16},{opacity:1,stagger:.05,ease:'none',scrollTrigger:{trigger:w,start:'top 80%',end:'bottom 55%',scrub:.5}})}

 /* счётчики */
 $$('.nums [data-n]').forEach(b=>{const n=+b.dataset.n,o={v:0};G.to(o,{v:n,duration:1.5,ease:'power2.out',onUpdate:()=>b.textContent=Math.round(o.v),scrollTrigger:{trigger:b,start:'top 92%',once:true}})});

 /* лист отступает в глубину, когда на него наезжает следующий */
 ScrollTrigger.matchMedia({'(min-width:900px) and (min-height:641px) and (min-aspect-ratio:1/1)':()=>{
  const sh=$$('.sheet');
  sh.forEach((s,i)=>{const next=sh[i+1];if(!next)return;
   G.to($('.sheet-in',s),{scale:.955,ease:'none',scrollTrigger:{trigger:next,start:'top bottom',end:'top top',scrub:true}})});
 }});
 addEventListener('load',()=>ScrollTrigger.refresh());
})();

/* preload-lazy: после загрузки страницы догружаем картинки заранее очередью по 4, в порядке показа на странице.
   Все разом делят канал и приходят одновременно поздно; очередью первые коллекции появляются сразу, дальние — пока смотрят первые. */
window.addEventListener('load',()=>{
  const q=[...document.querySelectorAll('img[loading=lazy]')].filter(i=>!i.complete);
  let active=0;
  const next=()=>{while(active<4&&q.length){const i=q.shift();if(i.complete)continue;active++;const done=()=>{active--;next()};i.addEventListener('load',done,{once:true});i.addEventListener('error',done,{once:true});i.loading='eager'}};
  setTimeout(next,150);
});
