const targetSleep = document.getElementById("targetSleep");
const actualSleep = document.getElementById("actualSleep");

const setTargetBtn = document.getElementById("setTargetBtn");
const enterSleepBtn = document.getElementById("enterSleepBtn");

const targetDisplay = document.getElementById("targetDisplay");
const sleepPercentageDisplay = document.getElementById("sleep-percentage");

const sleptHoursDisplay = document.getElementById("slept-hours");
const remainingHoursDisplay = document.getElementById("remaining-hours");
const qualityMessage = document.getElementById("quality-message");

const sleepGraph = document.getElementById("sleepGraph");
const ctx = sleepGraph.getContext("2d");

let sleepTarget = 0;
let actualSleepHours = 0;

let weeklySleepData = {};

let savedSleepData = localStorage.getItem("weeklySleepData");

if (savedSleepData) {
    weeklySleepData = JSON.parse(savedSleepData);
}
let savedTarget = localStorage.getItem("sleepTarget");

if (savedTarget) {
    sleepTarget = Number(savedTarget);
    targetSleep.value = sleepTarget;
    targetDisplay.textContent = sleepTarget;
}

let savedActualSleep = localStorage.getItem("actualSleepHours");

if (savedActualSleep && sleepTarget > 0) {

    actualSleepHours = Number(savedActualSleep);

    actualSleep.value = actualSleepHours;
    sleptHoursDisplay.textContent = actualSleepHours;

    let sleepPercentage =
        (actualSleepHours / sleepTarget) * 100;

    sleepPercentageDisplay.textContent =
        Math.round(sleepPercentage) + "%";

    let remainingHours =
        sleepTarget - actualSleepHours;

    if (remainingHours < 0) {
        remainingHours = 0;
    }

    remainingHoursDisplay.textContent = remainingHours;


    if (actualSleepHours >= sleepTarget) {

        qualityMessage.textContent =
            "Excellent! You completed today's sleep target.";

    } else if (sleepTarget - actualSleepHours < 2) {

        qualityMessage.textContent =
            "Average. You are close to your sleep target, but need a little more rest.";

    } else {

        qualityMessage.textContent =
            "You need more rest. Try to get closer to your sleep target.";
    }
}

function drawSleepGraph() {

    sleepGraph.width = sleepGraph.clientWidth;
    sleepGraph.height = sleepGraph.clientHeight;

    ctx.clearRect(0, 0, sleepGraph.width, sleepGraph.height);

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    const maxHours = 10;


    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    for (let hour = 0; hour <= 10; hour += 2) {

    let y = sleepGraph.height - 30 -
            (hour / maxHours) *
            (sleepGraph.height - 50);

    ctx.fillText(hour, 20, y + 4);
}

    days.forEach(function(day, index) {

        let x = 50 + index * ((sleepGraph.width - 70) / 6);

        ctx.fillText(
            day.substring(0, 3),
            x,
            sleepGraph.height - 10
        );

    });


    ctx.beginPath();

    ctx.moveTo(
        40,
        sleepGraph.height - 30
    );

    ctx.lineTo(
        sleepGraph.width - 20,
        sleepGraph.height - 30
    );

    ctx.stroke();

    ctx.beginPath();

    let firstPoint = true;

    days.forEach(function(day, index) {

        if (weeklySleepData[day] !== undefined) {

            let x =50 + index * ((sleepGraph.width - 70) / 6);

                
            let y =sleepGraph.height - 30 -
                (weeklySleepData[day] / maxHours) *
                (sleepGraph.height - 50);
                


            if (firstPoint) {

                ctx.moveTo(x, y);

                firstPoint = false;

            } else {

                ctx.lineTo(x, y);

            }

        }

    });

    ctx.stroke();


    days.forEach(function(day, index) {

        if (weeklySleepData[day] !== undefined) {

            let x =
                50 + index * ((sleepGraph.width - 70) / 6);

            let y =
                sleepGraph.height - 30 -
                (weeklySleepData[day] / maxHours) *
                (sleepGraph.height - 50);


            ctx.beginPath();

            ctx.arc(x, y, 5, 0, Math.PI * 2);

            ctx.fill();

        }

    });

}

drawSleepGraph();


setTargetBtn.addEventListener("click",function(){
    sleepTarget = Number(targetSleep.value);
    targetDisplay.textContent = sleepTarget;

    localStorage.setItem("sleepTarget", sleepTarget);

    drawSleepGraph();
})



enterSleepBtn.addEventListener("click", function() {

    if (sleepTarget === 0) {
    alert("Please set your sleep target first.");
    return;
    }

    actualSleepHours = Number(actualSleep.value);

    localStorage.setItem("actualSleepHours", actualSleepHours);

    let today = new Date();
    let day = today.toLocaleDateString("en-US", { weekday: "long" });
    weeklySleepData[day] = actualSleepHours;

    localStorage.setItem("weeklySleepData", JSON.stringify(weeklySleepData));

    sleptHoursDisplay.textContent = actualSleepHours;
    let sleepPercentage = (actualSleepHours / sleepTarget) * 100;
    sleepPercentageDisplay.textContent = Math.round(sleepPercentage) + "%";
    let remainingHours = sleepTarget - actualSleepHours;

     if (remainingHours < 0) {
     remainingHours = 0;
     }

    remainingHoursDisplay.textContent = remainingHours;

    if (actualSleepHours >= sleepTarget) {
    qualityMessage.textContent = "Excellent! You completed today's sleep target.";
    }
    else if (sleepTarget - actualSleepHours < 2) {
    qualityMessage.textContent = "Average. You are close to your sleep target, but need a little more rest.";
    } 
    else {
    qualityMessage.textContent = "You need more rest. Try to get closer to your sleep target.";
    }

    drawSleepGraph();

});



