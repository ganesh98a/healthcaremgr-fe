// @ts-nocheck
import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, css, handleChange, handleShareholderNameChangeShift, queryOptionData, AjaxConfirm, handleDecimalChange, remove_access_lock, calculate_shift_duration, queryOptionDataAddNewEntity, comboboxFilterAndLimit, Confirm } from 'service/common.js';
import '../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';

import {
    Button,
    ButtonGroup,
    Dropdown,
    ExpandableSection,
    Icon,
    IconSettings,
    Input,
    Modal,
    Popover,
} from '@salesforce/design-system-react';
import classNames from 'classnames';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import createClass from 'create-react-class';
import moment from 'moment';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import { defaultSpaceInTable } from 'service/custom_value_data.js';

import CreateContactModal from '../../admin/crm/pages/contact/CreateContactModal';
import Col from '../oncallui-react-framework/grid/Col';
import Row from '../oncallui-react-framework/grid/Row';
import ComboList from '../oncallui-react-framework/input/ComboList';
import FormElement from '../oncallui-react-framework/input/FormElement';
import CustomTimePicker from '../oncallui-react-framework/input/JqueryTimePicker';
import Label from '../oncallui-react-framework/input/Label';
import { Lookup } from '../oncallui-react-framework/input/Lookup';
import SelectList from '../oncallui-react-framework/input/SelectList';
import Text from '../oncallui-react-framework/input/Text';
import TextArea from '../oncallui-react-framework/input/TextArea';
import Col50 from '../oncallui-react-framework/grid/Col50';
import ReactDatePicker  from '../oncallui-react-framework/salesforce/ReactDatePicker';
import { SLDSISODatePicker } from '../oncallui-react-framework/salesforce/SLDSISODatePicker';
import { applyValidation, validate, validateForm } from '../oncallui-react-framework/services/ARF';
import SLDSReactTable from '../salesforce/lightning/SLDSReactTable';
import RosterRepeatModal from './Roster/RosterRepeatModal.jsx';

//import Modal from '@salesforce/design-system-react/lib/components/modal';
//import { SLDSISODatePicker } from '../oncallui-react-framework/salesforce/SLDSISODatePicker';
const styles = css({
    root: {
        fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif`,
        zIndex: 12,
    },
    backdrop: {
        zIndex: 11,
    },
})

/**
 * to fetch the admin users as user types
 */
const getOptionsStaff = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_owner_staff_search", { query: e }, 2, 1);
}

/**
 * to fetch the account contacts as user types
 */
const getOptionsAccountPersonName = (e, data) => {
    return queryOptionData(e, "schedule/ScheduleDashboard/account_participant_name_search", { query: e }, 2, 1);
}

/**
 * to fetch the contacts as user types
 */
const getContactPersonName = (e, new_contact, data) => {
    return queryOptionDataAddNewEntity(e, "sales/Contact/get_contact_for_account", { account: data, query: e, limit: 10, new_contact: new_contact }, 2, 1);
}

/**
 * to fetch the roles as user types
 */
const getRoles = (e, data) => {
    // get_role_name_search get_rolename_for_account id: data.value,account_type: data.account_type,
    return queryOptionData(e, "item/document/get_rolename_for_account", { id: data.value, account_type: data.account_type, query: e }, 2, 1);
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
        if (this.props.option.value == 'new contact') {
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#add";
            className = "slds-icon-standard-add";
        }
        else if (this.props.option.account_type == 2 && this.props.option.is_site == 0) {
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#account";
            className = "slds-icon-standard-account";
        }
        else if (this.props.option.account_type == 2 && this.props.option.is_site == 1) {
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
                            <span class={"slds-icon_container " + className}>
                                <svg class="slds-icon slds-icon_small" aria-hidden="true" style={{ fill: this.props.option.value != 'new contact' ? '' : '#000' }}>
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

class CreateShiftModal extends Component {

    /**
     * setting the initial prop values
     * @param {*} props
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        const TIME_FORMAT = 'hh:mm A';
        let today = moment(new Date()).format('DD/MM/YYYY');
        let currentDate = moment(new Date()).format('YYYY-MM-DD')
        this.state = {
            loading: false,
            account_disabled: false,
            repeat_open: false,
            repeat_option: '',
            repeat_days: [],
            repeat_days_selected: [],
            id: '',
            clone_id: '',

            shift_no: '',
            contact_person: [],
            account_person: '',
            owner_person: '',
            role_details: '',
            time_format: TIME_FORMAT,

            scheduled_start_date_updated: false,
            scheduled_start_date: new Date(),
            scheduled_start_date_var: '',
            scheduled_end_date: new Date(),
            scheduled_start_time: '',
            scheduled_end_time: '',
            scheduled_travel: '',
            scheduled_reimbursement: '',
            scheduled_travel_distance: '',
            scheduled_travel_duration_hr: '',
            scheduled_travel_duration_min: '',
            actual_travel_duration_hr: '',
            actual_travel_duration_min: '',

            actual_start_date: '',
            actual_end_date: '',
            actual_start_time: '',
            actual_end_time: '',
            actual_travel: '',
            actual_reimbursement: '',
            actual_travel_distance: '',
            actual_travel_duration: '',

            description: '',
            notes: '',

            time_options: [],
            status_options: [],
            scheduled_rows: [],
            actual_rows: [],
            break_types: [],
            account_address_options: [],
            acccount_address: '',
            status: 1,

            contact_email: '',
            contact_phone: '',

            changedValue: false,
            isOpen: false,
            isDisabled: false,
            showErr: false,
            errMsg: '',
            showTimeErr: {
                scheduled_start_time: false,
                scheduled_end_time: false,
                actual_start_time: false,
                actual_end_time: false
            },
            allow_newcontact: true,
            roster_options: [],
            roster_id: '',
            selected_roster: '',
            openRosterRepeatModal: false,
            week_count: 0,
            weekfort_count: 0,
            month_count: 0,
            repeat_specific_days: false,
            inputValue: '',
            isLoadingMenuItems: false,
            selection: [],
            contact_person_options: this.setIconForList([]),
            contact_person_id: '',
            sa_line_item_options: [],
            sa_line_item_selection: [],
            service_agreement_id: '',
            sa_line_items: [],
            updateStateLineItem: false,
            show_roster: false,
            scheduled_support_type: '',
            support_type_options: [],
            serice_booking_id: '',
            scheduled_docusign_id: '',
            scheduled_docusign_url: '',
            scheduled_docusign_related: '',
            scheduled_ndis_line_item_list: [],
            missing_line_item: false,
            actual_support_type: '',
            actual_docusign_id: '',
            actual_docusign_url: '',
            actual_docusign_related: '',
            actual_ndis_line_item_list: [],
            errors: {},
            signed_ndis: 0,
            actual_sb_status:0,
            scheduled_sb_status:0,
            scheduled_start_date_input: today,
            scheduled_end_date_input: today,
            actual_start_date_input: '',
            actual_end_date_input: '',
            open_actual_times: this.props.id || false,
            open_scheduled_ndis: this.props.id || true,
            open_actual_ndis: this.props.id || false,
            scheduled_support_type_duration: [],
            actual_support_type_duration: [],
            scheduled_st_duration_error: {
                error: false,
                errorMsg: ''
            },
            actual_st_duration_error: {
                error: false,
                errorMsg: ''
            },
            is_support_mixed: false,
            is_time_updated_from_details:false,
        }

        this.SLDSMultiSelectPopoverRef = React.createRef();

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            scheduled_start_date: React.createRef(),
            scheduled_end_date: React.createRef(),
            actual_start_date: React.createRef(),
            actual_end_date: React.createRef(),
            repeat_hidden_date: React.createRef()
        }
        this.formRef = React.createRef();
        this.reactTable = React.createRef();
    }

    /**
     * Adding a new row in the table for user to insert data of registered member
     */
    addRow = (actual_row = false) => {
        var currows = this.state.scheduled_rows;
        var actrows = this.state.actual_rows;
        var firstid = this.state.break_types[0].value;
        if (actual_row == false) {
            currows.push({ id: "", break_type: firstid, break_start_time: "", break_end_time: "", break_duration: "", duration_disabled: false, timing_disabled: false, break_option: this.state.break_types });
        }
        else {
            actrows.push({ id: "", break_type: firstid, break_start_time: "", break_end_time: "", break_duration: "", duration_disabled: false, timing_disabled: false, break_option: this.state.break_types });
        }
        let cur_break_length = currows.length;
        let act_break_length = actrows.length;
        cur_break_length = cur_break_length > 0 ? cur_break_length-1 : cur_break_length;
        act_break_length = act_break_length > 0 ? act_break_length-1 : act_break_length;
        this.setState({ 'scheduled_rows': currows, 'actual_rows': actrows, ['scheduled_break_option_'+cur_break_length]: this.state.break_types, ['actual_break_option_'+cur_break_length]: this.state.break_types }, () => {
            if (actual_row == false) {
                this.updateBreakOption('scheduled');
            } else {
                this.updateBreakOption('actual');
            }
        });
    }

    /**
     * Removing a new row in the table
     */
    removeRow = (idx, actual_row = false) => {
        var currows = this.state.scheduled_rows;
        var actrows = this.state.actual_rows;
        
        if (actual_row == false) {
            currows.splice(idx, 1);
            this.calcActiveDuration(1);
        }
        else {
            // s/o 
            let breaks = this.state.break_types;
            let findSleepBreak = breaks.find(x => x.key_name === 'sleepover');
            let findInSleepBreak = breaks.find(x => x.key_name === 'interrupted_sleepover');

            let sleepValue = '';
            if (findSleepBreak && findSleepBreak.value) {
                sleepValue = findSleepBreak.value;
            }
            let inSleepValue = '';
            if (findInSleepBreak && findInSleepBreak.value) {
                inSleepValue = findInSleepBreak.value;
            }

            let break_type = actrows[idx].break_type;
            let inSleepBreakIdx = actrows.findIndex(x => Number(x.break_type) === Number(inSleepValue));
            if (Number(break_type) === Number(sleepValue) && inSleepBreakIdx > -1 ) {
                toastMessageShow("Delete Interrupted S/O timing before deleting S/O break", "e");
                return false;
            }
            actrows.splice(idx, 1);
            this.calcActiveDuration(2, 'actual_break_rows');
        }
        
        this.setState({ 'scheduled_rows': currows, 'actual_rows': actrows, changedValue: true },() => {
            if (actual_row == false) {
                this.updateBreakOption('scheduled');
            } else {
                this.updateBreakOption('actual');
            }
            this.onSubmit(null, true);
        });
    }

     /**
     * Get support type duration date & format
     */
      get_support_type_ndis_duration = (index) => {

        let start_date = this.state[index + '_start_date'];
        let start_time = this.state[index + '_start_time'];
        let end_date = this.state[index + '_end_date'];
        let end_time = this.state[index + '_end_time'];
        let duration = this.state[index + '_duration'];
        let support_type_duration = this.state[index + '_support_type_duration'];
        let rows = this.state[index + '_rows'];
        let req = {
            start_date: start_date,
            start_time: start_time,
            end_date: end_date,
            end_time: end_time,
            duration: duration,
            full_account_address: (this.state.account_address) ? this.state.account_address : '',
            account_address: (this.state.account_address) ? this.state.account_address.value : '',
            section: index,
            support_type_duration: this.state.is_support_mixed ? support_type_duration : [],
            rows: rows
        };

        let support_duration_list = [];
        postData("schedule/NdisPayments/get_support_type_ndis_duration", req).then((res) => {
            support_duration_list = (res.data) ? res.data : [];
            if (!res.status && res.error !== 'API ERROR') {
                this.setErrors(res.error);
            }
            this.setState({
                [index + '_support_type_duration']: support_duration_list
            })
        });
    }

    /**
     * Validate the support type service agreement and line item
     * @param {str} index 
     */
    get_support_type_mixed_validation = (index) => {
        let missing_line_item = this.state[index + "_missing_line_item"];        
        let req = {
            sa_id: this.state[index + "_sa_id"],
            docusign_id: this.state[index + "_docusign_id"],
            support_type: this.state[index + "_support_type"],
            ndis_line_item_list: this.state[index + "_ndis_line_item_list"],
            missing_line_item: missing_line_item,
            section: index,
            validateOnly: false
        }
        postData("schedule/ScheduleDashboard/get_shift_support_type_validation",req).then((res) => {
            if (res.status) {
                this.setState({
                    [index + "_mixed_support_type_error"]: '', mixed_support_error: false
                })
            }else{
                this.setState({[index + "_mixed_support_type_error"]: res.error, mixed_support_error: true})
            }
        });
    }

    /**
     * fetching the reference data (skills and skill levels) of member's object
     */
    get_shift_break_types = () => {
        postData("schedule/ScheduleDashboard/get_shift_break_types").then((res) => {
            if (res.status) {
                this.setState({
                    break_types: (res.data) ? res.data : [],
                    actual_break_types: (res.data) ? res.data : [],
                    scheduled_break_types: (res.data) ? res.data : []
                })
            }
        });
    }
    getAddress = (e) => {
        if (e) {
            postData("schedule/ScheduleDashboard/get_address_for_account", e).then((res) => {
                if (res.status) {
                    this.setState({
                        account_address_options: (res.data) ? res.data : [],
                        account_address: (res.data) ? res.data[0] : '',
                        unit_number: (res.data && res.data[0]) ? res.data[0].unit_number : '',
                    })
                }
            });
        }
    }

    /**
     * Get selected account contact list with default or primary
     * @param {obj} e
     * @param {boolean} reset
     */
    getContact = (e, reset, contact_person) => {
        if (e) {
            var contact_id = contact_person ? contact_person.value : '';
            postData("schedule/ScheduleDashboard/get_contact_list_for_account", { account: e, contact_id: contact_id }).then((res) => {
                if (res.status) {
                    let data = (res.data) ? res.data : [];
                    let dataWithIcon = this.setIconForList(data);

                    // Set default contact option
                    let data_default = (res.default_contact) ? res.default_contact : [];
                    let data_default_id = (res.default_contact_id) ? res.default_contact_id : '';
                    let dataDefaultWithIcon = this.setIconForList(data_default);

                    this.setState({
                        contact_person_options: dataWithIcon,
                        contact_person: dataDefaultWithIcon,
                        contact_person_id: data_default_id
                    }, () => {
                        let contact_errors = applyValidation("Contact", "data-validation-required", this.state.contact_person_id);
                        this.setError(contact_errors, "combobox_contact");
                        if(this.state.contact_email=='' && this.state.contact_phone==''){
                            this.getEmailAndPhoneByContact(data_default_id);    
                        }
                        
                    });

                    if (reset === true) {
                        this.setState({
                            contact_person: (res[0]) ? res[0] : ''
                        })
                    }
                }
            });
        }

    }

    /**
     * Get selected account contact list with default or primary
     * @param {obj} e
     * @param {boolean} reset
     */
 getEmailAndPhoneByContact = (person_id) => {   
    if (person_id) {
        postData("schedule/ScheduleDashboard/get_contact_email_phone_by_account", { person_id: person_id}).then((res) => {
            if (res.status) {
                this.setState({contact_phone : res.data.phone , contact_email: res.data.email})
            }
        });
    }

}

    getServiceType = (e) => {
        if (e) {
            postData("item/document/get_rolename_for_account", e).then((res) => {
                if (res.status) {
                    let is_ndis = res.data[0] && res.data[0]["label"] === "NDIS" || false; 
                    this.setState({
                        role_details_options: (res.data) ? res.data : [],
                        role_details: (res.data) ? res.data[0] : '',
                        is_ndis 
                    })
                }
            });
        }

    }

    /**
     * fetching the roster id
     */
    get_roster_option = (e, roster_id) => {
        if (e) {
            postData("schedule/ScheduleDashboard/get_roster_option", { account: e }).then((res) => {
                if (res.status) {
                    this.setState({
                        roster_options: (res.data) ? res.data : []
                    }, () => {
                        if (roster_id) {
                            this.setRepeatOption(roster_id);
                        }
                    })
                }
            });
        }
    }

    /**
     * fetching the service agreement list
     */
    get_service_agreement = (reset, index, loadItem) => {
        if (this.state.account_person && this.state.account_person.account_type && Number(this.state.account_person.account_type) !== 1) {
            return false;
        }
        let start_date = this.state[index + '_start_date'];
        let end_date = this.state[index + '_end_date'];
        if (start_date === '' || end_date === '' || !start_date || !end_date) {
            return false;
        }
        postData("schedule/ScheduleDashboard/get_service_agreement", { account: this.state.account_person, start_date: start_date, end_date: end_date, section: index }).then((res) => {
            if (!res.status && res.error !== 'API ERROR') {
                if(res.rule)
                {
                    if(res.rule!=1)
                    {
                        this.setState({[index+'_sb_status']:res.rule});
                    }
                }
                this.setWarning(res.error, index);
            }
            let signed_ndis = 1;
            if (!res.status && res.error == "No Signed NDIS Service Agreement exists for the requested shift date") {
                signed_ndis = 0;
            }
            let data = res.data ? res.data : [];
            this.setState({
                service_agreement_options: (res.data) ? res.data : [],
                [index + '_sa_id']: ((data.service_agreement_id) ? data.service_agreement_id : ''),
                [index + '_docusign_id']: ((data.docusign_id) ? data.docusign_id : ''),
                [index + '_docusign_url']: ((data.docusign_url) ? data.docusign_url : ''),
                [index + '_docusign_related']: ((data.docusign_related) ? data.docusign_related : ''),
                [index + '_sa_line_items']: reset === true ? [] : this.state.sa_line_items,
                updateStateLineItem: reset === true ? true : false,
                signed_ndis
            }, () => {
                if (loadItem === true && index === 'actual' && this.state.actual_start_date && this.state.actual_start_time && this.state.actual_end_date && this.state.actual_end_time) {
                    this.get_line_items_for_payment('support_type', this.state.actual_support_type, 'actual');
                }
                if (loadItem === true && index === 'scheduled' && this.state.scheduled_start_date && this.state.scheduled_start_time && this.state.scheduled_end_date && this.state.scheduled_end_time) {
                    this.get_line_items_for_payment('support_type', this.state.scheduled_support_type, 'scheduled');
                }
            })
        });
    }

    /**
     * Toaster Error
     * @param {str} msg 
     */
    toastmsg = (msg, type) => {
        if (type === 'e') {
            toast.error(msg, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }

        if (type === 's') {
            toast.success(msg, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }
    /**
     * Fetching the line items for payment calculation
     */
    get_line_items_for_payment = (type, value, index, notify, day_focus, save_error, day) => {

        let service_agreement_id = this.state[index + '_sa_id'];
        let start_date = this.state[index + '_start_date'];
        let start_time = this.state[index + '_start_time'];
        let end_date = this.state[index + '_end_date'];
        let end_time = this.state[index + '_end_time'];
        let duration = this.state[index + '_duration'];
        let rows = this.state[index + '_rows'];
        let support_type_duration_raw = this.state[index + '_support_type_duration'];
        let support_type_duration = [];
        support_type_duration_raw.map((st_dur) => {
            let duration_item = st_dur.duration;
            support_type_duration = [ ...support_type_duration, ...duration_item ]
        });
        let req = {
            type: type,
            supportType: value,
            service_agreement_id: service_agreement_id,
            start_date: start_date,
            start_time: start_time,
            end_date: end_date,
            end_time: end_time,
            scheduled_duration: duration,
            account_address: this.state.account_address,
            scheduled_rows: rows,
            section: index,
            support_type_duration: this.state.is_support_mixed && duration && duration != '00:00' ? support_type_duration : [],
        };
        let errors = false;

        if (start_date === '' || end_date === '' || !start_date || !end_date || start_time === '' || !start_time || end_time === '' || !end_time || !value || value === '') {
            // return false;
        }

        if (this.state.is_support_mixed) {
            let st_error = false;
            st_error = this.supportDurationFormat(this, index+'_support_type_duration', 0, 'duration', index, false, day_focus, save_error, day);
            if (st_error) {
                errors = true;
            }
        }
        
        if (errors === true) {
            return false;
        }

        let ndis_line_item_list = [];
        let resetErrors = {[index+"_ndis"]: '{"field":"'+index+'_ndis", "msg":"", "type":"error"}'};
        this.setErrors(resetErrors); 
        postData("schedule/NdisPayments/get_line_items_for_payment", req).then((res) => {
            ndis_line_item_list = (res.data) ? res.data : [];
            let missing_line_item = (res.missing_line_item) ? res.missing_line_item : false;
            if (!res.status && res.error !== 'API ERROR' && notify !== false) {
                this.setErrors(res.error);
            }
            this.setState({
                [index + '_ndis_line_item_list']: ndis_line_item_list, [index + '_missing_line_item']: missing_line_item
            }, ()=> {
                this.get_support_type_mixed_validation(index);
            })
            if(index=='scheduled' && this.state.status>3)
            {
                this.setState({'actual_ndis_line_item_list':ndis_line_item_list})
            }
        });
    }

    /**
      *  fetching the support type
     */
    get_support_type = (reset, index) => {
        if (this.state.account_person && this.state.account_person.account_type && Number(this.state.account_person.account_type) !== 1) {
            return false;
        }
        postData("schedule/ScheduleDashboard/get_support_type").then((res) => {
            if (res.status) {
                this.setState({
                    support_type_options: (res.data) ? res.data : [],
                    [index + '_sa_line_items']: reset === true ? [] : this.state.sa_line_items,
                    updateStateLineItem: reset === true ? true : false
                })
            }
        });
    }

    /**
     * fetching the service agreement list
     */
    get_service_agreement_line_item = (sa_id, updateState) => {
        postData("schedule/ScheduleDashboard/get_service_agreement_line_item_list", { service_agreement_id: sa_id }).then((res) => {
            if (res.status) {
                this.setState({
                    sa_line_item_options: (res.data) ? res.data : [],
                    updateStateLineItem: updateState === true ? true : false
                })
                // this.SLDSMultiSelectPopoverRef.updateStateValue();
            }
        });
    }

    /**
     * calculating shift's active duration
     */
    async calcActiveDuration(cat, key, val) {
        var final_req = await calculate_shift_duration(cat, this.state, '', key, val);

        if (cat == 2) {
            this.setState({
                actual_duration: (final_req) ? final_req : ''
            }, () => {
               if(final_req !='' && final_req != '00:00') {
                    this.get_line_items_for_payment('support_type', this.state.actual_support_type, 'actual');
                    if (this.state.is_support_mixed) {
                        this.get_support_type_ndis_duration('actual');
                    }
                } else {
                    this.resetLineitems('actual');
                }
            })
        }
        else {
            this.setState({
                scheduled_duration: (final_req) ? final_req : ''
            },()=>{
                if(final_req !='' && final_req != '00:00') {
                    this.get_line_items_for_payment('support_type', this.state.scheduled_support_type, 'scheduled');
                    if (this.state.is_support_mixed) {
                        this.get_support_type_ndis_duration('scheduled');
                    }
                } else {
                    this.resetLineitems('scheduled');
                }

                if(this.props.id && this.state.status>3)
                {
                    this.setState({'actual_duration':this.state.scheduled_duration});
                }
                this.onSubmit(null, true)
            })
        }
    }

    /**
     * when days are selected on the repeating days modal
     * adding/removing based on selection
     */
    addRemoveSelectedRepeatDates(dateYmdHis) {
        let tempArr = [...this.state.repeat_days_selected];
        var index = tempArr.indexOf(dateYmdHis);
        if (moment(this.state.scheduled_start_date).format('YYYY-MM-DD') == dateYmdHis) {
            return;
        }
        if (index == -1) {
            tempArr.push(dateYmdHis);
        }
        else if (index > -1) {
            tempArr.splice(index, 1);
        }
        this.setState({ repeat_days_selected: tempArr });
    }


    checkDateAndTime(key, dateYmdHis, selTime, ndis_section, duration = false) {
        // validate start date and end date
        let section = ndis_section || "scheduled_section";
        let start_date = this.state.scheduled_start_date;
        let end_date = this.state.scheduled_end_date;
        let start_time = moment(this.state.scheduled_start_time, ["h:mm A"]).format("HH:mm");
        let end_time = this.state.scheduled_end_time || "";
        if (key) {
            section = key.indexOf("scheduled") !== -1? "scheduled_section" : "actual_section";
            if (key === 'scheduled_start_date') {
                start_date = dateYmdHis;
            }
            if (key === 'scheduled_end_date') {
                end_date = dateYmdHis;
            }
            if (key === 'scheduled_start_time') {
                start_time = selTime;
            }
            if (key === 'scheduled_end_time') {
                end_time = selTime;
            }
        }
        if (!end_time && section === "scheduled_section") {
            this.setError("Please enter the correct date/time", section);
            return false;
        }
        start_date = moment(start_date).format('YYYY-MM-DD');
        end_date = moment(end_date).format('YYYY-MM-DD');
        start_time = moment(start_time, ["h:mm A"]).format("HH:mm");
        end_time = moment(end_time, ["h:mm A"]).format("HH:mm");
        let start_dt = moment(start_date + " " + start_time);
        let end_dt = moment(end_date + " " + end_time);

        if (end_dt.isBefore(start_dt) === true) {
            this.setError("Please enter the correct date/time", section);
            return false;
        } else {
            this.setError("", section);
        }
        if (this.state.scheduled_support_type === "2" && !start_dt.isSame(end_dt, 'day')) {
            //Cleaning supports could be availed only on a single weekday between 6 AM - 8 PM
            this.setError("Cleaning supports could be availed only on a single weekday between 6 AM - 8 PM", "scheduled_support_type");
            return false;
        } else {
            this.setError("", "scheduled_support_type");
        }
        let isSameDay = start_dt.isSame(end_dt, 'day');
        let isAfterEight = moment(end_time, "HH:mm").isAfter(moment("20:00", "HH:mm"));
        if (this.state.scheduled_support_type === "2" && (!isSameDay || isAfterEight)) {
            //Cleaning supports could be availed only on a single weekday between 6 AM - 8 PM
            this.setError("Cleaning supports could be availed only on a single weekday between 6 AM - 8 PM", "scheduled_support_type");
            return false;
        } else {
            this.setError("", "scheduled_support_type");
        }        
        this.setError("", "scheduled_section");    
        this.setError("", "actual_breaks");      
        return true;
    }

    /**
     * Format the input of date when use type manually
     * @param {date|str} value 
     */
     onChangeInputDatePicker = (value, dateYmdHis) => {
        var date_format;
        if (!value) {
            date_format = moment(dateYmdHis);
            if (!date_format.isValid()) {
                date_format = '';
            } else {
                date_format = date_format.format('DD/MM/YYYY');
            }
        } else {
            // Add slash after character length 2 and 4 using reg exp
            date_format = value.replace(/^(\d\d)(\d)$/g,'$1/$2').replace(/^(\d\d\/\d\d)(\d+)$/g,'$1/$2').replace(/[^\d\/]/g,'');
        }

        return date_format;
    }
    
    /**
     * handling the change event of the data picker fields
     */
     handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let formatted_date = '';
        let value = '';
        if (e && e.target.value) {
            value = e.target.value;
        }
        // format date
        formatted_date = this.onChangeInputDatePicker(value, dateYmdHis);

        
        //let label = key === "scheduled_start_date"? "Scheduled Start Date" : "Scheduled End Date";
        let labels = {"scheduled_start_date" : "Scheduled Start Date", "scheduled_end_date" : "Scheduled End Date", "actual_start_date" : "Actual Start Date", "actual_end_date" : "Actual End Date"};
        let label = labels[key] || "Above field";
        let errors = validate(label, dateYmdHis && dateYmdHis.toString() || null, {"data-validation-required" : true});      
        let section = key === "scheduled_start_date" || key === "scheduled_end_date"? "scheduled_section" : "actual_section";  
        this.setError(errors, section);
        this.checkDateAndTime(key, dateYmdHis);        
        let newState = {}
        if (dateYmdHis) {
            newState[key] = dateYmdHis;
            newState[key+'_input'] = formatted_date;
            this.setState(newState, () => {
                this.setRepeatOption(this.state.roster_id);
                // Call service agreement
                if (key == 'scheduled_start_date' || key == 'scheduled_end_date') {
                    // only update if status is in-progress
                    if(this.props.id && this.state.status>3){
                        this.setState({
                            'actual_start_time':this.state.scheduled_start_time,
                            'actual_end_time':this.state.scheduled_end_time,
                            'actual_start_date':this.state.scheduled_start_date,
                            'actual_end_date':this.state.scheduled_end_date,
                            'actual_duration':this.state.scheduled_duration,
                            'actual_start_date_input': moment(this.state.scheduled_start_date).format('DD/MM/YYYY'),
                            'actual_end_date_input': moment(this.state.scheduled_end_date).format('DD/MM/YYYY')
                        });
                    }
                    this.get_service_agreement(true, 'scheduled', true);
                } else {
                    this.get_service_agreement(true, 'actual', true);
                }
                if (section === "scheduled_section" && this.state.scheduled_start_date && this.state.scheduled_end_date && this.state.scheduled_start_time && this.state.scheduled_end_time) {
                    this.onSubmit(null, true);
                }
                if (section === "actual_section" && this.state.actual_start_date && this.state.actual_end_date && this.state.actual_start_time && this.state.actual_end_time) {
                    this.onSubmit(null, true);
                }
            });
            this.setState({ scheduled_start_date_var: dateYmdHis });
            if (key == 'scheduled_start_date' && !this.state.scheduled_start_date && data) {
                this.setState({ scheduled_start_time: '06:00 AM', scheduled_start_date_updated: true, changedValue: true, scheduled_end_date: moment(data.date).format('YYYY-MM-DD') });
                document.getElementById("time_picker").className = "slds-form-element__control scheduled_start_time";
            }
            else if (key == 'scheduled_start_date') {
                this.setState({ scheduled_start_date_updated: true });
            }
            /*else if(key=='scheduled_start_date' && dateYmdHis && this.state.scheduled_start_time){
                var newstate = this.state;
                var dateState = dateYmdHis;
                var end_date_actual = this.state.scheduled_end_date?this.state.scheduled_end_date:'';
                var end_date = (this.state.scheduled_start_time === '11:50 PM') ? moment(dateState).add(1,'days').local().format('YYYY-MM-DD HH:mm') :end_date_actual;
                this.setState({ ['scheduled_end_date'] : end_date});
            }  */

            var cat = 1;
            if (key == 'actual_start_date' || key == 'actual_end_date') {
                cat = 2;
            }
            else if (key == 'repeat_hidden_date') {
                this.addRemoveSelectedRepeatDates(moment(dateYmdHis).format('YYYY-MM-DD'));
            }

            this.calcActiveDuration(cat, key, dateYmdHis);
        } else {
            
            newState[key] = '';
            newState[key+'_input'] = formatted_date;            
            this.setState(newState);
        }
    }

     /**
     * handling the change event of the data picker fields
     */
      handleChangeDatePickerCheck = (dateYmdHis, e, data, key) => {
       let formatted_date = '';
       let value = '';
       if (e && e.target.value) {
           value = e.target.value;
       }
       // format date
       formatted_date = this.onChangeInputDatePicker(value, dateYmdHis);
       
       //let label = key === "scheduled_start_date"? "Scheduled Start Date" : "Scheduled End Date";
       let labels = {"scheduled_start_date" : "Scheduled Start Date", "scheduled_end_date" : "Scheduled End Date", "actual_start_date" : "Actual Start Date", "actual_end_date" : "Actual End Date"};
       let label = labels[key] || "Above field";
       let errors = validate(label, dateYmdHis && dateYmdHis.toString() || null, {"data-validation-required" : true});      
       let section = key === "scheduled_start_date" || key === "scheduled_end_date"? "scheduled_section" : "actual_section";  
       this.setError(errors, section);
       this.checkDateAndTime(key, dateYmdHis);        
       let newState = {}
       if (dateYmdHis) {
           newState[key] = dateYmdHis;
           newState[key+'_input'] = formatted_date;
           this.setState(newState, () => {
               this.setRepeatOption(this.state.roster_id);
               // Call service agreement
               if (key == 'scheduled_start_date' || key == 'scheduled_end_date') {
                   // only update if status is in-progress
                   if(this.props.id && this.state.status>3){
                       this.setState({
                           'actual_start_time':this.state.scheduled_start_time,
                           'actual_end_time':this.state.scheduled_end_time,
                           'actual_start_date':this.state.scheduled_start_date,
                           'actual_end_date':this.state.scheduled_end_date,
                           'actual_duration':this.state.scheduled_duration,
                           'actual_start_date_input': moment(this.state.scheduled_start_date).format('DD/MM/YYYY'),
                           'actual_end_date_input': moment(this.state.scheduled_end_date).format('DD/MM/YYYY')
                       });
                   }
                   this.get_service_agreement(true, 'scheduled');
               } else {
                   this.get_service_agreement(true, 'actual');
               }
               if (section === "scheduled_section" && this.state.scheduled_start_date && this.state.scheduled_end_date && this.state.scheduled_start_time && this.state.scheduled_end_time) {
                   this.onSubmit(null, true);
               }
               if (section === "actual_section" && this.state.actual_start_date && this.state.actual_end_date && this.state.actual_start_time && this.state.actual_end_time) {
                   this.onSubmit(null, true);
               }
           });
           this.setState({ scheduled_start_date_var: dateYmdHis });
           if (key == 'scheduled_start_date' && !this.state.scheduled_start_date && data) {
               this.setState({ scheduled_start_time: '06:00 AM', scheduled_start_date_updated: true, changedValue: true, scheduled_end_date: moment(data.date).format('YYYY-MM-DD') });
               document.getElementById("time_picker").className = "slds-form-element__control scheduled_start_time";
           }
           else if (key == 'scheduled_start_date') {
               this.setState({ scheduled_start_date_updated: true });
           }
           /*else if(key=='scheduled_start_date' && dateYmdHis && this.state.scheduled_start_time){
               var newstate = this.state;
               var dateState = dateYmdHis;
               var end_date_actual = this.state.scheduled_end_date?this.state.scheduled_end_date:'';
               var end_date = (this.state.scheduled_start_time === '11:50 PM') ? moment(dateState).add(1,'days').local().format('YYYY-MM-DD HH:mm') :end_date_actual;
               this.setState({ ['scheduled_end_date'] : end_date});
           }  */

           var cat = 1;
           if (key == 'actual_start_date' || key == 'actual_end_date') {
               cat = 2;
           }
           else if (key == 'repeat_hidden_date') {
               this.addRemoveSelectedRepeatDates(moment(dateYmdHis).format('YYYY-MM-DD'));
           }

           this.calcActiveDuration(cat, key, dateYmdHis);
       } else {
           
           newState[key] = '';
           newState[key+'_input'] = formatted_date;            
           this.setState(newState);
       }
   }


    resetLineitems = (index) => {
        if (index === 'scheduled') {
            this.setState({ [index + '_ndis_line_item_list']: [] });
        } else {
            this.setState({ [index + '_ndis_line_item_list']: [] });
        }
    }
    /**
     * Set repeat option to be visible
     * @param {int} roster_id
     * @returns
     */
    setRepeatOption = (roster_id) => {
        if (this.state.scheduled_start_date !== '' && moment(this.state.scheduled_start_date).isValid() && this.state.scheduled_end_date !== '' && moment(this.state.scheduled_end_date).isValid()) {
            let roster = this.state.roster_options.filter((item, key) => item.value === roster_id).map(({ label, value, start_date, end_date }) => ({ label, value, start_date, end_date }));
            let selected_roster = roster[0] ? roster[0] : '';
            if (selected_roster.start_date && selected_roster.end_date) {
                var sc_start_date = new Date(this.state.scheduled_start_date);
                var sc_end_date = new Date(selected_roster.end_date);

                // check week repeat option
                let bet_weeks = this.diff_weeks(sc_start_date, sc_end_date);
                var addDays = 7;
                var addDaysFort = 14;
                var week_check = false;
                var weekfort_check = false;
                let week_date = moment(this.state.scheduled_start_date);
                let weekfort_date = moment(this.state.scheduled_start_date);
                for (let i = 1; i < 2; i++) {
                    week_date.add(addDays, 'days');
                    weekfort_date.add(addDaysFort, 'days');
                    // if date is greater than end date break and continue the loop
                    if (week_date.isBefore(sc_end_date) === true || week_date.isSame(sc_end_date) === true) {
                        week_check = true;
                    }

                    if (weekfort_date.isBefore(sc_end_date) === true || weekfort_date.isSame(sc_end_date) === true) {
                        weekfort_check = true;
                    }
                }

                // check month repeat option
                let all_month = this.dateRange(this.state.scheduled_start_date, selected_roster.end_date);
                var month_check = false;
                if (all_month.length > 1) {
                    var res_date = moment(selected_roster.end_date);
                    let dayINeed = moment(sc_start_date).format('dddd');
                    for (let i = 1; i < 2; i++) {
                        var mon_start_date = all_month[i];

                        var day = moment(mon_start_date).startOf('month').day(dayINeed);
                        if (day.date() > 7) day.add(7, 'd');
                        if (day.isBefore(sc_end_date) === true || day.isSame(sc_end_date) === true) {
                            month_check = true
                        }
                    }
                }
                this.setState({ week_count: week_check === true ? bet_weeks : 0, weekfort_count: weekfort_check === true ? bet_weeks : 0, month_count: month_check === true ? all_month.length : 0 });
            }
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
     * handling the status change event
     */
    handleChange = (value, key, index) => {
        if (key == 'contact') {
            if (value.value == 'new contact') {
                this.setState({ openCreateContactModal: true });
            } else {
                this.setState({ contact_person: value, changedValue: true }, () => {
                    this.get_service_agreement(true, 'scheduled');
                })
            }
        } else if (key === 'support_type') {
            this.setError(applyValidation("Support Type", "data-validation-required", value), "scheduled_support_type");
            this.setError(applyValidation("Support Type", "data-validation-required", value), "actual_support_type");
            this.get_line_items_for_payment(key, value, index);
            this.setState({ scheduled_support_type: value, actual_support_type: value }, () =>{
                this.get_line_items_for_payment(key, value, index);
                let start_date = this.state['actual_start_date'];
                let start_time = this.state['actual_start_time'];
                let end_date = this.state['actual_end_date'];
                let end_time = this.state['actual_end_time'];
                let duration = this.state['actual_duration'];
                let rows = this.state['actual_rows'];

                if ((this.state.actual_ndis_line_item_list && this.state.actual_ndis_line_item_list.length > 0) || (start_date && start_time && end_date && end_time)) {
                    this.get_line_items_for_payment(key, value, 'actual', false);
                }
                let is_support_mixed = false;
                this.state.support_type_options.map(option => {
                    if (option.key_name === "mixed" && value == option.value) {
                        is_support_mixed = true;
                        this.setState({ is_support_mixed: true })
                    } else {
                        this.setState({ is_support_mixed: false })
                    }
                })
                if (is_support_mixed) {
                        this.get_support_type_mixed_validation(index);
                }else{
                    this.setState({[index + "_mixed_support_type_error"]: '', mixed_support_error: false})
                }
            });            
        }else if(key == 'account_address'){
            this.state.account_address_options.map((val)=>{
                if(val.value == value){
                    this.setState({unit_number : val.unit_number})
                }
            });
            this.setState({ [key]: value });
        }        
         else {
            this.setState({ [key]: value });
        }
    }

    handleOnBlur = (event, statetxt) => {
        if (parseInt(event.target.value) < 10 && event.target.value.length == 1) {
            this.setState({ [statetxt]: "0" + event.target.value });
        }
    }

    /**
     * To close the create or update modal
     */
    closeContactModal = (status, res_data) => {
        this.setState({ openCreateContactModal: false });
        if (res_data) {
            this.setState({ contact_person: res_data, changedValue: true });
            let contact_person = res_data[0] ? res_data[0] : res_data;
            this.getContact(this.state.account_person, false, contact_person);
        }

    }

    /**
     * To close the create or update modal
     */
    closeRosterRepeatModal = (status, res_data) => {
        this.setState({ openRosterRepeatModal: false });
        if (res_data) {
            this.setState({ changedValue: true });
        }

    }

    /**
     * when submit button is clicked on the modal
     */
    onSubmit(e, validateOnly = false) {
        var default_submit = false;
        if (e) {
            e.preventDefault();
            default_submit = true;
        }
        if (validateOnly) {
            default_submit = true;
        }
        let errors = "";
        if (!validateOnly) {
            errors = validateForm(this.formRef);
        }
        if (errors) {
            let st_errors = this.state.errors;
            this.setState({ errors: { ...errors, ...st_errors } });
            errors = true;
        } else {
            this.setState({ errors: {} });
        }

        if (default_submit == false && this.state.repeat_option == 3 && this.state.repeat_days_selected.length == 0) {
            this.toastmsg("Please select atleast one day to repeat the shift", 'e');
            this.setState({ repeat_open: true });
            return;
        }

        let roster_id = this.state.roster_id;
        let roster = this.state.roster_options.filter((item, key) => item.value === roster_id).map(({ label, value, start_date, end_date }) => ({ label, value, start_date, end_date }));
        let selected_roster = roster[0] ? roster[0] : '';
        if (selected_roster.start_date && selected_roster.end_date) {
            let start_date_ros = moment(selected_roster.start_date);
            let end_date_ros = moment(selected_roster.end_date);
            let start_date = moment(this.state.scheduled_start_date);
            let end_date = moment(this.state.scheduled_end_date);
            if (start_date_ros.isBefore(start_date) === false && start_date_ros.isSame(start_date, 'day') === false) {
                this.setError("Schedule start date must be greater than roster start date", "scheduled_section");
                errors = true;
            }
            if (end_date_ros.isAfter(start_date) === false && end_date_ros.isSame(start_date, 'day') === false) {
                this.setError("Schedule start date must be less than roster end date", "scheduled_section");
                errors = true;
            }
            if (end_date_ros.isAfter(end_date) === false && end_date_ros.isSame(end_date, 'day') === false) {
                this.setError("Schedule end date must be less than roster end date", "scheduled_section");
                errors = true;
            }
            if (start_date_ros.isBefore(end_date) === false && start_date_ros.isSame(end_date, 'day') === false) {
                this.setError("Schedule end date must be greater than roster start date", "scheduled_section");
                errors = true;
            }
        }

        if (this.state.is_support_mixed) {
            let act_st_error = false
            let sch_st_error = false;
            sch_st_error = this.supportDurationFormat(this, 'scheduled_support_type_duration', 0, 'duration', 'scheduled', false, false, true, '');
            if (sch_st_error) {
                errors = true;
            }

            if (this.state.actual_duration && this.state.actual_duration != '00:00') {
                act_st_error = this.supportDurationFormat(this, 'actual_support_type_duration', 0, 'duration', 'actual', false, false, true, '');
                if (act_st_error) {
                    errors = true;
                }
            }
        }
        
        if (errors === true) {
            return false;
        }
        if(this.state.mixed_support_error){
            return false;
        }
        this.setState({ validation_calls: true })
        if (!this.state.loading) {
            this.setState({ loading: true });
            let contact = (this.state.contact_person) ? this.state.contact_person : '';
            let contact_id = '';
            if (contact && contact[0]) {
                contact_id = contact[0].value;
            }

            let service_agreement_id = this.state.service_agreement_id;
            let sa_line_items = this.state.sa_line_items
            if (this.state.account_person && this.state.account_person.account_type && Number(this.state.account_person.account_type) !== 1) {
                service_agreement_id = '';
                sa_line_items = [];
            }

            var req = {
                id: this.state.id,
                shift_no: this.state.shift_no,
                contact_id: contact_id,
                account_address: (this.state.account_address) ? this.state.account_address.value : '',
                full_account_address: (this.state.account_address) ? this.state.account_address : '',
                account_id: (this.state.account_person) ? this.state.account_person.value : '',
                account_type: (this.state.account_person) ? this.state.account_person.account_type : '',
                owner_id: (this.state.owner_person) ? this.state.owner_person.value : '',
                role_id: (this.state.role_details) ? this.state.role_details.value : '',
                scheduled_start_date: this.state.scheduled_start_date && moment(this.state.scheduled_start_date).isValid() ? moment(this.state.scheduled_start_date).format('YYYY-MM-DD') : this.state.scheduled_start_date,
                scheduled_end_date: this.state.scheduled_end_date && moment(this.state.scheduled_start_date).isValid() ? moment(this.state.scheduled_end_date).format('YYYY-MM-DD') : this.state.scheduled_end_date,
                scheduled_start_time: this.state.scheduled_start_time,
                scheduled_end_time: this.state.scheduled_end_time,
                scheduled_travel: this.state.scheduled_travel,
                scheduled_reimbursement: this.state.scheduled_reimbursement,
                scheduled_travel_distance: this.state.scheduled_travel_distance,
                scheduled_travel_duration_hr: this.state.scheduled_travel_duration_hr,
                scheduled_travel_duration_min: this.state.scheduled_travel_duration_min,
                actual_travel_duration_hr: this.state.actual_travel_duration_hr,
                actual_travel_duration_min: this.state.actual_travel_duration_min,
                actual_start_date: this.state.actual_start_date ? moment(this.state.actual_start_date).format('YYYY-MM-DD') : '',
                actual_end_date: this.state.actual_end_date ? moment(this.state.actual_end_date).format('YYYY-MM-DD') : '',
                actual_start_time: this.state.actual_start_time,
                actual_end_time: this.state.actual_end_time,
                actual_travel: this.state.actual_travel,
                actual_reimbursement: this.state.actual_reimbursement,
                actual_travel_distance: this.state.actual_travel_distance,
                actual_travel_duration: this.state.actual_travel_duration,
                description: this.state.description,
                notes: this.state.notes,
                status: this.state.status,
                repeat_option: (default_submit == true) ? '' : this.state.repeat_option,
                repeat_days_selected: (default_submit == true) ? '' : this.state.repeat_days_selected,
                scheduled_rows: this.state.scheduled_rows,
                actual_rows: this.state.actual_rows,
                contact_email: this.state.contact_email,
                contact_phone: this.state.contact_phone,
                roster_id: this.state.roster_id,
                repeat_specific_days: this.state.repeat_specific_days,

                scheduled_sa_id: this.state.scheduled_sa_id,
                scheduled_docusign_id: this.state.scheduled_docusign_id,
                scheduled_support_type: this.state.scheduled_support_type,
                scheduled_ndis_line_item_list: this.state.scheduled_ndis_line_item_list,
                scheduled_missing_line_item: this.state.scheduled_missing_line_item,

                actual_sa_id: this.state.actual_sa_id,
                actual_docusign_id: this.state.actual_docusign_id,
                actual_support_type: this.state.actual_support_type,
                actual_ndis_line_item_list: this.state.actual_ndis_line_item_list,
                actual_missing_line_item: this.state.actual_missing_line_item,
                validateOnly,
                actual_sb_status:this.state.actual_sb_status,
                scheduled_sb_status:this.state.scheduled_sb_status,
                scheduled_support_type_duration: this.state.is_support_mixed ? this.state.scheduled_support_type_duration : [],
                actual_support_type_duration: this.state.is_support_mixed && this.state.actual_duration &&  this.state.actual_duration != '00:00' ? this.state.actual_support_type_duration : [],
                //added as part of 9398
                scheduled_duration:this.state.scheduled_duration,
                actual_duration:this.state.actual_duration
            }
            var url = 'schedule/ScheduleDashboard/create_update_shift';
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    toastMessageShow(result.msg, "s");
                    this.props.closeModal(true,result.id);
                    setTimeout(() => {
                        this.ndisPaymentErr(result);
                    }, 1500);
                }
                else if (!validateOnly && result.status == false && result.account_shift_overlap == true) {
                    var confirm_msg = result.error + ', Do you want to continue?';
                    req.skip_account_shift_overlap = true;
                    AjaxConfirm(req, confirm_msg, `schedule/ScheduleDashboard/create_update_shift`, { confirm: 'Continue', heading_title: this.props.id ? "Update Shift" : "Create New Shift" }).then(conf_result => {
                        if (conf_result.status) {
                            let msg = conf_result.hasOwnProperty('msg') ? conf_result.msg : '';
                            toastMessageShow(conf_result.msg, "s");
                            this.props.closeModal(true,conf_result.id);
                            this.ndisPaymentErr(conf_result);
                        }
                        else {
                            toastMessageShow(conf_result.error, "e");
                        }
                    })
                }
                else {
                    this.setErrors(result.error);
                }
                this.setState({ loading: false });
            });
        }
    }

    /**
     * Show error msg if any error found
     * @param {array} result 
     */
    ndisPaymentErr = (result) => {
        if (result.ndisErrUrl) {
            let err_msg = 'NDIS Payment Errors are found in one (or) more repeated shifts. Download the file to view the errors.';
            Confirm(err_msg, { confirm: 'Download', heading_title: "Errors Found" }).then(msg_result => {
                if (msg_result.status === true) {
                    window.open(result.ndisErrUrl, "_blank");
                }
            });
        }
    }

    /**
     * mounting all the components
     */
    componentWillMount() {
        if (this.props.id) {
            this.handleBrowserClosed();
            this.get_shift_details(this.props.id);
            this.setState({ account_disabled: true, show_roster: true });
        }
        else if (this.props.clone_id) {
            this.get_shift_details(this.props.clone_id);
            this.setState({ account_disabled: false, show_roster: false, id: '' });
        }
        else {
            this.setState({is_time_updated_from_details:true})
            this.get_current_user();
        }

        if (this.props.roster) {
            var roster = this.props.roster;
            let show_roster = this.props.id ? true : this.props.page_name == 'participants' ? false : true;
            let new_contact = true;
            if (roster.account.account_type == 1) {
                new_contact = false;
            }
            this.setState({ account_person: roster.account, roster_id: roster.roster_id, owner_person: roster.owner, account_disabled: true, allow_newcontact: new_contact, show_roster: show_roster }, () => {
                if (roster.account) {
                    this.getAddress(roster.account);
                    let account_person = roster.account;
                    this.get_roster_option(account_person, roster.roster_id);
                    this.getServiceType(account_person);
                    this.getContact(this.state.account_person, false);
                    this.get_service_agreement(false, 'scheduled');
                }
            });

        }
        this.get_shift_statuses();
        this.get_shift_break_types();
        this.get_support_type(false, 'scheduled');
        this.get_support_type(false, 'actual');
        let currentDateTime = moment().local().format('YYYY-MM-DD HH:mm');
        this.setState({ scheduled_end_date: currentDateTime, scheduled_start_time: '06:00 AM' })
    }

    setValidatedTime(e, key, duration, durAct) {
        e.preventDefault();
        var selTime = this.state[key];
        let startTime = selTime;
        let section = key.indexOf("scheduled") !== -1 ? "scheduled_section" : "actual_section";
        if (selTime != '') {
            startTime = this.getFormatTime(startTime, key);
            if (isNaN(parseInt(startTime))) {
                console.log('Invalid Time');
            } else {
                let errors = this.state.errors;
                errors[key] = "";                
                this.setState({ [key]: startTime, errors }, () => {
                    if (duration === true) {
                        this.calcActiveDuration(durAct, key, startTime);
                    }
                    if (key === 'scheduled_start_time' || key === 'scheduled_end_time') {
                        this.checkDateAndTime(key, null, selTime, section);

                    }
                    if (key === 'actual_start_time' || key === 'actual_end_time') {
                        this.get_service_agreement(true, 'actual');
                    }
                });
            }
        } else if (section === "scheduled_section") {            
            this.setError("Please enter the correct date/time", section);
        }
    }

    setBreakTime(e, key, objVal, idx, inputStr, eventObj) {
        var row = key;
        var time = this.state[key];
        var selTime = time[idx];
        if (selTime != '') {
            let startTime = selTime[objVal];
            startTime = this.getFormatTime(startTime, key);
            if (isNaN(parseInt(startTime))) {
                console.log('Invalid Time');
            } else {
                time[idx][objVal] = startTime;

                this.setState({ key: time}, () => {
                    handleShareholderNameChangeShift(eventObj, key, idx, objVal, startTime).then(status => {
                        if (status) {
                            this.checkDateAndTime(null, null, null, null, this.state.scheduled_duration);
                        }
                    });                    
                    if (row === 'actual_rows') { 
                        this.calcActiveDuration(2, 'actual_break_rows');                        
                    }  else {
                        this.calcActiveDuration(1, 'scheduled_break_rows');  
                    }
                });
            }
        }
    }

    handleTimepicker = (date, selTime, key) => {
        this.checkDateAndTime(key, null, selTime);
        if (date != 'Invalid Date' && selTime != '') {
            var start_time = selTime;//moment(date).local().format(this.state.time_format);
            if (key === 'scheduled_start_time' || key === 'actual_start_time') {
                var newstate = this.state;
                var dateState = (key === 'scheduled_start_time') ? 'scheduled_start_date' : 'actual_start_date';
                let date_updated = this.state.scheduled_start_date_updated === true ? newstate[dateState] : date;
                var end_date = (start_time === '11:50 PM') ? moment(date_updated).add(1, 'days').local().format('YYYY-MM-DD HH:mm') : newstate[dateState];
                var updateState = (key === 'scheduled_start_time') ? 'scheduled_end_date' : 'actual_end_date';
                let end_date_input = moment(end_date).format('DD/MM/YYYY');
                if (moment(moment(end_date).format('DD/MM/YYYY'), 'DD/MM/YYYY', true).isValid() == true ) {
                    this.setState({ [updateState]: end_date, [updateState+'_input']: end_date_input });
                }
            }
            var getTime = selTime.slice(-2);
            const current = this.state.showTimeErr;
            current[key] = (getTime === 'am' || getTime === 'pm' || getTime === 'AM' || getTime === 'PM') ? false : true;

            var isValid = /^(((0[1-9])|(1[0-2])):([0-5])(0|5)\s(A|P)M)?$/.test(selTime);
            var isValidAlt = /^(([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9]))?$/.test(selTime);
            let time_hrminutes = selTime;
            if (isValid === true || isValidAlt === true) {
                let time_split = selTime.split(':');
                let time_min_split = time_split[1].split(' ');
                let time_hr_temp = time_split[0];
                let time_min_temp = time_min_split[0];
                let time_for_temp = time_min_split[1];
                time_hrminutes = String(time_hr_temp).padStart(2, '0') + ':' + String(time_min_temp).padEnd(2, '0') + ' ' + time_for_temp;
            }           
            let errors = this.state.errors || {};
            errors[key] = '';
            this.setState({ [key]: time_hrminutes, changedValue: true, showTimeErr: current, errors },()=>{
                if(this.props.id && this.state.status>3){
                    if (key === 'scheduled_start_time' || key === 'scheduled_end_time') {
                            this.setState({
                                'actual_start_time':this.state.scheduled_start_time,
                                'actual_end_time':this.state.scheduled_end_time,
                                'actual_start_date':this.state.scheduled_start_date,
                                'actual_end_date':this.state.scheduled_end_date,
                                'actual_duration':this.state.scheduled_duration});
                            }
                }

            });

        } else {
            const current = this.state.showTimeErr;
            current[key] = true;
            // this.get_end_time(selTime.substring(0,2),selTime.substring(2,selTime.length),selTime.slice(-2));
            let errors = this.state.errors || {};
            errors[key] = '';
            this.setState({ [key]: selTime, errors, showTimeErr: current, changedValue: true })
        }
    }

    /**
     * Get time format
     * @param {str} selTime
     */
    getFormatTime = (selTime, key) => {
        var isValid = /^(((0[1-9])|(1[0-2])):([0-5])([0-9])\s(A|P)M)?$/.test(selTime);
        let startTime;
        if (isValid === true && selTime != '') {
            let time_split = selTime.split(':');
            let time_min_split = time_split[1].split(' ');
            let time_hr_temp = time_split[0];
            let time_min_temp = time_min_split[0];
            let time_for_temp = time_min_split[1];
            startTime = this.get_end_time(time_hr_temp, time_min_temp, time_for_temp, key);
        } else {
            startTime = this.get_end_time(selTime.substring(0, 2), selTime.substring(2, selTime.length), selTime.slice(-2), key);
        }
        return startTime;
    }

    get_end_time(hrs, mins, format, key) {
        let hr = '';
        let minutes = parseInt(mins);
        let hrminutes = '';

        if (parseInt(hrs) > 12) {
            hr = parseInt(hrs - 12);
            if (isNaN(minutes)) minutes = '00';
            hrminutes = String(hr).padStart(2, '0') + ':' + String(minutes).padEnd(2, '0') + 'PM';
            if (hr > 11) {
                hrminutes = hrminutes.replace("AM", "PM");
            }
        } else {
            hr = parseInt(hrs);
            if (hr < 10) {
                if (isNaN(minutes)) minutes = '00';

                if (format === 'am' || format === 'pm' || format === 'AM' || format === 'PM') {
                    format = format.toUpperCase();
                } else {
                    format = 'AM';
                }
                hrminutes = String(hr).padStart(2, '0') + ':' + String(minutes).padEnd(2, '0') + ' ' + format;
            } else {
                if (isNaN(minutes)) minutes = '00';

                if (format === 'am' || format === 'pm' || format === 'AM' || format === 'PM') {
                    format = format.toUpperCase();
                } else {
                    format = 'AM';
                }
                hrminutes = String(hr).padStart(2, '0') + ':' + String(minutes).padEnd(2, '0') + ' ' + format;
            }
        }
        if (isNaN(parseInt(hrminutes))) {
            const current = this.state.showTimeErr;
            current[key] = true;
            this.setState({ errMsg: '', showTimeErr: current, changedValue: true })
        } else {
            const current = this.state.showTimeErr;
            current[key] = false;
            this.setState({ showTimeErr: current, changedValue: true });
        }
        return hrminutes;
    }

    /**
     * Setup the `beforeunload` event listener
     */
    handleBrowserClosed = () => {
        window.addEventListener("beforeunload", (e) => {
            e.preventDefault();
            remove_access_lock('shift', this.state.id);
        });
    };

    /**
     * fetching the current user details
     */
    get_current_user = () => {
        postData("schedule/ScheduleDashboard/get_current_admin_user_details", {}).then((res) => {
            if (res.status) {
                this.setState({
                    owner_person: (res.data) ? res.data : ''
                })
            }
        });
    }

    /**
     * fetching the shift statuses
     */
    get_shift_statuses = () => {
        postData("schedule/ScheduleDashboard/get_shift_statuses", {}).then((res) => {
            if (res.status) {
                this.setState({
                    status_options: (res.data) ? res.data : []
                })
            }
        });
    }

    /**
     * fetching the member details if the modal is opened in the edit mode
     */
    get_shift_details = (passid) => {
        //is_time_updated_from_details
        postData('schedule/ScheduleDashboard/get_shift_details', { id: passid, clone_id: this.props.clone_id, shift_lock: true }).then((result) => {
            if (result.status) {

                let scheduled_travel_duration = result.data.scheduled_travel_duration;
                if (scheduled_travel_duration && scheduled_travel_duration.indexOf(":") !== -1) {
                    let scheDuration = scheduled_travel_duration.split(":");
                    result.data.scheduled_travel_duration_hr = scheDuration[0];
                    result.data.scheduled_travel_duration_min = scheDuration[1];
                }
                let actual_travel_duration = result.data.actual_travel_duration;

                if (actual_travel_duration && actual_travel_duration.indexOf(":") !== -1) {
                    let actDuration = actual_travel_duration.split(":");
                    result.data.actual_travel_duration_hr = actDuration[0];
                    result.data.actual_travel_duration_min = actDuration[1];
                }
                this.setState(result.data,()=>{
                    let sch_start_date_input = moment(result.data.scheduled_start_date).format('DD/MM/YYYY');
                    let sch_end_date_input = moment(result.data.scheduled_end_date).format('DD/MM/YYYY');
                    let act_start_date_input = '';
                    let act_end_date_input = '';
                    if (!result.data.actual_start_date) {
                        act_start_date_input = '';
                    } else {
                        act_start_date_input = moment(result.data.actual_start_date).format('DD/MM/YYYY');
                    }

                    if (!result.data.actual_end_date) {
                        act_end_date_input = '';
                    } else {
                        act_end_date_input = moment(result.data.actual_end_date).format('DD/MM/YYYY');
                    }

                    this.setState({
                        scheduled_start_date_input: sch_start_date_input,
                        scheduled_end_date_input: sch_end_date_input,
                        actual_start_date_input: act_start_date_input,
                        actual_end_date_input: act_end_date_input
                    });
                });
                let is_ndis = false; 
                if (result.data.rolelabel === "NDIS") {
                    is_ndis = true; 
                }

                let is_support_mixed = false; 
                if (result.data.scheduled_support_type_key_name === "mixed") {
                    is_support_mixed = true;
                }

                this.setState({...result.data, is_ndis, is_support_mixed},()=>{ 
                    setTimeout(() => {
                        this.updateBreakOption('scheduled');
                        this.updateBreakOption('actual');
                    }, 1000);
                    if(this.state.status>3)
                    {
                        this.get_line_items_for_payment('support_type', this.state.actual_support_type, 'actual');
                    }
                });
                if (result.data.account_person) {
                    this.getAddress(result.data.account_person);
                    this.getContact(result.data.account_person, false, result.data.contact_person);
                    let account_person = result.data.account_person;
                    this.get_roster_option(account_person, result.data.roster_id);

                    if (this.props.clone_id) {
                        this.get_service_agreement(false, 'scheduled', true);
                    }
                }
                if (this.props.clone_id) {
                    this.setState({ shift_no: '' })
                }
                

                this.setState({is_time_updated_from_details:true})
            } else {
                if (result.error !== 'API ERROR') {
                    this.toastmsg(result.error, 'e');
                }
                this.props.closeModal();
            }
        });
    }

    /**
     * Update Line Item checked
     */
    updateSteaLineItemFalse = () => {
        this.setState({ updateStateLineItem: false });
    }

    delayOptionsLoad = () => {
        // A promise should be used here for asynchronous callbacks
        setTimeout(() => {
            this.setState({ isLoadingMenuItems: false });
        }, 1000);
    };

    /**
     * update type option if sleepover selected
     * @param {str} section 
     */
    updateBreakOption = (section) => {
        let data = this.state[section+'_rows'];
        let breaks = [...this.state.break_types];
        data.map((row, idx) => {

            let findIntrruptBreak = breaks.find(x => x.key_name === 'interrupted_sleepover');
            let intrruptBreakIndex = breaks.findIndex(x => x.key_name === 'interrupted_sleepover');
            if (findIntrruptBreak && intrruptBreakIndex > -1 && section === 'scheduled') {
                breaks[intrruptBreakIndex].disabled = true;
                breaks.splice(intrruptBreakIndex, 1);
            }

            // s/o 
            let findSleepBreak = breaks.find(x => x.key_name === 'sleepover');
            let findSleepBreakIdx = breaks.findIndex(x => x.key_name === 'sleepover');
            if (findSleepBreak && findSleepBreak.value) {
                let sleepValue = findSleepBreak.value;
                let sleepBreak = data.find(x => Number(x.break_type) === Number(sleepValue));
                let sleepBreakIndex = data.findIndex(x => Number(x.break_type) === Number(sleepValue));

                // disable or enable sleepover
                if (sleepBreakIndex > -1 && sleepBreakIndex !== idx) {
                    breaks[findSleepBreakIdx].disabled = true;
                } else {
                    breaks[findSleepBreakIdx].disabled = false;
                }
                if (section === 'actual') {
                    let findInSleepBreak = breaks.find(x => x.key_name === 'interrupted_sleepover');
                    let findInSleepBreakIdx = breaks.findIndex(x => x.key_name === 'interrupted_sleepover');
                    // disable or enable intrrepted sleepover
                    if (sleepBreak && sleepBreakIndex > -1 && Number(sleepBreakIndex) !== Number(idx)) {                        
                        // if interrupt s/o added
                        if (findInSleepBreak && findInSleepBreak.value) {
                            let inSleepValue = findInSleepBreak.value;
                            let inSleepBreak = data.find(x => Number(x.break_type) === Number(inSleepValue));
                            let inSleepBreakIndex = data.findIndex(x => Number(x.break_type) === Number(inSleepValue));
                            if (inSleepBreak && inSleepBreakIndex > -1 && Number(inSleepBreakIndex) !== Number(idx)) {
                                breaks[findInSleepBreakIdx].disabled = false;
                            } else {
                                if (Number(inSleepBreakIndex) !== Number(idx)) {
                                    breaks[findInSleepBreakIdx].disabled = false;
                                }                                
                            }
                        } else {
                            if (findInSleepBreakIdx > -1 ) {
                                breaks[findInSleepBreakIdx].disabled = false;
                            }
                        }                        
                    } else {
                        if (findInSleepBreakIdx > -1 ) {
                            breaks[findInSleepBreakIdx].disabled = true;
                        }                        
                    }
                }

                // if (sleepBreak && sleepBreakIndex > -1 && Number(sleepBreakIndex) !== Number(idx)) {
                //     breaks[findInSleepBreakIdx].disabled = false;
                // } else {
                //     breaks[findInSleepBreakIdx].disabled = true;
                // }
            }
            
            this.setState({
                [section+'_break_option_'+idx]: '' 
            },() => {
                this.setState({
                    [section+'_break_option_'+idx]: breaks
                });
            });
        });
    }


    /**
     * update duration option if sleepover selected
     * @param {str} section 
     */
     updateDurationField = (section, idx, e) => {
         // s/o 
        let breaks = this.state.break_types;
        let findSleepBreak = breaks.find(x => x.key_name === 'sleepover');

        if (findSleepBreak && findSleepBreak.value) {
            let sleepValue = findSleepBreak.value;
            let data = this.state[section+'_rows'];
            if (Number(e) === Number(sleepValue)) {                
                data[idx].duration_disabled = true;
                data[idx].break_duration = '';
                data[idx].timing_disabled = false;
            } else {
                data[idx].duration_disabled = false;                
            }

            this.setState({
                [section+'_rows']: data 
            });
        }

        // Interrupt sleepover
        let findInSleepBreak = breaks.find(x => x.key_name === 'interrupted_sleepover');
        if (findInSleepBreak && findInSleepBreak.value) {
            let inSleepValue = findInSleepBreak.value;
            let dataIn = this.state[section+'_rows'];
            if (Number(e) === Number(inSleepValue)) {                
                dataIn[idx].duration_disabled = true;
                dataIn[idx].break_duration = '';
                dataIn[idx].timing_disabled = false;
            } else {
                // dataIn[idx].duration_disabled = false;                
            }
            
            this.setState({
                [section+'_rows']: dataIn 
            });
        }
     }

    /**
     * Render Contact input field
     */
    renderContactField = () => {
        return (
            <div className="col-lg-6 col-sm-6">
                {this.renderComboBox('Contact', 'contact_person', 'contact_person_id')}
            </div>
        );
    }

    /**
     * Render To contacts
     * @param {str} label
     * @param {str} stateName - selection state
     * @param {str} valueName - value state
     */
    renderComboBox = (label, stateName, valueName) => {
        var contact_add_new_entity = [];
        if (this.state.allow_newcontact) {
            contact_add_new_entity = [
                {
                    id: 'contact-add-id-1',
                    icon: (
                        <Icon
                            assistiveText={{ label: 'Add' }}
                            category="utility"
                            size="x-small"
                            name="add"
                        />
                    ),
                    label: 'New Contact',
                    value: 'new_contact'
                },
            ];
        }
        return (
            <ComboList
                id="combobox_contact"
                classNameContainer="combox_box-to-cus-contact"
                events={{
                    onChange: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({ [valueName]: value, isLoadingMenuItems: true });
                    },
                    onRequestRemoveSelectedOption: (event, data) => {
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                        });
                    },
                    onBlur: (event, data, errors) => {
                        this.setError(errors, "combobox_contact")
                        this.setState({
                            [valueName]: '',
                        });
                    },
                    onSubmit: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({
                            [valueName]: '',
                            [stateName]: [
                                ...this.state[stateName],
                                {
                                    label: value,
                                    icon: (
                                        <Icon
                                            assistiveText="Account"
                                            category="standard"
                                            name="account"
                                        />
                                    ),
                                },
                            ],
                        });
                    },
                    onSelect: (event, data) => {
                        if (this.props.action) {
                            this.props.action('onSelect')(
                                event,
                                ...Object.keys(data).map((key) => data[key])
                            );
                        }
                        if (data.selection && data.selection[0] && data.selection[0].value === 'new_contact') {
                            this.setState({ openCreateContactModal: true });
                        } else {
                            let stErrors = this.state.errors;
                            if (data.selection) {
                                stErrors["combobox_contact"] = "";
                            }
                            this.setState({
                                [valueName]: '',
                                [stateName]: data.selection,
                                errors: stErrors
                            }, () => {
                                this.get_service_agreement(true, 'scheduled');
                                this.get_service_agreement(true, 'actual');
                                if(data.selection && data.selection.length > 0){
                                    this.getEmailAndPhoneByContact(data.selection[0].value);
                                }
                            });
                        }
                    },
                }}
                labels={{
                    label: '  ' + label,
                    placeholder: 'Search ' + label,
                }}
                menuItemVisibleLength={5}
                options={
                    comboboxFilterAndLimit(
                        this.state[valueName],
                        100,
                        this.state.contact_person_options,
                        this.state[stateName],
                    )
                }
                selection={this.state[stateName]}
                value={this.state[valueName]}
                optionsAddItem={contact_add_new_entity}
                name="shift_contact"
                disabled={this.state.account_person === '' || !this.state.account_person ? true : false}
                variant="inline-listbox"
                validate={{"data-validation-required" : true}}
                errorText={this.state.errors && this.state.errors["combobox_contact"]}
            />
        );
    }

    setIconForList(option) {
        return option.map((elem) => ({
            ...elem,
            ...{
                icon: (
                    <Icon
                        assistiveText={{ label: 'Account' }}
                        category="standard"
                        name={elem.type}
                    />
                ),
            },
        }));
    }


    /**
     * handling the change event of the data picker fields
     */
    datePickerCallBack (data) {
        this.setState({ [data.label]: data.value});
        this.handleChangeDatePickerCheck(data.value,'','', data.label);

    }

    /**
     * rendering general part of the schedule form
     */
    RenderGeneralSection() {
        return (
            <React.Fragment>
                <ExpandableSection
                    id="default-expandable-section"
                    title="General Information"
                >
                    <div className="container-fluid">
                        {this.props.id && (<div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >
                                        <abbr className="slds-required" title="required">* </abbr>Shift No:
                                </label>
                                    <div className="slds-form-element__control">
                                        {this.state.shift_no || ''}
                                    </div>
                                </div>
                            </div>
                        </div>)}
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <Lookup
                                    clearable={false}
                                    name="shift_account"
                                    disabled={this.state.account_disabled}
                                    cache={false}
                                    label="Account (Participant/Site) Name"
                                    id="shift_account"
                                    value={this.state.account_person}
                                    required
                                    loadOptions={e => getOptionsAccountPersonName(e, [])}
                                    onChange={e => {
                                        var new_contact = true;
                                        if (e && Number(e.account_type) === 1) {
                                            new_contact = false;
                                        }
                                        this.setState({ account_person: e, allow_newcontact: new_contact, changedValue: true, contact_email:'', contact_phone:'', errors: {}, warnings: {}, scheduled_mixed_support_type_error: '',  scheduled_support_type: '' }, () => { 
                                            this.getAddress(e); 
                                            this.getServiceType(e); 
                                            this.get_support_type(true); 
                                            this.get_service_agreement(true, 'scheduled'); 
                                            this.get_service_agreement(true, 'actual'); });
                                            this.get_roster_option(e);
                                            this.getContact(e, false);  
                                                                            
                                    }}
                                    onBlur={errors => {
                                            this.setError(errors, "shift_account");
                                            if (this.state.account_person) {
                                                let contact_errors = applyValidation("Contact", "data-validation-required", this.state.contact_person_id);
                                                this.setError(contact_errors, "combobox_contact");
                                                let address_errors = applyValidation("Account Address", "data-validation-required", this.state.account_address);
                                                this.setError(address_errors, "Address");
                                                let st_errors = applyValidation("Service Type", "data-validation-required", this.state.role_details);
                                                this.setError(st_errors, "Service Type");
                                            }
                                        }
                                    }
                                    validate={{"data-validation-required" : true}}
                                    placeholder="Please Search"
                                    optionComponent={GravatarOption}
                                    errorText={this.state.errors && this.state.errors.shift_account}
                                />
                            </div>
                            <div className="col-lg-6 col-sm-6">
                                <Lookup
                                    label="Owner"
                                    name="owner"
                                    id="owner"
                                    required={+this.state.status > 1 ? true : false}
                                    value={this.state.owner_person || ''}
                                    loadOptions={(e) => getOptionsStaff(e, [])}
                                    validate={{"data-validation-required" : true}}
                                    onChange={(e) => this.setState({ owner_person: e, changedValue: true })}
                                    onBlur={errors => {
                                        if (+this.state.status > 1) {
                                            this.setError(errors, "owner");
                                        }
                                        
                                    }}
                                    errorText={this.state.errors && this.state.errors.owner}
                                />
                            </div>
                        </div>
                        <div className="row py-2">

                            {this.renderContactField()}

                            <div className="col-lg-6 col-sm-6">
                                <SelectList
                                    label="Roster ID"
                                    options={this.state.roster_options}
                                    onChange={(value) => {
                                        this.handleChange(value, 'roster_id')
                                        this.setState({ changedValue: true });
                                        this.setRepeatOption(value);
                                    }}
                                    value={this.state.roster_id || ''}
                                    name="roster_id"
                                    id="roster_id"
                                    disabled={(this.state.account_person === '' || this.state.account_disabled === true) && this.state.show_roster === true ? true : false}
                                    errorText={this.state.errors && this.state.errors.roster_id}
                                />
                            </div>
                        </div>
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <Text
                                    label="Apartment/Unit number"
                                    name="unit_number"
                                    id="unit_number"
                                    onChange={(e) => handleChange(this, e)}
                                    value={this.state.unit_number || ''}
                                    maxLength="30"
                                    className="slds-input"
                                    disabled={true}
                                    errorText={this.state.errors && this.state.errors.unit_number}
                                />
                            </div>

                            <div className="col-lg-6 col-sm-6">
                                <SelectList
                                    label="Account Address"
                                    options={this.state.account_address_options}
                                    onChange={value => {
                                        this.handleChange(value, 'account_address')
                                        let st_errors = this.state.errors;
                                        let err = applyValidation("Account Address", "data-validation-required", value);
                                        if (err !== true) {
                                            st_errors["Address"] = err;
                                        } else {
                                            st_errors["Address"] = "";
                                        }
                                        this.setState({ changedValue: true, errors: {...st_errors} });
                                    }}
                                    value={this.state.account_address}
                                    required={true}
                                    disabled={this.state.account_person === '' ? true : false}
                                    name="Address"
                                    id="Address"
                                    errorText={this.state.errors && this.state.errors.Address}
                                />
                            </div>


                        </div>
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <SelectList 
                                    options={this.state.role_details_options}
                                    onChange={value => {
                                        let is_ndis = false; 
                                        this.state.role_details_options.map(option => {
                                            if (option.label === "NDIS" && value == option.value) {
                                                is_ndis = true; 
                                            }
                                        })
                                        this.handleChange(value, 'role_details')
                                        let st_errors = this.state.errors;
                                        let err = applyValidation("Service Type", "data-validation-required", value);
                                        if (err !== true) {
                                            st_errors["Service Type"] = err;
                                        } else {
                                            st_errors["Service Type"] = "";
                                        }
                                        this.setState({ changedValue: true, is_ndis, errors: {...st_errors} });                                         
                                    }}
                                    value={this.state.role_details}
                                    required={true}
                                    disabled={this.state.account_person === '' ? true : false}
                                    name="Service Type"
                                    errorText={this.state.errors && this.state.errors["Service Type"]}
                                />
                            </div>
                            <div className="col-lg-6 col-sm-6">
                                <TextArea
                                    label="Description"
                                    required={false}
                                    className="slds-textarea"
                                    name="description"
                                    id="description"
                                    placeholder="Description"
                                    onChange={(e) => {
                                        this.handleChange(e.target.value, "description")
                                        this.setState({ changedValue: true });
                                    }}
                                    value={this.state.description ? this.state.description : ''}
                                    errorText={this.state.errors && this.state.errors.description}
                                />
                            </div>
                        </div>

                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <SelectList
                                    options={this.state.status_options}
                                    onChange={(value) => {
                                        this.handleChange(value, 'status')
                                        this.setState({ changedValue: true });
                                    }}
                                    value={this.state.status || ''}
                                    required={true}
                                    name="Status"
                                    id="Status"
                                    errorText={this.state.errors && this.state.errors.Status}
                                />
                            </div>

                        </div>
                    </div>
                </ExpandableSection>
            </React.Fragment>
        )
    }

    isNumberKey(evt){
        alert();
        return false;
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            alert();
            return false;
        }
        return true;
    }
    

    /**
     * rendering sechedule timing part of the schedule form
     */
    RenderScheduleSection() {
        let sderror = this.state.errors && this.state.errors.scheduled_start_date || false;
        let ederror = this.state.errors && this.state.errors.scheduled_end_date || false;   
        let ss_error = this.state.errors && this.state.errors.scheduled_section || false;
        return (
            <React.Fragment>
                <ExpandableSection
                    id="default-expandable-section"
                    title="Scheduled Times"
                >
                    <div className="container-fluid">
                        <div className="row py-2">
                            <div className="col-sm-3">
                                <div className={classNames({"slds-form-element":true, "slds-has-error": !!sderror})}>
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        <abbr className="slds-required" title="required">* </abbr>Scheduled Start Date</label>
                                    <div className="slds-form-element__control">
                                        <div className="SLDS_date_picker_width" onKeyDown={(e) => {
                                            if (e.key === 'Tab') {

                                                const { current } = this.datepickers['scheduled_start_date'] || {}
                                                if (current && 'instanceRef' in current) {
                                                    current.instanceRef.setState({ isOpen: false });
                                                }
                                            }
                                        }}>                                                                                                                                  
                                        </div>
                                        <ReactDatePicker
                                            dateFormat={'dd/MM/yyyy'} 
                                            placeholder={'DD/MM/YYYY'}
                                            minDate={new Date()}
                                            minYear={new Date().getFullYear()}
                                            maxYear={new Date().getFullYear()+3}
                                            selected={this.state.scheduled_start_date}
                                            callBack={(e) =>this.datePickerCallBack(e)}
                                            name={'scheduled_start_date'}
                                    />
                                    </div>
                                    
                                </div>
                            </div>                            
                            <div className="col-sm-2 scheduled_start_time">
                            {this.state.is_time_updated_from_details&&(<CustomTimePicker 
                               inputId="scheduled_start_time"
                               labelId="scheduled_start_time-label"
                               name="scheduled_start_time"
                               label={"Start Time"}
                               onDateChange={(inputStr,date)=>{
                                this.handleTimepicker(date, inputStr, 'scheduled_start_time');
                                this.calcActiveDuration(1, "scheduled_start_time", inputStr);
                               }}
                               required={true}
                               strValue={this.state.scheduled_start_time}
                               errorText={this.state.errors && this.state.errors["scheduled_start_time"]}
                               onBlur={e => {this.setValidatedTime(e, 'scheduled_start_time', true, 1)}}
                             />)}
                            </div>
                            <div className="col-sm-3">
                                <div className={classNames({"slds-form-element":true, "slds-has-error": !!ederror})}>
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1"><abbr className="slds-required" title="required">* </abbr>Scheduled End Date</label>
                                    <div className="slds-form-element__control">
                                        <div className="SLDS_date_picker_width" onKeyDown={(e) => {
                                            if (e.key === 'Tab') {
                                                const { current } = this.datepickers['scheduled_end_date'] || {}
                                                if (current && 'instanceRef' in current) {
                                                    current.instanceRef.setState({ isOpen: false })
                                                }
                                            }
                                        }}>
                                        </div>
                                        <ReactDatePicker
                                        dateFormat={'dd/MM/yyyy'} 
                                        placeholder={'DD/MM/YYYY'}
                                        minDate={new Date()}
                                        minYear={new Date().getFullYear()}
                                        maxYear={new Date().getFullYear()+3}
                                        selected={this.state.scheduled_end_date}
                                        callBack={(e) =>this.datePickerCallBack(e)}
                                        name={'scheduled_end_date'}
                                    />
                                    {ederror && <Label errorText={ederror} text={ederror} />}
                                    </div>
                                    
                                </div>
                            </div>
                            <div className="col-sm-2 scheduled_end_time">
                            {this.state.is_time_updated_from_details&&( <CustomTimePicker 
                               inputId="scheduled_end_time"
                               labelId="scheduled_end_time-label"
                               name="scheduled_end_time"
                               label={"End Time"}
                               onDateChange={(inputStr,date)=>{
                                this.handleTimepicker(date, inputStr, 'scheduled_end_time');
                                this.calcActiveDuration(1, "scheduled_end_time", inputStr);
                               }}
                               required={true}
                               strValue={this.state.scheduled_end_time}
                               errorText={this.state.errors && this.state.errors["scheduled_end_time"]}
                               onBlur={e => {this.setValidatedTime(e, 'scheduled_end_time', true, 1)}}
                             />)}
                             
                            </div>
                            <div className="col-sm-2">
                                <Text
                                    label="Duration"
                                    name="scheduled_duration"
                                    id="scheduled_duration"
                                    disabled={true}
                                    placeholder="HH:MM"
                                    value={this.state.scheduled_duration || ''}
                                    maxlength="6"
                                    hasError={this.state.errors && this.state.errors["scheduled_duration"]}
                                />
                            </div>
                        </div>
                        {
                            sderror && <div className="row">
                                <Label errorText={sderror} text={sderror} />
                            </div>
                        }
                        {
                            ss_error && <div className="row">
                                <Label errorText={true} text={ss_error} />
                            </div>
                        }
                        {(this.state.scheduled_rows.length > 0) ?
                            this.state.scheduled_rows.map((row, idx) => {
                                return (
                                    <div className="row py-2">
                                        <div className="col-sm-3">
                                            <label className="slds-form-element__label" htmlFor="select-01">
                                                <abbr class="slds-required" title="required">* </abbr>Break/Sleepover - {(idx + 1)}
                                            </label>
                                            <div className="slds-form-element">
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className={"SLDS_custom_Select default_validation slds-select scheduled_break_type_"+idx}
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        required={true}
                                                        id={'scheduled_break_type_' + idx}
                                                        name={'scheduled_break_type_' + idx}
                                                        options={this.state['scheduled_break_option_'+idx]}
                                                        onChange={(e) => {
                                                            handleShareholderNameChangeShift(this, 'scheduled_rows', idx, 'break_type', e)
                                                            this.setState({ changedValue: true });
                                                            //Reset line items
                                                            this.resetLineitems('scheduled');
                                                            let btype = null;
                                                            this.state.break_types.map(bt => {
                                                                if (bt.label.toLowerCase() === "sleepover") {
                                                                    btype = true;
                                                                }
                                                                if (btype === true) {
                                                                    this.setError("", "scheduled_section");
                                                                }
                                                            })
                                                            // update duration
                                                            this.updateDurationField('scheduled', idx, e);
                                                        }}
                                                        value={row.break_type}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="slds-form-element">
                                                <div className="slds-form-element__control timepickerselected scheduled_break_start_time" onBlur={(e) => this.setBreakTime(e, 'scheduled_rows', 'break_start_time', idx, '', this)}>
                        {this.state.is_time_updated_from_details&&(<CustomTimePicker 
                                        inputId={'sch_break_start_time_' + idx}
                                        labelId="scheduled_start_time-label"
                                        name={'sch_break_start_time_' + idx}
                                        label={"Start Time"}
                                        onDateChange={( inputStr) => {
                                         handleShareholderNameChangeShift(this, 'scheduled_rows', idx, 'break_start_time', inputStr).then(status => {
                                         if (status && this.state.scheduled_rows[idx]["break_start_time"] && this.state.scheduled_rows[idx]["break_end_time"]) {
                                                 this.onSubmit(null, true);
                                         }
                                         })
                                         this.setState({ changedValue: true });
                                        }}
                                         strValue={row.break_start_time}
                                         required={false}
                                         disabled={row.timing_disabled}
                                     />)}
                                    </div>
                                     </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="slds-form-element">
                                                <div className="slds-form-element__control timepickerselected scheduled_break_end_time" onBlur={(e) => this.setBreakTime(e, 'scheduled_rows', 'break_end_time', idx, '', this)}>
                                 {this.state.is_time_updated_from_details&&(<CustomTimePicker 
                                                     id={'sch_break_end_time_' + idx}
                                                     labelId="scheduled_end_time-label"
                                                     name={'sch_break_end_time_' + idx}
                                                     label={"End Time"}
                                                     required={false}
                                                     disabled={row.timing_disabled}
                                                      onDateChange={(inputStr) => {
                                                      handleShareholderNameChangeShift(this, 'scheduled_rows', idx, 'break_end_time', inputStr).then(status => {
                                                          this.onSubmit(null, true);
                                                      })
                                                      this.setState({ changedValue: true });
                                                  }
                                                  }
                                                    strValue={row.break_end_time}
                                          
                                                   />)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-2">
                                            <Text
                                                label="Duration"
                                                name="break_duration"
                                                id="break_duration"
                                                disabled={row.duration_disabled}
                                                placeholder="HH:MM"
                                                onChange={(e) => {
                                                    this.setState({ changedValue: true });
                                                    handleShareholderNameChangeShift(this, 'scheduled_rows', idx, 'break_duration', e.target.value).then((status) => {
                                                        if (status) {
                                                            this.onSubmit(null, true)
                                                        }
                                                    })
                                                }}
                                                onBlur={(e) => this.get_support_type_ndis_duration('scheduled')}
                                                value={row.break_duration || ''}
                                                maxLength="6"
                                                data-msg-number="Please enter valid number"
                                                errorText={this.state.errors["break_duration"]}
                                            />
                                        </div>
                                        <div className="col-sm-1 pt-4">
                                            {idx >= 0 ? <Button
                                                category="reset"
                                                iconSize="large"
                                                iconName="delete"
                                                title="Remove break"
                                                variant="icon"
                                                iconClassName={`slds-button__icon_delete`}
                                                onClick={() => this.removeRow(idx)}
                                            /> : ''}
                                        </div>
                                    </div>
                                )
                            }) : ''}                        
                        {this.state.errors &&  this.state.errors["scheduled_breaks"] || ""}
                        <div className="row">
                            <div className="col-sm-9">&nbsp;</div>
                            <div className="col-sm-3">
                                <Button
                                    category="reset"
                                    iconSize="medium"
                                    iconName="new"
                                    label="Add a break"
                                    className="scheduled_break_btn"
                                    onClick={() => this.addRow()}
                                />
                            </div>
                        </div>
                        <label className="slds-form-element__label">Allowances and Reimbursements</label>
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <Text
                                    type="tel"
                                    label="Travel Allowance (KMs)"
                                    name="scheduled_travel"
                                    id="scheduled_travel"
                                    placeholder="KMs"
                                    pattern="[0-9]+"
                                    onKeyPress={ (e) =>{return this.isNumberKey(e)}}
                                    onChange={(e) => {
                                        let rgx = /^[0-9]*\.?[0-9]*$/;
                                        if (e.target.value.match(rgx)) {
                                            handleChange(this, e);
                                            this.setState({ changedValue: true });
                                        }                                        
                                    }}
                                    value={this.state.scheduled_travel || ''}
                                    validate={{"data-validation-maxlength" : 6, "data-msg-number": "Please enter valid number"}}                                    
                                    maxLength="6"
                                    errorText={this.state.errors["scheduled_travel"]}
                                />
                            </div>

                            <div className="col-lg-6 col-sm-6">
                                <Text
                                    label="Reimbursements ($)"
                                    name="scheduled_reimbursement"
                                    id="scheduled_reimbursement"
                                    placeholder="Reimbursements (in $)"
                                    onChange={(e) => {
                                        this.setState({ changedValue: true });
                                        if (!isNaN(e.target.value)) {
                                            handleDecimalChange(this, e);
                                        }
                                    }}
                                    maxLength="9"
                                    value={this.state.scheduled_reimbursement || ''}
                                    errorText={this.state.errors && this.state.errors["scheduled_reimbursement"]}
                                />
                            </div>
                        </div>
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >Commuting Travel Allowance (Distance KMs)</label>
                                    <div className="slds-form-element__control">
                                        <input type="text"
                                            name="scheduled_travel_distance"
                                            id="scheduled_travel_distance"
                                            placeholder="KMs"
                                            onChange={(e) => {
                                                var regx = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
                                                if (regx.test(e.target.value) === true || e.target.value === '') {
                                                    handleChange(this, e)
                                                    this.setState({ changedValue: true });
                                                }
                                            }}
                                            value={this.state.scheduled_travel_distance || ''}
                                            data-msg-number="Please enter valid number"
                                            className="slds-input" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >Commuting Travel Allowance (Duration HH:MM)</label>
                                    <div className="slds-form-element__control">
                                        <div className="col-lg-3 col-sm-3">
                                            <input type="text"
                                                name="scheduled_travel_duration_hr"
                                                id="scheduled_travel_duration_hr"
                                                placeholder="HH"
                                                onChange={(e) => {
                                                    var regx = /^([0-1]?[0-9]|2[0-4])$/;
                                                    if (regx.test(e.target.value) === true || e.target.value === '') {
                                                        handleChange(this, e)
                                                        this.setState({ changedValue: true });
                                                    }
                                                }}

                                                onBlur={(e) => this.handleOnBlur(e, 'scheduled_travel_duration_hr')}
                                                value={this.state.scheduled_travel_duration_hr || ''}
                                                data-msg-number="Please enter valid number"
                                                className="slds-input" />

                                        </div>
                                        <div className="col-lg-1 col-sm-1" style={{ paddingTop: "7px" }}>:</div>
                                        <div className="col-lg-3 col-sm-3">
                                            <input type="text"
                                                name="scheduled_travel_duration_min"
                                                placeholder="MM"
                                                onChange={(e) => {
                                                    var regx = /^[0-5]?[0-9]$/;
                                                    if (regx.test(e.target.value) === true || e.target.value === '') {
                                                        handleChange(this, e)
                                                        this.setState({ changedValue: true });
                                                    }
                                                }}
                                                onBlur={(e) => this.handleOnBlur(e, 'scheduled_travel_duration_min')}
                                                value={this.state.scheduled_travel_duration_min || ''}
                                                data-msg-number="Please enter valid number"
                                                className="slds-input" />
                                        </div>                                        
                                    </div>
                                </div>                                
                            </div>
                        </div>
                        {
                            this.state.errors && this.state.errors["scheduled_travel_duration_hr"] && <p><Label errorText={true} text={this.state.errors["scheduled_travel_duration_hr"]} /></p>
                        }
                        {
                            this.state.errors && this.state.errors["scheduled_travel_duration_min"] && <p><Label errorText={true} text={this.state.errors["scheduled_travel_duration_min"]} /></p>
                        }
                        {
                            this.state.errors && this.state.errors["scheduled_allowances"] && <Row>
                                <Label errorText={true} text={this.state.errors["scheduled_allowances"]} />
                            </Row>
                        }
                    </div>
                </ExpandableSection>
            </React.Fragment>
        )
    }

    /**
     * Onchange handle line items
     */
    onChangeLineItem = (selection) => {
        this.setState({ sa_line_items: selection });
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
     determineColumns() {
        return [
            {
                _label: 'Support Item Code',
                accessor: "line_item_number",
                width: 200,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="line_item_code">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Support Item Name',
                accessor: "line_item_name",
                width: 300,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="line_item_name">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Units',
                accessor: "duration",
                width: 75,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Rate',
                accessor: "amount",
                width: 100,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (props.original.line_item_price_id) {
                        return (
                            <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
                        );    
                    } else {                        
                        let pop_msg = 'Rate will be available once the new price list covering the selected date range is imported';
                        let btn = <Button
                        assistiveText={{ icon: 'Icon Info' }}
                        iconCategory="utility"
                        iconClassName="btn-icon-err"
                        iconName="date_input"
                        iconSize="small"
                        iconVariant="bare"
                        variant="icon"
                        style={{'fill':'red'}}
                        />
                        
                        if (props.original.amount) {
                            pop_msg = 'This denotes old rate. Rate will be updated upon the import of new price list';
                            btn = <Button
                            assistiveText={{ icon: 'Icon Info' }}
                            style={{'fill':'red', 'background-color': 'transparent', 'color': 'red', 'border': 'none', 'padding': '0'}}
                            label={defaultSpaceInTable(props.value)}
                            />                            
                        }
                        return(
                            <div>
                                <Popover
                                    align="top right"
                                    body={
                                        <div>
                                            <p className="slds-p-bottom_x-small">{pop_msg}</p>
                                        </div>
                                    }
                                    heading="Missing Rate"
                                    id="popover-error"
                                    variant="warning"
                                    className="slds-cus-popover-heading slds-popover-wrap"
                                    {...this.props}
                                >
                                    {btn}
                                </Popover>
                            </div>
                        );
                    }
                }
            },
            {
                _label: 'Sub Total',
                accessor: "sub_total_raw",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
        ]
    }

    /**
     * Render NDIS Table line item
     */
    renderNDISPaymentList(index) {
        let ndis_line_item_list = this.state[index + '_ndis_line_item_list'];
        const displayedColumns = this.determineColumns();

        let auto_insert_flag = false;
        let missing_items = [];
        let total_amount = 0;
        let line_item_price = true;
        if (ndis_line_item_list.length > 0) {
            ndis_line_item_list.map((item_value, in_val) => {
                auto_insert_flag = (item_value.auto_insert_flag === true || item_value.auto_insert_flag === "1") ? true : auto_insert_flag;
                if (item_value.auto_insert_flag === true || item_value.auto_insert_flag === "1") {
                    missing_items.push(<p className="slds-p-bottom_x-small">{item_value.line_item_value}</p>);
                }
                if (item_value.sub_total != null) {    
                    //If amount has comma then remove and then add value                                                
                    total_amount = total_amount + parseFloat(item_value.sub_total);
                }
                if (!item_value.line_item_price_id  && index === 'actual') {
                    line_item_price = false;
                }                
            });
            
            if (!line_item_price) {
                total_amount = 0;
            }
        }

        return (
            <React.Fragment>
                <SLDSReactTable
                    PaginationComponent={() => false}
                    ref={this.reactTable}
                    manual="true"
                    columns={displayedColumns}
                    data={ndis_line_item_list}
                    defaultPageSize={10}
                    minRows={1}
                    className={'shift_ndis_prie_list'}
                    getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles ' })}
                    onPageSizeChange={this.onPageSizeChange}
                    noDataText="No records Found"
                    collapseOnDataChange={true} 
                    resizable={false} 
                />
                <div className="row">
                    <div className="col-sm-8">
                        {auto_insert_flag === true ?
                            (<div className="slds-form-element__label">
                                <Popover
                                    align="top left"
                                    body={
                                        <div>
                                            {missing_items}
                                        </div>
                                    }
                                    heading="Missing Support items"
                                    id="popover-error"
                                    variant="error"
                                    className="slds-cus-popover-heading"
                                    {...this.props}
                                >
                                    <Button
                                        assistiveText={{ icon: 'Icon Info' }}
                                        iconCategory="utility"
                                        iconName="info"
                                        iconSize="small"
                                        iconVariant="bare"
                                        variant="icon"
                                    />
                                </Popover>
                                <Label warningText={true} text="One (or) more support items listed here are not found in plan" />
                            </div>)
                            : <React.Fragment />}
                    </div>
                    <div className="col-sm-4">
                        <div className="row py-2">
                            <div className="col-sm-5 pt-1">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    Shift Cost ($)</label>
                            </div>
                            <div className="col-sm-6">
                                <input
                                    className="slds-input ndis-shift-cost"
                                    placeholder="0.00"
                                    type="text"
                                    name={"shift_cost_" + index}
                                    id={"shift_cost_" + index}
                                    maxLength={10}
                                    value={total_amount.toFixed(2)}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    /**
     * Render NDIS
     */
    renderNDISPayment(index) {
        let account_person = this.state.account_person;
        let account_type = 0;
        let auto_insert_flag = false;
        let missing_items = [];
        let total_amount = 0;
        if (account_person && account_person.account_type) {
            account_type = account_person.account_type;
        }
        let is_ndis = this.state.is_ndis; 
        if (Number(account_type) !== 1 || !is_ndis) { 
            return <React.Fragment /> 
        } 
        let docusign_id = this.state[index + '_docusign_id'];
        let docusign_url = this.state[index + '_docusign_url'];
        let docusign_related = this.state[index + '_docusign_related'];
        let support_type = this.state[index + '_support_type'];
        let ndis_line_item_list = this.state[index + '_ndis_line_item_list'];
        let sdwarning = this.state.warnings && this.state.warnings[index] || false;
        let allsd = sdwarning && Object.keys(sdwarning).map(key => {
            return (
                <Label warningText={sdwarning[key]} text={sdwarning[key]} />
            )
        })
        if (!docusign_id) {
            allsd = <Label warningText={true} text="No Service Agreement exists for the requested shift date" />;
        }
        let exp_key = `open_${index}_ndis`;
        return (
            <React.Fragment>
                <ExpandableSection
                    id={`"ndis-payments-${index}`}
                    title="NDIS Payments"
                    isOpen={this.state[exp_key]}
                    onToggleOpen={(event, data) => {
						this.setState({ [exp_key]: !this.state[exp_key] });
					}}
                >
                    <div className="container-fluid">
                        <div className="row py-2">
                            <div className="col-sm-2">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    Service Agreement</label>
                            </div>
                            <div className="col-sm-8">
                                {
                                    docusign_id ?
                                        <a style={{ color: '#0070d2' }} className="reset" title="View/download contract" target="_blank" href={docusign_url}>{docusign_related}</a>
                                        :
                                        ""
                                }
                                {allsd}
                            </div>
                        </div>                        
                        {
                            this.state.errors[index+"_ndis_sa"] && <Label errorText={true} text={this.state.errors[index+"_ndis_sa"]} />
                        }
                        
                        <div className="row py-2">
                            <div className="col-sm-12">
                                <div className="col-sm-6">
                                    <SelectList
                                        label="Support Type"
                                        disabled={index === 'actual' ? true : false}
                                        options={this.state.support_type_options}
                                        onChange={(value) => {
                                            this.handleChange(value, 'support_type', index);
                                            let is_support_mixed = false; 
                                            this.state.support_type_options.map(option => {
                                                if (option.key_name === "mixed" && value == option.value) {
                                                    is_support_mixed = true; 
                                                    this.setState({is_support_mixed : true})
                                                }else{
                                                    this.setState({is_support_mixed : false})
                                                }
                                            })
                                            if (is_support_mixed) {
                                                this.get_support_type_ndis_duration(index);                                                                                             
                                            }
                                            this.setState({ changedValue: true, is_support_mixed: is_support_mixed });
                                        }}
                                        value={support_type || ''}
                                        name={index + "_support_type"}
                                        id={index + "_support_type"}
                                        required={true}
                                        errorText={this.state.errors && this.state.errors[index + "_support_type"]}
                                        warningText={this.state.warnings && this.state.warnings[index + "_support_type"]}
                                        />
                                        {this.state.is_support_mixed && <Label errorText={true} text={this.state[index+"_mixed_support_type_error"]} />}
                                </div>
                                <div className="col-sm-12">
                                    {
                                        this.state.errors[index+"_ndis"] && <Label errorText={true} text={this.state.errors[index+"_ndis"]} />
                                    }
                                </div>
                            </div>
                            {/* <div className="col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        Line Item</label>
                                    <div className="slds-form-element__control">
                                        <div className={index + "_ndis_line_item_list ndis_line_item-shift p-1"}>
                                            {(ndis_line_item_list.length > 0) ?

                                            ndis_line_item_list.map((item_value, in_val) => {
                                                auto_insert_flag = (item_value.auto_insert_flag === true || item_value.auto_insert_flag === "1") ? true : auto_insert_flag;
                                                if (item_value.auto_insert_flag === true || item_value.auto_insert_flag === "1") {
                                                    missing_items.push(<p className="slds-p-bottom_x-small">{item_value.line_item_value}</p>);
                                                }
                                                if (item_value.sub_total != null) {    
                                                    //If amount has comma then remove and then add value                                                
                                                    total_amount = total_amount + parseFloat(item_value.sub_total);
                                                }
                                                                                                
                                                return (
                                                    <div className="row mb-1">
                                                        <div className="col-sm-1">
                                                            <Icon
                                                                assistiveText="Account"
                                                                category="utility"
                                                                name="file"
                                                                size="xx-small"
                                                            />
                                                        </div>
                                                        <div className="col-sm-10">
                                                            <p className={index+"_ndis_line_item_"+in_val}>
                                                                {item_value.line_item_value}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    )
                                                }) : ''
                                            }

                                        </div>
                                    </div>
                                    {auto_insert_flag === true ?
                                        (<div className="slds-form-element__label">
                                            <Popover
                                                align="top left"
                                                body={
                                                    <div>
                                                        {missing_items}
                                                    </div>
                                                }
                                                heading="Missing Support items"
                                                id="popover-error"
                                                variant="error"
                                                className="slds-cus-popover-heading"
                                                {...this.props}
                                            >
                                                <Button
                                                    assistiveText={{ icon: 'Icon Info' }}
                                                    iconCategory="utility"
                                                    iconName="info"
                                                    iconSize="small"
                                                    iconVariant="bare"
                                                    variant="icon"
                                                />
                                            </Popover>
                                            <Label warningText={true} text="One (or) more support items listed here are not found in plan" />
                                        </div>)
                                        : <React.Fragment />}
                                </div>
                            </div> */}
                        </div>
                        {/* <div className="row py-2">
                            <div className="col-sm-6">
                            </div>
                            <div className="col-sm-6">
                                <div className="row py-2">
                                    <div className="col-sm-3 pt-1">
                                        <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                            Shift Cost ($)</label>
                                    </div>
                                    <div className="col-sm-6">
                                        <input
                                            className="slds-input ndis-shift-cost"
                                            placeholder="0.00"
                                            type="text"
                                            name={"shift_cost_" + index}
                                            maxLength={10}
                                            value={total_amount.toFixed(2)}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>*/}
                        {this.renderSupportDuration(index)}
                        <div className="col-sm-6 py-2">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    Line Item</label>
                            </div>
                        </div>
                        {this.renderNDISPaymentList(index)}
                        {
                            this.state.errors[index+"_ndis_list"] && <Label errorText={true} text={this.state.errors[index+"_ndis_list"]} />
                        }
                    </div>
                </ExpandableSection>
            </React.Fragment>
        );
    }

    /**
     * Render Support Duration if support type is mixed
     * @param {str} index
     */
    renderSupportDuration = (index) => {
        let mixedType = this.state.support_type_options;
        let support_type = this.state[index + '_support_type'];
        let support_type_duration = this.state[index + '_support_type_duration'];
        let support_type_duration_error = this.state[index + '_st_duration_error'];
        let findMixedTypeIndex = mixedType.findIndex(x => x.key_name === 'mixed');
        let findMixedType = '';
        if (mixedType && mixedType[findMixedTypeIndex]) {
            findMixedType = mixedType[findMixedTypeIndex].value;
        }

        if (findMixedType === support_type && support_type_duration) {
            let durationContent = [];
            support_type_duration.map((sup_dur, idx) => {
                let duration = sup_dur.duration;
                let day_count = sup_dur.day_count;
                let durationContentTemp = this.renderDuration(duration, index, idx, day_count, sup_dur.day);
                let tempDiv = (
                    <div>
                        <div className="row py-2">
                            {day_count > 0 &&
                                <div className="col-sm-3">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    {sup_dur.required && <abbr className="slds-required" title="required">* </abbr> }
                                    {sup_dur.label}</label>
                                </div>
                            }
                            {durationContentTemp}
                        </div>
                        <div className="row">
                            {sup_dur.error && <Label errorText={true} text={sup_dur.errorTxt} />}
                        </div>
                    </div>
                );
                durationContent.push(tempDiv);
            });
            return (
                <React.Fragment>                    
                    {durationContent}
                    {support_type_duration_error.error && <div className="row"><Label errorText={true} text={support_type_duration_error.errorTxt} /></div>}
                </React.Fragment>
            );
        }
        return <React.Fragment />;
    }

    /**
     * Render Support type input duration
     * @param {array} support_type_duration 
     * @param {str} index 
     * @param {str} p_index (Parent Index)
     * @returns 
     */
    renderDuration = (support_type_duration, section, p_index, day_count, day) => {
        let durationContent = [];
        support_type_duration.map((sup_dur, idx) => {
            let label = '';
            if (Number(sup_dur.support_type) === 1) {
                label = 'Self Care';
            } else {
                label = 'Comm Access';
            }
            let tempDiv = (
                <div className={day_count > 0 ? "col col-sm-4" : "col col-sm-6"}>
                    <Text
                        label={label +" Duration (hh:mm)"}
                        name={section + "_support_type_duration_"+p_index+"_"+idx}
                        id={section + "_support_type_duration_"+p_index+"_"+idx}
                        value={sup_dur.duration || ''}
                        placeholder="HH:MM"
                        onChange={(e) => {
                            this.setState({ changedValue: true });
                            let value = e.target.value;
                            var regex=/[0-9:]/;                            
                            this.supportDurationUpdate(this, section+'_support_type_duration', idx, 'duration', value, p_index).then((status) => {
                            })
                        }}
                        value={sup_dur.duration || ''}
                        maxLength="5"
                        required={this.state[section+'_duration'] && this.state[section+'_duration'] != '00:00' && sup_dur.required ? true : false}
                        data-msg-number="Please enter valid number"
                        onBlur={(e) => {
                            this.supportDurationFormat(this, section+'_support_type_duration', idx, 'duration', section, true, true, false, day);
                        }}
                    />
                    {sup_dur.error && <Label errorText={true} text={sup_dur.errorTxt} />}
                </div>
            );
            durationContent.push(tempDiv);
        });

        return durationContent;
    }

    /**
     * Support type duration format
     * @param {object} obj 
     * @param {str} stateName - state variable name
     * @param {int} idx - index of array
     * @param {str} fieldName - child index name
     * @param {str} section - section str
     * @param {boolean} apiCall - used to call the line item api if true
     * @param {int} p_index - parent index
     * @returns 
     */
    supportDurationFormat = (obj, stateName, idx, fieldName, section, apiCall, day_focus, save_error, day) => {
        let error = false;
        let support_type_duration = this.state[stateName];
        let duration = this.state[section+'_duration'] || '';
        let support_type = this.state[section+'_support_type'] || '';
        let support_type_duration_error = this.state[section + '_st_duration_error'];
        support_type_duration_error.error = false;
        support_type_duration_error.errorTxt = '';
        let total_duration = 0;
        let self_care = [];
        let comm_access = [];
        let se_in = 0;
        let com_in = 0;

        support_type_duration.map((sup_dur, p_idx) => {
            let durationIn = sup_dur.duration;
            let duration_min = Number(sup_dur.duration_min);
            let total_day_duration = 0;
            let day_error = false;
            let required_error = [];
            let req_err_in = 0;
            let day_count = Number(sup_dur.day_count);
            let duration_break_count = Number(sup_dur.duration_break_count);
            
            if ((day_focus && day === sup_dur.day) || save_error) {                
                sup_dur.error = false;
                sup_dur.errorTxt ='';
                durationIn.map((dur, idx) => {
                    dur.error = false;
                    dur.errorTxt ='';
                    let timeValue = dur.duration || '';
                    if(timeValue != "" && timeValue.indexOf(":") > 0)
                    {
                        let sHours = timeValue.split(':')[0];
                        let sMinutes = timeValue.split(':')[1];
                        let minute = parseInt(sHours) * 60;

                        if(parseInt(sHours) == 0 || sHours.length === 0)
                            sHours = "00";
                        
                        if (sHours <10 && sHours.length === 1)
                            sHours = "0"+sHours;

                        if(parseInt(sMinutes) == 0 || sMinutes.length === 0)
                            sMinutes = "00";
                        
                        if (sMinutes <10 && sMinutes.length === 1)
                            sMinutes = "0"+sMinutes;

                        timeValue = sHours + ":" + sMinutes;
                        dur.duration = timeValue;
                        let isValid_dur = /^\d?\d:\d{2}$/.test(timeValue);
                        if (isValid_dur) {
                            dur.error = false;
                            dur.errorTxt = '';
                        }

                        if (timeValue === '00:00' && day_count < 1) {
                            error = true;
                            dur.error = true;
                            dur.errorTxt = 'Duration must be greater than 00:00';
                        }

                        total_day_duration = total_day_duration+ (minute+parseInt(sMinutes));
                        total_duration = total_duration + (minute+parseInt(sMinutes));
                    } else {
                        let isValid = /^\d?\d:\d{2}$/.test(timeValue);
                        if (timeValue ==='' && day_count < 1) {
                            day_error = true;
                            error = true;
                            dur.error = true;
                            dur.errorTxt = 'Please enter duration (hh:mm)';
                        } else if (timeValue === '' && day_count > 0) {
                            required_error[req_err_in++] = true;
                        } else 
                        if (!isValid && timeValue !='' ) {
                            day_error = true;
                            error = true;
                            dur.error = true;
                            dur.errorTxt = 'Provide valid duration (hh:mm)';
                        } else {
                            day_error = false;
                            dur.error = false;
                            dur.errorTxt = '';
                        }                
                    }

                });
            } else {
                day_error = true;
                if (sup_dur.error) {
                    error = true;
                }
                durationIn.map((dur, idx) => {
                    dur.error = false;
                    dur.errorTxt ='';
                    let timeValue = dur.duration || '';
                    if(timeValue != "" && timeValue.indexOf(":") > 0)
                    {
                        let sHours = timeValue.split(':')[0];
                        let sMinutes = timeValue.split(':')[1];
                        let minute = parseInt(sHours) * 60;

                        if(parseInt(sHours) == 0 || sHours.length === 0)
                            sHours = "00";
                        
                        if (sHours <10 && sHours.length === 1)
                            sHours = "0"+sHours;

                        if(parseInt(sMinutes) == 0 || sMinutes.length === 0)
                            sMinutes = "00";
                        
                        if (sMinutes <10 && sMinutes.length === 1)
                            sMinutes = "0"+sMinutes;

                        total_day_duration = total_day_duration+ (minute+parseInt(sMinutes));
                        total_duration = total_duration + (minute+parseInt(sMinutes));
                    }
                });
            }

            // Self Care Duration’ (or) ‘Comm Access Duration is mandatory for a day
            if (required_error && required_error.length > 1) {
                error = true;
                sup_dur.error = true;
                sup_dur.errorTxt = 'Either the ‘Self Care Duration’ (or) ‘Comm Access Duration’ is Mandatory';
            } 
            // Per day active duration validation
            else 
            if (total_day_duration !== duration_min && day_error === false && day_count > 0 && duration_break_count < 1) {
                error = true;
                sup_dur.error = true;
                sup_dur.errorTxt = 'The specified duration for Self Care/Comm Access on '+sup_dur.day_label+' should be equal to '+sup_dur.duration_time;
            } else 
            if (total_day_duration > duration_min && day_error === false && day_count > 0 && duration_break_count > 0) {
                error = true;
                sup_dur.error = true;
                sup_dur.errorTxt = 'The specified duration for Self Care/Comm Access on '+sup_dur.day_label+' should not be more than '+sup_dur.duration_time;
            }
        });
        
        if (support_type_duration && support_type_duration.length > 0) {            
            support_type_duration.map((sup_dur, p_idx) => {
                let durationIn = sup_dur.duration;
                durationIn.map((dur, idx) => {
                    if (dur.error) {
                        error = true;
                    }
                    let timeValue = dur.duration || '';
                    if ((dur.error === false && Number(dur.support_type) === 1 ) && (timeValue === '00:00' || timeValue === '' || timeValue.indexOf(":") < 1)) {
                        let finSelfIn = self_care.findIndex(x => x === sup_dur.day_label);
                        if (finSelfIn < 0) {
                            self_care[se_in++] = sup_dur.day_label;
                        }
                        
                    }

                    if ((dur.error === false && Number(dur.support_type) === 2 ) && (timeValue === '00:00' || timeValue === '' || timeValue.indexOf(":") < 1)) {
                        let finCAIn = comm_access.findIndex(x => x === sup_dur.day_label);
                        if (finCAIn < 0) {
                            comm_access[com_in++] = sup_dur.day_label;
                        }
                    }
                });
            });

            // Both self care and comm access is mandatory 
            if (self_care.length > 1 && comm_access.length > 1  && error === false && (day_focus || save_error)) {
                error = true;
                support_type_duration_error.error = true;
                support_type_duration_error.errorTxt = 'The duration for both Self Care and Comm Access is specified at least in any one of the days';
            } else 
            if (self_care.length < 1 && comm_access.length > 1 && error === false) {
                let labelCAJoin = comm_access.join(' or ');
                error = true;
                support_type_duration_error.error = true;
                support_type_duration_error.errorTxt = 'Please specify Comm Access duration for '+labelCAJoin;
            } else if (comm_access.length < 1 && self_care.length > 1 && error === false) {
                let labelSelfJoin = self_care.join(' or ');
                error = true;
                support_type_duration_error.error = true;
                support_type_duration_error.errorTxt = 'Please specify Self Care duration for '+labelSelfJoin;
            }
        }

        // Compare duration
        if(duration != "" && duration.indexOf(":") > 0 && error === false)
        {
            let dHours = duration.split(':')[0];
            let dMinutes = duration.split(':')[1];
            let min = parseInt(dHours) * 60;
            let duration_min = (min + parseInt(dMinutes));
            if (( ((duration_min > total_duration || duration_min < total_duration) && total_duration > 0) && (support_type_duration.length === 0 || (support_type_duration && support_type_duration.length > 0 && self_care.length < 2 && comm_access.length < 2 && total_duration > 0) )  )) {
                error = true;
                support_type_duration_error.error = true;
                support_type_duration_error.errorTxt = 'The entered support type duration doesn’t match the total active duration. Please enter the correct values';
            }
        } else {
            if (total_duration > 0 && error === false) {
                error = true;
                support_type_duration_error.error = true;
                support_type_duration_error.errorTxt = 'The entered support type duration doesn’t match the total active duration. Please enter the correct values';
            }       
        }

        obj.setState({ [stateName]: support_type_duration, [section + '_st_duration_error']: support_type_duration_error }, () =>{
            if(apiCall) {
                this.get_line_items_for_payment('support_type', support_type, section, false, day_focus, save_error, day);
            }
        });
        return error;
    }

    /**
     * Validate Duration
     * @param {str} value 
     * @returns 
     */
    validateTime = (value) => {
        let timeValue = value;
        if(timeValue == "" || timeValue.indexOf(":")<0)
        {
            return false;
        }
        else
        {
            var sHours = timeValue.split(':')[0];
            var sMinutes = timeValue.split(':')[1];

            if(sHours == "" || isNaN(sHours) || parseInt(sHours)>23)
            {
                return false;
            }
            else if(parseInt(sHours) == 0)
                sHours = "00";
            else if (sHours <10)
                sHours = "0"+sHours;

            if(sMinutes == "" || isNaN(sMinutes) || parseInt(sMinutes)>59)
            {
                return false;
            }
            else if(parseInt(sMinutes) == 0)
                sMinutes = "00";
            else if (sMinutes <10)
                sMinutes = "0"+sMinutes;    

            value = sHours + ":" + sMinutes;   
        }
        return value;    
    }

    /**
     * Handle Support type duration input 
     * @param {obj} obj 
     * @param {str} stateName 
     * @param {int} index 
     * @param {str} fieldName 
     * @param {str} value 
     * @param {event} e 
     */
     supportDurationUpdate = (obj, stateName, index, fieldName, value, p_index) => {
        return new Promise(async (resolve, reject) => {
            let List = obj.state[stateName];

            let state = {};
            List[p_index][fieldName][index][fieldName] = value;

            if (fieldName === 'duration') {
                let errTxt = this.validateTime(value);
                if (errTxt === false) {
                    // Todo
                } else {
                    List[p_index][fieldName][index]['error'] = false; 
                    List[p_index][fieldName][index]['errorTxt'] = '';
                }
            }

            state[stateName] = Object.assign([], List);
            obj.setState(state, () => {
                resolve({ status: true });
            });
        });
    }

    /**
     * Get error count 
     * @param {str} index 
     * @returns 
     */
    getErrorCountSupprtType = (index) => {
        let error = false;
        let support_type_duration = this.state[index + '_support_type_duration'];
        let support_type_duration_error = this.state[index + '_st_duration_error'];
        let total_error = 0;
        support_type_duration.map((sup_dur, idx) => {
            if (sup_dur.error === true) {
                total_error++;
            }
            let duration = sup_dur.duration;
            duration.map((dur) => {
                if (dur.error === true) {
                    total_error++;
                }
            });
        });

        if (support_type_duration_error.error) {
            total_error++;
        }

        return total_error;
    }

    /**
     * rendering contact information
     */
    RenderContactInformation() {
        return (
            <React.Fragment>
                <ExpandableSection
                    id="default-expandable-section"
                    title="Confirmation Details"
                >
                    <div className="container-fluid">
                        <div className="row py-2">
                            <div className="col-sm-6">
                                <Text
                                    id="contact_phone"
                                    label="Phone"
                                    placeholder="Phone"
                                    required={true}
                                    name="contact_phone"
                                    maxLength={18}
                                    value={this.state.contact_phone || ""}
                                    onChange={e => {
                                        handleChange(this, e);
                                        //apply validation if length is
                                        let stErrors = this.state.errors;
                                        if (e.target.value.length >= 6) {
                                            let errors = applyValidation("Phone", "data-validation-phonenumber", e.target.value);
                                            if (errors !== true) {                                                
                                                stErrors["contact_phone"] = errors;
                                            } else {
                                                stErrors["contact_phone"] = "";
                                            }
                                        } else if (e.target.value.length === 0) {
                                            stErrors["contact_phone"] = "Phone is required";
                                        }
                                        this.setState({ changedValue: true, errors: stErrors });
                                    }}
                                    onBlur={errors => this.setError(errors, "contact_phone")}
                                    validate={{"data-validation-phonenumber" : true}}
                                    errorText={this.state.errors && this.state.errors.contact_phone}
                                />
                            </div>
                            <div className="col-sm-6">
                                <Text
                                    id="contact_email"
                                    label="Email"
                                    placeholder="Email"
                                    name="contact_email"
                                    maxLength={100}
                                    required={true}
                                    value={this.state.contact_email || ""}
                                    onChange={e => {
                                        let errors = this.state.errors;
                                        let validation = applyValidation("Email", "data-validation-email", e.target.value);
                                        if (validation === true) {
                                            errors["contact_email"] = "";
                                        }
                                        this.setState({ changedValue: true });
                                        handleChange(this, e);
                                    }}
                                    onBlur={errors => this.setError(errors, "contact_email")}
                                    validate={{"data-validation-email": true}}
                                    errorText={this.state.errors && this.state.errors.contact_email}
                                />
                            </div>
                        </div>
                    </div>
                </ExpandableSection>
            </React.Fragment>
        );
    }

    setError(errors, key, multiple = false) {
        if (errors && typeof errors === "object" && typeof errors.join === "function") {
            errors = errors.join(". ");
        }
        if (errors === true) {
            errors = "";
        }
        let stateErrors = this.state.errors || {};
        if(errors && errors.length) {   
            if (multiple && key === "scheduled_breaks"){
                let break_errors = [];
                let b_err = errors.split(". ");
                break_errors = b_err.map(err => {
                    return (
                        <div className="row">
                            <div className="col-sm-12">
                                <Label errorText={true} text={err} />
                            </div>
                        </div>
                    )
                })
                stateErrors[key] = break_errors;
            } else {
                stateErrors[key] = errors;
            }
        } else {
            stateErrors[key] = "";
        }
        this.setState({errors: stateErrors});
    }

    setWarning(warning, key) {
        if (typeof warning !== "string") {
            warning = warning.join("\n");
        }
        let warnings = this.state.warnings || {};
        warnings[key] = warnings[key] || {};
        let idx =  warnings[key] && Object.keys(warnings[key]).length || 0;
        if(warning && warning.length) {
            let twarn = {[idx] : warning};
            warnings[key] = twarn;
        } else {
            warnings[key] = {[idx] : ""};
        }
        this.setState({warnings});
    }

    setErrors(errors) {
        if (errors && typeof errors === "object") {
            Object.keys(errors).map(key => {   
                try {                 
                    let err = JSON.parse(errors[key]);
                    let position = err.field || "";
                    if (position) {
                        if (err.type === "warning") {
                            this.setWarning(err.msg, position);
                        } else {
                            let multiple = false;
                            if (key === "scheduled_breaks") {
                                multiple = true;
                            }
                            this.setError(err.msg, position, multiple);
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            }) 
        } else if(errors && typeof errors === "string") {
            toastMessageShow(errors, "e");
        } else {
            console.log(errors)
        }
    }

    /**
     * rendering actual timing part of the schedule form
     */
    RenderActualSection() {
        let asd_error = this.state.errors && this.state.errors.actual_start_date || false;
        let aed_error = this.state.errors && this.state.errors.actual_end_date || false;
        return (
            <React.Fragment>
                <ExpandableSection
                    id="default-expandable-section"
                    title="Actual Times"
                    isOpen={this.state.open_actual_times}
                    onToggleOpen={(event, data) => {
						this.setState({ open_actual_times: !this.state.open_actual_times });
					}}
                >
                    <div className="container-fluid">
                        <div className="row py-2">
                            <div className="col-sm-3">
                                <FormElement>
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        Actual Start Date</label>
                                    <div className="slds-form-element__control">
                                        <div className="SLDS_date_picker_width" onKeyDown={(e) => {
                                            if (e.key === 'Tab') {
                                                const { current } = this.datepickers['actual_start_date'] || {}
                                                if (current && 'instanceRef' in current) {
                                                    current.instanceRef.setState({ isOpen: false })
                                                }
                                            }
                                        }}>
                                            <ReactDatePicker
                                                dateFormat={'dd/MM/yyyy'}
                                                placeholder={'DD/MM/YYYY'}
                                                minYear={new Date().getFullYear()}
                                                maxYear={new Date().getFullYear() + 3}
                                                selected={this.state.actual_start_date}
                                                callBack={(e) => this.datePickerCallBack(e)}
                                                name={'actual_start_date'}
                                            />
                                        </div>
                                    </div>
                                    </FormElement>
                            </div>
                            <div className="col-sm-2">
                                <div className="slds-form-element">
                                    <div className="slds-form-element__control timepickerselected actual_start_time" id="actual_start_time" onBlur={(e) => this.setValidatedTime(e, 'actual_start_time', true, 2)}>
                                       {this.state.is_time_updated_from_details&&(  <CustomTimePicker 
                               inputId="actual_start_time"
                               labelId="actual_start_time-label"
                               name="actual_start_time"
                               label={"Start Time"}
                               onDateChange={(inputStr,date)=>{
                                this.handleTimepicker(date, inputStr, 'actual_start_time');
                                this.calcActiveDuration(2, "actual_start_time", inputStr);
                               }}
                               required={false}
                               strValue={this.state.actual_start_time}
                               errorText={this.state.errors && this.state.errors["actual_start_time"]}
                             />)}
                                    </div>
                                    {this.state.showTimeErr['actual_start_time'] && <span style={{ color: "red" }}>{this.state.errMsg}</span>}
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">Actual End Date</label>
                                    <div className="slds-form-element__control">
                                        <div className="SLDS_date_picker_width" onKeyDown={(e) => {
                                            if (e.key === 'Tab') {
                                                const { current } = this.datepickers['actual_end_date'] || {}
                                                if (current && 'instanceRef' in current) {
                                                    current.instanceRef.setState({ isOpen: false })
                                                }
                                            }
                                        }}>
                                            <ReactDatePicker
                                                dateFormat={'dd/MM/yyyy'}
                                                placeholder={'DD/MM/YYYY'}
                                                minYear={new Date().getFullYear()}
                                                maxYear={new Date().getFullYear() + 3}
                                                selected={this.state.actual_end_date}
                                                callBack={(e) => this.datePickerCallBack(e)}
                                                name={'actual_end_date'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-2">
                                <div className="slds-form-element">
                                    <div className="slds-form-element__control timepickerselected actual_end_time" id="actual_end_time" onBlur={(e) => this.setValidatedTime(e, 'actual_end_time', true, 2)}>
                                             {this.state.is_time_updated_from_details&&(<CustomTimePicker 
                               inputId="timepicker-input"
                               labelId="timepicker-label"
                               name="actual_end_time"
                               label={"End Time"}
                               required={false}
                               onDateChange={(inputStr,date)=>{
                                this.handleTimepicker(date, inputStr, 'actual_end_time');
                                this.calcActiveDuration(2, "actual_end_time", inputStr);
                               }}
                               strValue={this.state.actual_end_time}
                               errorText={this.state.errors && this.state.errors["actual_end_time"]}
                             />)}
                                    </div>
                                    {this.state.showTimeErr['actual_end_time'] && <span style={{ color: "red" }}>{this.state.errMsg}</span>}
                                </div>
                            </div>
                            <div className="col-sm-2">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >Duration</label>
                                    <div className="slds-form-element__control" >
                                        <input type="text"
                                            name="actual_duration"
                                            id="actual_duration"
                                            disabled={true}
                                            placeholder="HH:MM"
                                            value={this.state.actual_duration || ''}
                                            data-validation-maxlength="6"
                                            className="slds-input" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {
                            this.state.errors.actual_section && <Label errorText={true} text={this.state.errors.actual_section} />
                        }
                        {
                            asd_error && <Label errorText={true} text={asd_error} />
                        }
                        {
                            aed_error && <Label errorText={true} text={aed_error} />
                        }
                        {
                            this.state.errors && this.state.errors["actual_start_time"] && <Label errorText={true} text="Invalid Start Time" />
                        }
                        {
                            this.state.errors && this.state.errors["actual_end_time"] && <Label errorText={true} text="Invalid End Time" />
                        }
                        {(this.state.actual_rows.length > 0) ?
                            this.state.actual_rows.map((row, idx) => {
                                var break_type_val = row.break_type;
                                return (
                                    <div className="row py-2">
                                        <div className="col-sm-3">
                                            <label className="slds-form-element__label" htmlFor="select-01">
                                                Break/Sleepover - {(idx + 1)}
                                            </label>
                                            <div className="slds-form-element">
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className={"SLDS_custom_Select default_validation slds-select actual_break_type_"+idx}
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        required={true}
                                                        id={'break_type_' + idx}
                                                        options={this.state['actual_break_option_'+idx]}
                                                        onChange={(e) => {
                                                            handleShareholderNameChangeShift(this, 'actual_rows', idx, 'break_type', e)
                                                            // update duration
                                                            this.updateDurationField('actual', idx, e);
                                                        }}
                                                        value={row.break_type}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="slds-form-element">
                                                <div className={"slds-form-element__control timepickerselected actual_break_start_time_"+idx}  onBlur={(e)=> this.setBreakTime(e,'actual_rows','break_start_time',idx, '', this)}>
{this.state.is_time_updated_from_details&&(<CustomTimePicker 
                                      id={"act_break_start_time"+ idx}
                               labelId="actual_start_time-label"
                               name={"act_break_start_time"+ idx}
                               label={"Start Time"}
                               disabled={row.timing_disabled}
                               onDateChange={(inputStr) => {
                                this.setState({ changedValue: true });
                                handleShareholderNameChangeShift(this, 'actual_rows', idx, 'break_start_time', inputStr)
                            }}
                            required={false}
                            strValue={row.break_start_time}
                    
                             />)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="slds-form-element">
                                                <div className={"slds-form-element__control timepickerselected actual_break_end_time_"+idx} onBlur={(e)=> this.setBreakTime(e,'actual_rows','break_end_time',idx, '', this)}>
                        
{this.state.is_time_updated_from_details&&(<CustomTimePicker 
                                      id={"act_break_end_time"+ idx}
                               labelId="actual_end_time-label"
                               name={"act_break_end_time"+ idx}
                               label={"End Time"}
                               disabled={row.timing_disabled}
                               onDateChange={(inputStr) => {
                                handleShareholderNameChangeShift(this, 'actual_rows', idx, 'break_end_time', inputStr).then(status => {
                                    if (status && this.state.actual_rows[idx]["break_start_time"] && this.state.actual_rows[idx]["break_end_time"]) {
                                        this.onSubmit(null, true);
                                    }
                                })
                                this.resetLineitems('actual');
                                this.setState({ changedValue: true });
                            }}
                            strValue={row.break_end_time}
                            required={false}
                             />)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-2">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" >Duration</label>
                                                <div className="slds-form-element__control">
                                                    <input type="text"
                                                        name="break_duration"
                                                        id="break_duration"
                                                        placeholder="HH:MM"
                                                        disabled={row.duration_disabled}
                                                        onChange={(e) => {
                                                            handleShareholderNameChangeShift(this, 'actual_rows', idx, 'break_duration', e.target.value)
                                                            this.setState({ changedValue: true });
                                                        }}
                                                        onBlur={(e) => this.get_support_type_ndis_duration('actual')}
                                                        value={row.break_duration || ''}
                                                        data-msg-number="Please enter valid number"
                                                        className="slds-input" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-1 pt-4">
                                            {idx >= 0 ? <Button
                                                category="reset"
                                                iconSize="large"
                                                iconName="delete"
                                                title="Remove break"
                                                variant="icon"
                                                iconClassName={`slds-button__icon_delete`}
                                                onClick={() => this.removeRow(idx, true)}
                                            /> : ''}
                                        </div>
                                    </div>
                                )
                            }) : ''}
                        {this.state.errors && this.state.errors["actual_breaks"] && <div className="row">
                            <div className="col-sm-12">
                                <Label errorText={true} text={this.state.errors["actual_breaks"]} />
                            </div>
                        </div>}
                        <div className="row">
                            <div className="col-sm-9">&nbsp;</div>
                            <div className="col-sm-3">
                                <Button
                                    category="reset"
                                    iconSize="medium"
                                    iconName="new"
                                    label="Add a break"
                                    id="actual_break_btn"
                                    className="actual_break_btn"
                                    onClick={() => this.addRow(true)}
                                />
                            </div>
                        </div>
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >Travel (KMs)</label>
                                    <div className="slds-form-element__control">
                                        <input type="text"
                                            name="actual_travel"
                                            id="actual_travel"
                                            placeholder="KMs"
                                            onChange={(e) => {
                                                let rgx = /^[0-9]*\.?[0-9]*$/;
                                                if (e.target.value.match(rgx)) {
                                                    handleChange(this, e)
                                                    this.setState({ changedValue: true });
                                                }
                                            }}
                                            value={this.state.actual_travel || ''}
                                            maxLength="6"
                                            data-msg-number="Please enter valid number"
                                            className="slds-input" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >Reimbursements ($)</label>
                                    <div className="slds-form-element__control">
                                        <input type="text"
                                            name="actual_reimbursement"
                                            id="actual_reimbursement"
                                            placeholder="Reimbursements (in $)"
                                            onChange={(e) => {
                                                this.setState({ changedValue: true });
                                                if (!isNaN(e.target.value)) {
                                                    handleDecimalChange(this, e);
                                                }
                                            }}
                                            maxLength="9"
                                            value={this.state.actual_reimbursement || ''}
                                            className="slds-input" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {
                            this.state.errors && this.state.errors["actual_allowances"] && <div className="row">
                             <div className="col-sm-12">
                                 <Label errorText={true} text={this.state.errors["actual_allowances"]} />
                             </div>
                            </div>
                            
                        }
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >Commuting Travel Allowance (Distance KMs)</label>
                                    <div className="slds-form-element__control">
                                        <input type="text"
                                            name="actual_travel_distance"
                                            id="actual_travel_distance"
                                            placeholder="KMs"
                                            onChange={(e) => {
                                                var regx = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
                                                if (regx.test(e.target.value) === true || e.target.value === '') {
                                                    handleChange(this, e)
                                                    this.setState({ changedValue: true });
                                                }
                                            }}
                                            value={this.state.actual_travel_distance || ''}
                                            data-msg-number="Please enter valid number"
                                            className="slds-input" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" >Commuting Travel Allowance (Duration HH:MM)</label>
                                    <div className="slds-form-element__control">
                                        <div className="col-lg-3 col-sm-3">
                                            <input type="text"
                                                name="actual_travel_duration_hr"
                                                id="actual_travel_duration_hr"
                                                placeholder="HH"
                                                onChange={(e) => {
                                                    var regx = /^([0-1]?[0-9]|2[0-4])$/;

                                                    if (regx.test(e.target.value) === true || e.target.value === '') {
                                                        handleChange(this, e)
                                                        this.setState({ changedValue: true });
                                                    }
                                                }}

                                                onBlur={(e) => this.handleOnBlur(e, 'actual_travel_duration_hr')}
                                                value={this.state.actual_travel_duration_hr || ''}
                                                data-msg-number="Please enter valid number"
                                                className="slds-input" />

                                        </div>
                                        <div className="col-lg-1 col-sm-1" style={{ paddingTop: "7px" }}>:</div>
                                        <div className="col-lg-3 col-sm-3">
                                            <input type="text"
                                                name="actual_travel_duration_min"
                                                id="actual_travel_duration_min"
                                                placeholder="MM"
                                                onChange={(e) => {
                                                    var regx = /^[0-5]?[0-9]$/;
                                                    if (regx.test(e.target.value) === true || e.target.value === '') {
                                                        handleChange(this, e)
                                                        this.setState({ changedValue: true });
                                                    }
                                                }}
                                                onBlur={(e) => this.handleOnBlur(e, 'actual_travel_duration_min')}
                                                value={this.state.actual_travel_duration_min || ''}
                                                data-msg-number="Please enter valid number"
                                                className="slds-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row py-2">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">Notes</label>
                                    <div className="slds-form-element__control">
                                        <textarea
                                            className="slds-textarea"
                                            name="notes"
                                            id="notes"
                                            placeholder="Notes"
                                            onChange={(e) => {
                                                this.setState({ changedValue: true });
                                                this.handleChange(e.target.value, "notes")
                                            }}
                                            value={this.state.notes ? this.state.notes : ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ExpandableSection>
            </React.Fragment>
        )
    }

    /**
     * toggling repeat days modal
     */
    toggleRepeatModal = (save) => {
        this.setState({ repeat_open: !this.state.repeat_open });
        if (save) {
            this.onSubmit();
        }
    };

    /**
     * when the repeat option is selected then creating the days list for selection
     */
    addDaysSelection = (repeat_option) => {
        var dateYmdHis = this.state.scheduled_start_date;
        if (moment(moment(dateYmdHis).format('DD/MM/YYYY'), 'DD/MM/YYYY', true).isValid() == true) {
            var today = moment();
            var start_date = moment(dateYmdHis);
            var repeat_days = [];
            var nextDay = '';

            // repeating on selected days
            if (repeat_option == 3) {
                // starting from first day of week
                var week_start = moment(dateYmdHis).subtract(1, 'days').startOf('week').weekday(1);
                var start_date_format = moment(start_date.format('YYYY-MM-DD'));

                var date_status = 0;
                if (start_date_format.isAfter(week_start)) {
                    date_status = 1; // past day
                }
                else if (start_date_format.isSame(week_start)) {
                    date_status = 2; // same day
                }
                else if (start_date_format.isBefore(week_start)) {
                    date_status = 3; // future day
                }
                var day = { date_status: date_status, format_date: week_start.format('dddd'), actual_date: week_start.format('YYYY-MM-DD') };
                repeat_days.push(day);

                // adding remaining 6 days of the week, including the currently selected start date
                for (var i = 1; i < 7; i++) {
                    nextDay = moment(week_start).add(i, 'days');
                    if (start_date_format.isAfter(nextDay)) {
                        date_status = 1; // past day
                    }
                    else if (start_date_format.isSame(nextDay)) {
                        date_status = 2; // same day
                    }
                    else if (start_date_format.isBefore(nextDay)) {
                        date_status = 3; // future day
                    }

                    day = { date_status: date_status, format_date: nextDay.format('dddd'), actual_date: nextDay.format('YYYY-MM-DD') };
                    repeat_days.push(day);
                }

                // remove if selected date is equal to start date
                var start_date_act = start_date.format('YYYY-MM-DD');
                var repeat_days_selected = this.state.repeat_days_selected;
                if (repeat_days_selected) {
                    repeat_days_selected.splice(repeat_days_selected.indexOf(start_date_act), 1);
                    this.setState({ repeat_days_selected: repeat_days_selected });
                }
            }

            this.setState({ repeat_days: repeat_days });
        }
    }

    /**
     * rendering repeat modal of the schedule form
     */
    showRepeatModal() {

        return (
            <React.Fragment>
                <Modal
                    size="small"
                    heading={"Repeat Shift"}
                    isOpen={this.state.repeat_open}
                    footer={[
                        <Button disabled={this.state.loading} label="Cancel" onClick={() => this.toggleRepeatModal()} />,
                        <Button disabled={this.state.loading} label="Save" variant="brand" onClick={() => this.toggleRepeatModal(true)} />]}
                    onRequestClose={this.toggleRepeatModal}>
                    <div className="container">
                        <div className="row py-2">
                            <div className="col-sm-3">
                                <div className="slds-form-element pb-2">
                                    <label className="slds-form-element__label" >Select the days to repeat the shift:</label>
                                </div>
                                <div class="slds-form-element__control" id="date_hide">
                                    <SLDSISODatePicker
                                        menuPosition={'relative'}
                                        ref={this.datepickers.repeat_hidden_date} // !important: this is needed by this custom SLDSISODatePicker
                                        className="date_hide"
                                        placeholder="Start Date"
                                        isOpen={true}
                                        onChange={this.handleChangeDatePicker('repeat_hidden_date')}
                                        onOpen={this.handleDatePickerOpened('repeat_hidden_date')}
                                        onClear={this.handleChangeDatePicker('repeat_hidden_date')}
                                        disableOnClickOutside={true}
                                        dateDisabled={(data) => {
                                            const { date } = data
                                            const dateYmd = moment(date).format('YYYY-MM-DD')
                                            const todayYmd = moment().format('YYYY-MM-DD')
                                            const isAfter = moment(dateYmd).isBefore(todayYmd)
                                            return isAfter
                                        }}

                                        relativeYearFrom={0}
                                        relativeYearTo={3}
                                        value={this.state.scheduled_start_date}
                                        clearable
                                    />
                                </div>
                            </div>
                            <div className="col-sm-9 pl-5">
                                <div className="slds-form-element pb-2">
                                    <label className="slds-form-element__label">Selected Days:</label>
                                </div>
                                <div class="slds-form-element__control date_clip">
                                    {(this.state.repeat_days_selected.length > 0) ? this.state.repeat_days_selected.sort().map((comdate, idx) => {
                                        return <div><Button
                                            category="reset"
                                            iconSize="medium"
                                            iconName="delete"
                                            variant="icon"
                                            iconClassName={`slds-button__icon_delete`}
                                            onClick={() => this.addRemoveSelectedRepeatDates(comdate)}
                                        />&nbsp; {moment(comdate).format("dddd, DD/MM/YYYY")}</div>
                                    }) : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </React.Fragment>
        )
    }

    /**
     * Handle onchange repeat option
     * @param {obj} e
     */
    onChangeRepeatOption = (e) => {
        this.state.repeat_option = e.value;
        let selected_val = Number(e.value);

        let roster_id = this.state.roster_id;
        let roster = this.state.roster_options.filter((item, key) => item.value === roster_id).map(({ label, value, start_date, end_date }) => ({ label, value, start_date, end_date }));
        let selected_roster = roster[0] ? roster[0] : '';
        if (selected_roster.start_date && selected_roster.end_date) {
            let start_date_ros = moment(selected_roster.start_date);
            let end_date_ros = moment(selected_roster.end_date);
            let start_date = moment(this.state.scheduled_start_date);
            let end_date = moment(this.state.scheduled_end_date);
            if (start_date_ros.isBefore(start_date) === false) {
                this.setError("Schedule start date must be greater than roster start date", "scheduled_section");
                return;
            }
            if (end_date_ros.isAfter(start_date) === false) {
                this.setError("Schedule start date must be less than roster end date", "scheduled_section");
                return;
            }
            if (end_date_ros.isAfter(end_date) === false) {
                this.setError("Schedule end date must be less than roster end date", "scheduled_section");
                return;
            }
            if (start_date_ros.isBefore(end_date) === false) {
                this.setError("Schedule end date must be greater than roster start date", "scheduled_section");
                return;
            }
        }
        this.setState({ selected_roster: roster });
        switch (selected_val) {
            case 3:
                this.addDaysSelection(e.value);
                this.setState({ repeat_open: true })
                break;
            case 4:
            case 5:
            case 6:
                this.setState({ openRosterRepeatModal: true });
                break;
            default:
                this.onSubmit();
                break;
        }
    }

    /**
     * Get all months between two dates
     * @param {str} startDate
     * @param {str} endDate
     * @returns
     */
    dateRange = (startDate, endDate) => {
        startDate = moment(startDate).format('YYYY-MM-DD');
        endDate = moment(endDate).format('YYYY-MM-DD');
        var start = startDate.split('-');
        var end = endDate.split('-');
        var startYear = parseInt(start[0]);
        var endYear = parseInt(end[0]);
        var dates = [];

        for (var i = startYear; i <= endYear; i++) {
            var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
            var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
            for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
                var month = j + 1;
                var displayMonth = month < 10 ? '0' + month : month;
                dates.push([i, displayMonth, '01'].join('-'));
            }
        }
        return dates;
    }

    /**
     * Calculate the week between two date
     * @param {date} dt1
     * @param {date} dt2
     * @returns
     */
    diff_weeks(dt2, dt1) {

        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60 * 24 * 7);
        return Math.abs(Math.round(diff));

    }

    /**
     * Save Repeat roster
     * @param {array} day_selected
     */
    saveRepeatRoster = (day_selected, repeat_specific_days) => {
        this.setState({ repeat_days_selected: day_selected, openRosterRepeatModal: false, repeat_specific_days }, () => {
            this.onSubmit();
        });
    }
    /**
     * rendering components
     */
    render() {
        let repeatOptions = [
            { label: 'Repeat for tomorrow', value: '1' },
            { label: 'Repeat for rest of the week', value: '2' },
            { label: 'Repeat for specific days', value: '3' },
        ];
        if (this.state.roster_id) {
            repeatOptions = [
                { label: 'Repeat for tomorrow', value: '1' },
                { label: 'Repeat for rest of the week', value: '2' },
                { label: 'Repeat for specific days', value: '3' }
            ];
            if (this.state.week_count >= 1) {
                var week = [];
                week['label'] = 'Repeat weekly';
                week['value'] = '4';
                repeatOptions.push(week);
            }
            if (this.state.weekfort_count > 1) {
                var week_fornight = [];
                week_fornight['label'] = 'Repeat fortnightly';
                week_fornight['value'] = '5';
                repeatOptions.push(week_fornight);
            }
            if (this.state.month_count > 1) {
                var month = [];
                month['label'] = 'Repeat monthily';
                month['value'] = '6';
                repeatOptions.push(month);
            }

        }
        let errcount =  this.state.errors && Object.keys(this.state.errors).filter(key => key !== "account_type" && !!this.state.errors[key]).length;
        let break_errors =  this.state.errors &&  this.state.errors["scheduled_breaks"] || [];
        if (break_errors.length > 0) {
            errcount = errcount + break_errors.length - 1;
        }

        if (this.state.is_support_mixed) {
            let sch_st_count = this.getErrorCountSupprtType('scheduled');
            errcount = errcount + sch_st_count;

            if (this.state.actual_duration && this.state.actual_duration != '00:00') {
                let act_st_count = this.getErrorCountSupprtType('actual');
                errcount = errcount + act_st_count;
            }
        }

        if(this.state.mixed_support_error){
            errcount = errcount + 1;
        }

        let scheduled_warns =  this.state.warnings && this.state.warnings.scheduled && Object.keys(this.state.warnings.scheduled).length || 0;
        let actual_warns =  this.state.warnings && this.state.warnings.actual && Object.keys(this.state.warnings.actual).length || 0;
        let warncount = actual_warns > 0? actual_warns : scheduled_warns;
        if (this.state.signed_ndis > 0 && this.state.scheduled_missing_line_item) {
            warncount = warncount + 1;
        }
        if (this.state.actual_missing_line_item) {
            warncount = warncount + 1;
        }
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <div>
                    <button id="btn-datepicker" className="d-none">click</button>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Row>
                                <Col style={{textAlign: "left"}} className="col-sm-8">
                                    {!!errcount && <Label errorText={true} text={`${errcount} errors found. Fix them to save the shift details`}>
                                    &nbsp;&nbsp;<Button
                                            title={`Click to revalidate form`}
                                            assistiveText={{ icon: 'Refresh' }}
                                            iconCategory="utility"
                                            iconName="refresh"
                                            variant="icon"
                                            iconSize="small"
                                            onClick={e => {this.onSubmit(null, true)}}
                                            iconVariant="border-filled"
                                           />
                                        </Label>}
                                    {!!warncount && <Label warningText={true} text={`${warncount} warnings found. Shift can not be invoiced unless they are fixed`} />}
                                    &nbsp;
                                </Col>
                                <Col className="col-sm-4">
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal(false)} />
                                {this.props.id > 0 ? <Button disabled={this.state.loading ||errcount > 0} label="Save"  variant="brand" onClick={(e) => this.onSubmit(e)} /> : 
                                <ButtonGroup disabled={errcount > 0} variant="" id="button-group-footer">
                                                    <Button disabled={this.state.loading||errcount > 0} label="Save" variant="brand" onClick={e => this.onSubmit(e)} />
                                                    <Dropdown
                                                     disabled={errcount > 0}
                                                        assistiveText={{ icon: 'More Options' }}
                                                        iconCategory="utility"
                                                        iconName="down"
                                                        align="right"
                                                        iconSize="x-medium"
                                                        iconVariant="brand"
                                                        onSelect={(e) => {
                                                            this.onChangeRepeatOption(e);
                                                        }}
                                                        width="xx-small"
                                                        options={repeatOptions}
                                                    />
                                 </ButtonGroup>}
                                </Col>
                            </Row>
                            
                        ]}
                        onRequestClose={this.toggleOpen}
                        heading={this.props.id ? "Update Shift" : "Create New Shift"}
                        size="small"
                        className="slds_custom_modal add_edit_shift_modal"
                        id="add_edit_shift"
                        onRequestClose={() => this.props.closeModal(false)}
                        dismissOnClickOutside={false}
                    >

                        <section className="manage_top" >
                            <form ref={this.formRef} id="create_shift" autoComplete="off" className="slds_form">
                                {this.RenderGeneralSection()}
                                {this.RenderContactInformation()}
                                {this.RenderScheduleSection()}
                                {this.renderNDISPayment('scheduled')}
                                {this.RenderActualSection()}
                                {this.renderNDISPayment('actual')}
                                {this.state.errors && this.state.errors["common"] && 
                                    <Label errorText={true} text={this.state.errors["common"]} />
                                }
                                {this.showRepeatModal()}
                            </form>
                        </section>

                        {
                            this.state.openCreateContactModal && (
                                <CreateContactModal
                                    contactId=''
                                    showModal={this.state.openCreateContactModal}
                                    closeModal={this.closeContactModal}
                                    is_manage_contact_role={true}
                                    account_person={this.state.account_person}
                                />
                            )
                        }
                        {
                            this.state.openRosterRepeatModal && (
                                <RosterRepeatModal
                                    showModal={this.state.openRosterRepeatModal}
                                    closeModal={this.closeRosterRepeatModal}
                                    saveRepeatRoster={this.saveRepeatRoster}
                                    roster_id={this.state.roster_id}
                                    headingTxt={'Repeat Shift'}
                                    roster={this.state.selected_roster}
                                    scheduled_start_date={this.state.scheduled_start_date}
                                    scheduled_end_date={this.state.scheduled_end_date}
                                    repeat_option={this.state.repeat_option}
                                />
                            )
                        }
                    </Modal>
                </div>
            </IconSettings>
        );
    }
}

export default CreateShiftModal;
