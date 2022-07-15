import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import jQuery from 'jquery';
import classNames from 'classnames'
import {
    IconSettings,
    PageHeaderControl,
    ExpandableSection,
    ButtonGroup,
    Button,
    Icon,
    PageHeader,
    Tabs,
    TabsPanel,
    Card,
    Input,
    Checkbox,
    Dropdown,
} from '@salesforce/design-system-react';
import { connect } from 'react-redux';
import { ROUTER_PATH } from '../../../../../config.js';
import { postData, css, AjaxConfirm, toastMessageShow } from '../../../../../service/common';
import { SLDSPath } from '../../../salesforce/lightning/SLDSPath.jsx';
import QuestionCard from './QuestionCard.jsx';
import { getQuizDetailData } from '../../actions/RecruitmentAction.js';
import QuizStatusPath from './QuizStatusPath.jsx'
import CreateQuizModal from './CreateQuizModal.jsx';
import moment from 'moment';
import ArchiveModal from '../../../oncallui-react-framework/view/Modal/ArchiveModal';
import { Redirect } from 'react-router';

class QuizDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            redirectTo: null,
            quiz: [],
            quiz_id: this.props.props.match.params.id,
            selected_status_id: false,
            selected_status_label: '',
            selected_status: 0,
            status_options: [],
            showStatusPath: false,
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
        this.handleRelatedTab = this.renderRelatedTab.bind(this);
        this.questionListRef = React.createRef();
    }

    /**
     * Call getApplicantQuizById
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
                    showStatusPath: true,
                    showQuizArchiveModal: false
                }, () => {                   
                });
            }

        });
    }

    /**
     * When component is mounted, remove replace the parent element's 
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        this.getApplicantQuizById(this.state.quiz_id);
    }

    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Close the modal when user save the quiz and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({ openCreateQuiz: false });

        if (status) {
            this.getApplicantQuizById(this.state.quiz_id);
        }
    }
    /**
     * Open archive quiz modal
     */
    showQuizArchiveModal(quiz_id) {
        this.setState({ showQuizArchiveModal: true, archive_quiz_id: quiz_id });
    }
    /**
     * Close archive quiz modal
     */
    closeQuizArchiveModal = () => {
        this.setState({ showQuizArchiveModal: false, archive_quiz_id: '' })
        this.getApplicantQuizById(this.state.quiz_id);
    }
    /**
     * Close archive quiz modal
     */
    closeAndRedirectListPage = () => {
        let redirectTo = ROUTER_PATH + `admin/recruitment/application_details/quiz_list/${this.state.quiz.applicant_id}/${this.state.quiz.application}`
        this.setState({ showQuizArchiveModal: false, archive_quiz_id: '', redirectTo: redirectTo });
    }

    actions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <ButtonGroup variant="list" id="button-group-page-header-actions">
                        <Button label="Edit" disabled={this.state.quiz.task_status > 3} onClick={() => this.setState({ openCreateQuiz: true, selectedQuizId: this.state.quiz.id, admin_permission: this.state.admin_permission })} />
                        <Button label="Delete" onClick={() => this.showQuizArchiveModal(this.state.quiz.id)} />
                    </ButtonGroup>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        return (
            <PageHeader
                details={[
                    {
                        label: 'Owner',
                        content: <Link to={ROUTER_PATH + `admin/recruitment/staff_details/${this.state.quiz.owner}`}
                            className="vcenter default-underlined slds-truncate reset"
                            style={{ color: '#0070d2' }}>
                            {this.state.quiz.owner_name}
                        </Link>
                    },
                    {
                        label: 'Related To',
                        content: <Link to={ROUTER_PATH + `admin/recruitment/application_details/${this.state.quiz.applicant_id}/${this.state.quiz.application}`}
                            className="vcenter default-underlined slds-truncate reset"
                            style={{ color: '#0070d2' }}>
                            {this.state.quiz.application}
                        </Link>
                    },
                ]}
                icon={
                    <Icon
                        assistiveText={{ label: 'Quizzes' }}
                        category="utility"
                        name={`puzzle`}
                        style={{
                            fill: '#769ed9',
                        }}
                    />
                }
                label={`Quiz`}
                onRenderActions={this.actions}
                title={this.state.quiz.task_name}
                variant="record-home"
            />
        )
    }

    /**
     * Onchange status selected
     * @param {int} selected_status 
     */
    selectStatus = (selected_status) => {
        this.setState({ selected_status: selected_status })
    }

    /**
     * Render quiz Status
     */
    renderSldsPath = () => {
        return (
            <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                {this.state.showStatusPath && <QuizStatusPath
                    {...this.state}
                    {...this.props}
                    get_applicant_quiz_by_id={this.getApplicantQuizById}
                />}
            </div>
        );
    }

    /**
     * Render related tab
     *
     */
    renderRelatedTab() {
        return (
            <div className="slds-grid slds-grid_vertical">
                <div className="slds-col">
                    <div className="slds-grid slds-grid_vertical slds-related-tab-details">
                        {this.state.showStatusPath && <QuestionCard
                            ref={e => this.questionListRef = e}
                            applicant_id={this.state.quiz.applicant_id}
                            application_id={this.state.quiz.application}
                            quiz_id={this.state.quiz.id}
                            form_id={this.state.quiz.form_id}
                        />}
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Render Left side tab
     */
    renderTab = () => {
        const tab = [
            {
                label: "Related",
                content: this.handleRelatedTab,
            }
        ]
        return (
            <React.Fragment>
                <div className="slds-col">
                    <div className="slds-gutters row">
                        <div className="col-lg-9 col-md-9 slds-m-top_medium">
                            <div className="white_bg_color slds-box">
                                <Tabs>
                                    {
                                        tab.map((tabbar, index) => {
                                            return (
                                                <TabsPanel label={tabbar.label} key={index}>
                                                    {tabbar.content()}
                                                </TabsPanel>
                                            )
                                        })
                                    }
                                </Tabs>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 slds-m-top_medium">
                            <div className="white_bg_color slds-box details_heading">
                                <Tabs>
                                    <TabsPanel label="Details" key="Details">
                                        {this.renderDetailsTab()}
                                    </TabsPanel>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    this.state.openCreateQuiz ? <CreateQuizModal
                        quiz_id={this.state.selectedQuizId}
                        application_id={this.state.quiz.application}
                        applicant_id={111}
                        showModal={this.state.openCreateQuiz}
                        closeModal={this.closeModal}
                        headingTxt="Edit Quiz"
                        {...this.state}
                        {...this.props}
                    /> : ""
                }
            </React.Fragment>
        );
    }

    /**
     * Renders the details tab
     */
    renderDetailsTab() {
        return (
            <div className="container-fluid">
                <form id="create_user" autoComplete="off" className="slds_form  task_tab_des">
                    <div className="row py-1">
                        <div className="col-lg-6 col-sm-6 ">
                            <div className="row align-items-end">
                                <div className="col-lg-12 col-sm-10 ">

                                    <div className="slds-form-element ">
                                        <label className="slds-form-element__label" >
                                            Related To</label>
                                        <div class="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                                            <div className="slds-form-element__control">
                                                {this.state.quiz.application}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-sm-6">
                            <div className="row align-items-end">
                                <div className="col-lg-12 col-sm-10 ">

                                    <div className="slds-form-element ">
                                        <label className="slds-form-element__label" >
                                            Owner</label>
                                        <div class="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                                            <div className="slds-form-element__control">
                                                {this.state.quiz.owner_name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row py-1">
                        <div className="col-lg-6 col-sm-6 ">
                            <div className="row align-items-end">
                                <div className="col-lg-12 col-sm-10 ">

                                    <div className="slds-form-element ">
                                        <label className="slds-form-element__label" >
                                            Form Template</label>
                                        <div class="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                                            <div className="slds-form-element__control">
                                                {this.state.quiz.form_name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-sm-6">

                        </div>

                    </div>
                    <div className="row py-2">
                        <div className="col-lg-6 col-sm-6">

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">Start Date</label>
                                <div className="slds-form-element__control">
                                    {moment(this.state.start_datetime).format('YYYY-MM-DD')}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    Start Time</label>
                                <div className="slds-form-element__control">
                                    {this.state.quiz.quiz_start_time}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row py-2">
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >End Date</label>
                                <div className="slds-form-element__control">
                                    {moment(this.state.end_datetime).format('YYYY-MM-DD')}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >End Time</label>
                                <div className="slds-form-element__control">
                                    {this.state.quiz.quiz_end_time}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-lg-12 col-md-12"><div className="bt-1" style={{ borderColor: "#dddbda" }}></div>
                        </div>
                    </div>

                </form>
            </div>
        )
    }

    render() {
        const styles = css({
            root: {
                fontFamily: 'Salesforce Sans, Arial, Helvetica, sans-serif',
                marginRight: -15,
                fontSize: 13,
            }
        })
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <div className="quizDetails slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    {this.renderPageHeader()}
                    {this.renderSldsPath()}
                    {this.renderTab()}
                    {this.state.showQuizArchiveModal && <ArchiveModal
                        id={this.state.archive_quiz_id}
                        msg={'Quiz'}
                        content={'Are you sure you want to archive this quiz'}
                        confirm_button={'Archive Quiz'}
                        api_url={'recruitment/RecruitmentQuiz/archive_quiz'}
                        close_archive_modal={this.closeQuizArchiveModal}
                        on_success={() => this.closeAndRedirectListPage()}

                    />}
                </IconSettings>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    applicant_details: state.RecruitmentApplicantReducer.details,
    applications: state.RecruitmentApplicantReducer.applications,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
};

export default connect(mapStateToProps, mapDispatchtoProps)(QuizDetail);
