'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a facebook messenger bot');
});

// for Facebook verification

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'Darth_Vadar_is_my_father') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i];
	    let sender = event.sender.id;
	    if (event.message && event.message.text) {
		    let text = event.message.text;
		    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
	    }
    }
    res.sendStatus(200);
});

const token = process.env.FB_PAGE_ACCESS_TOKEN;

//function to echo back messages
function sendTextMessage(sender, text) {
    let messageData = { text:text };
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error);
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error);
	    }
    });
};

//const token = "EAAbbRkzb8RYBAMMpnwvr8ZBQjT20RzTa2EUTeZAE4OslqLpeqJsYoE6f4SQ0NGQBygwyohAYSXdOVsWU5QJSzsd90keLycQsMWCCC33ZBujOwAyKYkTh6U5obw7IoSUGDGPeTj0CQ6WzZC1QBIqJwu02JnRaPq95M0uWZCSwdqwZDZD";



// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});