import React, { Component } from 'react';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import settings from '@salesforce/design-system-react/lib/components/settings';

settings.setAppElement('#root');
/**
 * @example
 * <CustomModal
        title="title of modal"
        showModal={this.state.show_modal}
        setModal={status => this.setState({ show_modal: status })}
        size="small"
        onClickOkButton={(e) => { return false }}
        width="200px"
        style={{ minHeight: "200px", overFlowY: "hidden" }}
        loading={this.state.loading}
    >
    //body area
    </CustomModal>
 */
class CustomModal extends Component {

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
                        <Button disabled={this.state.loading} label={props.cancel_button || "Cancel"} onClick={() => this.setModal(false)} />,
                        !this.props.hideSaveButton && <Button disabled={this.props.loading || this.state.loading} label={props.ok_button || "Save"} variant="brand" onClick={(e) => this.props.onClickOkButton(e)} />,
                        props.footer && {...props.footer}
                    ]}
                    onRequestClose={this.toggleOpen}
                    heading={props.title || ""}
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

export default CustomModal;
