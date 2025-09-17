const urlBase = 'http://www.team17.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";


/*******************************************************LOGIN / REGISTER FUNCTIONS************************************************/
function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contact.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function goRegister()
{
	// This is just a redirect to a new page... this can probably be implemented in doRegister
	// but i am concentraiting on getting things working. 9/10/25 nn
	window.location.href="register.html";
}

function doRegister()
{
	// Pull info from html input id's
	// Example:
	// let js_variable = document.getElementById("html_variable").value
	let firstName = document.getElementById("firstName").value;
	let lastName = document.getElementById("lastName").value;
	let login = document.getElementById("login").value;
	let password = document.getElementById("password").value;

	

	// associate the above values with the keys of the php
	// Example
	// let tmp = {PHP_Key:js_variable} 
	let tmp = {firstName:firstName,lastName:lastName,login:login,password:password};

	


	// JSON.strigify(tmp) converts the above data to a format like
	// {
	//   "PHP_Key": "js_variable",
	//   "PHP_Key": "js_variable"
	// }
	let jsonPayload = JSON.stringify(tmp);


	let url = urlBase + '/AddUser.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if(this.readyState == 4 && this.status == 200)
			{
				document.getElementById("userAddResult").innerHTML = 
        `User has been added. Please return to login page.<br>
         <button type="button" class="buttons" onclick="window.location.href='index.html';">
             Login
         </button>`;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
	       document.getElementById("userAddResult").innerHTML = err.message;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

/**********************************************************MAIN FUNCTIONS*********************************************************/
function searchContact()
{
	
	//searchClearFunctions();

	let srch = document.getElementById("searchText").value;

	if(srch.length === 0)
	{
		document.getElementById("contactList").innerHTML = "";
		document.getElementById("contactSearchResult").innerHTML = "Please enter a search term.";
		return;
	}

	// This clears both mentioned fields  
	document.getElementById("contactSearchResult").innerHTML = "";
	document.getElementById("contactList").innerHTML = "";	
	
	let contactList = "";

	// The first term before the : is the term that must match the terms in the php (the key). The term after the :
	// must match the term in this function (the value).
	// Here I pull the search term from the html by way of "searchText". This then gets associated with "srch"
	// in this function. So I then take that term and make it the "value" of the key:value pair.
	// SO {php_term:js_term}
	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
			
				let jsonObject = JSON.parse( xhr.responseText );
	
				
				// If backend returns an error message
				if(jsonObject.error && jsonObject.error.length > 0)
				{
					document.getElementById("contactSearchResult").innerHTML = jsonObject.error;
					document.getElementById("contactList").innerHTML = "";
					return;
				}


				// If an array is returned but there are no results
				if(!jsonObject.results || jsonObject.results.length === 0)
				{
					document.getElementById("contactSearchResult").innerHTML = "No Matching contacts found.";
					document.getElementById("contactList").innerHTML = "";
					return;
				}

				// Array is returned and there are results
				for (let i = 0; i < jsonObject.results.length; i++)
				{
					const entry = String(jsonObject.results[i]);                 // e.g., "Name...<br>Email...<br>Phone...<br>ID: 8"
					const display = entry.replace(/<br>\s*ID:\s*\d+/i, "");      // hide the ID line
					contactList += display;
	
					if (i < jsonObject.results.length - 1) 
					{
						contactList += "<br><br>\r\n";
					}
				}

document.getElementsByTagName("p")[0].innerHTML = contactList; 
			}
		};
		xhr.send(jsonPayload);
	}

	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
		document.getElementById("contactList").innerHTML = "";
	}
	
}

function addContact()
{

  //addClearFunctions();

  // Pull values from HTML inputs
  const newFirstName = document.getElementById("firstNameText").value.trim();
  const newLastName  = document.getElementById("lastNameText").value.trim();
  const newPhone     = document.getElementById("phoneText").value.trim();
  const newEmail     = document.getElementById("emailText").value.trim();

  const result = document.getElementById("contactAddResult");

  // Build payload
  const tmp = { userId: userId };
  if (newFirstName) tmp.jsNewFirst = newFirstName;
  if (newLastName)  tmp.jsNewLast  = newLastName;
  if (newPhone)     tmp.jsNewPhone = newPhone;
  if (newEmail)     tmp.jsNewEmail = newEmail;

  const jsonPayload = JSON.stringify(tmp);

  // POST request to backend
  const url = urlBase + "/AddContact." + extension;
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  if (result) 
	result.textContent = "Adding…";

  xhr.onreadystatechange = function() 
  {
    if (this.readyState !== 4) return;

    try
	{
      if (this.status === 200) 
	  {
        const resp = JSON.parse(xhr.responseText || "{}");
      
		if (resp.error)
		{
          if (result)
		  { 
			result.textContent = "Error: " + resp.error;
          	return;
		  }
        }

        if (result) 
			result.textContent = "Contact added successfully.";

        // Clear inputs after success
        document.getElementById("firstNameText").value = "";
        document.getElementById("lastNameText").value  = "";
        document.getElementById("phoneText").value     = "";
        document.getElementById("emailText").value     = "";
      } 
	  
	  else 
	  {
        if (result) result.textContent = "Server error (" + this.status + ").";
      }

    } 
	
	catch (e) 
	{
      if (result) result.textContent = "Unexpected response.";
      console.error(e);
    }
  };

  xhr.onerror = function() {
    if (result) result.textContent = "Network error.";
  };

  xhr.send(jsonPayload);
}

function deleteContact() 
{

  //deleteClearFunctions();

  const name = document.getElementById("deleteContactText").value.trim();
 
  // if input box is empty
  if (!name) 
  {
    document.getElementById("deleteList").innerHTML = "";
    document.getElementById("contactDeleteResult").innerHTML = "Please enter a search term.";
    return;
  }

  // clear out previous results
  document.getElementById("contactDeleteResult").innerHTML = "";
  document.getElementById("deleteList").innerHTML = "";

  // setting url for HTTP request and payload to be sent
  const url = urlBase + "/SearchContacts." + extension;
  const jsonPayload = JSON.stringify({ search: name, userId: userId });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () 
  {
    if (this.readyState !== 4) return;

    if (this.status !== 200) 
	{
      document.getElementById("contactDeleteResult").innerHTML = "Search failed (HTTP " + this.status + ").";
      return;
    }

    const jsonObject = JSON.parse(xhr.responseText);

    if (jsonObject.error && jsonObject.error.length > 0) 
	{
      document.getElementById("contactDeleteResult").innerHTML = jsonObject.error;
      return;
    }

    const results = jsonObject.results || [];
    
	if (results.length === 0) 
	{
      document.getElementById("contactDeleteResult").innerHTML = "No matching contacts found.";
      return;
    }

    let html = "";

	for (let i = 0; i < results.length; i++)
	{  
		const entry = String(results[i]);                  // "Name...<br>Email...<br>Phone...<br>ID: 8"
		const m = entry.match(/ID:\s*(\d+)/i);
		
		let id;

		if (m) 
		{
			id = m[1];
		} 
		
		else 
		{
			id = null;
		}

		// Hide the ID line from what you show on screen
		const display = entry.replace(/<br>\s*ID:\s*\d+/i, "");

		html += `
			<div class="contactRow">
			<div>${display}</div>
			${id ? `<button class="buttons" onclick="confirmDelete(${id})">Delete</button>` : ""}
			</div>
			<br>
		`;
    }
    
	document.getElementById("deleteList").innerHTML = html;

    if (results.length > 1) 
	{
      document.getElementById("contactDeleteResult").innerHTML = "Multiple matches found. Click the one you want to delete.";
    }

  };
  xhr.send(jsonPayload);
}

function editContact()
{

  //editClearFunctions();

  // Pull values from HTML inputs
  const newFirstName = document.getElementById("firstNameText").value.trim();
  const newLastName  = document.getElementById("lastNameText").value.trim();
  const newPhone     = document.getElementById("phoneText").value.trim();
  const newEmail     = document.getElementById("emailText").value.trim();

  const result = document.getElementById("contactAddResult");

  // Build payload
  const tmp = { userId: userId };
  if (newFirstName) tmp.jsNewFirst = newFirstName;
  if (newLastName)  tmp.jsNewLast  = newLastName;
  if (newPhone)     tmp.jsNewPhone = newPhone;
  if (newEmail)     tmp.jsNewEmail = newEmail;

  const jsonPayload = JSON.stringify(tmp);

  // POST request to backend
  const url = urlBase + "/EditContact." + extension;
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  if (result) 
	result.textContent = "Adding…";

  xhr.onreadystatechange = function() 
  {
    if (this.readyState !== 4) return;

    try
	{
      if (this.status === 200) 
	  {
        const resp = JSON.parse(xhr.responseText || "{}");
      
		if (resp.error)
		{
          if (result)
		  { 
			result.textContent = "Error: " + resp.error;
          	return;
		  }
        }

        if (result) 
			result.textContent = "Contact added successfully.";

        // Clear inputs after success
        document.getElementById("firstNameText").value = "";
        document.getElementById("lastNameText").value  = "";
        document.getElementById("phoneText").value     = "";
        document.getElementById("emailText").value     = "";
      } 
	  
	  else 
	  {
        if (result) result.textContent = "Server error (" + this.status + ").";
      }

    } 
	
	catch (e) 
	{
      if (result) result.textContent = "Unexpected response.";
      console.error(e);
    }
  };

  xhr.onerror = function() {
    if (result) result.textContent = "Network error.";
  };

  xhr.send(jsonPayload);
}

/*************************************************************HELPER FUNCTIONS****************************************************/

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function confirmDelete(contactId) 
{
  if (!contactId) return;
  if (!confirm("Delete this contact?")) return;

  const url = urlBase + "/DeleteContact." + extension;
  const jsonPayload = JSON.stringify({ contactId: contactId, userId: userId });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () 
  {
    if (this.readyState !== 4) return;

    if (this.status === 200) 
	{
      document.getElementById("contactDeleteResult").innerHTML = "Contact deleted.";
      document.getElementById("deleteList").innerHTML = "";
      // Optional: refresh other list
      const term = document.getElementById("searchText")?.value?.trim();
      if (term) searchContact(term);
    } 
	
	else 
	{
		document.getElementById("contactDeleteResult").innerHTML = "Delete failed (HTTP " + this.status + ").";
    }

  };
  xhr.send(jsonPayload);
}

// text fields and results fields cleared
/*
function searchClearFunctions()
{
	//Add
	document.getElementById("addContactText").value = "";
	document.getElementById("addList").innerHTML = "";
	document.getElementById("contactaddResult").innerHTML = "";


	// Delete
	document.getElementById("deleteContactText").value = "";
  	document.getElementById("deleteList").innerHTML = "";
	document.getElementById("contactDeleteResult").innerHTML = "";

	// Edit
	document.getElementById("editContactText").value = "";
	document.getElementById("editList").innerHTML = "";
	document.getElementById("contactEditResult").innerHTML = "";
	
}

function addClearFunctions()
{

	// Search 
	document.getElementById("searchText").value = "";
	  document.getElementById("contactList").innerHTML = "";
	document.getElementById("contactSearchResult").innerHTML = "";

	// Delete
	document.getElementById("deleteContactText").value = "";
	document.getElementById("deleteList").innerHTML = "";
	document.getElementById("contactDeleteResult").innerHTML = "";

	// Edit
	document.getElementById("editContactText").value = "";
	document.getElementById("editList").innerHTML = "";
	document.getElementById("contactEditResult").innerHTML = "";
	

}

function deleteClearFunctions()
{
	
	// Search 
	document.getElementById("searchText").value = "";
  	document.getElementById("contactList").innerHTML = "";
	document.getElementById("contactSearchResult").innerHTML = "";

	// Add
	document.getElementById("addContactText").value = "";
  	document.getElementById("addList").innerHTML = "";
	document.getElementById("contactaddResult").innerHTML = "";	
	

	// Edit
	document.getElementById("editContactText").value = "";
  	document.getElementById("editList").innerHTML = "";
	document.getElementById("contactEditResult").innerHTML = "";	
	

}

function editClearFunctions()
{

	// Search 
	document.getElementById("searchText").value = "";
  	document.getElementById("contactList").innerHTML = "";
	document.getElementById("contactSearchResult").innerHTML = "";

	// Add
	document.getElementById("addContactText").value = "";
    document.getElementById("addList").innerHTML = "";
	document.getElementById("contactaddResult").innerHTML = "";	
	

	// Delete
	document.getElementById("deleteContactText").value = "";
  	document.getElementById("deleteList").innerHTML = "";
	document.getElementById("contactDeleteResult").innerHTML = "";


}
	*/
