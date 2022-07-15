import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'

class OpportunityPath extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

  /*   componentDidMount() {        
    }

    componentWillReceiveProps(newProps) {
    } */
    /*slds-path__item slds-is-complete = completed
    slds-path__item slds-is-current slds-is-active = active
    slds-path__item slds-is-incomplete = incomplete*/

    render() {

        return (

            <div className="slds-path pt-3">
                <div className="slds-grid slds-path__track">
                    <div className="slds-grid slds-path__scroller-container">
                        <div className="slds-path__scroller" role="application">
                            <div className="slds-path__scroller_inner">
                                <ul className="slds-path__nav" role="listbox" aria-orientation="horizontal">
                                    {this.props.opportunityStage.map((value, idx) => (
                                        <li className={(value.id == this.props.activeStage)?'slds-path__item slds-is-current slds-is-active':(value.id < this.props.activeStage)?'slds-path__item slds-is-complete':'slds-path__item slds-is-incomplete'} role="presentation" key={idx + 1}>
                                            <a aria-selected="false" className="slds-path__link" id={'path-'+value.id} role="option" tabIndex="-1">
                                                <span className="slds-path__stage">
                                                    <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                                                    </svg>
                                                    <span className="slds-assistive-text">Stage Complete</span>
                                                </span>
                                                <span className="slds-path__title">{value.label}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div >
                        </div >
                    </div >
                </div >
            </div >
        );
    }
}
export default OpportunityPath;

