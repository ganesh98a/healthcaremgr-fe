import React, { Component } from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import Select from 'react-select-plus';
import moment from 'moment';
import { checkItsNotLoggedIn, postData, IsValidJson, getOptionsCrmMembers, input_kin_lastname, getOptionsSuburb, handleRemoveShareholder, handleShareholderNameChange, handleAddShareholder, getQueryStringValue }
    from '../../../../../service/common.js';
    import ScrollArea from 'react-scrollbar';
var options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' }
];

export const AllUpdates = (props) => {

    let allnotes = {};

    if (typeof (props.allupdates) !== 'undefined' || props.allupdates != null) {
        allnotes = props.allupdates;
    }


    return (
        <Modal className="modal fade Crm" bsSize="large" show={props.showModal} onHide={() => props.handleClose} >
            <form id="special_agreement_form" method="post" autoComplete="off">
                <Modal.Body>

                    <div className="custom-modal-header by-1">
                        <div className="Modal_title">Participant Details - View all Updates</div>
                        <i className="icon icon-close1-ie Modal_close_i" onClick={() => props.handleClose()}></i>
                    </div>
                    {// <div className="row px-5 d-flex mt-5">
                        // <div class="col-md-7">
                        //     <div class="search_icons_right modify_select  " >
                        //     <Select.Async
                        //         cache={false}
                        //         clearable={false}
                        //         name="assign_to"
                        //         value={props.onSelectDisp.assign_to}
                        //         loadOptions={getOptionsCrmMembers}
                        //         placeholder='Search'
                        //         onChange={(e)=>props.selectedChange(e,'assign_to')}
                        //         className="custom_select"
                        //     />
                        //         {/*
                        //         <input type="text" name="search" />
                        //         <button type="submit"><span class="icon icon-search1-ie"></span></button> */}
                        //     </div>
                        //
                        // </div>

                        // <div class="col-md-2 align-self-center text-right">
                        //     Filter by:
                        // </div>

                        // <div class="col-md-3">
                        //     <div className="s-def1 s1 mt-2 mb-5">
                        //         <Select
                        //             name="view_by_status"
                        //             options={props.stages}
                        //             required={true}
                        //             simpleValue={true}
                        //             searchable={false}
                        //             clearable={false}
                        //             placeholder="Filter by: Unread"
                        //             onChange={(e)=>props.selectedChange1(e,'view_by_status')}
                        //             value={props.onSelectDisp.view_by_status}
                        //         />
                        //     </div>
                        // </div>
                        // </div>
                    }

                    <div className="custom-modal-body w-100 mx-auto px-5 pb-5">
                        <div className="row">
                            <div className="col-md-12 pt-5 title_sub_modal pb-3">Updates:</div>
                            {/* <div className="col-md-12"><div className="bb-1"></div></div> */}
                        </div>

                        <div className="row w-100 mx-auto">
                            {/* <div className="horizontal_scroll Update-all-main"> */}
                            <div className=" cstmSCroll1">
                                                    <ScrollArea
                                                        speed={0.8}
                                                        contentClassName="content"
                                                        horizontal={false}

                                                        style={{ paddingRight: '15px', paddingLeft: '5px', maxHeight: "650px" }}
                                                    >
                                {
                                    Object.keys(allnotes).map((key) => (

                                        <div className="Update-all-1 mb-4" key={key}>
                                            <div className="Update-all-1a">
                                                <span className="Update-all-1aa">{allnotes[key].FullName} <em></em></span>
                                                <span className="Update-all-1ab">Date: {allnotes[key].created}</span>
                                            </div>
                                            <div className="Update-all-1b">
                                                <span className="Update-all-1ba"><strong>{allnotes[key].title} &nbsp; </strong> </span>
                                                {
                                                }
                                            </div>
                                        </div>
                                    ))

                                }
                                </ScrollArea>
                                </div>
                            {/* </div> */}
                        </div>


                    </div>

                    {/* <div className="custom-modal-footer bt-1 mt-5">
                        <div className="row d-flex justify-content-end">
                            <div className="col-md-3"><a className="btn-1">Save and Lock Away Funds</a></div>
                        </div>
                    </div> */}


                </Modal.Body>
            </form>
        </Modal>
    );

}
