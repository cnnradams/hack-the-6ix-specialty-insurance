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
      "messages": [],
      "current_message": "",
      "isImageUpload": false,
      "userOptions": ["Get a quote", "File a claim"],
      "token": ""
    }

    this.handleClick = this.handleClick.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addMessageBox = this.addMessageBox.bind(this);
  }

  componentDidMount() {
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
        isImageUpload: isImageUpload,
        current_message: ""
      })
    }
  }

  addMessageBoxOptions = (option) => {
    let messages = this.state.messages;
    let current_message = option;

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
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ChatApp;