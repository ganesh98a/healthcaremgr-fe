import React, { Component } from 'react';
import jQuery from 'jquery';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


import {IconSettings,PageHeader, PageHeaderControl,Icon,Dropdown,DropdownTrigger,Input,InputIcon, Button} from '@salesforce/design-system-react'
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'

import { postData, reFreshReactTable, toastMessageShow, css } from '../../services/common.js';
import { get_list_view_default_pinned, get_list_view_related_type, get_list_view_by_id} from '../../services/common_filter';

import ListViewControls from './ListViewControls';
import CommonHeaderListViewControls from './CommonHeaderListViewControls';
import CommonHeaderFilter from './CommonHeaderFilter';
import { get_list_view_controls_by_default_pinned,get_list_view_controls_by_related_type, get_list_view_controls_by_id, setKeyValue } from './actions/ListViewAction'

const listControlOption = [
    { label: 'LIST VIEW CONTROLS', type: 'header' },
    { label: 'All', value: 'all' },
];

class ListView extends Component {

    constructor(props) {
        sessionStorage.removeItem('filterarray');
        super();
        let listViewRelatedType = this.listViewRelatedType();
        this.state = {
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
			refreshTable: false
        }
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
            shift: '9',
            participant: '10',
            application: '11'
        };
    }

    requestData(pageSize, page, sorted, filtered, tobefilterdata) {

        return new Promise((resolve) => {
            // request json
            var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, save_filter_logic: false, filter_logic: this.state.filter_logic, filter_operand_length: this.state.list_control_data.filter_operand, filter_list_id: this.state.filter_list_id };
            if (tobefilterdata) {
                Request.tobefilterdata = tobefilterdata;
            }
            postData(this.props.list_api_url, Request).then((result) => {
                if (result.status) {
                    let filteredData = result.data;
                    const res = {
                        rows: filteredData,
                        pages: (result.count)
                    };
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

    componentWillReceiveProps(props) {
        const { refresh } = this.props;
        if (props.refresh !== refresh) {
          this.get_default_pinned_data(this.state.filter_related_type)
        }
    }

    componentDidMount() {
        jQuery(this.rootRef.current).parent(`.col-lg-11`).removeClass(`col-lg-11`).addClass(`col-lg-12`);
        let list_id = 0;
        window.current_list_id = 0;
        if (window.location.hash.length) {
            let hash = window.location.hash;
            list_id = hash.replace('#', '');
            this.addListNameToUrlHash(hash, list_id);
            window.current_list_id = list_id;
        }
        this.get_default_pinned_data(this.state.filter_related_type, list_id);
    }
    /**
     * To get list view controls by pinned data and fetch value to state
     * * @param {*} related_type
     */
    get_default_pinned_data = (filter_related_type, list_id = 0) => {
        this.props.get_list_view_controls_by_default_pinned(filter_related_type, list_id)
            .then(() => {
                get_list_view_default_pinned(this, this.props.list_view_control);
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
            if (list_id != window.current_list_id ) { //this represents window object in this case
                this.get_default_pinned_data(this.state.filter_related_type, list_id);
            }
        } else {
            window.current_list_id = "all";
            this.get_default_pinned_data(this.state.filter_related_type, "all");
        }
    }
    showselectedfilters = (type) => {
        this.setState({ showselectfilters: false, showselectedfilters: !type });
    }
    fetchData = (state) => {
        if(state.sorted.length > 0 || this.state.refreshTable){
            let tobefilterdata = JSON.parse(sessionStorage.getItem("filterarray"));
        if ((state.filter_list && state.filter_list.value=='all') || (this.state.filter_list && this.state.filter_list.value=='all')) {
            tobefilterdata=false;
        }
        this.setState({
            fil_pageSize: state.pageSize,
            fil_page: state.page,
            fil_sorted: state.sorted,
            fil_filtered: state.filtered,
            loading: true
        });
        this.requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            tobefilterdata
        ).then(res => {
            this.setState({
                dataRows: res.rows,
                pages: res.pages,
                loading: false,
                refreshTable: false
            });
            if (this.props.list_api_callback) {
                this.props.list_api_callback(res);
            }
        });
        }
        
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re, refreshTable: true});
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
     * To close the filter option modal
     */
    closeFilter=()=>{
        this.setState({ showselectedfilters: false });
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
        let href = window.location.href;
        let hash = window.location.hash;
        let new_href = href;
        if (hash.length) {
            new_href = href.replace(hash, `#${listId}`);
            window.location.href = new_href;
        } else {
            window.location.href = new_href + '#' + listId;
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
                showselectedfilters: false, filter_title: this.props.filter_title, checkdefault: 'all', list_control_data: [], refreshTable: true }, () => {
                    reFreshReactTable(this, 'fetchData');});
        } else {
            this.get_list_view_controls_by_id(this.state.filter_related_type, e.value, 'onChange','get'); 
            this.setState({ filter_list:e});
        }        
    }
    /**
    * fetch the filtered data
    */
    get_selectedfilter_data(f_data){
        if(f_data){
            var req = {
                tobefilterdata: f_data.filter_data ? JSON.parse(f_data.filter_data) : '', pageSize: this.state.fil_pageSize ? this.state.fil_pageSize : 9999,
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
            }else{
                this.setState({refreshTable: true},()=>{ reFreshReactTable(this, 'fetchData');})
               
            }
        }else{
            window.current_list_id = "all";
			if(this.props.is_any_action || f_data==null){
                this.setState({refreshTable: true},()=>{ reFreshReactTable(this, 'fetchData');})
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
            this.setState({ loading: true });
            postData(filter_api_url, req).then((result) => {
                if (result.status) {
                    let filteredData = result.data;
                    const res = {
                        rows: filteredData,
                        pages: (result.count)
                    };
                    this.setState({
                        dataRows: res.rows,
                        pages: res.pages,
                        loading: false,
                        showselectedfilters: false,
                        showselectfilters: false,
                        filter_error_msg:'',
                    });
                    if(event == 'save'){
                        this.get_list_view_related_type(this.state.filter_related_type);
                        this.get_list_view_controls_by_id(this.state.filter_related_type,req.filter_list_id,'update','save');
                    }
                    resolve(res);
                } else {
                    this.setState({ loading: false, filter_error_msg:'' });
                    if(result.error){
                        if (result.msg && result.msg == 'filter_error') {
                            this.setState({ loading: false, filter_error_msg:result.error, refresh_filters: !this.state.refresh_filters });
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
            });
        });
    }
    /**
    * Fetch the common header filter
    */
    get_common_header_filter(){
        return (
            <CommonHeaderFilter
                {...this.state}
                {...this.props}
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

    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.props.determine_columns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0)

        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            icon={
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
                            label={this.props.page_name}
                            //Fetch the common list view controls pin and unpin modal
                            nameSwitcherDropdown={
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
                                />
                            }
                            onRenderActions={() => {
                                return this.props.on_render_actions()
                            }
                            }
                            onRenderControls={() => {
                                return (
                                    <React.Fragment>
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
                                            {<ListViewControls
                                            get_default_pinned_data={this.get_default_pinned_data}
                                            get_list_view_controls_by_id ={this.get_list_view_controls_by_id}
                                            get_list_view_related_type={this.get_list_view_related_type}
                                            {...this.state}
                                            addListNameToUrlHash={this.addListNameToUrlHash}
                                            onBackButtonEvent={this.onBackButtonEvent}
                                            />}
                                        </PageHeaderControl>
                                        <PageHeaderControl>
                                            {
                                                (() => {
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
                                                            onSelect={option => {
                                                                const value = option.value

                                                                let cols = [...this.state.displayed_columns]
                                                                if (cols.indexOf(value) >= 0) {
                                                                    cols = cols.filter(col => col !== value)
                                                                } else {
                                                                    cols = [...this.state.displayed_columns, value]
                                                                }

                                                                this.setState({ displayed_columns: cols })
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
                                        </PageHeaderControl>
                                         {this.state.showselectedfilters &&
                                            <PageHeaderControl>
                                                {this.get_common_header_filter()}
                                            </PageHeaderControl>
                                        }
                                    </React.Fragment>

                                )
                            }}
                            title={this.state.filter_title}
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
                        />

                        <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.props.ref || this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={(e) => this.fetchData(e)}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayedColumns}
                            data={this.state.dataRows}
                            defaultPageSize={9999}
                            minRows={1}
                            selection={[]}
						    selectRows="checkbox"
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No records Found"
                            collapseOnDataChange={true}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            sortable
                            resizable
                        />
                    </IconSettings>
                </div>
            </React.Fragment>
        )
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListView);