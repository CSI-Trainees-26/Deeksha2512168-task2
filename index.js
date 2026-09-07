document.addEventListener('DOMContentLoaded', () => {

    const overallProgressText = document.getElementById('overallProgressText');
    const progressCircle = document.querySelector('.progress-circle');
    const monthlyChartCanvas = document.getElementById('monthlyProgressChart');
    const monthlyChartCtx = monthlyChartCanvas.getContext('2d');
    const waterTodayText = document.getElementById('waterTodayText');
    const waterProgressFill = document.getElementById('waterProgressFill');
    const calorieTodayText = document.getElementById('calorieTodayText');
    const calorieInput = document.getElementById('calorieInput');
    const addCalorieBtn = document.getElementById('addCalorieBtn');
    const sleepSummaryText = document.getElementById('sleepSummaryText');

    const SLEEP_RECORDS_KEY = 'sleepRecords';
    const SLEEP_TARGET_KEY = 'sleepTarget';
    const WATER_RECORDS_KEY = 'waterRecords';
    const CALORIE_RECORDS_KEY = 'calorieRecords';
    const DAILY_WATER_GOAL_ML = 5000;
    const DEFAULT_SLEEP_TARGET = 8;

    const memoryFallback = {};

    function safeGetItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return Object.prototype.hasOwnProperty.call(memoryFallback, key) ? memoryFallback[key] : null;
        }
    }

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            memoryFallback[key] = value;
        }
    }

    function loadJSON(key) {
        try {
            const saved = safeGetItem(key);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    function saveJSON(key, value) {
        safeSetItem(key, JSON.stringify(value));
    }

    function formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function getCurrentMonthDates() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dates = [];
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(year, month, i));
        }
        return dates;
    }

    function getSleepTarget() {
        const saved = safeGetItem(SLEEP_TARGET_KEY);
        return saved ? parseFloat(saved) : DEFAULT_SLEEP_TARGET;
    }

    function getSleepProgressForDate(dateKey, sleepRecords, target) {
        const record = sleepRecords[dateKey];
        if (!record) return null;
        return Math.min(100, (record.hours / target) * 100);
    }

    function getWaterProgressForDate(dateKey, waterRecords) {
        const total = waterRecords[dateKey];
        if (total === undefined) return null;
        return Math.min(100, (total / DAILY_WATER_GOAL_ML) * 100);
    }

    function renderOverallProgress() {
        const sleepRecords = loadJSON(SLEEP_RECORDS_KEY);
        const waterRecords = loadJSON(WATER_RECORDS_KEY);
        const target = getSleepTarget();
        const todayKey = formatDateKey(new Date());

        const sleepProgress = getSleepProgressForDate(todayKey, sleepRecords, target);
        const waterProgress = getWaterProgressForDate(todayKey, waterRecords);

        const values = [sleepProgress, waterProgress].filter(v => v !== null);
        const overall = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

        overallProgressText.textContent = `${overall}%`;
        progressCircle.style.background = `conic-gradient(white ${overall}%, rgba(255,255,255,0.35) 0)`;
    }

    function drawBarChart(canvas, ctx, entries, options) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || canvas.parentElement.clientWidth || 300;
        const height = rect.height || canvas.parentElement.clientHeight || 200;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const maxValue = options.maxValue || 100;
        const chartTop = 10;
        const chartBottom = height - 10;
        const chartHeight = chartBottom - chartTop;
        const barAreaWidth = width / entries.length;
        const barWidth = Math.max(2, barAreaWidth * options.barWidthRatio);

        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = chartTop + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        entries.forEach((entry, i) => {
            const barHeight = (entry.value / maxValue) * chartHeight;
            const x = i * barAreaWidth + (barAreaWidth - barWidth) / 2;
            const y = chartBottom - barHeight;

            ctx.fillStyle = entry.value > 0 ? options.color : 'rgba(159,161,255,0.2)';
            ctx.beginPath();
            const radius = Math.min(3, barWidth / 2);
            ctx.moveTo(x, y + barHeight);
            ctx.lineTo(x, y + radius);
            ctx.arcTo(x, y, x + radius, y, radius);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
            ctx.lineTo(x + barWidth, y + barHeight);
            ctx.closePath();
            ctx.fill();
        });
    }

    function renderMonthlyChart() {
        const sleepRecords = loadJSON(SLEEP_RECORDS_KEY);
        const waterRecords = loadJSON(WATER_RECORDS_KEY);
        const target = getSleepTarget();
        const monthDates = getCurrentMonthDates();

        const entries = monthDates.map(date => {
            const key = formatDateKey(date);
            const sleepProgress = getSleepProgressForDate(key, sleepRecords, target);
            const waterProgress = getWaterProgressForDate(key, waterRecords);
            const values = [sleepProgress, waterProgress].filter(v => v !== null);
            const combined = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            return { value: combined };
        });

        drawBarChart(monthlyChartCanvas, monthlyChartCtx, entries, {
            maxValue: 100,
            barWidthRatio: 0.6,
            color: '#7D80F0'
        });
    }

    function renderWater() {
        const waterRecords = loadJSON(WATER_RECORDS_KEY);
        const todayKey = formatDateKey(new Date());
        const total = waterRecords[todayKey] || 0;
        const liters = total / 1000;
        const displayValue = total >= 1000 ? `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(2)}L` : `${total}ml`;

        waterTodayText.textContent = `${displayValue} consumed today`;
        const percent = Math.min(100, (total / DAILY_WATER_GOAL_ML) * 100);
        waterProgressFill.style.width = `${percent}%`;
    }

    function renderCalorie() {
        const calorieRecords = loadJSON(CALORIE_RECORDS_KEY);
        const todayKey = formatDateKey(new Date());
        const total = calorieRecords[todayKey] || 0;
        calorieTodayText.textContent = `${total} kcal today`;
    }

    function addCalorie() {
        const value = parseFloat(calorieInput.value);
        if (!value || value <= 0) return;

        const calorieRecords = loadJSON(CALORIE_RECORDS_KEY);
        const todayKey = formatDateKey(new Date());
        calorieRecords[todayKey] = (calorieRecords[todayKey] || 0) + value;
        saveJSON(CALORIE_RECORDS_KEY, calorieRecords);

        calorieInput.value = '';
        renderCalorie();
        renderOverallProgress();
    }

    function renderSleepSummary() {
        const sleepRecords = loadJSON(SLEEP_RECORDS_KEY);
        const target = getSleepTarget();
        const todayKey = formatDateKey(new Date());
        const todayRecord = sleepRecords[todayKey];

        if (!todayRecord) {
            sleepSummaryText.textContent = 'No sleep data yet';
            return;
        }

        const hours = todayRecord.hours;
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        const formatted = m > 0 ? `${h}h ${m}m` : `${h}h`;
        const quality = hours >= target * 0.9 ? 'GOOD' : 'NEEDS IMPROVEMENT';

        sleepSummaryText.textContent = `Last night: ${formatted} — ${quality}`;
    }

    function renderAll() {
        renderOverallProgress();
        renderMonthlyChart();
        renderWater();
        renderCalorie();
        renderSleepSummary();
    }

    addCalorieBtn.addEventListener('click', addCalorie);
    calorieInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCalorie();
    });

    window.addEventListener('resize', renderMonthlyChart);

    renderAll();
});