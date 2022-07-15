import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { Panel, Button, ProgressBar, PanelGroup } from "react-bootstrap";
import Select from "react-select-plus";
import Modal from "react-bootstrap/lib/Modal";
import { confirmAlert, createElementReconfirm } from "react-confirm-alert";
import "react-select-plus/dist/react-select-plus.css";
import {
    postImageData,
    postDataDownload,
    postDataDownloadZip,
    checkItsNotLoggedIn,
    postData,
    getLoginToken,
    getPermission,
    IsValidJson,
    getOptionsCrmMembers,
    getOptionsSuburb,
    handleShareholderNameChange,
    handleAddShareholder
} from "service/common.js";
import jQuery from "jquery";
import { states_update } from "../../actions/CrmParticipantAction.js";
import DatePicker from "react-datepicker";
import Autocomplete from "react-google-autocomplete";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import ReactPlaceholder from "react-placeholder";
import { ROUTER_PATH, BASE_URL } from "config.js";
import { LeftManubar, DetailsPage, IntakeProcess } from "service/CrmLoader.js";
import { CallReference } from "./CallReference";
import { LockedFunding } from "./LockedFunding";
import { AllocateFund } from "./AllocateFund";
import { AllUpdates } from "./ParticipantAllUpdates";
import { relationDropdown, sitCategoryListDropdown } from "dropdown/ParticipantDropdown.js";
import { getStagesStatus, listDocumentList, LivingSituationOption } from "dropdown/CrmDropdown.js";
import CrmPage from "../../CrmPage";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { ToastUndo } from "service/ToastUndo.js";
import { toastMessageShow } from "service/common.js";
import ScrollArea from "react-scrollbar";
import BlockUi from "react-block-ui";
const download = require("image-downloader");

var fileDownload = require("js-file-download");
let a = [];
const marital_status = ["none", "Married", "Single", "Divorced", "Widowed"];
const status = ["No", "Yes"];
class ParticipantDetails extends Component {
    constructor(props, context) {
        super(props, context);
        this.participantDetailsRef = React.createRef();
        this.state = {
            AllupdateModalShow: false,
            showModal_PE: false,
            allupdates: {},
            percent: [],
            documents: [],
            activeWord: [],
            showAssignModal: false,
            crm_user_id: "",
            show: false,
            latestStageStates: 2,
            showModalParked: false,
            permissions: getPermission() == undefined ? [] : JSON.parse(getPermission()),
            filterVal: "",
            details: {},
            participant_id: "",
            notesList: [],
            kindetails: {},
            docList: [],
            participant_id: this.props.props.match.params.id,
            task_name: "",
            priority: "",
            due_date: "",
            task_notes_txt_area: "",
            stage_documents: [],
            docType: "",
            participantDocs: [],
            stage_dropdown: [],
            docs: [],
            category2: null,
            booking_status: "",
            add_stage_status: 0,
            fund_lock: false,
            stageFile: [],
            disablemodal: false,
            showdocupload: false,
            stageDocsTitle: "",
            docsTitle: "",
            refresh: false,
            category3: [],
            service_agreement: [],
            funding_consent: [],
            details: { kin_details: [], participant_address: [] },
            plan_category: [],
            fetch_category: "current",
            fetch_plan_category: [
                {
                    label: "Current Documents",
                    value: "current"
                },
                {
                    label: "Archived Documents",
                    value: "archive"
                }
            ],
            docs: {
                cat_documents: [],
                other_documents: [],
                plan_documents: []
            },
            selected_support_category: "",
            disable_doc: false,
            category_docs: [],
            loading: false,
            loading_Modal: false,
            loading_View_Plan_Attachement_File: false
        };
    }
    notes_list = str => {
        postData("crm/CrmParticipant/latest_updates", str).then(result => {
            if (result.data.length > 0) {
                this.setState({ allupdates: result.data });
            }
        });
    };
    plan_category_list = str => {
        postData("common/Common/get_document_category_by_user_type", str).then(result => {
            if (result.data.length > 0) {
                this.setState({ plan_category: result.data });
            }
        });
    };

    showModal_PE = id => {
        if (id == "AllupdateModalShow") {
            var str = { participantId: this.state.participant_id };
            this.notes_list(str);
            this.getAllStages();
        }

        let state = {};
        if (id == "showModal_PE") {
            this.getDocsbyCategory(0);
            this.getAttachmentCategory();
        }
        state[id] = true;
        this.setState(state);
    };
    closeModal_PE = id => {
        let state = {};
        state[id] = false;
        state["showdocupload"] = false;
        state["docsTitle"] = "";
        state["category2"] = "";
        state["filename"] = "";
        state["category3"] = [];
        state["fileValue"] = "";
        var removeDownload = this.state.category_docs;
        if (typeof removeDownload === "undefined") {
        } else {
            removeDownload.map((value, idx) => {
                removeDownload[idx]["is_active"] = false;
            });
            state["category_docs"] = removeDownload;
        }
        this.setState(state);
    };
    showDocumentUpload = e => {
        this.setState({ showdocupload: true });
    };
    stageFileHandler = event => {
        let filenames = [];
        for (let i = 0; i < event.target.files.length; i++) {
            filenames.push(event.target.files[i].name);
        }
        this.setState({
            [event.target.name]: event.target.files,
            stageFilename: filenames
        });
    };
    submit = (e, id) => {
        e.preventDefault();
        if (this.state.crm_user_id != "") {
            var inputNote = {};
            inputNote["user"] = this.state.crm_user_id;
            inputNote["participant_id"] = id;
            var str = inputNote;
            this.setState({ loading: true }, () => {
                postData("crm/CrmParticipant/update_assignee", str).then(result => {
                    if (result.status) {
                        toast.success(<ToastUndo message={"Assignee Changed successfully."} showType={"s"} />, {
                            // toast.success("Note Added successfully", {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.setState({ showAssignModal: false }, () => this.getParticipantDetails());
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                            // toast.error(result.error, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false });
                });
            });
        } else {
            this.setState({ crm_user_id_error: true });
        }
    };
    errorShowInTooltip = ($key, msg) => {
        var state = this.state;
        return state[$key + "_error"] ? (
            <div className={"tooltip custom-tooltip fade top in" + (state[$key + "_error"] ? " select-validation-error" : "")} role="tooltip">
                <div className="tooltip-arrow"></div>
                <div className="tooltip-inner">{msg}.</div>
            </div>
        ) : (
            ""
        );
    };
    submitStageDocs = e => {
        this.setState({ progress: "0" });
        e.preventDefault();
        const formData = new FormData();
        if (this.state.stageFile.length > 0) {
            for (var x = 0; x < this.state.stageFile.length; x++) {
                formData.append("crmParticipantFiles[]", this.state.stageFile[x]);
            }
            formData.append("crmParticipantId", this.state.participant_id);
            formData.append("docsTitle", this.state.stageDocsTitle);
            formData.append("category", this.state.stageId);
            this.setState({ loading: true, disablemodal: true }, () => {
                postImageData("crm/CrmParticipant/uploading_crm_paricipant_stage_docs", formData, this).then(result => {
                    if (result.status) {
                        this.setState({
                            disablemodal: false,
                            stageDocsTitle: "",
                            stageFile: []
                        });
                        toast.success(<ToastUndo message={"Document Added successfully."} showType={"s"} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });

                        this.getIntakeInfomation(this.state.stageId);
                        this.getIntakeDoc(this.state.stageId);
                        this.getLatestSage();
                        this.setState({
                            success: true,
                            notes_txt_area: "",
                            show: false
                        });
                    } else {
                        this.setState({ disablemodal: false });
                        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false });
                });
            });
        }
    };
    show = () => {
        this.setState({ show: true });
    };
    handleClose = () => {
        this.setState({ show: false });
    };
    showAssignModal = () => {
        this.setState({ showAssignModal: true });
    };
    closeAssignModal = () => {
        this.setState({ showAssignModal: false });
    };
    selectChanges = (selectedOption, fieldname) => {
        var selectField = this.state;
        selectField[fieldname] = selectedOption;
        selectField[fieldname + "_error"] = false;
        this.setState(selectField);
    };

    showModal2 = id => {
        this.getIntakeInfomation(id);
        this.getIntakeDoc(id);
        this.setState({ showModal2: true, stageId: id });
        this.getStages();
    };

    showModalParked2 = (status, stage_id) => {
        this.setState({
            showModalParked: true,
            stageId: stage_id,
            stage_status: status
        });
    };
    closeModalParked = () => {
        this.setState({ 
            showModalParked: false,
            add_stage_status: 0,
            task_notes_txt_area: "",
            add_task: 0,
            task_name: "",
            priority: "",
            due_date: "",
        });
    };

    fileChangedHandler = event => {
        let filenames = [];
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                filenames.push(event.target.files[i].name);
            }
            if (event.target.files[0].size > 5000000) {
                // alert('file shoulnt be more than 5mb');
                toastMessageShow("file shouldn't be more than 5mb", "e");
                this.setState({
                    selectedFile: [],
                    filename: "No files Selected",
                    fileValue: ""
                });
            } else {
                this.setState({
                    selectedFile: event.target.files,
                    filename: filenames,
                    fileValue: event.target.value
                });
            }
        }
    };

    fileHandler = event => {
        if (event.target.files.length > 0) {
            let filenames = [];
            for (let i = 0; i < event.target.files.length; i++) {
                filenames.push(event.target.files[i].name);
            }
            if (event.target.files[0].size > 5000000) {
                // alert('file shoulnt be more than 5mb');
                toastMessageShow("File size should not be more than 5 MB", "e");

                this.setState({
                    selectedFile: [],
                    filename: "No files Selected",
                    fileValue: ""
                });
            } else {
                this.setState({
                    selectedFile: event.target.files,
                    filename: filenames,
                    fileValue: event.target.value
                });
            }
        }
    };

    componentDidMount() {
        this.participantDetailsRef.current.wrappedInstance.getParticipantDetails(this.state.participant_id);
        this.plan_category_list();
        this.getStages();
        this.getLatestSage();
        this.getAllStages();
        this.getIntakePercentage();
        //this.getStageDocs();
        this.getDocs(0);
        // this.getDocsbyCategory(0);
        this.getState();
    }
    getState = () => {
        postData("participant/ParticipantDashboard/get_state", []).then(result => {
            if (result.status) {
                this.setState({ stateList: result.data }, () => {
                    this.props.states_update(result.data);
                });

                this.state.stateList &&
                    this.state.stateList.map((stat, i) => {
                        if (stat.value == this.state.details.state) {
                            this.setState({ cstate: stat.label });
                        }
                    });
            }
        });
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.participaintDetails.id > 0 || this.props.participaintDetails.id != nextProps.participaintDetails.id) {
            this.setState({ details: nextProps.participaintDetails });
        }
        if (LivingSituationOption(0) != "undefined" && this.state.details.living_situation) {
            LivingSituationOption(0).map((livSit, i) => {
                if (livSit.value == this.state.details.living_situation) {
                    this.setState({ livSituation: livSit.label });
                }
            });
        }
    }
    uploadHandler1 = (e, form_id) => {
        e.preventDefault();
        let c_validation = true;
        if (form_id == "crm_participant_stage_docs1") {
            c_validation = this.custom_validation_doc("category3");
        }
        jQuery("#" + form_id).validate({ ignore: [] });
        if (jQuery("#" + form_id).valid() && c_validation) {
            this.setState({ progress: "0" });
            this.setState({ submit_form: false, disablemodal: false });
            const formData = new FormData();
            for (var x = 0; x < this.state.selectedFile.length; x++) {
                formData.append("crmParticipantFiles[]", this.state.selectedFile[x]);
            }
            formData.append("crmParticipantId", this.state.participant_id);
            formData.append("docsTitle", this.state.docsTitle);
            var data1 = "stage";
            formData.append("type", data1);
            formData.append("category", this.state.category3);
            formData.append("stage_id", this.state.stageId);
            this.setState({ disablemodal: true });
            postImageData("crm/CrmParticipant/upload_documents", formData, this).then(result => {
                if (result.status) {
                    this.setState({
                        docsTitle: "",
                        selectedFile: [],
                        filename: "",
                        fileValue: ""
                    });
                    this.closeModal_PE("showModal1");
                    toast.success(<ToastUndo message={"Uploaded successfully."} showType={"s"} />, {
                        // toast.success("uploaded successfully.", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                    this.getDocs();
                    this.getIntakeDoc(this.state.stageId);
                    this.setState({ submit_form: true, category: 0 }, () => this.getDocsbyCategory(0));
                } else {
                    this.setState({ disablemodal: false });
                    toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                        // toast.error(result.error, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
                this.setState({ disablemodal: false });
            });
        }
    };
    uploadHandler = (e, form_id, type = null) => {
        e.preventDefault();
        let c_validation = true;
        if (form_id == "crm_participant_stage_docs") {
            c_validation = this.custom_validation_doc("category2");
        }

        jQuery("#" + form_id).validate({ ignore: [] });

        if (jQuery("#" + form_id).valid() && c_validation) {
            this.setState({ progress: "0", loading_Modal: true });
            this.setState({ submit_form: false, disablemodal: false });
            const formData = new FormData();
            for (var x = 0; x < this.state.selectedFile.length; x++) {
                formData.append("crmParticipantFiles[]", this.state.selectedFile[x]);
            }
            formData.append("crmParticipantId", this.state.participant_id);
            formData.append("docsTitle", this.state.docsTitle);
            if (type == "manage") {
                var data = "participant";
                formData.append("type", data);
                formData.append("category", this.state.category2);
                formData.append("stage_id", this.state.stageId);
                this.setState({ disablemodal: true });
                postImageData("crm/CrmParticipant/upload_documents", formData, this).then(result => {
                    if (result.status) {
                        this.setState({
                            docsTitle: "",
                            selectedFile: [],
                            filename: ""
                        });
                        this.closeModal_PE("showModal1");
                        toast.success(<ToastUndo message={"Uploaded successfully."} showType={"s"} />, {
                            // toast.success("uploaded successfully.", {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.getDocs();
                        this.getAttachmentCategory();
                    } else {
                        this.setState({ disablemodal: false });
                        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                            // toast.error(result.error, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ disablemodal: false, loading_Modal: false });
                    this.setState({ submit_form: true, category: 0 }, () => this.getDocsbyCategory(0));
                });
            } else {
                formData.append("category", this.state.category);
                postImageData("crm/CrmParticipant/uploading_crm_paricipant_stage_docs", formData, this).then(result => {
                    if (result.status) {
                        this.setState({
                            docsTitle: "",
                            selectedFile: [],
                            category: "",
                            filename: ""
                        });
                        this.closeModal_PE("showModal1");
                        toast.success(<ToastUndo message={"Uploaded successfully."} showType={"s"} />, {
                            // toast.success("uploaded successfully.", {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                            // toast.error(result.error, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ submit_form: true });
                });
            }
        }
    };
    getParticipantDetails = () => {
        this.setState({ loading: true }, () => {
            postData("crm/CrmParticipant/get_prospective_participant_stage_details", {
                id: this.state.participant_id
            }).then(result => {
                if (result.status) {
                    this.setState({
                        details: result.data
                    });
                }
                this.setState({ loading: false });
            });
        });
    };
    getStages = () => {
        if (this.state.stageId) {
            let stage_name = "";
            this.setState({ loading: true }, () => {
                var intakeStr = JSON.stringify({ id: this.state.stageId });
                postData("crm/CrmStage/get_stage_info_by_id", intakeStr).then(result => {
                    if (result[0].name) {
                        this.setState({ stage_name: result[0].name });
                    }
                    this.setState({ loading: false });
                });
            });
        }
    };
    getAllStages = () => {
        let stage_name = "";
        this.setState({ loading: true }, () => {
            var intakeStr = "{}";
            postData("crm/CrmStage/get_all_stage", intakeStr).then(result => {
                if (result.status) {
                    //this.setState({ stage_info: result.data, stage_dropdown: result.stage });
                }
                this.setState({ loading: false });
            });
        });
    };
    getLatestSage = () => {
        let latestStage = "";
        this.notes_list({ participantId: this.state.participant_id });
        this.setState({
            latestDate: typeof this.state.allupdates[0] != "undefined" ? this.state.allupdates[0].created : "",
            latestStage: typeof this.state.allupdates[0] != "undefined" ? this.state.allupdates[0].title : ""
        });

        var intakeStr = JSON.stringify({
            crm_participant_id: this.state.participant_id
        });
        postData("crm/CrmStage/get_latest_stage", intakeStr).then(result => {
            if (result.status) {
                this.setState({
                    latestDate: result.data.latest_date,
                    // latestStage: result.data[0].latest_stage_name,
                    latestStageStates: result.data[0].latest_stage,
                    booking_status: result.data.booking_status,
                    fund_lock: result.locked
                });
            }
            this.setState({ loading: false });
        });
    };
    getIntakeInfomation = (id = 1) => {
        let notesList = [];
        this.setState({ loading: true }, () => {
            var intakeStr = JSON.stringify({
                crm_participant_id: this.state.participant_id,
                stage_id: id
            });
            postData("crm/CrmStage/list_intake_info", intakeStr).then(result => {
                if (result) {
                    this.setState({ notesList: result });
                    this.getLatestSage();
                }
                this.setState({ loading: false });
            });
        });
    };
    deletefile = () => {
        this.setState({
            selectedFile: [],
            filename: "",
            fileValue: ""
        });
    };
    getIntakeDoc = (id = 1) => {
        let docList = [];
        this.setState({ loading: true }, () => {
            var intakeStr = JSON.stringify({
                crm_participant_id: this.state.participant_id,
                stage_id: id
            });
            postData("crm/CrmStage/intake_docs_list", intakeStr).then(result => {
                if (result) {
                    this.setState({ docList: result });
                    this.getLatestSage();
                }
                this.setState({ loading: false });
            });
        });
    };
    getStageDocs = e => {
        this.setState({ loading: true }, () => {
            var id = JSON.stringify({
                crm_participant_id: this.props.props.match.params.id
            });
            postData("crm/CrmParticipant/get_participant_stage_docs", id).then(result => {
                if (result.status) {
                    this.setState({
                        stage_documents: result.data,
                        activeWord: result.data
                    });
                }
                this.setState({ loading: false });
            });
        });
    };
    getDocs = (ids = 0) => {
        this.setState({ loading: true }, () => {
            var id = JSON.stringify({
                type: ids,
                crm_participant_id: this.props.props.match.params.id
            });
            postData("crm/CrmParticipant/get_all_docs", id).then(result => {
                if (result.status) {
                    this.setState({ docs: result.data });
                } else {
                    this.setState({ docs: [] });
                }
                this.setState({ loading: false });
            });
        });
    };

    getDocsbyCategory = (ids = 0) => {
        this.setState({ loading: true }, () => {
            var id = JSON.stringify({
                type: ids,
                crm_participant_id: this.props.props.match.params.id
            });
            postData("crm/CrmParticipant/get_all_docs_by_category", id).then(result => {
                if (result.status) {
                    this.setState({ category_docs: result.data });
                } else {
                    this.setState({ category_docs: [] });
                }
                this.setState({ loading: false });
            });
        });
    };

    getAttachmentCategory = () => {
        const data = JSON.stringify({
            crm_participant_id: this.props.props.match.params.id
        });
        postData("crm/CrmParticipant/get_attachment_modal_category", data).then(result => {
            if (result.status) {
                this.setState({ fetch_plan_category: result.data });
            } 
        });
    };
    deleteNote = id => {
        let msg = (
            <span>
                Are you sure you want to archive this item? <br /> Once archived, this action can not be undone.
            </span>
        );
        return new Promise((resolve, reject) => {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className="custom-ui">
                            <div className="confi_header_div">
                                <h3>Confirmation</h3>
                                <span
                                    className="icon icon-cross-icons"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                ></span>
                            </div>
                            <p>{msg}</p>
                            <div className="confi_but_div">
                                <button
                                    className="Confirm_btn_Conf"
                                    onClick={() => {
                                        postData("crm/CrmStage/delete_intake", {
                                            intake_id: id
                                        }).then(result => {
                                            if (result.status) {
                                                toast.success(<ToastUndo message={"Note Deleted successfully"} showType={"s"} />, {
                                                    // toast.success("Note Deleted successfully", {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                                onClose();
                                                this.getIntakeInfomation(this.state.stageId);
                                                this.getIntakeDoc(this.state.stageId);
                                                this.getLatestSage();
                                                this.setState({
                                                    success: true,
                                                    task_notes_txt_area: "",
                                                    showModalParked: false
                                                });
                                            } else {
                                                toast.error(<ToastUndo message={result.msg} showType={"e"} />, {
                                                    // toast.error(result.error, {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                            }
                                        });
                                    }}
                                >
                                    Confirm
                                </button>
                                <button
                                    className="Cancel_btn_Conf"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                >
                                    {" "}
                                    Cancel
                                </button>
                            </div>
                        </div>
                    );
                }
            });
        });
    };

    submitNote = e => {
        e.preventDefault();

        var validator = jQuery("#add_note").validate({ ignore: [] });
        if (!this.state.loading && jQuery("#add_note").valid()) {
            var inputNote = {};
            inputNote["notes"] = this.state.notes_txt_area;
            inputNote["crm_participant_id"] = this.state.participant_id;
            inputNote["stage_id"] = this.state.stageId;

            var str = JSON.stringify(inputNote);
            this.setState({ loading: true }, () => {
                postData("crm/CrmStage/create_intake_info", str).then(result => {
                    if (result.status) {
                        toast.success(<ToastUndo message={"Note Added successfully."} showType={"s"} />, {
                            // toast.success("Note Added successfully", {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });

                        this.getIntakeInfomation(this.state.stageId);
                        this.getIntakeDoc(this.state.stageId);
                        this.getLatestSage();
                        this.setState({
                            success: true,
                            notes_txt_area: ""
                        });
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                            // toast.error(result.error, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false });
                });
            });
        } else {
            validator.focusInvalid();
        }
    };
    submitTaskNote = e => {
        e.preventDefault();

        var validator = jQuery("#add_task_note").validate({ ignore: [] });
        if (!this.state.loading && jQuery("#add_task_note").valid()) {
            var inputNote = {};

            inputNote["notes"] = this.state.task_notes_txt_area;
            inputNote["crm_participant_id"] = this.state.participant_id;
            inputNote["stage_id"] = this.state.stageId;
            inputNote["status"] = this.state.stage_status;
            if (this.state.add_task == 1) {
                inputNote["task_name"] = this.state.task_name;
                inputNote["priority"] = this.state.priority;
                inputNote["due_task"] = this.state.due_date.format('YYYY-MM-DD');
                inputNote["assigned_to"] = this.state.details.assigned_id;
            }
            var str = JSON.stringify(inputNote);
            this.setState({ loading: true }, () => {
                postData("crm/CrmStage/update_stage_status", str).then(result => {
                    if (result.status) {
                        toast.success(<ToastUndo message={"Note Added successfully."} showType={"s"} />, {
                            // toast.success("Note Added successfully", {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });

                        this.getIntakeInfomation(this.state.stageId);
                        this.getIntakeDoc(this.state.stageId);
                        this.getLatestSage();
                        this.setState({
                            success: true,
                            task_notes_txt_area: "",
                            showModalParked: false,
                            refresh: true,
                            add_stage_status: 0,
                            task_notes_txt_area: "",
                            add_task: 0,
                            task_name: "",
                            priority: "",
                            due_date: ""
                        });
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                            // toast.error(result.error, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false });
                });
            });
        } else {
            validator.focusInvalid();
        }
    };

    onClickFunction = (idx, type, key = 0) => {
        let activeDownloads = this.state.category_docs;
        if (activeDownloads[key]["is_active"] == true) activeDownloads[key]["is_active"] = false;
        else activeDownloads[key]["is_active"] = true;

        this.setState({ category_docs: activeDownloads });
    };
    archiveDocuments = e => {
        let status = true;
        this.state.category_docs.map((value, idx) => {
            if (value.is_active) {
                status = false;
            }
        });

        if (status) {
            toast.dismiss();
            toast.error(<ToastUndo message={"Please select atleast one file to continue"} showType={"e"} />, {
                // toast.error(result.error, {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
            return false;
        }

        this.setState({ loading: true }, () => {
            var data = JSON.stringify({ ids: this.state.category_docs });
            var msg = (
                <span>
                    Are you sure you want to archive this item? <br /> Once archived, this action can not be undone.
                </span>
            );
            var url = "crm/CrmParticipant/archive_partcipant_stage_docs";

            return new Promise((resolve, reject) => {
                confirmAlert({
                    customUI: ({ onClose }) => {
                        return (
                            <div className="custom-ui">
                                <div className="confi_header_div">
                                    <h3>Confirmation</h3>
                                    <span
                                        className="icon icon-cross-icons"
                                        onClick={() => {
                                            onClose();
                                            resolve({ status: false });
                                        }}
                                    ></span>
                                </div>
                                <p>{msg}</p>
                                <div className="confi_but_div">
                                    <button
                                        className="Confirm_btn_Conf"
                                        onClick={() => {
                                            postData(url, data).then(result => {
                                                if (result.status) {
                                                    this.getDocsbyCategory(this.state.category);
                                                    this.getDocs();
                                                    resolve({ result });
                                                    toast.dismiss();
                                                    toast.success(<ToastUndo message="Archived Successfully" showType={"e"} />, {
                                                        // toast.error(result.error, {
                                                        position: toast.POSITION.TOP_CENTER,
                                                        hideProgressBar: true
                                                    });
                                                    this.setState({
                                                        category: this.state.category
                                                    });
                                                    onClose();
                                                } else {
                                                    onClose();
                                                    toast.dismiss();
                                                    toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                                                        // toast.error(result.error, {
                                                        position: toast.POSITION.TOP_CENTER,
                                                        hideProgressBar: true
                                                    });
                                                }
                                            });
                                        }}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        className="Cancel_btn_Conf"
                                        onClick={() => {
                                            onClose();
                                            resolve({ status: false });
                                        }}
                                    >
                                        {" "}
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        );
                    }
                });
            });
        });
    };
    downloadSelectedFile = () => {
        var participant_id = this.props.props.match.params.id;
        var requestData = {
            participant_id: participant_id,
            downloadData: this.state.category_docs
        };
        this.setState({ loading_Modal: true });
        postData("crm/CrmParticipant/download_participant_stage_selected_file", requestData).then(result => {
            if (result.status) {
                // window.location.href = BASE_URL + "archieve/" + result.zip_name;
                let data = {
                    participant_id: participant_id,
                    path: result.zip_name
                };
                postDataDownloadZip("download/doument_file_crm", data, result.zip_name);
                var removeDownload = this.state.category_docs;
                removeDownload.map((value, idx) => {
                    removeDownload[idx]["is_active"] = false;
                });

                this.setState({ category_docs: removeDownload });
            } else {
                toast.dismiss();
                toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                    // toast.error(result.error, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
            this.setState({ loading_Modal: false });
        });
    };

    selectChange = (selectedOption, fieldname) => {
        var newSelectedValue = this.state.newSelectedValue ? this.state.newSelectedValue : {};
        let staff_id = "";
        newSelectedValue[fieldname] = selectedOption;
        newSelectedValue[fieldname + "_error"] = false;
        if (typeof newSelectedValue.assign_to != "undefined") {
            staff_id = newSelectedValue.assign_to.value;
        }
        let stage_id = newSelectedValue.view_by_status;
        this.setState({ newSelectedValue });

        var str = { staff_id: staff_id, stage_id: stage_id };
        this.notes_list(str);
    };

    getIntakePercentage = e => {
        var intake = JSON.stringify({
            crm_participant_id: this.props.props.match.params.id
        });
        postData("crm/CrmParticipant/get_intake_percent", intake).then(result => {
            if (result) {
                this.setState({ percent: result });
            }
        });
    };
    setParticipantState = e => {
        this.setState({ filterVal: e });
        var intake = JSON.stringify({
            crm_participant_id: this.props.props.match.params.id,
            state: e
        });
        postData("crm/CrmParticipant/change_participant_state", intake).then(result => {
            if (result) {
                this.setState({ percent: result });
            }
        });
    };

    custom_validation_doc = key => {
        var return_var = true;
        var state = this.state;
        var List = [{ key: "category3" }, { key: "category2" }];
        List.map((object, sidx) => {
            if (key == object.key) {
                if (state[object.key] == null || state[object.key] == "") {
                    state[object.key + "_error"] = true;
                    this.setState(state);
                    return_var = false;
                }
            }
        });
        return return_var;
    };
    errorShowInTooltipDoc = ($key, array) => {
        var state = this.state;
        return state[$key + "_error"] ? (
            <div className={"tooltip custom-tooltip fade top in" + (state[$key + "_error"] ? " select-validation-error" : "")} role="tooltip">
                <div className="tooltip-arrow"></div>
                <div className="tooltip-inner">{array}</div>
            </div>
        ) : (
            ""
        );
    };
    viewDocuments = filePath => {
        this.setState({ loading_View_Plan_Attachement_File: true });
        let data = {
            crmParticipantId: this.state.participant_id,
            path: filePath
        };
        postDataDownload("download/file", data, filePath).then(() => {
            this.setState({ loading_View_Plan_Attachement_File: false });
        });
    };
    viewPlanDocuments = filePath => {
        this.setState({ loading_View_Plan_Attachement_File: true });
        let data = {
            crmParticipantId: this.state.participant_id,
            path: filePath
        };
        postDataDownload("download/file_plan", data, filePath).then(() => {
            this.setState({ loading_View_Plan_Attachement_File: false });
        });
    };
    // viewDocuments = filePath => {
    //     let data = {
    //         crmParticipantId: this.props.props.match.params.id,
    //         path: filePath
    //     };
    //     postDataDownload("download/file", data, filePath);
    // };
    // viewPlanDocuments = filePath => {
    //     let data = {
    //         crmParticipantId: this.props.props.match.params.id,
    //         path: filePath
    //     };
    //     postDataDownload("download/file_plan", data, filePath);
    // };

    render() {
        let now = 0;
        if (this.state.percent.length != 0) {
            now = this.state.percent.data.level;
        }
        now = now == 0 ? 10 : now;

        var options = [
            { value: "one", label: "One" },
            { value: "two", label: "Two" }
        ];
        const subComponentDataMapper = row => {
            let data = row.row._original;
            return <div className="other_conter">{data.description}</div>;
        };
        var prioritylevel = [
            { value: "1", label: "Low" },
            { value: "2", label: "Medium" },
            { value: "3", label: "High" }
        ];

        const columns = [
            {
                Header: "Case ID:",
                accessor: "caseId",
                headerClassName: "Th_class_d1 _align_c__",
                maxWidth: 140,
                className: this.state.activeCol === "name" && this.state.resizing ? "borderCellCls" : "Tb_class_d1",
                Cell: props => (
                    <span className="h-100" style={{ justifyContent: "center" }}>
                        <div>{props.value}</div>
                    </span>
                )
            },
            {
                Header: "Category:",
                accessor: "name",
                maxWidth: 120,
                headerClassName: "Th_class_d1 _align_c__",
                className: this.state.activeCol === "name" && this.state.resizing ? "borderCellCls" : "Tb_class_d1",
                Cell: props => (
                    <span className="h-100" style={{ justifyContent: "center" }}>
                        <div>{props.value}</div>
                    </span>
                )
            },
            {
                Header: "Event Date",
                accessor: "created",
                maxWidth: 120,
                Cell: props => <div>{props.value}</div>
            },
            {
                Header: "Description",
                accessor: "title",
                headerStyle: { border: "0px solid #fff" }
            },
            {
                expander: true,
                sortable: false,
                Expander: ({ isExpanded, ...rest }) => (
                    <div>{isExpanded ? <i className="icon icon-arrow-up"></i> : <i className="icon icon-arrow-down"></i>}</div>
                ),
                headerStyle: { border: "0px solid #fff" }
            }
        ];
        const booking_status_color = {
            Successful: "clr_green",
            Parked: "clr_yellow",
            Rejected: "clr_red"
        };
        let ListDocumentType = listDocumentList(0);

        return (
            <div className="container-fluid">
                <CrmPage ref={this.participantDetailsRef} pageTypeParms={"participant_details"} />
                <BlockUi tag="div" blocking={this.state.loading_View_Plan_Attachement_File}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="py-4 bb-1">
                                <a className="back_arrow d-inline-block" onClick={() => this.props.props.history.goBack()}>
                                    <span className="icon icon-back1-ie"></span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="row d-flex py-4">
                                <div className="col-md-6 align-self-center br-1">
                                    <div className="h-h1 ">{this.props.showPageTitle}</div>
                                </div>
                                <div className="col-md-6">
                                    <div className="Lates_up_1">
                                        <div className="Lates_up_a col-md-3 align-self-center text-right">Latest Update:</div>
                                        <div className="col-md-9 justify-content-between pr-0">
                                            <div className="Lates_up_b">
                                                <div className="Lates_up_txt align-self-center col-md-4">
                                                    {this.state.latestStage ? this.state.latestStage : "Stage 1: NDIS Intake Participant Submission"}{" "}
                                                    {this.state.stageId != 6 ? "Information" : ""}
                                                </div>
                                                {/* <div className="Lates_up_btn br-1 bl-1"><i className="icon icon-view1-ie"></i><span>View Attachment</span></div> */}
                                                <div className="Lates_up_btn" onClick={() => this.showModal_PE("AllupdateModalShow")}>
                                                    <i className="icon icon-view1-ie"></i>
                                                    <span>View all</span>
                                                </div>
                                                <AllUpdates
                                                    allupdates={this.state.allupdates}
                                                    stages={this.state.stage_info ? this.state.stage_info : ""}
                                                    onSelectDisp={this.state.newSelectedValue ? this.state.newSelectedValue : ""}
                                                    selectedChange1={e => this.selectChange(e, "view_by_status")}
                                                    selectedChange={e => this.selectChange(e, "assign_to")}
                                                    showModal={this.state.AllupdateModalShow}
                                                    handleClose={() => this.closeModal_PE("AllupdateModalShow")}
                                                />
                                            </div>
                                            <div className="Lates_up_2">
                                                <div className="Lates_up_txt2 btn-1">Date: {this.state.latestDate}</div>
                                                {/* <div className="Lates_up_time_date"> Date: 01/01/01 - 11:32AM</div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="bt-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* version 4 start */}
                    <div className="row mb-5">
                        <div className="col-lg-12 mt-5">
                            <div className="v4_pro_d1__">
                                <div className="progress-b1">
                                    <div className="overlay_text_p01">Intake Progress {now ? now : now}% Complete</div>
                                    <ProgressBar className="progress-b2" now={now ? now : now}></ProgressBar>
                                </div>

                                <div className="v4_pro_d1_a1__">
                                    <div className="v4_1 pr-5">
                                        <div className="Partt_d1_txt_4">
                                            <strong>{this.state.details.FullName ? this.state.details.FullName : "N/A"}</strong>
                                            <span></span>
                                        </div>
                                        <span
                                            className={
                                                "slots_sp " +
                                                (booking_status_color.hasOwnProperty(this.state.booking_status)
                                                    ? booking_status_color[this.state.booking_status]
                                                    : "clr_blue")
                                            }
                                        >
                                            {this.state.booking_status}
                                        </span>
                                    </div>

                                    <div className="v4_1">
                                        <div className="Partt_d1_txt_1">
                                            <strong>Assigned to:</strong>
                                        </div>
                                        <div className="v4_1 d-flex ">
                                            <div className="Partt_d1_txt_1 my-3 align-self-center">
                                                <span> {this.state.details.assigned_to ? this.state.details.assigned_to : "N/A"}</span>
                                            </div>

                                            {this.state.permissions.access_crm_admin ? (
                                                <div className="Partt_d1_txt_1 my-3">
                                                    <a className="btn-1 s2 px-4 ml-3" onClick={this.showAssignModal}>
                                                        Change
                                                    </a>
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    </div>

                                    {
                                        // <div className="v4_1">
                                        //     <div className="Partt_d1_txt_2 pt-4"><strong>Department:</strong></div>
                                        //     <div className="Partt_d1_txt_1 my-3"><strong> {(this.state.details.participant_department) ? this.state.details.participant_department : 'N/A'}</strong></div>
                                        // </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-5">
                        <div className="col-lg-12 mt-5">
                            <div className="v4_pro_d2__">
                                <div className="row">
                                    <div className="col-md-9 pt-5 pb-3">
                                        <div className="Partt_d1_txt_1">
                                            <strong> Participant Information</strong>
                                            <span></span>
                                        </div>
                                    </div>
                                    <div className="col-md-3 pt-3">
                                        <Link
                                            className="btn-1"
                                            to={ROUTER_PATH + "admin/crm/editProspectiveParticipant/" + this.state.participant_id}
                                        >
                                            Edit Participants Info
                                        </Link>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="bt-1"></div>
                                    </div>
                                </div>

                                <div className="row pt-3">
                                    <div className="col-md-3">
                                        <ListingA
                                            titleHadding={"NDIS No.:"}
                                            showValueItems={this.state.details.ndis_num ? this.state.details.ndis_num : "N/A"}
                                        />
                                        <ListingA
                                            titleHadding={"Medicare No.:"}
                                            showValueItems={this.state.details.medicare_num ? this.state.details.medicare_num : "N/A"}
                                        />
                                        <ListingA titleHadding={"CRN:"} showValueItems={this.state.details.crn ? this.state.details.crn : "N/A"} />
                                        <ListingA
                                            titleHadding={"Phone:"}
                                            showValueItems={this.state.details.phone ? this.state.details.phone : "N/A"}
                                        />
                                        <ListingA
                                            titleHadding={"Email:"}
                                            showValueItems={this.state.details.email ? this.state.details.email : "N/A"}
                                        />
                                        <ListingA titleHadding={"D.O.B:"} showValueItems={this.state.details.dob ? this.state.details.dob : "N/A"} />
                                        <ListingA
                                            titleHadding={"Marital Status:"}
                                            showValueItems={
                                                marital_status[this.state.details.marital_status]
                                                    ? marital_status[this.state.details.marital_status]
                                                    : "N/A"
                                            }
                                        />
                                        <div className="Partt_d1_txt_3 my-4">
                                            <b>Of Aboriginal or Torres Strait Islander descent?:</b>
                                            <div>{this.state.details.aboriginal_tsi == 1 ? "Yes" : "No"}</div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <ListingB
                                            titleHadding={"Living Situation: "}
                                            showValueItems={
                                                this.state.details.living_situation_name ? this.state.details.living_situation_name : "N/A"
                                            }
                                        />
                                        {this.state.details.participant_address.map((value, index) => (
                                            <React.Fragment>
                                                <div className="Partt_d1_txt_2 my-4">
                                                    <strong className={"crm_H_set_2"}>Primary Address: </strong>{" "}
                                                    <span>
                                                        {value.street ? value.street + "," : "N/A"} {value.city ? value.city + "," : ""}{" "}
                                                        {value.state ? value.state : ""} {value.postal ? value.postal : ""}
                                                    </span>
                                                </div>
                                            </React.Fragment>
                                        ))}
                                        {
                                            // <div className="Partt_d1_txt_2 my-4">
                                            //     <strong className={"crm_H_set_2"}>
                                            //         Secondary Address:{" "}
                                            //     </strong>{" "}
                                            //     <span>
                                            //         {this.state.details.primary_address
                                            //             ? this.state.details.primary_address + ","
                                            //             : "N/A"}
                                            //         {this.state.details.city
                                            //             ? this.state.details.city + ","
                                            //             : ""}
                                            //         {this.state.cstate ? this.state.cstate : ""}
                                            //         {this.state.details.postal
                                            //             ? this.state.details.postal
                                            //             : ""}
                                            //     </span>
                                            // </div>
                                            // {this.state.details.participant_address.map((value, index) => (
                                            //     <React.Fragment>
                                            //         <div className="Partt_d1_txt_2 my-4"><strong className={'crm_H_set_2'}>Secondary Address: </strong> <span>{(value.street) ? value.street + ',' : 'N/A'} {(value.city) ? value.city + ',' : ''} {(value.state) ? value.state : ''} {(value.postal) ? value.postal : ''}</span></div>
                                            //     </React.Fragment>
                                            // ))}
                                        }
                                        {this.state.details.kin_details.map((value, index) => (
                                            <React.Fragment>
                                                <ListingB titleHadding={"Next Of Kin: "} showValueItems={value.kin_fullname} />
                                                <ListingB titleHadding={"Email: "} showValueItems={value.kin_email || "N/A"} />
                                                <ListingB titleHadding={"Phone:"} showValueItems={value.kin_phone || "N/A"} />
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {this.state.details.relation_to_participant != "Participant" ? (
                                        <div className="col-md-3 Parti_details_div_3">
                                            <div className="Partt_d1_txt_1">
                                                <strong>Reference Details:</strong>
                                            </div>
                                            <ListingC
                                                titleHadding={"Name:"}
                                                showValueItems={this.state.details.ref_fullName ? this.state.details.ref_fullName : "N/A"}
                                            />
                                            <ListingC
                                                titleHadding={"Email:"}
                                                showValueItems={this.state.details.referral_email ? this.state.details.referral_email : "N/A"}
                                            />
                                            <ListingC
                                                titleHadding={"Phone:"}
                                                showValueItems={this.state.details.referral_phone ? this.state.details.referral_phone : "N/A"}
                                            />
                                            <ListingC
                                                titleHadding={"Organisation:"}
                                                showValueItems={this.state.details.referral_org ? this.state.details.referral_org : "N/A"}
                                            />
                                            <div className="Partt_d1_txt_2">
                                                <strong>Relationship to Participant: </strong>
                                            </div>
                                            <div className="Partt_d1_txt_2">
                                                <div>
                                                    {this.state.details.relation_to_participant ? this.state.details.relation_to_participant : "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="col-md-3 Parti_details_div_3">
                                            <div className="Partt_d1_txt_1">
                                                <strong>Reference Details:</strong>
                                            </div>
                                            <div className="Partt_d1_txt_1">
                                                <strong>Relationship to Participant: </strong>
                                            </div>
                                            <div className="Partt_d1_txt_2">
                                                <div>{this.state.details.relation_to_participant ? "Self" : "N/A"}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={this.state.showAssignModal ? "customModal show" : "customModal"}>
                        <div className="custom-modal-dialog Information_modal task_modal" style={{ width: "576px" }}>
                            <div className="custom-modal-body w-100 mx-auto">
                                <div className="custom-modal-header by-1">
                                    <div className="Modal_title">Change Assignee</div>
                                    <i className="icon icon-close1-ie Modal_close_i" onClick={this.closeAssignModal}></i>
                                </div>
                                <form id="create_task">
                                    <div className="row">
                                        <div className="my-3">
                                            <div
                                                className="col-md-8"
                                                style={{
                                                    display: "flex",
                                                    height: " 100%",
                                                    position: "relative",
                                                    justifyContent: "center"
                                                }}
                                            >
                                                {this.errorShowInTooltip("crm_user_id", "Select CRM User")}
                                            </div>
                                            <div className="col-md-12">
                                                <h4 className="my-2 h4_edit__">Search for a User:</h4>
                                            </div>
                                            <div className="col-md-8">
                                                <div className="search_icons_right modify_select">
                                                    <Select.Async
                                                        cache={false}
                                                        clearable={false}
                                                        value={this.state["crm_user_id"]}
                                                        name="crm_user_id"
                                                        required={true}
                                                        loadOptions={getOptionsCrmMembers}
                                                        placeholder="Search"
                                                        onChange={e => this.selectChanges(e, "crm_user_id")}
                                                        className="custom_select"
                                                    />
                                                    {
                                                        // <button><span className="icon icon-search1-ie"></span></button>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bt-1 mt-5 px-0 pt-4 pb-3">
                                        <div className="row d-flex justify-content-end">
                                            <div className="col-md-3">
                                                <a className="btn-1" onClick={e => this.submit(e, this.state.participant_id)}>
                                                    Update
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {this.state.details.fms_cms != "" ? (
                        <div className="row mb-5">
                            <div className="col-lg-12 mt-5 ">
                                <div className="V4_pro_d3__">
                                    <PanelGroup
                                        accordion
                                        id="accordion-controlled-example"
                                        activeKey={this.state.activeKey}
                                        onSelect={this.handleSelect}
                                    >
                                        <Panel eventKey="1">
                                            <Panel.Heading>
                                                <Panel.Title toggle className="v4_panel_title_ mb-0">
                                                    <div>
                                                        <div className="Partt_d1_txt_1">
                                                            <strong>FMS Cases</strong>
                                                        </div>
                                                        <i className="more-less glyphicon glyphicon-plus"></i>
                                                    </div>
                                                </Panel.Title>
                                            </Panel.Heading>

                                            <Panel.Body collapsible className="px-1 py-3">
                                                <div className="col-md-12 schedule_listings">
                                                    <ReactTable
                                                        data={this.state.details.fms_cms}
                                                        columns={columns}
                                                        onPageSizeChange={this.onPageSizeChange}
                                                        defaultPageSize={2}
                                                        showPagination={false}
                                                        previousText={<span className="icon icon-arrow-left privious"></span>}
                                                        nextText={<span className="icon icon-arrow-right next"></span>}
                                                        SubComponent={subComponentDataMapper}
                                                    />
                                                </div>
                                            </Panel.Body>
                                        </Panel>
                                    </PanelGroup>
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    <div className="row mb-5">
                        <div className="col-lg-12 mt-5">
                            <div className="v4_pro_d2__">
                                <div className="row">
                                    <div className="col-md-9 pt-5 pb-3">
                                        <div className="Partt_d1_txt_1">
                                            <strong> Plans and Attachments:</strong>
                                            <span></span>
                                        </div>
                                    </div>
                                    <div className="col-md-3 pt-3">
                                        <a className="btn-1" onClick={() => this.showModal_PE("showModal_PE")}>
                                            Manage Attachments
                                        </a>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="bt-1"></div>
                                    </div>
                                </div>
                                <div className="row mt-5">
                                    <div className="col-md-6 br-1">
                                        <div className="row">
                                            <div className={"row w-100"}>
                                                {this.state.docs.cat_documents.map((value, key) => (
                                                    <React.Fragment>
                                                        <div className={"col-md-6"}>
                                                            <div className="my-5">
                                                                <div className="Partt_d1_txt_2 my-3">
                                                                    <strong>{value.name}</strong>
                                                                </div>

                                                                {value.doc.map((doc, k) => (
                                                                    <div className="my-3">
                                                                        <small>{doc.title}</small>
                                                                        <a className="v-c-btn1 n2" onClick={() => this.viewDocuments(doc.file_path)}>
                                                                            <span>{doc.file_path}</span> <i className="icon icon-view1-ie"></i>
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 pl-5">
                                        <div className="row">
                                            {/* {this.state.docs.plan_documents.map((value, key) => (
                                                <div className={"col-md-6"}>
                                                    <React.Fragment>
                                                        <div className="my-5">
                                                            <div className="Partt_d1_txt_2 my-3">
                                                                <strong>{value.name}</strong>
                                                            </div>
                                                            {value.doc.map((doc, k) => (
                                                                <div className="my-3">
                                                                    <small>{doc.title}</small>
                                                                    <a
                                                                        className="v-c-btn1 n2"
                                                                        onClick={() =>
                                                                            this.viewPlanDocuments(
                                                                                doc.signed_file_path !== "" ? doc.signed_file_path : doc.file_path
                                                                            )
                                                                        }
                                                                    >
                                                                        <span>
                                                                            {doc.signed_file_path !== "" ? doc.signed_file_path : doc.file_path}
                                                                        </span>{" "}
                                                                        <i className="icon icon-view1-ie"></i>
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </React.Fragment>
                                                </div>
                                            ))} */}
                                            {this.state.docs.other_documents.map((value, key) => (
                                                <React.Fragment>
                                                    <div className="col-md-12 pl-5 pr-5 mt-5">
                                                        <div className="Partt_d1_txt_2">
                                                            <strong>{value.name}</strong>
                                                        </div>
                                                    </div>
                                                    {value.doc.map((doc, k) => (
                                                        <div>
                                                            <strong>{doc.title}</strong>
                                                            <div className="my-3 pl-3 col-md-6">
                                                                {parseInt(doc.document_type) !== 0 ? (
                                                                    <a
                                                                        className="v-c-btn1 n2 aman"
                                                                        onClick={() =>
                                                                            this.viewPlanDocuments(
                                                                                doc.signed_file_path !== "" ? doc.signed_file_path : doc.file_path
                                                                            )
                                                                        }
                                                                    >
                                                                        <span>
                                                                            {doc.signed_file_path !== "" ? doc.signed_file_path : doc.file_path}
                                                                        </span>{" "}
                                                                        <i className="icon icon-view1-ie"></i>
                                                                    </a>
                                                                ) : (
                                                                    <a className="v-c-btn1 n2" onClick={() => this.viewDocuments(doc.file_path)}>
                                                                        <span>{doc.file_path}</span> <i className="icon icon-view1-ie"></i>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* version 4 start */}

                    <Modal className="modal fade Modal_A  Modal_B Crm" show={this.state.show} onHide={() => this.handleClose()}>
                        <form id="crm_participant_create_doc" method="post" autoComplete="off">
                            <Modal.Body>
                                <div className="dis_cell">
                                    <div className="text text-left Popup_h_er_1">
                                        <span>Relevant Attachments:</span>
                                        <a data-dismiss="modal" aria-label="Close" className="close_i" onClick={() => this.handleClose()}>
                                            <i className="icon icon-cross-icons"></i>
                                        </a>
                                    </div>

                                    <div className="row P_15_T">
                                        <div className="col-md-8">
                                            <div className="row P_15_T">
                                                <div className="col-md-12">
                                                    <label>Title</label>
                                                    <span className="required">
                                                        <input
                                                            type="text"
                                                            placeholder="Please Enter Your Title"
                                                            onChange={e =>
                                                                this.setState({
                                                                    stageDocsTitle: e.target.value
                                                                })
                                                            }
                                                            value={this.state.stageDocsTitle ? this.state.stageDocsTitle : ""}
                                                            data-rule-required="true"
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row P_15_T">
                                        <div className="col-md-12">
                                            {" "}
                                            <label>Please select a file to upload</label>
                                        </div>
                                        <div className="col-md-5">
                                            <span className="required upload_btn">
                                                <label className="btn btn-default btn-sm center-block btn-file">
                                                    <i className="but" aria-hidden="true">
                                                        Upload New Doc(s)
                                                    </i>

                                                    <input
                                                        className="p-hidden"
                                                        type="file"
                                                        name="stageFile"
                                                        onChange={this.stageFileHandler}
                                                        data-rule-required="true"
                                                        date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf"
                                                    />
                                                </label>
                                            </span>
                                            {this.state.stageFilename ? (
                                                <p>
                                                    File Name: <small>{this.state.stageFilename}</small>
                                                </p>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="col-md-7"></div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-7"></div>
                                        <div className="col-md-5">
                                            <a className="btn-1" onClick={() => this.handleClose()}>
                                                Save
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Modal.Body>
                        </form>
                    </Modal>

                    <div className="row d-flex">
                        <div className="col-lg-12">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="Partt_d1_txt_1 mt-4 bb-1 pt-4 pb-2">
                                        <strong>Intake Progress:</strong>
                                    </div>
                                    <Timeline
                                        participantDetails={this.state.details}
                                        intakeFormOpen={this.showModal2}
                                        showParkedModal={this.showModalParked2}
                                        paricipantId={this.state.participant_id}
                                        latestStageState={this.state.latestStageStates}
                                        updateState={this.getLatestSage}
                                        name={this.state.details.FullName}
                                        fund_lock={this.state.fund_lock}
                                        disable={this.state.loading}
                                        refresh={this.state.refresh}
                                        getIntakePercentage={this.getIntakePercentage}
                                        stage_documents_data={this.state.stage_documents}
                                        booking_status={this.state.booking_status}
                                    />
                                </div>
                            </div>
                        </div>

                        {this.state.showModal_PE ? (
                            <div className={this.state.showModal_PE ? "customModal show" : "customModal"} style={{ zIndex: "3" }}>
                                <form method="POST" id="crm_participant_stage_docs" encType="multipart/form-data">
                                    <div className="custom-modal-dialog Information_modal" style={{ position: "relative" }}>
                                        <BlockUi tag="div" blocking={this.state.loading_Modal}>
                                            <div className="custom-modal-header by-1">
                                                <div className="Modal_title">Participant Details - Manage Attachments</div>
                                                <i
                                                    className="icon icon-close1-ie Modal_close_i"
                                                    onClick={() => this.closeModal_PE("showModal_PE")}
                                                ></i>
                                            </div>

                                            <div className="custom-modal-body mx-auto w-100 pt-5">
                                                <div className="row mx-0 my-4 d-flex">
                                                    <div className="col-md-8  title_sub_modal align-self-center">Participant Attachments</div>
                                                    <div className="col-md-4">
                                                        <div className="s-def1">
                                                            <Select
                                                                name="view_by_status"
                                                                options={this.state.fetch_plan_category} //{listDocumentListBy(0)}
                                                                required={true}
                                                                simpleValue={true}
                                                                searchable={false}
                                                                clearable={false}
                                                                placeholder="Select Document Type"
                                                                onChange={e => this.setState({ fetch_category: e }, this.getDocsbyCategory(e))}
                                                                value={this.state.fetch_category}
                                                                className={"custom_select"}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className=" cstmSCroll1">
                                                            <ScrollArea
                                                                speed={0.8}
                                                                className="stats_update_list"
                                                                contentClassName="content"
                                                                horizontal={false}
                                                                style={{
                                                                    paddingRight: "20px",
                                                                    height: "auto",
                                                                    maxHeight: "300px"
                                                                }}
                                                                ref={this.scrollAreaData}
                                                            >
                                                                <div className="row attch_row">
                                                                    {this.state.category_docs.length > 0 ? (
                                                                        this.state.category_docs.map((documents, i) =>
                                                                            documents.type_id != "9" ? (
                                                                                <div className="col-sm-2 col-xs-3" key={i}>
                                                                                    <div
                                                                                        className="attach_item"
                                                                                        onClick={e =>
                                                                                            this.onClickFunction(documents.file_path, "stage", i)
                                                                                        }
                                                                                    >
                                                                                        <div className="attach_ll11__">
                                                                                            <h5>{documents.type} </h5>
                                                                                            <p className="ellipsis_line__">{documents.title}</p>
                                                                                            {/* <div className={(documents.is_active) ? 'selected_docs attach_icon__' : 'attach_icon__'}><span className="icon icon-file-im"></span></div> */}
                                                                                            <i
                                                                                                className={
                                                                                                    documents.is_active
                                                                                                        ? "icon icon-document3-ie  select_active"
                                                                                                        : "icon icon-document3-ie"
                                                                                                }
                                                                                            ></i>

                                                                                            <p>
                                                                                                {documents.signed_file_path !== ""
                                                                                                    ? documents.signed_file_path
                                                                                                    : documents.file_path}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                ""
                                                                            )
                                                                        )
                                                                    ) : (
                                                                        <strong className="ml-3">No Documents Found</strong>
                                                                    )}
                                                                </div>
                                                            </ScrollArea>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row my-4">
                                                    <div className="col-md-12 ">
                                                        <div className="py-4 px-0 title_sub_modal bt-1">Other Attachments</div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className=" cstmSCroll1 pt-3">
                                                            <ScrollArea
                                                                speed={0.8}
                                                                className="stats_update_list"
                                                                contentClassName="content"
                                                                horizontal={false}
                                                                style={{
                                                                    paddingRight: "20px",
                                                                    height: "auto",
                                                                    maxHeight: "300px"
                                                                }}
                                                                ref={this.scrollAreaData}
                                                            >
                                                                <div className="row attch_row">
                                                                    {typeof this.state.category_docs != "undefined"
                                                                        ? this.state.category_docs.map((documents, i) =>
                                                                              documents.type_id == "9" ? (
                                                                                  <div className="col-sm-2 col-xs-3">
                                                                                      <div
                                                                                          className="attach_item"
                                                                                          onClick={e =>
                                                                                              this.onClickFunction(documents.file_path, "stage", i)
                                                                                          }
                                                                                      >
                                                                                          <div className="attach_ll11__">
                                                                                              <h5>{documents.type} </h5>
                                                                                              <p className="ellipsis_line__">{documents.title}</p>
                                                                                              {/* <div className={(documents.is_active) ? 'selected_docs attach_icon__' : 'attach_icon__'}><span className="icon icon-file-im"></span></div> */}
                                                                                              <i
                                                                                                  className={
                                                                                                      documents.is_active
                                                                                                          ? "icon icon-document3-ie  select_active"
                                                                                                          : "icon icon-document3-ie"
                                                                                                  }
                                                                                              ></i>

                                                                                              <p>{documents.file_path}</p>
                                                                                          </div>
                                                                                      </div>
                                                                                  </div>
                                                                              ) : (
                                                                                  ""
                                                                              )
                                                                          )
                                                                        : "N/A"}
                                                                </div>
                                                            </ScrollArea>
                                                        </div>
                                                        <div className="mr_tb_20 bt-1"></div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        {this.state.category != "123" ? (
                                                            <a className="btn-1 mb-4" onClick={e => this.archiveDocuments()}>
                                                                Archive Selected Documents
                                                            </a>
                                                        ) : null}

                                                        <a className="btn-1 mb-4" onClick={e => this.downloadSelectedFile()}>
                                                            Download Selected Documents
                                                        </a>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <input
                                                            type="text "
                                                            readOnly
                                                            className="hidie"
                                                            value={this.state.fileValue || ""}
                                                            name={"file1"}
                                                            id={"file1"}
                                                            data-rule-required={true}
                                                            style={{
                                                                width: "100%",
                                                                height: 0,
                                                                visibility: "hidden",
                                                                position: "absolute"
                                                            }}
                                                        />
                                                        <div className="upload_btn mb-4">
                                                            <label className="btn btn-default btn-sm center-block btn-file">
                                                                <i className="but" aria-hidden="true">
                                                                    Upload New Doc(s)
                                                                </i>
                                                                <input
                                                                    className="p-hidden"
                                                                    type="file"
                                                                    // onChange={this.fileChangedHandler}
                                                                    onChange={this.fileHandler}
                                                                    // data-rule-required={true}
                                                                    value={this.state.fileValue || ""}
                                                                    date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf"
                                                                    name={"file2"}
                                                                    id={"file2"}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className="title_sub_modal">New Documents Information</div>
                                                        <div className="mt-3">
                                                            <label className="title_input">Doc Title: </label>
                                                            <span className="required">
                                                                <input
                                                                    type="text"
                                                                    name="docsTitle"
                                                                    onChange={e =>
                                                                        this.setState({
                                                                            docsTitle: e.target.value
                                                                        })
                                                                    }
                                                                    value={this.state.docsTitle ? this.state.docsTitle : ""}
                                                                    data-rule-required="true"
                                                                />
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="mt-3">
                                                                <label className="title_input">Doc Category: </label>
                                                                <div className="s-def1 required">
                                                                    <Select
                                                                        name="category"
                                                                        options={this.state.plan_category}
                                                                        required={true}
                                                                        simpleValue={true}
                                                                        searchable={false}
                                                                        clearable={false}
                                                                        placeholder="Select Document Category"
                                                                        onChange={e =>
                                                                            this.setState({
                                                                                category2: e,
                                                                                category2_error: false
                                                                            })
                                                                        }
                                                                        value={this.state.category2}
                                                                        className={"custom_select"}
                                                                    />
                                                                    {this.errorShowInTooltipDoc("category2", "Select Document Category")}
                                                                </div>
                                                            </div>
                                                            <div className="my-3">
                                                                {this.state.filename ? (
                                                                    <div className="Doc_D1_01">
                                                                        <div className="Doc_D1_02">
                                                                            <label className="title_input mb-0 pl-0  w-100 pb-2">File Name: </label>
                                                                            <div className="Doc_D1_03">
                                                                                <i className="icon icon-document2-ie"></i>{" "}
                                                                                {this.state.filename ? (
                                                                                    <small>{this.state.filename}</small>
                                                                                ) : (
                                                                                    <small>No files selected</small>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <i
                                                                            className="icon icon-close3-ie Doc_D1_04"
                                                                            onClick={() => this.deletefile()}
                                                                        ></i>
                                                                    </div>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </BlockUi>

                                        <div className="custom-modal-footer bt-1 pb-5">
                                            <div className="row d-flex justify-content-end">
                                                <div className="col-md-5">
                                                    <a
                                                        className="btn-1"
                                                        onClick={e => this.uploadHandler(e, "crm_participant_stage_docs", "manage")}
                                                        disabled={this.state.disablemodal}
                                                    >
                                                        Apply Changes
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : null}

                        <EditParticipant
                            selectedFile={this.state.selectedFile}
                            crmParticipantId={this.state.participant_id}
                            editparticipant={this.state.details}
                            closeingModel={() => this.closeModal_PE("showModal")}
                            docsTitleFun={e => this.setState({ docsTitle: e.target.value })}
                            closeModal={() => this.closeModal_PE("showModal")}
                            showModal={this.state.showModal}
                            fileChange={this.fileChangedHandler}
                            docsTitle={this.state.docsTitle}
                            filename={this.state.filename}
                        />

                        <Modal
                            className="modal fade Modal_A  Modal_B Crm"
                            show={this.state.showModal1}
                            onHide={() => this.closeModal_PE("showModal1")}
                        >
                            <form id="crm_participant_doc" method="post" autoComplete="off">
                                <Modal.Body>
                                    <div className="dis_cell">
                                        <div className="text text-left Popup_h_er_1">
                                            <span>Relevant Attachments:</span>
                                            <a
                                                data-dismiss="modal"
                                                aria-label="Close"
                                                className="close_i"
                                                onClick={() => this.closeModal_PE("showModal1")}
                                            >
                                                <i className="icon icon-cross-icons"></i>
                                            </a>
                                        </div>

                                        <div className="row P_15_T">
                                            <div className="col-md-8">
                                                <div className="row P_15_T">
                                                    <div className="col-md-12">
                                                        <label>Title</label>
                                                        <span className="required">
                                                            <input
                                                                type="text"
                                                                placeholder="Please Enter Your Title"
                                                                onChange={e =>
                                                                    this.setState({
                                                                        docsTitle: e.target.value
                                                                    })
                                                                }
                                                                value={this.state.docsTitle ? this.state.docsTitle : ""}
                                                                data-rule-required="true"
                                                            />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row P_15_T">
                                            <div className="col-md-12">
                                                {" "}
                                                <label>Please select a file to upload</label>
                                            </div>
                                            <div className="col-md-5">
                                                <span className="required upload_btn">
                                                    <label className="btn btn-default btn-sm center-block btn-file">
                                                        <i className="but" aria-hidden="true">
                                                            Upload New Doc(s)
                                                        </i>
                                                        <input
                                                            className="p-hidden"
                                                            type="file"
                                                            onChange={this.fileChangedHandler}
                                                            data-rule-required={this.state.selectedFile ? true : false}
                                                            date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf"
                                                        />
                                                    </label>
                                                </span>
                                                {this.state.filename ? (
                                                    <p>
                                                        File Name: <small>{this.state.filename}</small>
                                                    </p>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                            <div className="col-md-7"></div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-7"></div>
                                            <div className="col-md-5">
                                                <a className="btn-1" onClick={e => this.uploadHandler(e, "crm_participant_doc")}>
                                                    Save
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                            </form>
                        </Modal>
                        {this.state.showModal2 ? (
                            <div className={this.state.showModal2 ? "customModal show" : "customModal"}>
                                <ReactPlaceholder showLoadingAnimation type="media" ready={!this.state.loading} customPlaceholder={IntakeProcess}>
                                    <div className="custom-modal-dialog Information_modal">
                                        <div className="custom-modal-header by-1">
                                            <div className="Modal_title">
                                                {this.state.stage_name} {this.state.stageId != 6 ? "Information" : ""}
                                            </div>
                                            <i className="icon icon-close1-ie Modal_close_i" onClick={() => this.closeModal_PE("showModal2")}></i>
                                        </div>

                                        <div className="custom-modal-body w-100 mx-auto">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="py-4 title_sub_modal">Participant Details</div>
                                                </div>

                                                <div className="col-md-12 all_notes">
                                                    <div className="all_notes_1 horizontal_scroll">
                                                        {this.state.notesList != "" ? (
                                                            this.state.notesList.map((noteInfo, i) => (
                                                                <div className="single_notes" key={noteInfo.id}>
                                                                    <div className="flex_break">
                                                                        <div className="single_note_data">
                                                                            <p>{noteInfo.notes}</p>
                                                                            <div className="text-right">
                                                                                {
                                                                                    // <a className="icon icon-add1-ie add1_a1"></a>
                                                                                    // <a className="icon icon-imail1-ie"></a>
                                                                                }
                                                                                {/*(this.state.stageId == 2) ? '' :
                                                                            <a className="icon icon-archive5-ie" onClick={() => this.deleteNote(noteInfo.id)}></a>
                                                                        */}
                                                                            </div>
                                                                        </div>
                                                                        <div className="Single_note_history">
                                                                            Date:
                                                                            {moment(noteInfo.created_at).format("DD/MM/YYYY")}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="col-md-12 pb-5">
                                                                <div className="no_record py-2">No Records</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {this.state.stageId == 3 ? (
                                                <div>
                                                    <div className="row ">
                                                        <div className="col-md-12 py-4">
                                                            <div className="bt-1"></div>
                                                        </div>
                                                        <div className="col-md-12 pt-1 pb-4 title_sub_modal">Add New Note</div>
                                                    </div>
                                                    <form id="add_note">
                                                        <div className="row d-flex  mb-4">
                                                            <div className="col-md-8">
                                                                <span className="required">
                                                                    <textarea
                                                                        data-rule-required="true"
                                                                        data-msg-required="Add Note"
                                                                        placeholder="Note"
                                                                        className="notes_txt_area textarea-max-size w-100"
                                                                        name="notes_txt_area"
                                                                        onChange={e =>
                                                                            this.setState({
                                                                                notes_txt_area: e.target.value
                                                                            })
                                                                        }
                                                                    >
                                                                        {this.state.notes_txt_area}
                                                                    </textarea>
                                                                </span>
                                                            </div>
                                                            <div className="col-md-3 align-items-end d-inline-flex">
                                                                <a className="btn-1 w-100" onClick={this.submitNote}>
                                                                    Add New Note
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="row ">
                                                        <div className="col-md-12 py-4">
                                                            <div className="bt-1"></div>
                                                        </div>
                                                        <div className="col-md-12 pt-1 pb-4 title_sub_modal">Add New Note</div>
                                                    </div>
                                                    <form id="add_note">
                                                        <div className="row d-flex  mb-4">
                                                            <div className="col-md-8">
                                                                <span className="required">
                                                                    <textarea
                                                                        data-rule-required="true"
                                                                        data-msg-required="Add Note"
                                                                        placeholder="Note"
                                                                        className="notes_txt_area textarea-max-size w-100"
                                                                        name="notes_txt_area"
                                                                        onChange={e =>
                                                                            this.setState({
                                                                                notes_txt_area: e.target.value
                                                                            })
                                                                        }
                                                                    >
                                                                        {this.state.notes_txt_area}
                                                                    </textarea>
                                                                </span>
                                                            </div>
                                                            <div className="col-md-3 align-items-end d-inline-flex">
                                                                <a className="btn-1 w-100" onClick={this.submitNote}>
                                                                    Add New Note
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}

                                            <div className="row">
                                                <div className="col-md-12 py-4">
                                                    <div className="bt-1"></div>
                                                </div>
                                                <div className="col-md-12 pt-1 pb-4 title_sub_modal">Attachments</div>
                                            </div>
                                            <div className="row">
                                                {this.state.docList != "" ? (
                                                    this.state.docList[0].docs.map((docInfo, i) => (
                                                        <div className="col-md-4 mb-4">
                                                            <h5 className="pb_10p">{docInfo.type} </h5>
                                                            <label className="title_input docList_update">{docInfo.title}</label>
                                                            <a
                                                                className="v-c-btn1"
                                                                onClick={() =>
                                                                    docInfo.document_type != 0
                                                                        ? this.viewPlanDocuments(docInfo.file_path)
                                                                        : this.viewDocuments(docInfo.file_path)
                                                                }
                                                            >
                                                                <span>{docInfo.file_path}</span> <i className="icon icon-view1-ie"></i>
                                                            </a>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-md-12 pb-5">
                                                        <div className="no_record py-2">No Records</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="bt-1 pb-5"></div>
                                                </div>
                                                <div className="col-md-3 align-items-end d-inline-flex pb-4">
                                                    <a className="btn-1 w-100" onClick={this.showDocumentUpload}>
                                                        Add
                                                    </a>
                                                </div>{" "}
                                            </div>

                                            {this.state.showdocupload == true ? (
                                                <div className="row">
                                                    <br />
                                                    <form method="POST" id="crm_participant_stage_docs1" encType="multipart/form-data">
                                                        <div className="col-md-6">
                                                            <div className="title_sub_modal">New Documents Information</div>
                                                            <div className="mt-3 pb-3">
                                                                <label className="title_input mb-0  pb-2">Doc Title: </label>
                                                                <span className="required">
                                                                    <input
                                                                        type="text"
                                                                        name="docsTitle"
                                                                        onChange={e =>
                                                                            this.setState({
                                                                                docsTitle: e.target.value
                                                                            })
                                                                        }
                                                                        value={this.state.docsTitle ? this.state.docsTitle : ""}
                                                                        data-rule-required="true"
                                                                    />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="pb-3">
                                                                    <label className="title_input mb-0 pb-2">Doc Category: </label>
                                                                    <div className="s-def1 required">
                                                                        <Select
                                                                            name="category3"
                                                                            options={this.state.plan_category}
                                                                            required={true}
                                                                            simpleValue={true}
                                                                            searchable={false}
                                                                            clearable={false}
                                                                            placeholder="Select Document Category"
                                                                            onChange={e =>
                                                                                this.setState({
                                                                                    category3: e,
                                                                                    category3_error: false
                                                                                })
                                                                            }
                                                                            value={this.state.category3}
                                                                            className={"custom_select"}
                                                                        />
                                                                        {this.errorShowInTooltipDoc("category3", "Select Document Category")}
                                                                    </div>
                                                                </div>
                                                                {this.state.filename ? (
                                                                    <div className="my-3 pb-3">
                                                                        <div className="Doc_D1_01">
                                                                            <div className="Doc_D1_02">
                                                                                <label className="title_input mb-0 pl-0  w-100 pb-2">
                                                                                    File Name:{" "}
                                                                                </label>
                                                                                <div className="Doc_D1_03">
                                                                                    <i className="icon icon-document2-ie"></i>
                                                                                    {this.state.filename ? (
                                                                                        <small>{this.state.filename}</small>
                                                                                    ) : (
                                                                                        <small>No files selected</small>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <i
                                                                                className="icon icon-close3-ie Doc_D1_04"
                                                                                onClick={() => this.deletefile()}
                                                                            ></i>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    ""
                                                                )}

                                                                <div className="upload_btn mb-4">
                                                                    <input
                                                                        type="text "
                                                                        readOnly
                                                                        className="hidie"
                                                                        value={this.state.fileValue || ""}
                                                                        name={"file3"}
                                                                        id={"file3"}
                                                                        data-rule-required={true}
                                                                        style={{
                                                                            width: "100%",
                                                                            height: 0,
                                                                            visibility: "hidden"
                                                                        }}
                                                                    />
                                                                    <label className="btn btn-default btn-sm center-block btn-file">
                                                                        <i className="but" aria-hidden="true">
                                                                            Upload File
                                                                        </i>
                                                                        <input
                                                                            className="p-hidden"
                                                                            type="file"
                                                                            onChange={this.fileHandler}
                                                                            value={this.state.fileValue || ""}
                                                                            // data-rule-required={this.state.selectedFile?true:false}
                                                                            date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf"
                                                                            // value={this.state.fileValue || ''}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-12">
                                                            <div className="custom-modal-footer bt-1 pb-5">
                                                                <div className="row d-flex justify-content-end">
                                                                    <div className="col-md-5">
                                                                        <a
                                                                            className="btn-1"
                                                                            onClick={e => this.uploadHandler1(e, "crm_participant_stage_docs1")}
                                                                            disabled={this.state.disablemodal}
                                                                        >
                                                                            Apply Changes
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    </div>
                                </ReactPlaceholder>
                            </div>
                        ) : null}

                        <div className={this.state.showModal3 ? "customModal show" : "customModal"}>
                            <ReactPlaceholder showLoadingAnimation type="media" ready={!this.state.loading} customPlaceholder={IntakeProcess}>
                                <div className="custom-modal-dialog Information_modal">
                                    <div className="custom-modal-header by-1">
                                        <div className="Modal_title">Plan Delegation - Services</div>
                                        <i className="icon icon-close1-ie Modal_close_i" onClick={() => this.closeModal_PE("showModal3")}></i>
                                    </div>

                                    <div className="custom-modal-body w-80 mx-auto">
                                        <div className="row">
                                            <div className="col-md-12 pt-4 pb-3 title_sub_modal">Services Search:</div>
                                            <div className="col-md-8">
                                                <div className="small-search">
                                                    <input type="text" />
                                                    <button>
                                                        <span className="icon icon-search1-ie"></span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="row">
                                                    <div className="col-md-8 pt-3 text-right">ter by Code:</div>
                                                    <div className="col-md-4 pt-2 pl-0">
                                                        <div className="s-def1 s1">
                                                            <Select
                                                                name="view_by_status"
                                                                options={options}
                                                                required={true}
                                                                simpleValue={true}
                                                                searchable={false}
                                                                clearable={false}
                                                                placeholder="11"
                                                                onChange={e =>
                                                                    this.setState({
                                                                        filterVal: e
                                                                    })
                                                                }
                                                                value={this.state.filterVal}
                                                                className={"custom_select"}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 py-4">
                                                <div className="border-das_line"></div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 d-flex justify-content-between Ser_div_txt1">
                                                <div className="pl-5">Service Name: </div>
                                                <div>Attach to Plan: </div>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <div className="Ser_div1">
                                                    <div className="col-md-11 d-inline-flex align-self-center pl-5">
                                                        <b>11_022_0110_7_3:</b> Specialist Behavioural Intervention Support
                                                    </div>
                                                    <div className="col-md-1 text-left bl-1 my-2">
                                                        <label className="c-custom-checkbox pt-1">
                                                            <input type="checkbox" />
                                                            <i className="c-custom-checkbox__img"></i>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <div className="Ser_div1">
                                                    <div className="col-md-11 d-inline-flex align-self-center pl-5">
                                                        <b>11_022_0110_7_3:</b> Behaviour Management Plan (Incl. Training In Behaviour Management
                                                        Strategies)
                                                    </div>
                                                    <div className="col-md-1 text-left bl-1 my-2">
                                                        <label className="c-custom-checkbox pt-1">
                                                            <input type="checkbox" />
                                                            <i className="c-custom-checkbox__img"></i>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <div className="Ser_div1">
                                                    <div className="col-md-11 d-inline-flex align-self-center pl-5">
                                                        <b>11_024_0117_7_3:</b> Individual Social Skills Development
                                                    </div>
                                                    <div className="col-md-1 text-left bl-1 my-2">
                                                        <label className="c-custom-checkbox pt-1">
                                                            <input type="checkbox" />
                                                            <i className="c-custom-checkbox__img"></i>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 pt-4">
                                                <div className="bt-1"></div>
                                            </div>
                                            <div className="col-md-12 pt-4 pb-3 title_sub_modal">Allocate Ammounts to Selected Services:</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 d-flex justify-content-between Ser_div_txt1">
                                                <div className="pl-5">Service Name: </div>
                                                <div></div>
                                            </div>
                                        </div>

                                        <div className="row mb-4">
                                            <div className="col-md-12 pb-4">
                                                <div className="border-das_line"></div>
                                            </div>
                                            <div className="col-md-10 Ser_sel_div">
                                                <div className="sel_div1 pl-5">
                                                    <b>11_024_0117_7_3:</b> Individual Social Skills Development
                                                </div>
                                                <div className="sel_div2 col-md-5 ml-5 mt-3">
                                                    <div className="row sel_div3">
                                                        <div className="col-md-6 allocate_title">Allocate Funds:</div>
                                                        <div className="col-md-6 dollar_input">
                                                            <input type="text" />
                                                            <span>$:</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <a className="btn-1 s_txt">Add</a>
                                            </div>
                                        </div>

                                        <div className="row  mb-4">
                                            <div className="col-md-12 pb-4">
                                                <div className="border-das_line"></div>
                                            </div>
                                            <div className="col-md-10 Ser_sel_div">
                                                <div className="sel_div1 pl-5">
                                                    <b>11_024_0117_7_3:</b> Individual Social Skills Development
                                                </div>
                                                <div className="sel_div2 col-md-5 ml-5 mt-3">
                                                    <div className="row sel_div3">
                                                        <div className="col-md-6 allocate_title">Allocate Funds:</div>
                                                        <div className="col-md-6 dollar_input">
                                                            <input type="text" />
                                                            <span>$:</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <a className="btn-1 s_txt">Add</a>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 pt-4">
                                                <div className="bt-1"></div>
                                            </div>
                                            <div className="col-md-12 pt-4 pb-3 title_sub_modal">Selected Services & Funding:</div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <div className="d-flex ser_fund_1">
                                                    <div className="ser_fund_a">
                                                        <span>
                                                            <b>11_024_0117_7_3:</b> Individual Social Skills Development
                                                        </span>
                                                    </div>
                                                    <div className="ser_fund_b">
                                                        <span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <div className="d-flex ser_fund_1">
                                                    <div className="ser_fund_a">
                                                        <span>
                                                            <b>11_024_0117_7_3:</b> Individual Social Skills Developmentt
                                                        </span>
                                                    </div>
                                                    <div className="ser_fund_b">
                                                        <span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <div className="d-flex ser_fund_1">
                                                    <div className="ser_fund_a">
                                                        <span>
                                                            <b>11_024_0117_7_3:</b> Individual Social Skills Developmentt
                                                        </span>
                                                    </div>
                                                    <div className="ser_fund_b">
                                                        <span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="custom-modal-footer bt-1 mt-5">
                                        <div className="row d-flex justify-content-end">
                                            <div className="col-md-4">
                                                <a className="btn-1">Save and Send Servive Agreement</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ReactPlaceholder>
                        </div>
                    </div>
                    <Modal
                        className="modal fade Modal_A  Modal_B Crm Park-Rejected-crm"
                        show={this.state.showModalParked}
                        onHide={() => this.closeModalParked()}
                    >
                        <form id="add_task_note" method="post" autoComplete="off">
                            <Modal.Body>
                                <div className="dis_cell">
                                    <div className="text text-left Popup_h_er_1">
                                        <span>{this.state.stage_status == 4 ? "Park" : "Reject"} Participant:</span>
                                        <a data-dismiss="modal" aria-label="Close" className="close_i" onClick={() => this.closeModalParked()}>
                                            <i className="icon icon-cross-icons"></i>
                                        </a>
                                    </div>
                                    <div className="row pt-5">
                                        <div className="col-md-9">
                                            <label className="title_input pl-0">
                                                Are you sure you want to {this.state.stage_status == 4 ? "park" : "reject"}{" "}
                                                <b>{this.state.details.FullName}</b> ?
                                            </label>
                                        </div>
                                        <div className="col-md-3 d-flex">
                                            <div className="w-50">
                                                <label className="radio_F1 f1_set_auto">
                                                    Yes
                                                    <input
                                                        type="radio"
                                                        name="add_stage_status"
                                                        value={1}
                                                        onChange={e =>
                                                            this.setState({
                                                                add_stage_status: e.target.value
                                                            })
                                                        }
                                                        checked={this.state.add_stage_status == 1 ? true : false}
                                                    />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                            <div className="w-50 text-right">
                                                <label className="radio_F1 f1_set_auto">
                                                    No
                                                    <input
                                                        type="radio"
                                                        name="add_stage_status"
                                                        value={0}
                                                        onChange={e =>
                                                            this.setState({
                                                                add_stage_status: e.target.value
                                                            })
                                                        }
                                                        checked={this.state.add_stage_status == 0 ? true : false}
                                                    />
                                                    <span className="checkround"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {this.state.add_stage_status == 1 ? (
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="border_dotted_top pt-5"></div>
                                                    </div>
                                                    <div className="col-md-9">
                                                        <label>Add Relevant Notes:</label>
                                                        <span className="required">
                                                            <textarea
                                                                data-rule-required="true"
                                                                data-msg-required="Add Note"
                                                                placeholder="[Any relevant task notes Here]"
                                                                className="notes_txt_area textarea-max-size w-100"
                                                                name="notes_txt_area"
                                                                onChange={e =>
                                                                    this.setState({
                                                                        task_notes_txt_area: e.target.value
                                                                    })
                                                                }
                                                            >
                                                                {this.state.task_notes_txt_area}
                                                            </textarea>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    {this.state.stage_status == 4 ? (
                                        <div className="row P_15_T">
                                            <div className="col-md-9">
                                                <label className="title_input pl-0">Would you like to add a task?</label>
                                            </div>
                                            <div className="col-md-3 d-flex">
                                                <div className="w-50 ">
                                                    <label className="radio_F1 f1_set_auto">
                                                        Yes
                                                        <input
                                                            type="radio"
                                                            name="add_task"
                                                            value={1}
                                                            onChange={e =>
                                                                this.setState({
                                                                    add_task: e.target.value
                                                                })
                                                            }
                                                        />
                                                        <span className="checkround"></span>
                                                    </label>
                                                </div>
                                                <div className="w-50 text-right">
                                                    <label className="radio_F1 f1_set_auto">
                                                        No
                                                        <input
                                                            type="radio"
                                                            name="add_task"
                                                            value={0}
                                                            onChange={e =>
                                                                this.setState({
                                                                    add_task: e.target.value
                                                                })
                                                            }
                                                            defaultChecked
                                                        />
                                                        <span className="checkround"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    {this.state.add_task == 1 ? (
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="border_dotted_top pt-5"></div>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="title_input">
                                                    <strong>Task Name:</strong>{" "}
                                                </label>
                                                <span className="required">
                                                    <input
                                                        type="text"
                                                        name="task_name"
                                                        placeholder="[Task Name Here]"
                                                        data-rule-required="true"
                                                        data-msg-required="Add Task Name"
                                                        value={this.state.task_name}
                                                        onChange={e =>
                                                            this.setState({
                                                                task_name: e.target.value
                                                            })
                                                        }
                                                    />
                                                </span>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="title_input">
                                                    <strong>Priority:</strong>
                                                </label>
                                                <div className="required">
                                                    <div className="s-def1">
                                                        <Select
                                                            data-rule-required="true"
                                                            options={prioritylevel}
                                                            name="priority"
                                                            simpleValue={true}
                                                            required={true}
                                                            searchable={false}
                                                            clearable={false}
                                                            placeholder="Please Select"
                                                            className={"custom_select"}
                                                            onChange={e => this.selectChanges(e, "priority")}
                                                            value={this.state.priority}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="title_input">
                                                    <strong>Date :</strong>{" "}
                                                </label>
                                                <div className="required">
                                                    <DatePicker
                                                        autoComplete={"off"}
                                                        showYearDropdown
                                                        scrollableYearDropdown
                                                        yearDropdownItemNumber={110}
                                                        dateFormat="dd-MM-yyyy"
                                                        required={true}
                                                        data-placement={"bottom"}
                                                        minDate={moment()}
                                                        name="due_date"
                                                        onChange={e => this.selectChanges(e, "due_date")}
                                                        selected={this.state.due_date ? moment(this.state.due_date, "DD-MM-YYYY") : null}
                                                        className="text-center px-0"
                                                        placeholderText="DD/MM/YYYY"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12 pt-5">
                                                <div className="bt-1"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    {this.state.add_stage_status == 1 ? (
                                        <div className="row F_Park__">
                                            <div className="col-md-3 pull-right">
                                                <a className="btn-1" onClick={e => this.submitTaskNote(e)}>
                                                    {this.state.stage_status == 4 ? "Park" : "Reject"}
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </Modal.Body>
                        </form>
                    </Modal>
                </BlockUi>
            </div>
        );
    }
}

class Timeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterVal: "",
            ndisSaveButtonDisable: true,
            disabledResend: this.props.disable,
            disabledGenerate: this.props.disable,
            smsDisabled1: this.props.disable,
            callReferenceModalShow: false,
            totalNdisAmount: 0,
            smsDisabled2: this.props.disable,
            smsDisabled3: this.props.disable,
            LockedFundingModalShow: false,
            show: false,
            AllocatedFundingModalShow: false,
            show: false,
            service_agreement_doc: 0,
            participant_assessment: 0,
            client_contact: 0,
            information_screening: 0,
            recieve_documents: 0,
            funding_concent: 0,
            locked_funding_confirmation: 0,
            selectedList: [],
            final_service_agreement: 0,
            selected: [],
            selectAll: 0,
            service_agreement_doc_data: "",
            participant_assessment_data: "",
            client_contact_data: "",
            information_screening_data: "",
            recieve_documents_data: "",
            funding_concent_data: "",
            locked_funding_confirmation_data: "",
            final_service_agreement_data: "",
            stage1: [],
            stage2: [],
            stage3: [],
            userSelectedListTemp: [],
            userSelectedList: [],
            redirect: "",
            disable: this.props.disable,
            addedNdisServices: [],
            itemdNdisServices: [],
            selectedNdisService: "",
            service_agreement: [],
            funding_consent: [],
            final_service_agreement_doc: [],
            signed_final_service_agreement_doc: [],
            details: {},
            loading:false
        };
    }
    stage2Note = id => {
        this.props.intakeFormOpen(id);
    };

    closeCallRefModal() {
        this.setState({ callReferenceModalShow: false });
    }

    showCallRefModal() {
        this.setState({ callReferenceModalShow: true });
    }

    closeLockedFunModal() {
        this.setState({ LockedFundingModalShow: false });
    }
    showLockedFunModal() {
        this.setState({ LockedFundingModalShow: true });
    }

    closeLockedAllocateFunModal() {
        this.setState({
            LockedAllocateFundingModalShow: false,
            selectedNdisService: [],
            userSelectedList: [],
            userSelectedListTemp: [],
            itemdNdisServices: [],
            selected: [],
            selectAll: 0,
            ndisPlanEndDate: "",
            ndisPlanStartDate: "",
            searchedNdisService: ""
        });
    }
    showAllocateLockedFunModal() {
        this.getNdisServeicesCategories();
        this.setState({ LockedAllocateFundingModalShow: true });
    }
    showPlanDeligation = () => {
        this.props.showPlanDeligation();
    };
    itemdNdisService = (index, e) => {
        var previousSelected = this.state.selected;
        let selectedList = this.state.selectedNdisService ? this.state.selectedNdisService.ndis_service : [];
        var tempData = [];
        var userSelectedList = this.state.userSelectedListTemp;
        if (selectedList !== undefined) {
            // if (this.state.selectAll === 0) {

            selectedList.forEach(l => {
                var columnIndex = selectedList.findIndex(x => x.support_id == l.support_id);
                var found = !userSelectedList.some(el => el.id === l.support_id);
                if (found && previousSelected[l.support_id] === true) {
                    tempData = tempData.concat([selectedList[columnIndex]]);
                    this.setState({
                        userSelectedListTemp: userSelectedList.concat(selectedList[columnIndex])
                    });
                }
            });
            // }
        }
        this.setState({
            userSelectedListTemp: [...userSelectedList, ...tempData]
        });

        let totalNdisAmount = 0;
        this.state.userSelectedList = [...userSelectedList, ...tempData];
        let addedNdisService = this.state.userSelectedList;
        if (addedNdisService[index]) {
            handleShareholderNameChange(this, "userSelectedList", index, "amount", e.target.value, e);
        }
        if (addedNdisService.length > 0) {
            addedNdisService.forEach(function(k, index) {
                if (k.amount != "") {
                    totalNdisAmount = totalNdisAmount + parseFloat(k.amount);
                }
            });
        }
        this.setState({
            itemdNdisServices: addedNdisService,
            ndisSaveButtonDisable: false,
            totalNdisAmounts: totalNdisAmount
        });
    };
    removeItemdNdisService = (e, props) => {
        let removedItemdNdisServices = this.state.userSelectedList;
        let removedItemdNdisServicesTemp = this.state.userSelectedListTemp;
        let totalNdisAmount = this.state.totalNdisAmounts;
        let state = false;
        let ar_index = "";
        if (removedItemdNdisServices.length > 0) {
            let newAmount = 0;
            removedItemdNdisServices.forEach(function(k, index) {
                if (k.support_id == props.original.support_id) {
                    state = true;
                    ar_index = index;
                    if (k.amount != "") {
                        newAmount = parseFloat(k.amount.replace(/\s/g, ""));
                        totalNdisAmount = totalNdisAmount - newAmount;
                    }
                }
            });
        }
        if (state) {
            this.state.selected[props.original.support_id] = false;
            removedItemdNdisServices.splice(ar_index, 1);
            removedItemdNdisServicesTemp.splice(ar_index, 1);
        }
        this.setState({
            itemdNdisServices: removedItemdNdisServices,
            userSelectedListTemp: [...removedItemdNdisServicesTemp],
            totalNdisAmounts: totalNdisAmount
        });
        this.toggleSelectAllActive();
    };

    saveNdisService = (e, type) => {
        var service = {
            ndisPlanEndDate: this.state.ndisPlanEndDate,
            ndisPlanStartDate: this.state.ndisPlanStartDate,
            saveType: type,
            ndisService: this.state.itemdNdisServices,
            crmParticipantId: this.props.paricipantId,
            totalNdisAmount: this.state.totalNdisAmounts
        };
        e.preventDefault();
        var validator = jQuery("#allocateFundForm").validate({ ignore: [] });
        if (!this.state.loading && jQuery("#allocateFundForm").valid()) {
            this.setState({ loading: true });
            postData("crm/CrmStage/saveNdisService", service).then(result => {
                if (result.status) {
                    toast.success(
                        <ToastUndo
                            message={"Funding Consent Saved Successfully! "}
                            // message={"Ndis Service Saved Successfully! "}
                            showType={"s"}
                        />,
                        {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        }
                    );
                    this.setState({
                        ndisPlanStartDate: "",
                        ndisPlanEndDate: "",
                        ndisSaveButtonDisable: true,
                        userSelectedList: [],
                        totalNdisAmounts: "",
                        itemdNdisServices: "",
                        selectedNdisService: "",
                        selectAll: 0,
                        selected: []
                    });
                    this.openStagePanel(0, 0);
                    this.closeLockedAllocateFunModal();
                    this.setState({ loading: false });
                } else {
                    toast.error(<ToastUndo message={result.error} showType={"s"} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                    this.setState({ loading: false });
                }
            });
        }
    };
    handleChangeStartDate = e => {
        let date = moment(e, "DD-MM-YYYY");
        this.setState({ ndisPlanStartDate: date });
    };
    handleChangeEndDate = e => {
        let date = moment(e, "DD-MM-YYYY");
        this.setState({ ndisPlanEndDate: date });
    };
    getNdisServeicesCategories = () => {
        postData("crm/CrmStage/get_ndis_services_categories").then(result => {
            if (result) {
                this.setState({ ndisServeicesCategories: result.data });
            }
        });
    };
    selectedCategory = e => {
        let searchedNdisService = this.state.searchedNdisService !== undefined ? this.state.searchedNdisService : "";
        let selectedNdisService = this.state.selectedNdisService;
        var service = JSON.stringify({
            id: e.value,
            support_item_number: searchedNdisService
        });
        this.setState({ loading: true });
        postData("crm/CrmStage/get_ndis_service_by_id", service).then(result => {
            if (result) {
                this.setState({ loading: false });
                selectedNdisService = result.data;
                selectedNdisService["category"] = e;
                this.setState({
                    selectedNdisService,
                    selectAll: 0,
                    selected_support_category: e.value
                });
                if (this.state.userSelectedList.length === 0) {
                    this.setState({
                        userSelectedListTemp: [],
                        selected: []
                    });
                }
                this.toggleSelectAllActive();
            }
            this.setState({ loading: false });
        });
    };

    toggleSelectAllActive = (active = 1) => {
        const newSelected = Object.assign({}, this.state.selected);
        let selectedList = this.state.selectedNdisService.ndis_service.length ? this.state.selectedNdisService.ndis_service : [];
        if (selectedList.length) {
            selectedList.forEach(l => {
                if (newSelected[l.support_id] === false || newSelected[l.support_id] === undefined) {
                    active = 0;
                }
            });
            this.setState({
                selectAll: active == 1 ? 1 : 0
            });
        }
    };

    toggleRow = support_id => {
        const newSelected = Object.assign({}, this.state.selected);
        newSelected[support_id] = !this.state.selected[support_id];
        // let selectedList = this.state.selectedNdisService
        //     ? this.state.selectedNdisService.ndis_service
        //     : [];
        // var userSelectedList = this.state.userSelectedListTemp;
        // var columnIndex = selectedList.findIndex(x => x.support_id == support_id);
        // const found = !userSelectedList.some(el => el.id === support_id);
        // if (found) {
        //     if (newSelected[support_id]) {
        //         this.setState({
        //             userSelectedListTemp: userSelectedList.concat(
        //                 selectedList[columnIndex]
        //             )
        //         });
        //     }
        // }
        this.setState({
            selected: newSelected
        });
        this.toggleSelectAllActive(!this.state.selected[support_id] === false ? 0 : 1);
    };

    toggleSelectAll = () => {
        const newSelected = Object.assign({}, this.state.selected);
        let selectedList = this.state.selectedNdisService ? this.state.selectedNdisService.ndis_service : [];
        // var tempData = [];
        // var userSelectedList = this.state.userSelectedListTemp;
        if (selectedList !== undefined) {
            if (this.state.selectAll === 0) {
                selectedList.forEach(l => {
                    // var columnIndex = selectedList.findIndex(
                    //     x => x.support_id == l.support_id
                    // );
                    // var found = !userSelectedList.some(el => el.id === l.support_id);
                    // if (found) {
                    //     tempData = tempData.concat([selectedList[columnIndex]]);
                    //     this.setState({
                    //         userSelectedListTemp: userSelectedList.concat(
                    //             selectedList[columnIndex]
                    //         )
                    //     });
                    // }
                    newSelected[l.support_id] = true;
                });
            } else {
                selectedList.forEach(l => {
                    newSelected[l.support_id] = false;
                });
            }
        }
        this.setState({
            // userSelectedListTemp: [...userSelectedList, ...tempData],
            selected: newSelected,
            selectAll: this.state.selectAll === 0 ? 1 : 0
        });
    };

    componentWillMount() {
        this.getStageOption1(this.props.paricipantId);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.refresh != nextProps.refresh) {
            this.getStageOption1(this.props.paricipantId);
            this.props.updateState();
            this.props.getIntakePercentage();
        }
    }
    send_sms_reminder = (msg, type) => {
        this.setState({ loading: true });
        if (type == 1) {
            this.setState({ smsDisabled1: true });
        } else if (type == 2) {
            this.setState({ smsDisabled2: true });
        } else if (type == 3) {
            this.setState({ smsDisabled3: true });
        }

        postData("crm/CrmStage/send_sms_reminder", {
            participant_id: this.props.paricipantId,
            msg: msg
        }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.setState({
                    smsDisabled1: false,
                    smsDisabled2: false,
                    smsDisabled3: false
                });
                this.setState({ loading: false });
            } else {
                this.setState({
                    smsDisabled1: false,
                    smsDisabled2: false,
                    smsDisabled3: false
                });
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            }
        });
    };
    // Get Status of Stage after on change
    getStageOption1 = pid => {
        var state = {};
        var intakeStr = JSON.stringify({ participant_id: pid });
        postData("crm/CrmStage/get_stage_option", intakeStr).then(result => {
            if (result.status) {
                let stage_data = result.stage;
                this.setState({ ...result.stages_status_main });
                this.setState({ ...result.data_stage.stage_status });
                this.setState({ ...result.data_stage.stage_status_users });
            }
        });
    };

    // On change of status change by stages
    onSelectStage = (selectedOption, stage_id, stageName, next_stage) => {
        var state = {};
        state[stageName] = selectedOption;
        if (selectedOption == 2 || selectedOption == 4) {
            this.props.showParkedModal(selectedOption, stage_id);
        } else {
            this.setState({ loading: true });
            var statusData = JSON.stringify({
                stage_id: stage_id,
                crm_participant_id: this.props.paricipantId,
                status: selectedOption,
                next_stage: next_stage
            });
            postData("crm/CrmStage/update_stage_status", statusData).then(result => {
                if (result.status) {
                    toast.success(<ToastUndo message={result.msg} showType={"s"} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                    if (result.success == 1) {
                        this.setState({ redirect: true });
                    }

                    this.setState(state);
                    this.getStageOption1(this.props.paricipantId);
                    this.props.getIntakePercentage();
                    this.props.updateState();
                    if (stage_id >= 7) {
                        this.openStagePanel(0, 0);
                    }
                    this.setState({
                        loading: false,
                        disabledGenerate: false
                    });
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    };
    generate_document = e => {
        this.setState({ disabledGenerate: true, loading: true });
        var statusData = { participant_id: this.props.paricipantId };
        postData("crm/CrmStage/generate_document_service_agreement", statusData).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.getStageOption1(this.props.paricipantId);
                this.props.getIntakePercentage();
                this.props.updateState();
                this.setState({ disabledGenerate: false, loading: false });
                this.openStagePanel(0, 0);
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            }
        });
    };
    resend_document = e => {
        this.setState({ disabledResend: true, loading: true });
        var statusData = {
            participant_id: this.props.paricipantId,
            stage_id: "8"
        };
        postData("crm/CrmStage/resend_document", statusData).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.getStageOption1(this.props.paricipantId);
                this.props.getIntakePercentage();
                this.props.updateState();
                this.setState({ disabledResend: false, loading: false });
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            }
        });
    };
    resend_funding_document = e => {
        this.setState({ disabledResend: true, loading: true });
        var statusData = {
            participant_id: this.props.paricipantId,
            stage_id: "9"
        };
        postData("crm/CrmStage/resend_funding_document", statusData).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.getStageOption1(this.props.paricipantId);
                this.props.getIntakePercentage();
                this.props.updateState();
                this.setState({ disabledResend: false, loading: false });
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            }
        });
    };
    searchNdisService = e => {
        let selectedNdisService = this.state.selectedNdisService;
        var category = this.state.selectedNdisService["category"];
        if (category !== undefined) {
            var service = JSON.stringify({
                support_item_number: e.target.value,
                id: this.state.selected_support_category
            });
            postData("crm/CrmStage/get_ndis_service_by_id", service).then(result => {
                if (result) {
                    selectedNdisService = result.data;
                    selectedNdisService["category"] = category;
                    this.setState({ selectedNdisService, addItem: true });
                }
            });
        }
        this.setState({ searchedNdisService: e.target.value });
    };
    searchNdisServiceByItemNumber = () => {
        let selectedNdisService = this.state.selectedNdisService;
        var category = this.state.selectedNdisService["category"];
        if (category !== undefined) {
            // this.setState({ loading: true });
            var service = JSON.stringify({
                support_item_number: this.state.searchedNdisService,
                id: this.state.selected_support_category
            });
            postData("crm/CrmStage/get_ndis_service_by_id", service).then(result => {
                if (result) {
                    this.setState({ loading: false });
                    selectedNdisService = result.data;
                    selectedNdisService["category"] = category;
                    this.setState({ selectedNdisService, addItem: true });
                } else {
                    this.setState({ loading: false });
                }
            });
        }
    };
    send_download_document = stageid => {
        this.setState({ loading: true, disable_doc: true });
        var statusData = {
            participant_id: this.props.paricipantId,
            stage_id: stageid
        };
        var msg = "";
        postData("crm/CrmStage/download_selected_file", statusData).then(result => {
            if (result.status) {
                window.location.href = BASE_URL + "mediaDownload/" + result.zip_name;
                this.setState({ disable_doc: false });
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ disable_doc: false });
            }
           this.setState({ loading: false });
        });
        
    };
    send_service_agreement_download_document = (stageid, file_type) => {
        this.setState({ loading: true });
        var statusData = {
            participant_id: this.props.paricipantId,
            stage_id: stageid,
            file_type: file_type
        };
        var msg = "";
        postData("crm/CrmStage/download_service_agreement_selected_file", statusData).then(result => {
            if (result.status) {
                window.location.href = BASE_URL + "mediaDownload/" + result.zip_name;
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false });
        });
    };
    resend_service_agreement_document = e => {
        this.setState({ disabledResend: true, loading: true });
        var statusData = {
            participant_id: this.props.paricipantId,
            stage_id: "10"
        };
        postData("crm/CrmStage/resend_service_agreement_document", statusData).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.getStageOption1(this.props.paricipantId);
                this.props.getIntakePercentage();
                this.props.updateState();
                this.setState({ disabledResend: false, loading: false });
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            }
        });
    };
    openStagePanel = (its_open, stage_number) => {
        var statusData = {
            participant_id: this.props.paricipantId,
            stage_id: stage_number
        };
        postData("crm/CrmStage/get_crm_plan_delegation", statusData).then(result => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    };
    render() {
        if (this.state.redirect) return <Redirect to="/admin/crm/prospectiveparticipants" />;
        var options = [
            { value: "0", label: "Pending" },
            { value: "1", label: "Success" }
        ];
        let attachmentListData =
            this.props.stage_documents_data != undefined
                ? this.props.stage_documents_data.filter(row => row.archive == 0 && row.document_signed == 2 && row.stage_id == 8)
                : [];
        let attachmentListDataFund =
            this.props.stage_documents_data != undefined
                ? this.props.stage_documents_data.filter(row => row.archive == 0 && row.document_signed == 2 && row.stage_id == 9)
                : [];
        const statusColor = {
            Complete: "complete_msg",
            Inprogress: "incomplete_msg",
            Unsuccessful: "unsuccessful_msg",
            Pending: "pending_msg"
        };

        return (
            <div className="row">
                <BlockUi tag="div" blocking={this.state.loading}>
                    <div className="text-center col-lg-12">
                        <div
                            className="Version_timeline_4 timeline_1"
                            style={{
                                display: "inline-flex",
                                flexDirection: "column"
                            }}
                        >
                            <div className="time_l_1">
                                <div className="time_no_div">
                                    <div className="time_no">
                                        <span>1</span>
                                    </div>
                                    <div className="line_h"></div>
                                </div>
                                <div className="time_d_1">
                                    <div className="time_d_2">
                                        <Panel eventKey="1">
                                            <div className="time_txt w-100">
                                                <div className="time_d_style v4-1_">
                                                    <Panel.Heading>
                                                        <Panel.Title toggle className="v4_panel_title_ v4-2_ mb-0">
                                                            <div className="timeline_h">
                                                                <span>Stage 1</span>
                                                                <i className="icon icon-arrow-down"></i>
                                                            </div>
                                                            <div className="timeline_h">NDIS</div>
                                                            <div className="timeline_h">Intake Participant Submission</div>
                                                        </Panel.Title>
                                                    </Panel.Heading>

                                                    <div className="task_table_v4-1__">
                                                        <div className="t_t_v4-1">
                                                            <div
                                                                className={
                                                                    "t_t_v4-1a " +
                                                                    (statusColor.hasOwnProperty(this.state.stage1.status)
                                                                        ? statusColor[this.state.stage1.status]
                                                                        : "")
                                                                }
                                                            >
                                                                <div className="ci_btn">{this.state.stage1.status}</div>
                                                                <div className="ci_date">
                                                                    Date:{" "}
                                                                    {typeof this.state.stage1 != "undefined" ? this.state.stage1.updated_date : "N/A"}
                                                                </div>
                                                            </div>
                                                            <div className="t_t_v4-1b">
                                                                <a onClick={() => this.stage2Note("1")}>View Attachments & Notes</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Panel.Body collapsible className="px-1 py-3">
                                                <div className="time_line_parent w-100"></div>
                                            </Panel.Body>
                                        </Panel>
                                    </div>
                                </div>
                            </div>

                            <div className="time_l_1">
                                <div className="time_no_div">
                                    <div className="time_no">
                                        <span>2</span>
                                    </div>
                                    <div className="line_h"></div>
                                </div>

                                <div className="time_d_1">
                                    <div className="time_d_2">
                                        <Panel eventKey="2">
                                            <div className="time_txt w-100">
                                                <div className="time_d_style v4-1_">
                                                    <Panel.Heading>
                                                        <Panel.Title toggle className="v4_panel_title_ v4-2_ mb-0">
                                                            <div className="timeline_h">
                                                                <span>Stage 2</span>
                                                                <i className="icon icon-arrow-down"></i>
                                                            </div>
                                                            <div className="timeline_h">Intake</div>
                                                        </Panel.Title>
                                                    </Panel.Heading>

                                                    <div className="task_table_v4-1__">
                                                        <div className="t_t_v4-1">
                                                            <div
                                                                className={
                                                                    "t_t_v4-1a " +
                                                                    (statusColor.hasOwnProperty(this.state.stage2.status)
                                                                        ? statusColor[this.state.stage2.status]
                                                                        : "")
                                                                }
                                                            >
                                                                <div className="ci_btn">{this.state.stage2.status}</div>
                                                                <div className="ci_date">
                                                                    Date:{" "}
                                                                    {typeof this.state.stage2.updated_date != "undefined"
                                                                        ? this.state.stage2.updated_date
                                                                        : "N/A"}
                                                                </div>
                                                            </div>
                                                            <div className="t_t_v4-1b">
                                                                <a onClick={() => this.stage2Note("2")}>View Attachments & Notes</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Panel.Body collapsible className="px-1 py-3">
                                                <div className="time_line_parent w-100">
                                                    <div className=" time_l_1">
                                                        <div className="time_no_div">
                                                            <div className="time_no">2.1</div>
                                                            <div className="line_h"></div>
                                                        </div>
                                                        <div className="time_d_1">
                                                            <div className="time_d_2">
                                                                <div className="time_d_style">
                                                                    <div className="V4_int_cont1__">
                                                                        <div className="V4_int_cont1a__">
                                                                            <div className="timeline_h">
                                                                                <b>Stage 2.1</b>{" "}
                                                                            </div>
                                                                            <div className="timeline_h pt-3">Participant Assessment</div>
                                                                        </div>
                                                                        <div className="V4_int_cont1b__ incomplete_msg">
                                                                            <div className="ci_date">
                                                                                Completed:{" "}
                                                                                {this.state.participant_assessment_data != ""
                                                                                    ? moment(this.state.participant_assessment_data.updated).format(
                                                                                          "DD/MM/YYYY, h:mm a"
                                                                                      )
                                                                                    : "N/A"}
                                                                            </div>
                                                                            <div className="s-def1 s1 mt-4 mb-4 w-80">
                                                                                <Select
                                                                                    name="participant_assessment"
                                                                                    options={getStagesStatus(0, this.props.fund_lock)}
                                                                                    required={true}
                                                                                    simpleValue={true}
                                                                                    searchable={false}
                                                                                    clearable={false}
                                                                                    placeholder="Filter by: Unread"
                                                                                    onChange={e =>
                                                                                        this.onSelectStage(e, "4", "participant_assessment", "5")
                                                                                    }
                                                                                    value={this.state["participant_assessment"]}
                                                                                    className={"custom_select"}
                                                                                    disabled={
                                                                                        this.props.booking_status == "Successful" ? true : false
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-flex">
                                                                        <div className="time_txt w-100">
                                                                            <div className="task_table_footer col-md-12 bt-1">
                                                                                {" "}
                                                                                <a onClick={() => this.stage2Note("4")}>
                                                                                    <u>Attachments & Notes</u>
                                                                                </a>
                                                                                <span>
                                                                                    Completed by:{" "}
                                                                                    <u>
                                                                                        {this.state.participant_assessment_data.status >= 1
                                                                                            ? this.state.participant_assessment_data.name
                                                                                            : "N/A"}
                                                                                    </u>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/*<div className={(this.props.latestStageState >= 3) ? "time_l_1" : "disable-stage-pointer  time_l_1"}> */}
                                                    <div className="time_l_1">
                                                        <div className="time_no_div">
                                                            <div className="time_no">2.2</div>
                                                            <div className="line_h"></div>
                                                        </div>
                                                        <div className="time_d_1">
                                                            <div className="time_d_2">
                                                                <div className="time_d_style">
                                                                    <div className="V4_int_cont1__ ">
                                                                        <div className="V4_int_cont1a__">
                                                                            <div className="timeline_h">
                                                                                <b>Stage 2.2</b>{" "}
                                                                            </div>
                                                                            <div className="timeline_h pt-3">Client Contact</div>
                                                                        </div>
                                                                        <div className="V4_int_cont1b__ complete_msg">
                                                                            <div className="ci_date">
                                                                                Completed:{" "}
                                                                                {this.state.client_contact_data != ""
                                                                                    ? moment(this.state.client_contact_data.updated).format(
                                                                                          "DD/MM/YYYY, h:mm a"
                                                                                      )
                                                                                    : "N/A"}
                                                                            </div>
                                                                            <div className="s-def1 s1 mt-4 mb-4 w-80">
                                                                                <Select
                                                                                    name="client_contact"
                                                                                    options={getStagesStatus(0, this.props.fund_lock)}
                                                                                    required={true}
                                                                                    simpleValue={true}
                                                                                    searchable={false}
                                                                                    clearable={false}
                                                                                    placeholder="Filter by: Unread"
                                                                                    onChange={e => this.onSelectStage(e, "5", "client_contact", "6")}
                                                                                    value={this.state["client_contact"]}
                                                                                    className={"custom_select"}
                                                                                    disabled={
                                                                                        this.state["client_contact"] == "0" ||
                                                                                        this.props.booking_status == "Successful"
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* <div className="v4_btn_size1__ w-40 pb-3">
                                                                        <a
                                                                            disabled={this.state['client_contact'] == '0' ? true : false}
                                                                            onClick={() => {
                                                                                this.showCallRefModal();
                                                                            }}
                                                                            className="v-c-btn1 n2">
                                                                            <span>Call Reference</span> <i className="icon icon-call1-ie"></i>
                                                                        </a>
                                                                    </div> */}

                                                                    <div className="d-flex">
                                                                        <div className="time_txt w-100">
                                                                            <div className="task_table_footer col-md-12 bt-1">
                                                                                {" "}
                                                                                <a
                                                                                    disabled={this.state["client_contact"] == "0" ? true : false}
                                                                                    onClick={() => this.stage2Note("5")}
                                                                                >
                                                                                    <u>Attachments & Notes</u>
                                                                                </a>
                                                                                <span>
                                                                                    Completed by:{" "}
                                                                                    <u>
                                                                                        {this.state.client_contact_data.status == 1
                                                                                            ? this.state.client_contact_data.name
                                                                                            : "N/A"}
                                                                                    </u>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <CallReference
                                                                    details={this.props.participantDetails}
                                                                    showModal={this.state.callReferenceModalShow}
                                                                    handleClose={() => this.closeCallRefModal()}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/*<div className={(this.props.latestStageState >= 4) ? "time_l_1" : "disable-stage-pointer time_l_1"}>*/}
                                                    <div className="time_l_1">
                                                        <div className="time_no_div">
                                                            <div className="time_no">2.3</div>
                                                            <div className="line_h"></div>
                                                        </div>
                                                        <div className="time_d_1">
                                                            <div className="time_d_2">
                                                                <div className="time_d_style">
                                                                    <div className="V4_int_cont1__">
                                                                        <div className="V4_int_cont1a__">
                                                                            <div className="timeline_h">
                                                                                <b>Stage 2.3</b>{" "}
                                                                            </div>
                                                                            <div className="timeline_h pt-3">Information Screening</div>
                                                                        </div>
                                                                        <div className="V4_int_cont1b__ incomplete_msg">
                                                                            <div className="ci_date">
                                                                                Completed:{" "}
                                                                                {this.state.information_screening_data != ""
                                                                                    ? moment(this.state.information_screening_data.updated).format(
                                                                                          "DD/MM/YYYY, h:mm a"
                                                                                      )
                                                                                    : "N/A"}
                                                                            </div>
                                                                            <div className="s-def1 s1 mt-4 mb-4 w-80">
                                                                                <Select
                                                                                    name="information_screening"
                                                                                    options={getStagesStatus(0, this.props.fund_lock)}
                                                                                    required={true}
                                                                                    simpleValue={true}
                                                                                    searchable={false}
                                                                                    clearable={false}
                                                                                    placeholder="Filter by: Unread"
                                                                                    onChange={e =>
                                                                                        this.onSelectStage(e, "6", "information_screening", "7")
                                                                                    }
                                                                                    value={this.state["information_screening"]}
                                                                                    className={"custom_select"}
                                                                                    disabled={
                                                                                        this.state["information_screening"] == "0" ||
                                                                                        this.props.booking_status == "Successful"
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-flex">
                                                                        <div className="time_txt w-100">
                                                                            <div className="task_table_footer col-md-12 bt-1">
                                                                                {" "}
                                                                                <a
                                                                                    disabled={
                                                                                        this.state["information_screening"] == "0" ? true : false
                                                                                    }
                                                                                    onClick={() => this.stage2Note("6")}
                                                                                >
                                                                                    <u>Attachments & Notes</u>
                                                                                </a>
                                                                                <span>
                                                                                    Completed by:{" "}
                                                                                    <u>
                                                                                        {this.state.information_screening_data.status == 1
                                                                                            ? this.state.information_screening_data.name
                                                                                            : "N/A"}
                                                                                    </u>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* <div className={(this.props.latestStageState >= 5) ? "time_l_1" : "disable-stage-pointer  time_l_1"}> */}
                                                    <div className="time_l_1">
                                                        <div className="time_no_div">
                                                            <div className="time_no">2.4</div>
                                                            <div className="line_h"></div>
                                                        </div>
                                                        <div className="time_d_1">
                                                            <div className="time_d_2">
                                                                <div className="time_d_style">
                                                                    <div className="V4_int_cont1__">
                                                                        <div className="V4_int_cont1a__">
                                                                            <div className="timeline_h">
                                                                                <b>Stage 2.4</b>{" "}
                                                                            </div>
                                                                            <div className="timeline_h pt-3">Receive Documents</div>
                                                                        </div>
                                                                        <div className="V4_int_cont1b__ incomplete_msg">
                                                                            <div className="ci_date">
                                                                                {this.state.recieve_documents == 1 ? "Completed" : "Last Opened"}:{" "}
                                                                                {this.state.recieve_documents_data != ""
                                                                                    ? moment(this.state.recieve_documents_data.updated).format(
                                                                                          "DD/MM/YYYY, h:mm a"
                                                                                      )
                                                                                    : "N/A"}
                                                                            </div>
                                                                            <div className="s-def1 s1 mt-4 mb-4 w-80">
                                                                                <Select
                                                                                    name="recieve_documents"
                                                                                    options={getStagesStatus(0, this.props.fund_lock)}
                                                                                    required={true}
                                                                                    simpleValue={true}
                                                                                    searchable={false}
                                                                                    clearable={false}
                                                                                    onChange={e =>
                                                                                        this.onSelectStage(e, "7", "recieve_documents", "8")
                                                                                    }
                                                                                    value={this.state["recieve_documents"]}
                                                                                    className={"custom_select"}
                                                                                    disabled={
                                                                                        this.state["recieve_documents"] == "0" ||
                                                                                        this.props.booking_status == "Successful"
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-flex">
                                                                        <div className="time_txt w-100">
                                                                            <div className="task_table_footer col-md-12 bt-1">
                                                                                {" "}
                                                                                <a
                                                                                    disabled={this.state["recieve_documents"] == "0" ? true : false}
                                                                                    onClick={() => this.stage2Note("7")}
                                                                                >
                                                                                    <u>Attachments & Notes</u>
                                                                                </a>
                                                                                <span>
                                                                                    Completed by:{" "}
                                                                                    <u>
                                                                                        {this.state.recieve_documents_data.status == 1
                                                                                            ? this.state.recieve_documents_data.name
                                                                                            : "N/A"}
                                                                                    </u>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Panel.Body>
                                        </Panel>
                                    </div>
                                </div>
                            </div>

                            <div className="time_l_1">
                                <div className="time_no_div">
                                    <div className="time_no">
                                        <span>3</span>
                                    </div>
                                    <div className="line_h"></div>
                                </div>
                                <div className="time_d_1">
                                    <div className="time_d_2">
                                        <PanelGroup
                                            id={"panel_" + this.props.latestStageState}
                                            accordion
                                            onSelect={e => {
                                                this.openStagePanel(!this.props.its_open, this.props.latestStageState);
                                            }}
                                        >
                                            <Panel eventKey="3">
                                                <div className={this.props.latestStageState >= 6 ? "time_txt w-100" : " time_txt w-100"}>
                                                    {
                                                        // <div className={(this.props.latestStageState >= 7) ? "time_txt w-100" : "disable-stage-pointer  time_txt w-100"}>
                                                    }

                                                    <div className="time_txt w-100">
                                                        <div className="time_d_style v4-1_">
                                                            <Panel.Heading>
                                                                <Panel.Title toggle className="v4_panel_title_ v4-2_ mb-0 stage_3">
                                                                    <div className="timeline_h">
                                                                        <span>Stage 3</span>
                                                                        <i className="icon icon-arrow-down"></i>
                                                                    </div>
                                                                    <div className="timeline_h pt-3">Plan Delegation</div>
                                                                </Panel.Title>
                                                            </Panel.Heading>

                                                            <div className="task_table_v4-1__">
                                                                <div className="t_t_v4-1">
                                                                    <div
                                                                        className={
                                                                            "t_t_v4-1a " +
                                                                            (statusColor.hasOwnProperty(this.state.stage3.status)
                                                                                ? statusColor[this.state.stage3.status]
                                                                                : "")
                                                                        }
                                                                    >
                                                                        <div className="ci_btn">{this.state.stage3.status}</div>
                                                                        <div className="ci_date">
                                                                            Date:{" "}
                                                                            {typeof this.state.stage3 != "undefined"
                                                                                ? this.state.stage1.updated_date
                                                                                : "N/A"}
                                                                        </div>
                                                                    </div>
                                                                    <div className="t_t_v4-1b">
                                                                        <a
                                                                            disabled={this.state["service_agreement_doc"] == "0" ? true : false}
                                                                            onClick={() => this.stage2Note("3")}
                                                                        >
                                                                            View Attachments & Notes
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Panel.Body collapsible className="px-1 py-3">
                                                    <div className="time_line_parent w-100">
                                                        <div className="time_l_1">
                                                            <div className="time_no_div">
                                                                <div className="time_no">3.1</div>
                                                                <div className="line_h"></div>
                                                            </div>
                                                            <div className="time_d_1">
                                                                <div className="time_d_2">
                                                                    <div className="time_d_style">
                                                                        <div className="V4_int_cont1__">
                                                                            <div className="V4_int_cont1a__">
                                                                                <div className="timeline_h">
                                                                                    <b>Stage 3.1</b>{" "}
                                                                                </div>
                                                                                <div className="timeline_h pt-3">Service Agreement Doc</div>
                                                                            </div>
                                                                            <div className="V4_int_cont1b__ complete_msg">
                                                                                <div className="ci_date">
                                                                                    {this.state.service_agreement_doc == 1
                                                                                        ? "Completed"
                                                                                        : "Last Opened"}
                                                                                    :{" "}
                                                                                    {this.state.service_agreement_doc_data != ""
                                                                                        ? moment(
                                                                                              this.state.service_agreement_doc_data.updated
                                                                                          ).format("DD/MM/YYYY, h:mm a")
                                                                                        : "N/A"}
                                                                                </div>
                                                                                <div className="s-def1 s1 mt-4 w-80">
                                                                                    <Select
                                                                                        name="service_agreement_doc"
                                                                                        options={getStagesStatus(0, this.props.fund_lock)}
                                                                                        required={true}
                                                                                        simpleValue={true}
                                                                                        searchable={false}
                                                                                        clearable={false}
                                                                                        placeholder="Filter by: Unread"
                                                                                        onChange={e =>
                                                                                            this.onSelectStage(e, "8", "service_agreement_doc", "9")
                                                                                        }
                                                                                        value={this.state["service_agreement_doc"]}
                                                                                        className={"custom_select"}
                                                                                        disabled={
                                                                                            this.state["service_agreement_doc"] == "0" ||
                                                                                            this.state.service_agreement.length == 0 ||
                                                                                            this.state.service_agreement.document_signed == 0 ||
                                                                                            this.props.booking_status == "Successful"
                                                                                                ? true
                                                                                                : false
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="v4_btn_size1__ mt-3">
                                                                                {/*disabled={this.state.service_agreement.id > 0 ? true : false} */}
                                                                                <a
                                                                                    className="btn-3 w-30 mr-2"
                                                                                    onClick={e => this.generate_document(e)}
                                                                                    disabled={
                                                                                        this.state["service_agreement_doc"] == "0" ||
                                                                                        this.state.service_agreement.length != 0
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                >
                                                                                    Generate & Send Doc
                                                                                </a>
                                                                                <a
                                                                                    className="btn-3 w-20"
                                                                                    onClick={e => this.resend_document(e)}
                                                                                    disabled={
                                                                                        this.state["service_agreement_doc"] == "0" ||
                                                                                        this.state.service_agreement.length == 0 ||
                                                                                        this.state.service_agreement.document_signed == 2
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                >
                                                                                    Resend Doc
                                                                                </a>
                                                                                {/*disabled={this.state.service_agreement.id > 0 &&  this.state.service_agreement.document_signed==2 ? true : false}*/}
                                                                            </div>
                                                                            <div className="v4_btn_size1__ my-3">
                                                                                {/*disabled=this.state.service_agreement.id > 0 &&  this.state.service_agreement.document_signed==2 ? true : false*/}
                                                                                <a
                                                                                    className="btn-3 w-30 mr-2"
                                                                                    onClick={() => this.send_sms_reminder("service_agreement", 1)}
                                                                                    disabled={
                                                                                        this.state["service_agreement_doc"] == "0" ||
                                                                                        this.state.service_agreement.length == 0 ||
                                                                                        this.state.service_agreement.document_signed == 2
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                >
                                                                                    Send SMS reminder
                                                                                </a>
                                                                                <div className="w-70 text-right">
                                                                                    <a
                                                                                        // disabled={
                                                                                        //     this.state[
                                                                                        //         "service_agreement_doc"
                                                                                        //     ] == "0" ||
                                                                                        //         this.state.service_agreement
                                                                                        //             .length == 0
                                                                                        //         ? true
                                                                                        //         : false
                                                                                        // }

                                                                                        disabled={
                                                                                            this.state["service_agreement_doc"] == "0" ||
                                                                                            this.state.service_agreement.length == 0
                                                                                                ? !this.state.disable_doc
                                                                                                : this.state.disable_doc
                                                                                        }
                                                                                        onClick={() => this.send_download_document("8")}
                                                                                        className="Downldad_signed_doc"
                                                                                    >
                                                                                        <span>Download Signed Document</span>
                                                                                        <i className="icon icon-download2-ie"></i>
                                                                                    </a>
                                                                                    {/*disabled={this.state.service_agreement.id > 0 ? false : true}*/}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex">
                                                                            <div className="time_txt w-100">
                                                                                <div className="task_table_footer col-md-12 bt-1">
                                                                                    {" "}
                                                                                    <a
                                                                                        disabled={
                                                                                            this.state["service_agreement_doc"] == "0" ? true : false
                                                                                        }
                                                                                        onClick={() => this.stage2Note("8")}
                                                                                    >
                                                                                        <u>Attachments & Notes</u>
                                                                                    </a>
                                                                                    <span>
                                                                                        Completed by:{" "}
                                                                                        <u>
                                                                                            {this.state.service_agreement_doc_data.status == 1
                                                                                                ? this.state.service_agreement_doc_data.name
                                                                                                : "N/A"}
                                                                                        </u>
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="time_l_1">
                                                            <div className="time_no_div">
                                                                <div className="time_no">3.2</div>
                                                                <div className="line_h"></div>
                                                            </div>
                                                            <div className="time_d_1">
                                                                <div className="time_d_2">
                                                                    <div className="time_d_style">
                                                                        <div className="V4_int_cont1__">
                                                                            <div className="V4_int_cont1a__">
                                                                                <div className="timeline_h">
                                                                                    <b>Stage 3.2</b>{" "}
                                                                                </div>
                                                                                <div className="timeline_h pt-3">Funding Consent</div>
                                                                            </div>
                                                                            <div className="V4_int_cont1b__ incomplete_msg">
                                                                                <div className="ci_date">
                                                                                    {this.state.funding_concent == 1 ? "Completed" : "Last Opened"} :{" "}
                                                                                    {this.state.funding_concent_data != ""
                                                                                        ? moment(this.state.funding_concent_data.updated).format(
                                                                                              "DD/MM/YYYY, h:mm a"
                                                                                          )
                                                                                        : "N/A"}
                                                                                </div>
                                                                                <div className="s-def1 s1 mt-4 mb-4 w-80">
                                                                                    <Select
                                                                                        name="funding_concent"
                                                                                        options={getStagesStatus(0, this.props.fund_lock)}
                                                                                        required={true}
                                                                                        simpleValue={true}
                                                                                        searchable={false}
                                                                                        clearable={false}
                                                                                        placeholder="Filter by: Unread"
                                                                                        onChange={e =>
                                                                                            this.onSelectStage(e, "9", "funding_concent", "10")
                                                                                        }
                                                                                        value={this.state["funding_concent"]}
                                                                                        className={"custom_select"}
                                                                                        disabled={
                                                                                            this.state["funding_concent"] == "0" ||
                                                                                            this.state.funding_consent.length == 0 ||
                                                                                            this.state.funding_consent.document_signed != 2 ||
                                                                                            this.props.booking_status == "Successful"
                                                                                                ? true
                                                                                                : false
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="v4_btn_size1__ mt-3">
                                                                                {/** disabled={this.state.funding_consent.id > 0 ? true : false} */}
                                                                                <a
                                                                                    disabled={
                                                                                        this.state["funding_concent"] == "0" ||
                                                                                        this.state.funding_consent.length != 0
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                    className="btn-3 w-30 mr-2"
                                                                                    onClick={() => {
                                                                                        this.showAllocateLockedFunModal();
                                                                                    }}
                                                                                >
                                                                                    Allocate Fund
                                                                                </a>
                                                                                <a
                                                                                    className="btn-3 w-25"
                                                                                    onClick={e => this.resend_funding_document(e)}
                                                                                    disabled={
                                                                                        this.state["funding_concent"] == "0" ||
                                                                                        this.state.funding_consent.length == 0 ||
                                                                                        this.state.funding_consent.document_signed == 2
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                >
                                                                                    Send/Resend Doc
                                                                                </a>
                                                                                {/* disabled={this.state.funding_consent.id > 0 &&  this.state.funding_consent.document_signed==2 ? true : false} */}
                                                                                <div className="w-40"></div>
                                                                            </div>
                                                                            <div className="v4_btn_size1__  my-3">
                                                                                <a
                                                                                    className="btn-3 w-30 mr-2"
                                                                                    onClick={() => this.send_sms_reminder("funding_consent", 2)}
                                                                                    disabled={
                                                                                        this.state["funding_concent"] == "0" ||
                                                                                        this.state.funding_consent.length == 0 ||
                                                                                        this.state.funding_consent.document_signed == 2
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                >
                                                                                    Send SMS reminder
                                                                                </a>
                                                                                {/*disabled={this.state.funding_consent.id > 0 &&  this.state.funding_consent.document_signed==2 ? true : false}*/}
                                                                                <div className="w-70 text-right">
                                                                                    <a
                                                                                        className="Downldad_signed_doc"
                                                                                        // disabled={
                                                                                        //     this.state["funding_concent"] ==
                                                                                        //         "0" ||
                                                                                        //         this.state.funding_consent
                                                                                        //             .length == 0
                                                                                        //         ? true
                                                                                        //         : false
                                                                                        // }
                                                                                        disabled={
                                                                                            this.state["funding_concent"] == "0" ||
                                                                                            this.state.funding_consent.length == 0
                                                                                                ? !this.state.disable_doc
                                                                                                : this.state.disable_doc
                                                                                        }
                                                                                        onClick={() => this.send_download_document("9")}
                                                                                    >
                                                                                        <span>Download Signed Document</span>
                                                                                        <i className="icon icon-download2-ie"></i>
                                                                                    </a>
                                                                                    {/** disabled={this.state.funding_consent.id > 0 ? false : true}  */}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-flex">
                                                                            <div className="time_txt w-100">
                                                                                <div className="task_table_footer col-md-12 bt-1">
                                                                                    {" "}
                                                                                    <a
                                                                                        disabled={this.state["funding_concent"] == "0" ? true : false}
                                                                                        onClick={() => this.stage2Note("9")}
                                                                                    >
                                                                                        <u>Attachments & Notes</u>
                                                                                    </a>
                                                                                    <span>
                                                                                        Completed by:{" "}
                                                                                        <u>
                                                                                            {this.state.funding_concent_data.status == 1
                                                                                                ? this.state.funding_concent_data.name
                                                                                                : "N/A"}
                                                                                        </u>
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <AllocateFund
                                                                        handleChangeStartDate={this.handleChangeStartDate}
                                                                        handleChangeEndDate={this.handleChangeEndDate}
                                                                        ndisPlanStartDate={this.state.ndisPlanStartDate}
                                                                        ndisPlanEndDate={this.state.ndisPlanEndDate}
                                                                        ndisSaveButtonDisable={this.state.ndisSaveButtonDisable}
                                                                        searchNdisServiceByItemNumber={this.searchNdisServiceByItemNumber}
                                                                        searchedNdisService={this.state.searchedNdisService}
                                                                        searchNdisService={this.searchNdisService}
                                                                        totalNdisAmounts={this.state.totalNdisAmounts}
                                                                        itemdNdisServices={this.state.itemdNdisServices}
                                                                        itemdNdisService={this.itemdNdisService}
                                                                        addNdisItemService={this.addNdisItemService}
                                                                        removeItemdNdisService={this.removeItemdNdisService}
                                                                        selectAll={this.state.selectAll}
                                                                        selected={this.state.selected}
                                                                        toggleRow={this.toggleRow}
                                                                        toggleSelectAll={this.toggleSelectAll}
                                                                        saveNdisService={this.saveNdisService}
                                                                        addRemoveService={this.state.addRemoveService}
                                                                        addNdisService={this.state.addNdisService}
                                                                        selectedCategory={this.selectedCategory}
                                                                        ndisServeicesCategories={this.state.ndisServeicesCategories}
                                                                        selectedNdisService={this.state.selectedNdisService}
                                                                        showModal={this.state.LockedAllocateFundingModalShow}
                                                                        handleClose={() => this.closeLockedAllocateFunModal()}
                                                                        loading={this.state.loading}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="time_l_1">
                                                            <div className="time_no_div">
                                                                <div className="time_no">3.3</div>
                                                                <div className="line_h"></div>
                                                            </div>
                                                            <div className="time_d_1">
                                                                <div className="time_d_2">
                                                                    <div className="time_txt ">
                                                                        <div className="time_d_style">
                                                                            <div className="V4_int_cont1__">
                                                                                <div className="V4_int_cont1a__">
                                                                                    <div className="timeline_h">
                                                                                        <b>Stage 3.3</b>{" "}
                                                                                    </div>
                                                                                    <div className="timeline_h pt-3"></div>
                                                                                </div>
                                                                                <div className="V4_int_cont1b__ complete_msg">
                                                                                    <div className="ci_date">
                                                                                        {this.state.locked_funding_confirmation == 1
                                                                                            ? "Completed"
                                                                                            : "Last Opened"}
                                                                                        :{" "}
                                                                                        {this.state.locked_funding_confirmation_data != ""
                                                                                            ? moment(
                                                                                                  this.state.locked_funding_confirmation_data.updated
                                                                                              ).format("DD/MM/YYYY, h:mm a")
                                                                                            : "N/A"}
                                                                                    </div>
                                                                                    <div className="s-def1 s1 mt-4 mb-4 w-80">
                                                                                        <Select
                                                                                            name="locked_funding_confirmation"
                                                                                            options={getStagesStatus(0, this.props.fund_lock)}
                                                                                            required={true}
                                                                                            simpleValue={true}
                                                                                            searchable={false}
                                                                                            clearable={false}
                                                                                            placeholder="Filter by: Unread"
                                                                                            onChange={e =>
                                                                                                this.onSelectStage(
                                                                                                    e,
                                                                                                    "10",
                                                                                                    "locked_funding_confirmation",
                                                                                                    "11"
                                                                                                )
                                                                                            }
                                                                                            value={this.state["locked_funding_confirmation"]}
                                                                                            className={"custom_select"}
                                                                                            disabled={
                                                                                                this.state["locked_funding_confirmation"] == "0" ||
                                                                                                this.props.booking_status == "Successful"
                                                                                                    ? true
                                                                                                    : false
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                <div className="v4_btn_size1__  my-3">
                                                                                    <div className="w-30 mr-2"></div>
                                                                                    <div className="w-70 text-right">
                                                                                        <a
                                                                                            className="Downldad_signed_doc"
                                                                                            onClick={() =>
                                                                                                this.send_service_agreement_download_document(
                                                                                                    "10",
                                                                                                    "unsigned"
                                                                                                )
                                                                                            }
                                                                                            // disabled={
                                                                                            //     this.state[
                                                                                            //         "locked_funding_confirmation"
                                                                                            //     ] != "1" ||
                                                                                            //         this.state
                                                                                            //             .final_service_agreement_doc
                                                                                            //             .length == 0
                                                                                            //         ? true
                                                                                            //         : false
                                                                                            // }
                                                                                            disabled={
                                                                                                this.state["locked_funding_confirmation"] != "1" ||
                                                                                                this.state.final_service_agreement_doc.length == 0
                                                                                                    ? !this.state.disable_doc
                                                                                                    : this.state.disable_doc
                                                                                            }
                                                                                        >
                                                                                            <span>Download Signed Document</span>
                                                                                            <i className="icon icon-download2-ie"></i>
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="d-flex">
                                                                                <div className="time_txt w-100">
                                                                                    <div className="task_table_footer col-md-12 bt-1">
                                                                                        {" "}
                                                                                        <a
                                                                                            disabled={
                                                                                                this.state["locked_funding_confirmation"] == "0"
                                                                                                    ? true
                                                                                                    : false
                                                                                            }
                                                                                            onClick={() => this.stage2Note("10")}
                                                                                        >
                                                                                            <u>Attachments & Notes</u>
                                                                                        </a>
                                                                                        <span>
                                                                                            Completed by:{" "}
                                                                                            <u>
                                                                                                {this.state.locked_funding_confirmation_data.status ==
                                                                                                1
                                                                                                    ? this.state.locked_funding_confirmation_data.name
                                                                                                    : "N/A"}
                                                                                            </u>
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/*
                                                            <a onClick={()=>{this.showLockedFunModal()}}></a>
                                                        <LockedFunding showModal={this.state.LockedFundingModalShow} handleClose={()=>this.closeLockedFunModal()} /> */}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="time_l_1">
                                                            <div className="time_no_div">
                                                                <div className="time_no">3.4</div>
                                                                <div className="line_h"></div>
                                                            </div>
                                                            <div className="time_d_1">
                                                                <div className="time_d_2">
                                                                    <div className="time_d_style">
                                                                        <div className="V4_int_cont1__">
                                                                            <div className="V4_int_cont1a__">
                                                                                <div className="timeline_h">
                                                                                    <b>Stage 3.4</b>{" "}
                                                                                </div>
                                                                                <div className="timeline_h pt-3">Final Service Agreement</div>
                                                                            </div>
                                                                            <div className="V4_int_cont1b__ complete_msg">
                                                                                <div className="ci_date">
                                                                                    {this.state.final_service_agreement == 1
                                                                                        ? "Completed"
                                                                                        : "Last Opened"}{" "}
                                                                                    :{" "}
                                                                                    {this.state.final_service_agreement_data != ""
                                                                                        ? moment(
                                                                                              this.state.final_service_agreement_data.updated
                                                                                          ).format("DD/MM/YYYY, h:mm a")
                                                                                        : "N/A"}
                                                                                </div>
                                                                                <div className="s-def1 s1 mt-4 w-80">
                                                                                    <Select
                                                                                        name="final_service_agreement"
                                                                                        options={getStagesStatus(0, this.props.fund_lock)}
                                                                                        required={true}
                                                                                        simpleValue={true}
                                                                                        searchable={false}
                                                                                        clearable={false}
                                                                                        placeholder="Filter by: Unread"
                                                                                        onChange={e =>
                                                                                            this.onSelectStage(e, "11", "final_service_agreement", "")
                                                                                        }
                                                                                        value={this.state["final_service_agreement"]}
                                                                                        className={"custom_select"}
                                                                                        disabled={
                                                                                            this.state["final_service_agreement"] == "0" ||
                                                                                            this.state.signed_final_service_agreement_doc.length ==
                                                                                                0 ||
                                                                                            this.props.booking_status == "Successful"
                                                                                                ? true
                                                                                                : false
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="v4_btn_size1__  my-3">
                                                                                <a
                                                                                    className="btn-3 w-30 mr-2"
                                                                                    disabled={
                                                                                        this.state["final_service_agreement"] == "0" ||
                                                                                        this.state.signed_final_service_agreement_doc.length != 0
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                    onClick={() =>
                                                                                        this.send_sms_reminder("final_service_agreement", 3)
                                                                                    }
                                                                                >
                                                                                    Send SMS reminder
                                                                                </a>
                                                                                <a
                                                                                    className="btn-3 w-25"
                                                                                    onClick={e => this.resend_service_agreement_document(e)}
                                                                                    disabled={
                                                                                        this.state["final_service_agreement"] == "0" ||
                                                                                        this.state.signed_final_service_agreement_doc.length != 0
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                >
                                                                                    Send/Resend Doc
                                                                                </a>
                                                                                {/*disabled={this.state.smsDisabled3}*/}
                                                                                <div className="w-50 text-right">
                                                                                    <a
                                                                                        onClick={() =>
                                                                                            this.send_service_agreement_download_document(
                                                                                                "10",
                                                                                                "signed"
                                                                                            )
                                                                                        }
                                                                                        // disabled={
                                                                                        //     this.state[
                                                                                        //         "final_service_agreement"
                                                                                        //     ] == "0" ||
                                                                                        //         this.state
                                                                                        //             .signed_final_service_agreement_doc
                                                                                        //             .length == 0
                                                                                        //         ? true
                                                                                        //         : false
                                                                                        // }
                                                                                        disabled={
                                                                                            this.state["locked_funding_confirmation"] != "1" ||
                                                                                            this.state["final_service_agreement"] == "0" ||
                                                                                            this.state.signed_final_service_agreement_doc.length == 0
                                                                                                ? !this.state.disable_doc
                                                                                                : this.state.disable_doc
                                                                                        }
                                                                                        className="Downldad_signed_doc"
                                                                                    >
                                                                                        <span>Download Signed Document</span>
                                                                                        <i className="icon icon-download2-ie"></i>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex">
                                                                            <div className="time_txt w-100">
                                                                                <div className="task_table_footer col-md-12 bt-1">
                                                                                    {" "}
                                                                                    <a
                                                                                        disabled={
                                                                                            this.state["final_service_agreement"] == "0"
                                                                                                ? true
                                                                                                : false
                                                                                        }
                                                                                        onClick={() => this.stage2Note("11")}
                                                                                    >
                                                                                        <u>Attachments & Notes</u>
                                                                                    </a>
                                                                                    <span>
                                                                                        Completed by:{" "}
                                                                                        <u>
                                                                                            {this.state.final_service_agreement_data.status == 1
                                                                                                ? this.state.final_service_agreement_data.name
                                                                                                : "N/A"}
                                                                                        </u>
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Panel.Body>
                                            </Panel>
                                        </PanelGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* </PanelGroup> */}
                    <Modal className="modal fade Modal_A  Modal_B Crm" show={this.state.showModalParked} onHide={() => this.closeModalParked()}>
                        <form id="crm_participant_create_doc" method="post" autoComplete="off">
                            <Modal.Body>
                                <div className="dis_cell">
                                    <div className="text text-left Popup_h_er_1">
                                        <span>Relevant Attachments:</span>
                                        <a data-dismiss="modal" aria-label="Close" className="close_i" onClick={() => this.closeModalParked()}>
                                            <i className="icon icon-cross-icons"></i>
                                        </a>
                                    </div>

                                    <div className="row P_15_T">
                                        <div className="col-md-8">
                                            <div className="row P_15_T">
                                                <div className="col-md-12">
                                                    <label>Title</label>
                                                    <span className="required">
                                                        <input
                                                            type="text"
                                                            placeholder="Please Enter Your Title"
                                                            onChange={e => this.props.docsTitleFun(e)}
                                                            value={this.props.docsTitle ? this.props.docsTitle : ""}
                                                            data-rule-required="true"
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row P_15_T">
                                        Participant Details{" "}
                                        <div className="col-md-12">
                                            {" "}
                                            <label>Please select a file to upload</label>
                                        </div>
                                        <div className="col-md-5">
                                            <span className="required upload_btn">
                                                <label className="btn btn-default btn-sm center-block btn-file">
                                                    <i className="but" aria-hidden="true">
                                                        Upload New Doc(s)
                                                    </i>

                                                    <input
                                                        className="p-hidden"
                                                        type="file"
                                                        onChange={this.props.fileChange}
                                                        data-rule-required="true"
                                                        date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf"
                                                    />
                                                </label>
                                            </span>
                                            {this.props.filename ? (
                                                <p>
                                                    File Name: <small>{this.props.filename}</small>
                                                </p>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="col-md-7"></div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-7"></div>
                                        <div className="col-md-5">
                                            <a className="btn-1" onClick={() => this.closeModal1()}>
                                                Save
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Modal.Body>
                        </form>
                    </Modal>
                </BlockUi>
            </div>
        );
    }
}

class EditParticipant extends React.Component {
    constructor(props) {
        super(props);
        this.kindetails = [
            {
                name: "",
                lastname: "",
                contact: "",
                email: "",
                relation: "",
                relation_error: "",
                name_error: "",
                lastname_error: "",
                contact_error: "",
                email_error: ""
            }
        ];

        this.state = {
            filterVal: "",
            showModal: false,
            ParticipantSituation: "",
            Preferredcontacttype: 1,
            ParticipantTSI: 1,
            second_step: false,
            PhoneInput: [{ name: "" }],
            EmailInput: [{ name: "" }],
            AddressInput: [
                {
                    type: "",
                    city: "ewe",
                    state: "sdf",
                    street: "",
                    postal: "98763",
                    type_error: false
                }
            ],
            kindetails: [{ name: "", lastname: "", contact: "", email: "", relation: "" }],
            bookerdetails: [{ name: "", lastname: "", contact: "", email: "", relation: "" }],
            success: false,
            participantReferral: [
                { value: 1, label: "Yes" },
                { value: 2, label: "No" }
            ],
            gender_option: [
                { value: 1, label: "Male" },
                { value: 2, label: "Female" }
            ],
            department_option: [
                { value: 1, label: "HCM" },
                { value: 2, label: "Healthcare" }
            ],
            contact_option: [
                { value: 1, label: "Phone" },
                { value: 2, label: "Email" }
            ],
            to_org_option: [
                { value: 1, label: "To Org" },
                { value: 2, label: "To House" }
            ],
            stateList: [],
            referral: 1,
            selectedState: "",
            selectedState1: "",
            selectedState2: "",
            selectedState3: "",
            showModal1: false,
            Dob: "",
            pAddress: "",
            pAddress2: "",
            assign_to: 1
        };
    }
    showModal1 = () => {
        this.setState({ showModal1: true });
    };

    closeModal1 = () => {
        this.setState({ showModal1: false });
    };
    submit = e => {
        this.setState({ progress: "0" });
        e.preventDefault();
        var custom_validate = this.custom_validation({
            errorClass: "tooltip-default"
        });
        var validator = jQuery("#create_participant").validate({ ignore: [] });
        if (!this.state.loading && jQuery("#create_participant").valid() && custom_validate) {
            const formData = new FormData();
            for (var x = 0; x < this.props.selectedFile.length; x++) {
                formData.append("crmParticipantFiles[]", this.props.selectedFile[x]);
            }
            formData.append("crm_participant_id", this.props.crmParticipantId);
            formData.append("docsTitle", this.props.docsTitle);
            formData.append("PhoneInput", [{ name: "43434" }]);
            formData.append("EmailInput", [{ name: "aa@aa.com" }]);
            formData.append("AddressInput", [
                {
                    state: "sds",
                    postal: "1234",
                    street: this.state.address_primary,
                    city: { value: 1 },
                    department: "dsd"
                },
                {
                    state: "sds",
                    postal: "1234",
                    street: this.state.address_secondary,
                    city: { value: 1 },
                    department: "dsd"
                }
            ]);
            formData.append("username", "wewew");
            formData.append("gender", "male");
            formData.append("firstname", this.state["firstname"]);
            formData.append("lastname", this.state["lastname"]);
            formData.append("dob", this.state["dob"]);
            formData.append("prefer_contact", this.state["prefer_contact"]);
            formData.append("referral", 1);
            formData.append("assign_to", this.state.oc_departments);
            formData.append("medicare_num", this.state["medicare_num"]);
            formData.append("ndis_num", this.state["ndis_num"]);
            formData.append("middlename", "");
            formData.append("preferredname", "");
            formData.append("ParticipantTSI", "sdsd");
            formData.append("formaldiagnosisprimary", "dsdsd");
            formData.append("participantCognition", "sdsd");
            formData.append("participantCommunication", "sdsd");
            formData.append("participantenglish", "wewew");
            formData.append("participantPreferredlang", "asdsd");
            formData.append("CarersInput", [{ Gender: "1", Ethnicity: "sd", Religious: "sdsd" }]);
            formData.append("bookerdetails", [
                {
                    name: "",
                    lastname: "",
                    contact: "",
                    email: "",
                    relation: "father"
                }
            ]);

            var str = "";
            sessionStorage.setItem("participant_step_1", str);
            this.setState({ loading: true }, () => {
                postImageData("crm/CrmParticipant/update_crm_participant", formData, this).then(result => {
                    if (result.status) {
                        toast.success(<ToastUndo message={"Participant updated successfully"} showType={"s"} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.setState({ success: true });
                        this.props.closeingModel();
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.props.closeingModel();
                    }
                    this.setState({ loading: false });
                });
            });
        } else {
            validator.focusInvalid();
        }
    };
    componentWillReceiveProps(newsProps) {
        // this.setState({ AddressInput: [{ 'state': 'sds', 'postal': '1234', 'street': this.state['primary_address'], 'city': { 'value': 1 }, 'department': 'dsd', 'type': this.state['address_primary_type'] }] })
        this.setState(newsProps.editparticipant);
        this.setState({
            kindetails: [
                {
                    name: this.state["kin_firstname"],
                    lastname: this.state["kin_lastname"],
                    contact: this.state["kin_phone"],
                    email: this.state["kin_email"],
                    relation: this.state["kin_relation"]
                }
            ]
        });
    }
    handleChange = e => {
        var inputFields = this.state;
        this.setState({ error: "" });
        inputFields[e.target.name] = e.target.value;
        this.setState(inputFields);
    };
    selectChanges = (selectedOption, fieldname) => {
        var selectField = this.state;
        selectField[fieldname] = selectedOption;
        selectField[fieldname + "_error"] = false;
        this.setState(selectField);
    };

    handleShareholderNameChange = (index, stateKey, fieldtkey, fieldValue) => {
        var state = {};
        var tempField = {};
        var List = this.state[stateKey];
        List[index][fieldtkey] = fieldValue;

        state[stateKey] = List;

        this.setState(state);
    };
    handleAddShareholder = (e, tagType) => {
        e.preventDefault();
        var state = [];
        state[tagType] = this.state[tagType].concat([{ name: "", lastname: "", contact: "", email: "", relation: "" }]);
        this.setState(state);
    };

    handleRemoveShareholder = (e, idx, tagType) => {
        e.preventDefault();
        var state = {};
        var List = this.state[tagType];

        state[tagType] = List.filter((s, sidx) => idx !== sidx);
        this.setState(state);
    };

    custom_validation = () => {
        var return_var = true;
        var state = {};
        var List = [{ key: "referral_relation" }, { key: "living_situation" }];
        List.map((object, sidx) => {
            if (object.key == "referral_relation") {
                if (this.state["referral_relation"] == undefined || this.state["referral_relation"] == "") {
                    state[object.key + "_error"] = true;
                    this.setState(state);
                    return_var = false;
                }
            } else if (this.state[object.key] == null || this.state[object.key] == undefined || this.state[object.key] == "") {
                state[object.key + "_error"] = true;
                this.setState(state);
                return_var = false;
            }
        });

        const newShareholders = this.state.AddressInput.map((object, sidx) => {
            if (object.type == "" || object.type == undefined || object.type == null) {
                return_var = false;
                return { ...object, type_error: true };
            } else {
                return { ...object, type_error: false };
            }
        });
        this.setState({ AddressInput: newShareholders });

        return return_var;
    };

    errorShowInTooltip = ($key, msg) => {
        //alert($key);
        return this.state[$key + "_error"] ? (
            <div className={"tooltip custom-tooltip fade top in" + (this.state[$key + "_error"] ? " select-validation-error" : "")} role="tooltip">
                <div className="tooltip-arrow"></div>
                <div className="tooltip-inner">{msg}.</div>
            </div>
        ) : (
            ""
        );
    };

    errorShowInTooltipForLoop = (key, msg) => {
        return key == true ? (
            <div className={"tooltip custom-tooltip fade top in" + (key == true ? " select-validation-error" : "")} role="tooltip">
                <div className="tooltip-arrow"></div>
                <div className="tooltip-inner">{msg}.</div>
            </div>
        ) : (
            ""
        );
    };

    render() {
        if (this.state.success) {
            return <EditParticipant />;
        }

        return (
            <div>
                <div className={this.props.showModal ? "customModal show" : "customModal"}>
                    <ReactPlaceholder showLoadingAnimation type="media" ready={!this.state.loading} customPlaceholder={IntakeProcess}>
                        <div className="custom-modal-dialog Information_modal">
                            <div className="custom-modal-header by-1">
                                <div className="Modal_title">Edit Prospective Participant</div>
                                <i className="icon icon-close1-ie Modal_close_i" onClick={this.props.closeModal}></i>
                            </div>
                            <form id="create_participant">
                                <div className="custom-modal-body w-80 mx-auto">
                                    <div className="row">
                                        <div className="col-md-12 py-4 title_sub_modal">{/* Participant Details */} Notes</div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">First name: </label>
                                            <div className="required">
                                                <input
                                                    data-rule-required="true"
                                                    data-msg-required="Add First Name"
                                                    placeholder="First Name"
                                                    type="text"
                                                    name="firstname"
                                                    value={this.state["firstname"] || ""}
                                                    onChange={this.handleChange}
                                                    maxLength="30"
                                                />
                                                <input
                                                    type="hidden"
                                                    name="crm_participant_id"
                                                    className="default-input"
                                                    value={this.props.crmParticipantId}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Last name: </label>
                                            <div className="required">
                                                <input
                                                    placeholder="Last Name"
                                                    data-msg-required="Add Last Name"
                                                    type="text"
                                                    name="lastname"
                                                    value={this.state["lastname"] || ""}
                                                    onChange={this.handleChange}
                                                    data-rule-required="true"
                                                    maxLength="30"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Date of Birth: </label>
                                            <div className="required">
                                                <DatePicker
                                                    autoComplete={"off"}
                                                    showYearDropdown
                                                    scrollableYearDropdown
                                                    yearDropdownItemNumber={110}
                                                    dateFormat="dd-MM-yyyy"
                                                    required={true}
                                                    data-placement={"bottom"}
                                                    maxDate={moment()}
                                                    name="dob"
                                                    onChange={date =>
                                                        this.setState({
                                                            Dob: date
                                                        })
                                                    }
                                                    selected={this.state["dob"] ? moment(this.state["dob"], "DD-MM-YYYY") : null}
                                                    className="text-center "
                                                    placeholderText="DD/MM/YYYY"
                                                    maxLength="30"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">NDIS Number: </label>
                                            <div className="required">
                                                <input
                                                    type="text"
                                                    data-rule-required="true"
                                                    data-msg-required="NDIS Number Required"
                                                    placeholder="000 000 000"
                                                    name="ndis_num"
                                                    value={this.state["ndis_num"] || ""}
                                                    onChange={this.handleChange}
                                                    maxLength="30"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Medicare Number: </label>
                                            <div className="required">
                                                <input
                                                    type="text"
                                                    data-rule-required="true"
                                                    data-msg-required="Medicare Number Required"
                                                    placeholder="0000 00000 0"
                                                    name="medicare_num"
                                                    value={this.state["medicare_num"] || ""}
                                                    onChange={this.handleChange}
                                                    maxLength="30"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 py-4">
                                            <div className="bt-1"></div>
                                        </div>
                                        <div className="col-md-12 pt-1 pb-4 title_sub_modal">Reference Details</div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">First name: </label>
                                            <div className="required">
                                                <input
                                                    placeholder="First name"
                                                    data-msg-required="Add First Name"
                                                    type="text"
                                                    value={this.state["referral_firstname"] || ""}
                                                    name="referral_firstname"
                                                    onChange={this.handleChange}
                                                    data-rule-required="true"
                                                    maxLength="30"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Last name: </label>
                                            <div className="required">
                                                <input
                                                    placeholder="Last Name"
                                                    data-msg-required="Add Last Name"
                                                    type="text"
                                                    value={this.state["referral_lastname"] || ""}
                                                    name="referral_lastname"
                                                    onChange={this.handleChange}
                                                    data-rule-required="true"
                                                    maxLength="30"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Organisation: </label>
                                            <div className="required">
                                                <input
                                                    type="text"
                                                    className="default-input"
                                                    data-rule-required="true"
                                                    data-msg-required="Organisation Name Required"
                                                    value={this.state["referral_org"] || ""}
                                                    name="referral_org"
                                                    onChange={this.handleChange}
                                                    placeholder="Organisation"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Email: </label>
                                            <div className="required">
                                                <input
                                                    placeholder="Email"
                                                    type="text"
                                                    data-msg-required="Add Email Address"
                                                    name="referral_email"
                                                    value={this.state["referral_email"] || ""}
                                                    onChange={this.handleChange}
                                                    data-rule-required="true"
                                                    data-rule-email="true"
                                                    maxLength="70"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Phone Number: </label>
                                            <div className="required">
                                                <input
                                                    placeholder="Phone"
                                                    type="text"
                                                    data-msg-required="Add Phone Number"
                                                    name="referral_phone"
                                                    value={this.state["referral_phone"] || ""}
                                                    onChange={this.handleChange}
                                                    data-rule-required="true"
                                                    maxLength="30"
                                                    maxLength="30"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Relationship to Participant: </label>
                                            <div className="required">
                                                <div className="s-def1">
                                                    <Select
                                                        className="custom_select"
                                                        clearable={false}
                                                        searchable={false}
                                                        simpleValue={true}
                                                        value={this.state["referral_relation"] || ""}
                                                        name="referral_relation"
                                                        onChange={e => this.selectChanges(e, "referral_relation")}
                                                        options={relationDropdown(0)}
                                                        required={true}
                                                        className={"custom_select"}
                                                        placeholder="Please Select"
                                                    />

                                                    {this.errorShowInTooltip("referral_relation", "Add Relation")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 py-4">
                                            <div className="bt-1"></div>
                                        </div>
                                        <div className="col-md-12 pt-1 pb-4 title_sub_modal">Living Details:</div>
                                        <div className="col-md-4 mb-4">
                                            <label className="title_input">Living Situation: </label>
                                            <div className="required">
                                                <div className="s-def1">
                                                    <Select
                                                        className="custom_select"
                                                        clearable={false}
                                                        name="living_situation"
                                                        simpleValue={true}
                                                        value={this.state["living_situation"] || ""}
                                                        onChange={e => this.selectChanges(e, "living_situation")}
                                                        required={true}
                                                        searchable={false}
                                                        className={"custom_select"}
                                                        options={LivingSituationOption(0)}
                                                        placeholder="Please Select"
                                                    />
                                                    {this.errorShowInTooltip("living_situation", "Add ParticipantSituation")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.AddressInput.map((AddressInput, idx) => (
                                        <div key={idx + 1}>
                                            <div className="row">
                                                <label className="title_input col-md-12 pl-5">
                                                    <b>{idx > 0 ? "Secondary Address:" : "Primary Address:"} </b>
                                                </label>
                                            </div>
                                            <div key={idx + 1} className="row d-flex">
                                                <div className="col-md-7 mb-4">
                                                    <label className="title_input">Address: </label>
                                                    <div className="small-search l-search">
                                                        <Autocomplete
                                                            className="form-control"
                                                            style={{
                                                                width: "90%"
                                                            }}
                                                            name={"primary_address" + idx}
                                                            onPlaceSelected={place =>
                                                                this.handleShareholderNameChange(
                                                                    idx,
                                                                    "AddressInput",
                                                                    "street",
                                                                    place.formatted_address
                                                                )
                                                            }
                                                            types={["(regions)"]}
                                                            value={AddressInput.street || ""}
                                                            onChange={evt =>
                                                                this.handleShareholderNameChange(idx, "AddressInput", "street", evt.target.value)
                                                            }
                                                            onKeyDown={evt =>
                                                                this.handleShareholderNameChange(idx, "AddressInput", "street", evt.target.value)
                                                            }
                                                        />

                                                        <button>
                                                            <span className="icon icon-location1-ie"></span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-4">
                                                    <label className="title_input">Address Type: </label>
                                                    <div className="required">
                                                        <div className="s-def1">
                                                            <Select
                                                                clearable={false}
                                                                searchable={false}
                                                                className="custom_select"
                                                                simpleValue={true}
                                                                name={"address_primary_type" + idx}
                                                                value={AddressInput.type || ""}
                                                                onChange={e => this.handleShareholderNameChange(idx, "AddressInput", "type", e)}
                                                                options={sitCategoryListDropdown(0)}
                                                                data-rule-required="true"
                                                                data-msg-required="Select Address Type"
                                                                placeholder="Please Select"
                                                            />
                                                            {this.errorShowInTooltipForLoop(AddressInput.type_error, "Select Address Type")}
                                                        </div>
                                                    </div>
                                                </div>
                                                {idx > 0 ? (
                                                    <div className="col-md-1 align-items-end d-inline-flex mb-4">
                                                        {" "}
                                                        <span
                                                            className="button_plus__"
                                                            onClick={e => this.handleRemoveShareholder(e, idx, "AddressInput")}
                                                        >
                                                            <i className="icon icon-decrease-icon Add-2-2"></i>
                                                        </span>
                                                    </div>
                                                ) : this.state.AddressInput.length == 3 ? (
                                                    ""
                                                ) : (
                                                    <div className="col-md-1 align-items-end d-inline-flex mb-4">
                                                        <span
                                                            className="button_plus__"
                                                            onClick={e => handleAddShareholder(this, e, "AddressInput", AddressInput)}
                                                        >
                                                            <i className="icon icon-add-icons Add-2-1"></i>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <RalativeDetails
                                        title="Next of Kin"
                                        stateKey="kindetails"
                                        kindetails={this.state["kindetails"]}
                                        errorShowInTooltipForLoop={this.errorShowInTooltipForLoop}
                                        handleShareholderNameChange={this.handleShareholderNameChange}
                                        handleRemoveShareholder={this.handleRemoveShareholder}
                                        handleAddShareholder={this.handleAddShareholder}
                                    />
                                    <div className="row">
                                        <div className="col-md-12 py-4">
                                            <div className="bt-1"></div>
                                        </div>
                                        <div className="col-md-12 pt-1 pb-4 title_sub_modal">Attachments</div>
                                    </div>

                                    <div className="row ">
                                        <div className="col-md-3 mb-4">
                                            <label className="title_input">NDIS Plan Document: </label>
                                            <a className="v-c-btn1">
                                                <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                                            </a>
                                        </div>
                                        <div className="col-md-3 mb-4">
                                            <label className="title_input">Agreement Document: </label>
                                            <a className="v-c-btn1">
                                                <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                                            </a>
                                        </div>
                                        <div className="col-md-3 mb-4">
                                            <label className="title_input">Signed Concent Document: </label>
                                            <a className="v-c-btn1">
                                                <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="row d-flex mb-5">
                                        <div className="col-md-9 align-items-end d-inline-flex">
                                            <div className="bt-1 w-100"></div>
                                        </div>
                                        <div className="col-md-3">
                                            <a className="btn-1" onClick={this.showModal1}>
                                                Browse
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="custom-modal-footer bt-1 mt-5">
                                    <div className="row d-flex justify-content-end">
                                        <div className="col-md-3">
                                            <a className="btn-1" onClick={this.submit} disabled={this.state.disablemodal}>
                                                Apply Changes
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </ReactPlaceholder>
                </div>
                <Modal className="modal fade Modal_A  Modal_B Crm" show={this.state.showModal1} onHide={() => this.closeModal1()}>
                    <form id="crm_participant_create_doc" method="post" autoComplete="off">
                        <Modal.Body>
                            <div className="dis_cell">
                                <div className="text text-left Popup_h_er_1">
                                    <span>Relevant Attachments:</span>
                                    <a data-dismiss="modal" aria-label="Close" className="close_i" onClick={() => this.closeModal1()}>
                                        <i className="icon icon-cross-icons"></i>
                                    </a>
                                </div>

                                <div className="row P_15_T">
                                    <div className="col-md-8">
                                        <div className="row P_15_T">
                                            <div className="col-md-12">
                                                <label>Title</label>
                                                <span className="required">
                                                    <input
                                                        type="text"
                                                        placeholder="Please Enter Your Title"
                                                        onChange={e => this.props.docsTitleFun(e)}
                                                        value={this.props.docsTitle ? this.props.docsTitle : ""}
                                                        data-rule-required="true"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row P_15_T">
                                    <div className="col-md-12">
                                        {" "}
                                        <label>Please select a file to upload</label>
                                    </div>
                                    <div className="col-md-5">
                                        <span className="required upload_btn">
                                            <label className="btn btn-default btn-sm center-block btn-file">
                                                <i className="but" aria-hidden="true">
                                                    Upload New Doc(s)
                                                </i>

                                                <input
                                                    className="p-hidden"
                                                    type="file"
                                                    onChange={this.props.fileChange}
                                                    data-rule-required="true"
                                                    date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf"
                                                />
                                            </label>
                                        </span>
                                        {this.props.filename ? (
                                            <p>
                                                File Name: <small>{this.props.filename}</small>
                                            </p>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                    <div className="col-md-7"></div>
                                </div>

                                <div className="row">
                                    <div className="col-md-7"></div>
                                    <div className="col-md-5">
                                        <a className="btn-1" onClick={() => this.closeModal1()}>
                                            Save
                                        </a>
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
class RalativeDetails extends Component {
    render() {
        return (
            <div>
                <div className="row P_25_T">
                    <div className="col-lg-12  col-md-12">
                        <div className="bor_T"></div>
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-lg-12  col-md-12 P_15_TB title_sub_modal">
                        <h3>
                            <b>{this.props.title} Details:</b>
                        </h3>
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-lg-12  col-md-12">
                        <div className="bor_T"></div>
                    </div>
                    <div className="col-lg-1"></div>
                </div>

                {this.props.kindetails.map((obj, index) => (
                    <div key={index + 1} className="P_25_T row">
                        <div className="col-lg-3 col-md-3">
                            <label className="title_input"> Name:</label>
                            <div className="required">
                                <input
                                    className="input_f mb-1 "
                                    type="text"
                                    value={obj.name || ""}
                                    name={this.props.stateKey + "input_kin_first_name" + index}
                                    placeholder="First Name"
                                    onChange={evt => this.props.handleShareholderNameChange(index, this.props.stateKey, "name", evt.target.value)}
                                    maxLength="30"
                                    required={true}
                                />
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-3">
                            <label></label>
                            <div className="required">
                                <input
                                    className="input_f mb-1 mt-1"
                                    type="text"
                                    value={obj.lastname || ""}
                                    name={this.props.stateKey + "input_kin_lastname" + index}
                                    placeholder="Last Name"
                                    onChange={evt => this.props.handleShareholderNameChange(index, this.props.stateKey, "lastname", evt.target.value)}
                                    maxLength="30"
                                    required={true}
                                />
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-3">
                            <label className="title_input"> Contact:</label>
                            <div className="required">
                                <input
                                    className="input_f mb-1  distinctKinCOntact"
                                    type="text"
                                    value={obj.contact || ""}
                                    name={this.props.stateKey + "input_kin_contact" + index}
                                    placeholder="Contact"
                                    onChange={evt => this.props.handleShareholderNameChange(index, this.props.stateKey, "contact", evt.target.value)}
                                    maxLength="30"
                                    data-rule-notequaltogroup='[".distinctKinCOntact"]'
                                    data-msg-notequaltogroup="Please enter unique contact number"
                                    required={true}
                                />
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3">
                            <label></label>
                            <div className="required">
                                <input
                                    className="input_f mb-1 mt-1 distinctEmail"
                                    type="text"
                                    value={obj.email || ""}
                                    name={this.props.stateKey + "input_kin_email" + index}
                                    placeholder="Email"
                                    maxLength="70"
                                    data-rule-notequaltogroup='[".distinctEmail"]'
                                    data-rule-email="true"
                                    required={true}
                                    onChange={evt => this.props.handleShareholderNameChange(index, this.props.stateKey, "email", evt.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-3">
                            <label className="title_input">Relation:</label>
                            <div className="row">
                                <div className="col-lg-9 col-md-9">
                                    <div className="required">
                                        <span className="default_validation">
                                            <Select
                                                className=""
                                                clearable={false}
                                                searchable={true}
                                                simpleValue={true}
                                                value={obj.relation || ""}
                                                name={this.props.stateKey + "input_relation_primary" + index}
                                                onChange={evt => this.props.handleShareholderNameChange(index, this.props.stateKey, "relation", evt)}
                                                options={relationDropdown(0)}
                                                required={true}
                                                className={"custom_select"}
                                                placeholder="Please Select"
                                            />
                                        </span>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-3">
                                    {index > 0 ? (
                                        <span
                                            className="button_plus__"
                                            onClick={e => this.props.handleRemoveShareholder(e, index, this.props.stateKey)}
                                        >
                                            <i className="icon icon-decrease-icon Add-2-2"></i>
                                        </span>
                                    ) : this.props.kindetails.length == 3 ? (
                                        ""
                                    ) : (
                                        <span className="button_plus__" onClick={e => this.props.handleAddShareholder(e, this.props.stateKey)}>
                                            <i className="icon icon-add-icons Add-2-1"></i>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType,
        participaintDetails: state.DepartmentReducer.participaint_details
    };
};

const mapDispatchtoProps = dispach => {
    return {
        states_update: stateData => dispach(states_update(stateData))
    };
};

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantDetails);

const ListingA = props => {
    return (
        <div className="Partt_d1_txt_2 my-4">
            <strong className={"crm_H_set_1"}>{props.titleHadding}</strong>
            <span>{props.showValueItems}</span>
        </div>
    );
};

const ListingB = props => {
    return (
        <div className="Partt_d1_txt_2 my-4">
            <strong className={"crm_H_set_2"}>{props.titleHadding}</strong>
            <span>{props.showValueItems}</span>
        </div>
    );
};

const ListingC = props => {
    return (
        <div className="Partt_d1_txt_2 my-4">
            <strong className={"crm_H_set_3"}>{props.titleHadding}</strong>
            <span>{props.showValueItems}</span>
        </div>
    );
};
