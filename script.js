const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.08});document.querySelectorAll('.hero-copy,.portrait-area').forEach(e=>{e.classList.add('reveal');observer.observe(e)});

const lightbox=document.getElementById('lightbox');const lightboxImage=document.getElementById('lightbox-image');const counter=document.getElementById('lightbox-counter');const prevBtn=document.querySelector('.lightbox-prev');const nextBtn=document.querySelector('.lightbox-next');let gallery=[];let galleryIndex=0;let lastTrigger=null;
function showGalleryImage(){if(!gallery.length)return;lightboxImage.src=gallery[galleryIndex];counter.textContent=gallery.length>1?`${galleryIndex+1} / ${gallery.length}`:'PROJECT VIEW';prevBtn.style.display=gallery.length>1?'block':'none';nextBtn.style.display=gallery.length>1?'block':'none'}
function openCard(card){try{gallery=JSON.parse(card.dataset.gallery||'[]')}catch{gallery=[]}if(!gallery.length)return;lastTrigger=card;galleryIndex=0;showGalleryImage();lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';document.querySelector('.lightbox-close').focus()}
window.initializeProjectCards=function(){document.querySelectorAll('.project-card-image').forEach(card=>{if(card.dataset.bound)return;card.dataset.bound='1';card.addEventListener('click',()=>openCard(card));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard(card)}})})};
window.initializeProjectCards();
function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow='';lastTrigger?.focus?.()}
document.querySelector('.lightbox-close').addEventListener('click',closeLightbox);prevBtn.addEventListener('click',()=>{galleryIndex=(galleryIndex-1+gallery.length)%gallery.length;showGalleryImage()});nextBtn.addEventListener('click',()=>{galleryIndex=(galleryIndex+1)%gallery.length;showGalleryImage()});lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft'&&gallery.length>1){galleryIndex=(galleryIndex-1+gallery.length)%gallery.length;showGalleryImage()}if(e.key==='ArrowRight'&&gallery.length>1){galleryIndex=(galleryIndex+1)%gallery.length;showGalleryImage()}});

// Mobile navigation
const menuToggle=document.querySelector('.menu-toggle');
const primaryNav=document.getElementById('primary-navigation');
function setMenu(open){if(!menuToggle||!primaryNav)return;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');primaryNav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open)}
menuToggle?.addEventListener('click',()=>setMenu(menuToggle.getAttribute('aria-expanded')!=='true'));
primaryNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
window.addEventListener('resize',()=>{if(window.innerWidth>600)setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&primaryNav?.classList.contains('open')){setMenu(false);menuToggle?.focus()}});

// Improve fallback project cards for keyboard and screen readers.
document.querySelectorAll('.project-card-image').forEach(card=>{if(!card.hasAttribute('tabindex'))card.tabIndex=0;if(!card.hasAttribute('role'))card.setAttribute('role','button');if(!card.hasAttribute('aria-label')){const title=card.querySelector('h3')?.textContent?.trim()||'project';card.setAttribute('aria-label',`Open ${title} gallery`)}});

// Lightbox swipe navigation and focus containment.
let touchStartX=0;
lightbox?.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0]?.clientX||0},{passive:true});
lightbox?.addEventListener('touchend',e=>{if(gallery.length<2)return;const end=e.changedTouches[0]?.clientX||0;const delta=end-touchStartX;if(Math.abs(delta)<45)return;galleryIndex=delta<0?(galleryIndex+1)%gallery.length:(galleryIndex-1+gallery.length)%gallery.length;showGalleryImage()},{passive:true});
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!lightbox?.classList.contains('open'))return;const controls=[...lightbox.querySelectorAll('button:not([style*="display: none"])')].filter(el=>!el.disabled);if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
