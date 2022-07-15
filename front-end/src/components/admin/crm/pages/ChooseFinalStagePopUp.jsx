import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'
import classNames from 'classnames'
import jQuery from 'jquery'
import {
    IconSettings,
    Button,
} from '@salesforce/design-system-react'
import Modal from '@salesforce/design-system-react/lib/components/modal';
import SLDSReactSelect from './../../salesforce/lightning/SLDSReactSelect.jsx';

class ChooseFinalStagePopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }

    }

    render() {
      
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.openModal}
                    footer={[
                        <Button label="Cancel" onClick={() => this.props.closeModal(false)} />,
                        <Button label="Save" variant="brand" onClick={() => this.props.closeModal(true)} />,
                    ]}
                    onRequestClose={this.props.closeModal}
                    heading={"Choose Final Status"}
                    className="slds_custom_modal"
                    size="small"
                >

                    <form id="create_opp" autoComplete="off" className="px-4 col-md-12 slds_form" style={{height: "150px"}}>
                        <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr class="slds-required" title="required">* </abbr>Status</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect
                                               
                                                simpleValue={true}
                                                className="SLDS_custom_Select default_validation"
                                                simpleValue={true}
                                                searchable={false}
                                                placeholder="Please Select"
                                                clearable={false}
                                                options={this.props.option}
                                                onChange={(value) => this.props.onSelect(value)}
                                                value={this.props.selected_status || ''}
                                                required={true}
                                                name="selected_status"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                </Modal>
            </IconSettings>
        )
    }
}

export default ChooseFinalStagePopUp;