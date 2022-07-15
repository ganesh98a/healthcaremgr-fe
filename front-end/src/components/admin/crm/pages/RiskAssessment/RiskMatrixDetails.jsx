import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'

import {
    Button, 
    Popover,
    IconSettings,
    Icon,
    Input,
    Card
} from '@salesforce/design-system-react'

import { css } from '../../../../../service/common'
import EditRiskMatrixModal from './EditRiskMatrixModal'
import EditRiskMatrix from './EditRiskMatrix'
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'

/**
 * @typedef {typeof RiskMatrixDetails.defaultProps} Props
 *
 * Displays the risk matrix evaluation table with heading and an edit button
 * 
 * @extends {React.Component<Props>}
 */
class RiskMatrixDetails extends React.Component {

    static defaultProps = {
        risk_assessment_id: null,
        probability_options: [],
        impact_options: [],
        matrices: [],
        onUpdate: () => {},
        score_details: { // probability * impact (not the other way around)
            1: {
                1: 'Very low',
                2: 'Very low',
                3: 'Low',
                4: 'Medium',
                5: 'Medium',
            },
            2: {
                1: 'Very low',
                2: 'Low',
                3: 'Medium',
                4: 'Medium',
                5: 'High',
            },
            3: {
                1: 'Low',
                2: 'Medium',
                3: 'Medium',
                4: 'High',
                5: 'Very high',
            },
            4: {
                1: 'Medium',
                2: 'Medium',
                3: 'High',
                4: 'Very high',
                5: 'Extreme',
            },
            5: {
                1: 'Medium',
                2: 'High',
                3: 'Very high',
                4: 'Extreme',
                5: 'Extreme',
            }
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
            isOpenEditMatrixModal: false,
        }
    }

    
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.isOpenEditMatrixModal && (
                        <EditRiskMatrixModal 
                            key={this.props.risk_assessment_id}
                            isOpen={this.state.isOpenEditMatrixModal}
                            onClose={() => this.setState({ isOpenEditMatrixModal: false })}
                            onSuccess={() => this.setState({ isOpenEditMatrixModal: false }, this.props.onUpdate)}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    handleSave = e => {
        e.preventDefault()
    }

    renderTable() {
        return (
            <SLDSReactTable 
                PaginationComponent={() => <React.Fragment />}
                data={this.props.matrices}
                defaultPageSize={this.props.matrices.length}
                sortable={false}
                resizable={true}
                columns={[
                    {
                        accessor: 'risk',
                        id: 'risk',
                        Header: 'Risk',
                    },
                    {
                        accessor: 'probability_id',
                        id: 'probability_id',
                        Header: 'Probability',
                        Cell: props => {
                            const { original } = props
                            const probability = (this.props.probability_options.find(p => p.id == props.value) || {})
                            const probability_multiplier = (this.props.probability_options.find(p => original.probability_id == p.id) || {}).multiplier

                            return <abbr title={probability_multiplier}>{probability.name}</abbr>
                        }
                    },
                    {
                        accessor: 'impact_id',
                        id: 'impact_id',
                        Header: 'Impact',
                        Cell: props => {
                            const { original } = props
                            const impact = (this.props.impact_options.find(p => p.id == props.value) || {})
                            const impact_multiplier = (this.props.impact_options.find(p => original.impact_id == p.id) || {}).multiplier
                            return <abbr title={impact_multiplier}>{impact.name}</abbr>
                        }
                    },
                    {
                        id: 'score',
                        Header: 'score',
                        Cell: props =>  {
                            const { original } = props
                            if (!original.probability_id || !original.impact_id) {
                                return ''
                            }
                    
                            const probability = (this.props.probability_options.find(p => original.probability_id == p.id) || {}).multiplier
                            const impact = (this.props.impact_options.find(p => original.impact_id == p.id) || {}).multiplier

                            const meaning = _.get(this.props, `score_details.${probability}.${impact}`, undefined)
                            const score = probability * impact

                            if (!meaning) {
                                return score
                            }

                            return (
                                <abbr title={meaning}>{score}</abbr>
                            )
                    

                        }
                    }
                ]}
            />
        )
    }


    render() {
        const styles = css({
            headingText: {
                fontSize: 15,
                fontWeight: 'normal',
                // display: 'flex',
                // justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
            },
            button: {
                marginLeft: 15
            }
        })

        return (
            <React.Fragment>
                <h3 style={styles.headingText}>
                    <b>Risk matrix</b>
                    <Button label="Edit" style={styles.button} onClick={e => this.setState({ isOpenEditMatrixModal: true })}/>
                </h3>
                { this.renderTable() }
                { this.renderModals() }
            </React.Fragment>
        )
    }
}

export default RiskMatrixDetails