import jQuery from "jquery";
import moment from 'moment';
import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import CKEditor from "react-ckeditor-component";
import "react-datepicker/dist/react-datepicker.css";
import { Link, Redirect } from 'react-router-dom';
import Select from 'react-select-plus';
import Slider from "react-slick";
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import { handleChangeChkboxInput, handleShareholderNameChange, postData, handleChangeSelectDatepicker, archiveALL, handleDateChangeRaw, queryOptionData, postImageData, toastMessageShow } from '../../../service/common.js';
import ReactGoogleAutocomplete from './../externl_component/ReactGoogleAutocomplete';
import AddDocuments from './AddDocuments';
import QuickPreviewModal from './QuickPreviewModal';
import { connect } from 'react-redux';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import { recurringType, jobStage2DropDown } from 'dropdown/JobDropdown.js';
import SimpleBar from 'simplebar-react';
import _ from 'lodash'
import { getActiveStaffDetailData } from './actions/RecruitmentAction';
import { Editor } from '@tinymce/tinymce-react';
import { TINY_MCE_EDITOR_KEY } from "../../../config.js";
import { SLDSISODatePicker } from '../salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
/**
 * to fetch the roles as user types
 */
const getStaff = (e, data) => {
    return queryOptionData(e, "recruitment/RecruitmentTaskAction/get_recruiter_listing_for_create_task", { search: e }, 2, 1);
}
class CreateJob extends Component {

    constructor() {
        super();
        this.state = {

            Partnersettings: {
                dots: false,
                infinite: false,
                slidesToShow: 5,
                slidesToScroll: 1,
            },
            additionQuesAr: [
                { id: 1, name: 'Ques1', inpValue: '' },
                { id: 2, name: 'Ques2', inpValue: '' },
                { id: 3, name: 'Ques3', inpValue: '' },
                { id: 4, name: 'Ques4', inpValue: '' }
            ],
            quickModal: false,
            AddDocumentsModal: false,
            magageDocModal: false,
            ac1: true,
            validate: false,
            job_type: '',
            job_template: [],
            job_category: '',
            job_sub_category: '',
            title: '',
            job_position: '',
            job_employment_type: '',
            job_salary_range: '',
            all_docs_job_apply: [],
            all_docs_recruit: [],
            //check_documents: false,
            allow_close_docs_form: false,
            publish_to: [],
            activeTemplate: 1,
            is_salary_publish: false,
            is_cat_publish: false,
            is_subcat_publish: false,
            is_emptype_publish: false,
            save_success: false,
            view: 'operate',   // used to identify pop is open in create page or in listing page
            job_operation: 'create', // this page is used in 3 ways, create/Edit and Duplicate
            document_name: '',

            // @todo: Misleading state. Proper name is 'is_disabled'
            is_editable: false,  //by deafaut false means all field are editable in add and in edit mode as per Jira

            editor_read_only: true,
            job_status: 0,
            loading: false,
            job_stage: [],
            interview_job_stage_id: '',
            loadingJobQuestionForms: false,
            jobQuestionForms: [],
            form_id: null,
            job_sub_stage_id: '',
            from_date: '',
            to_date: '',
            business_unit: '',
            bu_id: null,
        }
        this.page_title = 'Create Job';
        this.baseState = this.state;
        this.editorRef = React.createRef();

        this.datepickers = {
            to_date: React.createRef(),
            from_date: React.createRef(),
        }

    }

    async fetchJobQuestionForms(params) {

        try {
            this.setState({ loadingJobQuestionForms: true })

            const res = await postData('recruitment/Recruitment_job/job_question_forms', params)
            const { data, status, form_id } = res || {}


            if (!!status) {
                this.setState({
                    jobQuestionForms: Array.isArray(data) ? data : [],
                    loadingJobQuestionForms: false,
                    form_id: !!form_id ? form_id : undefined,
                })
            } else {
                this.setState({ loadingJobQuestionForms: false })
            }

        } catch (e) {
            console.error(e)
        }
    }

    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchStaffData = (state) => {
        getActiveStaffDetailData(
            1,
        ).then(res => {
            this.setState({
                owner: res.data,
                owner_id: res.data.value
            });
        });
    }

    selectTemplate = (obj, i) => {
        this.setState({
            activeTemplate: i
        })
    }

    AddQuesInput = () => {
        const { additionQuesAr } = this.state;
        const numRows = additionQuesAr.length;
        const inpQuesObject = { id: numRows + 1, name: 'Ques' + (numRows + 1), inpValue: '' };
        additionQuesAr.push(inpQuesObject);
        this.setState({
            additionQuesAr
        })
    }

    changeQuesText = (e) => {
        const { id, value } = e.target;
        let { additionQuesAr } = this.state;
        const targetIndex = additionQuesAr.findIndex(AdQues => {
            return AdQues.id == id;
        });

        if (targetIndex !== -1) {
            additionQuesAr[targetIndex].inpValue = value;
            this.setState({ additionQuesAr });
        }
    }

    submitjobs = (e) => {
        if (e) e.preventDefault();
        var validator = jQuery("#form_create_job").validate({
            ignore: [],
            focusInvalid: true,
            invalidHandler: function (form, validator) {
                var errors = validator.numberOfInvalids();
                if (errors) {
                    var firstInvalidElement = jQuery(validator.errorList[0].element);
                    jQuery('html,body').scrollTop(firstInvalidElement.offset().top);
                }
            }
        });

        var is_validate = this.custom_validation();
        if (!jQuery("#form_create_job").valid() || !is_validate) {
            return;
        }
        //if(jQuery("#form_create_job").valid() && is_validate)
        if (!this.state.loading && jQuery("#form_create_job").valid() && is_validate) {
            this.setState({ loading: true, job_content: this.editorRef.current.getContent() }, () => {
                postData('recruitment/recruitment_job/save_job', JSON.stringify(this.state)).then((result) => {

                    if (result.status) {
                        this.setState({ loading: false });
                        toast.success(<ToastUndo message={result.msg} showType={'s'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.setState({ save_success: true });
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.setState({ loading: false });
                    }

                });
            });
        }
        else {
            this.setState({ validate: true });
            validator.focusInvalid();
        }
    }

    handleOnchangeAndvalidateSelect = (e, nameAttr) => {
        this.setState({ [nameAttr]: e }, () => {
            if (this.state.validate) {
                jQuery("#form_create_job").validate().element('input[name="' + nameAttr + '"]');
            }

            if (nameAttr == 'category') {
                this.getSeekSubCatgory();
                this.setState({ sub_category: '' })
            }
            else if (nameAttr == 'sub_category') {
                this.getSeekQuestionByCatgorySubcat();
            } else if(nameAttr == 'bu_id') {
                this.fetchJobQuestionForms({ jobId: _.get(this.props, 'props.match.params.jobId', null), bu_id: this.state.bu_id })
            }
        });
    }

    custom_validation = () => {
        var return_var = true;
        var state = {};

        if (this.state['job_content'] == undefined || this.state['job_content'] == '') {
            state['job_content' + '_error'] = true;
            this.setState(state);
            return_var = false;
        }
        return return_var;
    }

    onChangeEditor = (evt) => {
        var newContent = evt.editor.getData();
        this.setState({
            job_content: newContent, job_content_error: false
        })
    }

    errorShowInTooltip = ($key, msg) => {
        return (this.state[$key + '_error']) ? <div className={'tooltip custom-tooltip fade top in' + ((this.state[$key + '_error']) ? ' select-validation-error' : '')} role="tooltip">
            <div className="tooltip-arrow"></div><div className="tooltip-inner">{msg}.</div></div> : '';
    }

    //
    componentWillMount() {
        if (this.props.props.match.params.jobType !== 'E') {
            this.getRequiredJobDocuments();
            this.getRequiredRecruitDocuments();
        }
        this.getJobMasterList();
        this.getJobChannels();
        this.getJobStage();
        this.fetchStaffData();
    }

    componentDidMount() {
        if (this.props.props.match.params.jobType == 'D')
            this.page_title = 'Duplicate Job';
        else if (this.props.props.match.params.jobType == 'E')
            this.page_title = 'Edit Job';

        document.title = this.page_title;

        if (this.props.props.match.params.jobId != '' && typeof this.props.props.match.params.jobId != 'undefined') {
            if (this.props.props.match.params.jobType == 'E' || this.props.props.match.params.jobType == 'D') {
                this.setState({ job_operation: this.props.props.match.params.jobType, job_id: this.props.props.match.params.jobId }, () => {
                    this.getJobDetail(this.props.props.match.params.jobId);
                })
            } else {
                this.setState({ save_success: true });
                //if request other then duplicate and edit page will move to job listing
            }
        }

        this.fetchJobQuestionForms({ jobId: _.get(this.props, 'props.match.params.jobId', null), bu_id: this.state.bu_id })
    }


    getJobDetail = (jobId) => {
        postData('recruitment/recruitment_job/get_job_detail', { jobId: jobId }).then((result) => {

            if (result.status) {
                this.setState({
                    type: result.data.parentState.type,
                    category: result.data.parentState.category,
                    sub_category: result.data.parentState.sub_category,
                    position: result.data.parentState.position,
                    title: result.data.parentState.title,
                    employment_type: result.data.parentState.employment_type,
                    salary_range: result.data.parentState.salary_range,
                    is_salary_publish: result.data.parentState.is_salary_publish,
                    is_cat_publish: result.data.parentState.is_cat_publish,
                    is_subcat_publish: result.data.parentState.is_subcat_publish,
                    is_emptype_publish: result.data.parentState.is_emptype_publish,
                    phone: result.data.parentState.phone,
                    email: result.data.parentState.email,
                    website: result.data.parentState.website,
                    job_location: result.data.parentState.complete_address.formatted_address,
                    activeTemplate: result.data.parentState.activeTemplate,
                    job_content: result.data.parentState.job_content,
                    //check_documents: true,
                    all_docs_job_apply: result.data.parentState.all_docs_job_apply,
                    all_docs_recruit: result.data.parentState.all_docs_recruit,
                    job_sub_category: result.data.parentState.job_sub_category,
                    publish_to: result.data.parentState.publish_to,
                    complete_address: result.data.parentState.google_response,
                    job_location_id: result.data.parentState.job_location_id,
                    from_date: this.props.props.match.params.jobType == 'D' ? null : new Date(result.data.parentState.from_date),
                    to_date: this.props.props.match.params.jobType == 'D' ? null : new Date(result.data.parentState.to_date),
                    is_recurring: result.data.parentState.is_recurring,
                    recurring_type: result.data.parentState.recurring_type,
                    job_status: result.data.parentState.job_status,
                    interview_job_stage_id: result.data.parentState.interview_stage.interview_job_stage_id,
                    job_sub_stage_id: result.data.parentState.interview_stage.job_sub_stage_id,
                    individual_interview_count: result.data.parentState.individual_interview_count,
                    owner_id: result.data.parentState.owner_id,
                    owner: result.data.parentState.owner_id ? result.data.parentState.owner : '',
                    bu_id: result.data.parentState.bu_id ? result.data.parentState.bu_id : ''
                }, () => {                    
                    if (this.state.job_status == 2) { //|| this.state.job_status == 5 this.state.job_status == 3 ||
                        this.setState({ is_editable: true });
                        if (this.state.job_status == 2)
                            this.setState({ editor_read_only: false });
                    }
                    if (this.props.props.match.params.jobType == 'D')
                        this.setState({ is_editable: false, editor_read_only: true });

                    this.getSeekSubCatgory();
                });
            } else {
                this.setState({ save_success: true });
                //if requested job id is not exist in DB then page will move to job listing
            }
        });
    }

    getJobMasterList = () => {
        postData('recruitment/recruitment_job/get_job_master_list', {}).then((result) => {
            if (result.status) {
                this.setState({
                    job_category: result.data.category,
                    job_employment_type: result.data.employmentType,
                    job_salary_range: result.data.salaryRange,
                    job_type: result.data.jobType,
                    job_template: result.data.jobTemplate,
                    business_unit_options : result.data.business_unit_options,
                    bu_id: result.data.bu_id,
                    is_super_admin: result.data.is_super_admin
                }, () => { });
            }
        });
    }

    getRequiredJobDocuments = () => {
        postData('recruitment/recruitment_job/get_req_documents_job_apply', {}).then((result) => {
            if (result.status) {
                this.setState({
                    all_docs_job_apply: result.data,
                }, () => { });
            }
        });
    }

    getRequiredRecruitDocuments = () => {
        postData('recruitment/recruitment_job/get_req_documents_recruit_stages', {}).then((result) => {
            if (result.status) {
                this.setState({
                    all_docs_recruit: result.data,
                }, () => { });
            }
        });
    }

    getSeekSubCatgory = () => {
        postData('recruitment/recruitment_job/get_subcategory_from_seek', { category_id: this.state.category }).then((result) => {
            if (result.status) {
                this.setState({
                    job_sub_category: result.data,
                }, () => {

                });
            }
        });
    }

    getSeekQuestionByCatgorySubcat = () => {
        postData('recruitment/recruitment_job/get_seek_ques_by_cat_subcat', { category_id: this.state.category, sub_category: this.state.sub_category }).then((result) => {
            if (result.status) {
                this.setState({
                    questionByCatAndSubcat: result.data,
                }, () => {
                    var temp_state = {};
                    var previous_state = this.state.publish_to;
                    this.state.publish_to.map((value, idx) => {
                        previous_state[idx]['question'] = this.state.questionByCatAndSubcat;
                    })
                    this.setState(previous_state, () => { });
                });
            }
        });
    }

    getJobChannels = () => {
        postData('recruitment/recruitment_job/get_job_channel_details', {}).then((result) => {
            if (result.status) {
                this.setState({
                    publish_to: result.data,

                }, () => { });
            }
        });
    }

    enableAndSelectDocs = (value, index) => {
        var temp_state = {};
        var old_state = this.state.all_docs_job_apply;

        if (old_state[index]['clickable']) {
            old_state[index]['clickable'] = false;
            old_state[index]['optional'] = false;
            old_state[index]['mandatory'] = false;
            old_state[index]['selected'] = false;

        } else {
            old_state[index]['mandatory'] = true;
            old_state[index]['clickable'] = true;
            old_state[index]['selected'] = true;
        }

        temp_state['all_docs_job_apply'] = old_state;
        this.setState(temp_state, () => { });
    }

    enableAndSelectRecruitDocs = (value, index) => {
        var temp_state = {};
        var old_state = this.state.all_docs_recruit;

        if (old_state[index]['clickable']) {
            old_state[index]['clickable'] = false;
            old_state[index]['optional'] = false;
            old_state[index]['mandatory'] = false;
            old_state[index]['selected'] = false;

        } else {
            old_state[index]['mandatory'] = true;
            old_state[index]['clickable'] = true;
            old_state[index]['selected'] = true;
        }

        temp_state['all_docs_recruit'] = old_state;
        this.setState(temp_state, () => { });
    }

    chooseOptionalMandatory = (value, index, type) => {
        var temp_state = {};
        var old_state = this.state.all_docs_job_apply;
        if (type == 'optional') {
            old_state[index]['mandatory'] = false;
            old_state[index]['optional'] = true;
        }
        else {
            old_state[index]['mandatory'] = true;
            old_state[index]['optional'] = false;
        }

        temp_state['all_docs_job_apply'] = old_state;
        this.setState(temp_state);
    }

    chooseOptionalMandatoryRecruitDocs = (value, index, type) => {
        var temp_state = {};
        var old_state = this.state.all_docs_recruit;
        if (type == 'optional') {
            old_state[index]['mandatory'] = false;
            old_state[index]['optional'] = true;
        }
        else {
            old_state[index]['mandatory'] = true;
            old_state[index]['optional'] = false;
        }

        temp_state['all_docs_recruit'] = old_state;
        this.setState(temp_state);
    }

    selectDocument = (value, index, operation) => {
        var temp_state = {};
        var old_state = this.state.all_docs_job_apply;

        if (operation == 'add')
            old_state[index]['selected'] = true;
        else
            old_state[index]['selected'] = false;

        old_state[index]['clickable'] = false;

        temp_state['all_docs_job_apply'] = old_state;
        //this.setState({check_documents:true});
        this.setState(temp_state, () => { });
    }

    selectRecruitDocument = (value, index, operation) => {
        var temp_state = {};
        var old_state = this.state.all_docs_recruit;

        if (operation == 'add')
            old_state[index]['selected'] = true;
        else
            old_state[index]['selected'] = false;

        old_state[index]['clickable'] = false;

        temp_state['all_docs_recruit'] = old_state;
        //this.setState({check_documents:true});
        this.setState(temp_state, () => { });
    }

    closeAndSaveDocuments = () => {
        var temp_count = 0;
        var docs_length = this.state.all_docs_job_apply.length;
        this.state.all_docs_job_apply.map((value, idx) => {
            if (!value.selected)
                temp_count = temp_count + 1;
        })

        if (temp_count == docs_length) {
            this.setState({ check_documents: false, allow_close_docs_form: true });
        }
        else {
            this.setState({ check_documents: true, magageDocModal: false })
        }
    }

    closeAndSaveRecruitDocuments = () => {
        var temp_count = 0;
        var docs_length = this.state.all_docs_recruit.length;
        this.state.all_docs_recruit.map((value, idx) => {
            if (!value.selected)
                temp_count = temp_count + 1;
        })

        if (temp_count == docs_length) {
            this.setState({ check_documents: false, allow_close_docs_form: true });
        }
        else {
            this.setState({ check_documents: true, magageDocModal: false })
        }
    }

    editQuestion = (mainIndex, otherIndex, textVal) => {
        var temp_state = {};
        var old_pub_state = JSON.stringify(this.state.publish_to);
        old_pub_state = JSON.parse(old_pub_state);

        if (old_pub_state[mainIndex]['question'][otherIndex]['question_edit']) {
            old_pub_state[mainIndex]['question'][otherIndex]['question_edit'] = false;
            old_pub_state[mainIndex]['question'][otherIndex]['editable_class'] = '';
            old_pub_state[mainIndex]['question'][otherIndex]['btn_txt'] = 'Edit';
        }
        else {
            old_pub_state[mainIndex]['question'][otherIndex]['question_edit'] = true;
            old_pub_state[mainIndex]['question'][otherIndex]['editable_class'] = 'editable_class';
            old_pub_state[mainIndex]['question'][otherIndex]['btn_txt'] = 'Save';

            //if (textVal) { old_pub_state[mainIndex]['question'][otherIndex]['question'] = textVal.target.value; }
        }
        temp_state['publish_to'] = old_pub_state;
        this.setState(temp_state);
    }

    handleOnChangeQuestion = (mainIndex, otherIndex, textVal) => {
        var temp_state = {};
        var old_pub_state = this.state.publish_to;

        if (old_pub_state[mainIndex]['question'][otherIndex]['question_edit']) {
            if (textVal) { old_pub_state[mainIndex]['question'][otherIndex]['question'] = textVal.target.value; }
        }
        temp_state['publish_to'] = old_pub_state;
        this.setState(temp_state);
    }

    removeQuestion = (mainIndex, otherIndex) => {
        var temp_state = {};
        var old_pub_state = this.state.publish_to;

        if (old_pub_state[mainIndex]['question'][otherIndex]) {
            old_pub_state[mainIndex]['question'] = old_pub_state[mainIndex]['question'].filter((s, sidx) => otherIndex !== sidx);
        }

        temp_state['publish_to'] = old_pub_state;
        this.setState(temp_state);
    }

    changeMyVariable = (myVariable) => {
        return 1;
    }

    resetAllFields = () => {
        this.setState({
            ...this.state,
            job_type: '',
            job_location: '',
            phone: '',
            email: '',
            website: '',
            all_docs_job_apply: [],
            all_docs_recruit: [],
            //check_documents: false,
            is_salary_publish: false,
            is_cat_publish: false,
            is_subcat_publish: false,
            is_emptype_publish: false,
            job_template: [],
            activeTemplate: 1,
            job_content: '',
            type: '',
            category: '',
            sub_category: '',
            title: '',
            position: '',
            employment_type: '',
            salary_range: '',
            publish_to: [],
            from_date: '',
            to_date: '',
            is_recurring: '',
            owner: ''
        })
        this.getJobMasterList();
        this.getRequiredJobDocuments();
        this.getRequiredRecruitDocuments();
        this.getJobChannels();
    }

    setstateOfDraftAndPostJob = (draftState, postState) => {
        this.setState({ job_content: this.editorRef.current.getContent() });
        this.setState({ save_as_draft: draftState, post_job: postState, job_operation: this.state.job_operation },
            (e) => this.submitjobs(e))
    }

    addDocuments = (e) => {
        e.preventDefault();
        jQuery('#AddDocsForm').validate({});
        if (jQuery('#AddDocsForm').valid()) {
            this.setState({ loading: true }, () => {
                postData('recruitment/recruitment_job/save_job_required_documents', { document_name: this.state.document_name }).then((result) => {
                    if (result.status) {
                        toast.success(<ToastUndo message={result.msg} showType={'s'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.state.all_docs_job_apply.push(result.data);
                    }
                    else {
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false })
                });
            });
        }
    }

    handleDocumentOnChange = (e) => {
        var state = {};
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    handleRemoveTodate = (e) => {
        var state = {};
        state[e.target.name] = (e.target.type === 'checkbox' ? e.target.checked : e.target.value);
        this.setState(state, () => {
            if (!this.state.is_recurring)
                this.setState({ to_date: '', recurring_type: '' });
        });
    }

    updateJobStatus = (e, statusNeedToUpdate, msg) => {
        if (!this.state.loading) {
            this.setState({ loading: true }, () => {
                archiveALL({ status: statusNeedToUpdate, job_id: this.props.props.match.params.jobId }, 'Are you sure you want to ' + msg, 'recruitment/recruitment_job/update_job_status').then((result) => {
                    if (result.status) {
                        this.setState({ save_success: true });
                    }
                    this.setState({ loading: false });
                })
            })
        }
    }

    getJobStage = () => {
        postData('recruitment/recruitment_job/get_job_stage', {}).then((result) => {
            if (result.status) {
                this.setState({
                    job_stage: result.data,
                }, () => { });
            }
        });
    }

    selectedOwnerData = (e) => {
        if (e) {
            this.setState({ owner: e, owner_id: e.value });
        } else {
            this.setState({ owner: '', owner_id: '' });
        }

    }

    onChange(content, editor) {
        let ele = document.getElementById("newlink");
        if (ele) {
            let link = ele.innerText;
            let title = ele.getAttribute("title");
            if (!title) {
                const edi = setInterval(() => {
                    ele = document.getElementById("newlink");
                    if (ele) {
                        title = ele.getAttribute("title");
                        if (title) {
                            this.formatLink(editor, link, title);
                            clearInterval(edi);
                        }
                    }
                }, 1000)
            } else {
                this.formatLink(editor, link, title);
                ele.remove();
            }
            console.log(content);
        }
    }

    formatLink(editor, link, title) {
        let content = editor.getContent();
        if (content.includes("&amp;")) {
            content = content.replaceAll("&amp;", "&");
        }
        content = content.replace(">" + link, ">" + title);       
        editor.setContent(content);
        editor.selection.select(editor.getBody(), true);
        editor.selection.collapse(false);
    }

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState, () => {
            if ((key == 'to_date' && this.state.from_date != '') || (this.state.from_date != '' && this.state.to_date != '')) {
                if ((Date.parse(this.state.from_date) > Date.parse(this.state.to_date))) {
                    toastMessageShow("To date should be greater than From date", "e");
                }
            }
        });

    }

    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }


    onChange(content, editor) {
        let ele = document.getElementById("newlink");
        if (ele) {
            let link = ele.innerText;
            let title = ele.getAttribute("title");
            if (!title) {
                const edi = setInterval(() => {
                    ele = document.getElementById("newlink");
                    if (ele) {
                        title = ele.getAttribute("title");
                        if (title) {
                            this.formatLink(editor, link, title);
                            clearInterval(edi);
                        }
                    }
                }, 1000)
            } else {
                this.formatLink(editor, link, title);
                ele.remove();
            }
            console.log(content);
        }
    }

    formatLink(editor, link, title) {
        let content = editor.getContent();
        if (content.includes("&amp;")) {
            content = content.replaceAll("&amp;", "&");
        }
        content = content.replace(">" + link, ">" + title);       
        editor.setContent(content);
        editor.selection.select(editor.getBody(), true);
        editor.selection.collapse(false);
    }

    render() {
        const myVariable = this.changeMyVariable();
        return (
            <React.Fragment>

                {(this.state.save_success) ? <Redirect to={{ pathname: '/admin/recruitment/job_opening/jobs' }} /> : ''}
                <BlockUi tag="div" blocking={this.state.loading}>
                    <form id="form_create_job" method="post" autoComplete="off">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 no-pad back_col_cmn-">
                                <Link to='/admin/recruitment/job_opening/jobs'>
                                    <span className="icon icon-back1-ie"></span>
                                </Link>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 col-md-12 main_heading_cmn-">
                                <h1>{this.props.showPageTitle}</h1>
                            </div>
                        </div>

                        <div className='row creaJobRow1__ bor_bot1 border-color-black'>
                            <div className="col-lg-12 px-0">
                                <h4 className="mt-3 pb-2"><strong>Job Details</strong></h4>
                                <div className="bb-1 border-color-black mb-2"></div>
                            </div>

                            <div className="col-lg-12 col-md-12 col-sm-12 no-pad">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="csform-group ">
                                            <label className="mb-m-4 fs_16">Job title:</label>
                                            <span className="required">
                                                <input type="text" className="csForm_control bl_bor" name="title" placeholder="Job title" value={this.state.title || ''} required={true} maxLength='300' readOnly={this.state.is_editable} onChange={(e) => handleChangeChkboxInput(this, e)} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="csform-group ">
                                            <label className="mb-m-4 fs_16">Business Unit: </label>
                                            <span className="required"> 
                                                <div className="cmn_select_dv">
                                                    <Select className={"custom_select default_validation"}
                                                        simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Select Business Unit"
                                                        options={this.state.business_unit_options}
                                                        onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "bu_id")}
                                                        value={this.state.bu_id || ''}
                                                        disabled={this.state.is_editable}
                                                        inputRenderer={() => <input type="text" className="define_input" name={"bu_id"} required={true} value={this.state.bu_id || ''} readOnly />}
                                                    />
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="col-sm-8 modify_select sledrop_bor_clr default_validation">
                                            <label className="mb-m-4 fs_16">Owner: </label>
                                            <span className="required">
                                                <Select.Async
                                                    required={true}
                                                    cache={false}
                                                    clearable={true}
                                                    impleValue={true}
                                                    searchable={true}
                                                    name="owner"
                                                    value={this.state.owner}
                                                    loadOptions={getStaff}
                                                    placeholder="Owner"
                                                    onChange={(e) => this.selectedOwnerData(e)}
                                                    className={'custom_select'}
                                                    disabled={this.state.is_editable}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">

                                    <div className="col-md-3">
                                        <div className="csform-group ">
                                            <label className="mb-m-4 fs_16">Job Category:</label>
                                            <span className="required">
                                                <div className="cmn_select_dv">
                                                    <Select className={"custom_select default_validation"}
                                                        simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Select Category"
                                                        options={this.state.job_category}
                                                        onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "category")}
                                                        value={this.state.category}
                                                        disabled={this.state.is_editable}
                                                        inputRenderer={() => <input type="text" className="define_input" name={"category"} required={true} value={this.state.category || ''} readOnly />}
                                                    />
                                                </div>
                                            </span>
                                            <label className="customChecks publ_sal">
                                                <input type="checkbox" name="is_cat_publish" onChange={(e) => this.setState({ is_cat_publish: e.target.checked })} checked={this.state.is_cat_publish} disabled={this.state.is_editable} />
                                                <div className="chkLabs fnt_sm">Publish Category</div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="csform-group ">
                                            <label className="mb-m-4 fs_16">Job Sub Category:</label>
                                            <span className="required">
                                                <div className="cmn_select_dv">
                                                    <Select className={"custom_select default_validation"}
                                                        simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Select Category"
                                                        options={this.state.job_sub_category}
                                                        onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "sub_category")}
                                                        value={this.state.sub_category}
                                                        disabled={this.state.is_editable}
                                                        inputRenderer={() => <input type="text" className="define_input" name={"sub_category"} required={true} value={this.state.sub_category || ''} readOnly />}
                                                    />
                                                </div>
                                            </span>
                                            <label className="customChecks publ_sal">
                                                <input type="checkbox" name="is_subcat_publish" onChange={(e) => this.setState({ is_subcat_publish: e.target.checked })} checked={this.state.is_subcat_publish} disabled={this.state.is_editable} />
                                                <div className="chkLabs fnt_sm">Publish Sub category</div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="csform-group ">
                                            <label className="mb-m-4 fs_16">Employment Type:</label>
                                            <span className="required">
                                                <div className="cmn_select_dv">
                                                    <Select className={"custom_select default_validation"}
                                                        simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Select Type"
                                                        options={this.state.job_employment_type}
                                                        onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "employment_type")}
                                                        value={this.state.employment_type}
                                                        disabled={this.state.is_editable}
                                                        inputRenderer={() => <input type="text" className="define_input" name={"employment_type"} required={true} value={this.state.employment_type || ''} readOnly />}
                                                    />
                                                </div>
                                            </span>
                                            <label className="customChecks publ_sal">
                                                <input type="checkbox" name="is_emptype_publish" onChange={(e) => this.setState({ is_emptype_publish: e.target.checked })} checked={this.state.is_emptype_publish} disabled={this.state.is_editable} />
                                                <div className="chkLabs fnt_sm">Publish Employment type</div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="csform-group ">
                                            <label className="mb-m-4 fs_16">Salary Range:</label>
                                            <span>
                                                <div className="cmn_select_dv">
                                                    <Select className={"custom_select default_validation"}
                                                        simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Select Range"
                                                        options={this.state.job_salary_range}
                                                        onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "salary_range")}
                                                        value={this.state.salary_range}
                                                        disabled={this.state.is_editable}
                                                        inputRenderer={() => <input type="text" className="define_input" name={"salary_range"} value={this.state.salary_range || ''} readOnly />
                                                        }
                                                    />
                                                </div>
                                            </span>
                                            <label className="customChecks publ_sal">
                                                <input type="checkbox" name="is_salary_publish" onChange={(e) => this.setState({ is_salary_publish: e.target.checked })} checked={this.state.is_salary_publish} disabled={this.state.is_editable} />
                                                <div className="chkLabs fnt_sm">Publish Salary</div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="csform-group">
                                            <label className="mb-m-4 fs_16">Select form</label>
                                            <div className="required">
                                                <div className="cmn_select_dv">
                                                    <Select
                                                        className={"custom_select default_validation"}
                                                        simpleValue={true}
                                                        searchable={false}
                                                        clearable={false}
                                                        placeholder="Select form"
                                                        options={this.state.jobQuestionForms}
                                                        onChange={e => this.setState({ form_id: e })}
                                                        value={this.state.form_id}
                                                        disabled={this.state.loadingJobQuestionForms || this.state.is_editable}
                                                        loading={this.state.loadingJobQuestionForms}
                                                        inputRenderer={() => {
                                                            return (
                                                                <input type="text"
                                                                    className="define_input"
                                                                    name={"form_id"}
                                                                    required={true}
                                                                    value={this.state.form_id || ''}
                                                                    readOnly
                                                                />
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                                <div className="col-lg-12 col-md-12 col-sm-12 no-pad">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="csform-group">
                                                <label className="mb-m-4">Job Advertisement Timeframe:</label>
                                                <div className="timeFrame_bx">

                                                    <div className="dts_bxie">
                                                        <div className="csform-group frm_grp_flx datie_wid">
                                                            <label className="wid_50">From:</label>
                                                            <span className="required">
                                                                <div class='set_date_border'>

                                                                    <SLDSISODatePicker
                                                                        ref={this.datepickers.from_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                        className="customer_signed_date"
                                                                        placeholder="DD/MM/YYYY"
                                                                        onChange={this.handleChangeDatePicker('from_date')}
                                                                        onOpen={this.handleDatePickerOpened('from_date')}
                                                                        onClear={this.handleChangeDatePicker('from_date')}
                                                                        value={this.state.from_date}
                                                                        input={<Input name="from_date" />}
                                                                        inputProps={{
                                                                            name: "from_date",
                                                                            readOnly: true
                                                                        }}
                                                                        disabled={this.state.is_editable}
                                                                        dateDisabled={(data) => {
                                                                            if (this.props.props.match.params.jobType != 'E') {
                                                                                return moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                                            } else {
                                                                                return false
                                                                            }
                                                                        }

                                                                        }
                                                                    />

                                                                </div>
                                                            </span>
                                                        </div>

                                                        <div className="csform-group frm_grp_flx datie_wid">
                                                            <label className="wid_50" ss={this.state.to_date}>To:</label>
                                                            <span className="required">
                                                                <div class='set_date_border'>
                                                                    <SLDSISODatePicker
                                                                        ref={this.datepickers.to_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                        className="to_date"
                                                                        placeholder="DD/MM/YYYY"
                                                                        onChange={this.handleChangeDatePicker('to_date')}
                                                                        onOpen={this.handleDatePickerOpened('to_date')}
                                                                        onClear={this.handleChangeDatePicker('to_date')}
                                                                        value={this.state.to_date}
                                                                        input={<Input name="to_date" />}
                                                                        inputProps={{
                                                                            name: "to_date",
                                                                            readOnly: true
                                                                        }}
                                                                        disabled={((this.state.is_recurring == 1) || (this.state.is_editable)) ? true : false}

                                                                        dateDisabled={(data) => {
                                                                            if (this.props.props.match.params.jobType != 'E') {
                                                                                return moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                                            } else {
                                                                                return false
                                                                            }
                                                                        }                                                                        
                                                                        }
                                                                    />

                                                                </div>

                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <div>
                                                <label className="customChecks publ_sal mr_l_45">
                                                    <input type="checkbox" value={this.state.is_recurring || ''} disabled={this.state.is_editable} checked={this.state.is_recurring == 1 ? true : false} name="is_recurring" onChange={(e) => {
                                                        this.handleRemoveTodate(e);
                                                    }} />
                                                    <div className="chkLabs fnt_sm">Set as Recurring</div>
                                                </label>
                                            </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </IconSettings>
                            <div className="col-lg-12 col-md-12 col-sm-12 no-pad">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className=" cmn_select_dv srch_select12 loc_sel vldtn_slct">
                                            <div className="csform-group">
                                                <label>Job Location:</label>
                                                <span className="">
                                                    <div className="React_Google_auto">
                                                        <ReactGoogleAutocomplete className="add_input mb-1"
                                                            required={false}
                                                            data-msg-required="Add address"
                                                            name={"job_location"}
                                                            onPlaceSelected={(place) => {
                                                                this.setState({ job_location: place.formatted_address, complete_address: place })
                                                            }}
                                                            types={['address']}
                                                            returntype={'array'}
                                                            className="csForm_control bl_bor"
                                                            value={this.state.job_location || ''}
                                                            onChange={(evt) => this.setState({ job_location: evt.target.value })}
                                                            componentRestrictions={{ country: "au" }}
                                                            disabled={this.state.is_editable}
                                                        />
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-1">
                                        <div className="csform-group">
                                            <label>Phone:</label>
                                            <span className="" >
                                                <input type="text" style={{textAlign: "center"}} className="csForm_control bl_bor" name="phone" value={'+61'} data-rule-phonenumber maxLength='10' minLength='10' readOnly={true} disabled={true} />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <div className="csform-group">
                                            <label>  </label>
                                            <span className="" >
                                                <input type="text"
                                                    placeholder="04XXXXXXXX"
                                                    style={{ marginTop: "38px" }}
                                                    className="csForm_control bl_bor"
                                                    name="phone"
                                                    value={this.state.phone || ''}
                                                    onChange={(e) => { if (!isNaN(e.target.value)) { handleChangeChkboxInput(this, e) } }}
                                                    data-rule-phonenumber
                                                    maxlength="10"
                                                    phoneMinLength="10"
                                                    readOnly={this.state.is_editable} />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="csform-group">
                                            <label>Email:</label>
                                            <span className="">
                                                <input type="text" className="csForm_control bl_bor" name="email" value={this.state.email || ''} onChange={(e) => handleChangeChkboxInput(this, e)} readOnly={this.state.is_editable} />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="csform-group">
                                            <label>Website:</label>
                                            <span className="">
                                                <input type="text" className="csForm_control bl_bor" name="website" value={this.state.website || ''} onChange={(e) => handleChangeChkboxInput(this, e)} data-rule-valid_website readOnly={this.state.is_editable} />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-3 col-md-4">
                                        <div className="csform-group">
                                            <label className="">Interview Stage:</label>
                                            <span className="required w-100">
                                                <Select className={"custom_select default_validation"}
                                                    simpleValue={true}
                                                    searchable={false} clearable={false}
                                                    placeholder="Select Interview Stage"
                                                    options={this.state.job_stage}
                                                    onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "interview_job_stage_id")}
                                                    value={this.state.interview_job_stage_id}
                                                    disabled={this.state.is_editable}
                                                    inputRenderer={() => <input type="text" className="define_input" name={"interview_job_stage_id"} required={true} value={this.state.interview_job_stage_id || ''} readOnly />}
                                                />
                                            </span>
                                        </div>
                                    </div>

                                    {(this.state.interview_job_stage_id && this.state.interview_job_stage_id == 8) ?
                                        <div className="col-lg-3 col-md-4">
                                            <div className="csform-group">
                                                <label className="">Set the count of Individual Interview:</label>
                                                <span className="required w-100">
                                                    <input type="text" className="csForm_control bl_bor" name="individual_interview_count" value={this.state.individual_interview_count || ''} onChange={(e) => handleChangeChkboxInput(this, e)} required={(this.state.interview_job_stage_id && this.state.interview_job_stage_id == 8) ? true : false} min="1" max="3" disabled={this.state.is_editable} />
                                                </span>
                                            </div>
                                        </div> : ''}

                                    <div className="col-lg-3 col-md-4">
                                        <div className="csform-group">
                                            <label className="">&nbsp;</label>
                                            <span className="required w-100">
                                                <Select className={"custom_select default_validation"}
                                                    simpleValue={true}
                                                    searchable={false} clearable={false}
                                                    placeholder="Select Interview Stage"
                                                    options={jobStage2DropDown()}
                                                    onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "job_sub_stage_id")}
                                                    value={this.state.job_sub_stage_id}
                                                    disabled={this.state.is_editable}
                                                    inputRenderer={() => <input type="text" className="define_input" name={"job_sub_stage_id"} required={true} value={this.state.job_sub_stage_id || ''} readOnly />}
                                                />
                                            </span>
                                        </div>
                                    </div>

                                    {/* {(this.state.is_recurring == 1) ?
                                        <div className="col-lg-3 col-md-4">
                                            <div className="csform-group">
                                                <label className="">Recurring option:</label>
                                                <span className="required w-100">
                                                    <Select className="custom_select default_validation"
                                                        simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Recurring option"
                                                        options={recurringType(0)}
                                                        onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "recurring_type")}
                                                        value={this.state.recurring_type}
                                                        required={(this.state.is_recurring == 1) ? true : false}
                                                        disabled={this.state.is_editable}
                                                        inputRenderer={() => <input type="text" className="define_input" name={"recurring_type"} required={true} value={this.state.recurring_type || ''} readOnly />
                                                        }
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        : ''} */}
                                </div>
                            </div>


                            <div className="col-lg-4 mt-3">

                                <div className="row">
                                    <div>
                                        <h4 className="mt-3 pb-2"> <strong>Docs required (Apply Job):</strong>  </h4>

                                        <span className="required"><label htmlFor="dcs[]" className="error CheckieError" style={{ display: 'block' }}></label></span>
                                        <div className="bb-1 border-color-black mb-2"></div>
                                    </div>


                                    {(!this.state.is_editable) ?
                                        <div className="col-lg-3 text-right">
                                            {/* <a onClick={() => this.setState({ magageDocModal: true })} className="btn cmn-btn2 mr-2">Manage Documents</a> */}
                                            <a onClick={() => this.setState({ AddDocumentsModal: true })} className="btn cmn-btn1" style={{ display: 'none' }}>Add Documents</a>
                                        </div> : ''}
                                </div>

                                <div className="row">
                                    <div className="">
                                        {this.state.all_docs_job_apply.map((value, idx) => (
                                            <div className="Manage_li_" key={idx}>
                                                <div className="Manage_li_a1_"><label className="cUStom_check w-100"><input onClick={(e) => !this.state.is_editable && this.enableAndSelectDocs(value, idx)} disabled={this.state.is_editable} type="checkbox" name={'dcs[]'} required checked={(value.clickable) ? true : false} readOnly /><small></small>
                                                    <div className="Manage_li_a1_" ><span>{value.label}</span></div>
                                                </label></div>

                                                <div className="Manage_li_a2_">

                                                    <div className="Manage_li_a2_">

                                                        <a className={(value.optional) ? 'Req_btn_out_1 R_bt_co_blue active_selected' : 'Req_btn_out_1 R_bt_co_blue'} onClick={(e) => value.clickable && this.chooseOptionalMandatory(value, idx, 'optional')}>Optional</a>

                                                        <a className={(value.mandatory) ? 'Req_btn_out_1 R_bt_co_ active_selected' : 'Req_btn_out_1 R_bt_co_'} onClick={(e) => value.clickable && this.chooseOptionalMandatory(value, idx, 'mandatory')}>Mandatory</a>
                                                        {/* <i className="icon icon-add2-ie Man_btn_3a" onClick={(e)=> this.selectDocument(value,idx,'add')}></i>  */}

                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* <div className="row">
                                    <div className="col-lg-12">
                                        <div className="row">

                                            {this.state.all_docs_job_apply.map((value, idx) => (
                                                (value.selected) ?
                                                    <div className="Req_list_1r col-lg-3" key={idx + 2}>
                                                        <div className="Req_list_1r_1a">{value.label}</div>
                                                        <div className="Req_list_1r_1b">
                                                            {(value.optional) ? <a className="Req_btn_out_1 R_bt_co_blue">Optional</a> : ''}
                                                            {(value.mandatory) ? <a className="Req_btn_out_1 R_bt_co_">Mandatory</a> : ''}
                                                        </div>
                                                    </div> : ''
                                            ))}
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            <div className="col-lg-8 pl-5 mt-3">

                                <div className="row">
                                    <div>
                                        <h4 className="mt-3 pb-2"> <strong>Docs required (Recruitment Stages):</strong>  </h4>

                                        <span className="required"><label htmlFor="dcs_recruit[]" className="error CheckieError" style={{ display: 'block' }}></label></span>
                                        <div className="bb-1 border-color-black mb-2"></div>
                                    </div>
                                </div>

                                <div className="row row_overflowy">

                                    {this.state.all_docs_recruit.map((value, idx) => (
                                        <div className="Manage_li_ col-md-6" key={idx}>
                                            <div className="Manage_li_a1_"><label className="cUStom_check w-100"><input onClick={(e) => !this.state.is_editable && this.enableAndSelectRecruitDocs(value, idx)} disabled={this.state.is_editable} type="checkbox" name={'dcs_recruit[]'} required checked={(value.clickable) ? true : false} readOnly /><small></small>
                                                <div className="Manage_li_a1_" ><span>{value.label}</span></div>
                                            </label></div>

                                            <div className="Manage_li_a2_">

                                                <div className="Manage_li_a2_">

                                                    <a className={(value.optional) ? 'Req_btn_out_1 R_bt_co_blue active_selected' : 'Req_btn_out_1 R_bt_co_blue'} onClick={(e) => value.clickable && this.chooseOptionalMandatoryRecruitDocs(value, idx, 'optional')}>Optional</a>

                                                    <a className={(value.mandatory) ? 'Req_btn_out_1 R_bt_co_ active_selected' : 'Req_btn_out_1 R_bt_co_'} onClick={(e) => value.clickable && this.chooseOptionalMandatoryRecruitDocs(value, idx, 'mandatory')}>Mandatory</a>
                                                    {/* <i className="icon icon-add2-ie Man_btn_3a" onClick={(e)=> this.selectDocument(value,idx,'add')}></i>  */}

                                                </div>

                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                            <div className="clearfix"></div>
                        </div>

                        <div className='row creaJobRow1__ bor_bot1  border-color-black pt-5 d-flex flex-wrap after_before_remove'>
                            <div className="col-lg-12 no_pd_l border-color-black">
                                <div className="pd-r-30">
                                    <div className="csform-group">
                                        <h4 className="mt-0"><strong>Job Description:</strong></h4>

                                        <div className="d-flex w-100 pb-4 justify-content-center">
                                            {this.errorShowInTooltip('job_content', 'This field is required.')}
                                        </div>

                                        <span className="required">
                                            <div className='cstmEditor bigHg mt-2 cmnEditorScrollBar__ createJobEditor Hide_tolles'>
                                                {
                                                    (this.state.editor_read_only) ?
                                                        (<Editor
                                                            apiKey={TINY_MCE_EDITOR_KEY}
                                                            onInit={(evt, editor) => {
                                                                this.editorRef.current = editor;
                                                            }
                                                            }
                                                            initialValue={this.state.job_content}
                                                            init={{
                                                                height: 500,
                                                                menubar: false,
                                                                plugins: [
                                                                    'print preview powerpaste casechange importcss searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media codesample table charmap hr nonbreaking toc insertdatetime advlist lists wordcount tinymcespellchecker textpattern noneditable help formatpainter charmap quickbars linkchecker advtable'
                                                                ],
                                                                toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor casechange permanentpen formatpainter removeformat | charmap | fullscreen  preview save print | image media pageembed template link anchor codesample | a11ycheck | customToolbar code ',
                                                                automatic_uploads: true,
                                                                images_upload_handler: function (blobInfo, success, failure) {
                                                                    let data = new FormData();
                                                                    data.append('file', blobInfo.blob(), blobInfo.filename());
                                                                    data.append('dir_name', 'job');

                                                                    postImageData('common/upload_editor_assets', data, this).then((result) => {
                                                                        if (result.status) {
                                                                            success(result.location);
                                                                        } else {
                                                                            failure(result.error);
                                                                        }
                                                                    });
                                                                },     
                                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                                toolbar_mode: 'wrap',
                                                                automatic_uploads: true,
                                                                images_upload_handler: function (blobInfo, success, failure) {
                                                                    let data = new FormData();
                                                                    data.append('file', blobInfo.blob(), blobInfo.filename());
                                                                    data.append('dir_name','job');
                                                                    
                                                                    postImageData('common/upload_editor_assets', data, this).then((result) => {
                                                                        if (result.status) {
                                                                            success(result.location);
                                                                        } else {
                                                                            failure(result.error);
                                                                        }
                                                                    });
                                                                }, 
                                                                paste_preprocess: (plugin, args) => {
                                                                    console.log(args.content);
                                                                    let hiddenEle = document.createElement('input');
                                                                    hiddenEle.setAttribute("id", "newlink");
                                                                    hiddenEle.setAttribute("type", "hidden");
                                                                    hiddenEle.innerHTML = args.content;
                                                                    let url = hiddenEle.innerText;
                                                                    hiddenEle.innerHTML = url;
                                                                    document.body.appendChild(hiddenEle);
                                                                    postData('common/Common/get_url_info', { url }).then((result) => {
                                                                        if (result.status) {
                                                                            let ele = document.getElementById("newlink");
                                                                            ele.setAttribute("title", result.data.title);
                                                                            console.log(ele);
                                                                        } else {
                                                                            toastMessageShow(result.error, 'e');
                                                                        }
                                                                    });
                                                                },
                                                            }}
                                                            onEditorChange={(content, editor) => this.onChange(content, editor)}
                                                        />):
                                                        (ReactHtmlParser(this.state.job_content))
                                                }
                                            </div>
                                        </span>

                                    </div>
                                </div>
                            </div>

                            {/* TODO: This is currently hidden. You want to remove this component if no longer needed */}
                            <div className="col-lg-6 col-md-12 no_pd_r bor-l border-color-black" hidden>
                                <div className="pd-l-30">
                                    <h4><strong>Publish To:</strong></h4>
                                    <SimpleBar style={{ maxHeight: '515px', overflowX: 'hidden', paddingLeft: '15px', paddingRight: '15px' }} forceVisible={false}>

                                        <div className="cmnDivScrollBar__ prList_sclBar">
                                            {this.state.publish_to.map((value, idx) => (
                                                <div className="ques_box" key={idx}>
                                                    <div className="row mb-5">
                                                        <div className="col-md-12 d-flex align-items-center">
                                                            <span>{idx + 1}.</span>

                                                            <span className="row pl-2 w-100">
                                                                <div className="col-lg-3 col-md-3 pub_filCol">
                                                                    <div className="csform-group">
                                                                        <label className="mb-m-4">Channel:</label>
                                                                        <Select className={"default_validation"}
                                                                            cache={false}
                                                                            searchable={false}
                                                                            name="form-field-name"
                                                                            clearable={false}
                                                                            value={value.drp_dwn_val}
                                                                            simpleValue={true}
                                                                            onChange={(e) => this.handleOnchangeAndvalidateSelect(e, "chanel")}
                                                                            required={true}
                                                                            options={[value.drp_dwn] || ''}
                                                                            inputRenderer={() => <input type="text" className="define_input" name={"chanel"} required={true} value={value.channel_name} onChange={() => { }} />}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={"accordion_c acc_des1 " + ((value.question_tab) ? 'in' : '')} >

                                                        <div className="accor_hdng" onClick={(e) => handleShareholderNameChange(this, 'publish_to', idx, 'question_tab', !value.question_tab)}>
                                                            <div>Additional Questions</div>
                                                            <i className="icon icon-arrow-right"></i>
                                                        </div>

                                                        <div className="accor_body">
                                                            <p>Current question for application posted on {value.channel_name}:</p>

                                                            {
                                                                (value.question) ? value.question.map((val, index) => (
                                                                    <div className="Addtional_li_1a" key={index}>
                                                                        <ul>
                                                                            <span>{index + 1}</span>
                                                                            {/*<li key={index + 2}>
                                                                            <div>
                                                                                <div>
                                                                                    <textarea className={(val.question_edit) ? val.editable_class : ''} onChange={(e) => this.handleOnChangeQuestion(idx, index, e)} disabled={(val.question_edit) && (val.question_edit) != '' ? false : true}>{val.question}</textarea></div>
                                                                                <div className="d-inline-flex align-items-center">
                                                                                    {(value.question.length > 1 && !this.state.is_editable) ? <a onClick={(e) => this.removeQuestion(idx, index)} className="under_l_tx pd-r-10 mr-3">Remove</a> : ''}

                                                                                    {(!this.state.is_editable) ?
                                                                                        <a onClick={(e) => this.editQuestion(idx, index)}><span className="btn cmn-btn1">{val.btn_txt}</span></a> : ''}
                                                                                </div>
                                                                            </div>
                                                                        </li>*/}



                                                                            <li key={index + 2}>
                                                                                <div>
                                                                                    {(val.question_edit) && (val.question_edit) != '' ? <React.Fragment>
                                                                                        <div><textarea
                                                                                            className={(val.question_edit) ? val.editable_class : ''}
                                                                                            onChange={(e) => this.handleOnChangeQuestion(idx, index, e)}
                                                                                            disabled={(val.question_edit) && (val.question_edit) != '' ? false : true}>{val.question}</textarea>
                                                                                        </div>
                                                                                        <div className="d-inline-flex align-items-center">
                                                                                            {(value.question.length > 1 && !this.state.is_editable) ? <a onClick={(e) => this.removeQuestion(idx, index)} className="under_l_tx pd-r-10 mr-3">Remove</a> : ''}

                                                                                            {(!this.state.is_editable) ?
                                                                                                <a onClick={(e) => this.editQuestion(idx, index)}><span className="btn cmn-btn1">{val.btn_txt}</span></a> : ''}
                                                                                        </div></React.Fragment> :
                                                                                        <React.Fragment>
                                                                                            <div>{val.question}</div>
                                                                                            {(value.question.length > 1 && !this.state.is_editable) ? <a onClick={(e) => this.removeQuestion(idx, index)} className="under_l_tx pd-r-10 mr-3">Remove</a> : ''}
                                                                                            <a onClick={(e) => this.editQuestion(idx, index)}><span className="btn cmn-btn1">{val.btn_txt}</span></a></React.Fragment>}
                                                                                </div>
                                                                            </li>

                                                                        </ul>
                                                                    </div>
                                                                )) : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </SimpleBar>
                                </div>

                                <div className="csform-group" style={{ display: 'none' }}>
                                    <div className='additional_ques'>
                                        <label>Additional Questions:</label>

                                        {
                                            this.state.additionQuesAr.map((AdQues, i) => {
                                                return (
                                                    <div className="csform-group" key={i}>
                                                        <input
                                                            type="text"
                                                            className="csForm_control inp_blue"
                                                            placeholder='Type Ques..'
                                                            id={AdQues.id}
                                                            name={AdQues.name}
                                                            onChange={this.changeQuesText}
                                                            value={AdQues.inpValue}
                                                        />
                                                    </div>
                                                )
                                            })
                                        }


                                    </div>
                                    <div className='add_Ques'>
                                        <span className='add_ic icon icon-add3-ie' onClick={this.AddQuesInput}></span>
                                        <div className='clearfix'></div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='col-md-6 no_pd_l'>
                                {(this.state.job_status == 0 || this.props.props.match.params.jobType == 'D') ?
                                    <ul className='subTasks_Action__ left'>
                                        <li ><span className='sbTsk_li' onClick={(e) => this.resetAllFields()}>Reset All Fields</span></li>
                                    </ul>
                                    : ''}
                            </div>

                            {(this.state.job_status != 2) ?
                                <div className='col-md-6 text-right no_pd_r crJoBtn_Col__'>
                                    {
                                        (this.state.job_status == 0 && this.props.props.match.params.jobType == 'E') ?
                                            (<input type='button' className='btn cmn-btn1 crte_svBtn' value='Delete job' onClick={(e) => this.updateJobStatus(e, 1, 'Delete this job?')} />)
                                            : ((this.state.job_status == 5) ?
                                                <input type='button' className='btn cmn-btn1 crte_svBtn' value='Close job' onClick={(e) => this.updateJobStatus(e, 0, 'Cancel this job?')} />
                                                : (this.state.job_status == 3) ?
                                                    <input type='button' className='btn cmn-btn1 crte_svBtn' value='Close job' onClick={(e) => this.updateJobStatus(e, 2, 'Close this job?')} />
                                                    : '')}

                                    {(this.props.props.match.params.jobType == 'E') ?
                                        <input type='button' className='btn cmn-btn1 crte_svBtn' value='Save Changes' onClick={(e) => this.setstateOfDraftAndPostJob(true, false)} />
                                        :
                                        <input type='button' className='btn cmn-btn1 crte_svBtn' value='Save As Draft' onClick={(e) => this.setstateOfDraftAndPostJob(true, false)} />
                                    }
                                    <input type='button' className='btn cmn-btn1 crte_svBtn' value='Preview Job' onClick={() => this.setState({ quickModal: true, job_content: this.editorRef.current.getContent() })} />
                                </div>
                                :
                                (this.state.job_status != 2 || this.props.props.match.params.jobType == 'D') ? <div className='col-md-6 text-right no_pd_r crJoBtn_Col__'>
                                    <input type='button' className='btn cmn-btn1 crte_svBtn' value='Save As Draft' onClick={(e) => this.setstateOfDraftAndPostJob(true, false)} />
                                    <input type='button' className='btn cmn-btn1 crte_svBtn' value='Preview Job' onClick={() => this.setState({ quickModal: true, job_content: this.editorRef.current.getContent() })} />
                                </div>
                                    : <React.Fragment />
                            }
                        </div>

                    </form>
                </BlockUi>
                {(this.state.quickModal) ? <QuickPreviewModal showModal={this.state.quickModal} closeModal={() => this.setState({ quickModal: false })} parentState={this.state} setstateOfDraftAndPostJob={this.setstateOfDraftAndPostJob} viewMode={this.props.props.match.params.jobType} /> : ''}
                {(this.state.AddDocumentsModal) ? <AddDocuments showModal={this.state.AddDocumentsModal} closeModal={() => this.setState({ AddDocumentsModal: false })} all_docs_job_apply={this.state.all_docs_job_apply} addDocuments={this.addDocuments} handleDocumentOnChange={this.handleDocumentOnChange} /> : ''}

            </React.Fragment >
        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateJob);