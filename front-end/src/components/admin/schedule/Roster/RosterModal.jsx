import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import 'react-block-ui/style.css';
import Input from '@salesforce/design-system-react/lib/components/input';
import Checkbox from '@salesforce/design-system-react/lib/components/checkbox';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import Row from '../../oncallui-react-framework/grid/Row';
import Col50 from '../../oncallui-react-framework/grid/Col50';
import SelectList from "../../oncallui-react-framework/input/SelectList";
import SectionContainer from '../../oncallui-react-framework/grid/SectionContainer';
import jQuery from "jquery";
import  SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import { SLDSISODatePicker, SLDSISODateOfBirthPicker } from '../../salesforce/lightning/SLDSISODatePicker';
import moment from 'moment';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { Modal,Button,IconSettings} from '@salesforce/design-system-react';

/**
 * RequestData get the data of member document
 * @param {int} documentId
 */
const requestRosterData = (applicant_id, reference_id) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { applicant_id: applicant_id, reference_id: reference_id };
        postData('recruitment/RecruitmentReferenceData/get_reference_data_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                resData = result.data[0] || [];
                const res = {
                    data: resData,
                };
                resolve(res);
            } else {
                const res = {
                    data: []
                };
                resolve(res);
            }           
        });
    });
};

/**
 * to fetch the account contacts as user types
 */
 const getOptionsAccountPersonName = (e, data) => {
    return queryOptionData(e, "schedule/ScheduleDashboard/account_participant_name_search", { query: e }, 2, 1);
}

/**
 * Get staff person as owner
 * @param {obj} e 
 * @param {array} data 
 */
 const getOwnerOption = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_owner_staff_search", { query: e }, 2, 1);
}

const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {   
        var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact";
        var className = "slds-icon-standard-contact";
        if(this.props.option.value=='new contact'){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#add";
            className = "slds-icon-standard-add";
        }
        else if(this.props.option.account_type==2 && this.props.option.is_site==0){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#account";
            className = "slds-icon-standard-account";
        }
        else if(this.props.option.account_type==2 && this.props.option.is_site==1){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#household";
            className = "slds-icon-standard-household";
        }
        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>

                <div role="presentation" class="slds-listbox__item">
                    <div id="option3" class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                        <span class="slds-media__figure slds-listbox__option-icon">
                            <span class={"slds-icon_container "+className}>
                                <svg class="slds-icon slds-icon_small" aria-hidden="true" style={{ fill : this.props.option.value !='new contact' ? '':'#000' } }>
                                    <use href={icon_ref}></use>
                                </svg>
                            </span>
                        </span>
                        <span class="slds-media__body">
                            <span class="slds-listbox__option-text slds-listbox__option-text_entity">{this.props.option.label}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
});

class RosterModal extends Component {
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            account_person: '',
            contact: '',
            contact_options: [],
            roster_type_options: [],
            roster_type: '',
            roster_funding_type_options: [],
            roster_no: '',
            roster_end_date_options: [],
            end_date_option: '',
            start_date: '',
            end_date: '',
        }
        this.formRef = React.createRef();

         // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {            
            start_date: React.createRef(),
            end_date: React.createRef()
        };
    }

    componentWillMount() {
        if (this.props.roster_id) {
            this.requestRosterData();
        }        
    }

    
    /**
     * mounting all the components
     */
     componentDidMount() {
        this.get_roster_reference_data(); 
    }

     /**
     * fetching the reference data (roster) type & funding type
     */
      get_roster_reference_data = () => {
		postData("schedule/Roster/get_roster_reference_data").then((res) => {
			if (res.status) {
				this.setState({ 
					roster_type_options: (res.roster_type) ? res.roster_type : [],
                    roster_funding_type_options: (res.roster_funding_type) ? res.roster_funding_type : [],
                    roster_end_date_options: (res.roster_end_date_options) ? res.roster_end_date_options : [],
                    owner: (res.owner_selected) ? res.owner_selected : '',
				})
                if(this.props.reference_id){
                    let account_person={
                        account_type:this.props.roster_data['account_type'],
                        is_site: "0",
                        label:this.props.roster_data['account'],
                        value:this.props.roster_data['account_id']
                    }
                  
                    let owner={label:this.props.roster_data['owner_label'],value:this.props.roster_data['owner_id']}
                    let contact={label:this.props.roster_data['contact_label'],value:this.props.roster_data['contact_id']}
                    let roster_funding_type={label:this.props.roster_data['funding_type_label'],value:this.props.roster_data['funding_type']}
                    let isbackslash=this.props.roster_data['end_date'].indexOf('/')
             if(isbackslash>0)
             {
                const end_date_splited= this.props.roster_data['end_date'].split('/');
                const start_date_splitted=this.props.roster_data['start_date'].split('/');
                this.props.roster_data['end_date']=  end_date_splited[2]+'-'+ end_date_splited[1]+'-'+end_date_splited[0]
                this.props.roster_data['start_date']=  start_date_splitted[2]+'-'+ start_date_splitted[1]+'-'+start_date_splitted[0]
             }
                     this.setState({
                        roster_type:this.props.roster_data['roster_type'],
                        end_date_option:this.props.roster_data['end_date_option'],
                        end_date:  this.props.roster_data['end_date'],
                        start_date:this.props.roster_data['start_date'],
                        contact,
                        owner,
                        roster_funding_type,
                        account_id:this.props.roster_data['account_id'],
                        account_person,
                        roster_no:this.props.roster_data['roster_no']

                    },()=>{
                        this.getContact(account_person);
                    }) 
                }
              
			}
		});
    }
    
  
    /**
     * Get contacts associated with account or participant
     * @param {obj} e 
     * @param {boolean} reset 
     */
    getContact = (e,reset) => {
        this.setState({ contact_options: []});
        if(e) {
            postData("schedule/Roster/get_contact_for_account_roster", { account: e }).then((res) => {
                if (res.status) {
                    if(!this.props.reference_id)
                    {
                        this.setState({ 
                            contact_options: (res.data) ? res.data : [],
                            contact: (res.primary_contact) ? res.primary_contact : ''
                        })
                    }
                    else{
                        this.setState({ 
                            contact_options: (res.data) ? res.data : [],
                           
                        })
                    }
                   
                }
            });
        }
    }

    /**
     * handling the change event of the data picker fields
     */
     handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        newState[key+'_var'] = dateYmdHis
        this.setState(newState)
        if (Number(this.state.end_date_option) === 1 && key === 'start_date') {
            var dateState = dateYmdHis;
            var end_date = moment(dateState).add(6,'weeks');
            var end_day = end_date.day();
            if (end_day != 0) {
                var add_dat = 7 - end_day;
                end_date = moment(end_date).add(add_dat,'days').local().format('YYYY-MM-DD HH:mm');
            } else {
                end_date = moment(end_date).local().format('YYYY-MM-DD HH:mm');
            }
            this.setState({ end_date: end_date });
        }
    }

    /**
     * tinker with internal Datepicker state to
     * fix calendar toggling issue with multiple datepickers
     */
     handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}

            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    
    /**
     * Update stage for selected application
     * @patam {event} e
     */
     onSubmit = (e) => {
        e.preventDefault();
        
        jQuery(this.formRef.current).validate();

        if (this.state.roster_type === '') {
            toastMessageShow("Please select roster type", "e");
            return false;
        }

        if (this.state.account_person === '') {
            toastMessageShow("Please select participant/site", "e");
            return false;
        }

        if (this.state.contact === '') {
            toastMessageShow("Please select contact", "e");
            return false;
        }

        if (this.state.roster_funding_type === '') {
            toastMessageShow("Please select roster funding type", "e");
            return false;
        }

        if (this.state.end_date_option === '') {
            toastMessageShow("Please select end date option", "e");
            return false;
        }

        if (moment(this.state.end_date) < moment(this.state.start_date)) {
            toastMessageShow("End date must be greater than start date", "e");
            return false;
        }
        var req = {
           
            owner_id: this.state.owner!='object' ? this.state.owner.value : '',
            account_type: this.state.account_person ? this.state.account_person.account_type : '',
            account_id: this.state.account_person ? this.state.account_person.value : '',
            contact_id: typeof this.state.contact!='object'?this.state.contact:this.state.contact['value'],
            start_date: this.state.start_date.split(' ').length>1 ?moment(this.state.start_date).format('YYYY-MM-DD') :this.state.start_date,
            end_date: this.state.end_date.split(' ').length>1 ? moment(this.state.end_date).format('YYYY-MM-DD') :this.state.end_date ,
            funding_type:typeof this.state.roster_funding_type!='object'?this.state.roster_funding_type:this.state.roster_funding_type['value'],
            //funding_type: !this.props.reference_id?this.state.roster_funding_type:this.state.roster_funding_type['value'],
            roster_type: this.state.roster_type,
            end_date_option: this.state.end_date_option,
            reference_id:this.props.reference_id
        }
        if(this.props.reference_id)
        {
            req['roster_no']=this.state.roster_no;
        }

        if (!this.state.loading && jQuery(this.formRef.current).valid()) {
            this.setState({ loading: true });
            postData('schedule/roster/create_update_roster', req).then((result) => {
                this.setState({ loading: false });
                if (result.status) {
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                } else {
                    toastMessageShow(result.error, "e");
                }
            });
            return true;
        }
    }

    /**
     * rendering components
     */
    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    size="small"
                    heading={this.props.headingTxt + ' Roster'}
                    isOpen={this.props.showModal}
                    footer={[
                        <Button disabled={this.state.loading} id="roster_cancel" label="Cancel" onClick={() => this.props.closeModal()} />,
                        <Button disabled={this.state.loading} id="roster_save" label="Save" variant="brand" onClick={this.onSubmit} />
                    ]}
                    onRequestClose={() => this.props.closeModal(false)} 
                    dismissOnClickOutside={false}
                >
                    <SectionContainer>
                        <div className="mb-3">
                            <form id="roster" ref={this.formRef} className="mb-3">
                            {this.props.reference_id&&(
                                <Row>
                                    <Col50>
                                        <label className="slds-form-element__label" >
                                            <abbr className="slds-required" title="required">* </abbr>Roster ID
                                        </label>
                                        <div className="slds-form-element pl-1">
                                            {this.state.roster_no}
                                        </div>
                                    </Col50>
                                </Row>)}
                                <Row>
                                    <Col50>
                                        <label className="slds-form-element__label" >
                                            <abbr className="slds-required" title="required">* </abbr>Owner
                                        </label>
                                        <div className="slds-form-element">
                                            <SLDSReactSelect.Async 
                                                clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.owner}
                                                cache={false}
                                                loadOptions={(e) => getOwnerOption(e, [])}
                                                onChange={(e) => {
                                                
                                                    this.setState({ owner: e, changedValue: true });
                                                }}
                                                placeholder="Please Search"
                                                required={true} 
                                                optionComponent={GravatarOption}
                                            />
                                        </div>
                                    </Col50>
                                    <Col50>
                                        <SelectList
                                            label="Roster Type"
                                            name="roster_type"
                                            required={true}
                                            options={this.state.roster_type_options}
                                            value={this.state.roster_type}
                                            onChange={(value) => this.setState({ roster_type: value })}
                                        /> 
                                    </Col50>
                                </Row>
                                <Row>
                                    <Col50>
                                        <label className="slds-form-element__label" >
                                            <abbr className="slds-required" title="required">* </abbr>Account (Participant/Site) Name
                                        </label>
                                        <div className="slds-form-element">
                                            <SLDSReactSelect.Async clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.account_person}
                                                cache={false}
                                                loadOptions={(e) => getOptionsAccountPersonName(e, [])}
                                                onChange={(e) => {
                                                    var new_contact = true;
                                                    if (e && Number(e.account_type) === 1) {
                                                        new_contact = false;
                                                    }
                                                    this.setState({ 
                                                        account_person: e,
                                                        allow_newcontact: new_contact,
                                                        changedValue: true 
                                                    }, () => {
                                                        this.getContact(e, true);
                                                    });
                                                   console.log(e,'e')
                                                }} 
                                                disabled={this.props.reference_id}
                                                placeholder="Please Search"
                                                required={true} 
                                                optionComponent={GravatarOption}
                                            />
                                        </div>
                                    </Col50>
                                    <Col50>
                                        <SelectList
                                            label="Contact"
                                            name="contact"
                                            required={true}
                                            options={this.state.contact_options}
                                            value={this.state.contact}
                                            onChange={(value) => this.setState({ contact: value })}
                                            disabled={this.state.account_person ? false : true}
                                        /> 
                                    </Col50>
                                </Row>
                                <Row>
                                    <Col50>
                                        <SelectList
                                            label="Roster Funding Type"
                                            name="roster_funding_type"
                                            required={true}
                                            options={this.state.roster_funding_type_options}
                                            value={this.state.roster_funding_type}
                                            onChange={(value) => this.setState({ roster_funding_type: value })}
                                        /> 
                                    </Col50>
                                    <Col50>
                                        <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        <abbr className="slds-required" title="required">* </abbr>Start Date</label>
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
                                                relativeYearFrom={0}
                                                relativeYearTo={3}
                                                dateDisabled={(data) =>
                                                    moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                }
                                                onCalendarFocus={(event, data) => {
                                                    if (this.props.action) {
                                                        const dataAsArray = Object.keys(data).map((key) => data[key]);
                                                        this.props.action('onCalendarFocus')(event, data, ...dataAsArray);
                                                    } else if (console) {
                                                        // to do...
                                                    }
                                                }}
                                                tabIndex={-1}
                                            />
                                        </div>
                                    </Col50>
                                </Row>
                                <Row>
                                    <Col50>
                                        <SelectList
                                            label="End Date Option"
                                            name="end_date_option"
                                            required={true}
                                            options={this.state.roster_end_date_options}
                                            value={this.state.end_date_option}
                                            onChange={(value) => {
                                                this.setState({ end_date_option: value })
                                                if (Number(value) === 1) {
                                                    var dateState = this.state.start_date;
                                                    var end_date = moment(dateState).add(6,'weeks');
                                                    var end_day = end_date.day();
                                                    if (end_day != 0) {
                                                        var add_dat = 7 - end_day;
                                                        end_date = moment(end_date).add(add_dat,'days').local().format('YYYY-MM-DD HH:mm');
                                                    } else {
                                                        end_date = moment(end_date).local().format('YYYY-MM-DD HH:mm');
                                                    }
                                                    this.setState({ end_date: end_date });
                                                } 
                                            }}
                                        /> 
                                    </Col50>
                                    <Col50>
                                        <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        <abbr className="slds-required" title="required">* </abbr>End Date</label>
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
                                                relativeYearFrom={0}
                                                relativeYearTo={3}
                                                dateDisabled={(data) =>
                                                    moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() && moment(data.date).isBefore(moment(this.state.start_date), 'day') === false ? false : moment(data.date).isBefore() || moment(data.date).isBefore(moment(this.state.start_date), 'day') === true   ? true : false
                                                }
                                                onCalendarFocus={(event, data) => {
                                                    if (this.props.action) {
                                                        const dataAsArray = Object.keys(data).map((key) => data[key]);
                                                        this.props.action('onCalendarFocus')(event, data, ...dataAsArray);
                                                    } else if (console) {
                                                        // to do...
                                                    }
                                                }}
                                                tabIndex={-1}
                                                disabled={Number(this.state.end_date_option) === 2 ? false : true}
                                            />
                                        </div>
                                    </Col50>
                                </Row>
                            </form>
                        </div>
                    </SectionContainer>                    
                </Modal>
            </IconSettings>
        );
    }
}

export default RosterModal;
