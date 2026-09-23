(() => {
  const cards=[...document.querySelectorAll('[data-memory]')];
  const dialog=document.createElement('dialog');
  dialog.className='memory-reader';dialog.setAttribute('aria-labelledby','memory-reader-title');
  dialog.innerHTML='<div class="memory-reader-bar"><div><small class="mono">RECOVERED MEMORY</small><h2 id="memory-reader-title"></h2></div><button aria-label="Close memory">×</button></div><p class="memory-reader-hint">Scroll to read the complete post and comments.</p><img class="memory-full" alt="">';
  document.body.append(dialog);
  let trigger,oldOverflow;
  cards.forEach(card=>card.addEventListener('click',()=>{
    trigger=card;
    dialog.querySelector('.memory-full')?.remove();
    const isVideo=Boolean(card.dataset.video);
    const media=document.createElement(isVideo?'video':'img');media.className='memory-full';
    if(isVideo){media.src=card.dataset.video;media.controls=true;media.playsInline=true;media.preload='metadata';media.setAttribute('aria-label',"Mirihan's video message, 2016");}
    else{const source=card.querySelector('img');media.src=source.getAttribute('src');media.alt=source.alt;}
    dialog.append(media);
    dialog.querySelector('.memory-reader-hint').textContent=isVideo?'Mirihan · A message from 2016.':'Scroll to read the complete post and comments.';
    dialog.querySelector('h2').textContent=card.querySelector('strong').textContent;
    oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();dialog.scrollTop=0;
  }));
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{dialog.querySelector('video')?.pause();document.body.style.overflow=oldOverflow||'';trigger?.focus({preventScroll:true});});
  window.addEventListener('pagehide',()=>dialog.querySelector('video')?.pause());
})();
