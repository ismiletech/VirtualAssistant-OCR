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
axios.defaults.baseURL = "https://cosmic-tenure-241517.appspot.com";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      selectedFiles: null,
      pdfFile: null,
      loading: false,
      buttonText: "",
      wordList: "",
      resultString: ""
    };
  }
  componentDidMount() {
    this.setState({
      loading: false,
      buttonText: "Upload",
      wordList: "",
      resultString: ""
    });
  }
  singleFileChangedHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0]
    });
  };
  singleFileUploadHandler = (e) => {
    const type = e.target.className;
    if(type === "imageUpload"){
      this.setState({
        loading: true,
        buttonText: "Uploading",
        wordList: "",
        resultString: "Extracting text, Please Wait..."
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
          .post("https://cosmic-tenure-241517.appspot.com/api/image/uploadImage", data, {
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
                
                  this.ocShowAlert(res.data.error, "red");
                  this.setState({ loading: false, buttonText: "Upload" });
                }
              } else {
                let fileName = res.data;
        
                this.setState({
                  loading: false,
                  wordList: res.data.extractedText,
                  buttonText: "Upload",
                  resultString: "Extracted Text:"
                });
                this.ocShowAlert("File Uploaded Succesfully", "#3089cf");
                let fileUrl = res.data.imageUrl;
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
  }else if(type === "pdfUpload"){
      this.setState({
        loading: true,
        buttonText: "Uploading",
        wordList: "",
        resultString: "Extracting text, Please Wait..."
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
          .post("https://cosmic-tenure-241517.appspot.com/api/image/upload", data, {
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
                
                  this.ocShowAlert(res.data.error, "red");
                  this.setState({ loading: false, buttonText: "Upload" });
                }
              } else {
                let fileName = res.data;
        
                this.setState({
                  loading: false,
                  wordList: res.data.extractedText,
                  buttonText: "Upload",
                  resultString: "Extracted text:"
                });
                this.ocShowAlert("File Uploaded Succesfully", "#3089cf");
                let fileUrl = res.data.imageUrl;
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
    }
   
  };
  //alert showing function
  ocShowAlert = (message, background = "#3089cf") => {
    let alertContainer = document.getElementById("alert"),
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
        <div className="home__alert" id="alert" />
        <div className="card border-light mb-3 mt-5 home__card">
          <div className="home__card__header">
            <h3 className="home__card__header--heading">Single Image Upload</h3>
            <p className="home__card__header--text">Max Upload Size 2mb</p>
          </div>
          <div className="home__card__body">
            <p className="home__card__body--text">
              Upload an pdf with text to be extracted:
            </p>
            <input
              className="home__card__body--fileInput"
              type="file"
              onChange={this.singleFileChangedHandler}
            />
            <div className="mt-5 home__card__submitForm">
              <button
                className="pdfUpload"
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
                <div className="home__card__result">
                  <h3 className="home__card__result--text">{this.state.resultString}</h3>
                </div>
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
              Upload a image file with text in it
            </p>
            <input
              className="home__pdf__form--fileInput"
              type="file"
              name="pdf"
              id="pdf"
              onChange={this.singleFileChangedHandler}
            />
            <div className="home__pdf__submitForm">
              <button
                className="imageUpload"
                onClick={this.singleFileUploadHandler}
                disabled={this.state.loading}
              >
                {this.state.buttonText}
              </button>
        
            </div>
          </form>
        </div>
      </div>
    );
  }
}
