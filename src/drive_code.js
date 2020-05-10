// Client ID and API key from the Developer Console
var CLIENT_ID = '541857836176-ooorj15vavsg5e0h0c98jodmp5lt39js.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAIYCyk2KaSfTyX67jJuNKYo-AZAtwwZ-U';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive';

var authorizeButton
var signoutButton

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    authorizeButton = document.getElementById('authorize_button');
    signoutButton = document.getElementById('signout_button');
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        listFiles();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}
let idFound
/**
 * Print files.
 */
function listFiles() {
    gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name)"
    }).then(function (response) {
        appendPre('Files:');
        var files = response.result.files;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                appendPre(file.name + ' (' + file.id + ')');
                if (file.name == "notes.json") {
                    idFound = file.id
                }
            }
        } else {
            appendPre('No files found.');
        }
    });
}
// check if there's already a file in the drive

let brandNew = ()=> {

    let first = `--uploadboundary
Content-Disposition:form-data;name="metadata";filename="first"
Content-Type: application/json; charset=UTF-8

{"name":"notes.json","mimeType":"application/json"}
`
    let second = `--uploadboundary
Content-Disposition:form-data;name="file";filename="blob"
Content-Type: application/json

${JSON.stringify({starting:"text"})}
--uploadboundary--
    `
    fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&api=${API_KEY}&fields=id`,{
        method:"POST",
        headers:{
            "Content-type":"multipart/related; boundary=uploadboundary",
            "Content-Length":(first+second).length,
            "Authorization":"Bearer "+gapi.auth.getToken().access_token
        },
        body:first+second
    }).then(res=> res.json()).then(j=> console.log(j))
}

let performGet =()=> {
    return fetch(`https://www.googleapis.com/drive/v3/files/${idFound}/?key=${API_KEY}&alt=media`)
 }
let performUpdate =(jdata)=> {

    let first = `--uploadboundary
Content-Disposition:form-data;name="metadata";filename="first"
Content-Type: application/json; charset=UTF-8

{"name":"notes.json","mimeType":"application/json"}
`
    let second = `--uploadboundary
Content-Disposition:form-data;name="file";filename="blob"
Content-Type: application/json

${JSON.stringify(jdata)}
--uploadboundary--`
// make the path include the fileID to update
    fetch(`https://www.googleapis.com/upload/drive/v3/files/${idFound}/?uploadType=multipart&key=${API_KEY}&fields=id`,{
        method:"PATCH",
        headers:{
            "Content-type":"multipart/related; boundary=uploadboundary",
            "Content-Length":(first+second).length,
            "Authorization":"Bearer "+gapi.auth.getToken().access_token
        },
        body:first+second
    }).then(res=> res.json()).then(j=> console.log(j))
    // try the gapi.method


}
// so you create a multtipart upload, with the metadata first, and the body next
let performUpload = (jdata)=> {
    if (idFound) {
        // try to update the contents
        console.log("updating")
        performUpdate(jdata)
    } else {
        console.log("creating anew")
        brandNew()
    }
}
export { handleClientLoad,brandNew,performUpload ,performGet}