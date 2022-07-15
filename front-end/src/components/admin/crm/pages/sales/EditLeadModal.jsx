import '../../../../../service/custom_script.js';
import '../../../../../service/jquery.validate.js';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import jQuery from 'jquery';
import React from 'react';
import { connect } from 'react-redux';
import { postData, toastMessageShow } from '../../../../../service/common';
import LeadForm from './LeadForm';


/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof EditLeadModal.defaultProps} Props
 * 
 * Edit leads page. 
 * When this component mounts, this will fetch existing records by the provided id
 * 
 * @extends {React.Component<Props>}
 */
class EditLeadModal extends React.Component {
    static defaultProps = {
        open: false,

        /**
         * @type {(e: any|null) => void}
         */
        onClose: () => {},

        /**
         * @type {() => void}
         */
        onSuccess: () => {},

        /**
         * @type {number}
         */
        id: null,

        disabled: false,

        heading: `Edit lead`
    }

    constructor(props) {
        super(props);

        this.state = {            
            loading: false,
            redirectTo: null,
            isSubmitting: false,
            redirectPage: false, // will be populated after successful form submission
            lead: null, // will be populated when this component mounts
        }
    }

    async componentDidMount() {
        const { id } = this.props

        await this.fetchLeadDetails(id)
    }

    async fetchLeadDetails(id) {
        this.setState({ loading: true })
        try {
            const { status, data } = await postData(`sales/Lead/get_lead_details`, { id })
            if (status && data) {
                this.setState({ lead: data })
            }
        } catch (e) {
            console.error(e)
        } finally {
            this.setState({ loading: false })
        }
    }

    mapLeadStateToLeadProps(lead) {
        const { id, middlename,previous_name, lead_topic, lead_service_type_details, lead_owner, lead_owner_member, lead_source_code, lead_company, lead_description, lead_status, referrer_firstname, referrer_lastname, referrer_email, referrer_phone, referrer_relation } = lead || {}
        const { firstname, lastname, emails, phones } = lead || {}
        const { firstname: member_firstname, lastname: member_lastname } = lead_owner_member || {}

        return {
            lead_topic,
            id,
            lead_service_type : !lead_service_type_details ? null : {
                label: lead_service_type_details.display_name,
                value: lead_service_type_details.id,
            },
            EmailInput: emails || [{ email: '' }],
            PhoneInput: phones || [{ phone: '' }],
            lead_owner: !lead_owner ? null : {
                label: [member_firstname, member_lastname].filter(Boolean).join(` `),
                value: lead_owner,
            },
            lead_company: lead_company || '',
            lead_source_code: lead_source_code,
            lead_description: lead_description || '',
            lead_status: lead_status || null,
            firstname: firstname || '',
            lastname: lastname || '',
            email: [],
            referrer_firstname,
            referrer_lastname,
            referrer_email,
            referrer_phone,
            referrer_relation,
            middlename:middlename || '',
            previous_name:previous_name ||  ''
        }
    }


    onSubmit = (e, state) => {
        e.preventDefault();
        jQuery(`#EditLeadForm`).validate({});
    
        if (!this.state.loading && jQuery("#EditLeadForm").valid()) {
            this.setState({ loading: true, isSubmitting: true });
            postData('sales/Lead/update_lead', state).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg || '', 's')
                    this.setState({ redirectPage: true, isSubmitting: false }, () => this.props.onSuccess())
                    this.props.onSuccess();
                } else {
                    toastMessageShow(result.error || '', "e");
                    this.setState({ loading: false, isSubmitting: false })
                }
            });
        }
    }

    handleOnClose = (e) => {
        this.setState({ redirectPage: true }, () => this.props.onClose())
    }
    
    render() {
        if (!this.props.open) {
            return false;
        }

        return (
            <LeadForm 
                key={this.state.lead ? this.state.lead.id : Date.now()}
                id={`EditLeadForm`}
                className="slds-modal__container"
                loading={this.state.loading}
                isSubmitting={this.state.isSubmitting}
                lead={this.mapLeadStateToLeadProps(this.state.lead)} 
                onSubmit={(e, state) => this.onSubmit(e, state)}
                onCancel={this.handleOnClose}
                disabled={this.props.disabled}
                heading={this.props.heading}
            />
        )
    }
}

const mapStateToProps = state => ({
    
})

export default connect(mapStateToProps)(EditLeadModal)