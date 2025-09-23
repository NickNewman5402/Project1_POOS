<?php

	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$firstLike = "%" . $inData["firstName"] . "%";
		$lastLike  = "%" . $inData["lastName"] . "%";
		
		$stmt = $conn->prepare("SELECT FirstName, LastName, Email, Phone, ID FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID=?");
		$stmt->bind_param("ssi", $firstLike, $lastLike, $inData["userId"]);
		$stmt->execute();

		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '"' . "Name: "
				. $row["FirstName"] . ' ' . $row["LastName"] . "<br>"
		. "Email: "	. $row["Email"] . "<br>"
		. "Phone: "	. $row["Phone"] . "<br>"
		. "ID: " . $row["ID"] . '"';
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>


