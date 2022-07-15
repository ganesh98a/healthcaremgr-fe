import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import jQuery from 'jquery'
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect.jsx';
import { postData, toastMessageShow } from 'service/common.js'
import { SLDSPath } from '../../salesforce/lightning/SLDSPath.jsx'

class RosterStage extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }


    constructor(props) {
        super(props);
        this.state = {
        }
    }

    selectStatus = (selected_status) => {
        this.setState({ selected_status: selected_status })
    }

    /**
     * @todo Write unit test for this
     * @param {number} stage
     */
    determineStatusPaths(stage) {

        // WARNING: Don't provide `stage` as non-number 
        // It is not yet tested for non-numbers

        const STAGE_OPEN = 1
        const STAGE_FINALISE = 2
        const STAGE_INPROGRESS = 3
        const STAGE_COMPLETED = 4

        const path = [
            {
                title: 'Open',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-new': stage === STAGE_OPEN && (this.state.selected_stage !== STAGE_OPEN),
                    'slds-is-active': stage === STAGE_OPEN && (this.state.selected_stage !== STAGE_OPEN),
                    'slds-is-current': this.state.selected_stage === STAGE_OPEN,
                    'slds-is-complete': stage > STAGE_OPEN && (this.state.selected_stage !== STAGE_OPEN),
                }),
                onClick: () => this.selectStatus(STAGE_OPEN),
            },
            {
                title: 'Finalise',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': stage < STAGE_FINALISE && this.state.selected_stage !== STAGE_FINALISE,
                    'slds-is-active': stage === STAGE_FINALISE && (this.state.selected_stage !== STAGE_FINALISE),
                    'slds-is-current': this.state.selected_stage === STAGE_FINALISE,
                    'slds-is-complete': stage > STAGE_FINALISE && (this.state.selected_stage !== STAGE_FINALISE),
                }),
                onClick: () => this.selectStatus(STAGE_FINALISE),
            },
            {
                title: 'In progress',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': stage < STAGE_INPROGRESS && this.state.selected_stage !== STAGE_INPROGRESS,
                    'slds-is-active': stage === STAGE_INPROGRESS && (this.state.selected_stage !== STAGE_INPROGRESS),
                    'slds-is-current': this.state.selected_stage === STAGE_INPROGRESS,
                    'slds-is-complete': stage > STAGE_INPROGRESS && (this.state.selected_stage !== STAGE_INPROGRESS),
                }),
                onClick: () => this.selectStatus(STAGE_FINALISE),
            },
            {
                title: 'Completed',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': stage < STAGE_COMPLETED && this.state.selected_stage !== STAGE_COMPLETED,
                    'slds-is-active': stage === STAGE_COMPLETED && (this.state.selected_stage !== STAGE_COMPLETED),
                    'slds-is-current': this.state.selected_stage === STAGE_COMPLETED,
                    'slds-is-complete': stage > STAGE_COMPLETED && (this.state.selected_stage !== STAGE_COMPLETED),
                }),
                onClick: () => this.selectStatus(STAGE_COMPLETED),
            },
        ]

        return path
    }

    /**
     * Renders the 'path' stages
     */
    render() {
        let { roster_stage } = this.props;
        roster_stage = Number(roster_stage);

        const paths = this.determineStatusPaths(roster_stage);
        const visiblePaths = paths.filter(p => p.visible);

        const actionProps = {
            buttonText: `Mark stage as Complete`,
        };

        return (
            <>
                <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                    <SLDSPath
                        path={visiblePaths}
                        actionProps={actionProps}
                    />
                </div>
            </>
        )
    }

}

export default RosterStage;