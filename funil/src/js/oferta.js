/* Página de vendas: liga os CTAs ao checkout oficial, mostra o resumo do
 * quiz (quando existir) e controla o CTA fixo no celular. */
(function () {
  'use strict';
  MR30.bindCheckoutLinks();

  var FOCO = {
    impulso: 'parar de agir por impulso',
    autoestima: 'recuperar sua autoestima e seu respeito próprio',
    paz: 'voltar a ter paz para dormir e se concentrar',
    clareza: 'ter clareza para decidir seus próximos passos'
  };
  var NOME = { florescer: '🌸 Jornada Florescer', reconstruir: '🧭 Jornada Reconstruir' };

  var a = MR30.answers.load();
  var theme = document.documentElement.dataset.theme;
  var box = document.getElementById('personal');
  if (a && FOCO[a.objetivo] && NOME[theme]) {
    box.textContent = '';
    var b1 = document.createElement('strong'); b1.textContent = NOME[theme];
    var b2 = document.createElement('strong'); b2.textContent = FOCO[a.objetivo];
    box.append('Caminho indicado pela Cláudia: ', b1, '. Seu foco nos próximos 30 dias: ', b2, '.');
    box.hidden = false;
  }

  // CTA fixo: aparece depois da abertura e some quando a oferta está na tela.
  var sticky = document.getElementById('sticky');
  var hero = document.querySelector('.hero');
  var offer = document.getElementById('oferta');
  var final = document.querySelector('.final');
  if ('IntersectionObserver' in window) {
    var state = { hero: true, offer: false, final: false };
    var update = function () {
      var show = !state.hero && !state.offer && !state.final;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelector('a').tabIndex = show ? 0 : -1;
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === hero) state.hero = e.isIntersecting;
        if (e.target === offer) state.offer = e.isIntersecting;
        if (e.target === final) state.final = e.isIntersecting;
      });
      update();
    }, { threshold: 0.15 });
    [hero, offer, final].forEach(function (t) { io.observe(t); });
  }
})();
