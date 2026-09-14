/* INFOTEC coarse device telemetry. No raw UA, IP, account IDs or query strings are sent. */
(function () {
  "use strict";
  try {
    var script = document.currentScript;
    var product = script && script.getAttribute("data-product");
    if (!product || window["__infotecDevice_" + product]) return;
    window["__infotecDevice_" + product] = true;
    var ua = navigator.userAgent || "";
    var ipad = /iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var android = /Android/i.test(ua);
    var iphone = /iPhone|iPod/i.test(ua);
    var tablet = ipad || /Tablet/i.test(ua) || (android && !/Mobile/i.test(ua));
    var device = tablet ? "tablet" : (android || iphone || /Mobile/i.test(ua)) ? "mobile" : "desktop";
    var os = ipad ? "ipados" : iphone ? "ios" : android ? "android" : /Windows/i.test(ua) ? "windows" : /Mac OS X|Macintosh/i.test(ua) ? "macos" : /Linux/i.test(ua) ? "linux" : "unknown";
    var browser = /Edg|EdgiOS|EdgA/i.test(ua) ? "edge" : /SamsungBrowser/i.test(ua) ? "samsung" : /Firefox|FxiOS/i.test(ua) ? "firefox" : /CriOS|Chrome/i.test(ua) ? "chrome" : /Safari/i.test(ua) ? "safari" : "other";
    var session = crypto.randomUUID();
    try {
      var key = "infotec_device_session_v2";
      session = sessionStorage.getItem(key) || session;
      sessionStorage.setItem(key, session);
    } catch (_) {}
    var path = location.pathname.split("/").filter(Boolean)[0] || "home";
    // Only coarse route categories; never send private resource IDs or access tokens.
    if (!/^(home|dashboard|login|cadastro|teste-gratis|assinatura|agendar|briefing|precifica|eventos|loja|mentorias|recuperar-senha)$/.test(path)) path = "other";
    var payload = {
      p_product_slug: product, p_session_id: session,
      p_device_class: device, p_os_family: os, p_browser_family: browser,
      p_viewport_width: Math.min(window.innerWidth, 10000),
      p_viewport_height: Math.min(window.innerHeight, 10000),
      p_standalone: window.matchMedia("(display-mode: standalone)").matches || Boolean(navigator.standalone),
      p_touch_enabled: navigator.maxTouchPoints > 0, p_path_group: "/" + path,
      p_source: "web", p_metadata: {telemetry_version: "device-intelligence-v2"}
    };
    var apiKey = "sb_publishable_G5uhAYCnBtiM4ftqOWuA_A_dZRy79Z8";
    fetch("https://ztcrpptenaenzikgvqez.supabase.co/rest/v1/rpc/factory_track_device_access", {
      method: "POST", keepalive: true,
      headers: {apikey: apiKey, "Content-Type": "application/json"},
      body: JSON.stringify(payload)
    }).then(function (response) {
      window["__infotecDeviceStatus_" + product] = response.ok ? "received" : "http_" + response.status;
    }).catch(function () { window["__infotecDeviceStatus_" + product] = "network_error"; });
  } catch (_) {}
})();
