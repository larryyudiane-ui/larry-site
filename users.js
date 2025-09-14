// ================== User Data Management ==================
function getUsers() {
    try {
        const users = localStorage.getItem('users');
        if (users) {
            const parsedUsers = JSON.parse(users);
            // Ensure all users have proper data structure and convert time strings back to Date objects
            return parsedUsers.map(user => ({
                ...user,
                data: user.data ? convertDataTimesToDates(user.data) : generateInitialData()
            }));
        }
    } catch (e) {
        console.error("Data users corrupt, reset ulang:", e);
    }

    // fallback ke default
    const defaultUsers = [
        { id: 'user1', name: 'User 1', data: generateInitialData() },
        { id: 'user2', name: 'User 2', data: generateInitialData() }
    ];
    saveUsers(defaultUsers);
    return defaultUsers;
}

// Helper function to convert time strings back to Date objects
function convertDataTimesToDates(data) {
    const convertedData = { ...data };
    ['ph', 'cod', 'tss', 'nh3n', 'flowmeter'].forEach(param => {
        if (convertedData[param] && convertedData[param].history) {
            convertedData[param].history = convertedData[param].history.map(h => ({
                time: new Date(h.time),
                value: Number(h.value)
            }));
        }
    });
    return convertedData;
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function addUser(name) {
    const users = getUsers();
    const newUser = {
        id: 'user' + (users.length + 1),
        name: name,
        data: generateInitialData()
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

function getUserData(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    return user ? user.data : null;
}

function updateUserData(userId, newData) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].data = newData;
        saveUsers(users);
    }
}

function generateInitialData() {
    const now = Date.now();
    return {
        ph: { 
            value: parseFloat((Math.random() * 2 + 6).toFixed(1)), 
            history: Array.from({length: 10}, (_, i) => ({ 
                time: new Date(now - (9 - i) * 1800000), 
                value: parseFloat((Math.random() * 2 + 6).toFixed(1)) 
            })) 
        },
        cod: { 
            value: Math.floor(Math.random() * 100 + 20), 
            history: Array.from({length: 10}, (_, i) => ({ 
                time: new Date(now - (9 - i) * 1800000), 
                value: Math.floor(Math.random() * 100 + 20) 
            })) 
        },
        tss: { 
            value: Math.floor(Math.random() * 50 + 10), 
            history: Array.from({length: 10}, (_, i) => ({ 
                time: new Date(now - (9 - i) * 1800000), 
                value: Math.floor(Math.random() * 50 + 10) 
            })) 
        },
        nh3n: { 
            value: parseFloat((Math.random() * 10 + 1).toFixed(1)), 
            history: Array.from({length: 10}, (_, i) => ({ 
                time: new Date(now - (9 - i) * 1800000), 
                value: parseFloat((Math.random() * 10 + 1).toFixed(1)) 
            })) 
        },
        flowmeter: { 
            value: Math.floor(Math.random() * 50 + 80), 
            history: Array.from({length: 10}, (_, i) => ({ 
                time: new Date(now - (9 - i) * 1800000), 
                value: Math.floor(Math.random() * 50 + 80) 
            })) 
        }
    };
}

function simulateDataUpdate(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const data = users[userIndex].data;
        const now = new Date();
        // Update current values
        data.ph.value = parseFloat((Math.random() * 2 + 6).toFixed(1));
        data.cod.value = Math.floor(Math.random() * 100 + 20);
        data.tss.value = Math.floor(Math.random() * 50 + 10);
        data.nh3n.value = parseFloat((Math.random() * 10 + 1).toFixed(1));
        data.flowmeter.value = Math.floor(Math.random() * 50 + 80);

        // Update history
        data.ph.history.shift();
        data.ph.history.push({ time: now, value: data.ph.value });
        data.cod.history.shift();
        data.cod.history.push({ time: now, value: data.cod.value });
        data.tss.history.shift();
        data.tss.history.push({ time: now, value: data.tss.value });
        data.nh3n.history.shift();
        data.nh3n.history.push({ time: now, value: data.nh3n.value });
        data.flowmeter.history.shift();
        data.flowmeter.history.push({ time: now, value: data.flowmeter.value });

        saveUsers(users);
    }
}

// Initialize users if not exist
if (!localStorage.getItem('users')) {
    saveUsers(getUsers());
}

// ================== Chart Handling ==================
const userCharts = {}; // simpan chart per user

function renderUserChart(user) {
    const ctx = document.getElementById(`${user.id}-chart`);
    if (!ctx) return;

    const data = user.data;

    userCharts[user.id] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.ph.history.map(h => h.time),
            datasets: [
                {
                    label: 'pH',
                    data: data.ph.history.map(h => h.value),
                    borderColor: '#4285f4',
                    backgroundColor: 'rgba(66,133,244,0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'COD (mg/L)',
                    data: data.cod.history.map(h => h.value),
                    borderColor: '#ea4335',
                    backgroundColor: 'rgba(234,67,53,0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'TSS (mg/L)',
                    data: data.tss.history.map(h => h.value),
                    borderColor: '#fbbc05',
                    backgroundColor: 'rgba(251,188,5,0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'NH3-N (mg/L)',
                    data: data.nh3n.history.map(h => h.value),
                    borderColor: '#34a853',
                    backgroundColor: 'rgba(52,168,83,0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Flow (m³/h)',
                    data: data.flowmeter.history.map(h => h.value),
                    borderColor: '#9c27b0',
                    backgroundColor: 'rgba(156,39,176,0.1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'bottom' } },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        tooltipFormat: 'HH:mm:ss',
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: { beginAtZero: true }
            }
        }
    });
}

function updateUserChart(userId) {
    simulateDataUpdate(userId);
    const user = getUsers().find(u => u.id === userId);
    if (!user || !userCharts[userId]) return;

    const chart = userCharts[userId];
    const data = user.data;

    chart.data.labels = data.ph.history.map(h => h.time);
    chart.data.datasets[0].data = data.ph.history.map(h => h.value);
    chart.data.datasets[1].data = data.cod.history.map(h => h.value);
    chart.data.datasets[2].data = data.tss.history.map(h => h.value);
    chart.data.datasets[3].data = data.nh3n.history.map(h => h.value);
    chart.data.datasets[4].data = data.flowmeter.history.map(h => h.value);

    chart.update('none');
}

// ================== Dashboard Init ==================
let updateInterval;

function initDashboard() {
    const container = document.getElementById('dashboard');
    if (!container) return; // kalau halaman bukan dashboard, hentikan

    const users = getUsers();
    container.innerHTML = ''; // reset

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <h3>${user.name}</h3>
            <div class="chart-container"><canvas id="${user.id}-chart"></canvas></div>
        `;
        container.appendChild(card);
        renderUserChart(user);
    });

    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
        users.forEach(u => updateUserChart(u.id));
    }, 5000);
}

window.addEventListener('DOMContentLoaded', initDashboard);
