import React from 'react'
import moment from 'moment'
import { Button, Datepicker } from '@salesforce/design-system-react'
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect'
import { postData, toastMessageShow } from '../../../../../service/common';
import jQuery from 'jquery'

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



class LeadDetailsNewTaskForm extends React.Component {

    static FEATURE_TOGGLE_ALLOW_CREATING_TASK = false

    static defaultProps = {
        /**
         * @type {() => void}
         */
        onSuccess: undefined,
    }

    constructor(props) {
        super(props)

        this.state = {
            createTask: false,
            status: "0",
            contact_option: [],
            due_date: "",
        }

        this.formRef = React.createRef()
    }

    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    handleSubmit = e => {
        e.preventDefault()

        if (!this.state.createTask) {
            this.setState({ createTask: LeadDetailsNewTaskForm.FEATURE_TOGGLE_ALLOW_CREATING_TASK })
            return false
        }

        jQuery(this.formRef.current).validate({ /* */ });
        this.setState({ validation_calls: true })

        if (jQuery(this.formRef.current).valid()) {
            this.setState({ loading: true });
            let req = {
                ...this.state,
                sales_type: this.props.sales_type,
                salesId: this.props.salesId,
                assign_to: this.state.assign_to ? this.state.assign_to.value : '',
                related_to: this.state.related_to ? this.state.related_to.value : '',
                related_type: this.state.related_to ? this.state.related_to.type : '',
            }

            postData('sales/Contact/create_task_for_contact', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ createTask: false })
                    this.resetField();
                    if (this.props.onSuccess) {
                        this.props.onSuccess()
                    }
                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }


        console.log('Not yet implemented')
    }

    resetField = () => {
        this.setState({assign_to: {}, related_to: {}, due_date: "", status: "0", task_name: ""});
        if(this.props.sales_type !== "contact"){
            this.setState({contactId: ""})
        }
    }


    render() {
        let status_option = [
            { "value": '0', "label": "Assigned" },
            { "value": '1', "label": "Completed" },
            { "value": '3', "label": "Archived" },
        ];


        return (
            <form id="LeadDetailsNewTaskForm-1" onSubmit={this.handleSubmit} autocomplete="off" className="LeadDetailsNewTaskForm slds_form" ref={this.formRef}>
                {
                !this.state.createTask ?
                (
                    <div className="slds-grid slds-gutters">
                        <div className="slds-col slds-size_9-of-12">
                            <div className="slds-form-element">
                                <div className="slds-form-element__control">
                                    <input type="text" className="slds-input" title="Not yet implemented"/>
                                </div>
                            </div>
                        </div>
                        <div className="slds-col slds-size_3-of-12">
                            <Button label="New" type="submit" variant="brand" title="Not yet implemented"/>
                        </div>
                    </div>
                )
                :
                (
                    <div className="slds-grid ">
                        <div className="slds-col">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Task Name
                                </label>
                                <div className="slds-form-element__control">
                                    <input
                                        type="text"
                                        placeholder="Task Name"
                                        name="task_name"
                                        onChange={(e) => this.setState({ task_name: e.target.value })}
                                        value={this.state.task_name || ''}
                                        required={true}
                                        className="slds-input"
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Due Date
                                </label>
                                <div className="slds-form-element__control datepicker_100_width">
                                    <Datepicker
                                        input={<input name="due_date" required={true} />}
                                        onChange={(event, data) => this.setState({ due_date: data.date })}
                                        formatter={(date) => { 
                                            return date ? moment(date).format('DD/MM/YYYY') : ''}
                                        }
                                        value={this.state.due_date || ''}
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Name</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect
                                        simpleValue={true}
                                        className="custom_select default_validation"
                                        options={this.state.contact_option}
                                        onChange={(value) => this.setState({ contactId: value })}
                                        value={this.state.contactId || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Please Select"
                                        required={true}
                                        name="contactId"
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Related To
                                </label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect.Async clearable={false}
                                        className="SLDS_custom_Select default_validation"
                                        value={this.state.related_to}
                                        cache={false}
                                        loadOptions={(e) => getOptionsRelatedToTask(e, [])}
                                        onChange={(e) => this.setState({ related_to: e })}
                                        placeholder="Please Search"
                                        required={true}
                                        name="related_to"
                                    />
                                </div>
                            </div>

                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Assign To
                                </label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect.Async clearable={false}
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
                                    <abbr className="slds-required" title="required">* </abbr>Status
                                </label>
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
                                <button 
                                    type="button" 
                                    className="slds-button slds-button_neutral" 
                                    onClick={(e) => this.setState({ createTask: false })} 
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ color: 'white' }} 
                                    className="slds-button slds-button_success"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            </form>
        )
    }
}

export default LeadDetailsNewTaskForm