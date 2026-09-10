const calorieInput = document.getElementById("calorieInput");
const calorieBtn = document.getElementById("calorieBtn");
const calorieTodayText = document.getElementById("calorieTodayText");

const timerDisplay = document.getElementById("timerDisplay");

const startTimerBtn = document.getElementById("startTimerBtn");
const stopTimerBtn = document.getElementById("stopTimerBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");

const taskProgressText = document.getElementById("taskProgressText");
const dailyTasks =  JSON.parse(localStorage.getItem("dailyTasks")) || [];

const completedTasks =  dailyTasks.filter(task => task.status === "completed").length;

const habitProgressText = document.getElementById("habitProgressText");
const meditationProgress =  JSON.parse(localStorage.getItem("meditationProgress")) || [];

const completedHabitDays = meditationProgress.length;

habitProgressText.textContent = "Habits: " + completedHabitDays + " completed";

taskProgressText.textContent = "Daily Tasks: " + completedTasks + " completed";

let seconds = 0;
let timerInterval = null;

function updateTimerDisplay() {

const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;

  timerDisplay.textContent =  String(minutes).padStart(2, "0") + ":" +
    String(remainingSeconds).padStart(2, "0");

}  

    startTimerBtn.addEventListener("click", function() {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(function() {

        seconds++;

        updateTimerDisplay();

    }, 1000);
});

stopTimerBtn.addEventListener("click", function() {

    clearInterval(timerInterval);

    timerInterval = null;
});

resetTimerBtn.addEventListener("click", function() {

    clearInterval(timerInterval);

    timerInterval = null;

    seconds = 0;

    updateTimerDisplay();
});


calorieBtn.addEventListener("click", function() {

    const calories = calorieInput.value;

    if (calories === "") {
        return;
    }

    localStorage.setItem("todayCalories", calories);

    calorieTodayText.textContent =
        calories + " kcal today";

});

const savedCalories =  localStorage.getItem("todayCalories");

if (savedCalories !== null) {

    calorieTodayText.textContent =
        savedCalories + " kcal today";

}

const waterTodayText = document.getElementById("waterTodayText");

const waterRecords =
    JSON.parse(localStorage.getItem("waterRecords")) || {};

const today = new Date();

const todayKey = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");
    
const todayWater = waterRecords[todayKey] || 0;

waterTodayText.textContent = todayWater + "ml consumed today";

const sleepSummaryText = document.getElementById("sleepSummaryText");

const savedSleep = localStorage.getItem("actualSleepHours");

if (savedSleep !== null) {
    sleepSummaryText.textContent =
        savedSleep + " hours slept today";
}

const quotes = [
    "Believe in yourself and keep moving forward.",
    "Small steps every day lead to big results.",
    "Your only limit is your mind.",
    "Consistency is the key to success.",
    "Don't stop until you are proud of yourself.",
    "Every day is a fresh start.",
    "Focus on progress, not perfection."
];

const quoteText = document.getElementById("quoteText");


const saveQuoteBtn = document.getElementById("saveQuoteBtn");

    function showRandomQuote() {

    const randomIndex =  Math.floor(Math.random() * quotes.length);

    quoteText.textContent = quotes[randomIndex];
}

showRandomQuote();

saveQuoteBtn.addEventListener("click", function() {

    localStorage.setItem(
        "savedQuote",
        quoteText.textContent
    );

});

const chartCanvas = document.getElementById("monthlyProgressChart");

const recapData = {
    tasks: completedTasks,
    meditation: meditationProgress.length,
    water: todayWater,
    sleep: Number(localStorage.getItem("actualSleepHours") || 0)
};
new Chart(chartCanvas, {
    type: "bar",

    data: {
        labels: [
            "Daily Tasks",
            "Meditation",
            "Water",
            "Sleep"
        ],

        datasets: [{
            label: "Completed",
            data: [
                recapData.tasks,
                recapData.meditation,
                recapData.water,
                recapData.sleep
            ]
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});