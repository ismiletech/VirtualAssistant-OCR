require("dotenv").config();
const { createWriteStream } = require("fs");
const path = require("path");
const express = require("express");

const { Storage } = require("@google-cloud/storage");
const router = express.Router();
const images = require("../lib/images");
console.log("THIS STATEMENT RUNS BEFORE CALLING MULTER");
console.log("testing1: GOOGLE APPLICATION CREDENTIALS: " + process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("testing1: BUCKET NAME" + process.env.GCS_BUCKET);
console.log("testing1: PROJECT ID" + process.env.GCLOUD_PROJECT);
router.post("/upload", 
images.multer.single('image'),
images.sendUploadToGCS,
(req, response, next) => {
      let data = req.body;
      //filename
      console.log("testing2: GOOGLE APPLICATION CREDENTIALS: " + process.env.GOOGLE_APPLICATION_CREDENTIALS);
      console.log("testing2: BUCKET NAME" + process.env.GCS_BUCKET);
      console.log("testing2: PROJECT ID" + process.env.GCLOUD_PROJECT);
    async function extractText(){
      const vision = require('@google-cloud/vision').v1;
      const client = new vision.ImageAnnotatorClient();
      const outputPrefix = 'results'
      const fileName = req.file.cloudStorageObject;
      const gcsSourceUri = `gs://${process.env.GCS_BUCKET}/${fileName}`;
      const gcsDestinationUri = `gs://${process.env.GCS_BUCKET}/`;
      const inputConfig = {
        // Supported mime_types are: 'application/pdf' and 'image/tiff'
        mimeType: 'application/pdf',
        gcsSource: {
          uri: gcsSourceUri,
        },
      };
      const outputConfig = {
        gcsDestination: {
          uri: gcsDestinationUri,
        },
      };
      const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
    const request = {
      requests: [
        {
          inputConfig: inputConfig,
          features: features,
          outputConfig: outputConfig,
        },
      ],
    };
    const [operation] = await client.asyncBatchAnnotateFiles(request);
    const [filesResponse] = await operation.promise();
    const destinationUri =
    filesResponse.responses[0].outputConfig.gcsDestination.uri;
    console.log('Json saved to: ' + destinationUri);
    const https = require('https');
    https.get("https://www.googleapis.com/storage/v1/b/cosmic-tenure-241517.appspot.com/o/output-1-to-1.json", (resp) => {
      let data = "";
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        const jsonLink = JSON.parse(data).mediaLink;
        https.get(jsonLink, (res) => {
          let jsonData = "";
          res.on("data", (info) =>{
            jsonData += info;
          });
          res.on("end", () => {
            //successfull extracted text from the uploaded pdf file
            const extractedText = JSON.parse(jsonData).responses[0].fullTextAnnotation.text;
            
            //now send the extracted text to the front end
            response.send({
              extractedText: extractedText});
          })
        })
      });
    }).on("error", (err) => {
        console.log(err);
    })
    // const [result] = await client.textDetection(gcsSourceUri);
    // const detections = result.textAnnotations;
    // console.log('Text:');
    // detections.forEach(text => console.log(text));
 
  }
  extractText();
  function loadJSONFromGCS(){
    
  }
  loadJSONFromGCS();
  //if the image was uploaded we will use its public url 
  if(req.file && req.file.cloudStoragePublicUrl){
    data.imageUrl = req.file.cloudStoragePublicUrl;
  }
});
router.post("/uploadImage", 
images.multer.single('image'),
images.sendUploadToGCS
,(req, res, next) => {
  console.log("image passing1");
  async function extractText(){
    const vision = require('@google-cloud/vision').v1;
    const client = new vision.ImageAnnotatorClient();
    const fileName = req.file.cloudStorageObject;
    const gcsSourceUri = `gs://${process.env.GCS_BUCKET}/${fileName}`;
    const [result] = await client.textDetection(gcsSourceUri);
    const detections = result.textAnnotations;
    var extractedText = "";
    detections.forEach(text => 
      extractedText += text.description
    )
    res.send({
      extractedText: extractedText
    });
  }

  extractText();
  console.log("image passing2");

})



module.exports = router;
