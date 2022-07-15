import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import 'react-table/react-table.css';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, getJwtToken, postData, postDataDownload, reFreashReactTable, postImageData } from '../../../../../service/common.js';
import { AssistanceCheckbox, MobilityCheckbox, CognitiveLevel, LanguageCheckbox, communicationDropdown } from '../../../../../dropdown/CrmDropdown.js';
import { ROUTER_PATH } from '../../../../../config.js';
import { AllUpdates } from './ParticipantAllUpdates';
import Modal from 'react-bootstrap/lib/Modal';
import ReactPlaceholder from 'react-placeholder';
import { LeftManubar, ParticipantAbilityLoding, FmsId } from '../../../../../service/CrmLoader.js';
import jQuery from "jquery";
import { ToastContainer, toast } from 'react-toastify';
import CrmPage from '../../CrmPage';
import ScrollArea from "react-scrollbar";
import { ToastUndo } from 'service/ToastUndo.js'
import { connect } from 'react-redux'
const status = ['No', 'Yes'];
class Participantability extends Component {
    constructor(props, context) {
        super(props, context);
        this.participantDetailsRef = React.createRef();
        this.state = {
            details: { require_assistance: [], require_mobility: [], languages_spoken: [], disability_docs: [], ability_docs: [], cognitive_level: '', communication: '' }, selectedFile: [],
            participant_id: '',
            showModal: false,
            show: false,
            ParticipantRequirement: [],
            selectedFile: [], docsTitle: '',
            percent: '',
            disabled: false

        };


    }
    showModal = () => { this.setState({ showModal: true }) }
    closeModal = () => { this.setState({ showModal: false }) }

    showModal_PE = (id) => {
        if (id == "AllupdateModalShow") {
            var str = { participantId: this.state.participant_id, };
            this.notes_list(str);
            this.getAllStages();
        }

        let state = {};
        state[id] = true;

        this.setState(state)
    }
    closeModal_PE = (id) => {
        let state = {};
        state[id] = false;

        this.setState(state)
    }
    notes_list = (str) => {

        postData('crm/CrmParticipant/latest_updates', str).then((result) => {
            if (result.data.length > 0) {

                this.setState({ allupdates: result.data });
            }
        })
    }
    getAllStages = () => {
        let stage_name = '';
        this.setState({ loading: true }, () => {
            var intakeStr = "{}";
            postData('crm/CrmStage/get_all_stage', intakeStr).then((result) => {

                if (result.status) {
                    this.setState({ stage_info: result.data, stage_dropdown: result.stage });
                }
                this.setState({ loading: false });
            });
        });
    }
    getLatestSage = () => {
        let latestStage = '';

        var intakeStr = JSON.stringify({ crm_participant_id: this.props.props.match.params.id });
        postData('crm/CrmStage/get_latest_stage', intakeStr).then((result) => {

            if (result.status) {
                this.setState({ latestDate: result.data.latest_date, latestStage: result.data[0].latest_stage_name, latestStageStates: result.data[0].latest_stage, booking_status: result.data.booking_status, fund_lock: result.locked });
            }
            this.setState({ loading: false });
        });

    }
    componentWillMount() {
        this.setState({ participant_id: this.props.props.match.params.id });
        this.getParticipantAllDetails();
        this.getLatestSage();
        this.getAllStages();
        this.getIntakePercentage();
        this.getDropdowns();
    }

    getDropdowns = () => {
      postData('crm/CrmParticipant/get_participant_dropdown_list', []).then((result) => {
        if (result.status) {
          this.setState({
            cognitive_level: result.data.cognitive_level,
            communicationOpts: result.data.communication_type,
            living_situation: result.data.living_situation,
            marital_status: result.data.marital_status,
            relations_participant: result.data.relations_participant,
            suburbState: result.data.state,
            relationOpts: result.data.relations,
            mobilityOpts: result.data.mobility,
            assistanceOpts: result.data.assistance,
            ethnicityOpts: result.data.ethnicity,
            religious_beliefs_opts: result.data.religious_beliefs,
            languagesOpts: result.data.languages
          })
        }
        this.setState({ loading: false })

      });
    }


    componentDidMount = () => {
      this.getDropdowns();
        this.participantDetailsRef.current.wrappedInstance.getParticipantDetails(this.props.props.match.params.id);
    }

    getParticipantAllDetails = () => {
        this.setState({ loading: true }, () => {
            postData('crm/CrmParticipant/get_prospective_participant_ability', { id: this.props.props.match.params.id }).then((result) => {
                if (result.status) {
                    this.setState({ details: result.data });
                }
                this.setState({ loading: false });
            });
        });
    }

    handleClose = () => {
        this.setState({ show: false, selectedFile: [], docsTitle: '', filename: '', type: '' });
    }
    handleChange = (e) => {
        var details = this.state.details;
        details[e.target.name] = ((e.target.type === 'checkbox') ? e.target.checked : e.target.value);
        this.setState({ details, disabled: false });

    }
    handleShow = (type) => {
        this.setState({ show: true, type: type });
    }

    fileChangedHandler = (event) => {
        this.setState({ selectedFile: event.target.files[0], filename: event.target.files[0].name })
    }

    handleCheckboxValue = (e) => {
        let details = this.state.details;
        let data = (details[e.target.name] != null) ? details[e.target.name] : [];
        if (data.includes(e.target.value)) {
            var index = data.indexOf(e.target.value);
            if (index != -1) {
                data.splice(index, 1);
            }
        } else {
            data.push(e.target.value);
        }
        details[e.target.name] = data;
        this.setState({ details });
    }
    selectChange = (selectedOption, fieldname) => {
        var state = this.state.details;
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;
        this.setState(state);
    }
    custom_validation = () => {
        var return_var = true;
        var state = {};
        var List = [{ key: 'cognitive_level' }, { key: 'communication' }];
        List.map((object, sidx) => {
            if (this.state.details[object.key] == null || this.state.details[object.key] == undefined || this.state.details[object.key] == '') {
                state[object.key + '_error'] = true;
                this.setState(state);
                return_var = false;
            }
        });
        return return_var;
    }
    errorShowInTooltip = ($key, msg) => {

        return (this.state[$key + '_error']) ? <div className={'tooltip custom-tooltip fade top in' + ((this.state[$key + '_error']) ? ' select-validation-error' : '')} role="tooltip">
            <div className="tooltip-arrow"></div><div className="tooltip-inner">{msg}.</div></div> : '';

    }
    submitAbilityDocs = (e) => {
        e.preventDefault();
        this.setState({ disabled: true })
        let type = this.state.type;
        this.state.details.crm_participant_id = this.state.participant_id;
        var custom_validate = this.custom_validation({ errorClass: 'tooltip-default' });
        var validator = jQuery("#ability_docs").validate({ ignore: [] });

        if (custom_validate) {
            //    var str = JSON.stringify({'data':this.state.details});
            var str = { 'data': this.state.details }
            const formData = new FormData()
            // for(var x = 0; x<this.state.selectedFile.length; x++) {
            formData.append('crmParticipantFiles[]', this.state.selectedFile)
            // }
            formData.append('crm_participant_id', this.state.participant_id)
            formData.append('type', type)
            formData.append('title', this.state.docsTitle)
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            //console.log(this.state.selectedFile.length);
            postImageData('crm/CrmParticipant/update_crm_participant_ability_docs', formData, config).then((result) => {
                if (result.status) {
                    toast.success(<ToastUndo message={'Uploaded successfully.'} showType={'s'} />, {
                        // toast.success("Updated successfully", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                    // this.setState({success: true})
                    this.setState({ disabled: true })
                    this.handleClose();
                    this.getParticipantAllDetails();
                } else {
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        //   toast.error(result.error, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                }
                this.setState({ loading: false })
                this.setState({ disabled: false })
            });


        } else {
            validator.focusInvalid();
        }
    }



    submit = (e) => {
        e.preventDefault();
        this.setState({ disabled: true })
        this.state.details.crm_participant_id = this.state.participant_id;
        var custom_validate = this.custom_validation({ errorClass: 'tooltip-default' });
        var validator = jQuery("#ability_disability").validate({ ignore: [] });

        if (!this.state.loading && jQuery("#ability_disability").valid() && custom_validate) {
            //    var str = JSON.stringify({'data':this.state.details});
            var str = { 'data': this.state.details }
            const formData = new FormData()

            formData.append('crmParticipantFiles[]', this.state.selectedFile)
            formData.append('type', 3)
            formData.append('crm_participant_id', this.state.participant_id)
            formData.append('docsTitle', this.state.docsTitle)
            formData.append('cognitive_level', this.state.details.cognitive_level)
            formData.append('linguistic_diverse', this.state.details.linguistic_diverse)
            formData.append('communication', this.state.details.communication)
            formData.append('languages_spoken', this.state.details.languages_spoken)
            formData.append('hearing_interpreter', this.state.details.hearing_interpreter)
            formData.append('language_interpreter', this.state.details.language_interpreter)
            formData.append('require_assistance', this.state.details.require_assistance)
            formData.append('require_mobility', this.state.details.require_mobility)
            formData.append('primary_fomal_diagnosis_desc', this.state.details.primary_fomal_diagnosis_desc)
            formData.append('secondary_fomal_diagnosis_desc', this.state.details.secondary_fomal_diagnosis_desc)
            formData.append('other_relevant_conformation', '')
            formData.append('legal_issues', this.state.details.legal_issues)
            formData.append('require_assistance_other', this.state.details.require_assistance_other)
            formData.append('require_mobility_other', this.state.details.require_mobility_other)
            formData.append('languages_spoken_other', this.state.details.languages_spoken_other)
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            postImageData('crm/CrmParticipant/update_crm_participant_ability_disability', formData, config).then((result) => {
                if (result.status) {
                    toast.success(<ToastUndo message={'Uploaded successfully.'} showType={'s'} />, {
                        // toast.success("Updated successfully", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                    // this.setState({success: true})
                    this.closeModal();
                    this.getParticipantAllDetails();
                } else {
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        //   toast.error(result.error, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                }
                this.setState({ loading: false })
                this.setState({ disabled: false })
            });


        } else {
            validator.focusInvalid();
        }
    }
    getIntakePercentage = (e) => {
        var intake = JSON.stringify({ crm_participant_id: this.props.props.match.params.id });
        postData('crm/CrmParticipant/get_intake_percent', intake).then((result) => {
            if (result) {
                this.setState({ percent: result });
            }
        });
    }
    viewDocuments = (filePath) => {
        let data = { crmParticipantId: this.props.props.match.params.id, path: filePath };
        postDataDownload('download/file', data, filePath);
    }




    render() {
        let now = 0;
        if (this.state.percent.length != 0) {
            now = this.state.percent.data.level;
        }

        let mobility=[];
        let assistance=[];
        //console.log(this.state.details.require_mobility);
        if(this.state.mobilityOpts !== undefined && this.state.mobilityOpts.length > 0 ){
          this.state.mobilityOpts.map((val,i) => {
            //console.log(this.state.details.require_mobility +'=='+ val.value);
            if(this.state.details.require_mobility.includes(val.value) > 0){
                mobility.push(val.label+' ');
             }
            if(val.label=='Other'){
                 mobility.push(this.state.details.require_mobility_other);
             }
          })
        }


        if(this.state.assistanceOpts !== undefined && this.state.assistanceOpts.length > 0 ){
          this.state.assistanceOpts.map((val,i) => {
            //console.log(this.state.details.require_mobility +'=='+ val.value);
            if(this.state.details.require_assistance.includes(val.value) > 0){
                assistance.push(val.label+' ');
             }
            if(val.label=='Other'){
                 assistance.push(this.state.details.require_assistance_other);
             }
          })
        }
        //console.log(mobility);



        now = (now == 0) ? 10 : now;
        // const CognitiveLevel = [
        //     { value: 'Vary Good', label: 'Vary Good' },
        //     { value: 'Good', label: 'Good' },
        //     { value: 'Fair', label: 'Fair' },
        //     { value: 'Poor', label: 'Poor' }
        // ]
        return (
            <div className="container-fluid">
                <CrmPage ref={this.participantDetailsRef} pageTypeParms={'participant_ability'} />
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <div className="py-4 bb-1">
                            <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/prospectiveparticipants'}><span className="icon icon-back1-ie"></span></Link>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12  col-md-12">
                        <div className="row d-flex py-4">
                            <div className="col-md-6 align-self-center br-1">
                                <div className="h-h1 ">
                                    {this.props.showPageTitle}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="Lates_up_1">
                                    <div className="Lates_up_a col-md-3 align-self-center">
                                        Latest
                                        Update:
                                    </div>
                                    <div className="col-md-9 justify-content-between pr-0">
                                        <div className="Lates_up_b">
                                            <div className="Lates_up_txt"><b>{(this.state.latestStage) ? this.state.latestStage : "Stage 1:NDIS Intake Participant Submission"} {(this.state.stageId != 6) ? "Information" : ""}</b></div>
                                            {/* <div className="Lates_up_btn br-1 bl-1"><i className="icon icon-view1-ie"></i><span>View Attachment</span></div> */}
                                            <div className="Lates_up_btn" onClick={() => this.showModal_PE("AllupdateModalShow")}><i className="icon icon-view1-ie"></i><span>View all Updates</span></div>
                                            <AllUpdates allupdates={this.state.allupdates} stages={(this.state.stage_info) ? this.state.stage_info : ''} onSelectDisp={(this.state.newSelectedValue) ? this.state.newSelectedValue : ''} selectedChange1={(e) => this.selectChange(e, 'view_by_status')} selectedChange={(e) => this.selectChange(e, 'assign_to')} showModal={this.state.AllupdateModalShow} handleClose={() => this.closeModal_PE("AllupdateModalShow")} />
                                        </div>
                                        <div className="Lates_up_2">
                                            <div className="Lates_up_txt2 btn-1">Date: {this.state.latestDate}</div>
                                            {/* <div className="Lates_up_time_date"> Date: 01/01/01 - 11:32AM</div> */}
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                        <div className="row"><div className="col-md-12"><div className="bt-1"></div></div></div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 mt-5">
                        <div className="progress-b1">
                            <div className="overlay_text_p01">Intake Progress  {(now) ? now : now}% Complete</div>
                            <ProgressBar className="progress-b2" now={(now) ? now : now} >
                            </ProgressBar>
                        </div>
                    </div>
                </div>

                <div className="row">


                    <div className="col-lg-12">
                        <ReactPlaceholder showLoadingAnimation type="media" ready={!this.state.loading} customPlaceholder={ParticipantAbilityLoding}>
                            <div className="row"><div className="col-md-12"><div className="bt-1 col-md-12"></div></div></div>
                            <div className="row d-flex py-2">
                                <div className="col-lg-9 col-md-8 align-self-center par_abil_title">Participant Ability</div>
                                <div className="col-lg-3 col-md-4"> <a className="btn-3" onClick={this.showModal}>Edit Participants Ability Info</a></div>
                            </div>

                            <div className="row"><div className="col-md-12"><div className="bt-1 col-md-12"></div></div></div>

                            <div className="row my-4">

                                <div className="col-lg-9 col-md-8">
                                    <div className="row d-flex flex-wrap after_before_remove">
                                        <div className="col-md-6">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Participant Cognitive Level: </strong>
                                                <span>{(this.state.details.cognitive_level) ? this.state.details.cognitive_level : 'N/A'}</span></div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Is the participant of culturally and linguistically diverse background?:  </strong>
                                                <span>{(this.state.details.linguistic_diverse) ? status[this.state.details.linguistic_diverse] : 'N/A'}</span></div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Communication:  </strong>
                                                <span>{(this.state.details.communication) ? communicationDropdown('', this.state.details.communication) : 'N/A'}</span></div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Languages Spoken:</strong>
                                                <span> {(this.state.details.languages_spoken.length > 0) ? LanguageCheckbox('', this.state.details.languages_spoken, this.state.details.languages_spoken_other) : 'N/A'}</span></div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="Partt_d1_txt_3 mt-2"><strong>Hearing impaired interpreter required?: </strong>
                                                <span> {(this.state.details.hearing_interpreter) ? status[this.state.details.hearing_interpreter] : 'N/A'}</span></div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="Partt_d1_txt_3 my-0"><strong>Language interpreter required: </strong>
                                                <span> {(this.state.details.language_interpreter) ? status[this.state.details.language_interpreter] : 'N/A'}</span></div>
                                        </div>
                                    </div>

                                    <div className="row"><div className="col-md-12 py-4"><div className="bt-1 col-md-12"></div></div></div>

                                    <div className="row d-flex flex-wrap after_before_remove">
                                        <div className="col-md-12 mb-4">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Participant Assistance Requirements: </strong> <br />

                                            <span>
                                              {assistance.length !== undefined && assistance.length > 0 ?
                                                assistance.map((val, i) => (
                                                <span key={i}>
                                                      <span>{val}</span>
                                                  </span>
                                                )) : 'N/A'
                                              }</span>

                                             {
                                                // <span>{(this.state.details.require_assistance.length > 0) ? AssistanceCheckbox('', this.state.details.require_assistance, this.state.details.require_assistance_other) : 'N/A'}</span>
                                              }
                                              </div>
                                        </div>
                                        <div className="col-md-12 mb-4">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Participant Mobility Requirements:  </strong> <br />

                                              <span>
                                                {mobility.length !== undefined && mobility.length > 0 ?
                                                  mobility.map((val, i) => (
                                                  <span key={i}>
                                                        <span>{val}</span>
                                                    </span>
                                                  )) : 'N/A'
                                                }</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="col-lg-3 col-md-4">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="par_abil_right">
                                                <div className="par_abil_right_in">
                                                    <div className="par_abil_txt"><span>Relevant Attachments:</span></div>
                                                    {this.state.details.ability_docs.map((value, idxx) => (
                                                        <div className="par_abil_1">
                                                            <a className="v-c-btn1" onClick={() => this.viewDocuments(value.filepath)}>
                                                                <span>{value.title}</span> <i className="icon icon-view1-ie"></i>
                                                            </a>
                                                        </div>
                                                    ))}
                                                    {/* <div className="par_abil_2 by-1">
                                                    <a className="v-c-btn1">
                                                        <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                                                    </a>
                                                </div> */}

                                                    <div className="par_abil_3">
                                                        <div className="upload_btn">
                                                            <label className="btn-file">
                                                                <div className="v-c-btn1" onClick={() => this.handleShow(3)}><span>Browse</span><i className="icon icon-export1-ie" aria-hidden="true"></i></div>

                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </ReactPlaceholder>

                        <ReactPlaceholder showLoadingAnimation type="media" ready={!this.state.loading} customPlaceholder={ParticipantAbilityLoding}>
                            <div className="row"><div className="col-md-12"><div className="bt-1 col-md-12"></div></div></div>
                            <div className="row d-flex py-2">
                                <div className="col-lg-9 col-md-8 align-self-center par_abil_title">Participant Disability</div>
                                {  // <div className="col-lg-3 col-md-4"> <a className="btn-3">Edit Participants Disability Info</a></div>
                                }
                            </div>
                            <div className="row"><div className="col-md-12"><div className="bt-1 col-md-12"></div></div></div>


                            <div className="row my-4">

                                <div className="col-lg-9 col-md-8">
                                    <div className="row d-flex flex-wrap">
                                        <div className="col-md-12">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Fomal Diagnosis (Primary): </strong><br />
                                                <span className="mt-2 d-block">{(this.state.details.primary_fomal_diagnosis_desc) ? this.state.details.primary_fomal_diagnosis_desc : 'N/A'}</span></div>
                                        </div>
                                        <div className="col-md-12 py-4"><div className="bt-1 col-md-12"></div></div>
                                        <div className="col-md-12">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Fomal Diagnosis (Secondary): </strong><br />
                                                <span className="mt-2 d-block">{(this.state.details.secondary_fomal_diagnosis_desc) ? this.state.details.secondary_fomal_diagnosis_desc : 'N/A'}</span></div>
                                        </div>
                                        <div className="col-md-12 py-4"><div className="bt-1 col-md-12"></div></div>
                                        <div className="col-md-12">
                                            <div className="Partt_d1_txt_3 my-2"><strong>Other relevant information: </strong><br />
                                                <span className="mt-2 d-block">{(this.state.details.other_relevant_information) ? this.state.details.other_relevant_information : 'N/A'}</span></div>
                                        </div>
                                    </div>
                                </div>


                                <div className="col-lg-3 col-md-4">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="par_abil_right">
                                                <div className="par_abil_right_in">
                                                    <div className="par_abil_txt"><span>Relevant Attachments:</span></div>
                                                    {this.state.details.disability_docs.map((value, idxx) => (
                                                        <div className="par_abil_1">
                                                            <a className="v-c-btn1" onClick={() => this.viewDocuments(value.filepath)} >
                                                                <span>{value.title}</span> <i className="icon icon-view1-ie"></i>
                                                            </a>
                                                        </div>
                                                    ))}
                                                    {/* <div className="par_abil_2 by-1">
                                                    <a className="v-c-btn1">
                                                        <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                                                    </a>
                                                </div> */}

                                                    <div className="par_abil_3">
                                                        <div className="upload_btn">
                                                            <label className="btn-file">
                                                                <div className="v-c-btn1" onClick={() => this.handleShow(4)}><span>Browse</span><i className="icon icon-export1-ie" aria-hidden="true"></i></div>

                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </ReactPlaceholder>

                        <ReactPlaceholder showLoadingAnimation type="media" ready={!this.state.loading} customPlaceholder={FmsId}>
                            <div className="row"><div className="col-md-12 py-b pt-2"><div className="bt-1 col-md-12"></div></div></div>
                            <div className="row d-flex flex-wrap">
                                <div className="col-md-4  py-4 ">
                                    <div className="Partt_d1_txt_3 my-2"><strong>Are there any legal issues that may affect services? (eg. apprehended violence order):</strong> <br />
                                        <span>{(this.state.details.legal_issues) ? status[this.state.details.legal_issues] : 'N/A'}</span></div>
                                </div>

                            </div>
                        </ReactPlaceholder>


                    </div>
                </div>

                {/* Start Modal Ability and Disability  */}
                <div className={this.state.showModal ? 'customModal show' : 'customModal'}>
                    <div className="custom-modal-dialog Information_modal py-3">
                        <div className="col-lg-12 text-left pt-3 pb-3 Popup_h_er_1 by-1">
                            <span className="color">Update Participant Details:</span>
                            <a onClick={this.closeModal} className="close_i"><i className="icon icon-cross-icons"></i></a></div>


                        <div className="clearfix"></div>
                        <form method="post" id="ability_disability">
                            <div className="custom-modal-body mx-auto w-100">
                                <div className="row mx-0 my-4">
                                    <div className="col-md-3">
                                        {this.errorShowInTooltip('cognitive_level', 'Please Select')}
                                        <label className="title_input pl-0">Participant Cognitive Level:</label>
                                        <div className="required">
                                            <div className="s-def1 s1">
                                                <Select
                                                    name="view_by_status"
                                                    options={CognitiveLevel(0)}
                                                    value={this.state.details.cognitive_level}
                                                    required={true}
                                                    name="cognitive_level"
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    placeholder="Please Select"
                                                    onChange={(e) => this.selectChange(e, 'cognitive_level')}
                                                    className={'custom_select'}

                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        {this.errorShowInTooltip('communication', 'Please Select')}
                                        <label className="title_input pl-0">Communication:</label>
                                        <div className="required">
                                            <div className="s-def1 s1">
                                                <Select
                                                    name="view_by_status"
                                                    options={communicationDropdown(0)}
                                                    required={true}
                                                    name="communication"
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    placeholder="Please Select"
                                                    onChange={(e) => this.selectChange(e, 'communication')}
                                                    value={this.state.details.communication}
                                                    className={'custom_select'}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="title_input pl-0">Hearing impaired interpreter required</label>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <label className="radio_F1">Yes
                                             <input type="radio" defaultChecked name="hearing_interpreter" onChange={this.handleChange} value={1} checked={([this.state.details.hearing_interpreter]) == 1 ? true : false} />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <label className="radio_F1">No
                                             <input type="radio" name="hearing_interpreter" onChange={this.handleChange} value={0} checked={([this.state.details.hearing_interpreter]) == 0 ? true : false} />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                </div>



                                <div className="row mb-5">
                                    <div className="col-md-6">
                                        <label className="title_input pl-0">Participant Assistance Requirements: </label>
                                        <div className="custom_scroll_set__">
                                            <div className=" cstmSCroll1 CrmScroll">
                                                <ScrollArea
                                                    speed={0.8}
                                                    className="stats_update_list"
                                                    contentClassName="content"
                                                    horizontal={false}
                                                    enableInfiniteScroll={true}
                                                    style={{ padding: "0", height: 'auto', maxHeight: '118' }}
                                                >
                                                    <div className="row">

                                                    {this.state.assistanceOpts !== undefined &&
                                                        this.state.assistanceOpts.length > 0
                                                        ? this.state.assistanceOpts.map((val, i) => (
                                                            <span key={i}>
                                                                <div className="col-md-6 mb-2">
                                                                    <label className="c-custom-checkbox CH_010">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox1"
                                                                            id={val.value}
                                                                            name="require_assistance"
                                                                            value={val.value}
                                                                            checked={
                                                                                this.state.details.require_assistance !==
                                                                                    undefined
                                                                                    ? this.state.details.require_assistance.indexOf(
                                                                                        val.value
                                                                                    ) !== -1
                                                                                        ? true
                                                                                        : false
                                                                                    : false
                                                                            }
                                                                            onChange={this.handleCheckboxValue}
                                                                            data-rule-required="true"
                                                                            data-msg-required="Participant ability Assistance is required"
                                                                        />
                                                                        <i className="c-custom-checkbox__img"></i>
                                                                        <div>{val.label}</div>
                                                                    </label>
                                                                </div>
                                                            </span>
                                                        ))
                                                        : null}

                                                        {
                                                            //console.log(this.state)

                                                            // AssistanceCheckbox(this.state.details.require_assistance).map((value, idxx) => (
                                                            //     <span key={idxx}>
                                                            //         <div className="col-md-6 mb-2">
                                                            //             <label className="c-custom-checkbox CH_010">
                                                            //                 <input type="checkbox" className="checkbox1" id={value.value} name="require_assistance" value={value.value} checked={value.checked} onChange={this.handleCheckboxValue} />
                                                            //                 <i className="c-custom-checkbox__img"></i>
                                                            //                 <div>{value.label}</div>
                                                            //             </label>
                                                            //         </div>
                                                            //     </span>
                                                            // ))
                                                        }
                                                        {
                                                            (this.state.details.require_assistance.indexOf("10") != -1) ? <div className="px_set_textarea__">
                                                                <textarea className="default-input" name="require_assistance_other" onChange={this.handleChange} value={(this.state.details.require_assistance_other) ? this.state.details.require_assistance_other : ''}></textarea>
                                                            </div> : ''
                                                        }

                                                    </div>
                                                </ScrollArea>
                                            </div>


                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="title_input pl-0">Participant Mobility Requirements: </label>
                                        <div className="custom_scroll_set__">
                                            <div className=" cstmSCroll1 CrmScroll">

                                                <ScrollArea
                                                    speed={0.8}
                                                    className="stats_update_list"
                                                    contentClassName="content"
                                                    horizontal={false}
                                                    enableInfiniteScroll={true}
                                                    style={{ padding: "0", height: 'auto', maxHeight: '118' }}
                                                >
                                                    <div className="row">
                                                    {this.state.mobilityOpts !== undefined &&
                                                        this.state.mobilityOpts.length > 0
                                                        ? this.state.mobilityOpts.map((val, i) => (
                                                            <span key={i}>
                                                            <div className="col-md-6 mb-2">
                                                                <label className="c-custom-checkbox CH_010">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox1"
                                                                            id={val.value}
                                                                            name="require_mobility"
                                                                            value={val.value}
                                                                            checked={
                                                                                this.state.details.require_mobility !== undefined
                                                                                    ? this.state.details.require_mobility.indexOf(
                                                                                        val.value
                                                                                    ) !== -1
                                                                                        ? true
                                                                                        : false
                                                                                    : false
                                                                            }
                                                                            onChange={this.handleCheckboxValue}
                                                                            data-rule-required="true"
                                                                            data-msg-required="Participant ability Mobility is required"
                                                                        />
                                                                        <i className="c-custom-checkbox__img"></i>
                                                                        <div>{val.label}</div>
                                                                    </label>
                                                                </div>
                                                            </span>
                                                        ))
                                                        : null}
                                                        {


                                                            // MobilityCheckbox(this.state.details.require_mobility).map((value, idxx) => (
                                                            //     <span key={idxx}>
                                                            //         <div className="col-md-12 mb-2">
                                                            //             <label className="c-custom-checkbox CH_010">
                                                            //                 <input type="checkbox" className="checkbox1" id={value.value} name="require_mobility" value={value.value} checked={value.checked} onChange={this.handleCheckboxValue} />
                                                            //                 <i className="c-custom-checkbox__img"></i>
                                                            //                 <div>{value.label}</div>
                                                            //             </label>
                                                            //         </div>
                                                            //     </span>
                                                            // ))
                                                        }
                                                        {
                                                            (this.state.details.require_mobility.indexOf("4") != -1) ? <div className="px_set_textarea__">
                                                                <textarea className="default-input" name="require_mobility_other" onChange={this.handleChange} value={(this.state.details.require_mobility_other) ? this.state.details.require_mobility_other : ''}></textarea>
                                                            </div> : ''
                                                        }
                                                    </div>
                                                </ScrollArea>

                                            </div>
                                        </div>
                                    </div>

                                </div>



                                <div className="row mx-0 py-4">
                                    <div className="col-md-3">
                                        <label className="title_input pl-0">Is the participant of<br /> culturally and linguistically<br /> diverse background?: </label>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="radio_F1">Yes
                                             <input type="radio" name="linguistic_diverse" onChange={this.handleChange} value={1} checked={([this.state.details.linguistic_diverse]) == 1 ? true : false} />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="radio_F1">No
                                             <input type="radio" name="linguistic_diverse" onChange={this.handleChange} value={0} checked={([this.state.details.linguistic_diverse]) == 0 ? true : false} />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <label className="title_input pl-0 my-4">Language interpreter required:</label>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="radio_F1">Yes
                                             <input type="radio" name="language_interpreter" onChange={this.handleChange} value={1} checked={([this.state.details.language_interpreter]) == 1 ? true : false} />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="radio_F1">No
                                             <input type="radio" name="language_interpreter" onChange={this.handleChange} value={0} checked={([this.state.details.language_interpreter]) == 0 ? true : false} />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>



                                    {([this.state.details.language_interpreter]) == 1 ? (<div className="col-md-6">
                                        <label className="title_input pl-0">Languages Spoken: </label>
                                        <div className="custom_scroll_set__">
                                            <div className=" cstmSCroll1 CrmScroll">

                                                <ScrollArea
                                                    speed={0.8}
                                                    className="stats_update_list"
                                                    contentClassName="content"
                                                    horizontal={false}
                                                    enableInfiniteScroll={true}
                                                    style={{ padding: "0", height: 'auto', maxHeight: '118px' }}
                                                >
                                                    <div className="row">
                                                        {


                                                            LanguageCheckbox(this.state.details.languages_spoken).map((value, idxx) => (
                                                                <span key={idxx}>
                                                                    <div className="col-md-6 mb-2">
                                                                        <label className="c-custom-checkbox CH_010">
                                                                            <input type="checkbox" className="checkbox1" id={value.value} name="languages_spoken" value={value.value} checked={value.checked} onChange={this.handleCheckboxValue} />
                                                                            <i className="c-custom-checkbox__img"></i>
                                                                            <div>{value.label}</div>
                                                                        </label>
                                                                    </div>
                                                                </span>
                                                            ))
                                                        }
                                                        <div className="clearfix"></div>
                                                        {
                                                            (this.state.details.languages_spoken.indexOf("11") != -1) ? <div className="px_set_textarea__">                <textarea className="default-input" name="languages_spoken_other" onChange={this.handleChange} value={(this.state.details.languages_spoken_other) ? this.state.details.languages_spoken_other : ''}></textarea>
                                                            </div> : ''
                                                        }
                                                    </div>
                                                </ScrollArea>
                                            </div>

                                        </div>
                                    </div>) : <React.Fragment />}

                                </div>


                                <div className="row bt-1 pt-5">
                                    <h3 className='pb-3'>Participant Disability</h3>
                                    <div className="col-md-6">
                                        <label className="title_input pl-0">Fomal Diagnosis (Primary): </label>
                                        <div className='w-100'>
                                            <textarea className="int_textarea w-100 textarea-max-size"
                                                data-rule-required='true' name="primary_fomal_diagnosis_desc"
                                                onChange={this.handleChange}
                                                value={this.state.details.primary_fomal_diagnosis_desc || ''}></textarea>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="title_input pl-0">Fomal Diagnosis (Secondary): </label>
                                        <div className='w-100'>
                                            <textarea className="int_textarea w-100 textarea-max-size" name="secondary_fomal_diagnosis_desc" onChange={this.handleChange} value={this.state.details.secondary_fomal_diagnosis_desc}></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="row py-5">
                                    <div className="col-md-6">
                                        <h3>Relevant Attachments:</h3>
                                        <div className="row d-flex flex-wrap align-items-center after_before_remove">
                                            <div className="col-md-8">
                                                <ul className="file_down quali_width P_15_TB">
                                                    <li className="w-50 br_das">
                                                        <div className="text-right file_D1"><i className="icon icon-close3-ie color"></i></div>
                                                        <div className="path_file mt-0 mb-4"><b>Hearing Imparement</b></div>
                                                        <span className="icon icon-file-icons d-block"></span>
                                                        <div className="path_file">{this.state.details.docs}</div>
                                                    </li>
                                                    {/* <li className="w-50 br_das">
                                                <div className="text-right file_D1"><i className="icon icon-close3-ie color"></i></div>
                                                    <div className="path_file mt-0 mb-4"><b>Formal Diagnosis Doc</b></div>
                                                    <span className="icon icon-file-icons d-block"></span>
                                                    <div className="path_file">lgHlgHearing2earing2.png</div>
                                                </li> */}
                                                </ul>
                                            </div>
                                            <div className="col-md-4">
                                                <a className="v-c-btn1" onClick={() => this.handleShow(3)}>
                                                    <span>Browser</span> <i className="icon icon-export1-ie"></i>
                                                </a>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="title_input pl-0">Are there any legal issues that may affect services? (eg. apprehended violence order):  </label>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <label className="radio_F1">Yes
                                                <input type="radio" name="legal_issues" onChange={this.handleChange} value={1} checked={([this.state.details.legal_issues]) == 1 ? true : false} />

                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <label className="radio_F1">No
                                             <input type="radio" name="legal_issues" onChange={this.handleChange} value={0} checked={([this.state.details.legal_issues]) == 0 ? true : false} />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                            </div>
                            <div className="custom-modal-footer bt-1 mt-5">
                                <div className="row d-flex justify-content-end">
                                    <div className="col-md-3"><a className="btn-3" disabled={this.state.disabled} onClick={this.submit}>Save Change</a></div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                {/* End Modal Ability and Disability  */}


                <Modal className="modal fade Modal_A  Modal_B Crm" show={this.state.show} onHide={this.handleClose} >
                    <form id="ability_docs" method="post" autoComplete="off">
                        <Modal.Body>
                            <div className="dis_cell">
                                <div className="text text-left Popup_h_er_1"><span>Relevant Attachments:</span>
                                    <a data-dismiss="modal" aria-label="Close" className="close_i" onClick={this.handleClose}><i className="icon icon-cross-icons"></i></a>
                                </div>

                                <div className="row P_15_T">
                                    <div className="col-md-8">
                                        <div className="row P_15_T">
                                            <div className="col-md-12">
                                                <label>Title</label>
                                                <span className="required">
                                                    <input type="text" name="docsTitle" placeholder="Please Enter Your Title" onChange={(e) => this.setState({ 'docsTitle': e.target.value })} value={(this.state.docsTitle) ? this.state.docsTitle : ''} data-rule-required="true" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row P_15_T">
                                    <div className="col-md-12"> <label>Please select a file to upload</label></div>
                                    <div className="col-md-5">
                                        <span className="required upload_btn">
                                            <label className="btn btn-default btn-sm center-block btn-file">
                                                <i className="but" aria-hidden="true">Upload New Doc(s)</i>
                                                <input className="p-hidden" type="file" name="special_agreement_file" onChange={this.fileChangedHandler} data-rule-required="true" date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf" />
                                            </label>
                                        </span>
                                        <p>File Name: <small>{this.state.filename}</small></p>

                                    </div>
                                    <div className="col-md-7"></div>
                                </div>

                                <div className="row">
                                    <div className="col-md-7"></div>
                                    <div className="col-md-5">
                                        <a className="btn-1" onClick={this.handleClose} disabled={this.state.disabled} >Save</a>
                                    </div>
                                </div>

                            </div>
                        </Modal.Body>
                    </form>
                </Modal>
                <Modal className="modal fade Modal_A  Modal_B Crm" show={this.state.show} onHide={this.handleClose} >
                    <form id="disability_docs" method="post" autoComplete="off">
                        <Modal.Body>
                            <div className="dis_cell">
                                <div className="text text-left Popup_h_er_1"><span>Relevant Attachments:</span>
                                    <a data-dismiss="modal" aria-label="Close" className="close_i" onClick={this.handleClose}><i className="icon icon-cross-icons"></i></a>
                                </div>

                                <div className="row P_15_T">
                                    <div className="col-md-8">
                                        <div className="row P_15_T">
                                            <div className="col-md-12">
                                                <label>Title</label>
                                                <span className="required">
                                                    <input type="text" name="docsTitle" placeholder="Please Enter Your Title" onChange={(e) => this.setState({ 'docsTitle': e.target.value })} value={(this.state.docsTitle) ? this.state.docsTitle : ''} data-rule-required="true" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row P_15_T">
                                    <div className="col-md-12"> <label>Please select a file to upload</label></div>
                                    <div className="col-md-5">
                                        <span className="required upload_btn">
                                            <label className="btn btn-default btn-sm center-block btn-file">
                                                <i className="but" aria-hidden="true">Upload New Doc(s)</i>
                                                <input className="p-hidden" type="file" name="special_agreement_file" onChange={this.fileChangedHandler} data-rule-required="true" date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf" />
                                            </label>
                                        </span>
                                        <p>File Name: <small>{this.state.filename}</small></p>

                                    </div>
                                    <div className="col-md-7"></div>
                                </div>

                                <div className="row">
                                    <div className="col-md-7"></div>
                                    <div className="col-md-5">
                                        <a className="btn-1" onClick={this.submitAbilityDocs} disabled={this.state.disabled}>Save</a>
                                    </div>
                                </div>

                            </div>
                        </Modal.Body>
                    </form>
                </Modal>


            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType,

    }
};
export default connect(mapStateToProps)(Participantability);
