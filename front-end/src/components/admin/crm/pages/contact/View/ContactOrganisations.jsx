import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import '../../../../scss/components/admin/crm/pages/contact/ListContact.scss'
// import { openAddEditContactModal } from './ContactCommon';
import TilesCard from './TilesCard';
import {
    Button,
    Icon,
    Card,
    Dropdown
} from '@salesforce/design-system-react';

/**
 * Class: ContactOrganisations
 */
class ContactOrganisations extends Component {
    
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            contact_id: this.props.contact_id ? this.props.contact_id : '',
            contact_name: this.props.contact_name ? this.props.contact_name : '',
            tile_heading: this.props.type == "sites" ? "Sites" : "Organisations",
            tile_icon: this.props.type == "sites" ? "household" : "account",
            is_site: this.props.type == "sites" ? true : false,
            contact_organisation_id: '',
            contact_organisations: [],
            contact_organisations_count: 0,
            openCreateModal: false,
            pageSize: 3,
            page: 0,
            sorted: [],
            filtered: []
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * fetching the contact accounts
     */
    get_contact_accounts_list = () => {
        var Request = { id: this.state.contact_id, account_type: this.props.account_type, is_site: this.props.type == "sites" ? 1 : 0, pageSize: this.state.pageSize, page: this.state.page };
        postData('sales/Contact/get_contact_accounts_list', Request).then((result) => {
            if (result.status) {
                this.setState({contact_organisations: result.data, contact_organisations_count: result.count});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        if(this.state.contact_id) {
            this.get_contact_accounts_list();
        }
    }

    /**
     * Render the contact organisations table
     */
    renderTable() {

        if (this.state.contact_organisations_count == 0) {
            return <React.Fragment />
        }

        return (
            <div className="slds-card__body_inner">
                <ul class="slds-grid slds-wrap slds-grid_pull-padded">
                    {this.state.contact_organisations.map((val, index) => (
                        <li class="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3">
                            <TilesCard
                                id={val.id}
                                delete_id={val.id}
                                is_site={this.state.is_site}
                                url={"/admin/crm/organisation/details/" + val.account_id}
                                title={val.name}
                                title_details={[
                                    { label: "Role", value: val.role_name + (val.is_primary == 1 ? ' (Primary)' : '') },
                                    { label: "Service Type", value: val.service_type_label },
                                    { label: "Status", value: val.status }
                                ]}
                                listCallback={this.get_contact_accounts_list}
                                
                                icon={{ category: "standard", name: this.state.tile_icon, size: "small" }}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.contact_organisations_count == 0) {
            return <React.Fragment />
        }

        var linkurl = `admin/crm/organisation/related-listing/0/${this.state.contact_id}`;
        if(this.props.type == "sites") {
            linkurl = `admin/crm/organisation/related-listing/1/${this.state.contact_id}`;
        }

        return (            
            <div className="slds-card__footer">
                <Link to={ROUTER_PATH + linkurl} className="slds-align_absolute-center default-underlined" id="view-all-organisations" title={"View all Contact " + this.state.tile_heading} style={{ color: '#0070d2' }}>View all</Link>
            </div>    
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        // return
        return (
            <React.Fragment>
                <Card
                headerActions={<Button label="New" />}
                heading={this.state.tile_heading + " ("+ this.state.contact_organisations_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" size="small" name={this.state.tile_icon} />}
                bodyClassName="body-no-padding"
                >
                {this.renderTable()}
                {this.renderFooter()}
                </Card>
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

export default connect(mapStateToProps, mapDispatchtoProps)(ContactOrganisations);
