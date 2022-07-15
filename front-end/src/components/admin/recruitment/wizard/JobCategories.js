import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import { connect } from 'react-redux'
import SimpleBar from "simplebar-react";
import AddJobCategory from './AddJobCategory'





class JobCategories extends Component {
    constructor(props) {
        super(props);
        this.state = {
           
        }
    }


    openModal=(key)=>{
        this.setState({
            [key]: true,
        })
    }
    closeModal=(key)=>{
        this.setState({
            [key]:false
        })
    }


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
                                <div className="col-lg-8">
                                    <React.Fragment>
                                        <div className="pAY_heading_01 by-1"><div className="tXT_01">Job Category</div></div>
                                        <div className="row py-4">

                                            <div className="col-lg-6">
                                                <label className="label_2_1_1">Added</label>
                                                <div className="Box_lJobCat">
                                                    <SimpleBar
                                                        style={{
                                                            minHeight: "110px",
                                                            maxHeight: "110px",
                                                            overflowX: "hidden",
                                                            paddingLeft: "0px",
                                                            paddingRight: "15px"
                                                        }}>
                                                        <div className="Ul_lJobCat">
                                                            <div className="lJobCat"><div><i>::</i><span>Category One</span></div></div>
                                                            <div className="lJobCat"><div><i>::</i><span>Category Two</span></div></div>
                                                        </div>
                                                    </SimpleBar>
                                                    <div className="Add_lJobCat_icon">
                                                        <i onClick={() => this.openModal('AddCategory')} className="icon icon-add2-ie cursor-pointer"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <label className="label_2_1_1">Removed</label>
                                                <div className="Box_lJobCat">
                                                    <SimpleBar
                                                        style={{
                                                            minHeight: "135px",
                                                            maxHeight: "135px",
                                                            overflowX: "hidden",
                                                            paddingLeft: "0px",
                                                            paddingRight: "15px"
                                                        }}>
                                                        <div className="Ul_lJobCat">
                                                            <div className="lJobCat"><div><i>::</i><span>Category Three</span></div><span className="icon icon-close remove_x"></span></div>
                                                        </div>
                                                    </SimpleBar>
                                                    {/* <div className="Add_lJobCat_icon">
                                                        <i className="icon icon-add2-ie"></i>
                                                    </div> */}
                                                </div>
                                            </div>

                                        </div>
                                    </React.Fragment>

                                    <React.Fragment>
                                        <div className="pAY_heading_01 by-1"><div className="tXT_01">Job Sub Category</div></div>
                                        <div className="row py-4">

                                            <div className="col-lg-6">
                                                <label className="label_2_1_1">Added</label>
                                                <div className="Box_lJobCat">
                                                    <SimpleBar
                                                        style={{
                                                            minHeight: "110px",
                                                            maxHeight: "110px",
                                                            overflowX: "hidden",
                                                            paddingLeft: "0px",
                                                            paddingRight: "15px"
                                                        }}>
                                                        <div className="Ul_lJobCat">
                                                            <div className="lJobCat"><div><i>::</i><span>Category One</span></div></div>
                                                            <div className="lJobCat"><div><i>::</i><span>Category Two</span></div></div>
                                                        </div>
                                                    </SimpleBar>
                                                    <div className="Add_lJobCat_icon">
                                                        <i className="icon icon-add2-ie cursor-pointer"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <label className="label_2_1_1">Removed</label>
                                                <div className="Box_lJobCat">
                                                    <SimpleBar
                                                        style={{
                                                            minHeight: "135px",
                                                            maxHeight: "135px",
                                                            overflowX: "hidden",
                                                            paddingLeft: "0px",
                                                            paddingRight: "15px"
                                                        }}>
                                                        <div className="Ul_lJobCat">
                                                            <div className="lJobCat"><div><i>::</i><span>Category Three</span></div><span className="icon icon-close remove_x"></span></div>
                                                        </div>
                                                    </SimpleBar>
                                                    {/* <div className="Add_lJobCat_icon">
                                                        <i className="icon icon-add2-ie"></i>
                                                    </div> */}
                                                </div>
                                            </div>

                                        </div>
                                    </React.Fragment>

                                    <React.Fragment>
                                        <div className="pAY_heading_01 by-1"><div className="tXT_01">Job Position</div></div>
                                        <div className="row py-4">

                                            <div className="col-lg-6">
                                                <label className="label_2_1_1">Added</label>
                                                <div className="Box_lJobCat">
                                                    <SimpleBar
                                                        style={{
                                                            minHeight: "110px",
                                                            maxHeight: "110px",
                                                            overflowX: "hidden",
                                                            paddingLeft: "0px",
                                                            paddingRight: "15px"
                                                        }}>
                                                        <div className="Ul_lJobCat">
                                                            <div className="lJobCat"><div><i>::</i><span>Position One</span></div></div>
                                                            <div className="lJobCat"><div><i>::</i><span>Position Two</span></div></div>
                                                        </div>
                                                    </SimpleBar>
                                                    <div className="Add_lJobCat_icon">
                                                        <i className="icon icon-add2-ie cursor-pointer"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <label className="label_2_1_1">Removed</label>
                                                <div className="Box_lJobCat">
                                                    <SimpleBar
                                                        style={{
                                                            minHeight: "135px",
                                                            maxHeight: "135px",
                                                            overflowX: "hidden",
                                                            paddingLeft: "0px",
                                                            paddingRight: "15px"
                                                        }}>
                                                        <div className="Ul_lJobCat">
                                                            <div className="lJobCat"><div><i>::</i><span>Position Three</span></div><span className="icon icon-close remove_x"></span></div>
                                                        </div>
                                                    </SimpleBar>
                                                    {/* <div className="Add_lJobCat_icon">
                                                        <i className="icon icon-add2-ie"></i>
                                                    </div> */}
                                                </div>
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
                        <Link to={`${ROUTER_PATH}admin/recruitment/wizard/email_setup`} className="btn-1 w-100">Next</Link>
                    </div>
                </div>

                {this.state.AddCategory ?
                    <AddJobCategory  show={this.state.AddCategory} close={()=>this.closeModal('AddCategory')}/> : null
                }


            </React.Fragment >
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

export default connect(mapStateToProps, mapDispatchtoProps)(JobCategories);