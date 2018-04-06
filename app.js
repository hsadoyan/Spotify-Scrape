/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

var request = require('request'); // "Request" library
var fs = require('fs')

var secrets = JSON.parse(fs.readFileSync('secret.json', 'utf8'));
var client_id = secrets.client_id;
var client_secret = secrets.client_secret;

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  //TODO Change to use an array of song_ids instead
  song_id = '06AKEBrKUckW0KREUWRnvT';
  if (!error && response.statusCode === 200) {

    // use the access token to access the Spotify Web API
    var token = body.access_token;
    var options = {
      url: 'https://api.spotify.com/v1/audio-features/' + song_id,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };
    request.get(options, function(error, response, body) {
      // console.log(body);
      writeArrayToCSV([body])
    });
  }
});

function writeArrayToCSV(items){
  const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
  const header = Object.keys(items[0])
  let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  csv.unshift(header.join(','))
  csv = csv.join('\n')

  writeToFile(csv)
}


function writeToFile(text){
  //Hardcoded filename. Good enough for current application
  const filename = "songs.csv"
  fs.writeFile(filename, text, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("File Saved")
  })
}
