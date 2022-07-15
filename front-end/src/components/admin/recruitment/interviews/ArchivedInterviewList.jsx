import { Button, PageHeaderControl } from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import jQuery from 'jquery';
import queryString from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import 'react-table/react-table.css';
import { AjaxConfirm } from 'service/common';
import { checkLoginWithReturnTrueFalse, css, getPermission, postData, toastMessageShow } from 'service/common.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import ViewTemplate from '../../imail/templates/ViewTemplate';
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx';

const selectInterviewFilterOptions = [
    { field: "title", label: "Title", value: "Title", order: "1" },
    { field: "interview_start_datetime", label: "Start Date", value: "Start Date", order: "2" },
    { field: "interview_end_datetime", label: "End Date", value: "End Date", order: "3" },
    { field: "location", label: "Location", value: "Location", order: "4" },
    { field: "interview_type", label: "About", value: "About", order: "5" },
    { field: "owner_name", label: "Owner", value: "Owner", order: "6" },
    { field: "max_applicant", label: "Max Applicant", value: "Max Applicant", order: "7" },
    { field: "invite_type", label: "Invite Type", value: "Invite Type", order: "8" },
]


class ArchivedInterviewList extends React.Component {

      /**
     * default displayed columns in the listing
     */
       static defaultProps = {
        displayed_columns: {
            "title": true,
            "interview_start_datetime": true,
            "interview_end_datetime": true,
            "location": true,
            "interview_type": true,
            "owner_name": true,
            "max_applicant": true,
            "invite_type_name": true,            
            "created": true,
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            filter_panel_display_status: false,
            selection:[],
            row_selections:[],
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.rootRef = React.createRef();
        this.reactTable = React.createRef();
    }

    componentWillMount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }
       /*
     * method runs after the component output has been rendered to the DOM
     */
   componentDidMount() {       
    jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    restoreArchived = () => {
        let rowselections = [...this.state.row_selections];
        if (this.state.row_selections) {
            let heading_title='Restore Group Booking'
            let is_content_change = this.state.row_selections.length > 1? 'records?':'record?';
            let content= 'Are you sure you want to restore the selected '+ is_content_change ;
            let  api_url = 'recruitment/RecruitmentInterview/rollback_archived_interviews';
            AjaxConfirm({ id: '',isBulkRetrieve:true,retrieve_archive_id_list:rowselections }, 
                content, api_url, { confirm: 'Yes', heading_title,cancel:'No'}).
                then(result => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    this.refreshListView();
                    this.resetSelection();
                } else {
                    if (result.error) {
                        toastMessageShow(result.error, "e");
                    }
                }
            })

        }
    }
    /**
     * setting the column headers in the listing table
     */
     determineColumns() {
        return [
            {
                _label: 'Title',
                accessor: "title",
                id: 'title',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/interview_details/PARAM1'},
                {param: ['interview_id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Start Date',
                accessor: "interview_start_datetime",
                id: 'interview_start_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'End Date',
                accessor: "interview_end_datetime",
                id: 'interview_end_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Location',
                accessor: "location",
                id: 'location'
            },
            {
                _label: 'About',
                accessor: "interview_type",
                id: 'interview_type',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Owner',
                accessor: "owner_name",
                id: 'owner_name',
            },
            {
                _label: 'Max Applicant',
                accessor: "max_applicant",
                id: 'max_applicant',
            },
            {
                _label: 'Invite Type',
                accessor: "invite_type_name",
                id: 'invite_type_name',
            },            
        ]
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>

                <PageHeaderControl>
                  {/*   <Button id="btn-new" label="Bulk Restore" onClick={e => this.restoreArchived()} /> */}
                    <button 
                    disabled={this.state.row_selections.length > 0 ? false :true}
                       className="slds-button slds-button_brand slds-path__mark-complete" onClick={e => this.restoreArchived() } title={`Restore`}>
                          <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                           <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#undo"></use>
                      </svg>Bulk Restore</button>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    is_filter_panel_status = (filter_panel_display_status) => {
        this.setState({ filter_panel_display_status });
    }

    refreshListView() {
        this.setState({ refreshListView: !this.state.refreshListView })
    }

    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection: [], row_selections: [] ,checkedItem:0});
    }

    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
        this.setState({ selection: data.selection, checkedItem: selection_count }, (e) => {
            this.handleCheckboxSelect(e);
        });
    };
    /**
     * when checkboxes are clicked inside the data table
     */
   handleCheckboxSelect = (e) => {
    let data = this.state.selection;
    let tempArr = [];
    for (let i = 0; i < data.length; i++) {
        tempArr.push(data[i].interview_id);
    }
    this.setState({row_selections: tempArr});
    }

    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        return (

            <React.Fragment>
                <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                      page_name="Archived Group Booking"
                      header_icon="people"
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            selectInterviewFilterOptions
                        }
                        list_api_url="recruitment/RecruitmentInterview/archived_interview_list"
                        related_type="interviews"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="All Archived Group Booking"
                        show_filter={false}
                        check_default="all"
                        is_any_data_pinned={false}
                        determine_columns={() => this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        selectRows="checkbox"
                        sortColumnLabel="Group Booking Id"
                        sortColumn="interview_id"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        checkedItem={this.state.checkedItem}
                        get_default_pinned_data={false}
                        is_list_view_control={false}
                        show_filter_icon={false}
                        is_header_info={true}
                        showModal={this.showModal}
                        trail = {[
                            <Link to={ROUTER_PATH + `admin/recruitment/interview`} 
                            className="default-underlined slds-truncate" style={{ color: '#0070d2',fontSize:16+'px' }}>
                            Group Booking
                            </Link>,
                        <Link to={ROUTER_PATH + `admin/recruitment/interview/archived/` } 
                      className="default-underlined slds-truncate" 
                        style={{ color: '#0070d2',fontSize:16+'px' }}>Archived</Link>
                        ]}
                    />
                </div>
            </React.Fragment>

        );
    }
}




export default ArchivedInterviewList;