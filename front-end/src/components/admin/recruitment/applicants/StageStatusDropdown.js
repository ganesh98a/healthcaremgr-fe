import React, { Component } from 'react';
import Select from 'react-select-plus';
import { applicantStageStatus } from 'dropdown/recruitmentdropdown.js';
import { connect } from 'react-redux'
import './recruit2.css';
import { updateApplicantStage } from './../actions/RecruitmentApplicantAction';
import SelectionEmailTemplate from './SelectionEmailTemplate';

class StageStatusDropdown extends Component {

    static defaultProps = {
        application: null
    }

    constructor() {
        super();
        this.state = {
        }
    }

    onChnageStageStatus = (status) => {
        this.setState({selected_status: status}, () => {
            // only show email template pop-up when reject email
            if(status == 4){
                this.setState({open_email_template_pop: true})
            }else{
                var request = {applicant_id: this.props.applicant_id, 
                    stageId: this.props.stageId, 
                    status: this.state.selected_status,
                    stage_key : this.props.stage_key,
                    stage_number : this.props.stage_props.stage_number,
                    is_create_member:this.props.is_create_member,
                    application_id: (this.props.application || {}).id,
                }
                console.log(request);
                this.props.updateApplicantStage(request);
            }
        })
    }

    closeModel = (status) => {
        this.setState({open_email_template_pop: false});
        if(status){
            var request = {applicant_id: this.props.applicant_id, 
                stageId: this.props.stageId, 
                status: this.state.selected_status,
                selected_template: this.state.selected_template,
                stage_key : this.props.stage_key,
                is_create_member:this.props.is_create_member,
                application_id: (this.props.application || {}).id
            }
            this.props.updateApplicantStage(request);
        }
    }

    render() {
        return (<React.Fragment>
            <div className="set_select_small req_s1">
                <Select name="participant_assessment"
                    simpleValue={true}
                    searchable={false}
                    clearable={false}
                    options={this.props.stage_status_option}
                    value={this.props.stage_status}
                    onChange={(status) => this.onChnageStageStatus(status)}
                    className={'custom_select'}
                    disabled={this.props.disable_status}
                    is_create_member={this.props.is_create_member}
                />
            </div>

            {this.state.open_email_template_pop? 
            <SelectionEmailTemplate 
                 openModel={this.state.open_email_template_pop}
                closeModel={this.closeModel}
                selectTemplate={(e) => this.setState({selected_template: e})}
                selected_template={this.state.selected_template}
            />: ''}
        </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
})

const mapDispatchtoProps = (dispach) => {
    return {
        updateApplicantStage: (request) => dispach(updateApplicantStage(request)),
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(StageStatusDropdown)