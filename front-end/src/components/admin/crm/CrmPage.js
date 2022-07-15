import React from 'react';
import { connect } from 'react-redux'
import { setActiveSelectPage,  setProspectiveParticipantData ,setStaffData} from './actions/DepartmentAction';
import { postData } from 'service/common.js';


/**
 * @extends {React.Component<{pageTypeParms: import('../../../menujson/crm_menu_json').CrmActiveTitleKey}>}
 */
class CrmPage extends React.Component {
     constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        this.getPageSelect();
    }

    getPageSelect(){
        this.props.setActivePage(this.props.pageTypeParms);
    }
    getParticipantDetails = (participant_id)=>{
       
            postData('crm/CrmParticipant/get_prospective_participant_stage_details', {id:participant_id}).then((result) => {

                if (result.status) {
                    this.props.setProspectiveParticipantData(result.data);
                }
                
            });
    }

    setStaffDetails = (data)=>{
        this.props.setStaffData(data);

    }

    componentDidUpdate(){
          if(this.props.pageTypeParms!=undefined && this.props.showTypePage!=this.props.pageTypeParms){
              this.getPageSelect();
          }
      }

      render() {
          return ( <React.Fragment />);
      }
}

const mapStateToProps = state => ({
       showPageTitle: state.DepartmentReducer.activePage.pageTitle,
       showTypePage: state.DepartmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

        setActivePage:(result) => dispach(setActiveSelectPage(result)),
        setProspectiveParticipantData:(result) => dispach(setProspectiveParticipantData(result)),
        setStaffData:(result) => dispach(setStaffData(result)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps,null, { withRef: true })(CrmPage)