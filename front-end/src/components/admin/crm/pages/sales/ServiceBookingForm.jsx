import { Button, IconSettings, Input, Modal } from '@salesforce/design-system-react';
import moment from 'moment';
import React from 'react';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import { handleChangeSelectDatepicker, queryOptionData, toastMessageShow, postData } from 'service/common.js';
//import { handleChangeSelectDatepicker, queryOptionData } from '../../../../../service/common';
import "../../../../../service/custom_script.js";
import '../../../../../service/jquery.validate.js';
import { SLDSISODatePicker } from '../../../salesforce/lightning/SLDSISODatePicker';
import SLDSSelect from '../../../salesforce/lightning/SLDSReactSelect';
import '../../../scss/components/admin/crm/pages/sales/ServiceBookingForm.scss';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
/**
 * @extends {React.Component<typeof ServiceBookingForm.defaultProps>}
 */


class ServiceBookingForm extends React.Component {

   static THEME_LIGHTNING = 'lightning'
   static THEME_DEFAULT = 'default'


   static defaultProps = {


      /**
       * @type {'default' | 'lightning'}
       */
      theme: ServiceBookingForm.THEME_LIGHTNING,

      /**
       * @type {any}
       */
      loading: false,
      isSubmitting: false,
      id: "create_user",
      disabled: false,

      /**
       * @type { string | number | JSX.Element }
       */
      heading: undefined,

      /**
       * @type { string | number | JSX.Element }
       */
      tagLine: undefined,

      className: `ServiceBookingForm slds`
   }

   constructor(props) {
      super(props);
      this.state = {
         loading: false,

         servicebookingcreator_options: [
            { value: 1, label: 'Participant/Agent', sda_agencey_name: false },
            { value: 2, label: 'ONCALL', other: true },
         ],
         service_agreement_type_options: [],
         actual_start_time: '',
         date_submitted: '',
         ServiceBookingErrMsg: '',
         showTimeErr: [],
         statusOptions: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'proposed', label: 'Proposed' }
         ],
         is_received_signed_service_booking: false,
         service_booking_number: null,
         funding: null,
         service_booking_creator: this.props.service_booking_creator,
         service_booking_total: null,
         related_service_agreement_id: this.props.service_agreement_id,
         funding_by_service_agreement_type: [],
         is_portal_managed: this.props.is_portal_managed,
         funding_field_error_message: '',
         id_to_update: this.props.id_to_update,
         isUpdate: this.props.isUpdate,
         service_agreement_contracts: []
      }
      this.datepickers = {
         date_submitted: React.createRef()
      }
   }
   /**
    * mounting all the components
    */
   componentDidMount() {
      if (this.props.isUpdate) {
         this.setState({ loading: true }, () => {
            this.getServiceBookingById()
         })
      }
      else {
         this.getOptionsServiceAgreementType();
      }
   }

   /**
    * to get existing service booking to update
    */

   getServiceBookingById = () => {
      postData('sales/ServiceBooking/get_service_booking_by_id', { service_booking_id: this.props.id_to_update }).then(items => {
         this.setState({ ...items[0] }, () => {
            this.onServiceAgreementContractChange(items[0]["service_agreement_attachment_id"]);
         })
      }).then(() => {
         this.getOptionsServiceAgreementType();;
      });
   }

   /**
    * to get service_agreement_types from db
    */
   getOptionsServiceAgreementType = () => {
      queryOptionData(1, "sales/ServiceBooking/get_service_agreement_type_list", false, 0, 1)
         .then((res) => {
            this.setState({ service_agreement_type_options: res.options })
         }).then((res) => {
            this.getTotalFundingByAgreementType();
         })
   }

   /**
    * to get total funding grouped by service agreement type from db
    */

   getTotalFundingByAgreementType = () => {
      postData('sales/ServiceBooking/get_funding_sum_by_service_agreement_type', { service_agreement_id: this.props.service_agreement_id }).then(items => {
         this.setState({ funding_by_service_agreement_type: items }, () => {
            this.handleServiceAgreementType(this.state.service_agreement_type);
            this.setState({ loading: false })
         })

      });
   }
   /**
    * method to validate the service booking is whole number or not
    */

   handleServiceBookingNumber = e => {
      let wholeNumberRegex = /^\d+$/;
      let isWholeNumber = e.target.value.match(wholeNumberRegex);
      if (isWholeNumber || e.target.value.trim() == '') {
         this.setState({ ServiceBookingErrMsg: '' })
      }
      else {
         this.setState({ ServiceBookingErrMsg: 'Whole numbers only allowed' })
      }
      this.setState({ service_booking_number: e.target.value })
   }

   /**
    * handling the change event of the data picker fields
    */
   handleChangeDatePicker = key => (dateYmd, e, data) => {
      let date = moment(dateYmd);
      if (date.isValid()) {
         this.setState({ date_submitted: dateYmd.split(' ')[0] })
      }
      else {
         toastMessageShow("Enter Valid Date", e)
      }


   }

   /**
   * get service_booking_total value from funding_by_service_agreement_type
   */

   handleServiceAgreementType = (user_selected_type) => {

      this.setState({ service_agreement_type: user_selected_type })
      if (this.state.funding_by_service_agreement_type.length > 0) {
         const funding_type_result = this.state.funding_by_service_agreement_type.find((value) => {
            return value.service_agreement_type === user_selected_type
         })
         if (funding_type_result) {
            this.setState({ service_booking_total: funding_type_result['total'] })
         } else {
            this.setState({ service_booking_total: null })
         }

         if (this.state.isUpdate) {
            let total = funding_type_result['total'] - this.state.funding;
            this.setState({ service_booking_total: total })
         }
      }
      if (user_selected_type) {
         postData('sales/ServiceAgreement/get_service_agreement_contracts', { service_agreement_type: user_selected_type, service_booking_id: this.props.id_to_update, service_agreement_id: this.props.service_agreement_id }).then(items => {
            this.setState({ service_agreement_contracts: items });
         });
      }

   }

   handleFunding = (e) => {

      if (e.target.value.match(/^\d+$/) || e.target.value.match(/\d+\.\d\d/) || e.target.value.trim() == '') {
         this.setState({ funding_field_error_message: '' })
      }
      else {
         this.setState({ funding_field_error_message: 'numbers with two decimal only allowed' })
      }
      this.setState({ funding: e.target.value })
   }

   onServiceAgreementContractChange(service_agreement_attachment_id) {
      this.setState({ service_agreement_contract: service_agreement_attachment_id });
      if (service_agreement_attachment_id) {
         postData('sales/ServiceAgreement/get_service_contract_funding', { service_agreement_attachment_id, service_booking_id: this.props.id_to_update }).then(res => {
            this.setState({ service_agreement_funding: res.amount });
         });
      }
   }
   render() {
      return (
         <>
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
               <Modal
                  isOpen={this.props.open}
                  footer={[
                     <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.onCancel()} />,
                     <Button disabled={this.state.loading} label="Save" variant="brand" onClick={e => this.props.onSubmit(e, this.state)} />,
                  ]}
                  heading={this.props.heading}
                  size="small"
                  className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                  onRequestClose={() => this.props.onCancel()}
                  dismissOnClickOutside={false}
               >
                  <section className="manage_top" >
                     <div className="container-fluid">
                        <form id={this.props.id} autoComplete="off" className="slds_form">
                           <div className="row py-3">
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label">
                                       <abbr className="slds-required" title="required">*</abbr>Service Booking Number
                  </label>
                                    <div className="slds-form-element__control">
                                       <input className="slds-input"
                                          type="text"
                                          name="service-booking-number"
                                          placeholder="Service Booking Number"
                                          onChange={(e) => this.handleServiceBookingNumber(e)}
                                          value={this.state.service_booking_number || ''}
                                          data-rule-required="true"
                                       />
                                       <span>{this.state.ServiceBookingErrMsg &&
                                          <span style={{ color: "red" }}>{this.state.ServiceBookingErrMsg}</span>}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                       <abbr className="slds-required" title="required">* </abbr>Service Booking Creator</label>
                                    <div className="slds-form-element__control">
                                       <SLDSSelect
                                          name="service_booking_creator"
                                          className="custom_select default_validation"
                                          simpleValue={true}
                                          searchable={true}
                                          placeholder="Please Select"
                                          clearable={false}
                                          required={true}
                                          options={this.state.servicebookingcreator_options}
                                          onChange={(e) =>
                                             this.setState({ 'service_booking_creator': e })}
                                          value={this.state.service_booking_creator}
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="row py-2">
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">
                                       <abbr className="slds-required" title="required">* </abbr>
                                       Service Agreement Type
                                    </label>
                                    <div className="slds-form-element__control">
                                       <div className="">
                                          <SLDSSelect
                                             simpleValue={true}
                                             disabled={this.state.isUpdate ? true : false}
                                             className="custom_select default_validation"
                                             options={this.state.service_agreement_type_options}
                                             onChange={
                                                (value) => this.handleServiceAgreementType(value)
                                             }
                                             value={this.state.service_agreement_type || ''}
                                             clearable={false}
                                             searchable={false}
                                             placeholder="Please Select"
                                             required={true}
                                             name="Service Agreement Type"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                       <abbr className="slds-required" title="required">* </abbr>Signed Contracts</label>
                                    <div className="slds-form-element__control">
                                       <SLDSSelect
                                          name="service_agreement_contract"
                                          className="custom_select default_validation"
                                          simpleValue={true}
                                          searchable={true}
                                          placeholder="Please Select"
                                          clearable={false}
                                          required={true}
                                          options={this.state.service_agreement_contracts}
                                          onChange={(value) => this.onServiceAgreementContractChange(value)}
                                          value={this.state.service_agreement_contract}
                                          disabled={!this.state.service_agreement_contracts}
                                          hasInputSpinner
                                       />                                       
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="row py-2">
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label">
                                       <abbr className="slds-required" title="required">* </abbr>
                  Date Submitted</label>
                                    <div className="slds-form-element__control"
                                    >
                                       <SLDSISODatePicker
                                          ref={this.datepickers.date_submitted}
                                          className="customer_signed_date"
                                          placeholder="Date Submitted"
                                          onChange={this.handleChangeDatePicker('date_submitted')}
                                          value={this.state.date_submitted}
                                          input={<Input name="date_submitted" />}
                                          inputProps={{
                                             name: "date_submitted",
                                             required: true
                                          }}
                                          relativeYearFrom={0}
                                          relativeYearTo={3}
                                          onCalendarFocus={(event, data) => {
                                             if (this.props.action) {
                                                const dataAsArray = Object.keys(data).map((key) => data[key]);
                                                this.props.action('onCalendarFocus')(event, data, ...dataAsArray);
                                             }
                                          }}
                                          tabIndex={-1}
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="row py-2">
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label">
                                       <abbr className="slds-required">*</abbr>
                  Funding($)
                  </label>
                                    <div className="slds-form-element__control">
                                       <input className="slds-input" type="text"
                                          data-rule-required="true"
                                          name="funding" placeholder="Funding"
                                          onChange={(e) => this.handleFunding(e)}
                                          value={this.state.funding || ''}
                                       />
                                       <span>{this.state.funding_field_error_message &&
                                          <span style={{ color: "red" }}>{this.state.funding_field_error_message}</span>}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label">
                                       <abbr className="slds-required" title="required">* </abbr>Status
               </label>
                                    <div className="slds-form-element__control">
                                       <SLDSSelect
                                          required={false} simpleValue={true}
                                          className="custom_select default_validation"
                                          options={this.state.statusOptions}
                                          onChange={(value) =>
                                             handleChangeSelectDatepicker(this, value, 'status')}
                                          value={this.state.status || ''}
                                          clearable={false}
                                          searchable={false}
                                          placeholder="Please Select"
                                          inputRenderer={(props) => <input type="text" name={"status"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="row py-2">
                              <div className="col-sm-6">
                                 <div className="slds-form-element">
                                    <div className=" slds-form-element__control slds-checkbox mt-2 ml-2">
                                       <input type="checkbox" name="not_applicable" id="not_applicable_chkbox"
                                          onChange={(e) => { this.setState({ is_received_signed_service_booking: !this.state.is_received_signed_service_booking }) }} checked={this.state.is_received_signed_service_booking == "0" ? false : true} />
                                       <label className="slds-checkbox__label" htmlFor="not_applicable_chkbox">
                                          <span className="slds-checkbox_faux"></span>
                                          <span className="slds-form-element__label">
                                             Received Signed Service Booking</span>
                                       </label>
                                    </div>
                                 </div>
                              </div>
                              <div className="col-sm-6 mt-1">
                                 <div className="slds-form-element">
                                    <label className="slds-form-element__label">
                                       Service Booking Total($)
                  </label>
                                    <div className="slds-form-element__control">
                                       {this.state.status !== 'inactive' && !this.state.funding_field_error_message ? Number(this.state.service_agreement_funding || 0) + Number(this.state.funding) : this.state.service_agreement_funding || ''}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </form>
                     </div>
                  </section>
               </Modal>
            </IconSettings>
         </>
      );
   }

}

export default ServiceBookingForm