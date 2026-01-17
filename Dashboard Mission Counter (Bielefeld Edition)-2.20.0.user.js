// ==UserScript==
// @name         Dashboard Mission Counter (Bielefeld Edition)
// @namespace    https://leitstellenspiel.de/
// @version      2.20.0
// @description  5 Fenster. Zählt Patienten/Gefangene via Funk (Status 7). Erkennt GefKw, LPol, Zivilstreife etc.
// @match        https://www.leitstellenspiel.de/*
// @updateURL    https://github.com/Bobelle-Homebase/Leitstelle-Bielefeld/blob/main/Dashboard%20Mission%20Counter%20(Bielefeld%20Edition)-2.20.0.user.js
// @downloadURL  https://github.com/Bobelle-Homebase/Leitstelle-Bielefeld/blob/main/Dashboard%20Mission%20Counter%20(Bielefeld%20Edition)-2.20.0.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(() => {
    "use strict";

    // ------------------------------------------------------------------
    // 1. KONFIGURATION
    // ------------------------------------------------------------------

    const CFG = {
        boxId: "lssMissionCounterBox",
        btnId: "lssMissionCounterBtn",
        urls: {
            leitstelle: "/buildings/26017007",
            wachen: "/leitstellenansicht",
            schule: "/buildings/26017007#tab_schooling"
        },
        selectors: {
            emergency: "#mission_select_emergency",
            ktp: "#mission_select_krankentransport",
            started: "#mission_select_started",
        },
        visiblePaths: new Set(["/", "/home", ""]),
        intervalMs: 1200,
        autocloseMs: 20000,
        storeKeyPos: "lssmc_btn_pos_custom_bielefeld_final",
        storeKeyDaily: "lssmc_daily_stats_v3_prisoner_names"
    };

    const UI = {
        panelBg: "rgba(201, 48, 44, 0.9)",
        panelBorder: "rgba(172, 41, 37, 0.9)",
        panelText: "#ffffff",
        panelActive: "#ffff00",

        btnSize: 48,
        btnBg: "rgba(201, 48, 44, 0.9)",
        btnBorder: "rgba(172, 41, 37, 0.9)",

        btnIcon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.5 13c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-13 0c.83 0 1.5-.67 1.5-1.5S6.33 10 5.5 10 4 10.67 4 11.5 4.67 13 5.5 13zM18 6l-2.5-4H8.5L6 6H2v13h2V8h16v11h2V6h-4zM8 1c.55 0 1 .45 1 1v1H7V2c0-.55.45-1 1-1zm10 0c.55 0 1 .45 1 1v1h-2V2c0-.55.45-1 1-1zm-7 14h-2v-2h-2v2H7v2h2v2h2v-2h2v-2zm7-1.5c0-.83-.67-1.5-1.5-1.5S15 12.67 15 13.5 15.67 15 16.5 15s1.5-.67 1.5-1.5z"/></svg>',
    };

    // Liste der Fahrzeuge/Begriffe, die als Gefangenen-Transport zählen
    const PRISONER_VEHICLES = [
        "LPol GefKw",
        "GefKw",
        "Gefangenenkraftwagen",
        "Gefangenentransport",
        "Zivilstreifenwagen",
        "gefang" // Fallback für alles was "gefangene" enthält
    ];


    // ------------------------------------------------------------------
    // 2. ZUSTANDSVERWALTUNG
    // ------------------------------------------------------------------

    const state = {
        btn: null,
        box: null,
        vKeyDown: false,
        isDragging: false,
        autocloseTimer: null,
        daily: {
            date: new Date().toLocaleDateString(),
            patients: 0,
            prisoners: 0
        },
        lastSeenPat: 0,
        lastSeenPris: 0,
        observer: null
    };


    // ------------------------------------------------------------------
    // 3. KERNLOGIK
    // ------------------------------------------------------------------

    function init() {
        injectStyles();
        createElements();
        loadAndApplyPosition();
        loadDailyStats();
        setupRadioObserver();
        attachEventListeners();
        setTimeout(() => {
            update();
            setInterval(update, CFG.intervalMs);
        }, 800);
    }

    function loadDailyStats() {
        const saved = GM_getValue(CFG.storeKeyDaily, null);
        const today = new Date().toLocaleDateString();

        if (saved && saved.date === today) {
            state.daily = saved;
        } else {
            state.daily = { date: today, patients: 0, prisoners: 0 };
            GM_setValue(CFG.storeKeyDaily, state.daily);
        }
    }

    function saveDailyStats() {
        GM_setValue(CFG.storeKeyDaily, state.daily);
    }

    // --- FUNK SCANNER ---
    function setupRadioObserver() {
        const radioContainer = document.getElementById("radio_messages");
        if (!radioContainer) return;

        state.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        analyzeRadioMessage(node);
                    }
                });
            });
        });

        state.observer.observe(radioContainer, { childList: true, subtree: true });
    }

    function analyzeRadioMessage(node) {
        const text = node.textContent || "";

        // Status 7 = Transport beginnt
        if (text.includes("S 7") || text.includes("Status 7")) {

            const lowerText = text.toLowerCase();

            // Prüfen, ob eines der Gefangenen-Fahrzeuge im Text vorkommt
            const isPrisonerTransport = PRISONER_VEHICLES.some(vehicle => lowerText.includes(vehicle.toLowerCase()));

            if (isPrisonerTransport) {
                state.daily.prisoners++;
            } else {
                // Alles andere (KTW, RTW, RTH, etc.) zählt als Patient
                state.daily.patients++;
            }

            saveDailyStats();
            // GUI sofort updaten
            const counts = getCounts();
            render(counts);
        }
    }
    // --------------------

    function updateDailyStatsFromList(currentPat, currentPris) {
        // Zählt zusätzlich hoch, wenn Balken/Icons in der Liste erscheinen
        if (currentPat > state.lastSeenPat) {
            state.daily.patients += (currentPat - state.lastSeenPat);
            saveDailyStats();
        }
        state.lastSeenPat = currentPat;

        if (currentPris > state.lastSeenPris) {
            state.daily.prisoners += (currentPris - state.lastSeenPris);
            saveDailyStats();
        }
        state.lastSeenPris = currentPris;

        const today = new Date().toLocaleDateString();
        if (state.daily.date !== today) {
            state.daily = { date: today, patients: 0, prisoners: 0 };
            saveDailyStats();
        }
    }

    function update() {
        const isVisible = CFG.visiblePaths.has(location.pathname);
        state.btn.style.display = isVisible ? "flex" : "none";
        state.box.style.display = isVisible && state.box.classList.contains("open") ? "flex" : "none";
        if (!isVisible) return;

        const counts = getCounts();

        updateDailyStatsFromList(counts.activePatients, counts.activePrisoners);

        render(counts);

        if (state.box.classList.contains("open")) {
            positionPanelRelativeToBtn();
        }
    }

    function getCounts() {
        const readHeader = (sel) => {
            const el = document.querySelector(sel);
            if (!el) return { open: 0, max: 0 };
            const match = (el.textContent || "").match(/(\d+)\s*\/\s*(\d+)/);
            return match ? { open: parseInt(match[1], 10), max: parseInt(match[2], 10) } : { open: 0, max: 0 };
        };

        const readSingle = (sel) => {
            const el = document.querySelector(sel);
            if (!el) return 0;
            const counterSpan = el.querySelector(".counter");
            const text = (counterSpan ? counterSpan.textContent : el.textContent).replace(/\D/g, "");
            return text ? parseInt(text, 10) : 0;
        };

        const countStrict = (listId) => {
            const list = document.getElementById(listId);
            if (!list) return 0;
            const entries = Array.from(list.querySelectorAll(".missionSideBarEntry"));
            let count = 0;
            entries.forEach(entry => {
                const isGreen = (entry.getElementsByClassName("panel-success").length > 0) || (entry.getElementsByClassName("mission_panel_green").length > 0);
                const userIcon = entry.querySelector(".glyphicon-user");
                const hasUserIcon = userIcon && !userIcon.classList.contains("hidden");
                const hasVehicleState = entry.getElementsByClassName("mission_vehicle_state").length > 0;
                const hasCarIcon = entry.querySelector(".fa-car") || entry.querySelector(".glyphicon-asterisk");

                if (isGreen || hasUserIcon || hasVehicleState || hasCarIcon) {
                    count++;
                }
            });
            return count;
        };

        const countPatients = () => {
            return document.querySelectorAll(".patient_progress_bar").length;
        };

        const countPrisoners = () => {
            return document.querySelectorAll(".mission_prisoners img").length;
        };

        return {
            emergency: readHeader(CFG.selectors.emergency),
            ktp: readHeader(CFG.selectors.ktp),
            alliance: countStrict("mission_list_alliance"),
            planned: countStrict("mission_list_sicherheitswache"),
            started: readSingle(CFG.selectors.started),
            activePatients: countPatients(),
            activePrisoners: countPrisoners()
        };
    }

    function render(counts) {
        const col = (n) => (n > 0 ? UI.panelActive : UI.panelText);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const htmlWindow1 = `
            <div class="lssmc-window">
                <div class="lssmc-title">Übersicht 1</div>
                <div class="lssmc-content">
                    <div class="lssmc-item">Eigene: <span style="color:${col(counts.emergency.open)}">${counts.emergency.open}</span></div>
                    <div class="lssmc-item">KTW: <span style="color:${col(counts.ktp.open)}">${counts.ktp.open}</span></div>
                </div>
            </div>`;

        const htmlWindow2 = `
            <div class="lssmc-window">
                <div class="lssmc-title">Übersicht 2</div>
                <div class="lssmc-content">
                    <div class="lssmc-item">Verband: <span style="color:${col(counts.alliance)}">${counts.alliance}</span></div>
                    <div class="lssmc-item">Geplant: <span style="color:${col(counts.planned)}">${counts.planned}</span></div>
                </div>
            </div>`;

        const htmlWindow3 = `
            <div class="lssmc-window lssmc-window-timer">
                <div class="lssmc-title">Übersicht 3</div>
                <div class="lssmc-content">
                    <div class="lssmc-item">Gestartet: <span style="color:${col(counts.started)}">${counts.started}</span></div>
                </div>
                <div class="lssmc-update">${timeStr}</div>
            </div>`;

        const htmlWindow4 = `
            <div class="lssmc-window">
                <div class="lssmc-title">Übersicht 4</div>
                <div class="lssmc-content">
                    <a href="${CFG.urls.leitstelle}" target="_blank" class="lssmc-link">Leitstelle</a>
                    <a href="${CFG.urls.wachen}" target="_blank" class="lssmc-link">Wachen</a>
                    <a href="${CFG.urls.schule}" target="_blank" class="lssmc-link">Schulen</a>
                </div>
            </div>`;

        const htmlWindow5 = `
            <div class="lssmc-window">
                <div class="lssmc-title">Übersicht 5</div>
                <div class="lssmc-content">
                    <div class="lssmc-item">Patienten: <span style="color:${col(counts.activePatients)}">${counts.activePatients}</span> <small>(${state.daily.patients})</small></div>
                    <div class="lssmc-item">Gefangene: <span style="color:${col(counts.activePrisoners)}">${counts.activePrisoners}</span> <small>(${state.daily.prisoners})</small></div>
                </div>
            </div>`;

        state.box.innerHTML = htmlWindow1 + htmlWindow2 + htmlWindow3 + htmlWindow4 + htmlWindow5;
    }


    // ------------------------------------------------------------------
    // 4. EVENT-HANDLER
    // ------------------------------------------------------------------

    function attachEventListeners() {
        window.addEventListener("keydown", e => {
            if (e.key.toLowerCase() === "v" && !state.vKeyDown) {
                state.vKeyDown = true;
                state.btn.classList.add("drag-armed");
            }
        });
        window.addEventListener("keyup", e => {
            if (e.key.toLowerCase() === "v") {
                state.vKeyDown = false;
                state.btn.classList.remove("drag-armed");
            }
        });
        state.btn.addEventListener("pointerdown", onDragStart);
        state.btn.addEventListener("click", () => {
            if (state.isDragging) return;
            if (state.autocloseTimer) {
                clearTimeout(state.autocloseTimer);
                state.autocloseTimer = null;
            }
            state.box.classList.toggle("open");
            if (state.box.classList.contains("open")) {
                state.autocloseTimer = setTimeout(() => {
                    state.box.classList.remove("open");
                    update();
                }, CFG.autocloseMs);
            }
            update();
        });
        window.addEventListener("resize", () => {
            const rect = state.btn.getBoundingClientRect();
            const newLeft = clamp(rect.left, 0, window.innerWidth - UI.btnSize);
            const newTop = clamp(rect.top, 0, window.innerHeight - UI.btnSize);
            applyBtnPos(newLeft, newTop);
            savePos(newLeft, newTop);
            if (state.box.classList.contains("open")) {
                positionPanelRelativeToBtn();
            }
        });
    }

    let dragStartX, dragStartY, btnStartLeft, btnStartTop;

    function onDragStart(e) {
        if (e.button !== 0 || !state.vKeyDown) return;
        e.preventDefault(); e.stopPropagation();
        state.isDragging = false;
        state.btn.classList.add("dragging");
        state.btn.setPointerCapture?.(e.pointerId);
        const rect = state.btn.getBoundingClientRect();
        dragStartX = e.clientX; dragStartY = e.clientY;
        btnStartLeft = rect.left; btnStartTop = rect.top;
        window.addEventListener("pointermove", onDragMove, { passive: false });
        window.addEventListener("pointerup", onDragEnd, { once: true });
    }

    function onDragMove(e) {
        e.preventDefault();
        const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY;
        if (!state.isDragging && Math.abs(dx) + Math.abs(dy) > 5) state.isDragging = true;
        const newLeft = clamp(btnStartLeft + dx, 0, window.innerWidth - UI.btnSize);
        const newTop = clamp(btnStartTop + dy, 0, window.innerHeight - UI.btnSize);
        applyBtnPos(newLeft, newTop);
        if (state.box.classList.contains("open")) positionPanelRelativeToBtn();
    }

    function onDragEnd() {
        state.btn.classList.remove("dragging");
        window.removeEventListener("pointermove", onDragMove);
        const rect = state.btn.getBoundingClientRect();
        savePos(rect.left, rect.top);
        setTimeout(() => { state.isDragging = false; }, 50);
    }


    // ------------------------------------------------------------------
    // 5. UI & HILFSFUNKTIONEN
    // ------------------------------------------------------------------

    function createElements() {
        state.btn = document.createElement("div");
        state.btn.id = CFG.btnId;
        state.btn.innerHTML = `<span>${UI.btnIcon}</span>`;
        document.body.appendChild(state.btn);
        state.box = document.createElement("div");
        state.box.id = CFG.boxId;
        document.body.appendChild(state.box);
    }

    function injectStyles() {
        GM_addStyle(`
            #${CFG.btnId} {
                position: fixed; z-index: 999999;
                width: ${UI.btnSize}px; height: ${UI.btnSize}px;
                border-radius: 4px; background: ${UI.btnBg};
                border: 1px solid ${UI.btnBorder};
                backdrop-filter: blur(2px);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                user-select: none; touch-action: none;
                padding: 8px;
                box-sizing: border-box;
            }
            #${CFG.btnId}.drag-armed { outline: 2px dashed rgba(255,255,255,0.8); outline-offset: 2px; }
            #${CFG.btnId}.dragging { cursor: grabbing; }
            #${CFG.btnId} span {
                width: 100%; height: 100%;
                color: white; pointer-events: none;
                display: flex; align-items: center; justify-content: center;
            }

            #${CFG.boxId} {
                position: fixed; z-index: 1000000;
                background: transparent; border: none; box-shadow: none;
                display: none; flex-direction: row; gap: 8px;
                align-items: stretch;
            }
            #${CFG.boxId}.open { display: flex; }

            .lssmc-window {
                position: relative;
                background: ${UI.panelBg};
                border: 1px solid ${UI.panelBorder};
                backdrop-filter: blur(2px);
                border-radius: 4px; color: ${UI.panelText};
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                font-size: 14px; line-height: 1.4;
                padding: 4px 10px 6px 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                white-space: nowrap;
                display: flex; flex-direction: column;
                min-width: 80px;
            }

            .lssmc-title {
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.7);
                border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                margin-bottom: 4px;
                padding-bottom: 2px;
                text-align: left;
            }

            .lssmc-content {
                display: flex; flex-direction: column; gap: 2px;
                flex-grow: 1;
            }

            .lssmc-link {
                color: #ffffff;
                text-decoration: none;
                display: block;
                cursor: pointer;
            }
            .lssmc-link:hover {
                color: #ffff00;
                text-decoration: underline;
            }

            .lssmc-window-timer { padding-bottom: 14px; }

            .lssmc-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

            .lssmc-update {
                position: absolute;
                bottom: 2px; right: 4px;
                font-size: 9px;
                color: rgba(255, 255, 255, 0.5);
                pointer-events: none; line-height: 1;
            }
        `);
    }

    function loadAndApplyPosition() {
        const pos = GM_getValue(CFG.storeKeyPos, null);
        if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
            applyBtnPos(pos.left, pos.top);
        } else {
            const left = 861;
            const top = 939;
            applyBtnPos(left, top);
            savePos(left, top);
        }
    }

    function applyBtnPos(left, top) {
        state.btn.style.left = `${left}px`;
        state.btn.style.top = `${top}px`;
        state.btn.style.right = 'auto';
        state.btn.style.bottom = 'auto';
    }

    function savePos(left, top) {
        GM_setValue(CFG.storeKeyPos, { left, top });
    }

    function positionPanelRelativeToBtn() {
        const btnRect = state.btn.getBoundingClientRect();
        const boxRect = state.box.getBoundingClientRect();
        const boxW = boxRect.width || 300;
        const boxH = boxRect.height || 60;
        const gap = 8;
        let left = btnRect.right - boxW;
        let top = btnRect.top - gap - boxH;
        left = clamp(left, 6, window.innerWidth - boxW - 6);
        top = clamp(top, 6, window.innerHeight - boxH - 6);
        state.box.style.left = `${left}px`;
        state.box.style.top = `${top}px`;
    }

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    init();
})();
