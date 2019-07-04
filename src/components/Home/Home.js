import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import { css } from "@emotion/core";
import { ClipLoader } from "react-spinners";
const request = require("request");
const path = require("path");
//or use ```import ClipLoader from "react-spinner/ClipLoader";```
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
var port = 4000;


axios.defaults.baseURL =
  window.location.protocol + "//" + window.location.hostname + ":" + port;

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      selectedFiles: null,
      pdfFile: null,
      loading: false,
      buttonText: "",
      wordList: ""
    };
  }
  componentDidMount() {
    this.setState({
      loading: false,
      buttonText: "Upload",
      wordList: ""
    });
  }
  singleFileChangedHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0]
    });
  };

  pdfFileChangedHandler = (event) => {
    this.setState({
      pdfFile: event.target.files[0]
    });
  };
  pdfFileUploadHandler = () => {
    this.setState({
      loading: true
    });
    const pdfData = new FormData();
    if (this.state.pdfFile) {
      pdfData.append("pdf", this.state.pdfFile, this.state.pdfFile.name);
      axios
        .post("/api/image/pdf", pdfData, {
          headers: {
            "Accept-Language": "en-US,en;q=0.8",
            accept: "application/json",
            "Content-Type": `multipart/form-data; boundary=${
              pdfData._boundary
            }`,
            "Access-Control-Allow-Origin": "*"
          }
        })
        .then((res) => {
          let fileName = res.data;
          console.log("filedata", fileName);
          this.ocShowAlert("File Uploaded Succesfully", "#3089cf");
          this.setState({ loading: false, buttonText: "Upload" });
          let fileUrl = res.data.location;
          this.getOCRDataHandler(fileUrl);

        });
          // const jpgPath = res.data;
          // const jpgData = new FormData();

          // jpgData.append(
          //   "image",
          //   new File(jpgPath, path.basename(jpgPath)),
          //   path.basename(jpgPath)
          // );
          // console.log(jpgPath);
          // console.log(jpgData);
          // return jpgData;
        });
      // .then((jpgData) => {

      //   // axios
      //   //   .post("/api/image/jpg", jpgData, {
      //   //     headers: {
      //   //       "Accept-Language": "en-US,en;q=0.8",
      //   //       accept: "application/json",
      //   //       "Content-Type": `multipart/form-data; boundary=${
      //   //         pdfData._boundary
      //   //       }`,
      //   //       "Access-Control-Allow-Origin": "*"
      //   //     }
      //   //   })
      //     .then((res) => {
      //       if (res.status === 200) {
      //         if (res.data.error) {
      //           if ("LIMIT_FILE_SIZE" == res.data.error.code) {
      //             console.log("file too large");
      //             this.setState({ loading: false });
      //           } else {
      //             console.log(res.data);
      //             this.setState({ loading: false });
      //           }
      //         } else {
      //           let fileName = res.data;
      //           console.log("filedata", fileName);
      //           this.setState({ loading: false });
      //           let fileUrl = res.data.location;
      //           this.getOCRDataHandler(fileUrl);
      //         }
      //       }
      //     });
      // });
      // .catch((error) => {
      //   console.log(error); //error handling for now, call alert function later
      //   this.setState({
      //     loading: false
      //   });
      // });

    } else {
      console.log("Please upload a valid pdf file!");
      this.setState({
        loading: false
      });
    }
  };
  singleFileUploadHandler = () => {
    this.setState({
      loading: true,
      buttonText: "Uploading",
      wordList: ""
    });
    this.buttonText = "Uploading";
    const data = new FormData();
    //if file selected
    if (this.state.selectedFile) {
      data.append(
        "image",
        this.state.selectedFile,
        this.state.selectedFile.name
      ); //setting image formdata object: uploaded file
      axios
        .post("/api/image/upload", data, {
          headers: {
            "Accept-Language": "en-US,en;q=0.8",
            accept: "application/json",
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
            "Access-Control-Allow-Origin": "*"
          }
        })
        .then((res) => {
          if (res.status === 200) {
            if (res.data.error) {
              //file size was larger than 2mb
              if ("LIMIT_FILE_SIZE" === res.data.error.code) {
                this.ocShowAlert("Max size: 2MB", "red");
                this.setState({ loading: false, buttonText: "Upload" });
              } else {
                //if not, show error to user
                console.log(res.data);
                this.ocShowAlert(res.data.error, "red");
                this.setState({ loading: false, buttonText: "Upload" });
              }
            } else {
              let fileName = res.data;
              console.log("filedata", fileName);
              this.ocShowAlert("File Uploaded Succesfully", "#3089cf");
              let fileUrl = res.data.location;
              this.getOCRDataHandler(fileUrl);
            }
          }
        })
        .catch((error) => {
          this.ocShowAlert(error, "red");
        });
    } else {
      this.ocShowAlert("Please upload a valid image file", "red");
      this.setState({ loading: false, buttonText: "Upload" });
    }
  };

  getOCRDataHandler = (fileUrl) => {
    //getting and rendering the extracted text from the image url
    const ocrSubKey = "<InsertOCRApiKey>";
    const uriBase =
      "https://eastus.api.cognitive.microsoft.com/vision/v2.0/ocr";
    const params = {
      language: "unk",
      detectOrientation: "true"
    };
    const options = {
      uri: uriBase,
      qs: params,
      body: '{"url": ' + '"' + fileUrl + '"}',
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": ocrSubKey
      }
    };
    request.post(options, (error, response, body) => {
      if (error) {
        console.log("Error: ", error);
        return;
      }
      console.log(body);
      let obj = JSON.parse(body);
      let extractedWords = "Extracted Words: ";
      try {
        for (var c = 0; c < obj.regions.length; c++) {
          for (var i = 0; i < obj.regions[c].lines.length; i++) {
            for (var j = 0; j < obj.regions[c].lines[i].words.length; j++) {
              extractedWords += obj.regions[c].lines[i].words[j].text + ", ";
            }
          }
        }
        if (extractedWords === "Extracted Words: ") {
          extractedWords += "No words were found!";
        }
        this.setState({
          loading: false,
          buttonText: "Upload",
          wordList: extractedWords
        });
      } catch (err) {
        extractedWords += "No words were found!";
        this.setState({
          loading: false,
          buttonText: "Upload",
          wordList: extractedWords
        });
      }
    });
  };

  //alert showing function
  ocShowAlert = (message, background = "#3089cf") => {
    let alertContainer = document.querySelector(".home__alert"),
      alertEl = document.createElement("div");
    let textNode = document.createTextNode(message);
    alertEl.setAttribute("class", "home__alert--pop-up");
    $(alertEl).css("background", background);
    alertEl.appendChild(textNode);
    alertContainer.appendChild(alertEl); // appending text to div element
    setTimeout(function() {
      $(alertEl).fadeOut("slow");
      $(alertEl).remove();
    }, 3000);
  };

  render() {
    return (
      <div className="home">
        <div className="home__alert" />
        <div className="card border-light mb-3 mt-5 home__card">
          <div className="home__card__header">
            <h3 className="home__card__header--heading">Single Image Upload</h3>
            <p className="home__card__header--text">Max Upload Size 2mb</p>
          </div>
          <div className="home__card__body">
            <p className="home__card__body--text">
              Upload an image with text to be extracted:
            </p>
            <input
              className="home__card__body--fileInput"
              type="file"
              onChange={this.singleFileChangedHandler}
            />
            <div className="mt-5 home__card__submitForm">
              <button
                className="btn btn-info home__card__submitForm--button"
                onClick={this.singleFileUploadHandler}
                disabled={this.state.loading}
              >
                {this.state.buttonText}
              </button>
              <div className="sweet-loading">
                <ClipLoader
                  css={override}
                  sizeUnit={"px"}
                  size={150}
                  color={"#123abc"}
                  loading={this.state.loading}
                />
              </div>
              <div className="home__card__result">
                <h3 className="home__card__result--text">
                  {this.state.wordList}
                </h3>
              </div>
            </div>
          </div>
        </div>
        <div className="home__pdf">
          <form className="home__pdf__form" encType="multipart/form-data">
            <p className="home__pdf__form--text">
              Upload a pdf with text in it
            </p>
            <input
              className="home__pdf__form--fileInput"
              type="file"
              name="pdf"
              id="pdf"
              onChange={this.pdfFileChangedHandler}
            />
            <div className="home__pdf__submitForm">
              <button
                className="btn btn-info home__pdf__submitForm--button"
                onClick={this.pdfFileUploadHandler}
                disabled={this.state.loading}
              >
                Upload
              </button>
              <div className="home__card__result">
                <h3 className="home__card__result--text">Result</h3>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
