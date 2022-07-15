
import React, { Component } from 'react';
import _ from 'lodash'
import jQuery from 'jquery'
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { ROUTER_PATH } from '../../../../../../config.js';
import { postData, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'


import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';
import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Card from '@salesforce/design-system-react/lib/components/card';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import EditTaskModal from './../EditTaskModal';

import { get_contact_details_for_view, archive_contact } from "components/admin/crm/actions/ContactAction.jsx"

class ViewTask extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openOppBox: false,
            default_account: ''
        }

        this.rootRef = React.createRef()
    }

    componentDidMount() {
        var task_id = this.props.match.params.id;
        this.get_task_details(task_id);
    }

    // To get task details by id
    get_task_details = (id) => {
        postData('sales/Task/get_task_details_for_view', { task_id: id }).then((result) => {
            if (result.status) {
                this.setState(result.data, () => { });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        });
    }

    componentWillReceiveProps(newProps) {
        var contactId = this.props.match.params.id;
        var updatedContactId = newProps.match.params.id;

        if (contactId != updatedContactId) {
            this.props.get_contact_details_for_view({ contactId: updatedContactId });
        }
    }


    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }


    actions = () => (
        <React.Fragment>
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    {this.state.task_status=='Completed' ? <Button label="Mark Complete" disabled={true}/> : 
                    <Button label="Mark Complete"  onClick={(e) => this.markCompleteTask()} /> }
                    <Button label="Edit" onClick={() => this.setState({ openCreateModal: true, selectedOrgId: this.state.id })} />
                </ButtonGroup>
            </PageHeaderControl>
        </React.Fragment>
    );

    closeModal = (status) => {
        this.setState({ openCreateModal: false });
        this.get_task_details(this.props.match.params.id);
    }

    markCompleteTask = (val) => {
        const msg = `Are you sure you want to complete this Task?`
        const confirmButton = `Confirm`

        AjaxConfirm({ task_id: this.props.match.params.id }, msg, `sales/Contact/complete_task`, { confirm: confirmButton, heading_title: `Confirmation` }).then(result => {
            if (result.status) {
                this.get_task_details(this.props.match.params.id);
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }

        })
    }

    /**
    * Renders the details tab
    */
    renderDetailsTab() {
        const styles = css({
            root: {
                border: 'none',
                paddingTop: 0,
            },
            heading: {
                marginBottom: 15,
                marginTop: 8,
            },
            headingText: {
                fontSize: 15,
                fontWeight: 'normal',
            },
            col: {
                marginBottom: 15,
            },
            hr: { marginTop: 20, marginBottom: 20, border: 0, borderTop: '1px solid #eee', width: 'auto' },
            ul: { listStyleType: 'disc', paddingLeft: 40 },
        })

        const notAvailable = 'N/A' // this.props.notAvailable

        const details = [
            {
                label: 'Assigned To',
                value: this.state.assign_to || 'N/A',
            },
            {
                label: 'Status',
                value: this.state.task_status || 'N/A',
            },
            {
                label: 'Task Name',
                value: this.state.task_name || 'N/A',
            },
            {
                label: 'Name',
                value: this.state.name || 'N/A',
            },
            {
                label: 'Due Date',
                title: this.formatDate(this.state.due_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.due_date),
            },
            {
                label: 'Related To',
                value: this.state.related_to || 'N/A',
            },
            {
                label: 'Priority',
                value: this.state.priority || 'N/A',
            },
        ]


        return (
            <div className="row slds-box" style={styles.root}>
                {/* <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Service agreement details</h3>
                </div> */}
                {
                    details.map((detail, i) => {
                        return (
                            <div key={i} className="col col-sm-6" style={styles.col}>
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">{detail.label}</label>
                                    <div className="slds-form-element__control" title={detail.title}>
                                        {detail.value || notAvailable}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    /**
    * Renders the link related to account
    */
    renderRelatedNameLink() {
        let account = this.state.name;
        let account_type_label = null
        let account_link = null
        if (_.get(this.state, 'crm_participant_id')) {
            account_link = ROUTER_PATH + `admin/crm/contact/details/${_.get(this.state, 'crm_participant_id')}`
        }
        account_type_label = '(Person)'

        if (_.get(this.state, 'lead_id')) {
            account_link = ROUTER_PATH + `admin/crm/leads/${_.get(this.state, 'lead_id')}`
        }
        account_type_label = '(Lead)'

        if (account_link) {
            this.state['sa_account_name'] = account;
            this.state['account_person_id'] = _.get(this.state, 'account_person.id');
            return (
                <Link
                    to={account_link}
                    title={[account, account_type_label].filter(Boolean).join(' ')}
                    className="reset"
                    style={{ color: '#006dcc' }}
                >
                    {account}
                </Link>
            )
        }
        return (
            <span title={[account, account_type_label].filter(Boolean).join(' ')}>
                {account}
            </span>
        )
    }

    renderRelatedOpportunityLink() {
        const related_to_id = this.state.related_to_id;
        let link = "";
        if (!related_to_id) {
            return <span>&nbsp;</span>
        }
        
        const topic = this.state.related_to;
        if(this.state.related_type==1)
        {
             link = ROUTER_PATH + `admin/crm/opportunity/${related_to_id}`
        }
       else if(this.state.related_type==2)
        {
             link = ROUTER_PATH + `admin/crm/leads/${related_to_id}`
        }
        else if(this.state.related_type==3)
        {
            link = ROUTER_PATH + `admin/crm/serviceagreements/${related_to_id}`

        }else if(this.state.related_type==8)
        {
            link = ROUTER_PATH + `admin/recruitment/application_details/${this.state.applicant_id}/${related_to_id}`

        }else if(this.state.related_type==9)
        {
            link = ROUTER_PATH + `admin/recruitment/interview_details/${related_to_id}`

        }
        return <Link to={link} className="reset" style={{ color: '#006dcc' }}>{topic}</Link>
    }
    /**
    * Formats date to` DD/MM/YYYY` (eg `10/06/2020`) 
    * or else display `N/A`
    * 
    * @param {string} dateStrYmdHis 
    * @param {string} defaultDate 
    * @param {string} displayFormat 
    */
    formatDate(dateStrYmdHis, defaultDate = `N/A`, displayFormat = 'DD/MM/YYYY') {
        if (!dateStrYmdHis) {
            return defaultDate
        }

        return moment(dateStrYmdHis).isValid() ?
            moment(dateStrYmdHis).format(displayFormat) :
            defaultDate
    }

    render() {
        if (this.props.owner_name) {
            var details = [
                {
                    label: 'Owner',
                    content: this.props.owner_name,
                    truncate: true,
                },
            ];
        } else {
            var details = [
                {
                    label: 'Name',
                    content: this.renderRelatedNameLink()
                },
                {
                    label: 'Related To',
                    content: this.renderRelatedOpportunityLink()
                }
            ]
        }

        var status_option = [{ "value": '0', "label": "Assigned" }, { "value": '1', "label": "Completed" }, { "value": '3', "label": "Archived" }];

        return (
            <React.Fragment>
                {(this.state.redirectTrue) ? <Redirect to='/admin/crm/contact/listing' /> : ''}
                <div className="slds-grid slds-grid_vertical slds" ref={this.rootRef} style={{ "fontFamily": "Salesforce Sans, Arial, Helvetica, sans-serif", "margin-right": "-15px", "fontSize": "13px" }}>
                    <div className="slds-col custom_page_header">

                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    <Icon
                                        assistiveText={{ label: 'User' }}
                                        category="standard"
                                        name="task"
                                    />
                                }
                                label="Task"
                                onRenderActions={this.actions}
                                title={this.state.task_name}
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>

                    <div className="slds-col slds-m-top_medium ">
                        <div className="slds-grid ">
                            <div className="slds-col slds-size_12-of-12  slds-p-right_small">
                                <div className="white_bg_color slds-box ">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <Tabs id="tabs-example-default">
                                            <TabsPanel label="Details">
                                                <div className="container-fluid">
                                                    {this.renderDetailsTab()}
                                                </div>
                                            </TabsPanel >

                                        </Tabs >
                                    </IconSettings >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    this.state.openCreateModal ?
                        <EditTaskModal
                            taskData={this.state}
                            showModal={this.state.openCreateModal}
                            closeModal={this.closeModal}
                            salesId={this.state.related_to_id ? this.state.related_to_id : this.state.crm_participant_id}
                            sales_type={this.state.related_to_id ? 'opportunity' : 'contact'}                           
                        />
                        : ""
                }

            </React.Fragment >
        );
    }
}


const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_details_for_view: (request) => dispatch(get_contact_details_for_view(request)),
        archive_contact: (id) => dispatch(archive_contact(id)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ViewTask);