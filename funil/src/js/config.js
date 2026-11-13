/* Configuração central do funil — Método Recomeço 30 Premium.
 * Único lugar onde o checkout é definido. Não altere preço/produto aqui:
 * o valor (R$ 19,90, pagamento único) é definido na própria Cakto. */
window.MR30 = {
  CHECKOUT_URL: 'https://pay.cakto.com.br/z5yir23_1318125',
  APP_URL: 'https://metodo-recomeco-30.joaognunes22.workers.dev',
  PRICE_LABEL: 'R$ 19,90',
  // Parâmetros de rastreamento repassados ao checkout quando presentes na URL de entrada.
  TRACKING_KEYS: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'src', 'sck', 'xcod', 'fbclid', 'gclid', 'ttclid']
};

(function () {
  var KEY = 'mr30_tracking';
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  // Guarda os parâmetros de rastreamento da primeira página visitada (anúncio → quiz → oferta).
  function captureTracking() {
    var saved = {};
    try { saved = JSON.parse(store.get(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    var params = new URLSearchParams(location.search);
    MR30.TRACKING_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v && /^[\w\-.~%+:|]{1,200}$/.test(v)) saved[k] = v;
    });
    store.set(KEY, JSON.stringify(saved));
    return saved;
  }

  MR30.tracking = captureTracking();

  MR30.checkoutUrl = function (extra) {
    var url = new URL(MR30.CHECKOUT_URL);
    // Rastreamento real vindo do anúncio tem prioridade sobre valores padrão.
    var t = Object.assign({}, extra || {}, MR30.tracking);
    Object.keys(t).forEach(function (k) { if (t[k]) url.searchParams.set(k, t[k]); });
    return url.toString();
  };

  // Links internos (quiz → oferta) carregam o rastreamento adiante.
  MR30.internalUrl = function (path, extra) {
    var url = new URL(path, location.href);
    var t = Object.assign({}, MR30.tracking, extra || {});
    Object.keys(t).forEach(function (k) { if (t[k]) url.searchParams.set(k, t[k]); });
    return url.pathname + url.search;
  };

  // Todo elemento com [data-checkout] aponta para o checkout oficial.
  MR30.bindCheckoutLinks = function (root) {
    (root || document).querySelectorAll('[data-checkout]').forEach(function (a) {
      a.href = MR30.checkoutUrl(a.dataset.checkoutSrc ? { src: a.dataset.checkoutSrc } : null);
      a.rel = 'noopener';
    });
  };

  MR30.answers = {
    load: function () { try { return JSON.parse(store.get('mr30_quiz') || 'null'); } catch (e) { return null; } },
    save: function (a) { store.set('mr30_quiz', JSON.stringify(a)); }
  };
})();
