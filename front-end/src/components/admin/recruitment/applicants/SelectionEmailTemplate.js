import React, { Component } from 'react';
import { connect } from 'react-redux'
import Select from 'react-select-plus';
import { postData, toastMessageShow } from 'service/common.js';
import jQuery from "jquery";

class SelectionEmailTemplate extends Component {

    constructor() {
        super();
        this.state = {
            seek_answer_model: false,
            answerType: "",
        }
    }

    componentDidMount() {
        this.getEmailTemplateOption();
    }

    getEmailTemplateOption = () => {
        postData('imail/Templates/get_email_template_name', {}).then((result) => {
            if (result.status) {
                var sel_def = [{'label': "Do not send", 'value': "0"}];
                var sel_val = result.data;
                var sel_data = [];
                if(sel_val) {
                    sel_data = [...sel_def, ...sel_val];
                }
                else {
                    sel_data = sel_def;
                }
                this.setState({ email_template_option: sel_data });
            }
        });
    }

    onSubmit = () => {
        var validator = jQuery("#select_template").validate();
       
        if (jQuery("#select_template").valid()) {
            this.props.closeModel(true)
        }
    }

    render() {
        return (
            <div className={'customModal select_email_modal' + (this.props.openModel ? ' show' : '')}>
                <div className="cstomDialog widMedium">

                    <h3 className="cstmModal_hdng1--">
                        Select Email Template
                    <span className="closeModal icon icon-close1-ie" onClick={() => this.props.closeModel(false)}></span>
                    </h3>

                    <div className="modal_body_1_4__ ">
                        <form id="select_template">

                        <div className="sLT_gray left left-aRRow">
                            <Select 
                                name="participant_assessment"
                                simpleValue={true}
                                searchable={false}
                                clearable={false}
                                placeholder="Do not send" 
                                options={this.state.email_template_option}
                                value={this.props.selected_template}
                                onChange={(status) => this.props.selectTemplate(status)}
                                className={'custom_select default_validation'}
                                inputRenderer={() => <input type="text"  className="define_input" name={"selected_template"} value={this.props.selected_template || ''} />}
                            />
                        </div>

                        <button type="submit"
                            onClick={() => this.onSubmit()}
                            className="button_set0 button_set1 mt-2">Submit</button>
                        </form>    
                    </div>

                </div>
            </div>

        );
    }
}

const mapStateToProps = state => ({
   
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(SelectionEmailTemplate)