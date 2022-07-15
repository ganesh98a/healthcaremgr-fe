import React, { Component } from 'react';
import ReactTable from 'react-table'
import ApplicantAttachmentModal from './ApplicantAttachmentModal';
import ApplicantAddAttachmentModal from './ApplicantAddAttachmentModal';
import './recruit2.css';
import { connect } from 'react-redux';
import _ from 'lodash';
import { COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from '../../../../config';
import ReactPlaceholder from 'react-placeholder';
import { custNumberLine, customHeading, closeIcons } from 'service/CustomContentLoader.js';
import { NottachmentAvailable } from 'service/custom_value_data.js';
import { postData, downloadFile } from 'service/common.js';
import ScrollArea from "react-scrollbar";
import jQuery from "jquery";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { defaultSpaceInTable } from '../../../../service/custom_value_data';
import moment from 'moment';
import { getLoginToken, toastMessageShow } from '../../../../service/common';
import ApplicantEditAttachmentForm from './ApplicantEditAttachmentForm';
import { getApplicantAttachmentDetails } from '../actions/RecruitmentApplicantAction';

export function getApplicationByAttachment(attachment, applications = []) {
    const { application_id } = attachment || {}
    const foundApplication = applications.find(a => parseInt(application_id) === parseInt(a.id))
    if (foundApplication) {
        return foundApplication
    }

    return null
}


class ApplicantAttachment extends Component {

    constructor() {
        super();
        this.state = {
            loading: true,
            ApplicantAttachment: false,
            ApplicantAddAttachment: false,
            ApplicantEditAttachment: false,
            editAttachmentId: null,
            validStatus: 1,
        }
    }

    componentDidMount() {
    }

    getAllNonOtherApplicantAttachments() {
        const { applicant_attachment_list } = this.props
        return (applicant_attachment_list || []).filter(a => a.archive == 0 && _.toLower(a.category_title) != 'other')
    }

    getAllOtherApplicantAttachments() {
        const { applicant_attachment_list } = this.props
        return (applicant_attachment_list || []).filter(a => a.archive == 0 && _.toLower(a.category_title) == 'other')
    }

    bytesToMegabytes(bytes = 0) {
        return bytes / (1024 * 1024)
    }

    bytesToKilobytes(bytes = 0) {
        return bytes / 1024
    }

    formatNum(number, decimalPlaces) {
        return (Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces))
    }

    determineMediaShowViewUrl(docUrl, awsFlag) {
        var s3 = false;
         //If awsUri found then add aws uri for download
        if(awsFlag == "1") {
            s3 = true;
        }
              
        return COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod9 + '/?url=' + docUrl + `&s3=${s3}`;
    }


    handleOnClickEditApplicantAttachment = attachedDoc => e => {
        e.preventDefault()

        this.setState({
            ApplicantEditAttachment: true,
            editAttachmentId: attachedDoc['id'],
        })
    }

    handleOnClickArchiveApplicantAttachment = attachedDoc => async e => {
        e.preventDefault()

        const { attachment } = attachedDoc
        const filename = attachedDoc.download_as

        const decision = window.confirm(`Are you sure you want to archive '${filename}'? This action can not be undone.`);
        if (!decision) {
            return
        }

        try {
            const res = await postData('recruitment/RecruitmentApplicant/archive_selected_file', {
                applicantId: attachedDoc.applicant_id,
                archiveData: [attachedDoc.id].reduce((acc, curr) => {
                    acc[curr] = true
                    return acc
                }, {})
            })

            if (res.status) {
                toastMessageShow(res.msg, 's');

                this.props.getApplicantAttachmentDetails(this.props.id);
            } else {
                toastMessageShow(res.error, 'e');
            }
        } catch(e) {
            console.error(e)
        }
    }

    renderAttachmentsTable() {
        let allNonArchivedDocs = this.props.applicant_attachment_list.filter(row => row.archive == 0);

        const data = allNonArchivedDocs.map(d => {
            return {
                ...d,
                actions: {
                    preview: {
                        component: 'a',
                        text: <i className="icon icon icon-view1-ie f-21"></i>,
                        title: `View/download attachment as '${d.download_as}'`,
                        href: this.determineMediaShowViewUrl(d.url, d.aws_uploaded_flag),
                        target: '_blank',
                        className: 'inline-block',
                    },
                    edit: {
                        component: Link,
                        disabled: Number(d.system_gen_flag) === 1 && this.state.validStatus === Number(d.document_status)? true : false
                        || Number(this.props.flagged_status) === 2 ? true : false,
                        text: <i className="icon icon-edit3-ie f-21"></i>,
                        to: '#',
                        title: `Update attachment information.`,
                        className: 'inline-block',
                        onClick: this.handleOnClickEditApplicantAttachment(d),

                    },
                    archive: {
                        component: Link,
                        to: '#',
                        text: <i className="icon icon-trash-o f-21"></i>,
                        title: `Archive attachment`,
                        disabled: Number(this.props.flagged_status) === 2 ? true : false,
                        className: 'inline-block',
                        onClick: this.handleOnClickArchiveApplicantAttachment(d),
                    }
                }
            }
        })

        return (
            <div className="col-md-12 col-lg-12 col-xs-12">
                <div className="row mt-3 d-flex flex-wrap after_before_remove">
                    <div className="listing_table col">
                        <ReactTable
                            columns={[
                                /*
                                Uncomment this code block to determine which
                                attachment belongs to application or applicant (0 means belongs to applicant, non-0 means belongs to application)
                                {
                                    accessor: "application_id",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">&nbsp;</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                                },
                                */
                                {
                                    accessor: "download_as",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">File name</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => <span title={`Export as '${props.value}'`}>{defaultSpaceInTable(props.value)}</span>
                                },
                                // display 'Job position' column if we can get application_id
                                this.props.application && {
                                    accessor: attachment => {
                                        const attachmentApplicationId = (attachment || {}).application_id
                                        if (!attachmentApplicationId) {
                                            return null
                                        }

                                        if (parseInt(attachmentApplicationId) === 0) {
                                            return null
                                        }

                                        const application_id = _.get(this.props, 'application.id')
                                        if (parseInt(attachmentApplicationId) === parseInt(application_id)) {
                                            return _.get(attachment, 'job.title')
                                        } else {
                                            // something is wrong, you might have picked the application ID of someone else
                                            return 'N/A'
                                        }

                                    },
                                    id: 'job_title',
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Job position</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => (
                                        <span title={defaultSpaceInTable(props.value)}>
                                            {defaultSpaceInTable(props.value)}
                                        </span>
                                    )
                                },
                                {
                                    accessor: "category_title",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Type</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                                },

                                {
                                    accessor: "document_status_label",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Status</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                                },
                                {
                                    accessor: "expiry_date",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Expiry date</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => {
                                        const { value } = props
                                        if (!value) {
                                            return <>&nbsp;</>
                                        }

                                        const dateExpired = moment(value).format('DD/MM/YYYY')
                                        return <time title={value} dateTime={value}>{dateExpired}</time>
                                    }
                                },
                                {
                                    accessor: "created",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Attached on</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => {
                                        const { value } = props
                                        if (!value) {
                                            return <>&nbsp;</>
                                        }

                                        const dateCreated = moment(value).format('DD/MM/YYYY')
                                        return <time title={value} dateTime={value}>{dateCreated}</time>
                                    }
                                },
                                {
                                    accessor: "updated_at",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Updated on</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => {
                                        const { value } = props
                                        if (!value) {
                                            return <>&nbsp;</>
                                        }

                                        const dateUpdated = moment(value).format('DD/MM/YYYY')
                                        return <time title={value} dateTime={value}>{dateUpdated}</time>
                                    }
                                },
                                {
                                    accessor: "issue_date",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Issue date</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => {
                                        const { value } = props
                                        if (!value) {
                                            return <>&nbsp;</>
                                        }

                                        const dateIssued = moment(value).format('DD/MM/YYYY')
                                        return <time title={value} dateTime={value}>{dateIssued}</time>
                                    }
                                },
                                {
                                    accessor: "reference_number",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__" title={`Reference number`}>Reference number</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => <span title={_.get(props, 'value', undefined)}>{defaultSpaceInTable(props.value)}</span>
                                },
                                {
                                    accessor: "attachment_size",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Size</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    Cell: props => {
                                        let fileNotEmptyOrNonExistent = !props.value
                                        if (fileNotEmptyOrNonExistent) {
                                            return <span title="File does not exists anymore or is empty">-</span>
                                        }

                                        let mb = ''
                                        let kb = ''
                                        if (!Number.isNaN(props.value)) {
                                            mb = this.bytesToMegabytes(props.value)
                                            kb = this.bytesToKilobytes(props.value)

                                            mb = this.formatNum(mb, 2).toFixed(2)
                                            kb = this.formatNum(kb, 0).toFixed(0)
                                        }

                                        return <span title={`${kb} KB`}>{`${mb} MB`}</span>
                                    }
                                },
                                {
                                    accessor: 'actions',
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Actions</div>
                                        </div>
                                    ,
                                    sortable: false,
                                    className: '_align_c__',
                                    width: 140,
                                    Cell: props => {
                                        const { value } = props
                                        return (
                                            <span>
                                                {
                                                    Object.keys(value).map((k, i) => {
                                                        const { component, text } = value[k]
                                                        const p = {
                                                            ...value[k],
                                                            component: undefined,
                                                            text: undefined,
                                                        }

                                                        return (
                                                            <>
                                                                { i > 0 && <>&nbsp;  &nbsp;</>}
                                                                { React.createElement(component, p, text) }
                                                            </>
                                                        )
                                                    })
                                                }
                                            </span>
                                        )
                                    }
                                },
                            ].filter(Boolean)}
                            id="ApplicantAttachmentsTable"
                            manual
                            noDataText="No Record Found"
                            defaultPageSize={10}
                            data={data}
                            minRows={2}
                            showPagination={false}
                            className="-striped -highlight"
                            getProps={() => ({ id: 'ApplicantAttachmentTable' })}
                        />
                    </div>
                </div>
            </div>
        )
    }
    renderAttachmentsTable_old() {
        let currentDocumet = this.props.applicant_attachment_list.filter((row) => row.archive == 0 && _.toLower(row.category_title) != 'other');
        let currentOtherDocumet = this.props.applicant_attachment_list.filter((row) => row.archive == 0 && _.toLower(row.category_title) == 'other');

        return (
            <div className="col-md-12 col-lg-12 col-xs-12">
                <div className="row mt-3 d-flex flex-wrap after_before_remove">
                    <div className="col-md-7 pd_r_20p col-sm-7 col-xs-12">
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(4)} ready={!this.props.info_loading}>
                            <div className="cstmSCroll1">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    style={{ paddingRight: "15px", height: 'auto', maxHeight: '300px' }}
                                >
                                    <div className="row d-flex flex-wrap doc_Cat_row">
                                        {currentDocumet.length > 0 ? currentDocumet.map((row, index) => {
                                            return (<div className="col-md-4 mb_20p col-sm-4 col-xs-6" key={index}><h5 className="pb_10p"><strong>{row.category_title}</strong></h5><div>
                                            <a onClick={() => downloadFile(row.url,row.attachment)}  className="btn eye-btn cmn-btn1 wid_100p dotted_line_one">{row.attachment_title}</a></div></div>);

                                        }) : <div className="mt-2 w-100"><NottachmentAvailable /></div>
                                        }
                                    </div>
                                </ScrollArea>
                            </div>
                        </ReactPlaceholder>
                    </div>

                    <div className="col-md-5 col-sm-12 bor_l_b pd_l_20p bl-xs-0 bt-xs-1 pt-sm-3">
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(4)} ready={!this.props.info_loading}>
                            <h5 className=""><strong>Other Attachments</strong></h5>

                            <div className="other_Attch d_flex1 flex_wrap1 mt-1">
                                {currentOtherDocumet.length > 0 ? currentOtherDocumet.map((row, index) => {
                                    //return (<div key={index}><a onClick={() => downloadFile(BASE_URL + 'mediaShow/r/' + this.props.id + '/' + encodeURIComponent(btoa(row.attachment)),row.attachment)} target="_blank" className="btn eye-btn cmn-btn1 wid_100p">{row.attachment_title}</a></div>);
                                    return (<div key={index}><a onClick={() => downloadFile(row.url,row.attachment)} target="_blank" className="btn eye-btn cmn-btn1 wid_100p">{row.attachment_title}</a></div>);

                                }) : <NottachmentAvailable />
                                }
                            </div>
                        </ReactPlaceholder>
                    </div>
                </div>
            </div>
        )
    }

    renderEditModal() {
        const { ApplicantEditAttachment: show, editAttachmentId } = this.state
        const { applicant_attachment_list } = this.props
        const foundAttachment = (applicant_attachment_list || []).find(a => a.id === editAttachmentId)

        if (!foundAttachment) {
            console.warn(`Attachment with ID of ${editAttachmentId} could not be found`);
            return null
        }

        const applicationByAttachment = getApplicationByAttachment(foundAttachment, this.props.applications)

        return (
            <div className={'customModal ' + (show ? ' show' : '')}>
                <div className="cstomDialog widBig" style={{maxWidth:'700px', minWidth:'700px'}}>
                    <h3 className="cstmModal_hdng1--">
                        Edit Attachments
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.setState({ ApplicantEditAttachment: false })}></span>
                    </h3>

                    <ApplicantEditAttachmentForm
                        key={editAttachmentId}
                        attachment={foundAttachment}
                        isModalPage={true}
                        application={applicationByAttachment}
                        closeModal={() => this.setState({ ApplicantEditAttachment: false })}
                    />
                </div>
            </div>
        )
    }


    render() {
        let currentDocumet = this.props.applicant_attachment_list.filter((row) => row.archive == 0 && _.toLower(row.category_title) != 'other');
        let currentOtherDocumet = this.props.applicant_attachment_list.filter((row) => row.archive == 0 && _.toLower(row.category_title) == 'other');

        return (
            <React.Fragment>
                <div className="row bg_w mt-3">
                    <div className="app_infoBox__">
                        <div className="row">

                            <div className="col-md-12 col-sm-12 d_flex1  align-items-center pb_15p bor_bot_b col-xs-12">
                                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(40, 'left')} ready={!this.props.info_loading}>
                                    <h4 className="flex-1 pr_15p"><strong>Attachments - Applicant Related</strong></h4>
                                    {/* <button className="btn cmn-btn1 m_l_10p" onClick={() => { this.setState({ ApplicantAttachment: true }) }}>Manage Attachment</button> */}
                                    <button disabled={this.props.flagged_status == 2 || false} className="btn cmn-btn1 m_l_10p" onClick={() => { this.setState({ ApplicantAddAttachment: true }) }}>Add Attachment</button>
                                </ReactPlaceholder>
                            </div>
                            {/* this.renderAttachmentsTable_old() */}
                            { this.renderAttachmentsTable() }

                        </div>
                    </div>
                </div>
                {this.state.ApplicantAttachment ? <ApplicantAttachmentModal show={this.state.ApplicantAttachment} close={() => this.setState({ ApplicantAttachment: false })} /> : ''}
                {this.state.ApplicantAddAttachment ? <ApplicantAddAttachmentModal show={this.state.ApplicantAddAttachment} close={() => this.setState({ ApplicantAddAttachment: false })} application={this.props.application}/> : ''}
                { this.state.ApplicantEditAttachment && this.renderEditModal() }
            </React.Fragment >
        );
    }
}


const mapStateToProps = (state, ownProps) => {
    const { application } = ownProps
    const { id: application_id } = application || {}

    let applicant_attachment_list = state.RecruitmentApplicantReducer.attachment_list

    // if application ID is given
    // show attachments with matching application ID and those with application_id of 0
    // application id of 0 means it does not belong to any application and it automatically applicant related
    if (!!parseInt(application_id)) {
        applicant_attachment_list = applicant_attachment_list.filter(a => [0, parseInt(application_id)].indexOf(parseInt(a.application_id)) >= 0)
    }
    // if application ID not given, select the ones that has application_id of 0
    else {
        applicant_attachment_list = applicant_attachment_list.filter(a => [0].indexOf(parseInt(a.application_id)) >= 0 || a.applicant_specific === "1")
    }



    return {
        ...state.RecruitmentApplicantReducer.details,
        applicant_attachment_list,
        info_loading: state.RecruitmentApplicantReducer.info_loading,
        applications: state.RecruitmentApplicantReducer.applications,
        application, // selected application based on URL
    }
}


const mapDispatchtoProps = (dispatch) => {
    return {
        getApplicantAttachmentDetails: (applicant_id) => dispatch(getApplicantAttachmentDetails(applicant_id)),
        dispatch,
    }
};

export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantAttachment)