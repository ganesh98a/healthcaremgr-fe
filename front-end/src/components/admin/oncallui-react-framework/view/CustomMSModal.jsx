import React, { Component } from 'react';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import settings from '@salesforce/design-system-react/lib/components/settings';
import { MsalProvider } from "@azure/msal-react";
import {CreateOrUpdateMeetingInvite} from '../../recruitment/azure_graph_ms_invite/MsCreateCommon';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../../admin/oncallui-react-framework/services/ms_azure_service/authConfig";
const msalInstance = new PublicClientApplication(msalConfig);

settings.setAppElement('#root');

class CustomMSModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            open_modal: false
        }
    }

    setModal(status) {
        this.setState({open_modal: status});
        this.props.setModal(status);
    }

    render() {
        let props = this.props;
        let style = this.props.style && {...this.props.style} || {};
        return (
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <Modal
                    key="update-profile-modal"
                    id={this.props.id || false}
                    isOpen={this.props.showModal}
                    footer={[
                        <MsalProvider instance={msalInstance}> <CreateOrUpdateMeetingInvite 
                        {...this.state}
                        {...this.props} 
                        />
                    </MsalProvider>
                    ]}
                    onRequestClose={this.toggleOpen}
                    heading={props.heading || ""}
                    className="slds_custom_modal"
                    onRequestClose={() => this.setModal(false)}
                    dismissOnClickOutside={false}
                    width={props.width || "20rem"}
                    size={props.size || "small"}
                    appElement={document.getElementById('app')}
                    size={props.size || "small"}
                >
                    <div style={style} class="slds-modal__content">
                        <section style={props.sectionStyle || {overflowY: "hidden"}} class="slds-p-around_medium">
                            {this.props.children}
                        </section>
                    </div>
                </Modal>
            </IconSettings>
        );
    }
}

export default CustomMSModal;
