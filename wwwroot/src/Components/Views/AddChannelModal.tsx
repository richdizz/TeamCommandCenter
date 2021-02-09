import * as React from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import { Button, Dropdown, DropdownProps, Flex, Divider } from '@fluentui/react-northstar';
import { AlertHandler } from "../../Models/AlertHandler";

// component properties
export interface AddChannelModalProps {
    alertHandler: AlertHandler;
}

// component state
export interface AddChannelModalState {
    token: string;
    context: microsoftTeams.Context;
    channels: any[];
    selectedChannel: any;
}

// AddChannelModal component
class AddChannelModal extends React.Component<AddChannelModalProps, AddChannelModalState> {
    constructor(props: AddChannelModalProps) {
        super(props);
        this.state = {
            token: "",
            context: null,
            channels: [],
            selectedChannel: null
        };

        // get context
        microsoftTeams.getContext((ctx:microsoftTeams.Context) => {
            this.setState({ context: ctx });
        });

        // perform the SSO request
        const authTokenRequest = {
            successCallback: this.tokenCallback,
            failureCallback: (error: string) => { console.log("Failure: " + error); },
        };
        microsoftTeams.authentication.getAuthToken(authTokenRequest);
    }

    // token callback from getAuthToken
    tokenCallback = (token: string) => {
        this.setState({ token: token });

        fetch(`/api/channel/${this.state.context.groupId}`, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            }),
        }).then(async (response) => {
            if (!response.ok) {
                const message = await response.json();
                throw new Error(`Unable to get the channels for group: ${message['reason']}`);
            }
            return response.json();
        }).then((jsonResponse: any) => {
            // TODO: we should filter out existing selections to prevent duplicate tiles
            this.setState({ channels: jsonResponse});
            microsoftTeams.appInitialization.notifyAppLoaded();
            microsoftTeams.appInitialization.notifySuccess();
        });
    };

    selectionChanged = (_evt: unknown, ctrl: DropdownProps) => {
        // update channelId of mapping
        const selectedItem = ctrl.value;
        this.setState({selectedChannel: selectedItem});
        
    };

    add = () => {
        microsoftTeams.tasks.submitTask(this.state.selectedChannel);
    };

    cancel = () => {
        microsoftTeams.tasks.submitTask();
    };

    // renders the component
    render() {
        let inputItems = this.state.channels.map((value:any, index: number) => {
            return { header: value.displayName, key: value.id, data: value }
        });
        return (
            <div className="page" style={{padding: "20px", display: "flex", flexDirection: "column", height: "100vh"}}>
                <Flex gap="gap.small" style={{width: "100%"}}>
                    <Dropdown
                        items={inputItems}
                        placeholder="Select a channel"
                        checkable
                        fluid 
                        inverted
                        onChange={this.selectionChanged.bind(this)}/>
                </Flex>
                <Flex style={{ flex: 1 }}></Flex>
                <Divider /> 
                <Flex hAlign="end" gap="gap.small">
                    <Button content="Add" onClick={() => this.add()}></Button>
                    <Button content="Cancel" onClick={() => this.cancel()}></Button>
                </Flex>
            </div>
        );
    }
}

export default AddChannelModal;