import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ScrollArea from "react-scrollbar";
import ApplicantAddAttachmentFrom from './ApplicantAddAttachmentFrom.js';

class ApplicantAddAttachmentModal extends Component {

    static defaultProps = {
        application: null,
    }

    constructor() {
        super();
        this.state = {
        }
    }


    render() {
        return (
            <div className={'customModal ' + (this.props.show ? ' show' : '')}>
                <div className="cstomDialog widBig" style={{maxWidth:'700px', minWidth:'700px'}}>

                    <h3 className="cstmModal_hdng1--">
                      Add  Attachments
                            <span className="closeModal icon icon-close1-ie" onClick={this.props.close}></span>
                    </h3>

                   <ApplicantAddAttachmentFrom  closeModel={this.props.close} isModelPage={true} application={this.props.application} />
                </div>
            </div>

        );
    }
}

export default ApplicantAddAttachmentModal;

