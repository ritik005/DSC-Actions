'use strict';

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  Permission,
  Suggestions,
  Carousel,
  Image,
  Table,
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});
const rp = require('request-promise');

var data = [
  {
    "status": 1,
      "_id": "5cab9961ac295a0f3f0d9941",
      "title": "Hands-on NodeJS Codelab",
      "image": "",
      "slug": "hands-on-nodejs-codelab",
      "description": "",
      "venue": "CSE Lab 2",
      "startDate": "2019-02-20T05:00:00.000Z",
      "endDate": "2019-02-28T07:00:00.000Z",
      "startTime": "05:00 PM",
      "__v": 0
  },
  {
    "status": 1,
    "_id": "5cab9961ac295a0f3f0d9942",
    "title": "Hands-on Android Codelab",
    "image": "",
    "slug": "hands-on-android-codelab",
    "description": "",
    "venue": "CSE Lab 2",
    "startDate": "2019-03-07T05:00:00.000Z",
    "endDate": "2019-03-12T07:00:00.000Z",
    "startTime": "05:00 PM",
    "__v": 0
  },
  {
    "status": 1,
    "_id": "5d72718e7c213e60b8fa03cf",
    "title": "Google Cloud Study Jam",
    "image": "",
    "slug": "google-cloud-study-jam",
    "description": "",
    "venue": "CSE Lab-2, E-Block",
    "startDate": "2019-08-19T15:00:00.000Z",
    "endDate": "2019-08-19T17:00:00.000Z",
    "startTime": "03:00 PM",
    "__v": 0
  }
]


// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  const name = conv.user.storage.userName;
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(new Permission({
      context: 'Hi there, to get to know you better',
      permissions: 'NAME',
    }));
  } else {
    conv.ask(`Hi again, ${name}. What do you want to know?`);
    conv.ask(new Suggestions('Past events', 'future events', 'Projects'));
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(`OK, no worries. What do you want to know?`);
    conv.ask(new Suggestions('Blue', 'Red', 'Green'));
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for future conversations.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(`Thanks, ${conv.user.storage.userName}. ` +
      `What do you want to know?`);
    conv.ask(new Suggestions('Past events', 'future events', 'Projects'));
  }
});

app.intent('events', (conv) => {
  conv.ask(new Suggestions('Projects', 'Achievement'));
  let text, startDate,endDate;
  let rows = [];
  const y = data.length;
    for(var i=0;i<y;i++)
    {
      text = data[i].title;
      startDate = data[i].startDate;
      endDate = data[i].endDate;
      rows.push([text, startDate, endDate]);
    }
    conv.ask('Here is the list of all events');
    conv.ask(new Table({
      dividers: true,
      columns: ['text','startDate','endDate'],
      rows: rows,
    }));
})


// Handle the Dialogflow NO_INPUT intent.
// Triggered when the user doesn't provide input to the Action
app.intent('actions_intent_NO_INPUT', (conv) => {
  // Use the number of reprompts to vary response
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount === 0) {
    conv.ask('Which event would you like to hear about?');
  } else if (repromptCount === 1) {
    conv.ask(`Please say the name of event`);
  } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
    conv.close(`Sorry we're having trouble. Let's ` +
      `try this again later. Goodbye.`);
  }
});


// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
