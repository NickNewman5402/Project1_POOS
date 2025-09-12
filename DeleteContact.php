<?php

  /**********************************************Search part of delete********************************************************/
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
    // added ID to this prepare(); so when this php reaches out to the databse we will get the systemID back
		$stmt = $conn->prepare("SELECT FirstName, LastName, Email, Phone, ID FROM Contacts WHERE FirstName LIKE ? AND UserID=?");
		$firstLike = "%" . $inData["search"] . "%";
		$stmt->bind_param("si", $firstLike, $inData["userId"]);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
    // Getting the system ID of the contact found to use for deletion
    //$row = $result->fetch_assoc();
    //$contactID = $row["ID"];


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
	        . "ID: "        . $row["ID"]    . '"';
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
      //send back to code.js
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

    /****************************************End search part of delete********************************************************/

?>
