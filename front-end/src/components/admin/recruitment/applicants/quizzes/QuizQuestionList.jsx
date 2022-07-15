import React, { Component } from 'react';
import _ from 'lodash';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { reFreashReactTable, css, postData, toastMessageShow, wordWrap} from 'service/common.js';

import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import jQuery from 'jquery';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
import {
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Icon,
    Button,
    Dropdown,
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../../scss/components/admin/item/item.scss';
import '../../../scss/components/admin/member/member.scss';
import { getQuizDetailData, getQuizQuestionAndAnswerListData } from '../../actions/RecruitmentAction.js';
/**
 * Class: QuizQuestionList
 */
class QuizQuestionList extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'question': true,
            'answer': true,
            'result': true,
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
            showQuestionList: false,
            applicant_id: this.props.props.match.params.applicant_id,
            application_id: this.props.props.match.params.application_id,
            quiz_id: _.get(this.props, 'props.match.params.id')
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * Call getApplicantFormById
     * param {int} id
     */
    getApplicantQuizById = (id) => {
        getQuizDetailData(
            id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    quiz: raData,
                    showQuestionList: true
                },()=>{});
            }
        });
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchQuizQuestionData = (state) => {
        this.setState({ loading: true });
        getQuizQuestionAndAnswerListData(
            this.state.quiz.application,
            this.state.quiz.applicant_id,
            this.state.quiz.id,
            this.state.quiz.form_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
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
        this.setState({ openCreateForm: false });

        if (status) {
            reFreashReactTable(this, 'fetchQuizQuestionData');
        }
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentWillMount() {
        this.getApplicantQuizById(this.state.quiz_id);
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
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
     * valuate the applicant ans
     */
    updateResultForApplicantAnswer = (answer_data, result) => {
        let req = {
            answer_val: result,
            applicantId: this.state.quiz.applicant_id,
            form_applicant_id: answer_data.form_applicant_id,
            questionId: answer_data.question_id,
            taskId: answer_data.answer_id,

        }
        postData('recruitment/RecruitmentQuiz/update_answer', req).then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchQuizQuestionData');
            } else {
                toastMessageShow('something went wrong', "e");
            }

        });
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
                    {this.renderSearchForm()}
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderColumnSelector({ columns })}
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderStatusFilters()}
                </PageHeaderControl>
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
                return tooltip === true ? val.applicant_answer : wordWrap(val.applicant_answer, 45);
                break;
            default:
                return this.rendorDefaultAnswer(val, main_index);
                break;
        }
    }

    /**
     * Define Anser type
     * @param {obj} val
     * @param {int} main_index
     */
    resultRender = (val, main_index) => {
        return this.rendorDefaultResult(val, main_index);
    }

    rendorDefaultAnswer = (question, main_index) => {
        if (question && question.applicant_answer_val != '') {
            return <>{question.applicant_answer_val}</>;
        } else {
            return <></>;
        }
    }

    rendorDefaultResult = (question, main_index) => {
        if (question && question.is_correct == 0) {
            return <>Incorrect</>;
        } else if (question && question.is_correct == 1) {
            return <>Correct</>;
        } else {
            return <></>;
        }
    }

    renderActionDropDown(val) {
        // 4-submitted 5-expired
        if(parseInt(this.state.quiz.task_status) < 5){
            if (parseInt(val.question_type != 4) && parseInt(this.state.quiz.task_status) > 4) {
                return val.form_applicant_id ? true : false;
            } else {
                if (parseInt(val.question_type == 4 && val.form_applicant_id)) {
                    return false;
                }
                return true;
            }
        }else{
            return true;
        }

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
                className: "slds-tbl-card-td-link-hidden",
                sortable: false,
                width: 300,
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
                Cell: props => <div className="slds-para-truncate" title={this.answerRender(props.original, props.index, true)}>{this.answerRender(props.original, props.index)}</div>,
            },
            {
                _label: 'Result',
                accessor: "result",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{this.resultRender(props.original, props.index)}</span>,
            },
            {
                _label: '',
                accessor: "action",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props =>
                    <Dropdown
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        iconVariant="border-filled"
                        disabled={
                           
                            this.renderActionDropDown(props.original)
                        }
                        onSelect={(e) => {
                            this.updateResultForApplicantAnswer(props.original, e.value);
                        }}
                        width="xx-small"
                        className={'slds-more-action-dropdown'}
                        options={[
                            { label: 'Correct', value: '1' },
                            { label: 'Incorrect', value: '0' },
                        ]}
                    />,
            },
        ]
    }

    /**
     * Render the display content
     */
    render() {
        // This will only run when user create quiz assessment
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
        var quiz_id = _.get(this.props, 'props.match.params.id');
        const trail = [
            <Link to={ROUTER_PATH + `admin/recruitment/application_details/${this.state.quiz ? this.state.quiz.applicant_id : '' }/${this.state.quiz ? this.state.quiz.application : ''}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.quiz ? this.state.quiz.application : ''}
            </Link>,
            <Link to={ROUTER_PATH + `admin/recruitment/application_quiz/detail/${quiz_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.quiz ?this.state.quiz.task_name : ''}
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
                                        label: 'Quizzes',
                                    }}
                                    category="standard"
                                    name="related_list"
                                    style={{
                                        backgroundColor: '#5cbcab',
                                        fill: '#ffffff',
                                    }}
                                    title="Quizzes"
                                />
                            }
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title="Questions"
                            trail={trail}
                            label={<span />}
                            truncate
                            variant="related-list"
                        />
                        {this.state.showQuestionList && 
                            <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={this.fetchQuizQuestionData}
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
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card slds-tbl-scroll tablescroll' })}
                        />
                        }
                    </IconSettings>
                </div>
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

export default connect(mapStateToProps, mapDispatchtoProps)(QuizQuestionList);
