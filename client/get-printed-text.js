"use strict";
require("dotenv").config();
const request = require("request");
//add your subscription key to an env variable called AZURECOMPUTERVISIONSUBSCRIPTIONKEY
const subscriptionKey = process.env.REACT_APP_OCRKEY;

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = "https://eastus.api.cognitive.microsoft.com/vision/v2.0/ocr";

const imageUrl =
  "https://cosmic-tenure-241517.appspot.com.storage.googleapis.com/f7b4c690-b533-11e9-935d-8dfd1402a389_samplePic.png"; //sample image from AWS S3 bucket
 // https://flyingfishcattle.s3.us-east-2.amazonaws.com/sample-1.jpg
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
