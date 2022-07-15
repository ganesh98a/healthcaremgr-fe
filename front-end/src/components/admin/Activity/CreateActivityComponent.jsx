import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { postData, selectFilterOptions, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import jQuery from "jquery";
import createClass from 'create-react-class';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';

import Button from '@salesforce/design-system-react/lib/components/button';
import { get_sales_activity_data } from "components/admin/crm/actions/SalesActivityAction.jsx"
import SendEmailActivity from './SendEmailActivity.jsx';
import _ from 'lodash';
import { ROUTER_PATH } from '../../../config.js';
import { Link } from 'react-router-dom'
import { SelectList } from '../oncallui-react-framework/index.js';
import { Checkbox } from '@salesforce/design-system-react';
import { getNotesTypes } from '../recruitment/RecruitmentCommon.js';
import SendSMSActivity from './SendSMSActivity.jsx';

const getOptionsLeadStaff = (e, data) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("common/Common/get_admin_name", { search: e }).then(json => {
        return { options: json };
    });
}


const getOptionsRelatedToTask = (e, data) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("sales/Contact/get_option_task_field_ralated_to", { search: e }).then(res => {
        return { options: res.data };
    });
}

const getOptionsNameTask = (e, data) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("sales/Contact/get_option_task_field_name", { search: e }).then(res => {
        return { options: res.data };
    });
}

const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {
        var icon_ref = "";
        var className = "";
        if (this.props.option.type == 1) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#opportunity";
             className = "slds-icon-standard-opportunity";
        }else if (this.props.option.type == 10) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#record";
             className = "slds-icon-standard-record";
        } else if (this.props.option.type == 2) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#lead";
             className = "slds-icon-standard-lead";
        } else if (this.props.option.type == 3) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#skill_requirement";
             className = "slds-icon-standard-skill-requirement";
        } else if (this.props.option.type == 4) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#service_report";
             className = "slds-icon-standard-service-report";
        } else if (this.props.option.type == 5) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#service_contract";
             className = "slds-icon-standard-service-contract";
        }else if (this.props.option.type == 6) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact";
             className = "slds-icon-standard-contact";
        }else if (this.props.option.type == 7) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#timesheet";
             className = "slds-icon-standard-timesheet";
        }else if (this.props.option.type == 8) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#file";
             className = "slds-icon-standard-file";
        }else if (this.props.option.type == 9) {
             icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#people";
             className = "slds-icon-standard-people";
        }

        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>

                <div role="presentation" class="slds-listbox__item">
                    <div id="option3" class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                        <span class="slds-media__figure slds-listbox__option-icon">
                            <span class={"slds-icon_container "+className}>
                                <svg class="slds-icon slds-icon_small" aria-hidden="true">
                                    <use href={icon_ref}></use>
                                </svg>
                            </span>
                        </span>
                        <span class="slds-media__body">
                            <span class="slds-listbox__option-text slds-listbox__option-text_entity">{this.props.option.label}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
});


class CreateActivityComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contact_option: [],
            get_related_to: []
        }

        this.createTask = React.createRef();
        this.createCallLog = React.createRef();
        this.sendSMS = React.createRef();
    }

    getOptionsContactName = (e) => {
        const for_sa_id =  this.props.salesId;
        var salesId = this.props.salesId;
        if(this.props.sales_type=='service'){
            salesId = this.props.contactId;
        }else if(this.props.sales_type=='application'){
            salesId = this.props.person_id;
        }
        postData("sales/Contact/get_option_of_contact_name_search", { salesId: salesId, sales_type: this.props.sales_type,serviceagremmentId :for_sa_id, application_id:this.props.application_id }).then(res => {
            if (res.status) {
                var option = res.data.contact_option;
                this.setState({ contact_option: option ,get_related_to: res.data.related_to},()=>{
                })
                if ((this.props.sales_type === "contact" || this.props.sales_type === "lead" || this.props.sales_type === "application") && option.length > 0) {
                    // set contact id
                    this.setState({contactId: option[0]["id"]});
                    this.createTask.current.setKeyValueNameState('contactId', option[0]["value"]);
                    this.createCallLog.current.setKeyValueNameState('contactId', option[0]["value"]);
                    if(this.props.sales_type === "application"){
                        this.createTask.current.setKeyValueNameState('contact_option', option[0]);
                    }
                }

                  // set related to field
                  if(res.data && res.data.related_to!=null){
                    this.createTask.current.setKeyValueNameState('related_to', res.data.related_to);
                    this.createCallLog.current.setKeyValueNameState('related_to', res.data.related_to);
                  }                  
            }
        });
    }

    componentDidMount() {
        this.setState({ contactId: null })
        this.createTask.current.setKeyValueNameState('contactId', null);
        this.createCallLog.current.setKeyValueNameState('contactId', null);

        this.getOptionsContactName();  
    }

    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath="/assets/icons">
                    <Tabs variant="scoped" id="tabs-example-scoped" className="slds-tab-overflow-x">
                        <TabsPanel label="Task">
                            <CreateTask 
                                {...this.state}
                                {...this.props}
                                ref={this.createTask}
                                contact_option = {this.state.contact_option}
                            />
                        </TabsPanel>
                        <TabsPanel label="Email">
                           { /* Coming Soon */}
                            <SendEmailActivity
                                {...this.state}
                                ref={this.sendEmail} 
                                {...this.props}
                                related_to ={this.state.get_related_to}
                            /> 
                        </TabsPanel> 
                        <TabsPanel label="Call">
                            <CreateCallLog 
                                {...this.state}
                                {...this.props}
                                contact_option = {this.state.contact_option}
                                ref={this.createCallLog}
                            />
                        </TabsPanel>
                        <TabsPanel label="Note">
                            {/* Coming Soon */}
                            {this.props.related_type=='6' || this.props.related_type=='8' ? <CreateNote 
                                {...this.state}
                                {...this.props}
                                contact_option = {this.state.contact_option}
                                ref={this.createNote}
                                related_to ={this.state.get_related_to}
                            />  : 'Coming Soon'}
                            
                        </TabsPanel>
                        <TabsPanel label="SMS">
                            <SendSMSActivity
                                ref={this.sendSMS} 
                                related_to ={this.state.get_related_to}
                                entity_type={this.props.sales_type || ''}
                                entity_id={this.props.salesId || ''}
                                get_sales_activity_data={this.props.get_sales_activity_data}
                                related_type={this.props.related_type}
                            /> 
                        </TabsPanel>
                    </Tabs>
                </IconSettings>
            </React.Fragment >
        );
    }
}

const mapStateToProps = state => ({
    activity_timeline: state.SalesActivityReducer.activity_timeline,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_sales_activity_data: (request) => dispatch(get_sales_activity_data(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps, null, { withRef: true } )(CreateActivityComponent);

class CreateTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "0",
            contact_option: [],
            due_date: "",
        }
    }

    setKeyValueNameState = (key, value) => {
        this.setState({ [key] : value})
    }

    resetField = () => {
        this.setState({ assign_to: {}, related_to:this.props.get_related_to, due_date: "", status: "0", task_name: "" });
        if (this.props.sales_type !== "contact") {
            this.setState({ contactId: "" })
        }
    }

    submitTask = (e) => {
        e.preventDefault();
        jQuery("#create_user").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (jQuery("#create_user").valid()) {
            this.setState({ loading: true });
            var sales_type = this.props.sales_type;
            // if(sales_type != 'service'){
            //     if(this.state.related_to){
            //         if(this.state.related_to.type==1){
            //             sales_type = 'opportunity';
            //         }else if(this.state.related_to.type==2){
            //             sales_type = 'lead';
            //         }  
            //     }     
            // }
            let related_to_val = this.state.related_to && this.state.related_to.value? this.state.related_to.value : 0;
            var req = {
                ...this.state,
                sales_type: sales_type,
                salesId: sales_type != 'service' && sales_type != 'application' && related_to_val ? related_to_val : this.props.salesId, 
                assign_to: this.state.assign_to ? this.state.assign_to.value : '',
                related_to: this.state.related_to ? this.state.related_to.value : '',
                related_type: this.state.related_to ? this.state.related_to.type : '',
                contactId: this.state.contactId ? (this.state.contactId.value ? this.state.contactId.value : this.state.contactId) : '',
                // name_type: this.state.contactId ? (this.state.contactId.type ? this.state.contactId.type : 6) : this.state.contact_option ? this.state.contact_option.type : 6,
                name_type: this.state.contactId ? (this.state.contactId.type ? this.state.contactId.type : '') : '',

            }
            if(sales_type == 'application' && this.state.contact_option && this.state.contact_option.type){
                req['contactId'] = this.state.contact_option ? (this.state.contact_option.value ? this.state.contact_option.value : '') : '';
                req['name_type'] = this.state.contact_option ? (this.state.contact_option.type ? this.state.contact_option.type : '') : '';

            }
            postData('sales/Contact/create_task_for_contact', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ createTask: false })
                    this.resetField();
                    this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type, opp_id: this.props.opp_id, lead_id: this.props.lead_id });

                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }
    }


    render() {
        var status_option = [{ "value": '0', "label": "Assigned" }, { "value": '1', "label": "Completed" }, { "value": '3', "label": "Archived" }];

        return (

            <form id="create_user" autocomplete="off" className="slds_form">

                {!this.state.createTask ?
                    <div className="slds-grid slds-wrap slds-gutters_x-small">
                        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-1 slds-large-size_7-of-12">
                            <div className="slds-form-element">
                                <div className="slds-form-element__control mb-sm-2">
                                <input type="text" id="text-input-id-1" placeholder="" required="" className="slds-input" />
                                </div>
                            </div>
                        </div>
                        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-1 slds-large-size_5-of-12">
                            <Button label="New" variant="brand" onClick={() => this.setState({ createTask: true })} />
                        </div>
                    </div>
                    :
                    <div className="slds-grid ">
                        <div className="slds-col">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                <abbr className="slds-required" title="required">* </abbr>Task Name</label>
                                <div className="slds-form-element__control">
                                    <input
                                        type="text"
                                        placeholder="Task Name"
                                        name="task_name"
                                        onChange={(e) => this.setState({ task_name: e.target.value })}
                                        value={this.state.task_name}
                                        required={true}
                                        className="slds-input"
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label">Due Date</label>
                                <div className="slds-form-element__control datepicker_100_width">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <Datepicker                                            
                                            input={<input name="due_date"/>}   
                                            parser={(date) => moment(this.state.due_date, 'DD/MM/YYYY').toDate()}                                        
                                            onChange={(event, data) => this.setState({ due_date: (moment(data.date).isValid() ? moment.utc(data.date) : null) })}
                                            formatter={(date) => { return date ? moment.utc(this.state.due_date).format('DD/MM/YYYY') : ''; }}
                                            value={this.state.due_date || ''}
                                            relativeYearFrom={0}
                                            dateDisabled={(data) =>                                              
                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                            }
                                        />
                                    </IconSettings>
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label">Name</label>
                                <div className="slds-form-element__control">                                   
                                    <SLDSReactSelect.Async 
                                        clearable={true}
                                        className="SLDS_custom_Select default_validation"
                                        // options={this.props.contact_option}
                                        value={this.props.sales_type != 'application' ? this.state.contactId : this.state.contact_option}
                                        // value={this.state.contactId}
                                        cache={false}
                                        loadOptions={(e) => getOptionsNameTask(e, [])}
                                        onChange={(e) => {
                                            if(e!=null){
                                                this.props.sales_type != 'application' ?  this.setState({ contactId: e  }) : this.setState({contact_option :e })
                                            }else{
                                                this.setState({ contact_option: '', contactId: '' })
                                            }                                            
                                        }}
                                        placeholder="Please Search"
                                        name="contactId"
                                        optionComponent={GravatarOption}
                                        filterOptions={selectFilterOptions}
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label">Related To</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect.Async 
                                        clearable={true}
                                        className="SLDS_custom_Select default_validation"
                                        value={this.state.related_to}
                                        cache={false}
                                        loadOptions={(e) => getOptionsRelatedToTask(e, [])}
                                        onChange={(e) => this.setState({ related_to: e })}
                                        placeholder="Please Search"
                                        name="related_to"
                                        optionComponent={GravatarOption}
                                        filterOptions={selectFilterOptions}
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Assign To</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect.Async 
                                        clearable={false}
                                        className="SLDS_custom_Select default_validation"
                                        value={this.state.assign_to}
                                        cache={false}
                                        loadOptions={(e) => getOptionsLeadStaff(e, [])}
                                        onChange={(e) => this.setState({ assign_to: e })}
                                        placeholder="Please Search"
                                        required={true}
                                        name="assign_to"
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Status</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect
                                        simpleValue={true}
                                        className="custom_select default_validation"
                                        options={status_option}
                                        onChange={(value) => this.setState({ status: value })}
                                        value={this.state.status || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Please Select"
                                        required={true}
                                        name="Status"
                                    />
                                </div>
                            </div>


                            <div className="mt-3 text-right">
                                <button className="slds-button slds-button_neutral" onClick={(e) => { e.preventDefault(); this.setState({ createTask: false }) }} >Cancel</button>
                                <button style={{ color: 'white' }} className="slds-button slds-button_success" onClick={(e) => this.submitTask(e)}>Save</button>
                            </div>
                        </div>
                    </div>
                }

            </form>
        );
    }
}

class CreateCallLog extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    setKeyValueNameState = (key, value) => {
        this.setState({ [key] : value})
    }

    resetField = () => {
        this.setState({ subject: "", comment: "",related_to:this.props.get_related_to});
        if (this.props.sales_type !== "contact") {
            this.setState({ contactId: "" })
        }
    }

    submitTask = (e) => {
        e.preventDefault();
        jQuery("#create_call_log").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (jQuery("#create_call_log").valid()) {
            this.setState({ loading: true });
            var req = {
                ...this.state,
                sales_type: this.props.sales_type,
                salesId: this.props.salesId,
                related_to: this.state.related_to ? this.state.related_to.value : 0,
                related_type: this.state.related_to ? this.state.related_to.type : '',
                contactId: this.state.contactId && this.state.contactId.value ? this.state.contactId.value : (this.props.contact_option.length > 0 && this.props.contact_option[0].value) ? this.props.contact_option[0].value : '',
                name_type: this.state.contactId && this.state.contactId.type ? this.state.contactId.type : (this.props.contact_option.length > 0 && this.props.contact_option[0].type) ? this.props.contact_option[0].type : '',
            }

            postData('sales/Contact/create_call_log_for_contact', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ createTask: false })
                    this.resetField();
                    this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type, opp_id: this.props.opp_id, lead_id: this.props.lead_id });

                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }
    }


    render() {

        return (

            <form id="create_call_log" autocomplete="off" className="slds_form">

                <div className="slds-grid ">
                    <div className="slds-col">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >
                                <abbr className="slds-required" title="required">* </abbr>Subject</label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    name="task_name"
                                    onChange={(e) => this.setState({ subject: e.target.value })}
                                    value={this.state.subject}
                                    required={true}
                                    className="slds-input"
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >
                                <abbr className="slds-required" title="required">* </abbr>Comments</label>
                            <div className="slds-form-element__control datepicker_100_width">
                                <textarea 
                                    class="slds-textarea"  
                                    name="comment" 
                                    value={this.state.comment} 
                                    onChange={(e) => this.setState({comment: e.target.value})}
                                    style={{minHeight: "80px"}}
                                    required={true}
                                    maxLength={1000}
                                >
                                </textarea>
                            </div>
                        </div>

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >
                                <abbr className="slds-required" title="required">* </abbr>Name</label>
                            <div className="slds-form-element__control">                                
                                <SLDSReactSelect.Async 
                                    clearable={true}
                                    className="SLDS_custom_Select default_validation"
                                    options={this.props.contact_option}
                                    value={this.state.contactId}
                                    cache={false}
                                    loadOptions={(e) => getOptionsNameTask(e, [])}
                                    onChange={(e) => this.setState({ contactId: e })}
                                    placeholder="Please Search"
                                    required={true}
                                    name="contactId"
                                    optionComponent={GravatarOption}
                                    filterOptions={selectFilterOptions}
                                />
                            </div>
                        </div>

                        <div className="slds-form-element">
                            <label className="slds-form-element__label" >
                                <abbr className="slds-required" title="required"></abbr>Related To</label>
                            <div className="slds-form-element__control">
                                <SLDSReactSelect.Async 
                                    clearable={false}
                                    className="SLDS_custom_Select default_validation"
                                    value={this.state.related_to}
                                    cache={false}
                                    loadOptions={(e) => getOptionsRelatedToTask(e, [])}
                                    onChange={(e) => this.setState({ related_to: e })}
                                    placeholder="Please Search"
                                    name="related_to"
                                    optionComponent={GravatarOption}
                                    filterOptions={selectFilterOptions}
                                />
                            </div>
                        </div>

                        <div className="mt-3 text-right">
                            <button style={{ color: 'white' }} className="slds-button slds-button_success" onClick={(e) => this.submitTask(e)}>Save</button>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

class CreateNote extends Component {
    constructor(props) {
        super(props);
        this.state = {
            related_to: props.related_to,
            related_type: props.related_type,
            note_type: "1"
        }
    }

    setKeyValueNameState = (key, value) => {
        this.setState({ [key] : value})
    }

    resetField = () => {
        this.setState({ title: "", description: "", related_to:this.props.get_related_to, createNote: false});
        if (this.props.sales_type !== "contact") {
            this.setState({ contactId: "" })
        }
    }

    submitNote = (e) => {
        e.preventDefault();
        jQuery("#create_call_log").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (jQuery("#create_call_log").valid()) {
            this.setState({ loading: true });
            var req = {
                ...this.state,
                sales_type: this.props.sales_type,
                salesId: this.props.salesId,
                related_to: this.state.related_to ? this.state.related_to.value : 0,
                related_type: this.state.related_to ? this.state.related_to.type : '',
            }

            postData('sales/Contact/create_note_for_activity', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ createTask: false })
                    this.resetField();
                    this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type, opp_id: this.props.opp_id, lead_id: this.props.lead_id });

                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }
    }


    render() {
        let va_link = ROUTER_PATH + `admin/schedule/notes/${this.props.salesId}`;
        if (this.props.related_type === "8") {
            va_link = ROUTER_PATH + `admin/recruitment/application/notes/${this.props.applicant_id}/${this.props.salesId}`;
        }
        return (
            <form id="create_notes" autocomplete="off" className="slds_form">
                {!this.state.createNote ?
                    <div className="slds-grid slds-wrap slds-gutters_x-small">
                        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-1 slds-large-size_7-of-12">
                            <div className="slds-form-element">
                                <div className="slds-form-element__control mb-sm-2">
                                <Button label="New" variant="brand" onClick={() => this.setState({ createNote: true })} />
                                </div>
                            </div>
                        </div>
                        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-1 slds-large-size_5-of-12">                        
                        <Link to={va_link} className="reset" style={{ color: '#006dcc' }} title={'notes'}><Button label="View All Notes" variant="brand" /></Link>
                        </div>
                    </div>
                    :
                    <div className="slds-grid ">
                        <div className="slds-col">
                            {this.props.related_type === "8" &&
                            <SelectList
                                id="note_type"
                                name="note_type"
                                label="Note Type"
                                options={getNotesTypes()}
                                onChange={v => this.setState({ note_type: v })}
                                value={this.state.note_type}
                                required
                            /> 
                            || <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Title</label>
                                <div className="slds-form-element__control">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        name="title"
                                        onChange={(e) => this.setState({ title: e.target.value })}
                                        value={this.state.title}
                                        required={true}
                                        className="slds-input"
                                        maxLength={200}
                                    />
                                </div>
                            </div>}

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">*</abbr>Related To</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect.Async
                                        clearable={false}
                                        className="SLDS_custom_Select default_validation"
                                        value={this.props.related_to}
                                        cache={false}
                                        loadOptions={(e) => getOptionsRelatedToTask(e, [])}
                                        // onChange={(e) => this.setState({ related_to: e })}
                                        placeholder="Please Search"
                                        name="related_to"
                                        optionComponent={GravatarOption}
                                        filterOptions={selectFilterOptions}
                                        disabled={true}
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Description</label>
                                <div className="slds-form-element__control datepicker_100_width">
                                    <textarea
                                        class="slds-textarea"
                                        name="description"
                                        value={this.state.description}
                                        onChange={(e) => this.setState({ description: e.target.value })}
                                        style={{ minHeight: "80px" }}
                                        required={true}
                                        maxLength={1000}
                                    >
                                    </textarea>
                                </div>
                            </div>
                            {this.props.related_type === "8" && <Checkbox
                                assistiveText={{
                                    label: 'Confidential',
                                }}
                                id="confidential"
                                labels={{
                                    label: 'Confidential',
                                }}
                                checked={this.state.confidential}
                                name="confidential"
                                onChange={(e) => this.setState({ confidential: e.target.checked })}
                            />}
                            <div className="mt-3 text-right">
                                <button style={{ color: 'white' }} className="slds-button slds-button_success" onClick={(e) => this.submitNote(e)}>Save</button>
                            </div>
                        </div>
                    </div>}
            </form>
        );
    }
}
