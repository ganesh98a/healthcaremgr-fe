import React, { Component } from 'react';
import Select from 'react-select-plus';
import EditTask from './EditTask';


class ShortTaskListPopUp extends Component {
    constructor() {
        super();
        this.state = {
           
        }

    }
    
    editTaskOpenModal = (taskId) => {
        this.setState({ editTaskId: taskId, EditNewTaskModal: true });
    }

    EditCloseModel = (status) => {
        this.setState({ editTaskId: '', EditNewTaskModal: false });
    }
    
    render() {

        return (
                <React.Fragment>
                    <div className={"schedules_modal " + (this.props.showModal ? 'show' : '')}>
                        <div className="sched_modal_dialog left">
                            <div className="attending_list_dv">
                                <div className="d-flex justify-content-between bb-1  pb-2 mb-2">
                                    <b>Task Name</b><b>Task Details</b>
                                </div>
                                <ul className="attendees1">
                                    {this.props.task_list.map((val, index) => (
                                        <li>{val.task_name}<span onClick={() => this.editTaskOpenModal(val.taskId)} className="icon icon-view2-ie cursor-pointer"></span></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="text-center bt-1 pt-3">
                                <span onClick={this.props.closeModal} className="short_buttons_01">Close</span>
                            </div>
                        </div>
                    </div>
                    
                     {this.state.EditNewTaskModal ? <EditTask taskId={this.state.editTaskId} showModal={this.state.EditNewTaskModal} closeModal={this.EditCloseModel} /> : ''}
                
                </React.Fragment>
                );
    }
}

export default ShortTaskListPopUp;