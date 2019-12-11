/*We search where the payload comes from and what type it is. We respond with a JSON object that we pass to the handlers*/
function handlePayload(payload) {

  var channel;
  console.log("Payload: " + JSON.stringify(payload));
  let result;
  var pageId;

  //if the payload comes from the Twilio integration
  if (payload.SmsMessageSid) {
    //console.log(payload);

    //Check the source channel
    if (payload.From) {
      if (payload.From.includes("messenger")) {
        channel = "messenger";
      } else if (payload.From.includes("whatsapp")) {
        channel = "whatsapp";
      }
    }
    //If the payload is an image, return the relevant details
    if (payload.MediaContentType0) {
      if (payload.MediaContentType0.indexOf("image") !== -1) {
        result = {
          "type": "image",
          "value": payload.MediaUrl0,
          "mid": payload.MessageSid,
          "from": payload.From,
          "to": payload.To,
          "channel": channel
        }
      }
    }
    //If the payload is not an image, check if there is a quick reply or text
    else {
      //Check if the array of quick replies is set
      if (global.quickRepliesArr) {
        //If it is set, check if the payload Body value we received is in the array (should be equal to the "title" value in quick reply)
        var foundQuickReply = global.quickRepliesArr.filter(function(item) {
          return item.title == payload.Body;
        });
        //If we found a match, we return the payload of the quick reply object (we dont need the "title")
        if (foundQuickReply.length > 0) {
          result = {
            "type": "postback",
            "value": foundQuickReply[0].payload,
            "from": payload.From,
            "to": payload.To,
            "channel": channel
          }
        }
        global.quickRepliesArr = null;
      } else {
        result = {
          "type": "text",
          "value": payload.Body,
          "mid": payload.MessageSid,
          "from": payload.From,
          "to": payload.To,
          "channel": channel
        }
      }

    }
  }
  //if the payload comes from Messenger directly
  else if (payload.entry) {
    //console.log(payload);
    channel = "messenger";
    if (payload.entry[0].messaging) {
      let messaging = payload.entry[0].messaging[0];
      if (messaging.postback) {
        result = {
          "type": "postback",
          "value": payload.entry[0].messaging[0].postback.payload,
          "from": payload.entry[0].messaging[0].sender.id,
          "to": payload.entry[0].messaging[0].recipient.id,
          "channel": channel
        }
      } else if (messaging.message) {
        let message = messaging.message;
        let mid = message.mid;
        if (message.quick_reply) {
          result = {
            "type": "quick_reply",
            "value": message.quick_reply.payload,
            "to": payload.entry[0].messaging[0].recipient.id,
            "channel": channel
          }
        } else if (message.attachments) {
          if (message.attachments[0].type === "image") {
            result = {
              "type": "image",
              "value": message.attachments[0].payload.url,
              "mid": mid
            }
          }
        } else if (message.text) {
          result = {
            "type": "text",
            "value": message.text,
            "from": messaging.sender.id,
            "to": messaging.recipient.id,
            "channel": channel
          }
        }
      }
    }
  }
  //Create quick replies and cards when the relevant Function sends the payload
  else if (payload.message) {
    if (payload.message.quick_replies) {
      result = {
        "type": "quick_reply",
        "value": payload,
        "to": payload.recipient.id,
        "channel": "messenger"
      }
    } else if (payload.message.attachment) {
      if (payload.message.attachment.type === "template") {
        result = {
          "type": "cards",
          "value": payload,
          "to": payload.recipient.id,
          "channel": "messenger"
        }
      }
    }
  }

  return result;
}

module.exports.handlePayload = handlePayload;
