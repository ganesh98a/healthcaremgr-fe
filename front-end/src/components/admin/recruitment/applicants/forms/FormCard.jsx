import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, reFreashReactTable, css, toastMessageShow, AjaxConfirm } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import {
    Card,
    Button,
    Dropdown,
    Icon,
    IconSettings,
} from '@salesforce/design-system-react';
import CreateFormModel from './CreateFormModal.jsx';
import moment from 'moment';
import '../../../scss/components/admin/item/item.scss';
import { getFormListData } from '../../actions/RecruitmentAction.js';
/**
 * Class: FormCard
 */
class FormCard extends Component {

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            openCreateForm: false,
            openEditForm: false,
            searchVal: '',
            filterVal: '',
            formsList: [],
            pageSize: 6,
            page: 0,
            validStatus: 1,
            form_count: 0,
            filtered: '',
            sorted: '',
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        this.fetchFormData(this.state);
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchFormData = (state) => {
        this.setState({ loading: true });
        getFormListData(
            this.props.application_id,
            this.props.applicant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                formList: res.rows,
                form_count: res.count,
                pages: res.pages,
                loading: false
            });
        });
    }

     /**
     * when archive is requested by the user for selected document
     */
      handleOnArchiveForm = (id) => {
        const msg = `Are you sure you want to delete the form?`
        const confirmButton = `Archive Form`
        AjaxConfirm({ form_id: id }, msg, `recruitment/RecruitmentForm/archive_form_applicant`, { confirm: confirmButton, heading_title: `Archive Form` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, 'fetchFormData');
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Title',
                accessor: "title",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                        return <Link to={ROUTER_PATH + `admin/recruitment/application_form/detail/${props.original.id}/${props.original.form_id}`} className="reset" style={{ color: '#0070d2' }}>
                            {defaultSpaceInTable(props.value)}
                        </Link>
                }
            },
            {
                _label: 'Status',
                accessor: "status",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Start Date',
                accessor: "start_datetime",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    return (
                        <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>
                    )

                }
            },
            {
                _label: 'Created By',
                accessor: "created_by",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Action',
                accessor: "",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: (props) =>
                    <Dropdown
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        iconVariant="border-filled"
                        disabled={Number(this.props.flagged_status) === 2 || Number(props.value.is_sys_generater) === 1 ? true : false}
                        onSelect={(e) => {
                            if (e.value == 1) { //edit
                                this.setState({ openCreateForm: true, form_id: props.value.id });
                            }
                            else { // delete
                                this.handleOnArchiveForm(props.value.id)
                            }
                        }}
                        className={'slds-more-action-dropdown'}
                        options={[
                            { label: 'Edit', value: '1' },
                            { label: 'Delete', value: '2' },
                        ]}
                    />,
            },
        ]
    }

    /**
     * Render form table if count greater than 0
     */
    renderTable() {
        if (Number(this.state.form_count) === 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => <React.Fragment />}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                data={this.state.formList}
                defaultPageSize={6}
                minRows={1}
                sortable={false}
                resizable={true}
                onFetchData={this.fetchFormData}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card tablescroll' })}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (Number(this.state.form_count) === 0) {
            return <React.Fragment />
        }

        return (
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/recruitment/application_details/form_list/${this.props.applicant_id}/${this.props.application_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>
        );
    }

    /**
     * Close the modal when user save the form and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, formId) => {
        this.setState({openCreateForm: false, form_id: ''});

        if(status){
            if (formId) {
                // to do...
            } else {
                if (Number(this.state.form_count) === 0) {
                    this.fetchFormData(this.state);
                } else {
                    reFreashReactTable(this, 'fetchFormData');
                }

            }
        }
    }

    /**
     * Render modals
     * - Create Form
     *
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateForm && (
                        <CreateFormModel
                            application_id={this.props.application_id}
                            applicant_id={this.props.applicant_id}
                            showModal = {this.state.openCreateForm}
                            closeModal = {this.closeModal}
                            headingTxt = "New Form"
                            form_id={this.state.form_id}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        headerActions={<Button label="New" disabled={Number(this.props.flagged_status) === 2 || false} onClick={() => this.setState({ openCreateForm: true }) }/>}
                        heading={Number(this.state.form_count) > 6 ? "Forms (6+)" : "Form ("+this.state.form_count+")"}
                        className="slds-card-bor"
                        icon={<Icon category="standard" name="file" size="small" />}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                    {this.renderModals()}
                </IconSettings>
            </React.Fragment>
        );
    }
}


// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
export default FormCard;
