import React from 'react';
import { connect } from 'react-redux';
import {setActiveSelectPage} from 'components/admin/recruitment/actions/RecruitmentAction';
class RecruitmentPage extends React.Component {
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
       showPageTitle: state.MemberReducer.activePage.pageTitle,
       showTypePage: state.ScheduleDetailsData.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

        setActivePage:(result) => dispach(setActiveSelectPage(result))
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(RecruitmentPage)