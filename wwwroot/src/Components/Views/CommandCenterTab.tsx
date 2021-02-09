import * as React from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import { Button, Loader, Avatar, ItemLayout, ReplyIcon, Input, Segment, CloseIcon } from '@fluentui/react-northstar';
import { Container, Row, Col, ThemeProvider } from "react-bootstrap";
import { AlertHandler } from "../../Models/AlertHandler";
import * as signalR from "@microsoft/signalr";
import ReactHtmlParser from "react-html-parser"

// component properties
export interface CommandCenterTabProps {
    alertHandler: AlertHandler;
}

// component state
export interface CommandCenterTabState {
    token: string;
    graphToken: string;
    context: microsoftTeams.Context;
    channels: any[];
    activeReply: string;
    replyText:string;
}

// CommandCenterTab component
class CommandCenterTab extends React.Component<CommandCenterTabProps, CommandCenterTabState> {
    constructor(props: CommandCenterTabProps) {
        super(props);
        this.state = {
            token: "",
            graphToken: "",
            context: null,
            channels: [],
            activeReply: "",
            replyText: ""
        };

        // get context
        microsoftTeams.getContext((ctx:microsoftTeams.Context) => {
            this.setState({ context: ctx });

            // initialize SignalR
            var connection = new signalR.HubConnectionBuilder().withUrl("/notifications").build();
            connection.start().then(() => {
                // register a listener for this channel ID
                connection.invoke("Initialize", ctx.groupId).catch((err) => {
                    return console.error(err.toString());
                });
            });

            // listen for notify messages sent in
            connection.on("Notify", (message:any) => {
                console.log(message);

                // get channels from state
                var channels = this.state.channels;
                for (var i = 0; i < channels.length; i++) {
                    if (channels[i].id == message.channelIdentity.channelId) {
                        // check if this is a new thread or reply
                        if (message.replyToId) {
                            // process reply by finding the thread
                            for (var j = 0; i < channels[i].threads.length; j++) {
                                if (channels[i].threads[j].id == message.replyToId) {
                                    channels[i].threads[j].replies.unshift(message);
                                    console.log("added reply");
                                    break;
                                }
                            }
                            this.setState({channels: channels});
                        }
                        else {
                            // process thread
                            channels[i].threads.unshift(message);
                            this.setState({channels: channels});
                        }
                    }
                }
            });
        });

        // perform the SSO request
        const authTokenRequest = {
            successCallback: this.tokenCallback,
            failureCallback: (error: string) => { console.log("Failure: " + error); },
        };
        microsoftTeams.authentication.getAuthToken(authTokenRequest);
    };

    // token callback from getAuthToken
    tokenCallback = (token: string) => {
        this.setState({ token: token });
        // TODO: if this had dashboard configuration database we would load that config here

        fetch("/api/graphtoken", {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + this.state.token
            }),
        }).then(async (response) => {
            if (!response.ok) {
                const message = await response.json();
                throw new Error("Unable to get user graph token");
            }
            return response.text();
        }).then((graphToken: string) => {
            this.setState({graphToken: graphToken});
            console.log(graphToken);
        });

        // stop the spinner
        microsoftTeams.appInitialization.notifyAppLoaded();
        microsoftTeams.appInitialization.notifySuccess();
    };

    replyToThread = (threadId:string, index:number) => {
        this.setState({activeReply: threadId});
    };

    addChat = () => {
        // launch the addChat dialog to select a new channel
        let taskInfo = {
            url: `https://${window.location.host}/addchat`,
            title: "Add Chat",
            height: 200,
            width: 400,
        };
        microsoftTeams.tasks.startTask(taskInfo, (err: string, result: any) => {
            if (result) {
                // TODO: save the selection in dashboard configuration database

                // Load the threads for this channel
                fetch(`/api/channel/${this.state.context.groupId}/${result.key}`, {
                    method: "GET",
                    headers: new Headers({
                        "Authorization": "Bearer " + this.state.token
                    }),
                }).then(async (response) => {
                    if (!response.ok) {
                        const message = await response.json();
                        throw new Error(`Unable to get the channel messages: ${message['reason']}`);
                    }
                    return response.json();
                }).then((jsonResponse: any) => {
                    let channels = this.state.channels;
                    let newChannel = {id: result.key, displayName: result.header, threads: jsonResponse};
                    channels.push(newChannel);
                    this.setState({channels: channels});
                });
            }
        });
    };

    keypress = (channel:any, thread:any, evt:any) => {
        if (evt.key == "Enter") {
            // submit the new post
            fetch(`https://graph.microsoft.com/v1.0/teams/${this.state.context.groupId}/channels/${channel.id}/messages/${thread.id}/replies`, {
                method: "POST",
                headers: new Headers({
                    "Authorization": "Bearer " + this.state.graphToken,
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({body: {contentType: "text", content: this.state.replyText}})
            }).then((res:any) => {
                return res.json();
            }).then((jsonResponse: any) => {
                console.log(jsonResponse);
                this.setState({activeReply: "", replyText: ""})
            });
        }
    };

    handleInputChange = (event:any) => {
        let fieldVal = event.target.value;
        this.setState({replyText: fieldVal});
    };

    // renders the component
    render() {
        // process channels
        let channels = this.state.channels.map((channel:any, iC:number) => {
            // process threads for channel
            let threads = channel.threads.map((thread:any, iT:number) => {
                // process replies for thread
                let replies = thread.replies.map((reply:any, iR:number) => {
                    return (<ItemLayout
                        className="reply"
                        media={<Avatar size="large" status="Available" name={reply.from.user.displayName}/>}
                        header={<div style={{whiteSpace: "nowrap"}}><span style={{fontWeight: "bold", paddingRight: "5px"}}>{reply.from.user.displayName}</span><span>{reply.createdDateTime}</span></div>}
                        content={ReactHtmlParser(reply.body.content)} />);
                });

                return (<ItemLayout
                        className="thread"
                        media={<Avatar size="large" status="Available" name={thread.from.user.displayName} style={{padding: "4px"}}/>}
                        header={<div style={{whiteSpace: "nowrap", paddingLeft: "4px", paddingRight: "4px" }}><span style={{fontWeight: "bold", paddingRight: "5px"}}>{thread.from.user.displayName}</span><span>{thread.createdDateTime}</span></div>}
                        content={(
                            <div className="replies">
                                <div style={{paddingBottom: "4px", paddingLeft: "4px", paddingRight: "4px", paddingTop: "4px", borderBottom: "1px solid #ccc"}}>{ReactHtmlParser(thread.body.content)}</div>
                                {replies.reverse()}
                                <div style={{width: "100%", background: "#fff"}}>
                                    {(this.state.activeReply == thread.id) 
                                        ? (<Input placeholder="Reply" fluid autoFocus onKeyPress={this.keypress.bind(this, channel, thread)} onChange={this.handleInputChange.bind(this)} value={this.state.replyText} />) 
                                        : (<Button icon={<ReplyIcon />} text content="Reply" onClick={() => this.replyToThread(thread.id, iT)}></Button>)
                                    }
                                </div>
                            </div>
                        )} />);
            });
            return (
                <Col sm={12} md={6}>
                    <div className="channel-outer">
                        <Segment inverted content={<div><span>{channel.displayName}</span><CloseIcon style={{float: "right"}} /></div>} color="brand" />
                        <div className="channel-inner">
                            {threads.reverse()}
                        </div>
                    </div>
                </Col>
            );
        });

        return (
            <div className="page">
                <Button content="Add chat" onClick={this.addChat} />
                <Container fluid>
                    <Row>{channels}</Row>
                </Container>
            </div>
        );
    }
}

export default CommandCenterTab;