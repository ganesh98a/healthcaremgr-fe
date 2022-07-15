import React from "react"

const ContactPopup = (props) => {
    return (
        <div className={'customModal ' + (props.show ? ' show' : '')}>
            <div className="cstomDialog widBig" style={{ minWidth: '400px', maxWidth: '400px' }}>
                <h3 className="cstmModal_hdng1--">
                    {props.title}
                    <span className="closeModal icon icon-close1-ie" onClick={props.close}></span>
                </h3>
                <div className="row pd_lf_15 mr_tb_20 d-flex justify-content-center flexWrap">
                    {props.children}
                </div>
            </div>
        </div>
    )
}
export default ContactPopup;




