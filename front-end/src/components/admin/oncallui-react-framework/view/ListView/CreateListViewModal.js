import React, { Component } from 'react';
import jQuery from "jquery";
import _ from 'lodash'
import 'react-select-plus/dist/react-select-plus.css';

import { checkItsNotLoggedIn, postData, toastMessageShow, handleChangeSelectDatepicker, checkLoginWithReturnTrueFalse, getPermission, handleChange  } from 'service/common.js';

import 'react-block-ui/style.css';

import 'service/jquery.validate.js';
import "service/custom_script.js";
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';

class CreateListViewModal extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            callAjax:false,
            user_view_by: this.props.user_view_by ? this.props.user_view_by : 1,
            list_name : this.props.toUpdate ? this.props.selected_filter_data.label : this.props.shareSettings ? this.props.selected_filter_data.label :''
        }

        this.formRef = React.createRef()
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
    }   

    componentDidMount() {
        
    }
     /**
     * To create and edit the list view control
     * @param list_name, user_view_by, related_type, filter_list_id
     */
    onSubmit = (e) => {
        e.preventDefault();
        jQuery(this.formRef.current).validate({ /* */ });
        this.setState({ validation_calls: true })

        if (!this.state.loading && jQuery(this.formRef.current).valid()) {
            this.setState({ loading: true });

            var req = {
                list_name: this.state.list_name,
                user_view_by: this.state.user_view_by,
                related_type: this.props.filter_related_type,
                filter_list_id: this.props.toUpdate ? this.props.selected_filter_data.value : this.props.shareSettings ? this.props.selected_filter_data.value : '',
                shareSettings: this.props.shareSettings
            }    

            postData('common/ListViewControls/create_update_list_view_controls', req).then((result) => {
                if (result.status) {
                    window.removeEventListener("popstate", this.props.onBackButtonEvent);
                    this.props.addListNameToUrlHash(this.state.list_name, result.list_id);
                    window.addEventListener("popstate", this.props.onBackButtonEvent);
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                    // this.props.get_default_pinned_data(this.props.filter_related_type);
                    this.props.get_list_view_related_type(this.props.filter_related_type);
                    this.props.get_list_view_controls_by_id(this.props.filter_related_type, result.list_id,'update','create');
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }    

    render() {        
        return (
            <div>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <div>
                        <Modal
                            isOpen={this.props.showModal}
                            footer={[
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                                <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                            ]}
                            onRequestClose={this.toggleOpen}
                            heading={this.props.shareSettings ? "Sharing Settings" : this.props.toUpdate ? "Rename" : "New List View"}
                            size="small"
                            className="slds_custom_modal"
                            onRequestClose={() => this.props.closeModal(false)}
                            dismissOnClickOutside={false}
                        >
                            <section className="manage_top" >
                                <div className="container-fluid">
                                    <form id="create_user" autoComplete="off" className="slds_form" ref={this.formRef} style={{ paddingBottom: 30, display: 'block' }}>
                                        <div className="row py-3">
                                          {!this.props.shareSettings  ? <div className="col-lg-12 col-sm-12" >
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">
                                                        <abbr class="slds-required" title="required">* </abbr>List Name</label>
                                                    <div class="slds-form-element__control">
                                                        <input type="text"
                                                            class="slds-input"
                                                            name="list_name"
                                                            placeholder="List Name"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'list_name')}
                                                            value={this.state.list_name || ''}                                                            
                                                            maxLength="40" 
                                                            data-rule-required="true" />
                                                    </div>
                                                </div>
                                            </div>   : ''}                                        
                                            {!this.props.toUpdate &&(<div className={!this.props.shareSettings ? 'col-lg-12 col-sm-12 mt-5' : 'col-lg-12 col-sm-12'}>
                                                <div className="slds-form-element ">
                                                    <label className="slds-form-element__label" htmlFor="select-01">Who sees this list view?</label>
                                                    <div className="slds-form-element__control">
                                                         <span className="slds-radio">
                                                            <input type="radio" id="aboriginal_1" value="1" name="user_view_by" onChange={(e) => handleChange(this,e)} checked={(this.state.user_view_by &&this.state.user_view_by == 1)?true:false}/>
                                                            <label className="slds-radio__label" htmlFor="aboriginal_1">
                                                            <span className="slds-radio_faux"></span>
                                                            <span className="slds-form-element__label">Only I can see this list view</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio">
                                                            <input type="radio" id="aboriginal_2" value="2" name="user_view_by" onChange={(e) => handleChange(this,e)} checked={(this.state.user_view_by &&this.state.user_view_by == 2)?true:false}/>
                                                            <label className="slds-radio__label" htmlFor="aboriginal_2">
                                                            <span className="slds-radio_faux"></span>
                                                            <span className="slds-form-element__label">All users can see this list view</span>
                                                            </label>
                                                        </span>
                                                    </div>
                                                    <div className="slds-form-element__control">
                                                                                    
                                                    </div>                                                    
                                                </div>
                                            </div>)}
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </Modal>
                    </div>
                </IconSettings>
            </div >
        );
    }
}

export default CreateListViewModal;
