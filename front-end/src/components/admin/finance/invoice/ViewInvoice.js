import React, { Component } from 'react';
import { connect } from 'react-redux';
import PDFViewerMY from 'service/PDFViewerMY.js';
import { postData,toastMessageShow,archiveALL} from 'service/common.js';
import { Link,Redirect } from 'react-router-dom';
import {ROUTER_PATH} from 'config.js';
import {reSendInvoiceEmail} from '../action/FinanceAction';

class ViewInvoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeCol: '',
        }
    }


    componentDidMount() {
        this.getInvoicePdf();
    }
   
    getInvoicePdf=()=>{
        this.setState({ loading: true });
            postData('finance/FinanceInvoice/get_invoice_pdf', this.props.match.params).then((result) => {           
            if (result.status) {
               this.setState(result.data);
            }else if(result.hasOwnProperty('error') || result.hasOwnProperty('msg')){
                let msg = result.hasOwnProperty('error') ? result.error:result.msg;
                toastMessageShow(msg,'e');
            }
            this.setState({ loading: false });
        });
    }

    render() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">

                        <div className=" py-4">
                        <span className="back_arrow">
                            <Link to={ROUTER_PATH+"admin/finance/InvoicesDashboard"}><span className="icon icon-back1-ie"></span></Link>
                            </span>
                        </div>

                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-12">
                                    <div className="h-h1 color">{this.props.showPageTitle} {this.state.invoice_for}</div>
                                </div>
                            </div>
                        </div>

                        <div className="row py-4">
                            <div className="col-lg-12">
                                {this.state.file_path!=undefined ? <PDFViewerMY loadData={{src:this.state.file_path||'',extraclassName:'disableToolbar'}} />:null}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-3 pull-right">
                                <button className="btn-1 w-100"  onClick={(e)=>reSendInvoiceEmail(this,this.props.match.params.invoiceId)}  >
                                    <span>Send Email</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </React.Fragment >
        );
    }

}

const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispach) => {
    return {

    }
}


export default connect(mapStateToProps, mapDispatchtoProps)(ViewInvoice);