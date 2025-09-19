<?php
	$inData = getRequestInfo();
	
	$contactId = $inData["contactId"];
	$firstName = $inData["jsNewFirst"];
	$lastName = $inData["jsNewLast"];
	$phoneNum = $inData["jsNewPhone"];
	$email = $inData["jsNewEmail"];
	$userId = $inData["userId"];

	// Input validation so we know we have the two necessary values contactId and userId
	if (empty($contactId) || empty($userId)) {
		returnWithError("Contact ID and User ID not present");
		return;
	}

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
		// Check if the contact exists
		$checkStmt = $conn->prepare("SELECT ID FROM Contacts WHERE ID=? AND UserID=?");
		$checkStmt->bind_param("ii", $contactId, $userId);
		$checkStmt->execute();
		$checkResult = $checkStmt->get_result();
		
		if ($checkResult->num_rows == 0) {
			returnWithError("Contact not found");
			$checkStmt->close();
			$conn->close();
			return;
		}
		$checkStmt->close();

		// Update contact
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=? AND UserID=?");
		$stmt->bind_param("ssssii", $firstName, $lastName, $phoneNum, $email, $contactId, $userId);
		$stmt->execute();
		
		if ($stmt->affected_rows > 0) {
			returnWithInfo("Contact updated");
		} else {
			returnWithError("No changes were made");
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError($err)
	{
		$retValue = '{"success":false,"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithInfo($message)
	{
		$retValue = '{"success":true,"message":"' . $message . '","error":""}';
		sendResultInfoAsJson($retValue);
	}

?>