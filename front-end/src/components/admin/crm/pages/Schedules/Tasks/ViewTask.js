import React, { Component } from 'react';
import { postData} from '../../../../../../service/common.js';
import ReactPlaceholder from 'react-placeholder';
import { customProfile } from 'service/CustomContentLoader.js';

class ViewTask extends Component {
    constructor(props, context) {
        super(props, context);
        this.child = React.createRef();
        this.state = {
            loading: true,
        };
    }
    componentDidMount(){
        this.getTaskDetailsForViewTask(this.props.taskId);
    }

    getTaskDetailsForViewTask = (taskId) => {
         postData('crm/CrmTask/get_task_details', {taskId: taskId}).then((result) => {
            if(result.data){
                this.setState(result.data)
                this.setState({loading: false})
            }
        });
    }

    render() {
        if (this.state.priority == 1) {
            var taskPriority = "Low";
        }
        else if (this.state.priority == 2) {
            var taskPriority = "Medium";
        }
        else if (this.state.priority == 3) {
            var taskPriority = "High";
        }
        var taskLists = '';

        return (
            <div className="custom-modal-body w-100 mx-auto">
                <div className="custom-modal-header by-1">
                    <div className="Modal_title">View Task</div>
                    <i className="icon icon-close1-ie Modal_close_i" onClick={this.props.closeModal}></i>
                </div>
                <ReactPlaceholder defaultValue={''} showLoadingAnimation={true} customPlaceholder={customProfile} ready={!this.state.loading}>

                <div className="row">
                    <div className="w-100 my-4 d-flex">
                        <div className="col-md-3">

                            <h4 className="my-2 h4_edit__"> <b> Participant Name:</b></h4>

                        </div>
                        <div className="col-md-8 align-self-center">
                            {this.state.participant_name || 'N/A'}
                        </div>


                    </div>
                </div>
                <div className="row">
                    <div className="w-100 my-4 d-flex">
                        <div className="col-md-3"><h4 className="my-2 h4_edit__"> <b>Onboarding Stage:</b></h4></div>
                        <div className="col-md-8 align-self-center">
                            {this.state.stage_name || 'N/A'}
                        </div>


                    </div>
                </div>
                <div className="row">
                    <div className="w-100 my-4 d-flex">
                        <div className="col-md-3"><h4 className="my-2 h4_edit__"> <b>Task Name:</b></h4></div>
                        <div className="col-md-8 align-self-center">
                            {this.state.taskname || 'N/A'}
                        </div>


                    </div>
                </div>
                <div className="row">
                    <div className="w-100 my-4 d-flex">
                        <div className="col-md-3"><h4 className="my-2 h4_edit__"> <b>Priority:</b></h4></div>
                        <div className="col-md-8 align-self-center">
                            {taskPriority || "N/A"}
                        </div>


                    </div>
                </div>
                <div className="row">
                    <div className="w-100 my-4 d-flex">
                        <div className="col-md-3"><h4 className="my-2 h4_edit__"> <b>Due Date:</b></h4></div>
                        <div className="col-md-8 align-self-center">
                            {this.state.duedate || "N/A"}
                        </div>


                    </div>
                </div>
                <div className="row">
                    <div className="w-100 my-4 d-flex">
                        <div className="col-md-3"><h4 className="my-2 h4_edit__"> <b>Assigned To:</b></h4></div>
                        <div className="col-md-8 align-self-center">
                            {this.state.assigned_person || "N/A"}
                        </div>


                    </div>
                </div>
                <div className="row">
                    <div className="w-100 my-4 d-flex">
                        <div className="col-md-3"><h4 className="my-2 h4_edit__"> <b>Relevant Task Notes:</b></h4></div>
                        <div className="col-md-8 align-self-center">
                            {this.state.relevant_task_note || "N/A"}
                        </div>
                    </div>
                </div>
                {/* <div className="custom-modal-footer bt-1 mt-5 px-0 pb-4">
                        <div className="row d-flex justify-content-end">
                            <div className="col-md-2"> </div>
                        </div>
                    </div> */}
                  </ReactPlaceholder>
            </div>

        )
    }

}

export default ViewTask;
