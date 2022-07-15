import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import { ExpandableSection } from '@salesforce/design-system-react';
import Button from '@salesforce/design-system-react/lib/components/button';
import { lack_of_living_informal_option, living_informal_option, living_situation_option } from 'dropdown/SalesDropdown.js';
import jQuery from 'jquery';
import React, { Component } from 'react';
import { handleChange, postData, toastMessageShow } from 'service/common.js';


/**
 * Class: CreateLivingSituation
 */
class CreateLivingSituation extends Component {
    constructor(props) {
        super(props);

        // Initialize state
        this.state = {
            isOpenLivSitun: true,
        }
    }

    /**
     * Call the create api when user save living situation
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#living_situation").validate({ /* */ });

        if (!this.state.loading && jQuery("#living_situation").valid()) {
            postData('sales/RiskAssessment/save_living_situation', { ...this.state, risk_assessment_id: this.props.risk_assessment_id }).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                } else {
                    // Trigger error pop 
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }
    }

    getLivingDetails = () => {
        postData('sales/RiskAssessment/get_living_situation_details', { risk_assessment_id: this.props.risk_assessment_id }).then((result) => {
            if (result.status) {
                this.setState(result.data)
            } else {
                // Trigger error pop 
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false });
        });
    }

    componentDidMount() {
        this.getLivingDetails();
    }

    /**
     * Render the display content
     */
    render() {
        var _living_situation_option = living_situation_option();
        var _living_informal_option = living_informal_option();
        var _lack_of_living_informal_option = lack_of_living_informal_option();


        return (
            <React.Fragment>
                {/* <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}> */}
                <ExpandableSection
                        id="controlled-expandable-section"
                        isOpen={this.state.isOpenLivSitun}
                        onToggleOpen={(event, data) => {
                            this.setState({ isOpenLivSitun: !this.state.isOpenLivSitun });
                        }}
                        title="Living Situation"
                    >
                        {/* <Modal
                        isOpen={this.props.openOppBox}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"Living Situation"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                    > */}
                        {/* <section className="manage_top" > */}
                            <div className="container-fluid">
                                <form id="living_situation" autoComplete="off" className="slds_form">
                                    <div class="slds-form">

                                        <label for="living_situation" class="error CheckieError" style={{ display: "block", width: "20%", marginBottom: '0px' }}></label>
                                        <fieldset class="slds-form-element slds-m-top_medium">
                                            <legend class="slds-form-element__legend slds-form-element__label">
                                                <abbr class="slds-required" title="required">* </abbr>Living Situation</legend>

                                            <div class="">
                                                {_living_situation_option.map((val, index) => (
                                                    <>
                                                        <span class="slds-radio" key={index + 1}>
                                                            <input
                                                                type="radio"
                                                                id={"alone" + index}
                                                                value={val.value}
                                                                name="living_situation"
                                                                required={true}
                                                                onChange={(e) => {
                                                                    handleChange(this, e);
                                                                    if (e.target.value != 4) {
                                                                        this.setState({ living_situation_agency: "" })
                                                                    }
                                                                }}
                                                                checked={val.value == this.state.living_situation ? true : false}
                                                            />
                                                            <label class="slds-radio__label" for={"alone" + index}>
                                                                <span class="slds-radio_faux"></span>
                                                                <span class="slds-form-element__label">{val.label}</span>
                                                            </label>
                                                        </span>

                                                        {val.sda_agencey_name ?
                                                            <div>
                                                                <label class="slds-form-element__label" for="Agency">Agency</label>
                                                                <div class="slds-form-element__control">
                                                                    <input name="living_situation_agency" type="text" id="Agency" placeholder="Agency"
                                                                        class="slds-input" disabled={this.state.living_situation == 4 ? false : true} required={true} onChange={(e) => handleChange(this, e)} value={this.state.living_situation_agency || ""} />
                                                                </div>
                                                            </div> : ""}
                                                    </>
                                                ))}
                                            </div>
                                        </fieldset>


                                        <fieldset class="slds-form-element slds-m-top_medium">
                                            <label for="informal_support" class="error CheckieError" style={{ display: "block", width: "20%", marginBottom: '0px' }}></label>
                                            <legend class="slds-form-element__legend slds-form-element__label">
                                                <abbr class="slds-required" title="required">* </abbr>Informal Support</legend>
                                            <div class="">
                                                {_living_informal_option.map((val, index) => (
                                                    <>
                                                        <span class="slds-radio">
                                                            <input
                                                                type="radio"
                                                                id={"Informal_" + index}
                                                                value={val.value}
                                                                name="informal_support"
                                                                required={true}
                                                                onChange={(e) => {
                                                                    handleChange(this, e);
                                                                    if (e.target.value != 2) {
                                                                        this.setState({ informal_support_describe: "" })
                                                                    }
                                                                }}
                                                                checked={val.value == this.state.informal_support ? true : false}
                                                            />
                                                            <label class="slds-radio__label" for={"Informal_" + index}>
                                                                <span class="slds-radio_faux"></span>
                                                                <span class="slds-form-element__label">{val.label}</span>
                                                            </label>
                                                        </span>

                                                        {val.other ?
                                                            <div class="slds-form-element__control">
                                                                <input name="informal_support_describe" type="text" disabled={this.state.informal_support == 2 ? false : true} placeholder="" class="slds-input" required={true} onChange={(e) => handleChange(this, e)} value={this.state.informal_support_describe || ""} />
                                                            </div> : ""}
                                                    </>
                                                ))}
                                            </div>
                                        </fieldset>


                                        <fieldset class="slds-form-element slds-m-top_medium slds-m-bottom_medium">
                                            <label for="lack_of_informal_support" class="error CheckieError" style={{ display: "block", width: "20%", marginBottom: '0px' }}></label>
                                            <legend class="slds-form-element__legend slds-form-element__label">
                                                <abbr class="slds-required" title="required">* </abbr>Risk due to lack of informal support</legend>
                                            <div class="">
                                                {_lack_of_living_informal_option.map((val, index) => (
                                                    <>
                                                        <span class="slds-radio">
                                                            <input
                                                                type="radio"
                                                                id={"lack_" + index}
                                                                value={val.value}
                                                                name="lack_of_informal_support"
                                                                required={true}
                                                                onChange={(e) => handleChange(this, e)}
                                                                onChange={(e) => {
                                                                    handleChange(this, e);
                                                                    if (e.target.value != 2) {
                                                                        this.setState({ lack_of_informal_support_describe: "" })
                                                                    }
                                                                }}
                                                                checked={val.value == this.state.lack_of_informal_support ? true : false}
                                                            />
                                                            <label class="slds-radio__label" for={"lack_" + index}>
                                                                <span class="slds-radio_faux"></span>
                                                                <span class="slds-form-element__label">{val.label}</span>
                                                            </label>
                                                        </span>

                                                        {val.other ?
                                                            <div class="slds-form-element__control">
                                                                <input name="lack_of_informal_support_describe" disabled={this.state.lack_of_informal_support == 2 ? false : true} type="text" id="stacked-input-id-01"
                                                                    class="slds-input" required={true} onChange={(e) => handleChange(this, e)} value={this.state.lack_of_informal_support_describe || ""} />
                                                            </div> : ""}
                                                    </>
                                                ))}
                                            </div>
                                        </fieldset>
                                        <div className="slds-panel__footer py-2">
                                        <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />
                                        </div>                    
                                    </div>
                                </form>
                            </div>
                        {/* </section> */}
                    {/* </Modal> */}
                    </ExpandableSection>
                {/* </IconSettings> */}
            </React.Fragment>
        );
    }
}

export default CreateLivingSituation;
