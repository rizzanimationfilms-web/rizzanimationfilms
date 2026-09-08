const header=document.getElementById('siteHeader');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>30));

const menuBtn=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
menuBtn?.addEventListener('click',()=>mobileMenu.classList.toggle('open'));
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

function toEmbedUrl(url){
  if(!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
  if(yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vim = url.match(/vimeo\.com\/(\d+)/);
  if(vim) return `https://player.vimeo.com/video/${vim[1]}`;
  return url;
}

fetch('data/projects.json?v=' + Date.now(), { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    const projects = data.projects || [];
    const grid = document.getElementById('projectGrid');
    const countEl = document.getElementById('projectCount');
    countEl.textContent = String(projects.length).padStart(2,'0') + ' PROJECTS';

    grid.innerHTML = projects.map(p => `
      <article class="project-card ${p.featured ? 'featured' : ''} reveal"
        data-category="${p.category}"
        data-title="${p.title}"
        data-type="${p.type}"
        data-video="${p.video_url || ''}"
        data-description="${(p.description || '').replace(/"/g,'&quot;')}"
        data-internal="${p.internal_page || ''}">
        <div class="project-art real-art" style="--thumb:url('${p.thumbnail}')">
          <span>${p.type} / ${p.number || ''}</span>
          <b>${p.title.replace(/ /g,'<br>')}</b>
        </div>
        <div class="project-meta"><span>${p.title}</span><span>${p.type}</span></div>
      </article>
    `).join('');

    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    wireFilters();
    wireCards();
  })
  .catch(err => console.error('Could not load projects.json', err));

function wireFilters(){
  const filters=document.querySelectorAll('.filter');
  const cards=document.querySelectorAll('.project-card');
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const filter=btn.dataset.filter;
    cards.forEach(card=>{
      card.classList.toggle('hidden',filter!=='all' && card.dataset.category!==filter);
    });
  }));
}

const modal=document.querySelector('.modal');
const modalTitle=document.querySelector('.modal-title');
const modalType=document.querySelector('.modal-type');
const modalPlaceholder=document.getElementById('modalPlaceholder');
const modalVideo=document.getElementById('modalVideo');
const modalDescription=document.getElementById('modalDescription');

function wireCards(){
  document.querySelectorAll('.project-card').forEach(card=>card.addEventListener('click',()=>{
    if(card.dataset.internal){ window.location.href=card.dataset.internal; return; }
    modalTitle.textContent=card.dataset.title;
    modalType.textContent=card.dataset.type+' / PROJECT PRESENTATION';
    modalDescription.textContent=card.dataset.description || '';

    const embedUrl = toEmbedUrl(card.dataset.video);
    if(embedUrl){
      modalVideo.innerHTML = `<iframe src="${embedUrl}" style="width:100%;height:100%;border:0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      modalVideo.style.display='block';
      modalPlaceholder.style.display='none';
    } else {
      modalVideo.innerHTML='';
      modalVideo.style.display='none';
      modalPlaceholder.style.display='flex';
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }));
}

function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  modalVideo.innerHTML='';
}
document.querySelector('.modal-close').addEventListener('click',closeModal);
document.querySelector('.modal-backdrop').addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
