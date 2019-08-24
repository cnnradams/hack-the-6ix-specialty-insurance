import React, { Component } from 'react';
import './App.css';
import './ChatApp.css';
import MessageBox from './Components/MessagesContainer'
import UserMessageBox from './Components/UserMessageBox'
import axios from 'axios'

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "messages": [{ "message": "Hello! How can we help you today?", "isbotmessage": true }],
      "current_message": "",
      "isImageUpload": false,
      "userOptions": ["File a claim", "Get a quote"],
      "token": ""
    }

    this.handleClick = this.handleClick.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addMessageBox = this.addMessageBox.bind(this);
  }

  componentDidMount() {
    axios.get("http://3.226.124.218:5000/initialize/").then(res => res.json())
      .then(
        (result) => {
          this.setState({
            messages: [{ "message": result.message, "isbotmessage": true }],
            token: result.token
          });
        }).catch(error => {
          console.log(error)
        })
  }

  getUserOptions = (msg) => {
    let userOptions = [];
    let isImageUpload = false;

    if (msg.includes("home") || msg.includes("correct")) {
      userOptions = ["Yes", "No"]
    } else if (msg.includes("image(s)")) {
      isImageUpload = true;
    } else if (msg.includes("item")) {
      userOptions = ["OK", "CANCEL"];
    } else {
      userOptions = [];
    }

    this.setState({
      userOptions: userOptions,
      isImageUpload: isImageUpload
    })
  }

  addMessageBoxOptions = (option) => {
    let messages = this.state.messages;
    let current_message = option;

    messages = [...messages, { "message": current_message }];

    axios.get("http://3.226.124.218:5000/post-chatbot", {
      params: {
        message: current_message,
        token: this.state.token
      }
    }).then(res => res.json())
      .then(
        (result) => {
          this.setState({
            messages: [...messages, { "message": result.message, "isbotmessage": true }],
            current_message: result.message
          });
        }).catch(error => {
          console.log(error)
        })

  }

  addMessageBox(enter = true) {
    let messages = this.state.messages;
    let current_message = this.state.current_message;

    if (current_message && enter) {
      messages = [...messages, { "message": current_message }];

      axios.get("http://3.226.124.218:5000/post-chatbot", {
        params: {
          message: current_message,
          token: this.state.token
        }
      }).then(res => res.json())
        .then(
          (result) => {
            this.setState({
              messages: [...messages, { "message": result.message, "isbotmessage": true }],
              current_message: result.message
            });
          }).catch(error => {
            console.log(error)
          })
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
    console.log("I worked");
    this.addMessageBoxOptions(option);
    this.setState({
      current_message: ""
    })
  }

  render() {
    console.log(this.state.userOptions)
    return (
      <div className="d-flex justify-content-center">
        <div className="chat_window">
          <MessageBox
            messages={this.state.messages}
          />
          <div className="bottom_wrapper clearfix">
            <UserMessageBox
              _handleKeyPress={this._handleKeyPress}
              onChange={this.onChange}
              message={this.state.current_message}
              handleClick={this.handleClick}
              isImageUpload={this.state.isImageUpload}
              userOptions={this.state.userOptions}
              handleClickwithOptions={this.handleClickwithOptions}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ChatApp;