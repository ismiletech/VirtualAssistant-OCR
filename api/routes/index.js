const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();

router.get("/", (req, res, next) => {
  res.send("Hello World");
});

router.post("/uploadpdf", upload.single("myFile"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    console.log(error);
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});

module.exports = router;
