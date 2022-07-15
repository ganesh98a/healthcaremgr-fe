import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'

import PropTypes from 'prop-types';

import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';

import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Card from '@salesforce/design-system-react/lib/components/card';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import OpportunityContacts from './OpportunityContacts';
import OpportunityPath from './OpportunityPath';


class Opportunity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'related',
            account_person: {},
            owner: {},
            contacts: [],
            opportunityStage:[],
            opportunity_status:'',
        }
    }

    get_opportunity_details = (id) => {
        postData('sales/Opportunity/view_opportunity', { opportunity_id: id }).then((result) => {
            if (result.status) {
                this.setState(result.data, () => { });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        });
    }

    componentDidMount() { 
        var opportunity_id = this.props.match.params.id;
        this.getDrpDwnOption();
        this.get_opportunity_details(opportunity_id);
    }

    getDrpDwnOption = () => {
        postData('sales/Opportunity/get_opportunity_option').then((result) => {
            if (result.status) {
                this.setState({ opportunityStage: result.data.opportunity_status }, () => {  })
            }
        });
    }
    actions = () => (
        <React.Fragment>
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="One" />
                    <Button label="Two" />
                    <Button label="Three" />
                </ButtonGroup>
            </PageHeaderControl>
        </React.Fragment>
    );


    render() {
        const details = [
            {
                label: 'Account',
                content: <div className="slds-truncate" title="Account">
                    <a className="SLDS_a_color" href="#">{this.state.account_person.label}</a>
                </div>,
                truncate: true,
            },
            {
                label: 'Assigned To',
                content: <div className="slds-truncate" title="Owner">
                    <a className="SLDS_a_color" href="#">{this.state.owner.label}</a>
                </div>
            }
        ];

        return (
            <React.Fragment>
                <div className="slds-grid slds-grid_vertical ">
                    <div className="slds-col custom_page_header">

                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    <Icon
                                        assistiveText={{ label: 'User' }}
                                        category="standard"
                                        name="opportunity"
                                    />
                                }
                                label="Opportunity"
                                onRenderActions={this.actions}
                                title={this.state.page_title}
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>

                    <OpportunityPath opportunityStage={this.state.opportunityStage} activeStage={this.state.opportunity_status}/>
                    <div className="slds-col slds-m-top_medium ">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <Tabs id="tabs-example-default">
                                <TabsPanel label="Related">
                                    <div className="slds-grid slds-grid_vertical slds_my_card">
                                        <div className="slds-col slds-m-horizontal_medium">
                                            <IconSettings iconPath="/assets/icons">
                                                <div className="slds-grid slds-grid_vertical">
                                                    <OpportunityContacts contacts_data={this.state.contacts} get_opportunity_details={this.get_opportunity_details} opp_id={this.props.match.params.id}/>
                                                </div>
                                            </IconSettings>
                                        </div>

                                        <div className="slds-col slds-m-top_medium slds-m-horizontal_medium">
                                            <IconSettings iconPath="/assets/icons">
                                                <div className="slds-grid slds-grid_vertical">
                                                    <Card
                                                        id="ExampleCard"
                                                        headerActions={<Button label="New" onClick={this.handleDeleteAllItems} />}
                                                        heading="Items (0)"
                                                    // icon={<Icon category="standard" name="document" size="small" />}
                                                    >
                                                    </Card>
                                                </div>
                                            </IconSettings>
                                        </div>

                                        <div className="slds-col slds-m-top_medium slds-m-horizontal_medium">
                                            <IconSettings iconPath="/assets/icons">
                                                <div className="slds-grid slds-grid_vertical">
                                                    <Card
                                                        id="ExampleCard"
                                                        headerActions={<Button label="New" onClick={this.handleDeleteAllItems} />}
                                                        heading="Need Assesments (0)"
                                                    // icon={<Icon category="standard" name="document" size="small" />}
                                                    >
                                                    </Card>
                                                </div>
                                            </IconSettings>
                                        </div>
                                    </div>
                                </TabsPanel>
                                <TabsPanel label="Details">Details</TabsPanel>
                            </Tabs>

                        </IconSettings>
                    </div>
                </div >
            </React.Fragment >
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Opportunity);