import React from 'react';
import PropTypes from 'prop-types';
import jQuery from "jquery"

export default class ReactGoogleAutocomplete extends React.Component {
    static propTypes = {
        onPlaceSelected: PropTypes.func,
        types: PropTypes.array,
        componentRestrictions: PropTypes.object,
        bounds: PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.autocomplete = null;
        this.event = null;
    }

    componentDidMount() {
        const { types = ['(cities)'], componentRestrictions, bounds, } = this.props;
        const config = {
            types,
            bounds,
        };

        if (componentRestrictions) {
            config.componentRestrictions = componentRestrictions;
        }

        this.disableAutofill();

        if (window.google) {
            this.autocomplete = new window.google.maps.places.Autocomplete(this.refs.input, config);
            // this.autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
    
            this.event = this.autocomplete.addListener('place_changed', this.onSelected.bind(this));
        }
    }

    disableAutofill() {
        // Autofill workaround adapted from https://stackoverflow.com/questions/29931712/chrome-autofill-covers-autocomplete-for-google-maps-api-v3/49161445#49161445
        if (window.MutationObserver) {
            const observerHack = new MutationObserver(() => {
                observerHack.disconnect();
                if (this.refs && this.refs.input) {
                    this.refs.input.autocomplete = 'disable-autofill';
                }
            });
            observerHack.observe(this.refs.input, {
                attributes: true,
                attributeFilter: ['autocomplete'],
            });
        }
    }

    componentWillUnmount() {
        if (this.event) {
            this.event.remove();
        }
    }

    onSelected() {
        if (this.props.onPlaceSelected) {
            var foundaddress = this.refs.input.value;
            var x = foundaddress.split(",");
            var actual_street = x[0];

            var google_address = this.autocomplete.getPlace();
            var google_address_updated = this.autocomplete.getPlace().formatted_address
            var y = google_address_updated.split(",");
            y[0] = actual_street;

            var updated_with_street = y.join(',');

            google_address["formatted_address"] = updated_with_street;

            this.props.onPlaceSelected(google_address);
            // jQuery.ajax({
            //     url: "https://maps.googleapis.com/maps/api/geocode/json",
            //     type: 'GET',
            //     dataType: 'JSON',
            //     data: { 'address': foundaddress, 'key': 'AIzaSyAV5zEPxeuJ0zeO_ue62RgqMwZN9cUVgJ4' },
            //     success: (data) => {
            //         if (data.status === "OK") {
            //             var address = data["results"][0];
            //             console.log(address);
            //             console.log(this.autocomplete.getPlace());
            //             this.props.onPlaceSelected(address);
            //         } else {
            //             var address = this.autocomplete.getPlace()
            //             this.props.onPlaceSelected(this.autocomplete.getPlace());
            //         }
            //     },
            //     error: (xhr) => {

            //     }
            // });
        }
    }

    render() {
        const { onPlaceSelected, types, componentRestrictions, bounds, ...rest } = this.props;

        return (
            <input
                ref="input"
                {...rest}
            />
        );
    }
}