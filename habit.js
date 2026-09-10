document.addEventListener("DOMContentLoaded", function() {

const arrowBtn1 =document.getElementById("arrowBtn1");

const habitContent1 =  document.getElementById("habitContent1");


arrowBtn1.addEventListener("click", function() {

        if (habitContent1.style.display === "block") {

            habitContent1.style.display = "none";

        } else {

            habitContent1.style.display = "block";

        }

    });

const dayButtons =  document.querySelectorAll("#habitContent1 .day-btn");


const meditationProgress = document.getElementById("meditationProgress");


const meditationMessage = document.getElementById("meditationMessage");


const savedMeditation = JSON.parse(localStorage.getItem("meditationProgress") ) || [];

    function updateMeditationProgress() {

const completedDaysCount =  document.querySelectorAll(  "#habitContent1 .day-btn.completed"  ).length;


        meditationProgress.textContent = completedDaysCount + " out of 7 days completed";


        if (completedDaysCount === 0) {

            meditationMessage.textContent = "Start your week!";

        }

        else if (completedDaysCount <= 2) {

            meditationMessage.textContent =  "Good start! Keep going!";

        }

        else if (completedDaysCount <= 4) {

            meditationMessage.textContent =  "You're building a good habit!";

        }

        else if (completedDaysCount <= 6) {

            meditationMessage.textContent =  "Great job! You're being very consistent!";

        }

        else {

            meditationMessage.textContent = "🎉 Congratulations! You were consistent all week!";

        }

    }

    dayButtons.forEach(function(button) {

        button.addEventListener("click", function() {

            button.classList.toggle("completed");


            const completedDays = Array.from(dayButtons)
                .filter(function(btn) {

                    return btn.classList.contains("completed");

                })
                .map(function(btn) {

                    return btn.dataset.day;

                });


            localStorage.setItem(
                "meditationProgress",
                JSON.stringify(completedDays)
            );


            updateMeditationProgress();

        });

    });


    savedMeditation.forEach(function(day) {

        dayButtons.forEach(function(button) {

            if (button.dataset.day === day) {

                button.classList.add("completed");

            }

        });

    });

    updateMeditationProgress();

});