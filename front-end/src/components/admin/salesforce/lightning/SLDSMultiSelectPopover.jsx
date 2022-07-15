import React from 'react';
import { Checkbox, Combobox, IconSettings, Popover } from '@salesforce/design-system-react';


const languages = ['English', 'German', 'Tobagonian Creole English', 'Spanish'];

class SLDSMultiSelectPopover extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inputValue: '',
			selection: [],
			checked: [],
            options: this.props.options || [],
            label: this.props.label || 'Label',
		};
		this.handleClose = this.handleClose.bind(this);
	}

    componentWillUpdate() {
        if(this.props.updateState === true) {
            this.updateStateValue();
        }
    }

	getIsChecked(label) {
		let isChecked = false;
		const checkedIndex = this.state.checked.findIndex(
			(el) => el.value === label
		);
		if (checkedIndex > -1) isChecked = true;
		return isChecked;
	}

	getInputString = (options) => {
		let inputValue = '';
		if (options.length === 0) inputValue = 'Select an option';
		else if (options.length === 1) inputValue = `${options[0].label}`;
		else inputValue = `${options.length} options selected`;
		return inputValue;
	};

	handleCheckboxChange(targetChecked, target, value) {
		const { checked } = this.state;
		if (targetChecked) {
			checked.push({
				id: target.id,
                sa_line_item_id: value.sa_line_item_id,
				label: value.label,
                value: value.value,
			});
		} else {
			const valueIndex = checked.findIndex((el) => el.value === value.value);
			checked.splice(valueIndex, 1);
		}

		const inputValue = this.getInputString(checked);
		this.setState({ inputValue, checked });
	}

	handleClose(e, { trigger }) {
        let check_selection = [];
		if (trigger === 'cancel') {
			const inputValue = this.getInputString(this.state.selection);
			const selection =
				this.state.selection.length > 0 ? this.state.selection.slice(0) : [];
			this.setState({
				checked: selection,
				inputValue,
			});
            check_selection = selection;
		} else {
			const checked =
				this.state.checked.length > 0 ? this.state.checked.slice(0) : [];
			this.setState({
				selection: checked,
			});
            check_selection = checked;
		}
        if (this.props.onChange) {
            this.props.onChange(check_selection);
        }
	}
    
    updateStateValue = () => {
        const inputValue = this.getInputString(this.props.selection);
        this.setState({ 
            checked: this.props.selection,
            inputValue
        }, () => {
            if (this.props.updateSteaLineItemFalse) {
                this.props.updateSteaLineItemFalse();
            }            
        });
    }

	render() {
        let options = this.props.options || this.state.options;
		return (
			<IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
				<Combobox
					assistiveText={{
						popoverLabel: 'Language Options',
					}}
					id="combobox-dialog"
					
					labels={{
						label: this.state.label,
						placeholder: this.state.inputValue,
					}}
                    className="slds-popover-multiselect"
					popover={
						<Popover
                            footer=""
							    body={
								<div>
									<fieldset className="slds-form-element">										
										<div className="slds-form-element__control">
											{options.map((item, i) => (
												<Checkbox
													checked={this.getIsChecked(item.value)}
													id={`checkbox-${i}`}
													key={`checkbox-${i + 1}`}
													labels={{ label: item.label }}
													onChange={(e, { checked }) => {
														this.handleCheckboxChange(
															checked,
															e.target,
															item
														);
													}}
												/>
											))}
										</div>
									</fieldset>
								</div>
							}
							onClose={this.handleClose}
						/>
					}
					selection={this.state.selection}
					value={this.state.inputValue}
					variant="popover"
				/>
			</IconSettings>
		);
	}
}

export default SLDSMultiSelectPopover
