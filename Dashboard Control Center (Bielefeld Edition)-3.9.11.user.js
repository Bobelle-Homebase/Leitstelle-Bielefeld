// ==UserScript==
// @name               Dashboard Control Center (Bielefeld Edition)
// @namespace          https://leitstellenspiel.de/bielefeld
// @version            3.9.15
// @license            Design by Bobelle
// @author             Design by Bobelle (Mod by User)
// @description        V3.9.15-Mod-V4: Pat/Gef/Betreuung (Blau blinkend), Alarme (Rot blinkend), Fzg (Status-Farben).
// @match              https://www.leitstellenspiel.de/*
// @match              https://leitstellenspiel.de/*
// @match              https://www.missionchief.com/*
// @match              https://missionchief.com/*
// @match              https://www.meldkamerspel.com/*
// @updateURL          https://github.com/Bobelle-Homebase/Leitstelle-Bielefeld/raw/refs/heads/main/Dashboard%20Control%20Center%20(Bielefeld%20Edition)-3.9.11.user.js
// @downloadURL        https://github.com/Bobelle-Homebase/Leitstelle-Bielefeld/raw/refs/heads/main/Dashboard%20Control%20Center%20(Bielefeld%20Edition)-3.9.11.user.js
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM_addStyle
// @run-at             document-idle
// ==/UserScript==

(() => {
    "use strict";

    // =========================================================================
    // TEIL 0: SPEZIAL-GRUPPEN DEFINITION
    // =========================================================================
    const GROUP_LOGISTICS = [
        "Betreuung/Versorgung",
        "Patienten",
        "Gefangene"
    ];

    const GROUP_ALARMS = [
        "FFW Vollalarm",
        "SEG Vollalarm",
        "THW Vollalarm",
        "AB Vollalarm",
        "Katastrophenalarm Bielefeld",
        "BergRett Vollalarm",
        "SeeRett Vollalarm",
        "WasserRett Vollalarm",
        "ABC Vollalarm"
    ];

    // =========================================================================
    // TEIL 1: ID MAPPING & KONSTANTEN
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
        started: "#mission_select_started"
    };

    const ICONS = { patient: "👨‍🍼", prisoner: "👮", alarm: "🚨", refresh: "🔄" };
    const STORAGE = {
        COUNTS_TODAY: "fz_v7_counts_today",
        COUNTS_TOTAL: "fz_v7_counts_total",
        DETAILS_TODAY: "fz_v7_details",
        YDAY_COUNTS: "fz_v7_yday",
        DAYSTAMP: "fz_v7_daystamp",
        UISETTINGS: "fz_final_ui_settings_v6_0",
        SYNC_SIGNAL: "fz_v7_sync_signal_ls"
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
        8: { title: "Status 8: Am Transportziel", color: "#6f42c1" }
    };

    // DEFAULTS für schlichtes Design
    const DEFAULTS = {
        columns: 6, autoHideSeconds: 30, clickIncrement: 1, compactMode: false,
        winMaxHeight: 750,
        winTop: 60,
        winLeft: 5,
        winBg: "#f8f9fa", winBorderC: "#e9ecef", winBorderW: 1, winRadius: 0,

        // HIER FARBE TITELLEISTE ÄNDERN:
        headBg: "#e9ecef",

        headColor: "#343a40", headSize: 15, headAlign: "left",
        colBg: "#e9ecef", colColor: "#495057", colSize: 11, colAlign: "left",
        rowBg: "#ffffff", rowColor: "#212529", rowSize: 11, rowAlign: "left",
        numTodayColor: "#28a745", numTodaySize: 15,
        numYdayColor: "#6c757d", numYdaySize: 12, numAlign: "right",
        tileSortOrder: "category", activeCategoryFilter: "all", searchFilter: ""
    };

    const path = window.location.pathname;
    const isMainPage = document.getElementById("mission_list") !== null && (path === "/" || path === "/index" || path.length < 2);

    // =========================================================================
    // TEIL 2: KACHEL-DEFINITIONEN (AAO)
    // =========================================================================
    const CATEGORY_ORDER = [
        "FW", "RD", "POL", "THW", "SEG",
        "WerkFW", "FlugFW", "Drohne", "Wasser/Berg",
        "Netz", "Kat", "Sonstiges"
    ];
    const categoryOrderMap = new Map(CATEGORY_ORDER.map((cat, index) => [cat, index]));

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
        { n: "GTLF", c: "#FF0000", s: ["gtlf"], cat: "FW" },
        { n: "FwK", c: "#FF0000", s: ["fwk", "kran", "feuerwehrkran"], cat: "FW" },
        { n: "Dekon-P", c: "#FF0000", s: ["dekon", "dekonp"], cat: "FW" },
        { n: "MTW Mannschaft", c: "#FF0000", s: ["mtw", "mannschaft"], cat: "FW" },
        { n: "MTW Verpflegung", c: "#FF0000", s: ["mtw","verpflegung","verpflegung"], cat: "FW" },
        { n: "SLF", c: "#FF0000", s: ["slf", "sonderlöschfahrzeug"], cat: "FW" },
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
        { n: "GW Verpflegung", c: "#FF0000", s: ["gw","verpflegung", "gwverpflegung"], cat: "FW" },
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
        { n: "AB NEA50", c: "#FF0000", cat: "FW" },
        { n: "AB Oel/Umwelt", c: "#FF0000", s: ["aboel", "aböl"], cat: "FW" },
        { n: "AB Schiene", c: "#FF0000", s: ["abschiene"], cat: "FW" },
        { n: "AB Schlauch", c: "#FF0000", s: ["abschlauch"], cat: "FW" },
        { n: "AB Sonderlöschmittel", c: "#FF0000", cat: "FW" },
        { n: "AB Tank", c: "#FF0000", s: ["abtank"], cat: "FW" },
        { n: "AB Wasser/Schaum", c: "#FF0000", s: ["abwasser"], cat: "FW" },
        { n: "Anh Lüfter", c: "#FF0000", s: ["anhlüfter"], cat: "FW" },
        
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
        { n: "GRTW (3 Pat.mit NA)", c: "#FF9D0A", cat: "RD" },
        { n: "GRTW (7 Pat.ohne NA)", c: "#FF9D0A", cat: "RD" },
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
        { n: "Außenlastbehälter", c: "#54B509", cat: "POL" },
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
        { n: "THW MTW-FGr K", c: "#0571FF", cat: "THW" },
        { n: "THW MTW-FGr Log-V", c: "#0571FF", cat: "THW" },
        { n: "THW Anh DLE", c: "#0571FF", s: ["dle"], cat: "THW" },
        { n: "THW Anh SwPu", c: "#0571FF", s: ["swpu"], cat: "THW" },
        { n: "THW Anh Hund", c: "#0571FF", s: ["hund"], cat: "THW" },
        { n: "THW Anh SchlB", c: "#0571FF", s: ["schlb"], cat: "THW" },
        { n: "THW Anh 12 Lbw (FGr Log-V)", c: "#0571FF", cat: "THW" },
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
        { n: "ELW 2 Drohne", c: "#CCCCCC", cat: "Drohne" },
        { n: "ELW Drohne", c: "#CCCCCC", cat: "Drohne" },
        { n: "MTF Drohne", c: "#CCCCCC", cat: "Drohne" },
        // Wasser/Berg
        { n: "GW Taucher", c: "#8CBAFF", s: ["taucher"], cat: "Wasser/Berg" },
        { n: "GW Wasserrettung", c: "#8CBAFF", s: ["wasserrettung"], cat: "Wasser/Berg" },
        { n: "MZB", c: "#8CBAFF", s: ["mzb", "boot"], cat: "Wasser/Berg" },
        { n: "Seenotrettungsboot", c: "#8CBAFF", cat: "Wasser/Berg" },
        { n: "Seenotrettungskreuzer", c: "#8CBAFF", cat: "Wasser/Berg" },
        { n: "SAR mit Winde", c: "#8CBAFF", cat: "Wasser/Berg" },
        { n: "GW Bergrettung", c: "#B0AC97", s: ["bergrettung", "bergwacht"], cat: "Wasser/Berg" },
        { n: "GW Bergrettung NEF)", c: "#B0AC97", cat: "Wasser/Berg" },
        { n: "ATV", c: "#B0AC97", cat: "Wasser/Berg" },
        { n: "Anh Höhenrettung", c: "#B0AC97", cat: "Wasser/Berg" },
        { n: "ELW Bergrettung", c: "#B0AC97", cat: "Wasser/Berg" },
        { n: "Schneefahrzeug", c: "#B0AC97", s: ["schnee"], cat: "Wasser/Berg" },
        // Sonstiges / Netz
        // HIER WURDE noStatus: true HINZUGEFÜGT
        { n: "Patienten", c: "#000000", i: ICONS.patient, cat: "Sonstiges", s: ["patienten", "patiententransport", "krankenhaus", "transportziel", "klinik", "abliefern", "abgegeben", "patient an bord"], noStatus: true },
        { n: "Gefangene", c: "#000000", i: ICONS.prisoner, cat: "Sonstiges", s: ["gefangene", "gefangenentransport", "polizeizelle", "justizvollzugsanstalt", "jva", "haft", "zelle", "gewahrsam", "sheriff"], noStatus: true },
        { n: "Betreuung/Versorgung", c: "#000000", s: ["betreuung", "versorgung", "verpflegung", "bt", "küche"], cat: "Sonstiges", noStatus: true },

        { n: "NEA50 (Beliebige HiOrg)", c: "#FFD7A8", s: ["nea50", "netz"], cat: "Netz" },
        { n: "NEA200 (Beliebige HiOrg)", c: "#0571FF", s: ["nea200", "netz"], cat: "Netz" },
        { n: "Anh NEA50", c: "#0571FF", s: ["anhnea50", "netz"], cat: "Netz" },
        { n: "Anh NEA200", c: "#0571FF", s: ["anhnea200", "netz"], cat: "Netz" },

        // Bielefeld Specifics & Vollalarme - noStatus: true
        { n: "Katastrophenalarm Bielefeld", c: "#000000", s: ["katastrophenalarm", "bielefeld", "kat-alarm", "großalarm"], cat: "Kat", noStatus: true },
        { n: "FFW Vollalarm", c: "#000000", s: ["FFW Vollalarm", "Feuerwehr Vollalarm"], cat: "Kat", noStatus: true },
        { n: "SEG Vollalarm", c: "#000000", s: ["SEG Vollalarm", "Schnelleinsatzgruppe Vollalarm"], cat: "Kat", noStatus: true },
        { n: "THW Vollalarm", c: "#000000", s: ["THW Vollalarm", "Technisches Hilfswerk Vollalarm"], cat: "Kat", noStatus: true },
        { n: "BergRett Vollalarm", c: "#000000", s: ["BergRett Vollalarm", "Bergrettung Vollalarm"], cat: "Kat", noStatus: true },
        { n: "WasserRett Vollalarm", c: "#000000", s: ["WasserRett Vollalarm", "Wasserrettung Vollalarm"], cat: "Kat", noStatus: true },
        { n: "SeeRett Vollalarm", c: "#000000", s: ["SeeRett Vollalarm", "Seenotrettung Vollalarm"], cat: "Kat", noStatus: true },
        { n: "AB Vollalarm", c: "#000000", s: ["AB Vollalarm", "Abrollbehälter Vollalarm"], cat: "Kat", noStatus: true },
        { n: "ABC Vollalarm", c: "#000000", s: ["ABC Vollalarm", "Gefahrgut Vollalarm"], cat: "Kat", noStatus: true },

    ].sort((a, b) => (b.n.length + (b.s || []).reduce((sum, s) => sum + s.length, 0)) - (a.n.length + (a.s || []).reduce((sum, s) => sum + s.length, 0)));

    const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const TILE_LIST = AAO_TILES_RAW.map(t => ({ ...t, norm: normalize(t.n), search: (t.s || []).map(normalize), cat: t.cat, noStatus: t.noStatus }));
    const KEYS = AAO_TILES_RAW.map(t => t.n);
    const tileMetaByKey = Object.fromEntries(AAO_TILES_RAW.map(t => [t.n, t]));

    // =========================================================================
    // TEIL 3: HELPER FUNCTIONS
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
                <span style="${started > 0 ? 'color:#cc0000;' : ''}">Im Einsatz: ${started}</span>
            </div>
        `;
    }

    // =========================================================================
    // TEIL 4: DATEN-HANDLING & SPEICHER
    // =========================================================================
    const json = {
        load(key, fallback) {
            try {
                const value = GM_getValue(key, "");
                if (value === "") return fallback;
                const parsed = JSON.parse(value);
                return parsed !== null ? parsed : fallback;
            } catch (e) {
                console.error(`DCC: Error loading GM_value for key "${key}":`, e);
                return fallback;
            }
        },
        save(key, val) {
            try {
                GM_setValue(key, JSON.stringify(val));
            } catch (e) {
                console.error(`DCC: Error saving GM_value for key "${key}":`, e);
            }
        }
    };

    const store = {
        load: (key) => {
            const o = json.load(key, {});
            KEYS.forEach(k => { if (o[k] == null) o[k] = 0; });
            return o;
        },
        save: (key, val) => json.save(key, val),
        sendSignal: () => localStorage.setItem(STORAGE.SYNC_SIGNAL, Date.now().toString())
    };

    let uiSettings = { ...DEFAULTS, ...json.load(STORAGE.UISETTINGS, {}) };
    for (const k in DEFAULTS) { if (uiSettings[k] === undefined) uiSettings[k] = DEFAULTS[k]; }
    const saveUI = () => json.save(STORAGE.UISETTINGS, uiSettings);
    const getTodayString = () => new Date().toLocaleDateString("de-DE");

    // Availability states:
    let vehicleAvailability = {};
    let vehicleExists = {};
    let lastUpdateTime = "";

    // Dragging State
    let vKeyPressed = false;
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let dragStartLeft = 0, dragStartTop = 0;

    function checkVehicleDayReset(state) {
        const today = getTodayString();
        if (GM_getValue(STORAGE.DAYSTAMP, "") !== today) {
            console.log("DCC: Performing daily reset for vehicle counts.");
            const oldToday = store.load(STORAGE.COUNTS_TODAY);
            store.save(STORAGE.YDAY_COUNTS, oldToday);
            store.save(STORAGE.COUNTS_TODAY, {});
            json.save(STORAGE.DETAILS_TODAY, {});
            GM_setValue(STORAGE.DAYSTAMP, today);

            if (state) {
                state.today = {};
                state.yday = oldToday;
                state.det = {};
            }
            return true;
        }
        return false;
    }

    // New helper to trigger the blinking animation
    function triggerAlarmBlink(key) {
        const el = tileEls[key];
        if (!el) return;

        // Reset previous animations
        el.classList.remove("fzBlinkRed", "fzBlinkBlue");
        void el.offsetWidth; // Force reflow

        if (GROUP_ALARMS.includes(key)) {
            el.classList.add("fzBlinkRed");
            el.addEventListener('animationend', () => el.classList.remove("fzBlinkRed"), { once: true });
        } else if (GROUP_LOGISTICS.includes(key)) {
            el.classList.add("fzBlinkBlue");
            el.addEventListener('animationend', () => el.classList.remove("fzBlinkBlue"), { once: true });
        }
    }

    function incrementTileCount(vehicleKey, activeEl) {
        if (!vehicleKey) return;

        // Check for day reset and update UI if necessary
        if (checkVehicleDayReset(state) && isMainPage) {
            redrawGrid();
        }

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

        if (isMainPage) {
            updateTile(k, state);

            // Trigger blinking for alarm tiles
            triggerAlarmBlink(k);

            if (fzWrapper) fzWrapper.classList.remove("fzHidden");
            resetCountdown();
        }
    }

    function identifyClick(el) {
        if (!el) return null;

        const rawText = normalize(
            (el.textContent || "") + " " +
            (el.title || "") + " " +
            (el.getAttribute("aria-label") || "") + " " +
            (el.value || "") + " " +
            (el.getAttribute("search_attribute") || "")
        );
        let best = null, bestLen = -1;

        for (const t of TILE_LIST) {
            if (t.norm && rawText.includes(t.norm) && t.norm.length > bestLen) {
                best = t.n; bestLen = t.norm.length;
            }
            for (const sTerm of t.search) {
                if (sTerm && rawText.includes(sTerm) && sTerm.length > bestLen) {
                    best = t.n; bestLen = sTerm.length;
                }
            }
        }
        return best;
    }

    // =========================================================================
    // TEIL 5: AVAILABILITY LOGIK & MODALS
    // =========================================================================
    function getAvailabilitySummary() {
        const notAvailButExist = KEYS.filter(k => vehicleExists[k] === true && vehicleAvailability[k] !== true);
        const notExist = KEYS.filter(k => vehicleExists[k] !== true);
        const green = KEYS.filter(k => vehicleAvailability[k] === true).length;
        return {
            total: KEYS.length,
            green,
            orange: notAvailButExist.length,
            red: notExist.length,
            notAvailButExist,
            notExist
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
        window._fzTriggerUpdate = () => {
            updateAvailability();
            setTimeout(renderAvailabilityIndicator, 400);
        };
    }

    function showMissingAvailabilityModal() {
        const s = getAvailabilitySummary();
        const section = (title, arr, color) => {
            const body = arr.length
            ? arr.map(k => `<div class="fzRow"><span>${k}</span><b style="color:${color};">${title}</b></div>`).join("")
            : `<div style="padding:10px;text-align:center;color:#999;">Keine</div>`;
            return `<h4 style="margin:12px 0 6px 0;">${title} (${arr.length})</h4>${body}`;
        };

        const ol = document.createElement("div");
        ol.className = "fzModalOverlay";
        ol.onclick = (e) => { if (e.target === ol) ol.remove(); };

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
              </div>`;
            document.body.appendChild(ol);
        }

    function showFmsDetailsModal(status, vehicleList) {
        const info = STATUS_INFO[status];
        if (!info) return;

        const statusDescription = info.title.split(':')[1] ? info.title.split(':')[1].trim() : '';

        const vehicleHtml = vehicleList.length > 0
        ? vehicleList.sort().map(name => `<div class="fzRow"><span>${name}</span></div>`).join("")
        : `<div style="padding:10px;text-align:center;color:#999">Keine Fahrzeuge in diesem Status.</div>`;

        const ol = document.createElement("div");
        ol.className = "fzModalOverlay";
        ol.onclick = (e) => { if (e.target === ol) ol.remove(); };

        ol.innerHTML = `
              <div class="fzModal" style="width: 400px;">
                <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="background-color: ${info.color}; color: white; padding: 3px 8px; border-radius: 5px;">Status ${status}</span>
                    ${statusDescription}
                </h3>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${vehicleHtml}
                </div>
                <button class="fzBtn" style="margin-top:15px;width:100%" onclick="this.closest('.fzModalOverlay').remove()">Schließen</button>
              </div>`;
            document.body.appendChild(ol);
        }

    function renderStatusCounters(statusVehicleLists) {
        const container = document.getElementById("fzStatusList");
        if (!container) return;

        container.innerHTML = "";
        const sortedStatusKeys = Object.keys(statusVehicleLists).sort((a, b) => parseInt(a) - parseInt(b));

        for (const status of sortedStatusKeys) {
            const vehicleList = statusVehicleLists[status];
            const count = vehicleList.length;

            if (count > 0) {
                const info = STATUS_INFO[status];
                if (info) {
                    const item = document.createElement("div");
                    item.className = "fzStatusItem";
                    item.textContent = `${status}: ${count}`;
                    item.style.backgroundColor = info.color;
                    item.title = info.title;

                    item.onclick = () => showFmsDetailsModal(status, vehicleList);

                    container.appendChild(item);
                }
            }
        }
    }

    async function updateAvailability() {
        if (!isMainPage) return;

        for (const k of KEYS) {
            vehicleAvailability[k] = false;
            vehicleExists[k] = false;
        }

        const statusVehicleLists = {};
        for (let i = 1; i <= 8; i++) {
            statusVehicleLists[i] = [];
        }

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
            console.warn("DCC: FZ Availability Check failed (network/JSON error):", e);
            return;
        }

        const setExist = (k) => { if (tileMetaByKey[k]) vehicleExists[k] = true; };
        const setAvail = (k) => { if (tileMetaByKey[k]) vehicleAvailability[k] = true; };

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

            if (fms && statusVehicleLists[fms]) {
                statusVehicleLists[fms].push(v.caption);
            }

            const mappedKeys = TYPE_ID_MAPPING[typeId];
            if (mappedKeys) mappedKeys.forEach(setExist);

            for (const t of TILE_LIST) {
                if ((t.norm && (vNameCustom.includes(t.norm) || vNameType.includes(t.norm)))) setExist(t.n);
                for (const sTerm of t.search) {
                    if (sTerm && (vNameCustom.includes(sTerm) || vNameType.includes(sTerm))) setExist(t.n);
                }
            }

            if (fms === 1 || fms === 2) {
                if (mappedKeys) mappedKeys.forEach(setAvail);
                for (const t of TILE_LIST) {
                    if ((t.norm && (vNameCustom.includes(t.norm) || vNameType.includes(t.norm)))) setAvail(t.n);
                    for (const sTerm of t.search) {
                        if (sTerm && (vNameCustom.includes(sTerm) || vNameType.includes(sTerm))) setAvail(t.n);
                    }
                }
            }
        }

        if (vehicleExists["GRTW"]) {
            vehicleExists["GRTW (3 Pat.mit NA)"] = true;
            vehicleExists["GRTW (7 Pat.ohne NA)"] = true;
        }
        if (vehicleAvailability["GRTW"]) {
            vehicleAvailability["GRTW (3 Pat.mit NA)"] = true;
            vehicleAvailability["GRTW (7 Pat.ohne NA)"] = true;
        }

        vehicleExists["Patienten"] = true;
        vehicleAvailability["Patienten"] = true;
        vehicleExists["Gefangene"] = true;
        vehicleAvailability["Gefangene"] = true;

        KEYS.forEach(k => updateTile(k, state));
        renderAvailabilityIndicator();
        renderStatusCounters(statusVehicleLists);

        const lastUpdateEl = document.getElementById("fzLastUpdate");
        if (lastUpdateEl) {
            lastUpdateTime = new Date().toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            lastUpdateEl.textContent = `Letztes Update: ${lastUpdateTime}`;
        }
    }

    // =========================================================================
    // TEIL 6: UI (CSS & HTML)
    // =========================================================================
    let fzWrapper, uiRoot;
    let tileEls = {};
    let animFrameId = null, hideStartTime = null, hideDuration = 0, safeHideTimer = null, isHovering = false;
    let state = {
        today: store.load(STORAGE.COUNTS_TODAY),
        total: store.load(STORAGE.COUNTS_TOTAL),
        yday: store.load(STORAGE.YDAY_COUNTS),
        det: json.load(STORAGE.DETAILS_TODAY, {})
    };

    function injectCSS() {
        GM_addStyle(`
            /* Root variables for dynamic styling */
            :root {
                --fz-mh: ${uiSettings.winMaxHeight}px; --fz-t: ${uiSettings.winTop}px; --fz-l: ${uiSettings.winLeft}px;
                --fz-bg: ${uiSettings.winBg}; --fz-bc: ${uiSettings.winBorderC};
                --fz-bw: ${uiSettings.winBorderW}px; --fz-br: ${uiSettings.winRadius}px;
                --fz-h-bg: ${uiSettings.headBg}; --fz-h-c: ${uiSettings.headColor};
                --fz-h-s: ${uiSettings.headSize}px; --fz-h-a: ${uiSettings.headAlign};
                --fz-c-bg: ${uiSettings.colBg}; --fz-c-c: ${uiSettings.colColor};
                --fz-c-s: ${uiSettings.colSize}px; --fz-c-a: ${uiSettings.colAlign};
                --fz-r-bg: ${uiSettings.rowBg}; --fz-r-c: ${uiSettings.rowColor};
                --fz-r-s: ${uiSettings.rowSize}px; --fz-r-a: ${uiSettings.rowAlign};
                --fz-nt-c: ${uiSettings.numTodayColor}; --fz-nt-s: ${uiSettings.numTodaySize}px;
                --fz-ny-c: ${uiSettings.numYdayColor}; --fz-ny-s: ${uiSettings.numYdaySize}px;
                --fz-nb-j: ${uiSettings.numAlign === 'right' ? 'space-between' : 'flex-start'};
            }
            /* Main Wrapper */
            .fzWrapper {
                position:fixed; z-index:${CFG.zIndex}; top:var(--fz-t); left:var(--fz-l); width:auto;
                display:flex; flex-direction:column; background:var(--fz-bg);
                border:var(--fz-bw) solid var(--fz-bc); border-radius:0 0 var(--fz-br) var(--fz-br);
                box-shadow:0 10px 30px rgba(0,0,0,0.5);
                transition: opacity 0.4s ease-out; /* Removed transform to allow smooth dragging */
            }
            .fzWrapper.fzHidden { opacity:0; pointer-events:none; }

            /* Header Section */
            .fzHeader {
                background:var(--fz-h-bg); color:var(--fz-h-c); padding:6px 10px;
                display:flex; justify-content:space-between; align-items:flex-start;
                user-select:none; font-family: sans-serif;
                cursor: default; /* Change cursor on press handled by JS */
            }
            .fzHeader > div { display: flex; align-items: center; }
            .fzHeader .left-section { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }

            .fzHeader .right-section { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
            .fzHeader .right-section-top-row {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 15px;
            }
            .fzHeader .branding-group {
                display: flex;
                align-items: center;
            }
            .fzHeader .branding-text {
                text-align:right;
                line-height:1.1;
                white-space: nowrap;
            }
            .fzHeader .logo-link {
                margin-left:10px;
                display:flex;
                align-items:center;
            }

            .fzMissionStats { font-size:13px; font-weight:bold; color:#000000; }
            .fzMissionStats span { white-space: nowrap; }

            /* Auto-hide countdown bar */
            .fzTimerContainer {
                width:100%; height:5px; background:#e0e0e0; border-radius:2px; overflow:hidden;
            }
            #fzTimerFill {
                height:100%; width:100%; background:#5cb85c; transition: background-color 0.5s ease;
            }

            /* Availability Indicator */
            #fzAvailIndicator {
                font-size:12px; font-weight:bold; padding:2px 8px; border:2px solid; border-radius:6px;
                cursor:pointer; user-select:none; white-space: nowrap;
                flex-shrink: 0;
            }
            #fzAvailIndicator:hover { filter: brightness(1.1); }

            /* Header Buttons (Gear, Home, Map, School, Refresh) */
            .fzHeadBtn {
                cursor:pointer; font-size:16px; color:#000; transition: transform 0.2s ease-in-out;
            }
            .fzHeadBtn:hover { transform:scale(1.2); }

            /* Relocated Buttons container */
            #fzRelocatedButtons {
                display:flex; gap:15px;
                margin-top:5px;
                flex-wrap: wrap;
                justify-content: flex-end;
                align-items: center;
            }

            /* Filter Badges */
            .fzFilterBadges {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 5px;
                justify-content: flex-start;
                font-size: 11px;
            }
            .fzFilterBadge {
                background-color: #007bff;
                color: white;
                padding: 2px 7px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .fzFilterBadge:hover {
                background-color: #0056b3;
            }
            .fzFilterBadge .close-icon {
                font-size: 10px;
                font-weight: bold;
                line-height: 1;
            }

            /* Letztes Update Zeitstempel */
            .fzLastUpdate {
                font-size:10px;
                color:#6c757d;
                white-space: nowrap;
                flex-shrink: 0;
            }

            /* Scrollable Area for Tiles */
            .fzScrollArea { max-height:var(--fz-mh); overflow-y:auto; background:#fff; position:relative; }
            .fzGrid {
                display:grid; grid-template-columns:repeat(${uiSettings.columns}, 1fr); gap:0;
                background:#ccc; border-top:1px solid #ccc; border-left:1px solid #ccc;
            }

            /* Column Headers */
            .fzColHeader {
                background:var(--fz-c-bg); color:var(--fz-c-c); font-weight:bold; font-size:var(--fz-c-s);
                text-align:var(--fz-c-a); padding:4px 6px; border-bottom:1px solid #ccc; border-right:1px solid #ccc;
            }

            /* Individual Tiles */
            .fzTile {
                position: relative; display:flex; justify-content:var(--fz-nb-j); align-items:center;
                padding:3px 6px 3px 10px;
                height:25px; border-left:5px solid transparent; border-right:1px solid #ccc; border-bottom:1px solid #ccc;
                gap:8px; font-family: sans-serif;
                cursor:pointer; user-select:none;
            }
            .fzTile:hover { filter:brightness(0.95); }
            /* Status dot inside tile */
            .fzStatusDot {
                position:absolute; top:2px; left:2px; width:6px; height:6px; border-radius:50%; z-index:1;
                border: 1px solid rgba(0,0,0,0.2);
            }
            /* Compact mode: hide tiles with 0 count */
            .fzWrapper.fzCompact .fzTile[data-val="0"] { display: none; }

            .fzTileName {
                color:var(--fz-r-c); font-size:var(--fz-r-s); text-align:var(--fz-r-a); font-weight:bold;
                overflow:hidden; white-space:nowrap; text-overflow:ellipsis; flex:1;
            }
            .fzTileIcon { font-size:18px; margin-right:5px; vertical-align:middle; line-height:1; }
            .fzTileCount {
                background:rgba(0,0,0,0.05); padding:1px 5px; border-radius:3px; min-width:30px;
                text-align:right; white-space:nowrap; display:flex; align-items:baseline; gap:3px;
            }
            .fzNumToday { font-weight:bold; color:var(--fz-nt-c); font-size:var(--fz-nt-s); }
            .fzNumYday { font-weight:normal; color:var(--fz-ny-c); font-size:var(--fz-ny-s); }

            /* General Button Styling for Modals */
            .fzBtn {
                background:#f5f5f5; border:1px solid #ccc; border-radius:4px; cursor:pointer;
                padding:4px 8px; font-weight:bold; color:#333; text-align:center; font-size:13px;
                transition: background-color 0.2s;
            }
            .fzBtn:hover { background:#e0e0e0; }

            /* Modal Styles */
            .fzModalOverlay {
                position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:100001;
                display:flex; justify-content:center; align-items:center;
            }
            .fzModal {
                background:#fff; padding:20px; border-radius:8px; width:520px; max-width:90%;
                max-height:90vh; overflow:auto; box-shadow:0 10px 30px rgba(0,0,0,0.5);
                font-family:sans-serif; font-size:13px;
            }
            .fzModal h3 { margin-top:0; color:#333; font-size:18px; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px; }
            .fzSetGroup {
                margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;
            }
            .fzSetGroup:last-of-type { border-bottom:none; margin-bottom:0; }
            .fzRow {
                display:flex; justify-content:space-between; align-items:center; padding:4px 0;
                border-bottom:1px solid #f9f9f9;
            }
            .fzRow:last-of-type { border-bottom:none; }
            .fzInput { width:80px; padding:2px; border:1px solid #ccc; border-radius:3px; text-align:right; }
            .fzColor { width:40px; height:20px; border:none; padding:0; cursor:pointer; }

            /* Trigger Zone for showing dashboard */
            .fzTriggerZone {
                position:fixed; bottom:0; left:0; width:80px; height:80px; z-index:100000;
                background:transparent;
            }

            /* FMS Status List in Header */
            .fzStatusList {
                display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px;
                justify-content: flex-start;
            }
            .fzStatusItem {
                font-size: 11px; font-weight: bold; padding: 1px 6px; border-radius: 5px;
                color: #fff; background-color: #333; cursor: pointer;
                transition: filter 0.2s; white-space: nowrap;
            }
            .fzStatusItem:hover { filter: brightness(1.2); }

            /* Animation Definitions */
            @keyframes fzFlashRedSlow {
                0%, 100% { background-color: #ffcccc; transform: scale(1); }
                50% { background-color: #ff3333; color: white; transform: scale(1.05); }
            }
            @keyframes fzFlashBlueSlow {
                0%, 100% { background-color: #cce5ff; transform: scale(1); }
                50% { background-color: #007bff; color: white; transform: scale(1.05); }
            }
            .fzBlinkRed {
                animation: fzFlashRedSlow 1s ease-in-out 20; /* 20 times, slow */
                z-index: 9999;
                position: relative;
                box-shadow: 0 0 5px red;
            }
            .fzBlinkBlue {
                animation: fzFlashBlueSlow 1s ease-in-out 20; /* 20 times, slow */
                z-index: 9999;
                position: relative;
                box-shadow: 0 0 5px blue;
            }
        `);
    }

    function updateStyles() {
        const r = document.documentElement.style;
        const s = uiSettings;
        const keys = {
            '--fz-mh': s.winMaxHeight + 'px', '--fz-t': s.winTop + 'px', '--fz-l': s.winLeft + 'px',
            '--fz-bg': s.winBg, '--fz-bc': s.winBorderC, '--fz-bw': s.winBorderW + 'px', '--fz-br': s.winRadius + 'px',
            '--fz-h-bg': s.headBg, '--fz-h-c': s.headColor, '--fz-h-s': s.headSize + 'px', '--fz-h-a': s.headAlign,
            '--fz-c-bg': s.colBg, '--fz-c-c': s.colColor, '--fz-c-s': s.colSize + 'px', '--fz-c-a': s.colAlign,
            '--fz-r-bg': s.rowBg, '--fz-r-c': s.rowColor, '--fz-r-s': s.rowSize + 'px', '--fz-r-a': s.rowAlign,
            '--fz-nt-c': s.numTodayColor, '--fz-nt-s': s.numTodaySize + 'px',
            '--fz-ny-c': s.numYdayColor, '--fz-ny-s': s.numYdaySize + 'px',
            '--fz-nb-j': s.numAlign === 'right' ? 'space-between' : 'flex-start'
        };
        for (const k in keys) r.setProperty(k, keys[k]);

        if (uiRoot) uiRoot.style.gridTemplateColumns = `repeat(${s.columns}, 1fr)`;
        redrawGrid();
    }

    function updateTile(key, state) {
        const el = tileEls[key];
        if (!el) {
            return;
        }

        const tileMeta = tileMetaByKey[key]; // Get Metadata to check for noStatus

        const v = (state.today[key] || 0);
        const y = (state.yday[key] || 0);

        el.dataset.val = v;
        const countEl = el.querySelector(".fzTileCount");
        if (countEl) {
            countEl.innerHTML = `<span class="fzNumToday">${v}</span><span class="fzNumYday">(${y})</span>`;
        }

        const dot = el.querySelector(".fzStatusDot");

        // --- SPECIAL GROUPS CHECK ---
        // Group Logistics: Betreuung, Patienten, Gefangene (BLUE)
        if (GROUP_LOGISTICS.includes(key)) {
            if (v > 0) {
                el.style.backgroundColor = "#cce5ff"; // Hellblau
                el.style.color = "#000";
            } else {
                el.style.backgroundColor = "#e6e6e6"; // Hellgrau
                el.style.color = "#888";
            }
            if (dot) dot.style.display = 'none';
            return; // Exit here, ignore rest
        }

        // Group Alarms (RED)
        if (GROUP_ALARMS.includes(key)) {
            if (v > 0) {
                el.style.backgroundColor = "#ffcccc"; // Hellrot
                el.style.color = "#000";
            } else {
                el.style.backgroundColor = "#e6e6e6"; // Hellgrau
                el.style.color = "#888";
            }
            if (dot) dot.style.display = 'none';
            return; // Exit here
        }

        // --- STANDARD LOGIC ---
        if (dot) dot.style.display = 'none'; // PUNKT IMMER AUSBLENDEN

        // SPECIAL HANDLING FOR TILES WITH NO STATUS
        if (tileMeta && tileMeta.noStatus) {
            el.style.backgroundColor = uiSettings.rowBg; // Always default background
            el.style.color = uiSettings.rowColor;
            return; // Skip the rest of the status logic
        }

        const exists = vehicleExists[key] === true;
        const isAvail = vehicleAvailability[key] === true;

        if (isAvail) {
            // GRÜN: Verfügbar (Status 1 oder 2)
            el.style.backgroundColor = "#cfefd4";
            el.style.color = "#000000";
        } else if (exists) {
            // ORANGE: Existiert, aber unterwegs (Status 3, 4, etc.)
            el.style.backgroundColor = "#ffeeba";
            el.style.color = "#000000";
        } else {
            // GRAU/STANDARD: Existiert nicht
            el.style.backgroundColor = "#e6e6e6"; // <--- Geändert von uiSettings.rowBg
            el.style.color = "#888888"; // Text etwas ausgrauen
        }
    }

    function createTile(key, state) {
        const meta = AAO_TILES_RAW.find(t => t.n === key);
        if (!meta) {
            console.error(`DCC: Metadata for tile key "${key}" not found.`);
            return null;
        }
        const color = meta.c || "#888";
        const iconHtml = meta.i ? `<span class="fzTileIcon">${meta.i}</span>` : "";
        const v = (state.today[key] || 0);
        const y = (state.yday[key] || 0);

        const div = document.createElement("div");
        div.className = "fzTile";
        div.dataset.key = key;
        div.dataset.val = v;
        div.style.borderLeftColor = color;
        div.style.backgroundColor = uiSettings.rowBg;
        div.style.color = uiSettings.rowColor;

        const dot = document.createElement("div");
        dot.className = "fzStatusDot";
        dot.style.backgroundColor = "#ff0000";
        // dot wird hier zwar erstellt, aber in updateTile sofort ausgeblendet
        div.appendChild(dot);

        div.insertAdjacentHTML("beforeend",
                               `<div style="display:flex;align-items:center;flex:1;overflow:hidden;">${iconHtml}<span class="fzTileName">${key}</span></div>
             <span class="fzTileCount"><span class="fzNumToday">${v}</span><span class="fzNumYday">(${y})</span></span>`);

        div.onclick = () => showDetails(key, state);

        tileEls[key] = div;
        return div;
    }

    function showDetails(key, state) {
        const data = state.det[key] || {};
        const list = Object.entries(data).sort((a, b) => b[1] - a[1]).map(([n, c]) => `<div class="fzRow"><span>${n}</span><b>${c}</b></div>`).join("") || "<div style='padding:10px;text-align:center;color:#999'>Keine detaillierten Daten für heute.</div>";
        const ol = document.createElement("div"); ol.className = "fzModalOverlay"; ol.onclick = (e) => { if (e.target === ol) ol.remove(); };
        ol.innerHTML = `<div class="fzModal"><h3>${key} (Heute)</h3><div style="max-height: 400px; overflow-y: auto;">${list}</div><button class="fzBtn" style="margin-top:15px;width:100%" onclick="this.closest('.fzModalOverlay').remove()">Schließen</button>
          </div>`;
        document.body.appendChild(ol);
    }

    function showKataAlert() {
        const ol = document.createElement("div"); ol.className = "fzModalOverlay"; ol.onclick = (e) => { if (e.target === ol) ol.remove(); };
        ol.innerHTML = `<div class="fzModal" style="text-align:center; border: 4px solid red;"><h2 style="color:red; margin-top:0;">Katastrophenalarm Bielefeld</h2><div style="font-size:18px; line-height:1.5; font-weight:bold; margin:20px 0;">Alle Rettungsmittel und Einsatzfahrzeuge sind alarmiert und befinden sich auf Anfahrt</div><div style="color:#666; font-size:12px;">(Fenster schließt in 5 Sekunden)</div></div>`;
        document.body.appendChild(ol); setTimeout(() => { if (ol) ol.remove(); }, 5000);
    }

    function toggleCompactMode() {
        uiSettings.compactMode = !uiSettings.compactMode; saveUI();
        if (fzWrapper) { if (uiSettings.compactMode) fzWrapper.classList.add("fzCompact"); else fzWrapper.classList.remove("fzCompact"); }
    }

    function exportSettings() {
        const dataStr = JSON.stringify(uiSettings, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "dcc_settings.json"; a.click(); URL.revokeObjectURL(url);
    }

    function exportStatsCSV() {
        const todayData = state.today;
        let csvContent = "data:text/csv;charset=utf-8,Fahrzeug;Anzahl_Heute\n";
        KEYS.forEach(k => { const count = todayData[k] || 0; if (count > 0) csvContent += `${k};${count}\n`; });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `dcc_fahrzeuge_${getTodayString()}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

    function importSettings() {
        const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
        input.onchange = (e) => {
            const file = e.target.files[0]; if (!file) return;
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
        ol.onclick = (e) => { if (e.target === ol) ol.remove(); };

        const modal = document.createElement("div");
        modal.className = "fzModal";
        modal.innerHTML = `
            <h3>Kachel-Sortierung</h3>
            <div class="fzSetGroup">
                <div class="fzRow">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="radio" name="sortOrder" value="category" style="margin:0;"> Nach Kategorie (FW, RD, POL, etc.)
                    </label>
                </div>
                <div class="fzRow">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="radio" name="sortOrder" value="alphabetical" style="margin:0;"> Alphabetisch (A-Z)
                    </label>
                </div>
            </div>
            <button class="fzBtn" style="margin-top:15px;width:100%" onclick="this.closest('.fzModalOverlay').remove()">Schließen</button>
        `;

        const radioButtons = modal.querySelectorAll('input[name="sortOrder"]');
        radioButtons.forEach(radio => {
            if (radio.value === uiSettings.tileSortOrder) {
                radio.checked = true;
            }
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
        const ol = document.createElement("div"); ol.className = "fzModalOverlay";
        const modal = document.createElement("div"); modal.className = "fzModal"; modal.innerHTML = `<h3>Einstellungen</h3>`;
        const createInput = (label, key, type = "text", opts = []) => {
            const row = document.createElement("div"); row.className = "fzRow"; row.innerHTML = `<span>${label}</span>`;
            let inp;
            if (type === "select") {
                inp = document.createElement("select");
                opts.forEach(o => { const opt = document.createElement("option"); opt.value = o; opt.textContent = o === "category" ? "Nach Kategorie" : "Alphabetisch"; if (uiSettings[key] === o) opt.selected = true; inp.appendChild(opt); });
            } else {
                inp = document.createElement("input"); inp.type = type; inp.value = uiSettings[key]; inp.className = type === "color" ? "fzColor" : "fzInput";
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
        const group = (title) => { const d = document.createElement("div"); d.className = "fzSetGroup"; d.innerHTML = `<h4>${title}</h4>`; return d; };
        const groups = [
            { t: "Fenster Layout", i: [["Max Höhe", "winMaxHeight", "number"], ["Oben", "winTop", "number"], ["Links", "winLeft", "number"], ["BG", "winBg", "color"], ["Rahmen", "winBorderC", "color"], ["Dicke", "winBorderW", "number"], ["Radius", "winRadius", "number"]] },
            { t: "Kachelkopf", i: [["BG", "colBg", "color"], ["Farbe", "colColor", "color"], ["Größe", "colSize", "number"], ["Ausrichtung", "colAlign", "select", ["left", "center", "right"]]] },
            { t: "Fahrzeugkacheln", i: [["BG", "rowBg", "color"], ["Farbe", "rowColor", "color"], ["Größe", "rowSize", "number"], ["Ausrichtung", "rowAlign", "select", ["left", "center", "right"]]] },
            { t: "Zahlenanzeige", i: [["Heute Farbe", "numTodayColor", "color"], ["Heute Größe", "numTodaySize", "number"], ["Gestern Farbe", "numYdayColor", "color"], ["Gestern Größe", "numYdaySize", "number"], ["Ausrichtung", "numAlign", "select", ["left", "right"]]] },
            { t: "Verhalten", i: [["Einblendzeit (s)", "autoHideSeconds", "number"], ["Klicks pro Aktion", "clickIncrement", "number"], ["Spaltenanzahl", "columns", "number"]] }
        ];
        groups.forEach(g => { const d = group(g.t); g.i.forEach(item => d.appendChild(createInput(item[0], item[1], item[2], item[3]))); modal.appendChild(d); });
        const footer = document.createElement("div"); footer.style.marginTop = "15px"; footer.style.display = "flex"; footer.style.gap = "10px"; footer.style.alignItems = "center";
        const btnSave = document.createElement("button"); btnSave.className = "fzBtn"; btnSave.textContent = "💾 Exportieren"; btnSave.onclick = exportSettings;
        const btnLoad = document.createElement("button"); btnLoad.className = "fzBtn"; btnLoad.textContent = "📂 Importieren"; btnLoad.onclick = importSettings;
        const btnCsv = document.createElement("button"); btnCsv.className = "fzBtn"; btnCsv.textContent = "📊 CSV Export"; btnCsv.onclick = exportStatsCSV;
        const btnClose = document.createElement("button"); btnClose.className = "fzBtn"; btnClose.textContent = "Schließen"; btnClose.onclick = () => ol.remove();
        footer.appendChild(btnSave); footer.appendChild(btnLoad); footer.appendChild(btnCsv); footer.appendChild(document.createElement("div")).style.flex = "1"; footer.appendChild(btnClose);
        modal.appendChild(footer); ol.appendChild(modal); document.body.appendChild(ol);
    }

    function startCountdown() {
        if (!fzWrapper) return;
        isHovering = false;
        if (safeHideTimer) clearTimeout(safeHideTimer);
        if (animFrameId) cancelAnimationFrame(animFrameId);
        const bar = document.getElementById("fzTimerFill");
        if (!bar) {
            safeHideTimer = setTimeout(() => { if (!isHovering) fzWrapper.classList.add("fzHidden"); }, uiSettings.autoHideSeconds * 1000);
            return;
        }
        hideDuration = uiSettings.autoHideSeconds * 1000;
        hideStartTime = Date.now();
        function loop() {
            if (isHovering) return;
            const elapsed = Date.now() - hideStartTime;
            const remaining = Math.max(0, hideDuration - elapsed);
            const pct = (remaining / hideDuration) * 100;
            bar.style.width = pct + "%";
            if (pct <= 15) bar.style.backgroundColor = "#dc3545";
            else if (pct <= 50) bar.style.backgroundColor = "#ffc107";
            else bar.style.backgroundColor = "#28a745";

            if (remaining > 0) {
                animFrameId = requestAnimationFrame(loop);
            } else {
                fzWrapper.classList.add("fzHidden");
            }
        }
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
        if (bar) { bar.style.width = "100%"; bar.style.backgroundColor = "#28a745"; }
    }

    function initUI(state) {
        if (fzWrapper || !isMainPage) return;
        injectCSS();

        const trigger = document.createElement("div");
        trigger.className = "fzTriggerZone";
        trigger.onmouseenter = () => { resetCountdown(); if (fzWrapper) fzWrapper.classList.remove("fzHidden"); };
        document.body.appendChild(trigger);

        fzWrapper = document.createElement("div");
        fzWrapper.className = "fzWrapper";
        if (uiSettings.compactMode) fzWrapper.classList.add("fzCompact");

        fzWrapper.onmouseleave = () => { startCountdown(); };
        fzWrapper.onmouseenter = () => { resetCountdown(); fzWrapper.classList.remove("fzHidden"); };

        const fzHeader = document.createElement("div");
        fzHeader.className = "fzHeader";

        const rankEl = document.getElementById("current_level");
        const rankText = rankEl ? rankEl.textContent.trim() : "";

        // Remove Search and Filter logic from HTML
        fzHeader.innerHTML = `
                <div class="left-section">
                    <div id="fzMissionStats" class="fzMissionStats">
                        ${getMissionStatsHTML()}
                    </div>
                    <div style="font-size:9px; color:#000000; line-height:1; margin-bottom:1px;">
                        Verbleibende Zeit
                    </div>
                    <div class="fzTimerContainer">
                        <div id="fzTimerFill"></div>
                    </div>
                    <div id="fzStatusList" class="fzStatusList"></div>
                    <div class="fzFilterBadges" id="fzFilterBadges"></div>
                </div>

                <div class="right-section">
                    <div class="right-section-top-row">
                        <!-- Last Update Time -->
                        <div class="fzLastUpdate" id="fzLastUpdate">Letztes Update: --:--:--</div>
                        <!-- Refresh Button -->
                        <span class="fzHeadBtn" id="fzRefreshButton" title="Fahrzeugstatus aktualisieren" style="font-size:14px;">${ICONS.refresh}</span>
                        <span id="fzAvailIndicator"
                              title="Klicken, um Details zur Fahrzeugverfügbarkeit zu sehen">
                            ✓ - • ⧗ - • ✗ -
                        </span>
                        <div class="branding-group">
                            <div class="branding-text">
                                <div style="font-weight:bold; font-size:15px; color:#000000; user-select:none;">Leitstelle Bielefeld</div>
                                ${rankText ? `<div style="font-size:10px; color:#444;">${rankText}</div>` : ""}
                            </div>
                            <a href="https://feuerwehr-bielefeld.de/" target="_blank" class="logo-link">
                               <img src="https://feuerwehr-bielefeld.de/wp-content/uploads/2019/05/cropped-Feuerwehr-Bielefeld-Logo-1.png"
                                    style="height:35px; width:auto;"
                                    alt="Feuerwehr Bielefeld Logo">
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
                </div>`;
            fzWrapper.appendChild(fzHeader);

            // Logic to handle Mouse + V Dragging
            fzHeader.addEventListener("mousedown", (e) => {
                if (vKeyPressed) {
                    isDragging = true;
                    dragStartX = e.clientX;
                    dragStartY = e.clientY;
                    dragStartLeft = uiSettings.winLeft;
                    dragStartTop = uiSettings.winTop;
                    e.preventDefault(); // Prevent text selection
                    document.body.style.cursor = "move";
                }
            });

            setTimeout(() => {
                // Attach event listeners for header buttons
                document.getElementById("fzAvailIndicator").onclick = showMissingAvailabilityModal;
                document.getElementById("fzRefreshButton").onclick = updateAvailability;
                document.getElementById("fzSortButton").onclick = openSortSettingsModal;
                document.getElementById("fzToggleCompact").onclick = toggleCompactMode;
                document.getElementById("fzMinimizeButton").onclick = (e) => { e.stopPropagation(); fzWrapper.classList.add("fzHidden"); };
                document.getElementById("fzSettingsButton").onclick = openSettings;
                document.getElementById("fzStationButton").onclick = () => window.open("/buildings/26017007", "_blank");
                document.getElementById("fzMapButton").onclick = () => window.open("/leitstellenansicht", "_blank");
                document.getElementById("fzSchoolButton").onclick = () => window.open("/buildings/26017007#tab_schooling", "_blank");

                renderAvailabilityIndicator();
            }, 100);

            setInterval(() => {
                const statsEl = document.getElementById("fzMissionStats");
                if (statsEl) statsEl.innerHTML = getMissionStatsHTML();
            }, 3000);

            const scrollArea = document.createElement("div"); scrollArea.className = "fzScrollArea";
            uiRoot = document.createElement("div"); uiRoot.className = "fzGrid";

            const redrawGrid = () => {
                uiRoot.innerHTML = "";
                tileEls = {};

                for (let i = 0; i < uiSettings.columns; i++) {
                    const h = document.createElement("div");
                    h.className = "fzColHeader";
                    h.textContent = "Fahrzeuge Heute/Gestern";
                    uiRoot.appendChild(h);
                }

                let filteredTiles = [...TILE_LIST];

                if (uiSettings.activeCategoryFilter === "status_green") {
                    filteredTiles = filteredTiles.filter(tileMeta => vehicleAvailability[tileMeta.n] === true);
                } else if (uiSettings.activeCategoryFilter === "status_red") {
                    filteredTiles = filteredTiles.filter(tileMeta => vehicleExists[tileMeta.n] === true && vehicleAvailability[tileMeta.n] !== true);
                } else if (uiSettings.activeCategoryFilter === "Bergrettung") {
                    filteredTiles = filteredTiles.filter(tileMeta =>
                                                         tileMeta.cat === "Wasser/Berg" &&
                                                         (tileMeta.norm.includes(normalize("Bergrettung")) ||
                                                          tileMeta.search.some(s => s.includes(normalize("bergrettung"))))
                                                        );
                } else if (uiSettings.activeCategoryFilter !== "all") {
                    filteredTiles = filteredTiles.filter(tileMeta => tileMeta.cat === uiSettings.activeCategoryFilter);
                }

                if (uiSettings.searchFilter) {
                    const normalizedSearch = normalize(uiSettings.searchFilter);
                    filteredTiles = filteredTiles.filter(tileMeta =>
                                                         tileMeta.norm.includes(normalizedSearch) ||
                                                         tileMeta.search.some(sTerm => sTerm.includes(normalizedSearch))
                                                        );
                }

                let sortedTiles = [...filteredTiles];

                if (uiSettings.tileSortOrder === "alphabetical") {
                    sortedTiles.sort((a, b) => a.n.localeCompare(b.n));
                } else if (uiSettings.tileSortOrder === "category") {
                    sortedTiles.sort((a, b) => {
                        const catA = a.cat || "Sonstiges";
                        const catB = b.cat || "Sonstiges";
                        const orderA = categoryOrderMap.get(catA) ?? 999;
                        const orderB = categoryOrderMap.get(catB) ?? 999;

                        if (orderA === orderB) {
                            return a.n.localeCompare(b.n);
                        }
                        return orderA - orderB;
                    });
                }

                sortedTiles.forEach(tileMeta => {
                    const newTile = createTile(tileMeta.n, state);
                    if (newTile) {
                        uiRoot.appendChild(newTile);
                    }
                });
                KEYS.forEach(k => updateTile(k, state));
            };

            window._fzRedrawGrid = redrawGrid;

            redrawGrid();
            scrollArea.appendChild(uiRoot);
            fzWrapper.appendChild(scrollArea);

            document.body.appendChild(fzWrapper);
            startCountdown();
        }

    // =========================================================================
    // TEIL 7: EVENT LISTENER
    // =========================================================================

    // Key Listeners for 'V'
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

    // Mouse Listeners for Dragging
    document.addEventListener("mousemove", (e) => {
        if (isDragging && fzWrapper) {
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            uiSettings.winLeft = dragStartLeft + dx;
            uiSettings.winTop = dragStartTop + dy;

            fzWrapper.style.left = uiSettings.winLeft + "px";
            fzWrapper.style.top = uiSettings.winTop + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = "default";
            saveUI(); // Save position
        }
    });

    document.addEventListener("click", (e) => {
        const activeEl = e.target.closest("a, button, input[type='submit'], div.btn, span.btn");
        if (!activeEl) {
            return;
        }

        const text = (activeEl.textContent || activeEl.value || "").trim().toLowerCase();

        if (text.includes("zelle") || text.includes("gewahrsam") || text.includes("gefangene") || text.includes("justiz") || text.includes("sheriff") || text.includes("gefangenentransport") || text.includes("polizeizelle") || text.includes("jva") || text.includes("haft")) {
            incrementTileCount("Gefangene", activeEl);
            return;
        }
        if (text.includes("anfahren") || text.includes("transportieren") || text.includes("notaufnahme") || text.includes("patienten") || text.includes("patiententransport") || text.includes("krankenhaus") || text.includes("klinik") || text.includes("abliefern") || text.includes("abgegeben") || text.includes("patient an bord")) {
            incrementTileCount("Patienten", activeEl);
            return;
        }

        const isValidArea = activeEl.closest("#mission_aao, .vehicle_select_table, .aao, #mission-window, .aao-grid, .mission_panel_content, .missionMap, #vehicle_table, .vehicle-table, .mission-vehicles");
        if (!isValidArea) {
            return;
        }

        const key = identifyClick(activeEl);
        if (key) {
            incrementTileCount(key, activeEl);

            if (key === "Katastrophenalarm Bielefeld") {
                if (isMainPage) showKataAlert();
                KEYS.forEach(vehicleKey => {
                    if (vehicleKey !== "Katastrophenalarm Bielefeld" && vehicleKey !== "Patienten" && vehicleKey !== "Gefangene") {
                        incrementTileCount(vehicleKey, activeEl);
                    }
                });
                incrementTileCount("Patienten", activeEl);
            }
        }
    }, true);

    window.addEventListener("storage", (e) => {
        if (e.key === STORAGE.SYNC_SIGNAL) {
            state.today = store.load(STORAGE.COUNTS_TODAY);
            state.total = store.load(STORAGE.COUNTS_TOTAL);
            state.yday = store.load(STORAGE.YDAY_COUNTS);
            state.det = json.load(STORAGE.DETAILS_TODAY, {});
            if (isMainPage) {
                KEYS.forEach(k => updateTile(k, state));
            }
        }
    });

    setInterval(() => {
        if (document.hidden) return;
        if (checkVehicleDayReset(state)) {
            if (isMainPage) {
                window._fzRedrawGrid();
                updateAvailability();
            }
        }
    }, 1000);

    setInterval(updateAvailability, 120000);

    if (isMainPage) {
        setTimeout(() => {
            initUI(state);
            updateAvailability();
        }, 500);
    }
    })();
