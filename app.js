// ============================================================
// app.js — renders the Bijli demo UI and wires up interactions.
// DATA (data.js) and LOGIC (logic.js) are plain script globals.
// localStorage holds the saved area and today's report counts.
// ============================================================

(function () {
  "use strict";

  // ---------- tiny helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function nowMinutes() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  // ---------- tabs ----------
  var TABS = ["alerts", "ups", "community"];
  function showTab(name) {
    TABS.forEach(function (t) {
      $("tab-" + t).classList.toggle("active", t === name);
      $("panel-" + t).classList.toggle("active", t === name);
    });
  }

  // ---------- area state ----------
  function currentArea() {
    var id = loadJSON(DATA.AREA_KEY, DATA.AREAS[0].id);
    var found = null;
    DATA.AREAS.forEach(function (a) { if (a.id === id) found = a; });
    return found || DATA.AREAS[0];
  }

  // ---------- ALERTS tab ----------
  function renderAreaSelect() {
    var sel = $("area-select");
    sel.innerHTML = "";
    DATA.AREAS.forEach(function (a) {
      var o = document.createElement("option");
      o.value = a.id;
      o.textContent = a.name + ", " + a.city;
      sel.appendChild(o);
    });
    sel.value = currentArea().id;
    sel.onchange = function () {
      saveJSON(DATA.AREA_KEY, sel.value);
      renderAlerts();
      renderReportMeta();
    };
  }

  function renderAlerts() {
    var area = currentArea();
    $("area-meta").textContent = area.disco + " \u00b7 " + area.feeder;

    var now = nowMinutes();
    var st = LOGIC.currentStatus(area, now);
    var chip = $("status-chip");
    chip.classList.toggle("off", st.inOutage);
    chip.classList.toggle("on", !st.inOutage);
    if (st.inOutage) {
      $("status-text").innerHTML = '<span class="dot"></span> Power OFF';
      $("status-sub").textContent =
        "Back " + LOGIC.countdownText(now, st.restoreMin) + " (" + LOGIC.formatTime(st.restoreMin) + ")";
      $("alert-title").textContent = "It's out right now";
      $("alert-sub").textContent =
        "Power returns " + LOGIC.countdownText(now, st.restoreMin) +
        ". Run only essentials on your UPS until then.";
    } else {
      $("status-text").innerHTML = '<span class="dot"></span> Power ON';
      $("status-sub").textContent =
        "Next cut " + LOGIC.countdownText(now, st.nextCutMin) + " (" + LOGIC.formatTime(st.nextCutMin % 1440) + ")";
      $("alert-title").textContent = "Outage " + LOGIC.countdownText(now, st.nextCutMin);
      var nextCut = area.cuts.map(function (c) { return LOGIC.parseTime(c[0]); })
        .filter(function (m) { return m > now; })[0];
      var dur = nextCut !== undefined
        ? LOGIC.formatDur(LOGIC.parseTime(cutEndFor(area, nextCut)) - nextCut)
        : "";
      $("alert-sub").textContent =
        "Charge your devices \u2014 the " + LOGIC.formatTime(st.nextCutMin % 1440) +
        " cut lasts " + dur + ".";
    }

    // timeline
    var tl = $("timeline");
    tl.innerHTML = "";
    area.cuts.forEach(function (c) {
      var s = LOGIC.parseTime(c[0]);
      var e = LOGIC.parseTime(c[1]);
      var seg = document.createElement("div");
      seg.className = "cut";
      seg.style.left = (s / 1440 * 100) + "%";
      seg.style.width = ((e - s) / 1440 * 100) + "%";
      seg.title = LOGIC.formatTime(s) + " \u2013 " + LOGIC.formatTime(e);
      tl.appendChild(seg);
    });
    var marker = document.createElement("div");
    marker.className = "now";
    marker.style.left = "calc(" + (now / 1440 * 100) + "% - 2px)";
    tl.appendChild(marker);

    // upcoming cuts list
    var list = $("cuts-list");
    list.innerHTML = "";
    area.cuts.forEach(function (c, i) {
      var s = LOGIC.parseTime(c[0]);
      var e = LOGIC.parseTime(c[1]);
      var tags = ["Evening peak", "Night", "Morning"];
      var row = document.createElement("div");
      row.className = "cut-row";
      row.innerHTML = '<div><div class="when">' + esc(LOGIC.formatTime(s)) + " \u2013 " +
        esc(LOGIC.formatTime(e)) + '</div><div class="dur">' + esc(LOGIC.formatDur(e - s)) +
        "</div></div>" + '<span class="tag">' + esc(tags[i] || "Scheduled") + "</span>";
      list.appendChild(row);
    });
  }

  function cutEndFor(area, startMin) {
    for (var i = 0; i < area.cuts.length; i++) {
      if (LOGIC.parseTime(area.cuts[i][0]) === startMin) return area.cuts[i][1];
    }
    return area.cuts[0][1];
  }

  // ---------- UPS tab ----------
  function renderAppliances() {
    var box = $("appliance-list");
    box.innerHTML = "";
    DATA.APPLIANCES.forEach(function (a) {
      var lab = document.createElement("label");
      lab.className = "appliance";
      var qty = a.qty > 1 ? " \u00d7 " + a.qty : "";
      lab.innerHTML = '<input type="checkbox" data-id="' + a.id + '"' +
        (a.id === "fan" || a.id === "bulb" || a.id === "tv" || a.id === "router" ? " checked" : "") + ">" +
        '<span class="nm">' + esc(a.name) + qty + "</span>" +
        '<span class="wt">' + (a.watts * a.qty) + "W</span>";
      lab.querySelector("input").onchange = renderUps;
      box.appendChild(lab);
    });
  }

  function selectedIds() {
    var ids = [];
    var inputs = $("appliance-list").querySelectorAll("input[type=checkbox]");
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].checked) ids.push(inputs[i].getAttribute("data-id"));
    }
    return ids;
  }

  function renderUps() {
    var hours = Number($("hours-range").value);
    $("hours-val").textContent = hours + (hours === 1 ? " hour" : " hours");
    var watts = LOGIC.totalWatts(selectedIds(), DATA.APPLIANCES);
    $("load-watts").textContent = watts;
    $("load-wh").textContent = LOGIC.energyWh(watts, hours);

    var box = $("rec-box");
    if (watts === 0) {
      box.innerHTML = '<div class="card empty-rec">Tick at least one appliance to size your UPS.</div>';
      return;
    }
    var rec = LOGIC.recommendPackage(watts, hours, DATA.PACKAGES);
    if (!rec) {
      box.innerHTML = '<div class="card empty-rec">No sample package covers ' + watts +
        " W for " + hours + " hours \u2014 you may need a bigger setup. Ask a trusted electrician.</div>";
      return;
    }
    var run = LOGIC.runtimeHours(watts, rec);
    box.innerHTML = '<div class="card rec-card">' +
      "<h3>" + esc(rec.name) + "</h3>" +
      '<p class="rec-run">\u2248 ' + run.toFixed(1) + " hrs on your " + watts + " W load</p>" +
      '<p class="rec-price">' + LOGIC.formatPKR(rec.price) +
      ' <span class="meta">(sample price)</span></p>' +
      '<p class="muted">Inverter rated ' + rec.kva + ' kVA \u2014 covers your load with headroom.</p>' +
      "</div>";
  }

  // ---------- COMMUNITY tab ----------
  function renderReportMeta() {
    var area = currentArea();
    $("report-area").textContent = area.name + ", " + area.city;
    var stored = loadJSON(DATA.REPORTS_KEY, {});
    var key = area.id + ":" + LOGIC.dayKey();
    $("report-count").textContent = stored[key] || 0;
  }

  function renderCommunity() {
    renderReportMeta();
    var list = $("voltage-list");
    list.innerHTML = "";
    DATA.VOLTAGE_LOG.forEach(function (v) {
      var verdict = LOGIC.voltageVerdict(v.volts);
      var col = verdict === "Normal" ? "var(--green)" : "var(--red)";
      var row = document.createElement("div");
      row.className = "volt-row";
      row.innerHTML = '<span class="vdot" style="background:' + col + '"></span>' +
        '<span class="tm">' + esc(v.time) + '</span><span class="muted">' + verdict + "</span>" +
        '<span class="vv" style="color:' + col + '">' + v.volts + " V</span>";
      list.appendChild(row);
    });
    $("guide-box").textContent = DATA.VOLTAGE_GUIDE.high;
  }

  function wireReport() {
    $("report-btn").onclick = function () {
      var area = currentArea();
      var stored = loadJSON(DATA.REPORTS_KEY, {});
      var res = LOGIC.bumpReports(stored, area.id, LOGIC.dayKey());
      saveJSON(DATA.REPORTS_KEY, res.map);
      $("report-count").textContent = res.count;
      $("report-btn").textContent = "Reported \u2713";
      var btn = $("report-btn");
      btn.disabled = true;
      setTimeout(function () { btn.textContent = "Report outage"; btn.disabled = false; }, 3000);
    };
  }

  // ---------- boot ----------
  function boot() {
    TABS.forEach(function (t) {
      $("tab-" + t).addEventListener("click", function () { showTab(t); });
    });
    showTab("alerts");
    renderAreaSelect();
    renderAlerts();
    renderAppliances();
    renderUps();
    $("hours-range").addEventListener("input", renderUps);
    renderCommunity();
    wireReport();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
