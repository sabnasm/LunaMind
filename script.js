/* ==========================================
   LUNAMIND - ADVANCED MISSION CONTROL
   Educational Lunar Simulation
========================================== */

// GAME CONFIGURATION
const TOTAL_DAYS = 7;

const initialResources = {
    oxygen: 100,
    water: 100,
    food: 100,
    power: 100
};

const dailyConsumption = {
    oxygen: 8,
    water: 10,
    food: 7,
    power: 9
};

// GAME STATE
let resources = { ...initialResources };
let missionDay = 1;
let missionStarted = false;
let missionEnded = false;
let missionHistory = [];

// HTML ELEMENTS
const startBtn = document.getElementById("startBtn");
const nextDayBtn = document.getElementById("nextDayBtn");
const missionStatus = document.getElementById("missionStatus");

// CREW ACTIVITIES
const crewActivities = [
    "Monitoring life-support systems",
    "Conducting lunar surface research",
    "Inspecting power systems",
    "Checking water reserves",
    "Studying lunar soil samples",
    "Maintaining the lunar habitat",
    "Preparing the next mission report"
];
/* ==========================================
   INTERACTIVE LUNAR MISSION EVENTS
========================================== */

const missionEvents = [
    {
        title: "⚡ Power System Malfunction",
        description:
            "The lunar habitat's power system is experiencing an unexpected malfunction. The crew must respond quickly.",
        choices: [
            {
                text: "Activate emergency backup",
                effects: { power: -12, oxygen: 0, water: 0, food: 0 },
                result: "Backup power activated. The habitat remains operational."
            },
            {
                text: "Reduce non-essential power usage",
                effects: { power: -4, oxygen: 0, water: 0, food: 0 },
                result: "Non-essential systems were switched off, saving power."
            }
        ]
    },
    {
        title: "💧 Water Supply Warning",
        description:
            "The water recycling system is producing less water than expected.",
        choices: [
            {
                text: "Use stored reserve water",
                effects: { water: -12, power: -2, oxygen: 0, food: 0 },
                result: "Stored water was used to support the crew."
            },
            {
                text: "Introduce water conservation",
                effects: { water: -4, power: 0, oxygen: 0, food: 0 },
                result: "The crew adopted stricter water conservation."
            }
        ]
    },
    {
        title: "🥫 Food Storage Alert",
        description:
            "A storage inspection reveals that some food supplies are unavailable.",
        choices: [
            {
                text: "Use backup food supplies",
                effects: { food: -10, water: 0, oxygen: 0, power: 0 },
                result: "Backup food supplies were distributed."
            },
            {
                text: "Adjust meal portions",
                effects: { food: -4, water: 0, oxygen: 0, power: 0 },
                result: "The crew adjusted the food allocation."
            }
        ]
    },
    {
        title: "🌑 Lunar Dust Storm",
        description:
            "A simulated lunar dust event is affecting the habitat's external equipment.",
        choices: [
            {
                text: "Activate protective systems",
                effects: { power: -10, oxygen: 0, water: 0, food: 0 },
                result: "Protective systems were activated."
            },
            {
                text: "Pause external activities",
                effects: { power: -3, oxygen: 0, water: 0, food: 0 },
                result: "External activities were paused."
            }
        ]
    }
];

/* Show a mission event */

function showMissionEvent() {
    const event = missionEvents[
        Math.floor(Math.random() * missionEvents.length)
    ];

    const oldEvent = document.getElementById("missionEvent");
    if (oldEvent) oldEvent.remove();

    const eventBox = document.createElement("section");
    eventBox.id = "missionEvent";
    eventBox.className = "mission-event";

    const heading = document.createElement("h2");
    heading.textContent = event.title;

    const description = document.createElement("p");
    description.textContent = event.description;

    const choicesBox = document.createElement("div");
    choicesBox.className = "event-choices";

    event.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.className = "event-choice";
        button.textContent = choice.text;

        button.addEventListener("click", () => {
            applyEventChoice(choice);
            eventBox.remove();
        });

        choicesBox.appendChild(button);
    });

    eventBox.append(heading, description, choicesBox);

    const dashboard = document.querySelector(".dashboard");
    dashboard.after(eventBox);

    eventBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

/* Apply the selected decision */

function applyEventChoice(choice) {
    for (const resource in choice.effects) {
        resources[resource] = Math.max(
            0,
            Math.min(100, resources[resource] + choice.effects[resource])
        );
    }

    updateResources();
    addLog("COMMANDER DECISION: " + choice.result);

    missionStatus.textContent = choice.result;

    checkMissionStatus();
}
// DAILY MISSION BRIEFINGS
const dailyBriefings = [
    "Lunar habitat systems are being monitored.",
    "Science team is analysing lunar soil samples.",
    "Power systems have completed a routine inspection.",
    "Crew is checking water and food reserves.",
    "Mission control is reviewing habitat performance.",
    "Astronauts are completing final system checks.",
    "Final mission assessment is now underway."
];


// ==========================================
// INITIALIZE MISSION
// ==========================================

function initializeMission() {

    updateResources();
    createMissionLog();
    createCrewActivity();

    nextDayBtn.disabled = true;

    missionStatus.textContent =
        "Your lunar base is ready. Awaiting commander instructions.";

    addMissionDayDisplay();

    updateCrewStatus();
}


// ==========================================
// MISSION DAY DISPLAY
// ==========================================

function addMissionDayDisplay() {

    let dayDisplay = document.getElementById("missionDay");

    if (!dayDisplay) {

        dayDisplay = document.createElement("p");
        dayDisplay.id = "missionDay";

        missionStatus.after(dayDisplay);
    }

    dayDisplay.textContent =
        `🌙 MISSION DAY: ${missionDay} / ${TOTAL_DAYS}`;
}


// ==========================================
// RESOURCE MONITORING
// ==========================================

function updateResources() {

    for (const resource in resources) {

        const element = document.getElementById(resource);
        const bar = document.getElementById(resource + "Bar");

        if (element) {

            element.textContent = resources[resource] + "%";

            element.classList.remove("resource-update");
            void element.offsetWidth;
            element.classList.add("resource-update");
        }

        if (bar) {

            bar.style.width = resources[resource] + "%";

            bar.setAttribute(
                "aria-valuenow",
                resources[resource]
            );
        }

        const card = element?.closest(".resource");

        if (card) {

            card.classList.toggle(
                "resource-warning",
                resources[resource] <= 30
            );

            card.classList.toggle(
                "resource-critical",
                resources[resource] <= 15
            );
        }
    }
}


// ==========================================
// MISSION EVENT LOG
// ==========================================

function createMissionLog() {

    if (document.getElementById("missionLog")) return;

    const log = document.createElement("div");

    log.id = "missionLog";
    log.className = "mission-log";

    log.innerHTML = `
        <p class="eyebrow">MISSION RECORDS</p>
        <h2>Mission Event Log</h2>
        <div id="logEntries">
            <p>Waiting for mission activity...</p>
        </div>
    `;

    document.querySelector(".control-grid").after(log);
}


function addLog(message) {

    const entries = document.getElementById("logEntries");

    if (!entries) return;

    if (entries.children.length === 1 &&
        entries.textContent.includes("Waiting for mission activity")) {
        entries.innerHTML = "";
    }

    const entry = document.createElement("div");

    entry.className = "log-entry";

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const dayLabel = `DAY ${missionDay}`;

    const strong = document.createElement("strong");
    strong.textContent = `${dayLabel} · ${time}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    entry.append(strong, paragraph);

    entries.prepend(entry);

    missionHistory.push(message);
}


// ==========================================
// CREW ACTIVITY SYSTEM
// ==========================================

function createCrewActivity() {

    const crewCard = document.querySelector(".crew-card");

    if (!crewCard || document.getElementById("crewActivity")) return;

    const activity = document.createElement("div");

    activity.id = "crewActivity";
    activity.className = "crew-activity";

    activity.innerHTML = `
        <span class="activity-indicator"></span>
        <div>
            <strong>CREW ACTIVITY</strong>
            <p id="crewActivityText">Crew awaiting mission orders.</p>
        </div>
    `;

    crewCard.append(activity);
}


function updateCrewStatus() {

    const crewMembers = document.querySelectorAll(".crew-member");

    const activityText = document.getElementById("crewActivityText");

    crewMembers.forEach((member, index) => {

        const status = member.querySelector(".crew-status");

        member.classList.remove("crew-active");

        if (missionStarted && !missionEnded && index === (missionDay - 1) % crewMembers.length) {

            member.classList.add("crew-active");

            if (status) status.textContent = "ACTIVE";

        } else {

            if (status) {
                status.textContent = missionEnded ? "STANDBY" : "READY";
            }
        }
    });

    if (activityText) {

        activityText.textContent = missionStarted && !missionEnded
            ? crewActivities[(missionDay - 1) % crewActivities.length]
            : missionEnded
                ? "Mission activities completed."
                : "Crew awaiting mission orders.";
    }
}


// ==========================================
// AI-STYLE MISSION ASSISTANT
// ==========================================

function getMissionAdvice() {

    const lowestResource = Object.entries(resources)
        .sort((a, b) => a[1] - b[1])[0];

    const [name, value] = lowestResource;

    if (value <= 15) {
        return `🚨 CRITICAL ALERT: ${name.toUpperCase()} reserves are critically low!`;
    }

    if (value <= 30) {
        return `⚠️ WARNING: Monitor your ${name.toUpperCase()} reserves carefully.`;
    }

    if (value <= 50) {
        return `🔍 ADVISORY: ${name.toUpperCase()} is currently your lowest resource.`;
    }

    return "🟢 All resource levels are currently stable.";
}


// ==========================================
// START MISSION
// ==========================================

startBtn.addEventListener("click", function () {

    if (missionStarted) return;

    missionStarted = true;

    nextDayBtn.disabled = false;
    startBtn.disabled = true;

    startBtn.textContent = "MISSION IN PROGRESS";

    missionStatus.textContent =
        "🚀 Mission started! Lunar base is operational.";

    addMissionDayDisplay();
    updateCrewStatus();

    addLog("🚀 Mission officially started. All crew members are ready.");

});


// ==========================================
// ADVANCE MISSION DAY
// ==========================================

function nextDay() {

    if (!missionStarted || missionEnded) return;

    if (missionDay >= TOTAL_DAYS) {

        finishMission();
        return;
    }

    // SIMULATED DAILY RESOURCE CONSUMPTION
    for (const resource in resources) {

        resources[resource] = Math.max(
            0,
            resources[resource] - dailyConsumption[resource]
        );
    }

    missionDay++;

    updateResources();
    addMissionDayDisplay();
    updateCrewStatus();

    // DAILY MISSION EVENT
    const briefing = dailyBriefings[missionDay - 1];

    addLog(briefing);

    // MISSION ASSISTANT
    const advice = getMissionAdvice();

    addLog("MISSION ASSISTANT: " + advice);

    checkMissionStatus();
}


// ==========================================
// CHECK MISSION STATUS
// ==========================================

function checkMissionStatus() {

    const criticalResources = Object.keys(resources)
        .filter(resource => resources[resource] === 0);

    const lowResources = Object.keys(resources)
        .filter(resource =>
            resources[resource] > 0 &&
            resources[resource] <= 30
        );

    if (criticalResources.length > 0) {

        missionStatus.textContent =
            "🚨 Critical resource shortage! Simulation ended.";

        missionEnded = true;
        nextDayBtn.disabled = true;

        updateCrewStatus();
        addLog("🚨 Mission ended due to a critical resource shortage.");

        return;
    }

    if (lowResources.length > 0) {

        missionStatus.textContent =
            "⚠️ Low resources detected: " +
            lowResources.join(", ").toUpperCase();

    } else {

        missionStatus.textContent =
            "✅ Mission Day " + missionDay +
            " completed. All resources are stable.";

    }

    if (missionDay === TOTAL_DAYS) {

        finishMission();
    }
}


// ==========================================
// MISSION COMPLETION REPORT
// ==========================================

function finishMission() {

    if (missionEnded) return;

    missionEnded = true;
    nextDayBtn.disabled = true;

    const averageResource =
        Object.values(resources).reduce(
            (total, value) => total + value,
            0
        ) / Object.keys(resources).length;

    const score = Math.round(averageResource);

    if (score >= 70) {

        missionStatus.textContent =
            `🏆 Excellent mission! Final resource score: ${score}%.`;

    } else if (score >= 30) {

        missionStatus.textContent =
            `🌙 Mission completed! Final resource score: ${score}%.`;

    } else {

        missionStatus.textContent =
            `⚠️ Mission completed with low reserves. Final score: ${score}%.`;
    }

    startBtn.textContent = "MISSION COMPLETED";

    updateCrewStatus();

    addLog(`🏁 Mission completed. Final resource score: ${score}%.`);

}


// ==========================================
// RESTART MISSION
// ==========================================

function restartMission() {

    resources = { ...initialResources };

    missionDay = 1;
    missionStarted = false;
    missionEnded = false;

    missionHistory = [];

    startBtn.disabled = false;
    startBtn.textContent = "🚀 START MISSION";

    nextDayBtn.disabled = true;

    updateResources();
    addMissionDayDisplay();
    updateCrewStatus();

    missionStatus.textContent =
        "Mission reset. Awaiting commander instructions.";

    const entries = document.getElementById("logEntries");

    if (entries) {
        entries.innerHTML = "<p>Waiting for mission activity...</p>";
    }

    addLog("Mission simulation has been reset.");
}


// ==========================================
// CONNECT TO HTML
// ==========================================

window.nextDay = nextDay;
window.restartMission = restartMission;


// START SYSTEM
initializeMission();