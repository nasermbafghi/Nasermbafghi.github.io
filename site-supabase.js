import { supabase } from './supabase-config.js';

const projectGrid = document.querySelector('.project-grid');
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function renderProjects(projects) {
  if (!projectGrid || !projects?.length) return;
  projectGrid.innerHTML = projects.map((project, index) => {
    const gallery = (project.gallery?.length ? project.gallery : [project.cover_image]).filter(Boolean);
    const cover = project.cover_image || gallery[0] || '';
    const tech = Array.isArray(project.technologies) && project.technologies.length
      ? `<div class="project-tags">${project.technologies.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>` : '';
    return `<article class="project-card project-card-image" tabindex="0" role="button" aria-label="Open ${escapeHtml(project.title)} gallery" data-gallery='${escapeHtml(JSON.stringify(gallery))}'>
      <div class="project-top"><span>${escapeHtml(project.year || '')}</span><span>${String(index + 1).padStart(2,'0')}</span></div>
      <div class="project-image-wrap"><img src="${escapeHtml(cover)}" alt="${escapeHtml(project.title)}" loading="lazy"><div class="view-project">${gallery.length > 1 ? `${gallery.length} VIEWS` : 'VIEW PROJECT'} ↗</div></div>
      <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description || '')}</p>${tech}
    </article>`;
  }).join('');
  window.initializeProjectCards?.();
}

async function loadProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id,title,year,description,technologies,cover_image,gallery,published,sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (!error && data?.length) renderProjects(data);
  else if (error) console.warn('Supabase projects unavailable; keeping local fallback.', error.message);
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = contactForm.querySelector('button[type="submit"]');
    const form = new FormData(contactForm);
    const honeypot = String(form.get('website') || '').trim();
    if (honeypot) return;

    const payload = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      subject: String(form.get('subject') || '').trim(),
      message: String(form.get('message') || '').trim()
    };
    if (!payload.name || !payload.email || !payload.message) return;

    submit.disabled = true;
    submit.textContent = 'Sending…';
    contactStatus.textContent = '';
    contactStatus.className = 'form-status';
    const { error } = await supabase.from('messages').insert(payload);
    if (error) {
      contactStatus.textContent = 'Message could not be sent. Please try again or use email.';
      contactStatus.classList.add('error');
    } else {
      contactForm.reset();
      contactStatus.textContent = 'Thanks — your message has been sent.';
      contactStatus.classList.add('success');
    }
    submit.disabled = false;
    submit.textContent = 'Send message ↗';
  });
}

loadProjects();
