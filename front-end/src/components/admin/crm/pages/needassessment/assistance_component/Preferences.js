import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, AjaxConfirm, toastMessageShow, handleChange, comboboxFilterAndLimit, handleChangeSFLDSDatePicker } from 'service/common.js';
import jQuery from "jquery";
import BlockUi from 'react-block-ui';
//import { REGULAR_EXPRESSION_FOR_NUMBERS } from 'config.js';
import { REGULAR_EXPRESSION_FOR_NUMBERS } from 'service/OcsConstant.js';
import Combobox from '@salesforce/design-system-react/lib/components/combobox';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import {IconSettings} from '@salesforce/design-system-react';
import moment from 'moment';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import { Input } from '@salesforce/design-system-react';
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import Checkbox from '@salesforce/design-system-react/lib/components/checkbox';
import '../../../../scss/components/admin/crm/pages/needassessment/Preferences.scss';
class Preferences extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,

            inputValueLang: '',
            langSelection: [],
            workerLangOption: [],

            inputValueCulture: '',
            cultureSelection: [],
            workerCultureOption: [],

            inputValueLikes: '',
            likeSelection: [],
            likesOption: [],

            inputValueDislikes: '',
            disLikesSelection: [],
            disLikesOption: [],

            inputValueIntrest: '',
            intrestSelection: [],
            workerIntrestOption: [],

            in_home_shift_tasks: '',
            community_access_shift_tasks: '',
            active_night_details: '',
            sleep_over_details: '',
            preferences_not_applicable: 0,
            options_length: 1
        }
    }

    componentDidMount() {
        this.getReferenceData();
        if (this.props.need_assessment_id) {
            this.setState({ need_assessment_id: this.props.need_assessment_id }, () => {
                this.getSelectedPreference();
            })
        }
    }

    getReferenceData = () => {
        postData("sales/NeedAssessment/get_reference_data").then((res) => {
            if (res.status) {
                this.setState({
                    likesOption: (res.data.likes) ? res.data.likes : [],
                    disLikesOption: (res.data.dislikes) ? res.data.dislikes : [],
                    workerLangOption: (res.data.language) ? res.data.language : [],
                    workerCultureOption: (res.data.culture) ? res.data.culture : [],
                    workerIntrestOption: (res.data.intrest) ? res.data.intrest : [],
                })
            }
        });
    }

    getSelectedPreference = () => {
        postData("sales/NeedAssessment/get_selected_preference_assistance", { need_assessment_id: this.state.need_assessment_id }).then((res) => {
            if (res.status) {
                this.setState(res.data, () => {
                    this.setState({
                        likeSelection: (res.data.selected_preference && res.data.selected_preference[1]) ? res.data.selected_preference[1] : [],
                        disLikesSelection: (res.data.selected_preference && res.data.selected_preference[2]) ? res.data.selected_preference[2] : [],
                        langSelection: (res.data.selected_preference && res.data.selected_preference[3]) ? res.data.selected_preference[3] : [],
                        cultureSelection: (res.data.selected_preference && res.data.selected_preference[4]) ? res.data.selected_preference[4] : [],
                        intrestSelection: (res.data.selected_preference && res.data.selected_preference[5]) ? res.data.selected_preference[5] : [],
                        preferences_not_applicable: res.data.not_applicable === "1" ? true : false
                    })
                })
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#preference_form").validate({ /* */ });
        this.setState({ loading: true });
        //if (jQuery("#preference_form").valid()) {
        if (!this.state.loading && jQuery("#preference_form").valid()) {
            postData('sales/NeedAssessment/save_preference_assisstance', this.state).then((result) => {
                if (result.status) {
                    this.setState({ loading: false });
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    //this.getSelectedPreference();
                } else {
                    toastMessageShow(result.msg, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }

    render() {
        
        return (
            <React.Fragment>
                <BlockUi tag="div" blocking={this.state.loading}>
                    <div className="slds-grid">
                        <div className="slds-panel slds-size_full slds-is-open" aria-hidden="false">
                            <form id="preference_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
                                <div className="slds-panel__header">
                                    <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Preferences</h2>
                                </div>

                                <div className="slds-panel__body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Checkbox
                                                assistiveText={{
                                                    label: 'Not Applicable',
                                                }}
                                                id="preferences_not_applicable"
                                                labels={{
                                                    label: 'Not Applicable',
                                                }}
                                                checked={this.state.preferences_not_applicable ? true : false}
                                                onChange={(e) => {
                                                    this.setState({ preferences_not_applicable: e.target.checked });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grey-bg">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label"> Likes</legend>
                                                    <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                            <Combobox
                                                                predefinedOptionsOnly
                                                                disabled={this.props.disabled || this.state.preferences_not_applicable}
                                                                variant={this.state.preferences_not_applicable && "readonly" || "base"}
                                                                //inheritWidthOf="menu"
                                                                events={{
                                                                    onChange: (event, { value }) => {
                                                                        //console.log(value.length);
                                                                        if (this.props.action) {
                                                                            this.props.action('onChange')(event, value);
                                                                        }
                                                                        this.setState({ inputValueLikes: value });
                                                                    },
                                                                    onRequestRemoveSelectedOption: (event, data) => {
                                                                        this.setState({
                                                                            inputValueLikes: '',
                                                                            likeSelection: data.selection,
                                                                        });
                                                                    },
                                                                    onSubmit: (event, { value }) => {
                                                                        if (this.props.action) {
                                                                            this.props.action('onChange')(event, value);
                                                                        }
                                                                        this.setState({
                                                                            inputValueLikes: '',
                                                                            likeSelection: [
                                                                                ...this.state.likeSelection,
                                                                                {
                                                                                    label: value,
                                                                                    icon: (
                                                                                        <Icon
                                                                                            assistiveText={{ label: 'Account' }}
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
                                                                        this.setState({
                                                                            inputValueLikes: '',
                                                                            likeSelection: data.selection,
                                                                        });
                                                                    },
                                                                }}

                                                                menuMaxWidth="500px"
                                                                menuItemVisibleLength={5}
                                                                multiple
                                                                options={comboboxFilterAndLimit(
                                                                    this.state.inputValueLikes,
                                                                    100,
                                                                    this.state.likesOption,
                                                                    this.state.likeSelection,
                                                                )}
                                                                selection={this.state.likeSelection}
                                                                value={this.state.inputValueLikes}
                                                            />
                                                        </IconSettings>
                                                    </div>
                                                </fieldset>


                                                <div className="slds-grid slds-grid_vertical-reverse" style={{ height: '140px' }}>
                                                    <div className="slds-col">
                                                        <span></span>
                                                    </div>
                                                    <div className="slds-col">
                                                        <span></span>
                                                    </div>
                                                </div>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Prefered Start Date</legend>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">

                                                            <Datepicker
                                                                className="customer_signed_date"
                                                                name=""
                                                                placeholder="Customer Signed Date"
                                                                onChange={(event, data) => {
                                                                    handleChangeSFLDSDatePicker(event, data, 'prefered_start_date', this);
                                                                }}
                                                                formatter={(date) => {
                                                                    return date ? moment(date).format('M/D/YYYY') : '';
                                                                }}
                                                                value={this.state.prefered_start_date}
                                                                disabled={this.state.preferences_not_applicable}
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Vacant Shifts</legend>
                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="known_unknown_worker" id="known_unknown_worker" onChange={(e) => handleChange(this, e)} checked={(this.state.known_unknown_worker && this.state.known_unknown_worker == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="known_unknown_worker">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Can send known and unknown workers</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="meet_greet_required" id="meet_greet_required" onChange={(e) => handleChange(this, e)} checked={(this.state.meet_greet_required && this.state.meet_greet_required == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="meet_greet_required">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Meet and Greet required for all new staff</span>
                                                            </label>
                                                        </span>
                                                    </div>

                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="shadow_shift" id="shadow_shift" onChange={(e) => handleChange(this, e)} checked={(this.state.shadow_shift && this.state.shadow_shift == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="shadow_shift">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Shadow Shift required for all new staff</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="worker_available" id="worker_available" onChange={(e) => handleChange(this, e)} checked={(this.state.worker_available && this.state.worker_available == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="worker_available">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Contact if no known worker available</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="cancel_shift" id="cancel_shift" onChange={(e) => handleChange(this, e)} checked={(this.state.cancel_shift && this.state.cancel_shift == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="cancel_shift">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Cancel shift if no known worker available</span>
                                                            </label>
                                                        </span>
                                                    </div>

                                                </fieldset>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">In home Support</legend>
                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="hs_weekday" id="hs_weekday" onChange={(e) => handleChange(this, e)} checked={(this.state.hs_weekday && this.state.hs_weekday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="hs_weekday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Weekday</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="hs_saturday" id="hs_saturday" onChange={(e) => handleChange(this, e)} checked={(this.state.hs_saturday && this.state.hs_saturday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="hs_saturday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Saturday</span>
                                                            </label>
                                                        </span>
                                                    </div>

                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="hs_sunday" id="hs_sunday" onChange={(e) => handleChange(this, e)} checked={(this.state.hs_sunday && this.state.hs_sunday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="hs_sunday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Sunday</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="hs_sleep_over" id="hs_sleep_over" onChange={(e) => handleChange(this, e)} checked={(this.state.hs_sleep_over && this.state.hs_sleep_over == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="hs_sleep_over">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Sleep Over</span>
                                                            </label>
                                                        </span>
                                                    </div>

                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="hs_active_night" id="hs_active_night" onChange={(e) => handleChange(this, e)} checked={(this.state.hs_active_night && this.state.hs_active_night == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="hs_active_night">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Active Night</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="hs_public_holiday" id="hs_public_holiday" onChange={(e) => handleChange(this, e)} checked={(this.state.hs_public_holiday && this.state.hs_public_holiday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="hs_public_holiday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Public Holiday</span>
                                                            </label>
                                                        </span>
                                                    </div>
                                                </fieldset>

                                            </div>

                                            <div className="col-md-6">

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label"> Dislikes</legend>
                                                    <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                            <Combobox
                                                                predefinedOptionsOnly
                                                                disabled={this.props.disabled || this.state.preferences_not_applicable}
                                                                variant={this.state.preferences_not_applicable && "readonly" || "base"}
                                                                //inheritWidthOf="menu"
                                                                events={{
                                                                    onChange: (event, { value }) => {
                                                                        if (this.props.action) {
                                                                            this.props.action('onChange')(event, value);
                                                                        }
                                                                        this.setState({ inputValueDislikes: value });
                                                                    },
                                                                    onRequestRemoveSelectedOption: (event, data) => {
                                                                        this.setState({
                                                                            inputValueDislikes: '',
                                                                            disLikesSelection: data.selection,
                                                                        });
                                                                    },
                                                                    onSubmit: (event, { value }) => {
                                                                        if (this.props.action) {
                                                                            this.props.action('onChange')(event, value);
                                                                        }
                                                                        this.setState({
                                                                            inputValueDislikes: '',
                                                                            disLikesSelection: [
                                                                                ...this.state.disLikesSelection,
                                                                                {
                                                                                    label: value,
                                                                                    icon: (
                                                                                        <Icon
                                                                                            assistiveText={{ label: 'Account' }}
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
                                                                        this.setState({
                                                                            inputValueDislikes: '',
                                                                            disLikesSelection: data.selection,
                                                                        });
                                                                    },
                                                                }}

                                                                menuMaxWidth="500px"
                                                                menuItemVisibleLength={5}
                                                                multiple
                                                                options={comboboxFilterAndLimit(
                                                                    this.state.inputValueDislikes,
                                                                    1000,
                                                                    this.state.disLikesOption,
                                                                    this.state.disLikesSelection,
                                                                )}
                                                                selection={this.state.disLikesSelection}
                                                                value={this.state.inputValueDislikes}
                                                            />
                                                        </IconSettings>
                                                    </div>
                                                </fieldset>


                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Support Worker Language</legend>
                                                    <div className="slds-form-element__control">
                                                        <span className="slds-radio" style={{ display: 'inline' }}>
                                                            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                                <Combobox
                                                                    predefinedOptionsOnly
                                                                    disabled={this.props.disabled || this.state.preferences_not_applicable}
                                                                    variant={this.state.preferences_not_applicable && "readonly" || "base"}
                                                                    inheritWidthOf="menu"
                                                                    events={{
                                                                        onChange: (event, { value }) => {
                                                                            let options = comboboxFilterAndLimit(
                                                                                value,
                                                                                1000,
                                                                                this.state.workerLangOption,
                                                                                this.state.langSelection,
                                                                            );
                                                                            if (this.props.action) {
                                                                                this.props.action('onChange')(event, value);
                                                                            }
                                                                            this.setState({ inputValueLang: value, options_length: options.length });
                                                                        },
                                                                        onRequestRemoveSelectedOption: (event, data) => {
                                                                            this.setState({
                                                                                inputValueLang: '',
                                                                                langSelection: data.selection,
                                                                            });
                                                                        },
                                                                        onSubmit: (event, { value }) => {
                                                                            if (this.props.action) {
                                                                                this.props.action('onChange')(event, value);
                                                                            }
                                                                            this.setState({
                                                                                inputValueLang: '',
                                                                                langSelection: [
                                                                                    ...this.state.langSelection,
                                                                                    {
                                                                                        label: value,
                                                                                        icon: (
                                                                                            <Icon
                                                                                                assistiveText={{ label: 'Account' }}
                                                                                                category="standard"
                                                                                                name="account"
                                                                                            />
                                                                                        ),
                                                                                    },
                                                                                ],
                                                                            });
                                                                        },
                                                                        onSelect: (event, data) => {
                                                                            if (data.selection[data.selection.length-1]["id"] === "add_new_lang") {
                                                                                let lang = data.selection[data.selection.length-1]["label"];
                                                                                lang = lang.replace("Add ", "");
                                                                                this.addNewLanguage(lang).then(id => {
                                                                                    let obj = {id, label: lang};
                                                                                    data.selection[data.selection.length-1] = obj;
                                                                                    if (this.props.action) {
                                                                                        this.props.action('onSelect')(
                                                                                            event,
                                                                                            ...Object.keys(data).map((key) => data[key])
                                                                                        );
                                                                                    }
                                                                                    this.setState({
                                                                                        inputValueLang: '',
                                                                                        langSelection: data.selection,
                                                                                    });
                                                                                });
                                                                            } else {
                                                                                if (this.props.action) {
                                                                                    this.props.action('onSelect')(
                                                                                        event,
                                                                                        ...Object.keys(data).map((key) => data[key])
                                                                                    );
                                                                                }
                                                                                this.setState({
                                                                                    inputValueLang: '',
                                                                                    langSelection: data.selection,
                                                                                });
                                                                            }
                                                                            
                                                                        },
                                                                    }}

                                                                    menuMaxWidth="500px"
                                                                    multiple
                                                                    options={comboboxFilterAndLimit(
                                                                        this.state.inputValueLang,
                                                                        1000,
                                                                        this.state.workerLangOption,
                                                                        this.state.langSelection,
                                                                    )}
                                                                    selection={this.state.langSelection}
                                                                    value={this.state.inputValueLang}
                                                                    optionsAddItem={!this.state.options_length ? [
                                                                        {
                                                                            id: 'add_new_lang',
                                                                            icon: (
                                                                                <Icon
                                                                                    assistiveText={{ label: 'Add New Language' }}
                                                                                    category="utility"
                                                                                    size="x-small"
                                                                                    name="add"
                                                                                />
                                                                            ),
                                                                            label: `Add ${this.state.inputValueLang}`,
                                                                        },
                                                                    ] : []}
                                                                />
                                                            </IconSettings>

                                                        </span>
                                                    </div>
                                                </fieldset>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Support Worker Culture</legend>
                                                    <div className="slds-form-element__control">
                                                        <span className="slds-radio" style={{ display: 'inline' }}>
                                                            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                                <Combobox
                                                                    predefinedOptionsOnly
                                                                    disabled={this.props.disabled || this.state.preferences_not_applicable}
                                                                    variant={this.state.preferences_not_applicable && "readonly" || "base"}
                                                                    inheritWidthOf="menu"
                                                                    events={{
                                                                        onChange: (event, { value }) => {
                                                                            if (this.props.action) {
                                                                                this.props.action('onChange')(event, value);
                                                                            }
                                                                            this.setState({ inputValueCulture: value });
                                                                        },
                                                                        onRequestRemoveSelectedOption: (event, data) => {
                                                                            this.setState({
                                                                                inputValueCulture: '',
                                                                                cultureSelection: data.selection,
                                                                            });
                                                                        },
                                                                        onSubmit: (event, { value }) => {
                                                                            if (this.props.action) {
                                                                                this.props.action('onChange')(event, value);
                                                                            }
                                                                            this.setState({
                                                                                inputValueCulture: '',
                                                                                cultureSelection: [
                                                                                    ...this.state.cultureSelection,
                                                                                    {
                                                                                        label: value,
                                                                                        icon: (
                                                                                            <Icon
                                                                                                assistiveText={{ label: 'Account' }}
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
                                                                            this.setState({
                                                                                inputValueCulture: '',
                                                                                cultureSelection: data.selection,
                                                                            });
                                                                        },
                                                                    }}

                                                                    menuMaxWidth="500px"
                                                                    multiple
                                                                    options={comboboxFilterAndLimit(
                                                                        this.state.inputValueCulture,
                                                                        1000,
                                                                        this.state.workerCultureOption,
                                                                        this.state.cultureSelection,
                                                                    )}
                                                                    selection={this.state.cultureSelection}
                                                                    value={this.state.inputValueCulture}                                                                    
                                                                />
                                                            </IconSettings>
                                                        </span>
                                                    </div>
                                                </fieldset>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Support Worker Gender</legend>
                                                    <div className="slds-form-element__control">
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="inout_chair_1" value="1" name="support_worker_gender" onChange={(e) => handleChange(this, e)} checked={(this.state.support_worker_gender && this.state.support_worker_gender == 1) ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-radio__label" htmlFor="inout_chair_1">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Female</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="inout_chair_2" value="2" name="support_worker_gender" onChange={(e) => handleChange(this, e)} checked={(this.state.support_worker_gender && this.state.support_worker_gender == 2) ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-radio__label" htmlFor="inout_chair_2">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Male</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="inout_chair_3" value="3" name="support_worker_gender" onChange={(e) => handleChange(this, e)} checked={(this.state.support_worker_gender && this.state.support_worker_gender == 3) ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-radio__label" htmlFor="inout_chair_3">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Either</span>
                                                            </label>
                                                        </span>
                                                    </div>
                                                </fieldset>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Community Access Support</legend>
                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="as_weekday" id="as_weekday" onChange={(e) => handleChange(this, e)} checked={(this.state.as_weekday && this.state.as_weekday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="as_weekday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Weekday</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="as_saturday" id="as_saturday" onChange={(e) => handleChange(this, e)} checked={(this.state.as_saturday && this.state.as_saturday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="as_saturday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Saturday</span>
                                                            </label>
                                                        </span>
                                                    </div>

                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="as_sunday" id="as_sunday" onChange={(e) => handleChange(this, e)} checked={(this.state.as_sunday && this.state.as_sunday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="as_sunday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Sunday</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="as_sleep_over" id="as_sleep_over" onChange={(e) => handleChange(this, e)} checked={(this.state.as_sleep_over && this.state.as_sleep_over == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="as_sleep_over">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Sleep Over</span>
                                                            </label>
                                                        </span>
                                                    </div>

                                                    <div className="slds-form-element__control row">
                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="as_active_night" id="as_active_night" onChange={(e) => handleChange(this, e)} checked={(this.state.as_active_night && this.state.as_active_night == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="as_active_night">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Active Night</span>
                                                            </label>
                                                        </span>

                                                        <span className="slds-checkbox ">
                                                            <input type="checkbox" name="as_public_holiday" id="as_public_holiday" onChange={(e) => handleChange(this, e)} checked={(this.state.as_public_holiday && this.state.as_public_holiday == '1') ? true : false} disabled={this.state.preferences_not_applicable} />
                                                            <label className="slds-checkbox__label" htmlFor="as_public_holiday">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Public Holiday</span>
                                                            </label>
                                                        </span>
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">In Home Shift Tasks</legend>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <Textarea
                                                                type="text"
                                                                className="slds-input"
                                                                name="in_home_shift_tasks"
                                                                placeholder=""
                                                                onChange={(e) => this.setState({ in_home_shift_tasks: e.target.value })}
                                                                value={this.state.in_home_shift_tasks}
                                                                disabled={this.state.preferences_not_applicable}
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Sleep Over Details</legend>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <Textarea
                                                                type="text"
                                                                className="slds-input"
                                                                name="sleep_over_details"
                                                                placeholder=""
                                                                onChange={(e) => this.setState({ sleep_over_details: e.target.value })}
                                                                value={this.state.sleep_over_details}
                                                                disabled={this.state.preferences_not_applicable}
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </div>

                                            <div className="col-md-6">
                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Community Access Shift Tasks</legend>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <Textarea
                                                                type="text"
                                                                className="slds-input"
                                                                name="community_access_shift_tasks"
                                                                placeholder=""
                                                                onChange={(e) => this.setState({ community_access_shift_tasks: e.target.value })}
                                                                value={this.state.community_access_shift_tasks}
                                                                disabled={this.state.preferences_not_applicable}
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>

                                                <fieldset className="slds-form-element mb-3">
                                                    <legend className="slds-form-element__legend slds-form-element__label">Active Night Details</legend>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <Textarea
                                                                type="text"
                                                                className="slds-input"
                                                                name="active_night_details"
                                                                placeholder=""
                                                                onChange={(e) => this.setState({ active_night_details: e.target.value })}
                                                                value={this.state.active_night_details}
                                                                disabled={this.state.preferences_not_applicable}
                                                            />
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="slds-panel__footer">
                                    <button type="button" className="slds-button slds-button_brand" onClick={this.onSubmit}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </BlockUi>
            </React.Fragment >
        );
    }

    addNewLanguage(lang) {
        return new Promise((resolve, reject) => {
            if (lang && lang.length) {
                let data = {			
                    "operation": "A",
                    "type": "14",
                    "code": lang.toUpperCase(),
                    "display_name": lang,
                    "definition": ""
                };
                this.setState({ loading: true });
                postData('recruitment/RecruitmentReferenceData/save_ref_data', data).then((result) => {
                    if (result.status) {
                        let wlo = this.state.workerLangOption;
                        wlo.push({id: result.id, label: lang});
                        this.setState({workerLangOption: wlo});
                        resolve(result.id);                        
                    } else {
                        reject(result.error);
                        toastMessageShow(result.error, "e");                
                    }
                    this.setState({ loading: false });
                });
            } 
        });               
    }
}
export default Preferences;