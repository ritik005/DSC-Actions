'use strict';

// Import the Dialogflow module and response creation depEndencies
// from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  Permission,
  Suggestions,
  Carousel,
  Image,
  Table,
  List,
} = require('actions-on-google');
var events = require('./events').events;
var ComingEvents = require('./events').ComingEvents;
var team = require('./team').team;


// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});
const rp = require('request-promise');

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
    conv.ask(`Hi again, ${name}. How can I help you?`);
    conv.ask(new Suggestions('Past events', 'Coming events', 'Team'));
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(`OK, no worries. How can I help you?`);
    conv.ask(new Suggestions('Past events', 'Coming events', 'Team'));
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for future conversations.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(`Thanks, ${conv.user.storage.userName}. ` +
      `What do you want to know?`);
    conv.ask(new Suggestions('Past events', 'future events', 'team'));
  }
});

app.intent('past_events', (conv) => {
  conv.ask(new Suggestions('team', 'Bye', 'coming events'));
  let Title, StartDate,EndDate;
  let rows = [];
  const y = events.length;
    for(var i=0;i<y;i++)
    {
      Title = events[i].title;
      StartDate = events[i].startDate;
      EndDate = events[i].endDate;
      rows.push([Title, StartDate, EndDate]);
    }
    conv.ask('Here is the list of all events. ');
    conv.ask(new Table({
      dividers: true,
      columns: ['Title','StartDate','EndDate'],
      rows: rows,
    }));
    conv.ask('Would you like to know anything else?')
});

app.intent('comingEvents', (conv) =>{
  conv.ask(new Suggestions('team', 'past events'));
  let Title, StartDate, EndDate;
  let rows =[];
  const z = ComingEvents.length;
  if(z === 0)
  {
    conv.ask('No coming events. ');
    conv.ask('Would you like to know anything else?')
  }
  else {
    for(var i=0;i<z;i++)
    {
      Title = ComingEvents[i].title;
      StartDate = ComingEvents[i].startDate;
      EndDate = ComingEvents[i].endDate;
      rows.push([Title, StartDate, EndDate]);
    }
    conv.ask('Here is the list of all events. ');
    conv.ask(new Table({
      dividers: true,
      columns: ['Title','StartDate','EndDate'],
      rows: rows,
    }));
    conv.ask('Would you like to know anything else?')
  }
});

app.intent('team', (conv) => {
  conv.ask(new Suggestions('Bye'))
  let Name, Role;
  let rows = [];
  const x = team.length;
  for(var i=0;i<x;i++)
  {
    Name = team[i].name;
    Role = team[i].role;
    rows.push([Name, Role]);
  }
  conv.ask(`Here are all team members. `);
  conv.ask(new Table({
    dividers: true,
    columns: ['Name','Role'],
    rows: rows,
  }));
});

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
