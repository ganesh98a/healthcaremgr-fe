import React, { Component } from 'react';
import moment from 'moment';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, reFreashReactTable, css } from 'service/common.js';
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
import CreateQuizModel from './CreateQuizModal.jsx';

import '../../../scss/components/admin/item/item.scss';
import { getQuizListData } from '../../actions/RecruitmentAction.js';
import ArchiveModal  from '../../../oncallui-react-framework/view/Modal/ArchiveModal';
/**
 * Class: QuizCard
 */
class QuizCard extends Component {

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            openCreateQuiz: false,
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
        getQuizListData(
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
                loading: false,
                showQuizArchiveModal: false
            });
        });
    }

    /**
     * Open archive quiz modal
     */
    showQuizArchiveModal(quiz_id) {
        console.log(quiz_id);
        this.setState({showQuizArchiveModal :  true, archive_quiz_id : quiz_id});
    }
    /**
     * Close archive quiz modal
     */
    closeQuizArchiveModal= () =>{
        this.setState({showQuizArchiveModal :  false, archive_quiz_id : ''})
        reFreashReactTable(this, 'fetchFormData');
    }
    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Title',
                accessor: "task_name",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                        return <Link to={ROUTER_PATH + `admin/recruitment/application_quiz/detail/${props.original.id}`} className="reset" style={{ color: '#0070d2' }}>
                            {defaultSpaceInTable(props.value)}
                        </Link>
                }
            },
            {
                _label: 'Start Date',
                accessor: "start_datetime",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>,
            },
            {
                _label: 'End Date',
                accessor: "end_datetime",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>,
            },
            {
                _label: 'Status',
                accessor: "status",
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
                    disabled={Number(this.props.flagged_status) == 2 || false}
                    onSelect={() => {
                        this.showQuizArchiveModal(props.original.id)
                    }}
                    className={'slds-more-action-dropdown'}
                    options={[
                        { label: 'Delete', value: '1' },
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
                <Link to={ROUTER_PATH + `admin/recruitment/application_details/quiz_list/${this.props.applicant_id}/${this.props.application_id}`} className="reset" style={{ color: '#0070d2' }}>
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
        this.setState({openCreateQuiz: false});

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
                    this.state.openCreateQuiz && (
                        <CreateQuizModel
                            application_id={this.props.application_id}
                            applicant_id={this.props.applicant_id}
                            showModal = {this.state.openCreateQuiz}
                            closeModal = {this.closeModal}
                            headingTxt = "New Quiz"
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
                        headerActions={<Button label="New" disabled={Number(this.props.flagged_status) === 2 || false} onClick={() => this.setState({ openCreateQuiz: true }) }/>}
                        heading={Number(this.state.form_count) > 6 ? "Quizzes (6+)" : "Quiz ("+this.state.form_count+")"}
                        className="slds-card-bor"
                        icon={<Icon category="utility" name="puzzle" size="small" style={{ fill: '#769ed9' }}/>}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                    {this.renderModals()}
                    {this.state.showQuizArchiveModal && <ArchiveModal
                                id = {this.state.archive_quiz_id}
                                msg={'Quiz'}
                                content ={'Are you sure you want to archive this quiz'}
                                confirm_button={'Archive Quiz'}
                                api_url = {'recruitment/RecruitmentQuiz/archive_quiz'}
                                close_archive_modal = {this.closeQuizArchiveModal}
                                on_success={()=> this.closeQuizArchiveModal()}

                /> }
                </IconSettings>
            </React.Fragment>
        );
    }
}


// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
export default QuizCard;
