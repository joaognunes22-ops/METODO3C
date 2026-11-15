/* Dinâmicas Cristãs — LP de venda | JS vanilla, sem dependências */
(function(){
  'use strict';

  /* rede de segurança: se este arquivo não carregar, o <head> tira a classe .js
     em 2.5s e o conteúdo com .reveal aparece mesmo assim */
  window.__lpReady = true;

  /* ---------- 1. Data de hoje (renova sozinha a cada visita) ----------
     [data-today="full"]    → "DOMINGO, 02/08"
     [data-today="weekday"] → "DOMINGO"
     [data-today="date"]    → "02/08"                                    */
  try{
    var d = new Date();
    var weekday = d.toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase();
    var dayMonth = d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    [].slice.call(document.querySelectorAll('[data-today]')).forEach(function(el){
      var mode = el.getAttribute('data-today');
      el.textContent = mode === 'date' ? dayMonth
                     : mode === 'weekday' ? weekday
                     : weekday + ', ' + dayMonth;
    });
  }catch(e){}

  var year = document.getElementById('year');
  if(year){ year.textContent = new Date().getFullYear(); }

  /* ---------- 2. Scroll reveal ---------- */
  var rev = [].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rev.forEach(function(el){ io.observe(el); });
  } else {
    rev.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- 3. CTA fixo inteligente ---------- */
  var sticky = document.getElementById('stickyCta');
  var stickyLink = document.getElementById('stickyLink');
  /* aparece a partir do INÍCIO da seção de prova social */
  var trigger = document.getElementById('stickyTrigger') || document.getElementById('prova');
  var planos = document.getElementById('planos');
  var foot = document.querySelector('footer');
  /* Medição direta a cada scroll (throttle por rAF) em vez de IntersectionObserver:
     num salto grande — âncora, voltar ao topo, flick — o alvo sai de "acima da
     tela" para "abaixo da tela" sem nunca intersectar, o IO não dispara e o
     botão fica preso no estado antigo. */
  if(sticky && trigger){
    var visivel = function(el){
      if(!el) return false;
      var r = el.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      return r.top < h && r.bottom > 0;
    };
    var ticking = false, mostrando = null;
    function sync(){
      var t = trigger.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      var chegouNaProva = t.top < h;              /* entrou na tela ou já passou */
      var show = chegouNaProva && !visivel(planos) && !visivel(foot);
      if(show === mostrando) return;              /* evita mexer no DOM à toa */
      mostrando = show;
      sticky.classList.toggle('show', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      if(stickyLink) stickyLink.tabIndex = show ? 0 : -1;
    }
    function onScroll(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ ticking = false; sync(); });
    }
    addEventListener('scroll', onScroll, {passive:true});
    addEventListener('resize', onScroll);
    addEventListener('load', sync);
    sync();
  }

  /* ---------- 4. Carrossel infinito reutilizável ---------- */
  function initCarousel(caro){
    var track = caro.querySelector('.caro-track'); if(!track) return;
    var dir = parseFloat(caro.getAttribute('data-dir')) || 1;
    var origCount = track.children.length;

    [].slice.call(track.children).forEach(function(n){
      var c = n.cloneNode(true);
      c.setAttribute('aria-hidden','true');
      [].slice.call(c.querySelectorAll('a,button,[tabindex]')).forEach(function(el){ el.setAttribute('tabindex','-1'); });
      track.appendChild(c);
    });

    /* Quando o carrossel entra na tela, baixa TODAS as imagens dele de uma vez.
       Sem isso, os slides que estão fora da tela na horizontal nunca ficam
       perto o bastante para o loading="lazy" disparar — e entram na esteira
       como um cartão branco. */
    (function preloadAoAparecer(){
      function baixarTudo(){
        [].slice.call(track.querySelectorAll('img[loading="lazy"]')).forEach(function(img){
          img.loading = 'eager';
        });
      }
      if(!('IntersectionObserver' in window)) return baixarTudo();
      /* só depois do load: antes disso essas fotos disputavam banda com a imagem
         do topo e com o pixel da Meta (que é o que conta a visita no connect rate) */
      function observar(){
        var io = new IntersectionObserver(function(es){
          if(es[0].isIntersecting){ baixarTudo(); io.disconnect(); }
        },{rootMargin:'400px 0px'});
        io.observe(caro);
      }
      if(document.readyState === 'complete') observar();
      else addEventListener('load', observar);
    })();

    /* velocidade em px/s — dá pra ajustar por carrossel com data-speed no HTML */
    var SPEED = parseFloat(caro.getAttribute('data-speed')) || 38;
    var half=0,x=0,paused=false,dragging=false,last=0,moved=0,startX=0,startPos=0,resumeT=null;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function measure(){ var f = track.children[origCount]; half = f ? f.offsetLeft : track.scrollWidth/2; }
    function wrap(){ if(half>0) x = ((x%half)+half)%half; }
    function render(){ track.style.transform = 'translateX(' + (-x) + 'px)'; }

    measure(); render();
    addEventListener('load', function(){ var r = half ? x/half : 0; measure(); x = r*half; render(); });
    addEventListener('resize', function(){ var r = half ? x/half : 0; measure(); x = r*half; render(); });

    function tick(t){
      if(!last) last = t;
      var dt = Math.min((t-last)/1000,.05); last = t;
      if(!paused && !dragging && !reduce){ x += dir*SPEED*dt; wrap(); render(); }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function hold(){ if(resumeT) clearTimeout(resumeT); paused = true; resumeT = setTimeout(function(){ paused=false; last=0; },3000); }
    function step(){ var it = track.querySelector('.aslide,.wa'); return it ? it.getBoundingClientRect().width + 16 : 240; }
    function by(d){
      var s=x, t0=null;
      (function an(t){
        if(!t0) t0=t;
        var p=Math.min((t-t0)/350,1), e=1-Math.pow(1-p,3);
        x = s + d*e; wrap(); render();
        if(p<1) requestAnimationFrame(an);
      })(performance.now ? performance.now() : 0);
    }

    /* TODOS os carrosséis são esteiras puramente decorativas: sem setas, sem
       arrasto, sem pausa no hover, sem clique. Só andam.
       (data-interativo reativa a interação num carrossel específico, se um dia
       for preciso.) */
    if(!caro.hasAttribute('data-interativo')){
      caro.classList.add('caro-travado');
      [].slice.call(caro.querySelectorAll('.caro-nav')).forEach(function(b){ b.remove(); });
      return;
    }

    var pB = caro.querySelector('.caro-nav.prev'), nB = caro.querySelector('.caro-nav.next');
    if(pB) pB.addEventListener('click', function(){ by(-step()); hold(); });
    if(nB) nB.addEventListener('click', function(){ by(step()); hold(); });

    caro.addEventListener('mouseenter', function(){ paused=true; if(resumeT) clearTimeout(resumeT); });
    caro.addEventListener('mouseleave', function(){ if(!dragging){ paused=false; last=0; } });

    track.addEventListener('pointerdown', function(e){
      dragging=true; moved=0; startX=e.clientX; startPos=x;
      track.classList.add('grabbing');
      try{ track.setPointerCapture(e.pointerId); }catch(_){}
    });
    track.addEventListener('pointermove', function(e){
      if(!dragging) return;
      var d = e.clientX - startX; moved = Math.max(moved, Math.abs(d));
      x = startPos - d; wrap(); render();
    });
    function end(){ if(!dragging) return; dragging=false; track.classList.remove('grabbing'); caro.__moved = moved; hold(); }
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
  }
  [].slice.call(document.querySelectorAll('[data-caro]')).forEach(initCarousel);

  /* ---------- 5. Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  if(lb && lbImg){
    var gallery = [], idx = 0, lastFocus = null;

    function hd(src){ return src.replace(/\.webp$/, '-hd.webp'); }
    function show(i){
      if(!gallery.length) return;
      idx = (i % gallery.length + gallery.length) % gallery.length;
      var img = gallery[idx];
      lbImg.src = hd(img.getAttribute('src') || '');
      lbImg.alt = img.getAttribute('alt') || '';
    }
    function open(list, i, trigger){
      gallery = list; lastFocus = trigger || document.activeElement;
      show(i);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      var c = lb.querySelector('[data-lb-close]'); if(c) c.focus();
    }
    function close(){
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }

    [].slice.call(document.querySelectorAll('[data-caro][data-lightbox]')).forEach(function(caro){
      caro.addEventListener('click', function(e){
        var btn = e.target.closest && e.target.closest('.aslide-btn');
        if(!btn) return;
        if(caro.__moved > 6){ caro.__moved = 0; return; } /* houve arrasto → não abre */
        var imgs = [].slice.call(caro.querySelectorAll('.caro-track > .aslide:not([aria-hidden="true"]) img'));
        if(!imgs.length) return; /* placeholders ainda sem imagem real */
        var mine = btn.querySelector('img');
        open(imgs, Math.max(0, imgs.indexOf(mine)), btn);
      });
    });

    lb.addEventListener('click', function(e){
      if(e.target.closest('[data-lb-close]') || e.target === lb) return close();
      if(e.target.closest('[data-lb-prev]')) return show(idx-1);
      if(e.target.closest('[data-lb-next]')) return show(idx+1);
    });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key === 'Escape') close();
      else if(e.key === 'ArrowLeft') show(idx-1);
      else if(e.key === 'ArrowRight') show(idx+1);
    });
  }

  /* ---------- 6. Modal de upsell (clique no Básico) ---------- */
  var modal = document.getElementById('upsell');
  if(modal){
    var modalLast = null;
    function openModal(trigger){
      modalLast = trigger || document.activeElement;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      var c = modal.querySelector('[data-close]'); if(c) c.focus();
    }
    function closeModal(){
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if(modalLast && modalLast.focus) modalLast.focus();
    }
    /* O gatilho é um <button data-upsell-open>, não um link de checkout.
       Assim não precisamos mais bloquear a propagação do clique — o que antes
       impedia a UTMify de registrar o clique no Básico. Todos os 3 links de
       checkout agora chegam intactos na UTMify. */
    document.addEventListener('click', function(e){
      if(!e.target.closest) return;
      if(e.target.closest('[data-upsell-open]')){ e.preventDefault(); openModal(e.target.closest('[data-upsell-open]')); return; }
      if(e.target.closest('[data-close]') || e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  /* ---------- 7. Telemetria de CTA ----------
     Métrica própria, independente da UTMify: cada clique vira um evento
     nomeado no Microsoft Clarity (painel > Eventos personalizados) e um push
     no dataLayer. Os nomes que interessam são os 3 botões de compra:
       cta_plano_basico   → abre o popup de upsell
       cta_plano_alianca  → checkout R$ 39,90
       cta_upsell_aceita  → checkout R$ 29,90  (popup)
       cta_upsell_recusa  → checkout R$ 19,90  (popup)                        */
  window.dataLayer = window.dataLayer || [];
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-cta]');
    if(!el) return;
    var nome = el.getAttribute('data-cta');
    window.dataLayer.push({event:'cta_click', cta:nome});
    try{ if(typeof window.clarity === 'function') window.clarity('event', 'cta_' + nome.replace(/-/g,'_')); }catch(_){}
  });

  /* ---------- 8. Anticópia ----------
     Barreira contra cópia casual da página. NÃO é segurança de verdade:
     quem sabe usar o navegador contorna em segundos (o HTML sempre chega
     no cliente). Serve só para atrapalhar quem copia no automático.
     Nada aqui toca nos scripts de rastreamento.                            */

  /* botão direito */
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });

  /* arrastar imagens para fora */
  document.addEventListener('dragstart', function(e){ e.preventDefault(); });

  /* copiar texto */
  document.addEventListener('copy', function(e){ e.preventDefault(); });
  document.addEventListener('cut', function(e){ e.preventDefault(); });

  /* atalhos de ver-código / salvar / devtools / imprimir */
  document.addEventListener('keydown', function(e){
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    if(k === 'f12') return e.preventDefault();
    if(mod && !e.shiftKey && ['u','s','p'].indexOf(k) > -1) return e.preventDefault();
    if(mod && e.shiftKey && ['i','j','c'].indexOf(k) > -1) return e.preventDefault();
  });

})();
