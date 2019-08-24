import React, { Component } from 'react';
import './App.css';
import './ChatApp.css';
import MessageBox from './Components/MessagesContainer'
import UserMessageBox from './Components/UserMessageBox'

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "messages": [],
      "current_message": "",
      "isImageUpload": false
    }

    this.handleClick = this.handleClick.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addMessageBox = this.addMessageBox.bind(this);
  }


  addMessageBox(enter = true) {
    let messages = this.state.messages;
    let current_message = this.state.current_message;
    console.log(this.state);
    if (current_message && enter) {
      messages = [...messages, { "message": current_message }];
      fetch("http://localhost:5000?message=" + current_message)
        .then(res => res.json())
        .then(
          (result) => {
            console.log(result);
            this.setState({
              messages: [...messages, { "message": result["message"], "isbotmessage": true }]
            });
          },
          (error) => {
            //do nothing for now
          }
        );
      current_message = ""
    }
    this.setState({
      current_message: current_message,
      messages
    });

  }

  handleClick(isImage) {
    if (isImage) {
    } else {
      this.addMessageBox();
    }
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
  }

  render() {
    return (
      <div class="d-flex justify-content-center">
        <div className="chat_window">
          <MessageBox messages={this.state.messages}></MessageBox>
          <div className="bottom_wrapper clearfix">
            <UserMessageBox
              _handleKeyPress={this._handleKeyPress}
              onChange={this.onChange}
              message={this.state.current_message}
              handleClick={this.handleClick} />
          </div>
        </div>
      </div>
    );
  }
}

export default ChatApp;