import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow} from 'service/common.js';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import LeadForm from './LeadForm'

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof CreateLeadModal.defaultProps} Props
 * 
 * Create leads modal
 * 
 * @extends {React.Component<Props>}
 */
class CreateLeadModal extends Component {

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

        heading: `Create Lead`
    }

    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {            
            loading: false,
            isSubmitting: false,
            redirectPage: false,
            lead_service_type_id:''
        }
    }

    onSubmit = (e, state) => {
        e.preventDefault();
        jQuery("#CreateLeadForm").validate({ /* */ });
    
        if (!this.state.loading && jQuery("#CreateLeadForm").valid()) {
            this.setState({ loading: true, isSubmitting: true });
            console.log("---", state);
            postData('sales/Lead/create_lead', state).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    toastMessageShow(msg || '', 's')
                    this.setState({ redirectPage: true, isSubmitting: false }, () => this.props.onSuccess())
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false, isSubmitting: false })
                }
            });
        }
    }

    handleOnClose = e => {
        this.setState({ redirectPage: true }, () => this.props.onClose())
    }

    
    render() {
        if (!this.props.open) {
            return false;
        }

        return (
            <LeadForm 
                onSubmit={(e, state) => this.onSubmit(e, state)}
                id={`CreateLeadForm`}
                loading={this.state.loading}
                isSubmitting={this.state.isSubmitting}
                lead={null}
                onCancel={this.handleOnClose}
                heading={this.props.heading}
            />
        )
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

export default connect(mapStateToProps, mapDispatchtoProps)(CreateLeadModal);