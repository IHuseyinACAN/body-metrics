
// State
let entries = JSON.parse(localStorage.getItem('bodyMetrics_entries')) || [];
let chartInstance = null;
let currentChartType = 'weight';
let editingEntryId = null;

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
    
    // Theme, Back and Dynamic Header
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    backBtn: document.getElementById('backBtn'),
    headerTitle: document.getElementById('headerTitle'),
    
    // Form actions inside modal
    deleteEntryBtn: document.getElementById('deleteEntryBtn'),
    submitEntryBtn: document.getElementById('submitEntryBtn'),

    // Welcome modal
    welcomeModal: document.getElementById('welcomeModal'),
    welcomeStartBtn: document.getElementById('welcomeStartBtn'),
    welcomeDismissCheckbox: document.getElementById('welcomeDismissCheckbox'),

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

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('bodyMetrics_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(theme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bodyMetrics_theme', theme);
    
    // Update theme toggle icon
    if (theme === 'dark') {
        els.themeToggleBtn.innerHTML = '<i data-lucide="sun"></i>';
    } else {
        els.themeToggleBtn.innerHTML = '<i data-lucide="moon"></i>';
    }
    if (window.lucide) lucide.createIcons();

    // Update chart if it exists
    if (chartInstance) {
        const colors = getThemeColors();
        chartInstance.options.scales.x.ticks.color = colors.text;
        chartInstance.options.scales.y.grid.color = colors.grid;
        chartInstance.options.scales.y.ticks.color = colors.text;
        chartInstance.update();
    }
}

// Header Navigation logic
function updateHeader(targetId) {
    if (targetId === 'dashboard') {
        els.headerTitle.textContent = 'BodyMetrics';
        els.date.classList.remove('hidden');
        els.addBtn.classList.remove('hidden');
        els.backBtn.classList.add('hidden');
    } else if (targetId === 'history') {
        els.headerTitle.textContent = 'Geçmiş';
        els.date.classList.add('hidden');
        els.addBtn.classList.add('hidden');
        els.backBtn.classList.remove('hidden');
    } else if (targetId === 'settings') {
        els.headerTitle.textContent = 'Ayarlar';
        els.date.classList.add('hidden');
        els.addBtn.classList.add('hidden');
        els.backBtn.classList.remove('hidden');
    }
}

// Welcome Popup check
function checkWelcome() {
    const dismissed = localStorage.getItem('bodyMetrics_welcomeDismissed');
    if (!dismissed) {
        els.welcomeModal.classList.add('open');
    }
}

// Init
function init() {
    initTheme();
    checkWelcome();

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

    els.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    els.backBtn.addEventListener('click', () => {
        const dashboardNavItem = Array.from(els.navItems).find(n => n.dataset.target === 'dashboard');
        if (dashboardNavItem) dashboardNavItem.click();
    });

    els.deleteEntryBtn.addEventListener('click', handleDeleteEntry);

    els.welcomeStartBtn.addEventListener('click', () => {
        if (els.welcomeDismissCheckbox.checked) {
            localStorage.setItem('bodyMetrics_welcomeDismissed', 'true');
        }
        els.welcomeModal.classList.remove('open');
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
            updateHeader(targetId);
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
// Logic
function openModal(entryId = null) {
    editingEntryId = entryId;
    const modalTitle = els.modal.querySelector('.modal-header h2');
    
    if (editingEntryId !== null) {
        modalTitle.textContent = 'Kaydı Düzenle';
        els.submitEntryBtn.textContent = 'Güncelle';
        els.deleteEntryBtn.classList.remove('hidden');
        
        const entry = entries.find(e => e.id === editingEntryId);
        if (entry) {
            document.getElementById('input-weight').value = entry.weight;
            document.getElementById('input-fat').value = entry.fat || '';
            document.getElementById('input-muscle').value = entry.muscle || '';
            document.getElementById('input-water').value = entry.water || '';
            document.getElementById('input-bone').value = entry.bone || '';
            document.getElementById('input-bmr').value = entry.bmr || '';
            document.getElementById('input-age').value = entry.metAge || '';
            document.getElementById('input-visceral').value = entry.visceral || '';
        }
    } else {
        modalTitle.textContent = 'Yeni Kayıt';
        els.submitEntryBtn.textContent = 'Kaydet';
        els.deleteEntryBtn.classList.add('hidden');
        els.form.reset();
    }
    
    els.modal.classList.add('open');
}

function closeModal() {
    els.modal.classList.remove('open');
    els.form.reset();
    editingEntryId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();

    const weightVal = parseFloat(document.getElementById('input-weight').value) || 0;
    const fatVal = parseFloat(document.getElementById('input-fat').value) || 0;
    const muscleVal = parseFloat(document.getElementById('input-muscle').value) || 0;
    const waterVal = parseFloat(document.getElementById('input-water').value) || 0;
    const boneVal = parseFloat(document.getElementById('input-bone').value) || 0;
    const bmrVal = parseFloat(document.getElementById('input-bmr').value) || 0;
    const metAgeVal = parseFloat(document.getElementById('input-age').value) || 0;
    const visceralVal = parseFloat(document.getElementById('input-visceral').value) || 0;

    if (editingEntryId !== null) {
        const entryIndex = entries.findIndex(e => e.id === editingEntryId);
        if (entryIndex !== -1) {
            entries[entryIndex] = {
                ...entries[entryIndex],
                weight: weightVal,
                fat: fatVal,
                muscle: muscleVal,
                water: waterVal,
                bone: boneVal,
                bmr: bmrVal,
                metAge: metAgeVal,
                visceral: visceralVal
            };
        }
    } else {
        const formData = {
            id: Date.now(),
            date: new Date().toISOString(),
            weight: weightVal,
            fat: fatVal,
            muscle: muscleVal,
            water: waterVal,
            bone: boneVal,
            bmr: bmrVal,
            metAge: metAgeVal,
            visceral: visceralVal
        };
        entries.push(formData);
    }

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    saveData();
    renderDashboard();
    renderHistory();
    updateChart();
    closeModal();
}

function handleDeleteEntry() {
    if (editingEntryId === null) return;
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
        entries = entries.filter(e => e.id !== editingEntryId);
        saveData();
        renderDashboard();
        renderHistory();
        updateChart();
        closeModal();
    }
}

function saveData() {
    localStorage.setItem('bodyMetrics_entries', JSON.stringify(entries));
}

function renderDashboard() {
    if (entries.length === 0) {
        const slots = [
            [els.dispWeight, els.diffWeight],
            [els.dispFat, els.diffFat],
            [els.dispMuscle, els.diffMuscle],
            [els.dispWater, els.diffWater],
            [els.dispBone, els.diffBone],
            [els.dispBmr, els.diffBmr],
            [els.dispAge, els.diffAge],
            [els.dispVisceral, els.diffVisceral]
        ];
        slots.forEach(([val, diff]) => {
            val.textContent = '--';
            diff.textContent = '-';
            diff.className = 'change neutral';
        });
        return;
    }

    const latest = entries[entries.length - 1];
    const prev = entries.length > 1 ? entries[entries.length - 2] : null;

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
                elDiff.classList.add(isPos ? 'negative' : 'positive');
            } else if (unit === 'kcal') {
                elDiff.classList.add(isPos ? 'negative' : 'negative');
            } else {
                elDiff.className = `change ${isPos ? 'positive' : 'negative'}`;
            }
        } else {
            elDiff.textContent = '-';
            elDiff.className = 'change neutral';
        }
    };

    setMetric(els.dispWeight, els.diffWeight, latest.weight, prev?.weight, 'kg');
    setMetric(els.dispFat, els.diffFat, latest.fat, prev?.fat, '%');
    setMetric(els.dispMuscle, els.diffMuscle, latest.muscle, prev?.muscle, 'kg');
    setMetric(els.dispWater, els.diffWater, latest.water, prev?.water, '%');

    setMetric(els.dispBone, els.diffBone, latest.bone, prev?.bone, 'kg');
    setMetric(els.dispBmr, els.diffBmr, latest.bmr, prev?.bmr, 'kcal');
    setMetric(els.dispAge, els.diffAge, latest.metAge, prev?.metAge, 'yıl');
    setMetric(els.dispVisceral, els.diffVisceral, latest.visceral, prev?.visceral, '');

    els.latestDetails.innerHTML = '';
}

function renderHistory() {
    els.historyList.innerHTML = '';
    
    if (entries.length === 0) {
        const p = document.createElement('p');
        p.className = 'placeholder-text';
        p.style.textAlign = 'center';
        p.style.padding = '40px 20px';
        p.style.color = 'var(--text-muted)';
        p.textContent = 'Henüz veri girişi yapılmadı.';
        els.historyList.appendChild(p);
        return;
    }

    [...entries].reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div>
                <div class="h-date">${formatDate(entry.date)}</div>
                <div class="h-stats">${entry.weight}kg | ${entry.fat}% Yağ</div>
            </div>
            <div style="text-align:right; display:flex; align-items:center; gap: 12px;">
                <div class="h-date" style="color:var(--primary)">${entry.bmr} kcal</div>
                <i data-lucide="chevron-right" style="width: 18px; height: 18px; color: var(--text-muted);"></i>
            </div>
        `;
        div.addEventListener('click', () => openModal(entry.id));
        els.historyList.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
}

const getThemeColors = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
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

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('bodyMetrics_theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        } else {
            const newColors = getThemeColors();
            chartInstance.options.scales.x.ticks.color = newColors.text;
            chartInstance.options.scales.y.grid.color = newColors.grid;
            chartInstance.options.scales.y.ticks.color = newColors.text;
            chartInstance.update();
        }
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
