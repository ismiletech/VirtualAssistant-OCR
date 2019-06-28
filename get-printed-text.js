"use strict";

const request = require("request");

//add your subscription key to an env variable called AZURECOMPUTERVISIONSUBSCRIPTIONKEY
const subscriptionKey = process.env.AZURECOMPUTERVISIONSUBSCRIPTIONKEY;

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = "https://eastus.api.cognitive.microsoft.com/vision/v2.0/ocr";

const imageUrl =
  "https://flyingfishcattle.s3.amazonaws.com/samplePic-1561764480194.jpg";

// Request parameters.
const params = {
  language: "unk",
  detectOrientation: "true"
};

const options = {
  uri: uriBase,
  qs: params,
  body: '{"url": ' + '"' + imageUrl + '"}',
  headers: {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": subscriptionKey
  }
};

request.post(options, (error, response, body) => {
  if (error) {
    console.log("Error: ", error);
    return;
  }
  let jsonResponse = JSON.stringify(JSON.parse(body), null, "  ");
  console.log("JSON Response\n");
  console.log(jsonResponse);
});
