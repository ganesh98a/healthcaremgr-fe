import React, { Component } from 'react';
class CommunicationLogTemplatePhone extends Component {

    constructor(){
        super();
        this.state = {
        }
    }
  
    render() {       
      return (
        <React.Fragment>
           
            <div className="tBL_Sub">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-9 text-left">
                        <h4 className="mb-2"><b>Dear User </b></h4>
                        <p>We would like to offer a group interview for the position of Developer.</p>

                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                        standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                    </div>
                </div>
            </div>
        
        </React.Fragment>
        );
    }
}

export default CommunicationLogTemplatePhone;