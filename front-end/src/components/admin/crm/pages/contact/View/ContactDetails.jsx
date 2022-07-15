import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from "moment";
import OncallSingleRow from '../../../../oncallui-react-framework/input/OncallSingleRow';
import OncallFormWidget from '../../../../oncallui-react-framework/input/OncallFormWidget';
import FormElement from '../../../../oncallui-react-framework/input/FormElement';
import { postData} from 'service/common.js';
import { getAddressForViewPage } from '../../../../oncallui-react-framework/services/common';
class ContactDetails extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
			
            PhoneInput: [],
            EmailInput: [],
            gender_option: [],
            contact_type_option: [],
            source_option:[],
	
            //This needs to go inside component
            prefferedCommunication:  [
                {
                   id:     'communication_method_1',
                   label:  'Phone',
                   value:  '1'
                },
                {
                   id:     'communication_method_2',
                   label:  'Email',
                   value:  '2'
                },
                {
                   id:     'communication_method_3',
                   label:  'Post',
                   value:  '3'
                },
                {
                   id:     'communication_method_4',
                   label:  'SMS',
                   value:  '4'
                }
            ],
            
            isInterepreterReq: [
                {
                    id:     'interpreter_2',
                    label:  'Yes',
                    value:  '2'
                },
                {
                    id:     'interpreter_1',
                    label:  'No',
                    value:  '1'
                }
            ],
            
            aboriginalOptions: [
                {
                    id:     'aboriginal_1',
                    label:  'Aboriginal',
                    value:  '1'
                },
                {
                    id:     'aboriginal_2',
                    label:  'Torres Strait Islander',
                    value:  '2'
                },
                {
                    id:     'aboriginal_3',
                    label:  'Both',
                    value:  '3'
                },
                {
                    id:     'aboriginal_4',
                    label:  'Neither',
                    value:  '4'
                }
            ],
            
            statusOptions: [{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }],
            
        }
    }
    
    componentDidMount() {
        this.getOptionForCreateContact();
    }
    	
	componentWillReceiveProps(props) {
        if (props.PhoneInput.length === 0) {
            this.setState({ PhoneInput: [] })
        }

        if (props.PhoneInput.length > 0) {
            let phoneArray = [];        
            props.PhoneInput.map((phoneInput, id) => {
                if (phoneInput.phone) {
                    phoneArray.push('+61 ' + phoneInput.phone);
                }
            })
            this.setState({ PhoneInput: phoneArray })
        }

        if (props.EmailInput.length === 0) {
            this.setState({ EmailInput: [] })
        }

        if (props.EmailInput.length > 0) {
            let emailArray = [];        
            props.EmailInput.map((emailInput, id) => {
                emailArray.push(emailInput.email);
            })
            this.setState({ EmailInput: emailArray })
        }

        if(props.date_of_birth){
            var dateOfBirth = props.date_of_birth;

            var dateMoment = moment(dateOfBirth, "YYYY-MM-DD HH:mm:ss")
        
            if (dateMoment && dateMoment.isValid()) {
                this.setState({ date_of_birth : dateMoment.format(`YYYY-MM-DD HH:mm:ss`) })
            }
        }
    }
    
    getOptionForCreateContact = () => {
        postData('sales/Contact/get_option_for_create_contact', {}).then((result) => {
            if (result.status) {
                this.setState(result.data);
            }
        });
    }
    
    render() {
        var formProps = [
            {
                rowclass: 'row py-1 mb-3',
                child: [
                   { value: this.props.firstname, label: "First Name", name:"firstname" }, 
                   { value: this.props.middlename, label: "Middle Name", name:"middlename" }
                ],
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.lastname, label: "Last Name", name:"lastname" },
                    { value: this.props.previous_name, label: "Previous Name", name:"previous_name" }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.gender, label: "Gender", name:"gender", type:"select", options:this.state.gender_option},
                    { value: this.props.date_of_birth, label: "Date of Birth ('dd/mm/yyyy')", name:"date_of_birth", type:"date", format:"DD/MM/YYYY" }
               ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.state.PhoneInput && this.state.PhoneInput.length > 0 ? (this.state.PhoneInput) : 'N/A', label: "Phone", name:"phone", type:"multiple_text" }, 
                    { value: this.state.EmailInput, label: "Email", name:"email", type:"multiple_text" }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.contact_address && this.props.contact_address.is_manual_address=='1'? ( this.props.contact_address.manual_address ? getAddressForViewPage(this.props.contact_address.manual_address, this.props.contact_address.unit_number) : 'N/A' ):                                
                    this.props.contact_address ? getAddressForViewPage(this.props.contact_address.address, this.props.contact_address.unit_number) : 'N/A', label: "Address", name:"address_primary" }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.interpreter, label: "Is an interpreter required?", name:"interpreter", options:this.state.isInterepreterReq, type:"radio" }, 
                    { value: this.props.communication_method, label: "Preferred Communication Method", name:"communication_method",
                      options:this.state.prefferedCommunication, type:"radio"
                    }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.aboriginal, label: "Aboriginal or Torres Strait Islander heritage", name:"aboriginal", options:this.state.aboriginalOptions, type:"radio"},
                    { value: this.props.cultural_practices, label: "Cultural Practices Observed", name:"cultural_practices" }
               ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.religion, label: "Religion", name:"religion" },
                    { value: this.props.source_type_label, label: "Source", name:"source_type" }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [                
                    { value: this.props.contact_type, label: "Type", name:"contact_type", type:"select", options:this.state.contact_type_option },
                    { value: this.props.status, label: "Status", name:"status", type:"select", options:this.state.statusOptions }
                ]
            }
        ]

        return (
            <React.Fragment>
			<FormElement>
                    
                <OncallFormWidget formElement={formProps} />
                
                <div className="row py-1 mb-3">
                    <div className="col-lg-6 col-sm-6" id="ndis_number">
                        {
                            // Display NDIS if contact is account
                            (this.props.ndis_number || [1, '1'].indexOf(this.props.contact_is_account) >= 0) && (
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">NDIS number</label>
                                    <div className="slds-form-element__control">
                                        {this.props.ndis_number}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>

              </FormElement>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ContactDetails);