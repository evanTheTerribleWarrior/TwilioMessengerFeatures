/*This will generate some sample carrousel cards as if the user asked something and we responded with cards. We use these to test postbacks
Change YOUR_URL below to your main URL*/
function prepareCarrousel(userId, pageId) {

  let payload = {

    "images": [{
        "label": "A tour in Athens center in Greece",
        "url": "https://www.athensguide.com/top-10/monastiraki.jpg",
        "site": "https://www.viator.com/en-GB/Athens-attractions/Monastiraki/d496-a17091"

      },
      {
        "label": "A tour in and around the Colosseum in Rome",
        "url": "http://paperlief.com/images/colosseum-wallpaper-4.jpg",
        "site": "https://www.viator.com/en-GB/Rome-attractions/Colosseum/d511-a701"
      }
    ]
  };

  let elements_array = [];
  let buttons = [];

  for (let i = 0; i < payload.images.length; i++) {

    var book_payload;
    if (i === 0) {
      book_payload = "book-athens";
    } else {
      book_payload = "book-rome";
    }

    let element = {
      "title": payload.images[i].label,
      "image_url": payload.images[i].url,
      "buttons": [{
          "type": "web_url",
          "url": payload.images[i].site,
          "title": "View Tour",
          "webview_height_ratio": "tall"
        },
        {
          "type": "postback",
          "title": "Book",
          "payload": book_payload
        }
      ]
    }
    elements_array.push(element);

  }
  //console.log("Elements array" + JSON.stringify(elements_array));


  /*Let's prepare the final JSON for our data*/
  let jsonData = {
    "recipient": {
      "id": userId
    },
    "message": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": elements_array
        }
      }
    }
  };

  //console.log("Final Payload :" + JSON.stringify(jsonData));

  /*Let's send the request!*/
  //console.log("Ready to send request");
  const request = require("request");
  request({
    //url: "https://graph.facebook.com/v2.6/" + pageId + "/messages?access_token=" + process.env.PAGE_ACCESS_TOKEN,
    url: "https://YOUR_URL/messenger/webhook",
    method: "POST",
    json: jsonData
  }, function(error, response, body) {
    //console.log(error);
    //console.log("Response: "+ response);
    //console.log(body);
  });
}

function prepareQuickReplies(userId, pageId) {

  let payload = {
    "recipient": {
      "id": userId
    },
    "messaging_type": "RESPONSE",
    "message": {
      "text": "Pick a color:",
      "quick_replies": [{
        "content_type": "text",
        "title": "Red",
        "payload": "red",
        "image_url": "https://www.clker.com/cliparts/J/R/k/x/A/f/red-blank-colour.svg.hi.png"
      }, {
        "content_type": "text",
        "title": "Green",
        "payload": "green",
        "image_url": "https://cdn.pixabay.com/photo/2016/02/23/15/52/green-1217966_960_720.png"
      }]
    }
  }

  /*Let's send the request!*/
  //console.log("Ready to send request");
  const request = require("request");
  request({
    //url: "https://graph.facebook.com/v2.6/" + pageId + "/messages?access_token=" + process.env.PAGE_ACCESS_TOKEN,
    url: "https://YOUR_URL/messenger/webhook",
    method: "POST",
    json: payload
  }, function(error, response, body) {
    //console.log(error);
    //console.log("Response: "+ response);
    console.log(body);
  });
}
module.exports.carrousel = prepareCarrousel;
module.exports.quick = prepareQuickReplies;
