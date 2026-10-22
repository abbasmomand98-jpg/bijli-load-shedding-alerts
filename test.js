// ============================================================
// test.js — plain node assert, no npm packages.
// Deterministic: data.js contains no Math.random; every value
// is written out explicitly.
// Run: node test.js
// ============================================================

var assert = require("assert");
var DATA = require("./data.js");
var L = require("./logic.js");

var n = 0;
function eq(actual, expected, msg) {
  n++;
  assert.strictEqual(actual, expected, msg);
}
function ok(value, msg) {
  n++;
  assert.ok(value, msg);
}
function approx(actual, expected, tol, msg) {
  n++;
  assert.ok(Math.abs(actual - expected) <= tol, msg + " (got " + actual + ")");
}

// Gulshan-e-Iqbal sample cuts: 09:30-11:00, 15:00-16:30, 19:15-21:00
var AREA = DATA.AREAS[0];

// ---------------- time parsing / formatting ----------------
eq(L.parseTime("19:15"), 1155, "parse 19:15");
eq(L.parseTime("00:30"), 30, "parse 00:30");
eq(L.parseTime("12:00"), 720, "parse 12:00");
eq(L.formatTime(1155), "7:15 PM", "format 1155");
eq(L.formatTime(30), "12:30 AM", "format 30");
eq(L.formatTime(720), "12:00 PM", "format 720");
eq(L.formatTime(0), "12:00 AM", "format midnight");
eq(L.formatTime(1470), "12:30 AM", "format wraps past midnight");
eq(L.formatDur(105), "1 hr 45 min", "dur 105");
eq(L.formatDur(60), "1 hr", "dur 60");
eq(L.formatDur(30), "30 min", "dur 30");
eq(L.formatDur(120), "2 hr", "dur 120");
eq(L.countdownText(1110, 1155), "in 45 min", "countdown 45 min");
eq(L.countdownText(1100, 1300), "in 3 hr 20 min", "countdown 3h20");

// ---------------- outage status ----------------
var s1 = L.currentStatus(AREA, 1110); // 6:30 PM
eq(s1.inOutage, false, "6:30 PM not in outage");
eq(s1.nextCutMin, 1155, "next cut 7:15 PM");
var s2 = L.currentStatus(AREA, 1160); // 7:20 PM
eq(s2.inOutage, true, "7:20 PM in outage");
eq(s2.restoreMin, 1260, "restores 9:00 PM");
var s3 = L.currentStatus(AREA, 60); // 1:00 AM
eq(s3.inOutage, false, "1 AM not in outage");
eq(s3.nextCutMin, 570, "next cut 9:30 AM");
var s4 = L.currentStatus(AREA, 1300); // 9:40 PM, all cuts done
eq(s4.inOutage, false, "9:40 PM not in outage");
eq(s4.nextCutMin, 570 + 1440, "next cut is tomorrow's first");
eq(L.currentStatus(AREA, 1155).inOutage, true, "cut start is inclusive");
eq(L.currentStatus(AREA, 1260).inOutage, false, "cut end is exclusive");

// ---------------- wattage math ----------------
eq(L.totalWatts(["fan", "bulb", "tv", "router"], DATA.APPLIANCES), 288, "288 W default set");
eq(L.totalWatts([], DATA.APPLIANCES), 0, "nothing selected = 0 W");
eq(L.totalWatts(["fan", "bulb", "tv", "fridge", "laptop", "charger", "router", "pump"], DATA.APPLIANCES),
   1071, "all appliances = 1071 W");
eq(L.totalWatts(["bulb"], DATA.APPLIANCES), 48, "bulb qty counts as 4");
eq(L.energyWh(288, 3), 864, "864 Wh for 3 hrs");
eq(L.energyWh(0, 5), 0, "zero load = zero energy");

// ---------------- package runtime math ----------------
var P3 = DATA.PACKAGES[2]; // Inverter 1.5kVA + 2x100Ah @24V
eq(L.usableWh(P3), 200 * 24 * 0.5 * 0.85, "usable Wh = Ah*V*DOD*EFF");
approx(L.runtimeHours(288, P3), 7.08, 0.01, "p3 runs 288 W ~7.1 hrs");
eq(L.runtimeHours(0, P3), 0, "zero load = zero runtime");

// ---------------- recommendation ----------------
var r1 = L.recommendPackage(288, 3, DATA.PACKAGES);
eq(r1.id, "p3", "288 W / 3 h -> cheapest adequate is p3");
var r2 = L.recommendPackage(1071, 3, DATA.PACKAGES);
eq(r2.id, "p5", "1071 W / 3 h -> p5 (p4 too short on runtime)");
var r3 = L.recommendPackage(100, 1, DATA.PACKAGES);
eq(r3.id, "p1", "tiny load -> cheapest p1");
eq(L.recommendPackage(5000, 8, DATA.PACKAGES), null, "huge load -> no package fits");

// ---------------- voltage verdicts ----------------
eq(L.voltageVerdict(248), "High", "248 V high");
eq(L.voltageVerdict(167), "Low", "167 V low");
eq(L.voltageVerdict(221), "Normal", "221 V normal");
eq(L.voltageVerdict(180), "Normal", "180 V boundary normal");
eq(L.voltageVerdict(240), "Normal", "240 V boundary normal");
eq(L.voltageVerdict(179), "Low", "179 V low");
eq(L.voltageVerdict(241), "High", "241 V high");

// ---------------- PKR formatting ----------------
eq(L.formatPKR(78000), "Rs 78,000", "78k formatting");
eq(L.formatPKR(45000), "Rs 45,000", "45k formatting");
eq(L.formatPKR(150000), "Rs 150,000", "150k formatting");

// ---------------- report counting ----------------
var b1 = L.bumpReports({}, "gulshan-karachi", "2026-10-22");
eq(b1.count, 1, "first report = 1");
var b2 = L.bumpReports(b1.map, "gulshan-karachi", "2026-10-22");
eq(b2.count, 2, "second report = 2");
eq(b1.map["gulshan-karachi:2026-10-22"], 1, "bump does not mutate input map");
eq(L.dayKey(new Date(2026, 9, 22)), "2026-10-22", "day key format");

// ---------------- data sanity ----------------
eq(DATA.AREAS.length, 8, "eight areas");
var cities = {};
DATA.AREAS.forEach(function (a) { cities[a.city] = true; });
eq(Object.keys(cities).length, 8, "eight distinct cities");
ok(DATA.AREAS.every(function (a) { return a.cuts.length === 3; }), "every area has 3 cuts");
eq(DATA.APPLIANCES.length, 8, "eight appliances");
eq(DATA.PACKAGES.length, 6, "six packages");
ok(DATA.PACKAGES.every(function (p, i, arr) {
  return i === 0 || arr[i - 1].price <= p.price;
}), "packages sorted by price ascending");
ok(/sample/i.test(DATA.SAMPLE_NOTE), "sample note present");
ok(DATA.VOLTAGE_LOG.every(function (v) {
  return L.voltageVerdict(v.volts) === v.band;
}), "voltage log bands match verdicts");

console.log("PASS: " + n + "/" + n + " assertions");
