// ============================================================
// logic.js — pure functions for the Bijli demo.
// No DOM, no localStorage here: every function is a plain
// input -> output, which makes it easy to test (see test.js).
// ============================================================

// "19:15" -> minutes after midnight.
function parseTime(s) {
  var parts = String(s).split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

// minutes -> "7:15 PM".
function formatTime(mins) {
  var m = ((Number(mins) % 1440) + 1440) % 1440;
  var h = Math.floor(m / 60);
  var mm = m % 60;
  var ampm = h < 12 ? "AM" : "PM";
  var h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return h12 + ":" + (mm < 10 ? "0" + mm : mm) + " " + ampm;
}

// 105 -> "1 hr 45 min"; 60 -> "1 hr"; 30 -> "30 min".
function formatDur(mins) {
  mins = Math.round(mins);
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  if (h === 0) return m + " min";
  if (m === 0) return h + " hr";
  return h + " hr " + m + " min";
}

// "in 45 min" / "in 2 hrs 5 min" from now to a future minute.
function countdownText(nowMin, targetMin) {
  var d = targetMin - nowMin;
  if (d < 0) d += 1440;
  return "in " + formatDur(d);
}

// Current power status for an area at nowMin (minutes).
// Returns { inOutage, nextCutMin, restoreMin } — each minute
// value may wrap past midnight (e.g. 1470 = 00:30 next day).
function currentStatus(area, nowMin) {
  var cuts = area.cuts.map(function (c) {
    return { start: parseTime(c[0]), end: parseTime(c[1]) };
  });
  cuts.sort(function (a, b) { return a.start - b.start; });

  // Inside an outage window?
  for (var i = 0; i < cuts.length; i++) {
    if (nowMin >= cuts[i].start && nowMin < cuts[i].end) {
      return { inOutage: true, nextCutMin: null, restoreMin: cuts[i].end };
    }
  }
  // Next cut today?
  for (var j = 0; j < cuts.length; j++) {
    if (cuts[j].start > nowMin) {
      return { inOutage: false, nextCutMin: cuts[j].start, restoreMin: null };
    }
  }
  // All cuts done — next cut is the first one tomorrow.
  return { inOutage: false, nextCutMin: cuts[0].start + 1440, restoreMin: null };
}

// Total wattage of the selected appliances (ids array).
// Each appliance's qty (e.g. 4 LED bulbs) counts fully.
function totalWatts(selectedIds, appliances) {
  var total = 0;
  appliances.forEach(function (a) {
    if (selectedIds.indexOf(a.id) !== -1) total += a.watts * a.qty;
  });
  return total;
}

// Energy needed: watts * hours.
function energyWh(watts, hours) {
  return watts * hours;
}

// Estimated backup hours a package gives a load.
// Usable energy = Ah * volts * 50% depth of discharge * 85% efficiency.
var DOD = 0.5;
var EFF = 0.85;
function usableWh(pack) {
  return pack.ah * pack.volts * DOD * EFF;
}
function runtimeHours(loadW, pack) {
  if (loadW <= 0) return 0;
  return usableWh(pack) / loadW;
}

// Cheapest package that (a) covers loadW with 25% headroom and
// (b) runs at least `hours`. Returns the package or null.
function recommendPackage(loadW, hours, packages) {
  var need = loadW * 1.25;
  var ok = packages.filter(function (p) {
    return p.kva * 1000 >= need && runtimeHours(loadW, p) >= hours;
  });
  ok.sort(function (a, b) { return a.price - b.price; });
  return ok.length ? ok[0] : null;
}

// Voltage band verdict (Pakistani mains ~230 V nominal).
function voltageVerdict(volts) {
  if (volts < 180) return "Low";
  if (volts > 240) return "High";
  return "Normal";
}

// "Rs 78,000" — thousands separator, no decimals.
function formatPKR(n) {
  return "Rs " + Number(n).toLocaleString("en-PK");
}

// Day key for report counting, e.g. "2026-10-22".
function dayKey(d) {
  d = d || new Date();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
}

// Increment today's report count for an area (pure: takes the
// stored map, returns the new map + the new count).
function bumpReports(stored, areaId, day) {
  var key = areaId + ":" + day;
  var map = stored ? JSON.parse(JSON.stringify(stored)) : {};
  map[key] = (map[key] || 0) + 1;
  return { map: map, count: map[key] };
}

var LOGIC = {
  parseTime: parseTime,
  formatTime: formatTime,
  formatDur: formatDur,
  countdownText: countdownText,
  currentStatus: currentStatus,
  totalWatts: totalWatts,
  energyWh: energyWh,
  usableWh: usableWh,
  runtimeHours: runtimeHours,
  recommendPackage: recommendPackage,
  voltageVerdict: voltageVerdict,
  formatPKR: formatPKR,
  dayKey: dayKey,
  bumpReports: bumpReports,
  DOD: DOD,
  EFF: EFF
};

if (typeof module !== "undefined") module.exports = LOGIC;
