import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import { css } from "@emotion/core";
import { ClipLoader } from "react-spinners";
const request = require("request");

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
      loading: false,
      buttonText: ""
    };
  }
  componentDidMount() {
    this.setState({ buttonText: "Upload" });
  }
  singleFileChangedHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0]
    });
  };

  singleFileUploadHandler = () => {
    this.setState({ loading: true, buttonText: "Uploading" });
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
              this.setState({ loading: false, buttonText: "Upload" });
              let fileUrl = res.data.location;
              console.log(process.env.AZURECOMPUTERVISIONSUBSCRIPTIONKEY);
              const ocrSubKey = "<InsertAzureComputerVisionSubKeyHere>";
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
                let jsonResponse = JSON.stringify(JSON.parse(body), null, "  ");
                console.log(jsonResponse);
              });
            }
          }
        })
        .catch((error) => {
          this.ocShowAlert(error, "red");
          this.setState({ loading: false, buttonText: "Upload" });
        });
    } else {
      this.ocShowAlert("Please upload a valid image file", "red");
      this.setState({ loading: false, buttonText: "Upload" });
    }
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
              className="home__card__body__fileInput"
              type="file"
              onChange={this.singleFileChangedHandler}
            />
            <div className="mt-5 home__submitForm">
              <button
                className="btn btn-info home__submitForm--button"
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}
