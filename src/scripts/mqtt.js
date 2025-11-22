// Connect to your PC's IP
const client = mqtt.connect('ws://192.168.1.14:9001');

const rfidListContainer = document.querySelector('.rfid-list');
const logTable = document.getElementById('log-table-body');
let logCount = 1;

// --- YOUR DATABASE ---
const validDatabase = ["63E7E39","B2728FAB"]; 

client.on('connect', () => {
    console.log("Connected to MQTT Broker");
    client.subscribe('RFID_WEB');
});

// --- INITIALIZATION (Static Left Panel) ---
function initializeDashboard() {
    rfidListContainer.innerHTML = ""; 
    validDatabase.forEach((uid, index) => {
        const count = index + 1;
        const newItem = document.createElement('div');
        newItem.className = 'rfid-item';
        newItem.id = `card-${uid}`; 
        
        newItem.innerHTML = `
            <span class="index">${count}.</span>
            <span class="uid">${uid}</span>
            <label class="switch">
                <input type="checkbox" id="toggle-${uid}" disabled>
                <span class="slider round"></span>
            </label>
        `;
        rfidListContainer.appendChild(newItem);
    });
}

initializeDashboard();

// --- LISTEN FOR MESSAGES ---
client.on('message', (topic, message) => {
    // Trim cleans up hidden spaces!
    const msgString = message.toString().trim(); 
    const parts = msgString.split(","); 
    
    const uid = parts[0].trim();      
    const status = parts[1].trim(); 

    // 1. Update Toggle (Visual Only)
    if (validDatabase.includes(uid)) {
        updateToggleVisual(uid, status);
    }

    // 2. Add Log Entry
    addLogEntry(uid, status);
});


function updateToggleVisual(uid, status) {
    const toggleBtn = document.getElementById(`toggle-${uid}`);
    if (toggleBtn) {
        // Logic: If 1 -> Checked (Blue). If 0 -> Unchecked (Gray).
        if (status === "1") {
            toggleBtn.checked = true; 
        } else {
            toggleBtn.checked = false; 
        }
    }
}

function addLogEntry(uid, status) {
    const now = new Date().toLocaleString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric', 
        hour: 'numeric', minute: 'numeric', hour12: true 
    });

    let displayStatus = "RFID NOT FOUND"; 
    if (validDatabase.includes(uid)) {
        displayStatus = status; 
    }

    const row = `
        <tr>
            <td>${logCount++}.</td>
            <td>${uid}</td>
            <td>${displayStatus}</td>
            <td>${now}</td>
        </tr>
    `;
    logTable.insertAdjacentHTML('afterbegin', row);
}