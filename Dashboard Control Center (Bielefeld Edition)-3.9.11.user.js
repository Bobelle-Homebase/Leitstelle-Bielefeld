// ==UserScript==
// @name               Dashboard Control Center (Bielefeld Edition)
// @namespace          https://leitstellenspiel.de/bielefeld
// @version            3.9.15
// @license            Design by Bobelle
// @author             Design by Bobelle (Mod by User, cleaned by ChatGPT)
// @description        V3.9.15-clean: Pat/Gef/Betreuung (Blau blinkend), Alarme (Rot blinkend), Fzg (Status-Farben).
// @match              https://www.leitstellenspiel.de/*
// @match              https://leitstellenspiel.de/*
// @match              https://www.missionchief.com/*
// @match              https://missionchief.com/*
// @match              https://www.meldkamerspel.com/*
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM_addStyle
// @run-at             document-idle
// ==/UserScript==

(() => {
  "use strict";

  // =========================================================================
  // 0) Gruppen
  // =========================================================================
  const GROUP_LOGISTICS = ["Betreuung/Versorgung", "Patienten", "Gefangene"];

  const GROUP_ALARMS = [
    //"FFW Vollalarm",
    //"SEG Vollalarm",
    //"THW Vollalarm",
    //"AB Vollalarm",
    //"Katastrophenalarm Bielefeld",
    //"BergRett Vollalarm",
    //"SeeRett Vollalarm",
    //"WasserRett Vollalarm",
    //"ABC Vollalarm",
  ];

  // =========================================================================
  // 1) Konstanten / Mapping
  // =========================================================================
  const TYPE_ID_MAPPING = {
    0: ["LF 20", "HLF 20", "HLF 10", "LF 10", "LF 16-TS", "LF 8/6"],
    1: ["LF 10"],
    2: ["DLK"],
    3: ["ELW 1"],
    4: ["RW"],
    5: ["GW Atemschutz"],
    6: ["LF 8/6"],
    7: ["LF 20/16", "LF 20"],
    8: ["LF 10/6", "LF 10"],
    9: ["LF 16-TS"],
    10: ["GW Oel/Umwelt"],
    11: ["GW Messtechnik"],
    12: ["GW Gefahrgut"],
    13: ["SW 1000"],
    14: ["SW 2000"],
    15: ["SW 2000-Tr"],
    16: ["SW KatS"],
    17: ["TLF 20/40"],
    18: ["TLF 16/25"],
    19: ["TLF 16/24-Tr"],
    20: ["TLF 16/45"],
    21: ["TLF 3000"],
    22: ["TLF 4000"],
    23: ["TLF 20/40-SL"],
    24: ["WLF"],
    25: ["AB Rüstmittel"],
    26: ["AB Atemschutz"],
    27: ["AB Oel/Umwelt"],
    28: ["RTW"],
    29: ["NEF"],
    30: ["HLF 10"],
    31: ["RTH"],
    32: ["LPol FuStW"],
    33: ["PolHub"],
    34: ["ELW 2"],
    35: ["BP WaWe"],
    36: ["AB Schlauch"],
    37: ["AB Einsatzleitung"],
    38: ["KTW"],
    39: ["THW GKW"],
    40: ["THW MTW-TZ"],
    41: ["THW MzGW (FGr N)"],
    42: ["THW LKW K 9"],
    43: ["Dekon-P"],
    44: ["AB Dekon-P"],
    45: ["FwK"],
    46: ["HLF 20"],
    50: ["GruKw"],
    51: ["AB Gefahrgut"],
    52: ["AB Löschmittel"],
    53: ["Dekon-P"],
    54: ["GefKw"],
    55: ["FüKw"],
    56: ["Polizeimotorrad", "LPol Krad"],
    57: ["FwK"],
    58: ["KdoW LNA"],
    59: ["KdoW OrgL", "SEG ELW"],
    60: ["GRTW"],
    61: ["LPol Krad"],
    63: ["GW Messtechnik"],
    64: ["GW Gefahrgut"],
    69: ["GW Höhenrettung"],
    72: ["KdoW LNA"],
    73: ["KdoW OrgL"],
    74: ["NAW"],
    75: ["FLF"],
    76: ["Rettungstreppe"],
    79: ["SEK ZF"],
    80: ["SEK MTF"],
    81: ["MEK ZF"],
    82: ["MEK MTF"],
    83: ["GW Werkfeuerwehr"],
    84: ["ULF mit Löscharm"],
    85: ["TM50"],
    86: ["Turbolöscher"],
    87: ["TLF 4000"],
    91: ["SEG GW San"],
    93: ["SEG KTW Typ-B"],
    96: ["SEG GW Bt"],
    97: ["IRTW"],
    100: ["THW FüKW"],
    101: ["THW LKW 7 Lbw (FGr WP)"],
    102: ["THW LKW 7 Lbw (FGr Log-V)"],
    103: ["THW Tauchkraftwagen"],
    104: ["THW MLW 4"],
    105: ["THW MLW 5"],
    106: ["THW FmKW"],
    107: ["THW MLKW 7 Lkr 19 tm"],
    108: ["THW MTW-OV"],
    109: ["THW MTW-Tr UL"],
    110: ["THW MTW-FGr K"],
    111: ["THW MTW-FGr Log-V"],
    112: ["THW Anh DLE"],
    113: ["THW Anh SwPu"],
    114: ["THW Anh Hund"],
    115: ["THW Anh SchlB"],
    116: ["THW Anh 12 Lbw (FGr Log-V)"],
    117: ["THW Anh FüLa"],
  };

  const MISSION_SELECTORS = {
    emergency: "#mission_select_emergency",
    ktp: "#mission_select_krankentransport",
    started: "#mission_select_started",
  };

  const ICONS = { patient: "👨‍🍼", prisoner: "👮", alarm: "🚨", refresh: "🔄" };

  const STORAGE = {
    COUNTS_TODAY: "fz_v7_counts_today",
    COUNTS_TOTAL: "fz_v7_counts_total",
    DETAILS_TODAY: "fz_v7_details",
    YDAY_COUNTS: "fz_v7_yday",
    DAYSTAMP: "fz_v7_daystamp",
    UISETTINGS: "fz_final_ui_settings_v6_0",
    SYNC_SIGNAL: "fz_v7_sync_signal_ls",
  };

  const CFG = { zIndex: 99999 };

  const STATUS_INFO = {
    1: { title: "Status 1: Frei auf Wache", color: "#28a745" },
    2: { title: "Status 2: Frei auf Funk", color: "#80c792" },
    3: { title: "Status 3: Anfahrt zum Einsatz", color: "#ffc107" },
    4: { title: "Status 4: An Einsatzstelle", color: "#dc3545" },
    5: { title: "Status 5: Sprechwunsch", color: "#17a2b8" },
    6: { title: "Status 6: Nicht einsatzbereit", color: "#6c757d" },
    7: { title: "Status 7: Patient an Bord", color: "#007bff" },
    8: { title: "Status 8: Am Transportziel", color: "#6f42c1" },
  };

  // Defaults (Design/Position)
  const DEFAULTS = {
    columns: 6,
    autoHideSeconds: 30,
    clickIncrement: 1,
    compactMode: false,
    winMaxHeight: 750,
    winTop: 60,
    winLeft: 5,
    winBg: "#f8f9fa",
    winBorderC: "#e9ecef",
    winBorderW: 1,
    winRadius: 0,
    headBg: "#dce1e0", // Titelbar-Farbe
    headColor: "#343a40",
    headSize: 15,
    headAlign: "left",
    colBg: "#e9ecef",
    colColor: "#495057",
    colSize: 11,
    colAlign: "left",
    rowBg: "#ffffff",
    rowColor: "#212529",
    rowSize: 11,
    rowAlign: "left",
    numTodayColor: "#28a745",
    numTodaySize: 15,
    numYdayColor: "#6c757d",
    numYdaySize: 12,
    numAlign: "right",
    tileSortOrder: "category", // "category" | "alphabetical"
  };

  const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // Hauptseite erkennen
  const path = window.location.pathname;
  const isMainPage =
    document.getElementById("mission_list") !== null &&
    (path === "/" || path === "/index" || path.length < 2);

  // =========================================================================
  // 2) Kacheldefinitionen
  //    -> Aufgeräumt: removed unused filters (activeCategoryFilter/searchFilter)
  // =========================================================================
  const CATEGORY_ORDER = [
    "FW",
    "RD",
    "POL",
    "THW",
    "SEG",
    "WerkFW",
    "FlugFW",
    "Drohne",
    "Wasser/Berg",
    "Netz",
    "Kat",
    "Sonstiges",
  ];
  const categoryOrderMap = new Map(CATEGORY_ORDER.map((cat, i) => [cat, i]));

  // Roh-Definition
  const AAO_TILES_RAW = [
    // FW
    { n: "ELW 1", c: "#FF0000", s: ["elw1", "einsatzleitwagen1"], cat: "FW" },
    { n: "ELW 2", c: "#FF0000", s: ["elw2", "einsatzleitwagen2"], cat: "FW" },
    { n: "HLF 20", c: "#FF0000", s: ["hlf20", "hlf10", "hilfeleistungs", "hlf"], cat: "FW" },
    { n: "LF 20", c: "#FF0000", s: ["lf20", "lf10", "lf16", "lf8", "löschgruppenfahrzeug", "lf"], cat: "FW" },
    { n: "DLK", c: "#FF0000", s: ["dlk", "drehleiter"], cat: "FW" },
    { n: "RW", c: "#FF0000", s: ["rw", "rüstwagen"], cat: "FW" },
    { n: "TLF", c: "#FF0000", s: ["tlf", "tanklösch", "tlf4000", "tlf3000"], cat: "FW" },
    { n: "Tankwagen", c: "#FF0000", s: ["tankwagen"], cat: "FW" },
    { n: "Kleintankwagen", c: "#FF0000", s: ["kleintankwagen", "tankwagen", "tlf2000"], cat: "FW" },
    { n: "GTLF", c: "#FF0000", s: ["gtlf"], cat: "FW" },
    { n: "PTLF", c: "#FF0000", s: ["ptlf", "pulver", "ptlf4000"], cat: "FW" },
    { n: "FwK", c: "#FF0000", s: ["fwk", "kran", "feuerwehrkran"], cat: "FW" },
    { n: "Dekon-P", c: "#FF0000", s: ["dekon", "dekonp"], cat: "FW" },
    { n: "MTW Mannschaft", c: "#FF0000", s: ["mtw", "mannschaft"], cat: "FW" },
    { n: "MTW Verpflegung", c: "#FF0000", s: ["mtw", "verpflegung"], cat: "FW" },
    { n: "SLF", c: "#FF0000", s: ["slf", "sonderlöschfahrzeug", "sonderlösch"], cat: "FW" },
    { n: "WLF", c: "#FF0000", s: ["wlf", "wechsellader"], cat: "FW" },
    { n: "GW Atemschutz", c: "#FF0000", s: ["atemschutz", "gwa"], cat: "FW" },
    { n: "GW Gefahrgut", c: "#FF0000", s: ["gefahrgut", "gwg"], cat: "FW" },
    { n: "GW Höhenrettung", c: "#FF0000", s: ["höhen", "gwh"], cat: "FW" },
    { n: "GW L-1", c: "#FF0000", s: ["gwl1", "logistik1"], cat: "FW" },
    { n: "GW L-2 Logistik", c: "#FF0000", s: ["gwl2", "logistik2"], cat: "FW" },
    { n: "GW L-2 Wasser", c: "#FF0000", s: ["gwl2", "schlauchwagen", "sw1000", "sw2000", "swkats", "sw"], cat: "FW" },
    { n: "GW Messtechnik", c: "#FF0000", s: ["mess", "gwmess"], cat: "FW" },
    { n: "GW Oel/Umwelt", c: "#FF0000", s: ["oel", "öl", "umwelt", "gwo"], cat: "FW" },
    { n: "GW Schlauch", c: "#FF0000", s: ["schlauch", "gws"], cat: "FW" },
    { n: "GW Lüfter", c: "#FF0000", s: ["lüfter", "gwlüfter"], cat: "FW" },
    { n: "GW Verpflegung", c: "#FF0000", s: ["gw", "verpflegung", "gwverpflegung"], cat: "FW" },

    { n: "AB Atemschutz", c: "#FF0000", s: ["abatemschutz", "aba"], cat: "FW" },
    { n: "AB Dekon-P", c: "#FF0000", s: ["abdekon"], cat: "FW" },
    { n: "AB Einsatzleitung", c: "#FF0000", s: ["abeinsatz", "abelw"], cat: "FW" },
    { n: "AB Gefahrgut", c: "#FF0000", s: ["abgefahr"], cat: "FW" },
    { n: "AB Küche", c: "#FF0000", s: ["abküche"], cat: "FW" },
    { n: "AB Logistik", c: "#FF0000", s: ["ablogistik"], cat: "FW" },
    { n: "AB Löschmittel", c: "#FF0000", s: ["ablösch"], cat: "FW" },
    { n: "AB Lüfter", c: "#FF0000", s: ["ablüfter"], cat: "FW" },
    { n: "AB MZB", c: "#FF0000", s: ["abmzb", "abboot"], cat: "FW" },
    { n: "AB Rüstmittel", c: "#FF0000", s: ["abrüst"], cat: "FW" },
    { n: "AB NEA200", c: "#FF0000", s: ["abnea"], cat: "FW" },
    { n: "AB NEA50", c: "#FF0000", s: ["abnea50"], cat: "FW" },
    { n: "AB Oel/Umwelt", c: "#FF0000", s: ["aboel", "aböl"], cat: "FW" },
    { n: "AB Schiene", c: "#FF0000", s: ["abschiene"], cat: "FW" },
    { n: "AB Schlauch", c: "#FF0000", s: ["abschlauch"], cat: "FW" },
    { n: "AB Sonderlöschmittel", c: "#FF0000", s: ["absonderlösch"], cat: "FW" },
    { n: "AB Tank", c: "#FF0000", s: ["abtank"], cat: "FW" },
    { n: "AB Wasser/Schaum", c: "#FF0000", s: ["abwasser"], cat: "FW" },
    { n: "Anh Lüfter", c: "#FF0000", s: ["anhlüfter", "lüfter", "anh"], cat: "FW" },
    { n: "Anh Sonderlöschmittel", c: "#FF0000", s: ["anhsonderlöschmittel", "sonderlöschmittel", "anh"], cat: "FW" },

    // Werkfeuerwehr
    { n: "GW Werkfeuerwehr", c: "#D44444", s: ["werkfeuerwehr"], cat: "WerkFW" },
    { n: "TM50", c: "#D44444", s: ["tm50", "teleskop"], cat: "WerkFW" },
    { n: "Turbolöscher", c: "#D44444", s: ["turbo"], cat: "WerkFW" },
    { n: "ULF mit Löscharm", c: "#D44444", s: ["ulf", "löscharm"], cat: "WerkFW" },

    // Flughafenfeuerwehr
    { n: "FLF", c: "#D44444", s: ["flf", "flugfeldlöschfahrzeug"], cat: "FlugFW" },
    { n: "Rettungtreppe", c: "#D44444", s: ["rettungtreppe"], cat: "FlugFW" },

    // FW allgemein
    { n: "HLF Schiene", c: "#D44444", s: ["hlfschiene"], cat: "FW" },
    { n: "RW Schiene", c: "#D44444", s: ["rwschiene"], cat: "FW" },

    // RD
    { n: "KTW", c: "#FF9D0A", s: ["ktw", "kranken"], cat: "RD" },
    { n: "NEF", c: "#FF9D0A", s: ["nef", "notarzt"], cat: "RD" },
    { n: "NAW", c: "#FF9D0A", s: ["naw"], cat: "RD" },
    { n: "RTW", c: "#FF9D0A", s: ["rtw", "rettungswagen"], cat: "RD" },
    { n: "IRTW", c: "#FF9D0A", s: ["irtw", "itw", "intensiv"], cat: "RD" },
    { n: "RTH", c: "#FF9D0A", s: ["rth", "hubschrauber", "christoph", "sar"], cat: "RD" },
    { n: "RTH mit Winde", c: "#FF9D0A", s: ["winde"], cat: "RD" },
    { n: "GRTW", c: "#FF9D0A", s: ["grtw", "großraum"], cat: "RD" },
    { n: "GRTW (3 Pat.mit NA)", c: "#FF9D0A", s: ["grtw3"], cat: "RD" },
    { n: "GRTW (7 Pat.ohne NA)", c: "#FF9D0A", s: ["grtw7"], cat: "RD" },
    { n: "KdoW LNA", c: "#FF9D0A", s: ["lna", "leitender"], cat: "RD" },
    { n: "KdoW OrgL", c: "#FF9D0A", s: ["orgl", "organisatorischer"], cat: "RD" },

    // POL
    { n: "LPol FuStW", c: "#54B509", s: ["fustw", "lpol", "funkstreifenwagen", "streifenwagen"], cat: "POL" },
    { n: "LPol FuStW DGL", c: "#54B509", s: ["dgl"], cat: "POL" },
    { n: "LPol FuStW Zivil", c: "#54B509", s: ["zivil"], cat: "POL" },
    { n: "LPol Krad", c: "#54B509", s: ["krad", "motorrad"], cat: "POL" },
    { n: "LPol LauKw", c: "#54B509", s: ["laukw"], cat: "POL" },
    { n: "PolHub", c: "#54B509", s: ["polhub", "hubschrauber"], cat: "POL" },
    { n: "PolHub mit Winde", c: "#54B509", s: ["winde"], cat: "POL" },
    { n: "MEK MTF", c: "#54B509", s: ["mekmtf", "mek mtf", "mtf"], cat: "POL" },
    { n: "MEK ZF", c: "#54B509", s: ["mekzf", "mek zf", "zf"], cat: "POL" },
    { n: "SEK MTF", c: "#54B509", s: ["sekmtf", "sek mtf", "mtf"], cat: "POL" },
    { n: "SEK ZF", c: "#54B509", s: ["sekzf", "sek zf", "zf"], cat: "POL" },
    { n: "BP DHuFüKW", c: "#54B509", s: ["dhufükw"], cat: "POL" },
    { n: "BP FüKW", c: "#54B509", s: ["fükw"], cat: "POL" },
    { n: "BP GefKw", c: "#54B509", s: ["gefkw"], cat: "POL" },
    { n: "BP GruKw", c: "#54B509", s: ["grukw"], cat: "POL" },
    { n: "BP LeBefKw", c: "#54B509", s: ["lebefkw"], cat: "POL" },
    { n: "BP WaWe", c: "#54B509", s: ["wawe", "wasserwerfer"], cat: "POL" },
    { n: "Außenlastbehälter", c: "#54B509", s: ["außenlast"], cat: "POL" },
    { n: "BP Zugfahrzeug Pferdetransport", c: "#54B509", s: ["pferdetransport", "zugfahrzeugpferdetransport"], cat: "POL" },
    { n: "BP Pferdetransporter groß", c: "#54B509", s: ["pferdetransport", "pferdetransportgroß"], cat: "POL" },
    { n: "BP Pferdetransporter klein", c: "#54B509", s: ["pferdetransport", "pferdetransportklein"], cat: "POL" },
    { n: "BP Anh Pferdetransport", c: "#54B509", s: ["pferdetransport", "anhpferdetransport"], cat: "POL" },

    // THW
    { n: "Schmutzwasserpumpen", c: "#0571FF", s: ["schmutz"], cat: "THW" },
    { n: "THW BRmG R", c: "#0571FF", s: ["brmg"], cat: "THW" },
    { n: "THW GKW", c: "#0571FF", s: ["gkw", "gerätekraftwagen"], cat: "THW" },
    { n: "THW LKW 7 Lbw (FGr WP)", c: "#0571FF", s: ["lkw7"], cat: "THW" },
    { n: "THW FüKW", c: "#0571FF", s: ["fükw"], cat: "THW" },
    { n: "THW LKW 7 Lbw (FGr Log-V)", c: "#0571FF", s: ["lkw7"], cat: "THW" },
    { n: "THW Tauchkraftwagen", c: "#0571FF", s: ["tauch"], cat: "THW" },
    { n: "THW LKW K 9", c: "#0571FF", s: ["kipper", "lkwk9"], cat: "THW" },
    { n: "THW MLW 4", c: "#0571FF", s: ["mlw4"], cat: "THW" },
    { n: "THW MLW 5", c: "#0571FF", s: ["mlw5"], cat: "THW" },
    { n: "THW MzGW (FGr N)", c: "#0571FF", s: ["mzgw", "mzkw"], cat: "THW" },
    { n: "THW FmKW", c: "#0571FF", s: ["fmkw"], cat: "THW" },
    { n: "THW MLKW 7 Lkr 19 tm", c: "#0571FF", s: ["mlkw"], cat: "THW" },
    { n: "THW MTW-TZ", c: "#0571FF", s: ["mtwtz"], cat: "THW" },
    { n: "THW MTW-OV", c: "#0571FF", s: ["mtwov"], cat: "THW" },
    { n: "THW MTW-Tr UL", c: "#0571FF", s: ["mtwtr"], cat: "THW" },
    { n: "THW MTW-FGr K", c: "#0571FF", s: ["mtwfgrk"], cat: "THW" },
    { n: "THW MTW-FGr Log-V", c: "#0571FF", s: ["mtwfgrlogv"], cat: "THW" },
    { n: "THW Anh DLE", c: "#0571FF", s: ["dle"], cat: "THW" },
    { n: "THW Anh SwPu", c: "#0571FF", s: ["swpu"], cat: "THW" },
    { n: "THW Anh Hund", c: "#0571FF", s: ["hund"], cat: "THW" },
    { n: "THW Anh SchlB", c: "#0571FF", s: ["schlb"], cat: "THW" },
    { n: "THW Anh 12 Lbw (FGr Log-V)", c: "#0571FF", s: ["anh12lbw"], cat: "THW" },
    { n: "THW Anh FüLa", c: "#0571FF", s: ["füla"], cat: "THW" },

    // SEG
    { n: "SEG Rettungshundefahrzeug", c: "#FFD7A8", s: ["hund"], cat: "SEG" },
    { n: "KTW Typ-B", c: "#FFD7A8", s: ["ktwb", "ktw b", "seg ktw"], cat: "SEG" },
    { n: "SEG GW San", c: "#FFD7A8", s: ["gwsan"], cat: "SEG" },
    { n: "SEG ELW", c: "#FFD7A8", s: ["segelw"], cat: "SEG" },
    { n: "SEG GW UAS", c: "#FFD7A8", s: ["gwuas"], cat: "SEG" },
    { n: "SEG Bt Kombi", c: "#FFD7A8", s: ["btkombi"], cat: "SEG" },
    { n: "SEG Bt LKW", c: "#FFD7A8", s: ["btlkw"], cat: "SEG" },
    { n: "SEG Anh FKH", c: "#FFD7A8", s: ["anhfkh"], cat: "SEG" },
    { n: "SEG GW Bt", c: "#FFD7A8", s: ["gwbt"], cat: "SEG" },
    { n: "SEG Anh TeSi", c: "#FFD7A8", s: ["tesi"], cat: "SEG" },
    { n: "SEG GW TeSi", c: "#FFD7A8", s: ["gwtesi"], cat: "SEG" },
    { n: "SEG LKW Technik", c: "#FFD7A8", s: ["lkwtechnik"], cat: "SEG" },
    { n: "SEG MTW TeSi", c: "#FFD7A8", s: ["mtwtesi"], cat: "SEG" },
    { n: "SEG GW Wasserrettung", c: "#FFD7A8", s: ["wasserrettung"], cat: "SEG" },
    { n: "SEG GW Taucher", c: "#FFD7A8", s: ["taucher"], cat: "SEG" },
    { n: "SEG MZB", c: "#FFD7A8", s: ["mzb", "boot"], cat: "SEG" },

    // Drohne
    { n: "ELW 2 Drohne", c: "#CCCCCC", s: ["drohne"], cat: "Drohne" },
    { n: "ELW Drohne", c: "#CCCCCC", s: ["drohne"], cat: "Drohne" },
    { n: "MTF Drohne", c: "#CCCCCC", s: ["drohne"], cat: "Drohne" },

    // Wasser/Berg
    { n: "GW Taucher", c: "#8CBAFF", s: ["taucher"], cat: "Wasser/Berg" },
    { n: "GW Wasserrettung", c: "#8CBAFF", s: ["wasserrettung"], cat: "Wasser/Berg" },
    { n: "MZB", c: "#8CBAFF", s: ["mzb", "boot"], cat: "Wasser/Berg" },
    { n: "Seenotrettungsboot", c: "#8CBAFF", s: ["seenot"], cat: "Wasser/Berg" },
    { n: "Seenotrettungskreuzer", c: "#8CBAFF", s: ["seenot"], cat: "Wasser/Berg" },
    { n: "SAR mit Winde", c: "#8CBAFF", s: ["sar", "winde"], cat: "Wasser/Berg" },
    { n: "GW Bergrettung", c: "#B0AC97", s: ["bergrettung", "bergwacht"], cat: "Wasser/Berg" },
    { n: "GW Bergrettung NEF)", c: "#B0AC97", s: ["bergrettungnef"], cat: "Wasser/Berg" },
    { n: "ATV", c: "#B0AC97", s: ["atv"], cat: "Wasser/Berg" },
    { n: "Anh Höhenrettung", c: "#B0AC97", s: ["höhenrettung"], cat: "Wasser/Berg" },
    { n: "ELW Bergrettung", c: "#B0AC97", s: ["elwbergrettung"], cat: "Wasser/Berg" },
    { n: "Schneefahrzeug", c: "#B0AC97", s: ["schnee"], cat: "Wasser/Berg" },

    // Sonstiges (noStatus)
    {
      n: "Patienten",
      c: "#000000",
      i: ICONS.patient,
      cat: "Sonstiges",
      s: ["patienten", "patiententransport", "krankenhaus", "transportziel", "klinik", "abliefern", "abgegeben", "patientanbord"],
      noStatus: true,
    },
    {
      n: "Gefangene",
      c: "#000000",
      i: ICONS.prisoner,
      cat: "Sonstiges",
      s: ["gefangene", "gefangenentransport", "polizeizelle", "justizvollzugsanstalt", "jva", "haft", "zelle", "gewahrsam", "sheriff"],
      noStatus: true,
    },
    {
      n: "Betreuung/Versorgung",
      c: "#000000",
      cat: "Sonstiges",
      s: ["betreuung", "versorgung", "verpflegung", "bt", "küche"],
      noStatus: true,
    },

    // Netz
    { n: "NEA50 (Beliebige HiOrg)", c: "#FFD7A8", s: ["nea50", "netz"], cat: "Netz" },
    { n: "NEA200 (Beliebige HiOrg)", c: "#0571FF", s: ["nea200", "netz"], cat: "Netz" },
    { n: "Anh NEA50", c: "#0571FF", s: ["anhnea50", "netz"], cat: "Netz" },
    { n: "Anh NEA200", c: "#0571FF", s: ["anhnea200", "netz"], cat: "Netz" },
  ].sort(
    (a, b) =>
      b.n.length + (b.s || []).join("").length - (a.n.length + (a.s || []).join("").length)
  );

  // Precomputed tile lists/maps
  const TILE_LIST = AAO_TILES_RAW.map((t) => ({
    ...t,
    norm: normalize(t.n),
    search: (t.s || []).map(normalize),
  }));
  const KEYS = AAO_TILES_RAW.map((t) => t.n);
  const tileMetaByKey = Object.fromEntries(AAO_TILES_RAW.map((t) => [t.n, t]));

  // =========================================================================
  // 3) Storage/State
  // =========================================================================
  const json = {
    load(key, fallback) {
      try {
        const value = GM_getValue(key, "");
        if (value === "") return fallback;
        const parsed = JSON.parse(value);
        return parsed !== null ? parsed : fallback;
      } catch (e) {
        console.error(`DCC: Error loading key "${key}"`, e);
        return fallback;
      }
    },
    save(key, val) {
      try {
        GM_setValue(key, JSON.stringify(val));
      } catch (e) {
        console.error(`DCC: Error saving key "${key}"`, e);
      }
    },
  };

  const store = {
    loadCounts(key) {
      const o = json.load(key, {});
      for (const k of KEYS) if (o[k] == null) o[k] = 0;
      return o;
    },
    save(key, val) {
      json.save(key, val);
    },
    sendSignal() {
      localStorage.setItem(STORAGE.SYNC_SIGNAL, Date.now().toString());
    },
  };

  let uiSettings = { ...DEFAULTS, ...json.load(STORAGE.UISETTINGS, {}) };
  for (const k in DEFAULTS) if (uiSettings[k] === undefined) uiSettings[k] = DEFAULTS[k];
  const saveUI = () => json.save(STORAGE.UISETTINGS, uiSettings);

  const getTodayString = () => new Date().toLocaleDateString("de-DE");

  let state = {
    today: store.loadCounts(STORAGE.COUNTS_TODAY),
    total: store.loadCounts(STORAGE.COUNTS_TOTAL),
    yday: store.loadCounts(STORAGE.YDAY_COUNTS),
    det: json.load(STORAGE.DETAILS_TODAY, {}),
  };

  // Availability
  let vehicleAvailability = {};
  let vehicleExists = {};
  let lastUpdateTime = "";

  // =========================================================================
  // 4) Mission Stats Helpers
  // =========================================================================
  function parseTwoNumbers(text) {
    const m = (text || "").match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) return { a: 0, b: 0 };
    return { a: parseInt(m[1], 10), b: parseInt(m[2], 10) };
  }

  function getCounts(sel) {
    const el = document.querySelector(sel);
    if (!el) return { a: 0, b: 0 };
    return parseTwoNumbers(el.textContent);
  }

  function getStartedCount(sel) {
    const el = document.querySelector(sel);
    if (!el) return 0;
    const c = el.querySelector(".counter");
    const txt = (c ? c.textContent : el.textContent) || "0";
    const m = txt.replace(/\s+/g, "").match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function getMissionStatsHTML() {
    const em = getCounts(MISSION_SELECTORS.emergency);
    const ktp = getCounts(MISSION_SELECTORS.ktp);
    const started = getStartedCount(MISSION_SELECTORS.started);

    return `
      <div style="display:flex; gap:15px; font-size:13px; font-weight:bold; color:#000000; align-items:center;">
        <span>Eigene Einsätze: ${em.a}/${em.b}</span>
        <span>KTW: ${ktp.a}/${ktp.b}</span>
        <span style="${started > 0 ? "color:#cc0000;" : ""}">Im Einsatz: ${started}</span>
      </div>
    `;
  }

  // =========================================================================
  // 5) Tages-Reset
  // =========================================================================
  function checkVehicleDayReset() {
    const today = getTodayString();
    if (GM_getValue(STORAGE.DAYSTAMP, "") === today) return false;

    console.log("DCC: Performing daily reset for vehicle counts.");
    const oldToday = store.loadCounts(STORAGE.COUNTS_TODAY);

    store.save(STORAGE.YDAY_COUNTS, oldToday);
    store.save(STORAGE.COUNTS_TODAY, {});
    json.save(STORAGE.DETAILS_TODAY, {});
    GM_setValue(STORAGE.DAYSTAMP, today);

    // update in-memory
    state.today = {};
    state.yday = oldToday;
    state.det = {};
    return true;
  }

  // =========================================================================
  // 6) Matching (Klick -> Tile)
  // =========================================================================
  function identifyClick(el) {
    if (!el) return null;
    const rawText = normalize(
      (el.textContent || "") +
        " " +
        (el.title || "") +
        " " +
        (el.getAttribute("aria-label") || "") +
        " " +
        (el.value || "") +
        " " +
        (el.getAttribute("search_attribute") || "")
    );

    let best = null;
    let bestLen = -1;

    for (const t of TILE_LIST) {
      if (t.norm && rawText.includes(t.norm) && t.norm.length > bestLen) {
        best = t.n;
        bestLen = t.norm.length;
      }
      for (const sTerm of t.search) {
        if (sTerm && rawText.includes(sTerm) && sTerm.length > bestLen) {
          best = t.n;
          bestLen = sTerm.length;
        }
      }
    }
    return best;
  }

  // =========================================================================
  // 7) UI / Tiles / CSS
  // =========================================================================
  let fzWrapper = null;
  let uiRoot = null;
  let tileEls = {};

  // important: redrawGrid is used from multiple places -> global function ref
  let redrawGrid = () => {};

  let animFrameId = null,
    hideStartTime = null,
    hideDuration = 0,
    safeHideTimer = null,
    isHovering = false;

  // dragging state
  let vKeyPressed = false;
  let isDragging = false;
  let dragStartX = 0,
    dragStartY = 0;
  let dragStartLeft = 0,
    dragStartTop = 0;

  function injectCSS() {
    GM_addStyle(`
      :root{
        --fz-mh:${uiSettings.winMaxHeight}px; --fz-t:${uiSettings.winTop}px; --fz-l:${uiSettings.winLeft}px;
        --fz-bg:${uiSettings.winBg}; --fz-bc:${uiSettings.winBorderC};
        --fz-bw:${uiSettings.winBorderW}px; --fz-br:${uiSettings.winRadius}px;
        --fz-h-bg:${uiSettings.headBg}; --fz-h-c:${uiSettings.headColor};
        --fz-h-s:${uiSettings.headSize}px; --fz-h-a:${uiSettings.headAlign};
        --fz-c-bg:${uiSettings.colBg}; --fz-c-c:${uiSettings.colColor};
        --fz-c-s:${uiSettings.colSize}px; --fz-c-a:${uiSettings.colAlign};
        --fz-r-bg:${uiSettings.rowBg}; --fz-r-c:${uiSettings.rowColor};
        --fz-r-s:${uiSettings.rowSize}px; --fz-r-a:${uiSettings.rowAlign};
        --fz-nt-c:${uiSettings.numTodayColor}; --fz-nt-s:${uiSettings.numTodaySize}px;
        --fz-ny-c:${uiSettings.numYdayColor}; --fz-ny-s:${uiSettings.numYdaySize}px;
        --fz-nb-j:${uiSettings.numAlign === "right" ? "space-between" : "flex-start"};
      }

      .fzWrapper{
        position:fixed; z-index:${CFG.zIndex};
        top:var(--fz-t); left:var(--fz-l);
        display:flex; flex-direction:column;
        background:var(--fz-bg);
        border:var(--fz-bw) solid var(--fz-bc);
        border-radius:0 0 var(--fz-br) var(--fz-br);
        box-shadow:0 10px 30px rgba(0,0,0,0.5);
        transition: opacity 0.4s ease-out;
      }
      .fzWrapper.fzHidden{ opacity:0; pointer-events:none; }

      .fzHeader{
        background:var(--fz-h-bg); color:var(--fz-h-c);
        padding:6px 10px;
        display:flex; justify-content:space-between; align-items:flex-start;
        user-select:none; font-family:sans-serif;
        cursor:default;
      }
      .fzHeader .left-section{ flex:1; display:flex; flex-direction:column; align-items:flex-start; gap:5px; }
      .fzHeader .right-section{ display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
      .fzHeader .right-section-top-row{ display:flex; align-items:center; justify-content:flex-end; gap:15px; }
      .fzHeader .branding-group{ display:flex; align-items:center; }
      .fzHeader .branding-text{ text-align:right; line-height:1.1; white-space:nowrap; }
      .fzHeader .logo-link{ margin-left:10px; display:flex; align-items:center; }

      .fzMissionStats{ font-size:13px; font-weight:bold; color:#000000; }
      .fzMissionStats span{ white-space:nowrap; }

      .fzTimerContainer{ width:100%; height:5px; background:#e0e0e0; border-radius:2px; overflow:hidden; }
      #fzTimerFill{ height:100%; width:100%; background:#5cb85c; transition: background-color 0.5s ease; }

      #fzAvailIndicator{
        font-size:12px; font-weight:bold; padding:2px 8px;
        border:2px solid; border-radius:6px;
        cursor:pointer; user-select:none; white-space:nowrap;
        flex-shrink:0;
      }
      #fzAvailIndicator:hover{ filter:brightness(1.1); }

      .fzHeadBtn{ cursor:pointer; font-size:16px; color:#000; transition:transform 0.2s ease-in-out; }
      .fzHeadBtn:hover{ transform:scale(1.2); }

      #fzRelocatedButtons{
        display:flex; gap:15px; margin-top:5px;
        flex-wrap:wrap; justify-content:flex-end; align-items:center;
      }

      .fzLastUpdate{ font-size:10px; color:#6c757d; white-space:nowrap; flex-shrink:0; }

      .fzScrollArea{ max-height:var(--fz-mh); overflow-y:auto; background:#fff; position:relative; }
      .fzGrid{
        display:grid; grid-template-columns:repeat(${uiSettings.columns}, 1fr);
        gap:0; background:#ccc;
        border-top:1px solid #ccc; border-left:1px solid #ccc;
      }

      .fzColHeader{
        background:var(--fz-c-bg); color:var(--fz-c-c);
        font-weight:bold; font-size:var(--fz-c-s);
        text-align:var(--fz-c-a);
        padding:4px 6px;
        border-bottom:1px solid #ccc; border-right:1px solid #ccc;
      }

      .fzTile{
        position:relative;
        display:flex; justify-content:var(--fz-nb-j); align-items:center;
        padding:3px 6px 3px 10px;
        height:25px;
        border-left:5px solid transparent;
        border-right:1px solid #ccc; border-bottom:1px solid #ccc;
        gap:8px;
        font-family:sans-serif;
        cursor:pointer; user-select:none;
      }
      .fzTile:hover{ filter:brightness(0.95); }

      .fzWrapper.fzCompact .fzTile[data-val="0"]{ display:none; }

      .fzTileName{
        color:var(--fz-r-c);
        font-size:var(--fz-r-s);
        text-align:var(--fz-r-a);
        font-weight:bold;
        overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
        flex:1;
      }
      .fzTileIcon{ font-size:18px; margin-right:5px; vertical-align:middle; line-height:1; }
      .fzTileCount{
        background:rgba(0,0,0,0.05);
        padding:1px 5px; border-radius:3px;
        min-width:30px; text-align:right; white-space:nowrap;
        display:flex; align-items:baseline; gap:3px;
      }
      .fzNumToday{ font-weight:bold; color:var(--fz-nt-c); font-size:var(--fz-nt-s); }
      .fzNumYday{ font-weight:normal; color:var(--fz-ny-c); font-size:var(--fz-ny-s); }

      .fzBtn{
        background:#f5f5f5; border:1px solid #ccc; border-radius:4px;
        cursor:pointer; padding:4px 8px;
        font-weight:bold; color:#333;
        text-align:center; font-size:13px;
        transition: background-color 0.2s;
      }
      .fzBtn:hover{ background:#e0e0e0; }

      .fzModalOverlay{
        position:fixed; inset:0;
        background:rgba(0,0,0,0.5);
        z-index:100001;
        display:flex; justify-content:center; align-items:center;
      }
      .fzModal{
        background:#fff; padding:20px;
        border-radius:8px; width:520px; max-width:90%;
        max-height:90vh; overflow:auto;
        box-shadow:0 10px 30px rgba(0,0,0,0.5);
        font-family:sans-serif; font-size:13px;
      }
      .fzModal h3{
        margin-top:0; color:#333; font-size:18px;
        border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;
      }
      .fzSetGroup{ margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; }
      .fzSetGroup:last-of-type{ border-bottom:none; margin-bottom:0; }

      .fzRow{ display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #f9f9f9; }
      .fzRow:last-of-type{ border-bottom:none; }

      .fzInput{ width:80px; padding:2px; border:1px solid #ccc; border-radius:3px; text-align:right; }
      .fzColor{ width:40px; height:20px; border:none; padding:0; cursor:pointer; }

      .fzTriggerZone{ position:fixed; bottom:0; left:0; width:80px; height:80px; z-index:100000; background:transparent; }

      .fzStatusList{ display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; justify-content:flex-start; }
      .fzStatusItem{
        font-size:11px; font-weight:bold;
        padding:1px 6px; border-radius:5px;
        color:#fff; background-color:#333;
        cursor:pointer; transition:filter 0.2s;
        white-space:nowrap;
      }
      .fzStatusItem:hover{ filter:brightness(1.2); }

      @keyframes fzFlashRedSlow{
        0%,100%{ background-color:#ffcccc; transform:scale(1); }
        50%{ background-color:#ff3333; color:white; transform:scale(1.05); }
      }
      @keyframes fzFlashBlueSlow{
        0%,100%{ background-color:#cce5ff; transform:scale(1); }
        50%{ background-color:#007bff; color:white; transform:scale(1.05); }
      }
      .fzBlinkRed{
        animation: fzFlashRedSlow 1s ease-in-out 20;
        z-index:9999; position:relative;
        box-shadow:0 0 5px red;
      }
      .fzBlinkBlue{
        animation: fzFlashBlueSlow 1s ease-in-out 20;
        z-index:9999; position:relative;
        box-shadow:0 0 5px blue;
      }
    `);
  }

  function updateStyles() {
    const r = document.documentElement.style;
    const s = uiSettings;

    const vars = {
      "--fz-mh": s.winMaxHeight + "px",
      "--fz-t": s.winTop + "px",
      "--fz-l": s.winLeft + "px",
      "--fz-bg": s.winBg,
      "--fz-bc": s.winBorderC,
      "--fz-bw": s.winBorderW + "px",
      "--fz-br": s.winRadius + "px",
      "--fz-h-bg": s.headBg,
      "--fz-h-c": s.headColor,
      "--fz-h-s": s.headSize + "px",
      "--fz-h-a": s.headAlign,
      "--fz-c-bg": s.colBg,
      "--fz-c-c": s.colColor,
      "--fz-c-s": s.colSize + "px",
      "--fz-c-a": s.colAlign,
      "--fz-r-bg": s.rowBg,
      "--fz-r-c": s.rowColor,
      "--fz-r-s": s.rowSize + "px",
      "--fz-r-a": s.rowAlign,
      "--fz-nt-c": s.numTodayColor,
      "--fz-nt-s": s.numTodaySize + "px",
      "--fz-ny-c": s.numYdayColor,
      "--fz-ny-s": s.numYdaySize + "px",
      "--fz-nb-j": s.numAlign === "right" ? "space-between" : "flex-start",
    };

    for (const k in vars) r.setProperty(k, vars[k]);

    if (uiRoot) uiRoot.style.gridTemplateColumns = `repeat(${s.columns}, 1fr)`;
    if (typeof redrawGrid === "function") redrawGrid();
  }

  function triggerAlarmBlink(key) {
    const el = tileEls[key];
    if (!el) return;

    el.classList.remove("fzBlinkRed", "fzBlinkBlue");
    void el.offsetWidth; // reflow

    if (GROUP_ALARMS.includes(key)) {
      el.classList.add("fzBlinkRed");
      el.addEventListener("animationend", () => el.classList.remove("fzBlinkRed"), { once: true });
    } else if (GROUP_LOGISTICS.includes(key)) {
      el.classList.add("fzBlinkBlue");
      el.addEventListener("animationend", () => el.classList.remove("fzBlinkBlue"), { once: true });
    }
  }

  function updateTile(key) {
    const el = tileEls[key];
    if (!el) return;

    const meta = tileMetaByKey[key];
    const v = state.today[key] || 0;
    const y = state.yday[key] || 0;

    el.dataset.val = v;
    const countEl = el.querySelector(".fzTileCount");
    if (countEl) countEl.innerHTML = `<span class="fzNumToday">${v}</span><span class="fzNumYday">(${y})</span>`;

    // SPECIAL GROUPS: logistics
    if (GROUP_LOGISTICS.includes(key)) {
      if (v > 0) {
        el.style.backgroundColor = "#cce5ff";
        el.style.color = "#000";
      } else {
        el.style.backgroundColor = "#e6e6e6";
        el.style.color = "#888";
      }
      return;
    }

    // SPECIAL GROUPS: alarms
    if (GROUP_ALARMS.includes(key)) {
      if (v > 0) {
        el.style.backgroundColor = "#ffcccc";
        el.style.color = "#000";
      } else {
        el.style.backgroundColor = "#e6e6e6";
        el.style.color = "#888";
      }
      return;
    }

    // noStatus tiles -> always default style
    if (meta?.noStatus) {
      el.style.backgroundColor = uiSettings.rowBg;
      el.style.color = uiSettings.rowColor;
      return;
    }

    const exists = vehicleExists[key] === true;
    const isAvail = vehicleAvailability[key] === true;

    if (isAvail) {
      el.style.backgroundColor = "#cfefd4"; // grün
      el.style.color = "#000";
    } else if (exists) {
      el.style.backgroundColor = "#ffeeba"; // orange
      el.style.color = "#000";
    } else {
      el.style.backgroundColor = "#e6e6e6"; // grau
      el.style.color = "#888";
    }
  }

  function createTile(key) {
    const meta = tileMetaByKey[key];
    if (!meta) return null;

    const v = state.today[key] || 0;
    const y = state.yday[key] || 0;
    const iconHtml = meta.i ? `<span class="fzTileIcon">${meta.i}</span>` : "";

    const div = document.createElement("div");
    div.className = "fzTile";
    div.dataset.key = key;
    div.dataset.val = v;
    div.style.borderLeftColor = meta.c || "#888";
    div.style.backgroundColor = uiSettings.rowBg;
    div.style.color = uiSettings.rowColor;

    div.insertAdjacentHTML(
      "beforeend",
      `<div style="display:flex;align-items:center;flex:1;overflow:hidden;">${iconHtml}<span class="fzTileName">${key}</span></div>
       <span class="fzTileCount"><span class="fzNumToday">${v}</span><span class="fzNumYday">(${y})</span></span>`
    );

    div.onclick = () => showDetails(key);

    tileEls[key] = div;
    return div;
  }

  function showDetails(key) {
    const data = state.det[key] || {};
    const list =
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([n, c]) => `<div class="fzRow"><span>${n}</span><b>${c}</b></div>`)
        .join("") || "<div style='padding:10px;text-align:center;color:#999'>Keine detaillierten Daten für heute.</div>";

    const ol = document.createElement("div");
    ol.className = "fzModalOverlay";
    ol.onclick = (e) => {
      if (e.target === ol) ol.remove();
    };

    ol.innerHTML = `
      <div class="fzModal">
        <h3>${key} (Heute)</h3>
        <div style="max-height: 400px; overflow-y: auto;">${list}</div>
        <button class="fzBtn" style="margin-top:15px;width:100%" onclick="this.closest('.fzModalOverlay').remove()">Schließen</button>
      </div>
    `;
    document.body.appendChild(ol);
  }

  function showKataAlert() {
    const ol = document.createElement("div");
    ol.className = "fzModalOverlay";
    ol.onclick = (e) => {
      if (e.target === ol) ol.remove();
    };

    ol.innerHTML = `
      <div class="fzModal" style="text-align:center; border: 4px solid red;">
        <h2 style="color:red; margin-top:0;">Katastrophenalarm Bielefeld</h2>
        <div style="font-size:18px; line-height:1.5; font-weight:bold; margin:20px 0;">
          Alle Rettungsmittel und Einsatzfahrzeuge sind alarmiert und befinden sich auf Anfahrt
        </div>
        <div style="color:#666; font-size:12px;">(Fenster schließt in 5 Sekunden)</div>
      </div>
    `;
    document.body.appendChild(ol);
    setTimeout(() => ol.remove(), 5000);
  }

  function toggleCompactMode() {
    uiSettings.compactMode = !uiSettings.compactMode;
    saveUI();
    if (fzWrapper) fzWrapper.classList.toggle("fzCompact", uiSettings.compactMode);
  }

  function exportSettings() {
    const dataStr = JSON.stringify(uiSettings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dcc_settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportStatsCSV() {
    const todayData = state.today;
    let csvContent = "data:text/csv;charset=utf-8,Fahrzeug;Anzahl_Heute\n";
    for (const k of KEYS) {
      const count = todayData[k] || 0;
      if (count > 0) csvContent += `${k};${count}\n`;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dcc_fahrzeuge_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function importSettings() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loadedData = JSON.parse(ev.target.result);
          uiSettings = { ...DEFAULTS, ...loadedData };
          saveUI();
          alert("Einstellungen geladen! Seite wird neu geladen.");
          window.location.reload();
        } catch (err) {
          alert("Fehler beim Laden der Datei: " + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function openSortSettingsModal() {
    const ol = document.createElement("div");
    ol.className = "fzModalOverlay";
    ol.onclick = (e) => {
      if (e.target === ol) ol.remove();
    };

    const modal = document.createElement("div");
    modal.className = "fzModal";
    modal.innerHTML = `
      <h3>Kachel-Sortierung</h3>
      <div class="fzSetGroup">
        <div class="fzRow">
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="radio" name="sortOrder" value="category" style="margin:0;"> Nach Kategorie (FW, RD, POL, etc.)
          </label>
        </div>
        <div class="fzRow">
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="radio" name="sortOrder" value="alphabetical" style="margin:0;"> Alphabetisch (A-Z)
          </label>
        </div>
      </div>
      <button class="fzBtn" style="margin-top:15px;width:100%" onclick="this.closest('.fzModalOverlay').remove()">Schließen</button>
    `;

    const radios = modal.querySelectorAll('input[name="sortOrder"]');
    radios.forEach((radio) => {
      radio.checked = radio.value === uiSettings.tileSortOrder;
      radio.onchange = (e) => {
        uiSettings.tileSortOrder = e.target.value;
        saveUI();
        updateStyles();
        ol.remove();
      };
    });

    ol.appendChild(modal);
    document.body.appendChild(ol);
  }

  function openSettings() {
    const ol = document.createElement("div");
    ol.className = "fzModalOverlay";

    const modal = document.createElement("div");
    modal.className = "fzModal";
    modal.innerHTML = `<h3>Einstellungen</h3>`;

    const createInput = (label, key, type = "text", opts = []) => {
      const row = document.createElement("div");
      row.className = "fzRow";
      row.innerHTML = `<span>${label}</span>`;

      let inp;
      if (type === "select") {
        inp = document.createElement("select");
        for (const o of opts) {
          const opt = document.createElement("option");
          opt.value = o;
          opt.textContent = o === "category" ? "Nach Kategorie" : "Alphabetisch";
          if (uiSettings[key] === o) opt.selected = true;
          inp.appendChild(opt);
        }
      } else {
        inp = document.createElement("input");
        inp.type = type;
        inp.value = uiSettings[key];
        inp.className = type === "color" ? "fzColor" : "fzInput";
      }

      inp.onchange = (e) => {
        let val = e.target.value;
        if (type === "number") val = parseInt(val, 10);
        uiSettings[key] = val;
        saveUI();
        updateStyles();
      };

      row.appendChild(inp);
      return row;
    };

    const group = (title) => {
      const d = document.createElement("div");
      d.className = "fzSetGroup";
      d.innerHTML = `<h4>${title}</h4>`;
      return d;
    };

    const groups = [
      {
        t: "Fenster Layout",
        i: [
          ["Max Höhe", "winMaxHeight", "number"],
          ["Oben", "winTop", "number"],
          ["Links", "winLeft", "number"],
          ["BG", "winBg", "color"],
          ["Rahmen", "winBorderC", "color"],
          ["Dicke", "winBorderW", "number"],
          ["Radius", "winRadius", "number"],
        ],
      },
      {
        t: "Kachelkopf",
        i: [
          ["BG", "colBg", "color"],
          ["Farbe", "colColor", "color"],
          ["Größe", "colSize", "number"],
          ["Ausrichtung", "colAlign", "select", ["left", "center", "right"]],
        ],
      },
      {
        t: "Fahrzeugkacheln",
        i: [
          ["BG", "rowBg", "color"],
          ["Farbe", "rowColor", "color"],
          ["Größe", "rowSize", "number"],
          ["Ausrichtung", "rowAlign", "select", ["left", "center", "right"]],
        ],
      },
      {
        t: "Zahlenanzeige",
        i: [
          ["Heute Farbe", "numTodayColor", "color"],
          ["Heute Größe", "numTodaySize", "number"],
          ["Gestern Farbe", "numYdayColor", "color"],
          ["Gestern Größe", "numYdaySize", "number"],
          ["Ausrichtung", "numAlign", "select", ["left", "right"]],
        ],
      },
      {
        t: "Verhalten",
        i: [
          ["Einblendzeit (s)", "autoHideSeconds", "number"],
          ["Klicks pro Aktion", "clickIncrement", "number"],
          ["Spaltenanzahl", "columns", "number"],
          ["Sortierung", "tileSortOrder", "select", ["category", "alphabetical"]],
        ],
      },
    ];

    for (const g of groups) {
      const d = group(g.t);
      for (const item of g.i) d.appendChild(createInput(item[0], item[1], item[2], item[3]));
      modal.appendChild(d);
    }

    const footer = document.createElement("div");
    footer.style.marginTop = "15px";
    footer.style.display = "flex";
    footer.style.gap = "10px";
    footer.style.alignItems = "center";

    const btnSave = document.createElement("button");
    btnSave.className = "fzBtn";
    btnSave.textContent = "💾 Exportieren";
    btnSave.onclick = exportSettings;

    const btnLoad = document.createElement("button");
    btnLoad.className = "fzBtn";
    btnLoad.textContent = "📂 Importieren";
    btnLoad.onclick = importSettings;

    const btnCsv = document.createElement("button");
    btnCsv.className = "fzBtn";
    btnCsv.textContent = "📊 CSV Export";
    btnCsv.onclick = exportStatsCSV;

    const spacer = document.createElement("div");
    spacer.style.flex = "1";

    const btnClose = document.createElement("button");
    btnClose.className = "fzBtn";
    btnClose.textContent = "Schließen";
    btnClose.onclick = () => ol.remove();

    footer.append(btnSave, btnLoad, btnCsv, spacer, btnClose);
    modal.appendChild(footer);

    ol.appendChild(modal);
    ol.onclick = (e) => {
      if (e.target === ol) ol.remove();
    };
    document.body.appendChild(ol);
  }

  // Auto-hide countdown
  function startCountdown() {
    if (!fzWrapper) return;

    isHovering = false;
    if (safeHideTimer) clearTimeout(safeHideTimer);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const bar = document.getElementById("fzTimerFill");
    hideDuration = uiSettings.autoHideSeconds * 1000;
    hideStartTime = Date.now();

    const loop = () => {
      if (isHovering) return;
      const elapsed = Date.now() - hideStartTime;
      const remaining = Math.max(0, hideDuration - elapsed);
      const pct = (remaining / hideDuration) * 100;

      if (bar) {
        bar.style.width = pct + "%";
        bar.style.backgroundColor = pct <= 15 ? "#dc3545" : pct <= 50 ? "#ffc107" : "#28a745";
      }

      if (remaining > 0) animFrameId = requestAnimationFrame(loop);
      else fzWrapper.classList.add("fzHidden");
    };

    animFrameId = requestAnimationFrame(loop);

    safeHideTimer = setTimeout(() => {
      if (!isHovering) {
        fzWrapper.classList.add("fzHidden");
        if (animFrameId) cancelAnimationFrame(animFrameId);
      }
    }, hideDuration);
  }

  function resetCountdown() {
    isHovering = true;
    if (safeHideTimer) clearTimeout(safeHideTimer);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const bar = document.getElementById("fzTimerFill");
    if (bar) {
      bar.style.width = "100%";
      bar.style.backgroundColor = "#28a745";
    }
  }

  function initUI() {
    if (fzWrapper || !isMainPage) return;

    injectCSS();

    // Trigger-Zone (unten links)
    const trigger = document.createElement("div");
    trigger.className = "fzTriggerZone";
    trigger.onmouseenter = () => {
      resetCountdown();
      if (fzWrapper) fzWrapper.classList.remove("fzHidden");
    };
    document.body.appendChild(trigger);

    fzWrapper = document.createElement("div");
    fzWrapper.className = "fzWrapper";
    if (uiSettings.compactMode) fzWrapper.classList.add("fzCompact");

    fzWrapper.onmouseleave = startCountdown;
    fzWrapper.onmouseenter = () => {
      resetCountdown();
      fzWrapper.classList.remove("fzHidden");
    };

    const fzHeader = document.createElement("div");
    fzHeader.className = "fzHeader";

    const rankEl = document.getElementById("current_level");
    const rankText = rankEl ? rankEl.textContent.trim() : "";

    fzHeader.innerHTML = `
      <div class="left-section">
        <div id="fzMissionStats" class="fzMissionStats">${getMissionStatsHTML()}</div>
        <div style="font-size:9px; color:#000000; line-height:1; margin-bottom:1px;">Verbleibende Zeit</div>
        <div class="fzTimerContainer"><div id="fzTimerFill"></div></div>
        <div id="fzStatusList" class="fzStatusList"></div>
      </div>

      <div class="right-section">
        <div class="right-section-top-row">
          <div class="fzLastUpdate" id="fzLastUpdate">Letztes Update: --:--:--</div>
          <span class="fzHeadBtn" id="fzRefreshButton" title="Fahrzeugstatus aktualisieren" style="font-size:14px;">${ICONS.refresh}</span>
          <span id="fzAvailIndicator" title="Klicken, um Details zur Fahrzeugverfügbarkeit zu sehen">✓ - • ⧗ - • ✗ -</span>
          <div class="branding-group">
            <div class="branding-text">
              <div style="font-weight:bold; font-size:15px; color:#000000; user-select:none;">Leitstelle Bielefeld</div>
              ${rankText ? `<div style="font-size:10px; color:#444;">${rankText}</div>` : ""}
            </div>
            <a href="https://feuerwehr-bielefeld.de/" target="_blank" class="logo-link">
              <img src="https://feuerwehr-bielefeld.de/wp-content/uploads/2019/05/cropped-Feuerwehr-Bielefeld-Logo-1.png"
                   style="height:35px; width:auto;" alt="Feuerwehr Bielefeld Logo">
            </a>
          </div>
        </div>
        <div id="fzRelocatedButtons">
          <span class="fzHeadBtn" id="fzToggleCompact" title="Leere Zeilen ein-/ausblenden">👁️</span>
          <span class="fzHeadBtn" id="fzStationButton" title="Leitstelle">🏠</span>
          <span class="fzHeadBtn" id="fzMapButton" title="Leitstellenübersicht">🗺️</span>
          <span class="fzHeadBtn" id="fzSchoolButton" title="Schulen">🎓</span>
          <span class="fzHeadBtn" id="fzSortButton" title="Sortieroptionen">⇅</span>
          <span class="fzHeadBtn" id="fzSettingsButton" title="Einstellungen">⚙</span>
          <span class="fzHeadBtn" id="fzMinimizeButton" title="Dashboard minimieren">─</span>
        </div>
      </div>
    `;
    fzWrapper.appendChild(fzHeader);

    // Dragging (V + Mouse)
    fzHeader.addEventListener("mousedown", (e) => {
      if (!vKeyPressed) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartLeft = uiSettings.winLeft;
      dragStartTop = uiSettings.winTop;
      e.preventDefault();
      document.body.style.cursor = "move";
    });

    // Buttons
    setTimeout(() => {
      document.getElementById("fzAvailIndicator").onclick = showMissingAvailabilityModal;
      document.getElementById("fzRefreshButton").onclick = updateAvailability;
      document.getElementById("fzSortButton").onclick = openSortSettingsModal;
      document.getElementById("fzToggleCompact").onclick = toggleCompactMode;
      document.getElementById("fzMinimizeButton").onclick = (e) => {
        e.stopPropagation();
        fzWrapper.classList.add("fzHidden");
      };
      document.getElementById("fzSettingsButton").onclick = openSettings;
      document.getElementById("fzStationButton").onclick = () => window.open("/buildings/26017007", "_blank");
      document.getElementById("fzMapButton").onclick = () => window.open("/leitstellenansicht", "_blank");
      document.getElementById("fzSchoolButton").onclick = () => window.open("/buildings/26017007#tab_schooling", "_blank");

      renderAvailabilityIndicator();
    }, 50);

    // Mission stats refresh
    setInterval(() => {
      const statsEl = document.getElementById("fzMissionStats");
      if (statsEl) statsEl.innerHTML = getMissionStatsHTML();
    }, 3000);

    // Grid
    const scrollArea = document.createElement("div");
    scrollArea.className = "fzScrollArea";

    uiRoot = document.createElement("div");
    uiRoot.className = "fzGrid";

    redrawGrid = () => {
      uiRoot.innerHTML = "";
      tileEls = {};

      // headers
      for (let i = 0; i < uiSettings.columns; i++) {
        const h = document.createElement("div");
        h.className = "fzColHeader";
        h.textContent = "Fahrzeuge Heute/Gestern";
        uiRoot.appendChild(h);
      }

      // sort
      let sortedTiles = [...TILE_LIST];
      if (uiSettings.tileSortOrder === "alphabetical") {
        sortedTiles.sort((a, b) => a.n.localeCompare(b.n));
      } else {
        sortedTiles.sort((a, b) => {
          const orderA = categoryOrderMap.get(a.cat || "Sonstiges") ?? 999;
          const orderB = categoryOrderMap.get(b.cat || "Sonstiges") ?? 999;
          if (orderA !== orderB) return orderA - orderB;
          return a.n.localeCompare(b.n);
        });
      }

      for (const t of sortedTiles) {
        const tile = createTile(t.n);
        if (tile) uiRoot.appendChild(tile);
      }

      for (const k of KEYS) updateTile(k);
    };

    redrawGrid();

    scrollArea.appendChild(uiRoot);
    fzWrapper.appendChild(scrollArea);
    document.body.appendChild(fzWrapper);

    startCountdown();
  }

  // =========================================================================
  // 8) Availability + Status Counters + Modals
  // =========================================================================
  function getAvailabilitySummary() {
    const notAvailButExist = KEYS.filter((k) => vehicleExists[k] === true && vehicleAvailability[k] !== true);
    const notExist = KEYS.filter((k) => vehicleExists[k] !== true);
    const green = KEYS.filter((k) => vehicleAvailability[k] === true).length;

    return {
      total: KEYS.length,
      green,
      orange: notAvailButExist.length,
      red: notExist.length,
      notAvailButExist,
      notExist,
    };
  }

  function renderAvailabilityIndicator() {
    const el = document.getElementById("fzAvailIndicator");
    if (!el) return;

    const s = getAvailabilitySummary();
    el.textContent = `✓ ${s.green}  •  ⧗ ${s.orange}  •  ✗ ${s.red}`;

    if (s.red === 0 && s.orange === 0) {
      el.style.color = "#1a7f37";
      el.style.borderColor = "#1a7f37";
      el.title = "Alle Fahrzeuge/Kategorien sind verfügbar (grün)";
    } else if (s.red === 0 && s.orange > 0) {
      el.style.color = "#8a6d3b";
      el.style.borderColor = "#f0ad4e";
      el.title = `Fahrzeuge im Einsatz oder nicht verfügbar: ${s.orange} – klicken für Liste`;
    } else {
      el.style.color = "#b00020";
      el.style.borderColor = "#b00020";
      el.title = `Fahrzeuge nicht vorhanden: ${s.red}, nicht verfügbar: ${s.orange} – klicken für Liste`;
    }
  }

  function showMissingAvailabilityModal() {
    const s = getAvailabilitySummary();

    const section = (title, arr, color) => {
      const body = arr.length
        ? arr.map((k) => `<div class="fzRow"><span>${k}</span><b style="color:${color};">${title}</b></div>`).join("")
        : `<div style="padding:10px;text-align:center;color:#999;">Keine</div>`;
      return `<h4 style="margin:12px 0 6px 0;">${title} (${arr.length})</h4>${body}`;
    };

    const ol = document.createElement("div");
    ol.className = "fzModalOverlay";
    ol.onclick = (e) => {
      if (e.target === ol) ol.remove();
    };

    ol.innerHTML = `
      <div class="fzModal" style="max-width: 520px; width: 90%;">
        <h3>Verfügbarkeitsdetails</h3>
        <div style="margin-bottom:10px;color:#666;">
          Grün (verfügbar): <b>${s.green}</b> /
          Orange (existiert, aber nicht FMS 1/2): <b>${s.orange}</b> /
          Rot (nicht vorhanden/kein Match): <b>${s.red}</b>
        </div>
        ${section("Im Einsatz / nicht verfügbar", s.notAvailButExist, "#8a6d3b")}
        ${section("Nicht vorhanden / kein Match", s.notExist, "#b00020")}
        <button class="fzBtn" style="margin-top:15px;width:100%" onclick="this.closest('.fzModalOverlay').remove()">Schließen</button>
      </div>
    `;
    document.body.appendChild(ol);
  }

  function showFmsDetailsModal(status, vehicleList) {
    const info = STATUS_INFO[status];
    if (!info) return;

    const statusDescription = info.title.split(":")[1] ? info.title.split(":")[1].trim() : "";

    const vehicleHtml =
      vehicleList.length > 0
        ? vehicleList
            .slice()
            .sort()
            .map((name) => `<div class="fzRow"><span>${name}</span></div>`)
            .join("")
        : `<div style="padding:10px;text-align:center;color:#999">Keine Fahrzeuge in diesem Status.</div>`;

    const ol = document.createElement("div");
    ol.className = "fzModalOverlay";
    ol.onclick = (e) => {
      if (e.target === ol) ol.remove();
    };

    ol.innerHTML = `
      <div class="fzModal" style="width: 400px;">
        <h3 style="display:flex; align-items:center; gap:10px;">
          <span style="background-color:${info.color}; color:white; padding:3px 8px; border-radius:5px;">Status ${status}</span>
          ${statusDescription}
        </h3>
        <div style="max-height: 400px; overflow-y: auto;">${vehicleHtml}</div>
        <button class="fzBtn" style="margin-top:15px;width:100%" onclick="this.closest('.fzModalOverlay').remove()">Schließen</button>
      </div>
    `;
    document.body.appendChild(ol);
  }

  function renderStatusCounters(statusVehicleLists) {
    const container = document.getElementById("fzStatusList");
    if (!container) return;

    container.innerHTML = "";
    const sortedStatusKeys = Object.keys(statusVehicleLists).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    for (const statusStr of sortedStatusKeys) {
      const status = parseInt(statusStr, 10);
      const list = statusVehicleLists[status] || [];
      const count = list.length;
      if (count <= 0) continue;

      const info = STATUS_INFO[status];
      if (!info) continue;

      const item = document.createElement("div");
      item.className = "fzStatusItem";
      item.textContent = `${status}: ${count}`;
      item.style.backgroundColor = info.color;
      item.title = info.title;
      item.onclick = () => showFmsDetailsModal(status, list);
      container.appendChild(item);
    }
  }

  async function updateAvailability() {
    if (!isMainPage) return;

    // reset
    for (const k of KEYS) {
      vehicleAvailability[k] = false;
      vehicleExists[k] = false;
    }

    const statusVehicleLists = {};
    for (let i = 1; i <= 8; i++) statusVehicleLists[i] = [];

    let vehicles = [];
    try {
      const response = await fetch("/api/vehicles", { credentials: "same-origin" });
      if (!response.ok) {
        console.error("DCC: Failed to fetch vehicles:", response.status, response.statusText);
        return;
      }
      vehicles = await response.json();
      if (!Array.isArray(vehicles)) {
        console.error("DCC: API response for vehicles is not an array:", vehicles);
        return;
      }
    } catch (e) {
      console.warn("DCC: FZ Availability Check failed:", e);
      return;
    }

    const setExist = (k) => {
      if (tileMetaByKey[k]) vehicleExists[k] = true;
    };
    const setAvail = (k) => {
      if (tileMetaByKey[k]) vehicleAvailability[k] = true;
    };

    for (const v of vehicles) {
      const typeId = v.vehicle_type_id ?? v.vehicle_type ?? null;
      const vNameCustom = normalize(v.caption || "");
      const vNameType = normalize(v.vehicle_type_caption || v.vehicle_type_name || "");
      let fms = v.fms_real ?? v.fms ?? null;
      const fmsText = (v.fms_text || "").toLowerCase();

      if (!fms || fms === 0) {
        if (fmsText.includes("frei auf wache") || fmsText.includes("at the station")) fms = 1;
        else if (fmsText.includes("frei auf funk") || fmsText.includes("available on radio")) fms = 2;
        else if (fmsText.includes("anfahrt zum einsatz") || fmsText.includes("dispatch to mission")) fms = 3;
        else if (fmsText.includes("an einsatzstelle") || fmsText.includes("at mission")) fms = 4;
        else if (fmsText.includes("sprechwunsch") || fmsText.includes("wartet") || fmsText.includes("awaiting orders")) fms = 5;
        else if (fmsText.includes("nicht einsatzbereit") || fmsText.includes("außer dienst") || fmsText.includes("not ready")) fms = 6;
        else if (fmsText.includes("patient an bord") || fmsText.includes("patient on board")) fms = 7;
        else if (fmsText.includes("am transportziel") || fmsText.includes("at destination")) fms = 8;
      }

      if (fms && statusVehicleLists[fms]) statusVehicleLists[fms].push(v.caption);

      const mappedKeys = TYPE_ID_MAPPING[typeId];
      if (mappedKeys) mappedKeys.forEach(setExist);

      // match by name/search terms
      for (const t of TILE_LIST) {
        if (t.norm && (vNameCustom.includes(t.norm) || vNameType.includes(t.norm))) setExist(t.n);
        for (const sTerm of t.search) {
          if (sTerm && (vNameCustom.includes(sTerm) || vNameType.includes(sTerm))) setExist(t.n);
        }
      }

      // available = fms 1/2
      if (fms === 1 || fms === 2) {
        if (mappedKeys) mappedKeys.forEach(setAvail);
        for (const t of TILE_LIST) {
          if (t.norm && (vNameCustom.includes(t.norm) || vNameType.includes(t.norm))) setAvail(t.n);
          for (const sTerm of t.search) {
            if (sTerm && (vNameCustom.includes(sTerm) || vNameType.includes(sTerm))) setAvail(t.n);
          }
        }
      }
    }

    // GRTW derived tiles
    if (vehicleExists["GRTW"]) {
      vehicleExists["GRTW (3 Pat.mit NA)"] = true;
      vehicleExists["GRTW (7 Pat.ohne NA)"] = true;
    }
    if (vehicleAvailability["GRTW"]) {
      vehicleAvailability["GRTW (3 Pat.mit NA)"] = true;
      vehicleAvailability["GRTW (7 Pat.ohne NA)"] = true;
    }

    // always exist/avail (manual counters)
    vehicleExists["Patienten"] = true;
    vehicleAvailability["Patienten"] = true;
    vehicleExists["Gefangene"] = true;
    vehicleAvailability["Gefangene"] = true;

    for (const k of KEYS) updateTile(k);
    renderAvailabilityIndicator();
    renderStatusCounters(statusVehicleLists);

    const lastUpdateEl = document.getElementById("fzLastUpdate");
    if (lastUpdateEl) {
      lastUpdateTime = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      lastUpdateEl.textContent = `Letztes Update: ${lastUpdateTime}`;
    }
  }

  // =========================================================================
  // 9) Counter Increment
  // =========================================================================
  function incrementTileCount(vehicleKey, activeEl) {
    if (!vehicleKey) return;

    if (checkVehicleDayReset() && isMainPage) redrawGrid();

    const inc = uiSettings.clickIncrement;
    const k = vehicleKey;

    state.today[k] = (state.today[k] || 0) + inc;
    state.total[k] = (state.total[k] || 0) + inc;
    state.det[k] = state.det[k] || {};

    const detailName = (normalize(activeEl ? activeEl.textContent || activeEl.value || k : k) || k).slice(0, 60);
    state.det[k][detailName] = (state.det[k][detailName] || 0) + inc;

    store.save(STORAGE.COUNTS_TODAY, state.today);
    store.save(STORAGE.COUNTS_TOTAL, state.total);
    json.save(STORAGE.DETAILS_TODAY, state.det);
    store.sendSignal();

    if (!isMainPage) return;

    updateTile(k);
    triggerAlarmBlink(k);

    if (fzWrapper) fzWrapper.classList.remove("fzHidden");
    resetCountdown();
  }

  // =========================================================================
  // 10) Events
  // =========================================================================
  // Key listeners for "V"
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "v") vKeyPressed = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key.toLowerCase() === "v") vKeyPressed = false;
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "default";
      saveUI();
    }
  });

  // Mouse for dragging
  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !fzWrapper) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    uiSettings.winLeft = dragStartLeft + dx;
    uiSettings.winTop = dragStartTop + dy;

    fzWrapper.style.left = uiSettings.winLeft + "px";
    fzWrapper.style.top = uiSettings.winTop + "px";
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = "default";
    saveUI();
  });

  // Click tracking
  const VALID_CLICK_AREA_SELECTOR =
    "#mission_aao, .vehicle_select_table, .aao, #mission-window, .aao-grid, .mission_panel_content, .missionMap, #vehicle_table, .vehicle-table, .mission-vehicles";

  document.addEventListener(
    "click",
    (e) => {
      const activeEl = e.target.closest("a, button, input[type='submit'], div.btn, span.btn");
      if (!activeEl) return;

      const text = (activeEl.textContent || activeEl.value || "").trim().toLowerCase();

      // Gefangene Keywords
      if (
        text.includes("zelle") ||
        text.includes("gewahrsam") ||
        text.includes("gefangene") ||
        text.includes("justiz") ||
        text.includes("sheriff") ||
        text.includes("gefangenentransport") ||
        text.includes("polizeizelle") ||
        text.includes("jva") ||
        text.includes("haft")
      ) {
        incrementTileCount("Gefangene", activeEl);
        return;
      }

      // Patienten Keywords
      if (
        text.includes("anfahren") ||
        text.includes("transportieren") ||
        text.includes("notaufnahme") ||
        text.includes("patienten") ||
        text.includes("patiententransport") ||
        text.includes("krankenhaus") ||
        text.includes("klinik") ||
        text.includes("abliefern") ||
        text.includes("abgegeben") ||
        text.includes("patient an bord")
      ) {
        incrementTileCount("Patienten", activeEl);
        return;
      }

      // only in valid areas
      if (!activeEl.closest(VALID_CLICK_AREA_SELECTOR)) return;

      const key = identifyClick(activeEl);
      if (!key) return;

      incrementTileCount(key, activeEl);

      if (key === "Katastrophenalarm Bielefeld") {
        if (isMainPage) showKataAlert();

        for (const vehicleKey of KEYS) {
          if (vehicleKey !== "Katastrophenalarm Bielefeld" && vehicleKey !== "Patienten" && vehicleKey !== "Gefangene") {
            incrementTileCount(vehicleKey, activeEl);
          }
        }
        incrementTileCount("Patienten", activeEl);
      }
    },
    true
  );

  // Sync between tabs
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE.SYNC_SIGNAL) return;

    state.today = store.loadCounts(STORAGE.COUNTS_TODAY);
    state.total = store.loadCounts(STORAGE.COUNTS_TOTAL);
    state.yday = store.loadCounts(STORAGE.YDAY_COUNTS);
    state.det = json.load(STORAGE.DETAILS_TODAY, {});

    if (isMainPage) for (const k of KEYS) updateTile(k);
  });

  // Daily reset check
  setInterval(() => {
    if (document.hidden) return;
    if (checkVehicleDayReset()) {
      if (isMainPage) {
        redrawGrid();
        updateAvailability();
      }
    }
  }, 1000);

  // periodic availability update
  setInterval(updateAvailability, 120000);

  // =========================================================================
  // 11) Start
  // =========================================================================
  if (isMainPage) {
    setTimeout(() => {
      initUI();
      updateAvailability();
    }, 500);
  }
})();
