const urlBase = 'http://www.team17.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";



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
	
				window.location.href = "color.html";
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
				document.getElementById("userAddResult").innerHTML = " User has been added. Please return to login page.";
				document.getElementById("firstName").value = "";
				document.getElementById("lastName").value = "";
				document.getElementById("login").value = "";
				document.getElementById("password").value = "";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
	       document.getElementById("userAddResult").innerHTML = err.message;
	}
}

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

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function searchContact()
{
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
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					contactList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
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

	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {color:newColor,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
	
}

function deleteContact()
{
	// We will pull in a name or some part of a name a lot like search (input box) 
	let name = document.getElementById("deleteContactText").value;

	// we will run this against the database via php searchContact
	// If more than 1 contact is found we will need them to be more specific (display this in a span spot)
	// Once 1 name is returned we can display it and allow them to delete (confirm button)

	// If the user enters nothing in the search box
	if(name.length === 0)
	{
		document.getElementById("deleteList").innerHTML = "";
		document.getElementById("contactDeleteResult").innerHTML = "Please enter a search term.";
		return;
	}

	// This clears both mentioned fields  
	document.getElementById("contactDeleteResult").innerHTML = "";
	document.getElementById("deleteList").innerHTML = "";	
	
	let deleteList = "";
	
	// The first term before the : is the term that must match the terms in the php (the key). The term after the :
	// must match the term in this function (the value).
	// Here I pull the search term from the html by way of "deleteContactText". This then gets associated with "name"
	// in this function. So I then take that term and make it the "value" of the key:value pair "search:name" 
	// SO {php_term:js_term}
	// userId is set in Login() as a global variable and maintained
	let tmp = {search:name, userId:userId};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/DeleteContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200) 
				{
				
					// response is returned from server and stored in jsonObject
					let jsonObject = JSON.parse( xhr.responseText );
		
					
					// If backend returns an error message
					if(jsonObject.error && jsonObject.error.length > 0)
					{
						document.getElementById("contactDeleteResult").innerHTML = jsonObject.error;
						document.getElementById("deleteList").innerHTML = "";
						return;
					}


					// If an array is returned but there are no results
					if(!jsonObject.results || jsonObject.results.length === 0)
					{
						document.getElementById("contactDeleteResult").innerHTML = "No Matching contacts found.";
						document.getElementById("deleteList").innerHTML = "";
						return;
					}

					// cycles through array of strings returned by database
					for( let i=0; i<jsonObject.results.length; i++ )
					{
						// Array of strings is printed out
						deleteList += jsonObject.results[i];

						if( i < jsonObject.results.length - 1 )
						{
							// formatting for returned strings
							deleteList += "<br><br>\r\n";
						}

					}
					
					// prints contacts out to color.html below delete contact input box
					document.getElementsByTagName("p")[1].innerHTML = deleteList;
				}
			};
			// send key value pairs to database
			xhr.send(jsonPayload);
		}

		catch(err)
		{
			document.getElementById("contactDeleteResult").innerHTML = err.message;
			document.getElementById("deleteList").innerHTML = "";
		}

		//
		//
		//

	}
