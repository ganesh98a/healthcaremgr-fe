import { Button, Card, Icon } from '@salesforce/design-system-react';
import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import { css } from '../../../../../service/common';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable';
import AddLeadDocuSign from '../ServiceAgreementDoc/AddLeadDocuSign';

class LeadDocuSignCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            lead_docusign_datas: props.lead_docusign_datas || []
        }
    }

    determineDocusignTblColumns() {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
        return [
            {
                _label: 'Type',
                accessor: "type",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.original.type == 1? "Consent" : "Service Agreement")}</span>,
            },
            {
                _label: 'To',
                accessor: "to_select",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    const { original } = props
                    let ac_label = JSON.parse(original.to_select);
                    return <span className="vcenter slds-truncate" title={ac_label.label}>{ac_label.label}</span>
                }
            },
            {
                _label: 'Signed By',
                accessor: "signed_by_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    const { original } = props
                    return <span className="vcenter slds-truncate" title={props.value}>{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Lead Name',
                accessor: "lead_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Contract Sent',
                accessor: "created",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
            },
            {
                _label: 'Sent By',
                accessor: "send_date",
                className: '_align_c__',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.original.created_by_fullname)}</span>
            },
            {
                _label: 'Status',
                accessor: "contract_status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Signed Date',
                accessor: "signed_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Document',
                accessor: "url",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                className: '_align_c__',
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate">-</span>
                    }
                    return (
                        <span className="vcenter slds-truncate"><a style={styles.hyperlink} className="default-underlined" title="View/download contract" target="_blank" href={defaultSpaceInTable(props.value)}>{defaultSpaceInTable(props.original.signed_file)}</a></span>
                    )
                }
            },
        ]
    }

    renderDocusign = () => {
        // Card style
        const styles = css({
            card: {

                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        // Get line items table column
        const displayedColumns = this.determineDocusignTblColumns();
        let service_agreement_related = this.state.opportunity && this.state.opportunity.topic || this.state.lead && this.state.lead.lead_topic;
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
                <div className="slds-grid slds-grid_vertical">
                    <Card
                        headerActions={<Button label={'New'} onClick={e => this.setState({openDocusigDialog:true})} />}
                        heading={"Docusign ("+this.state.lead_docusign_datas.length+")"}
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
                            // PaginationComponent={Pagination}
                            PaginationComponent={React.Fragment}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            filtered={this.state.filtered}
                            columns={displayedColumns}
                            data={this.props.lead_docusign_datas}
                            defaultPageSize={9999}
                            minRows={1}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No records found"
                            collapseOnDataChange={true}
                            getTableProps={() => ({ className: `slds-table` })}
                            style={{
                                fontSize: 13
                            }}
                            resizable={true}
                        />
                    </Card>
                    { this.state.openDocusigDialog && <AddLeadDocuSign
                            // key={this.props.risk_assessment_id}
                            isOpen={this.state.openDocusigDialog}
                            onClose={() => this.setState({ openDocusigDialog: false })}
                            onSuccess={() => this.setState({ openDocusigDialog: false }, this.props.get_lead_details())}
                            oppunity_decisionmaker_contacts={this.state.oppunity_decisionmaker_contacts ? this.state.oppunity_decisionmaker_contacts[0]: ""}
                            service_agreement_ac_name={this.state.sa_account_name}
                            service_agreement_related={'Service Agreement for '+ service_agreement_related}
                            service_agreement_id={_.get(this.props, 'props.match.params.id')}
                            account_person_id = {this.state.account_type == 1 ? _.get(this.state, 'account_person.id') : _.get(this.state, 'account_organisation.id')}
                            account_type = {this.state.account_type}
                            opporunity_id = {this.state.opportunity_id}
                            lead = {this.props.lead}
                            />
                    }
                </div>
            </div>
        );
    }

    render() {

        return (
            <React.Fragment>
                {this.renderDocusign()}
            </React.Fragment>
        );
    }
}

export default LeadDocuSignCard;