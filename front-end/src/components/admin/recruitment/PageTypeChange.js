import React from 'react';
import { connect } from 'react-redux'
import { setActiveSelectPage } from './actions/RecruitmentAction';
class PageTypeChange extends React.Component {
     constructor(props) {
        super(props);
        this.state = {};
    }
    componentWillMount() {
        //console.log('sdsd1');
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

export default connect(mapStateToProps, mapDispatchtoProps)(PageTypeChange)