import React, { Component } from 'react';
import Modal from 'react-bootstrap/lib/Modal';

export const CallReference = props => {
	return (
		<Modal className="modal fade Modal_A  Modal_B Crm" show={props.showModal} onHide={() => props.handleClose}>
			<form id="special_agreement_form" method="post" autoComplete="off">
				<Modal.Body>
					<div className="dis_cell">
						<div className="text text-center Popup_h_er_1">
							<span>Call Ended with: {props.details.phone}</span>
							<a data-dismiss="modal" aria-label="Close" className="close_i" onClick={() => props.handleClose()}>
								<i className="icon icon-cross-icons"></i>
							</a>
						</div>

						<div className="row d-flex my-5 align-items-end">
							<div className="col-md-8">
								<div className="Call_Ref_r1">
									<div className="Call_Ref_r1_1">
										<img src="/assets/images/admin/boy.svg" />
									</div>
									<div className="Call_Ref_r1_2">
										<div className="Partt_d1_txt_1 mb-3">
											<strong>{props.details.firstname + ' ' + props.details.lastname}</strong>
											<span></span>
										</div>
										<div className="Partt_d1_txt_2">
											<strong>NDIS no.</strong>
											<span>{props.details.ndis_num}</span>
										</div>
										<div className="Partt_d1_txt_2">
											<strong>Referer:</strong>
											<span>{props.details.referral_firstname + ' ' + props.details.referral_lastname}</span>
										</div>
										<div className="Partt_d1_txt_2">
											<strong>Intake Stage:</strong>
											<span>Participant Assessment</span>
										</div>
									</div>
								</div>
							</div>
							<div className="col-md-4">
								<a className="btn-1">Go To File</a>
							</div>
						</div>

						<div className="row d-flex align-items-center pt-3 bt-1">
							<div className="col-md-7">
								<div className="Call_Ref_te_t1">
									<span className="color">Start Time: </span>09:22am
								</div>
								<div className="Call_Ref_te_t1">
									<span className="color">Duration: </span>32:20
								</div>
							</div>
							<div className="col-md-5 d-flex">
								<a className="Call_Ref_i1 mr-3">
									<i className="icon icon-listen1-ie"></i>
								</a>
								<a className="Call_Ref_i2">
									Download <i className="icon icon-download2-ie"></i>
								</a>
							</div>
						</div>
					</div>
				</Modal.Body>
			</form>
		</Modal>
	);
};
