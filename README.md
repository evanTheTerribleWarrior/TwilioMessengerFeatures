# Twilio Autopilot - Messenger Features

## Summary
This repo contains a node app that can be the baseline for enhancing your Twilio Autopilot with extra Facebook Messenger features like Cards, Quick Replies, Postbacks and Images.
It is basically a middleware that analyses the incoming payload and decides what type of element was sent in the chat. It can be enhanced to manage more payloads and channels.


## Set up
The main structure is as follows:  
- app.js : the main file that starts the server  
- config/express.js : the middleware app with the webhooks needed  
- payload/payload.js: Takes the payload from the Twilio integration point and decides the type of the message  
- handlers/handlers.js: Takes the output from payload.js and depending on the type of message takes appropriate action (functions here should be defined based on business needs)  
- tests/tests.js: Code that generates cards carrousel and quick replies


HOW TO RUN:
1. `npm install //Installs the dependencies`  
2. `npm start //Starts the app`
3. ngrok on port 4000 (default or set yours)
4. Set the ngrok path as "NGROK_URL/webhook" on Twilio-Messenger callback URL (under your project Channels https://www.twilio.com/console/channels)
5. Create the webhook on developers.facebook.com for the Messenger page you have created for the bot Verify URL will be "NGROK_URL/messenger/webhook" and the token is defined in your .env (copy and paste it there)
6. On your webhook on developers.facebook.com subscribe only to the messages_postbacks to avoid getting 2 payloads for simple text messages (both from the integration and facebook directly)


## Twilio Blog Post
Here you can find the relevant blog post that describes the install process and the expected results:
