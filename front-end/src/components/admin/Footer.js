import React, { Component } from 'react';
import { check_loginTime} from '../../service/common.js';
import moment from 'moment';
import { connect } from 'react-redux'

class Footer extends Component {
    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        setInterval(() => {
            check_loginTime();
        }, 1000*60)
    }
    
    
    render() {
        return (
                <footer className={'text-center '+ (this.props.footerColor)}>
                    <div className="container">
                        <div className="row">
                                <h5> <a>Terms &amp; Conditions </a></h5>
                            <h6>© {moment().format("YYYY")} All Rights Reserved <span>Healthcare Manager</span></h6>
                        </div>
                    </div>
                </footer>
                );
    }
}

const mapStateToProps = state => ({
    footerColor: state.NotificationReducer.footerColor,
})

export default connect(mapStateToProps)(Footer)
