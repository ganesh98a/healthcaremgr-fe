import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';

class ApplicantNotesModal extends Component {
    constructor() {
        super();
        this.state = {
            categorySel: '',
            txtContent:'',

            notesArray: [
                {stage: 'Stage 4', stageName: 'Mandatory Documentation', message: "I have sent you out the SMS reminder to Johny's mobile no, but its coming back saying its an unavaliable number. Johny need to contacted and have its mobile number updated" },
                {stage: 'Stage 3', stageName: 'Group Interview', message: "I have sent you out the SMS reminder to Johny's mobile no, but its coming back saying its an unavaliable number. Johny need to contacted and have its mobile number updated" }
            ],

            categorySelOptions : [
                { value: '1', label: 'Stage 1: Review Online Application', stage:'Stage 1', stageName:'Review Online Application' },
                { value: '2', label: 'Stage 2: Phone Interview', stage:'Stage 2', stageName:'Phone Interview' },
                { value: '3', label: 'Stage 3: Group Interview', stage:'Stage 3', stageName:'Group Interview' },
                { value: '4', label: 'Stage 4: Mandatory Documentation', stage:'Stage 4', stageName:'Mandatory Documentation' },
                { value: '5', label: 'Stage 5: Reference Checks', stage:'Stage 5', stageName:'Reference Checks' },
                { value: '6', label: 'Stage 6: CAB', stage:'Stage 6', stageName:'CAB' },
                { value: '7', label: 'Stage 7: Hired', stage:'Stage 7', stageName:'Hired' }
            ]

        }
    }



    SaveNoteHandler = (e) => {
        e.preventDefault()
        
        if (this.state.categorySel != '' && this.state.txtContent != ''){

            let dupliNotesArray = this.state.notesArray
            let dupliCatArray = {...this.state.categorySelOptions}
            let categorySel = Number(this.state.categorySel);
            let txtContent= this.state.txtContent;

            let newObj = {
                stage : dupliCatArray[categorySel - 1].stage,
                stageName: dupliCatArray[categorySel - 1].stageName,
                message:txtContent
            }

            dupliNotesArray.push(newObj);
            this.setState({notesArray: dupliNotesArray,  categorySel: '',txtContent:''});
            
        }
        
    }

    render() {
    
        return (
            <div className={'customModal ' + (this.props.show ? ' show' : '')}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        Applicant Note's
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.close}></span>
                    </h3>

                    <div className='notes_Area__ cmnDivScrollBar__'>
                        <div className="panel-group notes_panel">
                            {this.state.notesArray.map((notes, i) => {
                                return (

                                    <div className="panel panel-default panel_cstm" key={i}>
                                        <div className="panel-heading">Johny MacDonalds <em>(Recruiter)</em></div>
                                        <div className="panel-body">

                                            <h4><strong>{notes.stage}:</strong>&nbsp; {notes.stageName}</h4>
                                            <div className='msgBody'>
                                                {notes.message}
                                            </div>

                                        </div>
                                    </div>

                                )
                            })}
                        </div>
                      

                    </div>

                    <form  ref={(el) => this.myFormRef = el}>


                        <div className='row justify-content-center d-flex'>
                            <div className='col-md-12 '>


                                <div className='row bor_bot1 mr_tb_40'></div>

                                <h3 className='cmn_font_clr'><strong>New Note</strong></h3>

                                <div className='row mr_tb_20'>
                                    <div className='col-sm-12'>
                                        <div className="csform-group">
                                            <label className=''>Category</label>
                                            <div className="cmn_select_dv " style={{ width: '250px' }}>
                                                <Select name="view_by_status "
                                                    required={true} simpleValue={true}
                                                    searchable={false} Clearable={false}
                                                    placeholder="Select Type"
                                                    options={this.state.categorySelOptions}
                                                    onChange={(e) => this.setState({ categorySel: e })}
                                                    value={this.state.categorySel}
                                                />
                                            </div>
                                        </div>
                                    </div>


                                </div>


                                <div className='row mr_tb_20'>
                                    <div className='col-sm-12'>
                                        <div className="csform-group">
                                            <label className=''>Notes</label>
                                            <textarea textarea-max-size="true"
                                                className="csForm_control txt_area brRad10" 
                                                name="question" 
                                                data-rule-required="true"
                                                onChange={(e)=>this.setState({txtContent:e.target.value})}
                                                value={this.state.txtContent}
                                            >
                                            </textarea>
                                        </div>
                                    </div>
                                </div>




                            </div>
                        </div>



                        <div className="row ">
                            <div className="col-sm-12  text-right">
                                <button type="submit" className="btn cmn-btn1 create_quesBtn" onClick={(e)=>this.SaveNoteHandler(e)}>Save Note</button>
                            </div>
                        </div>

                    </form>


                </div>
            </div>

        );
    }
}

export default ApplicantNotesModal;

