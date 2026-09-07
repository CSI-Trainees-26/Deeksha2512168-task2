document.addEventListener('DOMContentLoaded', () => {

    const todayIntakeValue = document.getElementById('todayIntakeValue');
    const goalText = document.getElementById('goalText');
    const add250Btn = document.getElementById('add250Btn');
    const add500Btn = document.getElementById('add500Btn');
    const weekCanvas = document.getElementById('weekChartCanvas');
    const monthCanvas = document.getElementById('monthChartCanvas');
    const weekCtx = weekCanvas.getContext('2d');
    const monthCtx = monthCanvas.getContext('2d');

    const RECORDS_KEY = 'waterRecords';
    const DAILY_GOAL_ML = 5000;
    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

    function loadRecords() {
        try {
            const saved = safeGetItem(RECORDS_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    function saveRecords(records) {
        safeSetItem(RECORDS_KEY, JSON.stringify(records));
    }

    function formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatMl(ml) {
        if (ml >= 1000) {
            const liters = ml / 1000;
            return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(2)}L`;
        }
        return `${ml}ml`;
    }

    let records = loadRecords();

    function getCurrentWeekDates() {
        const today = new Date();
        const dayIndex = (today.getDay() + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayIndex);

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
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

    function renderToday() {
        const todayKey = formatDateKey(new Date());
        const total = records[todayKey] || 0;
        todayIntakeValue.textContent = formatMl(total);
        goalText.textContent = `of ${formatMl(DAILY_GOAL_ML)} goal`;
    }

    function addWater(amount) {
        const todayKey = formatDateKey(new Date());
        records[todayKey] = (records[todayKey] || 0) + amount;
        saveRecords(records);
        renderAll();
    }

    function drawBarChart(canvas, ctx, entries, options) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        const maxValue = Math.max(options.goal || 0, ...entries.map(e => e.value), 500);
        const chartTop = 10;
        const chartBottom = height - (options.showLabels ? 25 : 10);
        const chartHeight = chartBottom - chartTop;
        const barAreaWidth = width / entries.length;
        const barWidth = Math.max(2, barAreaWidth * options.barWidthRatio);

        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = chartTop + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        if (options.goal) {
            const goalY = chartBottom - (options.goal / maxValue) * chartHeight;
            ctx.strokeStyle = 'rgba(43,159,216,0.9)';
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(0, goalY);
            ctx.lineTo(width, goalY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        entries.forEach((entry, i) => {
            const barHeight = (entry.value / maxValue) * chartHeight;
            const x = i * barAreaWidth + (barAreaWidth - barWidth) / 2;
            const y = chartBottom - barHeight;

            ctx.fillStyle = entry.value > 0 ? '#2b9fd8' : 'rgba(43,159,216,0.2)';
            ctx.beginPath();
            const radius = Math.min(4, barWidth / 2);
            ctx.moveTo(x, y + barHeight);
            ctx.lineTo(x, y + radius);
            ctx.arcTo(x, y, x + radius, y, radius);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
            ctx.lineTo(x + barWidth, y + barHeight);
            ctx.closePath();
            ctx.fill();

            if (options.showLabels) {
                ctx.fillStyle = '#333333';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(entry.label, x + barWidth / 2, chartBottom + 16);
            }
        });
    }

    function renderWeekChart() {
        const weekDates = getCurrentWeekDates();
        const entries = weekDates.map(date => ({
            label: DAY_LABELS[(date.getDay() + 6) % 7],
            value: records[formatDateKey(date)] || 0
        }));
        drawBarChart(weekCanvas, weekCtx, entries, {
            goal: DAILY_GOAL_ML,
            barWidthRatio: 0.45,
            showLabels: true
        });
    }

    function renderMonthChart() {
        const monthDates = getCurrentMonthDates();
        const entries = monthDates.map(date => ({
            label: String(date.getDate()),
            value: records[formatDateKey(date)] || 0
        }));
        drawBarChart(monthCanvas, monthCtx, entries, {
            goal: DAILY_GOAL_ML,
            barWidthRatio: 0.6,
            showLabels: false
        });
    }

    function renderAll() {
        renderToday();
        renderWeekChart();
        renderMonthChart();
    }

    add250Btn.addEventListener('click', () => addWater(250));
    add500Btn.addEventListener('click', () => addWater(500));

    window.addEventListener('resize', () => {
        renderWeekChart();
        renderMonthChart();
    });

    renderAll();
});