const express = require('express');
require('dotenv').config();
const payload = require('../payload/payload.js');
const handler = require('../handlers/handlers.js');

module.exports = function() {
  var app = express();
  app.use(express.json());
  app.use(express.urlencoded());


  /*This is required when registering the Webhook on Facebook developers page, so that the URL of the middleware app can be validated*/
  app.get('/messenger/webhook', function(req, res) {

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {

        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);

      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }

  });


  app.post('/messenger/webhook', function(req, res) {

    var result;

    /*When a POST is sent to this endpoint, check what the payload looks like. Depending on the type, we send the relevant info to the handler methodss*/
    result = payload.handlePayload(req.body);

    if (!result) res.sendStatus(404);

    if (result.type === "postback") {
      console.log("\nFound postback\n1. Value: " + result.value + "\n2. From: " + result.from + "\n3. To: " + result.to + "\n4. Channel: " + result.channel);
      handler.handlePostback(result.value, result.from, result.to, result.channel);
    } else if (result.type === "quick_reply") {
      console.log("\nFound quick replies\n1. Value: " + JSON.stringify(result.value) + "\n2. To: " + result.to + "\n3. Channel: " + result.channel);

      setQuickReplies(result.value.message.quick_replies);

      handler.handleQuickReplies(result.value, result.to, result.channel);
    } else if (result.type === "text") {
      console.log("\nFound text message\n1. Value: " + result.value + "\n2. Mid: " + result.mid + "\n3. From: " + result.from + "\n4. To: " + result.to + "\n5. Channel: " + result.channel);
      handler.handleText(result.value, result.mid, result.from, result.to, result.channel);
    } else if (result.type === "image") {
      console.log("\nFound image\n1. Value: " + result.value + "\n2. Mid: " + result.mid + "\n3. From: " + result.from + "\n4. To: " + result.to + "\n5. Channel: " + result.channel);
      handler.handleImage(result.value, result.mid, result.from, result.to, result.channel);
    } else if (result.type === "cards") {
      console.log("\nFound cards\n1. Value: " + JSON.stringify(result.value) + "\n2. To: " + result.to + "\n3. Channel: " + result.channel);
      handler.handleCards(result.value, result.to, result.channel);
    }
    res.status(200).send("<Response/>");

  });

  /*Test webhook to generate cards in the Messenger channel*/
  app.get('/messenger/testcards', function(req, res) {

    let test = require('../tests/tests.js');
    test.carrousel(process.env.USER_ID, process.env.PAGE_ID);
    res.status(200).send("<Response/>");
  });

  /*Test webhook to generate cards in the Messenger channel*/
  app.get('/messenger/testquick', function(req, res) {

    let test = require('../tests/tests.js');
    test.quick(process.env.USER_ID, process.env.PAGE_ID);
    res.status(200).send("<Response/>");
  });


  const PORT = process.env.PORT || 4000;
  app.set('port', PORT);
  return app;
};

/*We set a global array for the quick replies to be able to differentiate from text, due to the existing Twilio-Messenger integration logic*/
function setQuickReplies(quick_replies) {
  global.quickRepliesArr = quick_replies;
}
