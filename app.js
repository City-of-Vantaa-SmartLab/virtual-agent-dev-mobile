/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var server = require('http').Server(app);
var fs = require('fs');
var moment = require('moment');
var request = require('request');
var time = moment();
var app = express();
var time = moment();
var timeStampForEntry = time.format('DD.MM.YYYY HH:mm:ss Z');
var DateForFileName = time.format('YYYY-MM-DD');
// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());
// Create the service wrapper
var conversation = new Conversation({
    // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
    // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
    // username: '<username>',
    // password: '<password>',
    // url: 'https://gateway.watsonplatform.net/conversation/api',
    version_date: Conversation.VERSION_DATE_2017_04_21
});
// Endpoint to be call from the client side
app.post('/api/message', function (req, res) {
    var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
    if (!workspace || workspace === '<workspace-id>') {
        return res.json({
            'output': {
                'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
            }
        });
    }
    var payload = {
        workspace_id: workspace
        , context: req.body.context || {}
        , input: req.body.input || {}
    };
    // Send the input to the conversation service
    conversation.message(payload, function (err, data) {
        makeLogEntry(payload, "Sent");
        if (err) {
            return res.status(err.code || 500).json(err);
        }
        makeLogEntry(updateMessage(payload, data), "Received");
        return res.json(updateMessage(payload, data));
    });
});
// Returns the database.
app.get('/db', function (req, res) {
   var output = []; 
   var body; request('http://smartlabvantaa.fi/demot/tilat_palveluna_muunneltavat_toimitilat/muuntamoWall.php?startdate=2017-07-17&enddate=2017-08-31&nogui=2', function (error, response, body) {
       body = body.trim();
       body = JSON.parse(body);
        output = JSON.stringify(body, null, 2);
        console.log(body);
       res.charset = 'utf-8';
       res.send(output);
    });
});
// Generates and returns logs. To be called from client side.
app.get('/log', function (req, res) {
    var output = [];
    res.setHeader('Content-Type', 'application/json');

    function readFiles(dirname, onFileContent, onError) {
        fs.readdir(dirname, function (err, filenames) {
            if (err) {
                onError(err);
                return;
            }
            filenames.forEach(function (filename) {
                fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                    if (err) {
                        onError(err);
                        return;
                    }
                    onFileContent(filename, content);
                });
            });
        });
    }
    var data = {};
    readFiles('log/', function (filename, content) {
        data[filename] = content;
        console.log(filename);
        output += filename + " " + JSON.stringify(JSON.parse(content), null, 2);
    }, function (err) {
        throw err;
    })
    setTimeout(snd, 1000);

    function snd() {
        res.send(output);
    }
});
// Makes log entry
function makeLogEntry(payload, response) {
    var pathToLog = './log/';
    var obj = {
        entries: []
    };
    obj.entries.push({
        time_formatted: timeStampForEntry
        , value: 1
    });
    var json = JSON.stringify(obj);
    touch(pathToLog + DateForFileName + ".json"); // Create file if necessary
    //Reads, manipulates and appends log data/file
    fs.readFile(pathToLog + DateForFileName + ".json", 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            obj = JSON.parse(data); //now it's an object
            obj.entries.push({
                time: timeStampForEntry
                , value: payload
                , direction: response
            }); //add some data
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(pathToLog + DateForFileName + ".json", json, 'utf8'); // write it back 
        }
    });
    console.log(timeStampForEntry);
}
// Make log file if not exist
function touch(filename) {
    fs.open(filename, 'r', function (err, fd) {
        if (err) {
            fs.writeFile(filename, JSON.stringify({
                "entries": [{
                    "time": timeStampForEntry
                    , "value": "entries_start"
                    , "direction": "none"
                    }]
            }), function (err) {
                if (err) {
                    console.log(err);
                }
                console.log("The file was saved!");
            });
        }
        else {
            console.log("The file exists!");
        }
    });
};
/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
    var responseText = null;
    if (!response.output) {
        response.output = {};
    }
    else {
        return response;
    }
    if (response.intents && response.intents[0]) {
        var intent = response.intents[0];
        // Depending on the confidence of the response the app can return different messages.
        // The confidence will vary depending on how well the system is trained. The service will always try to assign
        // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
        // user's intent . In these cases it is usually best to return a disambiguation message
        // ('I did not understand your intent, please rephrase your question', etc..)
        if (intent.confidence >= 0.75) {
            responseText = 'I understood your intent was ' + intent.intent;
        }
        else if (intent.confidence >= 0.5) {
            responseText = 'I think your intent was ' + intent.intent;
        }
        else {
            responseText = 'I did not understand your intent';
        }
    }
    response.output.text = responseText;
    return response;
}
module.exports = app;