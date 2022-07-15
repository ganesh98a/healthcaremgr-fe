import React, { Component } from 'react';
import jQuery from "jquery";
import Select from 'react-select-plus';
import BlockUi from 'react-block-ui';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Checkbox,
    Button,
    IconSettings,
} from '@salesforce/design-system-react';
import moment from 'moment';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import { SLDSISODatePicker, SLDSISODateOfBirthPicker } from '../../../admin/salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';

/**
 * Get person or organization as account
 * @param {obj} e 
 * @param {array} data 
 */
const getParticipantsName = (e, data) => {
    return queryOptionData(e, "item/Goals/get_participant_name_search", { query: e }, 2, 1);
}

/**
 * Class: CreateGoalsModel
 */
class CreateGoalsModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            participant_id: this.props.participant_id ? this.props.participant_id : '',
            id: this.props.id ? this.props.id : '',
            redirectPage: false,
            goal: '',
            participant: '',
            objective:'',
            active: true,
            service_type: this.props.service_type? this.props.service_type:'',
            service_type_options:[],
            disable_service_type:this.props.service_agreement_id?false:true,
            role_options:[],
            start_date:this.props.plan_start_date?this.props.plan_start_date:null,
            end_date:this.props.plan_end_date?this.props.plan_end_date:null,
        }
        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {            
            start_date: React.createRef(),
            end_date: React.createRef(),
        }
       
    }

    /**
     * Update the state value of input 
     * @param {Obj} e
     */
    handleChange = (e) => {
        var state = {};
        this.setState({ error: '' });
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    /**
     * Update the state value of Select option
     * @param {Obj} selectedOption
     * @param {str} fieldname
     */
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;

        this.setState(state);
    }

    /**
     * Update the participant name
     * param {object} item
     */
    updateparticipantName = (item) => {
        var state = {};
        state['participant'] = item;
       this. get_participants_service_type(item);
       this.setState({'service_type':''})
        this.setState(state);
    }


      /**
     * fetching the goal details if the modal is opened in the edit mode
     */
       get_participants_service_type = (participant) => {
        postData('item/Goals/get_participants_service_type', { participant }).then((result) => {
            if (result.status) {
                this.setState({service_type_options:[result.data],disable_service_type:false});
            } else if(result.length>0) {
                this.setState({'service_type_options':result,disable_service_type:false});
            }
            else{
                toastMessageShow(result.error, "e");
            }
            
        });
    }

    /**
     * fetching the goal details if the modal is opened in the edit mode
     */
    get_goal_details = (id) => {
        postData('item/Goals/get_goal_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data,()=>{
                    this. get_participants_service_type(result.data.participant);
                });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the participant details if the participant_id is passed
     */
    get_participant_details = (id) => {
        postData('item/Goals/get_participant_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data,()=>{
                    this.get_participants_service_type({value:this.props.participant_id});
                });
               
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
     /**
     * fetching the active roles/service types list
     */
    get_role_list() {
        postData('item/MemberRole/get_active_role_list').then((result) => {
            if (result.status) {
                this.setState({ role_options : result.data});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    /**
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true });
        if(this.props.id&&this.props.service_type||this.props.service_type&&this.props.service_agreement_id){
            let service_type_options=[]
            if(this.props.service_agreement_id){
                this.setState({disable_service_type:true})
            }
            service_type_options[0]={'label':this.props.service_type,'value':this.props.service_type}
            this.setState({service_type:this.props.service_type,service_type_options})
            
            
        }else{
            this.get_role_list();
        }
        if(this.props.service_agreement_id)
        {
            this.setState({service_agreement_id:this.props.service_agreement_id})
        }
        if (this.props.participant_id) {
            this.setState({ doc_id: this.props.participant_id });
        }
        if(this.props.id) {
            this.setState({ id: this.props.id });
            this.get_goal_details(this.props.id);
        }
        else if(this.props.participant_id) {
            this.get_participant_details(this.props.participant_id);
        }
        this.setState({ loading: false });
    }

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState)
    }
    // tinker with internal Datepicker state to
    // fix calendar toggling issue with multiple datepickers
    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    /**
     * validate the start date and end date on submit
     * @param {Obj} start_date
     * @param {str} end_date
     */

    validateDate() {
        if (this.state.end_date) {
            var d1 = new Date(this.state.start_date);
            var d2 = new Date(this.state.end_date);
            var same = d1.getTime() === d2.getTime();
            var notSame = d1.getTime() !== d2.getTime();
            if (d1.getTime() < d2.getTime() || d1.getTime() === d2.getTime()) {
                return true

            } else if (d1.getTime() > d2.getTime()) {
                toastMessageShow("End date should be greater than start date", "e");
                return false
            }
        } else {
            return true;
        }
    }

    /**
     * Call the create api when user save goals
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_goals").validate({ /* */ });        
        var url = 'item/Goals/create_update_goal';
        var validator = jQuery("#create_goals").validate({ ignore: [] });
        
        // Allow only validation is passed
            if (!this.state.loading && jQuery("#create_goals").valid() && this.validateDate()) {

            this.setState({ loading: true });
            var req = {
                ...this.state,
                participant_master_id: this.state.participant ? this.state.participant.value : '',
                start_date: this.state.start_date ? moment(this.state.start_date).format('YYYY-MM-DD') : '',
                end_date: this.state.end_date ? moment(this.state.end_date).format('YYYY-MM-DD') : ''
            };
            if(this.state.service_agreement_id>0)
            {
                req['is_sa']=true;
            }
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let participant_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        participant_id = resultData.participant_id || '';
                    }
                    // Trigger success pop 
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                    
                } else {
                    // Trigger error pop 
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });           
        } else {
            // Validation is failed
            validator.focusInvalid();
        }
    }
    
    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.id ? "Update Goal" : "New Goal"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="create_goals" autoComplete="off" className="slds_form">
                                <div className="row py-2">
                    {!this.props.service_agreement_id && ( <div className="col-sm-6">
                                        <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                <abbr className="slds-required" title="required">* </abbr>Participant</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        name='participant'
                                                        loadOptions={(e) => getParticipantsName(e, [])}
                                                        clearable={false}
                                                        placeholder='Search'
                                                        disabled={this.props.isFromParticipantPage||this.props.id}
                                                        cache={false}
                                                        value={this.state.participant}
                                                        onChange={(e) => this.updateparticipantName(e) }
                                                        inputRenderer={(props) => <input  {...props} name={"participant"} />}
                                                    />
                                                </div>
                                            </div>
                                        </div> )}
                                        <div className="col-lg-6 col-sm-6">
                                          <div className="slds-form-element">
                                          <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                         <abbr className="slds-required" title="required">* </abbr>Service Type</label>
                                         <div className="slds-form-element__control">
                                         <SLDSReactSelect
                                                            simpleValue={true}
                                                            className="custom_select default_validation"
                                                            options={this.state.service_type_options}
                                                            onChange={(e) => this.setState({ service_type: e })}
                                                            value={this.state.service_type}
                                                            clearable={true}
                                                            disabled={this.state.disable_service_type||this.props.id&&this.props.service_agreement_id}
                                                            searchable={true}
                                                            placeholder="Please Select"
                                                            required={true}
                                                            name="Service Type"
                                                        />
                                                     </div>
                                               </div>
                                          </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                                <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                <abbr className="slds-required" title="required">* </abbr>Goal</label>
                                                    <div className="slds-form-element__control">
                                                        <input
                                                            type="text"
                                                            name="goal"
                                                            placeholder="Goal"
                                                            required={true}
                                                            className="slds-input"
                                                            onChange={(value) => this.handleChange(value,"goal")}
                                                            value={this.state.goal || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-12">
                                                <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                <abbr className="slds-required" title="required">* </abbr>Objective</label>
                                                    <div className="slds-form-element__control">
                                                    {/* onChange={(e) => handleChange(this, e)}  */}
                                                    <textarea className="w-100" name="objective"  style={{borderColor: "#dddbda"}}  required={true}
                                                    placeholder="Objective" onChange={(value) => this.handleChange(value,"objective")} value={this.state.objective || ''}
                                                     />
                                                     </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Start Date</label>
                                                <div className="slds-form-element__control">
                                                    <div className="SLDS_date_picker_width">
                                                         <SLDSISODatePicker
                                                                ref={this.datepickers.start_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                className="customer_signed_date"
                                                                placeholder="Start Date"
                                                                onChange={this.handleChangeDatePicker('start_date')}
                                                                onOpen={this.handleDatePickerOpened('start_date')}
                                                                onClear={this.handleChangeDatePicker('start_date')}
                                                                value={this.state.start_date}
                                                                input={<Input name="start_date"/>}
                                                                inputProps={{
                                                                    name: "start_date",
                                                                    required: true
                                                                }}
                                                            />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                            <label className="slds-form-element__label" htmlFor="text-input-id-1">

                                            <abbr className="slds-required" title="required">* </abbr>End Date</label>
                                              
                                                <div className="slds-form-element__control">
                                                    <div className="SLDS_date_picker_width">
                                                        <SLDSISODatePicker
                                                                ref={this.datepickers.end_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                className="customer_signed_date"
                                                                placeholder="End Date"
                                                                onChange={this.handleChangeDatePicker('end_date')}
                                                                onOpen={this.handleDatePickerOpened('end_date')}
                                                                onClear={this.handleChangeDatePicker('end_date')}
                                                                value={this.state.end_date}
                                                                input={<Input name="end_date"/>}
                                                                inputProps={{
                                                                    name: "end_date",
                                                                    required: true
                                                                }}
                                                            />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateGoalsModel;
