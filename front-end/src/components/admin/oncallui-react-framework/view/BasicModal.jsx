import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';

import { openModal } from '../FrameworkReducer';
import SectionContainer from '../grid/SectionContainer';

class BasicModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }

    setModal(status) {
        this.props.openModal(status);
    }

    render() {

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.showModal}
                    footer={[
                        <Button disabled={this.state.loading} label="Cancel" onClick={() => this.setModal(false)} />,
                        <Button disabled={this.state.loading} label={this.props.meta.ok_button || "Save"} variant="brand" onClick={(e) => this.props.meta.onClickOkButton(e, this.props.action_id)} />,
                    ]}
                    onRequestClose={this.toggleOpen}
                    heading={this.props.meta ? this.props.meta.title : ""}
                    size="small"
                    className="slds_custom_modal"
                    onRequestClose={() => this.setModal(false)}
                    dismissOnClickOutside={false}
                >
                    <div class="slds-modal__content">
                        <section class="slds-p-around_medium">
                            {this.props.children}
                        </section>
                    </div>
                </Modal>
            </IconSettings>
        );
    }
}

const mapStateToProps = () => ({
    
})

const mapDispatchtoProps = (dispatch) => {
    return {
        openModal: (status, loadData) => dispatch(openModal(status, loadData))
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(BasicModal);
