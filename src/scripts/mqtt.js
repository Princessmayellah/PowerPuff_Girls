async function fetchData() {
    try {
        const res = await fetch("http://10.63.198.232/Lab2/web_interface.php");
        const data = await res.json();

        updateRegistered(data.registered);
        updateLogs(data.logs);
    } catch (err) {
        console.log("Fetch error:", err);
    }
}

function updateRegistered(list) {
    const container = document.querySelector(".rfid-list");
    container.innerHTML = "";

    list.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "rfid-item";

        div.innerHTML = `
            <span class="index">${index + 1}.</span>
            <span class="uid">${item.rfid}</span>
            <label class="switch">
                <input type="checkbox" ${item.status == 1 ? "checked" : ""} disabled>
                <span class="slider round"></span>
            </label>
        `;

        container.appendChild(div);
    });
}

function updateLogs(logs) {
    const table = document.getElementById("log-table-body");
    table.innerHTML = "";

    logs.forEach((log, index) => {
        let displayStatus;

        // Convert status to number if possible
        const statusNum = Number(log.status);

        // Check if RFID exists in logs
        if (!log.rfid || log.status === null) {
            displayStatus = "RFID NOT FOUND";
        } else if (statusNum === 1 || statusNum === 0) {
            displayStatus = statusNum;
        } else {
            displayStatus = "RFID NOT FOUND";
        }

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${log.rfid}</td>
                <td>${displayStatus}</td>
                <td>${log.time}</td>
            </tr>
        `;
        table.insertAdjacentHTML("beforeend", row);
    });
}


// Auto-refresh every 1 second
setInterval(fetchData, 1000);

fetchData();
