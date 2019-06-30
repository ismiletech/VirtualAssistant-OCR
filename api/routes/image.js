const express = require("express");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const url = require("url");
const fs = require("fs");
const convertPdf = require("pdf-poppler");

const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: "AKIAJQIPU6BTUDAZCEAQ",
  secretAccessKey: "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",
  Bucket: "flyingfishcattle"
});

const singleImgUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "flyingfishcattle",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    }
  }),

  limits: { fileSize: 2000000 }, //In bytes: 2000000 bytes = 2mb max file size
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("image");

function checkFileType(file, cb) {
  //allowed file types
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype); //using regex to check file ext

  if (mimetype && extname) {
    //checking if file is a valid image
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname + "/uploads/"));
  },
  filename: function(req, file, cb) {
    // let pdfName = "samplePDF";
    // req.body.file = pdfName;
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage
});

router.post("/pdf", upload.single("pdf"), (req, res, next) => {
  const uploadPath = req.file.path;
  var imagePath =
    req.file.destination + req.file.originalname.slice(0, -4) + "-1.jpg";
  let opts = {
    format: "jpg",
    out_dir: req.file.destination,
    out_prefix: path.basename(req.file.path).slice(0, -4),
    page: null
  };
  var pdfTojpg = convertPdf.convert(uploadPath, opts).then((pdfinfo) => {
    console.log(pdfinfo);
  });

  pdfTojpg.catch((err) => {
    console.error(err);
  });
  pdfTojpg.then(() => {
    try {
      if (fs.existsSync(imagePath)) {
        console.log(imagePath);
      } else {
        console.log("NOT PASSING");
      }
    } catch (err) {
      console.error(err);
    }
  });

  res.send("success!");
});
router.post("/upload", (req, res) => {
  console.log(req.file);
  singleImgUpload(req, res, (error) => {
    if (error) {
      //return error in json
      console.log("errors", error);
      res.json({ error: error });
    } else {
      //if file not found
      if (req.file === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      }
      //if success
      const imageName = req.file.key;
      const imageLocation = req.file.location;

      //Save the file name into the database to img model
      res.json({
        image: imageName,
        location: imageLocation
      });
    }
  });
  res.send("Successfully uploaded " + req.files.length + " files!");
  //for uploading multiple files
});

module.exports = router;
