import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, AjaxConfirm } from 'service/common.js';
import 'react-block-ui/style.css';
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import Checkbox from '@salesforce/design-system-react/lib/components/checkbox';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import Row from '../../../oncallui-react-framework/grid/Row';
import Col50 from '../../../oncallui-react-framework/grid/Col50';
import Col10 from '../../../oncallui-react-framework/grid/Col10';
import Col40 from '../../../oncallui-react-framework/grid/Col40';
import SelectList from "../../../oncallui-react-framework/input/SelectList";
import SectionContainer from '../../../oncallui-react-framework/grid/SectionContainer';
import jQuery from "jquery";


/**
 * RequestData get the data of member document
 * @param {int} documentId
 */
const requestReferenceData = (applicant_id, reference_id) => {

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


class ReferenceModal extends Component {
    /**
     * setting the initial prop values
     * @param {*} props
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            selected_stage: '',
            stage_options: [],
            selection: this.props.selection,
            reference_id: this.props.reference_id,
            full_name: '',
            phone: "",
            email: '',
            status: 1,
            notes: '',
            written_reference_check: false,
            status_options: [
                { id: 1, label: 'Approved', value: 1 },
                { id: 2, label: 'Rejected', value: 2 },
            ],
            applicant_id: this.props.applicant_id,
            applicantion_id: this.props.applicantion_id
        }
        this.formRef = React.createRef()
    }

    componentWillMount() {
        if (this.props.reference_id) {
            this.getReferenceDetails();
        }
    }

    /**
     * Get member document details by document id
     */
    getReferenceDetails = () => {
        requestReferenceData(
            this.props.applicant_id,
            this.props.reference_id
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    status: raData.status,
                    full_name: raData.name,
                    email: raData.email,
                    phone: raData.phone,
                    notes: raData.relevant_note,
                    written_reference_check: raData.written_reference,
                });
            }
        });
    }

    /**
     * Update stage for selected application
     * @patam {event} e
     */
    onSubmit = (e) => {
        e.preventDefault();

        var req = {
            id: this.state.reference_id,
            full_name: this.state.full_name,
            email: this.state.email,
            phone: this.state.phone,
            status: this.state.status,
            notes: this.state.notes,
            written_reference_check: this.state.written_reference_check,
            applicant_id: this.state.applicant_id,
            applicantion_id: this.state.applicantion_id
        }

        //Do stuff in here
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

        jQuery(this.formRef.current).validate();

        if (this.state.email !='' && !pattern.test(this.state.email)) {
            toastMessageShow("Please enter valid email address", "e");
            return false;
        }

        this.setState({ validation_calls: true })
        if (!this.state.loading && jQuery(this.formRef.current).valid()) {
            this.setState({ loading: true });
            postData('recruitment/RecruitmentReferenceData/create_update_reference', req).then((result) => {
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
     * mounting all the components
     */
    componentDidMount() {
        // to do..
    }

    /**
     * rendering components
     */
    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    size="small"
                    heading={this.props.headingTxt + ' Reference'}
                    isOpen={this.props.showModal}
                    footer={[
                        <Button disabled={this.state.loading} id="ref_cancel" label="Cancel" onClick={() => this.props.closeModal()} />,
                        <Button disabled={this.state.loading} id="ref_save" label="Save" variant="brand" onClick={this.onSubmit} />
                    ]}
                    onRequestClose={() => this.props.closeModal(false)}
                    dismissOnClickOutside={false}
                >
                    <SectionContainer className="mb-2">
                        <form id="reference" ref={this.formRef}>
                            <Row>
                                <Col50
                                    input={{
                                        name: "full_name",
                                        label: "Reference Full Name",
                                        required: true,
                                        onChange: (e) => this.setState({ "full_name": e.target.value }),
                                        value: this.state.full_name
                                    }}
                                />
                                <Col10
                                    class='phonenocode'
                                    input={{
                                        name: "",
                                        label: "Phone",
                                        value: "+61",
                                        disabled: true,
                                      
                                    }}
                                />
                                <Col40
                                    input={{
                                        name: "   ",
                                        label: "   ",
                                        required: true,
                                        onChange: (e) => {
                                            var re = /^[0-9\b]+$/;
                                            // if value is not blank, then test the regex
                                            if (e.target.value === '' || re.test(e.target.value)) {
                                                this.setState({ "phone": e.target.value })
                                            }
                                        },
                                       
                                        value: this.state.phone
                                    }}
                                />
                            </Row>
                            <Row>
                                <Col50
                                    input={{
                                        name: "email",
                                        label: "Email",
                                        required: false,
                                        onChange: (e) => this.setState({ "email": e.target.value }),
                                        value: this.state.email
                                    }}
                                />
                                <Col50>
                                    <SelectList
                                        label="Status"
                                        name="status"
                                        required={true}
                                        options={this.state.status_options}
                                        value={this.state.status}
                                        onChange={(value) => this.setState({ status: value })}
                                        disabled={this.props.reference_id ? false : true}
                                    />
                                </Col50>
                            </Row>
                            <Row>
                                <Col50>
                                    <label className="slds-form-element__label" htmlFor="text-input-id-2">Notes </label>
                                    <Textarea
                                        type="text"
                                        className="slds-input"
                                        name="notes"
                                        placeholder=""
                                        onChange={(e) => this.setState({ "notes": e.target.value })}
                                        value={this.state.notes}
                                    />
                                </Col50>
                                <Col50>
                                    <Checkbox
                                        assistiveText={{
                                            label: 'Written Reference Check',
                                        }}
                                        id="written_reference_check"
                                        labels={{
                                            label: 'Written Reference Check',
                                        }}
                                        name="written_reference_check"
                                        checked={this.state.written_reference_check}
                                        onChange={(e) => {
                                            let written_reference_check = !this.state.written_reference_check;
                                            this.setState({ written_reference_check: written_reference_check });
                                        }}
                                    />
                                </Col50>
                            </Row>
                        </form>
                    </SectionContainer>
                </Modal>
            </IconSettings>
        );
    }
}

export default ReferenceModal;
