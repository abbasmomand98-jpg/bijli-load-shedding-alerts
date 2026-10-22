// ============================================================
// SAMPLE DATA — invented for this UX concept.
// Every outage schedule, appliance wattage, UPS package, and
// PKR price below is ILLUSTRATIVE SAMPLE DATA for the demo.
// These are NOT real K-Electric/LESCO/etc. schedules and NOT
// real market prices. A real app would pull live feeder data
// and current retailer prices.
// ============================================================

var SAMPLE_NOTE = "Sample data — invented for this UX concept. Outage schedules and UPS prices are illustrative, not real.";

// 8 sample areas, one per city. cuts: today's sample outage
// windows as [start, end] in 24-hour "HH:MM" strings.
var AREAS = [
  {
    id: "gulshan-karachi",
    name: "Gulshan-e-Iqbal",
    city: "Karachi",
    disco: "K-Electric",
    feeder: "Block C feeder",
    cuts: [["09:30", "11:00"], ["15:00", "16:30"], ["19:15", "21:00"]]
  },
  {
    id: "modeltown-lahore",
    name: "Model Town",
    city: "Lahore",
    disco: "LESCO",
    feeder: "Link Road feeder",
    cuts: [["08:00", "09:30"], ["14:00", "15:30"], ["20:00", "21:30"]]
  },
  {
    id: "g9-islamabad",
    name: "G-9",
    city: "Islamabad",
    disco: "IESCO",
    feeder: "Markaz feeder",
    cuts: [["09:00", "10:00"], ["15:30", "16:30"], ["21:00", "22:00"]]
  },
  {
    id: "saddar-peshawar",
    name: "Saddar",
    city: "Peshawar",
    disco: "PESCO",
    feeder: "Cantt feeder",
    cuts: [["07:30", "09:00"], ["13:00", "14:30"], ["19:00", "20:30"]]
  },
  {
    id: "satellite-rwp",
    name: "Satellite Town",
    city: "Rawalpindi",
    disco: "IESCO",
    feeder: "6th Road feeder",
    cuts: [["10:30", "12:00"], ["16:30", "18:00"], ["22:30", "23:30"]]
  },
  {
    id: "satellite-quetta",
    name: "Satellite Town",
    city: "Quetta",
    disco: "QESCO",
    feeder: "Sariab feeder",
    cuts: [["08:30", "10:30"], ["14:30", "16:00"], ["20:30", "22:00"]]
  },
  {
    id: "gulgasht-multan",
    name: "Gulgasht Colony",
    city: "Multan",
    disco: "MEPCO",
    feeder: "Bosan Road feeder",
    cuts: [["09:00", "10:30"], ["15:00", "16:30"], ["21:30", "23:00"]]
  },
  {
    id: "dground-fsd",
    name: "D Ground",
    city: "Faisalabad",
    disco: "FESCO",
    feeder: "People's Colony feeder",
    cuts: [["11:30", "13:00"], ["17:00", "18:30"], ["23:00", "23:59"]]
  }
];

// Common household appliances with typical wattages (sample).
// qty lets a bulb count as multiple units.
var APPLIANCES = [
  { id: "fan",        name: "Ceiling fan",   watts: 75,  qty: 1 },
  { id: "bulb",       name: "LED bulb",      watts: 12,  qty: 4 },
  { id: "tv",         name: "TV",            watts: 150, qty: 1 },
  { id: "fridge",     name: "Fridge",        watts: 200, qty: 1 },
  { id: "laptop",     name: "Laptop",        watts: 65,  qty: 1 },
  { id: "charger",    name: "Phone charger", watts: 18,  qty: 1 },
  { id: "router",     name: "WiFi router",   watts: 15,  qty: 1 },
  { id: "pump",       name: "Water pump",    watts: 500, qty: 1 }
];

// 6 sample UPS/inverter packages (sample PKR pricing).
// ah: total battery amp-hours; volts: system voltage; kva: inverter rating.
var PACKAGES = [
  { id: "p1", name: "UPS 850VA + 1\u00d7100Ah",   kva: 0.85, ah: 100, volts: 12, price: 45000 },
  { id: "p2", name: "UPS 1000VA + 1\u00d7150Ah",  kva: 1.0,  ah: 150, volts: 12, price: 58000 },
  { id: "p3", name: "Inverter 1.5kVA + 2\u00d7100Ah", kva: 1.5, ah: 200, volts: 24, price: 78000 },
  { id: "p4", name: "Inverter 2.5kVA + 2\u00d7150Ah", kva: 2.5, ah: 300, volts: 24, price: 105000 },
  { id: "p5", name: "Inverter 3.5kVA + 4\u00d7100Ah", kva: 3.5, ah: 400, volts: 48, price: 128000 },
  { id: "p6", name: "Hybrid 5kVA + 4\u00d7200Ah",  kva: 5.0,  ah: 800, volts: 48, price: 150000 }
];

// Sample voltage-fluctuation log for the community tab.
var VOLTAGE_LOG = [
  { time: "7:15 PM", volts: 248, band: "High" },
  { time: "7:02 PM", volts: 221, band: "Normal" },
  { time: "6:41 PM", volts: 167, band: "Low" },
  { time: "5:58 PM", volts: 226, band: "Normal" }
];

// Stabilizer guidance per voltage band.
var VOLTAGE_GUIDE = {
  low: "Low voltage (< 180 V): switch heavy appliances off. A stabilizer holds output steady while input sags.",
  normal: "Normal (180\u2013240 V): safe range. Still wise to run the fridge and TV through a stabilizer in winter.",
  high: "High voltage (> 240 V): unplug sensitive electronics until it settles \u2014 spikes fry power supplies."
};

// localStorage keys
var AREA_KEY = "bijli_area_v1";
var REPORTS_KEY = "bijli_reports_v1";

var DATA = {
  SAMPLE_NOTE: SAMPLE_NOTE,
  AREAS: AREAS,
  APPLIANCES: APPLIANCES,
  PACKAGES: PACKAGES,
  VOLTAGE_LOG: VOLTAGE_LOG,
  VOLTAGE_GUIDE: VOLTAGE_GUIDE,
  AREA_KEY: AREA_KEY,
  REPORTS_KEY: REPORTS_KEY
};

if (typeof module !== "undefined") module.exports = DATA;
