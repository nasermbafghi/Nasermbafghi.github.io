import { supabase } from './supabase-config.js';

const $ = (q) => document.querySelector(q);
const projectGrid = $('.project-grid');
const contactForm = $('#contact-form');
const contactStatus = $('#contact-status');
const experienceTimeline = $('#experience .timeline');
const expertiseList = $('#expertise-list');
const publicationsList = $('#publications-list');
const skillsList = $('#skills-list');
const educationList = $('#education-list');
const contactLinks = $('#contact-links');
const additionalSection = $('#additional');
const additionalGroups = $('#additional-groups');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function safeUrl(value='') {
  const v=String(value).trim();
  if (!v) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  return '#';
}
function nlToParagraphs(items=[]){return (items||[]).filter(Boolean).map(x=>`<p>${escapeHtml(x)}</p>`).join('');}
function renderName(name=''){
  const parts=String(name).trim().split(/\s+/).filter(Boolean);
  if(parts.length<2) return escapeHtml(name);
  const first=escapeHtml(parts.shift());
  const rest=parts.map(escapeHtml).join(' ');
  return `${first}<br><strong>${rest}</strong>`;
}
function setSection(id, visible){ const el=document.getElementById(id); if(el) el.hidden = !visible; }

async function loadSiteSettings(){
  const {data,error}=await supabase.from('site_settings').select('*').eq('id',1).maybeSingle();
  if(error || !data){ if(error) console.warn('Site settings unavailable.',error.message); return; }
  if($('#hero-title')) $('#hero-title').textContent=(data.professional_title||'').toUpperCase();
  if($('#hero-name')) $('#hero-name').innerHTML=renderName(data.full_name);
  if($('#hero-lead')) $('#hero-lead').textContent=data.hero_lead||'';
  if($('#portrait-line-1')) $('#portrait-line-1').textContent=data.portrait_line_1||'';
  if($('#portrait-line-2')) $('#portrait-line-2').textContent=data.portrait_line_2||'';
  if($('#about-heading')) $('#about-heading').textContent=data.about_heading||'';
  if($('#about-copy') && Array.isArray(data.about_paragraphs)) $('#about-copy').innerHTML=nlToParagraphs(data.about_paragraphs);
  if($('#contact-heading')) $('#contact-heading').textContent=data.contact_heading||'';
  if($('#contact-lead')) $('#contact-lead').textContent=data.contact_lead||'';
  if($('#footer-text')) $('#footer-text').textContent=data.footer_text||'';
  if(data.seo_title) document.title=data.seo_title;
  const desc=document.querySelector('meta[name="description"]'); if(desc && data.seo_description) desc.content=data.seo_description;
  const resume=$('#resume-cta');
  if(resume){ resume.hidden=!(data.show_resume && data.resume_url); resume.href=safeUrl(data.resume_url); resume.textContent=`${data.resume_label||'Download CV'} ↗`; }
  setSection('about',data.show_about);
  setSection('expertise',data.show_expertise);
  setSection('experience',data.show_experience);
  setSection('projects',data.show_projects);
  setSection('publications',data.show_publications);
  setSection('skills',data.show_skills);
  setSection('education',data.show_education);
  setSection('contact',data.show_contact);
  if($('#contact-form-wrap')) $('#contact-form-wrap').hidden=!data.show_contact_form;
  const navMap={about:data.show_about,expertise:data.show_expertise,experience:data.show_experience,projects:data.show_projects,education:data.show_education,contact:data.show_contact};
  Object.entries(navMap).forEach(([id,show])=>{const a=document.querySelector(`nav a[href="#${id}"]`); if(a) a.hidden=!show;});
  if($('#projects-cta')) $('#projects-cta').hidden=!data.show_projects;
  if($('#contact-cta')) $('#contact-cta').hidden=!data.show_contact;
}

function renderProjects(projects) {
  if (!projectGrid || !projects?.length) return;
  projectGrid.innerHTML = projects.map((project, index) => {
    const gallery = (project.gallery?.length ? project.gallery : [project.cover_image]).filter(Boolean);
    const cover = project.cover_image || gallery[0] || '';
    const tech = Array.isArray(project.technologies) && project.technologies.length ? `<div class="project-tags">${project.technologies.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>` : '';
    return `<article class="project-card project-card-image" tabindex="0" role="button" aria-label="Open ${escapeHtml(project.title)} gallery" data-gallery='${escapeHtml(JSON.stringify(gallery))}'>
      <div class="project-top"><span>${escapeHtml(project.year || '')}</span><span>${String(index + 1).padStart(2,'0')}</span></div>
      <div class="project-image-wrap"><img src="${escapeHtml(cover)}" alt="${escapeHtml(project.title)}" loading="lazy"><div class="view-project">${gallery.length > 1 ? `${gallery.length} VIEWS` : 'VIEW PROJECT'} ↗</div></div>
      <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description || '')}</p>${tech}
    </article>`;
  }).join('');
  window.initializeProjectCards?.();
}
async function loadProjects(){const {data,error}=await supabase.from('projects').select('*').eq('published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false});if(!error&&data?.length)renderProjects(data);else if(error)console.warn(error.message);}

function renderExperiences(items){if(!experienceTimeline||!items?.length)return;experienceTimeline.innerHTML=items.map(item=>{const pts=item.responsibilities?.length?`<ul class="experience-points">${item.responsibilities.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`:'';return `<article><time>${escapeHtml(item.period||'')}</time><div><h3>${escapeHtml(item.role||'')}</h3><p class="company">${escapeHtml(item.company||'')}</p>${item.summary?`<p class="experience-summary">${escapeHtml(item.summary)}</p>`:''}${pts}</div></article>`}).join('');}
async function loadExperiences(){const {data,error}=await supabase.from('experiences').select('*').eq('published',true).order('sort_order',{ascending:true});if(!error&&data?.length)renderExperiences(data);else if(error)console.warn(error.message);}

async function loadExpertise(){const {data,error}=await supabase.from('expertise_items').select('*').eq('published',true).order('sort_order',{ascending:true});if(error||!data?.length)return;expertiseList.innerHTML=data.map((x,i)=>`<article><i>${String(i+1).padStart(2,'0')}</i><b>${escapeHtml(x.icon||'•')}</b><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.description)}</p></article>`).join('');}
async function loadPublications(){const {data,error}=await supabase.from('publications').select('*').eq('published',true).order('sort_order',{ascending:true});if(error||!data?.length)return;publicationsList.innerHTML=data.map(x=>`<article><span>${escapeHtml(x.year||'')}</span><div class="publication-body"><h3>${escapeHtml(x.title)}</h3><div class="publication-meta"><span><b>Journal</b> ${escapeHtml(x.journal||'')}</span><span><b>Publisher</b> ${escapeHtml(x.publisher||'')}</span></div>${x.doi?`<a class="doi-link" href="https://doi.org/${encodeURIComponent(x.doi)}" target="_blank" rel="noopener noreferrer">DOI ${escapeHtml(x.doi)} ↗</a>`:''}${x.publisher_url?` <a class="doi-link" href="${escapeHtml(safeUrl(x.publisher_url))}" target="_blank" rel="noopener noreferrer">Publisher ↗</a>`:''}</div></article>`).join('');}
async function loadSkills(){const {data,error}=await supabase.from('skill_groups').select('*').eq('published',true).order('sort_order',{ascending:true});if(error||!data?.length)return;skillsList.innerHTML=data.map(g=>`<div><h3>${escapeHtml(g.title)}</h3><div class="tags">${(g.items||[]).map(i=>`<span>${escapeHtml(i)}</span>`).join('')}</div></div>`).join('');}
async function loadEducation(){const {data,error}=await supabase.from('education_items').select('*').eq('published',true).order('sort_order',{ascending:true});if(error||!data?.length)return;educationList.innerHTML=data.map(x=>`<article><span>${escapeHtml(x.period)}</span><h3>${escapeHtml(x.degree)}</h3><p>${escapeHtml(x.institution)}</p></article>`).join('');}
async function loadContactLinks(){const {data,error}=await supabase.from('contact_links').select('*').eq('published',true).order('sort_order',{ascending:true});if(error||!data?.length)return;contactLinks.innerHTML=data.filter(x=>x.url&&x.value).map(x=>`<a href="${escapeHtml(safeUrl(x.url))}" ${/^https?:/i.test(x.url)?'target="_blank" rel="noopener"':''}><small>${escapeHtml(x.label||x.platform)}</small><strong>${escapeHtml(x.value)}</strong><span>↗</span></a>`).join('');}


async function loadProfileItems(){
  const {data,error}=await supabase.from('profile_items').select('*').eq('published',true).order('sort_order',{ascending:true});
  if(error||!data?.length||!additionalGroups)return;
  const groups={}; data.forEach(x=>(groups[x.category||'Additional']??=[]).push(x));
  additionalGroups.innerHTML=Object.entries(groups).map(([category,items])=>`<div class="optional-group"><h3>${escapeHtml(category)}</h3><div class="optional-grid">${items.map(x=>`<article><h4>${escapeHtml(x.title)}</h4>${x.subtitle?`<p class="optional-subtitle">${escapeHtml(x.subtitle)}</p>`:''}${x.description?`<p>${escapeHtml(x.description)}</p>`:''}${x.url?`<a class="doi-link" href="${escapeHtml(safeUrl(x.url))}" target="_blank" rel="noopener">${escapeHtml(x.link_label||'Learn more')} ↗</a>`:''}</article>`).join('')}</div></div>`).join('');
  additionalSection.hidden=false;
}

if(contactForm){contactForm.addEventListener('submit',async e=>{e.preventDefault();const submit=contactForm.querySelector('button[type="submit"]');const f=new FormData(contactForm);if(String(f.get('website')||'').trim())return;const payload={name:String(f.get('name')||'').trim(),email:String(f.get('email')||'').trim(),subject:String(f.get('subject')||'').trim(),message:String(f.get('message')||'').trim()};if(!payload.name||!payload.email||!payload.message)return;submit.disabled=true;submit.textContent='Sending…';const {error}=await supabase.from('messages').insert(payload);contactStatus.textContent=error?'Message could not be sent. Please try again or use email.':'Thanks — your message has been sent.';contactStatus.className=`form-status ${error?'error':'success'}`;if(!error)contactForm.reset();submit.disabled=false;submit.textContent='Send message ↗';});}

Promise.allSettled([loadSiteSettings(),loadProjects(),loadExperiences(),loadExpertise(),loadPublications(),loadSkills(),loadEducation(),loadContactLinks(),loadProfileItems()]);
