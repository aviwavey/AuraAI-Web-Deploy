// The hosted Visual shell shares the Aura website's appearance preference.
(()=>{
 const root=document.documentElement,key='aura-public-appearance',media=matchMedia('(prefers-color-scheme: dark)');
 function apply(){let mode='auto';try{mode=localStorage.getItem(key)||'auto';}catch{}const resolved=mode==='light'||mode==='dark'?mode:(media.matches?'dark':'light');root.dataset.auraResolved=resolved;root.style.colorScheme=resolved;}
 apply();media.addEventListener('change',apply);window.addEventListener('storage',apply);window.addEventListener('aura-appearance-change',apply);window.addEventListener('pageshow',apply);
})();
