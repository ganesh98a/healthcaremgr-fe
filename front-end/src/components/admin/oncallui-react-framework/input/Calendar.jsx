import React from 'react'
import {connect} from 'react-redux'

import { SLDSISODatePicker } from 'components/admin/salesforce/lightning/SLDSISODatePicker';
import FormElement from './FormElement';
import { ARF } from "../services/ARF";
import Label from './Label';

class Calendar extends React.Component {
    static displayName = 'DatePicker';
    constructor(props) {
        super();
        this.state = {
            [props.name]: props.value,
        };
        this.name = props.name;
        this.value = this.state[this.name];
        this.datepickers = {}
        this.datepickers[this.name] = React.createRef()
    }



    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    handleChangeDatePicker = (dateYmdHis) => {
        if (dateYmdHis) {
            this.setState({[this.name]:dateYmdHis})
            this.props.onChange(dateYmdHis)
        }
    }

    componentDidUpdate(props, state) {
        if (props.value !== this.state[this.name]) {
            this.setState({[this.name]: props.value})
        }
    }

    render() {
        return (
            <FormElement>
                <Label required={this.props.required || false} text={this.props.label} />
                <div id={ARF.uniqid(this.props)} className="SLDS_date_picker_width">
                    <SLDSISODatePicker
                        ref={this.datepickers[this.name]}
                        onChange={(date)=>this.handleChangeDatePicker(date)}
                        value={this.state[this.name] || ''}
                        inputProps={{
                            name: this.name,
                        }}
                        required={true}
                        disabled={this.props.disabled}
                    />
                </div>
            </FormElement>
        );
    }
}
const mapStateToProps = state => ({

})

const mapDispatchtoProps = (dispatch) => {
    return {

    }
}
/**
 * @example <Calendar />
 * 
 */
export default connect(mapStateToProps, mapDispatchtoProps)(Calendar);
