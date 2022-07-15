import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import ScrollArea from 'react-scrollbar';

class ManageDocumentsApplicant extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    render() {
        return (
            <div className={'customModal ' + (this.props.showModal ? ' show' : '')}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        Manage Required Documents
                            <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModal}></span>
                    </h3>

                    <div className="row Manage_div_1">
                        <div className="col-md-6">
                            <div className="cstmSCroll1">
                                <ScrollArea
                                    speed={0.8}
                                    className="Options_scroll Manage_ul__popup_"
                                    contentClassName="content"
                                    horizontal={false}
                                    style={{ paddingRight: '15px' }}
                                >

                                    <div className="Manage_ul_">
                                        {this.props.all_documents.map((value, idx) => (
                                            <div className={'Manage_li_ ' + ((value.selected) ? 'step_a' : (value.assined) ? 'step_b' : '')} key={idx}> 
                                                <div className="Manage_li_a1_" onClick={(e) => this.props.enableAndSelectDocs(value, idx, !value.selected)}><span>{value.title}</span></div>
                                                <div className="Manage_li_a2_">
                                                    {value.selected && !value.assined ?
                                                        <div className="Manage_li_a2_">
                                                            <a className={'Req_btn_out_1 R_bt_co_blue mr-2' + ((value.is_required === '0') ? ' active_selected' : '')} onClick={(e) => this.props.chooseOptionalMandatory(idx, '0')}>Optional</a>
                                                            <a className={'Req_btn_out_1 R_bt_co_' + ((value.is_required === '1') ? ' active_selected' : '')} onClick={(e) => this.props.chooseOptionalMandatory(idx, '1')}>Mandatory</a>
                                                            <i className="icon icon-add2-ie Man_btn_3a" onClick={(e) => this.props.selectDocument(idx, 1)}></i>
                                                        </div> : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="cstmSCroll1">
                                <ScrollArea
                                    speed={0.8}
                                    className="Options_scroll Manage_ul__popup_"
                                    contentClassName="content"
                                    horizontal={false}
                                    style={{ paddingRight: '15px' }}
                                >
                                    <div className="Manage_ul_">
                                        {this.props.all_documents.map((value, idx) => (
                                            (value.assined) ?
                                                <div className="Manage_li_" key={idx + 2}>
                                                    <div className="Manage_li_a1_"><span>{value.title}</span></div>
                                                    <div className="Manage_li_a2_">
                                                        {(value.is_required === '0') ? <a className="Man_btn_1">Optional</a> : ''}
                                                        {(value.is_required === '1') ? <a className="Man_btn_2">Mandatory</a> : ''}
                                                        <i className="icon icon-remove2-ie Man_btn_3b" onClick={(e) => this.props.selectDocument(idx, '')}></i>
                                                    </div>
                                                </div> : ''
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-md-12">
                            <div className="bt-1"></div>
                        </div>
                    </div>

                    {(!this.props.check_documents && this.props.allow_close_docs_form) ? 'Please select atleast one Documents to continue.' : ''}

                    <div className="row">
                        <div className="col-md-12">
                            <button className="btn cmn-btn1 creat_task_btn__" onClick={(e) => this.props.SaveDocuments()}>Save Changes</button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}
export default ManageDocumentsApplicant;

