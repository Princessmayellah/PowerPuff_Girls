<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "it414_db_powerpuff_girls";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

// Fetch registered RFIDs
$registered = [];
$res1 = $conn->query("SELECT rfid_data, rfid_status FROM rfid_reg");

while ($row = $res1->fetch_assoc()) {
    $registered[] = [
        "rfid" => $row["rfid_data"],
        "status" => $row["rfid_status"]
    ];
}

// Fetch logs
$logs = [];
$res2 = $conn->query("SELECT rfid_data, rfid_status, time_log FROM rfid_logs ORDER BY id DESC");

while ($row = $res2->fetch_assoc()) {
    $logs[] = [
        "rfid" => $row["rfid_data"],
        "status" => $row["rfid_status"],
        "time" => $row["time_log"]
    ];
}

echo json_encode([
    "registered" => $registered,
    "logs" => $logs
]);
?>
