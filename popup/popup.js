// Get year and month
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2);
const currentDay = ("0" + currentDate.getDate()).slice(-2);


// User input elements
const username = document.getElementById('username');
const dailyLimit = document.getElementById('dailyLimit');

// Button elements
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

// Span listeners
const runningSpan = document.getElementById("runningSpan");
const stoppedSpan = document.getElementById("stoppedSpan");

// Error message
const usernameError = document.getElementById("usernameError");
const dailyLimitError = document.getElementById("dailyLimitError");

const hideElement = (elem) => {
    elem.style.display = 'none'
}

const showElement = (elem) => {
    elem.style.display = ''
}

const disableElement = (elem) => {
    elem.disabled = true
}

const enableElement = (elem) => {
    elem.disabled = false
}
// Handles visual popup clicking on start button
const handleOnStartState = () => {
    // spans
    showElement(runningSpan)
    hideElement(stoppedSpan)
    // buttons
    disableElement(startButton)
    enableElement(stopButton)
    // Inputs
    disableElement(username)
    disableElement(dailyLimit)
}

// Handles visual popup clicking on stop button
const handleOnStopState = () => {
    // spans
    showElement(stoppedSpan)
    hideElement(runningSpan)
    // buttons
    disableElement(stopButton)
    enableElement(startButton)
    // Input

    enableElement(username)
    enableElement(dailyLimit)
}

// Validate that the user inputs all fields
const performOnStartValidations = () => {
    if (!username.value) {
        showElement(usernameError);
    }
    else{
        hideElement(usernameError);
    }
    if (!dailyLimit.value) {
        showElement(dailyLimitError);
    }
    else{
        hideElement(dailyLimitError);
    }
    return username.value && dailyLimit.value
}
// Start click
startButton.onclick = () => {
    const allFieldsValid = performOnStartValidations();

    if (allFieldsValid) {
        // Save data to local storage
        chrome.storage.local.set({
            usernameId: username.value,
            dailyLimitId: dailyLimit.value,
            yearId: currentYear,
            monthId: currentMonth,
            dayId: currentDay
        }, () => {
            // After saving, handle UI state and send message to background script
            handleOnStartState();
            const prefs = {
                usernameId: username.value,
                dailyLimitId: dailyLimit.value,
                yearId: currentYear,
                monthId: currentMonth,
                dayId: currentDay
            };
            chrome.runtime.sendMessage({ event: 'onStart', prefs});
        });
    }
};

// Stop Click
stopButton.onclick = () => {
    handleOnStopState();
    chrome.runtime.sendMessage({ event: 'onStop'});
};

// Local storage
chrome.storage.local.get(["usernameId", "dailyLimitId","yearId","monthId","dayId", "isRunning"], (result) => {
    const {usernameId, dailyLimitId, yearId, monthId, dayId, isRunning } = result;

    if (usernameId) {
        username.value = usernameId;
    }

    if (dailyLimitId) {
        dailyLimit.value = dailyLimitId; 
    }
    
    if (isRunning) {
        handleOnStartState();
    }
    else {
        handleOnStopState();
    }
});

