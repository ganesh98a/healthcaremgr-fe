import React, { Component } from 'react';
import { postData } from 'service/common.js';
import { css } from '../../../oncallui-react-framework/services/common'



const INVOICE_TYPE=[{label: "Debtors", value: "1"}, {label: "SAMS", value: "2"}, {label: "COS (65+)", value: "3"}];
const INVOICE_BATCH=[{label: "Weekly", value: "1"}, {label: "Monthly", value: "2"}, {label: "Manual", value: "3"}];
class SiteBillingInfo extends Component {
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
/**
     * fetching the org/sub-org or the site information
     */
 get_account_details = () => {
    let org_id = this.props.match.params.id;
    this.setState({ loading: true });
    postData('sales/Account/get_account_details_for_view', { org_id }).then((result) => {
        if (result.status) {
            this.setState(result.data, () => {  
                if (result.data["billing_same_as_parent"] == 1) {
                    let {gst, payroll_tax, site_discount, communication_mode} = result.data["parent_billing_info"] || {gst: 0, payroll_tax: "1", site_discount: 0, communication_mode: 0};
                    this.setState({gst, payroll_tax, site_discount, communication_mode});
                }
                this.displaySiteBillingInformation()
                this.get_cost_book_options();
                this.setState({ loading: false }); });
          
        } else {
            this.setState({loading: false });
        }
    });
}
    componentDidMount() {
        this.orgBillingInformation();
        this.get_account_details();
        this.displaySiteBillingInformation()
    }

    displaySiteBillingInformation(){
        this.findAbInvoiceTypeNameByID(this.state.ab_invoice_type);
        this.findAbInvoiceBatchNameById(this.state.ab_invoice_batch);
        this.findCostCodeNameByID();
    }

    findAbInvoiceTypeNameByID(key){
       const filtered_result=INVOICE_TYPE.find((res)=>res.value==key);
       this.setState({ab_invoice_type_name:filtered_result && filtered_result.label||''})
    }

    findAbInvoiceBatchNameById(key){
        const filtered_result=INVOICE_BATCH.find((res)=>res.value==key);
        this.setState({ab_invoice_batch_name:filtered_result && filtered_result.label||''})
    }


    findCostCodeNameByID(){
        const filtered_result=this.props.cost_codes.find((res)=>res.value==this.props.ab_cost_code);
        this.setState({ab_cost_code_name:filtered_result && filtered_result.label||''})
     }


    componentDidUpdate(prevProps) {
        if (this.props.billing_info && JSON.stringify(this.props.billing_info) != JSON.stringify(this.state.billing_info)) {
            this.setState({...this.props.billing_info, billing_info: this.props.billing_info})
        }
        if(this.props.update_billing_info != prevProps.update_billing_info){
           
                 var org_id = this.props.match.params.id;
                  this.get_account_details(org_id);
            
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

       /**
     * fetching the cost book
     */
        get_cost_book_options = () => {
            let org_id = this.props.match.params.id;
            let cost_code = this.state.ab_cost_code || (this.state.cost_codes && this.state.cost_codes.length && this.state.cost_codes[0]['value'] || '');
            let service_area = (this.state.service_area_selected_options && this.state.service_area_selected_options.length && this.state.service_area_selected_options[0]['value'] || '');
            let site_discount = this.state.ab_site_discount;
            this.setState({ loading: true });
            postData('sales/Account/get_cost_book_options', { org_id: org_id, cost_code: cost_code, service_area: service_area, site_discount: site_discount }).then((result) => {
                if (result.status) {
                    let cost_book = result.data;
                    let ab_cost_book =(cost_book && cost_book.length && cost_book[0]['label'] || '');
                    this.setState({ cost_book_options: result.data, ab_cost_book: ab_cost_book });
                    this.setState({ loading: false });
                } else {
                    this.setState({ loading: false, ab_cost_book: '' });
                }
            });
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
                <React.Fragment>
                    <div className="col col col-sm-12" style={styles.heading}>
                        <h3 style={styles.headingText}>Basic Billing information</h3>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Invoice To</label>
                            <div className="slds-form-element__control">
                            {this.state.invoice_to || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Billing Address</label>
                            <div className="slds-form-element__control">
                            {this.state.billing_address || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Account Payable Phone</label>
                            <div className="slds-form-element__control">
                            {this.state.payable_phone || 'N/A'}
                            </div>
                        </div>
                    </div> 
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Account Payable Email</label>
                            <div className="slds-form-element__control">
                                {this.state.payable_email || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                            Preferred Communication Mode</label>
                            <div className="slds-form-element__control">
                                {com_modes[this.state.communication_mode] ? com_modes[this.state.communication_mode] : "Email"}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >Payroll Tax</label>
                            <div className="slds-form-element__control">
                                {this.state.payroll_tax === "1"? "Applicable" : "Not Applicable"}
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

                    <div className="col col col-sm-12" style={styles.heading}>
                        <h3 style={styles.headingText}>Additional Billing information</h3>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Invoice Type</label>
                            <div className="slds-form-element__control">
                              {this.state.ab_invoice_type_name || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Invoice Batch</label>
                            <div className="slds-form-element__control">
                            {this.state.ab_invoice_batch_name   || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Service Area</label>
                            <div className="slds-form-element__control">
                              {this.props.service_area_selected_options && this.props.service_area_selected_options[0]["label"]|| 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Preferred Support Worker Area</label>
                            <div className="slds-form-element__control">
                            {this.props.selected_support_area_worker && this.props.selected_support_area_worker.length && this.props.selected_support_area_worker[0]["label"]  || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Cost Code</label>
                            <div className="slds-form-element__control">
                              {this.state.ab_cost_code_name || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Site Discount</label>
                            <div className="slds-form-element__control">
                            {this.state.ab_site_discount =='1' ? 'Applicable':'Not Applicable'|| 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Cost Book</label>
                            <div className="slds-form-element__control">
                              {this.state.ab_cost_book_label|| 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Confirmed Billing Information</label>
                            <div className="slds-form-element__control">
                            {this.state.confirm_bi=='1' ? 'Yes':'No'|| 'N/A'}
                            </div>
                        </div>
                    </div>
                   
                  
                </React.Fragment>
        )
    }
}
export default SiteBillingInfo;