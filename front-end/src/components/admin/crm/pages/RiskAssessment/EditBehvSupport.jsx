import { Button, Popover } from '@salesforce/design-system-react';
import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';
import { css } from '../../../../../service/common';

/**
 * @typedef {typeof EditBehvSupport.defaultProps} Props
 * 
 * Display an editable table to for risk matrix evaluation
 * 
 * @extends {React.Component<Props>}
 */
class EditBehvSupport extends React.Component {

    static SHOULD_ADD_EXTRA_ROW = true

    static defaultProps = {
        data: [],
        likelyhoods: [],
        impacts: [],
        onDataChanged: ({ rows, firstError }) => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
            originalRows: [],
            rows: [],
            likelyhoods : [
                {
                'id':1,
                'name':'Likely'
                },
                {
                    'id':2,
                    'name':'Very likely'
                },
                {
                    'id':3,
                    'name':'Un likely'
                }
        ]
        }
    }

    componentDidMount() {
        
        let rows = this.props.data.map((originalRow, i) => {
            return {
                id: originalRow.id,
                risk: originalRow.behaviuor,
                likelyhood_id: originalRow.likelyhood_id,
                trigger: originalRow.trigger,
                prevention_strategy: originalRow.prevention_strategy,
                descalation_strategy: originalRow.descalation_strategy,
                errors: {},
            }
        })

        if (EditBehvSupport.SHOULD_ADD_EXTRA_ROW) {
            rows.push({ errors: {} })
        }

        let originalRows = this.props.data.map(r => ({...r}))

        this.setState({ originalRows, rows }, this.revalidateTable(rows))
    }

    revalidateTable = newRows => () => {
        const newRowsWithErrors = this.validateAllRows(newRows)
        this.setState({ rows: newRowsWithErrors }, () => {
            const firstError = this.getFirstError(newRowsWithErrors)
            this.props.onDataChanged({ rows: newRowsWithErrors, firstError })
        })
    }

    getFirstError(rows) {
        for (let i = 0; i < rows.length; i++) {
            const rowErrors = rows[i].errors || {}

            const keyWithError = Object.keys(rowErrors).find(k => rowErrors[k])
            if (rowErrors[keyWithError]) {
                return rowErrors[keyWithError]
            }
        }

        return false
    }

    validateAllRows(newRows = []) {
        let rows = [...newRows]
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]

            // reset error bag for each row
            let errors = {}

            const otherRows = rows.filter(r => r !== row)
            if (otherRows) {
                const otherRowWithSameRisk = otherRows.find(r => (
                    typeof r.risk === 'string' && 
                    typeof row.risk === 'string' 
                    && `${r.risk}`.trim()
                    && `${row.risk}`.trim()
                ) ? `${r.risk}`.trim() === `${row.risk}`.trim() : false)
                if (otherRowWithSameRisk) {
                    errors.risk = `You already entered the same risk`
                }
            }


            if (row.risk && !row.likelyhood_id) {
                errors.likelyhood_id = `Likelyhood is required`
            }
            if (row.risk && !row.trigger) {
                errors.trigger = `Trigger is required`
            }
            if (row.risk && !row.prevention_strategy) {
                errors.prevention_strategy = `Prevention Strategy is required`
            }
            if (row.risk && !row.descalation_strategy) {
                errors.descalation_strategy = `Descalation Strategy is required`
            }

            // ADDITIONAL VALIDATION RULES

            rows[i].errors = errors
        }
        
        return rows
    }


    checkIfRowIndexIsBrandNew(index) {
        const numRowsInitially = (this.props.data || []).length
        if (index > numRowsInitially - 1) {
            return true
        }

        return false
    }

    checkIfRiskWasModified(index) {
        // lets use the props for prev values because it contains the most original data
        const previousValue = _.get(this.props.data, `${index}.risk`)
        const newValue = _.get(this.state.rows, `${index}.risk`)

        if (previousValue !== newValue) {
            return true
        }

        return false
    }

   
    
    checkIfProbabilityWasModified(index) {
        // lets use the props for prev values because it contains the most original data
        const previousValue = _.get(this.props.data, `${index}.likelyhood_id`)
        const newValue = _.get(this.state.rows, `${index}.likelyhood_id`)

        if (previousValue && newValue) {
            if (parseInt(previousValue) !== parseInt(newValue)) {
                return true
            }
        }

        return false
    }
    
    handleChangedRisk = prevRow => e => {
        let risk = e.target.value

        let newRows = this.state.rows.map(r => prevRow !== r ? r : { ...r, risk })

        let shouldAddOneMoreExtraRow = false
        let rowsWithNonEmptyRisk = newRows.filter(r => !!r.risk)
        if (rowsWithNonEmptyRisk.length === this.state.rows.length) {
            shouldAddOneMoreExtraRow = true
        }

        if (EditBehvSupport.SHOULD_ADD_EXTRA_ROW && shouldAddOneMoreExtraRow) {
            newRows = newRows.concat({})
        }

        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }
    handleChangedProbability = prevRow => e => {
        // The 'Select option' is for safety
        let likelyhood_id = !e.target.value || e.target.value === 'Select option' ? null : e.target.value 

        const newRows = this.state.rows.map(r => prevRow !== r ? r : { ...r, likelyhood_id })
        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }
    handleChangedDescstrategy = prevRow => e => {
        let descalation_strategy = !e.target.value || e.target.value === 'Select option' ? null : e.target.value 

        const newRows = this.state.rows.map(r => prevRow !== r ? r : { ...r, descalation_strategy })
        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }
    handleChangedtrigger = prevRow => e => {
        let trigger = !e.target.value || e.target.value === 'Select option' ? null : e.target.value 

        const newRows = this.state.rows.map(r => prevRow !== r ? r : { ...r, trigger })
        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }
    handleChangedpreventionStrategy = prevRow => e => {
        let prevention_strategy = !e.target.value || e.target.value === 'Select option' ? null : e.target.value 

        const newRows = this.state.rows.map(r => prevRow !== r ? r : { ...r, prevention_strategy })
        this.setState({ rows: newRows }, this.revalidateTable(newRows))
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
            },
            input: {
                height: 'auto',
            },
            validationError: {
                width: '100%',
            },
        })


        return (
            <div className="slds-table_edit_container slds-is-relative">
                <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_editt" role="grid">
                    <thead>
                        <tr className="slds-line-height_reset">
                            <th style={{ width: '35%' }}>Behaviour</th>
                            <th style={{ width: '25%' }}>Likelyhood</th>
                            <th style={{ width: '25%' }}>Trigger</th>
                            <th style={{ width: '15%' }}>Prevention Strategy</th>
                            <th style={{ width: '15%' }}>De-escalation Strategies</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.rows.map((row, idx) => {
                                const firstColNotEmpty = !_.isEmpty(row.risk)
                                const brandNew = this.checkIfRowIndexIsBrandNew(idx)
                                const shouldDisplayNextCol = firstColNotEmpty

                                return (
                                    <tr key={idx} aria-selected="false" className="slds-hint-parent" data-id={row.id}>

                                        {/* -------------------------------------------------------------- */}
                                        <td
                                            className={classNames({
                                                'slds-cell-edit': true,
                                                'slds-is-edited': (firstColNotEmpty || row.id) && (brandNew || this.checkIfRiskWasModified(idx)),
                                                'slds-has-error': (row.errors || {})['risk']
                                            })}
                                            role="gridcell" 
                                            tabindex="0"
                                        >
                                            <span className="slds-grid slds-grid_align-spread">
                                                <span className="slds-p-right_x-small" style={styles.wrapToNextLine}>
                                                    {row.risk || ''}
                                                </span>
                                                <Popover
                                                    body={(
                                                        <div className={classNames(['slds-form-element', 'slds-grid', 'slds-wrap'])}>
                                                            <div className="slds-form-element__control slds-grow">
                                                                <input type="text" className="slds-input" value={row.risk || ''} onChange={this.handleChangedRisk(row)} style={styles.input} />
                                                            </div>
                                                            {
                                                                (row.errors || {})['risk'] && (
                                                                    <div className="slds-form-element__help" style={styles.validationError}>{(row.errors || {})['risk']}</div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                    className="slds-popover_edit"
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
                                         {/* -------------------------------------------------------------- */}
                                         <td
                                            className={classNames({
                                                'slds-cell-edit': true,
                                                'slds-is-edited': firstColNotEmpty && (brandNew || this.checkIfProbabilityWasModified(idx)),
                                                'slds-has-error': (row.errors || {})['likelyhood_id']
                                            })}
                                            role="gridcell" 
                                            tabindex="0"
                                        >
                                            {
                                                shouldDisplayNextCol && (
                                                    <span className="slds-grid slds-grid_align-spread">
                                                        <span className="slds-p-right_x-small" style={styles.wrapToNextLine}>
                                                            {(this.state.likelyhoods.find(p => p.id == row.likelyhood_id) || {}).name}
                                                        </span>
                                                        <Popover
                                                            body={(
                                                                <div className="slds-form-element">
                                                                    <div className="slds-form-element__control">
                                                                        <div className="slds-select-container">
                                                                            <select
                                                                                className={`slds-select`} 
                                                                                value={row.likelyhood_id || ''} 
                                                                                onChange={this.handleChangedProbability(row)}
                                                                            >
                                                                                <option value={''} disabled selected hidden>Select option</option>
                                                                                { 
                                                                                    this.state.likelyhoods.map(probability => (
                                                                                        <option value={probability.id}>
                                                                                            {[probability.name, probability.multiplier && `(${probability.multiplier})`].filter(Boolean).join(` `)}
                                                                                        </option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        // Validation error
                                                                        (row.errors || {})['likelyhood_id'] && (
                                                                            <div className="slds-form-element__help">{(row.errors || {})['likelyhood_id']}</div>
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
                                        <td
                                            className={classNames({
                                                'slds-cell-edit': true,
                                                'slds-is-edited': (firstColNotEmpty || row.id) && (brandNew || this.checkIfRiskWasModified(idx)),
                                                'slds-has-error': (row.errors || {})['trigger']
                                            })}
                                            role="gridcell" 
                                            tabindex="0"
                                        >
                                           { shouldDisplayNextCol && ( <span className="slds-grid slds-grid_align-spread">
                                                <span className="slds-p-right_x-small" style={styles.wrapToNextLine}>
                                                    {row.trigger || ''}
                                                </span>
                                                <Popover
                                                    body={(
                                                        <div className={classNames(['slds-form-element', 'slds-grid', 'slds-wrap'])}>
                                                            <div className="slds-form-element__control slds-grow">
                                                                <input type="text" className="slds-input" value={row.trigger || ''} onChange={this.handleChangedtrigger(row)} style={styles.input} />
                                                            </div>
                                                            {
                                                                (row.errors || {})['trigger'] && (
                                                                    <div className="slds-form-element__help" style={styles.validationError}>{(row.errors || {})['trigger']}</div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                    className="slds-popover_edit"
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
                                                        </span> )}
                                        </td>
                                        <td
                                            className={classNames({
                                                'slds-cell-edit': true,
                                                'slds-is-edited': (firstColNotEmpty || row.id) && (brandNew || this.checkIfRiskWasModified(idx)),
                                                'slds-has-error': (row.errors || {})['prevention_strategy']
                                            })}
                                            role="gridcell" 
                                            tabindex="0"
                                        >
                                             { shouldDisplayNextCol && (<span className="slds-grid slds-grid_align-spread">
                                                <span className="slds-p-right_x-small" style={styles.wrapToNextLine}>
                                                    {row.prevention_strategy || ''}
                                                </span>
                                                <Popover
                                                    body={(
                                                        <div className={classNames(['slds-form-element', 'slds-grid', 'slds-wrap'])}>
                                                            <div className="slds-form-element__control slds-grow">
                                                                <input type="text" className="slds-input" value={row.prevention_strategy || ''} onChange={this.handleChangedpreventionStrategy(row)} style={styles.input} />
                                                            </div>
                                                            {
                                                                (row.errors || {})['prevention_strategy'] && (
                                                                    <div className="slds-form-element__help" style={styles.validationError}>{(row.errors || {})['prevention_strategy']}</div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                    className="slds-popover_edit"
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
                                            </span> ) }
                                        </td>
                                        <td
                                            className={classNames({
                                                'slds-cell-edit': true,
                                                'slds-is-edited': (firstColNotEmpty || row.id) && (brandNew || this.checkIfRiskWasModified(idx)),
                                                'slds-has-error': (row.errors || {})['descalation_strategy']
                                            })}
                                            role="gridcell" 
                                            tabindex="0"
                                        >
                                            { shouldDisplayNextCol && ( <span className="slds-grid slds-grid_align-spread">
                                                <span className="slds-p-right_x-small" style={styles.wrapToNextLine}>
                                                    {row.descalation_strategy || ''}
                                                </span>
                                                <Popover
                                                    body={(
                                                        <div className={classNames(['slds-form-element', 'slds-grid', 'slds-wrap'])}>
                                                            <div className="slds-form-element__control slds-grow">
                                                                <input type="text" className="slds-input" value={row.descalation_strategy || ''} onChange={this.handleChangedDescstrategy(row)} style={styles.input} />
                                                            </div>
                                                            {
                                                                (row.errors || {})['descalation_strategy'] && (
                                                                    <div className="slds-form-element__help" style={styles.validationError}>{(row.errors || {})['descalation_strategy']}</div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                    className="slds-popover_edit"
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
                                            </span> )}
                                        </td>
                                        
                                       
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default EditBehvSupport 