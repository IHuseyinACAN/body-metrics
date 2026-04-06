
// State
let entries = JSON.parse(localStorage.getItem('bodyMetrics_entries')) || [];
let chartInstance = null;
let currentChartType = 'weight';

// DOM Elements
const els = {
    date: document.getElementById('currentDate'),
    addBtn: document.getElementById('addEntryBtn'),
    modal: document.getElementById('entryModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    form: document.getElementById('entryForm'),
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view'),
    chartCanvas: document.getElementById('progressChart'),
    chartFilter: document.getElementById('chartFilter'),
    historyList: document.getElementById('historyList'),
    clearBtn: document.getElementById('clearDataBtn'),

    // Display slots
    dispWeight: document.getElementById('disp-weight'),
    diffWeight: document.getElementById('diff-weight'),
    dispFat: document.getElementById('disp-fat'),
    diffFat: document.getElementById('diff-fat'),
    dispMuscle: document.getElementById('disp-muscle'),
    diffMuscle: document.getElementById('diff-muscle'),
    dispWater: document.getElementById('disp-water'),
    diffWater: document.getElementById('diff-water'),
    dispBone: document.getElementById('disp-bone'),
    diffBone: document.getElementById('diff-bone'),
    dispBmr: document.getElementById('disp-bmr'),
    diffBmr: document.getElementById('diff-bmr'),
    dispAge: document.getElementById('disp-age'),
    diffAge: document.getElementById('diff-age'),
    dispVisceral: document.getElementById('disp-visceral'),
    diffVisceral: document.getElementById('diff-visceral'),
    latestDetails: document.getElementById('latest-details')
};

// Utils
const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('tr-TR', options);
};

const formatShortDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// Init
function init() {
    els.date.textContent = formatDate(new Date());
    renderDashboard();
    renderHistory();
    initChart();

    // Events
    els.addBtn.addEventListener('click', () => openModal());
    els.closeModalBtn.addEventListener('click', () => closeModal());
    els.form.addEventListener('submit', handleFormSubmit);
    els.chartFilter.addEventListener('change', (e) => {
        currentChartType = e.target.value;
        updateChart();
    });

    // Navigation
    els.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;
            const isAlreadyActive = item.classList.contains('active');

            // If clicking already active non-dashboard item, return to dashboard
            if (isAlreadyActive && targetId !== 'dashboard') {
                const dashboardNavItem = Array.from(els.navItems).find(n => n.dataset.target === 'dashboard');
                dashboardNavItem.click();
                return;
            }

            // Normal Switch
            els.navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // View Switch
            els.views.forEach(v => {
                if (v.id === targetId) v.classList.remove('hidden', 'active');
                else v.classList.add('hidden');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });

    els.clearBtn.addEventListener('click', () => {
        if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
            entries = [];
            saveData();
            location.reload();
        }
    });
}

// Logic
function openModal() {
    els.modal.classList.add('open');
    // Pre-fill date? standard is today.
}

function closeModal() {
    els.modal.classList.remove('open');
    els.form.reset();
}

function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        id: Date.now(),
        date: new Date().toISOString(),
        weight: parseFloat(document.getElementById('input-weight').value) || 0,
        fat: parseFloat(document.getElementById('input-fat').value) || 0,
        muscle: parseFloat(document.getElementById('input-muscle').value) || 0,
        water: parseFloat(document.getElementById('input-water').value) || 0,
        bone: parseFloat(document.getElementById('input-bone').value) || 0,
        bmr: parseFloat(document.getElementById('input-bmr').value) || 0,
        metAge: parseFloat(document.getElementById('input-age').value) || 0,
        visceral: parseFloat(document.getElementById('input-visceral').value) || 0
    };

    entries.push(formData);
    // Sort by date just in case
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    saveData();
    renderDashboard();
    renderHistory();
    updateChart();
    closeModal();
}

function saveData() {
    localStorage.setItem('bodyMetrics_entries', JSON.stringify(entries));
}

function renderDashboard() {
    if (entries.length === 0) return;

    const latest = entries[entries.length - 1];
    const prev = entries.length > 1 ? entries[entries.length - 2] : null;

    // Helper to set text and diff
    const setMetric = (elVal, elDiff, val, prevVal, unit) => {
        elVal.textContent = val;

        if (prevVal) {
            const diff = (val - prevVal).toFixed(1);
            const isPos = diff > 0;
            const sign = isPos ? '+' : '';
            elDiff.textContent = `${sign}${diff} ${unit}`;

            elDiff.classList.remove('positive', 'negative', 'neutral');
            if (diff == 0) elDiff.classList.add('neutral');
            else if (unit === 'kg' && elVal === els.dispMuscle) {
                elDiff.classList.add(isPos ? 'negative' : 'positive'); // Good (Green) if Gain
            } else if (unit === 'kg' && elVal === els.dispBone) {
                elDiff.classList.add(isPos ? 'negative' : 'positive'); // Good (Green) if Gain (assuming bone mass gain is generally good/neutral)
            } else if (unit === 'kcal') {
                elDiff.classList.add(isPos ? 'negative' : 'negative'); // Just keep green, high BMR usually good
            } else {
                // Weight/Fat/Age/Visceral: Gain(Add) -> Red(.positive). Loss(Sub) -> Green(.negative)
                elDiff.className = `change ${isPos ? 'positive' : 'negative'}`;
            }
        } else {
            elDiff.textContent = '-';
        }
    };

    setMetric(els.dispWeight, els.diffWeight, latest.weight, prev?.weight, 'kg');
    setMetric(els.dispFat, els.diffFat, latest.fat, prev?.fat, '%');
    setMetric(els.dispMuscle, els.diffMuscle, latest.muscle, prev?.muscle, 'kg');
    setMetric(els.dispWater, els.diffWater, latest.water, prev?.water, '%');

    setMetric(els.dispBone, els.diffBone, latest.bone, prev?.bone, 'kg');
    setMetric(els.dispBmr, els.diffBmr, latest.bmr, prev?.bmr, 'kcal');
    setMetric(els.dispAge, els.diffAge, latest.metAge, prev?.metAge, 'yıl'); // 'metAge' matches data key
    setMetric(els.dispVisceral, els.diffVisceral, latest.visceral, prev?.visceral, '');

    // Extra details list (Now empty or can remove)
    els.latestDetails.innerHTML = '';
}

function renderHistory() {
    els.historyList.innerHTML = '';
    // Reverse copy to show newest first
    [...entries].reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div>
                <div class="h-date">${formatDate(entry.date)}</div>
                <div class="h-stats">${entry.weight}kg | ${entry.fat}% Yağ</div>
            </div>
            <div style="text-align:right">
                <div class="h-date" style="color:var(--primary)">${entry.bmr} kcal</div>
            </div>
        `;
        els.historyList.appendChild(div);
    });
}

// Chart
const getThemeColors = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
        grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        text: isDark ? '#94a3b8' : '#64748b'
    };
};

function initChart() {
    const ctx = els.chartCanvas.getContext('2d');
    const colors = getThemeColors();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Metric',
                data: [],
                borderColor: '#0d9488',
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointBackgroundColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#94a3b8',
                    bodyFont: { family: 'Outfit', size: 14 }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: colors.text }
                },
                y: {
                    grid: { color: colors.grid, borderDash: [5, 5] },
                    ticks: { color: colors.text }
                }
            }
        }
    });

    // Listen for theme changes to update chart
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const newColors = getThemeColors();
        chartInstance.options.scales.x.ticks.color = newColors.text;
        chartInstance.options.scales.y.grid.color = newColors.grid;
        chartInstance.options.scales.y.ticks.color = newColors.text;
        chartInstance.update();
    });

    updateChart();
}

function updateChart() {
    if (!chartInstance) return;

    // Last 7 or 30 entries
    const dataSlice = entries.slice(-14); // Last 14 entries

    const labels = dataSlice.map(e => formatShortDate(e.date));
    const values = dataSlice.map(e => e[currentChartType]);

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = values;

    // Color switching based on metric
    let color = '#0d9488'; // default teal
    if (currentChartType === 'fat') color = '#4f46e5'; // indigo
    if (currentChartType === 'muscle') color = '#db2777'; // pink

    chartInstance.data.datasets[0].borderColor = color;
    chartInstance.data.datasets[0].pointBorderColor = color;

    // Re-create gradient for fill
    const ctx = els.chartCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color.replace(')', ', 0.5)').replace('rgb', 'rgba')); // hacky but works if hex provided
    // Actually dealing with hex to rgba is annoying manually. Let's just hardcode gradients for simplicity or keep green fill.
    // For now, let's just keep the fill color consistent or simple.

    chartInstance.update();
}

// Run
window.addEventListener('DOMContentLoaded', init);
