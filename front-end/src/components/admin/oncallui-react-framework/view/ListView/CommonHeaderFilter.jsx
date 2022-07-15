import React, { Component } from 'react';
import { postData, toastMessageShow, css } from '../../services/common';
import { Button } from '@salesforce/design-system-react';
import {
    validateFilterLogic, removeParanthesisAndCheckOperandOperator, getStartAndEndDate,
    validateTheFilterString, validateLogic, returnDefaultLogic,
} from '../../services/common_filter';
import { ListViewRelatedType, selectFilterOperatorOptions, selectFilterTypeOptions, selectFilterStatusoptions } from './list_view_control_json';
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect';
import moment from "moment";


class CommonHeaderFilter extends Component {

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
            selectfilteroperatoroptions: selectFilterOperatorOptions,
            selectfiltertypeoptions: selectFilterTypeOptions(props.filter_related_type),
            selectfilteroptions: this.props.selectfilteroptions,
            selectfilterstatusoptions: selectFilterStatusoptions(props.filter_related_type),
            selectfiltercreatedbyoptions: [],
            selectedfilval: this.props.selectedfilval,
            default_filter_logic: this.props.default_filter_logic,
            filter_logic: this.props.filter_logic || this.props.default_filter_logic,
            filter_title: 'All',
            filter_list_id: this.props.filter_list_id,
            filter_related_type: ListViewRelatedType[props.filter_related_type],
            filter_error_msg: props.filter_error_msg || '',
            filter_list_length: '0'
        }

        this.date_fields = [
            'Scheduled Start Time',
            'Scheduled End Time',
            'Created Date',
            'Date Applied'
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
    /**
     * To get created by name and fetch filter drop down
     */
    getSelectedFilterValue = (select_filter_field, select_filter_value) => {
        let val = select_filter_value;
        let status_options = [];
        if (select_filter_field === "Created By") {
            status_options = this.state.selectfiltercreatedbyoptions;
        } else if (select_filter_field === "Status") {
            status_options = this.state.selectfilterstatusoptions;
        }
        status_options.map((col) => {
            if (col.value == select_filter_value) {
                val = col.label;
            }
        });
        if (this.date_fields.indexOf(select_filter_field) !== -1 && select_filter_value.indexOf('-') !== -1) {
            val = moment(select_filter_value).format('DD/MM/YYYY');
        }
        return val
    }
    showselectfilters = () => {
        this.setState({ showselectfilters: true });
    }
    hideselectfilters = () => {
        this.setState({
            showselectfilters: false,
            select_filter_field: '',
            select_filter_operator: '',
            select_filter_value: ''
        });
    }
    showselectedfilters = (type) => {
        this.setState({ showselectfilters: false, showselectedfilters: !type });
    }

    handleChangeSelectFilterValue = (key, value) => {
        if (key == 'filter_logic' && value == '') {
            this.setState({ default_filter_logic: '' })
        }
        this.setState({ [key]: value, filter_error_msg: '' }, () => {

        })
    }
    /**
     * set the selected filtered list
     */
    selectfilteronSubmit = (e) => {
        e.preventDefault();
        let filterObj = {}
        var start_end_date = '';
        var isValidDate = true;

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

        filterObj['select_filter_field'] = this.state.select_filter_field;
        filterObj['select_filter_field_val'] = selected_field_option.field;
        filterObj['select_filter_operator'] = this.state.select_filter_operator;
        filterObj['select_filter_operator_sym'] = selected_field_operator_obj.symbol;
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
                dateErr: ''

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
        this.setState({ filter_logic: '', selectedfilval: [], default_filter_logic: '', showaddfiltbtn: true }, () => {
            sessionStorage.removeItem('filterarray');
        }
        );
    }

    render() {

        return (
            <React.Fragment>
                {this.state.showselectfilters &&
                    <div style={{ height: '376px', top: '90px', right: '350px', position: 'absolute', 'z-index': '1' }}>

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
                                        <br></br>
                                        <h3 className="slds-text-body_small slds-m-vertical_x-small text-right linkclr"><span class="pull-left">Value</span>

                                            {this.state.select_filter_field != "Type" && this.state.select_filter_field != "Status" && this.state.select_filter_field != "Created By" && this.date_fields.indexOf(this.state.select_filter_field)  === -1 &&
                                                <div className="slds-form-element__control">
                                                    <input type="text"
                                                        className="slds-input"
                                                        name="select_filter_value"
                                                        placeholder="Enter Value"
                                                        required={true}
                                                        onChange={(e) => this.handleChangeSelectFilterValue('select_filter_value', e.target.value)}
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
                                        {this.state.select_filter_field == "Type" &&
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
                                        {this.state.select_filter_field == "Status" &&
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
                                        {this.state.select_filter_field == "Created By" &&
                                            <div className="slds-form-element__control">
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


                {this.props.showselectedfilters &&
                    <div style={{ top: '90px', right: '14px', position: 'absolute', 'zIndex': '1' }}>
                        <div className="slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false">
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
                                                (<li className="slds-item slds-hint-parent">
                                                    <div style={{ background: 'lightgoldenrodyellow' }} className="slds-filters__item slds-grid slds-grid_vertical-align-center">
                                                        <button className="slds-button_reset slds-grow slds-has-blur-focus">
                                                            <span className="slds-assistive-text">Edit filter:</span>
                                                            <span className="slds-show slds-text-body_small">{value.select_filter_field}</span>
                                                            <span className="slds-show">{value.select_filter_operator=='does not contains' ? 'does not contain' : value.select_filter_operator}  {this.getSelectedFilterValue(value.select_filter_field, value.select_filter_value)}</span>
                                                        </button>
                                                        <span className="slds-button_reset slds-grow slds-has-blur-focus">
                                                            <span onClick={(value) => this.removeselectfilters(idx)} style={{ float: 'right', cursor: 'pointer' }} className="slds-show slds-text-body_small">x</span>
                                                        </span>
                                                    </div>
                                                </li>
                                                )
                                            ))
                                        }
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

export default CommonHeaderFilter
