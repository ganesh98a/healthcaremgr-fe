import React, { Fragment,useState } from 'react';
import jQuery from 'jquery';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { connect } from 'react-redux';
import moment from "moment";

import { DataTableColumn, DataTableCell, PageHeader, PageHeaderControl, Icon, Dropdown, DropdownTrigger, Input, InputIcon, Button, DataTableRowActions } from '@salesforce/design-system-react'
import DataTable from '../../salesforce/components/data-table';
import { css } from '../../services/common.js';


import { IconSettings } from '@salesforce/design-system-react';

import '../../salesforce/scss/react-data-table.scss'
import { min } from 'moment';
import { getDataListById } from '../../../actions/CommonAction.js';
import { Link, Redirect } from 'react-router-dom';


/** To Customize data table column record */
const CustomDataTableCell = ({ children, ...props }) => {
    let link, dynamicProp, warningIcon,shiftWarningPopup = '';
    const [shiftWarnStatus,setShiftWarnStatus]=useState(false);
    //Note should pass the props like 'CustomDateFormat' in <DataTableColumn>
    if (props.CustomDateFormat !== undefined) {
        if (!children) {
            return <DataTableCell title={children} {...props}>
                <span className="vcenter slds-truncate"></span>
            </DataTableCell>
        }

        const dateMoment = moment(children)
        if (!dateMoment.isValid()) {
            return <DataTableCell title={children} {...props}>
                <span className="vcenter slds-truncate"></span>
            </DataTableCell>
        }

        children = moment(children).format(props.CustomDateFormat);
        return (
            <DataTableCell title={children} {...props}>
                <span className="vcenter slds-truncate">{children}</span>
            </DataTableCell>
        )

    }    
    /*
    * Here we generate the Custom link using ...props, this props contains both <Datatable> and <Datacolumns> data's
    * For doing any other customization we can console props(console.log(props)) and then we can do the customization	*
    */
    else if (props.CustomUrl !== undefined) {
        for (let i = 0; i <= props.CustomUrl.length; i++) {
            
            if (props.CustomUrl[i] && props.CustomUrl[i].url !== undefined) {
                link = props.CustomUrl[i].url;
                continue;
            }
            else if(props.CustomUrl[i].custom_value !== undefined && props.CustomUrl[i].custom_value === 'shift_no') {
                 
                if(props.item.account_type == 1 && props.item.role_name == 'NDIS' && props.item.warnings.is_warnable == 1) {                    
                    warningIcon = <span onMouseEnter={(e)=>{setShiftWarnStatus(true)}} onMouseLeave={(e)=>{setShiftWarnStatus(false)}}><Icon category="utility" name="warning"  title={props.item.shift_no}size="x-small" style={{'margin':5+'px','fill':'#eed202'}} /></span>
                }
                if(props.item.account_type == 1 && props.item.role_name == 'NDIS' && props.item.warnings.is_warnable == 1)
                {
                    if(shiftWarnStatus)
                    {
                        shiftWarningPopup=
                     <section aria-label="Dialog title" aria-describedby="popover-body-id" class="slds-popover slds-nubbin_top-left" role="dialog" 
                           style={{zIndex:1, position: 'absolute', left: 86+'px',top: 38+'px' , width:370+'px'}}>
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
            if (props.CustomUrl[i].param !== undefined) {
                let id = 1;
                for (let j = 0; j < props.CustomUrl[i].param.length; j++) {
                    /**
                     * Get the dynamic params from parent page "[props.CustomUrl[i].param[i]]"
                     * this will helps to get the dynamic id. Based on the 'PARAM' we will replace and generate
                     * the URL
                     * */
                    dynamicProp = props.item[props.CustomUrl[i].param[j]];
                    link = link.replace('PARAM' + (id + j), dynamicProp);
                }
                
                if (props.bgForRow !== undefined && props.item.public_confidential_note == '2') {
                    return (
                        <DataTableCell title={children} {...props} className='active-bg'>
                            <Link
                                to={link} class='vcenter default-underlined slds-truncate' style={{ color: '#0070d2' }}
                            >
                                {children}
                            </Link>
                        </DataTableCell>
                    )
                }else if(props.header ==='Online Assessment Status' && props.related_type == "application"  && (children=='Submitted' || children && children.includes('Completed'))){
                    return (
                        <DataTableCell title={children} {...props}>
                             <a href = {link} target = "_blank" class='vcenter default-underlined slds-truncate' style={{ color: '#0070d2' }}>
                                {children}
                             </a>
                        </DataTableCell>
                    )
                } else if(props.header ==='Online Assessment Status' && props.related_type == "application"  && (children=='In progress' || children=='Sent' || children=='Error' || children=='Link Expired' || children == 'Moodle')){
                    return (
                        <DataTableCell title={children} {...props}>                           
                                <span style={{ color : children ==='Error' ? 'Red' : '' }}> {children}</span>                               
                        </DataTableCell>
                    )
                }else if (props.header === 'Application Id' && props.related_type == "application") {
                    //showing red icon for unsuccessfull applications      
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
                } else {
                    return (
                        <DataTableCell title={children} {...props}>
                             <Link
                                to={link} class='vcenter default-underlined slds-truncate' style={{ color: '#0070d2' }}
                            >
                                {children}
                            </Link>
                            {warningIcon}{shiftWarningPopup}
                        </DataTableCell>
                    )
                }

            }
        }
    } else if (props.property !== undefined && props.property === 'actions') {
        let disabled = false;
        let actionList = props.actionList;

        if (props.item.is_shift_locked) {
            disabled = true;
        } else if (props.item.interview_stage_status == 3 || props.item.interview_stage_status == 4) {
            disabled = true;
        } else if (props.item.interview_stage_status > 0) {
            actionList.forEach(interview => {
                if (interview.key == 'delete') {
                    interview['disabled'] = true;
                }
            });
        }
        //apply callback on action items
        if (props.callback) {
            actionList = props.callback(actionList, props.item);
        }
        return (<DataTableCell className="dt-action-dropdown" title={" "}>
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
    else if (props.bgForRow !== undefined) {

        return (
            props.item.public_confidential_note == '2' ? <DataTableCell title={children} {...props} className='active-bg'>
                {children}
            </DataTableCell> : <DataTableCell title={children} {...props}>

                {children}
            </DataTableCell>
        )

    }
    else {
        return <DataTableCell title={children} {...props}>{children}</DataTableCell>;
    }
}

CustomDataTableCell.displayName = DataTableCell.displayName;

//Resize table columns
const createResizableTable = function (table) {
    const cols = table.querySelectorAll('th');
    [].forEach.call(cols, function (col) {
        // Add a resizer element to the column
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        col.appendChild(resizer);
        createResizableColumn(col, resizer);
    });
};

const createResizableColumn = function (col, resizer) {
    let x = 0;
    let w = 0;
    const mouseDownHandler = function (e) {
        x = e.clientX;

        const styles = window.getComputedStyle(col);
        w = parseInt(styles.width, 10);

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        resizer.classList.add('resizing');
    };

    const mouseMoveHandler = function (e) {
        const dx = e.clientX - x;
        col.style.width = `${w + dx}px`;
    };

    const mouseUpHandler = function () {
        resizer.classList.remove('resizing');
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
};

//Display No Record found
const customNoData = function (status, noDataText) {
    let noData = document.getElementById('dt-noData')

    //Remove old Text
    if (noData) {
        noData.innerHTML = '';
    }

    if (status === true) {
        document.getElementById("DataTableListView-FixedHeaders").insertAdjacentHTML('afterend', '<div id="dt-noData">' + noDataText + '</div>');
        document.body.style.overflow = "inherit";
        return;
    } else {
        document.getElementById("DataTableListView-FixedHeaders").insertAdjacentHTML('afterend', '<div id="dt-noData"></div>');
        document.body.style.overflow = "inherit";
    }
}

class DataTableListQuickFilter extends React.Component {
    static displayName = 'DataTableListView';
    constructor(props) {
        super();
        this.state = {
            search: '',
            refreshTable: props.refresh,
            isLoading: false,
            items: [],
            displayed_columns: props.displayed_columns,
            default_displayed_columns: props.default_displayed_columns,
            selection: [],
            hasMore: true,
            list_api_url: props.list_api_url,
            pageSize: props.pageSize ? props.pageSize : 20,
            page: props.page ? props.page : 0,
            pages: 0,
            sorted: [],
            filtered: props.filtered,
            noDataFlag: false,
            totalItem: 0,
            searchVal: '',
            filterVal: '',
            dataRows: [],
            page_name: props.page_name ? props.page_name : '',
        };
        this.rootRef = React.createRef();
    }

    componentDidMount() {
        //Display no record text message only on page load
        let noDataText = this.props.noDataText ? this.props.noDataText : 'No records Found';
        customNoData(this.state.noDataFlag, noDataText);

        jQuery(this.rootRef.current).parent(`.col-lg-11`).removeClass(`col-lg-11`).addClass(`col-lg-12`);
        //Trigger resize
        if (this.props.resizable !== false) {
            createResizableTable(document.getElementById('DataTableListView-FixedHeaders'));
        }
        document.body.className += 'datatablelist-view';
        this.setState({ refreshTable: true }, () => {
            this.fetchData(this.state);
        });

        this.props.setApplicantListPageSize(this.state.pageSize);
    }

    componentWillReceiveProps(props) {
        if (props.dataTableValues.totalItem == 0 && props.isApiCallDone) {
            this.setState({ noDataFlag : true}, () => {
                let noDataText = this.props.noDataText ? this.props.noDataText : 'No records Found';
                customNoData(this.state.noDataFlag, noDataText);
            });
        } else {
            this.setState({ noDataFlag : false}, () => {
                let noDataText = this.props.noDataText ? this.props.noDataText : 'No records Found';
                customNoData(this.state.noDataFlag, noDataText);
            });
        }
        if (props.isFilterPage) {
            this.setState({ page: 0 }, () => { });
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent(`.col-lg-12`).removeClass(`col-lg-12`).addClass(`col-lg-11`);
    }

    //Load more Data
    handleLoadMore = () => {        
        if (this.state.isLoading === false && this.props.hasMore) {
            setTimeout(() => {
                //Since Current page index starts with 0 so add +1 to skip the extra one hit
                if ((this.props.currentPage) >= this.props.pages) {
                    this.setState({ hasMore: false });
                    this.props.setApplicantListLoadMore();
                    return false;
                }
                
                this.setState({
                    page: this.state.page + 1,
                    refreshTable: true,
                    sortColumnLabel: this.props.sortColumnLabel,
                    sortColumn: this.props.sortColumn
                }, () => {
                    this.fetchData(this.state);
                    this.setState({ isLoading: false });
                });
            }, 1000);
        }
        this.setState({ isLoading: true });
    };

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
            items: [...this.props.items]

        };

        let sortColumnName = '';
        let displayedColumns = this.props.determine_columns();
        for (let i = 0; i < displayedColumns.length; i++) {

            if (displayedColumns[i].accessor == sortColumn.property) {
                sortColumnName = displayedColumns[i]._label;
                break;
            }
        }

        // needs to work in both directions
        newState.items = newState.items.sort((a, b) => {
            if (a[sortProperty] && b[sortProperty]) {
                if (sortDirection !== 'desc') {
                    return (a[sortProperty].toLowerCase().trim() > b[sortProperty].toLowerCase().trim()) ? 1 : -1;
                } else {
                    return (a[sortProperty].toLowerCase().trim() < b[sortProperty].toLowerCase().trim()) ? 1 : -1;
                }
            } else {
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
        this.setState({ items: [], sortColumnLabel: sortColumnName, lastUpdated: 'a few seconds', lastUpdatedValue: 60 }, () => {
            this.setState(newState);
            this.props.setApplicantListItems(newState.items);
        });

    };

    /**
     * Fetch list data
     * @param {obj} state
     */
    fetchData = (state, clear_all) => {
        if (state.sorted.length > 0 || this.state.refreshTable) {
            var filtered = state.filtered || {};
            filtered['filter_status'] = this.props.filter_status || '';
            this.setState({
                fil_pageSize: state.pageSize,
                fil_page: state.page,
                fil_sorted: state.sorted,
                fil_filtered: filtered,
                isLoading: true
            });

            this.requestData(
                state, clear_all
            ).then(res => {
                this.setState({
                    dataRows: res.items,
                    pages: res.pages,
                    isLoading: false,
                    noDataFlag: res.items.length == 0 ? true : false,
                    refreshTable: false,
                    items: [],
                    totalItem: res.totalItem,
                    sortColumnLabel: this.props.sortColumnLabel,
                    sortColumn: this.props.sortColumn,
                    lastUpdated: 'a few seconds',
                    lastUpdatedValue: 60,
                }, () => {
                    if (this.state.page != 0) {
                        this.pushPreviousRecord()
                    }
                });

            });

        }

    }

    //Append the new page record with old record
    pushPreviousRecord() {
        let prevData = this.props.prevItems;
        const newItems = [...prevData, ...this.state.dataRows];
        //Set the Items state for loading data in DataTable on lazy loading
        this.setState({ items: newItems }, () => {
            //Scroll the table to bottom once Infinite loading is completed
            var div = document.getElementsByClassName('slds-table_header-fixed_scroller');
            div[0].scrollTop = ((div[0].scrollHeight - div[0].clientHeight) - 100);

            if (+this.state.totalItem !== this.state.items.length) {
                this.setState({ isLoading: false });
            }
        });
    }

    /**
     * Call Api func
     * @param {obj} state
     */
    requestData(state, clear_all) {
        return new Promise((resolve) => {
            // request json
            var Request = {
                pageSize: state.pageSize,
                page: state.page,
                sorted: state.sorted,
                filtered: state.filtered,
                page_name: state.page_name,
            };
            var list_reset = false;
            if (state.page === 0) {
                list_reset = true;
            }

            if (this.props.request_data) {
                Request = Object.assign(this.props.request_data, Request);
            }

            if (state.list_api_url === 'recruitment/RecruitmentDashboard/get_communication_log') {
                Request = {
                    pageSize: state.pageSize, 
                    page: state.pageSize, 
                    sorted: state.pageSize, 
                    filtered: {filterBy: 0}
                }
            }

            this.props.getDataListByIdProps(state.list_api_url, Request, clear_all, list_reset);
            resolve(this.props.dataTableValues);
            this.setState({ onLoad: false });
        });
    }

    /**
     * Submit input search
     * @param {event} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * Set table refresh param
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.props.filter_status || this.state.filter_status };

        this.setState({
            filtered: search_re,
            refreshTable: true,
            isLoading: false,
            items: [],
            page: 0,
        }, () => {
            this.fetchData(this.state, true);
        });
    }

    /**
     * Render Page Header Control
     */
    renderPageHeader = () => {
        // Header props
        let pageComponentValue = {};
        if (this.props.pageComponentValue) {
            pageComponentValue = this.props.pageComponentValue;
        }

        let trail = pageComponentValue.trail || '';
        let title = pageComponentValue.title || 'Default';
        let variant = pageComponentValue.variant || 'default';

        //  Icon props
        let icon = pageComponentValue.icon || {};
        let icon_title = icon.title || '';
        let icon_bgcol = icon.backgroundColor || '';
        let icon_fill = icon.fill || '';
        let icon_name = icon.name || '';
        let icon_category = icon.category || '';

        // count selected
        let checkItemLabel = '';
        if (this.props.checkedItem && this.props.checkedItem > 0) {
            let str_checked = this.props.checkedItem < 2 ? ' Item selected' : ' Items selected';
            checkItemLabel = '• ' + this.props.checkedItem + str_checked;
        }
        if (this.state.checkedItem && this.state.checkedItem > 0) {
            let str_checked = this.state.checkedItem < 2 ? ' Item selected' : ' Items selected';
            checkItemLabel = '• ' + this.state.checkedItem + str_checked;
        }
        var info = '';
        if (this.props.info && this.props.info === true) {
            info = `${this.props.totalItem !== undefined ? this.props.totalItem : 0} items • Sorted by ${this.state.sortColumnLabel} • Updated ${this.state.lastUpdated} ago ${checkItemLabel} `;
        }
        if (this.props.info && this.props.info === true && this.props.info_msg !== undefined) {
            info = `${this.props.info_msg} `;
        }

        return (
            <PageHeader
                icon={
                    <Icon
                        assistiveText={{
                            label: icon_title,
                        }}
                        category={icon_category}
                        name={icon_name}
                        style={{
                            backgroundColor: icon_bgcol,
                            fill: icon_fill,
                        }}
                        trail={trail}
                        title={title}
                    />
                }
                info={info}
                label={<span />}
                truncate
                trail={trail}
                title={title}
                variant={variant}
                onRenderControls={this.renderPageControl}
                onRenderActions={() => {
                    return this.props.on_render_actions()
                }}
            />
        );
    }

    /**
     * Render Page header controls
     */
    renderPageControl = () => {
        let pageComponentValue = {};
        if (this.props.pageComponentValue) {
            pageComponentValue = this.props.pageComponentValue;
        }
        return (
            <React.Fragment>
                {this.renderPageInputSearch(pageComponentValue)}
                {this.renderPageTableColumns(pageComponentValue)}
                {this.renderPageQuickFilter(pageComponentValue)}
                {this.renderPageQuickFilterComponent(pageComponentValue)}
                {this.renderPageDropdownFilterComponent(pageComponentValue)}
            </React.Fragment>
        );
    }

    /**
     * Render input search
     * @param {object} pageComponentValue
     */
    renderPageInputSearch = (pageComponentValue) => {
        if (pageComponentValue.inputSearch && pageComponentValue.inputSearch.search === true) {
            let inputSearch = pageComponentValue.inputSearch;
            let input_id = inputSearch.id || 'header-input-search';
            let placeholder = inputSearch.placeholder || 'Search ..';
            return (
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
                            id={input_id}
                            placeholder={placeholder}
                        />
                    </form>
                </PageHeaderControl>
            );
        }
        return <React.Fragment />;
    }

    /**
     * Render table column show / hide dropdown
     * @param {obj} pageComponentValue
     */
    renderPageTableColumns = (pageComponentValue) => {
        const mapColumnsToOptions = [];
        if (pageComponentValue.columns && pageComponentValue.columns.columns === true) {
            let inputColumns = pageComponentValue.columns;
            let columns = inputColumns.list || '';
            return (
                <PageHeaderControl>
                    {
                        (() => {
                            columns.map(col => {
                                if (col._label) {
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
                                        const value = option.value;

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
            );
        }
        return <React.Fragment />;
    }

    /**
     * Render quick filter
     * @param {obj} pageComponentValue
     */
    renderPageQuickFilter = (pageComponentValue) => {
        if (pageComponentValue.filter && pageComponentValue.filter.quick_filter === true) {
            let filter = pageComponentValue.filter;
            return (
                <PageHeaderControl>
                    <Button
                        title={`Load More`}
                        assistiveText={{ icon: 'Filter' }}
                        iconCategory="utility"
                        iconName="filterList"
                        iconVariant="border-filled"
                        variant="icon"
                        onClick={() => filter.btnAction(filter.modalShowState)}
                    />
                </PageHeaderControl>
            );
        }
        return <React.Fragment />;
    }

    /**
     * Render quick filter component
     * @param {obj} pageComponentValue
     */
    renderPageQuickFilterComponent = (pageComponentValue) => {
        if (pageComponentValue.filter && pageComponentValue.filter.quick_filter === true) {
            let filter = pageComponentValue.filter;
            return filter.filterComponent();
        }
    }

    /**
     * Render quick filter component
     * @param {obj} pageComponentValue
     */
    renderPageDropdownFilterComponent = (pageComponentValue) => {
        if (pageComponentValue.filter && pageComponentValue.filter.dropdown_filter === true) {
            let filter = pageComponentValue.filter;
            return filter.filterComponent();
        }
    }

    /**
     * Check box handle change
     * @param {obj} event 
     * @param {array} data 
     */
    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
        this.setState({ selection: data.selection, checkedItem: selection_count });
    };

    /**
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection: [] });
    }

    /**
     * Render data-table
     */
    renderDataTable = () => {
        let columnBordered = this.props.columnBordered || false;
        let fixedHeader = this.props.fixedHeader || true;
        let fixedLayout = this.props.fixedLayout || true;
        let selectionHandleChange = this.props.selectionHandleChange || this.handleChanged;
        let selection = this.props.selection || this.state.selection;
        let selectRows = this.props.selectRows || '';
        let loadMoreOffset = this.props.loadMoreOffset || 20;
        //Get the columns
        const columns = this.props.determine_columns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0)
        let newcolumns = [];

        for (let i = 0; i < displayedColumns.length; i++) {
            //Form the table td columns as per DataTable format
            if (displayedColumns[i].accessor === 'action') {
                newcolumns.push(displayedColumns[i].Cell);
            } else {
                newcolumns.push(
                    <DataTableColumn
                        key={displayedColumns[i].accessor}
                        label={displayedColumns[i]._label}
                        header={displayedColumns[i]._label}
                        property={displayedColumns[i].accessor}
                        isSorted={this.state.sortColumn === displayedColumns[i].id}
                        sortable={displayedColumns[i].sortable === false ? false : true}
                        CustomUrl={displayedColumns[i].CustomUrl}
                        CustomDateFormat={displayedColumns[i].CustomDateFormat}
                        actionList={displayedColumns[i].actionList}
                        showModal={this.props.showModal}
                        bgForRow={displayedColumns[i].bgForRow}
                    >
                        {/* For doing col data customization we should use CustomDataTableCell */}
                        <CustomDataTableCell{...this.props} />
                    </DataTableColumn>,
                );
            }
        }

        return (
            <DataTable
                assistiveText={{
                    actionsHeader: 'actions',
                    columnSort: 'sort this column',
                    columnSortedAscending: 'asc',
                    columnSortedDescending: 'desc',
                    selectAllRows: 'Select all rows',
                    selectRow: 'Select this row',
                }}
                columnBordered={columnBordered}
                fixedHeader={fixedHeader}
                fixedLayout={fixedLayout}
                items={this.props.items}
                id="DataTableListView-FixedHeaders"
                className="dataTable-quickfilter"
                onRowChange={selectionHandleChange}
                onSort={this.handleSort}
                selection={selection}
                selectRows={selectRows}
                hasMore={this.props.hasMore}
                onLoadMore={this.handleLoadMore}
                loadMoreOffset={loadMoreOffset}
                key="DataTableListView-FixedHeaders"
            >
                {/* Render Table columns */}
                {newcolumns}
            </DataTable>
        );
    }

    render() {
        return (
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <div className="slds list-data-table-view" id="listViewDiv" ref={this.rootRef} style={{
                    height: 'calc(100vh - 280px)',
                    fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                    paddingTop: 0
                }}>
                    {this.renderPageHeader()}
                    {this.renderDataTable()}
                </div>
            </IconSettings>
        );
    }
}


const defaultProps = {
    /**
     * @type {event}
     */
    pageComponentValue: {},
}

const mapStateToProps = state => ({
    showPageTitle: 'ApplicationsApplicantList',
    showTypePage: state.RecruitmentReducer.activePage.pageType,
    dataTableValues: state.CommonReducer.dataTableValues,
    // pageSize: state.CommonReducer.dataTableValues.pageSize || 0,
    items: state.CommonReducer.dataTableValues.items || [],
    prevItems: state.CommonReducer.dataTableValues.prevItems || [],
    pages: state.CommonReducer.dataTableValues.pages || 0,
    totalItem: state.CommonReducer.dataTableValues.totalItem || 0,
    hasMore: state.CommonReducer.dataTableValues.hasMore,
    currentPage: state.CommonReducer.dataTableValues.currentPage || 0,
    isApiCallDone: state.CommonReducer.isApiCallDone
});

const mapDispatchtoProps = (dispatch) => {
    return {
        getDataListByIdProps: (api_url, request, clear_all, list_reset) => dispatch(getDataListById(api_url, request, clear_all, list_reset)),
        setApplicantListLoadMore: () => dispatch({ type: 'SET_DATA_TABLE_LOAD_MORE_FALSE' }),
        setApplicantListPageSize: (pageSize) => dispatch({ type: 'SET_DATA_TABLE_PAGE_SIZE', data: pageSize }),
        setApplicantListItems: (items) => dispatch({ type: 'SET_DATA_TABLE_ITEMS', data: items }),
    }
}

DataTableListQuickFilter.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchtoProps)(DataTableListQuickFilter);