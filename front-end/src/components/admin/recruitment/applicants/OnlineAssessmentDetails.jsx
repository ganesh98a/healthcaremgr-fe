import React, { Component } from 'react';
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { checkItsNotLoggedIn, reFreashReactTable, css, toastMessageShow, AjaxConfirm, postData } from 'service/common.js';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import { getOnlineAssessmentData } from '../actions/RecruitmentAction.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import {
    Card,
    Button,
    Dropdown,
    Icon,
    IconSettings,
} from '@salesforce/design-system-react';
import IconsMe from '../../IconsMe';
import { toast } from 'react-toastify'
import { ToastUndo } from 'service/ToastUndo.js'

class OnlineAssessmentDetails extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            searchVal: '',
            filterVal: '',
            onlineAssessmentList: [],
            pageSize: 6,
            page: 0,
            form_count: 0,
            filtered: '',
            sorted: '',
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }
    
        /**
     * Call the requestData
     * @param {temp} state
     */
    fetchOAData = (state) => {
        this.setState({ loading: true });
        getOnlineAssessmentData(
            this.props.application_id,
            this.props.applicant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                onlineAssessmentList: res.rows,
                form_count: res.count,
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
        postData('recruitment/OnlineAssessment/print_online_assessment', { job_assessment_id: oAid, application_id :this.props.application_id }).then((result) => {
                        
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
     * Render OA table if count greater than 0
     */
    renderTable() {
        
        return (
            <SLDSReactTable
                PaginationComponent={() => <React.Fragment />}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                data={this.state.onlineAssessmentList}
                defaultPageSize={6}
                minRows={1}
                sortable={false}
                resizable={true}
                onFetchData={this.fetchOAData}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card tablescroll' })}
            />
        )
    }
    
    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (Number(this.state.form_count) === 0) {
            return <React.Fragment />
        }

        return (
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/recruitment/application_details/onlineassessment_list/${this.props.applicant_id}/${this.props.application_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        heading={Number(this.state.form_count) > 6 ? "Online Assessment (6+)" : "Online Assessment ("+this.state.form_count+")"}
                        className="slds-card-bor"
                        icon={<Icon category="standard" name="file" size="small" />}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                </IconSettings>
            </React.Fragment>
        );
    }
}



// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
export default OnlineAssessmentDetails;