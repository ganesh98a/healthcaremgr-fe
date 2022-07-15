import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from "moment";
import { getAddressForViewPage } from '../../../../oncallui-react-framework/services/common';

class ViewContact extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="row py-3">
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">First Name</label>
                            <div className="slds-form-element__control">
                                {this.props.firstname || "N/A"}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Middle Name</label>
                            <div className="slds-form-element__control">
                                {this.props.middlename || "N/A"}
                            </div>
                        </div>
                    </div>
                    </div>
                    <div className="row py-3">
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Last Name</label>
                            <div className="slds-form-element__control">
                                {this.props.lastname || "N/A"}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Previous Name</label>
                            <div className="slds-form-element__control">
                                {this.props.previous_name || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="select-01">Gender</label>
                            <div className="slds-form-element__control">
                                {this.props.gender_label || "N/A"}
                            </div>
                        </div>

                    </div>

                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Date of Birth</label>
                            <div className="slds-form-element__control">
                                {this.props.date_of_birth != "" && this.props.date_of_birth != "0000-00-00" ? moment(this.props.date_of_birth).format("DD/MM/YYYY") : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Phoness</label>
                            {this.props.PhoneInput.length > 0 ?
                                <>
                                    {this.props.PhoneInput.map((PhoneInput, idx) => (
                                        <div className="slds-form-element__control mb-1 input_plus__" key={idx + 1}>
                                            {(PhoneInput.phone ? "+61 " +PhoneInput.phone : "N/A") || "N/A"} ({idx === 0 ? "Primary" : "Secondary"})
                                        </div>
                                    ))}
                                </>
                                : <div className="slds-form-element__control mb-1 input_plus__">
                                    N/A
                                    </div>
                            }
                        </div>

                    </div>

                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Email</label>
                            {this.props.EmailInput.length > 0 ?
                                <>{this.props.EmailInput.map((EmailInput, idx) => (
                                    <div className="slds-form-element__control mb-1 input_plus__" key={idx + 1}>
                                        {EmailInput.email || "N/A"} ({idx === 0 ? "Primary" : "Secondary"})
                                    </div>
                                ))}
                                </>
                                : <div className="slds-form-element__control mb-1 input_plus__">
                                    N/A
                                    </div>
                            }
                        </div>

                    </div>
                </div>

                <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Address</label>
                            <div className="slds-form-element__control">
                                {this.props.contact_address && this.props.contact_address.is_manual_address=='1'? ( this.props.contact_address.manual_address ? getAddressForViewPage(this.props.contact_address.manual_address, this.props.contact_address.unit_number) : 'N/A' ):                                
                                this.props.contact_address ? getAddressForViewPage(this.props.contact_address.address, this.props.contact_address.unit_number) : 'N/A'}
                            </div>
                        </div>

                    </div>
                    <div className="col-lg-6 col-sm-6">



                    </div>


                </div>

                <div className="row py-2">

                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Is an interpreter required?</label>
                            <div className="slds-form-element__control">
                                {this.props.interpreter_val || "N/A"}
                            </div>
                        </div>

                    </div>
                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Preferred Communication Method</label>
                            <div className="slds-form-element__control">
                                {this.props.communication_method_val || "N/A"}
                            </div>
                        </div>



                    </div>


                </div>

                <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Aboriginal or Torres Strait Islander heritage</label>
                            <div className="slds-form-element__control">
                                {this.props.aboriginal_val || "N/A"}
                            </div>
                        </div>

                    </div>

                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Cultural Practices Observed</label>
                            <div className="slds-form-element__control">
                                {this.props.cultural_practices || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Religion</label>
                            <div className="slds-form-element__control">
                                {this.props.religion || "N/A"}
                            </div>
                        </div>

                    </div>

                    <div className="col-lg-6 col-sm-6">

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="select-01">Source</label>
                            <div className="slds-form-element__control">
                                {this.props.source_type_label || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>



                <div className="row py-1">
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="select-01">Type</label>
                            <div className="slds-form-element__control">
                                {this.props.contact_type_label || "N/A"}
                            </div>
                        </div>

                    </div>
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="select-01">Status</label>
                            <div className="slds-form-element__control">
                                {this.props.status_label || "N/A"}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="row py-1 mb-3">
                    <div className="col-lg-6 col-sm-6">
                        {
                            // Display NDIS if contact is account
                            (this.props.ndis_number || [1, '1'].indexOf(this.props.contact_is_account) >= 0) && (
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">NDIS number</label>
                                    <div className="slds-form-element__control">
                                        {this.props.ndis_number || "N/A"}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>


            </React.Fragment>
        );
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

export default connect(mapStateToProps, mapDispatchtoProps)(ViewContact);