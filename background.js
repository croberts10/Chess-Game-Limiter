import fetchEndpoint from "./api/fetchEndpoint.js";

const ALARM_JOB_NAME = "CHESS_ALARM";
let isRunning = false;
let dailyLimitExceeded = false;

chrome.runtime.onInstalled.addListener(details => {
    console.log("Extension installed or updated");
});

chrome.runtime.onMessage.addListener(data => {
    const { event, prefs } = data;
    switch(event) { 
        case 'onStop':
            handleOnStop();
            break;
        case 'onStart':
            handleOnStart(prefs); 
            break;
        default:
            break;
    }
});

const handleOnStart = (prefs) => { 
    console.log("prefs received", prefs);
    const { usernameId, yearId, monthId, dailyLimitId } = prefs;
    setRunningStatus(true);
    fetchEndpoint(usernameId, yearId, monthId).then(endTimesToday => {
        const gamesPlayedToday = endTimesToday.length;
        if (gamesPlayedToday > dailyLimitId) {
            // Daily limit exceeded, activate blocker
            dailyLimitExceeded = true;
            activateBlocker();
        } else {
            dailyLimitExceeded = false;
        }
    });
    createAlarm();
}

const setRunningStatus = (isRunning) => {
    chrome.storage.local.set({isRunning});
}

const handleOnStop = () => {
    console.log("On stop in background");
    setRunningStatus(false);
    stopAlarm();
}

const createAlarm = () => {
    chrome.alarms.get(ALARM_JOB_NAME, existingAlarm => {
        if (!existingAlarm) {
            chrome.alarms.create(ALARM_JOB_NAME, {periodInMinutes: 1.0});
        }
    });
}

const stopAlarm = () => {
    chrome.alarms.clearAll();
}

chrome.alarms.onAlarm.addListener(async () => {
    console.log("Alarm triggered");
    const { usernameId, yearId, monthId, dailyLimitId } = await getStoredPrefs();
    fetchEndpoint(usernameId, yearId, monthId).then(endTimesToday => {
        const gamesPlayedToday = endTimesToday.length;
        if (gamesPlayedToday > dailyLimitId) {
            // Daily limit exceeded, activate blocker
            dailyLimitExceeded = true;
            activateBlocker();
        } else {
            dailyLimitExceeded = false;
        }
    });
});

const getStoredPrefs = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['usernameId', 'yearId', 'monthId', 'dailyLimitId'], result => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}

const activateBlocker = () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {blockChess: true});
    });
}

