import React, { Component } from 'react';
import _ from 'lodash'
import classNames from 'classnames'
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow, queryOptionData, css, get_take_access_lock } from 'service/common';
// import { SLDSIcon } from '../../../salesforce/lightning/SLDS';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect.jsx';
import {
    Button,
    Popover, Icon,
} from '@salesforce/design-system-react';



/**
 * Common archive modal
 * @param props 
 */
class InlineAddEditModal extends Component {
    static defaultProps = {
        is_open: false,
        /**
         * @type {{ id?: number, skill_key_val: {[key: string]?: any, value: number|string, label: string, }, condition: number }[]}
         */
        shift_skills_list: [],
        on_success: () => { },
        on_close: () => { },        
    }

    // feature toggles
    static SHOULD_ADD_EXTRA_ROW = true;

    constructor(props) {
        super();
        this.state = {
            isSubmitting: false,
            shift_skills_list: [],
            condition: props.condition_list,
            rows: [],
            loading: false,
            archive_skill_id: []
        }
    }

    /**
     * mounting the default components
     * for shifts, checks if the lock presents or not
     */
    componentDidMount() {

        get_take_access_lock('shift', this.props.shift_id).then(ret => {
            if(ret.status == false) {
                toastMessageShow(ret.error, "e");
                this.props.on_close();
            }
            else {
                if (this.props.shift_skills_list) {
                    let rows = this.props.shift_skills_list.map((shift_skill, i) => {
                        return {
                            id: shift_skill.id,
                            skill: shift_skill.skill_key_val,
                            shift_id: shift_skill.shift_id,
                            skill_id: shift_skill.skill_id,
                            skill_name: shift_skill.skill_name,
                            condition: shift_skill.condition,
                            errors: {},
                        }
                    })

                    // add one more row
                    if (InlineAddEditModal.SHOULD_ADD_EXTRA_ROW) {
                        rows.push({ errors: {} })
                    }

                    let shift_skills_list = this.props.shift_skills_list.map(c => ({ ...c }))
                    this.setState({ shift_skills_list, rows: rows }, this.revalidateTable(rows))
                }
            }
        });
    }

   getSkillsOptions = (e) => {
        return queryOptionData(e, this.props.list_url, { query: e })
    }

    handleSubmit = e => {
        e.preventDefault()

        const invalidReason = this.isInvalidForm()
        if (invalidReason) {
            console.error(invalidReason)
            return false;
        }
        const dataToBeSubmitted = this.state.rows.filter(r => r.skill).map(r => {
            return {
                id: r.id, // for new skills, this value will be null/undefined,
                shift_id: this.props.shift_id,
                skill_id: r.skill.value,
                condition: r.condition,
            }
        })

        this.setState({ isSubmitting: true })

        // This url is just fine to use for both org and person
        postData(this.props.submit_url, { archive_skill_id: this.state.archive_skill_id, dataToBeSubmitted }).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, 's');
                this.props.on_success()
            } else {
                toastMessageShow(result.error, 'e')
            }
        }).finally(() => this.setState({ isSubmitting: false }))
    }


    isInvalidForm() {
        // validate condition
        for (let i = 0; i < this.state.rows.length; i++) {
            const row = this.state.rows[i]
            const errors = row.errors || {}

            if (Object.keys(errors).length > 0) {
                const firstError = errors[Object.keys(errors)[0]]
                return firstError
            }
        }

        return false
    }


    checkIfRowIndexIsBrandNew(index) {
        const numOfSkillsInitially = (this.props.shift_skills_list || []).length
        if (index > numOfSkillsInitially - 1) {
            return true
        }

        return false
    }


    checkIfConditionWasModified(index) {
        // lets use the props for prev values because it contains the most original data
        const prevConditionId = _.get(this.props.shift_skills_list, `${index}.condition`)
        const newConditionId = _.get(this.state.rows, `${index}.condition`)

        if (prevConditionId && newConditionId) {
            if (parseInt(prevConditionId) !== parseInt(newConditionId)) {
                return true
            }
        }

        return false
    }

    checkIfSkillWasModified(index) {
        // lets use the props for prev values because it contains the most original data
        const prevSkillId = _.get(this.props.shift_skills_list, `${index}.skill_key_val.value`)
        const newSkillId = _.get(this.state.rows, `${index}.skill.value`)

        if (prevSkillId && newSkillId) {
            if (parseInt(prevSkillId) !== parseInt(newSkillId)) {
                return true
            }
        }

        return false
    }

    isConditionCellInvalid(row) {
        const reasons = this.state.condition.map(condition => {
            if (parseInt(row.condition) !== parseInt(condition.value)) {
                return false
            }

            // additional validation rules

            return false
        })


        const firstErrorReason = reasons.find(r => !!r && typeof r === 'string')
        return firstErrorReason
    }


    handleChangeCondition = prevRow => e => {
        let condition = !e.target.value || e.target.value === 'Select option' ? null : e.target.value // The 'Select option' is for safety

        const newRows = this.state.rows.map(r => prevRow !== r ? r : { ...r, condition })
        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }


    handleChangedSkill = prevRow => skill => {
        if (!skill) {
            return
        }

        let newRows = this.state.rows.map(r => prevRow !== r ? r : { ...r, skill: skill })

        let shouldAddOneMoreExtraRow = false
        let rowsWithNonEmptySkills = newRows.filter(r => !!r.skill)
        if (rowsWithNonEmptySkills.length === this.state.rows.length) {
            shouldAddOneMoreExtraRow = true
        }

        if (InlineAddEditModal.SHOULD_ADD_EXTRA_ROW && shouldAddOneMoreExtraRow) {
            newRows = newRows.concat({})
        }

        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }

    revalidateTable = (newRows) => () => {
        const newRowsWithErrors = this.validateAllRows(newRows)
        this.setState({ rows: newRowsWithErrors })
    }


    validateAllRows(newRows = []) {
        let rows = [...newRows]

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]

            // if skill is empty, dont validate
            if (!row.skill) {
                continue
            }

            // reset error bag for each row
            let errors = {}

            // condition is required
            // The word 'Select option' is for safety 
            // just in case some dev put null/false/undefined instead of '' in the <select/>
            if (!row.condition || row.condition === 'Select option') {
                errors.condition = 'Condition is required'
            }

            // Validate condition
            if (row.skill && row.condition) {
                const invalidConditionReason = this.isConditionCellInvalid(row)
                if (invalidConditionReason) {
                    errors.condition = invalidConditionReason
                }
            }

            // find all rows with same skill
            const rowWithSameSkill = rows.filter(r => r !== row).filter(r => {
                const skillId = (r.skill || {}).value

                if (skillId) {
                    if ((row.skill || {}).value == skillId) {
                        return true
                    }
                }

                return false
            })
            if (rowWithSameSkill.length > 0) {
                errors.skill = `This skill was already been used`
            }


            // find all rows with same skill and same condition
            const rowWithSameSkillAndCondition = rows.filter(r => r !== row).filter(r => {
                const skillId = (r.skill || {}).value
                const conditionId = r.condition

                if (skillId && conditionId) {
                    if ((row.skill || {}).value == skillId && row.condition == conditionId) {
                        return true
                    }
                }

                return false
            })
            if (rowWithSameSkillAndCondition.length > 0) {
                errors.condition = `Condition was used twice in the same skill`
                errors.skill = `Skill was used twice in the same skill`
            }

            rows[i].errors = errors
        }

        return rows
    }
    /**
     * Removing a new row in the table
     */
    removeRow = (idx, id) => {
        var currows = this.state.rows;
        currows.splice(idx, 1);
        // this.setState({ rows: currows },  () => { });
        // this.revalidateTable(currows)
        this.setState({ rows: currows }, this.revalidateTable(currows))
        var newStateArray = [];
        newStateArray.push(id);
        this.state.archive_skill_id.forEach((resultData) => {
            newStateArray.push(resultData)
        })
        this.setState({ archive_skill_id: newStateArray });      
        this.handleChangedSkill(); 
    }
    
    render() {

        const styles = css({
            form: {
                display: 'block',
                minHeight: 480,
            },
            modal: {
                fontSize: 13,
                fontFamily: 'Salesforce Sans, Arial, Helventica, sans-serif'
            },
            inlineEditableCellPopover: {
                position: 'absolute',
                top: 0,
                left: '0.0625rem',
            },
            colHeader: {
                padding: 8
            },
            th: {
                width: '33%'
            },
            wrapToNextLine: {
                maxWidth: 320,
                whiteSpace: 'break-spaces'
            }
        })

        const invalidReason = this.isInvalidForm();

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.is_open}
                    footer={[
                        <Button label="Cancel" disabled={this.state.isSubmitting} onClick={this.props.on_close} />,
                        <Button disabled={this.state.loading || invalidReason || this.state.isSubmitting} label={this.state.isSubmitting ? `Saving...` : `Save`} variant="brand" type="button" onClick={this.handleSubmit} />,
                    ]}
                    onRequestClose={this.props.on_close}
                    heading={this.props.heading}
                    style={styles.modal}
                    size="small"
                    dismissOnClickOutside={false}
                >
                    <form autoComplete="off" className="slds_form" disabled={this.props.disabled} style={styles.form}>
                        <div className="slds-table_edit_container slds-is-relative">
                            <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_editt" condition="grid" >
                                <thead>
                                    <tr className="slds-line-height_reset">
                                        {/* {this.props.table_rows.map((row) => 
                                           <th>{row!='Delete' ? row : ''}</th>)
                                        } */}
                                        <th>Skill</th>
                                        <th>Condition</th>
                                        <th></th>
                                        {/* <th style={{ width: '40%' }}>Skill</th>
                                        <th style={{ width: '40%' }}>Condition</th>
                                        <th style={{ width: '20%' }}></th> */}
                                    </tr>
                                </thead >
                                <tbody>
                                    {(this.state.rows.length > 0) ?

                                        this.state.rows.map((row, idx) => {
                                            const invalidConditionReason = !!row.skill && !!row.condition && this.isConditionCellInvalid(row)
                                            return (
                                                <tr aria-selected="false" className="slds-hint-parent" key={idx + 1}>
                                                    {/* Inline editable cell to edit 'skill'.*/}
                                                    <td
                                                        className={classNames({
                                                            'slds-cell-edit': true,
                                                            'slds-is-edited': !!row.skill && (this.checkIfRowIndexIsBrandNew(idx) || this.checkIfSkillWasModified(idx)),
                                                            'slds-has-error': (row.errors || {})['skill'],
                                                        })}
                                                        condition="gridcell"
                                                        tabindex="0"
                                                    >
                                                        <span className="slds-grid slds-grid_align-spread" title={!!invalidConditionReason ? invalidConditionReason : undefined}>
                                                            <span className="slds-p-right_x-small" style={styles.wrapToNextLine}>
                                                                {(row.skill || {}).label}
                                                            </span>
                                                            <Popover
                                                                body={(
                                                                    <React.Fragment>
                                                                        <SLDSReactSelect.Async
                                                                            clearable={false}
                                                                            required={true}
                                                                            value={row.skill}
                                                                            cache={false}
                                                                            style={{ position: 'absolute' }}
                                                                            loadOptions={(e) => this.getSkillsOptions(e, [])}
                                                                            onChange={this.handleChangedSkill(row)}
                                                                            placeholder="Search for skill"
                                                                        />

                                                                        {
                                                                            (row.errors || {})['skill'] && (
                                                                                <div className="slds-form-element__help">{(row.errors || {})['skill']}</div>
                                                                            )
                                                                        }
                                                                    </React.Fragment>
                                                                )}
                                                                hasNoCloseButton
                                                                hasNoNubbin
                                                                style={styles.inlineEditableCellPopover}
                                                            >
                                                                <Button
                                                                    category="reset"
                                                                    iconSize="small"
                                                                    iconName="edit"
                                                                    variant="icon"
                                                                    iconClassName={`slds-button__icon_edit`}
                                                                />
                                                            </Popover>
                                                        </span>
                                                    </td>
                                                    {/* Inline editable cell to edit 'condition'. Condition is required */}
                                                    <td
                                                        className={classNames({
                                                            'slds-cell-edit': true,
                                                            'slds-is-edited': !!row.skill && (this.checkIfRowIndexIsBrandNew(idx) || this.checkIfConditionWasModified(idx)),
                                                            'slds-has-error': (row.errors || {})['condition']
                                                        })}
                                                        condition="gridcell"
                                                        tabindex="0"
                                                    >
                                                        {
                                                            row.skill && (
                                                                <span className="slds-grid slds-grid_align-spread">
                                                                    <span className="slds-p-right_x-small">
                                                                        {((this.state.condition || []).find(opt => opt.value == row.condition) || {}).label}
                                                                    </span>
                                                                    <Popover
                                                                        body={(
                                                                            <div className="slds-form-element">
                                                                                <div className="slds-form-element__control">
                                                                                    <div className="slds-select-container">
                                                                                        <select
                                                                                            className={`slds-select`}
                                                                                            value={row.condition}
                                                                                            onChange={this.handleChangeCondition(row)}
                                                                                        >
                                                                                            <option value={''} disabled selected hidden>Select option</option>
                                                                                            {
                                                                                                this.state.condition.map(condition => (
                                                                                                    <option value={condition.value}>{condition.label}</option>
                                                                                                ))
                                                                                            }
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                                {
                                                                                    // Validation error
                                                                                    (row.errors || {})['condition'] && (
                                                                                        <div className="slds-form-element__help">{(row.errors || {})['condition']}</div>
                                                                                    )
                                                                                }
                                                                            </div>
                                                                        )}
                                                                        hasNoCloseButton
                                                                        hasNoNubbin
                                                                        style={styles.inlineEditableCellPopover}
                                                                    >
                                                                        <Button
                                                                            category="reset"
                                                                            iconSize="small"
                                                                            iconName="edit"
                                                                            variant="icon"
                                                                            iconClassName={`slds-button__icon_edit`}
                                                                        />
                                                                    </Popover>
                                                                </span>
                                                            )
                                                        }
                                                    </td>
                                                    {/* Inline delete */}
                                                    <td style={{ 'text-align': 'center' }} > {this.state.rows.length != idx + 1 ?
                                                        <Button
                                                            category="reset"
                                                            iconSize="medium"
                                                            iconName="delete"
                                                            variant="icon"
                                                            iconClassName={`slds-button__icon_delete`}
                                                            onClick={() => this.removeRow(idx, row.id)}
                                                        /> : ''}
                                                    </td>
                                                </tr >
                                            )
                                        }) : ''}
                                </tbody >
                            </table >
                        </div >
                    </form>
                </Modal >
            </IconSettings>
        );
    }
}

export default InlineAddEditModal;


