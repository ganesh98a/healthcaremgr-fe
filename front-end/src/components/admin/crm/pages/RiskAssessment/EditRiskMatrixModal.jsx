import { Button, IconSettings, Modal } from '@salesforce/design-system-react';
import React from 'react';
import { css, postData, toastMessageShow } from '../../../../../service/common';
import EditRiskMatrix from './EditRiskMatrix';

/**
 * @typedef {typeof EditRiskMatrixModal.defaultProps} Props
 *
 * Parent element that hold `<EditRiskMatrix />`. The form submission happens here
 * 
 * @extends {React.Component<Props>}
 */
class EditRiskMatrixModal extends React.Component {

    static defaultProps = {
        risk_assessment_id: null,
        probability_options: [],
        impact_options: [],
        matrices: [],

        isOpen: false,
        onClose: () => {},
        onSuccess: () => {},
    }

    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
            firstError: null,
        }

        this.editableTableRef = React.createRef()
    }

    /**
     * Fetch rows of the editable table
     * This is necessary because slds popovers are uncontrolled 
     * and therefore `<EditRiskMatrix/>` is uncontrolled
     */
    getEditableTableState() {
        const { current } = this.editableTableRef || {}
        const { state } = current || {}
        return state
    }

    handleSubmit = e => {
        e.preventDefault()

        const { rows } = this.getEditableTableState()
        
        const rowsWithRisk = rows.filter(r => (r.risk && `${r.risk}`.trim()))
        const risk_assessment_id = this.props.risk_assessment_id

        this.setState({ isSubmitting: true })
        postData('sales/RiskAssessment/save_all_risk_matrices', { risk_assessment_id, rows: rowsWithRisk }).then(res => {
            if (res.status) {
                toastMessageShow(res.msg, 's')
                this.props.onSuccess()
            } else {
                toastMessageShow(res.error, 'e')
            }
        }).finally(() => this.setState({ isSubmitting: false }))
    }


    render() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.1)',
            },
            contentStyle: {
                paddingBottom: 50
            }
        })

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.isOpen}
                    footer={[
                        <Button label="Cancel" onClick={this.props.onClose} />,
                        <Button disabled={this.state.isSubmitting || this.state.firstError} label="Save" variant="brand" type="button" onClick={this.handleSubmit} />,
                    ]}
                    onRequestClose={this.props.onClose}
                    heading={'Edit Risk Matrix'}
                    size="small"
                    contentStyle={styles.contentStyle}
                    dismissOnClickOutside={false}
                >
                    <form onSubmit={this.handleSubmit}>
                        <EditRiskMatrix 
                            ref={this.editableTableRef}
                            key={this.props.risk_assessment_id}
                            id={this.props.risk_assessment_id}
                            data={this.props.matrices}
                            probabilities={this.props.probability_options}
                            impacts={this.props.impact_options} 
                            onDataChanged={({ rows, firstError }) => this.setState({ firstError })}
                        />
                    </form>
                </Modal>

            </IconSettings>
        )
    }
}

export default EditRiskMatrixModal