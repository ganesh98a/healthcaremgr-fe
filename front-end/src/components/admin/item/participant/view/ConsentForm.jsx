import React, { Component } from 'react';
import { postData, toastMessageShow, AjaxConfirm } from 'service/common.js';
import {
    Card,
    Button,
    Icon,
    IconSettings,
    Tooltip
} from '@salesforce/design-system-react';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import SATilesCard from './SATilesCard';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Class: ParticipantSACard
 */
class ParticipantSACard extends Component {
    constructor(props) {
        super(props);
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            participant_id: this.props.participant_id,
            record_count: 0,
            recordList: [],
        }
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        this.fetchCardData(this.state);
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchCardData = (state, instance) => {
        this.setState({ loading: true });
        var req = {
            participant_id: this.state.participant_id,
        }
        postData('item/Participant/get_service_agreement_linked_docu_sign', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                this.setState({
                    recordList: result.data,
                    record_count: result.count
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
        return (
            <div className={'slds-align_absolute-center pt-3 bor-top-1'}>
                <Link to={'#'} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>
        );
    }

    /**
     * Render card tile
     */
    renderCards = () => {
        if (this.state.record_count > 0 ) {
            return (
                <div className="slds-card__body_inner mb-4">
                    <ul class="slds-grid slds-wrap slds-grid_pull-padded">
                        {
                            this.state.recordList.map((val, index) => {
                                let value = val.service_docusign_datas;
                                return (

                                    value.map((sub, subindex) =>
                                        <li class="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3 consent-form-card">
                                        {
                                            <SATilesCard
                                            id={sub.service_agreement_id}
                                            disabled={false}
                                            url={ROUTER_PATH+`admin/crm/serviceagreements/${sub.service_agreement_id}`}
                                            title={sub.related}
                                            title_details={[
                                                { label: "Status", value: sub.contract_status },
                                                { label: "Contract Start Date", value: moment(val.contract_start_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') },
                                            ]}
                                            icon={{ category: "standard", name: "product_item", size: "small" }}
                                            />
                                        }
                                        </li>
                                    )

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

    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Card
                    headerActions={
                        <Button label="New"/>
                    }
                    heading={Number(this.state.record_count) > 6 ? "Consent form (6+)" : "Consent form ("+this.state.record_count+")"}
                    className="slds-card-bor"
                    icon={<Icon category="standard" name="product_item" size="small" />}
                >
                    {this.renderCards()}
                    {this.renderViewAll()}
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
export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantSACard);