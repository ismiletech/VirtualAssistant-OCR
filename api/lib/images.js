const Storage = require('@google-cloud/storage');
const CLOUD_BUCKET = "cosmic-tenure-241517.appspot.com";
const storage = Storage();
const bucket = storage.bucket(CLOUD_BUCKET);

function getPublicUrl(filename){
    return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}

//express middleware that will automatically pass uploads to Cloud Storage

function sendUploadToGCS(req, res, next){
    console.log("THE CLOUD BUCKET IS: " + CLOUD_BUCKET);

    if(!req.file){
        return next();
    }

    const gcsname = Date.now() + req.file.originalname;
    const file =  bucket.file(gcsname);
    console.log(gcsname);
    //uploading the file to Google Cloud 
    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimeType
        },
        resumable: false
    });
    stream.on("error", (err) => {
        req.file.cloudStorageError = err;
        next(err);
    })
  
    stream.on("finish", () => {
        req.file.cloudStorageObject = gcsname;
        file.makePublic().then(() => {
            console.log("THE PUBLIC URL IS: " + getPublicUrl(gcsname));
            req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
            next();
        })
    });
    console.log("passing1");
    stream.end(req.file.buffer);
    console.log("passing2");

}

//multer handles parsing multipart/form-data requests.
//This instance is configured to store images in memory 
//This makes is straightforward to upload to Cloud Storage
const Multer = require("multer");
const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
});

module.exports = {
    getPublicUrl, 
    sendUploadToGCS,
    multer
}