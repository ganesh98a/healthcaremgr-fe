import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
// import { Navbar, Nav, NavItem } from 'react-bootstrap';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = { filterVal: '' };
    }

    render() {
        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }
        ];
      return (
          <div>
            <div className={this.props.sidebarState?'overlay show':'overlay'} onClick={this.props.CloseSidebar}></div>
            <nav className="main_header ">
                <div className="row flexRow">
                    <div className="col-xs-3">
                    <ul className="nav_ulic nav_ulil">
                        <li onClick={() => this.props.SideBarShow('left', 'notifyBar')} href=''>
                        <i className="icon icon-logout6-ie lgOutIc"></i>
                        </li>
                    </ul>
                    </div>
                    <div className="col-xs-6 text-center">
                    <div className="navser">
                       <div className="s-def2 s2 s3">
                                <Select
                                    name='view_by_status'
                                    options={options}
                                    required={true}
                                    simpleValue={true}
                                    searchable={true}
                                    clearable={false}
                                    placeholder='Filter by: Unread'
                                    onChange={(e) => this.setState({ filterVal: e })}
                                    value={this.state.filterVal}
                                    className={'custom_select'}
                                />
                            </div>
                            </div>
                      
                    </div>
                    <div className="col-xs-3">
                        <ul className="nav_ulic">
                            <li><a href='#'><i className="icon icon-info1-ie"></i></a></li>
                         
                            <li onClick={() => this.props.SideBarShow('left', 'notifyBar')} >
                                <span><i className="icon icon-notification1-ie"></i></span>
                            </li>
                            <li onClick={() => this.props.SideBarShow('right', 'mailBar')}>
                                <span ><i className="icon icon-imail2-ie"></i></span>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </nav>

            <div className={this.props.mySidebar}>
                
                <div className="notify_cnt sideCnts">
                    <h4>Notification content</h4>
                </div>

                <div className="mail_cnt sideCnts">
                    <h4>Mail content</h4>
                </div>


            </div>

        
            </div>
        );
    }
}

export default Header;