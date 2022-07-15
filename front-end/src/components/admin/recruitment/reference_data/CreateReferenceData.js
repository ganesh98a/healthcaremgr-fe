import React, { Component } from 'react';
import jQuery from "jquery";
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { BASE_URL, ROUTER_PATH } from 'config.js';
import { checkItsNotLoggedIn, postData, toastMessageShow, css ,queryOptionData,handleChangeSelectDatepicker,handleShareholderNameChange,handleChangeChkboxInput,handleDateChangeRaw} from 'service/common.js';
import { Link, Redirect } from 'react-router-dom';
import CrmPage from 'components/admin/crm/CrmPage';
import 'react-block-ui/style.css';
import BlockUi from 'react-block-ui';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import moment from 'moment';

import '../../scss/components/admin/item/ReferenceData.scss';

class CreateLead extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            redirectPage: false,
            ref_type: [],
            operation:'A'
        }
    }

    getReferenceDataMasterList= ()=>{
        postData('recruitment/RecruitmentReferenceData/get_ref_master_list', {}).then((result) => {
            if (result.status) {
                this.setState({
                    ref_type: result.data.data_type,
                }, () => { });
            }
        });
    }

    componentDidMount(){
        this.getReferenceDataMasterList();
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#create_ref").validate({ /* */ });

        if (!this.state.loading && jQuery("#create_ref").valid()) {
            this.setState({ loading: true });
            postData('recruitment/RecruitmentReferenceData/save_ref_data', this.state).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    toastMessageShow(msg, 's', { 'close': () => { this.setState({ redirectPage: true }) } });
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }


    render() {
        const styles = css({
            emailFieldLabel: {
                whiteSpace: 'nowrap',
                overflowX: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 5,
            }
        });
        return (
            <div>
                 {this.state.redirectPage ? (
          <Redirect to={ROUTER_PATH + "admin/item/reference_data"} />
        ) : (
          <React.Fragment />
        )}
                <BlockUi tag="div" blocking={this.state.loading}>
                <CrmPage pageTypeParms={'sales_lead_create'} />
                    <section className="manage_top referencemodule">
                        <div className="container-fluid">
                            <div className="row  _Common_back_a">
                                <div className="col-lg-12 col-md-12">
                                    <Link className="d-inline-flex" to={ROUTER_PATH + 'admin/item/reference_data'}><div className="icon icon-back-arrow back_arrow"></div></Link>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12 col-md-12"><div className="bt-1"></div>
                                </div>
                            </div>
                            <div className="row _Common_He_a">
                                <div className="col-lg-8  col-md-12">
                                    <h1 className="color d-block">{this.props.showPageTitle}</h1>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12 col-md-12"><div className="bt-1"></div>
                                </div>
                            </div>

                         <form id="create_ref" autoComplete="off">
                            <div className="row py-2 pt-5">
                                <div className="w-40-lg col-lg-4 col-sm-6 ">
                                    <label className="label_font">Type:</label>
                                    <div className="required">
                                        <Select name="action_type" className="custom_select default_validation "
                                            simpleValue={true}
                                            searchable={false} clearable={false}
                                            placeholder="Type"
                                            options={this.state.ref_type}
                                            onChange={e => this.setState({ type: e })}
                                            value={this.state.type}
                                            inputRenderer={() => <input type="text"  className="define_input" name={"type"} required={true} value={this.state.type} />}
                                        />
                                    </div>
                                </div>
                                <div className="w-40-lg col-lg-4 col-sm-6 ">
                                    <label className="label_font">Code:</label>
                                    <div className="sLT_gray left left-aRRow required" >
                                        <input type="text" className="csForm_control clr2" onChange={(e) => handleChangeChkboxInput(this, e)} name="code" value={this.state.code} data-rule-required="true"/>
                                    </div>
                                </div>
                            </div>
                            <div className="row py-1 pt-3">
                                <div className="w-40-lg col-lg-4 col-sm-6">
                                    <label className="label_font">Display Name:</label>
                                    <div className="required">
                                        <input type="text" className="csForm_control clr2" onChange={(e) => handleChangeChkboxInput(this, e)} name="display_name" value={this.state.display_name} data-rule-required="true" data-rule-maxlength="100" data-msg-maxlength="Display name can not be more than 100 characters."/>
                                    </div>
                                </div>
                                <div className="w-40-lg col-lg-4 col-sm-6">
                                    <label className="label_font">Parent Id:</label>
                                    <div className="required_1">
                                        <input type="text" className="csForm_control clr2" onChange={(e) => handleChangeChkboxInput(this, e)} name="parent_id" value={this.state.parent_id} />
                                    </div>
                                </div>
                            </div>

                            <div className="row py-1 pt-3">
                                <div className="w-40-lg col-lg-4 col-sm-6">
                                    <label className="label_font">Source:</label>
                                    <input type="text" className="csForm_control clr2" onChange={(e) => handleChangeChkboxInput(this, e)} name="source" value={this.state.source} />
                                </div>
                                <div className="w-20-lg col-lg-4 col-sm-6">
                                <label className="label_font">Start Date:</label>
                                    <span className="">
                                        <div className="sLT_gray left left-aRRow">
                                            <DatePicker
                                            showYearDropdown
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={110}
                                            dateFormat="dd-MM-yyyy"
                                            data-placement={'bottom'}
                                            maxDate={(this.state.end_date) ? moment(this.state.end_date) : moment().add(60, 'days')}
                                            minDate={moment()}
                                            name={"start_date"}
                                            onChange={(e) => handleChangeSelectDatepicker(this, e, 'start_date')}
                                            selected={this.state.start_date && this.state.start_date != '0000/00/00' ? this.state.start_date : null}
                                            className="csForm_control text-center bl_bor"
                                            placeholderText="DD/MM/YYYY"
                                            disabled={this.state.is_editable}
                                            onChangeRaw={handleDateChangeRaw}
                                            autoComplete={'off'}
                                        />
                                        </div>
                                    </span>
                                </div>

                                <div className="w-20-lg col-lg-4 col-sm-6">
                                <label className="label_font">End Date:</label>
                                    <DatePicker
                                            showYearDropdown
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={110}
                                            dateFormat="dd-MM-yyyy"
                                            data-placement={'bottom'}
                                            minDate={(this.state.start_date && this.state.start_date != '0000/00/00') ? moment(this.state.start_date) : moment()}
                                            popperPlacement="bottom-end"
                                            name={"end_date"}
                                            onChange={(e) => handleChangeSelectDatepicker(this, e, "end_date")}
                                            selected={this.state.end_date && this.state.end_date != '0000/00/00' ?this.state.end_date : null}
                                            className="csForm_control text-center bl_bor"
                                            placeholderText="DD/MM/YYYY"
                                            disabled={((this.state.is_recurring == 1) || (this.state.is_editable)) ? true : false}
                                            onChangeRaw={handleDateChangeRaw}
                                            autoComplete={'off'}
                                         />
                                </div>
                            </div>

                            <div className="row py-1 pt-3">
                                <div className="w-80-lg col-lg-4 col-sm-6">
                                <label className="label_font">Definition:</label>
                                    <textarea className="w-100" name="definition" placeholder="Definition" onChange={(e) => handleChangeChkboxInput(this, e)} value={this.state.definition || ''} />
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
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
	showTypePage: state.RecruitmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateLead);
