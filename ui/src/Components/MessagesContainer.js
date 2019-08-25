import React, { Component } from 'react';

class Avartar extends Component {
    render() {
        return (
            <div className="avatar"> 
            </div>
        );
    }
}

class UserMessageBox extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        return (
            <li className={`message ${this.props.appearance} appeared`}>
                <Avartar><link rel="shortcut icon" href="%PUBLIC_URL%/Icon.png" /></Avartar>
                <div className="text_wrapper">
                    <div className="text">{this.props.message}</div>
                </div>
            </li>
        );
    }
}

class MessagesContainer extends Component {
    constructor(props) {
        super(props);
        this.createBotMessages = this.createBotMessages.bind(this);
    }

    scrollToBottom = () => {
        var el = this.refs.scroll;
        el.scrollTop = el.scrollHeight;
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    createBotMessages() {
        console.log(this.props.messages);
        return this.props.messages.map((message, index) =>
            <UserMessageBox key={index} message={message["message"]} 
            appearance={message["isbotmessage"] ? "left" : "right"} />
        );
    }

    render() {
        return (
            <ul className="messages" ref="scroll">
                {this.createBotMessages()}
            </ul>
        );
    }
}

export default MessagesContainer;