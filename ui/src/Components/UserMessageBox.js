import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

export default class UserMessageBox extends Component {
    render() {
        return (
            <div>
                <div className="message_input_wrapper">
                    <input id="msg_input" className="message_input" placeholder="Type your messages here..." value={this.props.message} onChange={this.props.onChange} onKeyPress={this.props._handleKeyPress} />
                </div>
                <div className="send_message" onClick={this.props.handleClick}>
                    <div className="icon"><FontAwesomeIcon icon={faPaperPlane} /></div>
                </div>

                <div className="add_image" onClick={this.props.handleClick}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div >
        );
    }
}