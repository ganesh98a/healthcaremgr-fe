import React, { Component } from 'react';
import Select from 'react-select-plus';
import { BrowserRouter as Router, Link } from "react-router-dom";
import { connect } from 'react-redux'
import { getOptionsSuburb } from 'service/common.js';
import ReactGoogleAutocomplete from './../../externl_component/ReactGoogleAutocomplete';

class CreateNewCustomer extends React.Component {

    render() {
        if (this.props.suburb) {
            var suburb_object = { label: this.props.suburb, value: this.props.suburb }
        } else {
            var suburb_object = [];
        }
        return (
            <React.Fragment>

                <div className="row">
                    <div className="col-lg-12">
                        <div className=" py-4">
                            <span className="back_arrow">
                                <Link to={"/admin/finance/quote_dashboard"}><span className="icon icon-back1-ie"></span></Link>
                            </span>
                        </div>

                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-8">
                                    <div className="h-h1 color">{this.props.showPageTitle}</div>
                                </div>
                                <div className="col-lg-4 d-flex align-self-center">
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


                <div className="row d-flex justify-content-center mt-5">
                    <div className="col-lg-12">
                        <div className="Bg_F_moule">
                            <div className="row d-flex justify-content-center">
                                <div className="col-lg-8 col-sm-12">
                                    <form id="create_customer" method="post">
                                        <div className="row mt-5">
                                            <div className="col-lg-6 col-sm-6">
                                                <label className="label_2_1_1">Service for</label>
                                                <input type="text" name="name" onChange={(e) => this.props.handleChange(e)} value={this.props.name || ''} required={true} maxLength="100" />
                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <label className="label_2_1_1">Category</label>
                                                <div className="sLT_gray left left-aRRow">
                                                    <Select simpleValue={true}
                                                        className="default_validation "
                                                        name="form-field-name"
                                                        value={this.props.customerCategoryId}
                                                        options={this.props.customer_catogory}
                                                        placeholder="[Select Category]"
                                                        onChange={(e) => this.props.stateChange('customerCategoryId', e)}
                                                        clearable={false}
                                                        searchable={false}
                                                        inputRenderer={() => <input type="text" readOnly={true} className="define_input" name={"customerCategoryId"} required={true} value={this.props.customerCategoryId || ''} />}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row mt-5">
                                            <div className="col-lg-6 col-sm-6">
                                                <label className="label_2_1_1">Contact Name</label>
                                                <input type="text" name="contact_name" onChange={this.props.handleChange} value={this.props.contact_name || ''} maxLength="100" />
                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <label className="label_2_1_1">Company Name</label>
                                                <input type="text" name="company_name" onChange={this.props.handleChange} value={this.props.company_name || ''} maxLength="100" />
                                            </div>
                                        </div>


                                        <div className="row mt-5">
                                            <div className="col-lg-8 col-sm-8">
                                                <label className="label_2_1_1">Email Address</label>
                                                <input type="email" name="email" onChange={this.props.handleChange} value={this.props.email || ''} required={true} maxLength="200" />
                                            </div>
                                        </div>
                                        <div className="row mt-5">
                                            <div className="col-lg-6 col-sm-6">
                                                <label className="label_2_1_1">Primary Contact Number</label>
                                                <input type="text" name="primary_phone" onChange={this.props.handleChange} value={this.props.primary_phone || ''} required={true} data-rule-phonenumber={true} maxLength="30" />
                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <label className="label_2_1_1">Additional Contact Number</label>
                                                <input type="text" name="seconday_phone" onChange={this.props.handleChange} value={this.props.seconday_phone || ''} data-rule-phonenumber={true} maxLength="30" />
                                            </div>
                                        </div>
                                        <div className="row mt-5">
                                            <div className="col-lg-8 col-sm-8">
                                                <label className="label_2_1_1">Address</label>
                                                <ReactGoogleAutocomplete className="add_input mb-1"
                                                    required={true} searchable={true}
                                                    name={"street"}
                                                    onPlaceSelected={(place) => this.props.googleAddressFillOnState(place)}
                                                    types={['address']}
                                                    returntype={'array'}
                                                    value={this.props.street || ''}
                                                    onChange={this.props.handleChange}
                                                    onKeyDown={this.props.handleChange}
                                                    componentRestrictions={{ country: "au" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-5">
                                            <div className="col-lg-4 col-sm-4">
                                                <label className="label_2_1_1">State</label>
                                                <div className="sLT_gray left left-aRRow">
                                                    <Select
                                                        simpleValue={true}
                                                        name="form-field-name "
                                                        className={"default_validation"}
                                                        options={this.props.states}
                                                        value={this.props.state}
                                                        onChange={(e) => this.props.stateChange('state', e)}
                                                        clearable={false}
                                                        searchable={false}
                                                        placeholder={"Select"}
                                                        inputRenderer={() => <input readOnly={true} className="define_input" name={"state"} required={true} value={this.props.state || ''} />}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <label className="label_2_1_1">Suburb</label>
                                                <Select.Async clearable={false}
                                                    className="default_validation" required={true} name="unqie12"
                                                    value={suburb_object}
                                                    cache={false}
                                                    disabled={(this.props.state) ? false : true}
                                                    loadOptions={(e) => getOptionsSuburb(e, this.props.state)}
                                                    onChange={(evt) => this.props.stateChange('suburb', evt)}
                                                    placeholder="Please Select"

                                                />
                                            </div>
                                            <div className="col-lg-2 col-sm-2">
                                                <label className="label_2_1_1">Postcode</label>
                                                <input type="text" name="postcode" onChange={this.props.handleChange} value={this.props.postcode || ''} required={true} maxLength="10" />
                                            </div>
                                        </div>

                                        <div className="row mt-5 d-flex justify-content-end">
                                            <div className="col-lg-4 col-md-3 col-sm-3 col-4">
                                                <button className="btn-1 w-100" onClick={this.props.submitNewCustomer} >Next</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


            </React.Fragment >
        );
    }

}

const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispach) => {
    return {

    }
}


export default connect(mapStateToProps, mapDispatchtoProps)(CreateNewCustomer);