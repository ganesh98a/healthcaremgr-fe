import React, { Component } from 'react';
import { connect } from 'react-redux'
import { getAddressForViewPage, css } from '../../../oncallui-react-framework/services/common'
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';
import jQuery from 'jquery';

class SiteDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this.rootRef = React.createRef()
    }
    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
       
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }
    render() {
        const styles = css({
            root: {
                border: 'none',
                paddingTop: 0,
            },
            heading: {
                marginBottom: 15,
                marginTop: 8,
            },
            headingText: {
                fontSize: 15,
                fontWeight: 'normal',
            },
            col: {
                marginBottom: 15,
            }
        })

        return (
            <TabsPanel label="Details">
                <div className="row slds-box" style={styles.root}>
                    <div className="col col col-sm-12" style={styles.heading}>
                        <h3 style={styles.headingText}>Account information</h3>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Account Name</label>
                            <div className="slds-form-element__control">
                            {this.props.account_name || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Parent Account</label>
                            <div className="slds-form-element__control">
                            {this.props.parent_org ? this.props.parent_org.label || "N/A" : 'N/A'}
                            </div>
                        </div>
                    </div>                 
                 
                   
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                Service Area</label>
                            <div className="slds-form-element__control">
                                {this.props.service_area_selected_options.length>0 ?this.props.service_area_selected_options[0]['label']: 'N/A'}
                            </div>
                        </div>
                    </div>                    
                    <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                            <label className="slds-form-element__label" >Phone</label>
                            <div className="slds-form-element__control">
                                {this.props.primary_phone && <p>{this.props.primary_phone}</p> || ''}
                                {this.props.secondary_phone && <p>{this.props.secondary_phone}</p> || ''}
                                {!this.props.primary_phone && !this.props.secondary_phone || ''}
                            </div>
                        </div>
                    </div>
          
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Email</label>
                            <div className="slds-form-element__control">
                                {this.props.primary_email && <p>{this.props.primary_email}</p> || ''}
                                {this.props.secondary_email && <p>{this.props.secondary_email}</p> || ''}
                                {!this.props.primary_email && !this.props.secondary_email || ''}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Fax</label>
                            <div className="slds-form-element__control">
                                {this.props.fax || 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Shipping Address</label>
                            <div className="slds-form-element__control">
                                {getAddressForViewPage(this.props.shipping_address, this.props.shipping_unit_number)}
                            </div>
                        </div>
                    </div>

                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Status</label>
                            <div className="slds-form-element__control">
                                {this.props.status == 1 ? "Active" : "Inactive"}
                            </div>
                        </div>
                    </div>

                    <div className="col col col-sm-12" style={styles.heading}>
                        <h3 style={styles.headingText}>Billing Information</h3>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Invoice To</label>
                            <div className="slds-form-element__control">
                                {this.props.invoice_to || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Accounts Payable Phone</label>
                            <div className="slds-form-element__control">
                                {this.props.payable_phone || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Accounts Payable Email</label>
                            <div className="slds-form-element__control">
                                {this.props.payable_email || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Billing Address</label>
                            <div className="slds-form-element__control">
                                {getAddressForViewPage(this.props.billing_address, this.props.billing_unit_number)}
                            </div>
                        </div>
                    </div>
                    
                    
                </div>
            </TabsPanel >
        )
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(SiteDetails);