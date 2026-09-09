const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("startBtn")
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let minutes = 0;
let seconds = 0;
let timer;

let formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

timerDisplay.textContent = formattedMinutes + ":" + formattedSeconds;


startBtn.addEventListener("click",function(){
    if(timer){
        return;
    }
    timer = setInterval(function() {
     seconds++;

    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }

    let formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    timerDisplay.textContent = formattedMinutes+ ":" + formattedSeconds;
}, 1000);
sss
    });

    pauseBtn.addEventListener("click",function(){
        clearInterval(timer);
        timer=null;
    });

    resetBtn.addEventListener("click", function() {
    clearInterval(timer);

    timer = null;
    minutes = 0;
    seconds = 0;

    timerDisplay.textContent = "00:00";
});


