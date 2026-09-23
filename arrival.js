(() => {
  // Full motion is the requested site experience; the visitor can opt out.
  let motionSetting=null;try{motionSetting=localStorage.getItem('survivors-motion-v2');}catch{}
  const reduced={matches:motionSetting==='off'};
  document.body.classList.toggle('motion-enabled',!reduced.matches);
  document.body.classList.toggle('motion-disabled',reduced.matches);
  const motionButton=document.createElement('button');motionButton.className='motion-toggle';motionButton.textContent='Motion: '+(reduced.matches?'Off':'On');
  motionButton.addEventListener('click',()=>{try{localStorage.setItem('survivors-motion-v2',reduced.matches?'on':'off');}catch{}location.reload();});document.body.append(motionButton);
  const phone='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/></svg>';
  const hangup='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16v-4c5-5.3 13-5.3 18 0v4l-5-1v-3a14 14 0 0 0-8 0v3Z"/></svg>';
  const mic='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';

  const dialog=document.createElement('dialog');
  dialog.className='call-intro';
  dialog.setAttribute('aria-labelledby','caller-name');
  dialog.innerHTML=`<div class="call-backdrop"></div><div class="call-grain"></div><div class="call-top mono"><span>THE SURVIVORS / INCOMING SIGNAL</span><button class="call-skip">Skip intro ↗</button></div><div class="call-center"><p class="call-status mono" role="status">INCOMING CALL</p><div class="caller-orbit" aria-hidden="true"><span>?</span></div><h2 id="caller-name">Unknown<span class="caller-strike"></span></h2><p class="call-caption">No caller ID. No way back.</p><div class="call-wave" aria-hidden="true">${Array.from({length:25},(_,i)=>`<i style="--i:${i};--h:${18+(i*17)%60}px"></i>`).join('')}</div><p class="call-clock mono">PRIVATE NUMBER</p><div class="call-actions"><button class="decline-call"><span aria-hidden="true">${hangup}</span>Decline</button><button class="answer-call"><span aria-hidden="true">${phone}</span>Answer</button><button class="mute-call" hidden><span>${mic}</span><b>Mute</b></button><button class="end-call" hidden><span>${hangup}</span>End call</button></div><p class="call-help">Answer to hear a voice from the game. Sound on.</p></div><div class="call-bottom mono"><span>TRANSMISSION / 001</span><span>IDENTITY UNVERIFIED</span></div><audio preload="metadata" src="assets/Unkown-2.mp3"></audio>`;
  document.body.append(dialog);
  const audio=dialog.querySelector('audio');
  const ringtone=new Audio('assets/hazem-ring.mp3');
  ringtone.loop=true;ringtone.preload='metadata';ringtone.volume=.65;ringtone.className='ringtone-audio';dialog.append(ringtone);
  const ringButton=document.createElement('button');ringButton.className='ring-sound';ringButton.textContent='Enable ringtone';ringButton.hidden=true;
  dialog.querySelector('.call-help').after(ringButton);
  let ringRun=0,ringing=false;
  function stopRing(){ringing=false;ringRun++;ringtone.pause();ringtone.currentTime=0;ringButton.hidden=true;}
  async function startRing(){
    const run=++ringRun;ringing=true;
    try{await ringtone.play();if(run!==ringRun){if(!ringing)ringtone.pause();return;}ringButton.hidden=true;}
    catch{if(run===ringRun&&dialog.open&&!closing)ringButton.hidden=false;}
  }
  ringButton.addEventListener('click',startRing);
  const status=dialog.querySelector('.call-status');
  const answer=dialog.querySelector('.answer-call');
  const mute=dialog.querySelector('.mute-call');
  const end=dialog.querySelector('.end-call');
  const decline=dialog.querySelector('.decline-call');
  const help=dialog.querySelector('.call-help');
  let returnFocus=null, closing=false, timer;
  function finish(){
    if(closing)return;closing=true;stopRing();audio.pause();clearTimeout(timer);
    status.textContent='CALL ENDED';dialog.classList.remove('connected');dialog.classList.add('disconnecting');
    try{sessionStorage.setItem('survivors-call-seen','1');}catch{}
    timer=setTimeout(()=>{dialog.close();document.body.style.overflow='';document.body.classList.remove('intro-active');document.body.classList.add('arrival-complete');returnFocus?.focus({preventScroll:true});},reduced.matches?0:850);
  }
  function open(){
    clearTimeout(timer);stopRing();closing=false;returnFocus=document.activeElement;
    audio.pause();audio.currentTime=0;audio.muted=false;mute.querySelector('b').textContent='Mute';mute.setAttribute('aria-pressed','false');
    dialog.classList.remove('connected','disconnecting');status.textContent='INCOMING CALL';
    answer.hidden=decline.hidden=false;mute.hidden=end.hidden=true;answer.disabled=false;
    dialog.querySelector('.call-clock').textContent='PRIVATE NUMBER';help.textContent='Answer to hear a voice from the game. Sound on.';
    document.body.classList.add('intro-active');document.body.classList.remove('arrival-complete');document.body.style.overflow='hidden';dialog.showModal();answer.focus();startRing();
  }
  answer.addEventListener('click',async()=>{
    stopRing();answer.disabled=true;status.textContent='CONNECTING…';
    try{await audio.play();if(closing||!dialog.open){audio.pause();return;}dialog.classList.add('connected');status.textContent='CONNECTED';answer.hidden=decline.hidden=true;mute.hidden=end.hidden=false;help.textContent='Listen closely.';mute.focus();}
    catch{answer.disabled=false;status.textContent='SIGNAL INTERRUPTED';help.textContent='Audio could not start. Try Answer again, or skip to the site.';}
  });
  audio.addEventListener('timeupdate',()=>{if(!dialog.classList.contains('connected'))return;const s=Math.floor(audio.currentTime);dialog.querySelector('.call-clock').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;});
  audio.addEventListener('ended',finish);
  audio.addEventListener('error',()=>{help.textContent='Recording unavailable. You can still enter the story.';});
  mute.addEventListener('click',()=>{audio.muted=!audio.muted;mute.querySelector('b').textContent=audio.muted?'Unmute':'Mute';mute.setAttribute('aria-pressed',String(audio.muted));});
  [decline,end,dialog.querySelector('.call-skip')].forEach(b=>b.addEventListener('click',finish));
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});
  window.addEventListener('pagehide',()=>{stopRing();audio.pause();clearTimeout(timer);});
  dialog.addEventListener('close',()=>{stopRing();audio.pause();});
  const replay=document.createElement('button');replay.className='replay-call';replay.textContent='↺ Replay the call';replay.addEventListener('click',open);document.querySelector('.hero-actions').after(replay);
  let seen=false;try{seen=sessionStorage.getItem('survivors-call-seen')==='1';}catch{}
  if(!seen)open();else document.body.classList.add('arrival-complete');
  if(!reduced.matches&&'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('motion-visible');observer.unobserve(target);}}),{threshold:.15});
    document.querySelectorAll('.gallery-card,.milestone,.story h2,.section-heading h2,.faq-list,.creator-layout h2').forEach((el,i)=>{el.classList.add('motion-ready');el.style.setProperty('--delay',`${(i%3)*130}ms`);observer.observe(el);});
  }
})();
