document.addEventListener("DOMContentLoaded", function () {


    const arrowBtn1 = document.getElementById("arrowBtn1");
    const habitContent1 = document.getElementById("habitContent1");

    arrowBtn1.addEventListener("click", function () {
        if (habitContent1.style.display === "block") {
            habitContent1.style.display = "none";
        } else {
            habitContent1.style.display = "block";
        }
    });


    const arrowBtn2 = document.getElementById("arrowBtn2");
    const habitContent2 = document.getElementById("habitContent2");

    arrowBtn2.addEventListener("click", function () {
        if (habitContent2.style.display === "block") {
            habitContent2.style.display = "none";
        } else {
            habitContent2.style.display = "block";
        }
    });


    const arrowBtn3 = document.getElementById("arrowBtn3");
    const habitContent3 = document.getElementById("habitContent3");

    arrowBtn3.addEventListener("click", function () {
        if (habitContent3.style.display === "block") {
            habitContent3.style.display = "none";
        } else {
            habitContent3.style.display = "block";
        }
    });


    const arrowBtn4 = document.getElementById("arrowBtn4");
    const habitContent4 = document.getElementById("habitContent4");

    arrowBtn4.addEventListener("click", function () {
        if (habitContent4.style.display === "block") {
            habitContent4.style.display = "none";
        } else {
            habitContent4.style.display = "block";
        }
    });


    const arrowBtn5 = document.getElementById("arrowBtn5");
    const habitContent5 = document.getElementById("habitContent5");

    arrowBtn5.addEventListener("click", function () {
        if (habitContent5.style.display === "block") {
            habitContent5.style.display = "none";
        } else {
            habitContent5.style.display = "block";
        }
    });


    function setupHabit(contentId, progressId, messageId, storageKey) {

        const content = document.getElementById(contentId);

        const dayButtons = content.querySelectorAll(".day-btn");

        const progressText = document.getElementById(progressId);

        const messageText = document.getElementById(messageId);


        const savedDays =
            JSON.parse(localStorage.getItem(storageKey)) || [];


        function updateProgress() {

            const completedDaysCount =
                content.querySelectorAll(".day-btn.completed").length;


            progressText.textContent =
                completedDaysCount + " out of 7 days completed";


            if (completedDaysCount === 0) {

                messageText.textContent =
                    "Start your Week!";

            }

            else if (completedDaysCount <= 2) {

                messageText.textContent =
                    "Good start! Keep going!";

            }

            else if (completedDaysCount <= 4) {

                messageText.textContent =
                    "You're building a good habit!";

            }

            else if (completedDaysCount <= 6) {

                messageText.textContent =
                    "Great job! You're being very consistent!";

            }

            else {

                messageText.textContent =
                    "🎉 Congratulations! You were consistent all week!";

            }
        }

        dayButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                button.classList.toggle("completed");

                const completedDays =
                    Array.from(dayButtons)

                        .filter(function (btn) {
                            return btn.classList.contains("completed");
                        })

                        .map(function (btn) {
                            return btn.dataset.day;
                        });

                localStorage.setItem(
                    storageKey,
                    JSON.stringify(completedDays)
                );

                updateProgress();

            });

        });

        savedDays.forEach(function (day) {

            dayButtons.forEach(function (button) {

                if (button.dataset.day === day) {

                    button.classList.add("completed");

                }

            });

        });

        updateProgress();

    }


    setupHabit(
        "habitContent1",
        "meditationProgress",
        "meditationMessage",
        "meditationProgress"
    );


    setupHabit(
        "habitContent2",
        "runningProgress",
        "runningMessage",
        "runningHabitProgress"
    );


    setupHabit(
        "habitContent3",
        "yogasProgress",
        "yogaMessage",
        "yogaHabitProgress"
    );


    setupHabit(
        "habitContent4",
        "waterProgress",
        "waterMessage",
        "waterHabitProgress"
    );


    setupHabit(
        "habitContent5",
        "sleepProgress",
        "sleepMessage",
        "sleepHabitProgress"
    );

});
