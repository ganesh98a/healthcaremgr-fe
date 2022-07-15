import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, reFreashReactTable} from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import {Card, Icon, IconSettings} from '@salesforce/design-system-react';

import '../../../scss/components/admin/item/item.scss';
import { getQuizQuestionAndAnswerListData } from '../../actions/RecruitmentAction.js';
/**
 * Class: QuestionCard
 */
class QuestionCard extends Component {

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            openCreateForm: false,
            searchVal: '',
            filterVal: '',
            questionList: [],
            questionAllList: [],
            pageSize: 6,
            page: 0,
            validStatus: 1,
            question_count: 0,
            filtered: '',
            sorted: '',
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }

    callfetchFormQuestionData = () => {
        this.fetchQuizQuestionData(this.state);
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchQuizQuestionData = (state) => {
        this.setState({ loading: true });
        getQuizQuestionAndAnswerListData(
            this.props.application_id,
            this.props.applicant_id,
            this.props.quiz_id,
            this.props.form_id,
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
     * Define Anser type
     * @param {obj} val
     * @param {int} main_index
     */
    answerRender = (val, main_index) => {
        var answer = ''
        switch (val.question_type) {
            case '1':
                answer = this.rendorDefaultAnswer(val, main_index);
                break;
            case '2':
                answer = this.rendorDefaultAnswer(val, main_index);
                break;
            case '3':
                answer = this.rendorDefaultAnswer(val, main_index);
                break;
            case '4':
                answer = val.applicant_answer;
                break;
            default:
                break;
        }
        return answer;
    }

    rendorDefaultAnswer = (question, main_index) => {
        if (question && question.applicant_answer_val != '') {
            return <>{question.applicant_answer_val}</>;
        } else {
            return <></>;
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
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Answer',
                accessor: "answer",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{this.answerRender(props.original, props.index)}</span>,
            },
        ]
    }

    /**
     * Render quiz table if count greater than 0
     */
    renderTable() {
        if (this.state.total_count === 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => <React.Fragment />}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                data={this.state.questionList}
                defaultPageSize={6}
                minRows={1}
                sortable={false}
                resizable={true}
                onFetchData={this.fetchQuizQuestionData}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card' })}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (this.state.total_count === 0) {
            return <React.Fragment />
        }

        return (
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/recruitment/application_question/quiz/list/${this.props.quiz_id}`} className="reset" style={{ color: '#0070d2' }}>
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
        this.setState({openCreateForm: false});

        if(status){
            if (formId) {
                // to do...
            } else {
                if (this.state.question_count === 0) {
                    this.fetchQuizQuestionData(this.state);
                } else {
                    reFreashReactTable(this, 'fetchQuizQuestionData');
                }
            }
        }
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        // headerActions={<Button label="Start" onClick={() => this.setState({ openCreateForm: true }) }/>}
                        heading={Number(this.state.question_count) > 6 ? "Questions (6+)" : "Question ("+this.state.question_count+")"}
                        className="slds-card-bor"
                        icon={<Icon category="standard" name="file" size="small" />}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                </IconSettings>
            </React.Fragment>
        );
    }
}


// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
export default QuestionCard;
