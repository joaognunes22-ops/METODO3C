/* Quiz conversacional — Doutora Cláudia (guia virtual).
 * Motor próprio e leve que reproduz o comportamento observado no motor de chat
 * dos ZIPs (Typebot v6): emulação de digitação a 400 palavras/min, primeira
 * mensagem sem atraso, bolhas sequenciais com avatar no último balão, eco da
 * resposta do visitante e entrada por botões.
 *
 * Fluxo: a pessoa informa se é mulher ou homem → o visual muda (Florescer ou
 * Reconstruir) → segue um roteiro de perguntas próprio para cada público.
 * Entradas diretas /mulher.html e /homem.html (ou ?g=mulher|homem) pulam a
 * pergunta inicial — úteis para anúncios segmentados. */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var FAST = params.get('fast') === '1'; // usado nos testes automatizados
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TYPING = { wpm: 400, maxDelay: 2200, minDelay: 600 };
  var PRESET = (function () {
    var g = params.get('g') || document.documentElement.dataset.g;
    return g === 'mulher' || g === 'homem' ? g : null;
  })();

  /* ---------- Pergunta inicial ---------- */

  var GENDER_STEP = {
    key: 'genero',
    say: [
      'Oi, eu sou a Cláudia. 💜',
      'Antes de te mostrar um caminho para lidar melhor com essa fase, quero entender um pouco sobre você.',
      'Pra eu fazer as perguntas certas, me conta: **você é…**'
    ],
    options: [
      { v: 'mulher', icon: '🌸', cls: 'choice--gender choice--mulher', label: 'Sou mulher' },
      { v: 'homem', icon: '🧭', cls: 'choice--gender choice--homem', label: 'Sou homem' }
    ],
    note: 'Assim eu adapto a conversa ao que você está vivendo.'
  };

  /* ---------- Roteiro feminino — Jornada Florescer ---------- */

  var MULHER = {
    jornada: 'florescer',
    intro: {
      preset: ['Oi, eu sou a Cláudia. 🌸', 'Antes de te mostrar um caminho para lidar melhor com essa fase, quero entender uma coisa sobre você.'],
      chosen: ['Obrigada por me contar. 🌸', 'Vou te fazer algumas perguntas rápidas. Responda com o coração, sem pensar muito.']
    },
    steps: [
      {
        key: 'dor',
        say: ['**O que mais está doendo em você nesse momento?**'],
        options: [
          { v: 'saudade', icon: '💭', label: 'A saudade dele' },
          { v: 'medo', icon: '🥀', label: 'O medo de que nunca mais volte' },
          { v: 'substituida', icon: '💔', label: 'A sensação de ter sido substituída' },
          { v: 'seguir', icon: '🌫️', label: 'A dificuldade de seguir em frente' }
        ],
        react: {
          saudade: ['Saudade é uma das dores mais silenciosas. Ela aparece nos detalhes: uma música, um horário, um lugar.'],
          medo: ['Esse medo deixa tudo em suspenso, né? Como se a sua vida estivesse em pausa esperando uma resposta dele.'],
          substituida: ['Essa sensação mexe direto com o nosso valor. E dói ainda mais quando a gente começa a se comparar.'],
          seguir: ['Às vezes a gente até quer seguir, mas não sabe nem por onde começar. Isso é mais comum do que parece.']
        }
      },
      {
        key: 'situacao',
        say: ['Me conta um pouco da situação. **Como estão as coisas entre vocês hoje?**'],
        options: [
          { v: 'recente', icon: '🕯️', label: 'O término foi recente (menos de 1 mês)' },
          { v: 'meses', icon: '📅', label: 'Já faz alguns meses' },
          { v: 'longo', icon: '⏳', label: 'Faz mais de 6 meses, mas ainda penso muito nele' },
          { v: 'vaivem', icon: '🔁', label: 'Estamos num vai e volta' }
        ],
        react: {
          recente: ['Então está tudo muito fresco ainda. É natural que as emoções estejam à flor da pele.'],
          meses: ['Alguns meses… e ainda assim ele continua ocupando espaço. Isso não é fraqueza, é sinal de que algo precisa ser cuidado.'],
          longo: ['Quando o tempo passa e o pensamento continua, geralmente falta um caminho prático, não força de vontade.'],
          vaivem: ['Vai e volta cansa demais. O coração nunca descansa, porque nunca sabe em que pé está.']
        }
      },
      {
        key: 'comportamento',
        say: ['Sem julgamento nenhum, tá? 🤍', '**Depois do término, o que você mais tem feito?**'],
        options: [
          { v: 'perfil', icon: '📱', label: 'Fico olhando o perfil, os stories, se ele está online' },
          { v: 'conversas', icon: '💬', label: 'Releio nossas conversas e vejo fotos antigas' },
          { v: 'mensagem', icon: '✉️', label: 'Penso em mandar mensagem (ou mando) e me arrependo' },
          { v: 'comparar', icon: '🪞', label: 'Me comparo com outras mulheres e me sinto menos' }
        ],
        react: {
          perfil: ['Cada vez que a gente olha, o coração dispara e a esperança volta. É um ciclo que prende.'],
          conversas: ['Reler conversas é como reabrir a ferida todo dia. A intenção é matar a saudade, mas ela só aumenta.'],
          mensagem: ['Esse impulso é muito comum. E a sensação depois de mandar costuma ser pior do que antes, né?'],
          comparar: ['Comparação é cruel, porque a gente compara o nosso pior momento com a vitrine dos outros.']
        }
      },
      {
        key: 'frequencia',
        say: ['**Com que frequência bate a vontade de procurar ele?**'],
        options: [
          { v: 'muitas', icon: '🔥', label: 'Várias vezes ao dia' },
          { v: 'diaria', icon: '🌙', label: 'Pelo menos uma vez por dia' },
          { v: 'asvezes', icon: '🌤️', label: 'De vez em quando' },
          { v: 'rara', icon: '🌿', label: 'Quase nunca' }
        ],
        react: {
          muitas: ['Entendi. Quando isso acontece várias vezes ao dia, sobra pouca energia para cuidar de você.'],
          diaria: ['Todo dia um pouquinho… isso vai drenando a sua energia sem você perceber.'],
          asvezes: ['Que bom que não é o tempo todo. Ainda assim, quando vem, costuma vir forte.'],
          rara: ['Isso mostra que você já tem um bom controle sobre os impulsos. Vamos olhar o resto então.']
        }
      },
      {
        key: 'pensamento',
        say: ['**Qual desses pensamentos mais aparece na sua cabeça?**'],
        options: [
          { v: 'esquecida', icon: '🍂', label: '“Ele vai me esquecer rapidinho”' },
          { v: 'culpa', icon: '🧷', label: '“A culpa foi minha”' },
          { v: 'suficiente', icon: '🫧', label: '“Eu não fui suficiente”' },
          { v: 'sozinha', icon: '🌑', label: '“Eu vou acabar ficando sozinha”' }
        ],
        react: {
          esquecida: ['O medo de ser esquecida é um dos mais comuns depois de um término. E ele fala muito mais sobre a dor do que sobre a verdade.'],
          culpa: ['Assumir toda a culpa pesa demais. Uma relação é feita por duas pessoas.'],
          suficiente: ['Quero que você saiba: um término fala sobre uma relação, não sobre o seu valor.'],
          sozinha: ['Esse medo assusta, eu sei. Mas ele costuma ser a dor falando, não o seu futuro.']
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
        say: ['Agora uma pergunta importante. **Como anda a sua autoestima?**'],
        options: [
          { v: 'abalada', icon: '🪞', label: 'Bem abalada — me sinto insuficiente' },
          { v: 'oscila', icon: '🌗', label: 'Oscila muito, depende do dia' },
          { v: 'limites', icon: '🚧', label: 'Percebo que eu aceitava menos do que merecia' },
          { v: 'boa', icon: '✨', label: 'Está boa, o difícil é parar de pensar nele' }
        ],
        react: {
          abalada: ['Você não precisa se sentir assim pra sempre. Autoestima se reconstrói, um passo de cada vez.'],
          oscila: ['Faz sentido. Quando a autoestima depende do dia, ela fica vulnerável a qualquer detalhe.'],
          limites: ['Perceber isso já é um passo enorme. Limites são uma forma de se respeitar.'],
          boa: ['Que bom ter essa base. Então o foco é aprender a lidar com os pensamentos e os impulsos.']
        }
      },
      {
        key: 'objetivo',
        say: ['Última pergunta. **O que você mais quer conquistar nos próximos 30 dias?**'],
        options: [
          { v: 'impulso', icon: '🛑', label: 'Parar de procurar ele por impulso' },
          { v: 'autoestima', icon: '💎', label: 'Recuperar minha autoestima e meu valor' },
          { v: 'paz', icon: '🕊️', label: 'Voltar a ter paz, dormir bem e me concentrar' },
          { v: 'autonomia', icon: '🌱', label: 'Ter autonomia emocional e viver por mim' }
        ],
        react: {
          impulso: ['Anotado. Autocontrole se treina, um dia de cada vez.'],
          autoestima: ['Anotado. O seu valor nunca dependeu de quem foi embora.'],
          paz: ['Anotado. Recuperar a rotina é um dos primeiros sinais de que a vida está voltando ao eixo.'],
          autonomia: ['Anotado. Florescer é exatamente isso: voltar a se colocar em primeiro lugar.']
        }
      }
    ],
    text: {
      dor: { saudade: 'a saudade dele', medo: 'o medo de que essa história nunca mais volte', substituida: 'a sensação de ter sido substituída', seguir: 'a dificuldade de seguir em frente' },
      autoestima: { abalada: 'a insegurança', oscila: 'a oscilação da sua autoestima', limites: 'a percepção de que você aceitava menos do que merecia', boa: 'os pensamentos sobre ele' },
      comportamento: { perfil: 'tem acompanhado o perfil e os stories dele', conversas: 'tem relido conversas e revisto fotos antigas', mensagem: 'às vezes pensa em mandar mensagem (ou manda) e depois se arrepende', comparar: 'tem se comparado com outras mulheres' },
      frequencia: { muitas: 'várias vezes ao dia', diaria: 'pelo menos uma vez por dia', asvezes: 'de vez em quando', rara: 'raramente' },
      alvo: 'procurar ele',
      gatilho: 'uma música, uma foto, ver ele online',
      acao: { perfil: 'vai olhar o perfil dele', conversas: 'relê as conversas', mensagem: 'manda (ou quase manda) a mensagem', comparar: 'se compara com outras mulheres' },
      pensamento: {
        esquecida: 'O pensamento que mais volta é o medo de ser esquecida. Mas o seu valor não depende de quem lembra de você.',
        culpa: 'O pensamento que mais volta é o de que a culpa foi sua. Entender o que aconteceu é saudável; carregar tudo sozinha, não.',
        suficiente: 'O pensamento que mais volta é o de não ter sido suficiente. E é justamente esse que a Jornada Florescer ajuda a ressignificar.',
        sozinha: 'O pensamento que mais volta é o medo de ficar sozinha. Reconstruir a relação com você mesma é o primeiro passo para olhar o futuro com menos medo.'
      },
      objetivo: { impulso: 'parar de procurar ele por impulso', autoestima: 'recuperar sua autoestima e seu valor', paz: 'voltar a ter paz, dormir bem e se concentrar', autonomia: 'ter autonomia emocional e viver por você' }
    }
  };

  /* ---------- Roteiro masculino — Jornada Reconstruir ---------- */

  var HOMEM = {
    jornada: 'reconstruir',
    intro: {
      preset: ['Fala, eu sou a Cláudia. 🧭', 'Antes de te mostrar um caminho para atravessar essa fase, quero entender rapidamente a sua situação.'],
      chosen: ['Valeu por me contar. 🧭', 'Vou te fazer algumas perguntas rápidas e diretas. Responda com sinceridade, ninguém vai ver além de você.']
    },
    steps: [
      {
        key: 'dor',
        say: ['**O que mais está pegando em você nesse momento?**'],
        options: [
          { v: 'saudade', icon: '💭', label: 'A saudade dela' },
          { v: 'perder', icon: '⚠️', label: 'O medo de perder ela de vez' },
          { v: 'outro', icon: '💔', label: 'A ideia de ela estar com outro' },
          { v: 'controle', icon: '🌀', label: 'Sentir que perdi o controle da situação' }
        ],
        react: {
          saudade: ['Saudade pesa, e muito homem segura isso calado. Só de reconhecer, você já está à frente.'],
          perder: ['Esse medo deixa a cabeça em alerta o tempo todo. É difícil pensar com clareza assim.'],
          outro: ['Essa imagem machuca e costuma vir acompanhada de ciúme e comparação. É mais comum do que você imagina.'],
          controle: ['Perder o chão é uma das sensações mais difíceis. A boa notícia: autocontrole se recupera com método.']
        }
      },
      {
        key: 'situacao',
        say: ['**Como estão as coisas entre vocês hoje?**'],
        options: [
          { v: 'recente', icon: '🕯️', label: 'O término foi recente (menos de 1 mês)' },
          { v: 'meses', icon: '📅', label: 'Já faz alguns meses' },
          { v: 'longo', icon: '⏳', label: 'Faz mais de 6 meses, mas ainda penso muito nela' },
          { v: 'vaivem', icon: '🔁', label: 'Estamos num vai e volta' }
        ],
        react: {
          recente: ['Então está tudo muito recente. É natural que a cabeça esteja a mil.'],
          meses: ['Alguns meses e ainda ocupa espaço. Não é fraqueza, é sinal de que falta um plano.'],
          longo: ['Quando o tempo passa e o pensamento fica, o que costuma faltar é um caminho prático, não força.'],
          vaivem: ['Vai e volta desgasta demais. Você nunca sabe em que terreno está pisando.']
        }
      },
      {
        key: 'comportamento',
        say: ['Sem julgamento, é só entre nós.', '**Depois do término, o que você mais tem feito?**'],
        options: [
          { v: 'mensagem', icon: '✉️', label: 'Mando mensagem (ou quase mando) e me arrependo' },
          { v: 'perfil', icon: '📱', label: 'Fico vigiando o perfil e os stories dela' },
          { v: 'ciume', icon: '👀', label: 'Fico imaginando com quem ela está' },
          { v: 'ocupar', icon: '🏃', label: 'Me ocupo o tempo todo pra não pensar' }
        ],
        react: {
          mensagem: ['Esse impulso é um dos mais comuns. E quase sempre a sensação depois é pior do que antes.'],
          perfil: ['Cada olhada reacende tudo. É um ciclo que rouba o seu foco.'],
          ciume: ['Ciúme e insegurança andam juntos. A mente preenche as lacunas sempre com o pior cenário.'],
          ocupar: ['Se manter ativo ajuda, mas fugir o tempo todo só adia. Uma hora o pensamento cobra.']
        }
      },
      {
        key: 'frequencia',
        say: ['**Com que frequência bate o impulso de procurar ela?**'],
        options: [
          { v: 'muitas', icon: '🔥', label: 'Várias vezes ao dia' },
          { v: 'diaria', icon: '🌙', label: 'Pelo menos uma vez por dia' },
          { v: 'asvezes', icon: '🌤️', label: 'De vez em quando' },
          { v: 'rara', icon: '🧱', label: 'Quase nunca' }
        ],
        react: {
          muitas: ['Entendi. Várias vezes ao dia consome muita energia e muito foco.'],
          diaria: ['Todo dia um pouco… isso vai drenando a sua energia sem você perceber.'],
          asvezes: ['Bom que não é o tempo todo. Mas quando vem, costuma vir com força.'],
          rara: ['Isso mostra que você já segura bem o impulso. Vamos olhar o resto.']
        }
      },
      {
        key: 'pensamento',
        say: ['**Qual desses pensamentos mais te pega?**'],
        options: [
          { v: 'aprovacao', icon: '🎯', label: '“Preciso saber o que ela pensa de mim”' },
          { v: 'culpa', icon: '🧷', label: '“Eu podia ter feito diferente”' },
          { v: 'fraco', icon: '🪨', label: '“Estou fraco por sofrer assim”' },
          { v: 'ansiedade', icon: '⏱️', label: '“Essa ansiedade não passa”' }
        ],
        react: {
          aprovacao: ['A necessidade de aprovação deixa o seu humor na mão de outra pessoa. Dá pra virar esse jogo.'],
          culpa: ['Olhar para os próprios erros é maturidade. Ficar preso neles, não.'],
          fraco: ['Sofrer depois de um término não é fraqueza. Fraqueza seria não fazer nada a respeito.'],
          ansiedade: ['A ansiedade depois da separação é muito comum. E existem estratégias práticas para lidar com ela no dia a dia.']
        }
      },
      {
        key: 'rotina',
        say: ['**E a sua rotina — trabalho, sono, treino, foco — como está?**'],
        options: [
          { v: 'muito', icon: '😮‍💨', label: 'Está muito difícil manter a rotina' },
          { v: 'alguns', icon: '🌧️', label: 'Alguns dias são bem difíceis' },
          { v: 'automatico', icon: '⚙️', label: 'Funciono, mas no automático' },
          { v: 'ok', icon: '☀️', label: 'Está relativamente sob controle' }
        ],
        react: {
          muito: ['Valeu pela sinceridade. Isso mostra o quanto essa fase está pesando.'],
          alguns: ['Dias bons e dias ruins. Essa oscilação é típica dessa fase.'],
          automatico: ['Funcionar no automático é sobreviver. Você merece voltar a ter direção.'],
          ok: ['Ótimo. Rotina em ordem é uma base forte pra reconstruir o resto.']
        }
      },
      {
        key: 'autoestima',
        say: ['Pergunta importante. **Como anda a sua confiança e o seu respeito próprio?**'],
        options: [
          { v: 'abalada', icon: '📉', label: 'Bem abalados — me sinto por baixo' },
          { v: 'oscila', icon: '🌗', label: 'Oscilam muito, depende do dia' },
          { v: 'aprovacao', icon: '🎭', label: 'Dependo demais da aprovação dos outros' },
          { v: 'boa', icon: '💪', label: 'Estão ok, o problema é o impulso e a ansiedade' }
        ],
        react: {
          abalada: ['Confiança se reconstrói com atitudes pequenas e repetidas. Dá pra começar hoje.'],
          oscila: ['Faz sentido. Confiança que depende do dia fica vulnerável a qualquer detalhe.'],
          aprovacao: ['Reconhecer isso é o primeiro passo para voltar a se guiar pelos seus próprios critérios.'],
          boa: ['Boa base. Então o foco é treinar o autocontrole e lidar com a ansiedade.']
        }
      },
      {
        key: 'objetivo',
        say: ['Última pergunta. **O que você mais quer conquistar nos próximos 30 dias?**'],
        options: [
          { v: 'impulso', icon: '🛑', label: 'Parar de agir por impulso' },
          { v: 'respeito', icon: '🛡️', label: 'Recuperar meu respeito próprio e minha confiança' },
          { v: 'foco', icon: '🎯', label: 'Voltar a ter foco e dormir bem' },
          { v: 'controle', icon: '🧭', label: 'Retomar o controle da minha vida' }
        ],
        react: {
          impulso: ['Anotado. Autocontrole se treina, um dia de cada vez.'],
          respeito: ['Anotado. Respeito próprio se reconstrói com atitude, e dá pra começar hoje.'],
          foco: ['Anotado. Recuperar foco e sono é um dos primeiros sinais de que a vida está voltando ao eixo.'],
          controle: ['Anotado. Reconstruir é exatamente isso: retomar o comando.']
        }
      }
    ],
    text: {
      dor: { saudade: 'a saudade dela', perder: 'o medo de perder ela de vez', outro: 'a ideia de ela estar com outro', controle: 'a sensação de ter perdido o controle' },
      autoestima: { abalada: 'a falta de confiança', oscila: 'a oscilação da sua confiança', aprovacao: 'a necessidade de aprovação', boa: 'a ansiedade e o impulso' },
      comportamento: { mensagem: 'às vezes manda mensagem (ou quase manda) e depois se arrepende', perfil: 'tem vigiado o perfil e os stories dela', ciume: 'fica imaginando com quem ela está', ocupar: 'tem se ocupado o tempo todo para não pensar' },
      frequencia: { muitas: 'várias vezes ao dia', diaria: 'pelo menos uma vez por dia', asvezes: 'de vez em quando', rara: 'raramente' },
      alvo: 'procurar ela',
      gatilho: 'uma música, uma foto, ver ela online',
      acao: { mensagem: 'manda (ou quase manda) a mensagem', perfil: 'vai olhar o perfil dela', ciume: 'fica imaginando com quem ela está', ocupar: 'se enche de coisas para não pensar' },
      pensamento: {
        aprovacao: 'O pensamento que mais te pega é a necessidade de saber o que ela pensa de você. Enquanto isso ditar o seu humor, o controle fica nas mãos dela.',
        culpa: 'O pensamento que mais te pega é o de que você podia ter feito diferente. Aprender com isso é útil; ficar preso nisso, não.',
        fraco: 'O pensamento que mais te pega é o de estar fraco por sofrer. Sofrer não é fraqueza: é o ponto de partida para se reconstruir.',
        ansiedade: 'O que mais te pega é a ansiedade que não passa. Ela tende a diminuir quando você tem uma rotina e estratégias claras para os momentos de impulso.'
      },
      objetivo: { impulso: 'parar de agir por impulso', respeito: 'recuperar seu respeito próprio e sua confiança', foco: 'voltar a ter foco e dormir bem', controle: 'retomar o controle da sua vida' }
    }
  };

  var TRACKS = { mulher: MULHER, homem: HOMEM };

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
  var totalSteps = MULHER.steps.length + (PRESET ? 0 : 1);

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, FAST ? 0 : ms); }); }
  function scrollDown() { requestAnimationFrame(function () { $log.scrollTop = $log.scrollHeight; }); }

  function setTheme(g) {
    var theme = g ? TRACKS[g].jornada : 'neutro';
    document.documentElement.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'reconstruir' ? '#141c2e' : theme === 'florescer' ? '#fbf3ef' : '#fbf7f2';
  }

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
  function appendHost(row) { $log.appendChild(row); markLastHost(); scrollDown(); }
  function setStatus(t) { document.getElementById('status').textContent = t; }

  async function say(text, id) {
    if (id !== runId) return;
    var row = el('div', 'msg-row msg-row--host is-last', avatar());
    if (!firstMessage) {
      var t = el('div', 'bubble bubble--host typing', '<span></span><span></span><span></span>');
      t.setAttribute('aria-label', 'Cláudia está digitando');
      row.appendChild(t);
      appendHost(row);
      setStatus('digitando…');
      await wait(typingDelay(text));
      if (id !== runId) return;
      t.remove();
    } else {
      appendHost(row);
    }
    firstMessage = false;
    row.appendChild(el('div', 'bubble bubble--host', md(text)));
    setStatus('online');
    scrollDown();
    await wait(180);
  }

  function guest(text) {
    var row = el('div', 'msg-row msg-row--guest');
    row.appendChild(el('div', 'bubble bubble--guest', esc(text)));
    $log.appendChild(row);
    scrollDown();
  }

  function progress(n) {
    var pct = Math.round(n / totalSteps * 100);
    $progress.style.width = pct + '%';
    $progress.parentNode.setAttribute('aria-valuenow', pct);
  }

  function ask(step) {
    return new Promise(function (resolve) {
      var box = el('div', 'choices' + (step.key === 'genero' ? ' choices--gender' : ''));
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

  function buildSummary(track, a) {
    var T = track.text, p = [];
    p.push('Pelas suas respostas, parece que você está vivendo uma fase em que <strong>' + T.dor[a.dor] + '</strong> e <strong>' + T.autoestima[a.autoestima] + '</strong> estão ocupando espaço demais na sua rotina.');
    p.push('Você me contou que ' + T.comportamento[a.comportamento] + ', e que a vontade de ' + T.alvo + ' aparece <strong>' + T.frequencia[a.frequencia] + '</strong>.');
    p.push('Isso tem nome: é o <strong>Ciclo do Impulso</strong>. Um gatilho aparece (' + T.gatilho + '), vem a vontade de ' + T.alvo + ', você ' + T.acao[a.comportamento] + ', sente um alívio de alguns segundos… e logo a dor volta mais forte. Cada volta deixa o ciclo mais automático. <strong>Não é falta de força de vontade: é um padrão. E padrões podem ser interrompidos.</strong>');
    p.push(T.pensamento[a.pensamento]);

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

  function mechanismHtml() {
    return '<div class="mech">' +
      '<div class="eyebrow">Como quebrar o seu ciclo</div>' +
      '<h2 class="mech__h">3 movimentos por dia, durante 30 dias</h2>' +
      '<ol class="mech__list">' +
        '<li><b>1</b><span><strong>Entender</strong> · a aula do dia mostra o gatilho por trás do que você sente.</span></li>' +
        '<li><b>2</b><span><strong>Interromper</strong> · um exercício te dá uma atitude pronta para o momento do impulso.</span></li>' +
        '<li><b>3</b><span><strong>Reforçar</strong> · uma reflexão fecha o dia e o app marca o seu progresso.</span></li>' +
      '</ol>' +
      '<p class="mech__note">Repetir a nova resposta todos os dias é o que vai enfraquecendo a antiga.</p>' +
    '</div>';
  }

  function renderResult(track, a) {
    var j = JOURNEYS[track.jornada];
    var ofertaUrl = MR30.internalUrl('receba.html', { j: track.jornada });
    var html =
      '<div class="result" id="result" tabindex="-1">' +
        '<div class="result__head">' + avatar().replace('width="34" height="34"', 'width="52" height="52"') +
          '<div><div class="eyebrow">Seu resumo personalizado</div><div class="muted" style="font-size:14px">Preparado pela Cláudia a partir das suas respostas</div></div>' +
        '</div>' +
        '<div class="result__card">' +
          '<h1 class="result__title">O seu momento, em poucas palavras</h1>' +
          buildSummary(track, a).map(function (t) { return '<p>' + t + '</p>'; }).join('') +
          '<div class="result__goal"><span aria-hidden="true">🎯</span><span>Seu objetivo para os próximos 30 dias: <strong>' + track.text.objetivo[a.objetivo] + '</strong>.</span></div>' +
        '</div>' +
        mechanismHtml() +
        '<div class="journey-card journey-card--' + track.jornada + '">' +
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
          '<a class="btn btn--block" id="cta-plano" href="' + ofertaUrl + '">Ver o que eu vou receber</a>' +
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
    var done = 0, i, m, r, reactions;
    answers = {};
    firstMessage = true;
    $log.innerHTML = '';
    $input.innerHTML = '';
    progress(0);
    $restart.hidden = true;

    var g = PRESET;
    setTheme(g);
    if (!g) {
      for (m = 0; m < GENDER_STEP.say.length; m++) await say(GENDER_STEP.say[m], id);
      if (id !== runId) return;
      var gc = await ask(GENDER_STEP);
      if (id !== runId) return;
      g = gc.v;
      guest(gc.label);
      progress(++done);
      $restart.hidden = false;
      setTheme(g);
      await wait(350);
    }
    var track = TRACKS[g];
    answers.genero = g;
    answers.jornada = track.jornada;

    var intro = PRESET ? track.intro.preset : track.intro.chosen;
    for (m = 0; m < intro.length; m++) await say(intro[m], id);

    for (i = 0; i < track.steps.length; i++) {
      var step = track.steps[i];
      for (m = 0; m < step.say.length; m++) await say(step.say[m], id);
      if (id !== runId) return;
      var choice = await ask(step);
      if (id !== runId) return;
      answers[step.key] = choice.v;
      guest(choice.label);
      progress(++done);
      $restart.hidden = false;
      await wait(350);
      reactions = (step.react && step.react[choice.v]) || [];
      for (r = 0; r < reactions.length; r++) await say(reactions[r], id);
    }

    await say(g === 'homem' ? 'Valeu por confiar em mim até aqui.' : 'Obrigada por confiar em mim até aqui. 💜', id);
    await say('Percebi um **padrão** bem claro nas suas respostas, e ele tem nome.', id);
    await say('Preparei um resumo do que você me contou, o que está por trás disso e o caminho que faz mais sentido pra você agora 👇', id);
    if (id !== runId) return;
    answers.at = Date.now();
    MR30.answers.save(answers);
    await wait(400);
    renderResult(track, answers);
    setStatus('online');
  }

  $restart.addEventListener('click', function () { run(); });
  run();
})();
