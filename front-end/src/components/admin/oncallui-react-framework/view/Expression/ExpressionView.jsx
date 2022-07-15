import React from 'react';
import {IconSettings} from '@salesforce/design-system-react';
import Expression from './index';
import ExpressionGroup from './ExpressionGroup';
import ExpressionCondition from './ExpressionCondition';
import { toastMessageShow } from '../../services/common';

const OperatorsList = [
	{ value: 'equals', label: 'Equals' },
	{ value: 'notequalto', label: 'Does Not Equals' },
	{ value: 'greaterthan', label: 'Greater Than' },
	{ value: 'lessthan', label: 'Less Than' },
	{ value: 'lessorequal', label: 'Less or Equal' },
	{ value: 'greaterorequal', label: 'Greater or Equal' },
	{ value: 'contains', label: 'Contains' },
	{ value: 'doesnotcontains', label: 'Does not Contain' },
	{ value: 'startswith', label: 'Starts With' },
	{ value: 'changesto', label: 'Changes To' },
];

function log(obj) {
    console.log(obj);
}

class ExpressionView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			conditions: [
				
			],
			triggerType: 'all',
			customLogic: undefined,
		};
	}

	static getTriggerType(i, trigger) {
		if (trigger === 'custom') return String(i + 1);
		if (i > 0) {
			if (trigger === 'all') return 'AND';
			if (trigger === 'any') return 'OR';
		}
		return '';
	}

	updateData(i, val, type) {
		const { conditions } = this.state;
		if (type === 'value') conditions[i].value = val;
		else conditions[i][type] = val; //val.selection[0].id;
		this.setState({ conditions }, () => this.props.onUpdate(this.state));
	}

	getOperatorSelected(i, j, type) {
		const { conditions } = this.state;
		if (j !== undefined) {
			return conditions[i]["conditions"][j][type];
		}
		return conditions[i][type];
	}

	updateSubData(i, j, val, type) {
		const { conditions } = this.state;
		if (type === 'value') {
			conditions[i].conditions[j].value = val;
		} else {
			conditions[i].conditions[j][type] = val; //val.selection[0].id;
		}
		this.setState({ conditions }, () => this.props.onUpdate(this.state));
	}

	getSubData(i, j, type) {
		const { conditions } = this.state;
		let value = "";
		if (type === 'value') {
			value = conditions[i].conditions[j].value;
		} else {
			value = conditions[i].conditions[j][type];
		}
		return value;
	}

	updateFormula(data, type) {
		const { conditions } = this.state;
		conditions[type] = data;
		this.setState({ conditions });
	}

	addCondition() {
		const { conditions } = this.state;
		const newCondition = {
			isGroup: false,
			field: '',
			operator: '',
			value: '',
		};
		conditions.push(newCondition);
		this.setState({ conditions });
	}

	addSubCondition(i) {
		const { conditions } = this.state;
		const newCondition = {
			field: '',
			operator: '',
			value: '',
		};
		conditions[i].conditions.push(newCondition);
		this.setState({ conditions });
	}

	deleteCondition(i) {
		const { conditions } = this.state;
		if (conditions.length > 1) {
			conditions.splice(i, 1);
			this.setState({ conditions }, () => {this.props.onDelete(i); this.props.onUpdate(this.state);});
		} else {
			const newCondition = {
				resource: '',
				operator: '',
				value: '',
			};
			this.setState({ conditions: [newCondition] });
		}
	}

	deleteSubCondition(i, j) {
		const { conditions } = this.state;
		if (conditions[i].conditions.length > 1) {
			conditions[i].conditions.splice(j, 1);
			this.setState({ conditions }, () => {this.props.onDelete(i, j); this.props.onUpdate(this.state);});
		} else {
			conditions.splice(i, 1);
			this.setState({ conditions }, () => {this.props.onDelete(i); this.props.onUpdate(this.state);});
		}
	}

	addGroup() {
		if (!this.props.isChild) {
			const { conditions } = this.state;
			const newCondition = {
				field: '',
				operator: '',
				value: '',
			};
			const newGroup = {
				isGroup: true,
				triggerType: 'all',
				conditions: [newCondition],
			};
			conditions.push(newGroup);
			this.setState({ conditions });
		}
	}

	updateGroupData(i, val, type) {
		const { conditions } = this.state;
		conditions[i][type] = val;
		this.setState({ conditions }, () => this.props.onUpdate(this.state));
	}

	componentDidUpdate(prevProps) {
		if (prevProps.expression.conditions && prevProps.expression.conditions.length !== this.state.conditions.length) {
			this.setState({...prevProps.expression});
		}
	}

	onTriggerChange(data) {
		let conditions = this.state.conditions;
		let temp = [];
		if (data.triggerType === "custom") {
            conditions.map((con, i) => {
            	if (!con.isGroup) {
            		temp.push(con);
            	} 
				else {
            		toastMessageShow("Remove Condition Group");
					return false;
            	}
            });
            conditions = temp;
		}
		return conditions;
	}

	render() {
		return (
			<IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
				<Expression
					id="expression-view"
					events={{
						onChangeTrigger: (event, data) => {
							let conditions = this.onTriggerChange(data);
							if (data.triggerType === "custom" && conditions === false) {
								return false;
							}
							this.setState({ triggerType: data.triggerType, customLogic: '', conditions }, () => this.props.onUpdate(this.state));
						},
						onChangeCustomLogicValue: (event, data) => {
							log();
							this.setState({ customLogic: data.value }, () => this.props.onUpdate(this.state));
						},
						onAddCondition: (event) => {
							log();
							this.addCondition();
						},
						onAddGroup: (event) => {
							log();
							this.addGroup();
						},
					}}
					triggerType={this.state.triggerType}
					customLogicValue={this.state.customLogic}
					labels={{title: "", takeAction: ""}}
				>
					{this.state.triggerType === 'formula' ? (
						<div></div>
					) : (
						this.state.conditions && this.state.conditions.map((condition, i) =>
							!condition.isGroup ? (
								<ExpressionCondition
									focusOnMount
									/* eslint-disable-next-line react/no-array-index-key */
									key={i}
									index={i}
									id={`expression-condition-${i}`}
									labels={{
										label: ExpressionView.getTriggerType(i, this.state.triggerType),
									}}
									events={{
										onChangeOperator: (event, obj) => {
											log();
											this.updateData(i, obj, 'operator');
										},
										onChangeResource: (event, obj) => {
											log();
											this.updateData(i, obj, 'resource');
										},
										onClickResource: (event, obj) => {
											log();
											this.props.onClickResource(event, i);
										},
										onChangeValue: (event, data) => {
											log();
											this.updateData(i, data.value, 'value');
										},
										onDelete: (event) => {
											log();
											this.deleteCondition(i);
										},
									}}
									// resourcesList={ResourcesList}
									getResourceSelected={() => this.props.getResourceSelected(i)}
									operatorsList={OperatorsList}
									value={condition.value}
									operatorSelected={this.getOperatorSelected(i, undefined, "operator")}
									isGroup = {condition.isGroup}
                                    field_options={this.props.field_options}
                                    getValues={() => this.props.getValues(i)}
								/>
							) : (
								<ExpressionGroup
									focusOnMount
									/* eslint-disable-next-line react/no-array-index-key */
									key={i}
									id={`expression-group-${i}`}
									labels={{
										label: ExpressionView.getTriggerType(i, this.state.triggerType),
									}}
									events={{
										onChangeCustomLogicValue: (event, data) => {
											log();
											this.updateGroupData(i, data.value, 'customLogic');
										},
										onChangeTrigger: (event, data) => {
											log();
											this.updateGroupData(i, data.triggerType, 'triggerType');
										},
										onAddCondition: (event) => {
											log();
											this.addSubCondition(i);
										},
									}}
									customLogicValue={condition.customLogic}
									triggerType={condition.triggerType}
								>
									{condition.triggerType === 'formula' ? (
										<div></div>
										// <ExpressionFormula
										// 	id={`expression-group-${i}-formula`}
										// 	resourceCombobox={
										// 		<Combobox
										// 			labels={{
										// 				placeholder: 'Insert a Resource',
										// 			}}
										// 			id={`expression-group-${i}-formula-resource`}
										// 			options={ResourcesList}
										// 			variant="inline-listbox"
										// 		/>
										// 	}
										// 	events={{
										// 		onClickCheckSyntax: (event, data) => log({
										// 			action: this.props.action,
										// 			event,
										// 			eventName: `Check Syntax Button Clicked`,
										// 			data: null,
										// 		}),
										// 		onClickHelp: (event, data) => log({
										// 			action: this.props.action,
										// 			event,
										// 			eventName: `Get Help Button Clicked`,
										// 			data: null,
										// 		}),
										// 	}}
										// 	functionCombobox={
										// 		<Combobox
										// 			labels={{
										// 				placeholder: 'Insert a Function',
										// 			}}
										// 			id={`expression-group-${i}-formula-function`}
										// 			options={ResourcesList}
										// 			variant="inline-listbox"
										// 		/>
										// 	}
										// 	operatorInput={
										// 		<Input
										// 			assistiveText={{ label: 'Insert a Operator' }}
										// 			id={`insert-operator-formula-${i}`}
										// 			placeholder="Insert a Operator"
										// 		/>
										// 	}
										// />
									) : (
										condition.conditions.map((c, j) => (
											<ExpressionCondition
												focusOnMount
												/* eslint-disable-next-line react/no-array-index-key */
												key={j}
												index={j}
												id={`expression-group-${i}-condition-${j}`}
												isSubCondition
												labels={{
													label: ExpressionView.getTriggerType(
														j,
														condition.triggerType
													),
												}}
												events={{
													onChangeOperator: (event, obj) => {
														log();
														this.updateSubData(i, j, obj, 'operator');
													},
													onChangeResource: (event, obj) => {
														log();
														this.updateSubData(i, j, obj, 'resource');
													},
													onClickResource: (event, obj) => {
														log();
														this.props.onClickResource(event, i, j);
													},
													onChangeValue: (event, data) => {
														log();
														this.updateSubData(i, j, data.value, 'value');
													},
													onDelete: (event) => {
														log();
														this.deleteSubCondition(i, j);
													},
												}}
												operatorsList={OperatorsList}
												operatorSelected={this.getOperatorSelected(i, j, "operator")}
												value={c.value}
												getResourceSelected={() => this.props.getResourceSelected(i, j)}
												getData={this.getSubData(i, j, "operator")}
												isGroup = {condition.isGroup}
                                                field_options={this.props.field_options}
                                                getValues={() => this.props.getValues(i, j)}
											/>
										))
									)}
								</ExpressionGroup>
							)
						)
					)}
				</Expression>
			</IconSettings>
		);
	}
}

export default ExpressionView;
