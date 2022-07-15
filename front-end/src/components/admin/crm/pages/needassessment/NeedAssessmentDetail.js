import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData} from 'service/common.js';
import { DynamicComponentMappingNeedAssessment } from './DynamicComponentMappingNeedAssessment';

class NeedAssessmentDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            assessment_assistance: [],
            callAjax:false,
            selectedAssistance:''
        }
    }

    componentDidMount() {
        this.getAllOption();
        //console.log('componentDidMount',this.props.need_assessment_id)        
    }

    getAllOption = ()=>{        
        postData("sales/NeedAssessment/get_option_needassessment", {}).then((res) => {
            if (res.status) {
                this.setState(res.data)
            }
        });    
    }

    handleShareholderNameChange(index, e) {
        if (e) {
            e.preventDefault();
        }
        let selectedAssistance = '';
        var editableState = this.state.assessment_assistance;
        editableState.map((value, idx) => {
            var state = {};
            var List = this.state['assessment_assistance'];
            if(index == idx){
             List[idx]['active'] = 1;  
             selectedAssistance = value.key_name; 
            }else{
             List[idx]['active'] = 0;
            }
            
            state['assessment_assistance'] = List;
            this.setState(state);
        })
        if(selectedAssistance)
        this.setState({selectedAssistance:selectedAssistance})
    }

    callDynamicComponent = ()=>{
        var MyComponent = DynamicComponentMappingNeedAssessment[this.state.selectedAssistance] ? DynamicComponentMappingNeedAssessment[this.state.selectedAssistance] : 'React.Fragment';
        return <MyComponent need_assessment_id={this.props.need_assessment_id} />
    }
    //https://www.lightningdesignsystem.com/components/vertical-navigation/#site-main-content  #Items with Notifications
    render() {
        return (
            <React.Fragment>
                <div className="slds-grid">
                    <div class="slds-col">
                        <div className="slds-grid slds-wrap slds-gutters_x-small">
                            <div class="slds-col slds-size_1-of-1 slds-medium-size_8-of-12 slds-large-size_9-of-12 slds-p-right_small">
                                <div className="white_bg_color slds-box ">
                                {
                                    this.callDynamicComponent()
                                }
                                </div >
                            </div>

                            <div class="slds-col slds-size_1-of-1 slds-medium-size_4-of-12 slds-large-size_3-of-12">
                                <div className="white_bg_color slds-box">
                                    <nav className="slds-nav-vertical" aria-label="Sub page">
                                        <div className="slds-nav-vertical__section">
                                            <h2 id="entity-header" className="slds-nav-vertical__title">Assistance</h2>
                                            <ul aria-describedby="entity-header">
                                                {
                                                    this.state.assessment_assistance.map((value, idx) => (
                                                        <li className={value.active && value.active =='1'?'slds-nav-vertical__item slds-is-active':'slds-nav-vertical__item'} key={idx}>
                                                            <a href="javascript:void(0);" className="slds-nav-vertical__action" onClick={(e) => this.handleShareholderNameChange(idx,e)}>{value.label}</a></li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment >
        );
    }
}

export default NeedAssessmentDetail;