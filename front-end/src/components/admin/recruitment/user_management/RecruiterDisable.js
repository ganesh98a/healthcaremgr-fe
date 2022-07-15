import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { postData, getOptionsRecruiterList, handleShareholderNameChange, archiveALL } from 'service/common.js';
import { disabeSelOptions, recruitmentAllocationSelectionOptions } from 'dropdown/recruitmentdropdown.js';
import jQuery from "jquery";
import { ToastUndo } from 'service/ToastUndo.js'
import { toast } from 'react-toastify';
import ReactTable from "react-table";
import Scrollbar from "perfect-scrollbar-react";
import classNames from "classnames";
import "perfect-scrollbar-react/dist/style.min.css";
import { defaultSpaceInTable } from 'service/custom_value_data.js';

const requestData = (pageSize, page, sorted, filtered, staffId) => {
    return new Promise((resolve, reject) => {
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, staffId: staffId });
        postData('recruitment/RecruitmentUserManagement/get_recruiter_applicant_list', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count),
                all_count: result.all_count,
            };
            resolve(res);
        });
    });
};

const CustomTbodyComponent = props => (
    <div {...props} className={classNames("rt-tbody", props.className || [])}>
        <Scrollbar>{props.children}</Scrollbar>
    </div>
);


class RecruiterDisable extends Component {

    constructor() {
        super();
        this.state = {
            applicantList: [],
            account_allocated_type: '',
        }
    }

    fetchRecruiterApplicant = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            this.props.id,
        ).then(res => {
            this.setState({
                applicantList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false
            });
        })
    }

    checkTaskAndDisable = (e) => {
        e.preventDefault();
        // var validate = jQuery("#recruiter_disable").validate({ /* */ });
        if (jQuery("#recruiter_disable").valid()) {
            var task_count = this.state.task_cnt;
            if (task_count > 0) {
                var msg = 'Staff user will be removed from ' + task_count + ' tasks which are assigned to him, please review those tasks first before disabling';
                archiveALL(this.state, msg, 'recruitment/RecruitmentUserManagement/disable_staff').then((result) => {
                    if (result.status) {
                        this.props.closeDisModal(true);
                        toast.success(<ToastUndo message={'Staff user disabled successfully'} showType={'s'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    } else {
                        if (result.hasOwnProperty('error') || result.hasOwnProperty('msg')) {
                            let msg = (result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg : ''));
                            toast.error(<ToastUndo message={msg} showType={'e'} />, {
                                position: toast.POSITION.TOP_CENTER,
                                hideProgressBar: true
                            })
                        }
                    }
                    this.setState({ loading: false });
                })
            } else {
                this.onSubmit(e);
            }
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        //var validate = jQuery("#recruiter_disable").validate({ /* */ });
        if (jQuery("#recruiter_disable").valid()) {
            this.setState({ loading: true });
            postData('recruitment/RecruitmentUserManagement/disable_staff', this.state).then((result) => {
                if (result.status) {
                    this.props.closeDisModal(true);
                    toast.success(<ToastUndo message={'Staff disable successfully'} showType={'s'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                } else {
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
                this.setState({ loading: false });
            });
        }
    }

    componentWillMount() {
        this.setState({ staffId: this.props.id }, () => {
            this.getRecruiterAndItsTaskCount(this.state.staffId);
        });
    }

    getRecruiterAndItsTaskCount = (staffId) => {
        postData('recruitment/RecruitmentUserManagement/get_recruiter_and_its_task_count', { staffId: staffId }).then((result) => {
            if (result.status) {
                this.setState({ recruiter_count: result.data_count.recruiter_count, task_cnt: result.data_count.recruiter_task_count }, () => {

                });
            }
        });
    }




    render() {

        return (
            <div className={'customModal ' + (this.props.showDisModal ? ' show' : '')}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        Disable User
                            <span className="closeModal icon icon-close1-ie" onClick={this.props.closeDisModal}></span>
                    </h3>

                    <form id="recruiter_disable">
                        <div className='row justify-content-center d-flex'>
                            <div className='col-md-12 '>

                                <div className='row mr_tb_20'>
                                    <div className='col-sm-12'>
                                        <div className="csform-group">
                                            <label className='bg_labs2 mr_b_20'>Disable <strong>{this.props.name}</strong> account:</label>
                                          
                                            <div className="cmn_select_dv vldtn_slct" style={{ width: '250px' }}>
                                            <span className="required">
                                                <Select name="disable "
                                                    simpleValue={true}
                                                    searchable={false} clearable={false}
                                                    placeholder="Select Type"
                                                    options={disabeSelOptions()}
                                                    onChange={(e) => this.setState({ disable_account: e })}
                                                    value={this.state.disable_account || ''}
                                                    inputRenderer={() => <input type="text" className="define_input" name={"disable_account"} required={true} value={this.state.disable_account || ''} readOnly />}
                                                />
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mr_tb_20'>
                                    <div className='col-sm-12'>
                                        <div className="csform-group">
                                            <label className='bg_labs2'><b>Account Allocations:</b></label>
                                            <p className='mr_b_20'>Where would you like to Re-allocate all recruiters current assigned Incomplete participants to:</p>
                                            <div className="cmn_select_dv vldtn_slct" style={{ width: '300px' }}>
                                            <span className="required">
                                                <Select name="account_allocation "
                                                    required={true} simpleValue={true}
                                                    searchable={false} clearable={false}
                                                    placeholder="Select Type"
                                                    options={recruitmentAllocationSelectionOptions()}
                                                    onChange={(e) => this.setState({ account_allocated_type: e })}
                                                    value={this.state.account_allocated_type || ''}
                                                    inputRenderer={() => <input type="text" className="define_input" name={"account_allocated_type"} required={true} value={this.state.account_allocated_type || ''} readOnly />}
                                                />
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row Tab_Overflow__ Req-Disable-Recruiter-tBL">
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  H-Set_tBL Remove-Margin-tBL" >

                                        <ReactTable
                                            columns={[

                                                {
                                                    Header: "Name:", accessor: "applicant_name", className: "_align_c__",
                                                    Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                                                },
                                                {
                                                    Header: "Stage:", accessor: "current_stage", className: "_align_c__",
                                                    Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                                                },
                                                {
                                                    //Header: "Allocate To",
                                                    accessor: "allocate",
                                                    headerClassName: '_align_c__ header_cnter_tabl',
                                                    Header: () =>
                                                        <div>
                                                            <div className="ellipsis_line1__">Allocate To</div>
                                                        </div>
                                                    ,
                                                    className: '_align_c__ td_Overflow',
                                                    Cell: props => {
                                                        return (
                                                            <div>
                                                                {
                                                                    (this.state.account_allocated_type && (this.state.account_allocated_type == 2 || this.state.account_allocated_type == 1)) ? (
                                                                        <span className="requireds modify_select s2">
                                                                            <div className="search_icons_right modify_select default_validation left_validation">
                                                                                <Select.Async
                                                                                    name={"form-field-name_" + props.original.id}
                                                                                    // id={"form-field-name_"+props.original.id}
                                                                                    loadOptions={(e) => getOptionsRecruiterList(e, this.state.staffId)}
                                                                                    clearable={false}
                                                                                    placeholder='Search'
                                                                                    cache={false}
                                                                                    value={props.original.allocate_to}
                                                                                    onChange={(e) => handleShareholderNameChange(this, 'applicantList', props.index, 'allocate_to', e)}
                                                                                    required={true}
                                                                                    inputProps={{ "data-placement": "left", 'id': "form-field-id_" + props.original.id }}
                                                                                    inputRenderer={(propss) => <input type="text" name={"hdn_" + props.original.id} {...propss} />}
                                                                                /></div></span>)
                                                                        :
                                                                        (<span></span>)
                                                                }

                                                            </div>
                                                        );
                                                    }
                                                }
                                            ]}

                                            defaultFiltered={{ account_allocated_type: this.state.account_allocated_type }}
                                            TbodyComponent={CustomTbodyComponent}
                                            manual="true"
                                            pages={this.state.pages}
                                            minRows={2}
                                            data={this.state.applicantList}
                                            showPagination={false}
                                            style={{
                                                minHeight: 'auto',
                                                maxHeight: "320px"
                                            }}
                                            onFetchData={this.fetchRecruiterApplicant}
                                            className="-striped -highlight"
                                        />
                                    </div>
                                </div>

                                <div className='row dashedLine_1__ mr_tb_40'></div>
                                <div className='row mr_tb_20'>
                                    <div className='col-sm-12'>
                                        <div className="csform-group">
                                            <label className='bg_labs2 mr_b_20'>Add Relevant Notes:</label>
                                            <span className="required">
                                            <textarea className="csForm_control txt_area brRad10 textarea-max-size" name="relevant_note" onChange={(e) => this.setState({ relevant_note: e.target.value })} value={this.state.relevant_note} data-rule-required="true"></textarea>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row trnMod_Foot__ disFoot1__">
                            <div className="col-sm-12 no-pad text-right">

                                {(this.state.recruiter_count == 0) ? 'Currently no recruiter is available' :
                                    <button type="submit" onClick={this.checkTaskAndDisable} className="btn cmn-btn1 create_quesBtn">Disable User</button>}

                            </div>
                        </div>

                    </form>


                </div>
            </div>

        );
    }
}

export default RecruiterDisable;

