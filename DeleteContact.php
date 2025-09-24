<?php
	$inData = getRequestInfo();

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
		$stmt->bind_param("ii", $inData["contactId"], $inData["userId"]);
		$stmt->execute();
		
		if($stmt->affected_rows > 0)
		{
			returnWithInfo("Contact Deleted");
		}
		else
		{
			returnWithError("No matching contact found");
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"success":false,"error":"'.$err.'"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $message )
	{
		$retValue = '{"success":true,"message":"'.$message.'","error":""}';
		sendResultInfoAsJson( $retValue );
	}


?>
