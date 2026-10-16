(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let apps = [], category = '', loading = false;
  const fold = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-PT');
  const safeLink = value => {try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password ? u.href : null;}catch{return null;}};
  function element(tag, text, cls) { const e = document.createElement(tag); if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e; }
  function filters() {
    $('filters').replaceChildren();
    for(const value of ['', ...[...new Set(apps.map(a=>a.category))].sort((a,b)=>a.localeCompare(b,'pt'))]) {
      const b=element('button',value||'Todas as aplicações');b.type='button';b.setAttribute('aria-pressed',String(value===category));
      b.onclick=()=>{category=value;for(const child of $('filters').children)child.setAttribute('aria-pressed',String(child===b));render();};$('filters').append(b);
    }
  }
  function render() {
    const query=fold($('search').value.trim());$('clear').hidden=!query;
    const selected=apps.filter(a=>(!category||a.category===category)&&fold(`${a.name} ${a.description} ${a.category}`).includes(query));
    $('apps').replaceChildren();$('count').textContent=`${selected.length} de ${apps.length} aplicações`;
    $('status').textContent=selected.length?'':apps.length?'Nenhuma aplicação encontrada. Experimente outra pesquisa ou categoria.':'Ainda não existem aplicações publicadas.';
    for(const app of selected){
      const card=element('article',undefined,'card'),top=element('div',undefined,'card-top');
      const icon=element('span',app.icon||Array.from(app.name)[0], 'icon');icon.setAttribute('aria-hidden','true');
      top.append(icon,element('span',app.category,'category'));
      const link=element('a','Abrir aplicação');link.href=app.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`Abrir ${app.name} num novo separador`);link.append(element('span','↗'));
      card.append(top,element('h3',app.name),element('p',app.description),link);$('apps').append(card);
    }
  }
  function load() {
    if(loading)return;
    const endpoint=window.APP_HUB_CONFIG?.endpoint||'';
    if(!endpoint){$('status').textContent='O diretório está a ser preparado. As aplicações estarão disponíveis em breve.';return;}
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)){$('status').textContent='Não foi possível ligar ao diretório de aplicações.';return;}
    loading=true;$('retry').hidden=true;$('status').textContent='A carregar aplicações…';$('search').disabled=true;
    const script=document.createElement('script');let done=false;
    const finish=(message)=>{if(done)return;done=true;loading=false;clearTimeout(timer);script.remove();$('search').disabled=false;if(message){$('status').textContent=message;$('retry').hidden=false;}};
    window.appHubReceive=payload=>{
      if(done)return;
      if(!payload||payload.error||!Array.isArray(payload.apps)){finish('Não foi possível carregar as aplicações. Tente novamente.');return;}
      apps=payload.apps.filter(a=>a&&typeof a.name==='string'&&a.name.trim()&&typeof a.url==='string'&&safeLink(a.url)).map(a=>({name:a.name.slice(0,150),description:typeof a.description==='string'?a.description.slice(0,500):'',category:typeof a.category==='string'&&a.category.trim()?a.category.slice(0,80):'Geral',icon:typeof a.icon==='string'?Array.from(a.icon).slice(0,4).join(''):'',url:safeLink(a.url),order:typeof a.order==='number'&&Number.isFinite(a.order)?a.order:1e9})).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'pt'));
      category='';finish();filters();render();
    };
    const timer=setTimeout(()=>finish('O diretório demorou a responder. Tente novamente.'),18000);
    script.onerror=()=>finish('Não foi possível ligar ao diretório. Verifique a ligação e tente novamente.');
    script.src=endpoint+'?callback=appHubReceive';document.head.append(script);
  }
  $('search').addEventListener('input',render);$('clear').onclick=()=>{$('search').value='';render();$('search').focus();};$('retry').onclick=load;
  load();
})();
