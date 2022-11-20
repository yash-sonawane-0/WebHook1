const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config(); // good practice to keep secret here

const app = express().use(body_parser.json());

const token = process.env.TOKEN; // for sending request
const mytoken = process.env.MYTOKEN; // for verifying webhook


app.listen(process.env.PORT, () => {
    console.log("webhook is listening OK");
});

// to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
    console.log("Inside get");
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode == "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403);
        }
    }
});

app.post("/webhook", (req, res) => {
    let body_param = req.body;
    console.log(JSON.stringify(body_param, null, 2));

    console.log("Here1");

    // the response here is (SEE -> AA)
    // This is way of writing json data with .dots
    if (body_param.object) {
        if (body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]) {

            let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_no_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
            console.log("Here2");
            console.log("Here2");

            console.log("PhoneNumber : " + phone_no_id);
            console.log("from : " + from);
            console.log("Body param : " + msg_body);

            // SEE -> BB
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v15.0/" + phone_no_id + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: "from",
                    text: {
                        "body": "Hii, this is Yash's Webhook, you Sent message is : " + msg_body,
                    }
                },
                headers: {
                    "Content-Type": "application/json",
                },
            });

            res.sendStatus(200);

            /*
            making it a bit like this 

            curl -i -X POST \
            https://graph.facebook.com/v15.0/107378628868710/messages \
            -H 'Authorization: Bearer EAAGHosZB1cccBAJPF9JgxWHC1BVuq5gsFCD4lXLEU9naodJIOR7qvAjaDTCKA1NKmVb0KuX3EPdj8baWIbrzkAiLYYAVDvWTGgUDCDFbL2ZBkwvV4gNp4CCPEZC43Xbh9xdgw8574Y9cpvzFqNueUrp1esyHXKl35RtLXBgNQ5NO1hK21RxuMhjgAJgYEEpgHLP2yWEcn5igYdUc2ZBG' \
            -H 'Content-Type: application/json' \
            -d '{ "messaging_product": "whatsapp", "to": "", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }'
            */
        } else {
            res.sendStatus(404);
        }
    }
});

// Message to show in 8000 port 
app.get("/", (req, res) => {
    res.status(200).send("Hello this is webhook");
});


/*
AA-> This is going to be response
{
  "object": "whatsapp_business_account",
  "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                  "display_phone_number": PHONE_NUMBER,
                  "phone_number_id": PHONE_NUMBER_ID
              },
              "contacts": [{
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": PHONE_NUMBER
                }],
              "messages": [{
                  "from": PHONE_NUMBER,
                  "id": "wamid.ID",
                  "timestamp": TIMESTAMP,
                  "text": {
                    "body": "MESSAGE_BODY"
                  },
                  "type": "text"
                }]
          },
          "field": "messages"
        }]
  }]
}
*/

/*
BB->
// Send a POST request
axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
*/