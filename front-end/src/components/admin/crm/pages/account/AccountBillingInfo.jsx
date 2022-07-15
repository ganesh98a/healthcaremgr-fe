import React, { Component } from 'react';
import { postData } from 'service/common.js';
import { css } from '../../../oncallui-react-framework/services/common'


class AccountBillingInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            communication_mode: props.communication_mode,
            invoice_to: props.invoice_to,
            gst: props.gst,
            payroll_tax: props.payroll_tax,
            site_discount: props.site_discount,
            billing_info: {...this.props.billing_info}
        }
    }

    componentDidMount() {
        this.orgBillingInformation();
    }

    componentDidUpdate(p,s) {
        if (this.props.match.params.id != this.props.org_id) {            
            this.orgBillingInformation();
        } else if (this.props.update_billing_info !== this.state.update_billing_info) {
            this.setState({update_billing_info: this.props.update_billing_info}, () => {
                this.orgBillingInformation();
            })
        }
    }

    orgBillingInformation() {
        this.setState({loading: true});
        let org_id = this.props.match.params.id;
        if (org_id) {
            postData('sales/Account/get_organisation_billing_info', { org_id }).then((result) => {
                this.setState({loading_billing: false});
                if (result.status) {
                    this.setState({...result.data, billing_info: result.data});
                }
            })
        }
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
        let com_modes = {"1" : "Email", "2" : "One Email per Invoice", "3" : "Post"}
        return (
                this.state.org_billing && <React.Fragment>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Invoice To</label>
                            <div className="slds-form-element__control">
                            {this.props.invoice_to || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Billing Address</label>
                            <div className="slds-form-element__control">
                            {this.props.billing_address || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Account Payable Phone</label>
                            <div className="slds-form-element__control">
                            {this.props.payable_phone || 'N/A'}
                            </div>
                        </div>
                    </div> 
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Account Payable Email</label>
                            <div className="slds-form-element__control">
                                {this.props.payable_email || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                            Preferred Communication Mode</label>
                            <div className="slds-form-element__control">
                                {com_modes[this.state.org_billing.communication_mode] ? com_modes[this.state.org_billing.communication_mode] : ""}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Payroll Tax</label>
                            <div className="slds-form-element__control">
                                {this.state.org_billing.payroll_tax === "1"? "Applicable" : "Not Applicable"}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >GST</label>
                            <div className="slds-form-element__control">
                                {this.state.gst === "1"? "Applicable" : "Not Applicable"}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Site Discount</label>
                            <div className="slds-form-element__control">
                                {this.state.site_discount === "1"? "Applicable" : "Not Applicable"}
                            </div>
                        </div>
                    </div>
                </React.Fragment> || ""
        )
    }
}
export default AccountBillingInfo;