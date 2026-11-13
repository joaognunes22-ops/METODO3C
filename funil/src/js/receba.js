/* Página curta "o que você recebe": demonstração do mecanismo dentro do app
 * (Entender → Interromper → Reforçar → 30 dias), e-books e checkout direto.
 * Conteúdo adaptado à jornada: Florescer (mulher) ou Reconstruir (homem). */
(function () {
  'use strict';

  var theme = document.documentElement.dataset.theme === 'reconstruir' ? 'reconstruir' : 'florescer';
  var a = MR30.answers.load() || {};

  var DATA = {
    florescer: {
      tag: '🌸 Seu plano está pronto · Jornada Florescer',
      h1: 'Isto é <em>exatamente</em> o que você recebe para quebrar o Ciclo do Impulso e voltar a florescer',
      foco: { impulso: 'parar de procurar ele por impulso', autoestima: 'recuperar sua autoestima e seu valor', paz: 'voltar a ter paz, dormir bem e se concentrar', autonomia: 'ter autonomia emocional e viver por você' },
      jornada: '🌸 Jornada Florescer',
      slides: [
        { move: 'Entender', title: 'Aula do dia', day: 'Dia 1 de 30',
          screen: '<div class="s-chip">🌸 Florescer · Aula 1</div><div class="s-hero"><small>Aula do dia · 6 min</small><strong>Por que é tão difícil parar de pensar nele?</strong></div><div class="s-lines"><i></i><i></i><i style="width:80%"></i><i></i><i style="width:60%"></i></div><div class="s-btn">Continuar aula</div>',
          cap: '<b>Movimento 1 · Entender.</b> Uma aula curta por dia mostra o gatilho por trás da saudade. Quando você enxerga o padrão, ele perde parte da força.' },
        { move: 'Interromper', title: 'Exercício prático', day: 'Dia 1 de 30',
          screen: '<div class="s-chip">✍️ Exercício do dia</div><div class="s-card"><small>Quando bater a vontade de olhar o perfil dele</small><strong>Pare. Respire 3 vezes. Escreva o que está sentindo antes de pegar o celular.</strong></div><div class="s-check"><span>✓</span>Fiz o exercício hoje</div><div class="s-note">Uma resposta pronta para o momento do impulso.</div>',
          cap: '<b>Movimento 2 · Interromper.</b> Um exercício te dá uma atitude concreta para o momento do impulso. É aqui que o ciclo para de rodar sozinho.' },
        { move: 'Reforçar', title: 'Reflexão', day: 'Dia 1 de 30',
          screen: '<div class="s-chip">🪞 Reflexão do dia</div><div class="s-card"><small>Pergunta de hoje</small><strong>O que eu fiz hoje por mim, e não por ele?</strong></div><div class="s-input">Hoje eu escolhi não abrir a conversa…<span class="caret"></span></div><div class="s-btn">Salvar reflexão</div>',
          cap: '<b>Movimento 3 · Reforçar.</b> A reflexão fecha o dia e fixa a nova atitude, em vez da antiga.' },
        { move: 'Evoluir', title: 'Seu progresso', day: 'Dia 12 de 30',
          screen: 'GRID',
          cap: '<b>30 dias · Evoluir.</b> O app marca cada dia concluído. Cada repetição enfraquece o ciclo antigo, e você vê a sua evolução.' }
      ],
      books: [
        { cls: 'book--florescer', name: 'Florescer', sub: 'Guia prático para saudade, gatilhos e autoestima', you: true },
        { cls: 'book--reconstruir', name: 'Reconstruir', sub: 'Guia prático para impulsos, ansiedade e autocontrole', you: false }
      ],
      pack: [
        ['📱', 'App Método Recomeço 30 Premium', 'Aulas, exercícios, reflexões e progresso'],
        ['🌸', 'Jornada Florescer · 30 aulas', 'Sua jornada: autoestima, limites e autonomia emocional'],
        ['🧭', 'Jornada Reconstruir · 30 aulas', 'Incluída no mesmo acesso'],
        ['📘', '2 e-books premium', 'Florescer e Reconstruir'],
        ['🔁', 'Método dos 3 movimentos diários', 'Para quebrar o Ciclo do Impulso']
      ]
    },
    reconstruir: {
      tag: '🧭 Seu plano está pronto · Jornada Reconstruir',
      h1: 'Isto é <em>exatamente</em> o que você recebe para quebrar o Ciclo do Impulso e retomar o controle',
      foco: { impulso: 'parar de agir por impulso', respeito: 'recuperar seu respeito próprio e sua confiança', foco: 'voltar a ter foco e dormir bem', controle: 'retomar o controle da sua vida' },
      jornada: '🧭 Jornada Reconstruir',
      slides: [
        { move: 'Entender', title: 'Aula do dia', day: 'Dia 1 de 30',
          screen: '<div class="s-chip">🧭 Reconstruir · Aula 1</div><div class="s-hero"><small>Aula do dia · 6 min</small><strong>Por que o impulso de mandar mensagem é tão forte?</strong></div><div class="s-lines"><i></i><i></i><i style="width:80%"></i><i></i><i style="width:60%"></i></div><div class="s-btn">Continuar aula</div>',
          cap: '<b>Movimento 1 · Entender.</b> Uma aula curta por dia mostra o que está por trás do impulso. Quem entende o gatilho deixa de ser comandado por ele.' },
        { move: 'Interromper', title: 'Exercício prático', day: 'Dia 1 de 30',
          screen: '<div class="s-chip">🛑 Exercício do dia</div><div class="s-card"><small>Antes de mandar mensagem pra ela</small><strong>Espere 10 minutos. Escreva o que você quer resolver com essa mensagem.</strong></div><div class="s-check"><span>✓</span>Mantive o controle hoje</div><div class="s-note">Uma resposta pronta para o momento do impulso.</div>',
          cap: '<b>Movimento 2 · Interromper.</b> Um exercício direto te dá uma atitude concreta para a hora do impulso. É aqui que você retoma o comando.' },
        { move: 'Reforçar', title: 'Reflexão', day: 'Dia 1 de 30',
          screen: '<div class="s-chip">🪨 Reflexão do dia</div><div class="s-card"><small>Pergunta de hoje</small><strong>Em que momento eu mantive o controle hoje?</strong></div><div class="s-input">Quando deu vontade de ver os stories dela, eu…<span class="caret"></span></div><div class="s-btn">Salvar reflexão</div>',
          cap: '<b>Movimento 3 · Reforçar.</b> A reflexão fecha o dia e fixa a nova atitude. Respeito próprio se constrói com repetição.' },
        { move: 'Evoluir', title: 'Seu progresso', day: 'Dia 12 de 30',
          screen: 'GRID',
          cap: '<b>30 dias · Evoluir.</b> O app marca cada dia concluído. Cada repetição enfraquece o ciclo antigo, e você vê a sua evolução.' }
      ],
      books: [
        { cls: 'book--reconstruir', name: 'Reconstruir', sub: 'Guia prático para impulsos, ansiedade e autocontrole', you: true },
        { cls: 'book--florescer', name: 'Florescer', sub: 'Guia prático para saudade, gatilhos e autoestima', you: false }
      ],
      pack: [
        ['📱', 'App Método Recomeço 30 Premium', 'Aulas, exercícios, reflexões e progresso'],
        ['🧭', 'Jornada Reconstruir · 30 aulas', 'Sua jornada: autocontrole, confiança e respeito próprio'],
        ['🌸', 'Jornada Florescer · 30 aulas', 'Incluída no mesmo acesso'],
        ['📘', '2 e-books premium', 'Reconstruir e Florescer'],
        ['🔁', 'Método dos 3 movimentos diários', 'Para quebrar o Ciclo do Impulso']
      ]
    }
  };

  var D = DATA[theme];
  var $ = function (id) { return document.getElementById(id); };

  $('tag').textContent = D.tag;
  $('h1').innerHTML = D.h1;
  var foco = a.jornada === theme && D.foco[a.objetivo];
  if (foco) {
    $('focus').textContent = '';
    var s = document.createElement('strong'); s.textContent = foco;
    $('focus').append('🎯 Seu foco nos próximos 30 dias: ', s);
    $('focus').hidden = false;
  }
  $('more').href = MR30.internalUrl('oferta.html', { j: theme });

  // Grade de progresso (slide 4)
  function grid() {
    var cells = '';
    for (var i = 1; i <= 30; i++) cells += '<i class="' + (i < 12 ? 'on' : i === 12 ? 'today' : '') + '">' + i + '</i>';
    return '<div class="s-chip">📈 Meu progresso</div><div class="s-ring"><span style="--p:37"></span><b>11<small>/30</small></b></div><div class="s-grid">' + cells + '</div><div class="s-note">Sequência atual: 11 dias 🔥</div>';
  }

  // Demonstração em carrossel com avanço automático
  var idx = 0, timer = null;
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#moves button'));
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i) {
    idx = i;
    var sl = D.slides[i];
    $('screen').innerHTML =
      '<div class="s-top"><span>' + sl.day + '</span><span class="s-title">' + sl.title + '</span></div>' +
      '<div class="s-body">' + (sl.screen === 'GRID' ? grid() : sl.screen) + '</div>' +
      '<div class="s-nav"><i class="on"></i><i></i><i></i><i></i></div>';
    $('caption').innerHTML = sl.cap;
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.parentNode.classList.toggle('is-done', k < i); });
  }
  function auto() { if (REDUCED) return; clearInterval(timer); timer = setInterval(function () { show((idx + 1) % D.slides.length); }, 4200); }
  tabs.forEach(function (t) { t.addEventListener('click', function () { show(+t.dataset.i); auto(); }); });
  $('screen').addEventListener('click', function () { show((idx + 1) % D.slides.length); auto(); });
  show(0); auto();

  // E-books
  $('shelf').innerHTML = D.books.map(function (b) {
    return '<figure class="bookwrap' + (b.you ? ' is-you' : '') + '">' +
      (b.you ? '<span class="badge">Da sua jornada</span>' : '<span class="badge badge--soft">Também incluso</span>') +
      '<div class="book ' + b.cls + '"><div class="book__spine"></div><div class="book__front">' +
        '<small>E-book premium</small><strong>' + b.name + '</strong><span>' + b.sub + '</span><em>Método Recomeço 30</em>' +
      '</div></div></figure>';
  }).join('');

  // Pacote
  $('pack').innerHTML = D.pack.map(function (p) {
    return '<li><span>' + p[0] + '</span><div><strong>' + p[1] + '</strong><small>' + p[2] + '</small></div><b>✓</b></li>';
  }).join('');

  MR30.bindCheckoutLinks();
})();
