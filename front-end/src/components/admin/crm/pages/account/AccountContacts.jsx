import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import 'react-table/react-table.css'
import { postData, toastMessageShow } from 'service/common.js';
import { ROUTER_PATH } from 'config.js';
import '../../../scss/components/admin/crm/pages/contact/ListContact.scss'
import ManageAccountRoles from './ManageAccountRoles';
import {openAddEditAccountContactModal} from './AccountCommon';
import TilesCard from './TilesCard';
import {
    Button,
    Icon,
    Card
} from '@salesforce/design-system-react';


/**
 * Class: AccountContacts
 */
class AccountContacts extends Component {
    
    /**
     * setting the initial prop values
     */
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            account_id: this.props.account_id ? this.props.account_id : '',
            account_name: this.props.account_name ? this.props.account_name : '',
            account_type: this.props.account_type ? this.props.account_type : '',
            account_contact_id: '',
            account_contacts: [],
            account_contacts_count: 0,
            openCreateModal: false,
            pageSize: 3,
            page: 0
        }
    }

    /**
     * fetching the account_contacts
     */
    get_account_contacts_list = () => {
        var Request = { id: this.state.account_id, account_type: this.state.account_type, pageSize: this.state.pageSize, page: this.state.page };
        postData('sales/Account/get_account_contacts_list', Request).then((result) => {
            if (result.status) {
                this.setState({account_contacts: result.data, account_contacts_count: result.count});
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
            this.get_account_contacts_list();
        }
    }

    /**
     * Open create account contact modal
     */
    showAddEditModal() {
        this.setState({ openCreateModal: true });
    }

    /**
     * Close the modal when user save the account contacts
     */
    closeAddEditModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_account_contacts_list();

            if(this.props.get_account_details) {
                this.props.get_account_details();
            }
        }
    }

    /**
     * Render the account contacts table
     */
    renderTable() {
        var account_id = this.props.account_id;

        if (this.state.account_contacts_count == 0) {
            return <React.Fragment />
        }

        return (
            <div className="slds-card__body_inner">
                <ul class="slds-grid slds-wrap slds-grid_pull-padded">
                    {this.state.account_contacts.map((val, index) => (
                        <li class="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3">
                            <TilesCard
                                id={val.id}
                                delete_id={val.id}
                                type="contacts"
                                url={"/admin/crm/contact/details/" + val.person_id}
                                title={val.contact_name}
                                title_details={[
                                    { label: 'Role', value: val.role.label + (val.is_primary == 1 ? ' (Primary)' : '') },
                                    { label: "Email", value: val.email }, 
                                    { label: "Phone", value: val.phone },
                                ]}
                                icon={{ category: "standard", name: "contact", size: "small" }}
                                listCallback={this.get_account_contacts_list}
                                org_details={val}
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
        if (this.state.account_contacts_count == 0) {
            return <React.Fragment />
        }

        return (            
            <div className="slds-card__footer">
                <Link to={ROUTER_PATH + `admin/crm/contact/related-listing/${this.state.account_type}/${this.state.account_id}`} className="slds-align_absolute-center default-underlined" id="view-all-contacts" title="View all contacts" style={{ color: '#0070d2' }}>View all</Link>
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
                headerActions={<Button label="New" onClick={() => this.showAddEditModal()} />}
                heading={"Contacts ("+ this.state.account_contacts_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" size="small" name="contact" />}
                bodyClassName="body-no-padding"
                >
                {openAddEditAccountContactModal(this.props.account_id, this.props.account_type, this.state.openCreateModal, this.closeAddEditModal)}
                {this.renderTable()}
                {this.renderFooter()}
                </Card>
            </React.Fragment>
        )
    }
}

export default AccountContacts;
