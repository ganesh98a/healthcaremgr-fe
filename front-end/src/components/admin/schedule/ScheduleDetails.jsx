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
    Alert,
    Dropdown,
    DropdownTrigger,
    Tooltip,
    Popover
} from '@salesforce/design-system-react'
import { ROUTER_PATH } from '../../../config.js';
import { showArchiveShiftModal, openAddEditShiftModal } from './ScheduleCommon';
import { postData, css, Confirm, toastMessageShow, AjaxConfirm, remove_access_lock } from '../../../service/common'
import AddShiftMember from './AddShiftMember.jsx'
import '../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import ScheduleStatusPath from './ScheduleStatusPath.jsx'

import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import { get_contact_name_search_for_email_act } from "components/admin/crm/actions/ContactAction.jsx"
import ScheduleMembers from './ScheduleMembers.jsx';
import SLDSReactTable from '../salesforce/lightning/SLDSReactTable'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { openAddEditShiftSkillModal } from './ShiftCommon';
import ArchiveModal  from '../oncallui-react-framework/view/Modal/ArchiveModal';
import ShiftAttachmentCard from '../schedule/ShiftAttachment/ShiftAttachmentCard';
import {getAddressForViewPage} from '../oncallui-react-framework/services/common';
import {get_service_agreement} from "./ScheduleCommon.jsx";
import Label from '../oncallui-react-framework/input/Label';
import OncallFormWidget from '../oncallui-react-framework/input/OncallFormWidget';
import { setSubmenuShow } from 'components/admin/actions/SidebarAction';

/**
 * Renders the shift details page
 */
class ShiftDetails extends React.Component {

    static defaultProps = {
        notAvailable: <span>&nbsp;</span>
    }


    constructor(props) {
        super(props);

        this.state = {
            shift_id: _.get(this.props, 'props.match.params.id'),
            loading: false,
            shift_no: '',
            owner_person: '',
            owner_id: null,
            activeTab: 'related',
            activity_loading: true,
            redirectTo: null,
            openCreateModal: false,
            openAddShiftMember: false,
            showActivity: false,
            scheduled_rows: [],
	        showSkillArchiveModal: false,
            pageSize: 6,
            page: 0,
            sorted: [],
            filtered: [],
            break_types: [],
            goals_tracking: [],
            goals_notes_reports: [],
            shiftWarnings:[],
            show_shift_warnings:false,
            show_rate_warnings: false,
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
        this.reactTable = React.createRef();
    }

    /**
     * fetching the member details if the modal is opened in the edit mode
     */
    get_shift_details = (id) => {
        this.setState({loading: true});
        postData('schedule/ScheduleDashboard/get_shift_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data,()=>{
                    if(result.data.account_type==1&&_.get(this.state, 'role_details.label', null) === 'NDIS')
                    {
                        if(result.data.actual_end_datetime && result.data.actual_start_datetime)
                        {
                           this.setShiftWarnings('actual',result.data);
                        }
                        else{
                           this.setShiftWarnings('scheduled',result.data);
                        }
                    }
                 
                });
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ showActivity: true, loading: false })
            if (this.state.shift_no == '') {
                this.redirectToListing();
            }
        });
    }

    /**
     *
     * @param {int} id shift id
     * get Shift goal details
     */
     get_shift_goal_tracking_details = (id) => {
        this.setState({loading: true});
        postData('schedule/ScheduleDashboard/get_shift_goal_tracking_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            }
        });
    }

    /**
     *
     * @param {int} id shift id
     *set shift warnings
     */
     setShiftWarnings = (shift_time_type,data) => {
        let is_service_booking_exist=false;
        let rule=0;
        get_service_agreement( data[shift_time_type +'_start_datetime'],data[shift_time_type+'_end_datetime'],shift_time_type,data.account_person).then((res)=>{
            if(res.service_booking_exist){
                is_service_booking_exist=true;
            }
            else{
               rule= res.rule;
            }
            let shiftWarnings=[]; 
            let hasSA=  data[shift_time_type+'_docusign_id']&&data[shift_time_type +'_sa_id']?true:false; 
            if(hasSA && rule!==1)
          {
               if(data[shift_time_type+'_sb_status']!=1&&!is_service_booking_exist){
                  let errmessage=rule==2?'No service booking exist for the requested shift date':'Existing Service Booking for the requested shift date is not signed';

                shiftWarnings.push({'message':errmessage});
               }
               if(data[shift_time_type+'_ndis_line_item_list'])
               {
                let is_missing=data[shift_time_type+'_ndis_line_item_list'].find((res)=>res.auto_insert_flag==1);
                if(is_missing){
                  shiftWarnings.push({'message':'Missing Support Items in the plan for the request shift service'});
                 }
               }else{
                shiftWarnings.push({'message':'Missing Support Items in the plan for the request shift service'}); 
               }
             
          }else{
            shiftWarnings.push({'message':'No NDIS Service Agreement exists for the requested shift date'});
          };
          this.setState({'shiftWarnings':shiftWarnings})
         })
        
    }

    // Get the shift attachment details
    get_shift_timesheet_attachment_details = (id) => {
        this.setState({loading: true});
        postData('schedule/ScheduleDashboard/get_shift_timesheet_attachment_details', { id }).then((result) => {
            if (result.status) {
                this.setState({ attachment_details: result.data, showAttachment: true });
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({loading: false });   
        });
    }
    /**
     * fetching the shift_skills
     */
    get_shift_skills = (id) => {
        var Request = { shift_id: this.state.shift_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('schedule/ScheduleDashboard/get_shift_skills_list', Request).then((result) => {
            if (result.status) {
                this.setState({ shift_skills: result.data, shift_skills_count: result.count, showSkillArchiveModal:false });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Close the modal when user save the shift and refresh the table
     */
    closeAddEditShiftModal = (status) => {
        this.setState({ openCreateModal: false, manageShiftSkillsModal: false, clone_shift_id: '' });
        remove_access_lock('shift', this.state.shift_id);

        if (status) {
            this.get_shift_details(this.state.shift_id);
            this.get_shift_skills(this.state.shift_id);
        }
    }

    /**
     * Open archive shift skill modal
     */
    showSkillArchiveModal(shift_skill_id) {
        this.setState({showSkillArchiveModal :  true, archive_skill_id : shift_skill_id});
    }
    /**
     * Close archive shift skill modal
     */
    closeArchiveModal= () =>{
        this.setState({showSkillArchiveModal :  false, archive_skill_id : ''})
        this.get_shift_skills();
    }

    /**
     * Open create shift modal
     */
    showModal() {
        this.setState({ openCreateModal: true, clone_shift_id: '' });
    }

    /**
     * Open clone shift modal
     */
    showCloneModal() {
        this.setState({ openCreateModal: true, clone_shift_id: this.state.shift_id });
    }

    /**
     * after no shift details are found or archived the shift
     */
    redirectToListing() {
        this.setState({ redirectTo: ROUTER_PATH + `admin/schedule/list` });
    }

    /**
     * Open archive shift modal
     */
    handleShiftSkills = e => {
        e.preventDefault();
        this.setState({ manageShiftSkillsModal: true })
    }

    /**
     * When component is mounted, remove replace the parent element's
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');        
        
        const id = _.get(this.props, 'props.match.params.id')
        this.get_shift_details(id);
        this.get_shift_break_types();
        this.get_shift_skills(id);
        this.get_shift_goal_tracking_details(id);
        this.get_shift_timesheet_attachment_details(id);

        // unlock object
        window.addEventListener('beforeunload', (ev) => {
            remove_access_lock('shift', id);
        })
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                remove_access_lock('shift', id);
            }
        }, false);

        this.props.setSubmenuShow(0);
    }

    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }
    /** Return with 1h 2m format */
    getAllowanceDuration(duration) {
        if(duration.indexOf(":") !== -1 ) {

            let scheDuration = duration.split(":");
            return scheDuration[0] + 'h ' + scheDuration[1] + 'm';

        }
    }
    /**
     * Action renderer for `<PageHeader />`
     */
    actions =  () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    {this.state.shiftWarnings.length>0 &&(
                    <span onMouseLeave={()=>this.setState({'show_shift_warnings':false})} onMouseEnter={()=>this.setState({'show_shift_warnings':true})}>
                    <Icon category="utility" name="warning"  style={{'marginRight':10+'px','fill':'#eed202','cursor':'pointer'}} />
                        </span>
                    )}
                   {this.state.show_shift_warnings&&( <>
                   <section aria-label="Dialog title" aria-describedby="popover-body-id" class="slds-popover slds-nubbin_top" role="dialog" 
                   style={{ position: 'absolute', right: -4+'px',top: 55+'px' , width:27+'rem'}}>
                 <button class="slds-button slds-button_icon slds-button_icon slds-button_icon-small slds-float_right slds-popover__close" title="Close dialog">
                {/*  <Icon category="utility" name="close" style={{'marginRight':5+'px','fill':'#fff','width':'1rem','height':'1rem'}} /> */}
                </button>
            <div id="popover-body-id" class="slds-popover__body">
           <h3 style={{textAlign:'center',    borderBottom: '1px solid',fontWeight: 600}}>WARNINGS FOUND</h3>
           <br/>
         <ul>
      {this.state.shiftWarnings.map((item)=>
              <li> <Icon category="utility" name="warning" style={{'marginRight':5+'px','fill':'#eed202','width':'1rem','height':'1rem'}} />{item.message}</li>
      )}
         
         
      </ul>
     </div>
       </section>
       </>)}
                    <Button label="Fill Shift" title={`Fill shift`} />
                    <Button label="Clone" title={`Clone shift`} onClick={e => this.showCloneModal()} />
                    <Dropdown
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        align="right"
                        iconSize="x-medium"
                        iconVariant="border-filled"
                        onSelect={(e) => {
                            if(e.value == 1){ //edit
                                this.showModal()
                            }

                        }}
                        width="xx-small"
                        disabled={this.state.is_shift_locked || !this.state.isEditable ? true : false}
                        options={[
                            { label: 'Edit', value: '1' }

                        ]}
                    />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     * fetching the reference data (skills and skill levels) of member's object
     */
    get_shift_break_types = () => {
		postData("schedule/ScheduleDashboard/get_shift_break_types").then((res) => {
			if (res.status) {
				this.setState({
					break_types: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * Renders link for related account.
     * Account can link back to 'organisation' or 'contact'
     */
    renderRelatedAccountLink() {
        const ACCOUNT_TYPE_CONTACT = 1
        const ACCOUNT_TYPE_ORGANISATION = 2
        const accountType = _.get(this.state, 'account_type', ACCOUNT_TYPE_CONTACT)
        const accountId = _.get(this.state, 'account_person.value')
        let tooltip = undefined

        if (parseInt(accountType) === ACCOUNT_TYPE_ORGANISATION) {
            const org =_.get(this.state, 'account_person.label', null)
            if (!org) {
                return this.props.notAvailable
            }

            tooltip = `${org} (organisation)`

            return <Link to={ROUTER_PATH + `admin/crm/organisation/details/${accountId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{org}</Link>
        } else if (parseInt(accountType) === ACCOUNT_TYPE_CONTACT) {
            const person =_.get(this.state, 'account_person.label', null)
            if (!person) {
                return this.props.notAvailable
            }

            tooltip = `${person} (participant)`

            return <Link to={ROUTER_PATH + `admin/item/participant/details/${accountId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{person}</Link>
        }

        return this.props.notAvailable
    }

    /**
     * Renders the link related to owner.
     * The link generated will link back to **Members** module
     */
    renderRelatedOwnerLink() {
        const memberId = _.get(this.state, 'owner_person.value', null)
        const owner =_.get(this.state, 'owner_person.label', null)
        if (!owner) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/user/details/${memberId}`
        const tooltip = `${owner} \nClicking will take you to Members module`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{owner}</Link>
    }

    /**
     * Renders the link related to role.
     */
    renderRelatedRoleLink() {
        const roleid = _.get(this.state, 'role_details.value', null)
        const role =_.get(this.state, 'role_details.label', null)
        if (!role) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/item/role/details/${roleid}`
        const tooltip = `${role} \nClicking will take you to Role details`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{role}</Link>
    }

    /**
     * Renders the link related to contact.
     */
    renderRelatedContactLink() {
        const contactid = _.get(this.state, 'contact_person.value', null)
        const contact =_.get(this.state, 'contact_person.label', null)
        if (!contact) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/crm/contact/details/${contactid}`
        const tooltip = `${contact} \nClicking will take you to Contact details`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{contact}</Link>
    }

    /**
     * Renders the duration value
     */
    renderRelatedDurationLink() {
        const scheduled_duration = _.get(this.state, 'scheduled_duration', null)
        return scheduled_duration
    }

     /**
     * Renders Shift cal
     */
      renderShiftCost(index) {
        let total_amount = 0;
        let ndis_line_item_list = this.state[index+'_ndis_line_item_list'];
        let line_item_price = true;
        let price_mis = false;
        if(ndis_line_item_list && ndis_line_item_list.length > 0 ) {
            ndis_line_item_list.map((item) => {
                if (item.sub_total != null) {
                    total_amount = total_amount + parseFloat(item.sub_total);
                }
                if (!item.line_item_price_id && index === 'actual') {
                    line_item_price = false;
                }
                if(!item.line_item_price_id && index === 'scheduled') {
                    price_mis = true;
                }
            });
            if (!line_item_price) {
                total_amount = 0;
            }
        }
        if(index === 'scheduled' && price_mis) {
            return (
                <div className="slds-form-element__control">
                    
                    <Popover
                        align="top right"
                        body={
                            <div>
                                <p className="slds-p-bottom_x-small">{"This denotes old rate. Rate will be updated upon the import of new price list"}</p>
                            </div>
                        }
                        heading="Missing Rate"
                        id="popover-error"
                        variant="warning"
                        className="slds-cus-popover-heading slds-popover-wrap"                    
                    >
                        <Button
                            assistiveText={{ icon: 'Icon Info' }}
                            style={{'fill':'red', 'background-color': 'transparent', 'color': 'red', 'border': 'none', 'padding': '0'}}
                            label={"$" + total_amount.toFixed(2)}
                        />
                    </Popover>
                </div>
            );
        } else {
            return (
                <div className="slds-form-element__control">
                    {"$" + total_amount.toFixed(2)}
                </div>
            );
        }
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        let shiftCost = [];
        if (_.get(this.state, 'role_details.label', null) === 'NDIS') {
            shiftCost = [
                {
                    label: 'Scheduled Shift Cost',
                    content: this.renderShiftCost('scheduled')
                },
                {
                    label: 'Actual Shift Cost',
                    content: this.renderShiftCost('actual')
                }
            ];
        }
        const header = {
            icon: "Shift",
            label: "Shift",
            title: this.state.shift_no || '',
            details: [
                {
                    label: 'Account',
                    content: this.renderRelatedAccountLink(),
                },
                {
                    label: 'Owner',
                    content: this.renderRelatedOwnerLink(),
                },
                {
                    label: 'Service Type',
                    content: this.renderRelatedRoleLink(),
                },
                {
                    label: 'Contact',
                    content: this.renderRelatedContactLink(),
                },
                {
                    label: 'Duration (h)',
                    content: this.renderRelatedDurationLink()
                },
                ...shiftCost
            ],
        }

        return (
            <PageHeader
                details={header.details}
                icon={
                    <Icon
                        assistiveText={{
                            label: 'Shift',
                        }}
                        category="standard"
                        name="date_input"
                        title="Shift"
                    />
                }
                label={header.label}
                onRenderActions={this.actions}
                title={header.title}
                variant="record-home"
            />
        )
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumnsSkills() {
        return [
            {
                _label: 'Skill',
                accessor: "skill_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Condition',
                accessor: "condition",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value == 1 ? 'Mandatory' : 'Optional')}</span>
            },
            {
                _label: 'Action',
                accessor: "",
                Header: props => <div style={{ width: '1.5rem' }}></div>,
                width: '1.5rem',
                Cell: props => <Dropdown
                    assistiveText={{ icon: 'More Options' }}
                    iconCategory="utility"
                    iconName="down"
                    align="right"
                    iconSize="x-small"
                    iconVariant="border-filled"
                    onSelect={(e) => {
                        if (e.value == 1) { //edit
                            this.showModal(props.original.id)
                        }
                        else { // delete
                            this.showSkillArchiveModal(props.original.id)
                        }
                    }}
                    className={'slds-more-action-dropdown'}
                    disabled={this.state.is_shift_locked ? true : false}
                    options={[
                        { label: 'Delete', value: '2' },
                    ]}
                />

            }
        ]
    }
    /**
    * Render the member skills table
    */
    renderTable() {
        const displayedColumns = this.determineColumnsSkills();
        return (
            <SLDSReactTable
                PaginationComponent={() => false}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                filtered={this.state.filtered}
                columns={displayedColumns}
                data={this.state.shift_skills}
                defaultPageSize={9999}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true}
                resizable={false}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.shift_skills_count == 0) {
            return <React.Fragment />
        }

        return (
            <React.Fragment>
                <Link to={ROUTER_PATH + `admin/schedule/skills/${this.props.props.match.params.id}`} className="slds-align_absolute-center default-underlined" title="View all member skills" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>
        );
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

        const id = _.get(this.props, 'props.match.params.id')

        return (
            <div className="slds-grid slds-grid_vertical">
                {this.state.is_shift_locked ? <div className="slds-col slds-m-top_medium">
                    <Alert
                        icon={<Icon category="utility" name="warning" />}
                        className="info-alert"
                        labels={{
                            heading: 'This record is locked for editing by user ' + this.state.shift_locked_by,
                        }}
                    /></div> : ''}

                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                        <Card
                            headerActions={<Button label="New" id="shift_skill_new" disabled={this.state.is_shift_locked ? true : false} onClick={this.handleShiftSkills} />}
                            heading={"Shift Skills (" + this.state.shift_skills_count + ")"}
                            className="slds-card-bor"
                            style={styles.card}
                            icon={<Icon category="standard" name="skill_entity" size="small" />}
                            footer={this.renderFooter()}
                        >
                            {this.renderTable()}
                        </Card>
                    </div>
                </div>

                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                        {this.state.loading == false && <ScheduleMembers styles={styles} shift_id={this.props.props.match.params.id} disabled_members={this.state.disabled_members} is_shift_locked={this.state.is_shift_locked} />}
                    </div>
                </div>

                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                    <Card
                        id="ExampleCard"
                        headerActions={<Button label="New" />}
                        heading={"Attachments (0)"}
                        style={styles.card}
                        icon={<Icon category="standard" size="small" name="document"
                        style={{
                            backgroundColor: '#baac93',
                            fill: '#ffffff'
                        }} />}
                    ></Card>

                        {this.state.showAttachment && this.state.attachment_details.length > 0 && <ShiftAttachmentCard
                            attachments={this.state.attachment_details}
                            onClickEdit={() => this.showModal('', 'timesheet')}
                        />}
                    </div>
                </div>
            </div>
        )
    }

    /**
     * renders the breaks information block for both scheduled and actual types
     */
    renderBreakTypes(breaks) {
        const styles = css({
            col: {
                marginBottom: 15,
                position: 'relative',
                'min-height': 1,
                'padding-right': 7,
                'padding-left': 7,
            }
        });

        return (breaks && breaks.length > 0) ?
            breaks.map((row, idx) => {
                var break_type_val = row.break_type;
                return <div className="row" style={styles.col}>
                    <div className="col-sm-3">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">{(idx+1)} - Break Type:</label>
                            <div className="slds-form-element__control" id={"break_types"+idx}>
                            {this.state.break_types.map((bt, btidx) => {
                                return (bt.value == break_type_val) ? bt.label : '';
                            })}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Break Start-time:</label>
                            <div className="slds-form-element__control" id={"break_start_time"+idx}>
                            {row.break_start_time}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Break End-time:</label>
                            <div className="slds-form-element__control" id={"break_end_time"+idx}>
                            {row.break_end_time}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Break Duration:</label>
                            <div className="slds-form-element__control" id={"break_duration"+idx}>
                            {row.break_duration}
                            </div>
                        </div>
                    </div>
                </div>
                }) : ''
    }
    
    getObjectLabel(oObject) {
        return oObject ? oObject.label : '';
    }
    
    getAddress(addressObj){
        return addressObj ?  getAddressForViewPage(addressObj.label , addressObj.unit_number) : '';
    }
    
    getAllowanceDurationOnCondition(travelDuration){
        return (travelDuration) ? this.getAllowanceDuration(travelDuration): '';
    }
    
    getFormattedDate(dDate){
        return dDate ? moment(dDate).format("DD/MM/YYYY HH:mm") : '';
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
                fontSize: 1.3+'em',
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
                   { value: '', label: "General information", name:"general_information", style: styles.headingText }, 
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.shift_no, label: "Shift no", name:"shift_no" },
                   { value: this.getObjectLabel(this.state.owner_person), label: "Owner", name:"Owner" }, 
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: this.getObjectLabel(this.state.account_person), label: "Account", name:"account_person" },
                   { value: this.getObjectLabel(this.state.contact_person), label: "Contact", name:"contact" }, 
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.roster_no, label: "Roster ID", name:"roster_id" },
                   { value: this.getObjectLabel(this.state.role_details), label: "Service Type", name:"service_type" }, 
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: this.getAddress(this.state.account_address), label: "Address", name:"address", colclass:"col col-sm-12" },
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.description, label: "Description", name:"description" },
                   { value: this.state.status_label, label: "Status", name:"status" }, 
                ],
            }, {
                rowclass: 'row',
                child: [
                   { value: '', label: "Confirmation information", name:"confirmation_information", style: styles.headingText }, 
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.contact_phone, label: "Phone", name:"phone" },
                   { value: this.state.contact_email, label: "Email", name:"email" }, 
                ],
            }, {
                rowclass: 'row',
                child: [
                   { value: '', label: "Scheduled Times", name:"scheduled_times", style: styles.headingText }, 
                ],
            }, {
                rowclass: 'row py-2',
                child: [
                   { value: moment(this.state.scheduled_start_datetime).format("DD/MM/YYYY HH:mm"), label: "Scheduled Start Time", name:"scheduled_start_time", colclass:"col col-sm-4" },
                   { value: moment(this.state.scheduled_end_datetime).format("DD/MM/YYYY HH:mm"), label: "Scheduled End Time", name:"scheduled_end_time", colclass:"col col-sm-4" }, 
                   { value: this.state.scheduled_duration, label: "Duration (h)", name:"duration_h", colclass:"col col-sm-4" },
                ],
            },
        ];
                
        var formProps1 = [
            {
                rowclass: 'row',
                child: [
                   { value: this.state.scheduled_travel, label: "Travel Allowance (KMs)", name:"travel_allowance_kms" }, 
                   { value: this.state.scheduled_reimbursement, label: "Reimbursements (in $)", name:"reimbursements_in" }, 
                ]
            }, {
                rowclass: 'row',
                child: [
                   { value: this.state.scheduled_travel_distance, label: "Commuting Travel Allowance (Distance KMs)", name:"community_travel_allowance_kms" }, 
                   { value: this.getAllowanceDurationOnCondition(this.state.scheduled_travel_duration), label: "Commuting Travel Allowance (Duration)", name:"community_travel_allowance" }, 
                ]
            },
        ];
        var formProps2 = [
            {
                rowclass: 'row',
                child: [
                   { value: '', label: "Actual Times", name:"actual_times", style: styles.headingText }
                ]
            }, {
                rowclass: 'row',
                child: [
                   { value: this.getFormattedDate(this.state.actual_start_datetime), label: "Actual Start Time", name:"actual_start_time", colclass:"col col-sm-4" }, 
                   { value: this.getFormattedDate(this.state.actual_end_datetime), label: "Actual End Time", name:"actual_end_time", colclass:"col col-sm-4" },
                   { value: this.state.actual_duration, label: "Duration (h)", name:"duration_h", colclass:"col col-sm-4" }, 
                ]
            },
        ];
        var formProps3 = [
            {
                rowclass: 'row',
                child: [
                   { value: this.state.actual_travel, label: "Travel Allowance (KMs)", name:"travel_allowance1" }, 
                   { value: this.state.actual_reimbursement, label: "Reimbursements (in $)", name:"reimbursements_1" },
                ]
            },{
                rowclass: 'row',
                child: [
                   { value: this.state.actual_travel_distance, label: "Commuting Travel Allowance (Distance KMs)", name:"community_allowance1" }, 
                   { value: this.getAllowanceDurationOnCondition(this.state.actual_travel_duration), label: "Commuting Travel Allowance (Duration hrs)",
                     name:"commuting_travel_allowance1" },
                ]
            }
        ];
        return (
            <div className="row slds-box" style={styles.root}>
                <OncallFormWidget formElement={formProps} />
                {this.renderBreakTypes(this.state.scheduled_rows)}
                <OncallFormWidget formElement={formProps1} />
                {this.renderNDISPayment('scheduled')}
                <OncallFormWidget formElement={formProps2} />
                {this.renderBreakTypes(this.state.actual_rows)}
                <OncallFormWidget formElement={formProps3} />

                {this.renderNDISPayment('actual')}
                <div className="col col-sm-12" style={styles.col} id="shift_notes">
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Notes</label>
                        <div className="slds-form-element__control" id="notes">
                            {this.state.notes || notAvailable}
                        </div>
                    </div>
                </div>

                <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Goal Tracking</h3>
                </div>
                {(this.state.goals_tracking.length > 0) ?
                    this.state.goals_tracking.map((row, idx) => {
                        return ( <React.Fragment><div className="col col-sm-12" style={styles.col}>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label">{row.goal_title}</label>
                                <div className="slds-form-element__control" id={"goaltype"+idx}>
                                    {row.goaltype}
                                </div>
                            </div>
                        </div>
                        <div className="col col-sm-12" style={styles.col}>

                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Snapshot</label>
                            <div className="slds-form-element__control" id={"snapshot"+idx}>
                                {row.snapshot}
                            </div>
                        </div>
                    </div> 
                    <div className="col col-sm-12" style={styles.col}>
                  <div className="slds-form-element">
                <label className="slds-form-element__label">Outcome</label>
               <div className="slds-form-element__control" id={"outcometype"+idx}>
               {row.outcometype?row.outcometype:'N/A'}
             </div>
            </div>
           </div></React.Fragment>
                        ) }) :
                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        N/A
                    </div>
                </div>
                }

                <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Shift Notes</h3>
                </div>
                <div className="col col-sm-12" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">What tasks were undertaken today?</label>
                        <div className="slds-form-element__control" id="task_taken">
                        {this.state.goals_notes_reports.task_taken || notAvailable}
                        </div>
                    </div>
                </div>
                <div className="col col-sm-12" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">What worked well?</label>
                        <div className="slds-form-element__control" id="worked_well">
                        {this.state.goals_notes_reports.worked_well || notAvailable}
                        </div>
                    </div>
                </div>

                <div className="col col-sm-12" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">What could have been done better?</label>
                        <div className="slds-form-element__control" id="done_better">
                        {this.state.goals_notes_reports.done_better || notAvailable}
                        </div>
                    </div>
                </div>

                <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Incident Report</h3>
                </div>
                <div className="col col-sm-4" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Did an incident occur today?</label>
                        <div className="slds-form-element__control" id="incident_occur_today_label">
                        {this.state.goals_notes_reports.incident_occur_today_label || notAvailable}
                        </div>
                    </div>
                </div>
                <div className="col col-sm-4" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Have you submitted an incident report?</label>
                        <div className="slds-form-element__control" id="incident_report_label">
                        {this.state.goals_notes_reports.incident_report_label || notAvailable}
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
     determineColumns() {
        return [
            {
                _label: 'Support Item Code',
                accessor: "line_item_number",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="line_item_code slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Support Item Name',
                accessor: "line_item_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Units',
                accessor: "duration",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Rate',
                accessor: "amount",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (props.original.line_item_price_id) {
                        return (
                            <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
                        );    
                    } else {
                        let pop_msg = 'Rate will be available once the new price list covering the selected date range is imported';
                        let btn = <Button
                        assistiveText={{ icon: 'Icon Info' }}
                        iconCategory="utility"
                        iconClassName="btn-icon-err"
                        iconName="date_input"
                        iconSize="small"
                        iconVariant="bare"
                        variant="icon"
                        style={{'fill':'red'}}
                        />
                        
                        if (props.original.amount) {
                            pop_msg = 'This denotes old rate. Rate will be updated upon the import of new price list';
                            btn = <Button
                            assistiveText={{ icon: 'Icon Info' }}
                            style={{'fill':'red', 'background-color': 'transparent', 'color': 'red', 'border': 'none', 'padding': '0'}}
                            label={defaultSpaceInTable(props.value)}
                            />                            
                        }
                        return(
                            <div>
                                <Popover
                                    align="top left"
                                    body={
                                        <div>
                                             <p className="slds-p-bottom_x-small">{pop_msg}</p>
                                        </div>
                                    }
                                    heading="Missing Rate"
                                    id="popover-error"
                                    variant="warning"
                                    className="slds-cus-popover-heading slds-popover-wrap"
                                    {...this.props}
                                >
                                   {btn}
                                </Popover>
                            </div>
                        );
                    }
                }
            },
            {
                _label: 'Sub Total',
                accessor: "sub_total_raw",
                headerClassName: "dt-last_row",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
        ]
    }

    /**
     * Render NDIS Table line item
     */
    renderNDISPaymentList(index) {
        let ndis_line_item_list = this.state[index + '_ndis_line_item_list'];
        const displayedColumns = this.determineColumns();

        let auto_insert_flag = false;
        let missing_items = [];
        let total_amount = 0;
        let line_item_price = true;
        if (ndis_line_item_list && ndis_line_item_list.length > 0) {
            ndis_line_item_list.map((item_value, in_val) => {
                auto_insert_flag = (item_value.auto_insert_flag === true || item_value.auto_insert_flag === "1") ? true : auto_insert_flag;
                if (item_value.auto_insert_flag === true || item_value.auto_insert_flag === "1") {
                    missing_items.push(<p className="slds-p-bottom_x-small">{item_value.line_item_value}</p>);
                }
                if (item_value.sub_total != null) {    
                    //If amount has comma then remove and then add value                                                
                    total_amount = total_amount + parseFloat(item_value.sub_total);
                }
                if (!item_value.line_item_price_id && index =='actual') {
                    line_item_price = false;
                }
            });
            if (!line_item_price) {
                total_amount = 0;
            }
        }

        return (
            <React.Fragment>
                
                <div className="col-sm-12 col-lg-12">
                <SLDSReactTable
                    PaginationComponent={() => false}
                    ref={this.reactTable}
                    manual="true"
                    columns={displayedColumns}
                    data={ndis_line_item_list}
                    defaultPageSize={10}
                    minRows={1}
                    className={''}
                    getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles col-sm-12 col-lg-12' })}
                    onPageSizeChange={this.onPageSizeChange}
                    noDataText="No records Found"
                    collapseOnDataChange={true} 
                    resizable={true} 
                />
                </div>
                
                    <div className="col-sm-8">
                        {auto_insert_flag === true ?
                            (<div className="slds-form-element__label">
                                <Popover
                                    align="top left"
                                    body={
                                        <div>
                                            {missing_items}
                                        </div>
                                    }
                                    heading="Missing Support items"
                                    id="popover-error"
                                    variant="error"
                                    className="slds-cus-popover-heading"
                                    {...this.props}
                                >
                                    <Button
                                        assistiveText={{ icon: 'Icon Info' }}
                                        iconCategory="utility"
                                        iconName="info"
                                        iconSize="small"
                                        iconVariant="bare"
                                        variant="icon"
                                    />
                                </Popover>
                                <span> One (or) more support items listed here are not found in plan</span>
                            </div>)
                            : <React.Fragment />}
                    </div>
                    <div className="col-sm-4">
                        <div className="row py-2">
                            <div className="col-sm-5 pt-1">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    Shift Cost ($)</label>
                            </div>
                            <div className="col-sm-6">
                                <input
                                    className="slds-input ndis-shift-cost"
                                    placeholder="0.00"
                                    type="text"
                                    name={"shift_cost_" + index}
                                    maxLength={10}
                                    value={total_amount.toFixed(2)}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                
            </React.Fragment>
        );
    }
    
    /**
     * Render Payment Sections
     * @returns
     */
    renderNDISPayment = (index) => {
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
        });

        const notAvailable = 'N/A' // this.props.notAvailable
        let is_ndis = this.state.rolelabel === "NDIS" || false;
        if (Number(this.state.account_type) !== 1 || !is_ndis) {
            return (<React.Fragment />);
        }
        
        let auto_insert_flag = false;
        let missing_items = [];
        let total_amount = 0;
        let service_agreement_no = this.state[index+'_service_agreement_no'];
        let docusign_id = this.state[index+'_docusign_id'] || 0;
        let docusign_related = this.state[index+'_docusign_related'];
        let docusign_url = this.state[index+'_docusign_url'];
        let ndis_line_item_list = this.state[index+'_ndis_line_item_list'];
        let support_type_label = this.state[index+'_support_type_label'];
        let signed_status = this.state[index+'_signed_status'] == 0? 0 : 1;
        return (
            <React.Fragment>
                <div className="col col col-sm-12 shift-details-hd-bg" style={styles.heading}>
                    <h3 style={styles.headingText}>NDIS Payment</h3>
                </div>

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Service Agreement</label>
                        <div className="slds-form-element__control">
                            <p>{docusign_id && signed_status && service_agreement_no || notAvailable}</p>
                            {
                                docusign_id ? signed_status && <a style={{ color: '#0070d2' }} className="reset" title="View/download contract" target="_blank" href={docusign_url}>{docusign_related}</a> || "" : ""
                            }
                        </div>
                    </div>
                </div>
                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Support Type</label>
                        <div className="slds-form-element__control" id="support_type_label">
                            {support_type_label || notAvailable }
                        </div>
                    </div>
                </div>
                {this.renderSupportTypeDuration(index)}
                <div className="col col-sm-6" style={styles.col}></div>
                {/* <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Line Item</label>
                        <div className="slds-form-element__control">
                            {ndis_line_item_list && ndis_line_item_list.length > 0 ?
                            ndis_line_item_list.map((item) => {
                                if (item.sub_total != null) {
                                    total_amount = total_amount + parseFloat(item.sub_total);
                                }
                                auto_insert_flag = Number(item.auto_insert_flag) === 1 ? true : auto_insert_flag;
                                if (Number(item.auto_insert_flag) === 1) {
                                    missing_items.push(<p className="slds-p-bottom_x-small">{item.line_item_value}</p>);
                                }
                                if(item.is_old_price == true) {
                                    return null;
                                } 
                                return (
                                    <p className="pt-2">{item.line_item_value}</p>
                                );
                            })
                            : notAvailable
                        }
                        </div>
                        { auto_insert_flag === true ? 
                            (<div className="slds-form-element__label">
                                <Popover
                                    align="top left"
                                    body={
                                        <div>
                                            {missing_items}
                                        </div>
                                    }
                                    heading="Missing Support items"
                                    id="popover-error"
                                    variant="error"
                                    className="slds-cus-popover-heading"
                                    {...this.props}
                                >
                                    <Button
                                        assistiveText={{ icon: 'Icon Info' }}
                                        iconCategory="utility"
                                        iconName="info"
                                        iconSize="small"
                                        iconVariant="bare"
                                        variant="icon"
                                    />
                                </Popover>
                                <span> One (or) more support items listed here are not found in plan</span>
                            </div> )
                            : <React.Fragment /> }
                    </div>
                </div>

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Shift Cost</label>
                        <div className="slds-form-element__control">
                            ${total_amount.toFixed(2)}
                        </div>
                    </div>
                </div> */}
                <div className="col col-sm-12" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Line Item</label>
                    </div>
                </div>
                {this.renderNDISPaymentList(index)}

            </React.Fragment>
        );
    }

    /**
     * Render support type duration
     * @returns 
     */
    renderSupportTypeDuration = (index) => {
        let support_type_duration = this.state[index + '_support_type_duration'];
        let support_type_key_name = this.state[index + '_support_type_key_name'];
        if (support_type_duration && support_type_key_name === 'mixed') {
            let durationContent = [];
            support_type_duration.map((sup_dur, idx) => {
                let label = '';
                let duration = sup_dur.duration;
                let day_count = sup_dur.day_count;
                let durationContentTemp = this.renderDuration(duration, index, idx, day_count);
                let tempDiv = (
                    <div className="col-sm-12 py-2" style={{ 'padding': 0 }}>
                        {day_count > 0 &&
                        <div className="col-sm-3">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                            {sup_dur.label}</label>
                        </div> }
                        {durationContentTemp}
                    </div>
                );
                durationContent.push(tempDiv);
            });
            return (
                <React.Fragment>
                    {durationContent}
                </React.Fragment>
            );
        }
        return <React.Fragment />;
    }

    /**
     * Render Support type input duration
     * @param {array} support_type_duration 
     * @param {str} index 
     * @param {str} p_index (Parent Index)
     * @returns 
     */
     renderDuration = (support_type_duration, section, p_index, day_count) => {         
        const styles = css({
            col: {
                marginBottom: 15,
            }
        });
        const notAvailable = 'N/A';
        let durationContent = [];
        support_type_duration.map((sup_dur, idx) => {
            let label = '';
            let duration = sup_dur.duration;
            if (Number(sup_dur.support_type) === 1) {
                label = 'Self Care';
            } else {
                label = 'Comm Access';
            }
            let tempDiv = (
                <div className={day_count > 0 ? "col col-sm-4" : "col col-sm-6"} style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">{label +" Duration (hh:mm)"}</label>
                        <div className="slds-form-element__control" id="support_type_label">
                            {duration || notAvailable }
                        </div>
                    </div>
                </div>
            );
            durationContent.push(tempDiv);
        });

        return durationContent;
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
                        {this.state.showActivity &&  <CreateActivityComponent
                            sales_type={"shift"}
                            salesId={this.props.props.match.params.id}
                            related_type="6"
                        /> }
                    </div>
                </div>
                <div className="slds-col  slds-m-top_medium">
                    <label>Activity</label>
                   {this.state.showActivity && <ActivityTimelineComponent
                        sales_type={"shift"}
                        salesId={this.props.props.match.params.id}
                        related_type="6"
                        activity_loading={true}
                    /> }
                </div>
            </>
        )
    }

    /**
     * Close add shift member modal
     */
    closeAddShiftMember=()=>{
            this.setState({openAddShiftMember :false});
    }

    /**
     * Render modals here
     */
    renderModals() {
        return (
            <React.Fragment>
                {openAddEditShiftModal(this.state.shift_id, this.state.openCreateModal, this.closeAddEditShiftModal, this.state.clone_shift_id)}
            </React.Fragment>
        )
    }

    /**
     * rendering components
     */
    render() {
        // This will only run when you archive this shift
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
            <div className="ShiftDetails slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            { this.renderPageHeader() }
                        </div>

                        <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                          {this.state.showActivity &&  <ScheduleStatusPath {...this.state} get_shift_details={this.get_shift_details} /> }
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

                                            <TabsPanel label="History">

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
                    { this.renderModals() }
                     {this.state.manageShiftSkillsModal && openAddEditShiftSkillModal(this.state.shift_skills, this.state.manageShiftSkillsModal, this.state.shift_id, this.closeAddEditShiftModal)
                    }

                    {this.state.showSkillArchiveModal && <ArchiveModal
                        id = {this.state.archive_skill_id}
                        parent_id={this.state.shift_id}
                        msg={'Shift Skill'}
                        content ={'Are you sure you want to archive this shift skill'}
                        confirm_button={'Archive Shift Skill'}
                        api_url = {'schedule/ScheduleDashboard/archive_shift_skill'}
                        close_archive_modal = {this.closeArchiveModal}
                        on_success={()=> this.get_shift_skills()}
                        />
                    }
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
        setSubmenuShow: (result) => dispatch(setSubmenuShow(result))
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ShiftDetails);