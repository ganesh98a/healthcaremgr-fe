import React from 'react';
import {Link,Redirect } from 'react-router-dom';

class Navigation extends React.Component {
	constructor(props) {
            super(props);
               this.state = {};
    }

    render() {
        return (
                <div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 Menu4_Div-">
                        <ul>
                            <li className={(this.props.Active) && this.props.Active == 'action' ? 'active' : ''}><Link to="/admin/recruitment/action">Action</Link></li>
                            <li className={(this.props.Active) && this.props.Active == 'JobOpening' ? 'active' : ''}><Link to="/admin/recruitment/job_opening">Jobs</Link></li>
                            <li className={(this.props.Active) && this.props.Active == 'applicants' ? 'active' : ''}><Link to="/admin/recruitment/applicantions">Applications</Link></li>
                            <li className={(this.props.Active) && this.props.Active == 'training' ? 'active' : ''}><Link to="/admin/recruitment/training/group_interview">Training</Link></li>
                        </ul>
                    </div>
                </div>
                </div>
                );
    }
}
export default Navigation;