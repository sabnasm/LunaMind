
/* ==========================================
   LUNAMIND - ADVANCED MISSION CONTROL
   NASA DONKI DATA + LUNAR HABITAT SIMULATION
========================================== */

// ==========================================
// 1. GAME CONFIGURATION
// ==========================================

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

// ==========================================
// 2. ACHIEVEMENT SYSTEM
// ==========================================

let unlockedAchievements = [];
let decisionHistory = [];

const achievementList = [
    {
        id: "moonwalker",
        icon: "🌕",
        name: "Moonwalker",
        description: "Complete all 7 mission days."
    },
    {
        id: "water-guardian",
        icon: "💧",
        name: "Water Guardian",
        description: "Finish with at least 50% water."
    },
    {
        id: "power-protector",
        icon: "⚡",
        name: "Power Protector",
        description: "Finish with at least 50% power."
    },
    {
        id: "mission-master",
        icon: "🏆",
        name: "Mission Master",
        description: "Complete the mission with a resource score of 70% or higher."
    }
];

// ==========================================
// 3. GAME STATE
// ==========================================

let resources = { ...initialResources };

let missionDay = 1;
let missionStarted = false;
let missionEnded = false;

let missionHistory = [];

let nasaEvents = [];
let nasaAdvisoryDone = false;
// NASA observations connected to mission decisions
let nasaMissionImpacts = [];

// ==========================================
// 4. HTML ELEMENTS
// ==========================================

const startBtn = document.getElementById("startBtn");
const nextDayBtn = document.getElementById("nextDayBtn");
const missionStatus = document.getElementById("missionStatus");

// ==========================================
// 5. CREW ACTIVITIES
// ==========================================

const crewActivities = [
    "Monitoring life-support systems",
    "Conducting lunar surface research",
    "Inspecting power systems",
    "Checking water reserves",
    "Studying lunar soil samples",
    "Maintaining the lunar habitat",
    "Preparing the next mission report"
];

// ==========================================
// 6. DAILY MISSION EVENTS
// ==========================================

const missionEvents = [
    {
        title: "⚡ Power System Malfunction",
        description:
            "The lunar habitat's power system is experiencing an unexpected malfunction.",
        choices: [
            {
                text: "Activate emergency backup",
                effects: {
                    power: -12,
                    oxygen: 0,
                    water: 0,
                    food: 0
                },
                result:
                    "Backup power activated. The habitat remains operational."
            },
            {
                text: "Reduce non-essential power usage",
                effects: {
                    power: -4,
                    oxygen: 0,
                    water: 0,
                    food: 0
                },
                result:
                    "Non-essential systems were switched off."
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
                effects: {
                    water: -12,
                    power: -2,
                    oxygen: 0,
                    food: 0
                },
                result:
                    "Stored water was used to support the crew."
            },
            {
                text: "Introduce water conservation",
                effects: {
                    water: -4,
                    power: 0,
                    oxygen: 0,
                    food: 0
                },
                result:
                    "The crew adopted stricter water conservation."
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
                effects: {
                    food: -10,
                    water: 0,
                    oxygen: 0,
                    power: 0
                },
                result:
                    "Backup food supplies were distributed."
            },
            {
                text: "Adjust meal portions",
                effects: {
                    food: -4,
                    water: 0,
                    oxygen: 0,
                    power: 0
                },
                result:
                    "The crew adjusted the food allocation."
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
                effects: {
                    power: -10,
                    oxygen: 0,
                    water: 0,
                    food: 0
                },
                result:
                    "Protective systems were activated."
            },
            {
                text: "Pause external activities",
                effects: {
                    power: -3,
                    oxygen: 0,
                    water: 0,
                    food: 0
                },
                result:
                    "External activities were paused."
            }
        ]
    },
    {
        title: "🔬 Crew Research Challenge",
        description:
            "The science team has discovered an interesting lunar soil sample.",
        choices: [
            {
                text: "Continue the research",
                effects: {
                    power: -8,
                    oxygen: -3,
                    water: 0,
                    food: 0
                },
                result:
                    "The crew completed the research and collected scientific data."
            },
            {
                text: "Postpone the research",
                effects: {
                    power: -2,
                    oxygen: 0,
                    water: 0,
                    food: 0
                },
                result:
                    "The crew postponed research to conserve resources."
            }
        ]
    },
    {
        title: "🌕 Final Mission Challenge",
        description:
            "Mission Control requests a final habitat inspection before the mission concludes.",
        choices: [
            {
                text: "Complete full inspection",
                effects: {
                    power: -5,
                    oxygen: -2,
                    water: 0,
                    food: 0
                },
                result:
                    "The crew completed the final inspection."
            },
            {
                text: "Perform essential checks only",
                effects: {
                    power: -2,
                    oxygen: 0,
                    water: 0,
                    food: 0
                },
                result:
                    "Essential habitat checks were completed."
            }
        ]
    }
];

// ==========================================
// 7. DAILY BRIEFINGS
// ==========================================

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
// 8. INITIALIZE MISSION
// ==========================================

function initializeMission() {
    updateResources();

    createMissionLog();
    createDecisionTimeline();
    createCrewActivity();

    if (nextDayBtn) {
        nextDayBtn.disabled = true;
    }

    if (missionStatus) {
        missionStatus.textContent =
            "Your lunar base is ready. Awaiting commander instructions.";
    }

    addMissionDayDisplay();
    updateCrewStatus();
    updateMissionAlerts();
    updateMissionMonitor();
}

// ==========================================
// 9. MISSION DAY DISPLAY
// ==========================================

function addMissionDayDisplay() {
    if (!missionStatus) return;

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
// 10. RESOURCE MONITORING
// ==========================================

function updateResources() {
    for (const resource in resources) {
        const element = document.getElementById(resource);
        const bar = document.getElementById(resource + "Bar");

        const value = Math.max(
            0,
            Math.min(100, Number(resources[resource]) || 0)
        );

        resources[resource] = value;

        if (element) {
            element.textContent = value + "%";

            element.classList.remove("resource-update");
            void element.offsetWidth;
            element.classList.add("resource-update");
        }

        if (bar) {
            bar.style.width = value + "%";
            bar.setAttribute("aria-valuenow", value);
        }

        const card = element?.closest(".resource");

        if (card) {
            card.classList.toggle(
                "resource-warning",
                value <= 30 && value > 15
            );

            card.classList.toggle(
                "resource-critical",
                value <= 15
            );
        }
    }

    updateMissionAlerts();
    updateMissionMonitor();
}

// ==========================================
// 11. MISSION EVENT LOG
// ==========================================

function createMissionLog() {
    if (document.getElementById("missionLog")) return;

    const controlGrid = document.querySelector(".control-grid");
    if (!controlGrid) {
        console.warn("LunaMind: .control-grid was not found.");
        return;
    }

    const log = document.createElement("section");

    log.id = "missionLog";
    log.className = "mission-log";

    log.innerHTML = `
        <p class="eyebrow">MISSION RECORDS</p>
        <h2>Mission Event Log</h2>
        <div id="logEntries">
            <p>Waiting for mission activity...</p>
        </div>
    `;

    controlGrid.after(log);
}

function addLog(message) {
    const entries = document.getElementById("logEntries");
    if (!entries) return;

    if (
        entries.children.length === 1 &&
        entries.textContent.includes("Waiting for mission activity")
    ) {
        entries.innerHTML = "";
    }

    const entry = document.createElement("div");
    entry.className = "log-entry";

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const strong = document.createElement("strong");
    strong.textContent = `DAY ${missionDay} · ${time}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    entry.append(strong, paragraph);
    entries.prepend(entry);

    missionHistory.push(message);
}

// ==========================================
// 12. DECISION HISTORY TIMELINE
// ==========================================

function createDecisionTimeline() {
    if (document.getElementById("decisionTimeline")) return;

    const missionLog = document.getElementById("missionLog");
    if (!missionLog) return;

    const timeline = document.createElement("section");

    timeline.id = "decisionTimeline";
    timeline.className = "decision-timeline";

    timeline.innerHTML = `
        <p class="eyebrow">COMMANDER ARCHIVE</p>
        <h2>Decision History Timeline</h2>
        <div id="decisionEntries">
            <p>No commander decisions recorded yet.</p>
        </div>
    `;

    missionLog.after(timeline);
}

function updateDecisionTimeline() {
    const container = document.getElementById("decisionEntries");
    if (!container) return;

    if (decisionHistory.length === 0) {
        container.innerHTML =
            "<p>No commander decisions recorded yet.</p>";
        return;
    }

    container.replaceChildren();

    decisionHistory.forEach(item => {
        const entry = document.createElement("div");
        entry.className = "decision-entry";

        const heading = document.createElement("strong");
        heading.textContent = `DAY ${item.day} · ${item.time}`;

        const description = document.createElement("p");
        description.textContent = item.decision;

        entry.append(heading, description);
        container.appendChild(entry);
    });
}

// ==========================================
// 13. CREW ACTIVITY SYSTEM
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
            <p id="crewActivityText">
                Crew awaiting mission orders.
            </p>
        </div>
    `;

    crewCard.append(activity);
}

// ==========================================
// 14. LIVE MISSION MONITOR
// ==========================================

function updateMissionMonitor() {
    let monitor = document.getElementById("crewMissionMonitor");

    if (!monitor) {
        monitor = document.createElement("section");

        monitor.id = "crewMissionMonitor";
        monitor.className = "crew-mission-monitor";

        monitor.innerHTML = `
            <p class="eyebrow">👨‍🚀 CREW & MISSION SYSTEMS</p>
            <h2>Mission Health Monitor</h2>

            <div id="overallMissionStatus"
                 class="overall-mission-status">
                SYSTEMS INITIALIZING
            </div>

            <div id="resourceAlertList"
                 class="resource-alert-list">
            </div>
        `;

        const nasaPanel = document.getElementById("nasaDataPanel");
        const main = document.querySelector("main");

        if (nasaPanel?.parentNode) {
            nasaPanel.parentNode.insertBefore(monitor, nasaPanel);
        } else if (main) {
            main.appendChild(monitor);
        } else {
            document.body.appendChild(monitor);
        }
    }

    const statusBox =
        document.getElementById("overallMissionStatus");

    const alertList =
        document.getElementById("resourceAlertList");

    if (!statusBox || !alertList) return;

    const values = Object.values(resources);

    const hasCritical = values.some(value => value <= 20);
    const hasLow = values.some(value => value <= 40);

    let overallStatus;

    if (missionEnded) {
        const successful =
            missionDay >= TOTAL_DAYS &&
            values.every(value => value > 0);

        overallStatus = successful
            ? "🏁 MISSION SUCCESSFUL"
            : "⚠️ MISSION UNSUCCESSFUL";

        statusBox.className = successful
            ? "overall-mission-status completed"
            : "overall-mission-status critical";

    } else if (!missionStarted) {
        overallStatus = "🟡 AWAITING MISSION START";
        statusBox.className = "overall-mission-status standby";

    } else if (hasCritical) {
        overallStatus = "🔴 CRITICAL RESOURCE ALERT";
        statusBox.className = "overall-mission-status critical";

    } else if (hasLow) {
        overallStatus = "🟠 RESOURCE WARNING";
        statusBox.className = "overall-mission-status warning";

    } else {
        overallStatus = "🟢 ALL SYSTEMS NORMAL";
        statusBox.className = "overall-mission-status normal";
    }

    statusBox.textContent = overallStatus;

    alertList.replaceChildren();

    Object.entries(resources).forEach(([name, value]) => {
        const percentage = Math.max(
            0,
            Math.min(100, Math.round(value))
        );

        let level;
        let levelClass;

        if (percentage <= 0) {
            level = "EXHAUSTED";
            levelClass = "resource-critical";
        } else if (percentage <= 20) {
            level = "CRITICAL";
            levelClass = "resource-critical";
        } else if (percentage <= 40) {
            level = "LOW";
            levelClass = "resource-low";
        } else {
            level = "STABLE";
            levelClass = "resource-stable";
        }

        const card = document.createElement("div");
        card.className = `resource-alert-card ${levelClass}`;

        const heading = document.createElement("div");
        heading.className = "resource-alert-heading";

        const resourceName = document.createElement("strong");
        resourceName.textContent = name.toUpperCase();

        const resourceStatus = document.createElement("span");
        resourceStatus.textContent = level;

        const percentageText = document.createElement("p");
        percentageText.textContent = `${percentage}% remaining`;

        const track = document.createElement("div");
        track.className = "resource-alert-track";

        const fill = document.createElement("div");
        fill.className = "resource-alert-fill";
        fill.style.width = `${percentage}%`;

        track.appendChild(fill);
        heading.append(resourceName, resourceStatus);
        card.append(heading, percentageText, track);

        alertList.appendChild(card);
    });
}

// ==========================================
// 15. CREW STATUS
// ==========================================

function updateCrewStatus() {
    const crewMembers =
        document.querySelectorAll(".crew-member");

    const activityText =
        document.getElementById("crewActivityText");

    const criticalResources =
        Object.values(resources).some(value => value <= 20);

    crewMembers.forEach((member, index) => {
        const status = member.querySelector(".crew-status");

        member.classList.remove(
            "crew-active",
            "crew-alert"
        );

        if (
            missionStarted &&
            !missionEnded &&
            crewMembers.length > 0 &&
            index === (missionDay - 1) % crewMembers.length
        ) {
            member.classList.add("crew-active");

            if (criticalResources) {
                member.classList.add("crew-alert");
            }

            if (status) {
                status.textContent =
                    criticalResources ? "ATTENTION" : "ACTIVE";
            }

        } else if (status) {
            status.textContent =
                missionEnded ? "STANDBY" : "READY";
        }
    });

    if (activityText) {
        activityText.textContent =
            missionStarted && !missionEnded
                ? crewActivities[
                    (missionDay - 1) % crewActivities.length
                  ]
                : missionEnded
                    ? "Mission activities completed."
                    : "Crew awaiting mission orders.";
    }

    updateMissionMonitor();
}

// ==========================================
// 16. LIVE MISSION ALERTS
// ==========================================

function updateMissionAlerts() {
    let alertPanel = document.getElementById("missionAlerts");

    if (!alertPanel) {
        alertPanel = document.createElement("section");

        alertPanel.id = "missionAlerts";
        alertPanel.className = "mission-alerts";

        const nasaPanel = document.getElementById("nasaDataPanel");
        const controlGrid = document.querySelector(".control-grid");
        const main = document.querySelector("main");

        if (nasaPanel?.parentNode) {
            nasaPanel.before(alertPanel);
        } else if (controlGrid) {
            controlGrid.after(alertPanel);
        } else if (main) {
            main.appendChild(alertPanel);
        } else {
            document.body.appendChild(alertPanel);
        }
    }

    const resourceInfo = {
        oxygen: { icon: "🫁", label: "Oxygen Supply" },
        water: { icon: "💧", label: "Water Supply" },
        food: { icon: "🥫", label: "Food Supply" },
        power: { icon: "⚡", label: "Power Systems" }
    };

    const values = Object.entries(resourceInfo).map(
        ([key, info]) => {
            const value = Number(resources[key]) || 0;

            let level;
            let message;

            if (value <= 20) {
                level = "critical";
                message = "Critical reserve level";
            } else if (value <= 45) {
                level = "warning";
                message = "Reserve running low";
            } else {
                level = "stable";
                message = "Systems operating normally";
            }

            return {
                key,
                ...info,
                value: Math.max(0, Math.min(100, Math.round(value))),
                level,
                message
            };
        }
    );

    const criticalCount =
        values.filter(item => item.level === "critical").length;

    const warningCount =
        values.filter(item => item.level === "warning").length;

    let overallStatus;
    let overallClass;

    if (missionEnded) {
        const successful =
            missionDay >= TOTAL_DAYS &&
            Object.values(resources).every(value => value > 0);

        overallStatus = successful
            ? "MISSION SUCCESSFUL"
            : "MISSION UNSUCCESSFUL";

        overallClass = successful
            ? "alert-complete"
            : "alert-critical";

    } else if (!missionStarted) {
        overallStatus = "AWAITING LAUNCH";
        overallClass = "alert-stable";

    } else if (criticalCount > 0) {
        overallStatus = "CRITICAL SYSTEM ALERT";
        overallClass = "alert-critical";

    } else if (warningCount > 0) {
        overallStatus = "RESOURCE WARNING";
        overallClass = "alert-warning";

    } else {
        overallStatus = "ALL SYSTEMS STABLE";
        overallClass = "alert-stable";
    }

    alertPanel.replaceChildren();

    const heading = document.createElement("div");
    heading.className = "mission-alert-heading";

    const title = document.createElement("h2");
    title.textContent = "🚨 Mission System Monitor";

    const overall = document.createElement("span");
    overall.className = `overall-alert ${overallClass}`;
    overall.textContent = overallStatus;

    heading.append(title, overall);

    const description = document.createElement("p");
    description.className = "mission-alert-description";
    description.textContent =
        "Live status of your simulated lunar habitat resources.";

    const grid = document.createElement("div");
    grid.className = "mission-alert-grid";

    values.forEach(item => {
        const card = document.createElement("article");
        card.className = `mission-alert-card ${item.level}`;

        const name = document.createElement("h3");
        name.textContent = `${item.icon} ${item.label}`;

        const percentage = document.createElement("strong");
        percentage.textContent = `${item.value}%`;

        const message = document.createElement("p");
        message.textContent = item.message;

        const track = document.createElement("div");
        track.className = "alert-resource-track";

        const fill = document.createElement("div");
        fill.className = "alert-resource-fill";
        fill.style.width = `${item.value}%`;

        track.appendChild(fill);
        card.append(name, percentage, message, track);
        grid.appendChild(card);
    });

    alertPanel.append(heading, description, grid);
}

// ==========================================
// 17. MISSION ASSISTANT
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
// 18. SHOW DAILY MISSION EVENT
// ==========================================

function showMissionEvent() {
    const oldEvent = document.getElementById("missionEvent");
    if (oldEvent) oldEvent.remove();

    const eventIndex = missionDay - 2;
    const event = missionEvents[eventIndex];

    if (!event) return;

    const eventBox = document.createElement("section");
    eventBox.id = "missionEvent";
    eventBox.className = "mission-event";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "🚨 MISSION CHALLENGE";

    const heading = document.createElement("h2");
    heading.textContent = event.title;

    const description = document.createElement("p");
    description.textContent = event.description;

    const choicesBox = document.createElement("div");
    choicesBox.className = "event-choices";

    eventBox.append(eyebrow, heading, description, choicesBox);

    event.choices.forEach(choice => {
        const button = document.createElement("button");
        button.className = "event-choice";
        button.textContent = choice.text;

        button.addEventListener("click", () => {
            applyEventChoice(choice);
            eventBox.remove();
        });

        choicesBox.appendChild(button);
    });

    const controlGrid = document.querySelector(".control-grid");
    const main = document.querySelector("main");

    if (controlGrid) {
        controlGrid.after(eventBox);
    } else if (main) {
        main.appendChild(eventBox);
    } else {
        document.body.appendChild(eventBox);
    }

    eventBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// ==========================================
// 19. APPLY MISSION DECISION
// ==========================================

function applyEventChoice(choice) {
    if (missionEnded) return;

    for (const resource in choice.effects) {
        if (!(resource in resources)) continue;

        resources[resource] = Math.max(
            0,
            Math.min(
                100,
                resources[resource] + choice.effects[resource]
            )
        );
    }

    updateResources();

    addLog("COMMANDER DECISION: " + choice.result);

    decisionHistory.push({
        day: missionDay,
        decision: choice.result,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    updateDecisionTimeline();

    checkMissionStatus();

    if (!missionEnded) {
        if (missionDay === TOTAL_DAYS) {
            finishMission();
        } else if (nextDayBtn) {
            nextDayBtn.disabled = false;
        }
    }
}

// ==========================================
// 20. START MISSION
// ==========================================

function startMission() {
    if (missionStarted || missionEnded) return;

    missionStarted = true;

    if (nextDayBtn) {
        nextDayBtn.disabled = false;
    }

    if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = "MISSION IN PROGRESS";
    }

    if (missionStatus) {
        missionStatus.textContent =
            "🚀 Mission started! Lunar base is operational.";
    }

    addMissionDayDisplay();
    updateCrewStatus();

    addLog(
        "🚀 Mission officially started. All crew members are ready."
    );

    decisionHistory.push({
        day: missionDay,
        decision:
            "Mission launched. Lunar crew and habitat systems are ready.",
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    updateDecisionTimeline();
    updateMissionAlerts();
    updateMissionMonitor();

    maybeShowNASAAdvisory();
}

// ==========================================
// 21. ADVANCE MISSION DAY
// ==========================================

function nextDay() {
    if (!missionStarted || missionEnded) return;

    // Wait for the commander to finish any pending decision.
    if (document.getElementById("missionEvent")) return;
    if (document.getElementById("nasaAdvisory")) return;

    if (missionDay >= TOTAL_DAYS) {
        finishMission();
        return;
    }

    // Apply daily simulated resource consumption.
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

    addLog(dailyBriefings[missionDay - 1]);
    addLog("MISSION ASSISTANT: " + getMissionAdvice());

    checkMissionStatus();

    if (!missionEnded) {
        showMissionEvent();

        if (nextDayBtn) {
            nextDayBtn.disabled = true;
        }
    }
}

// ==========================================
// 22. CHECK MISSION STATUS
// ==========================================

function checkMissionStatus() {
    const criticalResources = Object.keys(resources)
        .filter(resource => resources[resource] <= 0);

    const lowResources = Object.keys(resources)
        .filter(resource =>
            resources[resource] > 0 &&
            resources[resource] <= 30
        );

    if (criticalResources.length > 0) {
        if (missionStatus) {
            missionStatus.textContent =
                "🚨 Critical resource shortage! Simulation ended.";
        }

        addLog(
            "🚨 Mission ended due to a critical resource shortage."
        );

        finishMission();
        return;
    }

    if (lowResources.length > 0) {
        if (missionStatus) {
            missionStatus.textContent =
                "⚠️ Low resources detected: " +
                lowResources.join(", ").toUpperCase();
        }
    } else if (missionStatus) {
        missionStatus.textContent =
            "✅ Mission Day " + missionDay +
            " completed. All resources are stable.";
    }
}

// ==========================================
// 23. ACHIEVEMENTS
// ==========================================

function checkAchievements(score, missionSuccessful) {
    unlockedAchievements = [];

    if (missionSuccessful) {
        unlockedAchievements.push("moonwalker");
    }

    if (resources.water >= 50) {
        unlockedAchievements.push("water-guardian");
    }

    if (resources.power >= 50) {
        unlockedAchievements.push("power-protector");
    }

    if (missionSuccessful && score >= 70) {
        unlockedAchievements.push("mission-master");
    }
}

// ==========================================
// 24. FINISH MISSION
// ==========================================


function finishMission() {
    if (missionEnded) return;

    missionEnded = true;

    if (nextDayBtn) {
        nextDayBtn.disabled = true;
    }

    const averageResource =
        Object.values(resources).reduce(
            (total, value) => total + value,
            0
        ) / Object.keys(resources).length;

    const score = Math.round(averageResource);

    const missionSuccessful =
        missionDay >= TOTAL_DAYS &&
        Object.values(resources).every(value => value > 0);

    checkAchievements(score, missionSuccessful);

    let result;
    let resultIcon;

    if (!missionSuccessful) {
        result = "Mission Unsuccessful";
        resultIcon = "⚠️";
    } else if (score >= 70) {
        result = "Excellent Mission";
        resultIcon = "🏆";
    } else {
        result = "Mission Completed";
        resultIcon = "🌙";
    }

    if (missionStatus) {
        missionStatus.textContent =
            `${resultIcon} ${result}! Final resource score: ${score}%.`;
    }

    if (startBtn) {
        startBtn.textContent = missionSuccessful
            ? "MISSION COMPLETED"
            : "MISSION ENDED";
    }

    updateCrewStatus();
    updateMissionAlerts();
    updateMissionMonitor();

    addLog(
        `🏁 ${result}. Final resource score: ${score}%.`
    );

    const oldReport = document.getElementById("missionReport");
    if (oldReport) oldReport.remove();

    const report = document.createElement("section");
    report.id = "missionReport";
    report.className = "mission-report";

    const daysSurvived = Math.min(missionDay, TOTAL_DAYS);

    report.innerHTML = `
        <div class="report-header">
            <span class="report-eyebrow">
                LUNAMIND • MISSION ARCHIVE
            </span>

            <h2>📊 Mission Performance Report</h2>
            <h3>${resultIcon} ${result}</h3>

            <p>
                ${missionSuccessful
                    ? "Your seven-day lunar habitat simulation has been completed."
                    : "Your lunar simulation has concluded. Review the resource report to understand the mission outcome."
                }
            </p>
        </div>

        <div class="report-score">
            <span>FINAL RESOURCE SCORE</span>

            <div class="score-number">${score}%</div>

            <div class="score-track">
                <div
                    class="score-fill"
                    style="width: ${score}%">
                </div>
            </div>
        </div>

        <div class="report-stat-grid">
            <div class="report-stat">
                <span>🌕</span>
                <h3>${daysSurvived}/${TOTAL_DAYS}</h3>
                <p>Mission Days Reached</p>
            </div>

            <div class="report-stat">
                <span>👨‍🚀</span>
                <h3>${result}</h3>
                <p>Mission Result</p>
            </div>
        </div>

        <h3 class="resource-report-title">
            Final Resource Levels
        </h3>

        <div id="finalResourceReport"></div>
        <div id="achievementReport"></div>

        <p class="report-footer">
            NASA DONKI data supports the educational space-weather
            experience. Mission scores and resource changes are
            part of this simplified simulation.
        </p>
    `;

    const main = document.querySelector("main");

    if (main) {
        main.appendChild(report);
    } else {
        document.body.appendChild(report);
    }

    const resourceContainer =
        document.getElementById("finalResourceReport");

    Object.entries(resources).forEach(([name, value]) => {
        const percentage = Math.max(
            0,
            Math.min(100, Math.round(value))
        );

        const resourceCard = document.createElement("div");
        resourceCard.className = "final-resource";

        resourceCard.innerHTML = `
            <div class="resource-heading">
                <span>${name.toUpperCase()}</span>
                <strong>${percentage}%</strong>
            </div>

            <div class="resource-track">
                <div
                    class="resource-fill"
                    style="width: ${percentage}%">
                </div>
            </div>
        `;

        resourceContainer.appendChild(resourceCard);
    });

    const achievementContainer =
        document.getElementById("achievementReport");

    const achievementTitle = document.createElement("h3");
    achievementTitle.className = "resource-report-title";
    achievementTitle.textContent = "🏅 Mission Achievements";

    achievementContainer.appendChild(achievementTitle);

    if (unlockedAchievements.length === 0) {
        const message = document.createElement("p");

        message.textContent =
            "No achievements unlocked this time. Every mission is a new opportunity!";

        achievementContainer.appendChild(message);

    } else {
        unlockedAchievements.forEach(id => {
            const achievement = achievementList.find(
                item => item.id === id
            );

            if (!achievement) return;

            const badge = document.createElement("div");
            badge.className = "achievement-badge";

            const icon = document.createElement("span");
            icon.textContent = achievement.icon;

            const details = document.createElement("div");

            const name = document.createElement("h4");
            name.textContent = achievement.name;

            const description = document.createElement("p");
            description.textContent = achievement.description;

            details.append(name, description);
            badge.append(icon, details);

            achievementContainer.appendChild(badge);
        });
    }

    // ==========================================
    // RESTART BUTTON INSIDE MISSION REPORT
    // ==========================================

    const restartReportBtn =
        document.createElement("button");

    restartReportBtn.id = "reportRestartBtn";
    restartReportBtn.textContent = "🚀 RESTART MISSION";

    restartReportBtn.addEventListener("click", () => {
        restartMission();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    report.appendChild(restartReportBtn);

    report.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    showMissionCelebration(score, missionSuccessful);
}

// ==========================================
// 25. RESTART MISSION
// ==========================================

function restartMission() {
    resources = { ...initialResources };

    missionDay = 1;
    missionStarted = false;
    missionEnded = false;

    missionHistory = [];
    decisionHistory = [];
    unlockedAchievements = [];

    nasaAdvisoryDone = false;

    const elementsToRemove = [
        "missionReport",
        "missionCelebration",
        "missionEvent",
        "nasaAdvisory"
    ];

    elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
    });

    updateDecisionTimeline();

    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = "🚀 START MISSION";
    }

    if (nextDayBtn) {
        nextDayBtn.disabled = true;
    }

    updateResources();
    addMissionDayDisplay();
    updateCrewStatus();

    if (missionStatus) {
        missionStatus.textContent =
            "Mission reset. Awaiting commander instructions.";
    }

    const entries = document.getElementById("logEntries");

    if (entries) {
        entries.innerHTML =
            "<p>Waiting for mission activity...</p>";
    }

    addLog("Mission simulation has been reset.");

    updateMissionAlerts();
    updateMissionMonitor();
    nasaMissionImpacts = []; 
}

// ==========================================
// 26. NASA SCIENCE EXPLANATIONS
// ==========================================

function getNASAScienceBriefing(event) {
    const type = (event.messageType || "").toUpperCase();
    const body = (event.messageBody || "").toUpperCase();

    const combined = type + " " + body;

    if (combined.includes("CME")) {
        return {
            name: "Coronal Mass Ejection",
            icon: "☀️",
            color: "solar",
            explanation:
                "A Coronal Mass Ejection (CME) is a large release of plasma and magnetic field from the Sun. Some CMEs travel through space and can interact with Earth's magnetic environment.",
            relevance:
                "Mission learning: Scientists monitor CMEs to understand changing space-weather conditions. A DONKI notification does not tell us the radiation dose received by a lunar crew."
        };
    }

    if (combined.includes("FLR")) {
        return {
            name: "Solar Flare",
            icon: "🔥",
            color: "flare",
            explanation:
                "A solar flare is a sudden burst of energy from the Sun. It releases electromagnetic radiation, including X-rays and ultraviolet light.",
            relevance:
                "Mission learning: Strong solar flares can affect some radio communications and the space environment. This notification is not a direct measurement of astronaut exposure."
        };
    }

    if (combined.includes("RBE")) {
        return {
            name: "Radiation Belt Enhancement",
            icon: "🧲",
            color: "radiation",
            explanation:
                "A Radiation Belt Enhancement notification describes changes in energetic particles in Earth's radiation belts.",
            relevance:
                "Mission learning: Earth's radiation belts are part of the near-Earth space environment. This event should not be treated as a measurement of radiation on the lunar surface."
        };
    }

    if (combined.includes("SEP")) {
        return {
            name: "Solar Energetic Particle Event",
            icon: "⚡",
            color: "particle",
            explanation:
                "Solar energetic particle events involve high-energy particles associated with solar activity. These particles can travel through interplanetary space.",
            relevance:
                "Mission learning: Space agencies monitor these events because energetic particles can be important for spacecraft and crew radiation studies. Actual exposure depends on location and shielding."
        };
    }

    if (combined.includes("GST")) {
        return {
            name: "Geomagnetic Storm",
            icon: "🌍",
            color: "storm",
            explanation:
                "A geomagnetic storm is a disturbance in Earth's magnetic environment, often associated with solar wind and coronal mass ejections.",
            relevance:
                "Mission learning: Geomagnetic storms help scientists study how solar activity affects Earth's magnetosphere. They are not direct measurements of lunar surface conditions."
        };
    }

    return {
        name: event.messageType || "Space Weather Notification",
        icon: "🛰️",
        color: "general",
        explanation:
            "NASA's DONKI system has published a space-weather notification. Its original message contains the event-specific scientific information.",
        relevance:
            "Mission learning: Read the original NASA notification to understand what was observed. The game does not convert this notification into a real lunar radiation measurement."
    };
}

// ==========================================
// 27. LOAD NASA DONKI DATA
// ==========================================

async function loadNASAData() {
    let panel = document.getElementById("nasaDataPanel");

    if (!panel) {
        panel = document.createElement("section");

        panel.id = "nasaDataPanel";
        panel.className = "nasa-data-panel";

        panel.innerHTML = `
            <p class="eyebrow">🛰️ NASA INTELLIGENCE CENTER</p>

            <h2>Live Space Weather Intelligence</h2>

            <p class="nasa-intro">
                Explore real space-weather notifications
                published through NASA DONKI.
            </p>

            <p id="nasaStatus">
                Connecting to NASA...
            </p>

            <div id="nasaEvents">
                Loading NASA observations...
            </div>

            <p class="nasa-credit">
                Data source:
                <a href="https://api.nasa.gov/"
                   target="_blank"
                   rel="noopener noreferrer">
                   NASA Open APIs
                </a>
                |
                <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
                   target="_blank"
                   rel="noopener noreferrer">
                   DONKI Database
                </a>
            </p>
        `;

        const controlGrid = document.querySelector(".control-grid");
        const main = document.querySelector("main");

        if (controlGrid) {
            controlGrid.after(panel);
        } else if (main) {
            main.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }
    }

    const status = document.getElementById("nasaStatus");
    const eventsBox = document.getElementById("nasaEvents");

    if (!status || !eventsBox) {
        console.error("LunaMind: NASA panel elements are missing.");
        return;
    }

    status.textContent = "🟡 Connecting to NASA DONKI...";
    eventsBox.textContent = "Loading NASA observations...";

    try {
        const endDate = new Date();
        const startDate = new Date(endDate);

        startDate.setUTCDate(startDate.getUTCDate() - 7);

        const start = startDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];

        const response = await fetch(
            `/api/donki?startDate=${start}&endDate=${end}`
        );

        if (!response.ok) {
            throw new Error(
                `NASA backend returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.events)) {
            throw new Error(
                "Unexpected backend response: expected an events array."
            );
        }

        nasaEvents = data.events;

        const retrievedAt = data.retrievedAt
            ? new Date(data.retrievedAt).toLocaleTimeString()
            : new Date().toLocaleTimeString();

        status.textContent =
            "🟢 NASA connection successful • Updated " + retrievedAt;

        eventsBox.replaceChildren();

        if (nasaEvents.length === 0) {
            eventsBox.textContent =
                "No notifications were returned for this date range.";

            maybeShowNASAAdvisory();
            return;
        }

        nasaEvents.slice(0, 5).forEach(event => {
            const briefing = getNASAScienceBriefing(event);

            const card = document.createElement("article");
            card.className =
                `nasa-event-card nasa-${briefing.color}`;

            const heading = document.createElement("h3");
            heading.textContent =
                `${briefing.icon} ${briefing.name}`;

            const date = document.createElement("p");
            date.className = "nasa-event-date";
            date.textContent =
                "Reported: " +
                (event.messageIssueTime || "Date unavailable");

            const explanation = document.createElement("p");
            explanation.className = "nasa-event-explanation";
            explanation.textContent = briefing.explanation;

            const learningNote = document.createElement("div");
            learningNote.className = "nasa-learning-note";
            learningNote.textContent = briefing.relevance;

            const briefingButton = document.createElement("button");
            briefingButton.className = "nasa-briefing-button";
            briefingButton.textContent = "Read NASA Notification ↓";

            const briefingPanel = document.createElement("div");
            briefingPanel.className = "nasa-science-briefing";
            briefingPanel.hidden = true;

            const originalTitle = document.createElement("h4");
            originalTitle.textContent = "Original NASA Notification";

            const originalMessage = document.createElement("p");
            originalMessage.className = "nasa-original-message";
            const rawMessage =
    event.messageBody || "No original message available.";

originalMessage.textContent = rawMessage
    .replace(/^\s*#+\s?/gm, "")
    .trim();

            briefingPanel.append(originalTitle, originalMessage);

            briefingButton.addEventListener("click", () => {
                const isOpening = briefingPanel.hidden;

                briefingPanel.hidden = !isOpening;

                briefingButton.textContent = isOpening
                    ? "Hide NASA Notification ↑"
                    : "Read NASA Notification ↓";
            });

            card.append(
                heading,
                date,
                explanation,
                learningNote,
                briefingButton,
                briefingPanel
            );

            if (event.messageURL) {
                try {
                    const linkURL = new URL(event.messageURL);

                    if (linkURL.protocol === "https:") {
                        const link = document.createElement("a");

                        link.href = linkURL.href;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        link.className = "nasa-event-link";
                        link.textContent =
                            "Open original NASA event ↗";

                        card.appendChild(link);
                    }
                } catch (error) {
                    console.warn("Invalid NASA event link.");
                }
            }

            eventsBox.appendChild(card);
        });

        // If the mission is already running on Day 1,
        // a newly loaded NASA observation can still trigger the advisory.
        maybeShowNASAAdvisory();

    } catch (error) {
        console.error("NASA integration error:", error);

        status.textContent =
            "🔴 NASA connection unavailable.";

        eventsBox.textContent =
            "Unable to load NASA observations. Check that your backend server and NASA API configuration are working.";
    }
}

// ==========================================
// 28. NASA-INSPIRED MISSION ADVISORY
// ==========================================


function maybeShowNASAAdvisory() {
    if (!missionStarted || missionEnded) return;
    if (missionDay !== 1) return;
    if (nasaAdvisoryDone) return;
    if (document.getElementById("nasaAdvisory")) return;

    // Find a supported NASA observation
    const observation = nasaEvents.find(event => {
        const type = String(event.messageType || "");
        const body = String(event.messageBody || "");

        return /CME|RBE|FLR/i.test(type + " " + body);
    });

    if (!observation) return;

    const eventText =
        String(observation.messageType || "");

    const eventBody =
        String(observation.messageBody || "");

    const combined = eventText + " " + eventBody;

    // Identify the NASA event category
    let eventType;
    let category;
    let icon;
    let scenarioTitle;
    let scenarioDescription;
    let scienceExplanation;
    let firstChoice;
    let firstEffect;
    let firstResult;
    let secondChoice;
    let secondResult;

    if (/CME/i.test(combined)) {

        eventType = "CME";
        category = "Coronal Mass Ejection";
        icon = "☀️";

        scenarioTitle = "Solar Activity Preparedness";

        scenarioDescription =
            "NASA DONKI has reported a Coronal Mass Ejection notification. " +
            "Your crew must review the observation and discuss how solar activity " +
            "is monitored during lunar missions.";

        scienceExplanation =
            "A CME is a large release of solar material and magnetic field into space. " +
            "This notification does not establish the radiation exposure of a lunar habitat.";

        firstChoice =
            "🛡️ Conduct a habitat preparedness briefing";

        firstEffect = -3;

        firstResult =
            "The crew completed a simulated habitat preparedness briefing " +
            "and reviewed solar-weather monitoring procedures. Simulated power cost: 3%.";

        secondChoice =
            "📡 Archive the observation for review";

        secondResult =
            "The crew archived the CME notification for later scientific analysis. " +
            "No simulated resources were consumed.";

    } else if (/FLR/i.test(combined)) {

        eventType = "FLR";
        category = "Solar Flare";
        icon = "🌞";

        scenarioTitle = "Solar Flare Observation";

        scenarioDescription =
            "NASA DONKI has reported a solar flare notification. " +
            "The science officer must brief the crew about solar activity " +
            "and its importance for space-weather monitoring.";

        scienceExplanation =
            "Solar flares are sudden releases of energy from the Sun. " +
            "Their effects depend on factors such as flare characteristics " +
            "and the surrounding space environment.";

        firstChoice =
            "🔬 Conduct a solar observation briefing";

        firstEffect = -2;

        firstResult =
            "The crew conducted a simulated solar observation and communication-planning " +
            "briefing. Simulated power cost: 2%.";

        secondChoice =
            "📝 Record the solar flare notification";

        secondResult =
            "The solar flare notification was archived for scientific review. " +
            "No simulated resources were consumed.";

    } else {

        eventType = "RBE";
        category = "Radiation Belt Enhancement";
        icon = "🛰️";

        scenarioTitle = "Radiation Environment Research";

        scenarioDescription =
            "NASA DONKI has reported a Radiation Belt Enhancement notification. " +
            "The crew must review the observation and discuss radiation-monitoring concepts.";

        scienceExplanation =
            "Radiation Belt Enhancements describe changes in Earth's radiation belts. " +
            "They are not direct measurements of radiation conditions at the lunar surface.";

        firstChoice =
            "🧪 Conduct a radiation research briefing";

        firstEffect = -3;

        firstResult =
            "The crew completed an educational radiation-monitoring and habitat " +
            "preparedness exercise. Simulated power cost: 3%.";

        secondChoice =
            "📊 Archive the radiation observation";

        secondResult =
            "The radiation-belt notification was archived for later scientific review. " +
            "No simulated resources were consumed.";
    }

    // Create advisory panel
    const advisory = document.createElement("section");

    advisory.id = "nasaAdvisory";
    advisory.className = "nasa-advisory";

    advisory.innerHTML = `
        <p class="eyebrow">
            🛰️ NASA-INSPIRED MISSION ADVISORY
        </p>

        <h2>${icon} ${scenarioTitle}</h2>

        <p>${scenarioDescription}</p>

        <div class="nasa-observation-details">
            <strong>NASA OBSERVATION</strong>
            <p>${category}</p>

            <strong>REPORTED</strong>
            <p>${observation.messageIssueTime || "Date unavailable"}</p>
        </div>

        <div class="nasa-science-note">
            <strong>🔬 SCIENTIFIC EXPLANATION</strong>
            <p>${scienceExplanation}</p>
        </div>

        <p class="nasa-simulation-label">
            The following choices are educational simulation scenarios.
            Resource effects are fictional gameplay values, not measured
            physical effects of this NASA observation.
        </p>

        <h3>COMMANDER DECISION REQUIRED</h3>

        <div class="event-choices">
            <button id="nasaFirstChoice" class="event-choice">
                ${firstChoice}
            </button>

            <button id="nasaSecondChoice" class="event-choice">
                ${secondChoice}
            </button>
        </div>
    `;

    // Record the observation and commander decision
    function recordNASAImpact(choice, result, powerEffect) {

        nasaMissionImpacts.push({
            eventType: eventType,
            category: category,
            messageID: observation.messageID || "Unavailable",
            reportedAt: observation.messageIssueTime || "Unavailable",
            decision: choice,
            result: result,
            simulatedPowerEffect: powerEffect
        });

        addLog(
            `🛰️ NASA ${eventType} OBSERVATION: ${choice}`
        );
    }

    // First commander choice
    advisory.querySelector("#nasaFirstChoice")
        .addEventListener("click", () => {

            recordNASAImpact(
                firstChoice,
                firstResult,
                firstEffect
            );

            applyNASAChoice(
                firstEffect,
                firstResult
            );

            advisory.remove();
        });

    // Second commander choice
    advisory.querySelector("#nasaSecondChoice")
        .addEventListener("click", () => {

            recordNASAImpact(
                secondChoice,
                secondResult,
                0
            );

            applyNASAChoice(
                0,
                secondResult
            );

            advisory.remove();
        });

    // Insert advisory into dashboard
    const nasaPanel =
        document.getElementById("nasaDataPanel");

    const main =
        document.querySelector("main");

    if (nasaPanel) {
        nasaPanel.before(advisory);
    } else if (main) {
        main.appendChild(advisory);
    } else {
        document.body.appendChild(advisory);
    }

    nasaAdvisoryDone = true;

    if (nextDayBtn) {
        nextDayBtn.disabled = true;
    }

    advisory.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// ==========================================
// 29. APPLY NASA ADVISORY DECISION
// ==========================================

function applyNASAChoice(powerEffect, result) {
    if (missionEnded) return;

    resources.power = Math.max(
        0,
        Math.min(100, resources.power + powerEffect)
    );

    updateResources();

    addLog("NASA MISSION ADVISORY: " + result);

    decisionHistory.push({
        day: missionDay,
        decision: result,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    updateDecisionTimeline();

    checkMissionStatus();

    if (!missionEnded && nextDayBtn) {
        nextDayBtn.disabled = false;
    }
}

// ==========================================
// 30. MISSION CELEBRATION
// ==========================================


function showMissionCelebration(score, missionSuccessful) {

    const oldScreen =
        document.getElementById("missionCelebration");

    if (oldScreen) oldScreen.remove();

    const celebration = document.createElement("section");

    celebration.id = "missionCelebration";
    celebration.className = "mission-celebration";

    const title = missionSuccessful
        ? "MISSION COMPLETE!"
        : "MISSION CONCLUDED";

    const message = missionSuccessful
        ? "An incredible journey beyond Earth. Your seven-day lunar mission has reached its final destination!"
        : "Your lunar simulation has concluded. Review your mission report to understand the outcome.";

    celebration.innerHTML = `
        <div class="celebration-stars"></div>

        <div class="celebration-content">

            <div class="celebration-moon">🌕</div>

            <p class="celebration-eyebrow">
                LUNAMIND SPACE PROGRAM
            </p>

            <h1>${title}</h1>

            <p class="celebration-message">
                ${message}
            </p>

            <div class="celebration-score">
                <span>FINAL RESOURCE SCORE</span>
                <strong>${score}%</strong>
            </div>

            <div class="celebration-achievement">
                🏅 Your mission achievements and report are ready!
            </div>

            <button id="viewMissionReportBtn">
                📊 VIEW MISSION REPORT
            </button>

            <button id="celebrationRestartBtn">
                🚀 LAUNCH A NEW MISSION
            </button>

            <p class="celebration-footer">
                LUNAMIND • EXPLORE • LEARN • DISCOVER
            </p>

        </div>
    `;

    document.body.appendChild(celebration);

    // View report without restarting the mission
    document.getElementById("viewMissionReportBtn")
        .addEventListener("click", () => {

            celebration.remove();

            const report =
                document.getElementById("missionReport");

            if (report) {
                report.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });

    // Restart only when the commander chooses
    document.getElementById("celebrationRestartBtn")
        .addEventListener("click", () => {

            celebration.remove();

            restartMission();

            loadNASAData();
        });
}


// ==========================================
// 31. SYSTEM STARTUP
// ==========================================

function startLunaMind() {
    if (!startBtn || !nextDayBtn || !missionStatus) {
        console.error(
            "LunaMind startup failed: required HTML elements are missing.",
            {
                startBtn,
                nextDayBtn,
                missionStatus
            }
        );
        return;
    }

    // Prevent duplicate event listeners if startup is called again.
    startBtn.addEventListener("click", startMission);
    nextDayBtn.addEventListener("click", nextDay);

    initializeMission();

    // NASA data loads independently of the simulation.
    loadNASAData();

    console.log("🌕 LunaMind Mission Control initialized.");
}

// Start only after the page elements are available.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLunaMind, {
        once: true
    });
} else {
    startLunaMind();
}


// ==========================================
// NASA RADLAB - RADIATION RESEARCH
// ==========================================

const RADLAB_API = "/api/radlab";

// ==========================================
// LOAD NASA RADLAB DATA
// ==========================================
// ==========================================
// NASA RADIATION HISTORY CHART
// ==========================================

let radiationChart = null;

function renderRadiationChart(readings) {

    const canvas = document.getElementById("radiationChart");

    if (!canvas) {
        console.error("Radiation chart canvas not found.");
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js has not loaded.");
        return;
    }

    // Sort oldest to newest for the graph.

    const chartReadings = readings
        .filter(item =>
            item.timestamp &&
            Number.isFinite(Number(item.absorbed_dose_rate))
        )
        .slice()
        .reverse();

    const labels = chartReadings.map(item =>
        new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    );

    const values = chartReadings.map(item =>
        Number(item.absorbed_dose_rate)
    );

    // Remove the previous chart before creating another.

    if (radiationChart) {
        radiationChart.destroy();
    }

    radiationChart = new Chart(canvas, {

        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Absorbed Dose Rate",

                data: values,

                borderColor: "#d99aff",

                backgroundColor: "rgba(217, 154, 255, 0.12)",

                borderWidth: 2,

                fill: true,

                tension: 0.35,

                pointRadius: 0,

                pointHoverRadius: 6,

                pointHoverBackgroundColor: "#ffffff",

                pointHoverBorderColor: "#d99aff",

                pointHoverBorderWidth: 3
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#17132b",

                    titleColor: "#f3d7ff",

                    bodyColor: "#ffffff",

                    borderColor: "#a96be0",

                    borderWidth: 1,

                    padding: 12,

                    callbacks: {

                        title: function (items) {

                            const index = items[0].dataIndex;

                            return new Date(
                                chartReadings[index].timestamp
                            ).toLocaleString();
                        },

                        label: function (context) {

                            return " Dose rate: " +
                                context.parsed.y.toFixed(4) +
                                " μGy/hour";
                        }
                    }
                }
            },

            scales: {

                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: "#aaa5c5",
                        maxTicksLimit: 7
                    }
                },

                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text: "μGy/hour",
                        color: "#cbb6e8"
                    },

                    grid: {
                        color: "rgba(200, 170, 255, 0.10)"
                    },

                    ticks: {
                        color: "#aaa5c5"
                    }
                }
            }
        }
    });

    console.log(
        "Radiation graph created:",
        chartReadings.length,
        "measurements"
    );
}


async function loadRadiationData() {

    const status = document.getElementById("radiationStatus");
    const message = document.getElementById("radiationMessage");

    if (!status || !message) {
        console.error("RadLab: Required HTML elements are missing.");
        return;
    }

    status.textContent = "CONNECTING...";
    message.textContent = "Connecting to NASA RadLab...";

    try {

        // Historical ISS / DosTel sample period.
        // This is historical reference data, NOT live telemetry.

        const response = await fetch(RADLAB_API);

        if (!response.ok) {
            throw new Error(
                "NASA API returned HTTP " + response.status
            );
        }

        const data = await response.json();

        console.log("NASA RadLab response:", data);

        // Normalize the response into an array of objects.

        function normalizeRows(payload) {

            if (Array.isArray(payload)) {
                return payload;
            }

            if (Array.isArray(payload.data)) {

                if (
                    Array.isArray(payload.columns) &&
                    Array.isArray(payload.data[0])
                ) {
                    return payload.data.map(row => {

                        const result = {};

                        payload.columns.forEach((column, index) => {
                            result[column] = row[index];
                        });

                        return result;
                    });
                }

                return payload.data;
            }

            if (Array.isArray(payload.rows)) {
                return payload.rows;
            }

            return [];
        }

        const readings = normalizeRows(data.data);

        if (readings.length === 0) {
            throw new Error(
                "No measurements were returned for the selected period."
            );
        }

        // Sort readings by timestamp (newest first).

        readings.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        const latest = readings[0];

        // Safely format numerical values.

        function displayValue(value, decimals = 4) {

            if (
                value === null ||
                value === undefined ||
                value === "" ||
                !Number.isFinite(Number(value))
            ) {
                return "--";
            }

            return Number(value).toFixed(decimals);
        }

        // Update the dashboard.

        const absorbedDose =
            document.getElementById("absorbedDose");

        const doseEquivalent =
            document.getElementById("doseEquivalent");

        const particleFlux =
            document.getElementById("particleFlux");

        const spacecraft =
            document.getElementById("radiationSpacecraft");

        const instrument =
            document.getElementById("radiationInstrument");

        const timestamp =
            document.getElementById("radiationTimestamp");

        if (
            !absorbedDose ||
            !doseEquivalent ||
            !particleFlux ||
            !spacecraft ||
            !instrument ||
            !timestamp
        ) {
            throw new Error(
                "One or more RadLab display elements are missing from HTML."
            );
        }

        absorbedDose.textContent =
            displayValue(latest.absorbed_dose_rate);

        doseEquivalent.textContent =
            displayValue(latest.dose_equivalent_rate);

        particleFlux.textContent =
            displayValue(latest.flux);

        spacecraft.textContent =
            latest.spacecraft || "ISS";

        instrument.textContent =
            latest.instrument ||
            latest.instrument_id ||
            "DosTel";

        timestamp.textContent =
            latest.timestamp
                ? new Date(latest.timestamp).toLocaleString()
                : "Not available";

        // =====================================
        // CREATE NASA RADIATION HISTORY GRAPH
        // =====================================

        renderRadiationChart(readings);

        status.textContent = "HISTORICAL DATA LOADED";

        message.textContent =
            readings.length +
            " NASA RadLab measurements retrieved. " +
            "Displaying the latest measurement from the selected historical period.";

        console.log("NASA RadLab loaded successfully:", latest);

    } catch (error) {

        console.error("NASA RadLab error:", error);

        status.textContent = "DATA UNAVAILABLE";

        message.textContent =
            "NASA measurements could not be loaded. " +
            "Check the API response and your connection.";
    }
}


// ==========================================
// RADLAB REFRESH BUTTON
// ==========================================

function initializeRadiationPanel() {

    const refreshButton =
        document.getElementById("refreshRadiationBtn");

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadRadiationData
        );

    }

    loadRadiationData();
}

// Wait until HTML elements are available.

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRadiationPanel,
        { once: true }
    );

} else {

    initializeRadiationPanel();

}

// =================================
// LUNAMIND BACKGROUND MUSIC CONTROL
// =================================

const spaceMusic = document.getElementById("spaceMusic");
const musicToggle = document.getElementById("musicToggle");
const musicVolume = document.getElementById("musicVolume");

if (spaceMusic && musicToggle && musicVolume) {

    // Initial volume
    spaceMusic.volume = Number(musicVolume.value);

    // Play / Pause music
    musicToggle.addEventListener("click", async () => {

        if (spaceMusic.paused) {

            try {
                await spaceMusic.play();

                musicToggle.textContent = "⏸ PAUSE SPACE MUSIC";

            } catch (error) {

                console.error("Music playback failed:", error);

                musicToggle.textContent = "🎵 TRY PLAYING AGAIN";
            }

        } else {

            spaceMusic.pause();

            musicToggle.textContent = "🎵 PLAY SPACE MUSIC";
        }

    });

    // Volume control
    musicVolume.addEventListener("input", () => {

        spaceMusic.volume = Number(musicVolume.value);

    });

}
