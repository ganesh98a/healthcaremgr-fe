import React, { Component } from 'react';
import { postData, toastMessageShow, css } from 'service/common.js';
import {
    Card,
    Button,
    Icon,
    IconSettings,
    Dropdown
} from '@salesforce/design-system-react';
import { Link } from 'react-router-dom';
import { ROUTER_PATH, COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from 'config.js';
import SATilesCard from './SATilesCard';
import { connect } from 'react-redux';
import moment from 'moment';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable';
import { defaultSpaceInTable } from 'service/custom_value_data.js'

/**
 * Class: ParticipantSACard
 */
class ParticipantSADocumentCard extends Component {
    constructor(props) {
        super(props);
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            participant_id: this.props.participant_id,
            record_count: 0,
            recordList: []
        }
    }

    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchCardData = (state, instance) => {
        this.setState({ loading: true });
        var req = {
            filtered: state.filtered,
            sorted: state.sorted,
            participant_id: this.state.participant_id,
            page: state.page,
            pageSize: state.pageSize
        }
        postData('item/Participant/get_service_agreement_documents', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                let list = result.data.splice(0, 6);
                this.setState({
                    recordList: list,
                    record_count: list.length + result.data.length
                });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (this.state.record_count === 0) {
            return <React.Fragment />
        }
        var participant_id = this.props.participant_id;
        return (
            <div className={'slds-align_absolute-center pt-3 bor-top-1'}>
                <Link to={ROUTER_PATH + `admin/item/participant/serviceagreements/${participant_id}/${participant_id}`} className="reset">
                    <span style={{ color: "#0070d2" }}>{'View All'}</span>
                </Link>
            </div>
        );
    }

    /**
     * change more option
     * @param {obj} e 
     * @param {int} id 
     */
    changeOption = (e, id) => {
        // todo..
    }

    /**
     * Render card tile
     */
    renderCards = () => {
        if (this.state.record_count > 0) {
            return (
                <div className="slds-card__body_inner mb-4">
                    <ul class="slds-grid slds-wrap slds-grid_pull-padded">
                        {
                            this.state.recordList.map((val, index) => {
                                return (
                                    <li class="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3">
                                        <SATilesCard
                                            id={val.id}
                                            disabled={false}
                                            url={ROUTER_PATH + `admin/crm/serviceagreements/${val.id}`}
                                            title={val.topic}
                                            title_details={[
                                                { label: "Status", value: val.status_label },
                                                { label: "Contract Date", value: moment(val.contract_start_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') },
                                            ]}
                                            icon={{ category: "standard", name: "file", size: "small" }}
                                        />
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            );
        } else {
            return (<React.Fragment />);
        }
    }

    docLink(props) {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
        if (!props.original.url) {
            return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
        }
        return (
            <span className="vcenter slds-truncate"><a style={styles.hyperlink} className="reset" title="View/download" target="_blank" href={defaultSpaceInTable(COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod2 + '/?url=' + props.original.url)}>{defaultSpaceInTable(props.value)}</a></span>
        );
    }

    /**
     * Determin line items table colums
     * return array
     */
    determineItemsTblColumns() {
        return [
            {
                _label: 'Doc Type',
                accessor: "doc_type",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{this.docLink(props)}</span>,
            },
            {
                _label: 'Related',
                accessor: "related",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span className="slds-truncate">
                        {defaultSpaceInTable(props.value)}
                    </span>
                ),
            },
            {
                _label: 'To',
                accessor: "to_select",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(JSON.parse(props.value)["label"])}</span>
            },
            {
                _label: 'Signed By',
                accessor: "signed_by_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value || "")}</span>
            },
            {
                _label: 'Status',
                accessor: "contract_status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Plan Start Date',
                accessor: "plan_start_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(this.displayDate(props.value))}</span>
            },
            {
                _label: 'Signed Date',
                accessor: "signed_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(this.displayDate(props.value))}</span>
            },
            {
                _label: 'Sent By',
                accessor: "created_by_fullname",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Action',
                accessor: "",
                Header: props => <div style={{width:'1.5rem'}}></div>,
                width:'1.5rem',
                Cell: props => {
                    return <Dropdown
                                assistiveText={{ icon: 'More Options' }}
                                iconCategory="utility"
                                iconName="down"
                                align="right"
                                iconSize="x-small"
                                id={'actions' + props.original.id}
                                iconVariant="border-filled"
                                onSelect={(e) => {
                                    if(e.value == 1){ //edit
                                        this.resendDoc(props.original.id)
                                    }
                                }}
                                width="xx-small"
                                options={[
                                    { label: 'Resend Doc', value: '1' }
                                ]}
                                disabled={props.original.signed_status === "1"}
                            />
                }
            }
        ]
    }

    resendDoc(id) {
        let req = {id};
        postData('item/Participant/resend_doc', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                toastMessageShow("Document sent successfully", "s");
            } else {
                toastMessageShow(result.msg, "e");
            }
        });
    }

    displayDate(value) {
        return value !== "0000-00-00 00:00:00" && value != "" && moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') || "";
    }

    render() {
        // Get line items table column
        const displayedColumns = this.determineItemsTblColumns();
        // Card style
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        let doc_count = this.state.record_count > 6? "6+" : this.state.record_count;
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Card
                    heading={"SA Documents (" + doc_count + ")"}
                    style={styles.card}
                    icon={<Icon category="standard" name="product_item" size="small" />}
                >
                    <div class="slds-grid slds-grid_pull-padded-medium">
                        <div class="slds-col slds-p-horizontal_medium">
                            <span>&nbsp;</span>
                        </div>
                        <div class="slds-col slds-p-horizontal_medium">
                            <span>&nbsp;</span>
                        </div>
                    </div>

                    <SLDSReactTable
                        PaginationComponent={React.Fragment}
                        ref={this.reactTable}
                        manual="true"
                        loading={this.state.loading}
                        pages={this.state.pages}
                        filtered={this.state.filtered}
                        columns={displayedColumns}
                        data={this.state.recordList}
                        onFetchData={(state, instance)=>this.fetchCardData(state, instance)}
                        minRows={1}
                        noDataText="No records found"
                        collapseOnDataChange={true}
                        getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                        style={{
                            fontSize: 13
                        }}
                        resizable={true}
                    />
                    {   this.state.record_count > 6 &&
                        <div className="custom-card-footer">
                            <Link to={{pathname: ROUTER_PATH + `admin/item/participant/sadocuments/${this.state.participant_id}`, participant_name: this.props.participant_name, className:"slds-align_absolute-center default-underlined", id:"view-all-members", title:"View all service agreement documents", style:{color: '#0070d2' }}}><span style={{ color: "#0070d2" }}>{'View All'}</span></Link>
                        </div>
                    }
                </Card>
            </IconSettings>
        );
    }
}

const mapStateToProps = state => ({
})

const mapDispatchtoProps = (dispach) => {
    return {
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantSADocumentCard);