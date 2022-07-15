import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow} from 'service/common.js';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import ServiceBookingForm from './ServiceBookingForm'
/**
 * 
 * 
 * Create Service Booking modal
 * 
 * @extends {React.Component<Props>}
 */
class CreateServiceBookingModal extends Component {

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

        heading: `New Service Booking`,
        update_heading:`Edit Service Booking`
    }

    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {            
            loading: false,
            isSubmitting: false,
            redirectPage: false,
           
           
        }
    }

    /**
     * method used for validating and posting the data to the server
     */
    onSubmit = (e, state) => {
        e.preventDefault();
        jQuery("#CreateServiceBookingForm").validate({ /* */ });
        if (!this.state.loading && jQuery("#CreateServiceBookingForm").valid()) {
            this.setState({ loading: true, isSubmitting: true });
            postData('sales/ServiceBooking/create_update_service_booking', state).then((result) => {
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


    /**
     * on modal close it will trigger
     */

    handleOnClose = e => {
        this.setState({ redirectPage: true }, () => this.props.onClose())
    }

    
    render() {
        if (!this.props.open) {
            return false;
        }

        return (
            <ServiceBookingForm 
               open={this.props.open}
                onSubmit={(e, state) => this.onSubmit(e, state)}
                id={`CreateServiceBookingForm`}
                isUpdate={this.props.isUpdate}
                id_to_update={this.props.id_to_update}
                service_agreement_id={this.props.service_agreement_id}
                service_booking_creator={this.props.service_booking_creator}
                loading={this.state.loading}
                isSubmitting={this.state.isSubmitting}
                onCancel={this.handleOnClose}
                is_portal_managed={this.props.is_portal_managed}
                heading={this.props.isUpdate?this.props.update_heading:this.props.heading}
            />
        )
    }
}


export default CreateServiceBookingModal;