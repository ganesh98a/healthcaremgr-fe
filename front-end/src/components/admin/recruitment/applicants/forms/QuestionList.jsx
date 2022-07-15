import React, { Component } from 'react';
import _ from 'lodash';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { reFreashReactTable, css, wordWrap, postData, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH, COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from 'config.js';
import PropTypes from 'prop-types';
import jQuery from 'jquery';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
import {
    IconSettings,
    PageHeader,
    PageHeaderControl,ButtonGroup,
    Icon,
    Button,
    Dropdown,
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import QuestionsFormModal from './QuestionsFormModal.jsx';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../../scss/components/admin/item/item.scss';
import '../../../scss/components/admin/member/member.scss';
import { getFormQuestionListData, getFormDetailData } from '../../actions/RecruitmentAction.js';

/**
 * Class: QuestionList
 */
class QuestionList extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'question': true,
            'answer': true,
            'action': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            form: [],
            searchVal: '',
            filterVal: '',
            questionList: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateForm: false,
            applicant_id:this.props.props.match.params.id,
            application_id: this.props.props.match.params.application_id,
            form_applicant_id: _.get(this.props, 'props.match.params.id'),
            form_id: _.get(this.props, 'props.match.params.form_id')
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * Call getApplicantFormById
     * param {int} id
     */
    getApplicantFormById = (id) => {
        getFormDetailData(
            id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    form: raData
                });
            }
        });
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchFormQuestionData = (state) => {
        var form_applicant_id = _.get(this.props, 'props.match.params.id');
        let form_id = _.get(this.props, 'props.match.params.form_id');

        this.setState({ loading: true });
        getFormQuestionListData(
            '',
            '',
            form_applicant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            form_id
        ).then(res => {
            this.setState({
                questionList: res.rows,
                question_count: res.count,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * Get the list based on filter value
     * @param {str} key
     * @param {str} value
     */
    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    /**
     * Get the list based on Search value
     * @param {object} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * Set the data for fetching the list
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re });
    }

    /**
     * Open create form modal
     */
    showModal = () => {
        this.setState({ openCreateForm: true });
    }

    /**
     * Close the modal when user save the form and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({openCreateForm: false});

        if(status){
            reFreashReactTable(this, 'fetchFormQuestionData');
        }
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        var form_applicant_id = _.get(this.props, 'props.match.params.id');
        this.getApplicantFormById(form_applicant_id);
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewForm = e => {
            e.preventDefault()
            this.showModal();
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
					<ButtonGroup variant="list" id="button-group-page-header-actions">
						<Button label="Download Form" id="download_form" title={`Download Form`} onClick={() => this.downloadForm()}/>
					</ButtonGroup>
                    <Link to={ROUTER_PATH + `admin/recruitment/applicant_details/question/start`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewForm} id="form-type-new-btn">
                        Start
                    </Link>
                </PageHeaderControl>
            </React.Fragment>
        )
    }
	
	downloadForm = () => {
        let form_applicant_id = _.get(this.props, 'props.match.params.id');
        let form_id = _.get(this.props, 'props.match.params.form_id');
        this.setState({loading: true});
        postData('recruitment/RecruitmentForm/get_questions_list_in_pdf', { 
            data: this.state.form, 
            form_applicant_id: form_applicant_id, 
            form_id: form_id
            }).then((result) => {
            
			if (result.status) {
                toastMessageShow(result.msg, "s");
                window.open(COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod9 + '/?url=' + result.preview_url, "_blank");
            } else {
                toastMessageShow(result.error, "e");
            }
			
            this.setState({ loading: false })
        });
	}

    /**
     * Render search input form
     */
    renderSearchForm() {
        return (
            <form
                autoComplete="off"
                onSubmit={(e) => this.submitSearch(e)}
                method="post"
                className="slds-col_padded"
                style={{ display: 'block' }}
            >
                <Input
                    iconLeft={
                        <InputIcon
                            assistiveText={{
                                icon: 'Search',
                            }}
                            name="search"
                            category="utility"
                        />
                    }
                    onChange={(e) => this.setState({ search: e.target.value })}
                    id="form-search-1"
                    placeholder="Search Question"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        let formStatusFilter = [
            { value: 'all', label: 'All' },
        ];
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={formStatusFilter}
                onSelect={value => this.filterChange('filter_status', value.value)}
                length={null}
            >
                <DropdownTrigger title={`Filter by status`}>
                    <Button
                        assistiveText={{ icon: 'Filter' }}
                        iconCategory="utility"
                        iconName="filterList"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * Handle the selected columns visible or not
     */
    handleOnSelectColumnSelectorItem = option => {
        const value = option.value

        let cols = [...this.state.displayed_columns]
        if (cols.indexOf(value) >= 0) {
            cols = cols.filter(col => col !== value)
        } else {
            cols = [...this.state.displayed_columns, value]
        }

        this.setState({ displayed_columns: cols })
    }

    /**
     * Render table column dropdown
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {

        const mapColumnsToOptions = columns.map(col => ({
            value: 'id' in col ? col.id : col.accessor,
            label: col._label,
        }))

        return (
            <Dropdown
                align="right"
                checkmark
                multiple
                assistiveText={{ icon: 'More' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={mapColumnsToOptions}
                value={this.state.default_displayed_columns}
                onSelect={this.handleOnSelectColumnSelectorItem}
            >
                <DropdownTrigger>
                    <Button
                        title={`Show/hide columns`}
                        assistiveText={{ icon: 'Show/hide columns' }}
                        iconCategory="utility"
                        iconName="table"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * Render page header
     * @param {object} param
     * @param {import('react-table').Column[]} [param.columns]
     */
    handleOnRenderControls = ({ columns = [] }) => () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    { this.renderSearchForm() }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderColumnSelector({ columns }) }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderStatusFilters() }
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Render modals
     * - Create Form
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateForm && (
                        <QuestionsFormModal
                            application_id={this.state.form.application_id}
                            applicant_id={this.state.form.applicant_id}
                            form_applicant_id={this.state.form_applicant_id}
                            showModal = {this.state.openCreateForm}
                            closeModal = {this.closeModal}
                            headingTxt = "Question"
                            page={'Viewall'}
                            formTitle={this.state.form.title}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Define Anser type
     * @param {obj} val
     * @param {int} main_index
     */
    answerRender = (val, main_index, tooltip = false) => {
        switch (val.question_type) {
            case '4':
                return tooltip === true ? val.answer_text : wordWrap(val.answer_text, 55);
                break;
            default:
                return this.rendorDefaultAnswer(val, main_index);
                break;
        }
    }

    rendorDefaultAnswer = (question, main_index) => {
        var ans = '';
        if (question &&  question.answers) {
            question.answers.map((val, idxx) => {
                if (Array.isArray(question.answer_id)) {
                    var ind = question.answer_id.indexOf(val.answer_id);

                    var is_answer_true = false;
                    if (ind >= 0) {
                        is_answer_true = true;
                        if (ans != '') {
                            ans = ans + ', ' +val.value;
                        } else {
                            ans = val.value;
                        }
                    }
                }
            })
            return <>{ans}</>;
        }
        return <></>;
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Question',
                accessor: "question",
                width: 300,
                className: "slds-tbl-card-td-link-hidden",
                sortable: false,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Answer',
                accessor: "answer",
                sortable: false,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <div className="slds-para-truncate" title={this.answerRender(props.original, props.index, true)}>
                    {this.answerRender(props.original, props.index)}</div>,
            },
            {
                _label: '',
                accessor: "action",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: () =>
                <Dropdown
                    assistiveText={{ icon: 'More Options' }}
                    iconCategory="utility"
                    iconName="down"
                    iconVariant="border-filled"
                    disabled={true}
                    onSelect={() => {
                        // todo
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
     * Render the display content
     */
    render() {
        // This will only run when user create form assessment
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        var form_applicant_id = _.get(this.props, 'props.match.params.id');
        var form_id = _.get(this.props, 'props.match.params.form_id');
        const trail = [
            <Link to={ROUTER_PATH + `admin/recruitment/application_details/${this.state.form.applicant_id}/${this.state.form.application_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.form.application}
            </Link>,
                <Link to={ROUTER_PATH + `admin/recruitment/application_form/detail/${form_applicant_id}/${form_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.form.title}
            </Link>
        ];

        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            icon={
                                <Icon
                                    assistiveText={{
                                        label: 'Forms',
                                    }}
                                    category="standard"
                                    name="related_list"
                                    style={{
                                        backgroundColor: '#5cbcab',
                                        fill: '#ffffff',
                                    }}
                                    title="Forms"
                                />
                            }
                            onRenderActions={this.handleOnRenderActions}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title="Questions"
                            trail={trail}
                            label={<span />}
                            truncate
                            variant="related-list"
                        />
                            <SLDSReactTable
                                PaginationComponent={() => false}
                                ref={this.reactTable}
                                manual="true"
                                loading={this.state.loading}
                                pages={this.state.pages}
                                onFetchData={this.fetchFormQuestionData}
                                filtered={this.state.filtered}
                                defaultFiltered={{ filter_status: 'all' }}
                                columns={displayedColumns}
                                data={this.state.questionList}
                                defaultPageSize={9999}
                                minRows={1}
                                onPageSizeChange={this.onPageSizeChange}
                                noDataText="No Record Found"
                                collapseOnDataChange={true}
                                resizable={true}    
                                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card slds-tbl-scroll tablescroll' }) }                                 
                            />
                        </IconSettings>
                </div>
                {this.renderModals()}
            </React.Fragment>
        )


    }


}
// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
// Get the page title and type from reducer
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = () => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(QuestionList);
