import React, { Component } from 'react';
import { connect } from 'react-redux';
import PDFViewerMY from 'service/PDFViewerMY.js';
import { postData,toastMessageShow,archiveALL} from 'service/common.js';
import { Link,Redirect } from 'react-router-dom';
import {ROUTER_PATH} from 'config.js';

class ViewQuote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeCol: '',
        }
    }


    componentDidMount() {
        this.getQuotePdf();
    }
   
    getQuotePdf=()=>{
        this.setState({ loading: true });
            postData('finance/FinanceQuoteManagement/get_quote_pdf', this.props.match.params.quoteId).then((result) => {           
            if (result.status) {
               this.setState(result.data);
            }
            this.setState({ loading: false });
        });
    }
    resendInvoiceMail = (quoteId) => {
        archiveALL({ quoteId: quoteId }, "Are you sure want to resend mail", 'finance/FinanceQuoteManagement/resend_quote_mail').then((result) => {
            if (result.status) {
                toastMessageShow("Mail send successfully", "s")
                //reFreashReactTable(this, 'fetchData');
            }
        });
    }

    render() {
        var show_button=['1','3','5','6'];


        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">

                        <div className=" py-4">
                        <span className="back_arrow">
                            <Link to={ROUTER_PATH+"admin/finance/quote_dashboard"}><span className="icon icon-back1-ie"></span></Link>
                            </span>
                        </div>

                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-12">
                                    <div className="h-h1 color">{this.props.showPageTitle} {this.state.quote_for}</div>
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
                                <button className="btn-1 w-100" disabled={show_button.includes(this.state.status)?false:true} onClick={(e)=>this.resendInvoiceMail(this.props.match.params.quoteId)}  >
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


export default connect(mapStateToProps, mapDispatchtoProps)(ViewQuote);