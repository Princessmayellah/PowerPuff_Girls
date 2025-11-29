<?php
header('Content-Type: text/plain; charset=utf-8');
date_default_timezone_set('Asia/Manila');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "it414_db_powerpuff_girls";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) { 
    echo "NOT FOUND";
    exit;
}

if (!isset($_GET['rfid_data'])) {
    echo "NOT FOUND";
    exit;
}

$rfid_data = $_GET['rfid_data'];
$manila_time = date('Y-m-d H:i:s');

// Check if RFID exists
$sql_check = "SELECT rfid_status FROM rfid_reg WHERE rfid_data = ?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("s", $rfid_data);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $registered_status = (int)$row['rfid_status'];
    
    // Toggle status
    $new_status = ($registered_status === 1) ? 0 : 1;

    // Update DB
    $sql_update = "UPDATE rfid_reg SET rfid_status = ? WHERE rfid_data = ?";
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param("is", $new_status, $rfid_data);
    $stmt_update->execute();

    // Log
    $sql_log = "INSERT INTO rfid_logs (time_log, rfid_data, rfid_status) VALUES (?, ?, ?)";
    $stmt_log = $conn->prepare($sql_log);
    $stmt_log->bind_param("ssi", $manila_time, $rfid_data, $new_status);
    $stmt_log->execute();

    // Return only 1 or 0
    echo $new_status;
} else {
    // Unknown RFID
    $sql_log = "INSERT INTO rfid_logs (time_log, rfid_data, rfid_status) VALUES (?, ?, null)";
    $stmt_log = $conn->prepare($sql_log);
    $stmt_log->bind_param("ss", $manila_time, $rfid_data);
    $stmt_log->execute();

    echo "NOT FOUND";
}

$stmt->close();
$conn->close();
?>
