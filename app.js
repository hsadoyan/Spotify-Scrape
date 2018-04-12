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
var token;
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

sendTooManyDamnRequests()

function sendTooManyDamnRequests(){
  queries = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

  for (var i = 0; i<200; i++) {
    sendSingleRequest(queries[Math.floor(Math.random() * 26)])
  }
}

function sendSingleRequest(query){

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      token = body.access_token;
      var options = {
        url: "https://api.spotify.com/v1/search",
        qs: {
          "q": query,
          "type": "track",
          "offset": Math.floor(Math.random() * 10000),
          "limit": 50,
        },

        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        items = body["tracks"]["items"]
        song_ids = getIds(items)

        getMetadataForSongs(song_ids)
      });
    } else {
      exit(-1)
    }
  });
}

function getMetadataForSongs(song_ids){
  var options = {
    url: "https://api.spotify.com/v1/audio-features/",// + "5CQ30WqJwcep0pYcV4AMNc",
    qs: {
      ids: song_ids.toString()
    },
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };
  request.get(options, function(error, response, body) {
    items = body["audio_features"]
    writeArrayToCSV(items)
  });

}

function getIds(items){
  song_ids = []
  items.forEach(function(song) {
    song_ids.push(song["id"])
  })
  return song_ids;
}

function writeArrayToCSV(items){
  const replacer = (key, value) => value === null ? '-1' : value // specify how you want to handle null values here
  const header = Object.keys(items[0])
  let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  // csv.unshift(header.join(','))
  csv = csv.join('\r\n')



  writeToFile(csv)
}

function writeToFile(text){
  //Hardcoded filename. Good enough for current application
  const filename = "songs.csv"
  fs.appendFile(filename, text, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("File Saved")
  })
}
