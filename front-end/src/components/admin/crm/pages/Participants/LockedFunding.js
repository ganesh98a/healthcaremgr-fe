import React, { Component } from 'react';
import Modal from 'react-bootstrap/lib/Modal';


export const LockedFunding = (props) => {
    return (
        <Modal className="modal fade Crm" bsSize="large" show={props.showModal} onHide={() => props.handleClose} >
            <form id="special_agreement_form" method="post" autoComplete="off">
                <Modal.Body >

                    <div className="custom-modal-header by-1">
                        <div className="Modal_title">Locked Funding Confirmation</div>
                        <i className="icon icon-close1-ie Modal_close_i" onClick={() => props.handleClose()}></i>
                    </div>
                    <div className="custom-modal-body w-80 mx-auto">

                        <div className="row">
                            <div className="col-md-12 pt-4 pb-3 title_sub_modal">Selected Services & Funding:</div>
                        </div>
                        <div className="row horizontal_scroll L-d-1">
                            <div className="col-md-12 mb-3">
                                <div className="d-flex ser_fund_1">
                                    <div className="ser_fund_a"><span><b>11_024_0117_7_3:</b> Individual Social Skills Development</span></div>
                                    <div className="ser_fund_b"><span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a></div>
                                </div>
                            </div>
                            <div className="col-md-12 mb-3">
                                <div className="d-flex ser_fund_1">
                                    <div className="ser_fund_a"><span><b>11_024_0117_7_3:</b> Individual Social Skills Developmentt</span></div>
                                    <div className="ser_fund_b"><span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a></div>
                                </div>
                            </div>
                            <div className="col-md-12 mb-3">
                                <div className="d-flex ser_fund_1">
                                    <div className="ser_fund_a"><span><b>11_024_0117_7_3:</b> Individual Social Skills Developmentt</span></div>
                                    <div className="ser_fund_b"><span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a></div>
                                </div>
                            </div>
                            <div className="col-md-12 mb-3">
                                <div className="d-flex ser_fund_1">
                                    <div className="ser_fund_a"><span><b>11_024_0117_7_3:</b> Individual Social Skills Development</span></div>
                                    <div className="ser_fund_b"><span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a></div>
                                </div>
                            </div>
                            <div className="col-md-12 mb-3">
                                <div className="d-flex ser_fund_1">
                                    <div className="ser_fund_a"><span><b>11_024_0117_7_3:</b> Individual Social Skills Developmentt</span></div>
                                    <div className="ser_fund_b"><span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a></div>
                                </div>
                            </div>
                            <div className="col-md-12 mb-3">
                                <div className="d-flex ser_fund_1">
                                    <div className="ser_fund_a"><span><b>11_024_0117_7_3:</b> Individual Social Skills Developmentt</span></div>
                                    <div className="ser_fund_b"><span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a></div>
                                </div>
                            </div>
                            <div className="col-md-12 mb-3">
                                <div className="d-flex ser_fund_1">
                                    <div className="ser_fund_a"><span><b>11_024_0117_7_3:</b> Individual Social Skills Developmentt</span></div>
                                    <div className="ser_fund_b"><span>Allocated Funding: $3,500</span> <a className="btn-3">remove</a></div>
                                </div>
                            </div>
                        </div>

                        <div className="row"><div className="col-md-12"><div className=" mt-4 bt-1"></div></div></div>


                        <div className="row d-flex">
                            <div className="col-md-4">
                                <div className="pt-4 pb-3 title_sub_modal">Services Agreement Doc:</div>
                                <ul className="file_down quali_width P_15_TB w-50">
                                    <li className="w-100">
                                        <div className="text-right file_D1"><i className="icon icon-close3-ie color"></i></div>
                                        <div className="path_file mt-0 mb-4"><b>Hearing Imparement</b></div>
                                        <span className="icon icon-file-icons d-block"></span>
                                        <div className="path_file">lgHearingHearing2.png</div>
                                    </li>
                                    <div className="mx-auto">
                                        <a className="v-c-btn1 n2 mb-3" style={{ width: '120px' }}>
                                            <span>Browse</span><i className="icon icon-download2-ie"></i>
                                        </a>
                                        <label className="btn-file" style={{ width: '120px' }}>
                                            <div className="v-c-btn1 n2">
                                                <span>Browse</span><i className="icon icon-export1-ie" aria-hidden="true"></i>
                                            </div>
                                            <input className="p-hidden" type="file" /></label>
                                    </div>
                                </ul>

                            </div>

                            <div className="col-md-5">
                                <div className="pt-4 pb-3 title_sub_modal">Lock Funds Ammount :</div>
                                <div className="small-search l-search w-50 n2"><input  type="text"/><button>$:</button></div>
                                <p className="L-d-t1 mb-0"><strong>Funding Locked Down:</strong></p>
                                <small className="L-d-t1">The participants funding is 'Unlocked,
in order to lock it, a 'Confirmation of Locked Funding'
needs to be sent out to the Participant for approval.</small>
                                <p>
                                    <em>'Once a Participants funding is locked,
it cannot be Unlocked.</em></p>
                                <p className="L-d-t1  mb-0 mt-3"><strong>Funding Duration :</strong></p>
                                <small className="L-d-t1">00/00/0000 - 00/00/0000</small>
                            </div>

                            <div className="col-md-3 align-self-center">
                                <div className="L-d-i1"><i className="icon icon-lock-icons"></i></div>
                                <div className="L-d-t1 text-center">Click to lock<br /> down participants funds</div>
                            </div>

                        </div>



                    </div>
                    <div className="custom-modal-footer bt-1 mt-5">
                        <div className="row d-flex justify-content-end">
                            <div className="col-md-3"><a className="btn-1">Save and Lock Away Funds</a></div>
                        </div>
                    </div>


                </Modal.Body>
            </form>
        </Modal>
    );

}