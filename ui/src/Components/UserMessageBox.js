import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

export default class UserMessageBox extends Component {
    state = {
        selectedFile: null,
        isFile: false
    }

    fileSelectedHandler = event => {
        this.setState({
            selectedFile: event.target.files[0],
            isFile: true
        })
    }

    fileUploadHandler = () => {
        const fd = new FormData();
        fd.append('image', this.state.selectedFile, this.state.selectedFile.name)
        this.setState({
            isFile: false
        })
        axios.post('EndpointURL', fd, {
            onUploadProgress: progressEvent => {
                console.log('Upload Progress: ' + Math.round(progressEvent.loaded / progressEvent.total * 100))
            }
        }).then(res => {
                //Response from backend
                console.log(res);
            });
    }

    getInputField = () => {
        if (this.state.isFile) {
            return (
                <div className="message_input_wrapper">
                    <input id="msg_input" className="message_input" placeholder={this.state.selectedFile.name} value={this.props.message} onChange={this.props.onChange} onKeyPress={this.props._handleKeyPress} />
                </div>
            )
        }
        return (
            <div className="message_input_wrapper">
                <input id="msg_input" className="message_input" placeholder="Type your messages here..." value={this.props.message} onChange={this.props.onChange} onKeyPress={this.props._handleKeyPress} />
            </div>
        )
    }

    render() {
        const inputField = this.getInputField();

        return (
            <div>
                {inputField}
                <div className="send_message" onClick={this.props.handleClick}>
                    <div className="icon"><FontAwesomeIcon icon={faPaperPlane} /></div>
                </div>

                <div className="add_image" onClick={this.props.handleClick}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
                <div>
                    <input style={{ display: 'none' }} type="file" onChange={this.fileSelectedHandler} ref={fileInput => this.fileInput = fileInput} />
                    <button onClick={() => 
                        this.fileInput.click()
                    }>Pick File </button>
                    <button onClick={this.fileUploadHandler} onClick={this.props.handleClick}>Upload</button>
                </div >
            </div>
        );
    }
}