import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";

class SetUpIpadModal extends Component {

    constructor() {
        super();
        this.state = {
            Status: '',
            nextCabDays: [
                { date: '01-01-2019', time: '09:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: '' },
                { date: '02-01-2019', time: '10:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: 'selected' },
                { date: '03-01-2019', time: '11:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: '' },
                { date: '04-01-2019', time: '03:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: '' },
                { date: '05-01-2019', time: '09:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: '' },
                { date: '06-01-2019', time: '08:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: '' },
                { date: '07-01-2019', time: '11:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: '' },
                { date: '08-01-2019', time: '05:30 AM', dest: '-ONCALL Training Centre', runBy: 'Roc Marciano', status: '' },
            ]


        }
    }


    clickHandler = (key) => {
      
        let copArr = this.state.nextCabDays;
       
        if(copArr[key].status === 'selected'){
            copArr[key].status = '';
        }
        else{
            copArr[key].status = 'selected';
        }
        this.setState({nextCabDays:copArr});
    }


    render() {



        var ipadStatusOptions = [{ value: '1', label: 'Active' }, { value: '2', label: 'Inactive' }];

        return (
            <div className={'customModal ' + (this.props.show ? ' show' : ' ')}>
                <div className="cstomDialog widBig">


                    <h3 className="cstmModal_hdng1--">
                        IPad Set-Up
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.close}></span>
                    </h3>

                    <div className='row pd_lr_30 d-flex flexWrap' >

                        <div className='col-md-12 col-sm-14 col-xs-12 d-flex flexWrap align-items-center' >
                            <h3 className='ipad_hdng135__'>IPad-018</h3>
                            <div className="filter_fields__ cmn_select_dv" style={{ width: '200px' }}>
                                <Select name="view_by_status"
                                    required={true} simpleValue={true}
                                    searchable={false} Clearable={false}
                                    placeholder="Set Status"
                                    options={ipadStatusOptions}
                                    onChange={(e) => this.setState({ Status: e })}
                                    value={this.state.Status}
                                />
                            </div>
                        </div>

                    </div>

                    <div className='row bor_bot1 mr_tb_20 '></div>

                    <div className='row pd_lr_30 mr_tb_20'>

                        <div className='col-sm-12'>
                            <h3><strong>Select Next Available CAB Days</strong></h3>
                        </div >

                        <div className='col-sm-12 mr_tb_20'>

                            <div className='notes_Area__ cmnDivScrollBar__'>
                                <div className="panel-group notes_panel ipadPanelGroup d-flex flexWrap pd_lr_50" >

                                    {
                                        this.state.nextCabDays.map((cabs, i) => {
                                            return (
                                                <div className='col-md-4 col-sm-6' key={i}>
                                                    <div className={"panel panel-default panel_cstm ipadPanel " + (cabs.status === 'selected' ? 'active':'')} 
                                                    onClick={()=> this.clickHandler(i)}>
                                                        <div className="panel-heading"><strong>Date:</strong> {cabs.date}</div>
                                                        <div className="panel-body">

                                                            <div className='ipdBody_cnt'>
                                                                <div><strong>Time:</strong>{cabs.time}</div>
                                                                <div>{cabs.dest}</div>
                                                                <div className='mr_t_15'><strong>Run By:</strong>{cabs.runBy}</div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }

                                    



                                </div>


                            </div>

                        </div>

                        <div className='col-sm-12 bor_bot1 mr_tb_20 '></div>

                        <div className='col-sm-12 '>

                            <h3><strong>Select Approve Cab Day Members</strong></h3>

                            <div className='dabDayPanel_header pd_lr_50 mr_tb_20'>
                                <div>Applicant</div>
                                <div>HCM-ID</div>
                                <div>Status</div>
                            </div>

                            <div className='cabDayPanel_tab cmnDivScrollBar__ pd_lr_50'>

                                <div className='cabDAy_Panel'>
                                    <div>Jimmy Smith</div>
                                    <div>0000 0000 0000</div>
                                    <div>Confirmed for CAB day</div>
                                </div>

                                <div className='cabDAy_Panel active'>
                                    <div>Jimmy Smith</div>
                                    <div>0000 0000 0000</div>
                                    <div>Confirmed for CAB day</div>
                                </div>

                                <div className='cabDAy_Panel'>
                                    <div>Jimmy Smith</div>
                                    <div>0000 0000 0000</div>
                                    <div>Confirmed for CAB day</div>
                                </div>

                                <div className='cabDAy_Panel'>
                                    <div>Jimmy Smith</div>
                                    <div>0000 0000 0000</div>
                                    <div>Confirmed for CAB day</div>
                                </div>

                                <div className='cabDAy_Panel'>
                                    <div>Jimmy Smith</div>
                                    <div>0000 0000 0000</div>
                                    <div>Confirmed for CAB day</div>
                                </div>

                                <div className='cabDAy_Panel'>
                                    <div>Jimmy Smith</div>
                                    <div>0000 0000 0000</div>
                                    <div>Confirmed for CAB day</div>
                                </div>

                                <div className='cabDAy_Panel'>
                                    <div>Jimmy Smith</div>
                                    <div>0000 0000 0000</div>
                                    <div>Confirmed for CAB day</div>
                                </div>

                            </div>


                        </div>

                        <div className='col-sm-12 bor_bot1 mr_tb_20 '></div>

                        <div className='col-sm-12 '>

                            <div className='row'>

                                <div className='col-sm-6'>
                                    <h3><strong>IPad Information</strong></h3>

                                    <div className='pd_lr_50 mr_tb_20'>
                                        <label>Member API Pin</label>

                                        <div className='capsule_radio'>
                                            <label>
                                                <input type='radio' name='actStatus' value='inactive' />
                                                <div className='checkieName'>Inactive</div>
                                            </label>
                                            <label>
                                                <input type='radio' name='actStatus' value='active' defaultChecked />
                                                <div className='checkieName'>Active</div>
                                            </label>
                                        </div>

                                    </div>
                                </div>

                                <div className='col-sm-6'>
                                    <h3><strong>Ipad Files</strong></h3>


                                    <div className='row pd_lr_50'>

                                        <div className='col-sm-12'>

                                            <div className='row attch_row d-flex flexWrap justify-content-center'>
                                                <div className='col-sm-4 col-xs-6'>
                                                    <div className='attach_item'>
                                                        <h5><strong>Contract</strong></h5>
                                                        <i className='icon icon-notes1-ie'></i>
                                                        <p>john_smith_contract_01-01-19.pdf</p>
                                                    </div>
                                                </div>
                                                <div className='col-sm-4 col-xs-6'>
                                                    <div className='attach_item'>
                                                        <h5><strong>Presentation</strong></h5>
                                                        <i className='icon icon-notes1-ie'></i>
                                                        <p>john_smith_presentation_01-01-19.pdf</p>
                                                    </div>
                                                </div>


                                            </div>

                                        </div>

                                        <div className='col-sm-12'>
                                            <label className='cmn-btn1 btn btn-block atchd_btn1__'>
                                                Select a New document to upload
                                                <input type="file"  style={{'visibility':'hidden', 'width':'0', 'height':'0'}} />
                                                </label>
                                            <button className='cmn-btn1 btn btn-block atchd_btn1__'>Delete Selected Documents</button>
                                            <button className='cmn-btn1 btn btn-block atchd_btn1__'>Download Selected Documents</button>
                                        </div>

                                    </div>



                                </div>

                            </div>



                        </div>


                    </div>



                    <div className="row trnMod_Foot__ disFoot1__">
                        <div className="col-sm-12 no-pad text-right">
                            <button type="submit" className="btn cmn-btn1 create_quesBtn">Save</button>
                        </div>
                    </div>



                </div>
            </div>

        );
    }
}

export default SetUpIpadModal;

