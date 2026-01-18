// ==UserScript==
// @name         Einsatz Credits (Bielefeld Edition)
// @version      3.9.11
// @description  Dieses Script zeigt zu jedem Einsatz an, wie viele Credits man im Durchschnitt bekommt
// @author       Design by Bobelle
// @author       Design by Bobelle
// @match        https://www.leitstellenspiel.de/*
// @match        https://leitstellenspiel.de/*
// @grant        none
// @updateURL    Einsatz Credits (Bielefeld Edition)-3.9.11.user.js
// @downloadURL  Einsatz Credits (Bielefeld Edition)-3.9.11.user.js
// ==/UserScript==
(function () {
    'use strict';
    var requirements;
    function getResponseText(credits) {
        if (credits === null) {
            return '?';
        } else if (credits >= 10000) {
            return `<span class="label label-primary">${credits}</span>`;
        } else if (credits >= 7000) {
            return `<span class="label label-info">${credits}</span>`;
        } else if (credits >= 4000) {
            return `<span class="label label-success">${credits}</span>`;
        } else {
            return `<span class="label label-default">${credits}</span>`;
        }
    }
    var originalFunc = missionMarkerAdd;
    missionMarkerAdd = function (e) {
        originalFunc.apply(this, arguments);
        update(e);
    }
    async function update(e) {
        if (!window.sessionStorage.hasOwnProperty('aMissions') || JSON.parse(window.sessionStorage.aMissions).lastUpdate < (new Date().getTime() - 24 * 1000 * 60)) {
            await fetch('/einsaetze.json')
                .then(res => res.json())
                .then(data => window.sessionStorage.setItem('aMissions', JSON.stringify({
                    lastUpdate: new Date().getTime(),
                    value: data,
                    user_id: window.user_id
                })));
        }
        requirements = JSON.parse(window.sessionStorage.getItem("aMissions"));
        let missionList = $('.missionSideBarEntry');
        for (let i = 0; i < missionList.length; i++) {
            let childList = missionList[i].firstElementChild.firstElementChild.children;
            let isExist = false;
            if (e.id !== parseInt(missionList[i].getAttribute('mission_id'))) continue;
            for (let ic = 0; ic < childList.length; ic++) {
                if (childList[ic].className === 'missionCredits') {
                    isExist = true;
                    break;
                }
            }

            let missionTypeID = missionList[i].getAttribute('mission_type_id');
            if (missionTypeID === "null") continue;
            let credits = requirements.value.filter(e => e.id === missionTypeID)[0]['average_credits'];

            if (isExist === true && e.mtid !== null) {
                for (let j = 0; j < childList.length; j++) {
                    if (childList[j].className !== 'missionCredits') continue;
                    let child = childList[j];
                    missionList[i].firstElementChild.firstElementChild.removeChild(child);
                    child.innerHTML = getResponseText(credits);
                    missionList[i].firstElementChild.firstElementChild.appendChild(child);
                }
            } else {
                let missionRow = document.createElement('h5');
                missionRow.setAttribute('style', 'margin: 0;');
                missionRow.innerHTML = getResponseText(credits);
                missionRow.setAttribute("class", "missionCredits");
                missionRow.setAttribute("id", "missionCredits_" + missionList[i].getAttribute('mission_id'));
                missionList[i].firstElementChild.firstElementChild.appendChild(missionRow);
            }
        }
    }
    async function init() {
        if (!window.sessionStorage.hasOwnProperty('aMissions') || JSON.parse(window.sessionStorage.aMissions).lastUpdate < (new Date().getTime() - 24 * 1000 * 60)) {
            await fetch('/einsaetze.json')
                .then(res => res.json())
                .then(data => window.sessionStorage.setItem('aMissions', JSON.stringify({
                    lastUpdate: new Date().getTime(),
                    value: data,
                    user_id: window.user_id
                })));
        }
        requirements = JSON.parse(window.sessionStorage.getItem("aMissions"));
        let missionList = $('.missionSideBarEntry');
        $('.missionCredits').remove();
        for (let i = 0; i < missionList.length; i++) {
            let missionTypeID = missionList[i].getAttribute('mission_type_id');
            if (missionTypeID === "null") continue;
            let credits = requirements.value.filter(e => e.id === missionTypeID)[0]['average_credits'];
            if (credits === undefined) {
                requirements = await getMissionListByAPI();
                credits = requirements.value.filter(e => e.id === missionTypeID)[0]['average_credits'];
            }
            let missionRow = document.createElement('h5');
            missionRow.setAttribute('style', 'margin: 0;');
            missionRow.innerHTML = getResponseText(credits);
            missionRow.setAttribute("class", "missionCredits");
            missionRow.setAttribute("id", "missionCredits_" + missionList[i].getAttribute('mission_id'));
            missionList[i].firstElementChild.firstElementChild.appendChild(missionRow);
        }
    }
    init();
}
)();
