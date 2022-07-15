import React, { Component } from 'react';
import { postData, toastMessageShow, css, onlyNumberAllowWithRange } from '../../services/common';
import { queryOptionDataAddNewEntity } from 'service/common.js';
import { Button } from '@salesforce/design-system-react';
import {
    validateFilterLogic, removeParanthesisAndCheckOperandOperator, getStartAndEndDate,
    validateTheFilterString, validateLogic, returnDefaultLogic,
} from '../../services/common_filter';
import { ListViewRelatedType, selectFilterOperatorOptions, selectFilterTypeOptions, selectFilterStatusoptions ,selectChargeRatePayLevelOptions,selectChargeSkillOptions,yesOrNoOptions,selectFilterActiveOptions, feedCategoryOptions, initCategoryOptions, againstCategoryOptions,publicOrPrivateOptions, feedAlertTypeOptions, feedbackTypeOptions,selectFilterOperatorOptionsForRecruit, jobCategoryFilterOptions,interviewStatus,fundType, OAStatus} from './list_view_control_json';
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect';
import moment from "moment";
class CommonDataTableHeaderFilter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filterVal: '',
            select_filter_field: '',
            select_filter_operator: '',
            select_filter_value: '',
            select_filter_date: '',
            showselectedfilters: this.props.showselectedfilters || false,
            showselectfilters: this.props.showselectfilters,
            showaddfiltbtn: this.props.showaddfiltbtn,
            selectfilteroperatoroptions: this.props.filter_related_type!=11&&this.props.filter_related_type!=12 ?selectFilterOperatorOptions:selectFilterOperatorOptionsForRecruit,
            selectfiltertypeoptions: this.props.select_filter_type_options || selectFilterTypeOptions || [],
            select_filter_invite_type_options: selectFilterTypeOptions(props.filter_related_type),
            select_filter_location_options: this.props.select_filter_location_options,
            select_filter_owner_name_options: this.props.select_filter_owner_name_options,
            selectfilteroptions: this.props.selectfilteroptions,
            selectfilterstatusoptions: selectFilterStatusoptions(props.filter_related_type,props.status_filter_value?props.status_filter_value:''),
            select_filter_member_status_options: selectFilterStatusoptions('member_status'),
            selectfiltercreatedbyoptions: [],
            selectfilterFeedAlertbyoptions: feedAlertTypeOptions,
            selectfilterFeedbackTypebyoptions: feedbackTypeOptions,
            selectfilterFeedCategorybyoptions: feedCategoryOptions,
            selectfilterInitatorCategorybyoptions: initCategoryOptions,
            selectfilterAgainstCategorybyoptions: againstCategoryOptions,
            selectFilterStageoptions: this.props.selectFilterStageoptions || [],
            selectFilterRosterTypeoptions: this.props.selectFilterRosterTypeoptions || [],
            selectedfilval: this.props.selectedfilval,
            default_filter_logic: this.props.default_filter_logic,
            filter_logic: this.props.filter_logic || this.props.default_filter_logic,
            filter_title: 'All',
            filter_list_id: this.props.filter_list_id,
            filter_related_type: ListViewRelatedType[props.filter_related_type],
            filter_error_msg: props.filter_error_msg || '',
            filter_list_length: '0',
            isNewFilter: this.props.isNewFilter,
            custom_filter_status_option : this.props.custom_filter_status_option,
            charge_rate_filter_options:[],
            payrates_filter_options:[],
            yesornooptions: yesOrNoOptions,
            selectfilteractiveoptions: selectFilterActiveOptions(props.filter_related_type),
            jobCategoryFilterOptions,
            fund_type: fundType,
        }

        this.date_fields = [
            'Invoice Date',
            'Shift Start Date',
            'Shift End Date',
            'Scheduled Start Time',
            'Scheduled End Time',
            'Created Date',
            'Date Applied',
            'Start Date',
            'End Date',
            'Last Modified Date',
            'Event End Date',
            'Event Date',
            'Job Created'
        ];

    }

    componentWillReceiveProps(props) {
        let {refresh_filters} = this.props;
        if (props.refresh_filters !== refresh_filters) {
            this.setState({refresh_filters, filter_error_msg: props.filter_error_msg});
        }

    }

    componentDidMount() {
        this.getAdminMember();

        if(this.props.filter_related_type==19){
            this.getChargeRates();
        }
        if(this.props.removeselectfilter!=null)
        {
            this.removeselectfilters(this.props.removeselectfilter)
        }

        if(this.props.filter_related_type == 20) {
            this.get_pay_rate_ref_data();
        }

        if(this.props.filter_related_type == 33) {
            this.getFinanceLineItemData();
        }
    }

    // To get list of admin
    getAdminMember() {
        postData('common/Common/get_admin_name_by_filter', {}).then((result) => {
            if (result.status) {
                this.setState({ selectfiltercreatedbyoptions: result.data });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        });
    }

     // To get charge list option
     getChargeRates() {
        postData('finance/FinanceDashboard/get_charge_rate_ref_data', {}).then((result) => {
            if (result.status) {
                console.log(result,'result')

                    result.data['Cost Book']=result.data.cost_book_options
                    result.data['Skill']=result.data.skill_level_options;
                    result.data['Pay Level']=result.data.pay_level_options;
                    result.data['Category']=result.data.chargerates_category_options;

                this.setState({ charge_rate_filter_options: result.data });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        });
    }

    /**
     * fetching the reference data of pay rates
     */
    get_pay_rate_ref_data() {
        postData("finance/FinanceDashboard/get_pay_rate_ref_data").then((result) => {
            if (result.status) {
                var newresult = [];
                newresult['Skill']=result.data.skill_level_options;
                newresult['Pay Level']=result.data.pay_level_options;
                newresult['Category']=result.data.payrates_category_options;
                newresult['Award']=result.data.payrates_award_options;
                newresult['Employment Type']=result.data.employment_type_options;

                this.setState({ payrates_filter_options: newresult });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    // To get charge list option
    getFinanceLineItemData() {
        postData('finance/FinanceLineItem/get_finance_line_item_filter_data', {}).then((result) => {
            if (result.status) {
                result.data['Support Category']=result.data.support_category_options
                result.data['Support Purpose']=result.data.support_purpose_options;
                result.data['Support Type']=result.data.support_type_options;
                result.data['Domain']=result.data.support_outcome_domain_options;

                this.setState({ line_item_filter_options: result.data });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        });
    }

    /**
     * To get created by name and fetch filter drop down
     */
    getSelectedFilterValue = (select_filter_field, select_filter_value) => {
        let val = select_filter_value;

        let status_options = [];
        // mapping key and values for right side filtered list
        if (select_filter_field === "Created By"|| select_filter_field ==='Last Modified By') {
            status_options = this.state.selectfiltercreatedbyoptions;
        }
        else if((this.props.filter_related_type == 19 || this.props.filter_related_type == 20 || this.props.filter_related_type == 21) && select_filter_field === 'Status') {
            status_options = this.state.custom_filter_status_option;
        }
        else if (this.props.filter_related_type != 5 && this.props.filter_related_type != 12 && (select_filter_field === "Status" || select_filter_field === "Application Status")) {
            status_options = this.state.selectfilterstatusoptions;
        }else if(select_filter_field === "Is Member"){
            status_options = this.state.select_filter_member_status_options;
        } else if (this.props.filter_related_type==12) {
            // to match interviews
            if(select_filter_field === "About"){
                status_options = this.state.selectfiltertypeoptions;
            }else if(select_filter_field === "Location"){
                status_options = this.state.select_filter_location_options
            }else if(select_filter_field === "Owner" || select_filter_field === "Assigned To"){
                status_options = this.state.select_filter_owner_name_options
            }else if(select_filter_field === "Invite Type"){
                status_options = this.state.select_filter_invite_type_options;
            }
            else if(select_filter_field==="Status"){
                    status_options=interviewStatus;   
            }
        } else if (select_filter_field === "Stage") {
            status_options = this.state.selectFilterStageoptions;
        } else if (select_filter_field === "Roster Type") {
            status_options = this.state.selectFilterRosterTypeoptions;
        }
        else if(this.props.filter_related_type == 5 && select_filter_field === 'Status') {
            status_options = this.state.custom_filter_status_option;
        }
        else if(this.props.filter_related_type == 19
            && (select_filter_field === 'Category'
               ||select_filter_field === 'Pay Level'
               ||select_filter_field === 'Skill'
               ||select_filter_field === 'Cost Book'
                 )){
            if(Object.keys(this.state.charge_rate_filter_options).length>0){
                status_options = [...this.state.charge_rate_filter_options[select_filter_field]];
            }
        }
        else if(this.props.filter_related_type == 20
            && (select_filter_field === 'Category'
               || select_filter_field === 'Pay Level'
               || select_filter_field === 'Skill'
               || select_filter_field === 'Award'
               || select_filter_field === 'Employment Type'
            )) {
            if(Object.keys(this.state.payrates_filter_options).length>0){
                status_options = [...this.state.payrates_filter_options[select_filter_field]];
            }
        }
        else if(this.props.filter_related_type == 28) {
            status_options = jobCategoryFilterOptions;
        }
        else if(this.props.filter_related_type == 30) {
            status_options = fundType;
        }
        else if(this.props.filter_related_type == 33
            && (select_filter_field === 'Support Category'
               || select_filter_field === 'Support Purpose'
               || select_filter_field === 'Support Type'
               || select_filter_field === 'Domain'
            )) {
            if(this.state.line_item_filter_options&& Object.keys(this.state.line_item_filter_options).length>0){
                status_options = [...this.state.line_item_filter_options[select_filter_field]];
            }
        }
       
        else if(select_filter_field=='Online Assessment Status') {
            status_options = OAStatus;
        }
        else if(this.props.filter_related_type == 30) {
            status_options = fundType;
        }
        // listing filter options right side
        if(this.props.filter_related_type==9&&select_filter_field=='Status'){
            selectFilterStatusoptions(this.props.filter_related_type,'').map((col) => {
                if (col.value == select_filter_value) {
                    val = col.label;
                }
            });
        }else{
            status_options.map((col) => {
                if (col.value == select_filter_value) {
                    val = col.label;
                }
            });
        }
        

        if (this.date_fields.indexOf(select_filter_field) !== -1 && select_filter_value.indexOf('-') !== -1) {
            val = moment(select_filter_value).format('DD/MM/YYYY');
        }
        if(typeof val=='object' && select_filter_field == "Contact"){
            return " ";
        }else{
            return val
        }

    }
    showselectfilters = () => {
        this.setState({ showselectfilters: true, isNewFilter: true }, () => {
            //Scroll the filter popup into bottom while adding new filter
            let div = document.getElementById('slds-filter-box');
            div.scrollTop = div.scrollHeight - div.clientHeight;
        });
    }
    hideselectfilters = () => {
        this.setState({
            showselectfilters: false,
            select_filter_field: '',
            select_filter_operator: '',
            select_filter_value: '',
            isNewFilter: false,
            dateErr: '',
            fieldErr:'',
            operatorErr:'',
        });
    }
    showselectedfilters = (type) => {
        this.setState({ showselectfilters: false, showselectedfilters: !type });
    }

    handleChangeSelectFilterValue = (key, value) => {

        if (key == 'filter_logic' && value == '') {
            this.setState({ default_filter_logic: '' })
        }
        if(key == 'select_filter_field'){
            this.setState({ select_filter_value: '' })
        }
        this.setState({ [key]: value, filter_error_msg: '' }, () => {
        })
    }

    //Get the FMS feedback category options
    getfmsCatOption (select_field) {
        switch (select_field) {
            case "Alert Category":
                return this.state.selectfilterFeedAlertbyoptions;
            case "Feedback Type":
                return this.state.selectfilterFeedbackTypebyoptions;
            case "Feedback Category":
                return this.state.selectfilterFeedCategorybyoptions;
            case "Initiator Category":
                return this.state.selectfilterInitatorCategorybyoptions;
            case "Against Category":
                return this.state.selectfilterAgainstCategorybyoptions;
            default:
                break;
        }
    }
    /**
     * set the selected filtered list
     */
    selectfilteronSubmit = (e) => {
        e.preventDefault();
        let filterObj = {}
        var start_end_date = '';
        var isValidDate = true;
        //Stop the function if filter value is empty
        if(this.state.select_filter_value === '') {
            return;
        }
        var selected_field_option = this.state.selectfilteroptions.find(filter_ope_opt => {
            if(filter_ope_opt.value == this.state.select_filter_field) {
                return filter_ope_opt;
            }
        });
        var selected_field_operator_obj = this.state.selectfilteroperatoroptions.find(filter_ope_opt => {
            if(filter_ope_opt.value == this.state.select_filter_operator) {
                return filter_ope_opt;
            }
        });

        if(!selected_field_operator_obj){
            this.setState({operatorErr : 'Please select operator', showselectfilters: true})
            return;
        }

        if(!selected_field_option){
            this.setState({fieldErr : 'Please select field', showselectfilters: true})
            return;
        }

        filterObj['select_filter_field'] = this.state.select_filter_field;
        filterObj['select_filter_field_val'] = selected_field_option.field;
        filterObj['select_filter_operator'] = this.state.select_filter_operator;
        filterObj['select_filter_operator_sym'] = selected_field_operator_obj ?  selected_field_operator_obj.symbol : this.setState({operatorErr : 'Please select operator', showselectfilters: true});
        filterObj['select_filter_value'] = this.state.select_filter_value;
        if (this.date_fields.indexOf(this.state.select_filter_field) !== -1) {
            if (this.state.select_filter_value != '') {
                if ((moment(this.state.select_filter_value, 'DD/MM/YYYY', true).isValid())) {
                    filterObj['select_filter_value'] = moment(this.state.select_filter_value, 'DD/MM/YYYY').format('DD/MM/YYYY');
                    filterObj['selected_date_range'] = "";
                } else if (validateTheFilterString(this.state.select_filter_value.toLowerCase())) {
                    start_end_date = getStartAndEndDate(this.state.select_filter_value.toLowerCase())
                    filterObj['select_filter_value'] = this.state.select_filter_value;
                    filterObj['selected_date_range'] = start_end_date;
                } else {
                    isValidDate = false;
                }
            }
        }

        var allEntries = JSON.parse(sessionStorage.getItem("filterarray")) || [];
        allEntries.push(filterObj);
        var hideaddfilbtn = true
        if (allEntries.length >= 5) {
            hideaddfilbtn = false
        }

        if (isValidDate) {
            sessionStorage.setItem('filterarray', JSON.stringify(allEntries));
            let setDefaultFilterLogic = returnDefaultLogic(this.state.filter_logic, allEntries.length);
            this.setState({
                selectedfilval: JSON.parse(sessionStorage.getItem("filterarray")),
                showselectfilters: false,
                select_filter_field: '',
                select_filter_operator: '',
                select_filter_value: '',
                select_filter_date: '',
                showaddfiltbtn: hideaddfilbtn,
                filter_logic: setDefaultFilterLogic,
                default_filter_logic: setDefaultFilterLogic,
                filter_list_length: allEntries.length,
                dateErr: '',
                fieldErr:'',
                operatorErr:'',
                isNewFilter: false

            }, () => {
            });
        } else {
            this.setState({
                showselectfilters: true,
                dateErr: 'Invalid date (Valid date format DD/MM/YYYY)'

            }, () => {
            });
        }
    }

    /**
     * save the selected filtered list and also validate the filter logic
     */
    sendfiltersubmit = (type) => {

        let getsessdatas = sessionStorage.getItem("filterarray") ? JSON.parse(sessionStorage.getItem("filterarray")) : this.state.selectedfilval;

        if (type == "reset") {
            this.setState({ selectedfilval: [] });
            this.setState({ filter_logic: '' });
            getsessdatas = sessionStorage.removeItem('filterarray');
        }

        return new Promise((resolve, reject) => {
            this.setState({ loading: true });
            var hasNumber = /\d/;
            let isValidFilterLogic = false;
            let filter_operand_length = 0;
            let filter_operand = [];
            let validated_data = [];
            if (this.state.filter_logic) {
                if (hasNumber.test(this.state.filter_logic) && getsessdatas) {
                    filter_operand = this.state.filter_logic.match(/\d+/g).map(Number)
                    filter_operand_length = this.state.filter_logic ? filter_operand.length : 0;
                    validated_data = validateFilterLogic(this.state.filter_logic, filter_operand, getsessdatas);
                    isValidFilterLogic = validated_data.isValidFilter;
                    if (!isValidFilterLogic) {
                        this.setState({ loading: false, filter_error_msg: validated_data.error_msg, showselectedfilters: true, }, () => { });
                    }
                } else if (this.state.filter_logic.trim().length != 0 && getsessdatas) {
                    isValidFilterLogic = false;
                    this.setState({ loading: false, filter_error_msg: validated_data.error_msg, showselectedfilters: true, }, () => { }); this.setState({ loading: false });
                    return false
                }
            } else {
                isValidFilterLogic = true;
            }

            if (isValidFilterLogic) {
                var req = {
                    tobefilterdata: getsessdatas, pageSize: this.props.fil_pageSize,
                    page: this.props.fil_page,
                    filter_logic: this.state.filter_logic,
                    filter_operand_length: filter_operand_length,
                    filter_list_id: this.state.filter_list_id,
                    save_filter_logic: true,
                    selected_date_range: this.state.selected_date_range,
                };
                this.props.save_and_get_selectedfilter_data(req, 'save');
            }
        });
    }
    /**
     * remove the selected filter and also validate filter logic while removing
     */
    removeselectfilters = (key) => {
        var allEntries = sessionStorage.getItem("filterarray") ? JSON.parse(sessionStorage.getItem("filterarray")) : this.state.selectedfilval;
        delete allEntries[key];

        let filter_logic_data = this.state.filter_logic.split('');
        //Remove the unwanted paranthesis and validate operator and operand
        let filter_str = removeParanthesisAndCheckOperandOperator(filter_logic_data, key, allEntries.length);
        // After change check if everything in correct format else return default logic
        filter_str = validateLogic(filter_str, allEntries)

        let cleanArray = allEntries.filter(function () { return true });
        sessionStorage.setItem('filterarray', JSON.stringify(cleanArray));
        this.setState({
            showaddfiltbtn: true,
            selectedfilval: JSON.parse(sessionStorage.getItem("filterarray")),
            filter_logic: filter_str,
            default_filter_logic: filter_str
        }, () => {
            if (this.state.selectedfilval.length == 0) {
                this.resetfilters();
            }
        });
    }
    /**
     * remove all the filter data
     */
    resetfilters = () => {
        this.setState({ filter_logic: '', selectedfilval: [], default_filter_logic: '', showaddfiltbtn: true,
         isNewFilter: false, showselectfilters: false, dateErr: '', fieldErr:'', operatorErr:'', }, () => {
            sessionStorage.removeItem('filterarray');
        }
        );
    }
    validate_the_field = () => {
        let is_input = false;
        if(
            (this.state.select_filter_field != "Type" &&
            this.state.select_filter_field != "About" &&
            this.state.select_filter_field != "Status" &&
            this.state.select_filter_field != "Application Status" &&
            this.state.select_filter_field != "Location" &&
            this.state.select_filter_field != "Is Member" &&
            this.state.select_filter_field != "Invite Type" &&
            this.state.select_filter_field != "Stage" &&
            this.state.select_filter_field != "Roster Type" &&
            this.date_fields.indexOf(this.state.select_filter_field)  === -1 &&
            this.state.select_filter_field != "Owner"
            &&this.state.select_filter_field!="Pay Level"
            && this.state.select_filter_field!="Skill"
            && this.state.select_filter_field!="Cost Book"
            && this.state.select_filter_field!="Award"
            && this.state.select_filter_field!="Employment Type"
            && this.state.select_filter_field!="Category"
           &&  Number(this.props.filter_related_type)!==16
           &&this.state.select_filter_field!="Active"
            &&this.state.select_filter_field!="Last Modified By"
            && this.state.select_filter_field!="Feedback Category"
            && this.state.select_filter_field!="Initiator Category"
            && this.state.select_filter_field!="Against Category"
            && this.state.select_filter_field!= "Job Category"
            && this.state.select_filter_field!="Fund Manager"
            && this.state.select_filter_field != "Support Category"
            && this.state.select_filter_field != "Support Purpose"
            && this.state.select_filter_field != "Support Type"
            && this.state.select_filter_field != "Domain"
            && this.state.select_filter_field != "Online Assessment Status"
            ))
        {
                is_input = true;
        }

        if(Number(this.props.filter_related_type)===16 && this.state.select_filter_field == "Document Name" )
        {
            is_input = true;
        }

        
        if(Number(this.props.filter_related_type)===12 && this.state.select_filter_field == "Status" )
        {
            is_input = false;
        }

        if ((this.state.select_filter_field == "Owner" && Number(this.props.filter_related_type) === 18)) {
            is_input = true;
        }
        if(this.state.select_filter_field==="Folder"&&Number(this.props.filter_related_type)===26){
            is_input = false;
        }
        
        return is_input;
    }

    render() {

        return (
            <React.Fragment>

                {this.props.showselectedfilters &&
                    <div style={{ width: 'calc(100% - 75.6%)', height: 'calc(100vh - 280px)', top: '104px', right: '-7px', position: 'absolute', 'zIndex': '20',maxHeight: '500px' }}>

                {this.state.showselectfilters &&
                    <div style={{ width: '100%', height: 'calc(100vh - 200px)', top: '0px', bottom: '0px', left: '-100%', position: 'absolute', 'zIndex': '20', maxHeight: '380px'}}>

                        <div className="slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false">
                            <div className="slds-panel__header">
                                <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Select Filter</h2>
                                <button onClick={this.hideselectfilters} className="slds-button slds-button_icon slds-button_icon-small slds-panel__close" title="Collapse Filter">
                                    x
                                    <span className="slds-assistive-text">Select Filters</span>
                                </button>
                            </div>
                            <div className="slds-panel__body">
                                <div className="slds-filters">
                                    <form id="select_filter_form" autoComplete="off" className="slds_form">
                                        <h3 className="slds-text-body_small slds-m-vertical_x-small">Field</h3>

                                        <div className="slds-form-element__control">
                                            <SLDSReactSelect
                                                simpleValue={true}
                                                className="custom_select default_validation"
                                                options={this.state.selectfilteroptions}
                                                onChange={(value) => this.handleChangeSelectFilterValue('select_filter_field', value)}
                                                value={this.state.select_filter_field || ''}
                                                clearable={false}
                                                searchable={false}
                                                placeholder="Please Select"
                                                required={true}
                                                name="select_filter_field"
                                            />
                                        </div>
                                        <span class="filter-logic-error">{this.state.fieldErr ? this.state.fieldErr : ''}</span>
                                        <br></br>
                                        <h3 className="slds-text-body_small slds-m-vertical_x-small">Operator</h3>
                                        <div className="slds-form-element__control">
                                            <SLDSReactSelect
                                                simpleValue={true}
                                                className="zcustom_select zdefault_validation"
                                                options={this.state.selectfilteroperatoroptions}
                                                onChange={(value) => this.handleChangeSelectFilterValue('select_filter_operator', value)}
                                                value={this.state.select_filter_operator || ''}
                                                clearable={false}
                                                searchable={false}
                                                placeholder="Please Select"
                                                required={true}
                                                name="select_filter_operator"
                                            />
                                        </div>
                                        <span class="filter-logic-error">{this.state.operatorErr ? this.state.operatorErr : ''}</span>
                                        <br></br>
                                        <h3 className="slds-text-body_small slds-m-vertical_x-small text-right linkclr"><span class="pull-left">Value</span>
                                            {this.validate_the_field() &&
                                                <div className="slds-form-element__control">
                                                    <input type="text"
                                                        className="slds-input"
                                                        name="select_filter_value"
                                                        placeholder="Enter Value"
                                                        required={true}
                                                        onChange={(e) => this.state.select_filter_field== 'Max Applicant' ? onlyNumberAllowWithRange(this, e , 10) : this.handleChangeSelectFilterValue('select_filter_value', e.target.value)}
                                                        value={this.state.select_filter_value || ''}
                                                    />
                                                </div>
                                            }
                                        </h3>
                                        {this.date_fields.indexOf(this.state.select_filter_field)  !== -1 &&
                                            <div className="col-md-12 my-4">
                                                <div className="slds-form-element__control datepicker_100_width errorsize">
                                                    <input type="text"
                                                        className="slds-input"
                                                        name="select_filter_value"
                                                        placeholder="Date format DD/MM/YYYY"
                                                        required={true}
                                                        onChange={(e) => this.handleChangeSelectFilterValue('select_filter_value', e.target.value)}
                                                        value={this.state.select_filter_value || ''}
                                                    />
                                                    <span class="filter-logic-error">{this.state.dateErr ? this.state.dateErr : ''}</span>
                                                </div>
                                            </div>}
                                        {(this.state.select_filter_field == "Type" || this.state.select_filter_field == "About") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.selectfiltertypeoptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {this.state.select_filter_field == "Location" &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.select_filter_location_options}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {this.state.select_filter_field == "Owner" && Number(this.props.filter_related_type) !== 18 &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.select_filter_owner_name_options}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        
                                        {((this.state.custom_filter_status_option == undefined && this.props.filter_related_type!=12) && (this.state.select_filter_field == "Status" || this.state.select_filter_field == "Application Status")) &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.selectfilterstatusoptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }

                                        {(this.state.custom_filter_status_option !== undefined && this.state.select_filter_field == 'Status') &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.custom_filter_status_option}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value >= 0 ? this.state.select_filter_value : ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {this.state.select_filter_field == "Is Member" &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.select_filter_member_status_options}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {(this.state.select_filter_field == "Last Modified By")&&
                                            (<div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.selectfiltercreatedbyoptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                            )}
                                        {(this.state.select_filter_field == "Invite Type") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.select_filter_invite_type_options}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {(this.state.select_filter_field == "Stage") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.selectFilterStageoptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {(this.state.select_filter_field == "Roster Type") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.selectFilterRosterTypeoptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                         {(this.state.select_filter_field == "Pay Level"
                                         ||this.state.select_filter_field == "Skill"
                                         ||this.state.select_filter_field == 'Cost Book'
                                         ||this.state.select_filter_field == 'Category'
                                         ||this.state.select_filter_field == 'Award'
                                         ||this.state.select_filter_field == 'Employment Type') &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={
                                                        this.props.filter_related_type == 19 ?
                                                        this.state.charge_rate_filter_options[this.state.select_filter_field] : this.props.filter_related_type == 20 ? this.state.payrates_filter_options[this.state.select_filter_field] : []
                                                    }
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }

                                        {(this.props.filter_related_type==16 && this.state.select_filter_field!="Document Name") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.yesornooptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                      {(this.state.select_filter_field == "Active") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.selectfilteractiveoptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }

                                        {(this.props.filter_related_type == 24 && this.state.select_filter_field =="Feedback Category" || this.state.select_filter_field =="Alert Category" || this.state.select_filter_field =="Feedback Category" || this.state.select_filter_field == "Feedback Type"|| this.state.select_filter_field =="Initiator Category" || this.state.select_filter_field =="Against Category") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.getfmsCatOption(this.state.select_filter_field)}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }

                                        {(this.props.filter_related_type==30 && this.state.select_filter_field=="Fund Manager") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={this.state.fund_type}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {(this.props.filter_related_type == 26 && this.state.select_filter_field =="Folder") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={publicOrPrivateOptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {(this.props.filter_related_type === "28" && this.state.select_filter_field === "Job Category") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={jobCategoryFilterOptions}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {(this.props.filter_related_type === "12" && this.state.select_filter_field === "Status") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={interviewStatus}
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                        {(this.state.select_filter_field == "Support Category"
                                         ||this.state.select_filter_field == "Support Type"
                                         ||this.state.select_filter_field == 'Support Purpose'
                                         ||this.state.select_filter_field == 'Domain') &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={
                                                        this.props.filter_related_type == 33 ?
                                                        this.state.line_item_filter_options[this.state.select_filter_field] :  []
                                                    }
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }
                                            {( this.state.select_filter_field == "Online Assessment Status") &&
                                            <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                    simpleValue={true}
                                                    className="custom_select default_validation"
                                                    options={
                                                        OAStatus
                                                    }
                                                    onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                    value={this.state.select_filter_value || ''}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Please Select"
                                                    required={true}
                                                    name="select_filter_value"
                                                />
                                            </div>
                                        }


                                        <br></br>
                                        <h3 className="slds-text-body_small slds-m-vertical_x-small"></h3>
                                        <div style={{ float: 'right' }} className="slds-form-element__control">
                                            <Button disabled={this.state.loading} label="Done" variant="brand" onClick={(e)=>this.selectfilteronSubmit(e)} />
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>}

                        <div className="slds-filter-box slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false" id="slds-filter-box">
                            <div className="slds-panel__header">
                                <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Filter</h2>
                            </div>
                            <div className="slds-panel__body">
                                <div className="slds-filters">
                                    <div className="slds-form-element__control">
                                        <Button label="Cancel" onClick={(e) => this.props.closeFilter()} />
                                        <Button style={{ float: 'right' }} disabled={this.props.loading} label="Save" variant="brand"
                                            onClick={(e) => this.sendfiltersubmit("search")}
                                        />
                                    </div>
                                    <br></br>
                                    <ol className="slds-list_vertical slds-list_vertical-space">
                                        <li className="slds-item slds-hint-parent">
                                            <div className="slds-filters__item slds-grid slds-grid_vertical-align-center">
                                                <button className="slds-button_reset slds-grow slds-has-blur-focus">
                                                    <span className="slds-assistive-text">Edit filter:</span>
                                                    <span className="slds-show slds-text-body_small">Show By : </span>
                                                </button>
                                            </div>
                                        </li>
                                    </ol>
                                    <h3 className="slds-text-body_small slds-m-vertical_x-small">Matching all these filters</h3>
                                    <ol className="slds-list_vertical slds-list_vertical-space">

                                        {

                                            this.state.selectedfilval && this.state.selectedfilval.map((value, idx) => (
                                                value !== null &&
                                                (<li className="slds-item slds-hint-parent" key={idx}>
                                                    <div style={{ background: 'lightgoldenrodyellow' }} className="slds-filters__item slds-grid slds-grid_vertical-align-center">
                                                        <button className="slds-button_reset slds-grow slds-has-blur-focus">
                                                            <span className="slds-assistive-text">Edit filter:</span>
                                                            <span className="slds-show slds-text-body_small">{value.select_filter_field}</span>
                                                            <span className="slds-show">{value.select_filter_operator=='does not contains' ? 'does not contain' : value.select_filter_operator} {this.getSelectedFilterValue(value.select_filter_field, value.select_filter_value)}</span>
                                                        </button>
                                                        <span className="slds-button_reset slds-grow slds-has-blur-focus">
                                                            <span onClick={(value) => this.removeselectfilters(idx)} style={{ float: 'right', cursor: 'pointer' }} className="slds-show slds-text-body_small">x</span>
                                                        </span>
                                                    </div>
                                                </li>
                                                )
                                            ))
                                        }
                                            <li className="slds-item slds-hint-parent" style={{position: 'relative'}}>

                                                { this.state.showselectfilters && <div className="slds-pointer"></div> }

                                                { this.state.showselectfilters &&
                                                    <div style={{ background: 'lightgoldenrodyellow', display : (this.state.isNewFilter) ? 'block' :'none',
                                                    position: 'relative' }} className="slds-filters__item slds-grid slds-grid_vertical-align-center">
                                                        <button className="slds-button_reset slds-grow slds-has-blur-focus">
                                                            <span className="slds-show slds-text-body_small">New Filter*</span>
                                                            <span className="slds-show">&nbsp;</span>
                                                        </button>
                                                        <span className="slds-button_reset slds-grow slds-has-blur-focus">
                                                            <button onClick={this.hideselectfilters} style={{ float: 'right', cursor: 'pointer', background: 'transparent', border: '0px'}} className="slds-show slds-text-body_small">x</button>
                                                        </span>
                                                    </div>
                                                }
                                            </li>
                                    </ol>
                                    <div className="slds-filters__footer slds-grid slds-shrink-none">
                                        {this.state.showaddfiltbtn &&
                                            <button className="slds-button_reset slds-text-link" onClick={this.showselectfilters}>Add Filter</button>}
                                        <button className="slds-button_reset slds-text-link slds-col_bump-left" onClick={this.resetfilters}>Remove All</button>
                                    </div>

                                    {this.state.selectedfilval.length >= 2 ? <div className="slds-form-element__control">

                                        <Textarea
                                            type="text"
                                            className="slds-input"
                                            name="filter_logic"
                                            placeholder="Filter Logic"
                                            onChange={(e) => this.handleChangeSelectFilterValue('filter_logic', e.target.value)}
                                            value={this.state.filter_logic || this.state.default_filter_logic}
                                        /><span className="filter-logic-error">{this.state.filter_error_msg}</span>
                                    </div> : ''}
                                </div>
                            </div>
                        </div>

                    </div>}
            </React.Fragment >
        );
    }
}

export default CommonDataTableHeaderFilter


