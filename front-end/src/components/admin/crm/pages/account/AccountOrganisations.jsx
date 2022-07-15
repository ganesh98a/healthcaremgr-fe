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
import '../../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { openAddEditAccountModal } from './AccountCommon';
import TilesCard from './TilesCard';
import {
    Button,
    Icon,
    Card,
    Dropdown
} from '@salesforce/design-system-react';

/**
 * Class: AccountOrganisations
 */
class AccountOrganisations extends Component {
    
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            account_id: this.props.account_id ? this.props.account_id : '',
            account_name: this.props.account_name ? this.props.account_name : '',
            tile_heading: this.props.type == "sites" ? "Sites" : "Organisations",
            tile_icon: this.props.type == "sites" ? "household" : "account",
            add_site: this.props.type == "sites" ? true : false,
            account_organisation_id: '',
            account_organisations: [],
            account_organisations_count: 0,
            openCreateModal: false,
            pageSize: 3,
            page: 0,
            sorted: [],
            filtered: [],
            fetch_service_area: false
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * fetching the account_organisations
     */
    get_account_organisations_list = () => {
        var Request = { id: this.state.account_id, is_site: this.props.type == "sites" ? 1 : 0, pageSize: this.state.pageSize, page: this.state.page };
        postData('sales/Account/get_sub_organisation_details', Request).then((result) => {
            if (result.status) {
                this.setState({account_organisations: result.data, account_organisations_count: result.count});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        if(this.state.account_id) {
            this.get_account_organisations_list();
        }
    }

    /**
     * Open create account organisation modal
     */
    showAddEditModal() {
        this.setState({ openCreateModal: true, fetch_service_area: true });
    }

    /**
     * Close the modal when user save the account and refresh the organisations table
     */
    closeAddEditAccountModal = (status) => {
        this.setState({openCreateModal: false, fetch_service_area: false});

        if(status){
            this.get_account_organisations_list();
        }
    }

    /**
     * Render the account organisations table
     */
    renderTable() {

        if (this.state.account_organisations_count == 0) {
            return <React.Fragment />
        }

        return (
            <div className="slds-card__body_inner">
                <ul class="slds-grid slds-wrap slds-grid_pull-padded">
                    {this.state.account_organisations.map((val, index) => (
                        <li class="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3">
                            <TilesCard
                                id={val.id}
                                delete_id={val.id}
                                type={this.props.type}
                                url={"/admin/crm/organisation/details/" + val.id}
                                title={val.name}
                                title_details={[
                                    { label: "Service Area", value: val.service_area_selected_options[0]['label'] },
                                    { label: "Phone", value: val.phone },
                                    { label: "Status", value: val.status }
                                ]}
                                listCallback={this.get_account_organisations_list}                                
                                icon={{ category: "standard", name: this.state.tile_icon, size: "small" }}
                                account_id={this.state.account_id}
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
        if (this.state.account_organisations_count == 0) {
            return <React.Fragment />
        }

        var linkurl = `admin/crm/organisation/listing/hierarchy/${this.state.account_id}`;
        if(this.props.type == "sites") {
            linkurl = `admin/crm/organisation/listing/sitehierarchy/${this.state.account_id}`;
        }

        return (            
            <div className="slds-card__footer">
                <Link to={ROUTER_PATH + linkurl} className="slds-align_absolute-center default-underlined" id="view-all-organisations" title="View all account organisations" style={{ color: '#0070d2' }}>View all</Link>
            </div>    
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        var account_id = this.props.account_id;
        var add_site = this.props.type == "sites" ? true : false;

        // return
        return (
            <React.Fragment>
                {this.state.openCreateModal && openAddEditAccountModal(null, add_site, this.props.account_id, this.props.account_name, this.state.openCreateModal, this.closeAddEditAccountModal, this.props.type == "sites" ? "1" : "0")}
                <Card
                headerActions={<Button label="New" onClick={e => this.showAddEditModal()} />}
                heading={this.state.tile_heading + " ("+ this.state.account_organisations_count +")"}
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

export default connect(mapStateToProps, mapDispatchtoProps)(AccountOrganisations);
