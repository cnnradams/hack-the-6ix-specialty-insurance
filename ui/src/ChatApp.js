import React, { Component } from 'react';
import './App.css';
import './ChatApp.css';
import MessageBox from './Components/MessagesContainer'
import UserMessageBox from './Components/UserMessageBox'
import axios from 'axios'
import logo from './img/LogoSide.png';

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "selectedFile": null,
      "messages": [],
      "current_message": "",
      "isImageUpload": false,
      "userOptions": ["Get a quote", "File a claim"],
      "token": "",
      "isFile": false
    }

    this.handleClick = this.handleClick.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addMessageBox = this.addMessageBox.bind(this);
  }

  componentDidMount() {
    this.initializeBot();
  }

  initializeBot = () => {
    axios.get("http://3.226.124.218:5000/initialize/")
      .then(
        (result) => {
          this.setState({
            messages: [{ "message": result.data.message, "isbotmessage": true }],
            token: result.data.token
          });
        }).catch(error => {
          console.log(error)
        })
  }

  getUserOptions = (msg) => {
    let userOptions = [];
    let isImageUpload = false;

    if (!msg.includes("Sorry")) {
      if (msg.includes("home") || msg.includes("correct?")) {
        userOptions = ["Yes", "No"]
      } else if (msg.includes("image(s)")) {
        isImageUpload = true;
      } else if (msg.includes("value your")) {
        userOptions = [ "Ok","Add Image", "Wrong Value"]
      } else if (msg.includes("quote") || msg.includes("updated")) {
        userOptions = ["Pay", "Exit"]
      } else if (msg.includes("PayPal") || msg.includes("line") ) {
        userOptions = ["Exit"]
      } else {
        userOptions = [];
      }

      if (!msg.includes("exiting")) {
        this.setState({
          userOptions: userOptions,
          isImageUpload: isImageUpload,
          current_message: ""
        })
      } else {
        this.setState({
          selectedFile: null,
          messages: [],
          current_message: "",
          isImageUpload: false,
          userOptions: ["Get a quote", "File a claim"],
          token: "",
          isFile: false
        })
        this.initializeBot();
      }
    } else {
      this.setState({
        current_message: ""
      })
    }
  }

  addMessageBoxOptions = (option) => {
    let messages = this.state.messages;
    let current_message = option;

    messages = [...messages, { "message": current_message }];

    console.log(current_message)

    axios.get("http://3.226.124.218:5000/post-chatbot?message=" + current_message + "&token=" + this.state.token)
      .then(
        (result) => {
          this.setState({
            messages: [...messages, { "message": result.data.message, "isbotmessage": true }],
            current_message: result.data.message
          });
          this.getUserOptions(result.data.message);
        }).catch(error => {
          console.log(error)
        })
  }

  addMessageBox(enter = true) {
    let messages = this.state.messages;
    let current_message = this.state.current_message;

    if (current_message && enter) {
      messages = [...messages, { "message": current_message }];

      axios.get("http://3.226.124.218:5000/post-chatbot?message=" + current_message + "&token=" + this.state.token)
        .then(
          (result) => {
            this.setState({
              messages: [...messages, { "message": result.data.message, "isbotmessage": true }],
              current_message: result.data.message
            });
            this.getUserOptions(result.data.message);
          }).catch(error => {
            console.log(error)
          })
      this.setState({
        current_message: ""
      })
    }
  }

  fileSelectedHandler = event => {
    this.setState({
      selectedFile: event.target.files[0],
    })
  }

  fileUploadHandler = () => {
    let messages = this.state.messages;
    const fd = new FormData();
    fd.append('image', this.state.selectedFile, this.state.selectedFile.name)
    var file = this.state.selectedFile
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      this.setState({
        current_message: "Image uploaded: " + this.state.selectedFile.name,
        imgUpload: reader.result.replace("data:image/jpeg;base64,", "")
      })
      messages = [...messages, { "message": this.state.current_message }];

      fetch("http://3.226.124.218:5000/post-image", {
        method: 'POST',
        headers: {
          'Accept': '*',
        },
        body: JSON.stringify({
          image: this.state.imgUpload,
          token: this.state.token
        })
      }).then((result) => {
        axios.get("http://3.226.124.218:5000/get-image")
          .then(
            (result) => {
              console.log(result)
              this.setState({
                messages: [...messages, { "message": result.data.message, "isbotmessage": true }],
                current_message: result.data.message
              });
              this.getUserOptions(result.data.message);
            }).catch(error => {
              console.log(error)
            })
      })

      reader.onerror = function (error) {
        console.log('Error: ', error);
      }
    }
  }

  handleClick() {
    this.addMessageBox();
    this.setState({
      current_message: ""
    })
  }

  onChange(e) {
    this.setState({
      current_message: e.target.value
    });
  }

  _handleKeyPress(e) {
    let enter_pressed = false;
    if (e.key === "Enter") {
      enter_pressed = true;
    }
    this.addMessageBox(enter_pressed)
    if (enter_pressed) {
      this.setState({
        current_message: ""
      })
    }
  }

  handleClickwithOptions = (option) => {
    console.log(option);
    this.addMessageBoxOptions(option);
    this.setState({
      current_message: ""
    })
  }

  render() {
    return (
      <div className="d-flex justify-content-center">
        <div className="chat_window">
          <div className="row header">
            <div className="logo">
              <img src={logo} />
            </div>
          </div>

          <MessageBox
            messages={this.state.messages}
          />
          <div className="bottom_wrapper clearfix">
            <UserMessageBox
              _handleKeyPress={this._handleKeyPress}
              onChange={this.onChange}
              message={this.state.current_message}
              messages={this.state.messages}
              handleClick={this.handleClick}
              isImageUpload={this.state.isImageUpload}
              userOptions={this.state.userOptions}
              handleClickwithOptions={this.handleClickwithOptions}
              token={this.state.token}
              fileUploadHandler={this.fileUploadHandler}
              fileSelectedHandler={this.fileSelectedHandler}
              isFile={this.isFile}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ChatApp;