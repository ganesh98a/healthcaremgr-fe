import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { Modal, Button, IconSettings, Icon, ExpandableSection, Popover, Badge } from '@salesforce/design-system-react'
import _ from "lodash";

/**
 * Class: NotifyError
 */
class NotifyError extends Component {
    constructor(props) {
        super(props);
        // Initialize state
        this.state = {
            loading: false,
            error_data: {},
        }
    }

    /**
     * Render Erro List
     */
    renderErrorData = () => {
        let errorData = this.props.errorData;
        if (!errorData || _.isEmpty(errorData)) {
            return (<React.Fragment />);
        }
        return errorData.map((item, index) => {
            let rows = item.rows.join(', ');
            let list = [];
            let Option = <React.Gragment />;
            let itemOption = item.options || '';
            if (itemOption ) {                
                itemOption.map((values) => {
                    list.push(
                        <div className="row p-1">
                            <span className="">
                                {values}
                            </span>
                        </div>
                    );
                });
                if (list.length > 0) 
                {
                    Option = (
                        <Popover
                            body={list}
                            heading="Options"
                            id="popover-heading"
                            align="top left"
                            className="document_mandatory_popover"
                        >
                            <Button
                                iconCategory="utility"
                                iconName="list"
                                iconPosition="left"
                                label="Options"
                            />
                        </Popover>
                    );
                }
            }
            return (
                <ExpandableSection
                    title={item.header}
                >   
                
                    <div  className="mt-1 mb-1">Error - {item.error}</div>
                    { list && list.length > 0 ? <div className="mt-1 mb-1">Valid Options - {Option}</div> : <React.Fragment /> }                    
                    <div>Rows - {rows}</div>
                </ExpandableSection>
            );
        });
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        disableClose
                        prompt="error"
                        size="medium"
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Got it" onClick={() => this.props.closeModal(false)} />,
                        ]}
                        className={'modal_headet_txt-col'}
                        title={"Import Error"}
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <div className="slds-m-around_medium">
                                    File import is unsuccessful. Please check the below listed column values in the mentioned row.
                                </div>
                                {this.renderErrorData()}
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default NotifyError;
