import React from 'react';
import {Link,Redirect } from 'react-router-dom';

class TrainingNavigation extends React.Component {
    render() {
        return (
          
                 <div className="col-lg-2 col-md-2 col-sm-2 no_pd_l asideCol1">
                                <aside>
                                    <ul className="side_menu">
                                        <li><Link className={this.props.Active == 'group_interview' ? 'active' : ''} to={"./group_interview"}>Group Interview</Link></li>
                                        <li><Link className={this.props.Active == 'cab_day' ? 'active' : ''} to={"./cab_day"} >CAB Day</Link></li>
                                        <li><Link className={this.props.Active == 'ipad' ? 'active' : ''} to={"./ipad"} >Ipad</Link></li>
                                    </ul>
                                </aside>
                 </div>
              
                );
    }
}
export default TrainingNavigation;