import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

export default class UserMessageBox extends Component {
    state = {
        isFile: false,
        imgUpload: '',
        messages: this.props.messages
    }

    getInputField = () => {
        if (this.state.isFile) {
            return (
                <div className="message_input_wrapper">
                    <input id="msg_input"
                        className="message_input"
                        value={this.state.selectedFile.name}
                        onChange={this.props.onChange}
                        onKeyPress={this.props._handleKeyPress} />
                </div>
            )
        }
        return (
            <div className="message_input_wrapper">
                <input id="msg_input"
                    className="message_input"
                    placeholder="Type your messages here..."
                    value={this.props.message}
                    onChange={this.props.onChange}
                    onKeyPress={this.props._handleKeyPress} />
            </div>
        )
    }

    getButtons = () => {
        if (this.props.isImageUpload) {
            return (
                <div className="upload_file">
                    <input
                        style={{ display: 'none' }} type="file"
                        onChange={this.props.fileSelectedHandler}
                        ref={fileInput => this.fileInput = fileInput}
                    />
                    <button className="send_message" onClick={this.props.fileUploadHandler}><FontAwesomeIcon icon={faPaperPlane} /></button>
                    <button className="add_image" onClick={() => this.fileInput.click()}><FontAwesomeIcon icon={faPlus} /></button>
                </div >
            )
        } else {
            return (
                <button className="send_message" onClick={this.props.handleClick}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>

            )
        }
    }

    getUserOptionBubbles = (option) => {
        return (
            <div className="bubbles">
                <button className="option_bubbles" onClick={() => this.props.handleClickwithOptions(option)}>{option}</button>
            </div>
        )
    }

    someFunction = () => {
        const options = []
        this.props.userOptions.forEach((option) => {
            const something = this.getUserOptionBubbles(option);
            console.log(something);
            options.push(something);
        })

        return options;
    }

    render() {
        console.log(this.props)

        if (!this.props.isImageUpload) {
            return (
                <div>
                    <div className="row">
                        {this.someFunction()}
                    </div>
                    <div className="row">
                        {this.getInputField()}
                        <div className="wrapper">
                            {this.getButtons()}
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="row" >
                {this.getInputField()}
                <div className="wrapper">
                    {this.getButtons()}
                </div>
            </div >
        )
    }
}