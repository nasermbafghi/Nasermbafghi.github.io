// Smooth navigation and subtle scroll-in effect.
const items = document.querySelectorAll('.section, .hero-copy, .hero-photo-wrap');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.08});
items.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(18px)';
  item.style.transition = 'opacity .7s ease, transform .7s ease';
  observer.observe(item);
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.visible').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});
const style = document.createElement('style');
style.textContent = '.visible{opacity:1!important;transform:translateY(0)!important}';
document.head.appendChild(style);
