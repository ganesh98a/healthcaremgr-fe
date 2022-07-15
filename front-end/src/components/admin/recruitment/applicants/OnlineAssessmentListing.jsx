import React, { Component } from 'react';
import moment from 'moment';
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import { postData, css } from 'service/common.js';
import { getOnlineAssessmentData } from '../actions/RecruitmentAction.js';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
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
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';

class OnlineAssessmentListing extends Component {
    
     /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'created_at': true,
            'updated_at': true,
            'status': true,
            'total_marks': true,
            'id': true,
            'status_msg': true,
            'completed_date_time': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            onlineAssessmentList: [],
            filter_status: 'all',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateQuiz: false,
            applicant_id:this.props.props.match.params.id,
            application_id: this.props.props.match.params.application_id,
            flagged_status: ''
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }
    
    componentWillMount() {
        // todo..
    }
    
    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchData = (state) => {
        this.setState({ loading: true });
        getOnlineAssessmentData(
            this.state.application_id,
            this.state.applicant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                onlineAssessmentList: res.rows,
                quiz_count: res.count,
                pages: res.pages,
                loading: false
            });
        });
    }
    
     /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Link shared on',
                accessor: "created_at",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    return (
                        <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>
                    )
                }
            },
            {
                _label: 'Submitted on',
                accessor: "completed_date_time",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    return (
                        <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>
                    )
                }
            },
            {
                _label: 'Status',
                accessor: "status_msg",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if(props.original.status === "3" ||  props.original.status === "4" || props.original.status === "8") {
                        return <Link to={ROUTER_PATH + `admin/recruitment/applicant_assessment/${props.original.application_id}/${props.original.id}`} className="reset" style={{ color: '#0070d2' }} target="_blank">
                            {defaultSpaceInTable(props.value)}
                        </Link>
                    } else {
                        return <span className="slds-truncate" style={{ color: props.value === 'Error' ? 'red' : ''}}>{defaultSpaceInTable(props.value)}</span>
                    }
                }
            },
            {
                _label: 'Grade',
                accessor: "total_marks",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{props.original.status === "7" ? '' : defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'PDF',
                accessor: "id",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if(props.original.status == '4') {
                        return (
                            <Button
                                assistiveText={{ icon: 'PDF Download' }}
                                iconCategory="doctype"
                                iconName="pdf"
                                iconSize="large"
                                iconVariant="bare"
                                variant="icon"
                                onClick={() => this.downloadOnlineAssessment(props.value)}
                            />
                        )
                    }
                }
                    
            },
        ]
    }

    downloadOnlineAssessment(oAid) {
        postData('recruitment/OnlineAssessment/print_online_assessment', { job_assessment_id: oAid, application_id :this.state.application_id }).then((result) => {
                        
            if (result.status) {
                let msg = result.msg;
                toast.success(<ToastUndo message={msg} showType={'s'} />, {
                  position: toast.POSITION.TOP_CENTER,
                  hideProgressBar: true,
                })
                let url = result.data;
                window.open(url, "_blank");
            } else {
                toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                  position: toast.POSITION.TOP_CENTER,
                  hideProgressBar: true,
                })
            }
            this.setState({ print_btn: false })
            
        });
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
                    { this.renderColumnSelector({ columns }) }
                </PageHeaderControl>
            </React.Fragment>
        )
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


    render() {     
        const columns = this.determineColumns();
        const trail = [
            <Link to={ROUTER_PATH + `admin/recruitment/applicant/${this.state.applicant_id}`} className="reset" style={{ color: '#0070d2' }}>
            {'Applicant Details'}
            </Link>,
            <Link to={ROUTER_PATH + `admin/recruitment/application_details/${this.state.applicant_id}/${this.state.application_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.application_id}
            </Link>
        ];
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} >
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <PageHeader
                        icon={
                            <Icon
                                assistiveText={{
                                    label: 'Online Assessment',
                                }}
                                category="utility"
                                name="display_text"
                                style={{
                                    backgroundColor: '#ffffff',
                                    fill: '#baac93',
                                }}
                                title="Online Assessment"
                            />
                        }
                        onRenderActions={this.handleOnRenderActions}
                        onRenderControls={this.handleOnRenderControls({ columns })}
                        title="Online Assessment"
                        trail={trail}
                        label={<span />}
                        truncate
                        variant="object-home"
                    />
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
                            data={this.state.onlineAssessmentList}
                            defaultPageSize={9999}
                            minRows={1}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card slds-tbl-scroll tablescroll' }) }
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

export default OnlineAssessmentListing;