import React, { Component } from 'react';
import jQuery from "jquery";
import moment from 'moment';
import PropTypes from 'prop-types';
import createClass from 'create-react-class';
import _ from 'lodash'
import 'react-select-plus/dist/react-select-plus.css';

import { checkItsNotLoggedIn, postData, toastMessageShow, css, selectFilterOptions, checkLoginWithReturnTrueFalse, getPermission, handleChangeChkboxInput } from 'service/common.js';


import 'react-block-ui/style.css';

import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';

/**
 * To fetch Assigned to details
 * @param {*} memberid 
 * @param {*} data 
 */
const getOptionsLeadStaff = (e, data) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("common/Common/get_admin_name", { search: e }).then(json => {
        return { options: json };
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
        if (this.props.option.type == 1) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#opportunity";
            var className = "slds-icon-standard-opportunity";
        } else if (this.props.option.type == 2) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#lead";
            var className = "slds-icon-standard-lead";
        } else if (this.props.option.type == 3) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#skill_requirement";
            var className = "slds-icon-standard-skill-requirement";
        } else if (this.props.option.type == 4) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#service_report";
            var className = "slds-icon-standard-service-report";
        } else if (this.props.option.type == 5) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#service_contract";
            var className = "slds-icon-standard-service-contract";
        }else if (this.props.option.type == 6) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact";
            var className = "slds-icon-standard-contact";
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
                            <span class={"slds-icon_container " + className}>
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


class EditTaskModal extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            isFetching: true,
            task_status: "1",
            contact_option: [],
            assignto_option: []
        }

        this.formRef = React.createRef()
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
    }

    componentDidMount() {
        if (this.props.taskData.id) {
            this.get_task_details();

        }

    }

    setKeyValueNameState = (key, value) => {
        this.setState({ [key]: value })
    }

/**
 * To fetch the task to details
 * @param {*} task_id 
 * 
 */
    get_task_details = () => {
        this.setState({ isFetching: true })
        postData('sales/Task/get_task_details_for_edit', { task_id: this.props.taskData.id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
                var salesId = this.props.taskData.related_to_id ? this.props.taskData.related_to_id : this.props.taskData.crm_participant_id;
                var sales_type = 'contact';
                var application_id = ''
                if (this.props.taskData.related_type == 1) {
                    sales_type = 'opportunity';
                } else if (this.props.taskData.related_type == 2) {
                    sales_type = 'lead';
                } else if (this.props.taskData.related_type == 3) {
                    sales_type = 'service';
                } else if (this.props.taskData.related_type == 8) {
                    sales_type = 'application';
                    application_id = result.data.related_to_id
                }else if (this.props.taskData.related_type == 9) {
                    sales_type = 'interview';
                }
                this.getOptionsContactName(salesId, sales_type, false,application_id);
            }
        })
    }

    /**
     * Fetch Name , Related to and Assigned to values
     * 
     * param - salesId , sales_type , assign_to
     *  
     * */
    getOptionsContactName = (salesId, sales_type, isRelatedToChange, application_id) => {
        salesId = salesId ? salesId : 0;
        var assign_to = this.state.assign_to ? (this.state.assign_to.value ? this.state.assign_to.value : this.state.assign_to) : '';
        postData("sales/Contact/get_option_of_contact_name_search", { salesId: salesId, sales_type: sales_type, assign_to: assign_to, application_id: application_id }).then(res => {
            if (res.status) {
                //Here type 6 as contact and 2 as lead
               let nameData= [];
               nameData.push ({
                    label: this.props.taskData.name, 
                    value: this.props.taskData.crm_participant_id ? this.props.taskData.crm_participant_id : this.props.taskData.lead_id  ,
                    type : this.props.taskData.crm_participant_id ? '6' : '2'
                })
                this.setState({ contact_option: nameData });
                this.setKeyValueNameState('contactId', nameData[0]);               

                // set related to field
                this.setKeyValueNameState('related_to', res.data.related_to);
                this.setKeyValueNameState('assign_to', res.data.assign_to);
                this.setState({ isFetching: false });
            }
        });
    }
  /**
    * To fetch the related to details
    * @param {*} task_id 
    * 
    */
    getOptionsRelatedToTask = (e) => {
        if (!e) {
            return Promise.resolve({ options: [] });
        }

        return postData("sales/Contact/get_option_task_field_ralated_to", { search: e }).then(res => {

            this.setState({ contact_option: [] })
            return { options: res.data };
        });
    }
    /**
    * get the name based on related to options
    * @param {*} sales_type 
    * 
    */
    getNameForRelatedOption(e) {
        var sales_type;
        if (e) {
            if (e && e.type == 1) {
                sales_type = 'opportunity';
            } else if (e && e.type == 2) {
                sales_type = 'lead';
            }
            this.setState({
                related_to: e.value,
            }, () => { this.getOptionsContactName(e.value, sales_type, true) });
        } else {
            this.setState({
                related_to: [],
            })
        }

    }

    resetField = () => {
        this.setState({ assign_to: {}, related_to: {}, due_date: "", status: "0", task_name: "" });
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
            var sales_type = this.props.taskData.entity_type == 5 ? 'service' : '';
            if (sales_type != 'service') {
                if(this.state.related_to){
                    if (this.state.related_to.type == 1) {
                        sales_type = 'opportunity';
                        this.setState({ entity_id: this.state.related_to.value })
                    } else if (this.state.related_to.type == 2) {
                        sales_type = 'lead';
                    }
                }               
            }

            if (this.state.contact_option.length == 0) {
                this.setState({ crm_participant_id: '' })
            }
            var req = {
                ...this.state,
                sales_type: sales_type,
                salesId: this.state.related_to && this.state.related_to.value? this.state.related_to.value : this.state.entity_id,
                assign_to: this.state.assign_to ? this.state.assign_to.value : '',
                related_to: this.state.related_to ? this.state.related_to.value : '',
                related_type: this.state.related_to && this.state.related_to.type ? this.state.related_to.type : '',
                contactId: this.state.contactId ? this.state.contactId.value : '',
                name_type: this.state.contactId ? this.state.contactId.type : '',
            }

            postData('sales/Contact/update_task_for_contact', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.resetField();
                    this.props.closeModal(false)
                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }
    }

    render() {
        var status_option = [{ "value": '0', "label": "Assigned" }, { "value": '1', "label": "Completed" }, { "value": '3', "label": "Archived" }];

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
                {!this.state.isFetching ? <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <div>
                        <Modal
                            isOpen={this.props.showModal}
                            footer={[
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                                <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.submitTask} />,
                            ]}
                            onRequestClose={this.toggleOpen}
                            heading={this.props.taskData.id ? "Update Task" : ""}
                            size="small"
                            className="slds_custom_modal"
                            onRequestClose={() => this.props.closeModal(false)}
                        >
                            <section className="manage_top" >
                                <div className="container-fluid">
                                    <form id="create_user" autoComplete="off" className="slds_form" ref={this.formRef} style={{ paddingBottom: 100, display: 'block' }}>
                                        <div className="row py-3">
                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">
                                                        <abbr class="slds-required">*</abbr>Task Name</label>
                                                    <div class="slds-form-element__control">
                                                        <input
                                                            type="text"
                                                            placeholder="Task Name"
                                                            onChange={(e) => handleChangeChkboxInput(this, e)}
                                                            name="task_name" value={this.state.task_name}
                                                            data-rule-required="true"
                                                            data-rule-maxlength="100"
                                                            data-msg-maxlength="Task name can not be more than 100 characters."
                                                            required={true}
                                                            className="slds-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">
                                                        <abbr class="slds-required" title="required"> </abbr>Due Date</label>
                                                    <div class="slds-form-element__control">
                                                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                            <Datepicker
                                                                input={<input name="due_date" />}
                                                                parser={(date) => this.state.due_date ? moment(this.state.due_date, 'DD/MM/YYYY').toDate() : ''}
                                                                onChange={(event, data) => this.setState({ due_date: (moment(data.date).isValid() ? moment.utc(data.date) : null) })}
                                                                formatter={(date) => { return date ? moment.utc(this.state.due_date).format('DD/MM/YYYY') : ''; }}
                                                                value={this.state.due_date != '0000-00-00' ? this.state.due_date : ''}
                                                                relativeYearFrom={0}
                                                                dateDisabled={(data) =>
                                                                    moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                                }
                                                            />
                                                        </IconSettings>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Name</label>                                                    
                                                    <SLDSReactSelect.Async
                                                        clearable={true}
                                                        className="SLDS_custom_Select default_validation"
                                                        options={this.state.contact_option}
                                                        value={this.state.contactId}
                                                        cache={false}
                                                        loadOptions={(e) => getOptionsNameTask(e, [])}
                                                        onChange={(e) =>this.setState({ contactId: e })}
                                                        placeholder="Please Search"
                                                        name="contactId"
                                                        optionComponent={GravatarOption}
                                                        filterOptions={selectFilterOptions}
                                                    />
                                                </div>

                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Related To</label>
                                                    <SLDSReactSelect.Async
                                                        clearable={true}
                                                        className="SLDS_custom_Select default_validation"
                                                        value={this.state.related_to}
                                                        cache={false}
                                                        loadOptions={(e) => this.getOptionsRelatedToTask(e, [])}
                                                        onChange={(e) => this.setState({ related_to: e })}
                                                        // onChange={(e) => this.getNameForRelatedOption(e)}
                                                        placeholder="Please Search"
                                                        name="related_to"
                                                        optionComponent={GravatarOption}
                                                        filterOptions={selectFilterOptions}
                                                    />
                                                </div>

                                            </div>
                                        </div>

                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6">

                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">
                                                        <abbr className="slds-required" title="required">* </abbr> Assigned To</label>
                                                    <div class="slds-form-element__control">
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

                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                        <abbr className="slds-required" title="required">* </abbr>Status</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <SLDSReactSelect
                                                                simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={status_option}
                                                                onChange={(value) => this.setState({ task_status: value })}
                                                                value={this.state.task_status || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Please Select"
                                                                required={true}
                                                                name="Status"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </form>
                                </div>
                            </section>
                        </Modal>
                    </div>
                </IconSettings> : ''}
            </div >
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

export default connect(mapStateToProps, mapDispatchtoProps)(EditTaskModal);
