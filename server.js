const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const mqtt = require('mqtt');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// 1. DATABASE CONNECTION (Matches your PHP settings)
// ---------------------------------------------------------
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',       
    database: 'powerpuff_girls'
});

db.connect(err => {
    if (err) console.error('❌ DB Connection Failed:', err);
    else console.log('✅ Connected to Database: powerpuff_girls');
});

// ---------------------------------------------------------
// 2. MQTT CONNECTION (Replaces the HTTP GET Request)
// ---------------------------------------------------------
const client = mqtt.connect('mqtt://localhost:1883'); 

client.on('connect', () => {
    console.log('✅ Backend Listening to MQTT...');
    client.subscribe('RFID_WEB'); 
});

client.on('message', (topic, message) => {
    // 1. Parse Data (ESP32 sends "UID,STATUS")
    const parts = message.toString().split(",");
    const rfidData = parts[0].trim();  
    const status = parts[1].trim(); // "1" or "0"

    console.log(`>> Received Scan: ${rfidData} (Status: ${status})`);

    // -----------------------------------------------------
    // LOGIC: MIMIC YOUR PHP SCRIPT
    // -----------------------------------------------------
    
    // Step A: Check if card exists in rfid_reg
    const checkSql = "SELECT * FROM rfid_reg WHERE rfid_data = ?";
    
    db.query(checkSql, [rfidData], (err, results) => {
        if (err) return console.error("DB Error:", err);

        let finalStatus = "RFID NOT FOUND"; // Default logic

        if (results.length > 0) {
            // CARD IS REGISTERED
            finalStatus = status;

            // Step B: UPDATE the Registration Table (Just like your PHP!)
            // We update the status in rfid_reg to match the ESP32
            const updateSql = "UPDATE rfid_reg SET rfid_status = ? WHERE rfid_data = ?";
            db.query(updateSql, [status, rfidData], (updateErr) => {
                if (updateErr) console.error("Update Failed:", updateErr);
                else console.log(`   -> Updated rfid_reg status to ${status}`);
            });
        }

        // Step C: INSERT into Logs (Just like your PHP!)
        const insertSql = "INSERT INTO rfid_logs (time_log, rfid_data, rfid_status) VALUES (NOW(), ?, ?)";
        
        db.query(insertSql, [rfidData, finalStatus], (insertErr) => {
            if (insertErr) console.error("❌ Save Log Failed:", insertErr);
            else console.log(`   -> Logged to DB: ${rfidData} -> ${finalStatus}`);
        });
    });
});

// ---------------------------------------------------------
// 3. API FOR WEBSITE
// ---------------------------------------------------------
app.get('/api/registered', (req, res) => {
    db.query("SELECT rfid_data FROM rfid_reg", (err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results.map(r => r.rfid_data));
    });
});

// Start the Server
app.listen(3000, () => console.log("🚀 Bridge Server running on port 3000"));