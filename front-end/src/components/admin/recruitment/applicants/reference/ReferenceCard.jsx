import React, { Component } from 'react';
import { postData, toastMessageShow, AjaxConfirm } from 'service/common.js';
import {
    Card,
    Dropdown,
    Icon,
    IconSettings,
    Tooltip
} from '@salesforce/design-system-react';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import ReferenceModal from './ReferenceModal.jsx';
import TilesCard from './TilesCard';
import { connect } from 'react-redux'
import { getApplicantInfoByJobId } from '../../actions/RecruitmentApplicantAction';

/**
 * RequestData get the list of reference
 * @param {int} pageSize
 * @param {int} page
 * @param {int} sorted
 * @param {int} filtered
 */
const requestData = (applicant_id, application_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { applicant_id: applicant_id, application_id: application_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentReferenceData/get_referece_list_by_id', Request).then((result) => {
            if (result.status) {
                let filteredData = result.rows;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    record_count: result.record_count,
                    is_reference_marked: result.is_reference_marked,
                    app_pros_hired_status: result.app_pros_hired_status
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    record_count: 0,
                    is_reference_marked: false,
                    app_pros_hired_status: false
                };
                resolve(res);
            }

        });

    });
};


/**
 * Class: ReferenceCard
 */
class ReferenceCard extends Component {
    constructor(props) {
        super(props);
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            record_count: 0,
            recordList: [],
            recordSize: 3,
            pageSize: 3,
            page: 0,
            sorted: '',
            filtered: '',
            applicant_id: this.props.applicant_id,
            application_id: this.props.aaplication_id,
            referenceModalOpen: false,
            modalHeading: 'Create',
            app_pros_hired_status: false,
        }
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        this.fetchCardData(this.state);
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchCardData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            this.props.applicant_id,
            this.props.application_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                recordList: res.rows,
                record_count: res.record_count,
                pages: res.pages,
                loading: false,
                is_reference_marked: res.is_reference_marked,
                app_pros_hired_status: res.app_pros_hired_status
            });
        });
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (this.state.record_count === 0) {
            return <React.Fragment />
        }
        var applicant_id = this.props.applicant_id;
        var application_id = this.props.application_id;
        return (
            <div className={'slds-align_absolute-center pt-3 bor-top-1'}>
                <Link to={ROUTER_PATH + `admin/recruitment/application_details/reference/${applicant_id}/${application_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>
        );
    }

    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({referenceModalOpen: false});

        if(status){
            this.fetchCardData(this.state);
        }
    }

    /**
     * Render modals
     * - Create Reference
     * - Edit Reference
     *
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.referenceModalOpen && (
                        <ReferenceModal
                            showModal = {this.state.referenceModalOpen}
                            closeModal = {this.closeModal}
                            applicant_id = {this.props.applicant_id}
                            application_id = {this.props.application_id}
                            headingTxt = {this.state.modalHeading}
                            reference_id={this.state.reference_id}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Reference more option
     * @param {obj} e
     * @param {int} id
     */
    referenceOption = (e, id) => {
        var value = Number(e.value);
        switch(value) {
            case 1:
                this.setState({ reference_id: id, referenceModalOpen: true, modalHeading: 'Update' });
                break;
            case 2:
                // archive
                this.handleOnArchive(id);
                break;
            case 3:
                // update status
                this.handleOnUpdateStatus(id, 'Approved');
                break;
            case 4:
                // update status
                this.handleOnUpdateStatus(id, 'Rejected');
                break;
            default:
                break;
        }
    }

    /**
     * Update status
     * @param {int} id
     */
     handleOnUpdateStatus = (id, status) => {
        var req = {
            reference_id: id,
            status: status === 'Approved' ? 1 : 2
        }
        postData('recruitment/RecruitmentReferenceData/update_reference_status', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                toastMessageShow(result.msg, 's');
                this.fetchCardData(this.state);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    /**
     * when archive is requested by the user for selected document
     */
    handleOnArchive = (id) => {
        const msg = `Are you sure you want to archive this reference?`
        const confirmButton = `Archive Reference`
        AjaxConfirm({ reference_id: id }, msg, `recruitment/RecruitmentReferenceData/archive_reference`, { confirm: confirmButton, heading_title: `Archive Reference` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.fetchCardData(this.state);
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * when archive is requested by the user for selected document
     */
     handleOnMarkReference = (status) => {
        var msg = `Are you sure you want to references as verified ? Verification can be undone until the application is marked as 'Hired' (or) 'Unsuccessful'`
        if (status === 0) {
            msg = `Are you sure you want to undo the references verified ?`
        }
        /* if (this.state.record_count < 1) {
            toastMessageShow('The reference card can be marked as verified only when it have min of 1 reference', "e");
            return;
        } */
        const confirmButton = `Mark as verified`;
        AjaxConfirm({ applicant_id: this.props.applicant_id, application_id: this.props.application_id, mark_as: status }, msg, `recruitment/RecruitmentReferenceData/mark_reference_status`, { confirm: confirmButton, heading_title: `Verify Reference Checklist` }).then(result => {
            if (result.status) {
                this.props.getApplicantInfoByJobId(this.props.applicant_id, false, this.props.application_id);
                toastMessageShow(result.msg, "s");
                this.fetchCardData(this.state);
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Undo Verified
     * @param {int} id
     */
     handleOnUndoVerified = (status) => {
        var req = { applicant_id: this.props.applicant_id, application_id: this.props.application_id, mark_as: status }
        postData('recruitment/RecruitmentReferenceData/mark_reference_status', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                this.props.getApplicantInfoByJobId(this.props.applicant_id, false, this.props.application_id);
                toastMessageShow(result.msg, 's');
                this.fetchCardData(this.state);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Render card tile
     */
    renderCards = () => {
        if (this.state.record_count > 0 ) {
            return (
                <div className="slds-card__body_inner mb-4">
                    <ul class="slds-grid slds-wrap slds-grid_pull-padded">
                        {
                            this.state.recordList.map((val, index) => {
                                let disabledStatus = Number(val.status);
                                return (
                                    <li class="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3">
                                        <TilesCard
                                            referenceOption={this.referenceOption}
                                            id={val.id}
                                            disabled={(Number(this.props.application_process_status) === 7 || Number(this.props.application_process_status) === 8) ? true : false || (Number(this.props.application_process_status) === 7 || Number(this.props.application_process_status) === 8) ? true : false || Number(this.props.flagged_status) === 2 ? true : false}
                                            url={''}
                                            title={val.name}
                                            title_details={[
                                                { label: "Phone", value: val.phone ? ("+61 " + val.phone) : 'N/A' },
                                                { label: "Email", value: val.email },
                                                { label: "Status", value: val.status_value },
                                                { label: "Updated On", value: val.updated },
                                            ]}
                                            icon={{ category: "action", name: "new_contact", size: "xx-small" }}
                                        />
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            );
        } else {
            return (<React.Fragment />);
        }
    }

    /**
     * Show modal
     */
    showModal = (value) => {
        switch(value) {
            case 1:
                if (this.state.record_count > 3) {
                    toastMessageShow('Only 4 references can be added at max', "e");
                } else {
                    this.setState({ referenceModalOpen: true, modalHeading: 'Create', reference_id: '' })
                }
                break;
            case 2:
                this.handleOnMarkReference(1);
                break;
            case 3:
                this.handleOnUndoVerified(0);
                break;
            default:
                break;
        }

    }

    render() {
        var dropdown_option = [
            { label: 'New', value: 1 },
            { label: 'Mark reference as verified', value: 2 },
        ];
        if (this.state.is_reference_marked === true) {
            dropdown_option = [
                { label: 'New', value: 1 },
                { label: 'Undo Verification', value: 3 },
            ];
        }
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Card
                    headerActions={
                        <div>
                            {
                                this.state.is_reference_marked && <div className="col-sm-6">
                                    <Tooltip
                                        id="tooltip"
                                        align="top"
                                        content="Reference Verified"
                                    >
                                        <Icon
                                            category="action"
                                            name="check"
                                            size="xx-small"
                                            colorVariant="base"
                                            containerStyle={{
                                                backgroundColor: '#9fdb66',
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            }
                            <div className="col-sm-6">
                                <Dropdown
                                    id='reference_dropdown'
                                    assistiveText={{ icon: 'More Options' }}
                                    iconCategory="utility"
                                    iconName="down"
                                    align="right"
                                    iconSize="x-medium"
                                    iconVariant="border-filled"
                                    disabled={(Number(this.props.application_process_status) === 7 || Number(this.props.application_process_status) === 8) ? true : false || Number(this.props.flagged_status) === 2 ? true : false}
                                    onSelect={(e) => {
                                    //call the cab certificate / tranfer application
                                        this.showModal(e.value);
                                    }}
                                    width="xx-small"
                                    options={dropdown_option}
                                />
                            </div>
                        </div>
                    }
                    heading={Number(this.state.record_count) > 6 ? "Reference (6+)" : "References ("+this.state.record_count+")"}
                    className="slds-card-bor"
                    icon={<Icon category="action" name="new_contact" size="x-small" />}
                >
                    {this.renderCards()}
                    {this.renderViewAll()}
                </Card>
                {this.renderModals()}
            </IconSettings>
        );
    }
}

const mapStateToProps = state => ({
    application_process_status: state.RecruitmentApplicantReducer.applications.application_process_status
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantInfoByJobId: (applicant_id, loading, application_id) => dispach(getApplicantInfoByJobId(applicant_id, loading, application_id)),
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(ReferenceCard);