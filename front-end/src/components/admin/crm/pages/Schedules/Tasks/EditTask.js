import React, { Component } from 'react';
import { postData, getOptionsCrmParticipant } from '../../../../../../service/common.js';
import moment from 'moment';
import { toast } from 'react-toastify';
import jQuery from "jquery";
import { ToastUndo } from 'service/ToastUndo.js';
import DatePicker from 'react-datepicker';
import Select from 'react-select-plus';
import { priorityTask } from '../../../../../../dropdown/CrmDropdown.js';

const requestTaskPriority = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData('crm/CrmTask/get_task_priority_list', Request).then((result) => {
            let filteredData2 = result.data;

            const res = {
                rows: filteredData2,
                pages: (result.count)
            };
            setTimeout(() => resolve(res), 10);
        });

    });
};


class EditTask extends Component {
    constructor(props, context) {
        super(props, context);
        this.child = React.createRef();
        this.state = {

            crm_participant_id: '',
            task_name: '',
            due_date: '',
            task_note: '',
            priority: '',
            task_id: '',
            assigned_to: '',
            action: '1',
            crm_participant_id: { stageName: '' }
        };
    }

    componentWillMount() {
        //  this.viewEditTaskData();

        requestTaskPriority(
            this.state.pageSize,
            this.state.page,
            this.state.sorted,
            this.state.filtered
        ).then(res => {
            this.setState({
                task_priority: res.rows,
                pages: res.pages,
                loading: false
            });
        });



        if (this.props.editTaskId != null && this.props.editTaskId != 'undefined' && this.props.editTaskId != '') {
            postData('crm/CrmTask/get_task_details', { taskId: this.props.editTaskId }).then((result) => {

                if (result.status) {
                    this.setState({
                        crm_participant_id: {
                            value: result.data.crm_participant_id,
                            label: result.data.participant_name,
                            stageName: result.data.stage_name,
                            assigned_person: result.data.assigned_person
                        },
                        task_name: result.data.taskname,
                        due_date: result.data.duedate,
                        relevant_task_note: result.data.relevant_task_note,
                        priority: result.data.priority,
                        task_id: result.data.task_id,
                        assigned_to: result.data.assign_to
                    })
                } else {

                    toast.dismiss();
                    toast.error(
                        <ToastUndo message={result.error} showType={'e'} />,
                        {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        }
                    );
                    this.closeModal();
                }

            });

        }
    }


    submit = (e) => {

        e.preventDefault();

        var url = 'crm/CrmTask/task_update';
        var tosteMessage = "Task updated successfully";

        var custom_validate = this.custom_validation({ errorClass: 'tooltip-default' });
        var validator = jQuery("#edit_task").validate({ ignore: [] });
        if (jQuery("#edit_task").valid() && custom_validate) {
            this.setState({ disabled: true })
            var str = JSON.stringify(this.state);
            postData(url, str).then((result) => {
                if (result.status) {
                    toast.dismiss();
                    toast.success(<ToastUndo message={tosteMessage} showType={'s'} />, {
                        // toast.success("Task created successfully", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                    this.setState({ success: true })
                    this.props.closeModal(true);


                    let state = this.state;
                    state['task_name'] = '';
                    state['due_date'] = '';
                    state['relevant_task_note'] = '';
                    state['assigned_person'] = '';
                    state['taskPriority'] = '';
                    state['crm_participant_id'] = '';
                    this.setState(state);


                } else {
                    toast.dismiss();
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                    this.closeModal();
                }
                this.setState({ loading: false, disabled: false })
            });


        } else {
            validator.focusInvalid();
        }
    }
    closeModal = () => {

        this.props.closeModal();
        jQuery(".tooltip").hide();
    }

    handleChange = (e) => {
        var state = {};
        this.setState({ error: '' });
        state[e.target.name] = e.target.value;
        this.setState(state);
    }
    custom_validation = () => {
        var return_var = true;
        var state = {};
        var List = [{ key: 'due_date' }, { key: 'crm_participant_id' }];


        List.map((object, sidx) => {
            if (object.key == 'crm_participant_id') {


                if ((this.state['crm_participant_id'] == undefined || this.state['crm_participant_id'] == '')) {
                    state[object.key + '_error'] = true;
                    this.setState(state);
                    return_var = false;
                }
            } else if (this.state[object.key] == null || this.state[object.key] == undefined || this.state[object.key] == '') {
                state[object.key + '_error'] = true;
                this.setState(state);
                return_var = false;
            }
            else if (object.key == 'due_date') {
                if ((this.state['due_date'] == undefined || this.state['due_date'] == '')) {
                    state[object.key + '_error'] = true;
                    this.setState(state);
                    return_var = false;
                }
            }
        });
        return return_var;
    }
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;
        this.setState(state);
    }
    errorShowInTooltip = ($key, msg) => {
        //alert($key);
        return (this.state[$key + '_error']) ? <div className={'tooltip custom-tooltip fade top in' + ((this.state[$key + '_error']) ? ' select-validation-error' : '')} role="tooltip">
            <div className="tooltip-arrow"></div><div className="tooltip-inner">{msg}.</div></div> : '';

    }

    render() {

        var priority = (this.state.task_priority) ? this.state.task_priority : [];
        var options = "";

        return (


            <div className={this.props.show ? 'customModal show' : 'customModal'}>
                <div className="custom-modal-dialog Information_modal task_modal">
                    <div className="custom-modal-body w-100 mx-auto">
                        <div className="custom-modal-header by-1">
                            <div className="Modal_title">Edit Task</div>
                            <i className="icon icon-close1-ie Modal_close_i" onClick={this.closeModal}></i>
                        </div>
                        <form id="edit_task">

                            <div className="row">
                                <div className="w-100 my-4 d-flex flex-wrap">
                                    <div className="col-md-12"><h4 className="my-2 h4_edit__"> <b>Search for a Participant:</b></h4></div>
                                    <div className="col-md-7">
                                        <span className="required">
                                            <div className="search_icons_right modify_select text_left_modify_select">

                                                <Select.Async
                                                    cache={false}
                                                    clearable={true}
                                                    name="crm_participant_id"
                                                    value={(this.state['crm_participant_id']) ? this.state['crm_participant_id'] : ''}
                                                    loadOptions={getOptionsCrmParticipant}
                                                    placeholder='Search'
                                                    onChange={(e) => this.selectChange(e, 'crm_participant_id')}
                                                    className="custom_select"
                                                />

                                                {this.errorShowInTooltip('crm_participant_id', 'Select Participant')}


                                            </div>
                                        </span>
                                    </div>

                                    <div className="col-md-5 align-self-center">
                                        <p><b>Onboarding Stage:</b> {(this.state['crm_participant_id']) != null ? this.state['crm_participant_id'].stageName : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 my-4">
                                    <h4 className="my-2 h4_edit__"><b>Task Name:</b></h4>
                                    <span className="required">
                                        <input type="text" name="task_name" data-rule-required='true' data-msg-required="Add Task Name" value={this.state['task_name'] || ''} onChange={this.handleChange} className="default-input" />
                                    </span>
                                </div>
                                <div className="col-md-3 my-4">
                                    <h4 className="my-2 h4_edit__"><b>Priority:</b></h4>
                                    <span className="required">
                                        <div className="s-def1 w-100">

                                            <Select
                                                name="view_by_status"
                                                className="custom_select"
                                                options={priorityTask(0)}
                                                //  onFetchData = {this.fetchData2}
                                                required={true}
                                                name="priority"
                                                simpleValue={true}
                                                searchable={false}
                                                clearable={false}
                                                value={(this.state['priority']) ? this.state['priority'] : ''}
                                                placeholder="Priority"
                                                onChange={(e) => this.selectChange(e, 'priority')}

                                            />


                                            {this.errorShowInTooltip('priority', 'Select Priority')}
                                        </div>
                                    </span>
                                </div>
                                <div className="col-md-2 my-4">
                                    <h4 className="my-2 h4_edit__"><b>Due Date:</b></h4>
                                    <span className="required">
                                        <div className="s-def1 w-100">

                                            <DatePicker autoComplete={'off'} showYearDropdown scrollableYearDropdown
                                                yearDropdownItemNumber={110}
                                                dateFormat="dd-MM-yyyy"
                                                required={true} data-placement={'bottom'} utcOffset={0}
                                                minDate={moment()}
                                                name="due_date"
                                                onChange={(e) => this.selectChange(e, 'due_date')}
                                                selected={
                                                    this.state['due_date']
                                                }
                                                className="text-center " placeholderText="DD/MM/YYYY" maxLength="30" />

                                        </div>
                                    </span>
                                </div>
                                <div className="col-md-3 my-4">
                                    <h4 className="my-2 h4_edit__"><b>Assigned To :</b></h4>
                                    <div className="search_icons_right modify_select">
                                        <p>{(this.state['crm_participant_id']) != null ? this.state['crm_participant_id'].assigned_person : ''}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="row d-flex">
                                <div className="col-md-7">
                                    <h4 className="my-2 h4_edit__"><b>Relevant Task Notes:</b></h4>
                                </div>

                            </div>

                            <div className="row d-flex mb-4">
                                <div className="col-md-7  task_N_txt">
                                    <span className="required">
                                        <textarea name="relevant_task_note" data-rule-required='true' data-msg-required="Add Task Note" value={this.state['relevant_task_note'] || ''} onChange={this.handleChange} className="form-control textarea-max-size " wrap="soft" readOnly={(this.props.type == 1) ? 'true' : ''}></textarea>
                                    </span>
                                </div>
                            </div>



                            <div className="custom-modal-footer bt-1 mt-5 px-0 pb-4">
                                <div className="row d-flex justify-content-end">
                                    <div className="col-md-2"><a className="btn-1" onClick={this.submit}>Edit Task</a> </div>
                                </div>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        )
    }

}

export default EditTask;
