import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, reFreashReactTable, css, toastMessageShow} from 'service/common.js';
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
import QuestionsFormModal from './QuestionsFormModal.jsx';

import '../../../scss/components/admin/item/item.scss';
import { getFormQuestionListData } from '../../actions/RecruitmentAction.js';
/**
 * Class: FormCard
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
        this.fetchFormQuestionData(this.state);
        this.fetchFormQuestionAllData(this.state);
    }

    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchFormQuestionData = (state) => {
        this.setState({ loading: true });
        getFormQuestionListData(
            this.props.application_id,
            this.props.applicant_id,
            this.props.form_applicant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            this.props.form_id
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
     * Call the requestData
     * @param {temp} state 
     */
    fetchFormQuestionAllData = (state) => {
        this.setState({ loading: true });
        getFormQuestionListData(
            this.props.application_id,
            this.props.applicant_id,
            this.props.form_applicant_id,
            9999,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                questionAllList: res.rows,
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
            case '2':
            case '3':
                answer = this.rendorDefaultAnswer(val, main_index);
                break;
            case '4':
                answer = val.answer_text;
                break;
            default:
                break;
        }
        return answer;
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
     * Check the question answer
     */
    checkQuestAnswer = () => {
        var validate_answer = false;
        this.state.questionAllList.map((value, idx) => {
            var quest_is_man = value.is_required;
            var question_type = value.question_type;
            if (quest_is_man === '1') {
                switch (question_type) {
                    case '1':
                    case '2':
                    case '3':
                        if (((Array.isArray(value.answer_id) && value.answer_id.length < 1) || value.answer_id === false) && validate_answer === false) {
                            validate_answer = true;
                        }
                        break;
                    case '4':
                        if(!value.answer_text && validate_answer === false) {
                            validate_answer = true;
                        }
                        break;
                    default:
                        break;
                }
            }
        });

        if (validate_answer == true) {
            return validate_answer;
        }
        return validate_answer;
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
            {
                _label: 'Action',
                accessor: "",
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
                    width="xx-small"
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
        if (this.state.form_count === 0) {
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
                onFetchData={this.fetchFormQuestionData}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card' })}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (this.state.form_count === 0) {
            return <React.Fragment />
        }

        return (            
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/recruitment/application_question/list/${this.props.form_applicant_id}/${this.props.form_id}`} className="reset" style={{ color: '#0070d2' }}>
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
                    this.fetchFormQuestionData(this.state);
                } else {
                    reFreashReactTable(this, 'fetchFormQuestionData');
                }
                this.fetchFormQuestionAllData(this.state);
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
                        <QuestionsFormModal
                            application_id={this.props.application_id}
                            applicant_id={this.props.applicant_id}
                            form_applicant_id={this.props.form_applicant_id}
                            form_id={this.props.form_id}
                            showModal = {this.state.openCreateForm}
                            closeModal = {this.closeModal}
                            headingTxt = "Question"
                            formTitle = {this.props.formTitle}
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
                        headerActions={<Button label="Start" onClick={() => this.setState({ openCreateForm: true }) }/>}
                        heading={Number(this.state.question_count) > 6 ? "Questions (6+)" : "Question ("+this.state.question_count+")"}
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
export default QuestionCard;
