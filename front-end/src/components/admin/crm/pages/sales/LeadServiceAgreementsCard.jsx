import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import { Icon } from '@salesforce/design-system-react'

import moment from 'moment'

import { postData } from '../../../../../service/common'

class LeadServiceAgreementsCard extends Component {

    constructor(props) {
        super(props);
        this.state = { }
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
                _label: 'Account',
                accessor: "account_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Related',
                accessor: "related",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable('Service Agreement for '+ _.get(this.state, 'opportunity.topic'))}</span>
            },
            {
                _label: 'Contract Sent',
                accessor: "send_date",
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
                className: '_align_c__',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Signed Date',
                accessor: "signed_date",
                className: '_align_c__',
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
                        heading={"Docusign ("+this.state.service_docusign_datas.length+")"}
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
                            data={this.state.service_docusign_datas}
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

                    { !this.state.lead_id && this.state.openDocusigDialog &&
                        <AddNewDocuSign
                        // key={this.props.risk_assessment_id}
                         isOpen={this.state.openDocusigDialog}
                         onClose={() => this.setState({ openDocusigDialog: false })}
                         onSuccess={() => this.setState({ openDocusigDialog: false }, this.get_service_agreement_details(_.get(this.props, 'props.match.params.id')))}
                         oppunity_decisionmaker_contacts={this.state.oppunity_decisionmaker_contacts ? this.state.oppunity_decisionmaker_contacts[0]: ""}
                          service_agreement_ac_name={this.state.sa_account_name}
                          service_agreement_related={'Service Agreement for '+ service_agreement_related}
                          service_agreement_id={_.get(this.props, 'props.match.params.id')}
                          account_person_id = {this.state.account_type == 1 ? _.get(this.state, 'account_person.id') : _.get(this.state, 'account_organisation.id')}
                          account_type = {this.state.account_type}
                          opporunity_id = {this.state.opportunity_id}
                          lead_id = {this.state.lead_id}
                          lead_topic = {this.state.lead && this.state.lead.lead_topic}
                        />
                        ||  (this.state.openDocusigDialog && <AddLeadDocuSign
                            // key={this.props.risk_assessment_id}
                            isOpen={this.state.openDocusigDialog}
                            onClose={() => this.setState({ openDocusigDialog: false })}
                            onSuccess={() => this.setState({ openDocusigDialog: false }, this.get_service_agreement_details(_.get(this.props, 'props.match.params.id')))}
                            oppunity_decisionmaker_contacts={this.state.oppunity_decisionmaker_contacts ? this.state.oppunity_decisionmaker_contacts[0]: ""}
                            service_agreement_ac_name={this.state.sa_account_name}
                            service_agreement_related={'Service Agreement for '+ service_agreement_related}
                            service_agreement_id={_.get(this.props, 'props.match.params.id')}
                            account_person_id = {this.state.account_type == 1 ? _.get(this.state, 'account_person.id') : _.get(this.state, 'account_organisation.id')}
                            account_type = {this.state.account_type}
                            opporunity_id = {this.state.opportunity_id}
                            lead = {this.state.lead}
                            />
                            )
                    }
                    { (this.state.openPreviewDocusigDialog) ?
                        <PreviewDocuSign
                        // key={this.props.risk_assessment_id}
                         isOpen={this.state.openPreviewDocusigDialog}
                         onClose={() => this.setState({ openPreviewDocusigDialog: false })}
                         onSuccess={() => this.setState({ openPreviewDocusigDialog: false }, this.get_service_agreement_details(_.get(this.props, 'props.match.params.id')))}
                         oppunity_decisionmaker_contacts={this.state.oppunity_decisionmaker_contacts ? this.state.oppunity_decisionmaker_contacts[0]: ""}
                          service_agreement_ac_name={this.state.sa_account_name}
                          service_agreement_related={'Service Agreement for '+ _.get(this.state, 'opportunity.topic')}
                          service_agreement_id={_.get(this.props, 'props.match.params.id')}
                          account_person_id = {this.state.account_type == 1 ? _.get(this.state, 'account_person.id') : _.get(this.state, 'account_organisation.id')}
                          account_type = {this.state.account_type}
                          opporunity_id = {this.state.opportunity_id}
                        />
                        : ''
                    }
                </div>
            </div>
        );
    }

    render() {

        return (
            <React.Fragment>
                <article className="slds-card" style={{ border: '1px solid #dddbda', boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)' }}>
                    <div className="slds-card__header slds-grid ">
                        <header className="slds-media slds-media_center slds-has-flexi-truncate remove_previous_header_css">
                            <div className="slds-media__figure">
                                <span className="slds-icon_container slds-icon-standard-user" title="Service Agreements">
                                    <Icon category="standard" name="user" size="small" />
                                    <span className="slds-assistive-text">Service Agreements</span>
                                </span>
                            </div>
                            <div className="slds-media__body">
                                <h2 className="slds-card__header-title">
                                    <a href="#!" className="slds-card__header-link slds-truncate" title="Service Agreements">
                                        <span key={this.props.serviceAgreements}>Service Agreements ({this.props.serviceAgreements.length})</span>
                                    </a>
                                </h2>
                            </div>
                            <div className="slds-no-flex">
                                <button className="slds-button slds-button_neutral" onClick={() => this.props.openCreateServiceAgreementFn()}>
                                    New
                                </button>
                            </div>
                        </header>
                    </div>
                    <div className="slds-card__body slds-card__body_inner">
                        <ul className="slds-grid slds-wrap slds-grid_pull-padded">
                            {this.props.serviceAgreements.map((agreement, idx) => (
                                <li className="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3" key={idx}>
                                    <article className="slds-tile slds-media slds-card__tile slds-hint-parent">
                                        <div className="slds-media__figure">
                                            <span className="slds-icon_container slds-icon-standard-user">
                                                <Icon category="standard" name="user" size="small" />
                                                <span className="slds-assistive-text">Service Agreement</span>
                                            </span>
                                        </div>
                                        <div className="slds-media__body">
                                            <div className="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                                                <h3 className="slds-tile__title slds-truncate" title={agreement.topic}>
                                                    <Link to={"/admin/crm/serviceagreements/" + agreement.id}>{agreement.topic}</Link>
                                                </h3>
                                            </div>
                                            <div className="slds-tile__detail">
                                                <dl className="slds-list_horizontal slds-wrap">
                                                    <dt className="slds-item_label slds-text-color_weak slds-truncate">Status:</dt>
                                                    <dd className="slds-item_detail slds-truncate" title="Status">{agreement.status_label}</dd>
                                                    <dt className="slds-item_label slds-text-color_weak slds-truncate" title="Contract Start Date">Contract Start Date:</dt>
                                                    <dd className="slds-item_detail slds-truncate" title="Contract Start Date">{moment(agreement.contract_start_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>

            </React.Fragment>
        );
    }
}

export default LeadServiceAgreementsCard;