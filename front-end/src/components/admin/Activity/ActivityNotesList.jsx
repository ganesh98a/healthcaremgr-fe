import React, { Component } from 'react';
import _ from 'lodash';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css, toastMessageShow, wordWrap} from 'service/common.js';
import { getRelatedType } from '../oncallui-react-framework/services/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import jQuery from 'jquery';
import moment from 'moment';
import SLDSReactTable from '../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
import {
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Icon,
    Button,
    Dropdown,
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import '../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../scss/components/admin/item/item.scss';
import '../scss/components/admin/member/member.scss';
import { getActivityNotesByRelatedType } from "components/admin/crm/actions/SalesActivityAction.jsx"

/**
 * Class: ActivityNotesList
 */
class ActivityNotesList extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'title': true,
            'comment': true,
            'created': true,
            'created_by': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            filter_status: 'all',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],  
            related_type: getRelatedType('shift'),          
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchActivityNotesData = (state) => {
        this.setState({ loading: true });
        getActivityNotesByRelatedType(
            this.props.props.match.params.id,
            this.state.related_type,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            console.log("res--", res)
            this.setState({
                notesList: res.data,
                notes_count: res.count,
                pages: res.pages,
                loading: false
            });
        });
    }


    /**
     * fetching the member details if the modal is opened in the edit mode
     */
     get_shift_details = (id) => {
        this.setState({loading: true});
        postData('schedule/ScheduleDashboard/get_shift_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
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
     * Get the list based on Search value
     * @param {object} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * Set the data for fetching the list
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re });
    }
    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentWillMount() {
        this.get_shift_details(this.props.props.match.params.id)
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render search input form
     */
    renderSearchForm() {
        return (
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
                    id="form-search-1"
                    placeholder="Search Notes"
                />
            </form>
        )
    }    

    /**
     * Handle the selected columns visible or not
     */
    handleOnSelectColumnSelectorItem = option => {
        const value = option.value

        let cols = [...this.state.displayed_columns]
        if (cols.indexOf(value) >= 0) {
            cols = cols.filter(col => col !== value)
        } else {
            cols = [...this.state.displayed_columns, value]
        }

        this.setState({ displayed_columns: cols })
    }
   

    /**
     * Render table column dropdown
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {

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
                onSelect={this.handleOnSelectColumnSelectorItem}
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
    }

    /**
     * Render page header
     * @param {object} param
     * @param {import('react-table').Column[]} [param.columns]
     */
    handleOnRenderControls = ({ columns = [] }) => () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    {this.renderSearchForm()}
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderColumnSelector({ columns })}
                </PageHeaderControl>             
            </React.Fragment>
        )
    }    

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Title',
                accessor: "title",
                className: "slds-tbl-card-td-link-hidden",
                sortable: false,
                width: 300,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Description',
                accessor: "comment",
                sortable: false,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <div className="slds-para-truncate" title={props.value}>{defaultSpaceInTable(wordWrap(props.value, 45))}</div>,
            },
            {
                _label: 'Created',
                accessor: "created",
                sortable: false,
                width: 150,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <div className="slds-para-truncate" title={props.value}>{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm"))}</div>,
            },
            {
                _label: 'Created By',
                accessor: "created_by",
                sortable: false,
                width: 150,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <div className="slds-para-truncate" title={props.value}>{defaultSpaceInTable(props.value)}</div>,
            },            
        ]
    }

    /**
     * Render the display content
     */
    render() {
        // This will only run when user create notes
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        var shift_id = _.get(this.props, 'props.match.params.id');
        const trail = [
            <Link to={ROUTER_PATH + `admin/schedule/list`} className="reset" style={{ color: '#0070d2' }}>
                Shifts
            </Link>,
            <Link to={ROUTER_PATH + `admin/schedule/details/${shift_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.shift_no ? this.state.shift_no : ''}
            </Link>
        ];

        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            icon={
                                <Icon
                                    assistiveText={{
                                        label: 'Notes',
                                    }}
                                    category="standard"
                                    name="related_list"
                                    style={{
                                        backgroundColor: '#5cbcab',
                                        fill: '#ffffff',
                                    }}
                                    title="Notes"
                                />
                            }
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title="Notes"
                            trail={trail}
                            label={<span />}
                            truncate
                            variant="related-list"
                        />
                            <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={this.fetchActivityNotesData}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayedColumns}
                            data={this.state.notesList}
                            defaultPageSize={9999}
                            minRows={1}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card slds-tbl-scroll tablescroll' })}
                        />
                    </IconSettings>
                </div>
            </React.Fragment>
        )


    }


}
// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
// Get the page title and type from reducer
const mapStateToProps = state => ({
   
})

const mapDispatchtoProps = () => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ActivityNotesList);
