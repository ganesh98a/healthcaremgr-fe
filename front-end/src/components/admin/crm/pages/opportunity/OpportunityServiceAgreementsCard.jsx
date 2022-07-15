import { Icon } from '@salesforce/design-system-react';
import moment from 'moment';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class OpportunityServiceAgreementsCard extends Component {
    constructor(props) {
        super(props);
        this.state = { }
    }

    componentDidMount() { }

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

export default OpportunityServiceAgreementsCard;