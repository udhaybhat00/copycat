
// Native details/summary remains usable when JavaScript or animation is unavailable.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const shouldAnimate=()=>!motionPreference.matches&&document.documentElement.dataset.motionPaused!=='true';
const accordionControllers=[];
for(const details of document.querySelectorAll('.faq-items details,.mode-list details')){
  const summary=details.querySelector('summary');
  if(!summary||typeof details.animate!=='function')continue;
  summary.querySelector('span')?.setAttribute('aria-hidden','true');
  const content=document.createElement('div');content.className='accordion-content';
  for(const node of [...details.childNodes])if(node!==summary)content.append(node);
  details.append(content);
  let wanted=details.open,animation=null;
  details.dataset.expanded=String(wanted);
  const settle=()=>{const active=animation;animation=null;if(active)active.cancel();details.open=wanted;details.dataset.expanded=String(wanted);summary.setAttribute('aria-expanded',String(wanted));details.style.height='';details.style.overflow='';};
  function transition(open){
    const start=details.getBoundingClientRect().height;
    wanted=open;
    if(animation){animation.cancel();animation=null;}
    if(!shouldAnimate()){settle();return;}
    details.open=true;details.style.height='';details.style.overflow='hidden';
    const style=getComputedStyle(details);
    const closed=summary.getBoundingClientRect().height+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
    const end=open?details.getBoundingClientRect().height:closed;
    details.dataset.expanded=String(open);summary.setAttribute('aria-expanded',String(open));
    const current=details.animate({height:[start+'px',end+'px']},{duration:Math.min(340,220+Math.abs(end-start)*.35),easing:'cubic-bezier(.22,.68,.25,1)',fill:'both'});
    animation=current;current.onfinish=()=>{if(animation===current)settle();};
  }
  summary.addEventListener('click',event=>{event.preventDefault();transition(!wanted);});
  details.addEventListener('keydown',event=>{if(event.key==='Escape'&&wanted){event.preventDefault();transition(false);summary.focus();}});
  details.addEventListener('toggle',()=>{if(!animation){wanted=details.open;details.dataset.expanded=String(wanted);summary.setAttribute('aria-expanded',String(wanted));}});
  accordionControllers.push({settle,active:()=>Boolean(animation)});
}
const finishAccordions=()=>accordionControllers.forEach(controller=>{if(controller.active())controller.settle();});
addEventListener('resize',finishAccordions,{passive:true});motionPreference.addEventListener('change',finishAccordions);document.getElementById('motion-toggle').addEventListener('click',finishAccordions);

const menuButton=document.querySelector('.menu-toggle'),navigation=document.querySelector('.nav-links'),navigationRoot=document.querySelector('.nav');
navigation.id='primary-navigation';menuButton.setAttribute('aria-controls',navigation.id);
function closeMenu(returnFocus=false){navigationRoot.dataset.menuOpen='false';menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');if(returnFocus)menuButton.focus();}
menuButton.addEventListener('click',()=>{const open=navigationRoot.dataset.menuOpen!=='true';navigationRoot.dataset.menuOpen=String(open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('pointerdown',event=>{if(!navigationRoot.contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigationRoot.dataset.menuOpen==='true')closeMenu(true);});
addEventListener('resize',()=>closeMenu(),{passive:true});closeMenu();

let previouslyVisible=new Set(featureCards);
function animateFeatureResults(){const visible=featureCards.filter(card=>!card.hidden);if(shouldAnimate())visible.filter(card=>!previouslyVisible.has(card)).forEach((card,index)=>card.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,delay:Math.min(index*18,90),easing:'ease-out'}));previouslyVisible=new Set(visible);}
featureSearch.addEventListener('input',animateFeatureResults);featureReset.addEventListener('click',animateFeatureResults);featureFilters.forEach(button=>button.addEventListener('click',animateFeatureResults));
