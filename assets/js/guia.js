/* Guia de Implementação de IA OdontoRise: progresso por página, copiar código, seletor macOS/Windows, tema. Sem tracking, sem rede. */
(function () {
  var root = document.documentElement;
  var page = document.body.getAttribute("data-page") || "guia";
  var KEY = "odr-guia-" + page;
  var storageOk = true;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motion = reduce ? "auto" : "smooth";

  function store(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { storageOk = false; return false; } }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { storageOk = false; return null; } }

  /* Tema: segue o sistema; o botão força claro ou escuro e lembra a escolha */
  var savedTheme = read("odr-guia-theme");
  if (savedTheme === "light" || savedTheme === "dark") root.setAttribute("data-theme", savedTheme);
  var themeBtn = document.querySelector(".theme");
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function labelTheme() { if (themeBtn) themeBtn.setAttribute("aria-label", isDark() ? "Mudar para tema claro" : "Mudar para tema escuro"); }
  if (themeBtn) {
    labelTheme();
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next); store("odr-guia-theme", next); labelTheme();
    });
  }

  /* Sistema operacional: detecta, deixa trocar; é um seletor global (grupo de rádio), não abas */
  function detectOS() {
    var saved = read("odr-guia-os");
    if (saved === "mac" || saved === "win") return saved;
    var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    return /win/i.test(p) ? "win" : "mac";
  }
  function setOS(os) {
    root.setAttribute("data-os", os); store("odr-guia-os", os);
    document.querySelectorAll(".os-tabs button").forEach(function (b) {
      var on = b.getAttribute("data-os") === os;
      b.classList.toggle("active", on); b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }
  setOS(detectOS());
  document.querySelectorAll(".os-tabs button").forEach(function (b) {
    b.addEventListener("click", function () { setOS(b.getAttribute("data-os")); });
  });

  /* Copiar: só o que deve ser colado (comentários <span class="c"> ficam de fora) */
  function textToCopy(pre) {
    var cl = pre.cloneNode(true);
    cl.querySelectorAll(".c").forEach(function (s) { s.remove(); });
    return cl.textContent.replace(/^[ \t]*\n/gm, "").trim();
  }
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest(".code"); var pre = box && box.querySelector("pre");
      if (!pre) return;
      var text = textToCopy(pre);
      function done() { btn.classList.add("ok"); btn.textContent = "Copiado"; setTimeout(function () { btn.classList.remove("ok"); btn.textContent = "Copiar"; }, 1500); }
      function fail() { btn.textContent = "Selecione e copie"; setTimeout(function () { btn.textContent = "Copiar"; }, 2500); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        if (ok) done(); else fail();
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  /* Progresso por passo e checklist: estado em memória, gravado no navegador quando possível */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step[data-step]"));
  var checks = Array.prototype.slice.call(document.querySelectorAll(".checklist input[data-check]"));
  var fill = document.querySelector(".progress .fill"), pct = document.querySelector(".progress .pct");
  var note = document.querySelector(".progress .note");
  function load() { try { return JSON.parse(read(KEY) || "{}") || {}; } catch (e) { return {}; } }
  var state = load();
  function save() { if (!store(KEY, JSON.stringify(state)) && note) note.textContent = "não salvo neste navegador"; }
  function render() {
    var n = 0;
    steps.forEach(function (el) {
      var k = el.getAttribute("data-step"), on = !!state[k]; if (on) n++;
      el.classList.toggle("done", on);
      var chk = el.querySelector(".step-check"); if (chk) chk.setAttribute("aria-checked", on ? "true" : "false");
    });
    checks.forEach(function (c) { c.checked = !!state[c.getAttribute("data-check")]; });
    var p = steps.length ? Math.round(100 * n / steps.length) : 0;
    if (fill) fill.style.width = p + "%"; if (pct) pct.textContent = p + "%";
  }
  steps.forEach(function (el) {
    var chk = el.querySelector(".step-check"); if (!chk) return;
    chk.addEventListener("click", function () {
      var k = el.getAttribute("data-step"); state[k] = !state[k]; save(); render();
    });
  });
  checks.forEach(function (c) {
    c.addEventListener("change", function () { state[c.getAttribute("data-check")] = c.checked; save(); });
  });
  var reset = document.querySelector(".progress .reset");
  if (reset) reset.addEventListener("click", function () { state = {}; save(); render(); });
  render();
  if (!storageOk && note) note.textContent = "não salvo neste navegador";

  /* Link "continuar do passo N" na barra: respeita o hash da URL, não rola sozinho */
  var cont = document.querySelector(".progress .continue");
  if (cont) {
    var first = steps.filter(function (el) { return !state[el.getAttribute("data-step")]; })[0];
    if (first && first !== steps[0] && !location.hash) {
      cont.href = "#" + first.id; cont.textContent = "continuar do passo " + first.querySelector(".num").textContent; cont.hidden = false;
    }
  }

  /* Voltar ao topo */
  var btt = document.querySelector(".btt");
  if (btt) {
    window.addEventListener("scroll", function () { btt.classList.toggle("show", window.scrollY > 400); });
    btt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: motion }); });
  }
})();
