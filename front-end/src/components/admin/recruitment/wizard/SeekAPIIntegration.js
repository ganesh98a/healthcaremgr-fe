import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import { connect } from 'react-redux'




class SeekAPIIntegration extends Component {
    render() {
        return (
            <React.Fragment>              

                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>


                <div className="row d-flex justify-content-center mt-5">
                    <div className="col-lg-12 px-0">
                        <div className="Bg_F_moule">
                            <div className="row d-flex justify-content-center">
                                <div className="col-lg-4">
                                    <React.Fragment>
                                        <div className="Time_line_lables">
                                            <div className="label_2_1_1 f-bold">Apply Seek Integration?</div>
                                            <div className="label_2_1_2">
                                                <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                    <input type="radio" name="quote_required" value="1" />
                                                    <span className="checkround"></span>
                                                    <span className="txtcheck">Yes</span>
                                                </label>

                                            </div>
                                            <div className="label_2_1_3">
                                                <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                    <input type="radio" name="quote_required" value="0" />
                                                    <span className="checkround"></span>
                                                    <span className="txtcheck">No</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-xs-12 mt-3">
                                                <label className="label_2_1_1">Client ID</label>
                                                <input type="text"/>
                                            </div>
                                            <div className="col-xs-12 mt-3">
                                                <label className="label_2_1_1">Client Verification Code(Sent from Seek)</label>
                                                <input type="text"/>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row d-flex justify-content-end none-after none-before">
                    <div className="col-lg-2 mt-3">
                        <Link to={`${ROUTER_PATH}admin/recruitment/wizard/email_setup`} className="btn-1 outline-btn-1 w-100">Back</Link>
                    </div>
                    <div className="col-lg-2 mt-3">
                        <Link to={`#`} className="btn-1 w-100">Complete Wizard</Link>
                    </div>
                </div>

            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(SeekAPIIntegration);