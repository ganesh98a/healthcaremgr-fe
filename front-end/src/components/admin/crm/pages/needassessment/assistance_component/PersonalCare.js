import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { ExpandableSection } from '@salesforce/design-system-react';
import React, { Component } from 'react';
import { postData, toastMessageShow } from 'service/common.js';
import DailyLiving from './DailyLiving';
import PersonalCareForm from './PersonalCareForm';

class PersonalCare extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      need_assessment_id: props.need_assessment_id,
      isOpen: false
    }
  }

  onToggleOpen = () => {
    this.setState({isOpen: !this.state.isOpen});
  }

  onSubmit = (e) => {
    e.preventDefault();

    let allState = {}
    allState.living = this.dailyLivingRef.getState();
    allState.personal = this.personalCareRef.getState();
    console.log(allState);

    // jQuery("#community_access_form").validate({ /* */ });

    if (allState) {
      this.setState({ loading: true });
      postData('sales/NeedAssessment/save_personal_daily_living', allState).then((result) => {
        if (result.status) {
            let msg = result.msg;
            toastMessageShow(msg, 's');
        } else {
            toastMessageShow(result.msg, "e");
            this.setState({ loading: false });
        }
      });
    }
  }
  render() {
    return (
      <React.Fragment>
        <ExpandableSection
					id="default-expandable-section"
					title="Personal Care"
				>
          <PersonalCareForm
          state = {this.state}
          ref={e => this.personalCareRef = e}
          />
        </ExpandableSection>

        <ExpandableSection
					id="default-expandable-section"
					title="Daily Living"
          isOpen={this.state.isOpen}
          onToggleOpen={this.onToggleOpen}
				>
          <DailyLiving
            state = {this.state}
            ref={e => this.dailyLivingRef = e}
          />
        </ExpandableSection>

        <div className="slds-panel__footer">
        <button type="button" className="slds-button slds-button_brand" onClick={this.onSubmit}>Save</button>
        </div>
      </React.Fragment >
    );
  }
}

export default PersonalCare;