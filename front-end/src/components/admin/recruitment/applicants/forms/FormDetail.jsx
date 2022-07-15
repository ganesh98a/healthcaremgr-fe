import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import jQuery from 'jquery';
import classNames from 'classnames'
import {
    IconSettings,
    Icon,
    PageHeader,
    Tabs,
    TabsPanel,
	Button, ButtonGroup,PageHeaderControl,
} from '@salesforce/design-system-react';
import { connect } from 'react-redux';
import { ROUTER_PATH, COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from '../../../../../config.js';
import { postData, css, toastMessageShow } from '../../../../../service/common';
import { SLDSPath } from '../../../salesforce/lightning/SLDSPath.jsx';
import QuestionCard from './QuestionCard.jsx';
import { getFormDetailData } from '../../actions/RecruitmentAction.js';
import moment from 'moment';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import Feed from '../../../salesforce/lightning/SalesFeed.jsx';
class FormDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            redirectTo: null,
            form: [],
            form_id: this.props.props.match.params.id,
            selected_status_id: false,
            selected_status_label: '',
            selected_status: 0,
            status_options: [],
            fieldHistory: [],
            form_fk_id: this.props.props.match.params.form_id,
            downloadDisabled: false,
        }
        
        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
        this.handleRelatedTab = this.renderRelatedTab.bind(this);
        this.handleFeedTab = this.renderFeedTab.bind(this);
        this.questionListRef = React.createRef();
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
     * When component is mounted, remove replace the parent element's 
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        this.getApplicantFormById(this.state.form_id);
        this.getFieldHistoryItems();
    }

    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    getFieldHistoryItems() {
        postData('recruitment/RecruitmentForm/get_field_history', { form_id: this.state.form_id }).then(resp => {
            let items = resp.data;
            this.setState({ fieldHistory: items }, () => {
                // call history component func
                this.history.updateItemsList();
            });
        });
    }
    
    /**
     * Update form status
     */
    updateStatus = () => {
        if (!this.state.selected_status) {
            toastMessageShow("Please select status", "e");
            return false;
        }

        // check question list with answer
        var validate_answer = this.questionListRef.checkQuestAnswer();
        if (validate_answer === true && Number(this.state.selected_status) !== 1) {
            toastMessageShow('Please answer all the mandatory questions', "e");
            return false;
        }
        var req = { form_id: this.state.form_id, status: this.state.selected_status }
        postData('recruitment/RecruitmentForm/update_form_status', req).then((result) => {
            if (result.status) {
                this.getApplicantFormById(this.state.form_id);
                this.setState({ selected_status: 0 });
                this.getFieldHistoryItems();
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        var start_datetime = '';
        if (this.state.form.start_datetime != '' && this.state.form.start_datetime !== '0000-00-00 00:00:00') {
            start_datetime = this.state.form.start_datetime;
        }

        const dateMoment = moment(start_datetime);
        if (dateMoment.isValid() && start_datetime !== '' && start_datetime !== '0000-00-00 00:00:00') {
            start_datetime = <span className="slds-truncate">{defaultSpaceInTable((moment(this.state.form.start_datetime).format("DD/MM/YYYY HH:mm")))}</span>
        }
        
        return (

            <PageHeader
                details={[
                    {
                        label: 'Owner',
                        content: <Link to={ROUTER_PATH + `admin/recruitment/staff_details/${this.state.form.owner}`}
                            className="vcenter default-underlined slds-truncate reset"
                            style={{ color: '#0070d2' }}>
                            {this.state.form.owner_name}
                        </Link>
                    },
                    {
                        label: 'Related To',
                        content: <Link to={ROUTER_PATH + `admin/recruitment/application_details/${this.state.form.applicant_id}/${this.state.form.application_id}`}
                            className="vcenter default-underlined slds-truncate reset"
                            style={{ color: '#0070d2' }}>
                            {this.state.form.application}
                        </Link>
                    },
                    {
                        label: 'Start Date',
                        content: start_datetime
                    },
                ]}
                icon={
                    <Icon
                        assistiveText={{ label: 'Lead' }}
                        category="utility"
                        name={`display_text`}
                    />
                }
                label={`Form`}
                title={this.state.form.title}
                variant="record-home"
				onRenderActions={this.actions}
            />
        )
    }

    actions = () => {
        let showCreateMember = false;
        if(this.state.create_member_disable=='true'){
            showCreateMember = true;
        }else{
            if(this.props.application_process_status==7){
                showCreateMember = false;
            }else{
                showCreateMember = true;
            }
        }

        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Download Form" id="download_form" title={`Download Form`} disabled={this.state.downloadDisabled} onClick={() => this.downloadForm()}/>
                </ButtonGroup>
            </PageHeaderControl>
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
			
            this.setState({ loading: false, downloadDisabled: false })
        });
	}
    /**
     * Onchange status selected
     * @param {int} selected_status 
     */
    selectStatus = (selected_status) => {
        this.setState({selected_status: selected_status})
    }

    /**
     * Determine status
     * @param {number} status
     */
    determineStatusPaths(status) {

        const STATUS_DRAFT = 1;
        const STATUS_COMPLETED = 2;

        const path = [
            {
                title: 'Draft',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-new': status === STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                    'slds-is-active': status === STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                    'slds-is-current': this.state.selected_status === STATUS_DRAFT,
                    'slds-is-complete':  this.state.selected_status !== STATUS_DRAFT && status > STATUS_DRAFT,
                }),
                onClick: () => this.selectStatus(STATUS_DRAFT),
            },
            {
                title: 'Completed',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': this.state.selected_status != STATUS_COMPLETED,
                    'slds-is-complete':  this.state.selected_status !== STATUS_COMPLETED && (status == STATUS_COMPLETED),
                    'slds-is-current': this.state.selected_status === STATUS_COMPLETED,
                }),
                onClick: () => this.selectStatus(STATUS_COMPLETED),
            }
        ]

        return path
    }

    /**
     * Render form Status
     */
    renderSldsPath = () => {
        const { status } = this.state.form;
        let form_status = status ? parseInt(status) : 0;

        const paths = this.determineStatusPaths(form_status);
        const visiblePaths = paths.filter(p => p.visible);

        const actionProps = {
            buttonText: `Mark Status as Current`,
            onClick: () => this.updateStatus(),
        };

        return (
            <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                <SLDSPath
                    path={visiblePaths}
                    actionProps={actionProps}
                />
            </div>
        );
    }

    /**
     * Render related tab
     *
     */
    renderRelatedTab() {
        const id = _.get(this.props, 'props.match.params.id');
        return (
            <div className="slds-grid slds-grid_vertical">
                <div className="slds-col">
                    <div className="slds-grid slds-grid_vertical slds-related-tab-details">
                        <QuestionCard
                            ref={e => this.questionListRef = e}
                            applicant_id={this.state.form.applicant_id}
                            application_id={this.state.form.application_id}
                            form_applicant_id={id}
                            getFieldHistoryItems={this.getFieldHistoryItems.bind(this)}
                            form_id={this.state.form_fk_id}
                            formTitle={this.state.form.title}
                        />
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Render related tab
     *
     */
     renderFeedTab() {
        const id = _.get(this.props, 'props.match.params.id');
        return (
            <div className="slds-grid slds-grid_vertical">
                <div className="slds-col">
                    <div className="slds-grid slds-grid_vertical slds-related-tab-details">
                    <Feed
                        ref={ref => (this.history = ref)}
                        items={this.state.fieldHistory}
                        sourceId={id}
                        relatedType={"form_applicant"}
                        getFieldHistoryItems={this.getFieldHistoryItems.bind(this)}
                    />
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
            },
            {
                label: "Feed",
                content: this.handleFeedTab,
            }
        ]
        return (
            <div className="slds-col">
                <div className="slds-gutters row">
                    <div className="col-lg-12 col-md-12 slds-m-top_medium">
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
                </div>
            </div>
        );
    }

    render() {
        const styles = css({
            root: {
                fontFamily: 'Salesforce Sans, Arial, Helvetica, sans-serif',
                marginRight: -15,
                fontSize: 13,
            }
        })
        return (
            <div className="formDetails slds" style={styles.root} ref={this.rootRef}>
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                {this.renderPageHeader()}
                {this.renderSldsPath()}
                {this.renderTab()}
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

export default connect(mapStateToProps, mapDispatchtoProps)(FormDetail);
