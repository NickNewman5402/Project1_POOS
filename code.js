// code.js
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

	// let srch = document.getElementById("searchText").value;

  
  let firstNameText = document.getElementById("firstNameSearch").value.trim();
  let lastNameText = document.getElementById("lastNameSearch").value.trim();

	if(firstNameText.length === 0 && lastNameText.length === 0)
	{
		document.getElementById("contactList").innerHTML = "";
		document.getElementById("contactSearchResult").innerHTML = "Please enter a search term.";
		return;
	}

	// This clears result field
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let contactList = "";

	// The first term before the : is the term that must match the terms in the php (the key). The term after the :
	// must match the term in this function (the value).
	// Here I pull the search term from the html by way of "searchText". This then gets associated with "srch"
	// in this function. So I then take that term and make it the "value" of the key:value pair.
	// SO {php_term:js_term}
  let tmp = {firstName:firstNameText, lastName:lastNameText, userId:userId};
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
					return;
				}


				// If an array is returned but there are no results
				if(!jsonObject.results || jsonObject.results.length === 0)
				{
					document.getElementById("contactSearchResult").innerHTML = "No Matching contacts found.";
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

document.getElementById("contactSearchResult").innerHTML = contactList; 
			}
		};
		xhr.send(jsonPayload);
	}

	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
	
}

function addContact()
{


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
	result.textContent = "Addingâ€¦";

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


  const firstNameText = document.getElementById("deleteFirstName").value.trim();
  const lastNameText = document.getElementById("deleteLastName").value.trim();
  
	if(firstNameText.length === 0 && lastNameText.length === 0)
  {
    document.getElementById("contactDeleteResult").innerHTML = "Please enter a search term.";
    return;
  }

  // clear out previous results
  document.getElementById("contactDeleteResult").innerHTML = "";
  
  // setting url for HTTP request and payload to be sent
  const url = urlBase + "/SearchContacts." + extension;
  const tmp = { firstName:firstNameText, lastName:lastNameText, userId:userId };
  const jsonPayload = JSON.stringify(tmp);

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

		document.getElementById("contactDeleteResult").innerHTML = html;
    }
    

    // if (results.length > 1) 
	// {
    //   document.getElementById("contactDeleteResult").innerHTML = "Multiple matches found. Click the one you want to delete.";
    // }

  };
  xhr.send(jsonPayload);
}

function editContact()
{


  let firstNameText = document.getElementById("editFirstName").value.trim();
  let lastNameText = document.getElementById("editLastName").value.trim();

  // if input box is empty
	if(firstNameText.length === 0 && lastNameText.length === 0)
  {
    document.getElementById("contactEditResult").innerHTML = "Please enter a search term.";
    return;
  }

  // clear out previous results
  document.getElementById("contactEditResult").innerHTML = "";
  
  // setting url for HTTP request and payload to be sent
  const url = urlBase + "/SearchContacts." + extension;
  const tmp = { firstName:firstNameText, lastName:lastNameText, userId:userId };
  const jsonPayload = JSON.stringify(tmp);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () 
  {
    if (this.readyState !== 4) return;

    if (this.status !== 200) 
	{
      document.getElementById("contactEditResult").innerHTML = "Search failed (HTTP " + this.status + ").";
      return;
    }

    const jsonObject = JSON.parse(xhr.responseText);

    if (jsonObject.error && jsonObject.error.length > 0) 
	{
      document.getElementById("contactEditResult").innerHTML = jsonObject.error;
      return;
    }

    const results = jsonObject.results || [];
    
	if (results.length === 0) 
	{
      document.getElementById("contactEditResult").innerHTML = "No matching contacts found.";
      return;
    }

    let html = "";

	for (let i = 0; i < results.length; i++)
{  
  const entry   = String(results[i]); // e.g., "Name...<br>Email...<br>Phone...<br>ID: 8"
  const idMatch = entry.match(/ID:\s*(\d+)/i);
  const id      = idMatch ? idMatch[1] : null;

  // pull fields (best-effort)
  const email = (entry.match(/Email:\s*([^<\r\n]+)/i) || [])[1] || "";
  const phone = (entry.match(/Phone:\s*([^<\r\n]+)/i) || [])[1] || "";
  const name  = (entry.match(/Name:\s*([^<\r\n]+)/i)  || [])[1] || "";

  let first = "", last = "";
  if (name) {
    const parts = name.trim().split(/\s+/);
    first = parts[0] || "";
    last  = parts.slice(1).join(" ");
  }

  // Hide the ID line from display
  const display = entry.replace(/<br>\s*ID:\s*\d+/i, "");

  html += `
    <div class="contactRow">
      <div>${display}</div>
      ${
        id
          ? `<button class="buttons"
                data-first="${escapeHtml(first)}"
                data-last="${escapeHtml(last)}"
                data-email="${escapeHtml(email)}"
                data-phone="${escapeHtml(phone)}"
                onclick="confirmEdit(${id}, this)">Edit</button>`
          : ""
      }
    </div>
    <br>
  `;
}
document.getElementById("contactEditResult").innerHTML = html;

    // if (results.length > 1) 
	// {
    //   document.getElementById("contactDeleteResult").innerHTML = "Multiple matches found. Click the one you want to delete.";
    // }

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

function confirmEdit(contactId, btn) 
{
  if (!contactId) 
    return;
  
  // if (!confirm("Edit this contact?")) 
  //   return;

  // Close any other inline editors
  document.querySelectorAll(".inline-editor").forEach(n => n.remove());

  // Find the row the button is in
  const row = btn.closest(".contactRow");
  
  if (!row) 
    return;

  // Prefill values from the button's data-*
  const first = btn?.dataset.first || "";
  const last  = btn?.dataset.last  || "";
  const email = btn?.dataset.email || "";
  const phone = btn?.dataset.phone || "";

  // Build a tiny inline editor panel
  const editor = document.createElement("div");
 
  editor.className = "inline-editor";
 
  editor.innerHTML = `
    <div style="margin-top:8px; padding:10px; border:1px solid #ccc; border-radius:8px;">
      <div style="
        display:grid;
        grid-template-columns:auto 1fr auto 1fr; 
        column-gap:12px; row-gap:10px; align-items:center;">
        
        <label for="editFirst" >First:</label>
        <input id="editFirst"  type="text"  class="editFirst"  value="${escapeHtml(first)}">

        <label for="editLast"  >Last:</label>
        <input id="editLast"   type="text"  class="editLast"   value="${escapeHtml(last)}">

        <label for="editEmail" >Email:</label>
        <input id="editEmail"  type="text" class="editEmail"  value="${escapeHtml(email)}">

        <label for="editPhone" >Phone:</label>
        <input id="editPhone"  type="text"  class="editPhone"  value="${escapeHtml(phone)}">
      </div>

      <div style="margin-top:10px; display:flex; gap:10px;">
        <button class="buttons editSave">Save</button>
        <button class="buttons editCancel">Cancel</button>
      </div>
    </div>
  `;



  // Show it directly under the contact row
  row.appendChild(editor);

  // Cancel
  editor.querySelector(".editCancel").onclick = () => editor.remove();

  // Save -> POST to EditContact.php
  editor.querySelector(".editSave").onclick = function () 
  {
    const newFirst = editor.querySelector("#editFirst").value.trim();
    const newLast  = editor.querySelector("#editLast").value.trim();
    const newEmail = editor.querySelector("#editEmail").value.trim();
    const newPhone = editor.querySelector("#editPhone").value.trim();

    const payload = { userId, contactId };
    if (newFirst) payload.jsNewFirst = newFirst;
    if (newLast)  payload.jsNewLast  = newLast;
    if (newEmail) payload.jsNewEmail = newEmail;
    if (newPhone) payload.jsNewPhone = newPhone;

    const url = urlBase + "/EditContact." + extension;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () 
    {

      if (this.readyState !== 4) 
          return;
      
      const box = document.getElementById("contactEditResult");
      
      if (this.status === 200) 
      {
        if (box) 
          box.innerHTML = "Contact updated.";
        
        editor.remove();
        
        if (typeof editContact === "function") 
          editContact();
      } 
      
      else 
      {
        if (box) 
          box.innerHTML = "Update failed (HTTP " + this.status + ").";
      }

    };


    xhr.onerror = function () 
    {

      const box = document.getElementById("contactEditResult");
      
      if (box) 
        box.innerHTML = "Network error.";

    };

    xhr.send(JSON.stringify(payload));
  };
}

function escapeHtml(s) 
{
  return String(s).replace(/[&<>"']/g, m => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[m]
  ));
}
