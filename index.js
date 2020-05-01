// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
  let text, description;
  let rows = [];
  const y = data.length;
    // str = str + `Title: ` + data[i].title + '\n' + `Description: ` + data[i].slug + `\n`;
    for(var i=0;i<y;i++)
    {
      text = data[i].title;
      description = data[i].slug;
      rows.push([text, description]);
    }
    conv.ask('Here is the list of all events');
    conv.ask(new Table({
      dividers: true,
      columns: ['text','description'],
      rows: rows,
      // title: data[0].title,
      // text: data[0].slug
    }));
  // conv.ask(str);

  // const options = {
  //   method:'GET',
  //   url:'https://dsckiet-backend.herokuapp.com/api/v1_old/events',
  //   headers: {
  //     'User-Agent': 'Request-Promise'
  //   },
  //   json:true
  // }
  //   rp(options)
  //   .then(function(bodyParser){
  //     var y = bodyParser.pastevents.length;
  //     console.log(y)
  //     var data = [];
  //     for(var i=0;i<y;i++)
  //     {
  //       data.push(bodyParser.pastevents[i].title);
  //     }
  //     var slugarr = [];
  //     for(var i=0;i<y;i++)
  //     {
  //       slugarr.push(bodyParser.pastevents[i].slug);
  //     }
  //     var str = 'here';
  //     for(i=0;i<y;i++)
  //     {
  //       var z=i+1;
  //       str = str + `Details of events`+ z + `Title: ` + data[i]+`\n`+ `Description: `+ slugarr[i]+`.`;
  //     }
  //     return conv.ask(`${str}`);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     conv.ask(`errors`);
  //   })
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
