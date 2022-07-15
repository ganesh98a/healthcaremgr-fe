import React from 'react';
import CrmPage from '../../CrmPage';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import { connect } from 'react-redux';

class ServiceAgreementDoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <React.Fragment>

                <CrmPage pageTypeParms={'service_agreement_doc'} />

                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <div className="py-4 bb-1">
                            <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/participantadmin'}><span className="icon icon-back1-ie"></span></Link>
                        </div>
                    </div>
                </div>
                <div className="row d-flex flex-wrap  py-4">
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <div className="h-h1 ">{this.props.showPageTitle}</div>
                    </div>
                   
                </div>
                <div className="d-block bt-1 mb-4"></div>

                <div className={'grey_box__S'}>

                    <div className={'row'}>
                        <div className={'col-sm-12'}>
                            <div className={'form-group'}>
                                <label className={'label_2_1_1'}>Title</label>
                                <input placeholder={'| Placeholder'} className={'border-black'} />
                            </div>
                        </div>
                        <div className={'col-sm-12'}>
                            <div className={'form-group'}>
                                <label className={'label_2_1_1'}>Content</label>
                                <textarea className={'csForm_control txt_area brRad10 textarea-max-size border-black'} placeholder={'| Placeholder'} ></textarea>
                            </div>
                        </div>
                    </div>
                    

                </div>
                <div className={'row mt-4 d-flex justify-content-end'}>
                        
                        <div className={'col-lg-5'}>
                            <div className={'d-flex align-items-center'}>
                                <div className={'flex-1 pr-3'}> <button className={'ml-2 but_submit but_outline f-14 f-bold'}>Cancel</button></div>
                                <div className={'flex-1 pl-3'}> <button className={'but'}>Save</button></div>
                            </div>
                           
                           
                        </div>
                    </div>




            </React.Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType
    }
};
export default connect(mapStateToProps)(ServiceAgreementDoc);