import React from 'react';
import { Chat } from '@progress/kendo-react-conversational-ui';
import '@progress/kendo-theme-bootstrap/dist/all.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.user = {
            id: 1,
            avatarUrl: "http://www.pngall.com/wp-content/uploads/2016/05/Kirby-Free-PNG-Image.png"
        };
        this.bot = { id: 0 };
        this.state = {
            messages: [
                {
                    author: this.bot,
                    suggestedActions: [
                        {
                            type: 'reply',
                            value: 'Vacation Insurance'
                        }, {
                            type: 'reply',
                            value: 'I want to file a claim'
                        }
                    ],
                    timestamp: new Date(),
                    text: "Hello, this is an insurance bot for recieving quotes for specialty objects and filing claims"
                }
            ]
        };
    }

    addNewMessage = (event) => {
        let botResponse = Object.assign({}, event.message);
        botResponse.text = this.countReplayLength(event.message.text);
        botResponse.author = this.bot;
        this.setState((prevState) => ({
            messages: [
                ...prevState.messages,
                event.message
            ]
        }));
        setTimeout(() => {
            this.setState(prevState => ({
                messages: [
                    ...prevState.messages,
                    botResponse
                ]
            }));
        }, 1000);
    };

    countReplayLength = (question) => {
        let length = question.length;
        let answer = question + " contains exactly " + length + " symbols.";
        return answer;
    }

    render() {
        return (
            <div>
                <Chat user={this.user}
                    messages={this.state.messages}
                    onMessageSend={this.addNewMessage}
                    placeholder={"Type a message..."}
                    width={400}>
                </Chat>
            </div>
        );
    }
}

export default App;