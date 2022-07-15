import React, { Component } from 'react';
import Select from 'react-select-plus';
import {  postData,  handleShareholderNameChange } from 'service/common.js';
import ReactTable from "react-table";
import _ from 'lodash'

import jQuery from "jquery";
import { getApplicantInfo } from './../actions/RecruitmentApplicantAction';
import { connect } from 'react-redux'
import ReactPlaceholder from 'react-placeholder';
import { custNumberLine} from 'service/CustomContentLoader.js';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../../../../config';
import { defaultSpaceInTable } from '../../../../service/custom_value_data';
import { getOptionsRecruitmentStaff } from './../action_task/CommonMethod.js'
import { checkLoginWithReturnTrueFalse, getPermission, toastMessageShow, css } from '../../../../service/common';
import { customHeading } from '../../../../service/CustomContentLoader';
import '../../scss/components/admin/recruitment/applicants/AppliedApplicantionApplicant.scss'

/**
 * 
 * @param {object} props
 * @param {string} props.recruiter
 * @param {number} props.applicant_id 
 * @param {number} props.application_id 
 * @param {object} props.permission 
 * @param {number} props.status
 * @param {(newRecruiter: string) => void} [props.onRecruiterChanged] 
 */
export const AssignStaff = ({ recruiter, application_id, applicant_id, permission, status, onRecruiterChanged=undefined, }) => {
    const [editMode, setEditMode] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [selectedRecruiter, setSelectedRecruiter] = React.useState(null)

    const handleOnClickYes = async e => {
        setIsSubmitting(true)

        try {
            const req = { 
                applicant_id, 
                application_id, 
                recruiter: (selectedRecruiter || {}).value 
            }

            const res = await postData('recruitment/RecruitmentApplicant/update_assign_recruiter', req)
            if (res.status) {
                toastMessageShow(res.msg, 's')
                if (typeof onRecruiterChanged === 'function') {
                    onRecruiterChanged((selectedRecruiter || {}).label)
                }
            } else {
                toastMessageShow(res.error, 'e')
            }

        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
            setEditMode(false)
        }
    }

    const checkRecruiterEditable = () => {
        if (!permission.access_recruitment_admin) {
            return {
                editable: false,
                reason: `${recruiter || "Not Assigned"}\n\nNote: You don't have enough permission to modify the assigned staff`
            }

        // @see Recruitment_applicant_model::get_applicant_job_application()
        // @see tbl_recruitment_applicant_applied_application.status
        } else if ([2, 3].indexOf(parseInt(status)) >= 0) { 
            return {
                editable: false,
                reason: `${recruiter || "Not Assigned"}\n\nNote: You cannot modify the assigned staff since the \napplication has already marked as rejected or completed`
            }
        } else {
            return {
                editable: true,
                reason: `${recruiter || "Not Assigned"}\nClick to select and switch recruiter`
            }
        }
    }

    const editableResult = checkRecruiterEditable()

    if (editMode && editableResult.editable) {
        return (
            <div className={`AssignStaff`}>
                <div className="s-def1 s1 mt-1">
                    <Select.Async
                        loadOptions={(e) => getOptionsRecruitmentStaff(e, [])}
                        clearable={false}
                        placeholder='Search'
                        cache={false}
                        value={!!selectedRecruiter ? selectedRecruiter : ''}
                        onChange={setSelectedRecruiter}
                    />
                </div>
                <div className="mt-1">
                    <span onClick={handleOnClickYes} className="short_buttons_01 btn_color_avaiable mr-2" disabled={isSubmitting}>Yes</span>
                    <span onClick={() => setEditMode(false)} className="short_buttons_01 btn_color_archive">No</span>
                </div>
            </div>
        )
    }

    return (
        <u onClick={() => setEditMode(true)} style={editableResult.editable ? {cursor: 'pointer'} : undefined} title={editableResult.reason}>
            {recruiter || "Not Assigned"}
        </u>
    )
}


class AppliedApplicantionApplicant extends Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            applications: [],
        }

        this.permission = (checkLoginWithReturnTrueFalse())?((getPermission() == undefined)? [] : JSON.parse(getPermission())):[];
    }

    componentWillReceiveProps(newProps) {
        if(newProps.applications){
            this.setState({applications: JSON.parse(JSON.stringify(newProps.applications)), discard_changes: false})
        }
    }
    
    discardChanges = () => {
        this.setState({applications: JSON.parse(JSON.stringify(this.props.applications)), discard_changes: false});
    }
    
    saveChanges = () => {
        if(this.state.applications.length > 0){
            this.setState({loading: true});
            postData('recruitment/RecruitmentApplicant/update_applied_application_of_application', {applications: this.state.applications, applicant_id: this.props.applicant_id}).then((result) => {
                if (result.status) {
                    this.props.getApplicantInfo(this.props.applicant_id);
                    this.setState({loading: false});
                }
            });
        }else{
            
        }
    }
    
    cloaseModel = (status, data, id) => {
        this.setState({showModel: false});

        var applications = this.state.applications;
        
        if(status){
            var state = {discard_changes: true};
            if(id){
                var index = applications.findIndex(x => x.id == id);
                applications[index] = data;
            }else{
                 applications = applications.concat([data]);
            }
           
            state['applications'] = applications;
            this.setState(state);
        }
    }

    determinePathToApplicationPage({ application_id }) {
        const { applicant_id } = this.props

        const path = ROUTER_PATH + `admin/recruitment/applicant/${applicant_id}/${parseInt(application_id)}`
        return path
    }

    determinePathToApplicationDetailsPage({ application_id }) {
        const { applicant_id } = this.props

        const path = ROUTER_PATH + `admin/recruitment/application_details/${applicant_id}/${parseInt(application_id)}`
        return path
    }

    renderAssignStaff({ original }) {
        const { applicant_id, id: application_id, recruiter_fullname, status } = original

        return (
            <AssignStaff
                permission={this.permission}
                status={status}
                applicant_id={applicant_id}
                application_id={application_id}
                onRecruiterChanged={() => this.props.getApplicantInfo(applicant_id)} // refresh all applicant details (including applications)
                recruiter={recruiter_fullname}
            />
        )
    }

    getScreeningStatus(status){
        let screening_status= '' ;
        
        if(status == '0'){
            screening_status = 'Yet to compelete';
        }else if(status == '1'){
            screening_status = 'In progress';
        }else if(status > '1'){
            screening_status = 'Completed';
        }
        return screening_status;
    }

    render() {
        var applications = this.state.applications.length> 0 ? this.state.applications.filter((s, sidx) => s.remove !== true) : [];

        return (
            <React.Fragment>
                <div className="col-xs-12" id={`AppliedApplicantionApplicant`}>
                     <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(4)} ready={!this.props.info_loading}>
                    <div className="d-flex mt-3 justify-content-between">
                        <h3 className="align-self-center"><strong>Applications</strong></h3>
                    </div>


                    {/* <div className="data_table_cmn dataTab_accrdn_cmn tbl_flx2 header_center tble_2_clr mt-3 currAPli_tble tbl_fnt_sm"> */}
                    <div className="Req-Applicant-info_tBL mt-3">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-2_tBL line_space_tBL H-Set_tBL">
                       
                        <ReactTable
                            columns={[
                                {
                                    accessor: 'id',
                                    Header: () => <div className="ellipsis_line1__ text-center">Application ID</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => <span>{props.value}</span>
                                },
                                {
                                    Header: () => <div className='ellipsis_line1__ text-center'>Position Applied</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    accessor: "position_applied",
                                    Cell: props => <span title={props.value}>{props.value}</span>
                                },
                                {
                                    accessor: p => _.get(p, 'job_details.job_category_label'),
                                    id: 'job_category_label',
                                    Header: () => <div className='ellipsis_line1__ text-center'>Job category</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => <span>{props.value}</span>
                                },
                                {
                                    accessor: p => _.get(p, 'job_details.job_sub_category_label'),
                                    id: 'job_sub_category_label',
                                    Header: () => <div className='ellipsis_line1__ text-center'>Job sub-category</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => <span>{props.value}</span>
                                },
                                {
                                    Header: () => <div className='ellipsis_line1__ text-center'>Applied through</div>,
                                    accessor: "channel",
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => <span>{props.value}</span>
                                },
                                {
                                    Header: () => <div className='ellipsis_line1__ text-center'>Employment Type</div>,
                                    className: '_align_c__',
                                    accessor: "employement_type",
                                    sortable: false,
                                    Cell: props => <span>{props.value}</span>
                                },  
                                {
                                    accessor: "process_status_label",
                                    Header: () => <div className='ellipsis_line1__ text-center'>Application Status</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => <span>{props.value}</span>
                                },                               
                                {
                                    accessor: "application_process_status",
                                    Header: () => <div className='ellipsis_line1__ text-center'>Screening Status</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => <span>{defaultSpaceInTable(this.getScreeningStatus(props.value))}</span>
                                },                                
                                {
                                    accessor: "recruiter_fullname",
                                    Header: () => <div className='ellipsis_line1__ text-center'>Owner</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => this.renderAssignStaff(props)
                                },
                                // {
                                //     Header: () => <div className='ellipsis_line1__ text-center'>Actions</div>,
                                //     className: '_align_c__',
                                //     sortable: false,
                                //     Cell: props => {
                                //         return (
                                //             <span>
                                //                 <Link to={this.determinePathToApplicationPage({ application_id: props.original.id })} className={`default-underlined`}>
                                //                     View application
                                //                 </Link>                                                
                                //             </span>
                                //         )
                                //     }
                                // },
                                {
                                    Header: () => <div className='ellipsis_line1__ text-center'>Actions</div>,
                                    className: '_align_c__',
                                    sortable: false,
                                    Cell: props => {
                                        return (
                                            <span>
                                                <Link to={this.determinePathToApplicationDetailsPage({ application_id: props.original.id })} className={`default-underlined`}>
                                                    View application
                                                </Link>                                               
                                            </span>
                                        )
                                    }
                                },
                                // {
                                //     Header: "Application Channel",
                                //     accessor: "channel",
                                //     className: '_align_c__',
                                //     Cell: (props) => {
                                //         return (
                                //             <span className="Current_apl_tr_td_last">
                                //                 <div>{props.value}</div>
                                //                 {this.props.applicant_status == 1 ? <i className="icon icon icon-views" onClick={() => this.setState({ showModel: true, editData: props.original })}></i> : ''}
                                //                 {
                                //                     this.props.applicant_status == 1 && (
                                //                         <Link to={this.determinePathToApplicationPage({ application_id: props.original.id })}>
                                //                             <i className="icon icon-view1-ie" style={{ fontSize: 20, display: 'inline-block', lineHeight: 21, verticalAlign: 'middle', color: '#1ca177' }}></i>
                                //                         </Link>
                                //                     )
                                //                 }
                                //                 {/* {applications.length > 1 && this.props.applicant_status == 1? <i className="icon icon-remove2-ie" onClick={(e) => {handleShareholderNameChange(this, 'applications', props.index, 'remove', true); this.setState({discard_changes: true})}}></i>: ''} */}

                                //             </span>
                                //         )
                                //     }
                                // },
                            ]}
                            defaultPageSize={3}
                            data={applications}
                            pageSize={applications.length}
                            showPagination={false}
                            className="-striped -highlight"

                            // highlight row if application IDs match with the ones in URL
                            getTrProps={(state, rowInfo, column) => {
                                const application_id = _.get(rowInfo, 'original.id', null)
                                const selected_application_id = _.get(this.props, 'application.id', null)

                                if (application_id && parseInt(application_id) === parseInt(selected_application_id)) {
                                    return {
                                        style: {
                                            backgroundColor: '#cceeff',
                                        }
                                    }
                                }

                                return {}
                            }}
                        />
                        
                    </div>
                    </div>
                    </ReactPlaceholder>
                    <div className="d-flex mt-3 justify-content-end">
                        {this.state.discard_changes? <button disabled={this.state.loading} onClick={this.discardChanges} className="btn cmn-btn1 mr-2" style={{background:"red"}}>Discard Changes</button> : ''}
                        {this.state.discard_changes? <button disabled={this.state.loading} className="btn cmn-btn1" onClick={this.saveChanges}>Save Changes</button>: ''}
                    </div>
                </div>
                
                {this.state.showModel?<AddEditAppliedApplicantion closeModel={this.cloaseModel} editData={this.state.editData} showModel={this.state.showModel}/>:''}

            </React.Fragment >
        );
    }
}

const mapStateToProps = state => ({
    status: state.RecruitmentApplicantReducer.details.status,
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    applicant_status :state.RecruitmentApplicantReducer.details.status,
    applications: state.RecruitmentApplicantReducer.applications,
    info_loading: state.RecruitmentApplicantReducer.info_loading,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantInfo: (applicant_id) => dispach(getApplicantInfo(applicant_id)),
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(AppliedApplicantionApplicant);
    
class AddEditAppliedApplicantion extends Component {

    constructor() {
        super();
        this.state = {
            
        }
        this.validator = jQuery('#applicationId').validate();
    }
    
    getDropdownOption = () => {
        postData('recruitment/RecruitmentApplicant/get_applicant_applicant_option', {}).then((result) => {
                if (result.status) {
                    this.setState(result.data);
                }
        });
    }

    componentDidMount() {
        this.getDropdownOption();
        if(this.props.editData){
            this.setState(this.props.editData)
        }
    }
    
    handleChange = (value, fieldName) => {
        var state = {};
        state[fieldName] = value;
        this.setState(state, () => {
            if(this.validator){
                jQuery('#applicationId').valid();
            }
        });
    }
    
    onSubmit = (e) => {
        e.preventDefault();
        var mainState = {position_applied_id: this.state.position_applied_id, recruitment_area_id: this.state.recruitment_area_id, employement_type_id: this.state.employement_type_id, channel_id: this.state.channel_id};
        
        jQuery('#applicationId').validate();
        if(jQuery('#applicationId').valid()){
            
            var jobPositions =  this.state.jobPositions;
            var index = jobPositions.findIndex(x => x.value == this.state.position_applied_id);
            mainState['position_applied'] = jobPositions[index]['label'];

            var recruitmentAreas = this.state.recruitmentAreas; 
            var index = recruitmentAreas.findIndex(x => x.value == this.state.recruitment_area_id);
            mainState['recruitment_area'] = recruitmentAreas[index]['label'];

            var employmentTypes = this.state.employmentTypes;
            var index = employmentTypes.findIndex(x => x.value == this.state.employement_type_id);
            mainState['employement_type'] = employmentTypes[index]['label'];

            var index = this.state.channels.findIndex(x => x.value == this.state.channel_id);
            mainState['channel'] = this.state.channels[index]['label'];
            mainState['id'] = this.state.id;
            
            this.props.closeModel(true, mainState, this.state.id);
        }else{
            this.validator = true;
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className={'customModal ' + (this.props.showModel ? ' show' : '')}>
                <div className="cstomDialog widBig" style={{width:' 800px', minWidth: '800px'}}>

                    <h3 className="cstmModal_hdng1--">
                        Edit Application
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.props.closeModel(false)}></span>
                    </h3>

                    <form method="post" id="applicationId">
                        <div className='row pd_lf_15 mr_tb_20 d-flex justify-content-center flexWrap' >
                            <div className='col-md-12 col-xs-12'>
                                <div className='row '>
                                    <div className="col-sm-5">
                                        <div className="csform-group">
                                            <label className="pd_l_15">Position Applied:</label>
                                            <span className="required">
                                            <Select name="participant_assessment"
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    options={this.state.jobPositions}
                                                    value={this.state.position_applied_id}
                                                    onChange={(e) => this.handleChange( e, 'position_applied_id')}
                                                    className={'custom_select default_validation'}
                                                    inputRenderer={() => <input type="text"  className="define_input" name={"position_applied_id"} required={true} value={this.state.position_applied_id || ''} />}
                                                />
                                                </span>
                                        </div>
                                    </div>

                                    <div className="col-sm-5">
                                        <div className="csform-group">
                                            <label className="pd_l_15">Recruitment Area:</label>
                                            <span className="required">
                                            <Select name="participant_assessment"
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    options={this.state.recruitmentAreas}
                                                    value={this.state.recruitment_area_id}
                                                    onChange={(e) => this.handleChange( e, 'recruitment_area_id')}
                                                    className={'custom_select default_validation'} 
                                                    inputRenderer={() => <input type="text" className="define_input" name={"recruitment_area_id"} required={true} value={this.state.recruitment_area_id || ''} />}
                                                />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-sm-5">
                                        <div className="csform-group">
                                            <label className="pd_l_15">Employment Type:</label>
                                            <span className="required">
                                            <Select name="participant_assessment"
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    options={this.state.employmentTypes}
                                                    value={this.state.employement_type_id}
                                                    onChange={(e) => this.handleChange( e, 'employement_type_id')}
                                                    className={'custom_select default_validation'} 
                                                    inputRenderer={() => <input type="text" className="define_input" name={"employement_type_id"} required={true} value={this.state.employement_type_id || ''} />}
                                                />
                                                </span>
                                        </div>
                                    </div>

                                    <div className="col-sm-5">
                                        <div className="csform-group">
                                            <label className="pd_l_15">Application Channel:</label>
                                            <span className="required">
                                            <Select name="participant_assessment"
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    options={this.state.channels}
                                                    value={this.state.channel_id}
                                                    onChange={(e) => this.handleChange( e, 'channel_id')}
                                                    className={'custom_select default_validation'} 
                                                    inputRenderer={() => <input type="text" className="define_input" name={"channel_id"} required={true} value={this.state.channel_id || ''} />}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="row trnMod_Foot__ disFoot1__">
                            <div className="col-sm-12 no-pad text-right">
                                <button type="submit" onClick={this.onSubmit} className="btn cmn-btn1 create_quesBtn">Save Changes</button>
                            </div>
                        </div>
                    </form>


                </div>
            </div>
            </React.Fragment >
        );
    }
}    
    
    