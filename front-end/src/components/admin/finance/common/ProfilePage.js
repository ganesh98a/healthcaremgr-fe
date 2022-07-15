import React, { Component } from 'react';
import Select from 'react-select-plus';
import { payrollExemptionFinanceStatus } from 'service/custom_value_data.js';
import _ from 'lodash';

class ProfilePage extends React.Component {

    render() {
        /* heading tilte change */
        const pageTypeData = {
            "invoicescheduler_contact_name": "Contact Name",
            "invoicescheduler_name": "Name",
            //"invoiceSchduler_address":"Address",
            "invoicescheduler_number": "Contact",
            //"invoiceSchduler_email":"Email",
        };
        /* name heading tilte show hide */
        const nameShowOnProfilePage = { "invoicescheduler": true, "default": false, "creditnotes": false };
        const orgContactNotShowOnProfilePage = { "creditnotes": true };

        let payrollExemptionStatus = '';
        let payrollExemptionEmailBtnShow = false;
        let payrollExemptionEmailMsgShow = false;
        let payrollExemptionRemeaningDays = 0;
        let payrollExemptionRemeaningColor = '';
        if (this.props.payrollShow && this.props.details.hasOwnProperty('finance_payroll_details') && Object.keys(this.props.details.finance_payroll_details).length > 0) {
            payrollExemptionStatus = this.props.details.finance_payroll_details.hasOwnProperty('fin_payroll_status') ? this.props.details.finance_payroll_details.fin_payroll_status : '';
            payrollExemptionEmailBtnShow = this.props.details.finance_payroll_details.hasOwnProperty('next_term_available') && this.props.details.finance_payroll_details.next_term_available != 1 && this.props.details.finance_payroll_details.hasOwnProperty('days_until_expire') && this.props.details.finance_payroll_details.days_until_expire < 30 ? true : false;
            payrollExemptionEmailMsgShow = this.props.details.finance_payroll_details.hasOwnProperty('days_until_expire') && payrollExemptionStatus != '' && payrollExemptionStatus != 'inactive' && this.props.details.finance_payroll_details.days_until_expire < 30 ? true : false;
            payrollExemptionRemeaningDays = this.props.details.finance_payroll_details.hasOwnProperty('days_until_expire') && this.props.details.finance_payroll_details.days_until_expire < 30 && this.props.details.finance_payroll_details.days_until_expire >= 0 ? ('Expiring in ' + this.props.details.finance_payroll_details.days_until_expire + ' days.') : (this.props.details.finance_payroll_details.hasOwnProperty('days_until_expire') && this.props.details.finance_payroll_details.days_until_expire < 0 ? 'Expired ' + Math.abs(this.props.details.finance_payroll_details.days_until_expire) + ' days ago.' : '');
            payrollExemptionRemeaningColor = this.props.details.finance_payroll_details.hasOwnProperty('days_until_expire') && this.props.details.finance_payroll_details.days_until_expire < 30 && this.props.details.finance_payroll_details.days_until_expire >= 0 ? 'text-warning' : (this.props.details.finance_payroll_details.hasOwnProperty('days_until_expire') && this.props.details.finance_payroll_details.days_until_expire < 0 ? 'text-danger' : '');

        }
        let fundDataId = this.props.fundingShow && this.props.details.hasOwnProperty('fund_type_id') ? this.props.details.fund_type_id : 1;
        let fundDataName = this.props.fundingShow && this.props.details.hasOwnProperty('fund_type_name') ? _.upperCase(this.props.details.fund_type_name) : 'NDIS';
        let fundDataOption = this.props.fundingShow ? [{ value: fundDataId, label: 'Funding: ' + fundDataName }] : [];
        return (
            <div className="row mb-5">
                <div className="col-lg-12">
                    <div className="pRO_div bb-1 py-5">
                        <div className="uSer_pRO">
                            <span>
                                <img src={this.props.details.profile_image || '/assets/images/default-loading.gif'} />
                            </span>
                        </div>
                        <div className="dEtail_pRO">
                            <div>
                                <ul>
                                    {this.props.mode == 'finance' && ((orgContactNotShowOnProfilePage.hasOwnProperty(this.props.pageType) && !orgContactNotShowOnProfilePage[this.props.pageType]) || (!orgContactNotShowOnProfilePage.hasOwnProperty(this.props.pageType))) ? (<li>
                                        <span className="dEtail_a">{pageTypeData[this.props.pageType + '_contact_name'] ? pageTypeData[this.props.pageType + '_contact_name'] : 'Contact'}: </span>
                                        <span className="dEtail_b">{this.props.details.contact_name || 'N/A'}</span>
                                    </li>) : (<React.Fragment />)}
                                    {nameShowOnProfilePage.hasOwnProperty(this.props.pageType) && nameShowOnProfilePage[this.props.pageType] ?
                                        (<li>
                                            <span className="dEtail_a">{pageTypeData[this.props.pageType + '_name'] ? pageTypeData[this.props.pageType + '_name'] : 'Name'}: </span>
                                            <span className="dEtail_b">{this.props.details.name || 'N/A'}</span>
                                        </li>) : (<React.Fragment />)}
                                    <li>
                                        <span className="dEtail_a">{pageTypeData[this.props.pageType + '_address'] ? pageTypeData[this.props.pageType + '_address'] : 'Address'}: </span>
                                        <span className="dEtail_b">{this.props.details.address || 'N/A'}</span>
                                    </li>
                                    <li>
                                        <span className="dEtail_a">{pageTypeData[this.props.pageType + '_number'] ? pageTypeData[this.props.pageType + '_number'] : 'Number'}: </span>
                                        <span className="dEtail_b">{this.props.details.phone || 'N/A'}</span>
                                    </li>
                                    <li>
                                        <span className="dEtail_a">{pageTypeData[this.props.pageType + '_email'] ? pageTypeData[this.props.pageType + '_email'] : 'Email'}: </span>
                                        <span className="dEtail_b">{this.props.details.email || 'N/A'}</span>
                                    </li>

                                    <li>
                                        {this.props.fundingShow ? (
                                            <div className="box_wide" style={{ width: '150px', paddingLeft: '10px' }}>
                                                <Select
                                                    simpleValue={true}
                                                    name="form-field-name"
                                                    value={fundDataId}
                                                    options={fundDataOption}
                                                    clearable={false}
                                                    searchable={false}
                                                    disabled={true}
                                                />
                                            </div>
                                        ) : <React.Fragment />}
                                        {this.props.bookertype ? (
                                            <div className="align-self-center d-inline-flex ml-4">
                                                <label className="pro_check_box">
                                                    <input type="checkbox" name="aboriginal_tsi" checked={this.props.bookerCheck || ''} onChange={this.props.onChange_booker} />
                                                    <span className="checkround"></span>
                                                    <span className='font'>Send Booker</span>
                                                </label>
                                            </div>
                                        ) : <React.Fragment />}

                                    </li>



                                    {this.props.payrollShow ? (<li>
                                        <div className="box_wide align-self-center" style={{ width: '150px', paddingLeft: '10px' }}>
                                            <Select
                                                name="form-field-name"
                                                value={payrollExemptionStatus}
                                                options={payrollExemptionFinanceStatus}
                                                clearable={false}
                                                searchable={false}
                                                disabled={true}
                                            />
                                        </div>

                                        <ul className="List_2_ul ml-5">
                                            {payrollExemptionEmailMsgShow ? (<li>
                                                <i className={"icon icon-alert " + payrollExemptionRemeaningColor}></i>
                                                <small className="mr-2">{payrollExemptionRemeaningDays}  </small>
                                            </li>) : (<React.Fragment />)}
                                            {payrollExemptionEmailBtnShow ? (<li>
                                                <button className="C_NeW_BtN" onClick={this.props.sendReminderOnCall}>Send Renewal Email</button>
                                            </li>) : (<React.Fragment />)}

                                        </ul>

                                    </li>) : <React.Fragment />}

                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
            ;
    }
}
ProfilePage.defaultProps = {
    fundingShow: false,
    payrollShow: false,
    mode: 'participant',
    pageType: 'default',
    details: {
        contact_name: '',
        address: '',
        phone: '',
        email: '',
        profile_image: '/assets/images/default-loading.gif'
    },
    sendReminderOnCall: () => { console.log(''); }
};

export default ProfilePage;
