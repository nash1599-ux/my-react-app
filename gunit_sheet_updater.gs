/**
 * G-Unit Sales Board updater for YOUR Google Sheet.
 *
 * Open the G-Unit spreadsheet -> Extensions -> Apps Script -> paste this file.
 * Save, then reload the sheet. Use the G-Unit menu.
 *
 * Runs as you. No service-account key. No Cloud Agent secret.
 */

var TARGET_TAB = "G-Unit Board";
var PASTE_TAB = "Paste";
var BLENDED_RATE = 97.5;
var CX_TIERS = [
  [9, 100],
  [7, 75],
  [5, 50],
  [4, 30],
];
var ALIASES = {
  quay: "Jaquay Tyler",
  "quay tyler": "Jaquay Tyler",
  ky: "Kyron Tisdale",
  "ky. tisdale": "Kyron Tisdale",
  "ky tisdale": "Kyron Tisdale",
  "steve nash": "Nashly Paul",
  "steveo ramos": "Ismael Ramos",
  "steve ramos": "Ismael Ramos",
  "shaad hypolite": "Rashaad Hypolite",
  jordan: "Jordan Aguirre",
  "jordan #23": "Jordan Aguirre",
  "jordan 23": "Jordan Aguirre",
  gigi: "Gianna Smith",
  "gigi smith": "Gianna Smith",
  cam: "Cam Winfield",
  "cam winfield": "Cam Winfield",
  "matthew 2": "Matthew 2",
  "matthew²": "Matthew 2",
};
var DAY_ALIASES = {
  mondi: "Monday",
  satdi: "Saturday",
  sat: "Saturday",
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("G-Unit")
    .addItem("Update from Paste tab", "updateFromPasteTab")
    .addItem("Write Saturday board", "writeSaturdayBoard")
    .addToUi();
}

function updateFromPasteTab() {
  var ss = SpreadsheetApp.getActive();
  var paste = ss.getSheetByName(PASTE_TAB);
  if (!paste) {
    paste = ss.insertSheet(PASTE_TAB);
    paste.getRange("A1").setValue(
      "Paste the Slack G-Unit board here, then click G-Unit → Update from Paste tab."
    );
    SpreadsheetApp.getUi().alert(
      "Created a Paste tab. Drop the Slack board there and run this again."
    );
    return;
  }
  var text = paste.getDataRange().getDisplayValues().map(function (row) {
    return row.join(" ");
  }).join("\n");
  var parsed = parseBoard(text);
  if (!parsed.reps.length) {
    throw new Error("No leaderboard rows found on the Paste tab.");
  }
  writeParsedBoard(parsed);
}

function writeSaturdayBoard() {
  writeParsedBoard(
    parseBoard(
      [
        "DG:6/12 |26 NL LEFT | SATDI",
        "1. Matthew Grant 8 App | 4 CX",
        "2. Gigi Smith 7 Apps | 3 CX",
        "3. Steveo Ramos 7 App | 4 CX",
        "4. Ky. Tisdale 6 App | 3 CX",
        "5. Jordan #23 4 App | 2 CX",
        "6. Cam 2 App | 2 CX",
        "7. Shaad Hypolite 2 App | 2 CX",
        "8. Matthew 2 1 App | 1 CX",
        "9. Steve Nash 1 App | 1 CX",
        "10. Leo Chowdury 1 App | 1 CX",
      ].join("\n")
    )
  );
}

function parseBoard(text) {
  var cleaned = String(text || "")
    .replace(/[²]/g, "2")
    .replace(/[³]/g, "3");
  var banner = {};
  var bannerMatch = cleaned.match(/DG:\s*(\d+)\/(\d+)\s*\|\s*(\d+)\s*NL LEFT\s*\|\s*([A-Za-z]+)/i);
  if (bannerMatch) {
    var dayRaw = bannerMatch[4].toLowerCase();
    banner = {
      dgNum: Number(bannerMatch[1]),
      dgDen: Number(bannerMatch[2]),
      nlLeft: Number(bannerMatch[3]),
      day: DAY_ALIASES[dayRaw] || bannerMatch[4],
    };
  }

  var lineRe = /(?:(\d+)\.?\s*)?(?:🥇|🥈|🥉)?\s*([A-Za-z][A-Za-z0-9.#'\-\s\u00B2\u00B3]*?)\s+(\d+)\s*App[s]?\s*\|\s*(\d+)\s*CX/i;
  var reps = [];
  cleaned.split(/\r?\n/).forEach(function (rawLine) {
    var match = rawLine.match(lineRe);
    if (!match) return;
    var displayName = match[2].replace(/\s+/g, " ").trim();
    var apps = Number(match[3]);
    var cx = Number(match[4]);
    var key = displayName.toLowerCase();
    reps.push({
      displayName: displayName,
      name: ALIASES[key] || displayName,
      apps: apps,
      cx: cx,
      notes: cx > apps ? "DATA ERROR: CX exceeds Apps" : "",
    });
  });

  reps.sort(function (a, b) {
    return b.apps - a.apps || b.cx - a.cx || a.name.localeCompare(b.name);
  });
  reps.forEach(function (rep, index) {
    rep.rank = index + 1;
    rep.cxPct = rep.apps ? Math.round((rep.cx / rep.apps) * 100) + "%" : "0%";
    rep.bonus = tierBonus_(rep.cx);
    rep.earned = Math.round(rep.apps * BLENDED_RATE + rep.bonus);
  });
  return { banner: banner, reps: reps };
}

function tierBonus_(cx) {
  for (var i = 0; i < CX_TIERS.length; i++) {
    if (cx >= CX_TIERS[i][0]) return CX_TIERS[i][1];
  }
  return 0;
}

function writeParsedBoard(parsed) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(TARGET_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(TARGET_TAB);
  }
  sheet.clear();

  var banner = parsed.banner || {};
  var reps = parsed.reps || [];
  var apps = 0;
  var cx = 0;
  var earned = 0;
  var rows = [["Rank", "Name", "Apps", "CX", "CX %", "Tier Bonus $", "Est. $", "Notes"]];
  reps.forEach(function (rep) {
    apps += rep.apps;
    cx += rep.cx;
    earned += rep.earned;
    rows.push([
      rep.rank,
      rep.displayName,
      rep.apps,
      rep.cx,
      rep.cxPct,
      rep.bonus,
      rep.earned,
      rep.notes,
    ]);
  });
  rows.push(["", "TOTALS", apps, cx, apps ? Math.round((cx / apps) * 100) + "%" : "0%", "", earned, ""]);
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);

  sheet.getRange("I1:L1").setValues([
    [
      banner.dgNum != null ? "DG " + banner.dgNum + "/" + banner.dgDen : "",
      banner.nlLeft != null ? banner.nlLeft + " NL Left" : "",
      banner.day || "",
      Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd"),
    ],
  ]);
  sheet.getRange("I2").setValue("Last synced from Slack paste in this spreadsheet");
  SpreadsheetApp.flush();
}
