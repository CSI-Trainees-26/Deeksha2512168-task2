document.addEventListener('DOMContentLoaded', () => {

    const sleepHoursInput = document.getElementById('sleepHours');
    const sleepMinutesInput = document.getElementById('sleepMinutes');
    const logSleepBtn = document.getElementById('logSleepBtn');
    const todaySleepDisplay = document.getElementById('todaySleepDisplay');

    const targetHoursInput = document.getElementById('targetHours');
    const setTargetBtn = document.getElementById('setTargetBtn');
    const targetDisplay = document.getElementById('targetDisplay');

    const canvas = document.getElementById('sleepChartCanvas');
    const ctx = canvas.getContext('2d');

    const qualityBox = document.querySelector('.quality');
    const qualityLabel = document.getElementById('qualityLabel');
    const qualityMsg = document.getElementById('qualityMsg');

    const avgScoreEl = document.getElementById('avgScore');
    const avgDeepSleepEl = document.getElementById('avgDeepSleep');
    const avgEfficiencyEl = document.getElementById('avgEfficiency');
    const avgTimeInBedEl = document.getElementById('avgTimeInBed');

    const RECORDS_KEY = 'sleepRecords';
    const TARGET_KEY = 'sleepTarget';
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

    function loadTarget() {
        try {
            const saved = safeGetItem(TARGET_KEY);
            return saved ? parseFloat(saved) : null;
        } catch (e) {
            return null;
        }
    }

    function saveTarget(value) {
        safeSetItem(TARGET_KEY, String(value));
    }

    function formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

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

    function formatHours(hours) {
        if (hours === null || hours === undefined) return '--';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }

    let records = loadRecords();
    let target = loadTarget();

    function renderToday() {
        const todayKey = formatDateKey(new Date());
        const todayRecord = records[todayKey];
        if (todayRecord) {
            todaySleepDisplay.textContent = `You slept ${formatHours(todayRecord.hours)} today`;
        } else {
            todaySleepDisplay.textContent = 'No sleep logged for today yet';
        }
    }

    function renderTarget() {
        if (target !== null) {
            targetDisplay.textContent = `Your target is ${formatHours(target)} per night`;
        } else {
            targetDisplay.textContent = 'No target set yet';
        }
    }

    function getWeekData() {
        const weekDates = getCurrentWeekDates();
        return weekDates.map(date => {
            const key = formatDateKey(date);
            const record = records[key];
            return {
                label: DAY_LABELS[(date.getDay() + 6) % 7],
                hours: record ? record.hours : 0,
                logged: !!record
            };
        });
    }

    function drawChart() {
        const weekData = getWeekData();
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        const maxHours = Math.max(target || 0, ...weekData.map(d => d.hours), 8);
        const chartTop = 15;
        const chartBottom = height - 30;
        const chartHeight = chartBottom - chartTop;
        const barAreaWidth = width / weekData.length;
        const barWidth = barAreaWidth * 0.45;

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = chartTop + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        if (target) {
            const targetY = chartBottom - (target / maxHours) * chartHeight;
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(0, targetY);
            ctx.lineTo(width, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        weekData.forEach((d, i) => {
            const barHeight = (d.hours / maxHours) * chartHeight;
            const x = i * barAreaWidth + (barAreaWidth - barWidth) / 2;
            const y = chartBottom - barHeight;

            ctx.fillStyle = d.logged ? '#FFFFFF' : 'rgba(255,255,255,0.25)';
            ctx.beginPath();
            const radius = 6;
            ctx.moveTo(x, y + barHeight);
            ctx.lineTo(x, y + radius);
            ctx.arcTo(x, y, x + radius, y, radius);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
            ctx.lineTo(x + barWidth, y + barHeight);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(d.label, x + barWidth / 2, chartBottom + 18);

            if (d.logged) {
                ctx.fillText(formatHours(d.hours), x + barWidth / 2, y - 6);
            }
        });
    }

    function renderMetrics() {
        const weekData = getWeekData().filter(d => d.logged);

        if (weekData.length === 0) {
            avgScoreEl.textContent = '--';
            avgDeepSleepEl.textContent = '--';
            avgEfficiencyEl.textContent = '--';
            avgTimeInBedEl.textContent = '--';
            qualityLabel.textContent = 'NO DATA';
            qualityMsg.textContent = 'Log your sleep this week to see your quality report';
            qualityBox.classList.remove('good', 'bad');
            return;
        }

        const totalHours = weekData.reduce((sum, d) => sum + d.hours, 0);
        const avgHours = totalHours / weekData.length;
        const goalHours = target || 8;

        const score = Math.min(100, Math.round((avgHours / goalHours) * 100));
        const deepSleep = avgHours * 0.22;
        const efficiency = Math.min(100, Math.round((avgHours / goalHours) * 95));
        const timeInBed = avgHours * 1.08;

        avgScoreEl.textContent = `${score}/100`;
        avgDeepSleepEl.textContent = formatHours(deepSleep);
        avgEfficiencyEl.textContent = `${efficiency}%`;
        avgTimeInBedEl.textContent = formatHours(timeInBed);

        if (avgHours >= goalHours * 0.9) {
            qualityLabel.textContent = 'GOOD';
            qualityMsg.textContent = 'Great work! Keep maintaining this sleep schedule';
            qualityBox.classList.add('good');
            qualityBox.classList.remove('bad');
        } else {
            qualityLabel.textContent = 'NEEDS IMPROVEMENT';
            qualityMsg.textContent = 'Try to go to bed a little earlier for better results';
            qualityBox.classList.add('bad');
            qualityBox.classList.remove('good');
        }
    }

    function renderAll() {
        renderToday();
        renderTarget();
        drawChart();
        renderMetrics();
    }

    logSleepBtn.addEventListener('click', () => {
        const hours = parseFloat(sleepHoursInput.value) || 0;
        const minutes = parseFloat(sleepMinutesInput.value) || 0;
        if (hours === 0 && minutes === 0) return;

        const totalHours = hours + (minutes / 60);
        const todayKey = formatDateKey(new Date());
        records[todayKey] = { hours: totalHours };
        saveRecords(records);

        sleepHoursInput.value = '';
        sleepMinutesInput.value = '';
        renderAll();
    });

    setTargetBtn.addEventListener('click', () => {
        const value = parseFloat(targetHoursInput.value);
        if (!value || value <= 0) return;
        target = value;
        saveTarget(target);
        targetHoursInput.value = '';
        renderAll();
    });

    document.querySelectorAll('.option-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.option-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    window.addEventListener('resize', drawChart);

    renderAll();
});