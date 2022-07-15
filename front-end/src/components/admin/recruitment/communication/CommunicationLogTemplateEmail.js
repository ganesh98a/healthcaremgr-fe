import React, { Component } from 'react';
class CommunicationLogTemplateEmail extends Component {

    constructor(){
        super();
        this.state = {
        }
    }
  
    render() {    
        if(this.props.temp_type=='cab_day_interview_invitation' || this.props.temp_type=='group_interview_invitation') {
            return (
              <React.Fragment>
                  { (this.props.emailTemplateVersion == 1)?
                  <div className="tBL_Sub">
                      <div className="row d-flex justify-content-center">
                          <div className="col-md-9 text-left">
                              <h4 className="mb-2"><b>Hello, {this.props.log_data.fullname}</b></h4>
                              <p>Invitation of Task.</p>
                              <p>Your task schedule at {this.props.log_data.task_date_time} Please click below to confirm</p>
      
                              <p>Your quiz test credential</p>
                              <p>Pin : {this.props.log_data.device_pin}</p>
                          </div>
                      </div>
                  </div>:''
              }
              </React.Fragment>
              );
        }else if(this.props.temp_type=='cab_day_docment_resend_email'){

            return (
                <React.Fragment>
                    { (this.props.emailTemplateVersion == 1)?
                    <div className="tBL_Sub">
                        <div className="row d-flex justify-content-center">
                            <div className="col-md-9 text-left">
                                <p>Dear {this.props.log_data.fullname},</p>
                                <p>Well done on successfully completing the assessment component of the Candidate Assessment and Briefing Day.</p>
                                <p>This is the final step of the Recruitment process.</p>
                                <p>Attached is your Contract of Employment with ONCALL Group Australia.  Please read carefully, complete each section and sign and return electronically, as prompted. If you have any questions, please contact your Recruitment Consultant.</p>
                                <p>(Please note the terms and conditions within this contract are identical to the draft copy sent to you to review ahead of CAB day.)</p>
                                <p>Congratulations and welcome to the ONCALL Team!</p>
                                <p>Recruitment Team</p>
                                <p>ONCALL Group Australia</p>
                                <p>(03) 9896 2468</p>
                            </div>
                        </div>
                    </div>:''
                }
                </React.Fragment>
                );

        }else if(this.props.temp_type=='group_docment_resend_email'){

            return (
                <React.Fragment>
                    { (this.props.emailTemplateVersion == 1)?
                    <div className="tBL_Sub">
                        <div className="row d-flex justify-content-center">
                            <div className="col-md-9 text-left">
                                <h4 className="mb-2"><b>Hello, {this.props.log_data.fullname}</b></h4>
                                <p>Draft contract send successfully.</p>
                            </div>
                        </div>
                    </div>:''
                }
                </React.Fragment>
                );

        }else{
            return (<React.Fragment />);
        }  
    }
}

export default CommunicationLogTemplateEmail;