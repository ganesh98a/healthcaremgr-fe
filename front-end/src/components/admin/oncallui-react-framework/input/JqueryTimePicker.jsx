
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React,{ createRef }  from 'react';
import FormElement from './FormElement';
import Label from './Label';

const _supportsTimeInput = () => {
	const timeInput = document.createElement('input');
	timeInput.type = 'time';
	return timeInput.type === 'time';
};

const _getMilitaryTime = (isoFormat) => {
	const [ hours, minutes ] = isoFormat.split(':');
	return `${hours}:${minutes}`;
};

const _getAttr = ({ max, min, name, supportsTimeInput, value }) => {
	return supportsTimeInput
		? {
				max,
				min,
				type: 'time'
			}
		: {
				name,
				type: 'text',
				value
			};
};

export default class TimePicker extends React.Component {
	
	constructor() {
		super()
		this.inputRef = createRef()
	  }

	  
	state = {
		showButton: false,
		supportsTimeInput: false,
		value: '',
		stateUpdated: false,
		currentTimeValue:'',
		
	};

	componentDidMount() {
		const supportsTimeInput = _supportsTimeInput();
		this.setState({
			showButton: !supportsTimeInput,
			supportsTimeInput
		});
	}

	componentDidUpdate() {
		if (this.props.strValue && this.props.strValue.trim('').length > 0 && !this.state.stateUpdated) {
			const [ hours, minutes ] = [ ...this.props.strValue.split(':') ];
			let time = this.getFormatted_time(hours, minutes);
			this.setState({ value: time, stateUpdated: true });
		}
	}

	getFormatted_hours(hours) {
		if (hours > 12) {
			let value = hours - 12;
			return value < 10 ? '0' + value : value;
		}
		return hours == '00' ? 12 : hours;
	}

	OnBlurHandler = (e) => {
		if (this.props.onBlur) {
			this.props.onBlur(e);
		}
		this.outputTime();
	};
	getFormatted_time(hours, minutes) {
		if (minutes) {
			let formatted_hours = hours;
			let timePeriod = minutes.split(' ')[1];
			if (timePeriod == 'PM' && hours != 12) {
				formatted_hours = +hours + 12;
			}

			return formatted_hours + ':' + minutes.split(' ')[0];
		}
	}

	 
	handleOnInput = (e) => {
		const { value: targetValue } = e.target
        this.setState(({ supportsTimeInput }) => ({
            value: !supportsTimeInput && targetValue ? _getMilitaryTime(targetValue) : targetValue,
        }))
	    this.outputTime();
	};


	outputTime(){
		const [ hours, minutes ] =  this.inputRef.current.value.split(':');
		let timePeriod =hours > 11 ?'PM':'AM'
		let formatted_hours = this.getFormatted_hours(hours);
		const formatted_time = formatted_hours + ':' + minutes + ' ' + timePeriod;
		let currentDate = Date();
		this.props.onDateChange(formatted_time, currentDate);
	}
	render() {
		const { hint, inputId, label, labelId, max, min, name } = this.props;
		const { supportsTimeInput, value } = this.state;
		let classes = classNames('slds-form-element__control timepickerselected', this.props.className || []);
		const attr = _getAttr({ max, min, name, supportsTimeInput, value });
		let error = this.props.errorText || this.props.warningText || false;
		return (
			<FormElement errorText={error}>
				<div className={classes} /* onBlur={(e) => this.props.onBlur(e)} */>
					<label
						className="timepicker slds-form-element__label"
						htmlFor={inputId}
						style={{ width: 100 + '%' }}
					>
						<header className="timepicker__header" id={labelId}>
							<span className="timepicker__label">
								{this.props.required && (
									<abbr class="slds-required" title="required">
										*{' '}
									</abbr>
								)}
								{label}
							</span>
							<small className="timepicker__hint">{hint}</small>
						</header>

						<input
							aria-labelledby={labelId}
							autoCapitalize="on"
							autoComplete="off"
							autoCorrect="off"
							className="timepicker__input slds-input"
							id={inputId}
							onFocus={this.onFocusHandler}
							maxLength="10"
							value={this.state.value}
							onInput={this.handleOnInput}
							ref={this.inputRef}
							onBlur={(e) => {
								this.OnBlurHandler(e);
							}}
							onChange={(e)=>this.handleOnInput(e)}
							spellCheck="false"
							{...attr}
							disabled={!this.props.disabled ? false : true}
						/>
						{supportsTimeInput && <input name={name} type="hidden" value={this.state.value} />}
					</label>
				</div>
				{error && <Label errorText={this.props.errorText} warningText={this.props.warningText} text={error} />}
			</FormElement>
		);
	}
}

TimePicker.defaultProps = {
	buttonText: '📅',
	max: null,
	min: new Date(Date.now()).toISOString().split('T')[0]
};

TimePicker.propTypes = {
	buttonText: PropTypes.string,
	hint: PropTypes.string.isRequired,
	inputId: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	labelId: PropTypes.string.isRequired,
	max: PropTypes.string,
	min: PropTypes.string,
	name: PropTypes.string.isRequired
};


