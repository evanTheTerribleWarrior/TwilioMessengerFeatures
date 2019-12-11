var request = require('request');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

/*This function sends the reply/payload to each respective channel*/
function replyToChannel(channel, userId, pageId, reply){

  if (channel === "messenger") {
    pageId = pageId.replace("messenger:", "");
    userId = userId.replace("messenger:", "");

    let jsonData = {
      "recipient": {
        "id": userId
      },
      "message": {
        "text": reply
      }
    };

    request({
      url: "https://graph.facebook.com/v2.6/" + pageId + "/messages?access_token=" + process.env.PAGE_ACCESS_TOKEN,
      method: "POST",
      json: jsonData
    }, function(error, response, body) {

      console.log(error);
      console.log(body);

    });

  }
  else if (channel === "whatsapp") {
    client.messages
      .create({
        from: pageId,
        body: reply,
        to: userId
      })
      .then(message => console.log(message.sid));
  }

}


/*
This function does the following:
- Send the text received to the autopilot url
- Receive the response. Check if response contains other elements.
---->If it contains only text, parse the TwiML received and provide the answer back to the user
---->If it contains other payload without TwiML, send that back to the messenger channel as it is (Send API format). If more channels are added, payload transformation needs to be implemented
*/
function handleText(text, mid, userId, pageId, channel) {

  request({
    url: "https://channels.autopilot.twilio.com/v1/" + process.env.ACCOUNT_SID + "/" + process.env.AUTOPILOT_SID + "/twilio-messaging/" + channel,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "text/xml"
    },
    form: {
      Body: text,
      MessageSid: mid,
      To: pageId,
      From: userId
    },
    auth: {
      user: process.env.ACCOUNT_SID,
      pass: process.env.AUTH_TOKEN
    }
  }, function(error, response, body) {

    var jsonData;

    if (body.toString().includes("?xml")) {
      var parseString = require('xml2js').parseString;
      var twiml = body.toString();
      parseString(twiml, function(err, result) {
        //console.log("Result: " + JSON.stringify(result));
        let reply = result.Response.Message[0].Body[0];
        console.log("Final reply: " + reply);

        replyToChannel(channel, userId, pageId, reply);

      });
    } else if (body.code === "20001" || body.status !== 200) {

      replyToChannel(channel, userId, pageId, "Hmm something went wrong, we are working hard to fix it. Please try again later...");

    } /*else {
      jsonData = body;
    }*/
  });
}


/*This function handles postback payloads. The implementation of what follows next depends on the business case*/
function handlePostback(postback, from, to, channel) {

  console.log("Sent postback to handlePostback(): " + postback);

}

/*This function handles image payloads. The implementation of what follows next depends on the business case.
The function can take more parameters that define the use case and split accordingly.
*/
function handleImage(url, mid, from, to, channel) {

  console.log("Sent image to handleImage(): " + url);

}

/*This function handles the cards. In this case it checks if the channel is messenger and if so simply prints them with their associated elements*/
function handleCards(payload, to, channel) {

  if (channel === "messenger") {
    request({
      url: "https://graph.facebook.com/v2.6/" + process.env.PAGE_ID + "/messages?access_token=" + process.env.PAGE_ACCESS_TOKEN,
      method: "POST",
      json: payload
    }, function(error, response, body) {

    });
  }

}

/*This function takes the quick replies posted from our Function. If the channel is messenger, we simply post them using the Send API*/
function handleQuickReplies(payload, to, channel) {

  if (channel === "messenger") {
    request({
      url: "https://graph.facebook.com/v2.6/" + process.env.PAGE_ID + "/messages?access_token=" + process.env.PAGE_ACCESS_TOKEN,
      method: "POST",
      json: payload
    }, function(error, response, body) {

    });
  }
}

module.exports.handlePostback = handlePostback;
module.exports.handleImage = handleImage;
module.exports.handleText = handleText;
module.exports.handleCards = handleCards;
module.exports.handleQuickReplies = handleQuickReplies;
