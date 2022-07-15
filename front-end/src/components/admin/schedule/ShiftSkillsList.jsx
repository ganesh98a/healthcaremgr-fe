import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../salesforce/lightning/SLDSReactTable'
import '../scss/components/admin/crm/pages/contact/ListContact.scss'
import { Redirect } from 'react-router';
import {
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Button,
    Dropdown,
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import { openAddEditShiftSkillModal } from './ShiftCommon';
import ArchiveModal  from '../oncallui-react-framework/view/Modal/ArchiveModal';

/**
 * RequestData get the list of member skills
 */
const requestData = (shift_id, pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { shift_id: shift_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('schedule/ScheduleDashboard/get_shift_skills_list', Request).then((result) => {
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
};

/**
 * Class: ListShiftSkills
 */
class ListShiftSkills extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'skill_name': true,
            'condition': true,
            'actions': true          
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);

        var displayed_columns = ''
        var shift_id = '';
        if (props.match && props.match.params.id > 0) {
            shift_id = props.match.params.id;
            displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }

        // Initialize state
        this.state = {
            shift_id: shift_id,
            member_skill_id: '',
            searchVal: '',
            filterVal: '',
            paticipantList: [],
            filter_status: 'all',
            openEditModal: false,
            showSkillArchiveModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateModal: false
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    handleShiftSkills = e => {
        e.preventDefault();
        this.setState({ manageShiftSkillsModal: true })
    }

    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            this.state.shift_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                shift_skills: res.rows,
                pages: res.pages,
                loading: false,
                showSkillArchiveModal :  false,
            });
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
        this.setState({ filtered: search_re , showSkillArchiveModal: false },()=>{});
    }

    /**
     * Open create shift skills modal
     */
    showModal(shift_skill_id) {
        this.setState({ manageShiftSkillsModal: true });
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
        this.setTableParams();
    }

    /**
     * fetching the member details if the shift_id is passed
     */
    get_shift_details = (id) => {
        postData('schedule/ScheduleDashboard/get_shift_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if (this.state.shift_id) {
            this.get_shift_details(this.state.shift_id);
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={e => this.showModal()} disabled={this.state.is_shift_locked ? true : false} />
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Close the modal when user save the member skills and refresh the table
     */
    closeAddEditShiftModal = (status) => {
        this.setState({ manageShiftSkillsModal: false });

        if (status) {
            reFreashReactTable(this, 'fetchData');
        }
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
                    id="Member-skills-search-1"
                    placeholder="Search shift Skills"
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
        columns = columns.filter(col => (col.accessor != "actions"));
        const mapColumnsToOptions = columns.map(col => {
            return ({
                value: 'id' in col ? col.id : col.accessor,
                label: col._label,
            })
        })
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
                accessor: "actions",
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
                    disabled={this.state.is_shift_locked ? true : false}
                    className={'slds-more-action-dropdown'}
                    options={[
                        { label: 'Delete', value: '2' },
                    ]}
                />

            }
        ];
    }

    /**
     * render header part
     */
    renderHeader() {
        const columns = this.determineColumns();
        const trail = [
            <Link to={ROUTER_PATH + `admin/schedule/list`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>Schedule</Link>,
            <Link to={ROUTER_PATH + `admin/schedule/details/` + this.state.id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>{this.state.shift_no}</Link>,
        ];

        return (
            <React.Fragment>
                <PageHeader
                    trail={trail}
                    onRenderActions={this.handleOnRenderActions}
                    onRenderControls={this.handleOnRenderControls({ columns })}
                    title="Shift Skills"
                    label=" "
                    truncate
                    variant="related-list"
                />
            </React.Fragment>
        )
    }
    /**
     * Render the display content
     */
    render() {
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons/">
                        {this.renderHeader()}
                        <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={this.fetchData}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayedColumns}
                            data={this.state.shift_skills}
                            defaultPageSize={9999}
                            minRows={1}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}
                        />
                    </IconSettings>
                </div>
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
                                on_success={()=> this.setTableParams()}

                /> }
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
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListShiftSkills);
