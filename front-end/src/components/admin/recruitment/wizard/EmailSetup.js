import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import { connect } from 'react-redux';
import { PanelGroup, Panel } from 'react-bootstrap';





class EmailSetup extends Component {
    render() {
        return (
            <React.Fragment>
               
                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>


                <div className="Finance__panel_1 mt-5">
                    <div className="F_module_Panel E_ven_and_O_dd-color E_ven_color_ O_dd_color_ Border_0_F" >
                        {/* <PanelGroup accordion id="accordion-example"> */}
                            <Panel eventKey="1">
                                <Panel.Heading>
                                    <Panel.Title toggle>
                                        <div>
                                            <p>Group Interview</p>
                                            <span className="icon icon-arrow-right"></span>
                                            <span className="icon icon-arrow-down"></span>
                                        </div>
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Body collapsible>
                                    <div className="row">
                                        <div className="col-lg-8 col-lg-offset-2 pt-3">
                                            <div className="row">
                                                <div className="col-xs-12 mb-3 ">
                                                    <label className="label_2_1_1">Subject Line</label>
                                                    <input type="text" className="border-black" />
                                                </div>
                                                <div className="col-xs-12 mb-3">
                                                    <label className="label_2_1_1">Field Label</label>
                                                    <div className="">
                                                        <textarea rows={6} className="border-black w-100"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Panel.Body>
                            </Panel>
                            <Panel eventKey="2">
                                <Panel.Heading>
                                    <Panel.Title toggle>
                                        <div>
                                            <p>Group Interview</p>
                                            <span className="icon icon-arrow-right"></span>
                                            <span className="icon icon-arrow-down"></span>
                                        </div>
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Body collapsible>
                                    <div className="row">
                                        <div className="col-lg-8 col-lg-offset-2 pt-3">
                                            <div className="row">
                                                <div className="col-xs-12 mb-3 ">
                                                    <label className="label_2_1_1">CAB Day</label>
                                                    <input type="text" className="border-black" />
                                                </div>
                                                <div className="col-xs-12 mb-3">
                                                    <label className="label_2_1_1">Field Label</label>
                                                    <div className="">
                                                        <textarea rows={6} className="border-black w-100"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Panel.Body>
                            </Panel>
                        {/* </PanelGroup> */}


                    </div>
                </div>

                <div className="row d-flex justify-content-end none-after none-before">
                    <div className="col-lg-2 mt-3">
                        <Link to={`${ROUTER_PATH}admin/recruitment/wizard/job_categories`} className="btn-1 outline-btn-1 w-100">Back</Link>
                    </div>
                    <div className="col-lg-2 mt-3">
                        <Link to={`${ROUTER_PATH}admin/recruitment/wizard/seek_api_integration`} className="btn-1 w-100">Next</Link>
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

export default connect(mapStateToProps, mapDispatchtoProps)(EmailSetup);