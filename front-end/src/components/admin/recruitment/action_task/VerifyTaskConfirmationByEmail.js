import React, { Component } from 'react';
import {postData } from 'service/common.js';

class VerifyTaskConfirmationByEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: 'Please wait, while we verify your request',
        }
    }

    componentDidMount() {
        postData('recruitment/RecruitmentTaskAction/verify_task_confirmation_by_email', this.props.match.params).then((result) => {
            this.setState({loading: false});
            if (result.status) {
                this.setState({error: ''});
                this.setState({message: "Thanks for your response"});
            } else {
                this.setState({message: result.error});
            }
        });
    }

    render() {
        return (
    <div>
        <div className="error_bg">
            <div className="flex_p">
                <div></div>
                <div>
                    <h2 className="pt-4">{this.state.message}</h2>
                </div>
            </div>
        </div>
    </div>
                );
    }
}
export default VerifyTaskConfirmationByEmail
