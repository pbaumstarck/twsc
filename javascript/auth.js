var OAUTH2_CLIENT_ID = '147378973529.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
  //'https://accounts.google.com/o/oauth2/auth'
  'https://www.googleapis.com/auth/youtube'
];
//https://accounts.google.com/o/oauth2/auth
//https://accounts.google.com/o/oauth2/token
//https://unicontroller.appspot.com/oauth2callback


// This callback is invoked by the Google APIs JS client automatically when it is loaded.
var googleApiClientReady = function() {
  var v3 = true;
  if (v3) {
    gapi.client.load('youtube', 'v3', function() {
        gapi.client.setApiKey('AIzaSyCGcCoNxZOFFX67nQACx-aXGsu8u3lUBPg');
    });
  } else {
    gapi.auth.init(function() {
      // Attempt the immediate OAuth 2 client flow as soon as the page is loaded.
      // If the currently logged in Google Account has previously authorized OAUTH2_CLIENT_ID, then
      // it will succeed with no user intervention. Otherwise, it will fail and the user interface
      // to prompt for authorization needs to be displayed.
      window.setTimeout(function() {
        gapi.auth.authorize({
          client_id: OAUTH2_CLIENT_ID,
          scope: OAUTH2_SCOPES,
          immediate: true
        }, handleAuthResult);
      }, 1);
    });
  }
};


// Handles the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  console.log("'authResult'?: " + (authResult ? "TRUE" : "FALSE"));
  if (authResult) {
    // Auth was successful; hide the things related to prompting for auth and show the things
    // that should be visible after auth succeeds.
    $('.pre-auth').hide();
    //loadAPIClientInterfaces();
    gapi.client.load('youtube', 'v3', function() {
      //handleAPILoaded();
      function getHistory() {
        // Query for history
        $.getJSON('https://gdata.youtube.com/feeds/api/users/default/watch_history' +
            '?v=2' +
            '&alt=json' +
            '&start-index=' + (entries.length + 1) +
            '&max-results=50' +
            '&access_token=' + authResult.access_token,
            function(data) {
              console.log(entries);
              $('#youtube-results').html(entries.join(",,,"));
              if (data.feed.entry.length == 0) {
                return;
              }
              console.log(data);
              $.each(data.feed.entry, function(ix, entry) {
                entries.push(entry.title.$t + "::::" + entry.updated.$t);
                // entries.push({
                  // title: entry.title.$t,
                  // date: entry.updated.$t
                // });
              });
              getHistory();
            });
      }
      var entries = [];
      getHistory();
      console.log("Issued query ...");
      // var request = gapi.client.youtube.search.list({
      //   q: q,
      //   part: 'snippet',
      //   maxResults: 50,
      //   order: 'relevance',
      //   type: 'video'
      //   //videoDuration: 'long'
      // });
      // request.execute(function(response) {
      //   resposse.items;
    });
  } else {
    // Make the #login-link clickable, and attempt a non-immediate OAuth 2 client flow.
    // The current function will be called when that flow is complete.
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
        }, handleAuthResult);
    });
  }
}


// Loads the client interface for the YouTube Analytics and Data APIs.
// This is required before using the Google APIs JS client; more info is available at
// http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Client
function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function() {
    handleAPILoaded();
  });
}


