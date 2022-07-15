import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import CKEditor from "react-ckeditor-component";
import moment from 'moment';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import { ON_CALL_FB_LINK, ON_CALL_LINKEDIN_LINK } from '../../../service/OcsConstant';

class QuickPreviewModal extends Component {

    constructor(props) {
        super();
        this.state = {  
            enable_job_post_btn:false
        } 
    }

    getSelectedValue=(ary,givenVal)=>{
        var returnVal = 'N/A';
        if(ary)
        {
            ary.map((term, idx) => {
                if(term.value == givenVal)
                {
                    returnVal = term.label;
                }               
            })
        }
        return returnVal;
    }

    job_post_btn =()=>{ 
        var enable_job_post_btn = false;

        if(this.props.parentState.from_date)
        {
            enable_job_post_btn = true;    
        }
        
        //in job status 3 or live job can not see post button
        if(enable_job_post_btn && this.props.parentState.view == 'operate' && (( this.props.parentState.job_status!=5) || (this.props.viewMode=='D'))) { 
            return <div className='text-center no_pd_r crJoBtn_Col__ pb-5'>
                <input type='button' className='btn cmn-btn1 crte_svBtn oc_bg_btn' value='Post Job' onClick={ (e) => this.props.setstateOfDraftAndPostJob(false,true) } />
            </div>
        }
    }

    render() {
        return (
            <div className={'customModal ' + (this.props.showModal? ' show' : '')}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        Quick Preview Ad{/*  - Disability Support Worker (Casual) */}
                            <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModal}></span>
                    </h3>

                    <div className='resume_frame'>
                    <div className='template1'>

                        <table className='content_mn_tble'>
                        <tr>
                                <td style={{background: '#62a744',  width: '200px', verticalAlign:'top', padding:'10px'}}><img src='/assets/images/admin/oga-logo-white.svg' className=''/></td>
                                <td>
                                <div className='right_part_wh'>
                            <div className='content_main'>

                                <img src='/assets/images/admin/oncall_logo_green.png' className='logo_img'/>
                                <br/><br/>
                                <h1><strong>{this.props.parentState.title}</strong></h1><br/><br/>
                                {(this.props.parentState.job_content)?ReactHtmlParser(this.props.parentState.job_content):'N/A'}

                                {(this.props.parentState.is_cat_publish == 1 || this.props.parentState.is_subcat_publish == 1 || this.props.parentState.is_emptype_publish == 1 || this.props.parentState.is_salary_publish == 1 || this.props.parentState.complete_address || this.props.parentState.phone || this.props.parentState.email || this.props.parentState.website)? (
                                <h3 className="sub_title_02"><strong> Job Details</strong></h3>):''}
                                
                                {(this.props.parentState.is_cat_publish == 1)? (
                                <p><strong>Job Category:</strong> {this.getSelectedValue(this.props.parentState.job_category,this.props.parentState.category)} </p>)
                                :''}
                                
                                {(this.props.parentState.is_subcat_publish == 1)? (
                                <p><strong>Job Sub-Category:</strong> {this.getSelectedValue(this.props.parentState.job_sub_category,this.props.parentState.sub_category)} </p>)
                                :''}

                                {(this.props.parentState.is_emptype_publish == 1)? (
                                <p><strong>Employement Type:</strong> {this.getSelectedValue(this.props.parentState.job_employment_type,this.props.parentState.employment_type)}</p>)
                                :''}
                                
                                {(this.props.parentState.is_salary_publish == 1)? (
                                <p><strong>Salary:</strong> {this.getSelectedValue(this.props.parentState.job_salary_range,this.props.parentState.salary_range)}</p>)
                                :''}

                                {(this.props.parentState.complete_address)? (
                                <p><strong>Location:</strong> {this.props.parentState.complete_address.formatted_address}</p>)
                                :''}

                                {(this.props.parentState.phone)? (
                                <p><strong>Phone:</strong> {this.props.parentState.phone} </p>):''}

                                {(this.props.parentState.email)? (
                                <p><strong>Email:</strong> {this.props.parentState.email} </p>)
                                :''}

                                {(this.props.parentState.website)? (
                                <p><strong>Website:</strong> {this.props.parentState.website}</p>)
                                :''}
                                <div className="clearfix"></div>
                                
                                {(this.props.parentState.all_docs_job_apply.length >0)?<h3 className="sub_title_02"><strong> Required Documents</strong></h3>:''}
                                {this.props.parentState.all_docs_job_apply.map((value, idx) => (
                                    (value.clickable)?                                  
                                        <div key={idx}>                                       
                                        <div className="Req_list_1r col-lg-4" key={idx+2}>
                                        <div className="Req_list_1r_1a">{value.label}</div>
                                        <div className="Req_list_1r_1b"> 
                                            {(value.optional)?<span className="Req_btn_out_1 R_bt_co_blue">Optional</span>:''}
                                            {(value.mandatory)?<span className="Req_btn_out_1 R_bt_co_">Mandatory</span>:''}
                                        </div>
                                        </div>
                                       
                                         </div>:''
                                ) )}
                                <div className="clearfix"></div>
                            </div>

                            {this.job_post_btn()}

                            <div className='footer_gr'>
                                    <table className='mn_tble'>
                                        <tr>
                                            <td width='50%'>
                                                {/* <div className='foot_logo'><img  src='/assets/images/admin/oncall_logo_green.png' className=''/></div>
                                                <div className='site_lnk'><a href="">healthcaremgr.com</a></div> */}
                                            </td>
                                            <td width='50%' className="text-right">
                                                <ul className='socio_link'> 

                                                    <li><a href={ON_CALL_FB_LINK} target="_blank">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"/></svg>
                                                        </a></li>
                                                    <li><a href={ON_CALL_LINKEDIN_LINK} target="_blank"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 8c0 .557-.447 1.008-1 1.008s-1-.45-1-1.008c0-.557.447-1.008 1-1.008s1 .452 1 1.008zm0 2h-2v6h2v-6zm3 0h-2v6h2v-2.861c0-1.722 2.002-1.881 2.002 0v2.861h1.998v-3.359c0-3.284-3.128-3.164-4-1.548v-1.093z"/></svg>
                                                    </a></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                            </div>

                        </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    </div>                
                </div>
            </div>
        );
    }
}

export default QuickPreviewModal;

