import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import jQuery from 'jquery'
import { connect } from 'react-redux';
import moment from 'moment'
import { 
    IconSettings,
    PageHeaderControl,
    ButtonGroup,
    Button,
    Icon,
    PageHeader, 
    Tabs,
    TabsPanel,
    Card,
    MediaObject,Dropdown,DropdownTrigger
} from '@salesforce/design-system-react'
import { ROUTER_PATH } from '../../../../config.js';
import { postData, css, Confirm, toastMessageShow, AjaxConfirm, currencyFormatUpdate } from '../../../../service/common'
import '../../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import TimesheetStatusPath from './TimesheetStatusPath.jsx'
import TimesheetLineItems from './TimesheetLineItems'

import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import { get_contact_name_search_for_email_act } from "components/admin/crm/actions/ContactAction.jsx"
import { openAddEditTimesheetModal } from '../FinanceCommon';
import { DetailsTitle } from '../../salesforce/lightning/DetailsTitleCard';

import OncallFormWidget from '../../oncallui-react-framework/input/OncallFormWidget';
/**
 * Renders the timesheet details page
 */
class TimesheetDetails extends React.Component {

    static defaultProps = {
        notAvailable: <span>&nbsp;</span>
    }

    constructor(props) {
        super(props);

        this.state = {
            timesheet_id: _.get(this.props, 'props.match.params.id'),
            openCreateModal: false,
            shift_full_details: [],
            loading: false,
            timesheet_no: '',
            shift_no: '',
            activeTab: 'related',
            activity_loading: true,
            redirectTo: null,
            amount: '0',
            status: '',
            status_label: '',
            showActivity: false,
            created: ''
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
    }

    /**
     * fetching the timesheet details
     */
    get_timesheet_details = (id) => {
        this.setState({loading: true});
        postData('finance/FinanceDashboard/get_timesheet_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data); 
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ showActivity: true, loading: false })
            if (this.state.timesheet_no == '') {
                this.redirectToListing();
            }
        });
    }

    /**
     * Close the modal when user saves the timesheet
     */
    closeAddEditTimesheetModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_timesheet_details(this.state.timesheet_id);
        }
    }

    /**
     * Open create/edit timesheet modal
     */
    showModal() {
        this.setState({ openCreateModal: true });
    }

    /**
     * submitting timesheet line items into keypay
     */
    create_keypay_timesheet = (id) => {
        this.setState({loading: true});
        postData('finance/FinanceDashboard/create_keypay_timesheet', { id }).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.get_timesheet_details(id);
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false })
        });
    }

    /**
     * after no timesheet details are found or archived the timesheet
     */
    redirectToListing() {
        this.setState({ redirectTo: ROUTER_PATH + `admin/finance/timesheets` });
    }

    /**
     * When component is mounted
     */
    componentDidMount() {
        const id = _.get(this.props, 'props.match.params.id')
        this.get_timesheet_details(id);
    }

    /**
     * Action renderer for `<PageHeader />`
     */
    actions =  () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Publish" title={`Publish`} disabled={this.state.status != 2 || (this.state.status == 2 && this.state.keypay_emp_id === null || this.state.keypay_emp_id === "")} onClick={() => this.create_keypay_timesheet(this.state.timesheet_id)} />
                    <Button label="Edit" title={`Edit`} onClick={() => this.showModal()} />
                    <Button label="Delete" title={`Delete`} />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     * Renders link for shift in header
     */
    renderRelatedShiftLink() {
        const shift_id = _.get(this.state, 'shift_id', null)
        const shift_no =_.get(this.state, 'shift_no', null)
        if (!shift_no) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/schedule/details/${shift_id}`
        const tooltip = `${shift_no} \nClicking will take you to Shift details`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{shift_no}</Link>
    }

    /**
     * Renders the link for member in header
     */
    renderRelatedMemberLink() {
        const memberId = _.get(this.state, 'member_id', null)
        const member =_.get(this.state, 'member_label', null)
        if (!member) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/support_worker/details/${memberId}`
        const tooltip = `${member} \nClicking will take you to Member details`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{member}</Link>
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        const header = {
            icon: "Timesheet",
            label: "Timesheet",
            title: this.state.timesheet_no || '',
            details: [
                {
                    label: 'Shift',
                    content: this.renderRelatedShiftLink(),
                },
                { 
                    label: 'Support Worker', 
                    content: this.renderRelatedMemberLink(),
                },
                { 
                    label: 'Date', 
                    content: (moment(this.state.created).format("DD/MM/YYYY HH:mm")),
                },
                { 
                    label: 'Total', 
                    content: currencyFormatUpdate(this.state.amount, '$'),
                },
                { 
                    label: 'Planned Shift Time', 
                    content: this.state.scheduled_shift_time + ' ('+this.getAllowanceDuration(this.state.shift_full_details.scheduled_duration)+')',
                },
                { 
                    label: 'Planned Break (h)', 
                    content: this.state.shift_full_details ? this.getAllowanceDuration(this.state.shift_full_details.scheduled_break_duration) : '',
                },
                { 
                    label: 'Actual Shift Time', 
                    content: this.state.shift_full_details ? this.state.actual_shift_time + ' ('+this.getAllowanceDuration(this.state.shift_full_details.actual_duration)+')' : '',
                },
                { 
                    label: 'Actual Break (h)', 
                    content: this.state.shift_full_details ? this.getAllowanceDuration(this.state.shift_full_details.actual_break_duration) : '',
                }
            ],
        }
        let in_sleepover_duration = {};
        if (this.state.shift_full_details && this.state.shift_full_details.actual_in_sleepover_duration  && this.state.shift_full_details.actual_in_sleepover_duration != '00:00') {
            in_sleepover_duration = {
                label: 'Interrupted Sleepover Duration (h)', 
                content: this.state.shift_full_details ? this.getAllowanceDuration(this.state.shift_full_details.actual_in_sleepover_duration) : '',
            };
            header.details.push(in_sleepover_duration);
        }

        return (
            <PageHeader
                details={header.details}
                icon={
                    <Icon
                        assistiveText={{
                            label: 'Timesheet',
                        }}
                        category="standard"
                        name="timesheet"
                        title="Timesheet"
                    />
                }
                className={'pg-head-cus-pad'}
                label={header.label}
                onRenderActions={this.actions}
                title={header.title}
                variant="record-home"
            />
        )
    }

    /**
     * Render related tab
     */
    renderRelatedTab() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        })

        return (
            <div class="slds-grid slds-grid_vertical slds_my_card">
                <TimesheetLineItems 
                timesheet_id={this.state.timesheet_id} 
                shift_id={this.state.shift_id} 
                get_timesheet_details={this.get_timesheet_details} 
                status={this.state.status} 
                total_amount={currencyFormatUpdate(this.state.amount, '$')}
                />
            </div>
        )
    }
    
    getCurrency(amount){
        return (amount) ? currencyFormatUpdate(amount, '$') : '';
    }
    
    getFormattedDate(dDate){
        return dDate ? moment(dDate).format("DD/MM/YYYY HH:mm") : '';
    }
    /**
     * fetches the scheduled breaks information block
     */
     fetchBreakTypes(breaks) {
        var retarr = [];
        if (breaks && breaks.length > 0) {
            breaks.map((row, idx) => {
                retarr.push(
                    {
                        label: 'Start Time',
                        value: row.break_start_time,
                        editIcn: false,
                        cell_width: 3
                    },
                    {
                        label: 'End Time',
                        value: row.break_end_time,
                        editIcn: false,
                        cell_width: 3
                    },
                    {
                        label: 'Duration',
                        value: row.break_duration,
                        editIcn: false,
                        cell_width: 3
                    });
            });
        }
        return retarr;
    }

    /** Return with 1h 2m format */
    getAllowanceDuration(duration) {
        if (duration && duration != '00:00' && duration.indexOf(":") !== -1) {
            let scheDuration = duration.split(":");
            let duration_for = [];
            if (scheDuration[0] != '00') {
                duration_for.push(Number(scheDuration[0])+'h');
            }
            if (scheDuration[1] != '00') {
                duration_for.push(Number(scheDuration[1])+'m');
            }
            duration_for = duration_for.join(' ');
            return duration_for;
        } else {
            return duration;
        }
    }
    
    /**
     * fetches the scheduled breaks information block
     */
     fetchBreakTypes(breaks) {
        var retarr = [];
        if (breaks && breaks.length > 0) {
            breaks.map((row, idx) => {
                retarr.push(
                    {
                        label: 'Start Time',
                        value: row.break_start_time,
                        editIcn: false,
                        cell_width: 3
                    },
                    {
                        label: 'End Time',
                        value: row.break_end_time,
                        editIcn: false,
                        cell_width: 3
                    },
                    {
                        label: 'Duration',
                        value: row.break_duration,
                        editIcn: false,
                        cell_width: 3
                    });
            });
        }
        return retarr;
    }

    /** Return with 1h 2m format */
    getAllowanceDuration(duration) {
        if (duration && duration != '00:00' && duration.indexOf(":") !== -1) {
            let scheDuration = duration.split(":");
            let duration_for = [];
            if (scheDuration[0] != '00') {
                duration_for.push(Number(scheDuration[0])+'h');
            }
            if (scheDuration[1] != '00') {
                duration_for.push(Number(scheDuration[1])+'m');
            }
            duration_for = duration_for.join(' ');
            return duration_for;
        } else {
            return duration;
        }
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
            }
        })
        const notAvailable = 'N/A' // this.props.notAvailable
        var formProps = [
            {
                rowclass: 'row',
                child: [
                   { value: '', label: "Timesheet information", name:"timesheet_information", style: styles.headingText }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.state.timesheet_no, label: "Timesheet no", name:"timesheet_no" },
                   { value: this.state.shift_no, label: "Shift", name:"Shift" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.state.member_label, label: "Member", name:"member_label" },
                   { value: this.state.status_label, label: "Status", name:"status_label" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.getCurrency(this.state.amount), label: "Amount", name:"amount" },
                   { value: this.state.timesheet_query_names, label: "Query", name:"query" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: '', label: "Shift information", name:"shift_information", style: styles.headingText }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.getFormattedDate(this.state.shift_full_details.scheduled_start_datetime), label: "Scheduled Start Time", 
                     name:"scheduled_start_time", colclass: 'col col-sm-4' },
                   { value: this.getFormattedDate(this.state.shift_full_details.scheduled_end_datetime), label: "Scheduled End Time",
                     name:"scheduled_end_time", colclass: 'col col-sm-4'  }, 
                   { value: this.state.shift_full_details.scheduled_duration, label: "Scheduled Shift Duration (h)", name:"shift_duration"
                     , colclass: 'col col-sm-4' },
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: this.getFormattedDate(this.state.shift_full_details.actual_start_datetime), label: "Actual Start Time",
                     name:"actual_start_time", colclass: 'col col-sm-4' }, 
                   { value: this.getFormattedDate(this.state.shift_full_details.actual_end_datetime), label: "Actual End` Time",
                     name:"actual_end_time" , colclass: 'col col-sm-4' }, 
                   { value: this.state.shift_full_details.actual_duration, label: "Actual Shift Duration (h)", 
                     name:"actual_shift_duration", colclass: 'col col-sm-4' }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.state.shift_full_details.scheduled_break_duration, label: "Scheduled Break Duration (h)", name:"break_duration" },
                   { value: this.state.shift_full_details.actual_break_duration, label: "Actual Break Duration (h)", name:"Actual_break_duration" }, 
                ],
            }            
        ];

        let details = [];
        if (this.state.shift_full_details) {
            details.push({
                caption: "Scheduled Shift Times"
            },
                {
                    label: 'Shift Start Time',
                    value: this.state.shift_full_details.scheduled_start_datetime ? moment(this.state.shift_full_details.scheduled_start_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Shift End Time',
                    value: this.state.shift_full_details.scheduled_end_datetime ? moment(this.state.shift_full_details.scheduled_end_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Duration (h)',
                    value: this.state.shift_full_details.scheduled_duration ? this.state.shift_full_details.scheduled_duration : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                });

            if (this.state.shift_full_details.scheduled_paid_rows && this.state.shift_full_details.scheduled_paid_rows.length > 0) {
                details.push({ caption: "Scheduled Paid Break Times" });
                var scheduled_paid_rows = this.fetchBreakTypes(this.state.shift_full_details.scheduled_paid_rows);
                details = [...details, ...scheduled_paid_rows];
            }

            if (this.state.shift_full_details.scheduled_unpaid_rows && this.state.shift_full_details.scheduled_unpaid_rows.length > 0) {
                details.push({ caption: "Scheduled Unpaid Break Times" });
                var scheduled_unpaid_rows = this.fetchBreakTypes(this.state.shift_full_details.scheduled_unpaid_rows);
                details = [...details, ...scheduled_unpaid_rows];
            }

            if (this.state.shift_full_details.scheduled_sleepover_rows && this.state.shift_full_details.scheduled_sleepover_rows.length > 0) {
                details.push({ caption: "Scheduled Sleepover Break Times" });
                var scheduled_sleepover_rows = this.fetchBreakTypes(this.state.shift_full_details.scheduled_sleepover_rows);
                details = [...details, ...scheduled_sleepover_rows];
            }

            details.push({ caption: "Scheduled Allowances and Reimbursements" });
            details.push({
                label: 'Travel Allowance (KMs)',
                value: this.state.shift_full_details.scheduled_travel ? this.state.shift_full_details.scheduled_travel : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Reimbursements ($)',
                value: this.state.shift_full_details.scheduled_reimbursement ? this.state.shift_full_details.scheduled_reimbursement : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Distance KMs)',
                value: this.state.shift_full_details.scheduled_travel_distance ? this.state.shift_full_details.scheduled_travel_distance : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Duration hrs)',
                value: this.state.shift_full_details.scheduled_travel_duration ? this.getAllowanceDuration(this.state.shift_full_details.scheduled_travel_duration) : notAvailable,
                editIcn: false,
            });

            details.push({
                caption: "Actual Shift Times"
            },
                {
                    label: 'Shift Start Time',
                    value: this.state.shift_full_details.actual_start_datetime ? moment(this.state.shift_full_details.actual_start_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Shift End Time',
                    value: this.state.shift_full_details.actual_end_datetime ? moment(this.state.shift_full_details.actual_end_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Duration (h)',
                    value: this.state.shift_full_details.actual_duration ? this.state.shift_full_details.actual_duration : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                });

            if (this.state.shift_full_details.actual_paid_rows && this.state.shift_full_details.actual_paid_rows.length > 0) {
                details.push({ caption: "Actual Paid Break Times" });
                var actual_paid_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_paid_rows);
                details = [...details, ...actual_paid_rows];
            }

            if (this.state.shift_full_details.actual_unpaid_rows && this.state.shift_full_details.actual_unpaid_rows.length > 0) {
                details.push({ caption: "Actual Unpaid Break Times" });
                var actual_unpaid_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_unpaid_rows);
                details = [...details, ...actual_unpaid_rows];
            }

            if (this.state.shift_full_details.actual_sleepover_rows && this.state.shift_full_details.actual_sleepover_rows.length > 0) {
                details.push({ caption: "Actual Sleepover Break Times" });
                var actual_sleepover_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_sleepover_rows);
                details = [...details, ...actual_sleepover_rows];
            }

            if (this.state.shift_full_details.actual_in_sleepover_rows && this.state.shift_full_details.actual_in_sleepover_rows.length > 0) {
                details.push({ caption: "Actual Interrupted Sleepover Break Times" });
                var actual_in_sleepover_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_in_sleepover_rows);
                details = [...details, ...actual_in_sleepover_rows];
            }

            details.push({ caption: "Actual Allowances and Reimbursements" });
            details.push({
                label: 'Travel Allowance (KMs)',
                value: this.state.shift_full_details.actual_travel ? this.state.shift_full_details.actual_travel : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Reimbursements ($)',
                value: this.state.shift_full_details.actual_reimbursement ? this.state.shift_full_details.actual_reimbursement : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Distance KMs)',
                value: this.state.shift_full_details.actual_travel_distance ? this.state.shift_full_details.actual_travel_distance : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Duration hrs)',
                value: this.state.shift_full_details.actual_travel_duration ? this.getAllowanceDuration(this.state.shift_full_details.actual_travel_duration) : notAvailable,
                editIcn: false,
            });
        }
        
        if (this.state.shift_full_details) {
            details.push({
                caption: "Scheduled Shift Times"
            },
                {
                    label: 'Shift Start Time',
                    value: this.state.shift_full_details.scheduled_start_datetime ? moment(this.state.shift_full_details.scheduled_start_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Shift End Time',
                    value: this.state.shift_full_details.scheduled_end_datetime ? moment(this.state.shift_full_details.scheduled_end_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Duration (h)',
                    value: this.state.shift_full_details.scheduled_duration ? this.state.shift_full_details.scheduled_duration : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                });

            if (this.state.shift_full_details.scheduled_paid_rows && this.state.shift_full_details.scheduled_paid_rows.length > 0) {
                details.push({ caption: "Scheduled Paid Break Times" });
                var scheduled_paid_rows = this.fetchBreakTypes(this.state.shift_full_details.scheduled_paid_rows);
                details = [...details, ...scheduled_paid_rows];
            }

            if (this.state.shift_full_details.scheduled_unpaid_rows && this.state.shift_full_details.scheduled_unpaid_rows.length > 0) {
                details.push({ caption: "Scheduled Unpaid Break Times" });
                var scheduled_unpaid_rows = this.fetchBreakTypes(this.state.shift_full_details.scheduled_unpaid_rows);
                details = [...details, ...scheduled_unpaid_rows];
            }

            if (this.state.shift_full_details.scheduled_sleepover_rows && this.state.shift_full_details.scheduled_sleepover_rows.length > 0) {
                details.push({ caption: "Scheduled Sleepover Break Times" });
                var scheduled_sleepover_rows = this.fetchBreakTypes(this.state.shift_full_details.scheduled_sleepover_rows);
                details = [...details, ...scheduled_sleepover_rows];
            }

            details.push({ caption: "Scheduled Allowances and Reimbursements" });
            details.push({
                label: 'Travel Allowance (KMs)',
                value: this.state.shift_full_details.scheduled_travel ? this.state.shift_full_details.scheduled_travel : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Reimbursements ($)',
                value: this.state.shift_full_details.scheduled_reimbursement ? this.state.shift_full_details.scheduled_reimbursement : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Distance KMs)',
                value: this.state.shift_full_details.scheduled_travel_distance ? this.state.shift_full_details.scheduled_travel_distance : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Duration hrs)',
                value: this.state.shift_full_details.scheduled_travel_duration ? this.getAllowanceDuration(this.state.shift_full_details.scheduled_travel_duration) : notAvailable,
                editIcn: false,
            });

            details.push({
                caption: "Actual Shift Times"
            },
                {
                    label: 'Shift Start Time',
                    value: this.state.shift_full_details.actual_start_datetime ? moment(this.state.shift_full_details.actual_start_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Shift End Time',
                    value: this.state.shift_full_details.actual_end_datetime ? moment(this.state.shift_full_details.actual_end_datetime).format("DD/MM/YYYY HH:mm") : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                },
                {
                    label: 'Duration (h)',
                    value: this.state.shift_full_details.actual_duration ? this.state.shift_full_details.actual_duration : notAvailable,
                    editIcn: false,
                    cell_width: 3,
                });

            if (this.state.shift_full_details.actual_paid_rows && this.state.shift_full_details.actual_paid_rows.length > 0) {
                details.push({ caption: "Actual Paid Break Times" });
                var actual_paid_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_paid_rows);
                details = [...details, ...actual_paid_rows];
            }

            if (this.state.shift_full_details.actual_unpaid_rows && this.state.shift_full_details.actual_unpaid_rows.length > 0) {
                details.push({ caption: "Actual Unpaid Break Times" });
                var actual_unpaid_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_unpaid_rows);
                details = [...details, ...actual_unpaid_rows];
            }

            if (this.state.shift_full_details.actual_sleepover_rows && this.state.shift_full_details.actual_sleepover_rows.length > 0) {
                details.push({ caption: "Actual Sleepover Break Times" });
                var actual_sleepover_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_sleepover_rows);
                details = [...details, ...actual_sleepover_rows];
            }

            if (this.state.shift_full_details.actual_in_sleepover_rows && this.state.shift_full_details.actual_in_sleepover_rows.length > 0) {
                details.push({ caption: "Actual Interrupted Sleepover Break Times" });
                var actual_in_sleepover_rows = this.fetchBreakTypes(this.state.shift_full_details.actual_in_sleepover_rows);
                details = [...details, ...actual_in_sleepover_rows];
            }

            let support_type_duration = this.state['actual_support_type_duration'];
            if (support_type_duration) {
                support_type_duration.map((sup_dur, idx) => {
                    let label = '';
                    let duration = sup_dur.duration_txt;
                    if (Number(sup_dur.support_type) === 1) {
                        label = 'Self Care';
                    } else {
                        label = 'Comm Access';
                    } 
                    details.push({
                        label: label+" Duration (hh:mm)",
                        value: duration,
                        editIcn: false,
                    });
                });
            }
            details.push({ caption: "Actual Allowances and Reimbursements" });
            details.push({
                label: 'Travel Allowance (KMs)',
                value: this.state.shift_full_details.actual_travel ? this.state.shift_full_details.actual_travel : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Reimbursements ($)',
                value: this.state.shift_full_details.actual_reimbursement ? this.state.shift_full_details.actual_reimbursement : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Distance KMs)',
                value: this.state.shift_full_details.actual_travel_distance ? this.state.shift_full_details.actual_travel_distance : notAvailable,
                editIcn: false,
            });
            details.push({
                label: 'Commuting Travel Allowance (Duration hrs)',
                value: this.state.shift_full_details.actual_travel_duration ? this.getAllowanceDuration(this.state.shift_full_details.actual_travel_duration) : notAvailable,
                editIcn: false,
            });
        }

        return (
            <div className="slds-box" style={styles.root}>
                <OncallFormWidget formElement={formProps} />
            </div>
        )
    }

    /**
     * Render the sidebar
     */
    renderSidebar() {
        const styles = css({
            root: {
                fontSize: 12
            },
            sidebarBlock: {
                marginBottom: 15,
            },
        })

        return (
            <>
                <div className="slds-grid slds-grid_vertical">
                    <div className="slds-col">
                        <label>Activity</label>
                        {this.state.showActivity ?  <CreateActivityComponent
                            sales_type={"timesheet"}
                            salesId={this.props.props.match.params.id}
                            related_type="7" 
                        /> :  ''} 
                    </div>
                </div>
                <div className="slds-col  slds-m-top_medium">
                    <label>Activity</label>
                   {this.state.showActivity ? <ActivityTimelineComponent
                        sales_type={"timesheet"}
                        salesId={this.props.props.match.params.id}
                        related_type="7" 
                        activity_loading={true}
                    /> : ''} 
                </div>
            </>
        )
    }

    /**
     * rendering components
     */
    render() {
        // This will only run when you archive this timesheet
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }

        const styles = css({
            root: { 
                fontFamily: 'Salesforce Sans, Arial, Helvetica, sans-serif',
                marginRight: -15,
                fontSize: 13,
            }
        })

        return (
            <div className="TimesheetDetails slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            { this.renderPageHeader() }
                        </div>
                        {openAddEditTimesheetModal(this.state.timesheet_id, this.state.openCreateModal, this.closeAddEditTimesheetModal)}

                        <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                            <TimesheetStatusPath {...this.state} get_timesheet_details={this.get_timesheet_details} />
                        </div>

                        <div className="slds-col">
                            <div className="slds-grid slds-wrap slds-gutters_x-small">
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box ">
                                        <Tabs>
                                            <TabsPanel label="Related">
                                                { this.renderRelatedTab() }
                                            </TabsPanel>

                                            <TabsPanel label="Details">
                                                { this.renderDetailsTab() }
                                            </TabsPanel>
                                        </Tabs>
                                    </div>
                                </div>
                                
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12">
                                    <div className="white_bg_color slds-box">
                                        { this.renderSidebar() }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </IconSettings>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(TimesheetDetails);