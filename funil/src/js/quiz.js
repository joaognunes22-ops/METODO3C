/* Quiz conversacional — Doutora Cláudia (guia virtual).
 * Motor próprio e leve que reproduz o comportamento observado no motor de chat
 * dos ZIPs (Typebot v6): emulação de digitação a 400 palavras/min com atraso
 * máximo de 3 s, primeira mensagem sem atraso, bolhas sequenciais com avatar
 * no último balão, eco da resposta do visitante e entrada por botões. */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var FAST = params.get('fast') === '1'; // usado nos testes automatizados
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TYPING = { wpm: 400, maxDelay: 2200, minDelay: 600 };

  /* ---------- Conteúdo ---------- */

  var STEPS = [
    {
      key: 'dor',
      say: [
        'Oi, eu sou a Cláudia. 💜',
        'Antes de te mostrar um caminho para lidar melhor com essa fase, quero entender uma coisa sobre você.',
        '**O que mais está doendo nesse momento?**'
      ],
      options: [
        { v: 'saudade', icon: '💭', label: 'A saudade de quem foi embora' },
        { v: 'medo', icon: '🥀', label: 'O medo de nunca mais voltar' },
        { v: 'substituido', icon: '💔', label: 'A sensação de ter sido substituído(a)' },
        { v: 'seguir', icon: '🌫️', label: 'A dificuldade de seguir em frente' }
      ],
      react: {
        saudade: ['Saudade é uma das dores mais silenciosas. Ela aparece nos detalhes: uma música, um horário, um lugar.'],
        medo: ['Esse medo deixa tudo em suspenso, né? Como se a vida estivesse em pausa esperando uma resposta.'],
        substituido: ['Essa sensação mexe direto com o nosso valor. E dói mais ainda quando a gente começa a se comparar.'],
        seguir: ['Às vezes a gente até quer seguir, mas não sabe nem por onde começar. Isso é mais comum do que parece.']
      }
    },
    {
      key: 'situacao',
      say: ['Me conta um pouco da situação. **Como estão as coisas entre vocês hoje?**'],
      options: [
        { v: 'recente', icon: '🕯️', label: 'O término foi recente (menos de 1 mês)' },
        { v: 'meses', icon: '📅', label: 'Já faz alguns meses' },
        { v: 'longo', icon: '⏳', label: 'Faz mais de 6 meses, mas ainda penso muito' },
        { v: 'vaivem', icon: '🔁', label: 'Estamos num vai e volta' }
      ],
      react: {
        recente: ['Então está tudo muito fresco ainda. É natural que as emoções estejam intensas agora.'],
        meses: ['Alguns meses… e ainda assim continua ocupando espaço. Isso não é fraqueza, é sinal de que algo precisa ser cuidado.'],
        longo: ['Quando o tempo passa e o pensamento continua, geralmente é porque falta um caminho prático, não força de vontade.'],
        vaivem: ['Vai e volta cansa demais. A cabeça nunca descansa, porque nunca sabe em que pé está.']
      }
    },
    {
      key: 'comportamento',
      say: ['Sem julgamento nenhum, tá? 🤍', '**Depois do término, o que você mais tem feito?**'],
      options: [
        { v: 'perfil', icon: '📱', label: 'Olho o perfil, os stories, se a pessoa está online' },
        { v: 'conversas', icon: '💬', label: 'Releio conversas e vejo fotos antigas' },
        { v: 'mensagem', icon: '✉️', label: 'Penso em mandar mensagem (ou mando) e me arrependo' },
        { v: 'isolar', icon: '🚪', label: 'Me fecho e evito tudo que lembre a relação' }
      ],
      react: {
        perfil: ['Cada vez que a gente olha, o coração dispara e a esperança volta. É um ciclo que prende.'],
        conversas: ['Reler conversas é como reabrir a ferida todo dia. A intenção é matar a saudade, mas ela só aumenta.'],
        mensagem: ['Esse impulso é muito comum. E a sensação depois de mandar costuma ser pior do que antes, né?'],
        isolar: ['Se proteger é compreensível. Mas se fechar por muito tempo também cobra um preço.']
      }
    },
    {
      key: 'frequencia',
      say: ['**Com que frequência bate a vontade de procurar essa pessoa?**'],
      options: [
        { v: 'muitas', icon: '🔥', label: 'Várias vezes ao dia' },
        { v: 'diaria', icon: '🌙', label: 'Pelo menos uma vez por dia' },
        { v: 'asvezes', icon: '🌤️', label: 'De vez em quando' },
        { v: 'rara', icon: '🌿', label: 'Quase nunca' }
      ],
      react: {
        muitas: ['Entendi. Quando isso acontece várias vezes ao dia, sobra pouca energia para todo o resto.'],
        diaria: ['Todo dia um pouquinho… isso vai drenando a energia sem a gente perceber.'],
        asvezes: ['Que bom que não é o tempo todo. Ainda assim, quando vem, costuma vir forte.'],
        rara: ['Isso mostra que você já tem um bom controle sobre os impulsos. Vamos olhar o resto então.']
      }
    },
    {
      key: 'rotina',
      say: ['**E a sua rotina — trabalho, sono, concentração — como está?**'],
      options: [
        { v: 'muito', icon: '😮‍💨', label: 'Está muito difícil manter a rotina' },
        { v: 'alguns', icon: '🌧️', label: 'Alguns dias são bem difíceis' },
        { v: 'automatico', icon: '⚙️', label: 'Consigo, mas no automático, sem vontade' },
        { v: 'ok', icon: '☀️', label: 'Está relativamente tranquila' }
      ],
      react: {
        muito: ['Obrigada pela sinceridade. Isso me ajuda a entender o quanto essa fase está pesando.'],
        alguns: ['Dias bons e dias difíceis. Essa oscilação é bem característica dessa fase.'],
        automatico: ['Funcionar no automático é uma forma de sobreviver. Mas você merece mais do que só sobreviver.'],
        ok: ['Isso é uma ótima base para começar a reconstruir o resto.']
      }
    },
    {
      key: 'autoestima',
      say: ['Agora uma pergunta importante. **Como anda a sua autoestima e a sua confiança?**'],
      options: [
        { v: 'abalada', icon: '🪞', label: 'Bem abalada — me sinto insuficiente' },
        { v: 'oscila', icon: '🌗', label: 'Oscila muito, depende do dia' },
        { v: 'futuro', icon: '🧩', label: 'Estou bem comigo, mas insegura(o) com o futuro' },
        { v: 'boa', icon: '✨', label: 'Está boa, o problema é parar de pensar na pessoa' }
      ],
      react: {
        abalada: ['Quero que você saiba: um término fala sobre uma relação, não sobre o seu valor.'],
        oscila: ['Faz sentido. Quando a autoestima depende do dia, ela fica muito vulnerável a qualquer detalhe.'],
        futuro: ['A incerteza assusta mesmo. E é justamente com passos pequenos e concretos que ela diminui.'],
        boa: ['Que bom ter essa base. Então o foco é aprender a lidar com os pensamentos e os impulsos.']
      }
    },
    {
      key: 'jornada',
      say: [
        'Estou quase entendendo o seu momento. 🌱',
        'O Método Recomeço 30 tem **duas jornadas de 30 dias**. **Qual delas conversa mais com o que você está vivendo?**'
      ],
      options: [
        { v: 'florescer', icon: '🌸', cls: 'choice--journey choice--florescer', label: 'Jornada Florescer', sub: 'Jornada feminina · autoestima, autovalorização, limites e autonomia emocional' },
        { v: 'reconstruir', icon: '🧭', cls: 'choice--journey choice--reconstruir', label: 'Jornada Reconstruir', sub: 'Jornada masculina · autocontrole, respeito próprio, confiança e equilíbrio' }
      ],
      note: 'Escolha a que fizer mais sentido pra você. O acesso completo inclui as duas jornadas.',
      react: {
        florescer: ['Ótima escolha. Florescer é sobre voltar a se colocar em primeiro lugar. 🌸'],
        reconstruir: ['Ótima escolha. Reconstruir é sobre recuperar o controle e a firmeza. 🧭']
      }
    },
    {
      key: 'objetivo',
      say: ['Última pergunta. **O que você mais quer conquistar nos próximos 30 dias?**'],
      options: [
        { v: 'impulso', icon: '🛑', label: 'Parar de agir por impulso' },
        { v: 'autoestima', icon: '💎', label: 'Recuperar minha autoestima e meu respeito próprio' },
        { v: 'paz', icon: '🕊️', label: 'Ter paz para dormir e me concentrar' },
        { v: 'clareza', icon: '🔎', label: 'Ter clareza para decidir meus próximos passos' }
      ],
      react: {
        impulso: ['Anotado. Autocontrole se treina, um dia de cada vez.'],
        autoestima: ['Anotado. Respeito próprio se reconstrói com atitudes, e dá pra começar hoje.'],
        paz: ['Anotado. Recuperar a rotina é um dos primeiros sinais de que a vida está voltando ao eixo.'],
        clareza: ['Anotado. Clareza vem quando a emoção para de tomar todas as decisões.']
      }
    }
  ];

  var TEXT = {
    dor: { saudade: 'a saudade', medo: 'o medo de que essa história nunca mais volte', substituido: 'a sensação de que outra pessoa ocupou o seu lugar', seguir: 'a dificuldade de seguir em frente' },
    autoestima: { abalada: 'a insegurança', oscila: 'a oscilação da sua autoestima', futuro: 'a incerteza sobre o futuro', boa: 'os pensamentos sobre essa pessoa' },
    comportamento: { perfil: 'tem acompanhado o perfil e os stories da pessoa', conversas: 'tem relido conversas e revisto fotos antigas', mensagem: 'às vezes pensa em mandar mensagem (ou manda) e depois se arrepende', isolar: 'tem se fechado e evitado tudo que lembra a relação' },
    frequencia: { muitas: 'várias vezes ao dia', diaria: 'pelo menos uma vez por dia', asvezes: 'de vez em quando', rara: 'raramente' },
    objetivo: { impulso: 'parar de agir por impulso', autoestima: 'recuperar sua autoestima e seu respeito próprio', paz: 'voltar a ter paz para dormir e se concentrar', clareza: 'ter clareza para decidir seus próximos passos' }
  };

  var JOURNEYS = {
    florescer: {
      name: 'Jornada Florescer', icon: '🌸', tag: 'Jornada feminina · 30 aulas',
      lead: 'Um caminho de 30 dias para recuperar a autoestima, lidar com a dor do término e voltar a construir uma vida que seja sua.',
      items: ['Saudade e dependência emocional', 'A vontade de procurar o ex', 'O medo de ser esquecida e a sensação de rejeição', 'Autovalorização e limites emocionais', 'Reconstrução da confiança e desenvolvimento pessoal']
    },
    reconstruir: {
      name: 'Jornada Reconstruir', icon: '🧭', tag: 'Jornada masculina · 30 aulas',
      lead: 'Um caminho de 30 dias para recuperar o autocontrole, atravessar o sofrimento do término e reconstruir a confiança pessoal.',
      items: ['O impulso de mandar mensagens', 'Ansiedade após a separação', 'O medo de perder a ex definitivamente', 'Ciúme, insegurança e necessidade de aprovação', 'Respeito próprio, autocontrole e reconstrução emocional']
    }
  };

  /* ---------- Utilidades ---------- */

  var $log = document.getElementById('log');
  var $input = document.getElementById('input');
  var $progress = document.getElementById('progress');
  var $restart = document.getElementById('restart');
  var answers = {};
  var firstMessage = true;
  var runId = 0;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, FAST ? 0 : ms); }); }
  function scrollDown() { requestAnimationFrame(function () { $log.scrollTop = $log.scrollHeight; }); }

  function typingDelay(text) {
    if (REDUCED) return 250;
    var words = String(text).replace(/\*\*/g, '').trim().split(/\s+/).length;
    return Math.max(TYPING.minDelay, Math.min(words / TYPING.wpm * 60000, TYPING.maxDelay));
  }

  function avatar() { return '<div class="avatar"><img src="img/claudia-avatar.webp" alt="" width="34" height="34"></div>'; }

  function markLastHost() {
    var rows = $log.querySelectorAll('.msg-row--host');
    rows.forEach(function (r) { r.classList.remove('is-last'); });
    if (rows.length) rows[rows.length - 1].classList.add('is-last');
  }

  function setStatus(t) { document.getElementById('status').textContent = t; }

  async function say(text, id) {
    if (id !== runId) return;
    var row = el('div', 'msg-row msg-row--host is-last', avatar());
    if (!firstMessage) {
      var t = el('div', 'bubble bubble--host typing', '<span></span><span></span><span></span>');
      t.setAttribute('aria-label', 'Cláudia está digitando');
      row.appendChild(t);
      markLastHostAppend(row);
      setStatus('digitando…');
      await wait(typingDelay(text));
      if (id !== runId) return;
      t.remove();
    } else {
      markLastHostAppend(row);
    }
    firstMessage = false;
    row.appendChild(el('div', 'bubble bubble--host', md(text)));
    setStatus('online');
    scrollDown();
    await wait(180);
  }

  function markLastHostAppend(row) { $log.appendChild(row); markLastHost(); scrollDown(); }

  function guest(text) {
    var row = el('div', 'msg-row msg-row--guest');
    row.appendChild(el('div', 'bubble bubble--guest', esc(text)));
    $log.appendChild(row);
    scrollDown();
  }

  function progress(n) {
    var pct = Math.round(n / STEPS.length * 100);
    $progress.style.width = pct + '%';
    $progress.parentNode.setAttribute('aria-valuenow', pct);
  }

  function ask(step) {
    return new Promise(function (resolve) {
      var box = el('div', 'choices');
      box.setAttribute('role', 'group');
      step.options.forEach(function (o) {
        var b = el('button', 'choice ' + (o.cls || ''));
        b.type = 'button';
        b.dataset.value = o.v;
        b.innerHTML = '<span class="choice__icon" aria-hidden="true">' + o.icon + '</span><span class="choice__text">' + esc(o.label) + (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span>';
        b.addEventListener('click', function () {
          box.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          $input.innerHTML = '';
          resolve(o);
        }, { once: true });
        box.appendChild(b);
      });
      if (step.note) box.appendChild(el('p', 'choices__note', esc(step.note)));
      $input.innerHTML = '';
      $input.appendChild(box);
      scrollDown();
      var first = box.querySelector('button');
      if (first && !('ontouchstart' in window)) first.focus({ preventScroll: true });
    });
  }

  /* ---------- Resultado ---------- */

  function buildSummary(a) {
    var p = [];
    p.push('Pelas suas respostas, parece que você está vivendo uma fase em que <strong>' + TEXT.dor[a.dor] + '</strong> e <strong>' + TEXT.autoestima[a.autoestima] + '</strong> estão ocupando espaço demais na sua rotina.');
    p.push('Você me contou que ' + TEXT.comportamento[a.comportamento] + ', e que a vontade de procurar essa pessoa aparece <strong>' + TEXT.frequencia[a.frequencia] + '</strong>.');

    var extra = [];
    if (a.situacao === 'vaivem') extra.push('O vai e volta mantém a mente em alerta o tempo todo, e isso torna cada decisão mais difícil.');
    else if (a.situacao === 'longo') extra.push('O tempo, sozinho, nem sempre resolve: o que costuma fazer diferença é ter um caminho claro para seguir.');
    else if (a.situacao === 'recente') extra.push('Como o término é recente, é natural que as emoções estejam intensas, e é justamente agora que ter um plano faz diferença.');
    if (a.frequencia === 'muitas' || a.frequencia === 'diaria' || a.comportamento === 'mensagem') extra.push('Esse tipo de impulso é muito comum depois de um término, e é algo que dá para aprender a reconhecer e administrar.');
    if (a.rotina === 'muito' || a.rotina === 'alguns') extra.push('Também percebi que a rotina está pesando. Recuperar pequenos hábitos diários é um dos pontos de partida mais importantes.');
    if (extra.length) p.push(extra.join(' '));

    p.push('A boa notícia é que existem atitudes práticas que você pode começar a desenvolver para recuperar sua estabilidade emocional.');
    return p;
  }

  function renderResult(a) {
    var j = JOURNEYS[a.jornada];
    var ofertaUrl = MR30.internalUrl('oferta.html', { j: a.jornada });
    var html =
      '<div class="result" id="result" tabindex="-1">' +
        '<div class="result__head">' + avatar().replace('width="34" height="34"', 'width="52" height="52"') +
          '<div><div class="eyebrow">Seu resumo personalizado</div><div class="muted" style="font-size:14px">Preparado pela Cláudia a partir das suas respostas</div></div>' +
        '</div>' +
        '<div class="result__card">' +
          '<h1 class="result__title">O seu momento, em poucas palavras</h1>' +
          buildSummary(a).map(function (t) { return '<p>' + t + '</p>'; }).join('') +
          '<div class="result__goal"><span aria-hidden="true">🎯</span><span>Seu objetivo para os próximos 30 dias: <strong>' + TEXT.objetivo[a.objetivo] + '</strong>.</span></div>' +
        '</div>' +
        '<div class="journey-card journey-card--' + a.jornada + '">' +
          '<div class="eyebrow">Caminho indicado para você</div>' +
          '<h2>' + j.icon + ' ' + j.name + '</h2>' +
          '<p class="muted" style="margin:0 0 4px;font-size:14px">' + j.tag + '</p>' +
          '<p style="margin:10px 0 0">' + j.lead + '</p>' +
          '<ul>' + j.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="result__card">' +
          '<p style="margin:0">Dentro do <strong>Método Recomeço 30 Premium</strong> você recebe o aplicativo com a ' + j.name + ' (e também a outra jornada), dois e-books premium, exercícios, reflexões e acompanhamento do seu progresso.</p>' +
        '</div>' +
        '<div class="result__cta">' +
          '<a class="btn btn--block" id="cta-plano" href="' + ofertaUrl + '">Ver meu plano de 30 dias</a>' +
          '<a class="btn btn--ghost btn--block" id="cta-checkout" data-checkout href="#">Quero começar meu recomeço</a>' +
          '<p class="result__price">Acesso completo por <strong>' + MR30.PRICE_LABEL + '</strong> · pagamento único, sem mensalidade</p>' +
        '</div>' +
        '<p class="disclaimer">Este resumo é uma ferramenta de orientação e reflexão baseada apenas nas suas respostas. Não é diagnóstico nem avaliação psicológica, e o método não substitui acompanhamento profissional. Se você estiver em sofrimento intenso, procure ajuda: CVV, ligue 188 (24h, gratuito).</p>' +
      '</div>';
    $input.innerHTML = '';
    $log.insertAdjacentHTML('beforeend', html);
    MR30.bindCheckoutLinks($log);
    var r = document.getElementById('result');
    requestAnimationFrame(function () {
      $log.scrollTop = r.offsetTop - 12;
      r.focus({ preventScroll: true });
    });
  }

  /* ---------- Fluxo ---------- */

  async function run() {
    var id = ++runId;
    answers = {};
    firstMessage = true;
    $log.innerHTML = '';
    $input.innerHTML = '';
    progress(0);
    $restart.hidden = true;

    for (var i = 0; i < STEPS.length; i++) {
      var step = STEPS[i];
      for (var m = 0; m < step.say.length; m++) await say(step.say[m], id);
      if (id !== runId) return;
      var choice = await ask(step);
      if (id !== runId) return;
      answers[step.key] = choice.v;
      guest(choice.label);
      progress(i + 1);
      $restart.hidden = false;
      await wait(350);
      var reactions = (step.react && step.react[choice.v]) || [];
      for (var r = 0; r < reactions.length; r++) await say(reactions[r], id);
    }

    await say('Obrigada por confiar em mim até aqui. 💜', id);
    await say('Preparei um resumo do que você me contou e o caminho que faz mais sentido pra você agora 👇', id);
    if (id !== runId) return;
    answers.at = Date.now();
    MR30.answers.save(answers);
    await wait(400);
    renderResult(answers);
    setStatus('online');
  }

  $restart.addEventListener('click', function () { run(); });
  run();
})();
