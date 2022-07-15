import React, { Component } from 'react';
import { checkItsNotLoggedIn } from '../../service/common.js';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import ProgressRing from '@salesforce/design-system-react/lib/components/progress-ring';

class PasswordProgressRing extends Component {
    constructor(props) {
        super(props);
        this.state = {   
            valueForChar: 0,
            alphaNumeric: 0,
            specialChar: 0,
            iconForChar: false,
            iconForAlphaNumeric: false,
            iconForSpecialChar: false        
        }
    }
    
    componentDidMount() {
    }

    componentWillReceiveProps(prevProps) {
        this.setState({
            valueForChar: prevProps.valueForChar,
            alphaNumeric: prevProps.alphaNumeric,
            specialChar: prevProps.specialChar,
            iconForChar: prevProps.iconForChar,
            iconForAlphaNumeric: prevProps.iconForAlphaNumeric,
            iconForSpecialChar: prevProps.iconForSpecialChar   
        })
      }

    render() {
        return (
            <React.Fragment>
                <p class="mt-3 mb-2">Enter a new password for {this.state.username}. Make sure to include at least :</p>

                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_pull-padded slds-grid_vertical-align-center mb-2">
                        <div className="slds-col_padded d-inline-block">
                            <ProgressRing size="small" value={this.state.valueForChar} theme={this.state.iconForChar ? 'complete' : ''} hasIcon={this.state.iconForChar} />
                            <span class="d-inline-block mt-1 ml-2 v_align_top">8 Characters</span>
                        </div>
                    </div>
                </IconSettings>

                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_pull-padded slds-grid_vertical-align-center mb-2">
                        <div className="slds-col_padded d-inline-block">
                            <ProgressRing size="small" value={this.state.alphaNumeric} theme={this.state.iconForAlphaNumeric ? 'complete' : ''} hasIcon={this.state.iconForAlphaNumeric} />
                            <span class="d-inline-block mt-1 ml-2 v_align_top">Alphanumeric (uppercase, lowercase & number)</span>
                        </div>
                    </div>
                </IconSettings>

                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_pull-padded slds-grid_vertical-align-center mb-2">
                        <div className="slds-col_padded d-inline-block">
                            <ProgressRing size="small" value={this.state.specialChar} theme={this.state.iconForSpecialChar ? 'complete' : ''} hasIcon={this.state.iconForSpecialChar} />
                            <span class="d-inline-block mt-1 ml-2 v_align_top">1 special character</span>
                        </div>
                    </div>
                </IconSettings>
            </React.Fragment>
        )
    }    
}
export default PasswordProgressRing;
