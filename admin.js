import { supabase } from './supabase-config.js';

const $ = (q) => document.querySelector(q);
const loginView = $('#login-view');
const dashboardView = $('#dashboard-view');
const loginForm = $('#login-form');
const logoutBtn = $('#logout-btn');
const projectForm = $('#project-form');
let projectsCache = [];

function setStatus(el, text, type='') { el.textContent = text || ''; el.className = `form-status ${type}`.trim(); }
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
function formatDate(value){return value ? new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)) : '';}

async function isAdmin(){
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

async function showSession(session){
  if (!session) {
    loginView.hidden = false; dashboardView.hidden = true; logoutBtn.hidden = true; return;
  }
  if (!(await isAdmin())) {
    await supabase.auth.signOut();
    loginView.hidden = false; dashboardView.hidden = true; logoutBtn.hidden = true;
    setStatus($('#login-status'),'This account is authenticated but is not registered as an administrator.','error');
    return;
  }
  loginView.hidden = true; dashboardView.hidden = false; logoutBtn.hidden = false;
  $('#admin-email').textContent = session.user.email || '';
  await Promise.all([loadMessages(), loadProjects()]);
}

loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(loginForm);
  setStatus($('#login-status'),'Signing in…');
  const { data, error } = await supabase.auth.signInWithPassword({email:String(fd.get('email')).trim(),password:String(fd.get('password'))});
  if(error) return setStatus($('#login-status'),error.message,'error');
  setStatus($('#login-status'),'');
  await showSession(data.session);
});
logoutBtn.addEventListener('click', async()=>{await supabase.auth.signOut();await showSession(null);});

async function loadMessages(){
  const {data,error}=await supabase.from('messages').select('*').order('created_at',{ascending:false});
  const list=$('#messages-list');
  if(error){list.innerHTML=`<p class="empty-state">${escapeHtml(error.message)}</p>`;return;}
  $('#message-count').textContent=data.length;
  list.innerHTML=data.length?data.map(m=>`<article class="message-item ${m.is_read?'':'unread'}" data-id="${m.id}"><div class="message-meta"><span>${escapeHtml(m.name)}</span><span>${escapeHtml(m.email)}</span><span>${escapeHtml(formatDate(m.created_at))}</span></div><h4>${escapeHtml(m.subject||'No subject')}</h4><p>${escapeHtml(m.message)}</p><div class="item-actions"><button data-action="toggle-read">Mark ${m.is_read?'unread':'read'}</button><a class="ghost-btn" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: '+(m.subject||'Your message'))}">Reply</a><button data-action="delete-message">Delete</button></div></article>`).join(''):'<p class="empty-state">No messages yet.</p>';
  list.querySelectorAll('[data-action="toggle-read"]').forEach(btn=>btn.onclick=async()=>{const row=btn.closest('.message-item');const current=!row.classList.contains('unread');await supabase.from('messages').update({is_read:!current}).eq('id',row.dataset.id);loadMessages();});
  list.querySelectorAll('[data-action="delete-message"]').forEach(btn=>btn.onclick=async()=>{if(!confirm('Delete this message?'))return;await supabase.from('messages').delete().eq('id',btn.closest('.message-item').dataset.id);loadMessages();});
}

async function loadProjects(){
  const {data,error}=await supabase.from('projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  const list=$('#projects-list');
  if(error){list.innerHTML=`<p class="empty-state">${escapeHtml(error.message)}</p>`;return;}
  projectsCache=data; $('#project-count').textContent=data.length; $('#published-count').textContent=data.filter(p=>p.published).length;
  list.innerHTML=data.length?data.map(p=>`<article class="admin-project-item" data-id="${p.id}"><div class="project-admin-meta"><span>${escapeHtml(p.year)}</span><span>${p.published?'PUBLISHED':'DRAFT'}</span><span>ORDER ${escapeHtml(p.sort_order)}</span></div><h4>${escapeHtml(p.title)}</h4><div class="item-actions"><button data-action="edit-project">Edit</button><button data-action="toggle-publish">${p.published?'Unpublish':'Publish'}</button><button data-action="delete-project">Delete</button></div></article>`).join(''):'<p class="empty-state">No database projects yet.</p>';
  list.querySelectorAll('[data-action="edit-project"]').forEach(btn=>btn.onclick=()=>editProject(btn.closest('article').dataset.id));
  list.querySelectorAll('[data-action="toggle-publish"]').forEach(btn=>btn.onclick=async()=>{const p=projectsCache.find(x=>String(x.id)===btn.closest('article').dataset.id);await supabase.from('projects').update({published:!p.published}).eq('id',p.id);loadProjects();});
  list.querySelectorAll('[data-action="delete-project"]').forEach(btn=>btn.onclick=async()=>{if(!confirm('Delete this project from the database?'))return;await supabase.from('projects').delete().eq('id',btn.closest('article').dataset.id);loadProjects();clearProjectForm();});
}

function clearProjectForm(){projectForm.reset();projectForm.elements.id.value='';projectForm.elements.sort_order.value='100';projectForm.elements.published.checked=true;$('#editor-title').textContent='Add project';$('#current-media').innerHTML='';setStatus($('#project-status'),'');}
function editProject(id){
  const p=projectsCache.find(x=>String(x.id)===String(id)); if(!p)return;
  projectForm.elements.id.value=p.id; projectForm.elements.title.value=p.title||''; projectForm.elements.year.value=p.year||''; projectForm.elements.description.value=p.description||''; projectForm.elements.technologies.value=(p.technologies||[]).join(', '); projectForm.elements.sort_order.value=p.sort_order??100; projectForm.elements.published.checked=!!p.published;
  $('#editor-title').textContent='Edit project';
  const images=[p.cover_image,...(p.gallery||[])].filter((v,i,a)=>v&&a.indexOf(v)===i);
  $('#current-media').innerHTML=images.length?`Current images:<br>${images.map(src=>`<img src="${escapeHtml(src)}" alt="">`).join('')}`:'';
  projectForm.scrollIntoView({behavior:'smooth',block:'start'});
}

async function uploadFile(file){
  const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');
  const path=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;
  const {error}=await supabase.storage.from('project-images').upload(path,file,{cacheControl:'3600',upsert:false});
  if(error) throw error;
  return supabase.storage.from('project-images').getPublicUrl(path).data.publicUrl;
}

projectForm.addEventListener('submit',async(e)=>{
  e.preventDefault(); const fd=new FormData(projectForm); const id=String(fd.get('id')||'');
  const existing=projectsCache.find(p=>String(p.id)===id);
  const submit=projectForm.querySelector('button[type="submit"]'); submit.disabled=true; setStatus($('#project-status'),'Saving…');
  try{
    const coverFile=projectForm.elements.cover.files[0]; const galleryFiles=[...projectForm.elements.gallery.files];
    const cover=coverFile?await uploadFile(coverFile):(existing?.cover_image||'');
    const gallery=galleryFiles.length?await Promise.all(galleryFiles.map(uploadFile)):(existing?.gallery||[]);
    const title=String(fd.get('title')).trim();
    const payload={title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+String(fd.get('year')),year:Number(fd.get('year')),description:String(fd.get('description')).trim(),technologies:String(fd.get('technologies')||'').split(',').map(s=>s.trim()).filter(Boolean),sort_order:Number(fd.get('sort_order')||100),published:projectForm.elements.published.checked,cover_image:cover,gallery};
    const result=id?await supabase.from('projects').update(payload).eq('id',id):await supabase.from('projects').insert(payload);
    if(result.error) throw result.error;
    setStatus($('#project-status'),'Project saved.','success'); await loadProjects(); clearProjectForm();
  }catch(err){setStatus($('#project-status'),err.message||'Could not save project.','error');}
  finally{submit.disabled=false;}
});

$('#new-project-btn').onclick=()=>{clearProjectForm();projectForm.scrollIntoView({behavior:'smooth'});};
$('#cancel-edit-btn').onclick=clearProjectForm;
$('#refresh-messages').onclick=loadMessages;

const {data:{session}}=await supabase.auth.getSession();
await showSession(session);
