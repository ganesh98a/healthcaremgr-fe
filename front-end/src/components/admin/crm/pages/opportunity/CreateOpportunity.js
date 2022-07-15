import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';

import CrmPage from 'components/admin/crm/CrmPage';
import { REGULAR_EXPRESSION_FOR_AMOUNT, ROUTER_PATH } from 'config.js';
import jQuery from 'jquery';
import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import Select from 'react-select-plus';
import { checkItsNotLoggedIn, handleChange, postData, queryOptionData, toastMessageShow } from 'service/common.js';

const getOptionsLeadStaff = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_owner_staff_search", { query: e }, 2, 1);
}

const getOptionsRelatedLead = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_lead_number_search", { query: e }, 2, 1);
}

const getOptionsAccountPersonName = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_account_person_name_search", { query: e }, 2, 1);
}

class CreateOpportunity extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            redirectPage: false,
            opportunity_type_options: [],
            lead_source_code_option: [],
            owner: {},
            account_person: {},
            related_lead: {},
        }
    }

    getOptionsCreateOpportunity = () => {
        postData("sales/Opportunity/get_create_opportunity_option", {}).then((res) => {
            if (res.status) {
                this.setState(res.data)
            }
        });
    }

    componentDidMount() {
        this.getOptionsCreateOpportunity();
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#create_user").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (!this.state.loading && jQuery("#create_user").valid()) {
            this.setState({ loading: true });
            var req = {
                ...this.state,
                owner: this.state.owner ? this.state.owner.value : '',
                account_person: this.state.account_person ? this.state.account_person.value : '',
                account_type: this.state.account_person ? this.state.account_person.account_type : '',
                related_lead: this.state.related_lead ? this.state.related_lead.value : ''
            }

            postData('sales/Opportunity/create_opportunity', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ redirectPage: true })
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }

    handleChange = (value, key) => {
        this.setState({ [key]: value }, () => {
            if (this.state.validation_calls) {
                jQuery("#create_user").valid()
            }
        })
    }


    render() {
        var opportunity_type = '';
        if (this.state.opportunity_type) {
            var opportunity_type_options = this.state.opportunity_type_options
            var index = opportunity_type_options.findIndex(x => x.value == this.state.opportunity_type);

            if (index >= 0) {
                opportunity_type = opportunity_type_options[index]["key_name"];
            }
        }

        return (
            <div>
                {this.state.redirectPage ? <Redirect to={"/admin/crm/opportunity/listing"} /> : ''}
                <BlockUi tag="div" blocking={this.state.loading}>
                    <CrmPage pageTypeParms={'sales_lead_create'} />
                    <section className="manage_top">
                        <div className="container-fluid">
                            <div className="row  _Common_back_a">
                                <div className="col-lg-12 col-md-12">
                                    <Link className="d-inline-flex" to={ROUTER_PATH + 'admin/crm/opportunity/listing'}><div className="icon icon-back-arrow back_arrow"></div></Link>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12 col-md-12"><div className="bt-1"></div>
                                </div>
                            </div>
                            <div className="row _Common_He_a">
                                <div className="col-lg-8  col-md-12">
                                    <h1 className="color d-block">Create Opportunity</h1>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12 col-md-12"><div className="bt-1"  ></div>
                                </div>
                            </div>


                            <form id="create_user" autoComplete="off">
                                <div className="row py-2">
                                    <div className="w-40-lg col-lg-4 col-sm-6 ">
                                        <label className="label_font">Topic:</label>
                                        <div className="required">
                                            <input
                                                className="input_f"
                                                type="text"
                                                name="topic"
                                                placeholder="Enter Topic"
                                                onChange={(e) => handleChange(this, e)}
                                                value={this.state.topic || ''}
                                                data-rule-required="true"
                                                maxLength="255"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-40-lg col-lg-4 col-sm-6 ">
                                        <label className="label_font">Type:</label>
                                        <div className="sLT_gray left left-aRRow" >
                                            <div className="required">
                                                <Select
                                                    required={false}
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.opportunity_type_options}
                                                    onChange={(value) => this.handleChange(value, 'opportunity_type')}
                                                    value={this.state.opportunity_type || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Select"
                                                    inputRenderer={() => <input type="text" className="define_input" name={"opportunity_type"} required={true} value={this.state.opportunity_type || ''} />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {opportunity_type === 'ndis' ?
                                    <div className="row py-2">
                                        <div className="w-40-lg col-lg-4 col-sm-6 ">
                                            <div className="Time_line_lables">
                                                <label className="label_font label_2_1_1">Needs support plan:</label>
                                                <div className="label_2_1_2">
                                                    <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                        <input type="radio" name="need_support_plan" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.need_support_plan == 1) ? true : false} data-rule-required="true" />
                                                        <span className="checkround"></span>
                                                        <span className="txtcheck">Yes</span>
                                                    </label>
                                                </div>
                                                <div className="label_2_1_3">
                                                    <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                        <input type="radio" name="need_support_plan" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.need_support_plan == 0) ? true : false} data-rule-required="true" />
                                                        <span className="checkround"></span>
                                                        <span className="txtcheck">No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-40-lg col-lg-4 col-sm-6 ">
                                        </div>
                                    </div> : ""}


                                <div className="row py-1">
                                    <div className="w-40-lg col-lg-4 col-sm-6">
                                        <label className="label_font">Assigned To:</label>
                                        <div className="">
                                            <div className="sLT_gray left left-aRRow" >
                                                <Select.Async
                                                    className="default_validation"
                                                    required={false}
                                                    name='lead_owner'
                                                    loadOptions={(e) => getOptionsLeadStaff(e, [])}
                                                    clearable={false}
                                                    placeholder='Search'
                                                    cache={false}
                                                    value={this.state.owner}
                                                    onChange={(e) => this.setState({ owner: e })}
                                                    inputRenderer={(props) => <input  {...props} name={"owner"} />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-40-lg col-lg-4 col-sm-6">
                                        <label className="label_font">Account (Person/Org) Name:</label>
                                        <div className="">
                                            <div className="sLT_gray left left-aRRow" >
                                                <Select.Async
                                                    className="default_validation"
                                                    name='account_person'
                                                    loadOptions={(e) => getOptionsAccountPersonName(e, [])}
                                                    clearable={false}
                                                    placeholder='Search'
                                                    cache={false}
                                                    value={this.state.account_person}
                                                    onChange={(e) => this.setState({ account_person: e })}
                                                    required={false}
                                                    inputRenderer={(props) => <input {...props} name={"account_person"} />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row py-2">
                                    <div className="w-40-lg col-lg-4  col-sm-6 pb-3">
                                        <label className="label_font">Amount ($$):</label>
                                        <div className="">
                                            <input
                                                className="input_f"
                                                type="text"
                                                name="amount"
                                                placeholder="00"
                                                onChange={(e) => handleChange(this, e)}
                                                value={this.state.amount || ''}
                                                data-rule-required="false"
                                                maxLength="255"
                                                min="0.01"
                                                max="99999.99"
                                                pattern={REGULAR_EXPRESSION_FOR_AMOUNT}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-40-lg col-lg-2 col-sm-6 pb-3">
                                    </div>
                                </div>

                                <div className="row py-1">
                                    <div className="w-40-lg col-lg-4 col-sm-6">
                                        <label className="label_font">Source:</label>
                                        <div className="">
                                            <div className="sLT_gray left left-aRRow">
                                                <Select
                                                    required={false} 
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.lead_source_code_option}
                                                    onChange={(value) => this.handleChange(value, 'opportunity_source')}
                                                    value={this.state.opportunity_source || ''}
                                                    clearable={true}
                                                    searchable={false}
                                                    placeholder="Select"
                                                    inputRenderer={() => <input type="text" className="define_input" name={"opportunity_source"} value={this.state.opportunity_source || ''} />}
                                                />

                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-40-lg col-lg-4 col-sm-6">
                                        <label className="label_font">Related Lead:</label>
                                        <div className="sLT_gray left left-aRRow" >
                                            <Select.Async
                                                clearable={true}
                                                name='lead_owner'
                                                loadOptions={(e) => getOptionsRelatedLead(e, [])}
                                                placeholder='Search'
                                                cache={false}
                                                value={this.state.related_lead}
                                                onChange={(e) => this.setState({ related_lead: e })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row d-flex justify-content-end">
                                    <div className="w-20-lg col-lg-2 col-sm-3  mt-3">
                                        <button disabled={this.state.loading} onClick={this.onSubmit} className="but">Save</button>
                                    </div>
                                </div>

                            </form>
                        </div>
                    </section>

                </BlockUi>
            </div>
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

export default connect(mapStateToProps, mapDispatchtoProps)(CreateOpportunity);
