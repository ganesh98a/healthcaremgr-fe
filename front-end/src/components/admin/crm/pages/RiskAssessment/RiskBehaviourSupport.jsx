import React from 'react'
import _ from 'lodash';
import classNames from 'classnames'
import { Button,Checkbox, ExpandableSection,RadioGroup,Radio } from '@salesforce/design-system-react';
import { postData, css, toastMessageShow } from '../../../../../service/common'
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import { SLDSISODatePicker } from '../../../salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';
import EditBehvSuppModal from './EditBehvSuppModal'

/**
 * Get the court action information
 * @param {int} riskAssessmentId
 */
const requestRABSAData = (riskAssessmentId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { risk_assessment_id: riskAssessmentId };
        postData('sales/RiskAssessment/get_ra_behavsupport_by_id', Request).then((result) => {
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
 * @typedef {typeof RiskBehaviourSupport.defaultProps} Props
 *
 * Displays the cour action with heading
 * 
 * @extends {React.Component<Props>}
 */
class RiskBehaviourSupport extends React.Component {

    static defaultProps = {
        risk_assessment_id: null,
        behaviour_support_matrices: []
    }
    constructor(props) {
        super(props);
        this.state = {
            isBehaviourSupport: true,
            bs_not_applicable: false,
            bs_plan_status: "",
            seclusion: false,
            chemical_constraint: false,
            mechanical_constraint: false,
            physical_constraint: false,
            environmental: false,
            bs_noplan_status: false,
            bs_plan_available_date: '',
            isSubmitting: false,
            isOpenEditBehvSuppModal: false,
            likelyhoods: [
                { 'id': 1, 'name': 'Likely' },
                { 'id': 2, 'name': 'Very likely' },
                { 'id': 3, 'name': 'Un likely' }
            ]
        }
        this.datepickers = {
            bs_plan_available_date: React.createRef(),
        };
    }
    componentWillMount() {
        const id = this.props.risk_assessment_id;
        this.getRABSADetails(id);
    }
    /**
     * Call requestRACAData
     * param {int} id
     */
    getRABSADetails = (id) => {
        requestRABSAData(
            id,
        ).then(res => {
            var raData = res.data;
            var state = this.state;
            if (raData.bs_not_applicable) {
                state['bs_not_applicable'] = raData.bs_not_applicable == '2' ? true : false;
            }
             if (raData.bs_plan_status) {
                state['bs_plan_status'] = raData.bs_plan_status == '2' ? 'Yes' : 'No';
            }
            if (raData.seclusion) {
                state['seclusion'] = raData.seclusion == '2' ? true : false;
            }
            if (raData.chemical_constraint) {
                state['chemical_constraint'] = raData.chemical_constraint == '2' ? true : false;
            }
            if (raData.mechanical_constraint) {
                state['mechanical_constraint'] = raData.mechanical_constraint == '2' ? true : false;
            }
            if (raData.physical_constraint) {
                state['physical_constraint'] = raData.physical_constraint == '2' ? true : false;
            }
            if (raData.environmental) {
                state['environmental'] = raData.environmental == '2' ? true : false;
            }
            if(raData.bs_plan_available_date){
                state['bs_plan_available_date'] = raData.bs_plan_available_date;
            }
            if (raData.bs_noplan_status) {
                state['bs_noplan_status'] = raData.bs_noplan_status == '2' ? true : false;
            }
            this.setState(state);
        });
    }
    onSubmit = (e) => {
        e.preventDefault();
        this.setState({ loading: true });
        const bs_not_applicable = this.state.bs_not_applicable;
        let checkcondition = 1;
        const stateValue = {};
        if (this.state.bs_not_applicable) {
            checkcondition = 1;
        }
        if (!this.state.bs_not_applicable && !this.state.bs_plan_status) {
            toastMessageShow('Behaviour Support Plan is Mandatory (last 12m)', 'e');
            checkcondition = 0;
            return false;
        }
        if ((!this.state.bs_not_applicable) && (this.state.bs_plan_status == "Yes") && (this.state.seclusion == false &&
            this.state.chemical_constraint == false &&
            this.state.mechanical_constraint == false &&
            this.state.physical_constraint == false &&
            this.state.environmental == false)) {
            toastMessageShow('Select Any Restrictive Practices is Mandatory', 'e');
            checkcondition = 0;
            return false;
        }
        if (!this.state.bs_not_applicable && !this.state.bs_noplan_status && (this.state.bs_plan_available_date == "" || this.state.bs_plan_available_date == null)) {
            toastMessageShow('Select Plan Available Date is Mandatory', 'e');
            checkcondition = 0;
            return false;
        }
        if (checkcondition = 1) {
            stateValue['bs_not_applicable'] = this.state.bs_not_applicable ? 2 : 1;
           
            let bs_plan_status = this.state.bs_plan_status;
            if (bs_plan_status != "") {
                bs_plan_status = bs_plan_status == 'Yes' ? 2 : 1;
            }
            let seclusion = this.state.seclusion;
            if (seclusion) {
                seclusion =  this.state.seclusion ? 2 : 1;
            }
            let chemical_constraint = this.state.chemical_constraint;
            if (chemical_constraint) {
                chemical_constraint =  this.state.chemical_constraint ? 2 : 1;
            }
            let mechanical_constraint = this.state.mechanical_constraint;
            if (mechanical_constraint) {
                mechanical_constraint = this.state.mechanical_constraint ? 2 : 1;
            }
            let physical_constraint = this.state.physical_constraint;
            if (physical_constraint) {
                physical_constraint = this.state.physical_constraint ? 2 : 1;
            }
            let environmental = this.state.environmental;
            if (environmental) {
                environmental = this.state.environmental ? 2 : 1;
            }
            stateValue['bs_plan_status'] = bs_plan_status;
            stateValue['seclusion'] = seclusion;
            stateValue['chemical_constraint'] = chemical_constraint;
            stateValue['mechanical_constraint'] = mechanical_constraint;
            stateValue['physical_constraint'] = physical_constraint;
            stateValue['environmental'] = environmental;
            stateValue['bs_noplan_status'] = this.state.bs_noplan_status ? 2 : 1;
            stateValue['bs_plan_available_date'] = this.state.bs_plan_available_date;
            stateValue['risk_assessment_id'] = this.props.risk_assessment_id;
            // Api call
            postData('sales/RiskAssessment/save_behaviuor_support', stateValue).then((result) => {
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
    /**
     * Call saveCourtAction
     * param {str} name
     * param {str} value
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.isOpenEditBehvSuppModal && (
                        <EditBehvSuppModal
                            key={this.props.risk_assessment_id}
                            isOpen={this.state.isOpenEditBehvSuppModal}
                            onClose={() => this.setState({ isOpenEditBehvSuppModal: false })}
                            onSuccess={() => this.setState({ isOpenEditBehvSuppModal: false }, this.props.onUpdate)}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }
    /**
     * Render Behaviour table
     */
    renderBehaviourTable() {
        let count = this.props.behvsupportmatrices ? this.props.behvsupportmatrices.length : 0;
        return (
            <SLDSReactTable
                PaginationComponent={() => <React.Fragment />}
                data={this.props.behvsupportmatrices}
                defaultPageSize={count}
                sortable={false}
                resizable={true}
                columns={[
                    {
                        accessor: 'behaviuor',
                        id: 'behaviour',
                        Header: 'Behaviour'
                    },
                    {
                        accessor: 'likelyhood_id',
                        id: 'likelyhood_id',
                        Header: 'Likelyhood',
                        Cell: props => {
                            const { original } = props;
                            let likelyhoodname = "";
                            if (props.value == 1) {
                                likelyhoodname = 'Likely'
                            }
                            else if (props.value == 2) {
                                likelyhoodname = 'Very likely'
                            }
                            else if (props.value == 3) {
                                likelyhoodname = 'Un likely'
                            }
                            return <abbr title={likelyhoodname}>{likelyhoodname}</abbr>

                        }
                    },

                    {
                        accessor: 'trigger',
                        id: 'trigger',
                        Header: 'Trigger',
                    },
                    {
                        accessor: 'prevention_strategy',
                        id: 'prevention_strategy',
                        Header: 'Prevention Strategy',
                    },
                    {
                        accessor: 'descalation_strategy',
                        id: 'descalation_strategy',
                        Header: 'De-escalation Strategies',
                    },
                ]}
            />
        )
    }
    /**
     * Render not applicable bs_noplan_status
     */
    renderNotApplicable = () => {
        const styles = css({
            btn_align_right: {
                float: 'right',
            },
        })
        return (
            <div className="row px-2 pb-2">
                <div className="slds-checkbox">
                    <Checkbox
                        assistiveText={{
                            label: 'Not Applicable',
                        }}
                        id="bs_not_applicable"
                        labels={{
                            label: 'Not Applicable',
                        }}
                        checked={this.state.bs_not_applicable}
                        onChange={(e) => {
                            let na_value_opt = !this.state.bs_not_applicable;
                            // let na_value = na_value_opt ? 'Yes' : 'No';
                            this.setState({ bs_not_applicable: na_value_opt, submitDisabled: false });
                        }}
                    />
                </div>

                <Button className="slds-button slds-button_brand" disabled={this.state.bs_not_applicable} label="Edit" style={styles.btn_align_right} onClick={e => this.setState({ isOpenEditBehvSuppModal: true })} />
            </div>
        );
    }
    /**
     * Save the selected plan date
     * @param {date} dateYmdHis 
     * @param {obj} e 
     * @param {} data
     */
    handleChangeDatePicker = key => (dateYmdHis) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState)
    }
    // tinker with internal Datepicker state to
    // fix calendar toggling issue with multiple datepickers
    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }
    /**
     * Render no plan bs_noplan_status
     */
    renderNoPlan = () => {
        const styles = css({
            bs_noplan_status: {
                paddingTop: '0.5rem',
            },
        })
        return (
            <div className="mt-4 mt-sm-1">
                <Checkbox
                    assistiveText={{
                        label: 'No Plan',
                    }}
                    id="bs_noplan_status"
                    labels={{
                        label: 'No Plan',
                    }}
                    checked={this.state.bs_noplan_status}
                    onChange={(e) => {
                        let na_value_opt = !this.state.bs_noplan_status;
                        // let na_value = na_value_opt ? 'Yes' : 'No';
                        this.setState({ bs_noplan_status: na_value_opt, submitDisabled: false });
                    }}
                    disabled={this.state.bs_not_applicable}
                />
            </div>
        );
    }
    /**
     * Render behaviour support plan input
     */
    renderBehaviourSupportPlan = () => {
        const values = ['Yes', 'No'];
        const labels = { label: 'Behaviour Support Plan (last 12m)' };
        return (
            <div className="slds-behaiour-support-plan">
                <div className="row py-2">
                    <div className="col-sm-6 col-md-6">
                        <RadioGroup
                            labels={labels}
                            onChange={(event) => {
                                this.setState({ bs_plan_status: event.target.value })
                            }}
                            className="bs_plan_status-font-normal"
                            disabled={this.state.bs_not_applicable}
                            required={this.props.required}
                            name={'bs_plan_status'}
                            variant={'base'}
                        >
                            {values.map((item) => (
                                <Radio
                                    className={"radio-btn-display"}
                                    key={item}
                                    labels={{ label: item }}
                                    value={item}
                                    checked={this.state["bs_plan_status"] === item}
                                    variant="base"
                                />
                            ))}
                        </RadioGroup>
                    </div>
                    <div className="col-sm-6 col-md-6">
                        <div className="row">
                            <div className="col-sm-6 col-md-6">
                                <legend className="slds-form-element__legend slds-form-element__label">When will the plan be available ?</legend>
                                <SLDSISODatePicker
                                    ref={this.datepickers.bs_plan_available_date} // !important: this is needed by this custom SLDSISODatePicker
                                    className="bs_plan_available_date"
                                    placeholder="Pick a Date"
                                    onChange={this.handleChangeDatePicker('bs_plan_available_date')}
                                    onOpen={this.handleDatePickerOpened('bs_plan_available_date')}
                                    onClear={this.handleChangeDatePicker('bs_plan_available_date')}
                                    value={this.state.bs_plan_available_date}
                                    input={<Input name="bs_plan_available_date" />}
                                    inputProps={{
                                        name: "bs_plan_available_date",
                                    }}
                                    disabled={!this.state.bs_not_applicable && !this.state.bs_noplan_status ? false : true}
                                />
                            </div>
                            <div className="col-sm-6 col-md-6">
                                {this.renderNoPlan()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    /**
     * Render Restrictive pratices options
     */
    renderRestrictivePractices = () => {
        // Options
        let bs_plan_status = this.state.bs_plan_status === 'Yes' ? true : false;
        // Disable the option if bs_plan_status and bs_not_applicable is not enabled
        let disabledPractices = bs_plan_status && !this.state.bs_not_applicable ? false : true;
        let restrictivePractices = [
            {
                label: 'Seclusion',
                name: 'seclusion',
                value: this.state.seclusion,
                disabled: disabledPractices,
            },
            {
                label: 'Chemical constraint',
                name: 'chemical_constraint',
                value: this.state.chemical_constraint,
                disabled: disabledPractices,
            },
            {
                label: 'Mechanical constraint',
                name: 'mechanical_constraint',
                value: this.state.mechanical_constraint,
                disabled: disabledPractices,
            },
            {
                label: 'Physical constraint',
                name: 'physical_constraint',
                value: this.state.physical_constraint,
                disabled: disabledPractices,
            },
            {
                label: 'Environmental',
                name: 'environmental',
                value: this.state.environmental,
                disabled: disabledPractices,
            },
        ];
        return (
            <div className="slds-grid slds-grid_pull-padded slds-grid_vertical-align-center row">
                <div className="col col-sm-6 col-md-6">
                    <legend className="slds-form-element__legend slds-form-element__label"> If yes, does the plan include any restrictive practices ?</legend>
                    <div className="slds-form-element__control pt-2 pl-3 pl-sm-0">
                        {
                            restrictivePractices.map((item) =>
                                <Checkbox
                                    assistiveText={{
                                        label: item.label,
                                    }}
                                    id={item.label}
                                    name={item.name}
                                    disabled={item.disabled}
                                    checked={this.state[`${item.name}`]}
                                    labels={{
                                        label: item.label,
                                    }}
                                    onChange={(event) => {
                                        this.setState({ [item.name]: !item.value, submitDisabled: false })
                                    }}
                                />
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
    render() {
        const styles = css({
            panel_body: {
                paddingLeft: '0.5rem',
            },
            hr: {
                marginTop: '0.5rem',
                marginBottom: '0.75rem',
                border: 0,
                borderTop: '1px solid #eee',
                width: 'auto'
            },
        });
        return (
            <React.Fragment>
                <div className="slds-behaviour-support">
                    <ExpandableSection
                        id="controlled-expandable-section"
                        isOpen={this.state.isBehaviourSupport}
                        onToggleOpen={(event, data) => {
                            this.setState({ isBehaviourSupport: !this.state.isBehaviourSupport });
                        }}
                        title="Behaviour Support"
                    >
                        <form id="risk_assessent_order" autoComplete="off" className="col-md-12 slds_form">
                            <div style={styles.panel_body}>
                                {this.renderNotApplicable()}
                                {this.renderBehaviourTable()}
                                {this.renderBehaviourSupportPlan()}
                                {this.renderRestrictivePractices()}
                                {this.renderModals()}
                            </div>
                            <div className="slds-panel__footer py-2">
                                <button type="button" className="slds-button slds-button_brand" onClick={this.onSubmit}>Save</button>
                            </div>
                        </form>
                        <hr style={styles.hr} />
                    </ExpandableSection>

                </div>
            </React.Fragment>
        )
    }
}

export default RiskBehaviourSupport;