import React,{useState} from 'react';
import jQuery from 'jquery';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from "moment";
import { ROUTER_PATH } from 'config.js';

import { DataTableColumn, DataTableCell, PageHeader, IconSettings,PageHeaderControl,Icon,Dropdown,DropdownTrigger,Input,InputIcon, Button } from '@salesforce/design-system-react'
import DataTable from '../../salesforce/components/data-table';
import { postData, reFreshReactTable, toastMessageShow } from '../../services/common.js';
import { get_list_view_default_pinned, get_list_view_related_type, get_list_view_by_id} from '../../services/common_filter';

import ListViewControls from './ListViewControls';
import CommonHeaderListViewControls from './CommonHeaderListViewControls';
import CommonDataTableHeaderFilter from './CommonDataTableHeaderFilter';
import { get_list_view_controls_by_default_pinned,get_list_view_controls_by_related_type, get_list_view_controls_by_id, setKeyValue } from './actions/ListViewAction'


import '../../salesforce/scss/react-data-table.scss'
import { Link, Redirect } from 'react-router-dom';
const listControlOption = [
	{ label: 'LIST VIEW CONTROLS', type: 'header' },
	{ label: 'All', value: 'all' },
];

/** To Customize data table column record */
const CustomDataTableCell = ({ children, ...props }) => {
    
    let link, dynamicProp, customvalue, warningIcon,shiftWarningPopup = '';
    const [shiftWarnStatus,setShiftWarnStatus]=useState(false);
    //Note should pass the props like 'CustomDateFormat' in <DataTableColumn>
    if(props.CustomDateFormat !== undefined) {
        if (!children) {
            return <DataTableCell title={children} {...props}>
                    <span className="tablecell vcenter slds-truncate"></span>
                </DataTableCell>
        }

        const dateMoment = moment(children)
        if (!dateMoment.isValid()) {
            return <DataTableCell title={children} {...props}>
                    <span className="tablecell vcenter slds-truncate"></span>
                </DataTableCell>
        }

        children = moment(children).format(props.CustomDateFormat);
        return(
            <DataTableCell title={children} {...props}>
                <span className="tablecell vcenter slds-truncate">{children}</span>
            </DataTableCell>
        )

    }

     /**
     * enabling copy functionality for meeting link
    */
      if(props.header ==='Invite' && props.filter_related_type==12)
      {         
        if(props.item.ms_event_status==1 && props.item.unsuccessful_reason && props.item.unsuccessful_reason.reason_label=='Canceled'){
            return(
                <DataTableCell title={children} {...props}>
                  {children&&( <span className="tablecell vcenter slds-truncate" style={{ color: '#e04367' }}>{'Canceled'}</span>)}
                </DataTableCell>
            )
          }else if(props.item.interview_stage_status=='4' && props.item.unsuccessful_reason && props.item.unsuccessful_reason.reason_label){
            return(
                <DataTableCell title={children} {...props}>
                  <span className="tablecell vcenter slds-truncate" style={{ color: '#e04367' }}>{props.item.unsuccessful_reason.reason_label}</span>
                </DataTableCell>
            )
          }else if(props.item.attendees_count && Number(props.item.attendees_count) > 0){
            return(
                <DataTableCell title={children} {...props}>
                  {children&&( <span className="tablecell vcenter slds-truncate" onClick={()=>{navigator.clipboard.writeText(children); toastMessageShow("Link Copied Successfully", "s");}} style={{ color: '#0070d2',cursor:'pointer',textDecoration:'underline' }}>{'Copy Link'}</span>)}
                </DataTableCell>
            )
        } else {
            return (
            <DataTableCell title={children} {...props}>
                 <span className="tablecell vcenter slds-truncate" onClick={()=>{props.customFunc(props.item)}} style={{ color: '#0070d2',cursor:'pointer',textDecoration:'underline' }}>{'Add Attendees'}</span>
            </DataTableCell>
            )
        }
         
      }
    /**
     * enabling phone code
    */
    if (props.header === 'Phone' && props.filter_related_type == 22) {

        return (
            <DataTableCell title={children} {...props}>
                {"+61 "+children}
            </DataTableCell>
        )

    }
      
    /**
     * enabling click functionality for a cell 
    */
    if(props.header ==='Question Id' &&props.filter_related_type==32)
    {
        return(
            <DataTableCell title={children} {...props}>
                <span className="tablecell vcenter slds-truncate" onClick={()=>{props.QuestionIdClick(props.item)}} style={{ color: '#0070d2',cursor:'pointer',textDecoration:'underline' }}>{children}</span>
            </DataTableCell>
        )
    }


    if((props.header == 'Title' || props.header == 'Name'  || props.header == 'OA Template') && props.from) {
        if (children === "OA reminder - SMS") {
            children = "OA Reminder";
        }
        return(
                <DataTableCell title={children} {...props}>
                    <span className="tablecell vcenter slds-truncate" onClick={()=>{props.openViewModal(props.item)}} style={{ color: '#0070d2',cursor:'pointer',textDecoration:'underline' }}>{children}</span>
                </DataTableCell>
            )
    }
    /*
	* Here we generate the Custom link using ...props, this props contains both <Datatable> and <Datacolumns> data's
	* For doing any other customization we can console props(console.log(props)) and then we can do the customization	*
	*/
    else if(props.CustomUrl !== undefined) {

        for(let i = 0; i <= props.CustomUrl.length; i++) {

            if (props.CustomUrl[i].url !== undefined) {

                link = props.CustomUrl[i].url;
                continue;
            }

            else if(props.CustomUrl[i].custom_value !== undefined && props.CustomUrl[i].custom_value === 'shift_no') {        
                if(props.item.account_type == 1 && props.item.role_name == 'NDIS' && props.item.warnings != undefined && props.item.warnings.is_warnable == 1) {
                    warningIcon = <span onMouseEnter={(e)=>{setShiftWarnStatus(true)}} onMouseLeave={(e)=>{setShiftWarnStatus(false)}}><Icon category="utility" name="warning"  size="x-small" style={{'marginRight':10+'px','fill':'#eed202'}} /></span>
                }
                if(props.item.is_shift_locked) {
                    customvalue = <Icon
                                assistiveText={{ label: 'Lock' }}
                                category="utility"
                                colorVariant="default"
                                name="lock"
                                size="x-small"
                                className='shift-lock-icon'
                                />;
                }
                if(props.item.account_type == 1 && props.item.role_name == 'NDIS' && props.item.warnings != undefined && props.item.warnings.is_warnable == 1)
                {

                    if(shiftWarnStatus)
                    {
                        shiftWarningPopup=
                     <section aria-label="Dialog title" aria-describedby="popover-body-id" class="slds-popover slds-nubbin_top-left" role="dialog" 
                           style={{zIndex:1, position: 'absolute', left:83+'px',top: 38+'px' , width:370+'px'}}>
                    <div id="popover-body-id" class="slds-popover__body">
                   <br/>
                 <ul>
             { props.item.warnings.warning_messages.map((item)=>
                      <li> <Icon category="utility" name="warning" style={{'marginRight':5+'px','fill':'#eed202','width':'1rem','height':'1rem'}} /><span style={{'fontSize':11+'px'}}>{item}</span></li>
              )}
              </ul>
             </div>
               </section> 
                    } 
                }
            }
            if(props.CustomUrl[i].param !== undefined) {

                let id = 1;
                for(let j = 0; j< props.CustomUrl[i].param.length; j++) {
                    /**
                     * Get the dynamic params from parent page "[props.CustomUrl[i].param[i]]"
                     * this will helps to get the dynamic id. Based on the 'PARAM' we will replace and generate
                     * the URL
                     * */
                    dynamicProp = props.item[props.CustomUrl[i].param[j]];
                    link = link.replace('PARAM' + (id + j), dynamicProp);

                }

                if (props.header === 'Online Assessment Status' && props.filter_related_type == 11
                    && (children == 'Submitted' || children == 'Completed')
                ) {
                    return (
                        <DataTableCell title={children} {...props}>
                            <a href={link} target="_blank"  class='vcenter default-underlined slds-truncate' style={{ color: '#0070d2' }}>
                                {children}
                            </a>
                        </DataTableCell>
                    )
                }
                if (props.header === 'Online Assessment Status' && props.filter_related_type == 11 && (children == 'In progress' || children == 'Sent' || children == 'Error' || children == 'Link Expired' || children == 'Moodle')
                ) {
                    return (
                        <DataTableCell title={children} {...props}>
                            <span style={{ color: children === 'Error' ? 'Red' : '' }}> {children}</span>
                        </DataTableCell>
                    )
                }
                
                if (props.header == 'Application Id' && props.filter_related_type == "11") {
                    let childrenTitle = children;
                    if(props.item.application_process_status == 8){
                        childrenTitle =(props.item.flagged_status > 0) ? 'Applicant is flagged' : 'Application is Unsuccessful';
                    }
                    return ( 
                        <DataTableCell title={childrenTitle} {...props}>
                            {props.item.application_process_status == 8 && (<span style={{ width: 9 + 'px', height: 9 + 'px', background: props.item.flagged_status > 0 ? 'rgb(226, 82, 47)' : 'rgb(255, 198, 0)', position: 'absolute', left: 0 + 'px', top: 10 + 'px', display: 'inline-block', borderRadius: 50 + '%' }}></span>)}<span className="vcenter slds-truncate"><Link to={link} class='vcenter default-underlined slds-truncate' style={{ color: '#0070d2' }}>
                                {children}
                            </Link></span>
                        </DataTableCell>
                    )
                }

                return( <DataTableCell ClassName={customvalue ? 'data-custom-col' : ''} title={children} {...props}>
                   
                         <Link className="tablecell vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }} to={link}>
                              {children}
                              </Link>
                       
                   {customvalue} {warningIcon} {shiftWarningPopup}
                </DataTableCell>
                )
            }

        }
    }
    else if(props.multipleCustomUrl !== undefined) {

        switch (props.multipleCustomUrl) {
            case 'shift_account_fullname':
            case 'roster_account_fullname':
                link = 'admin/item/participant/details/' + props.item.account_id;

                if(props.item.account_type == 2) {
                    link = 'admin/crm/organisation/details/' + props.item.account_id;
                }
                break;
            case 'task_related_name':
                if(!props.item.crm_participant_id && props.item.lead_id){
                    link = 'admin/crm/leads/' + props.item.lead_id;
                }else{
                    link = 'admin/crm/contact/details/' + props.item.crm_participant_id;
                }

                break;
            case 'task_related_type':
                link = '#';
                if(props.item.related_type == 1) {
                    link = 'admin/crm/opportunity/' + props.item.related_to_id;
                }else if(props.item.related_type == 2) {
                    link = 'admin/crm/leads/' + props.item.related_to_id;
                }else if(props.item.related_type == 3) {
                    link = 'admin/crm/serviceagreements/' + props.item.related_to_id;
                }else if(props.item.related_type == 4) {
                    link = 'admin/crm/needassessment/' + props.item.related_to_id;
                }else if(props.item.related_type == 5) {
                    link = 'admin/crm/riskassessment/details/' + props.item.related_to_id;
                }

                break;

            default:
                break;
        }

        return( <DataTableCell title={children} {...props}>
             <Link className="tablecell vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }} to={link}> {children}</Link>
           
        </DataTableCell>
        )

    }
    else if(props.property !== undefined && props.property === 'actions') {
        let disabled = false;
        let actionList = props.actionList;

        if(props.item.is_shift_locked) {
            disabled = true;
        }else if(props.item.interview_stage_status==3 || props.item.interview_stage_status==4){
            disabled = true;
        }else if(props.item.interview_stage_status > 0){
            actionList.forEach(interview => {
                if(interview.key=='delete'){
                    interview['disabled'] = true;
                }
            });
        }
        //apply callback on action items
        if (props.callback) {
            actionList = props.callback(actionList, props.item);
        }
        return( <DataTableCell className="dt-action-dropdown" title={" "}>
                    {actionList && actionList.length && <Dropdown
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        align="right"
                        iconSize="x-small"
                        iconVariant="border-filled"
                        onSelect={(e) => {
                            props.showModal(props.item, e.key);
                        }}
                        width="xx-small"
                        disabled={disabled}
                        options={actionList}
                    /> || ""}
                </DataTableCell>);
    }
    else if(props.customIcon !== undefined) {

        let title = children;
        let name, type = '';
        let icon = {1: 'avatar', 2: 'channel_program_members', 3: 'contact', 4: 'account',
             5: 'household', 6: 'lead', 7: 'lead'};
        if(props.customIcon == 'initiated_by_name') {
            title = props.item.init_category;
            name =  icon[props.item.initiator_type];
        }
        else if(props.customIcon == 'against_by_name') {
            title = props.item.against_category;
            name =  icon[props.item.against_type];
        }

        customvalue = <Icon
        assistiveText={{
            label: name,
        }}
        category="standard"
        name={name}
        colorVariant="default"
        size="x-small"
        title={title}
    />
        return <DataTableCell title={title} {...props}>{customvalue} {children}</DataTableCell>;
    }
    else if(props.CustomShiftErrorNote !== undefined) {

        warningIcon = <span onMouseEnter={(e)=>{setShiftWarnStatus(true)}} onMouseLeave={(e)=>{setShiftWarnStatus(false)}}> {children}</span>
        
            if(shiftWarnStatus)
            {
                shiftWarningPopup=
                <section aria-label="Dialog title" aria-describedby="popover-body-id" class="slds-popover slds-nubbin_top-right" role="dialog" 
                            style={{zIndex:1, position: 'absolute', right:83+'px',top: 38+'px' , width:370+'px'}}>
                    <div id="popover-body-id" class="slds-popover__body">
                        <br></br>                    
                    <ul>
                        { props.item.warnings.warning_messages.map((item)=>
                            <li> 
                                <Icon category="utility" name="warning" style={{'marginRight':5+'px','fill':'#eed202','width':'1rem','height':'1rem'}} />
                                <span style={{'fontSize':11+'px'}}>{item}</span>
                            </li>
                        )}
                    </ul>
                </div>
                </section>
            }
        return <DataTableCell title={props.item.short_warning_msg} className="slds-text-block">{warningIcon}{shiftWarningPopup}</DataTableCell>;
    }
    
    else {
        let title = "";
        if (children && typeof props.callback === "function") {
            children = props.callback(children);
            title = children;
        }
        if (typeof props.Title === "function") {
            title = props.Title(props.item);
        }
        if (typeof props.Component === "function") {
            children = props.Component(children, props.item, props.parent);
        }
        if(props.WithoutTruncate !== undefined) {
            return <DataTableCell title={title} className="slds-text-block">{children}</DataTableCell>;
        }
        if(props.WithoutTruncate !== undefined) {
            return <DataTableCell title={title} className="slds-text-block">{children}</DataTableCell>;
        }
        return <DataTableCell title={title} {...props}>{children}</DataTableCell>;
    }

}

CustomDataTableCell.displayName = DataTableCell.displayName;

//Resize table columns
const createResizableTable = function(table) {
	const cols = table.querySelectorAll('th');
	[].forEach.call(cols, function(col) {
		// Add a resizer element to the column
		const resizer = document.createElement('div');
		resizer.classList.add('resizer');

		col.appendChild(resizer);

		createResizableColumn(col, resizer);
	});
};

const createResizableColumn = function(col, resizer) {
	let x = 0;
	let w = 0;

	const mouseDownHandler = function(e) {
		x = e.clientX;

		const styles = window.getComputedStyle(col);
		w = parseInt(styles.width, 10);

		document.addEventListener('mousemove', mouseMoveHandler);
		document.addEventListener('mouseup', mouseUpHandler);

		resizer.classList.add('resizing');
	};

	const mouseMoveHandler = function(e) {
		const dx = e.clientX - x;
		col.style.width = `${w + dx}px`;
	};

	const mouseUpHandler = function() {
		resizer.classList.remove('resizing');
		document.removeEventListener('mousemove', mouseMoveHandler);
		document.removeEventListener('mouseup', mouseUpHandler);
	};

	resizer.addEventListener('mousedown', mouseDownHandler);
};

//Display No Record found
const customNoData = function(status, noDataText) {
    let noData = document.getElementById('dt-noData')

    //Remove old Text
    if(noData){
        noData.innerHTML = '';
    }

	if(status === true) {
		document.getElementById("DataTableListView-FixedHeaders").insertAdjacentHTML('afterend','<div id="dt-noData">'+ noDataText +'</div>');
		document.body.style.overflow = "inherit";
		return;
	}
}
class DataTableListView extends React.Component {

	static displayName = 'DataTableListView';
	constructor(props) {
		super();
        let listViewRelatedType = this.listViewRelatedType();
		this.state = {
            sortColumn: props.sortColumn,
            sortColumnLabel: props.sortColumnLabel,
			sortColumnDirection: {},
			items: [],
			prevItems: [],
			selection: [],
			hasMore: true,
			list_api_url: props.list_api_url,
			pageSize: props.pageSize ? props.pageSize : 20,
			page: props.page ? props.page : 0,
			pages: 0,
			sorted: [],
			filtered: props.filtered,
			isLoading: false,
            noDataFlag: false,
            refreshTable: false,
            isNewFilter: false,
            totalItem: 0,
            lastUpdated: 'a few seconds',
            lastUpdatedValue: 60,

			searchVal: '',
            filterVal: '',
            dataRows: [],
            filter_status: props.filter_status || 'all',
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            selectfilteroptions: props.filter_options,
            showselectedfilters: false,
            showselectfilters: false,
            selectfiltercreatedbyoptions:[],
            selectedfilval: [],
            default_filter_logic: props.default_filter_logic || '1 AND 2',
            filter_logic: '',
            list_control_option:props.list_control_option || listControlOption,
            filter_title : props.filter_title,
            filter_list_id : '',
            showFilter: props.show_filter || false,
            checkdefault: props.check_default || 'all',
            filter_related_type: listViewRelatedType[props.related_type],
            filter_error_msg: '',
            is_any_data_pinned: props.is_any_data_pinned || false,
            pinned_id: "0",
            filter_list_length: '0',
            is_own_list: false,
            user_view_by: '1',
            list_control_data:[],
            showFilterOption: false,
            refresh_filters: false,
            loading: props.loading || false,
            current_list_id: 0,
            checkedItem: 0,
            shift_current_page:0,
            shift_current_shift_list:1,
            shift_list_current_offset:0,
            data_ends:false,
            tobefilterdata:[],
            removeselectfilter:null,
            showWarnings:false,
            renameFilterEnabled:true,
            deleteFilterEnabled:true,
            listFromImail: props.listFromImail || false,
            listToOpenModal: props.listToOpenModal || false
		};
		this.reactTable = React.createRef();
		this.rootRef = React.createRef();
	}

	listViewRelatedType() {
        return {
            contact: '1',
            organisation: '2',
            tasks: '3',
            leads: '4',
            opportunity: '5',
            need_assessment: '6',
            risk_assessment: '7',
            service_agreements: '8',
            invoices: '15',
            payrates: '20',
            timesheets: '21',
            shift: '9',
            participant: '10',
            application: '11',
            roles: '13',
            members:'14',
            interviews: '12',
            roster: '18',
            document:'16',
            charge_rates:'19',
            email_templates: '17',
            fms_feed_back: '24',
            admin_user_management: '22',
            holiday: '23',
            sms_template:'26',
            access_roles:'27',
            question_list:'32',
            jobs:'28',
            reference_data_management: '29',
            ndis_error_list:'30',
            line_item: '33',
            online_assessment: '34',
            business_unit: '35'
        };
	}


    componentDidUpdate(prevProps){
        if(this.props.status_filter_value)
        {
            if(this.props.status_filter_value!=prevProps.status_filter_value)
            {
               if(this.props.status_filter_value)
                 {
                     this.refreshListView(true);//true passed to reset list
                 }
                  
                 }
        }
   
     }

	componentWillReceiveProps(props) {
        const { refresh } = this.props;
        if(this.props.get_default_pinned_data === false && props.refresh !== refresh) {
            if(this.props.DropListFilter){
                this.setState({filter: this.props.DropListFilter} , () => {

                    this.setState({refreshTable: !this.state.refreshTable},()=>{this.props.fetchData(this.state,false,true)})
                });
            } else {
                this.refreshListView();
            }

        }
        else if (props.refresh !== refresh) {
          this.get_default_pinned_data(this.state.filter_related_type)
        }
	}

	componentDidMount() {
        this.setEnableRenameList();
		jQuery(this.rootRef.current).parent(`.col-lg-11`).removeClass(`col-lg-11`).addClass(`col-lg-12`);
        let list_id = 0;
        document.body.className ='';
        window.current_list_id = 0;
        if (window.location.hash.length) {
            let hash = window.location.hash;
            list_id = hash.replace('#', '');
            this.addListNameToUrlHash(hash, list_id);
            window.current_list_id = list_id;
        }
        if(this.props.get_default_pinned_data !== false) {
            this.get_default_pinned_data(this.state.filter_related_type, list_id);
        }else if(this.props.get_default_pinned_data === false) {
            //this.refreshListView()
            this.setState({refreshTable: true, sorted: this.state.sorted} , () => {
                this.fetchData(this.state);
            });
        } else {
            this.refreshListView()
            this.setState({refreshTable: true, sorted: this.state.sorted} , () => {
                this.fetchData(this.state);
            });
        }

		document.body.className += 'datatablelist-view';
		//Trigger resize
		if(this.props.resizable !== false) {
			createResizableTable(document.getElementById('DataTableListView-FixedHeaders'));
        }

        //Update time info
        setInterval(() => {

            this.setState({lastUpdated: this.handleUpdatedTime(this.state.lastUpdatedValue),
                    lastUpdatedValue: this.state.lastUpdatedValue} , () => {
                this.setState({ lastUpdatedValue: this.state.lastUpdatedValue + 60});
            });

        }, 60000); //Update time every one minute
    }
    setEnableRenameList(){
        const renamedEnabledList=["11","12"];
        const deleteEnabledList=["11","12"];
        let isRenameEnabled=renamedEnabledList.includes(this.state.filter_related_type)?true:false;
        let isDeletedEnabled=deleteEnabledList.includes(this.state.filter_related_type)?true:false;
        this.setState({renameFilterEnabled:isRenameEnabled,deleteFilterEnabled:isDeletedEnabled});
    }
   

    handleUpdatedTime = (timestamp) => {
        let hours = Math.floor(timestamp / 3600);

        let minutes = Math.floor(timestamp / 60);

        if(hours > 0) {
            let str = '';
            str = (hours > 1) ? 's' : '';
            return hours + ' hour' + str;
        } else if (minutes == 1){
            return 'a minute';
        }
        else {
            return minutes + ' minutes';
        }
    }

	/**
     * To get list view controls by pinned data and fetch value to state
     * * @param {*} related_type
     */
    get_default_pinned_data = (filter_related_type, list_id = 0) => {
        this.props.get_list_view_controls_by_default_pinned(filter_related_type, list_id)
            .then(() => {
                get_list_view_default_pinned(this, this.props.list_view_control);
                if (list_id) {
                    window.location.hash = list_id;
                }
                this.props.get_list_view_controls_by_related_type(filter_related_type).then(() => {
                    get_list_view_related_type(this, this.props.list_view_control_by_related_type, this.props.page_name);
                    this.get_selectedfilter_data(this.props.list_view_control.data)
                    this.setState({showFilterOption : true}, () => {

                    });
                }).catch((error) => {
                    console.log(error);
                })
            }).catch((error) => {
                console.log(error);
            })
    }
     /**
     * To get list view controls by related type
     * * @param {*} related_type
     */
    get_list_view_related_type = (filter_related_type) => {
        this.props.get_list_view_controls_by_related_type(filter_related_type).then(() => {
            get_list_view_related_type(this, this.props.list_view_control_by_related_type, this.props.page_name);
        }).catch((error) => {
            console.log(error);
        })
    }
     /**
     * To get list view controls by id
     * @param {*} related_type, id, event
     */
    get_list_view_controls_by_id = (related_type, id, event, action) => {
        var req = { related_type: related_type, filter_list_id: id }
            this.props.get_list_view_controls_by_id(req)
            .then(() => {
                get_list_view_by_id(this, this.props.list_view_control_by_id, event);
                if(this.state.list_control_data && action!='save' && action!='pin_unpin'){
                    this.get_selectedfilter_data(this.state.list_control_data);
                    this.setState({showFilterOption : true}, () => {

                    });
                }
            })
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent(`.col-lg-12`).removeClass(`col-lg-12`).addClass(`col-lg-11`);
        window.removeEventListener("popstate", this.onBackButtonEvent);
    }

    onBackButtonEvent = (e) => {
        let hash = window.location.hash;
        if (hash.length) {
            let list_id = hash.replace('#', '', hash);
            this.get_default_pinned_data(this.state.filter_related_type, list_id);
        } else {
            window.current_list_id = "all";
            this.get_default_pinned_data(this.state.filter_related_type, "all");
        }
    }
    showselectedfilters = (type) => {
        this.setState({ showselectfilters: false, showselectedfilters: !type }, () => {
            this.is_filter_opened();
            this.tableWidthResize();
        });
	}

	handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
		this.setState({ selection: data.selection, checkedItem: selection_count });
	};

    //Resize Table width while open the filter dropdown
    tableWidthResize = () => {
        let tbl = document.getElementsByClassName("slds-table_header-fixed_scroller");

        tbl[0].classList.remove("shrink_table_width");

        if(this.state.showselectedfilters === true) {
            tbl[0].className += " shrink_table_width";
        }
    }

	//Sorting function
	handleSort = (sortColumn, ...rest) => {
		if (this.props.log) {
			this.props.log('sort')(sortColumn, ...rest);
		}
		const sortProperty = sortColumn.property;
		const { sortDirection } = sortColumn;
		const newState = {
			sortColumn: sortProperty,
			sortColumnDirection: {
				[sortProperty]: sortDirection,
			},
			items: [...this.state.items]

        };

        let sortColumnName = '';
        let displayedColumns = this.props.determine_columns();
        for (let i =0; i < displayedColumns.length; i++) {

            if(displayedColumns[i].accessor == sortColumn.property) {
                sortColumnName = displayedColumns[i]._label;
                break;
            }
        }

		// needs to work in both directions
		newState.items = newState.items.sort((a, b) => {
            if( a[sortProperty] &&  b[sortProperty]){
                if (sortDirection !== 'desc') {
                    return (a[sortProperty].toLowerCase().trim() > b[sortProperty].toLowerCase().trim()) ? 1 : -1;
                } else {
                    return (a[sortProperty].toLowerCase().trim() < b[sortProperty].toLowerCase().trim()) ? 1 : -1;
                }
            }else{
                var va = (a[sortProperty] === null) ? "" : "" + a[sortProperty],
                vb = (b[sortProperty] === null) ? "" : "" + b[sortProperty];
                if (sortDirection !== 'desc') {
                     return (va > vb) ? 1 : -1;
                } else {
                    return (va < vb) ? 1 : -1;
                }
            }

        });

		//Reset old state and then set new state
		this.setState({ items: [], sortColumnLabel: sortColumnName,lastUpdated: 'a few seconds', lastUpdatedValue: 60}, () => {
			this.setState(newState);
		});

    };

    refreshListView(reset=false) {
        this.setState({refreshTable: !this.state.refreshTable, isLoading: false},()=>{this.fetchData(this.state,reset,true)})

    }


	//Load more Data
	handleLoadMore = () => {

        if(this.state.data_ends)
        {
            return;
        }
		if (!this.state.isLoading) {
			setTimeout(() => {

				//Since Current page index starts with 0 so add +1 to skip the extra one hit
				if ((this.state.page + 1) >= this.state.pages) {
					this.setState({ hasMore: false });
					return false;
				}

				let moreItems = [];

				moreItems = this.state.items.map((item
				) => {
					const copy = { ...item };
					return copy;
				});

				this.setState({ page: this.state.page + 1, prevItems: moreItems, hasMore: this.state.page !== this.state.pages, refreshTable: true, lastUpdated: 'a few seconds', lastUpdatedValue: 60,sortColumnLabel: this.props.sortColumnLabel, sortColumn: this.props.sortColumn}, () => {
                    this.fetchData(this.state);
                    this.setState({ isLoading: false });
				});

            }, 1000);

		}
        this.setState({ isLoading: true });
	};

    /**reset param for loading from the beginning
       refresh_data param loading with the existing count
       limit_changed param to load data with exist count
    **/
	fetchData = (state,reset_data=false,refresh_data=false,limit_changed=false) => {
		if(state.sorted.length > 0 || this.state.refreshTable) {
            let tobefilterdata = JSON.parse(sessionStorage.getItem("filterarray"));
            this.setState({tobefilterdata})
			if ((state.filter_list && state.filter_list.value=='all') || (this.state.filter_list && this.state.filter_list.value=='all')) {
				tobefilterdata=false;
			}

			this.setState({
				fil_pageSize: state.pageSize,
				fil_page: state.page,
				fil_sorted: state.sorted,
				fil_filtered: state.filtered,
				isloading: true,
			});
			this.requestData(
				state,
				tobefilterdata,
                reset_data,
                refresh_data,
                limit_changed
			).then(res => {
				this.setState({
					dataRows: res.rows,
					pages: res.pages,
					isloading: true,
					noDataFlag: res.rows.length == 0 ? true : false,
                    refreshTable: false,
                    items:[],
                    totalItem: res.totalItem,
                    lastUpdated: 'a few seconds',
                    lastUpdatedValue: 60,
                    sortColumnLabel: this.props.sortColumnLabel,
                    sortColumn: this.props.sortColumn
				}, () => {
						if (this.state.page != 0) {
							this.pushPreviousRecord()
						} else {
                            let hasmore = true;
                            //Total data is less than page limit means then stop the infinite scroller
                            if(res.rows.length < this.state.pageSize) {
                                hasmore = false;
                            }

							//Set the Items state for loading data in DataTable
							this.setState({
                                items: res.rows,
                                hasMore: hasmore
							});
							//Display no record text message only on page load
							let noDataText= this.props.noDataText ? this.props.noDataText : 'No records Found';
							customNoData(this.state.noDataFlag, noDataText);
						}
					});

				if (this.props.list_api_callback) {
					this.props.list_api_callback(res);
				}
			});

		}

	}

	//Append the new page record with old record
	pushPreviousRecord() {

		let prevData = this.state.prevItems;

		const newItems = [...prevData, ...this.state.dataRows]

		//Set the Items state for loading data in DataTable on lazy loading
		this.setState({ items: newItems }, () => {
            //Scroll the table to bottom once Infinite loading is completed
            var div = document.getElementsByClassName('slds-table_header-fixed_scroller');
            div[0].scrollTop = ((div[0].scrollHeight - div[0].clientHeight) - 100);
        });

	}
    /**reset param for loading from the beginning
      refresh_data param loading with the existing count
      limit_changed param to load data with exist count
    **/
	requestData(state, tobefilterdata,reset_data=false,refresh_data=false,limit_changed=false) {
		return new Promise((resolve) => {
			// request json            
			var Request = { pageSize: state.pageSize, page: state.page, sorted: state.sorted, filtered: state.filtered, save_filter_logic: false, filter_logic: this.state.filter_logic, filter_operand_length: this.state.list_control_data.filter_operand, filter_list_id: this.state.filter_list_id };
            if (tobefilterdata) {
				Request.tobefilterdata = tobefilterdata;
			}
            //for pagination and shift list top filter
            if(this.state.filter_related_type==9){
                Request['current_shift_list'] = !refresh_data?this.state.shift_current_shift_list:1;
                Request['shift_list_current_offset']=this.state.shift_list_current_offset&&!refresh_data?this.state.shift_list_current_offset:0;
                Request['page'] = !refresh_data?this.state.shift_current_page:0;
                Request['pageSize']=!refresh_data?Request.pageSize:this.state.rows ?this.state.rows.length:Request.pageSize;
                if(reset_data)
                {  
                    let shift_list_level= this.props.status_filter_value=='inactive'?4:1;
                    Request['current_shift_list'] = shift_list_level;
                    Request['shift_list_current_offset']=0;
                    Request['page'] = 0;
                    this.setState({page:0});
                }
                Request['status_filter_value']=this.props.status_filter_value;
               if(limit_changed)
               {
                   Request['pageSize']=this.state.items.length;
               }
               Request['statusArr']=this.props.status_filter_value=='inactive'?[5,6]:this.props.status_filter_value=='active'?[1,2,3,4]:[1,2,3,4,5,6];
            }
            if (this.state.filter_related_type == 28 || this.state.filter_related_type == 34) {
                if (reset_data) {
                    Request['page'] = 0;
                    this.setState({page:0});
                }
                Request['filtered'] = {filterBy: this.props.status_filter_value, srch_box: state.filtered ? state.filtered.search : '' };
            }
            if (this.state.list_api_url === 'recruitment/RecruitmentDashboard/get_communication_log') {
                Request = {
                    filtered: {filterBy: this.props.status_filter_value, srch_box: state.filtered ? state.filtered.search : '' },
                    pageSize: state.pageSize, 
                    page: state.page, 
                    sorted: state.sorted,
                    applicant_id: this.props.applicant_id || ""
                }
                if (reset_data) {
                    Request['page'] = 0;
                    this.setState({page:0});
                }
            }
            if (state.listFromImail) {
                Request = {};
                Request['sorted'] = state.sorted;
                Request['pageSize'] = state.pageSize;
                Request['page'] = state.page;
                Request['filtered'] = {filter_template_name: this.props.status_filter_value, search_box: state.filtered ? state.filtered.search : '' };
            }
            if (state.list_api_url == 'imail/Templates/template_listing' || state.list_api_url=='imail/Automatic_email/automatic_email_listing') {
                Request = {};
                Request['sorted'] = state.sorted;
                Request['pageSize'] = state.pageSize;
                Request['page'] = state.page;
                Request['filtered'] = {filter_status: this.props.status_filter_value, search_box: state.filtered ? state.filtered.search : '' };
            }
            if (this.props.bu_id_filter_value != undefined && this.props.bu_id_filter_value != null) {
                Request['bu_id_filter_value'] = this.props.bu_id_filter_value;
            }
            
			postData(state.list_api_url, Request).then((result) => {

				if (result.status) {
					let filteredData = result.data;
                    if (state.listFromImail) {
                        var res = {
                            rows: filteredData,
                            pages: undefined,
                            totalItem: result.total_count,
                        }; 
                    } else {
                        var res = {
                            rows: filteredData,
                            pages: (result.count),
                            totalItem: result.total_item,
                        };
                    }
					
                    if(this.state.filter_related_type==9)
                    {
                        this.setState(
                            {shift_current_page:result.current_page,
                            shift_current_shift_list:result.current_shift_list,
                            shift_list_current_offset:result.offset,
                            data_ends:result.data_ends
                        })
                        if( result.data_ends)
                        {
                            this.setState({hasMore:false});
                        }
            
                    }
					resolve(res);
				} else {
					const res = {
						rows: [],
						pages: 0
					};
					resolve(res);
				}

			});

		});
	}
	submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    setTableParams = () => {
      
      let reset_data=false;
      if(!this.state.filtered||this.state.filtered.search!=this.state.search)
      {
        reset_data=true;
      }
      
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };

        this.setState({filtered: search_re, refreshTable: true, isLoading:false ,items:[], page: 0,
            lastUpdated: 'a few seconds', lastUpdatedValue: 60, sortColumnLabel: this.props.sortColumnLabel, sortColumn:this.props.sortColumn}, () =>
        { this.fetchData(this.state,reset_data)});
    }
    /**
     * To close the create or update modal
     */
    closeModal = (status) => {
        this.setState({ openCreateModal: false });

        if (status) {
            this.setState({refreshTable: true},()=>{ reFreshReactTable(this, 'fetchData');})
        }
    }
    /**
     * To send  filter_panel_display_status  to child component is filter_panel_opened
     */
    is_filter_opened=()=>
    {
      if(this.props.is_filter_panel_status&& this.state.filter_related_type==9){
         this.props.is_filter_panel_status(this.state.showselectedfilters)
      }
    }
    /**
     * To close the filter option modal
     */
    closeFilter=()=>{
        this.setState({ showselectedfilters: false }, () => {
            this.is_filter_opened();
            this.tableWidthResize();
        });
    }
    handleChangeSelectFilterValue = (key, value) => {
        if(key=='filter_logic' && value==''){
            this.setState({ default_filter_logic: ''})
        }
        this.setState({ [key]: value, filter_error_msg: '' }, () => {

        })
    }

    addListNameToUrlHash(listName, listId) {
        window.removeEventListener("popstate", this.onBackButtonEvent);
        let page_name = this.props && this.props.page_name || '';
        document.title = "Healthcare Manager " + page_name + " - " + listName;
        if (listId) {
            window.location.hash = listId;
        }
        window.addEventListener("popstate", this.onBackButtonEvent);
    }

    /**
    * On select the particular list view from list view control
    * @param {*} event
    *
    */
    onListViewChange = (e) => {
        window.removeEventListener("popstate", this.onBackButtonEvent);
        this.addListNameToUrlHash(e.label, e.value);
        window.addEventListener("popstate", this.onBackButtonEvent);
        if (e.value == 'all') {
            this.filter_list = e;
            this.setState({ filter_list:e, showFilter: false, showselectfilters: false,
                showselectedfilters: false, filter_title: this.props.filter_title, checkdefault: 'all', list_control_data: [], refreshTable: true, isLoading: false }, () => {
                    // let newState = reFreshReactDataTable(this.state);
                    let newState = { filtered: {filter_status: "all"},page: this.state.page, pageSize:this. state.pageSize,sorted: [], items: [] };
                    this.setState({newState},()=> {
                        this.fetchData(this.state,true);
                    });

                });
        } else {
            this.get_list_view_controls_by_id(this.state.filter_related_type, e.value, 'onChange','get');
            this.setState({ filter_list:e, hasMore:true});
        }
        this.setState({ showselectedfilters: false} , () =>{
            this.tableWidthResize();
        });
    }
    /**
    * fetch the filtered data
    */
    get_selectedfilter_data(f_data){
        let newState = {};
        if(f_data){
            var req = {
                tobefilterdata: f_data.filter_data ? JSON.parse(f_data.filter_data) : '', pageSize: this.state.fil_pageSize ? this.state.fil_pageSize : this.state.pageSize,
                page: this.state.fil_page ? this.state.fil_page: 0,
                filter_logic: f_data.filter_logic,
                filter_operand_length: f_data.filter_operand,
                filter_list_id: f_data.value,
                save_filter_logic: false
            };
            window.current_list_id = req.filter_list_id;
            if(f_data.filter_data){
                this.save_and_get_selectedfilter_data(req, 'get').then((res) => {
                    if (f_data.value && window.location.hash !== '#'+f_data.value) {
                        window.removeEventListener("popstate", this.onBackButtonEvent);
                        this.addListNameToUrlHash(f_data.label, f_data.value);
                        window.addEventListener("popstate", this.onBackButtonEvent);
                    }
                });
            }else {
                // let newState = reFreshReactDataTable(this.state);
                newState = { filtered: {filter_status: "all"},page: 0, pageSize: this.state.pageSize,sorted: [],items: [] };
                this.setState({refreshTable: true, isLoading: false}, ()=>{
                    this.setState({newState}, () => {
                        this.fetchData(this.state,false,true)});
                });

            }
        }else { //This will call while page load
			window.current_list_id = "all";
            if(this.props.is_any_action || f_data==null){

                // let newState = reFreshReactDataTable(this.state);
                newState = { filtered: {filter_status: "all"}, page: 0, pageSize: this.state.pageSize, sorted: [], items: [] };
				this.setState({refreshTable: true, isLoading: false}, ()=>{
                    this.setState({newState}, ()=> {
                        //This will triggered on page load
                        this.fetchData(this.state,false,true);});
                });

            }
        }


    }
    /**
    * save the selected filter logic based on related type
    */
    save_and_get_selectedfilter_data = (req, event) => {
        return new Promise((resolve) => {
            req.api=this.props.filter_api_url;
            let filter_api_url = this.props.filter_api_url || this.props.list_api_url;

            //This will trigger on first time load on list view control dropdown select, since we reset page number as 0
            req.page = 0;
      
     
            //for pagination and shift list top filter
            if(this.state.filter_related_type==9){
            
                let newDataSet=false;
                if(this.state.tobefilterdata)
                {
                    if(this.state.tobefilterdata.filter(item=>!!item).length!==req.tobefilterdata.filter(item=>!!item).length)
                    {
                        newDataSet=true;
                       
                    }
                }
                if(!newDataSet&&this.state.tobefilterdata){
                    req.tobefilterdata.forEach((value,index,arr)=>{
                       let compareResult= this.compareFilterData(this.state.tobefilterdata[index],(req.tobefilterdata[index]));
                       if (!compareResult) {
                        newDataSet=true;
                        arr.length = index + 1; // Behaves like `break`
                       }
                    })
                    
                }
                if(newDataSet)
                {
                    let shift_list_level= this.props.status_filter_value=='inactive'?4:1;
                    req['current_shift_list'] = shift_list_level;
                    req['shift_list_current_offset']=0;
                    req['page'] = 0;
                    this.setState({page:0});
                }
                else{
                    let shift_list_level= this.props.status_filter_value=='inactive'?4:1;
                    req['current_shift_list'] = shift_list_level;
                    req['shift_list_current_offset']=this.state.shift_list_current_offset?this.state.shift_list_current_offset:0;
                    req['page'] =  this.state.shift_current_page?this.state.shift_current_page:0;
                }
                 req['status_filter_value']=this.props.status_filter_value;
                 req['statusArr']=this.props.status_filter_value=='inactive'?[5,6]:this.props.status_filter_value=='active'?[1,2,3,4]:[1,2,3,4,5,6];
            } 
            if (this.state.filter_related_type==28) {
                req['filtered'] = {filterBy: this.props.status_filter_value, srch_box: this.state.filtered ? this.state.filtered.search : '' };
            }
          
            this.setState({ isloading: false}, () => {
                postData(filter_api_url, req).then((result) => {
                    if (result.status) {
                        let filteredData = result.data;

                        this.setState({tobefilterdata:req.tobefilterdata})
                        const res = {
                            rows: filteredData,
                            pages: (result.count)
                        };

                        this.setState({
                            dataRows: res.rows,
                            pages: res.pages,
                            isLoading: false,
                            showselectedfilters: false,
                            showselectfilters: false,
                            filter_error_msg:'',
                            noDataFlag: res.rows.length == 0 ? true : false,
                            refreshTable: false,
                            totalItem: result.total_item,
                            lastUpdated: 'a few seconds',
                            lastUpdatedValue: 60,
                            sortColumnLabel: this.props.sortColumnLabel,
                            sortColumn: this.props.sortColumn
                        },()=>{this.is_filter_opened()});

                        if(event == 'save'){
                            this.get_list_view_related_type(this.state.filter_related_type);
                            this.get_list_view_controls_by_id(this.state.filter_related_type,req.filter_list_id,'update','save');
                            this.tableWidthResize();
                        }
                        if(this.state.filter_related_type==9)
                        {
                            this.setState(
                                {shift_current_page:result.current_page,
                                shift_current_shift_list:result.current_shift_list,
                                shift_list_current_offset:result.offset,data_ends:result.data_ends})
                               
                        }
                        let hasmore = true;
                        //Total data is less than page limit means then stop the infinite scroller
                        if(filteredData.length < this.state.pageSize) {
                            hasmore = false;
                        }
                        if(result.data_ends)
                        {
                            hasmore = false;
                        }
                        this.setState({items: []}, () => {
                            //Set the Items state for loading data in DataTable
                            this.setState({items: res.rows, hasMore: hasmore}, () => {
                                resolve(res);
                            });
                        });
                    } else {
                        this.setState({ isLoading: false, filter_error_msg:'' });
                        if(result.error){
                            if (result.msg && result.msg == 'filter_error') {
                                this.setState({ isLoading: false, filter_error_msg:result.error, refresh_filters: !this.state.refresh_filters });
                            }else{

                                toastMessageShow(result.error, "e");
                            }
                        }else {
                            const res = {
                                rows: [],
                                pages: 0
                            };
                            resolve(res);
                        }
                    }
                    //Display no record text message only on page load
                    let noDataText= this.props.noDataText ? this.props.noDataText : 'No records Found';
                    customNoData(this.state.noDataFlag, noDataText);
                });
            });
        });
    }
    /**
    *  To compare two objects
    */
    compareFilterData=(object1,object2)=>{
      const keys1 = Object.keys(object1);
      const keys2 = Object.keys(object2);
      if (keys1.length !== keys2.length) {
      return false;
      }
     for (let key of keys1) {
      if (object1[key] !== object2[key]) {
       return false;
     }
     }
     return true;
    }
     /**
    *  To Recall Response with existing Data count as limit
    */
    refreshShiftSort=()=>{    
       this.setState({refreshTable:true},()=>{
        this.fetchData(this.state,true,false,true);
       })
    }
    /**
    * Datatable Row action helper function
    */
    handleRowAction = (item, action) => {
        this.props.showModal(item, action.key);
    }
    /**
    * Fetch the common header filter
    */
    get_common_header_filter(){
        return (
            <CommonDataTableHeaderFilter
                {...this.state}
                {...this.props}
                removeselectfilter={this.state.removeselectfilter}
                showselectedfilters={this.state.showselectedfilters}
                closeFilter={this.closeFilter}
                get_list_view_related_type={this.get_list_view_related_type}
                save_and_get_selectedfilter_data={(req, action) => this.save_and_get_selectedfilter_data(req, action)}
                filter_error_msg={this.state.filter_error_msg}
                filter_logic={this.state.filter_logic}
                filter_related_type={this.state.filter_related_type}
                refresh_filters={this.state.refresh_filters}

            />
        )
    }   

    showListFilterOptions = () => {
        return (
            <React.Fragment>
                {this.state.showFilter ? <button onClick={() => this.showselectedfilters(this.state.showselectedfilters)} className="slds-button slds-button_icon-more ignore-click-lWJnKo2QxH" tabIndex="0" title="Filter by status" type="button" aria-expanded="false" aria-haspopup="true">
                    <svg aria-hidden="true" className="slds-button__icon">
                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#filterList"></use>
                    </svg>
                    <svg aria-hidden="true" className="slds-button__icon slds-button__icon_x-small">
                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#down">
                        </use>
                    </svg>
                    <span className="slds-assistive-text">Filter</span>
                </button> : <Button
                    title={`Filter`}
                    assistiveText={{ icon: 'Filter' }}
                    iconCategory="utility"
                    iconName="filterList"
                    iconVariant="border-filled"
                    variant="icon"
                    disabled={true}
                />}
            </React.Fragment>
        )
    }

    returnLabel = () => {
        return (
            <React.Fragment>
                {this.props.get_default_pinned_data !== false ? <span>{this.props.page_name}</span>  : <span/>}
            </React.Fragment>
        )
    }

    showShiftWarnings=()=>{
      this.setState({'showWarnings':true})
    }
    hideShiftWarnings=()=>{
        this.setState({'showWarnings':false})
    }


    /**
     * 
     * @param {*} item cell data calling parent method for handling cell click
     */
    QuestionIdClick=(item)=>{
        if(this.state.filter_related_type==32)
        {
           this.props.editQuestion(item);
        }
       
    }
    shiftWarningPopup=()=>{

        
            return(
                <div id="shift-warning-popup"  style={{ position: 'absolute', left: 100+'px',top: 15+'px' , width:27+'px'}}>SHIFT</div>
            )
        
       return <></>
    }

    openViewModal(item) {
        if(this.state.listToOpenModal) {
            this.props.opencloseModal(item);
        }
    }

	render() {
		//Get the columns
		const columns = this.props.determine_columns();
		const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0)
		let newcolumns = [];
        const mapColumnsToOptions = [];
        // count selected
        let checkItemLabel = '';
        if (this.props.checkedItem && this.props.checkedItem > 0) {
            let str_checked = this.props.checkedItem < 2 ? ' Item selected' : ' Items selected';
            checkItemLabel = '• '+ this.props.checkedItem + str_checked;
        }
        if (this.state.checkedItem && this.state.checkedItem > 0) {
            let str_checked = this.state.checkedItem < 2 ? ' Item selected' : ' Items selected';
            checkItemLabel = '• '+ this.state.checkedItem + str_checked;
        }

		for (let i = 0; i < displayedColumns.length; i++) {
            //Disable Business unit coloumn from BU listing page
            if((this.props.is_bu_super_admin !== undefined && !this.props.is_bu_super_admin) && displayedColumns[i].accessor == 'business_unit_name') {
                continue;
            }
            //Form the table td columns as per DataTable format
            newcolumns.push(
                <DataTableColumn
					key={displayedColumns[i].accessor}
                    label={displayedColumns[i]._label}
                    header={displayedColumns[i]._label}
					property={displayedColumns[i].accessor}
                    isSorted={this.state.sortColumn === displayedColumns[i].id}
					sortable={displayedColumns[i].sortable === false ? false : true}
                    CustomUrl={displayedColumns[i].CustomUrl}
                    customFunc={this.props.customFunc}
                    multipleCustomUrl={displayedColumns[i].multipleCustomUrl}
                    CustomDateFormat={displayedColumns[i].CustomDateFormat}
                    customIcon={displayedColumns[i].customIcon}
                    actionList={displayedColumns[i].actionList}
                    showModal={this.props.showModal}
                    width={displayedColumns[i].width ? displayedColumns[i].width : ''}
                    callback={displayedColumns[i].callback}
                    Title={displayedColumns[i].Title}
                    Component={displayedColumns[i].Component}
                    CustomShiftErrorNote={displayedColumns[i].CustomShiftErrorNote}
                    WithoutTruncate={displayedColumns[i].WithoutTruncate}                    
                >
					{/* For doing col data customization we should use CustomDataTableCell */}
					<CustomDataTableCell parent={this.props.parent} showShiftWarnings={this.showShiftWarnings} from ={this.state.listToOpenModal} openViewModal ={(item)=>{this.openViewModal(item)}}  filter_related_type ={this.state.filter_related_type} QuestionIdClick ={(item)=>{this.QuestionIdClick(item)}} hideShiftWarnings ={this.hideShiftWarnings}shiftWarningPopup={this.shiftWarningPopup}/>
				</DataTableColumn>);

        }

		return (
            <div className={this.props.selectRows ? '': 'wocheckbox'}>
			<div className="slds" id="listViewDiv" ref={this.rootRef}
				style={{
					height: 'calc(100vh - 280px)',
					fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
				}}
			>
				<IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            icon={ this.props.get_default_pinned_data === false ? <Icon
                                category="standard" name = {this.props.header_icon} title={this.props.page_name}
                                style={this.props.icon_style || {
                                    backgroundColor: '#ea7600',
                                    fill: '#ffffff',
                                }}/> :
                                <Icon
                                    assistiveText={{
                                        label: this.props.page_name,
                                    }}
                                    category="standard"
                                    name={this.props.header_icon || "opportunity"}
                                    style={this.props.icon_style || {
                                        backgroundColor: '#ea7600',
                                        fill: '#ffffff',
                                    }}
                                    title={this.props.page_name}
                                />
                            }
                            info=  {this.props.is_header_info === false ? "" : `${this.state.totalItem !== undefined ? this.state.totalItem : 0 } items • Sorted by ${this.state.sortColumnLabel} • Filtered by ${this.state.filter_title} • Updated ${this.state.lastUpdated} ago ${checkItemLabel} `}
                            label={this.returnLabel()}
                            //Fetch the common list view controls pin and unpin modal
                            nameSwitcherDropdown={ this.props.get_default_pinned_data !== false ?
                                <CommonHeaderListViewControls
                                filter_list_id={this.state.filter_list_id}
                                list_control_option={this.state.list_control_option}
                                onListViewChange={(e) => this.onListViewChange(e)}
                                get_list_view_controls_by_id={this.get_list_view_controls_by_id}
                                filter_related_type={this.state.filter_related_type}
                                get_default_pinned_data={(related_type) => this.get_default_pinned_data(related_type)}
                                filter_title={this.state.filter_title}
                                is_any_data_pinned={this.state.is_any_data_pinned || false}
                                pinned_id={this.state.pinned_id}
                                checkdefault={this.state.checkdefault}
                                /> : ''
                            }
                            onRenderActions={() => {
                                return this.props.on_render_actions()
                            }
                            }
                            onRenderControls={() => {
                                return (
                                    <React.Fragment>
                                      {this.state.filter_related_type==9&&( <PageHeaderControl>
                                        <Button
                                         title={`Refresh`}
                                       assistiveText={{ icon: 'Refresh' }}
                                       iconCategory="utility"
                                        iconName="refresh"
                                        variant="icon"
                                        iconSize="medium"
                                        onClick={()=>this.refreshShiftSort()}
                                        iconVariant="border-filled"
                                           />
                                             </PageHeaderControl>)}
                                        <PageHeaderControl>
                                        
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
                                                    id="ListContact-search-1"
                                                    placeholder={`Search ${this.props.page_name}`}
                                                />
                                            </form>
                                        </PageHeaderControl>
                                        <PageHeaderControl>
                                        {/* Fetch the common list view vontrols */}
                                            {this.props.is_list_view_control !== false ? <ListViewControls
                                            get_default_pinned_data={this.get_default_pinned_data}
                                            get_list_view_controls_by_id ={this.get_list_view_controls_by_id}
                                            get_list_view_related_type={this.get_list_view_related_type}
                                            {...this.state}
                                            addListNameToUrlHash={this.addListNameToUrlHash}
                                            onBackButtonEvent={this.onBackButtonEvent}
                                            get_default_pinned_data={this.get_default_pinned_data}
                                            renameFilterEnabled={this.state.renameFilterEnabled}
                                            deleteFilterEnabled={this.state.deleteFilterEnabled}
                                            /> : ''}
                                        </PageHeaderControl>
                                        <PageHeaderControl>
                                            {
                                                (() => {
                                                    columns.map(col =>{
                                                        if(col._label && (this.props.is_bu_super_admin == undefined || (this.props.is_bu_super_admin !== undefined && !this.props.is_bu_super_admin) && col.accessor != 'business_unit_name')){
                                                            mapColumnsToOptions.push({
                                                                value: 'id' in col ? col.id : col.accessor,
                                                                label: col._label,
                                                            })
                                                        }
                                                    }
                                                    )
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
                                                            onSelect={option => {
                                                                const value = option.value

                                                                let cols = [...this.state.displayed_columns]
                                                                if (cols.indexOf(value) >= 0) {
                                                                    cols = cols.filter(col => col !== value)
                                                                } else {
                                                                    cols = [...this.state.displayed_columns, value]
                                                                }

                                                                this.setState({ displayed_columns: cols,lastUpdated: 'a few seconds',
                                                                    lastUpdatedValue: 60, sortColumnLabel: this.props.sortColumnLabel, sortColumn:this.props.sortColumn })
                                                            }}
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
                                                })()
                                            }
                                        </PageHeaderControl>

                                        <PageHeaderControl>
                                        {this.props.show_filter_icon==false ? this.props.default_status_filter: this.showListFilterOptions()  }


                                        </PageHeaderControl>
                                         {this.state.showselectedfilters &&
                                            <PageHeaderControl>
                                                {this.get_common_header_filter()}
                                            </PageHeaderControl>
                                        }
                                    </React.Fragment>

                                )
                            }}
                            title={this.props.get_default_pinned_data !== false ? this.state.filter_title : this.props.page_name}
                            truncate
                            variant="object-home"
                            buttonIcon={
                                <Button
                                    title={`To unpin, pin another list view`}
                                    iconCategory="utility"
                                    iconName="pinned"
                                    variant="icon"
                                    iconSize="large"
                                />
                            }
                            trail={this.props.trail || false}
                        />

					<DataTable
						assistiveText={{
							actionsHeader: 'actions',
							columnSort: 'sort this column',
							columnSortedAscending: 'asc',
							columnSortedDescending: 'desc',
							selectAllRows: 'Select all rows',
							selectRow: 'Select this row',
						}}
						columnBordered={this.props.columnBordered ? this.props.columnBordered : false}
						fixedHeader={this.props.fixedHeader ? this.props.fixedHeader : true}
						fixedLayout={this.props.fixedLayout ? this.props.fixedLayout : true}
						items={this.state.items}
						id="DataTableListView-FixedHeaders"
						onRowChange={this.props.selectionHandleChange?this.props.selectionHandleChange:this.handleChanged}
						onSort={this.handleSort}
						selection={this.props.selection}
						selectRows={this.props.selectRows ? this.props.selectRows : false}
                        hasMore={this.state.items.length > 0 ? this.state.hasMore : false}
						onLoadMore={this.handleLoadMore}
                        loadMoreOffset={this.props.loadMoreOffset ? this.props.loadMoreOffset : 20}
                        key="DataTableListView-FixedHeaders"
					>
						{/* Render Table columns */}
						{newcolumns}

					</DataTable>

				</IconSettings>
                </div>
			</div>
		);
	}
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({

    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
    list_view_control: state.ListViewControlActivityReducer.list_view_control,
    loading: state.ListViewControlActivityReducer.activity_loading,
    list_view_control_by_related_type: state.ListViewControlActivityReducer.list_view_control_by_related_type,
    list_view_control_by_id: state.ListViewControlActivityReducer.list_view_control_by_id,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_list_view_controls_by_default_pinned: (request, list_id) => dispatch(get_list_view_controls_by_default_pinned(request, list_id)),
        get_list_view_controls_by_related_type: (request) => dispatch(get_list_view_controls_by_related_type(request)),
        get_list_view_controls_by_id: (request) => dispatch(get_list_view_controls_by_id(request)),
        setKeyValue: (request) => dispatch(setKeyValue(request)),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(DataTableListView);