import React, { Component } from 'react';
class CommunicationLogTemplateSms extends Component {

    constructor(){
        super();
        this.state = {
        }
    }
  
    render() {    
      return (
        <React.Fragment>
            
            { (this.props.emailTemplateVersion == 1)?<div className="tBL_Sub">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-9 text-left">
                        <h4 className="mb-2"><b>SMS Reminder Mail </b></h4>
                        <p className="mb-2">Dear {this.props.log_data.fullname}, </p>
                        <p>Reminder for signing "CAB Day Contract"</p>
                    </div>
                </div>
            </div>:''}
        </React.Fragment>
        );
    }
}

export default CommunicationLogTemplateSms;