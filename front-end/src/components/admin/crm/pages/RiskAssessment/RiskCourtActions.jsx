import React from 'react'
import _ from 'lodash';
import classNames from 'classnames'
import jQuery from "jquery";

import { 
    Checkbox,
    ExpandableSection,
    RadioGroup,
    Radio
} from '@salesforce/design-system-react';

import { postData, css, toastMessageShow } from '../../../../../service/common'

/**
 * Get the court action information
 * @param {int} riskAssessmentId
 */
const requestRACAData = (riskAssessmentId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { risk_assessment_id: riskAssessmentId };
        postData('sales/RiskAssessment/get_court_action_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
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

/**
 * @typedef {typeof RiskCourtActions.defaultProps} Props
 *
 * Displays the cour action with heading
 * 
 * @extends {React.Component<Props>}
 */
class RiskCourtActions extends React.Component {

    static defaultProps = {
        risk_assessment_id: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            isOpenOrder: true,
            not_applicable: false,
            inter_order: false,
            com_ser_order: false,
            com_cor_order: false,
            submitDisabled: true,
        }
    }

    componentWillMount() {
        const id = this.props.risk_assessment_id;
        this.getRACADetails(id);
    }

    /**
     * Call requestRACAData
     * param {int} id
     */
    getRACADetails = (id) => {
        requestRACAData(
            id,
        ).then(res => {
            var raData = res.data;
            var state = this.state;
            if (raData.not_applicable) {
                state['not_applicable'] = raData.not_applicable == '2' ? true : false;
            }
            if (raData.inter_order) {
                state['inter_order'] = raData.inter_order == '2' ? 'Yes' : 'No';
            }
            if (raData.com_ser_order) {
                state['com_ser_order'] = raData.com_ser_order == '2' ? 'Yes' : 'No';
            }
            if (raData.com_cor_order) {
                state['com_cor_order'] = raData.com_cor_order == '2' ? 'Yes' : 'No';
            }
            this.setState(state);
        });
    }

    /**
     * Order option list
     */
    orderOptions = () => {
        const values = ['No', 'Yes'];
        const orders_group = [
            { 
                label: 'Intervention Orders',
                required: true,
                name: 'inter_order',
                disabled: this.state.not_applicable,
            },
            {
                label: 'Community Service Orders',
                required: true,
                name: 'com_ser_order',
                disabled: this.state.not_applicable,
            },
            {
                label: 'Community Correction Orders',
                required: true,
                name: 'com_cor_order',
                disabled: this.state.not_applicable,
            },
        ];
        return orders_group.map((value) => (
            <RadioGroup
                labels={value}
                onChange={(event) => {
                    this.setState({ [value.name]: event.target.value, submitDisabled: false })
                }}
                disabled={value.disabled}
                required={this.props.required}
                name={value.name}
            >
                { values.map((item) => (
                    <Radio
                        className={"radio-btn-display"}
                        key={item}
                        labels={{ label: item }}
                        value={item}
                        checked={this.state[`${value.name}`] === item}
                        variant="base"
                    />
                ))}
            </RadioGroup>
        ));
    }

    /**
     * Save Order
     * @param {Obj event} e 
     */
    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#risk_assessent_order").validate({ /* */ });
        
        if (jQuery("#risk_assessent_order").valid()) {
            this.setState({ loading: true });
            const not_applicable = this.state.not_applicable;
            const stateValue = {};
            // Check value is not null
            let com_cor_order = this.state.com_cor_order;
            if (com_cor_order) {
                com_cor_order = com_cor_order == 'Yes' ? 2 : 1;
            }
            let com_ser_order = this.state.com_ser_order;
            if (com_ser_order) {
                com_ser_order = com_ser_order == 'Yes' ? 2 : 1;
            }
            let inter_order = this.state.inter_order;
            if (inter_order) {
                inter_order = inter_order == 'Yes' ? 2 : 1;
            }
            stateValue['com_cor_order'] = com_cor_order;
            stateValue['com_ser_order'] = com_ser_order;
            stateValue['inter_order'] = inter_order;
            stateValue['risk_assessment_id'] = this.props.risk_assessment_id;
            stateValue['not_applicable'] = not_applicable ? 2 : 1;
            // Api call
            postData('sales/RiskAssessment/save_court_action', stateValue).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ submitDisabled: true });
                } else {
                    toastMessageShow(result.error, "e");
                }
            });
        }
    }

    render() {
        const styles = css({
            panel_body: {
                paddingLeft: '0.5rem'
            },
            hr: {
                marginTop: '0.5rem',
                marginBottom: '0.75rem',
                border: 0,
                borderTop: '1px solid #eee',
                width: 'auto'
            },
        })

        return (
            <React.Fragment>
                <div className="slds-detailed-tab">
                    <ExpandableSection
                        id="controlled-expandable-section"
                        isOpen={this.state.isOpenOrder}
                        onToggleOpen={(event, data) => {
                            this.setState({ isOpenOrder: !this.state.isOpenOrder });
                        }}
                        title="Orders"
                    >
                        <form id="risk_assessent_order" autoComplete="off" className="col-md-12 slds_form">
                            <div style={styles.panel_body}>
                                <div className="slds-form-element">
                                    <div className="slds-form-element__control">
                                        <div className="slds-checkbox">
                                            <Checkbox
                                                assistiveText={{
                                                    label: 'Not Applicable',
                                                }}
                                                id="not_applicable"
                                                labels={{
                                                    label: 'Not Applicable',
                                                }}
                                                checked={this.state.not_applicable}
                                                onChange={(e) => {
                                                    let na_value_opt = !this.state.not_applicable;
                                                    this.setState({ not_applicable: na_value_opt, submitDisabled: false });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {this.orderOptions()}
                                <div className="slds-panel__footer py-2">
                                    <button type="button" disabled={this.state.submitDisabled} className="slds-button slds-button_brand" onClick={this.onSubmit}>Save</button>
                                </div>
                            </div>
                        </form>
                        <hr style={styles.hr}/>
                    </ExpandableSection>
                </div>
            </React.Fragment>
        )
    }
}

export default RiskCourtActions;
