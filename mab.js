/* =====================================================================
   Miss Amy's Bakery - site helpers (mab.js) v2.5
   Design + code: TryLab Studio
   Loaded once on every page (Square Site-wide custom code + a tiny Embed for the editor).
   Each part below looks for its own Square blocks by id. If a block is not on the page,
   that part simply does nothing. Moving between pages with the menu is handled too.
   To change a part: edit the "EDIT HERE" lines inside it, upload this file to GitHub,
   then open https://purge.jsdelivr.net/gh/Ktryniak/missamys-site@main/mab.js
   ===================================================================== */
(function(){
  if (window.MAB) return;
  window.MAB = "2.5";
  var M = [];
  /* run a part in the next frame, before the browser paints (no flash of the old design) */
  function mabQ(id, f){ if (id) cancelAnimationFrame(id); return requestAnimationFrame(function(){ try { f(); } catch (e) {} }); }
  /* ----- shared helpers for the Square editor ----- */
  /* true inside the Square editor (not on the live site, not in Preview) */
  var MAB_ED = false;
  try { MAB_ED = window.top !== window && !/preview/i.test(window.top.location.href); } catch (e) { MAB_ED = window.top !== window; }
  /* mabEd(el, "text"): editor only, a dashed raspberry frame with a small note on top, so Amy sees where to edit */
  function mabEd(el, txt){ if (MAB_ED && el && el.getAttribute("data-mabed") !== txt) el.setAttribute("data-mabed", txt); }
  if (MAB_ED) {
    var edst = document.createElement("style");
    edst.textContent = "[data-mabed]{outline:2px dashed #9B1B45!important;outline-offset:-4px;position:relative}" +
      "[data-mabed]:before{content:attr(data-mabed);position:absolute;z-index:6;top:8px;right:8px;max-width:min(520px,calc(100% - 16px));background:#9B1B45;color:#fff;font:700 11px/1.4 sans-serif;letter-spacing:.06em;text-transform:uppercase;text-align:left;padding:5px 9px;border-radius:5px;pointer-events:none;white-space:normal}" +
      ".mabprev{pointer-events:none!important;position:relative;margin-bottom:28px!important}" +
      ".mabprev:before{content:\"PREVIEW: how it looks on the live site. Edit in the dashed box below\";display:block;margin:0 0 12px;font:700 11px/1.4 sans-serif;letter-spacing:.06em;color:#9B1B45}";
    (document.head || document.documentElement).appendChild(edst);
  }
  /* mabPrev(src): editor only. Puts a live copy of a Square grid ABOVE it (class mabprev) for the designed look,
     and keeps the original grid plain and editable below. Design CSS then targets ".mabprev" in the editor. */
  function mabPrev(src, label){
    if (!MAB_ED || !src) return null;
    var prev = src.previousElementSibling; if (!(prev && prev.classList.contains("mabprev"))) prev = null;
    var key = src.innerHTML.length + "|" + src.textContent;
    if (!prev || prev.mabK !== key) {
      var c = src.cloneNode(true); c.classList.add("mabprev"); c.setAttribute("aria-hidden", "true"); c.mabK = key;
      var ids = c.querySelectorAll("[id]"); for (var i = 0; i < ids.length; i++) ids[i].removeAttribute("id");
      if (prev) prev.replaceWith(c); else src.parentNode.insertBefore(c, src);
      prev = c;
    }
    mabEd(src, label);
    return prev;
  }
  /* mabBg(block, fallback): the background color picked for the block in Square.
     Cream (the page color) or nothing picked = fallback, so the panel never disappears into the page. */
  var mabProbe = null;
  function mabCol(c){
    if (!c) return "";
    if (!mabProbe) { mabProbe = document.createElement("i"); mabProbe.style.display = "none"; (document.body || document.documentElement).appendChild(mabProbe); }
    mabProbe.style.color = ""; mabProbe.style.color = c; return mabProbe.style.color ? getComputedStyle(mabProbe).color : "";
  }
  function mabBg(bl, fallback, page){
    var v = (bl.style.getPropertyValue("background-color") || "").trim();
    var m = v.match(/^var\(\s*(--[^,)\s]+)/); if (m) v = getComputedStyle(bl).getPropertyValue(m[1]).trim();
    var c = mabCol(v);
    if (!c || c === "rgba(0, 0, 0, 0)" || c === mabCol(page || "#F7EFE6")) return fallback;
    return c;
  }
  /* while the page is still loading: keep the blocks hidden until they are styled (max 2.5 s), the menu stays visible */
  if (document.readyState === "loading") {
    var R = document.documentElement, sh = document.createElement("style");
    sh.textContent = "html.mab-wait [data-block-purpose]:not([data-block-purpose^=header]):not([data-block-purpose^=nav-mobile]):not([data-block-purpose^=cart]){opacity:0!important}";
    (document.head || R).appendChild(sh); R.classList.add("mab-wait");
    var off = function(){ R.classList.remove("mab-wait"); };
    document.addEventListener("DOMContentLoaded", function(){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ setTimeout(off, 60); }); }); });
    setTimeout(off, 2500);
  }

  /* ---------- Hide the loader Embed + menu above badges ---------- */
  M.push(["embedfix", function(){
    /* Hides the Embed block that loads this file (mab-loader-embed), with all the space around it,
       and keeps the spinning badges from covering the menu (without touching the Square header itself). */
    var D = document;
    var S =
      "[data-mabl]{height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}" +
      ".mabh-art,.mabsh-art,.mabwh-art{isolation:isolate}";   /* badges stay inside their photo, never above the menu */
    function isLoader(f){
      try {
        if ((f.getAttribute("srcdoc") || "").indexOf("mab-js") > -1) return 1;
        var d = f.contentDocument; if (!d || !d.documentElement) return 0;
        var h = d.documentElement.innerHTML; if (!h || h.length < 40) return 0;   /* not loaded yet, check again later */
        return h.indexOf("mab-js") > -1 ? 1 : -1;
      } catch (e) { return -1; }                                                 /* other site (map etc.) */
    }
    function run(){
      var fs = D.querySelectorAll("iframe:not([data-mabchk])");
      for (var i = 0; i < fs.length; i++){
        var f = fs[i], r = isLoader(f); if (!r) continue;
        f.setAttribute("data-mabchk", "");
        if (r < 0) continue;
        for (var el = f.parentElement; el && el !== D.body; el = el.parentElement){
          el.setAttribute("data-mabl", "");
          if (el.hasAttribute("data-block-purpose")) {
            var c = el.parentElement; if (c && c.classList.contains("w-cell") && c.children.length === 1) c.setAttribute("data-mabl", "");
            break;
          }
        }
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(q).observe(D.documentElement, { childList: true, subtree: true });
    addEventListener("load", q); q(); setTimeout(q, 1000); setTimeout(q, 2500); setTimeout(q, 5000);
  }]);

  /* ---------- Phones: button + arrow link side by side ---------- */
  M.push(["btnfit", function(){
    /* Phones: a filled button + an arrow link (CALL US, WEDDING GALLERY ...) stay side by side.
       The text gets a little smaller until both fit in one row (never below MIN px); if they still do not fit, they stack. */
    var MIN = 11, MAX = 15, GAP = 12;
    var D = document, done = [];
    var st = D.createElement("style");
    st.textContent = "@media(max-width:767px){body{overflow-x:clip}}";
    D.head.appendChild(st);
    function set(el, k, v){ el.style.setProperty(k, v, "important"); done.push([el, k]); }
    function reset(){ done.forEach(function(x){ x[0].style.removeProperty(x[1]); }); done = []; }
    function texts(g){ return g.querySelectorAll(".w-button p, .w-button>span:not(.bb), .w-button>span *, a.mf *, .mab-arrowbtn *"); }
    function fit(){
      reset();
      if (innerWidth >= 768) return;
      var gs = D.querySelectorAll(".button-group");
      for (var i = 0; i < gs.length; i++){
        var g = gs[i]; if (g.closest("header,nav,footer,form")) continue;
        if (!g.querySelector("a.mf,.mab-arrowbtn")) continue;
        var ws = [].filter.call(g.children, function(c){ return c.offsetParent !== null || c.getClientRects().length; });
        if (ws.length !== 2) continue;
        set(g, "flex-wrap", "nowrap"); set(g, "flex-direction", "row"); set(g, "align-items", "center"); set(g, "justify-content", "flex-start"); set(g, "gap", GAP + "px");
        ws.forEach(function(w){ set(w, "flex", "0 0 auto"); set(w, "width", "auto"); set(w, "min-width", "0"); set(w, "margin", "0"); });
        var fb = g.querySelector(".w-button:not(.mf):not(.mab-arrowbtn)");
        if (fb) { set(fb, "width", "auto"); set(fb, "min-width", "0"); set(fb, "padding-left", "14px"); set(fb, "padding-right", "14px"); set(fb, "white-space", "nowrap"); }
        var tx = texts(g), gl = g.getBoundingClientRect().left, avail = Math.min(g.parentElement ? g.parentElement.clientWidth : innerWidth, D.documentElement.clientWidth - Math.max(gl, 0) - 16);
        function used(){ return ws[0].getBoundingClientRect().width + ws[1].getBoundingClientRect().width + GAP; }
        var fs = MAX;
        for (; fs >= MIN; fs -= .5){
          for (var k = 0; k < tx.length; k++) set(tx[k], "font-size", fs + "px");
          if (used() <= avail) break;
        }
        if (fs < MIN) {   /* does not fit even small: stack them, normal size */
          for (var k2 = 0; k2 < tx.length; k2++) tx[k2].style.removeProperty("font-size");
          set(g, "flex-wrap", "wrap"); set(g, "row-gap", "14px");
        }
      }
    }
    var t; function q(){ clearTimeout(t); t = setTimeout(fit, 120); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { if (ms[i].type === "childList") { q(); return; } } }).observe(D.body, { childList: true, subtree: true });
    addEventListener("resize", q); addEventListener("load", q);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(q);
    q(); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- Home banner ---------- */
  M.push(["hero", function(){
    /* ===== EDIT HERE ===== */
    var BLOCKS = ["NRXSyt"];            /* id of the Square banner block */
    var INK = "#9B1B45", CREAM = "#F7EFE6", BLUSH = "#F9CFD8", PISTA = "#D5E6C8";
    var HIGHLIGHT = "new";              /* word in the headline to put on a pink tag, "" = none */
    var TILT = 0;                       /* photo tilt in degrees */
    var DUOTONE = false;                /* true = tint the photo raspberry and pink */
    /* Spinning badge on the photo (Lolo style): CENTER stays still, RING text turns around it.
       Other ring idea: "Small-batch gourmet bakery \u00B7 Wooster, OH \u00B7 " */
    var CENTER = ["Since", "2018"];
    var RING = "Gluten-free \u00B7 Vegan \u00B7 Keto \u00B7 ";
    var BADGE_BG = "#81D8D0", BADGE_FG = "#9B1B45";   /* tiffany badge with raspberry text */
    /* Phones: the headline is split into 2 even lines by itself (3 if the text is very long) and grows to fill the width.
       Works with any headline text written in Square. */
    var MOBILE_MAX = 64;                /* biggest headline size on phones, px */
    var MOBILE_MIN = 30;                /* if 2 lines would be smaller than this, use 3 lines */
    /* ===================== */
    var D = document;
    var S =
      ".mabh .container{text-align:left!important;padding-top:clamp(16px,2.5vw,36px)!important;padding-bottom:clamp(28px,4vw,56px)!important}" +
      ".mabh .element-group,.mabh .element-group *{text-align:left!important}" +
      ".mabh .button-group{justify-content:flex-start!important}" +
       ".mabh .mabh-br{display:none}" +
      ".mabh .mabh-hl{display:inline-block;background:" + BLUSH + ";padding:0 .12em;border-radius:.12em;transform:rotate(-2deg)}" +
      ".mabh .mabh-art{position:relative!important;width:min(612px,100%);max-width:100%;margin:0 0 0 auto!important}" +
      ".mabh .mabh-art figure{margin:0!important;transform:rotate(" + TILT + "deg)}" +
      ".mabh .mabh-art .figure__aspect-ratio{display:block!important;position:relative!important;aspect-ratio:17/16!important;height:auto!important;padding:0!important;border-radius:50% 50% 18px 18px / 40% 40% 18px 18px!important;overflow:hidden!important;border:1px solid rgba(155,27,69,.35);background:" + BLUSH + ";isolation:isolate}" +
      ".mabh .mabh-art .figure__aspect-ratio .image,.mabh .mabh-art img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important}" +
      ".mabh.mabh-duo .mabh-art img{filter:grayscale(1) contrast(1.15) brightness(1.05);mix-blend-mode:multiply}" +
      ".mabh.mabh-duo .mabh-art .figure__aspect-ratio:after{content:\"\";position:absolute;inset:0;background:" + INK + ";mix-blend-mode:lighten;pointer-events:none;z-index:2}" +
      ".mabh .mabh-bd{position:absolute;z-index:5;left:-56px;bottom:12%;width:150px;height:150px;border-radius:50%;background:" + BADGE_BG + ";color:" + BADGE_FG + ";pointer-events:none;animation:mabhIn .6s cubic-bezier(.2,.9,.3,1.3) both}" +
      ".mabh .mabh-ring{position:absolute;inset:0;animation:mabhSpin 18s linear infinite}" +
      ".mabh .mabh-ring span{position:absolute;left:50%;top:9px;height:66px;width:12px;margin-left:-6px;transform-origin:50% 66px;text-align:center;font:700 13.5px/1 \"Niramit Bold\",\"Niramit\",sans-serif;text-transform:uppercase}" +
      ".mabh .mabh-mid{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font:700 .62rem/1 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.2em;text-transform:uppercase}" +
      ".mabh .mabh-mid b{display:block;font:800 1.9rem/1 \"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif;letter-spacing:-.03em;margin-top:2px}" +
      "@keyframes mabhSpin{to{transform:rotate(360deg)}}" +
      "@keyframes mabhIn{from{opacity:0;scale:.6}}" +
      "@media(max-width:767px){.mabh .mabh-art{width:80%;margin:0 auto 6px!important}.mabh .mabh-art figure{transform:none!important}.mabh .mabh-art .figure__aspect-ratio{aspect-ratio:5/6!important;border-radius:50% 50% 16px 16px / 40% 40% 16px 16px!important}.mabh .mabh-bd{transform:scale(.62);transform-origin:left bottom;left:6px;bottom:6px}.mabh h1,.mabh h1 *{font-size:var(--mabh-fs,clamp(28px,8.4vw,40px))!important;line-height:.98!important}.mabh .mabh-br{display:inline}.mabh .button-group{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:10px!important}.mabh .button-group .button-wrapper{flex:1 1 0!important;min-width:0!important;margin:0!important;width:auto!important}.mabh .button-group .w-button{width:100%!important;min-width:0!important;padding-left:10px!important;padding-right:10px!important}.mabh .button-group .w-button p{font-size:14px!important;white-space:nowrap}}" +
      "@media(prefers-reduced-motion:reduce){.mabh .mabh-bd,.mabh .mabh-ring{animation:none}}";
    function highlight(bl){
      if (!HIGHLIGHT || bl.querySelector(".mabh-hl")) return;
      var h = bl.querySelector("h1"); if (!h) return;
      var w = D.createTreeWalker(h, NodeFilter.SHOW_TEXT), n, re = new RegExp("\\b(" + HIGHLIGHT + ")\\b", "i");
      while ((n = w.nextNode())) {
        var m = n.nodeValue.match(re); if (!m) continue;
        var r = n.splitText(m.index); r.splitText(m[0].length);
        var s = D.createElement("span"); s.className = "mabh-hl"; s.textContent = r.nodeValue; r.parentNode.replaceChild(s, r);
        return;
      }
    }
    var cv;
    function fit(){
      for (var b = 0; b < BLOCKS.length; b++){
        var wrap = D.getElementById(BLOCKS[b]), h = wrap && wrap.querySelector(".mabh h1"); if (!h) continue;
        if (innerWidth >= 768) { if (h.style.getPropertyValue("--mabh-fs")) h.style.removeProperty("--mabh-fs"); continue; }
        var avail = h.clientWidth, full = h.textContent.replace(/\s+/g, " ").trim();
        var key = full + "|" + avail + "|" + (D.fonts ? D.fonts.status : ""); if (!avail || !full || h.mabK === key) continue;
        /* clear old breaks */
        var old = h.querySelectorAll(".mabh-br"); for (var o = 0; o < old.length; o++) old[o].remove();
        h.normalize();
        /* measure */
        var cs = getComputedStyle(h), curFs = parseFloat(cs.fontSize) || 30, ls = (parseFloat(cs.letterSpacing) || 0) / curFs;
        cv = cv || D.createElement("canvas"); var c = cv.getContext("2d"); c.font = cs.fontWeight + " 100px " + cs.fontFamily;
        var hl = h.querySelector(".mabh-hl"), hlt = hl ? hl.textContent.trim() : "";
        function wd(t){ t = t.trim(); return c.measureText(t).width + ls * 100 * t.length + (hlt && t.indexOf(hlt) > -1 ? 24 : 0); }
        /* places where a line may break: spaces outside the pink tag */
        var slots = [], text = "", tw = D.createTreeWalker(h, NodeFilter.SHOW_TEXT), n;
        while ((n = tw.nextNode())) {
          var v = n.nodeValue, inHl = n.parentNode.closest && n.parentNode.closest(".mabh-hl");
          for (var i = 0; i < v.length; i++) if (!inHl && /\s/.test(v[i]) && (i === v.length - 1 || !/\s/.test(v[i + 1]))) slots.push({ node: n, idx: i + 1, pos: text.length + i + 1 });
          text += v;
        }
        slots = slots.filter(function(sl){ return text.slice(0, sl.pos).trim() && text.slice(sl.pos).trim(); });
        function best(lines){
          var top = null;
          (function pick(start, from, chosen){
            if (chosen.length === lines - 1) {
              var segs = [], p = 0; chosen.forEach(function(sl){ segs.push(text.slice(p, sl.pos)); p = sl.pos; }); segs.push(text.slice(p));
              var w = Math.max.apply(null, segs.map(wd)); if (!top || w < top.w) top = { w: w, cut: chosen.slice() }; return;
            }
            for (var k = from; k < slots.length; k++) pick(start, k + 1, chosen.concat([slots[k]]));
          })(0, 0, []);
          return top;
        }
        var pickd = slots.length ? best(2) : { w: wd(text), cut: [] };
        if (pickd && avail * 0.96 / pickd.w * 100 < MOBILE_MIN && slots.length > 1) pickd = best(3) || pickd;
        if (!pickd || !pickd.w) continue;
        /* insert the breaks (from the end, so earlier positions stay valid) */
        pickd.cut.slice().reverse().forEach(function(sl){
          var rest = sl.node.splitText(sl.idx), br = D.createElement("br"); br.className = "mabh-br"; rest.parentNode.insertBefore(br, rest);
        });
        var fs = Math.max(24, Math.min(MOBILE_MAX, Math.floor(avail * 0.96 / pickd.w * 100)));
        h.style.setProperty("--mabh-fs", fs + "px");
        h.mabK = full + "|" + avail + "|" + (D.fonts ? D.fonts.status : "");
      }
    }
    addEventListener("resize", function(){ requestAnimationFrame(fit); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function(){ requestAnimationFrame(fit); });
    function run(){
      for (var b = 0; b < BLOCKS.length; b++){
        var wrap = D.getElementById(BLOCKS[b]); if (!wrap) continue;
        var bl = wrap.querySelector(".w-block-banner") || wrap;
        bl.classList.add("mabh"); bl.classList.toggle("mabh-duo", DUOTONE);
        var fig = bl.querySelector("figure"); if (!fig) continue;
        var art = fig.parentElement; art.classList.add("mabh-art");
        for (var up = art.parentElement, k = 0; up && k < 3; up = up.parentElement, k++) { up.style.width = "100%"; up.style.maxWidth = "100%"; up.style.flex = "1 1 100%"; }
        if (!art.querySelector(".mabh-bd")) {
          var bd = D.createElement("div"); bd.className = "mabh-bd"; bd.setAttribute("aria-hidden", "true");
          var ring = D.createElement("div"); ring.className = "mabh-ring";
          var ch = RING.split(""), step = 360 / ch.length;
          ch.forEach(function(c, k){ var sp = D.createElement("span"); sp.textContent = c; sp.style.transform = "rotate(" + (k * step) + "deg)"; ring.appendChild(sp); });
          var mid = D.createElement("div"); mid.className = "mabh-mid";
          mid.appendChild(D.createTextNode(CENTER[0])); var bb = D.createElement("b"); bb.textContent = CENTER[1]; mid.appendChild(bb);
          var inner = D.createElement("div"); inner.appendChild(D.createTextNode(CENTER[0])); inner.appendChild(bb); mid.textContent = ""; mid.appendChild(inner);
          bd.appendChild(ring); bd.appendChild(mid); art.appendChild(bd);
        }
        highlight(bl);
      }
      fit();
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(q).observe(D.documentElement, { childList: true, subtree: true });
    q();
  }]);

  /* ---------- Home categories list ---------- */
  M.push(["catlist", function(){
    /* ===== EDIT HERE =====
       NOTES: small text on the right of each row, matched by category name (lowercase). Leave out a name for no note. */
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)", HOVER = ["#F9CFD8", "#D5E6C8"];
    var NOTES = {
      "cookies": "From $22.50 / dz",
      "scones": "$32.50 / dz",
      "brownies": "Six pack $23.70",
      "cannolis": "$25.95 / dz",
      "eclairs": "$42.50 / dz",
      "cupcakes": "$30 / dz",
      "cheesecake": "From $33"
    };
    /* ===================== */
    var D = document, W = window;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var S =
      ".fcl .carousel-controls,.fcl .button-column{display:none!important}" +
      ".fcl .section-details-text{flex:1 1 100%!important;max-width:100%!important}" +
      ".fcl .featured-categories-content,.fcl .fluid-carousel,.fcl .fluid-carousel__slider{width:100%!important;max-width:100%!important;flex:1 1 100%!important;box-sizing:border-box;overflow:visible!important}" +
      ".fcl .fluid-carousel__slider{display:block!important;transform:none!important;gap:0!important;border-top:1px solid " + LINE + ";margin-top:18px!important;padding:0!important}" +
      ".fcl .carousel-item.carousel-item{position:relative!important;display:block!important;width:100%!important;max-width:none!important;flex:none!important;margin:0!important;padding:0!important;border-bottom:1px solid " + LINE + ";box-sizing:border-box}" +
      ".fcl .carousel-item>*:not(.fcl-row){position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;pointer-events:none!important;z-index:-1!important;overflow:hidden!important;margin:0!important}" +
      ".fcl-row{position:relative;z-index:1;display:flex;align-items:center;gap:20px;padding:16px 10px 16px 0;cursor:pointer;text-align:left;transition:padding .3s ease,background .3s ease}" +
      ".fcl-row:hover{padding-left:18px;background:var(--hv)}" +
      ".fcl-th{display:none;flex:none;width:58px;height:58px;border-radius:50%;object-fit:cover;border:1px solid " + LINE + "}" +
      ".fcl-name{flex:1 1 auto;min-width:0;text-align:left;font-family:" + DISP + ";font-weight:800;font-size:clamp(2rem,5.5vw,4.6rem);line-height:1;letter-spacing:-.04em;color:" + INK + ";white-space:nowrap}" +
      ".fcl-note{flex:none;font:700 .74rem/1 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:" + INK + ";white-space:nowrap}" +
      ".fcl-peek{position:fixed;left:0;top:0;z-index:9999;width:230px;padding:8px;background:#fff;border:1px solid " + LINE + ";border-radius:14px;box-shadow:0 22px 50px rgba(155,27,69,.16);pointer-events:none;opacity:0;transform:translate(-999px,-999px);transition:opacity .25s ease}" +
      ".fcl-peek img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:9px}" +
      ".fcl-peek.on{opacity:1}" +
      "@media(max-width:767px){" +
        ".fcl-row{gap:14px;padding:12px 0}" +
        ".fcl-row:hover{padding-left:0;background:none}" +
        ".fcl-th{display:block}" +
        ".fcl-note{display:none}" +
        ".fcl-name{font-size:clamp(1.5rem,7.6vw,2.4rem);overflow:hidden;text-overflow:clip}" +
        ".fcl-peek{display:none}" +
      "}";
    var peek = D.createElement("div"); peek.className = "fcl-peek"; peek.setAttribute("aria-hidden", "true");
    var pimg = D.createElement("img"); pimg.alt = ""; peek.appendChild(pimg);
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, rot = -4;
    function loop(){ cx += (tx - cx) * .2; cy += (ty - cy) * .2; peek.style.transform = "translate(" + cx + "px," + cy + "px) rotate(" + rot + "deg)"; raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > .5) ? requestAnimationFrame(loop) : 0; }
    function move(e){ tx = e.clientX + 28; ty = e.clientY - 150; if (ty < 10) ty = 10; if (tx + 250 > W.innerWidth) tx = e.clientX - 268; if (!raf) raf = requestAnimationFrame(loop); }
    function pick(im){
      if (!im) return "";
      var s = im.currentSrc || im.getAttribute("src") || "";
      if (s && s.indexOf("data:") !== 0) return s;
      var ss = im.getAttribute("srcset") || im.getAttribute("data-srcset") || "";
      if (ss) { var parts = ss.split(","), last = parts[parts.length > 3 ? 3 : parts.length - 1].trim().split(" ")[0]; if (last) return last; }
      return im.getAttribute("data-src") || "";
    }
    function run(){
      if (!peek.isConnected) D.body.appendChild(peek);
      var bs = D.querySelectorAll(".featured-categories-carousel");
      for (var b = 0; b < bs.length; b++){
        var bl = bs[b]; bl.classList.add("fcl");
        var wr = bl.closest("[data-block-purpose]"); if (wr) { wr.style.flex = "1 1 100%"; wr.style.width = "100%"; wr.style.maxWidth = "100%"; }
        var it = bl.querySelectorAll(".carousel-item");
        for (var i = 0; i < it.length; i++){
          var item = it[i], row = item.querySelector(":scope > .fcl-row");
          var btn = item.querySelector(".featured-category__link-button"), im = item.querySelector(".featured-category__image img");
          var name = btn ? btn.textContent.trim() : "", key = name.toLowerCase();
          if (!row) {
            row = D.createElement("div"); row.className = "fcl-row"; row.setAttribute("role", "link"); row.tabIndex = 0;
            row.innerHTML = "<img class=\"fcl-th\" alt=\"\"><span class=\"fcl-name\"></span><span class=\"fcl-note\"></span>";
            item.appendChild(row);
            row.addEventListener("click", function(){ var x = this.parentNode.querySelector(".featured-category__link-button"); if (x) x.click(); });
            row.addEventListener("keydown", function(e){ if (e.key === "Enter") this.click(); });
            row.addEventListener("mouseenter", function(e){ var th = this.querySelector(".fcl-th"); if (!th.src || W.innerWidth < 768) return; pimg.src = th.src; rot = (Math.random() * 8 - 4).toFixed(1); tx = cx = e.clientX + 28; ty = cy = e.clientY - 150; loop(); peek.classList.add("on"); });
            row.addEventListener("mousemove", move);
            row.addEventListener("mouseleave", function(){ peek.classList.remove("on"); });
          }
          if (row.style.getPropertyValue("--hv") !== HOVER[i % HOVER.length]) row.style.setProperty("--hv", HOVER[i % HOVER.length]);
          var nm = row.querySelector(".fcl-name"), nt = row.querySelector(".fcl-note"), th = row.querySelector(".fcl-th");
          if (nm.textContent !== name) nm.textContent = name;
          var note = NOTES[key] || ""; if (nt.textContent !== note) nt.textContent = note;
          var src = pick(im); if (src && th.getAttribute("src") !== src) th.src = src;
          var vv = src ? "visible" : "hidden"; if (th.style.visibility !== vv) th.style.visibility = vv;
        }
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); } try { run(); } catch (e) {}
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var t2 = ms[i].target; if (!(t2.closest && t2.closest(".fcl-row,.fcl-peek"))) { q(); return; } } }).observe(D.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "srcset", "data-src"] }); addEventListener("load", q); D.addEventListener("load", function(e){ if (e.target.closest && e.target.closest(".featured-category__image")) q(); }, true); setTimeout(q, 1500); setTimeout(q, 4000); setTimeout(q, 8000);
  }]);

  /* ---------- Home featured products ---------- */
  M.push(["prod", function(){
    /* ===== EDIT HERE (v8 style) ===== */
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)", CARD = "#ffffff", TILT = 1.5, ADD = "Add";
    /* ================================ */
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var S =
      ".mabp .fluid-carousel__slider{padding:14px 10px 22px 6px!important;align-items:stretch}" +
      ".mabp .fluid-carousel--item{display:flex!important;flex-direction:column;box-sizing:border-box;background:none;border:0;padding:0;cursor:pointer}" +
      ".mabp .featured-product__image .figure__aspect-ratio{aspect-ratio:1/1!important;--image-aspect-ratio:1 / 1!important;padding:0!important;height:auto!important;border:1px solid " + LINE + ";border-radius:14px;overflow:hidden;box-sizing:border-box;background:" + CARD + ";transform:rotate(var(--tilt));transition:transform .35s cubic-bezier(.2,.9,.3,1.2)}" +
      ".mabp .fluid-carousel--item:hover .figure__aspect-ratio{transform:rotate(0) translateY(-6px)}" +
      ".mabp .featured-product__image img{width:100%!important;height:100%!important;object-fit:cover!important;--image-height:100%!important}" +
      ".mabp .badge-on,.mabp .featured-product__image{margin:0!important}" +
      ".mabp .product-group{flex:1;display:flex}" +
      ".mabp .product-group__link{position:relative;display:flex!important;flex-direction:column;width:100%;padding:16px 2px 0;text-decoration:none!important;color:" + INK + "}" +
      ".mabp .badge-around,.mabp .badge-around>div{display:flex;flex-direction:column;flex:1;width:100%}" +
      ".mabp .featured-product__text{display:flex;flex-direction:column;flex:1}" +
      ".mabp .w-product-title{text-transform:none!important;font-weight:700!important;font-size:1.02rem!important;line-height:1.3!important;letter-spacing:0!important;color:" + INK + "!important;margin:0!important}" +
      ".mabp .featured-product__price{margin-top:auto!important;padding-top:6px}" +
      ".mabp .featured-product__price>p{margin:0!important;padding:0 60px 0 0;display:flex;align-items:center;min-height:28px}" +
      ".mabp .featured-product__price span{font-family:" + DISP + "!important;font-weight:800!important;font-size:1.2rem!important;line-height:1!important;letter-spacing:-.01em!important;color:" + INK + "!important}" +
      ".mabp .mabp-plus{position:absolute;right:2px;bottom:6px;font:700 .74rem/1 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:" + INK + ";border-bottom:1.5px solid currentColor;padding-bottom:3px}" +
      ".mabp .badge-column{margin-top:4px}" +
      ".mabp .item-badge{font-size:.76rem!important;color:" + INK + "!important;opacity:.75}";
    function tidyPrice(el){
      var w = D.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) { var t = n.nodeValue, u = t.replace(/US\$/g, "$").replace(/\.00(?!\d)/g, ""); if (u !== t) n.nodeValue = u; }
    }
    function run(){
      var bs = D.querySelectorAll(".featured-products-carousel");
      for (var b = 0; b < bs.length; b++){
        var bl = bs[b]; bl.classList.add("mabp");
        var it = bl.querySelectorAll(".fluid-carousel--item");
        for (var i = 0; i < it.length; i++){
          var card = it[i], link = it[i].querySelector(".product-group__link");
          it[i].style.setProperty("--tilt", (i % 2 ? TILT : -TILT) + "deg");
          if (!card || !link) continue;
          if (!link.querySelector(".mabp-plus")) { var pl = D.createElement("span"); pl.className = "mabp-plus"; pl.setAttribute("aria-hidden", "true"); pl.textContent = ADD; link.appendChild(pl); }
          var pr = it[i].querySelector(".featured-product__price"); if (pr) tidyPrice(pr);
          if (!card.mabc) { card.mabc = 1; card.addEventListener("click", function(e){ var a = this.querySelector(".product-group__link"); if (a && !e.target.closest("a")) a.click(); }); }
        }
      }
    }
    var D = document, st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(q).observe(D.documentElement, { childList: true, subtree: true, characterData: true });
    addEventListener("resize", q); q();
  }]);

  /* ---------- Home events tickets ---------- */
  M.push(["tix", function(){
    /* ===== EDIT HERE ===== */
    var TICKETS = ["#FFFFFF", "#F9CFD8"];   /* ticket colors, used in turn */
    var ACCENT  = "#9B1B45";                /* date, stub text, button */
    var INK     = "#9B1B45";                /* title and text */
    var STUB    = "date";                   /* text on the stub: "date", or your own, e.g. "ADMIT ONE" */
    var PHOTO   = "desktop";                /* event photo on the left: "desktop" = only on computers, true = everywhere, false = never */
    /* Event descriptions: add a normal Square Text block anywhere on the page. First line: EVENT TEXTS
       Then one line per event:  Event title | description text
       On the live site that block is hidden and each text goes into the ticket with the same title. */
    var MARKER  = "EVENT TEXTS";
    var MAX     = 6;                        /* show at most this many events (the next ones by date) */
    /* Short text under the title comes from the event itself in Square:
       Items > the event > Optimise search and sharing > Search engine optimisation > description.
       If that is empty, the start of the normal description is used. */
    var AUTO_DESC = true, DESC_MAX = 170;   /* longest text in characters, cut at the end of a sentence */
    var SLIDER = false;                     /* phones: true = events as a swipe slider, false = one under the other */
    var SLIDE_EVERY = 6;                    /* phones with 2+ events: seconds between slides, 0 = no auto play */
    /* ===================== */
    var D = document;
    var T = ".mabtx .featured-event.featured-event";
    var S =
      ".mabtx .w-grid{flex:1 1 100%!important;width:100%!important;max-width:100%!important;box-sizing:border-box;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr))!important;gap:28px!important;align-items:stretch!important}" +
      ".mabtx .grid__item,.mabtx .grid__item>.w-wrapper{display:flex!important;min-width:0;width:100%!important;max-width:none!important}" +
      T + "{position:relative!important;display:grid!important;grid-template-columns:var(--ls,0px) var(--ph) minmax(0,1fr) var(--stub)!important;grid-template-rows:1fr auto!important;width:100%!important;min-height:230px;box-sizing:border-box!important;padding:0!important;margin:0!important;border:0!important;border-radius:4px!important;box-shadow:none!important;opacity:1!important;text-align:left!important;cursor:pointer;" +
        "background:radial-gradient(circle at calc(100% - var(--stub)) 0,var(--sec) 11px,transparent 11.5px),radial-gradient(circle at calc(100% - var(--stub)) 100%,var(--sec) 11px,transparent 11.5px),radial-gradient(circle at var(--lsn,-30px) 0,var(--sec) 11px,transparent 11.5px),radial-gradient(circle at var(--lsn,-30px) 100%,var(--sec) 11px,transparent 11.5px),var(--tk)!important}" +
      T + ":hover{opacity:1!important}" +
      T + " .hover-fade-80," + T + ".hover-fade-80:hover{opacity:1!important}" +
      T + ":before{content:\"\";position:absolute;top:16px;bottom:16px;right:var(--stub);border-left:2px dashed " + INK + "55}" +
      T + ":after{content:attr(data-stub);position:absolute;top:0;bottom:0;right:0;width:var(--stub);display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;transform:rotate(180deg);font:700 .78rem/1 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:" + ACCENT + ";white-space:nowrap;overflow:hidden}" +
      /* event photo: a square on the left */
      T + ">.w-wrapper:first-child{grid-column:2;grid-row:1/3;display:var(--phd)!important;align-self:stretch;padding:0!important;margin:0!important;min-width:0}" +
      T + ">.w-wrapper:first-child>div,"+ T + ">.w-wrapper:first-child>div>div," + T + ">.w-wrapper:first-child .product-image__link-wrapper{height:100%!important}" +
      T + ">.w-wrapper:first-child .figure__aspect-ratio{position:relative!important;display:block!important;width:100%!important;height:100%!important;min-height:var(--phs,0px);aspect-ratio:auto!important;padding:0!important;margin:0!important;border-radius:0!important;overflow:hidden!important}" +
      T + "{min-height:var(--phs,0px)}" +
      /* left stub (desktop with photo) */
      T + ">.mabtx-ls{grid-column:1;grid-row:1/3;position:relative;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;transform:rotate(180deg);font:700 .78rem/1 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:" + ACCENT + ";white-space:nowrap;overflow:hidden}" +
      T + ">.mabtx-ls:after{content:\"\";position:absolute;top:16px;bottom:16px;left:0;border-left:2px dashed " + INK + "55}" +
      T + ">.w-wrapper:first-child .figure__image," + T + ">.w-wrapper:first-child .figure__image>div," + T + ">.w-wrapper:first-child img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-height:none!important;margin:0!important}" +
      T + ">.w-wrapper:first-child img{object-fit:cover!important}" +
      T + ">.w-wrapper:first-child .product-image__link-wrapper{display:block!important}" +
      /* same width as the other blocks on the page */
      ".mabtx>.container{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}" +
      T + " .featured-event__details{grid-column:3;grid-row:1;display:block!important;padding:clamp(28px,3.5vw,44px) clamp(24px,3.5vw,48px) 0!important;margin:0!important;text-align:left!important}" +
      T + " .featured-event__date-time{display:flex!important;flex-wrap:wrap;gap:4px 12px;justify-content:flex-start!important;margin:0 0 14px!important}" +
      T + " .featured-event__date," + T + " .featured-event__time{font-family:\"Niramit Bold\",\"Niramit\",sans-serif!important;font-weight:700!important;font-size:.8rem!important;line-height:1.2!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:" + ACCENT + "!important;background:none!important;padding:0!important;margin:0!important;border:0!important}" +
      T + " .featured-event__title{margin:0!important;padding:0!important}" +
      T + " .featured-event__title," + T + " .featured-event__title h4{display:block!important;-webkit-line-clamp:unset!important;line-clamp:none!important;max-height:none!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important}" +
      T + " .featured-event__title h4{font-family:\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif!important;font-weight:800!important;font-size:clamp(2rem,3.4vw,3rem)!important;line-height:.98!important;letter-spacing:-.035em!important;color:" + INK + "!important;margin:0!important;text-align:left!important}" +
      T + " .featured-event__details>.text-component:last-child{margin:14px 0 0!important;font-family:\"Niramit Regular\",\"Niramit\",sans-serif!important;font-size:1.05rem!important;line-height:1.5!important;color:" + INK + "!important;text-align:left!important}" +
      T + " .featured-event__details>.text-component:last-child:empty{display:none!important}" +
      T + " .featured-event__button-wrapper{grid-column:3;grid-row:2;padding:26px clamp(24px,3.5vw,48px) clamp(28px,3.5vw,44px)!important;margin:0!important;display:flex!important;justify-content:flex-start!important}" +
      T + " .mabtx-desc{margin:14px 0 0!important;padding:0!important;font-family:\"Niramit Regular\",\"Niramit\",sans-serif!important;font-size:1.05rem!important;line-height:1.5!important;color:" + INK + "!important;text-align:left!important;max-width:46ch}" +
      ".mabtx-hidden{display:none!important}" +
      ".mabtx .w-grid.mabtx-one{grid-template-columns:minmax(0,1fr)!important}" +
      
      T + "{border:1px solid rgba(155,27,69,.35)!important;border-radius:14px!important}" +
      T + " .featured-event__button-wrapper .w-button{width:auto!important}" +
      ".mabtx-dots{display:none}" +
      "@media(min-width:768px){.mabtx .w-grid>.grid__item.mabtx-wide{grid-column:1/-1}}" +
      "@media(max-width:767px){" +
        ".mabtx .w-grid.mabtx-many{display:flex!important;overflow-x:auto!important;scroll-snap-type:x mandatory;gap:14px!important;padding:2px 2px 6px!important;scrollbar-width:none;-webkit-overflow-scrolling:touch}" +
        ".mabtx .w-grid.mabtx-many::-webkit-scrollbar{display:none}" +
        ".mabtx .w-grid.mabtx-many>.grid__item{flex:0 0 88%!important;width:88%!important;scroll-snap-align:center}" +
        ".mabtx-dots{display:flex;justify-content:center;gap:8px;margin:16px 0 0}" +
        ".mabtx-dots button{width:9px;height:9px;padding:0;border:1.5px solid " + ACCENT + ";border-radius:50%;background:transparent;cursor:pointer}" +
        ".mabtx-dots button.on{background:" + ACCENT + "}" +
      "}" +
      "@media(max-width:600px){" + T + "{min-height:0}" +
        T + " .featured-event__title h4{font-size:1.8rem!important}" +
        T + " .featured-event__details," + T + " .featured-event__button-wrapper{padding-left:22px!important;padding-right:18px!important}}";
    function bg(el){
      while (el && el !== D.documentElement) {
        var c = getComputedStyle(el).backgroundColor;
        if (c && c !== "transparent" && c !== "rgba(0, 0, 0, 0)") return c;
        el = el.parentElement;
      }
      return "#ffffff";
    }
    function texts(){
      var map = {}, tc = D.querySelectorAll("[data-block-purpose] .text-component");
      for (var i = 0; i < tc.length; i++){
        var els = tc[i].querySelectorAll("p,h1,h2,h3,h4,h5,h6,li"), lines = [];
        for (var e = 0; e < els.length; e++) { var tx = els[e].textContent.trim(); if (tx) lines.push(tx); }
        if (!lines.length) lines = tc[i].textContent.split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean);
        if (!lines.length || lines[0].toUpperCase() !== MARKER) continue;
        for (var j = 1; j < lines.length; j++){
          var k = lines[j].indexOf("|"); if (k < 0) continue;
          map[lines[j].slice(0, k).trim().toLowerCase()] = lines[j].slice(k + 1).trim();
        }
        var w = tc[i].closest("[data-block-purpose]"); if (w) w.classList.add("mabtx-hidden");
      }
      return map;
    }
    var cache = {}, busy = {};
    try { cache = JSON.parse(sessionStorage.getItem("mabtx") || "{}"); } catch (e) {}
    function cut(t){
      t = (t || "").replace(/\s+/g, " ").trim(); if (t.length <= DESC_MAX) return t;
      var s = t.slice(0, DESC_MAX), e = Math.max(s.lastIndexOf(". "), s.lastIndexOf("! "), s.lastIndexOf("? "));
      return e > 40 ? s.slice(0, e + 1) : s.replace(/\s+\S*$/, "") + "\u2026";
    }
    function desc(url, done){
      if (cache[url] !== undefined) { done(cache[url]); return; }
      if (busy[url] && Date.now() - busy[url] < 60000) return; busy[url] = Date.now();   /* empty or failed: try again after a minute */
      fetch(url, { credentials: "same-origin" }).then(function(r){ return r.ok ? r.text() : ""; }).then(function(html){
        var d = new DOMParser().parseFromString(html, "text/html"), m = d.querySelector("meta[name=description]") || d.querySelector("meta[property='og:description']");
        var txt = cut(m ? m.getAttribute("content") : "");
        if (txt) { cache[url] = txt; try { sessionStorage.setItem("mabtx", JSON.stringify(cache)); } catch (e) {} }
        done(txt);
      }).catch(function(){});
    }
    function slider(bl, grid, n){
      var many = SLIDER && n > 1; grid.classList.toggle("mabtx-many", many);
      var dots = bl.querySelector(".mabtx-dots");
      if (!many) { if (dots) dots.remove(); return; }
      if (!dots || dots.children.length !== n) {
        if (dots) dots.remove();
        dots = D.createElement("div"); dots.className = "mabtx-dots";
        for (var k = 0; k < n; k++) { var b = D.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Event " + (k + 1)); b.mabk = k; dots.appendChild(b); }
        dots.addEventListener("click", function(e){ var b = e.target.closest("button"); if (b) go(grid, b.mabk); grid.mabStop = 1; });
        grid.insertAdjacentElement("afterend", dots);
      }
      if (!grid.mabS) {
        grid.mabS = 1;
        grid.addEventListener("scroll", function(){ mark(grid); }, { passive: true });
        grid.addEventListener("touchstart", function(){ grid.mabStop = 1; }, { passive: true });
        if (SLIDE_EVERY) setInterval(function(){
          if (grid.mabStop || innerWidth >= 768 || D.hidden || !grid.classList.contains("mabtx-many")) return;
          var its = vis(grid), cur = idx(grid); go(grid, cur + 1 >= its.length ? 0 : cur + 1);
        }, SLIDE_EVERY * 1000);
      }
      mark(grid);
    }
    function vis(grid){ return [].filter.call(grid.children, function(x){ return x.classList.contains("grid__item") && x.style.display !== "none"; }); }
    function idx(grid){ var its = vis(grid), best = 0, bd = 1e9, gl = grid.getBoundingClientRect().left;
      its.forEach(function(it, k){ var dd = Math.abs(it.getBoundingClientRect().left - gl); if (dd < bd) { bd = dd; best = k; } }); return best; }
    function go(grid, k){ var it = vis(grid)[k]; if (it) grid.scrollTo({ left: it.offsetLeft - grid.offsetLeft - (grid.clientWidth - it.clientWidth) / 2, behavior: "smooth" }); }
    function mark(grid){ var dots = grid.parentNode && grid.parentNode.querySelector(".mabtx-dots"); if (!dots) return; var k = idx(grid);
      [].forEach.call(dots.children, function(b, j){ b.classList.toggle("on", j === k); }); }
    function run(){
      var TX = texts();
      var bs = D.querySelectorAll("[data-block-purpose^=featured-events] .w-block");
      for (var b = 0; b < bs.length; b++){
        var bl = bs[b]; bl.classList.add("mabtx");
        var wr = bl.closest("[data-block-purpose]"); if (wr) { wr.style.flex = "1 1 100%"; wr.style.width = "100%"; wr.style.maxWidth = "100%"; }
        var items = bl.querySelectorAll(".w-grid > .grid__item"), shown = 0;
        for (var g = 0; g < items.length; g++){ var vis = shown < MAX; items[g].style.display = vis ? "" : "none"; if (vis) shown++; }
        for (var g2 = 0; g2 < items.length; g2++) items[g2].classList.toggle("mabtx-wide", shown > 1 && shown % 2 === 1 && g2 === shown - 1);
        var grid = bl.querySelector(".w-grid"); if (grid) { grid.classList.toggle("mabtx-one", shown === 1); slider(bl, grid, shown); }
        var cards = bl.querySelectorAll(".featured-event");
        var sec = bg(bl);
        for (var i = 0; i < cards.length; i++){
          var c = cards[i], s = c.style;
          s.setProperty("--tk", TICKETS[i % TICKETS.length]);
          s.setProperty("--sec", sec);
          s.setProperty("--stub", innerWidth < 600 ? "48px" : "66px");
          var ph = PHOTO === true || (PHOTO === "desktop" && innerWidth >= 768);
          if (ph && !c.querySelector(".w-wrapper:first-child img")) ph = false;      /* no photo in Square: no empty space */
          var sz = shown === 1 ? "clamp(260px,28vw,360px)" : "210px";
          s.setProperty("--ph", ph ? sz : "0px");
          s.setProperty("--phs", ph ? sz : "0px");
          s.setProperty("--phd", ph ? "block" : "none");
          s.setProperty("--ls", ph ? (innerWidth < 600 ? "48px" : "66px") : "0px");
          s.setProperty("--lsn", ph ? (innerWidth < 600 ? "48px" : "66px") : "-30px");
          var lsd = c.querySelector(":scope>.mabtx-ls"), dd = c.querySelector(".featured-event__date");
          if (ph) { if (!lsd) { lsd = D.createElement("div"); lsd.className = "mabtx-ls"; lsd.setAttribute("aria-hidden", "true"); c.appendChild(lsd); }
            var lt = STUB === "date" ? (dd ? dd.textContent.trim() : "") : STUB; if (lsd.textContent !== lt) lsd.textContent = lt; }
          else if (lsd) lsd.remove();
          var h = c.querySelector(".featured-event__title h4"), tl = h ? h.textContent.trim().toLowerCase() : "", dsc = c.querySelector(".mabtx-desc");
          var put = function(card, hh, txt){ var ds = card.querySelector(".mabtx-desc");
            if (txt) { if (!ds) { ds = D.createElement("p"); ds.className = "mabtx-desc"; hh.closest(".featured-event__title").insertAdjacentElement("afterend", ds); } if (ds.textContent !== txt) ds.textContent = txt; }
            else if (ds) ds.remove(); };
          if (h && TX[tl]) put(c, h, TX[tl]);
          else if (h && AUTO_DESC) {
            var lk = c.querySelector("a[href]"), url = lk && lk.getAttribute("href");
            var same = false; try { same = !!url && new URL(url, location.href).origin === location.origin; } catch (e) {}
            if (same) (function(card, hh){ desc(url, function(txt){ put(card, hh, txt); }); })(c, h);
            else put(c, h, "");
          } else put(c, h, "");
          var d = c.querySelector(".featured-event__date");
          c.setAttribute("data-stub", STUB === "date" ? (d ? d.textContent.trim() : "Tickets") : STUB);
          if (!c.mabc) { c.mabc = 1; c.addEventListener("click", function(e){ var x = this.querySelector(".featured-event__button-wrapper .w-button"); if (x && !x.contains(e.target)) x.click(); }); }
        }
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(q).observe(D.documentElement, { childList: true, subtree: true });
    addEventListener("resize", q); q();
  }]);

  /* ---------- Testimonials (quotes) ---------- */
  M.push(["revq", function(){
    /* ===== EDIT HERE ===== */
    var REVIEW_URL = "https://www.google.com/maps/place/Miss+Amy%27s+Bakery/@40.8581701,-81.9300713,725m/data=!3m1!1e3!4m8!3m7!1s0x8837494b9eb61229:0x218535cbec29c6a2!8m2!3d40.8581701!4d-81.9300713!9m1!1b1!16s%2Fg%2F11g0vy7xpg";
    var BUTTON_TEXT = "LEAVE A REVIEW";
    var SPEED = 6000;                 /* ms between quotes */
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)";
    /* ===================== */
    var D = document;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var S =
      ".mabq .container,.mabq .container *{text-align:center}" +
      ".mabq .w-cell.col-sm-8{flex:0 0 100%!important;max-width:100%!important;margin-left:0!important;flex-wrap:wrap!important;min-width:0}" +
      ".mabq .w-grid,.mabq .mabr-cta{display:none!important}" +
      ".mabq-box{flex:0 0 100%;width:100%;box-sizing:border-box;min-width:0;max-width:860px;margin:10px auto 0;text-align:center;color:" + INK + "}" +
      ".mabq-q{display:block;min-height:2.3em;font-family:" + DISP + ";font-weight:800;font-size:clamp(1.35rem,2.4vw,2.05rem);line-height:1.15;letter-spacing:-.035em;text-wrap:balance;transition:opacity .35s ease}" +
      ".mabq-q:before{content:\"\\201C\"}.mabq-q:after{content:\"\\201D\"}" +
      ".mabq-n{display:block;margin-top:22px;font:700 .78rem/1.4 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.14em;text-transform:uppercase;transition:opacity .35s ease}" +
      ".mabq-fade .mabq-q,.mabq-fade .mabq-n{opacity:0}" +
      ".mabq-dots{display:flex;justify-content:center;gap:10px;margin-top:24px;flex-wrap:wrap}" +
      ".mabq-dots button{width:10px;height:10px;border-radius:50%;border:1.5px solid " + INK + ";background:transparent;padding:0;cursor:pointer}" +
      ".mabq-dots button[aria-current=true]{background:" + INK + "}" +
      ".mabq-cta{display:flex;justify-content:center;margin-top:30px}" +
      ".mabq-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 28px;border-radius:999px;box-shadow:inset 0 0 0 1.5px " + INK + ";color:" + INK + ";font:700 .82rem/1 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;transition:background .2s ease,color .2s ease}" +
      ".mabq-btn:hover{background:" + INK + ";color:#fff}" +
      ".mabq .mabq-cta .mabq-sq.w-button{width:auto!important;max-width:100%!important;flex:none!important;display:inline-flex!important}";
    function data(bl){
      var out = [], it = bl.querySelectorAll(".grid__item");
      for (var i = 0; i < it.length; i++){
        var q = it[i].querySelector("h3,h2,h4,p"), n = it[i].querySelector("h6,h5");
        var qt = q ? q.textContent.trim().replace(/^["\u201C]+|["\u201D]+$/g, "") : "";
        if (qt) out.push([qt, n ? n.textContent.trim() : ""]);
      }
      return out;
    }
    function build(bl){
      var R = data(bl); if (!R.length) return;
      var box = bl.querySelector(".mabq-box"), key = JSON.stringify(R);
      if (box && box.getAttribute("data-k") === key) return;
      if (box) { clearInterval(box.mabt); box.remove(); }
      box = D.createElement("div"); box.className = "mabq-box"; box.setAttribute("data-k", key);
      box.innerHTML = "<blockquote style=\"margin:0\"><span class=\"mabq-q\"></span><span class=\"mabq-n\"></span></blockquote><div class=\"mabq-dots\" role=\"group\" aria-label=\"Choose review\"></div><div class=\"mabq-cta\"><a class=\"mabq-btn\" target=\"_blank\" rel=\"noopener\"></a></div>";
      var q = box.querySelector(".mabq-q"), n = box.querySelector(".mabq-n"), dots = box.querySelector(".mabq-dots"), a = box.querySelector(".mabq-btn"), cur = 0;
      a.href = REVIEW_URL; a.textContent = BUTTON_TEXT;
      /* use a real Square button from the page, so it looks exactly like the other buttons */
      var all = D.querySelectorAll("a.w-button"), src = null;
      for (var k2 = 0; k2 < all.length; k2++) { var x = all[k2]; if (!x.closest("header,nav,.mabq,.mabr-cta,[data-block-purpose^=featured-events]") && x.offsetParent) { src = x; break; } }
      if (src) {
        var cl = src.cloneNode(true), tx = cl.querySelector("p") || cl.querySelector("span span") || cl.querySelector("span") || cl;
        tx.textContent = BUTTON_TEXT; cl.href = REVIEW_URL; cl.target = "_blank"; cl.rel = "noopener"; cl.removeAttribute("id"); cl.classList.remove("w-button--full-width-mobile"); cl.classList.add("mabq-sq");
        a.parentNode.replaceChild(cl, a); a = cl;
      }
      function show(k, anim){
        cur = k;
        function put(){ q.textContent = R[k][0]; n.textContent = R[k][1]; box.classList.remove("mabq-fade"); }
        if (anim) { box.classList.add("mabq-fade"); setTimeout(put, 350); } else put();
        [].forEach.call(dots.children, function(d, j){ d.setAttribute("aria-current", j === k ? "true" : "false"); });
      }
      R.forEach(function(r, k){ var d = D.createElement("button"); d.type = "button"; d.setAttribute("aria-label", "Review " + (k + 1)); d.addEventListener("click", function(){ clearInterval(box.mabt); show(k, true); }); dots.appendChild(d); });
      if (R.length < 2) dots.style.display = "none";
      show(0, false);
      if (R.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) box.mabt = setInterval(function(){ if (!D.hidden) show((cur + 1) % R.length, true); }, SPEED);
      var grid = bl.querySelector(".w-grid"); grid.parentNode.insertBefore(box, grid.nextSibling);
    }
    function run(){
      var bs = D.querySelectorAll("[data-block-purpose^=repeatable-testimonial] .w-block");
      for (var b = 0; b < bs.length; b++){ bs[b].classList.add("mabq"); build(bs[b]); }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); } try { run(); } catch (e) {}
    new MutationObserver(q).observe(D.documentElement, { childList: true, subtree: true });
  }]);

  /* ---------- About us panel (Home + About) ---------- */
  M.push(["about", function(){
    /* ===== EDIT HERE =====
       PANEL: leave "" to use the background color picked for the block in Square, or set one, e.g. "#c3d7f2".
       PAGE: color around the panel ("" = transparent, shows the page background). */
    var PANEL = "#D5E6C8", PAGE = "", TILT = -3;
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)";
    var LABEL = "";                     /* small label above the title, "" = none (add your own text line in Square instead) */
    var ARROW_SECOND = true;            /* second button as a minimal arrow link (v8) */
    /* ===================== */
    var D = document;
    var S =
      ".mabab{background:var(--page)!important}" +
      ".mabab>.container{position:relative;box-sizing:border-box!important;width:min(1280px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;margin-top:clamp(40px,6vw,80px)!important;margin-bottom:clamp(40px,6vw,80px)!important;padding:clamp(28px,4vw,60px)!important;background:var(--pc);border-radius:22px}" +
      ".mabab>.container>.w-container{align-items:center!important;flex-wrap:nowrap!important;margin:0!important;gap:clamp(28px,5vw,72px)}" +
      ".mabab>.container>.w-container>.w-cell:first-child{flex:0 0 44%!important;max-width:44%!important;margin:0!important;padding:0!important}" +
      ".mabab>.container>.w-container>.w-cell:last-child{flex:1 1 0!important;min-width:0!important;max-width:none!important;margin:0!important;padding:0!important}" +
      ".mabab>.container>.w-container>.w-cell:first-child{min-width:0!important}" +
      ".mabab .element-group{min-width:0;max-width:100%}" +
      ".mabab figure{margin:0!important;background:#fff;padding:10px;border:1px solid " + LINE + ";border-radius:10px;transform:rotate(var(--tilt));transform-origin:center;box-sizing:border-box}" +
      ".mabab .figure__aspect-ratio{display:block;position:relative!important;aspect-ratio:5/4;height:auto!important;padding:0!important;border-radius:6px;overflow:hidden;box-sizing:border-box}" +
      ".mabab .figure__aspect-ratio .image,.mabab .figure__aspect-ratio img{position:absolute!important;inset:0;width:100%!important;height:100%!important;object-fit:cover!important}" +
      ".mabab .element-group,.mabab .element-group *{text-align:left!important}" +
      ".mabab .element-group h1,.mabab .element-group h2,.mabab .element-group h3{overflow-wrap:break-word;white-space:normal!important;max-width:100%!important}" +
      (LABEL ? ".mabab .element-group>.w-wrapper:first-child::before{content:\"" + LABEL + "\";display:block;font:700 .78rem/1 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:" + INK + ";margin:0 0 16px}" : "") +
      ".mabab .button-group{flex-wrap:wrap!important;max-width:100%}" +
      ".mabab .button-group .button-wrapper{flex:none!important;width:auto!important;max-width:100%!important}" +
      ".mabab .button-group .w-button:not(.mab-arrowbtn){width:auto!important;max-width:100%!important}" +
      ".mabab .element-group .text-component:not(.text) p{max-width:52ch}" +
      ".mabab .button-group{margin-top:28px!important;justify-content:flex-start!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button{all:unset!important;display:inline-flex!important;align-items:center!important;gap:12px!important;cursor:pointer!important;padding:4px 0!important;color:" + INK + "!important;background:none!important;box-shadow:none!important;width:auto!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button .bb{display:none!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button *{all:unset!important;font:700 .85rem/1 \"Niramit Bold\",\"Niramit\",sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase!important;white-space:nowrap!important;color:" + INK + "!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button:before,.mabab .mab-arrowbtn.w-button.w-button.w-button.w-button:after{display:none!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button>span{position:relative!important;display:inline-flex!important;align-items:center!important;gap:12px!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button>span:after{content:\"\"!important;display:block!important;flex:none!important;width:28px!important;height:28px!important;box-sizing:border-box!important;border:1.75px solid " + INK + "!important;border-radius:50%!important;background:linear-gradient(" + INK + "," + INK + ") 6.5px 50%/12px 1.75px no-repeat!important;transition:transform .25s ease!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button>span:before{content:\"\"!important;position:absolute!important;right:10px!important;top:50%!important;width:6.5px!important;height:6.5px!important;margin-top:-3.25px!important;box-sizing:border-box!important;border-top:1.75px solid " + INK + "!important;border-right:1.75px solid " + INK + "!important;transform:rotate(45deg)!important;transition:transform .25s ease!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button:hover>span:after{transform:translateX(5px)!important}" +
      ".mabab .mab-arrowbtn.w-button.w-button.w-button.w-button:hover>span:before{transform:translateX(5px) rotate(45deg)!important}" +
      ".mabab .button-group{align-items:center!important;gap:22px!important}" +
      "@media(max-width:767px){" +
        ".mabab>.container{padding:18px 18px 26px!important;width:calc(100% - 32px)!important}" +
        ".mabab>.container>.w-container{flex-direction:column!important;align-items:stretch!important;gap:24px}" +
        ".mabab>.container>.w-container>.w-cell:first-child{flex:none!important;max-width:none!important;width:100%!important}" +
        ".mabab>.container>.w-container>.w-cell:last-child{width:100%!important;flex:none!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}" +
        ".mabab>.container,.mabab>.container>.w-container{height:auto!important;max-height:none!important;overflow:visible!important}" +
        ".mabab .element-group,.mabab .element-group>*{height:auto!important;max-height:none!important;overflow:visible!important}" +
        ".mabab figure{transform:rotate(-1.5deg)}" +
        /* buttons: side by side when they fit, otherwise one under the other */
        ".mabab .button-group{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:flex-start!important;gap:14px 20px!important;width:100%!important}" +
        ".mabab .button-group .button-wrapper{flex:0 1 auto!important;width:auto!important;min-width:0!important;margin:0!important}" +
        ".mabab .button-group .w-button:not(.mab-arrowbtn){width:auto!important;min-width:0!important}" +
        (ARROW_SECOND ? "" : ".mabab .button-group .button-wrapper{flex:1 1 0!important}.mabab .button-group .w-button{width:100%!important;padding-left:10px!important;padding-right:10px!important}.mabab .button-group .w-button p{font-size:14px!important;white-space:nowrap}") +
      "}";
    function darker(rgb){
      var m = (rgb || "").match(/\d+(\.\d+)?/g); if (!m || m.length < 3) return "#2a2b2e";
      return "rgb(" + [0,1,2].map(function(i){ return Math.round(+m[i] * 0.55); }).join(",") + ")";
    }
    function setv(el, k, v){ if (el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v); }
    function run(){
      var bs = D.querySelectorAll("[data-block-purpose^=about-us] .w-block");
      for (var b = 0; b < bs.length; b++){
        var bl = bs[b];
        if (!bl.mabpc) {
          var c = PANEL;
          if (!c) { var v = getComputedStyle(bl).backgroundColor; if (v && v !== "transparent" && v !== "rgba(0, 0, 0, 0)") c = v; }
          bl.mabpc = c || "rgb(240, 228, 204)";
        }
        var wr = bl.closest("[data-block-purpose]");
        if (wr && wr.style.width !== "100%") { wr.style.flex = "1 1 100%"; wr.style.width = "100%"; wr.style.maxWidth = "100%"; }
        if (!bl.classList.contains("mabab")) bl.classList.add("mabab");
        setv(bl, "--pc", bl.mabpc); setv(bl, "--page", PAGE || "transparent"); setv(bl, "--tilt", TILT + "deg");
        var btns = bl.querySelectorAll(".button-group .w-button");
        if (ARROW_SECOND && btns[1] && !btns[1].classList.contains("mab-arrowbtn")) btns[1].classList.add("mab-arrowbtn");
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(q).observe(D.documentElement, { childList: true, subtree: true });
    try { run(); } catch (e) {} addEventListener("load", q); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- Panels: For every occasion / Three ways (Home, Weddings, About, Catering) ---------- */
  M.push(["occ", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square block(s), see DevTools: element with data-block-purpose="text-and-image...".
       COLOR: "" = same color as the block text, or set one, e.g. "#1d2a21". */
    var BLOCKS = ["bMVFdI", "RrGyZV", "jXEQOT", "tTHBlr"];   /* Home, Weddings, About, Catering */
    var COLOR = "#9B1B45";
    var PANELS = ["#F9CFD8", "#D5E6C8", "#FFFFFF"];   /* panel colors, used in turn */
    var LINE = "rgba(155,27,69,.35)";
    var DUOTONE = false;                                /* true = tint photos raspberry and pink */
    /* ===================== */
    var D = document;
    var B = ".mabob .w-button.w-button.w-button.w-button.w-button";   /* extra weight to beat Square button styles */
    var S =
      B + "{all:unset!important;display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:12px!important;cursor:pointer!important;box-sizing:border-box!important;width:auto!important;min-width:0!important;max-width:none!important;min-height:0!important;height:auto!important;padding:4px 0!important;margin:0!important;background:none!important;border:0!important;box-shadow:none!important;color:var(--lc)!important;position:relative!important;inset:auto!important;transform:none!important;text-align:left!important;-webkit-tap-highlight-color:transparent}" +
      B + " .bb{display:none!important}" +
      B + " *:not(.mab-ar){padding:0!important;margin:0!important;min-width:0!important;width:auto!important;text-indent:0!important;position:static!important;left:auto!important;transform:none!important;background:none!important}" +
      B + ">span{display:inline-flex!important;align-items:center!important}" +
      B + " p{font-family:\"Niramit Bold\",\"Niramit\",sans-serif!important;font-weight:700!important;font-size:.95rem!important;line-height:1.2!important;letter-spacing:-.01em!important;text-transform:uppercase!important;color:var(--lc)!important;white-space:nowrap}" +
      B + ":before," + B + ":after{display:none!important;content:none!important}" +
      B + ":focus-visible{outline:2px solid var(--lc)!important;outline-offset:4px!important}" +
      ".mabob .mab-btn-wrap{display:flex!important;justify-content:flex-start!important;padding-left:0!important;padding-right:0!important;margin-left:0!important;margin-right:0!important;text-align:left!important;width:auto!important}" +
      ".mabob b.mab-ar{all:unset;position:relative!important;display:block!important;flex:none!important;width:28px!important;height:28px!important;box-sizing:border-box!important;border:1.75px solid currentColor!important;border-radius:50%!important;transition:transform .25s ease!important}" +
      ".mabob b.mab-ar:before{content:\"\";position:absolute;left:50%;top:50%;width:12px;height:1.75px;margin:-.875px 0 0 -6px;background:currentColor;border-radius:1px}" +
      ".mabob b.mab-ar:after{content:\"\";position:absolute;left:50%;top:50%;width:6.5px;height:6.5px;margin:-3.25px 0 0 -.6px;box-sizing:border-box;border-top:1.75px solid currentColor;border-right:1.75px solid currentColor;transform:rotate(45deg)}" +
      B + ":hover b.mab-ar," + B + ":focus-visible b.mab-ar{transform:translateX(5px)!important}" +
      ".mabob .w-grid{gap:20px!important;align-items:stretch!important}" +
      ".mabob .grid__item{display:flex!important;min-width:0}" +
      ".mabob .grid__item>.w-wrapper{display:flex!important;flex-direction:column;width:100%;box-sizing:border-box;background:var(--pc);border:1px solid var(--pb);border-radius:18px;padding:22px!important;cursor:default;transition:transform .3s ease}" +
      ".mabob .grid__item>.w-wrapper:hover{transform:translateY(-4px)}" +
      ".mabob .grid__item>.w-wrapper:has(.w-button){cursor:pointer}" +
      ".mabob .grid__item>.w-wrapper>.w-container{display:flex!important;flex-direction:column!important;flex:1;flex-wrap:nowrap!important;margin:0!important}" +
      ".mabob .grid__item .w-container>.w-cell{flex:0 0 auto!important;max-width:100%!important;width:100%!important;margin:0!important;padding:0!important}" +
      ".mabob .grid__item .w-container>.w-cell.text-col{flex:1 1 auto!important;display:flex!important;flex-direction:column}" +
      ".mabob .grid__item .text-col>.w-container{display:flex!important;flex-direction:column!important;flex:1;margin:0!important;padding:22px 2px 2px!important}" +
      ".mabob .grid__item .text-col .w-cell{margin:0!important;padding:0!important;max-width:100%!important;justify-content:flex-start!important}" +
      ".mabob .grid__item .text-col .w-cell:last-child:has(.w-button){margin-top:auto!important;padding-top:20px!important}" +
      ".mabob .grid__item figure{margin:0!important}" +
      ".mabob .grid__item .figure__aspect-ratio{display:block!important;position:relative!important;aspect-ratio:16/10!important;height:auto!important;padding:0!important;border-radius:12px!important;overflow:hidden!important;background:#F9CFD8;isolation:isolate}" +
      ".mabob .grid__item .figure__aspect-ratio .image,.mabob .grid__item .figure__aspect-ratio img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important}" +
      ".mabob.mabob-duo .grid__item .figure__aspect-ratio img{filter:grayscale(1) contrast(1.15) brightness(1.05);mix-blend-mode:multiply}" +
      ".mabob.mabob-duo .grid__item .figure__aspect-ratio:after{content:\"\";position:absolute;inset:0;background:" + COLOR + ";mix-blend-mode:lighten;pointer-events:none;z-index:2}" +
      ".mabob .grid__item h3,.mabob .grid__item h3 *{font-family:\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif!important;font-weight:800!important;font-size:clamp(1.8rem,2.6vw,2.4rem)!important;line-height:.98!important;letter-spacing:-.035em!important;text-transform:none!important;color:" + COLOR + "!important;text-align:left!important;margin:0 0 10px!important}" +
      ".mabob .grid__item .text-col p:not(.w-button p){color:" + COLOR + "!important;opacity:.78;text-align:left!important;margin:0!important}" +
      "@media(max-width:767px){.mabob .w-grid{display:grid!important;grid-template-columns:1fr!important}.mabob .grid__item>.w-wrapper{padding:16px!important}}";
    function run(){
      for (var b = 0; b < BLOCKS.length; b++){
        var wrap = D.getElementById(BLOCKS[b]); if (!wrap) continue;
        var bl = wrap.querySelector(".w-block") || wrap;
        bl.classList.add("mabob");
        var lc = COLOR;
        if (!lc) { var p = bl.querySelector(".grid__item p, .grid__item h3"); lc = p ? getComputedStyle(p).color : "#1d2a21"; }
        bl.style.setProperty("--lc", lc);
        bl.classList.toggle("mabob-duo", DUOTONE);
        var cards = bl.querySelectorAll(".grid__item > .w-wrapper");
        for (var c = 0; c < cards.length; c++){
          var col = PANELS[c % PANELS.length];
          cards[c].style.setProperty("--pc", col);
          cards[c].style.setProperty("--pb", /^#?f{3,6}$/i.test(col.replace("#","")) ? LINE : "transparent");
          if (!cards[c].mabc) { cards[c].mabc = 1; cards[c].addEventListener("click", function(e){ var x = this.querySelector(".w-button"); if (x && !x.contains(e.target)) x.click(); }); }
        }
        var bt = bl.querySelectorAll(".w-button");
        for (var i = 0; i < bt.length; i++) if (!bt[i].querySelector("b.mab-ar")) { var ar = D.createElement("b"); ar.className = "mab-ar"; ar.setAttribute("aria-hidden", "true"); bt[i].appendChild(ar); }
        for (var j = 0; j < bt.length; j++) { var w = bt[j].parentElement; if (w) w.classList.add("mab-btn-wrap"); }
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(q).observe(D.documentElement, { childList: true, subtree: true });
    q();
  }]);

  /* ---------- Page banners: About, Custom Cakes, Catering ---------- */
  M.push(["shero", function(){
    /* Page banners with text on one side and the photo on the other (About, Custom Cakes, Catering).
       Photo = rounded rectangle, spinning badge on the lower left of the photo, word on a pink tag.
       ===== EDIT HERE: one line per banner block (id of the Square block) =====
       ratio: photo shape "4/3" or "1/1".  w: photo width on desktop.  tight: desktop banner right under the menu.
       shape: "rect" or "arch".  focus: visible part of the photo ("50% 0%" = top).
       hl: word on a pink tag ("" = none), exact: true = only this exact spelling (your, not Your).
       center: badge middle lines (2nd is big), caps: big line in capitals.  ring: text turning around.
       side: "right" = badge on the lower right of the photo on desktop (for a photo on the left of the page). */
    var CFG = {
      kXWxIF: { ratio: "4/3", w: "100%", tight: false, shape: "rect", focus: "50% 15%", hl: "big",   exact: false,
                center: ["Since", "2018"], caps: false, ring: "Wooster, Ohio \u00B7 #SpreadTheSparkle \u00B7 " },
      ugclAP: { ratio: "4/3", w: "100%", tight: true,  shape: "rect", focus: "50% 50%", hl: "your",  exact: true,
                center: ["Any", "idea", "any day"], caps: true, ring: "Miss Amy\u2019s Bakery \u00B7 Miss Amy\u2019s Bakery \u00B7 " },
      zhjUlG: { ratio: "4/3", w: "100%", tight: true,  shape: "rect", focus: "50% 50%", hl: "crowd", exact: true,
                center: ["Dessert", "bars", "& more"], caps: true, ring: "Catering \u00B7 Events \u00B7 Miss Amy\u2019s Bakery \u00B7 " },
      SmLbTp: { ratio: "4/3", w: "100%", tight: true,  shape: "rect", focus: "50% 50%", hl: "friends", exact: false, side: "right",
                center: ["Since", "2018", "Wooster"], caps: false, ring: "Custom orders \u00B7 Weddings \u00B7 Daily menu \u00B7 " }   /* Contact */
    };
    var BLUSH = "#F9CFD8", BADGE_BG = "#81D8D0", BADGE_FG = "#9B1B45", SIZE = 160;
    /* Optional editable badge: a Square Text block on the page with 3 lines: BADGE / Any | idea | any day / ring text.
       Hidden on the live site, dashed frame in the editor. */
    var BADGE_MARK = "BADGE";
    /* ===================== */
    var D = document, R = SIZE / 2 - 12;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var EDIT = false;
    try { EDIT = window.top !== window && !/preview/i.test(window.top.location.href); } catch (e) { EDIT = window.top !== window; }
    var S =
      ".mabsh .mabsh-art{position:relative!important;max-width:100%;margin-left:auto!important}" +
      ".mabsh .mabsh-art figure{margin:0!important}" +
      ".mabsh .mabsh-art .figure__aspect-ratio{display:block!important;position:relative!important;height:auto!important;padding:0!important;overflow:hidden!important}" +
      ".mabsh .mabsh-art .figure__aspect-ratio .image,.mabsh .mabsh-art img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important}" +
      (EDIT ? ".mabsh-src{outline:2px dashed #9B1B45;outline-offset:-6px;position:relative}.mabsh-src:before{content:\"BADGE TEXT (hidden on the live site)\";position:absolute;z-index:3;top:10px;right:12px;background:#9B1B45;color:#fff;font:700 11px/1 sans-serif;letter-spacing:.08em;padding:5px 8px;border-radius:5px}" : ".mabsh-src{display:none!important}") +
      ".mabsh .mabsh-hl{display:inline-block;background:" + BLUSH + ";padding:0 .12em;border-radius:.12em;transform:rotate(-2deg)}" +
      ".mabsh .mabsh-bd{position:absolute;z-index:5;left:-" + Math.round(SIZE * 0.45) + "px;bottom:9%;width:" + SIZE + "px;height:" + SIZE + "px;border-radius:50%;background:" + BADGE_BG + ";color:" + BADGE_FG + ";pointer-events:none;transform:rotate(-8deg);animation:mabshIn .6s cubic-bezier(.2,.9,.3,1.3) both}" +
      ".mabsh .mabsh-ring{position:absolute;inset:0;animation:mabshSpin 20s linear infinite}" +
      ".mabsh .mabsh-ring span{position:absolute;left:50%;top:9px;height:" + R + "px;width:12px;margin-left:-6px;transform-origin:50% " + (R + 3) + "px;text-align:center;font:700 12px/1 \"Niramit Bold\",\"Niramit\",sans-serif;text-transform:uppercase}" +
      ".mabsh .mabsh-mid{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font:700 .66rem/1.15 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.2em;text-transform:uppercase}" +
      ".mabsh .mabsh-mid b{display:block;font:800 2.2rem/1 " + DISP + ";letter-spacing:-.03em;margin:2px 0;text-transform:none}" +
      "@keyframes mabshSpin{to{transform:rotate(360deg)}}" +
      "@keyframes mabshIn{from{opacity:0;scale:.6}}" +
      "@media(max-width:767px){" +
        ".mabsh .mabsh-art{width:100%!important}" +
        ".mabsh .mabsh-bd{transform:rotate(-8deg) scale(.62);transform-origin:left bottom;left:10px;bottom:10px}" +
        ".mabsh .button-group.button-group{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:flex-start!important;gap:12px 16px!important}" +
        ".mabsh .button-group .button-wrapper{flex:0 1 auto!important;width:auto!important;min-width:0!important;margin:0!important}" +
        ".mabsh .button-group .w-button:not(.mf){width:auto!important;min-width:0!important;padding-left:18px!important;padding-right:18px!important}" +
        ".mabsh .button-group .w-button p{font-size:15px!important;white-space:nowrap!important}" +
        ".mabsh .button-group a.mf.mf.mf.mf.mf *{font-size:15px!important}" +
        ".mabsh .element-group h1,.mabsh .element-group h2,.mabsh .element-group h1 *,.mabsh .element-group h2 *{font-size:min(calc((100vw - 48px) / 9.9),64px)!important;line-height:1!important;text-wrap:balance}" +
        ".mabsh{padding-top:0!important;margin-top:0!important}" +
        ".mabsh>.container{padding-top:12px!important;margin-top:0!important}" +
        ".mabsh>.container>.w-container,.mabsh .text-image-row,.mabsh .text-image-container{margin-top:0!important;padding-top:0!important}" +
        ".mabsh .text-image-container>.w-cell{margin-top:0!important}" +
        ".mabsh .mabsh-art{margin:0 0 20px!important}" +
      "}" +
      "@media(prefers-reduced-motion:reduce){.mabsh .mabsh-bd,.mabsh .mabsh-ring{animation:none}}";
    /* per banner rules */
    Object.keys(CFG).forEach(function(id){
      var c = CFG[id], X = "#" + id + " .mabsh";
      S += X + " .mabsh-art{width:" + c.w + "}" +
        X + " .mabsh-art .figure__aspect-ratio{aspect-ratio:" + c.ratio + "!important;border-radius:" + (c.shape === "arch" ? "50% 50% 18px 18px / 40% 40% 18px 18px" : "18px") + "!important}" +
        X + " .mabsh-art .figure__aspect-ratio .image," + X + " .mabsh-art img{object-position:" + c.focus + "!important}" +
        (c.caps ? X + " .mabsh-mid b{text-transform:uppercase}" : "") +
        (c.side === "right" ? "@media(min-width:768px){" + X + " .mabsh-bd{left:auto;right:-" + Math.round(SIZE * 0.45) + "px}}" : "") +
        (c.tight ? "@media(min-width:768px){" + X + "{padding-top:0!important;margin-top:0!important}" + X + ">.container{padding-top:16px!important;margin-top:0!important}" +
          X + ">.container>.w-container," + X + " .text-image-row," + X + " .text-image-container{margin-top:0!important;padding-top:0!important}}" : "");
    });
    function highlight(bl, c){
      if (!c.hl || bl.querySelector(".mabsh-hl")) return;
      var h = bl.querySelector("h1,h2"); if (!h) return;
      var w = D.createTreeWalker(h, NodeFilter.SHOW_TEXT), n, re = new RegExp("\\b(" + c.hl + ")\\b", c.exact ? "" : "i");
      while ((n = w.nextNode())) {
        var m = n.nodeValue.match(re); if (!m) continue;
        var x = n.splitText(m.index); x.splitText(m[0].length);
        var sp = D.createElement("span"); sp.className = "mabsh-hl"; sp.textContent = x.nodeValue; x.parentNode.replaceChild(sp, x);
        return true;
      }
    }
    function badgeText(c){
      var tcs = D.querySelectorAll("[data-block-purpose] .text-component");
      for (var i = 0; i < tcs.length; i++){
        var t = tcs[i]; if (t.closest(".mabsh")) continue;
        var tmp = D.createElement("div"); tmp.innerHTML = t.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|h\d)>/gi, "\n");
        var raw = (tmp.textContent || "").replace(/\u00A0/g, " ");
        var ls = raw.split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean);
        if (!ls.length || ls[0].toUpperCase() !== BADGE_MARK) continue;
        var wr = t.closest("[data-block-purpose]");
        if (wr && !wr.classList.contains("mabsh-src")) wr.classList.add("mabsh-src");
        var center = ls[1] ? ls[1].split("|").map(function(x){ return x.trim(); }) : c.center;
        var ring = ls[2] ? ls[2] : c.ring;
        if (!/[\u00B7]\s*$/.test(ring)) ring += " \u00B7 ";
        if (ring.length < 24) ring = ring + ring;
        return { center: center, ring: ring };
      }
      return { center: c.center, ring: c.ring };
    }
    function run(){
      Object.keys(CFG).forEach(function(id){
        var c = CFG[id], wrap = D.getElementById(id); if (!wrap) return;
        var bl = wrap.querySelector(".w-block"); if (!bl) return;
        if (!bl.classList.contains("mabsh")) bl.classList.add("mabsh");
        var fig = bl.querySelector("figure"); if (!fig) return;
        var art = fig.parentElement; if (!art.classList.contains("mabsh-art")) art.classList.add("mabsh-art");
        var cfg = badgeText(c), key = JSON.stringify(cfg), old = art.querySelector(".mabsh-bd");
        if (old && old.getAttribute("data-k") !== key) { old.remove(); old = null; }
        if (!old && (art.mabT | 0) < 12) {
          art.mabT = (art.mabT | 0) + 1;
          var ringTxt = cfg.ring, fsz = Math.min(14, (2 * Math.PI * R) / ringTxt.length * 0.92);
          var bd = D.createElement("div"); bd.className = "mabsh-bd"; bd.setAttribute("aria-hidden", "true"); bd.setAttribute("data-k", key);
          var ring = D.createElement("div"); ring.className = "mabsh-ring";
          var ch = ringTxt.split(""), step = 360 / ch.length;
          ch.forEach(function(x, k){ var sp = D.createElement("span"); sp.textContent = x; sp.style.transform = "rotate(" + (k * step) + "deg)"; sp.style.fontSize = fsz.toFixed(1) + "px"; ring.appendChild(sp); });
          var mid = D.createElement("div"); mid.className = "mabsh-mid";
          var inner = D.createElement("div"); inner.appendChild(D.createTextNode(cfg.center[0] || ""));
          var big = D.createElement("b"); big.textContent = cfg.center[1] || ""; inner.appendChild(big);
          if (cfg.center[2]) inner.appendChild(D.createTextNode(cfg.center[2]));
          mid.appendChild(inner); bd.appendChild(ring); bd.appendChild(mid); art.appendChild(bd);
        }
        if ((bl.mabH | 0) < 8 && highlight(bl, c)) bl.mabH = (bl.mabH | 0) + 1;
      });
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (!(x.closest && x.closest(".mabsh-bd,.mabsh-hl"))) { q(); return; } } }).observe(D.documentElement, { childList: true, subtree: true, characterData: true });
    q();
  }]);

  /* ---------- Weddings banner ---------- */
  M.push(["whero", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square banner block (element with class w-block-wrapper).
       PHOTO_H: photo height on desktop (it scales with the screen height so text + photo fit together).
       CENTER: lines in the middle of the badge (the middle one is big). RING: text that turns around it.
       Other ring ideas: "Made from scratch \u00B7 For your big day \u00B7 "
                         "Cut the cake \u00B7 Share the sweets \u00B7 " */
    var BLOCKS = ["OVmCkz"];
    var PHOTO_H = "clamp(240px,44vh,480px)", PHOTO_H_MOBILE = "260px";
    var FOCUS = "50% 18%";              /* which part of the photo stays visible: "50% 0%" = top, "50% 50%" = center */
    var CENTER = ["Say", "I DO", "to dessert"];
    var RING = "Wedding cakes \u00B7 Cupcakes \u00B7 Dessert bars \u00B7 ";
    var BADGE_BG = "#81D8D0", BADGE_FG = "#9B1B45", SIZE = 170;
    /* ===================== */
    var D = document, R = SIZE / 2 - 12, fs = Math.min(14, (2 * Math.PI * R) / RING.length * 0.92);
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var X = ".mabwh>.container>.w-wrapper>.w-container";
    var S =
      ".mabwh>.container{padding-top:clamp(20px,3vw,44px)!important;padding-bottom:clamp(28px,4vw,56px)!important}" +
      X + "{display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important}" +
      X + ">.w-cell:last-child{order:1;margin:0 auto!important}" +
      X + ">.w-cell:first-child{order:2;margin:clamp(28px,3.5vw,44px) 0 0!important;max-width:100%!important;flex:none!important;width:100%!important}" +
      ".mabwh .mabwh-art{position:relative!important}" +
      ".mabwh .mabwh-art figure{margin:0!important}" +
      ".mabwh .mabwh-art .figure__aspect-ratio{display:block!important;position:relative!important;height:" + PHOTO_H + "!important;aspect-ratio:auto!important;padding:0!important;border-radius:18px!important;overflow:hidden!important}" +
      ".mabwh .mabwh-art .figure__aspect-ratio .image,.mabwh .mabwh-art img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:" + FOCUS + "!important}" +
      ".mabwh .mabwh-bd{position:absolute;z-index:5;right:6%;top:-" + Math.round(SIZE * 0.38) + "px;width:" + SIZE + "px;height:" + SIZE + "px;border-radius:50%;background:" + BADGE_BG + ";color:" + BADGE_FG + ";pointer-events:none;transform:rotate(-8deg);animation:mabwhIn .6s cubic-bezier(.2,.9,.3,1.3) both}" +
      ".mabwh .mabwh-ring{position:absolute;inset:0;animation:mabwhSpin 20s linear infinite}" +
      ".mabwh .mabwh-ring span{position:absolute;left:50%;top:9px;height:" + R + "px;width:12px;margin-left:-6px;transform-origin:50% " + (R + 3) + "px;text-align:center;font:700 " + fs.toFixed(1) + "px/1 \"Niramit Bold\",\"Niramit\",sans-serif;text-transform:uppercase}" +
      ".mabwh .mabwh-mid{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font:700 .62rem/1.15 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.18em;text-transform:uppercase}" +
      ".mabwh .mabwh-mid b{display:block;font:800 2.1rem/1 " + DISP + ";letter-spacing:-.03em;margin:3px 0 2px;text-transform:none}" +
      "@keyframes mabwhSpin{to{transform:rotate(360deg)}}" +
      "@keyframes mabwhIn{from{opacity:0;scale:.6}}" +
      "@media(max-width:767px){" +
        ".mabwh .mabwh-art .figure__aspect-ratio{height:" + PHOTO_H_MOBILE + "!important;border-radius:14px!important}" +
        ".mabwh .mabwh-bd{transform:rotate(-8deg) scale(.62);transform-origin:left bottom;right:auto;left:10px;top:auto;bottom:10px}" +
        ".mabwh .button-group{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:12px!important;justify-content:flex-start!important}" +
        ".mabwh .button-group .button-wrapper{flex:0 0 auto!important;min-width:0!important;margin:0!important;width:auto!important}" +
        ".mabwh .button-group .w-button:not(.mf){width:auto!important;min-width:0!important;padding-left:14px!important;padding-right:14px!important}" +
        ".mabwh .button-group .w-button p{white-space:nowrap}" +
      "}" +
      "@media(prefers-reduced-motion:reduce){.mabwh .mabwh-bd,.mabwh .mabwh-ring{animation:none}}";
    var tries = 0;
    function run(){
      for (var b = 0; b < BLOCKS.length; b++){
        var wrap = D.getElementById(BLOCKS[b]); if (!wrap) continue;
        var bl = wrap.querySelector(".w-block"); if (!bl) continue;
        if (!bl.classList.contains("mabwh")) bl.classList.add("mabwh");
        var fig = bl.querySelector("figure"); if (!fig) continue;
        var art = fig.parentElement; if (!art.classList.contains("mabwh-art")) art.classList.add("mabwh-art");
        if (!art.querySelector(".mabwh-bd") && (art.mabT | 0) < 6) {
          art.mabT = (art.mabT | 0) + 1;
          var bd = D.createElement("div"); bd.className = "mabwh-bd"; bd.setAttribute("aria-hidden", "true");
          var ring = D.createElement("div"); ring.className = "mabwh-ring";
          var ch = RING.split(""), step = 360 / ch.length;
          ch.forEach(function(c, k){ var sp = D.createElement("span"); sp.textContent = c; sp.style.transform = "rotate(" + (k * step) + "deg)"; ring.appendChild(sp); });
          var mid = D.createElement("div"); mid.className = "mabwh-mid";
          var inner = D.createElement("div");
          inner.appendChild(D.createTextNode(CENTER[0]));
          var big = D.createElement("b"); big.textContent = CENTER[1]; inner.appendChild(big);
          if (CENTER[2]) inner.appendChild(D.createTextNode(CENTER[2]));
          mid.appendChild(inner); bd.appendChild(ring); bd.appendChild(mid); art.appendChild(bd);
        }
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (!(x.closest && x.closest(".mabwh-bd"))) { q(); return; } } }).observe(D.documentElement, { childList: true, subtree: true });
    q();
  }]);

  /* ---------- 3 steps (Weddings, Catering) ---------- */
  M.push(["steps3", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square block(s) (element with class w-block-wrapper). */
    var BLOCKS = ["dryWhS", "DeZIal"];   /* Weddings "How to secure your date", Catering "How it works" */
    var INK = "#9B1B45";
    var NUMBERS = true;                 /* big 1 2 3 above each step */
    /* ===================== */
    var D = document;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var sel = BLOCKS.map(function(id){ return "#" + id + " .w-block"; }).join(",");
    function each(rule){ return BLOCKS.map(function(id){ return "#" + id + " .w-block " + rule; }).join(","); }
    var S =
      sel + "{--mabink:" + INK + "}" +
      each(".w-grid") + "{counter-reset:mabh;align-items:stretch!important}" +
      each(".grid__item") + "{counter-increment:mabh;border-top:1.5px solid " + INK + ";padding-top:18px!important;min-width:0}" +
      (NUMBERS ? each(".grid__item .text-col>.w-container") + "{display:flex!important;flex-direction:column!important}" +
                 each(".grid__item .text-col>.w-container:before") + "{content:counter(mabh);display:block;font-family:" + DISP + ";font-weight:800;font-stretch:75%;font-size:3rem;line-height:1;letter-spacing:-.04em;color:" + INK + ";margin:0 0 12px;text-align:left}" : "") +
      each(".grid__item .w-cell") + "{margin:0!important;padding:0!important;text-align:left!important}" +
      each(".grid__item h3") + "," + each(".grid__item h3 *") + "{font-family:" + DISP + "!important;font-weight:800!important;font-size:clamp(1.35rem,1.9vw,1.6rem)!important;line-height:1.05!important;letter-spacing:-.025em!important;color:" + INK + "!important;text-align:left!important;margin:0 0 8px!important}" +
      each(".grid__item p") + "{color:" + INK + "!important;opacity:.78;text-align:left!important;margin:0!important}" +
      each(".grid__item p *") + "{color:" + INK + "!important}" +
      "@media(max-width:767px){" + each(".grid__item") + "{padding-top:14px!important}}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
  }]);

  /* ---------- Color panel: Good to know / Everyone gets a treat ---------- */
  M.push(["gtk", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square block(s) (element with class w-block-wrapper).
       PANEL COLOR: Amy picks it herself in Square = the background color of the block.
                    If the block is cream (or no color), DEFAULT is used. PANEL = force one color and ignore Square.
       PAGE: color around the panel. */
    var BLOCKS = ["XUWBrN", "eIfRPa"];   /* Custom Cakes "Good to know", Catering "Everyone gets a treat" */
    var PANEL = "", DEFAULT = "#D5E6C8", PAGE = "#F7EFE6";
    /* ===================== */
    var D = document;
    var C = ".mabgk>.container", ROW = C + ">.w-container>.w-cell>.w-container";
    var S =
      ".mabgk.mabgk{background:" + PAGE + "!important;padding-top:clamp(12px,2vw,24px)!important;padding-bottom:clamp(12px,2vw,24px)!important}" +
      C + "{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding:clamp(22px,3vw,40px) clamp(22px,3.5vw,52px)!important;background:var(--mabgk)!important;border-radius:18px!important}" +
      C + ">.w-container," + C + ">.w-container>.w-cell{margin:0!important;padding:0!important}" +
      ROW + "{display:flex!important;flex-wrap:nowrap!important;align-items:flex-start!important;gap:clamp(20px,3vw,44px)!important;margin:0!important}" +
      ROW + ">.w-cell{margin:0!important;padding:0!important;min-width:0!important}" +
      ROW + ">.w-cell:first-child{flex:none!important;max-width:none!important;width:auto!important}" +
      ROW + ">.w-cell:last-child{flex:1 1 auto!important;max-width:70ch!important}" +
      ".mabgk h1,.mabgk h2,.mabgk h3{margin:0!important;white-space:nowrap}" +
      ".mabgk .w-grid,.mabgk p{margin:0!important}" +
      "@media(max-width:767px){" +
        C + "{width:calc(100% - 32px)!important;padding:22px 20px!important}" +
        ROW + "{flex-direction:column!important;gap:10px!important}" +
        ROW + ">.w-cell{width:100%!important;max-width:100%!important}" +
      "}";
    function run(){
      for (var b = 0; b < BLOCKS.length; b++){
        var w = D.getElementById(BLOCKS[b]); if (!w) continue;
        var bl = w.querySelector(".w-block"); if (!bl) continue;
        var c = PANEL || mabBg(bl, DEFAULT, PAGE);
        if (bl.style.getPropertyValue("--mabgk") !== c) bl.style.setProperty("--mabgk", c);
        if (!bl.classList.contains("mabgk")) bl.classList.add("mabgk");
        mabEd(w, "Panel color = this block background color in Square (cream = default pistachio)");
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    function bgChanged(m){ var x = m.target; if (!x.classList || !x.classList.contains("mabgk")) return false; var v = x.style.getPropertyValue("background-color"); if (v === x.mabBgV) return false; x.mabBgV = v; return true; }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { if (ms[i].type === "childList" || bgChanged(ms[i])) { q(); return; } } }).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    run(); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- Catering: Any day worth celebrating pills ---------- */
  M.push(["chips", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square block(s) (element with class w-block-wrapper).
       CHIP: pill color. HOVER: pill colors on hover, used in turn. */
    var BLOCKS = ["QZvVfa"];
    var INK = "#9B1B45", CHIP = "#FFFFFF", LINE = "rgba(155,27,69,.35)";
    var HOVER = ["#F9CFD8", "#D5E6C8"];
    /* ===================== */
    var D = document;
    var BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    function each(rule){ return BLOCKS.map(function(id){ return "#" + id + " .w-block " + rule; }).join(","); }
    var I = ".grid__item:not(:first-child)";
    var S =
      each(".w-grid") + "{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:10px!important}" +
      each(".grid__item") + "{min-width:0;margin:0!important}" +
      each(".grid__item:first-child") + "{flex:0 0 100%!important;max-width:100%!important;margin-bottom:12px!important}" +
      each(I) + "{flex:0 0 auto!important;width:auto!important;max-width:100%!important}" +
      each(".grid__item .w-container") + "," + each(".grid__item .w-cell") + "{margin:0!important;padding:0!important;max-width:100%!important;flex:0 0 auto!important;width:auto!important}" +
      each(".grid__item:first-child .w-cell") + "{width:100%!important}" +
      each(I + ">.w-wrapper") + "{display:block;border:1px solid " + LINE + ";border-radius:999px;background:" + CHIP + ";padding:9px 18px!important;transition:background .2s ease,border-color .2s ease}" +
      each(".grid__item:nth-child(even):hover>.w-wrapper") + "{background:" + HOVER[0] + ";border-color:transparent}" +
      each(".grid__item:nth-child(odd):not(:first-child):hover>.w-wrapper") + "{background:" + (HOVER[1] || HOVER[0]) + ";border-color:transparent}" +
      each(I + " p") + "," + each(I + " p *") + "{font-family:" + BOLD + "!important;font-weight:700!important;font-size:.8rem!important;line-height:1.2!important;letter-spacing:.12em!important;text-transform:uppercase!important;color:" + INK + "!important;margin:0!important;white-space:nowrap;text-align:left!important}" +
      each(".grid__item:first-child h2") + "{margin:0!important}" +
      each(".grid__item:first-child .w-cell+.w-cell") + "{margin-top:14px!important}" +
      "@media(max-width:767px){" +
        each(".w-grid") + "{gap:8px!important}" +
        each(I + ">.w-wrapper") + "{padding:8px 14px!important}" +
        each(I + " p") + "," + each(I + " p *") + "{font-size:.72rem!important;letter-spacing:.1em!important}" +
      "}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
  }]);

  /* ---------- Custom Cakes: step rail ---------- */
  M.push(["rail", function(){
    /* ===== EDIT HERE =====
       BLOCK: id of the Square block with the 4 steps.
       TARGETS: ids of the 4 step sections further down the page, so a click scrolls there.
                Leave [] until those blocks exist, then add their ids in order, e.g. ["aaaaaa","bbbbbb","cccccc","dddddd"]. */
    var BLOCK = "qLZIAc";
    var TARGETS = [];
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)", HOVER = "#F9CFD8";
    /* ===================== */
    var D = document, B = "#" + BLOCK + " .w-block";
    var ROW = B + " .container>.w-container>.w-cell>.w-container";
    var S =
      B + "{padding-top:clamp(16px,2.5vw,32px)!important;padding-bottom:clamp(16px,2.5vw,32px)!important}" +
      B + " .container{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}" +
      ROW + ">.w-cell.cell--empty{display:none!important}" +
      ROW + ">.w-cell:last-child{flex:0 0 100%!important;max-width:100%!important;margin:0!important;padding:0!important}" +
      B + " .w-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:0!important;border-top:1px solid " + LINE + ";border-bottom:1px solid " + LINE + ";counter-reset:mabst;margin:0!important}" +
      B + " .grid__item{counter-increment:mabst;margin:0!important;border-left:1px solid " + LINE + ";min-width:0;transition:background .2s ease}" +
      B + " .grid__item:first-child{border-left:0}" +
      B + " .grid__item>.w-wrapper>.w-cell{display:flex!important;flex-direction:row!important;align-items:center!important;gap:16px;padding:18px 20px!important;margin:0!important}" +
      B + " .grid__item>.w-wrapper>.w-cell:before{content:counter(mabst);flex:none;width:44px;height:44px;box-sizing:border-box;border:1.5px solid " + INK + ";border-radius:50%;display:grid;place-items:center;font:800 1.15rem/1 \"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif;color:" + INK + "}" +
      B + " .grid__item>.w-wrapper>.w-cell>.w-cell:first-child{display:none!important}" +
      B + " .grid__item>.w-wrapper>.w-cell>.w-cell{margin:0!important;padding:0!important;min-width:0}" +
      B + " .grid__item p{margin:0!important;font-size:.9rem!important;letter-spacing:.12em!important;line-height:1.25!important}" +
      (TARGETS.length ? B + " .grid__item{cursor:pointer}" + B + " .grid__item:hover{background:" + HOVER + "}" : "") +
      "@media(max-width:900px){" +
        B + " .grid__item>.w-wrapper>.w-cell{padding:14px 12px!important;gap:12px}" +
        B + " .grid__item>.w-wrapper>.w-cell:before{width:36px;height:36px;font-size:1rem}" +
        B + " .grid__item p{font-size:.72rem!important;letter-spacing:.08em!important}" +
      "}" +
      "@media(max-width:767px){" +
        B + " .container{width:calc(100% - 32px)!important}" +
        B + " .w-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}" +
        B + " .grid__item:nth-child(3){border-left:0}" +
        B + " .grid__item:nth-child(-n+2){border-bottom:1px solid " + LINE + "}" +
      "}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    D.addEventListener("click", function(e){
      if (!TARGETS.length) return;
      var it = e.target.closest && e.target.closest("#" + BLOCK + " .grid__item"); if (!it) return;
      var k = [].indexOf.call(it.parentNode.children, it), t = D.getElementById(TARGETS[k]);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }]);

  /* ---------- Custom Cakes: size table ---------- */
  M.push(["size", function(){
    /* ===== EDIT HERE =====
       BLOCK: id of the Square block.  NUM: big step number above the title ("" = none). */
    var BLOCK = "kVzhWN";
    var NUM = "01";
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)", TINT = "rgba(155,27,69,.05)";
    /* ===================== */
    var D = document;
    /* In the Square editor the original columns stay visible (under the table) so they can be edited.
       On the live site and in Preview only the table shows. */
    var EDIT = false;
    try { EDIT = window.top !== window && !/preview/i.test(window.top.location.href); } catch (e) { EDIT = window.top !== window; }
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif", BODY = "\"Niramit Regular\",\"Niramit\",sans-serif";
    var B = "#" + BLOCK + " .w-block", ROW = B + " .container>.w-container>.w-cell";
    var S =
      B + " .container{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}" +
      ROW + "{display:grid!important;grid-template-columns:minmax(0,320px) minmax(0,1fr);column-gap:clamp(28px,5vw,72px);align-items:start;max-width:100%!important;flex:1 1 100%!important}" +
      ROW + ">.w-cell{margin:0!important}" +
      (EDIT ? ROW + ">.w-grid{grid-column:1/-1;margin-top:28px!important;padding:16px!important;border:2px dashed " + INK + ";border-radius:12px;position:relative}" +
              ROW + ">.w-grid:before{content:\"EDIT PRICES HERE (hidden on the live site)\";position:absolute;top:-11px;left:14px;background:" + INK + ";color:#fff;font:700 11px/1 " + BOLD + ";letter-spacing:.08em;padding:5px 8px;border-radius:5px}"
            : ROW + ">.w-grid{display:none!important}") +
      (NUM ? ROW + ">.w-cell:first-child:before{content:\"" + NUM + "\";display:block;font:800 clamp(4rem,9vw,7.5rem)/.8 " + DISP + ";font-stretch:75%;letter-spacing:-.05em;color:" + INK + ";opacity:.9;margin-bottom:18px}" : "") +
      ".mabsz{min-width:0}" +
      ".mabsz-box{overflow-x:auto;border:1px solid " + LINE + ";border-radius:16px;background:#fff}" +
      ".mabsz table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;color:" + INK + "}" +
      ".mabsz th,.mabsz td{text-align:left;padding:16px 20px;border-bottom:1px solid " + LINE + ";vertical-align:top}" +
      ".mabsz tr:last-child td,.mabsz tbody tr:last-child th{border-bottom:0}" +
      ".mabsz thead th{font:700 .72rem/1.2 " + BOLD + ";letter-spacing:.14em;text-transform:uppercase;background:" + TINT + "}" +
      ".mabsz tbody th{font:800 1.6rem/1 " + DISP + ";letter-spacing:-.02em;white-space:nowrap}" +
      ".mabsz td b{display:block;font:800 1.25rem/1.1 " + DISP + "}" +
      ".mabsz td span{display:block;margin-top:4px;font:400 .95rem/1.3 " + BODY + ";opacity:.8}" +
      ".mabsz-note{margin:16px 0 0;color:" + INK + ";font:400 .95rem/1.5 " + BODY + "}" +
      ".mabsz-note b{font-family:" + BOLD + "}" +
      "@media(max-width:767px){" +
        B + " .container{width:calc(100% - 32px)!important}" +
        ROW + "{grid-template-columns:minmax(0,1fr);row-gap:22px}" +
        ".mabsz th,.mabsz td{padding:12px 12px}" +
        ".mabsz tbody th{font-size:1.25rem}" +
        ".mabsz td b{font-size:1.05rem}" +
        ".mabsz td span{font-size:.82rem}" +
        ".mabsz thead th{font-size:.62rem;letter-spacing:.08em}" +
      "}";
    function lines(p){
      /* text split by line breaks, keeping empty lines as group separators */
      var out = [], cur = "";
      (function walk(n){
        for (var c = n.firstChild; c; c = c.nextSibling){
          if (c.nodeName === "BR") { out.push(cur); cur = ""; }
          else if (c.nodeName === "P" || c.nodeName === "DIV") { if (cur) { out.push(cur); cur = ""; } walk(c); if (cur) { out.push(cur); cur = ""; } }
          else if (c.nodeType === 3) cur += c.nodeValue;
          else walk(c);
        }
      })(p);
      if (cur) out.push(cur);
      return out.map(function(s){ return s.replace(/\u00a0/g, " ").trim(); });
    }
    function groups(ls){
      var g = [], cur = [];
      ls.forEach(function(l){ if (!l) { if (cur.length) { g.push(cur); cur = []; } } else cur.push(l); });
      if (cur.length) g.push(cur);
      return g;
    }
    function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function build(){
      var w = D.getElementById(BLOCK); if (!w) return;
      var row = w.querySelector(".container>.w-container>.w-cell"), grid = row && row.querySelector(":scope>.w-grid"); if (!grid) return;
      var its = grid.querySelectorAll(":scope>.grid__item"), cols = [], note = null;
      for (var i = 0; i < its.length; i++){
        var h = its[i].querySelector("h1,h2,h3,h4"), tc = its[i].querySelectorAll(".text-component"), t = tc[tc.length - 1];
        var title = h ? h.textContent.replace(/\u00a0/g, " ").trim() : "";
        if (!title) { if (t) note = t.innerHTML; continue; }
        cols.push({ title: title, el: t });
      }
      if (cols.length < 2) return;
      var sizes = lines(cols[0].el).filter(Boolean);
      var data = cols.slice(1).map(function(c){ return groups(lines(c.el)); });
      var key = JSON.stringify([cols.map(function(c){ return c.title; }), sizes, data, note]);
      var box = row.querySelector(":scope>.mabsz");
      if (box && box.getAttribute("data-k") === key) return;
      var html = "<div class=\"mabsz-box\"><table><thead><tr>" + cols.map(function(c){ return "<th scope=\"col\">" + esc(c.title) + "</th>"; }).join("") + "</tr></thead><tbody>";
      sizes.forEach(function(s, r){
        html += "<tr><th scope=\"row\">" + esc(s) + "</th>";
        data.forEach(function(g){ var c = g[r] || []; html += "<td>" + (c[0] ? "<b>" + esc(c[0]) + "</b>" : "") + (c.slice(1).map(function(x){ return "<span>" + esc(x) + "</span>"; }).join("")) + "</td>"; });
        html += "</tr>";
      });
      html += "</tbody></table></div>" + (note ? "<div class=\"mabsz-note\">" + note + "</div>" : "");
      if (!box) { box = D.createElement("div"); box.className = "mabsz"; row.appendChild(box); }
      box.setAttribute("data-k", key); box.innerHTML = html;
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, build); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (!(x.closest && x.closest(".mabsz"))) { q(); return; } } }).observe(D.body, { childList: true, subtree: true, characterData: true });
    build(); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- Custom Cakes: flavors ---------- */
  M.push(["flav", function(){
    /* ===== EDIT HERE =====
       BLOCK: id of the Square block.  NUM: big step number above the title ("" = none). */
    var BLOCK = "YuMsry";
    var NUM = "02";
    var LIST_COLS = ["frosting"];     /* columns (title starts with) shown as a list instead of pills */
    var PILLS = ["#F9CFD8", "#FFFFFF", "#D5E6C8", "#FFFFFF", "#FFFFFF"];   /* pill colors, used in turn */
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)", TINT = "rgba(155,27,69,.05)";
    /* ===================== */
    var D = document;
    /* In the Square editor the original columns stay visible (under the table) so they can be edited.
       On the live site and in Preview only the table shows. */
    var EDIT = false;
    try { EDIT = window.top !== window && !/preview/i.test(window.top.location.href); } catch (e) { EDIT = window.top !== window; }
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif", BODY = "\"Niramit Regular\",\"Niramit\",sans-serif";
    var B = "#" + BLOCK + " .w-block", ROW = B + " .container>.w-container>.w-cell";
    var S =
      B + " .container{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}" +
      ROW + "{display:grid!important;grid-template-columns:minmax(0,320px) minmax(0,1fr);column-gap:clamp(28px,5vw,72px);align-items:start;max-width:100%!important;flex:1 1 100%!important}" +
      ROW + ">.w-cell{margin:0!important}" +
      (EDIT ? ROW + ">.w-grid{grid-column:1/-1;margin-top:28px!important;padding:16px!important;border:2px dashed " + INK + ";border-radius:12px;position:relative}" +
              ROW + ">.w-grid:before{content:\"EDIT FLAVORS HERE (hidden on the live site)\";position:absolute;top:-11px;left:14px;background:" + INK + ";color:#fff;font:700 11px/1 " + BOLD + ";letter-spacing:.08em;padding:5px 8px;border-radius:5px}"
            : ROW + ">.w-grid{display:none!important}") +
      (NUM ? ROW + ">.w-cell:first-child:before{content:\"" + NUM + "\";display:block;font:800 clamp(4rem,9vw,7.5rem)/.8 " + DISP + ";font-stretch:75%;letter-spacing:-.05em;color:" + INK + ";opacity:.9;margin-bottom:18px}" : "") +
      ".mabfl{min-width:0;color:" + INK + "}" +
      ".mabfl-g+.mabfl-g{margin-top:34px}" +
      ".mabfl-l{display:block;font:700 .74rem/1.2 " + BOLD + ";letter-spacing:.16em;text-transform:uppercase;margin:0 0 14px}" +
      ".mabfl-c{display:flex;flex-wrap:wrap;gap:8px}" +
      ".mabfl-c span{border:1px solid " + LINE + ";border-radius:999px;padding:8px 16px;font:400 .98rem/1.3 " + BODY + ";background:#fff}" +
      ".mabfl-c span.f{border-color:transparent}" +
      ".mabfl-li{list-style:none;margin:0;padding:0;border-top:1px solid " + LINE + "}" +
      ".mabfl-li li{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid " + LINE + ";font:400 1.02rem/1.35 " + BODY + "}" +
      ".mabfl-li li small{font-size:.88rem;opacity:.75;text-align:right}" +
      "@media(max-width:767px){" +
        B + " .container{width:calc(100% - 32px)!important}" +
        ROW + "{grid-template-columns:minmax(0,1fr);row-gap:22px}" +
        ".mabfl-c span{font-size:.88rem;padding:7px 13px}" +
      "}";
    function lines(p){
      /* text split by line breaks, keeping empty lines as group separators */
      var out = [], cur = "";
      (function walk(n){
        for (var c = n.firstChild; c; c = c.nextSibling){
          if (c.nodeName === "BR") { out.push(cur); cur = ""; }
          else if (c.nodeName === "P" || c.nodeName === "DIV") { if (cur) { out.push(cur); cur = ""; } walk(c); if (cur) { out.push(cur); cur = ""; } }
          else if (c.nodeType === 3) cur += c.nodeValue;
          else walk(c);
        }
      })(p);
      if (cur) out.push(cur);
      return out.map(function(s){ return s.replace(/\u00a0/g, " ").trim(); });
    }
    function groups(ls){
      var g = [], cur = [];
      ls.forEach(function(l){ if (!l) { if (cur.length) { g.push(cur); cur = []; } } else cur.push(l); });
      if (cur.length) g.push(cur);
      return g;
    }
    function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function build(){
      var w = D.getElementById(BLOCK); if (!w) return;
      var row = w.querySelector(".container>.w-container>.w-cell"), grid = row && row.querySelector(":scope>.w-grid"); if (!grid) return;
      var its = grid.querySelectorAll(":scope>.grid__item"), cols = [];
      for (var i = 0; i < its.length; i++){
        var h = its[i].querySelector("h1,h2,h3,h4"), tc = its[i].querySelectorAll(".text-component"), t = tc[tc.length - 1];
        var title = h ? h.textContent.replace(/\u00a0/g, " ").trim() : "";
        if (!title || !t || t === (h && h.closest(".text-component"))) continue;
        cols.push({ title: title, items: lines(t).filter(Boolean) });
      }
      if (!cols.length) return;
      var key = JSON.stringify(cols), box = row.querySelector(":scope>.mabfl");
      if (box && box.getAttribute("data-k") === key) return;
      var html = "";
      cols.forEach(function(c){
        var asList = LIST_COLS.some(function(x){ return c.title.toLowerCase().indexOf(x.toLowerCase()) === 0; });
        html += "<div class=\"mabfl-g\"><span class=\"mabfl-l\">" + esc(c.title) + "</span>";
        if (asList) {
          html += "<ul class=\"mabfl-li\">" + c.items.map(function(x){ var m = x.match(/^(.*?)\s*\(([^)]*)\)\s*$/); return "<li>" + (m ? esc(m[1]) + "<small>" + esc(m[2]) + "</small>" : esc(x)) + "</li>"; }).join("") + "</ul>";
        } else {
          html += "<div class=\"mabfl-c\">" + c.items.map(function(x, k){ var bg = PILLS[k % PILLS.length], f = bg.toUpperCase() !== "#FFFFFF"; return "<span" + (f ? " class=\"f\" style=\"background:" + bg + "\"" : "") + ">" + esc(x) + "</span>"; }).join("") + "</div>";
        }
        html += "</div>";
      });
      if (!box) { box = D.createElement("div"); box.className = "mabfl"; row.appendChild(box); }
      box.setAttribute("data-k", key); box.innerHTML = html;
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, build); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (!(x.closest && x.closest(".mabfl"))) { q(); return; } } }).observe(D.body, { childList: true, subtree: true, characterData: true });
    build(); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- Custom Cakes: pick your design ---------- */
  M.push(["dsg", function(){
    /* ===== EDIT HERE ===== */
    var BLOCK = "YhPLiq";
    var NUM = "03";                    /* big step number above the title ("" = none) */
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)";
    /* ===================== */
    var D = document, B = "#" + BLOCK + " .w-block", G = B + " .w-grid";
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var S =
      B + " .container{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}" +
      G + "{display:grid!important;grid-template-columns:minmax(0,1.15fr) repeat(3,minmax(0,1fr))!important;gap:clamp(16px,2.4vw,32px)!important;align-items:start!important}" +
      G + ">.grid__item{margin:0!important;min-width:0}" +
      G + ">.grid__item:first-child{align-self:center;padding-right:clamp(0px,2vw,24px)}" +
      (NUM ? G + ">.grid__item:first-child .text-col>.w-container:before{content:\"" + NUM + "\";display:block;font:800 clamp(4rem,8vw,7rem)/.8 " + DISP + ";font-stretch:75%;letter-spacing:-.05em;color:" + INK + ";opacity:.9;margin-bottom:18px}" : "") +
      G + ">.grid__item:first-child .w-cell{margin:0!important;padding:0!important}" +
      G + ">.grid__item:first-child h1," + G + ">.grid__item:first-child h2{margin:0 0 16px!important}" +
      G + ">.grid__item:first-child .button-wrapper{margin-top:22px}" +
      /* photos in white tilted frames */
      G + ">.grid__item:not(:first-child) .image-col{margin:0!important;padding:0!important}" +
      G + ">.grid__item:not(:first-child) .text-col{display:none!important}" +
      G + ">.grid__item:not(:first-child) figure{margin:0!important;background:#fff;padding:9px;border:1px solid " + LINE + ";border-radius:12px;box-sizing:border-box;transform:rotate(-2deg);transition:transform .35s ease}" +
      G + ">.grid__item:nth-child(odd):not(:first-child) figure{transform:rotate(2deg)}" +
      G + ">.grid__item:nth-child(3){margin-top:28px!important}" +
      G + ">.grid__item:not(:first-child) figure:hover{transform:rotate(0) translateY(-4px)}" +
      G + ">.grid__item:not(:first-child) .figure__aspect-ratio{display:block!important;position:relative!important;aspect-ratio:4/5!important;height:auto!important;padding:0!important;border-radius:7px!important;overflow:hidden!important}" +
      G + ">.grid__item:not(:first-child) .figure__aspect-ratio .image," + G + ">.grid__item:not(:first-child) img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important}" +
      "@media(max-width:900px){" +
        G + "{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}" +
        G + ">.grid__item:first-child{grid-column:1/-1;padding:0;margin-bottom:10px!important}" +
        G + ">.grid__item:nth-child(3){margin-top:16px!important}" +
        G + ">.grid__item:not(:first-child) figure{padding:5px;border-radius:9px}" +
      "}" +
      "@media(max-width:767px){" + B + " .container{width:calc(100% - 32px)!important}}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
  }]);

  /* ---------- Custom Cakes: Prefer to talk ---------- */
  M.push(["talk", function(){
    /* ===== EDIT HERE =====
       PANEL COLOR: Amy picks it herself in Square = the background color of the block.
                    If the block is cream (or no color), DEFAULT is used. PANEL = force one color and ignore Square.
       In the Square editor: a preview of the panel on top, the normal Square fields to edit below (dashed box). */
    var BLOCK = "vNsioa";
    var PANEL = "", DEFAULT = "#D5E6C8", PAGE = "#F7EFE6";
    /* ===================== */
    var D = document, B = "#" + BLOCK + " .w-block", G = B + (MAB_ED ? " .w-grid.mabprev" : " .w-grid");
    var S =
      B + "{background:" + PAGE + "!important;padding-top:clamp(12px,2vw,24px)!important;padding-bottom:clamp(24px,4vw,48px)!important}" +
      B + " .container{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding:clamp(24px,3.5vw,48px) clamp(22px,3.5vw,52px)!important;background:var(--mabtk," + DEFAULT + ")!important;border-radius:18px!important}" +
      G + "{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;column-gap:clamp(24px,4vw,56px)!important;row-gap:16px!important;align-items:start!important}" +
      G + ">.grid__item{margin:0!important;min-width:0;grid-column:2}" +
      G + ">.grid__item:first-child{grid-column:1;grid-row:1/span 3}" +
      G + " .w-cell{margin:0!important;padding:0!important;text-align:left!important}" +
      G + " h1," + G + " h2," + G + " h3{margin:0!important;white-space:nowrap}" +
      G + " p{margin:0!important;text-align:left!important;max-width:62ch}" +
      G + " .button-wrapper{display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:flex-start!important;gap:14px 24px!important}" +
      G + " .button-wrapper>.w-wrapper{width:auto!important;margin:0!important}" +
      G + " .button-wrapper .w-button:not(.mf){width:auto!important}" +
      (MAB_ED ? B + " .w-grid:not(.mabprev){background:rgba(255,255,255,.55);border-radius:12px;padding:44px 14px 14px!important}" : "") +
      "@media(max-width:767px){" +
        B + " .container{width:calc(100% - 32px)!important;padding:22px 20px!important}" +
        G + "{grid-template-columns:minmax(0,1fr)!important}" +
        G + ">.grid__item," + G + ">.grid__item:first-child{grid-column:1;grid-row:auto}" +
        G + " h1," + G + " h2," + G + " h3{white-space:normal}" +
      "}";
    function run(){
      var w = D.getElementById(BLOCK); if (!w) return;
      var bl = w.querySelector(".w-block"); if (!bl) return;
      var c = PANEL || mabBg(bl, DEFAULT, PAGE);
      if (bl.style.getPropertyValue("--mabtk") !== c) bl.style.setProperty("--mabtk", c);
      if (MAB_ED) {
        mabEd(w, "Panel color = this block background color in Square (cream = default pistachio)");
        var src = bl.querySelector(".w-grid:not(.mabprev)");
        mabPrev(src, "Edit text, buttons and hours here. On the live site it looks like the preview above");
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (x.closest && x.closest(".mabprev")) continue; if (ms[i].type === "childList" || ms[i].type === "characterData" || (ms[i].attributeName === "style" && x.id && x.closest("#" + BLOCK) && x.style.getPropertyValue("background-color") !== x.mabBgV && ((x.mabBgV = x.style.getPropertyValue("background-color")), true))) { q(); return; } } }).observe(D.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["style"] });
    q(); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- Form: Weddings ---------- */
  M.push(["iform", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square form block(s) (element with class w-block-wrapper).
       LEAD: small text under the title ("" = none). Use \u2019 for an apostrophe.
       PAGE: color around the panel ("" = keep the block color from Square). */
    var BLOCKS = ["EKOsMC"];
    var LEAD = "Dates fill up quickly, so reach out early. We\u2019ll call you to confirm.";
    var PANEL = "#F9CFD8", PAGE = "#F7EFE6", INK = "#9B1B45";
    /* ===================== */
    var D = document;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var BODY = "\"Niramit Regular\",\"Niramit\",sans-serif", BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    function each(rule){ return BLOCKS.map(function(id){ return "#" + id + " .w-block" + rule; }).join(","); }
    var C = " .container>.w-container>.w-cell>.w-container>.w-cell";          /* the column with title + form */
    var G = C + ">.w-container";                                              /* its inner stack */
    var S =
      (PAGE ? each("") + "{background:" + PAGE + "!important}" : "") +
      each(" .container") + "{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin:clamp(30px,5vw,70px) auto!important;padding:clamp(28px,4vw,60px)!important;background:" + PANEL + ";border-radius:22px;text-align:left!important}" +
      each(" .container>.w-container>.w-cell") + "{margin:0!important}" +
      each(C) + "{flex:0 0 100%!important;max-width:100%!important;margin-left:0!important;padding:0!important}" +
      each(G) + "{display:grid!important;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);grid-template-rows:auto auto 1fr;column-gap:clamp(28px,5vw,72px);align-items:start}" +
      each(G + ">.w-cell") + "{margin:0!important;padding:0!important;max-width:100%!important;text-align:left!important;min-width:0}" +
      each(G + ">.w-cell:nth-child(1)") + "{grid-column:1;grid-row:1}" +
      each(G + ">.w-cell:nth-child(2)") + "{grid-column:1;grid-row:2}" +
      each(G + ">.w-cell:nth-child(3)") + "{grid-column:2;grid-row:1/span 3}" +
      /* label + title + lead */
      each(G + ">.w-cell:nth-child(1) h3") + "," + each(G + ">.w-cell:nth-child(1) h3 *") + "{font:700 .74rem/1.2 " + BOLD + "!important;letter-spacing:.18em!important;text-transform:uppercase!important;color:" + INK + "!important;margin:0 0 16px!important;text-align:left!important}" +
      each(G + ">.w-cell:nth-child(2) p") + "," + each(G + ">.w-cell:nth-child(2) p *") + "{font-family:" + DISP + "!important;font-weight:800!important;font-size:clamp(2.1rem,4.4vw,3.7rem)!important;line-height:.98!important;letter-spacing:-.03em!important;color:" + INK + "!important;text-align:left!important;margin:0!important}" +
      (LEAD ? each(G + ">.w-cell:nth-child(2)>.w-wrapper:after") + "{content:\"" + LEAD + "\";display:block;margin-top:18px;max-width:40ch;font:400 1.08rem/1.55 " + BODY + ";color:" + INK + "}" : "") +
      /* fields */
      each(" form .w-cell") + "{padding-left:0!important;padding-right:0!important}" +
      each(" form div:has(>input:not([type=checkbox]))") + "{border:1px solid " + INK + "!important;border-radius:999px!important;background:#fff!important;box-shadow:none!important;outline:0!important}" +
      each(" form div:has(>input:not([type=checkbox])):before") + "," + each(" form div:has(>input:not([type=checkbox])):after") + "{display:none!important}" +
      each(" form input:not([type=checkbox])") + "{border:0!important;box-shadow:none!important;background:transparent!important;color:" + INK + "!important;font-family:" + BODY + "!important;padding-left:20px!important;padding-right:20px!important}" +
      each(" form input::placeholder") + "{color:" + INK + "!important;opacity:.7}" +
      each(" form textarea") + "{border:1px solid " + INK + "!important;border-radius:18px!important;background:#fff!important;color:" + INK + "!important}" +
      /* checkboxes as pills */
      each(" fieldset.multiple") + "{display:flex!important;flex-wrap:wrap;gap:10px;border:0!important;padding:0!important;margin:6px 0 0!important}" +
      each(" .multiple-group__legend") + "{width:100%;padding:0!important;margin:0 0 4px!important;font:700 .72rem/1.2 " + BOLD + "!important;letter-spacing:.14em;text-transform:uppercase;color:" + INK + "!important;text-align:left}" +
      each(" .multiple-group__option") + "{margin:0!important}" +
      each(" .multiple-group__option>label") + "{display:inline-flex!important;align-items:center;gap:8px;border:1px solid rgba(155,27,69,.35);background:#fff;border-radius:999px;padding:9px 16px!important;cursor:pointer;color:" + INK + "!important}" +
      each(" .multiple-group__option>label:has(input:checked)") + "{border-color:" + INK + ";background:#fff}" +
      each(" .form__row--us-disclaimer") + "," + each(" .recaptcha-terms") + "{display:block;font-size:.72rem!important;line-height:1.5;color:" + INK + "!important;opacity:.75;text-align:left!important}" +
      each(" .recaptcha-terms a") + "{color:inherit!important}" +
      /* submit: raspberry, keeps the Square button + bubble effect */
      each(" form .w-button") + "{--color-main:" + INK + "!important;--color-hover:#be2154!important;--color-active:#da2d66!important;--color-focus:rgba(155,27,69,.3)!important}" +
      each(" form .row:last-child") + "{justify-content:flex-start!important;margin-top:10px}" +
      "@media(max-width:767px){" +
        each(" .container") + "{width:calc(100% - 32px)!important;padding:24px 18px!important}" +
        each(G) + "{grid-template-columns:minmax(0,1fr);grid-template-rows:none}" +
        each(G + ">.w-cell:nth-child(3)") + "{grid-column:1;grid-row:auto;margin-top:22px!important}" +
      "}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
  }]);

  /* ---------- Form: Custom Cakes ---------- */
  M.push(["cform", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square form block(s) (element with class w-block-wrapper).
       LEAD: small text under the title ("" = none). Use \u2019 for an apostrophe.
       PAGE: color around the panel ("" = keep the block color from Square). */
    var BLOCKS = ["AdjSkc"];
    var LEAD = "";
    var NUM = "04";                    /* big step number above the title ("" = none) */
    var PANEL = "#F9CFD8", PAGE = "#F7EFE6", INK = "#9B1B45";
    /* ===================== */
    var D = document;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var BODY = "\"Niramit Regular\",\"Niramit\",sans-serif", BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    function each(rule){ return BLOCKS.map(function(id){ return "#" + id + " .w-block" + rule; }).join(","); }
    var C = " .container>.w-container>.w-cell>.w-container>.w-cell";          /* the column with title + form */
    var G = C + ">.w-container";                                              /* its inner stack */
    var S =
      (PAGE ? each("") + "{background:" + PAGE + "!important}" : "") +
      each(" .container") + "{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin:clamp(30px,5vw,70px) auto!important;padding:0!important;text-align:left!important}" +
      each(" .container>.w-container>.w-cell") + "{margin:0!important}" +
      each(C) + "{flex:0 0 100%!important;max-width:100%!important;margin-left:0!important;padding:0!important}" +
      each(G) + "{display:grid!important;grid-template-columns:minmax(0,320px) minmax(0,1fr);grid-template-rows:auto auto 1fr;column-gap:clamp(28px,5vw,72px);align-items:start}" +
      each(G + ">.w-cell") + "{margin:0!important;padding:0!important;max-width:100%!important;text-align:left!important;min-width:0}" +
      each(G + ">.w-cell:nth-child(1)") + "{grid-column:1;grid-row:1}" +
      each(G + ">.w-cell:nth-child(2)") + "{grid-column:1;grid-row:2}" +
      each(G + ">.w-cell:nth-child(3)") + "{grid-column:2;grid-row:1/span 3;background:" + PANEL + "!important;border-radius:22px;padding:clamp(24px,3.5vw,48px)!important;box-sizing:border-box}" +
      /* step number + title + lead */
      (NUM ? each(G + ">.w-cell:nth-child(1)>.w-wrapper:before") + "{content:\"" + NUM + "\";display:block;font:800 clamp(4rem,8vw,7rem)/.8 " + DISP + ";font-stretch:75%;letter-spacing:-.05em;color:" + INK + ";opacity:.9;margin-bottom:18px}" : "") +
      each(G + ">.w-cell:nth-child(1) h3") + "{margin:0 0 16px!important;text-align:left!important}" +
      each(G + ">.w-cell:nth-child(2) p") + "{margin:0!important;text-align:left!important;max-width:40ch}" +
      /* fields in two columns, big text field full width */
      each(" form>.w-container") + "{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:14px;row-gap:4px}" +
      each(" form>.w-container>.w-cell") + "{max-width:100%!important;min-width:0}" +
      each(" form>.w-container>.w-cell:has(textarea)") + "," + each(" form>.w-container>.w-cell:last-child") + "{grid-column:1/-1}" +
      each(" form select") + "{border:1px solid " + INK + "!important;border-radius:999px!important;background:#fff!important;color:" + INK + "!important;font-family:" + BODY + "!important;padding-left:20px!important;box-shadow:none!important}" +
      each(" form div:has(>select)") + "{border:0!important;box-shadow:none!important;background:none!important}" +
      each(" form div:has(>select):before") + "," + each(" form div:has(>select):after") + "{display:none!important}" +
      /* fields */
      each(" form .w-cell") + "{padding-left:0!important;padding-right:0!important}" +
      each(" form div:has(>input:not([type=checkbox]))") + "{border:1px solid " + INK + "!important;border-radius:999px!important;background:#fff!important;box-shadow:none!important;outline:0!important}" +
      each(" form div:has(>input:not([type=checkbox])):before") + "," + each(" form div:has(>input:not([type=checkbox])):after") + "{display:none!important}" +
      each(" form input:not([type=checkbox])") + "{border:0!important;box-shadow:none!important;background:transparent!important;color:" + INK + "!important;font-family:" + BODY + "!important;padding-left:20px!important;padding-right:20px!important}" +
      each(" form input::placeholder") + "{color:" + INK + "!important;opacity:.7}" +
      each(" form textarea") + "{border:1px solid " + INK + "!important;border-radius:18px!important;background:#fff!important;color:" + INK + "!important;padding:14px 20px!important;font-family:" + BODY + "!important;min-height:120px}" +
      each(" form textarea::placeholder") + "{color:" + INK + "!important;opacity:.7}" +
      /* checkboxes as pills */
      each(" fieldset.multiple") + "{display:flex!important;flex-wrap:wrap;gap:10px;border:0!important;padding:0!important;margin:6px 0 0!important}" +
      each(" .multiple-group__legend") + "{width:100%;padding:0!important;margin:0 0 4px!important;font:700 .72rem/1.2 " + BOLD + "!important;letter-spacing:.14em;text-transform:uppercase;color:" + INK + "!important;text-align:left}" +
      each(" .multiple-group__option") + "{margin:0!important}" +
      each(" .multiple-group__option>label") + "{display:inline-flex!important;align-items:center;gap:8px;border:1px solid rgba(155,27,69,.35);background:#fff;border-radius:999px;padding:9px 16px!important;cursor:pointer;color:" + INK + "!important}" +
      each(" .multiple-group__option>label:has(input:checked)") + "{border-color:" + INK + ";background:#fff}" +
      each(" .form__row--us-disclaimer") + "," + each(" .recaptcha-terms") + "{display:block;font-size:.72rem!important;line-height:1.5;color:" + INK + "!important;opacity:.75;text-align:left!important}" +
      each(" .recaptcha-terms a") + "{color:inherit!important}" +
      /* submit: raspberry, keeps the Square button + bubble effect */
      each(" form .w-button") + "{--color-main:" + INK + "!important;--color-hover:#be2154!important;--color-active:#da2d66!important;--color-focus:rgba(155,27,69,.3)!important}" +
      each(" form .row:last-child") + "{justify-content:flex-start!important;margin-top:10px}" +
      "@media(max-width:767px){" +
        each(" .container") + "{width:calc(100% - 32px)!important;padding:0!important}" +
        each(" form>.w-container") + "{grid-template-columns:minmax(0,1fr)}" +
        each(G + ">.w-cell:nth-child(3)") + "{padding:22px 16px!important}" +
        each(G) + "{grid-template-columns:minmax(0,1fr);grid-template-rows:none}" +
        each(G + ">.w-cell:nth-child(3)") + "{grid-column:1;grid-row:auto;margin-top:22px!important}" +
      "}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
  }]);

  /* ---------- Form: Catering ---------- */
  M.push(["catform", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square form block(s) (element with class w-block-wrapper).
       LEAD: small text under the title ("" = none). Use \u2019 for an apostrophe.
       PAGE: color around the panel ("" = keep the block color from Square). */
    var BLOCKS = ["UlzOvk"];
    var LEAD = "";
    var LABEL = "Catering inquiry";    /* small label above the title ("" = none) */
    var PANEL = "#F9CFD8", PAGE = "#F7EFE6", INK = "#9B1B45";
    /* ===================== */
    var D = document;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var BODY = "\"Niramit Regular\",\"Niramit\",sans-serif", BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    function each(rule){ return BLOCKS.map(function(id){ return "#" + id + " .w-block" + rule; }).join(","); }
    var C = " .container>.w-container>.w-cell>.w-container>.w-cell";          /* the column with title + form */
    var G = C + ">.w-container";                                              /* its inner stack */
    var S =
      (PAGE ? each("") + "{background:" + PAGE + "!important}" : "") +
      each(" .container") + "{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin:clamp(30px,5vw,70px) auto!important;padding:clamp(28px,4vw,60px)!important;background:" + PANEL + "!important;border-radius:22px!important;text-align:left!important}" +
      each(" .container>.w-container>.w-cell") + "{margin:0!important}" +
      each(C) + "{flex:0 0 100%!important;max-width:100%!important;margin-left:0!important;padding:0!important}" +
      each(G) + "{display:grid!important;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);grid-template-rows:auto auto 1fr;column-gap:clamp(28px,5vw,72px);align-items:start}" +
      each(G + ">.w-cell") + "{margin:0!important;padding:0!important;max-width:100%!important;text-align:left!important;min-width:0}" +
      each(G + ">.w-cell:nth-child(1)") + "{grid-column:1;grid-row:1}" +
      each(G + ">.w-cell:nth-child(2)") + "{grid-column:1;grid-row:2}" +
      each(G + ">.w-cell:nth-child(3)") + "{grid-column:2;grid-row:1/span 3}" +
      /* label + title + lead */
      (LABEL ? each(G + ">.w-cell:nth-child(1)>.w-wrapper:before") + "{content:\"" + LABEL + "\";display:block;font:700 .74rem/1.2 " + BOLD + ";letter-spacing:.18em;text-transform:uppercase;color:" + INK + ";margin-bottom:16px}" : "") +
      each(G + ">.w-cell:nth-child(1) h3") + "{margin:0 0 16px!important;text-align:left!important}" +
      each(G + ">.w-cell:nth-child(2) p") + "{margin:0!important;text-align:left!important;max-width:40ch}" +
      /* fields in two columns, big text field full width */
      each(" form>.w-container") + "{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:14px;row-gap:4px}" +
      each(" form>.w-container>.w-cell") + "{max-width:100%!important;min-width:0}" +
      each(" form>.w-container>.w-cell:first-child") + "," + each(" form>.w-container>.w-cell:has(fieldset)") + "," + each(" form>.w-container>.w-cell:has(textarea)") + "," + each(" form>.w-container>.w-cell:last-child") + "{grid-column:1/-1}" +
      each(" form select") + "{border:1px solid " + INK + "!important;border-radius:999px!important;background:#fff!important;color:" + INK + "!important;font-family:" + BODY + "!important;padding-left:20px!important;box-shadow:none!important}" +
      each(" form div:has(>select)") + "{border:0!important;box-shadow:none!important;background:none!important}" +
      each(" form div:has(>select):before") + "," + each(" form div:has(>select):after") + "{display:none!important}" +
      /* fields */
      each(" form .w-cell") + "{padding-left:0!important;padding-right:0!important}" +
      each(" form div:has(>input:not([type=checkbox]))") + "{border:1px solid " + INK + "!important;border-radius:999px!important;background:#fff!important;box-shadow:none!important;outline:0!important}" +
      each(" form div:has(>input:not([type=checkbox])):before") + "," + each(" form div:has(>input:not([type=checkbox])):after") + "{display:none!important}" +
      each(" form input:not([type=checkbox])") + "{border:0!important;box-shadow:none!important;background:transparent!important;color:" + INK + "!important;font-family:" + BODY + "!important;padding-left:20px!important;padding-right:20px!important}" +
      each(" form input::placeholder") + "{color:" + INK + "!important;opacity:.7}" +
      each(" form textarea") + "{border:1px solid " + INK + "!important;border-radius:18px!important;background:#fff!important;color:" + INK + "!important;padding:14px 20px!important;font-family:" + BODY + "!important;min-height:120px}" +
      each(" form textarea::placeholder") + "{color:" + INK + "!important;opacity:.7}" +
      /* checkboxes as pills */
      each(" fieldset.multiple") + "{display:flex!important;flex-wrap:wrap;gap:10px;border:0!important;padding:0!important;margin:6px 0 0!important}" +
      each(" .multiple-group__legend") + "{width:100%;padding:0!important;margin:0 0 4px!important;font:700 .72rem/1.2 " + BOLD + "!important;letter-spacing:.14em;text-transform:uppercase;color:" + INK + "!important;text-align:left}" +
      each(" .multiple-group__option") + "{margin:0!important}" +
      each(" .multiple-group__option>label") + "{display:inline-flex!important;align-items:center;gap:8px;border:1px solid rgba(155,27,69,.35);background:#fff;border-radius:999px;padding:9px 16px!important;cursor:pointer;color:" + INK + "!important}" +
      each(" .multiple-group__option>label:has(input:checked)") + "{border-color:" + INK + ";background:#fff}" +
      each(" .form__row--us-disclaimer") + "," + each(" .recaptcha-terms") + "{display:block;font-size:.72rem!important;line-height:1.5;color:" + INK + "!important;opacity:.75;text-align:left!important}" +
      each(" .recaptcha-terms a") + "{color:inherit!important}" +
      /* submit: raspberry, keeps the Square button + bubble effect */
      each(" form .w-button") + "{--color-main:" + INK + "!important;--color-hover:#be2154!important;--color-active:#da2d66!important;--color-focus:rgba(155,27,69,.3)!important}" +
      each(" form .row:last-child") + "{justify-content:flex-start!important;margin-top:10px}" +
      "@media(max-width:767px){" +
        each(" .container") + "{width:calc(100% - 32px)!important;padding:26px 18px!important}" +
        each(" form>.w-container") + "{grid-template-columns:minmax(0,1fr)}" +
                each(G) + "{grid-template-columns:minmax(0,1fr);grid-template-rows:none}" +
        each(G + ">.w-cell:nth-child(3)") + "{grid-column:1;grid-row:auto;margin-top:22px!important}" +
      "}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
  }]);

  /* ---------- About: big list ---------- */
  M.push(["biglist", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square block(s) (element with class w-block-wrapper).
       Rows: add, remove or reorder them in the Square block itself, any number. New rows get the same look.
       In the Square editor: a preview of the list on top, the normal Square rows to edit below (dashed box). */
    var BLOCKS = ["BywFzU"];
    var LINE = "rgba(155,27,69,.35)";
    var HOVER = ["#F9CFD8", "#D5E6C8"];       /* row colors on hover, used in turn */
    var NOTES_ON_PHONE = false;                /* true = keep the small note on phones too */
    /* ===================== */
    var D = document;
    var GR = MAB_ED ? " .w-grid.mabprev" : " .w-grid";    /* in the editor only the preview gets the list design */
    function each(rule){ return BLOCKS.map(function(id){ return "#" + id + " .w-block" + rule; }).join(","); }
    var IT = GR + ">.grid__item", ROW = ">.w-wrapper>.w-cell";
    var S =
      /* use the full content width instead of the narrow middle column */
      each(" .container .w-cell.col-md-8") + "{flex:0 0 100%!important;max-width:100%!important;margin-left:0!important}" +
      each(" .container") + "{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}" +
      /* list */
      each(GR) + "{display:block!important;border-top:1px solid " + LINE + ";margin-top:6px}" +
      each(IT) + "{margin:0!important;padding:0!important;border-bottom:1px solid " + LINE + ";transition:background-color .3s ease!important}" +
      each(IT + ROW) + "{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;justify-content:space-between!important;gap:16px;padding:16px 0!important;margin:0!important;transition:padding .3s ease,background .3s ease}" +
      each(IT + ROW + ">.w-cell") + "{margin:0!important;padding:0!important;width:auto!important;max-width:none!important;flex:0 1 auto!important;min-width:0}" +
      each(IT + ROW + ">.w-cell:first-child") + "{flex:1 1 auto!important}" +
      each(IT + ":nth-child(odd):hover") + "{background-color:" + HOVER[0] + "!important}" +
      each(IT + ":nth-child(even):hover") + "{background-color:" + HOVER[1] + "!important}" +
      each(IT + ":hover" + ROW) + "{padding-left:16px!important;padding-right:12px!important}" +
      /* big word */
      each(IT + " h1") + "," + each(IT + " h2") + "," + each(IT + " h3") + "," + each(IT + " h4") + "{font-size:clamp(1.7rem,4.6vw,3.8rem)!important;line-height:1!important;letter-spacing:-.035em!important;margin:0!important;text-align:left!important}" +
      /* small note on the right */
      each(IT + ROW + ">.w-cell:last-child p") + "{font-size:.74rem!important;line-height:1.2!important;letter-spacing:.14em!important;text-align:right!important;white-space:nowrap;margin:0!important}" +
      "@media(max-width:767px){" +
        each(" .container") + "{width:calc(100% - 32px)!important}" +
        each(IT + ROW) + "{padding:12px 0!important}" +
        each(IT + ":hover" + ROW) + "{padding-left:0!important;padding-right:0!important}" +
        each(IT + ":hover") + "{background-color:transparent!important}" +
        (NOTES_ON_PHONE ? each(IT + ROW + ">.w-cell:last-child p") + "{font-size:.62rem!important;white-space:normal}" : each(IT + ROW + ">.w-cell:last-child") + "{display:none!important}") +
      "}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    if (!MAB_ED) return;
    function run(){
      for (var b = 0; b < BLOCKS.length; b++){
        var w = D.getElementById(BLOCKS[b]); if (!w) continue;
        mabPrev(w.querySelector(".w-block .w-grid:not(.mabprev)"), "Edit the rows here. Add or remove rows in the block settings, new rows get the same look. Notes on the right are hidden on phones");
      }
    }
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (!(x.closest && x.closest(".mabprev"))) { q(); return; } } }).observe(D.body, { childList: true, subtree: true, characterData: true });
    q(); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- About: visit card + map ---------- */
  M.push(["visit", function(){
    /* ===== EDIT HERE =====
       BLOCKS: id of the Square block(s) (element with class w-block-wrapper).
       LABEL: small line above the title ("" = none).  PAGE: color around the card ("" = keep the Square block color). */
    var BLOCKS = ["TJLqNg"];
    var LABEL = "Come say hi";
    var PAGE = "#F7EFE6", CARD = "#FFFFFF", INK = "#9B1B45", LINE = "rgba(155,27,69,.35)";
    /* ===================== */
    var D = document;
    var BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    function each(rule){ return BLOCKS.map(function(id){ return "#" + id + " .w-block" + rule; }).join(","); }
    var CARDC = " .container>.w-container>.w-cell>.w-container";        /* row with map + info */
    var MAP = CARDC + ">.w-cell:first-child", INFO = CARDC + ">.w-cell:last-child", IN = INFO + ">.w-container";
    var S =
      (PAGE ? each("") + "{background:" + PAGE + "!important}" : "") +
      each(" .container") + "{box-sizing:border-box!important;width:min(1240px,calc(100% - 2*clamp(16px,6vw,110px)))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}" +
      each(" .container>.w-container") + "," + each(" .container>.w-container>.w-cell") + "{margin:0!important;padding:0!important;max-width:100%!important;flex:1 1 100%!important}" +
      each(CARDC) + "{display:flex!important;flex-wrap:nowrap!important;align-items:stretch!important;margin:0!important;background:" + CARD + ";border:1px solid " + LINE + ";border-radius:22px;overflow:hidden}" +
      /* map on the right, full height */
      each(MAP) + "{order:2;flex:1 1 50%!important;max-width:50%!important;margin:0!important;padding:0!important;min-height:320px;display:flex!important}" +
      each(MAP) + "{position:relative!important;align-self:stretch!important;height:auto!important}" +
      each(MAP + ">.w-wrapper") + "{position:absolute!important;inset:0!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important}" +
      each(MAP + " iframe") + "{position:absolute!important;inset:0!important;height:100%!important;width:100%!important;min-height:0!important;max-height:none!important;display:block!important;border:0!important}" +
      /* info on the left */
      each(INFO) + "{order:1;flex:1 1 50%!important;max-width:50%!important;margin:0!important;padding:clamp(24px,4vw,48px)!important;min-width:0}" +
      each(IN) + "{display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;margin:0!important}" +
      each(IN + ">.w-cell") + "{flex:none!important;max-width:100%!important;width:100%!important;margin:0!important;padding:0!important}" +
      each(IN + ">.w-cell:nth-child(2)") + "{display:contents!important}" +                 /* address cell: let address and button be ordered separately */
      each(IN + ">.w-cell:nth-child(1)") + "{order:1;margin-bottom:22px!important}" +
      each(IN + " .location-details") + "{order:2;margin-bottom:18px}" +
      each(IN + ">.w-cell:nth-child(3)") + "{order:3}" +
      each(IN + ">.w-cell:nth-child(2)>.w-wrapper:not(.location-details)") + "{order:4;margin-top:26px}" +
      (LABEL ? each(IN + ">.w-cell:nth-child(1) .w-wrapper:before") + "{content:\"" + LABEL + "\";display:block;font:700 .78rem/1.2 " + BOLD + ";letter-spacing:.16em;text-transform:uppercase;color:" + INK + ";margin:0 0 14px}" : "") +
      /* hours as a tidy two column list: DAY  time */
      each(" .hours-grid") + "{display:grid!important;grid-template-columns:auto 1fr;gap:8px 24px;align-items:baseline}" +
      each(" .hours-grid>.text-component") + "{font-family:" + BOLD + "!important;font-size:.78rem!important;letter-spacing:.14em!important;text-transform:uppercase!important;margin:0!important}" +
      each(" .hours-grid .hour-row") + "," + each(" .hours-grid .hour-row>div") + "{display:flex!important;align-items:baseline;gap:6px;margin:0!important}" +
      each(" .hours-grid .text-component") + "{font-variant-numeric:tabular-nums}" +
      "@media(max-width:767px){" +
        each(" .container") + "{width:calc(100% - 32px)!important}" +
        each(CARDC) + "{flex-direction:column!important}" +
        each(MAP) + "," + each(INFO) + "{max-width:100%!important;flex:none!important;width:100%!important}" +
        each(MAP) + "{min-height:260px}" +
        each(MAP) + "{display:block!important}" +
        each(MAP + ">.w-wrapper") + "{position:static!important;display:block!important;width:100%!important}" +
        each(MAP + " iframe") + "{position:static!important;height:260px!important;width:100%!important}" +
        each(INFO) + "{padding:24px 20px!important}" +
      "}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    /* The Square map draws itself at a fixed height inside its frame (height=350px in the map link),
       so stretching the frame alone leaves white space. Tell the map the real height (desktop only, a few times max). */
    var sets = 0;
    function fitMap(){
      if (W.innerWidth < 768 || sets > 4) return;
      for (var b = 0; b < BLOCKS.length; b++){
        var wrap = D.getElementById(BLOCKS[b]); if (!wrap) continue;
        var f = wrap.querySelector("iframe"); if (!f) continue;
        var cell = f.closest(".w-cell"), h = cell ? Math.round(cell.getBoundingClientRect().height) : 0;
        var src = f.getAttribute("src") || "", m = src.match(/height=(\d+)px/);
        if (!h || !m || Math.abs(+m[1] - h) < 30) continue;
        sets++; f.setAttribute("src", src.replace(/height=\d+px/, "height=" + h + "px"));
      }
    }
    var W = window, tm; function q(){ clearTimeout(tm); tm = setTimeout(fitMap, 400); }
    addEventListener("load", q); addEventListener("resize", q); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- FAQ tabs + accordion ---------- */
  M.push(["faq", function(){
    /* ===== EDIT HERE =====
       TABS_BLOCK: id of the Square block with the topic names (element with class w-block-wrapper).
       Topics are found by ORDER, no list to keep here: tab 1 opens the 1st question block below the tabs,
       tab 2 the 2nd, and so on. To add a topic in Square: add a tab name + a new Text block after the last topic.
       Link to a topic: /faq#tab-name, e.g. /faq#visit-us.
       In the Square editor all topics and all answers are shown, each in a dashed box with its tab name. */
    var TABS_BLOCK = "eSWupv";
    var HL_BLOCK = "GNMbTH", HL_WORD = "questions";   /* page title block + word on a pink tag, like the other banners ("" = none) */
    var FIRST_OPEN = true;       /* first question of each topic is open */
    var ONE_OPEN = true;         /* opening a question closes the one that was open */
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)", HOVER = "#F9CFD8";
    /* ===================== */
    var D = document, W = window, cur = 0;
    var BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    function norm(s){ return (s || "").toLowerCase().replace(/&amp;/g, "&").replace(/[\s\u00a0\ufeff]+/g, " ").trim(); }
    function slug(s){ return norm(s).replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
    var T = "#" + TABS_BLOCK + " .w-block";
    var Q = ".mabfx .grid__item>.w-wrapper>.w-cell>.w-cell.row:first-child", A = ".mabfx .grid__item>.w-wrapper>.w-cell>.w-cell.row:nth-child(2)";
    var S =
      /* tabs */
      T + "," + T + " .container{padding-top:0!important;padding-bottom:0!important;margin-top:0!important;margin-bottom:0!important;min-height:0!important}" +
      T + " .container .w-container," + T + " .container .w-cell:not(.grid__item *){margin-top:0!important;margin-bottom:0!important;padding-top:0!important;padding-bottom:0!important;min-height:0!important}" +
      T + " .w-grid{margin:0!important;padding:8px 0!important}" +
      /* tighter spacing around the tabs and the topics */
      ".mabfx>div>.w-block{padding-top:clamp(20px,3vw,36px)!important}" +
      ".mabfx>div>.w-block>.container{padding-top:0!important;margin-top:0!important}" +
      ".mabfx .container>.w-container>.w-cell>.w-container>.w-cell>.w-container>.w-cell:first-child{margin-bottom:12px!important}" +
      T + " .w-grid{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:10px!important}" +
      T + " .grid__item{flex:none!important;width:auto!important;margin:0!important;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
      T + " .grid__item>.w-wrapper{border:1px solid " + LINE + ";border-radius:999px;background:#fff;padding:13px 22px!important;transition:background .2s ease,border-color .2s ease}" +
      T + " .grid__item:hover>.w-wrapper{background:" + HOVER + "}" +
      T + " .grid__item.mabfx-act>.w-wrapper{background:" + INK + ";border-color:" + INK + "}" +
      T + " .grid__item *{margin:0!important;padding:0!important}" +
      T + " .grid__item h1," + T + " .grid__item h2," + T + " .grid__item h3," + T + " .grid__item h4," + T + " .grid__item p{font:700 13px/1 " + BOLD + "!important;letter-spacing:.1em!important;text-transform:uppercase!important;white-space:nowrap;color:" + INK + "!important;text-align:center!important}" +
      T + " .grid__item.mabfx-act h1," + T + " .grid__item.mabfx-act h2," + T + " .grid__item.mabfx-act h3," + T + " .grid__item.mabfx-act h4," + T + " .grid__item.mabfx-act p{color:#fff!important}" +
      "@media(max-width:767px){" + T + " .w-grid{gap:8px!important}" + T + " .grid__item>.w-wrapper{padding:10px 14px!important}" +
        T + " .grid__item h1," + T + " .grid__item h2," + T + " .grid__item h3," + T + " .grid__item h4," + T + " .grid__item p{font-size:11px!important;letter-spacing:.07em!important}}" +
      ".mabfx-hl{display:inline-block;background:" + HOVER + ";padding:0 .12em;border-radius:.12em;transform:rotate(-2deg)}" +
      /* topics */
      ".mabfx-off{display:none!important}" +
      ".mabfx-in{animation:mabfxIn .4s ease both}" +
      "@keyframes mabfxIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}" +
      /* accordion */
      ".mabfx .w-grid{display:block!important;border-top:1px solid " + LINE + "}" +
      ".mabfx .grid__item{margin:0!important;border-bottom:1px solid " + LINE + "}" +
      Q + "{position:relative;cursor:pointer;padding:20px 52px 20px 0!important;margin:0!important;-webkit-tap-highlight-color:transparent}" +
      Q + " h1," + Q + " h2," + Q + " h3," + Q + " h4," + Q + " h5," + Q + " p{margin:0!important}" +
      Q + ":after{content:\"+\";position:absolute;right:0;top:50%;width:32px;height:32px;margin-top:-16px;box-sizing:border-box;border:1.5px solid " + INK + ";border-radius:50%;display:grid;place-items:center;font:400 22px/1 Arial,sans-serif;color:" + INK + ";transition:transform .25s ease,background .25s ease,color .25s ease}" +
      ".mabfx .grid__item.mabfx-open>.w-wrapper>.w-cell>.w-cell.row:first-child:after{transform:rotate(45deg);background:" + INK + ";color:#fff}" +
      A + "{display:none!important;margin:0!important;padding:0 48px 22px 0!important}" +
      ".mabfx .grid__item.mabfx-open>.w-wrapper>.w-cell>.w-cell.row:nth-child(2){display:block!important;animation:mabfxIn .3s ease both}" +
      ".mabfx.mabfx-all .grid__item>.w-wrapper>.w-cell>.w-cell.row:nth-child(2){display:block!important;animation:none}" +
      "@media(max-width:767px){" + A + "{padding-right:0!important}}" +
      "@media(prefers-reduced-motion:reduce){.mabfx-in,.mabfx .grid__item.mabfx-open>.w-wrapper>.w-cell>.w-cell.row:nth-child(2){animation:none}}";

    function tabs(){ var w = D.getElementById(TABS_BLOCK); return w ? w.querySelectorAll(".grid__item") : []; }
    function tabName(t){ return (t.textContent || "").replace(/\s+/g, " ").trim(); }
    function panels(){
      /* the question blocks that come after the tabs block, one per tab */
      var out = [], tw = D.getElementById(TABS_BLOCK), n = tabs().length; if (!tw || !n) return out;
      var blocks = D.querySelectorAll("main [data-block-purpose]"), after = false;
      for (var b = 0; b < blocks.length && out.length < n; b++){
        var bw = blocks[b];
        if (bw === tw) { after = true; continue; }
        if (after && bw.querySelector(".grid__item") && !bw.closest("[data-mabl]")) out.push(bw);
      }
      return out;
    }
    function highlight(){
      if (!HL_WORD) return; var w = D.getElementById(HL_BLOCK); if (!w || w.querySelector(".mabfx-hl")) return;
      var h = w.querySelector("h1,h2"); if (!h) return;
      var tw = D.createTreeWalker(h, NodeFilter.SHOW_TEXT), n, re = new RegExp("\\b(" + HL_WORD + ")\\b", "i");
      while ((n = tw.nextNode())) {
        var m = n.nodeValue.match(re); if (!m) continue;
        var x = n.splitText(m.index); x.splitText(m[0].length);
        var sp = D.createElement("span"); sp.className = "mabfx-hl"; sp.textContent = x.nodeValue; x.parentNode.replaceChild(sp, x); return;
      }
    }
    var tight = 0, hashDone = 0;
    function apply(anim){
      highlight();
      /* less empty space between the block above (page title) and the tabs */
      if (!tight) { var tw = D.getElementById(TABS_BLOCK), cell = tw && tw.closest(".w-cell"), prev = cell && cell.previousElementSibling, pb = prev && prev.querySelector(".w-block");
        if (pb) { tight = 1; pb.style.setProperty("padding-bottom", "clamp(12px,2.5vw,28px)", "important");
          var pcn = pb.querySelector(".container"); if (pcn) { pcn.style.setProperty("padding-bottom", "0px", "important"); pcn.style.setProperty("margin-bottom", "0px", "important"); } } }
      var ps = panels(), ts = tabs();
      if (!hashDone && ts.length) { hashDone = 1; var hs = (location.hash || "").slice(1); for (var j = 0; j < ts.length; j++) if (hs && hs === slug(tabName(ts[j]))) cur = j; }
      for (var i = 0; i < ps.length; i++){
        var p = ps[i]; if (!p) continue;
        if (!p.classList.contains("mabfx")) {
          p.classList.add("mabfx");
          var first = p.querySelector(".grid__item"); if (FIRST_OPEN && first) first.classList.add("mabfx-open");
        }
        var off = !MAB_ED && i !== cur;
        if (p.classList.contains("mabfx-off") !== off) p.classList.toggle("mabfx-off", off);
        if (!off && anim && !MAB_ED) { p.classList.remove("mabfx-in"); void p.offsetWidth; p.classList.add("mabfx-in"); }
        if (MAB_ED) { if (!p.classList.contains("mabfx-all")) p.classList.add("mabfx-all");
          mabEd(p, "Topic " + (i + 1) + " of " + ts.length + ": opens with the tab " + (ts[i] ? tabName(ts[i]) : "?") + ". All answers are open here, on the site they open on click"); }
      }
      if (MAB_ED) mabEd(D.getElementById(TABS_BLOCK), ps.length === ts.length ? "Tabs: one name per topic, in the same order as the topic blocks below" :
        "Check: " + ts.length + " tabs but " + ps.length + " topic blocks. Each tab needs its own Text block below, in the same order");
      for (var k = 0; k < ts.length; k++){
        var on = k === cur; if (ts[k].classList.contains("mabfx-act") !== on) ts[k].classList.toggle("mabfx-act", on);
        if (ts[k].getAttribute("role") !== "tab") { ts[k].setAttribute("role", "tab"); ts[k].tabIndex = 0; }
        var sel = on ? "true" : "false"; if (ts[k].getAttribute("aria-selected") !== sel) ts[k].setAttribute("aria-selected", sel);
      }
    }
    function go(i){
      var ts = tabs(); if (i < 0 || i >= ts.length) return; cur = i; apply(true);
      if (MAB_ED) { var p = panels()[i]; if (p && p.scrollIntoView) p.scrollIntoView({ behavior: "smooth", block: "start" }); return; }   /* editor: jump to that topic */
      try { history.replaceState(null, "", "#" + slug(tabName(ts[i]))); } catch (e) {}
    }

    D.addEventListener("click", function(e){
      var t = e.target.closest && e.target.closest("#" + TABS_BLOCK + " .grid__item");
      if (t) { go([].indexOf.call(tabs(), t)); return; }
      var q = e.target.closest && e.target.closest(Q); if (!q) return;
      var it = q.closest(".grid__item"), was = it.classList.contains("mabfx-open");
      if (ONE_OPEN) { var all = it.parentNode.querySelectorAll(".mabfx-open"); for (var i = 0; i < all.length; i++) all[i].classList.remove("mabfx-open"); }
      it.classList.toggle("mabfx-open", !was);
    });
    D.addEventListener("keydown", function(e){
      if (e.key !== "Enter" && e.key !== " ") return;
      var t = e.target.closest && e.target.closest("#" + TABS_BLOCK + " .grid__item"); if (t) { e.preventDefault(); go([].indexOf.call(tabs(), t)); }
    });
    /* a topic from the link, e.g. /faq#visit-us, is opened in apply() once the tabs are on the page */

    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var tm; function q(){ tm = mabQ(tm, function(){ apply(false); }); }
    new MutationObserver(q).observe(D.body, { childList: true, subtree: true });
    q(); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  /* ---------- Contact page text ---------- */
  M.push(["contact", function(){
    /* The photo, badge and pink tag come from "shero" (CFG line SmLbTp). This part tidies the text:
       everything left aligned, the first line as a lead, and every EMPTY line in the Square text
       becomes a thin raspberry divider, so each group (email, phone, visit) reads as its own row.
       Only styles, nothing is moved, so editing the text in Square stays safe.
       ===== EDIT HERE ===== */
    var BLOCK = "SmLbTp";
    var INK = "#9B1B45", LINE = "rgba(155,27,69,.35)";
    /* ===================== */
    var D = document, B = "#" + BLOCK + " .w-block", G = B + " .element-group";
    var BODY = "\"Niramit Regular\",\"Niramit\",sans-serif", BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    var T = G + " .text-component:not(:has(h1,h2,h3,h4,h5,h6))";   /* the text under the title */
    var S =
      G + " h1," + G + " h2," + G + " p," + G + " .text-component{text-align:left!important}" +
      G + " .button-group{justify-content:flex-start!important}" +
      T + "{margin-top:18px}" +
      T + " p{margin:0!important;font-family:" + BODY + "!important;font-size:1.05rem!important;line-height:1.55!important;letter-spacing:0!important;color:" + INK + "!important}" +
      T + " p strong{font-family:" + BOLD + "!important;font-weight:700!important}" +
      T + " p a{color:" + INK + "!important;text-decoration:underline!important;text-underline-offset:3px;text-decoration-thickness:1px;overflow-wrap:anywhere}" +
      /* first line: the lead */
      T + " p:first-child{font-size:1.18rem!important;line-height:1.45!important;max-width:36ch;margin-bottom:18px!important}" +
      T + " p:first-child strong{font-family:" + BODY + "!important;font-weight:400!important}" +
      /* empty lines -> dividers, plus one line at the top and bottom of the list */
      T + " p:has(>br:only-child){height:0!important;overflow:hidden!important;margin:14px 0!important;border-top:1px solid " + LINE + ";font-size:0!important;line-height:0!important}" +
      T + " p:first-child+p:not(:has(>br:only-child)){border-top:1px solid " + LINE + ";padding-top:14px!important}" +
      T + " p:last-child:not(:first-child){padding-bottom:14px!important;border-bottom:1px solid " + LINE + "}" +
      T + " p:first-child+p:has(>br:only-child){margin-top:0!important}" +
      "@media(max-width:767px){" + T + " p{font-size:1rem!important}" + T + " p:first-child{font-size:1.1rem!important}}";
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
  }]);

  /* ---------- Mobile menu (all pages) ---------- */
  M.push(["mnav", function(){
    /* Square opens the phone menu as a slide-out panel (class "slideout") that sits BEFORE the page in the code,
       so anything on the page with its own layer (badges, photos, the big header logo) could cover it.
       This part lifts the menu above everything (the Square header itself is never touched)
       and restyles it: logo on top, big raspberry links, our Sign In icon, social icons under the list.
       ===== EDIT HERE ===== */
    var INK = "#9B1B45", CREAM = "#F7EFE6", BLUSH = "#F9CFD8", LINE = "rgba(155,27,69,.35)";
    var LOGO_W = 170;                              /* logo width in the menu, px */
    var ALIGN = "left";                            /* menu links: "left" or "center" */
    var SIGNIN_ICON = "ph ph-chef-hat";            /* Phosphor icon class for Sign In ("" = keep the Square icon) */
    var SOCIAL = [                                 /* [Phosphor icon class, link, name]; [] = no social row */
      ["ph ph-facebook-logo", "https://www.facebook.com/missamysbakery/", "Facebook"],
      ["ph ph-instagram-logo", "https://www.instagram.com/missamysbakery/", "Instagram"]
    ];
    var PHOSPHOR = "https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css";   /* loaded only if the page has no Phosphor yet */
    /* ===================== */
    var D = document, TOP = 2147483000;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var BOLD = "\"Niramit Bold\",\"Niramit\",sans-serif";
    var N = ".nav-mobile.w-block", L = N + " .nav--mobile .nav__main";
    var S =
      /* above everything on every page */
      ".slideout{z-index:" + TOP + "!important}" +
      ".slideout__overlay{z-index:" + TOP + "!important}" +
      ".slideout__content{z-index:" + (TOP + 1) + "!important}" +
      N + "{background:" + CREAM + "!important;color:" + INK + "}" +
      /* top row: logo left, close button right */
      N + ">.container{padding-top:14px!important;padding-bottom:10px!important}" +
      N + ">.container>.w-container{align-items:center!important}" +
      N + ">.container .w-cell{margin-top:0!important;margin-bottom:0!important}" +
      N + ">.container .w-cell.cell--empty{display:flex!important;align-items:center;justify-content:flex-start}" +
      ".mabmn-logo{display:block;line-height:0;-webkit-tap-highlight-color:transparent}" +
      ".mabmn-logo img{display:block;width:" + LOGO_W + "px;max-width:100%;height:auto}" +
      N + " .nav-icon__close{display:flex;justify-content:flex-end}" +
      N + " .nav-icon__close .nav-btn{width:44px;height:44px;padding:0!important;display:grid!important;place-items:center;border:1.5px solid " + INK + "!important;border-radius:50%!important;background:transparent!important;transition:background .2s ease}" +
      N + " .nav-icon__close .nav-btn:active{background:" + BLUSH + "!important}" +
      N + " .nav-icon__close .icon{--color:" + INK + "!important;color:" + INK + "!important}" +
      /* the list */
      N + " .nav-scroll{padding:6px 20px 0!important;box-sizing:border-box}" +
      L + "{margin:0!important;padding:0!important;text-align:" + ALIGN + "!important;border-top:1px solid " + LINE + "}" +
      L + ">.nav__item{margin:0!important;padding:0!important;border-bottom:1px solid " + LINE + ";text-align:" + ALIGN + "!important}" +
      L + ">.nav__item>a," + N + " .subnav__nested .parent-link{display:inline-block!important;padding:14px 0!important;margin:0!important;font-family:" + DISP + "!important;font-weight:800!important;font-size:clamp(1.65rem,7.6vw,2.2rem)!important;line-height:1!important;letter-spacing:-.03em!important;text-transform:uppercase!important;color:" + INK + "!important;text-decoration:none!important;-webkit-tap-highlight-color:transparent}" +
      /* the page you are on: pink band behind the word, like the pink tags in the banners */
      L + " a.router-link-exact-active{background:linear-gradient(" + BLUSH + "," + BLUSH + ") 0 58%/100% .9em no-repeat!important}" +
      /* About + its submenu */
      N + " .subnav__nested .parent-link-wrapper{display:flex!important;align-items:center!important;justify-content:" + (ALIGN === "center" ? "center" : "space-between") + "!important;gap:14px}" +
      N + " .subnav__nested .subnav-icon{display:grid!important;place-items:center;width:32px;height:32px;border:1.5px solid " + INK + ";border-radius:50%;color:" + INK + "!important;flex:none}" +
      N + " .subnav__nested .subnav-icon .icon{--color:" + INK + "!important;--icon-size:14px!important;color:" + INK + "!important}" +
      N + " .subnav__nested .nested-menu{margin:0!important;padding:0 0 12px!important;text-align:" + ALIGN + "!important}" +
      N + " .subnav__nested .nested-menu .nav__item{margin:0!important;padding:0!important;border:0!important}" +
      N + " .subnav__nested .nested-menu a{display:inline-block!important;padding:8px 0!important;font:700 .82rem/1.2 " + BOLD + "!important;letter-spacing:.14em!important;text-transform:uppercase!important;color:" + INK + "!important;text-decoration:none!important}" +
      /* Sign In */
      L + ">.nav__item.mabmn-si{border-bottom:0!important}" +
      N + " .sign-in-link{text-align:" + ALIGN + "!important}" +
      N + " .sign-in-link button{--color:" + INK + "!important;color:" + INK + "!important;padding:18px 0 8px!important;margin:0!important;background:none!important;border:0!important}" +
      N + " .sign-in-link button>span{display:inline-flex!important;align-items:center!important;gap:10px!important;font:700 .85rem/1 " + BOLD + "!important;letter-spacing:.14em!important;text-transform:uppercase!important;color:" + INK + "!important}" +
      (SIGNIN_ICON ? N + " .sign-in-link .icon{display:none!important}" : N + " .sign-in-link .icon{--color:" + INK + "!important}") +
      ".mabmn-ic{font-size:24px;line-height:1;color:" + INK + "}" +
      /* social row */
      ".mabmn-soc{display:flex;gap:10px;justify-content:" + (ALIGN === "center" ? "center" : "flex-start") + ";padding:14px 0 32px}" +
      ".mabmn-soc a{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:" + INK + ";color:#fff!important;text-decoration:none!important;transition:transform .2s ease}" +
      ".mabmn-soc a:active{transform:scale(.92)}" +
      ".mabmn-soc i{font-size:22px;line-height:1}";
    function phosphor(){
      if (!PHOSPHOR || (!SIGNIN_ICON && !SOCIAL.length)) return;
      var ls = D.querySelectorAll("link[href*=phosphor],script[src*=phosphor]"); if (ls.length) return;
      var l = D.createElement("link"); l.rel = "stylesheet"; l.href = PHOSPHOR; D.head.appendChild(l);
    }
    function logoSrc(){
      var im = D.querySelector("[data-block-purpose=header] .w-sitelogo img") || D.querySelector(".w-sitelogo img");
      return im ? (im.currentSrc || im.getAttribute("src") || "") : "";
    }
    function run(){
      var ms = D.querySelectorAll(N);
      for (var i = 0; i < ms.length; i++){
        var m = ms[i];
        /* logo in the empty top cell */
        var cell = m.querySelector(":scope>.container .w-cell.cell--empty");
        if (cell && !cell.querySelector(".mabmn-logo")) {
          var src = logoSrc();
          if (src) {
            var a = D.createElement("a"); a.className = "mabmn-logo"; a.href = "/"; a.setAttribute("aria-label", "Home");
            var im = D.createElement("img"); im.src = src; im.alt = "Miss Amy\u2019s Bakery"; a.appendChild(im); cell.appendChild(a);
          }
        }
        /* Sign In: our icon */
        var si = m.querySelector(".sign-in-link");
        if (si) {
          var li = si.closest(".nav__item"); if (li && !li.classList.contains("mabmn-si")) li.classList.add("mabmn-si");
          var inner = si.querySelector("button>span");
          if (SIGNIN_ICON && inner && !inner.querySelector(".mabmn-ic")) {
            var ic = D.createElement("i"); ic.className = SIGNIN_ICON + " mabmn-ic"; ic.setAttribute("aria-hidden", "true"); inner.insertBefore(ic, inner.firstChild);
          }
        }
        /* social icons under the list */
        var sc = m.querySelector(".nav-scroll");
        if (SOCIAL.length && sc && !sc.querySelector(".mabmn-soc")) {
          var row = D.createElement("div"); row.className = "mabmn-soc";
          SOCIAL.forEach(function(s){
            var l = D.createElement("a"); l.href = s[1]; l.target = "_blank"; l.rel = "noopener"; l.setAttribute("aria-label", s[2]);
            var x = D.createElement("i"); x.className = s[0]; x.setAttribute("aria-hidden", "true"); l.appendChild(x); row.appendChild(l);
          });
          sc.appendChild(row);
        }
      }
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    phosphor();
    var t; function q(){ t = mabQ(t, run); }
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (!(x.closest && x.closest(".mabmn-logo,.mabmn-soc,.mabmn-ic"))) { q(); return; } } }).observe(D.body, { childList: true, subtree: true });
    q(); setTimeout(q, 1500);
  }]);

  /* ---------- Footer ---------- */
  M.push(["footer", function(){
    /* ===== EDIT HERE =====
       WORD: the big text. Use | to mark where it breaks into 2 lines on phones.
       LINK: where the big text goes when clicked ("" = not a link).
       ICONS: [image, left %, top %, size, tilt deg, phone left %, phone top %]
              left/top are measured over the big text, size is relative to the letter height (1 = one letter). */
    var INK = "#9B1B45";                  /* menu, headings, icons */
    var WORD = "#SpreadThe|Sparkle";
    var WORD_COLOR = "#9B1B45";
    var LINK = "https://www.instagram.com/explore/tags/spreadthesparkle/";
    var U = "https://square.online/uploads/b/b4cba6f62fa36d4885240bcea117884864102feaa27b5c543e66abc16c7405be/%21";
    var ICONS = [
      [U + "croissant-icon_1793045268.png", -3.5,  2, .72, -14, -1.5, -2],
      [U + "cookies-icon_1793045268.png",   29.5, 62, .55, 10, 45.5, -4],
      [U + "cupcake-icon_1793045268.png",   52,  -34, .78,  6,  11,  50],
      [U + "cake-icon_1793045268.png",      93,  -30, .82, -8,  80,  52]
    ];
    var WORD_SIZE = .92;                  /* how much of the footer width the big text takes (1 = full width) */
    var CREDIT = "Website designed by";  /* small line under the big text, "" = none */
    var CREDIT_NAME = "TryLab Studio", CREDIT_URL = "https://99designs.com/profiles/ksutryniak";
    var LOGO_W = 290, LOGO_W_MOBILE = 250;   /* footer logo width in px: desktop, phone */
    var MENU_ROWS = 2;                    /* menu items per column on desktop */
    var SCALLOP = 64;                     /* width of one bubble on the top edge in px, 0 = straight edge */
    var FT_BG = "#F2D1D8";                /* footer color, used for the bubbles if Square does not give it in time */
    /* Visit us: address, phone and opening hours (shown between the logo and the subscribe form) */
    var VISIT = {
      title: "Visit us",
      address: ["1494 E Smithville Western Rd, Suite C", "Wooster, OH"],
      map: "https://www.google.com/maps/search/?api=1&query=1494+E+Smithville+Western+Rd+Suite+C+Wooster+OH",
      phone: "330-804-0000",
      hours: [["Tue\u2013Thu", "8:00 am \u2013 4:30 pm"], ["Fri", "8:00 am \u2013 5:00 pm"], ["Sat", "8:00 am \u2013 2:00 pm"], ["Sun\u2013Mon", "Closed"]]
    };
    /* ===================== */
    var D = document, W = window;
    var DISP = "\"Bricolage Grotesque\",\"Bricolage Grotesque 24pt SemiCondensed Regular\",\"Arial Black\",sans-serif";
    var F = ".mabft>.container>.w-container";
    var C = "{display:contents!important}";
    var S =
      /* flatten Square columns into one grid */
      F + "{display:grid!important;grid-template-columns:auto auto auto minmax(280px,1fr);grid-template-areas:\"logo visit hours h\" \"logo visit hours form\" \"nav nav nav soc\" \"line line line line\" \"pay pay pay copy\";column-gap:clamp(28px,5vw,80px);row-gap:0;align-items:start;text-align:left!important}" +
      F + ">.w-cell," + F + ">.w-cell>.w-container," + F + ">.w-cell>.w-container>.w-cell," + F + ">.w-cell>.w-container>.w-cell>.w-container," + F + ">.w-cell>.w-container>.w-cell>.w-container>.w-cell>.social-icons~*" + C +
      F + ">.w-cell:nth-child(3)>.w-container>.w-cell:last-child>.w-container>.w-cell" + C +
      F + ">.w-cell:first-child>.w-container>.w-cell:first-child>.w-container>.w-cell:first-child{grid-area:logo;margin:0!important}" +
      F + ">.w-cell:first-child>.w-container>.w-cell:first-child>.w-container>.w-cell:nth-child(2){grid-area:nav;margin:40px 0 0!important;padding-top:6px}" +
      F + ">.w-cell:first-child>.w-container>.w-cell:last-child>.w-container>.w-cell:first-child{grid-area:h;margin:0 0 14px!important}" +
      F + ">.w-cell:first-child>.w-container>.w-cell:last-child>.w-container>.w-cell:nth-child(2){grid-area:form;margin:0!important}" +
      F + ">.w-cell:nth-child(2){display:block!important;grid-area:line;margin:clamp(24px,3vw,36px) 0 16px!important}" +
      F + ">.w-cell:nth-child(3)>.w-container>.w-cell:first-child{display:block!important;grid-area:pay;margin:0!important}" +
      ".mabft .social-icons{grid-area:soc;margin-top:22px!important;align-self:end;justify-content:flex-start!important}" +
      ".mabft .copyright{grid-area:copy;align-self:center;text-align:right!important}" +
      /* logo */
      ".mabft .w-sitelogo,.mabft .w-sitelogo img,.mabft .logo__link img{width:" + LOGO_W + "px!important;max-width:100%!important;height:auto!important;max-height:none!important}" +
      "@media(max-width:767px){.mabft .w-sitelogo,.mabft .w-sitelogo img,.mabft .logo__link img{width:" + LOGO_W_MOBILE + "px!important}}" +
      /* menu in columns */
      ".mabft .nav--footer .nav__main{display:grid!important;grid-auto-flow:column;grid-template-rows:repeat(" + MENU_ROWS + ",auto);justify-content:start;gap:14px clamp(28px,4vw,56px);margin:0!important;padding:0!important;text-align:left!important}" +
      ".mabft .nav--footer .nav__item{margin:0!important;padding:0!important;display:block!important;line-height:1!important}" +
      ".mabft .nav--footer .nav__item a{font-family:" + DISP + "!important;font-weight:800!important;font-size:1.15rem!important;letter-spacing:.01em!important;text-transform:uppercase!important;color:" + INK + "!important;text-decoration:none!important;white-space:nowrap;background:none!important;padding:0!important;transition:opacity .2s ease}" +
      ".mabft .nav--footer .nav__item a:hover{opacity:.6}" +
      /* subscribe + socials */
      ".mabft .text-component p{color:" + INK + "!important}" +
      ".mabft h1,.mabft h2,.mabft h3,.mabft h4,.mabft h5,.mabft h6," + F + ">.w-cell:first-child>.w-container>.w-cell:last-child .text-component p{font-family:" + DISP + "!important;font-weight:800!important;font-size:clamp(1.25rem,1.8vw,1.6rem)!important;line-height:1.05!important;letter-spacing:-.025em!important;color:" + INK + "!important;text-align:left!important}" +
      /* subscribe: pill field + separate pill button like the rest of the site */
      ".mabft .action-button{display:flex!important;align-items:stretch!important;gap:10px!important;border:0!important;box-shadow:none!important;background:none!important;padding:0!important}" +
      ".mabft .action-button__input,.mabft .action-button__input *{border:0!important;box-shadow:none!important;outline:0!important;background:transparent!important}" +
      ".mabft .action-button__input{flex:1 1 auto!important;min-width:0!important;display:flex!important;align-items:center!important;border:1px solid " + INK + "!important;border-radius:999px!important;padding:0 20px!important}" +
      ".mabft .action-button__input input{width:100%!important;color:" + INK + "!important;padding:0!important;height:auto!important}" +
      ".mabft .action-button .w-button.w-button.w-button.w-button{flex:none!important;border-radius:var(--maker-shape-button-border-radius,32px)!important;margin:0!important}" +
      ".mabft input[type=email]::placeholder{color:" + INK + ";opacity:.7}" +
      ".mabft .recaptcha-terms{font-size:.7rem!important;opacity:.7;text-align:left!important;color:" + INK + "}" +
      ".mabft .recaptcha-terms a{color:inherit!important}" +
      ".mabft .social-icons a{display:inline-block;margin-right:10px}" +
      ".mabft .social-icons .icon{width:34px!important;height:34px!important}" +
      ".mabft .social-icons use{--background-fill:" + INK + "!important;--icon-fill:#fff!important}" +
      ".mabft hr.divider{border:0!important;border-top:1px solid rgba(155,27,69,.35)!important;background:none!important;height:0!important;margin:0!important}" +
      ".mabft .payment-methods{justify-content:flex-start!important;opacity:.85}" +
      ".mabft .copyright p{font:700 .78rem/1.4 \"Niramit Bold\",\"Niramit\",sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase}" +
      /* visit us */
      ".mabft-visit{display:contents}" +
      ".mabft-va{grid-area:visit;min-width:0;color:" + INK + ";font:400 1rem/1.55 \"Niramit Regular\",\"Niramit\",sans-serif}" +
      ".mabft-vh{grid-area:hours;min-width:0;display:grid;grid-template-columns:auto auto;gap:6px 22px;align-content:start;color:" + INK + ";font:400 1rem/1.5 \"Niramit Regular\",\"Niramit\",sans-serif;font-variant-numeric:tabular-nums}" +
      ".mabft-vt{display:block;margin:0 0 12px;font-family:" + DISP + ";font-weight:800;font-size:1.15rem;line-height:1;letter-spacing:.01em;text-transform:uppercase;color:" + INK + "}" +
      ".mabft-va a{color:" + INK + "!important;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}" +
      ".mabft-va a:hover{opacity:.7}" +
      ".mabft-vp{display:block;margin-top:10px}" +
      ".mabft-vh b{font:700 .74rem/2.05 \"Niramit Bold\",\"Niramit\",sans-serif;letter-spacing:.14em;text-transform:uppercase}" +
      ".mabft-vh .mabft-vt{display:none}" +
      ".mabft-vh b,.mabft-vh span{white-space:nowrap}" +
      "[data-block-purpose=footer],[data-block-purpose=footer]>div{overflow:visible!important}" +
      "@media(min-width:1101px){" + F + ">.w-cell:first-child>.w-container>.w-cell:last-child>.w-container>.w-cell," + ".mabft .social-icons{justify-self:end;width:100%!important;max-width:440px!important;box-sizing:border-box}}" +
      "@media(min-width:768px) and (max-width:1100px){" + F + "{grid-template-columns:minmax(0,auto) minmax(0,auto) minmax(0,1fr);grid-template-areas:\"logo visit hours\" \"nav nav nav\" \"h h h\" \"form form form\" \"soc soc soc\" \"line line line\" \"pay pay copy\"}" +
        F + ">.w-cell:first-child>.w-container>.w-cell:last-child>.w-container>.w-cell:first-child{margin:36px 0 14px!important}}" +
      /* wordmark */
      ".mabft{flex-direction:column!important;position:relative!important;overflow:visible!important}" +
      (SCALLOP ? ".mabft:before{content:\"\";position:absolute;left:0;right:0;top:" + (1 - SCALLOP * .375) + "px;height:" + (SCALLOP * .375) + "px;z-index:2;pointer-events:none;background:radial-gradient(circle " + (SCALLOP * .53) + "px at 50% " + (SCALLOP * .53) + "px,var(--ftbg," + FT_BG + ") 98%,transparent 100%) 0 0/" + SCALLOP + "px " + (SCALLOP * .375) + "px repeat-x}" : "") +
      ".mabft>.container{padding-bottom:0!important;margin-bottom:0!important}" +
      ".mabft-word{display:block;position:relative;box-sizing:border-box;width:calc(100% - 2*clamp(16px,6vw,110px));max-width:1400px;margin:0 auto;padding:clamp(14px,2vw,28px) 0 clamp(10px,2vw,24px);text-align:center;text-decoration:none!important;line-height:0;overflow:hidden}" +
      ".mabft-in{position:relative;display:inline-block;white-space:nowrap;font-family:\"Niramit Bold\",\"Niramit\",sans-serif;font-weight:700;line-height:.95;letter-spacing:-.04em;color:" + WORD_COLOR + "}" +
      ".mabft-in>span{display:inline}" +
      ".mabft-ic{position:absolute;left:var(--l);top:var(--t);width:var(--w);height:auto;transform:rotate(var(--r));pointer-events:none}" +
      ".mabft-cr{display:block;text-align:center;margin:0 auto;padding:4px 16px 22px;font:400 .58rem/1.4 \"Niramit Regular\",\"Niramit\",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:" + INK + ";opacity:.75}" +
      ".mabft-cr a{color:inherit!important;font-family:\"Niramit Bold\",\"Niramit\",sans-serif;text-decoration:underline;text-underline-offset:3px}" +
      ".mabft-cr a:hover{opacity:.7}" +
      "@media(max-width:767px){" +
        F + "{grid-template-columns:minmax(0,1fr);grid-template-areas:\"logo\" \"nav\" \"h\" \"form\" \"soc\" \"visit\" \"line\" \"pay\" \"copy\"}" +
        ".mabft-visit{grid-area:visit;display:flex;flex-direction:column;align-items:center;text-align:center;margin-top:30px}" +
        ".mabft-va{display:contents}" +
        ".mabft-va .mabft-vt{order:1;font-family:\"Niramit Bold\",\"Niramit\",sans-serif;font-size:.74rem;letter-spacing:.18em}" +
        ".mabft-va .mabft-vad{order:2}" +
        ".mabft-vh{order:3;margin-top:16px;column-gap:18px}" +
        ".mabft-vh b{text-align:right}.mabft-vh span{text-align:left}" +
        ".mabft-vp{order:4;margin-top:14px}" +
        F + ">.w-cell:first-child>.w-container>.w-cell:first-child>.w-container>.w-cell:nth-child(2){margin:24px 0 34px!important;padding:0}" +
        ".mabft .nav--footer .nav__main{grid-auto-flow:row;grid-template-rows:none;grid-template-columns:repeat(2,max-content);justify-content:center!important;gap:14px 36px}" +
        F + ">.w-cell:first-child>.w-container>.w-cell:first-child>.w-container>.w-cell:first-child{justify-self:center;text-align:center!important}" +
        ".mabft .logo__link{display:block;text-align:center!important}" +
        ".mabft .nav--footer .nav__main{justify-content:center}" +
        F + ">.w-cell:first-child>.w-container>.w-cell:last-child .text-component p{text-align:center!important}" +
        ".mabft .social-icons{justify-content:center!important;text-align:center!important;margin-top:18px!important}" +
        ".mabft .social-icons a{margin:0 5px}" +
        F + ">.w-cell:nth-child(2){margin:24px 0 16px!important}" +
        ".mabft .payment-methods{justify-content:center!important}" +
        ".mabft .copyright{justify-self:center;text-align:center!important;margin-top:36px}" +
        ".mabft .copyright p{text-align:center!important}" +
        ".mabft-in>span{display:block}" +
        ".mabft-ic{left:var(--ml);top:var(--mt)}" +
        ".mabft-word{width:calc(100% - 32px);padding-top:22px}" +
      "}";
    var tries = 0;
    function build(bl){
      var a = D.createElement(LINK ? "a" : "div"); a.className = "mabft-word";
      if (LINK) { a.href = LINK; a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", WORD.replace(/\|/g, "")); }
      var inn = D.createElement("span"); inn.className = "mabft-in"; inn.setAttribute("aria-hidden", "true");
      WORD.split("|").forEach(function(p){ var s = D.createElement("span"); s.textContent = p; inn.appendChild(s); });
      ICONS.forEach(function(c, i){
        var im = D.createElement("img"); im.className = "mabft-ic"; im.src = c[0]; im.alt = ""; im.loading = "lazy";
        im.style.cssText = "--l:" + c[1] + "%;--t:" + c[2] + "%;--w:" + c[3] + "em;--r:" + c[4] + "deg;--ml:" + c[5] + "%;--mt:" + c[6] + "%";
        inn.appendChild(im);
      });
      a.appendChild(inn); bl.appendChild(a);
      if (CREDIT) { var cr = D.createElement("div"); cr.className = "mabft-cr"; cr.appendChild(D.createTextNode(CREDIT + " ")); var l = D.createElement("a"); l.href = CREDIT_URL; l.target = "_blank"; l.rel = "noopener"; l.textContent = CREDIT_NAME; cr.appendChild(l); bl.appendChild(cr); }
      return a;
    }
    function visit(bl){
      var F2 = bl.querySelector(":scope>.container>.w-container"); if (!F2 || F2.querySelector(":scope>.mabft-visit")) return;
      var v = D.createElement("div"); v.className = "mabft-visit";
      var a = D.createElement("div"); a.className = "mabft-va";
      var t = D.createElement("span"); t.className = "mabft-vt"; t.textContent = VISIT.title; a.appendChild(t);
      var ad = D.createElement("a"); ad.className = "mabft-vad"; ad.href = VISIT.map; ad.target = "_blank"; ad.rel = "noopener";
      VISIT.address.forEach(function(x, i){ if (i) ad.appendChild(D.createElement("br")); ad.appendChild(D.createTextNode(x)); });
      a.appendChild(ad);
      var ph = D.createElement("a"); ph.className = "mabft-vp"; ph.href = "tel:+1" + VISIT.phone.replace(/\D/g, ""); ph.textContent = VISIT.phone; a.appendChild(ph);
      var h = D.createElement("div"); h.className = "mabft-vh";
      VISIT.hours.forEach(function(r){ var b = D.createElement("b"); b.textContent = r[0]; var sp = D.createElement("span"); sp.textContent = r[1]; h.appendChild(b); h.appendChild(sp); });
      v.appendChild(a); v.appendChild(h); F2.appendChild(v);
    }
    function fit(){
      var ws = D.querySelectorAll(".mabft-word");
      for (var i = 0; i < ws.length; i++){
        var w = ws[i], inn = w.firstChild, box = w.clientWidth; if (!box) continue;
        var fs = parseFloat(inn.style.fontSize) || 100; inn.style.fontSize = fs + "px";
        var tw = inn.getBoundingClientRect().width; if (!tw) continue;
        var nf = Math.max(20, Math.min(300, fs * box * (W.innerWidth < 768 ? .96 : WORD_SIZE) / tw));
        if (Math.abs(nf - fs) > .5) inn.style.fontSize = nf.toFixed(1) + "px";
      }
    }
    function run(){
      var bs = D.querySelectorAll("[data-block-purpose=footer] .w-block");
      for (var b = 0; b < bs.length; b++){
        var bl = bs[b];
        if (!bl.classList.contains("mabft")) bl.classList.add("mabft");
        var bg = getComputedStyle(bl).backgroundColor; if (bg && bg !== "rgba(0, 0, 0, 0)" && bl.style.getPropertyValue("--ftbg") !== bg) bl.style.setProperty("--ftbg", bg);
        if (!bl.querySelector(":scope>.mabft-word") && (bl.mabT | 0) < 6) { bl.mabT = (bl.mabT | 0) + 1; build(bl); }
        if ((bl.mabV | 0) < 6 && !bl.querySelector(".mabft-visit")) { bl.mabV = (bl.mabV | 0) + 1; visit(bl); }
      }
      fit();
    }
    var st = D.createElement("style"); st.textContent = S; D.head.appendChild(st);
    var t; function q(){ t = mabQ(t, run); } try { run(); } catch (e) {}
    new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) { var x = ms[i].target; if (!(x.closest && x.closest(".mabft-word,.mabft-cr,.mabft-visit"))) { q(); return; } } }).observe(D.documentElement, { childList: true, subtree: true });
    addEventListener("resize", q); addEventListener("load", q); if (D.fonts && D.fonts.ready) D.fonts.ready.then(q); setTimeout(q, 1500); setTimeout(q, 4000);
  }]);

  function boot(){
    for (var i = 0; i < M.length; i++) {
      try { M[i][1](); } catch (e) { if (window.console) console.warn("mab " + M[i][0], e); }
    }
  }
  if (document.body) boot();
  else {
    var o = new MutationObserver(function(){ if (document.body) { o.disconnect(); boot(); } });
    o.observe(document.documentElement, { childList: true });
  }
})();
