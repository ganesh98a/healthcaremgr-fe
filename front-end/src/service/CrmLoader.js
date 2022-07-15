import React, { Component } from 'react';
import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";
import { TextBlock, MediaBlock, TextRow, RectShape, RoundShape } from 'react-placeholder/lib/placeholders';
import { Link } from 'react-router-dom';


export const LeftManubar = (

    <ul className="side_menu">
        {/* <li><Link to="./ParticipantDetails" className="major_button" ><i className="icon icon-back2-ie"></i> About 'Deniel'</Link></li> */}
        <li><a style={{ height: '70px' }}></a></li>
        <li><a style={{ height: '70px' }}></a></li>
        <li><a style={{ height: '70px' }}></a></li>
        <li><a style={{ height: '70px' }}></a></li>
    </ul>

);

export const DetailsPage = (
    <div>
        <div className="row d-flex">
            <div className="col-md-3 Parti_details_div_1">
                <div className="Partt_d1_txt_1 mb-4"><strong></strong><span><TextRow color='#ddd' style={{ width: '200px', height: 20, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '60px', height: 13, marginTop: 0 }} /></strong><span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '60px', height: 13, marginTop: 0 }} /></strong><span> <TextRow color='#ddd' style={{ width: '110px', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '60px', height: 13, marginTop: 0 }} /></strong><span><TextRow color='#ddd' style={{ width: '85px', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 mb-1"><strong><TextRow color='#bbbbbb' style={{ width: '40px', height: 13, marginTop: 0 }} /></strong><span><TextRow color='#ddd' style={{ width: '85px', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2"><strong><TextRow color='#bbbbbb' style={{ width: '40px', height: 13, marginTop: 0 }} /></strong><span><TextRow color='#ddd' style={{ width: '135px', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '40px', height: 13, marginTop: 0 }} /></strong><span><TextRow color='#ddd' style={{ width: '115px', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 my-4"><strong className="w-100"><TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} />
                    <TextRow color='#bbbbbb' style={{ width: '15%', height: 13, marginTop: 2, display: 'inline-block' }} /><TextRow color='#ddd' style={{ width: '25%', height: 13, marginTop: 0, display: 'inline-block', marginLeft: '2px' }} /></strong><span></span></div>

                <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                <div className="s-def1 s1 mt-3">
                    <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                </div>
            </div>

            <div className="col-md-6 bl-1 br-1 Parti_details_div_2" style={{ borderColor: '#bbbbbb' }}>
                <div className="row">

                    <div className="col-md-12">
                        <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '106px', height: 13, marginTop: 0 }} /> </strong>
                            <span><TextRow color='#ddd' style={{ width: '40px', height: 13, marginTop: 0 }} /></span></div>
                        <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '116px', height: 13, marginTop: 0 }} />  </strong>
                            <span className="100%"><TextRow color='#ddd' style={{ width: '100%', height: 13, marginTop: 0 }} /></span></div>
                        <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '126px', height: 13, marginTop: 0 }} />  </strong>
                            <span className="100%"><TextRow color='#ddd' style={{ width: '100%', height: 13, marginTop: 0 }} /></span></div>
                    </div>

                    <div className="col-md-12">
                        <div className="bt-1 mt-2" style={{ borderColor: "#bbbbbb" }}></div>
                        <div className="row d-flex mt-4 mb-4">
                            <div className="col-md-3 br-1" style={{ borderColor: "#bbbbbb" }}>
                                <div className="Partt_d1_txt_2"><strong><TextRow color='#bbbbbb' style={{ width: '80px', height: 13, marginTop: 0 }} /></strong></div>
                                <div className="Partt_d1_txt_2"><span className="pl-0 mt-1"><TextRow color='#ddd' style={{ width: '100px', height: 13, marginTop: 0 }} /> </span></div>
                            </div>
                            <div className="col-md-9">
                                <div className="Partt_d1_txt_2"><strong><TextRow color='#bbbbbb' style={{ width: '60px', height: 13, marginTop: 0 }} /></strong><span><TextRow color='#ddd' style={{ width: '180px', height: 13, marginTop: 0 }} /></span></div>
                                <div className="Partt_d1_txt_2 mt-1"><strong><TextRow color='#bbbbbb' style={{ width: '70px', height: 13, marginTop: 0 }} /></strong><TextRow color='#ddd' style={{ width: '100px', height: 13, marginTop: 0, marginLeft: 3 }} /><span></span></div>
                            </div>
                        </div>
                        <div className="bt-1 mt-2" style={{ borderColor: "#bbbbbb" }}></div>
                    </div>

                    <div className="col-md-12">
                        <div className="row d-flex mt-4 mb-4">
                            <div className="col-md-6">
                                <div className="Partt_d1_txt_2"><strong style={{ display: 'inline-block', width: '100%' }}><TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} /></strong></div>
                                <div className="Partt_d1_txt_2 mt-1"><span><TextRow color='#ddd' style={{ width: '70px', height: 13, marginTop: 0 }} /></span></div>
                            </div>
                            <div className="col-md-6">
                                <div className="Partt_d1_txt_2"><strong style={{ display: 'inline-block', width: '100%' }}><TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} /></strong></div>
                                <div className="Partt_d1_txt_2 mt-1"><span><TextRow color='#ddd' style={{ width: '70px', height: 13, marginTop: 0 }} /></span></div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 col-md-offset-6">
                                <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="col-md-3 Parti_details_div_3" >
                <div className="Partt_d1_txt_1"><strong><TextRow color='#bbbbbb' style={{ width: '120px', height: 16, marginTop: 0 }} /></strong></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '100px', height: 13, marginTop: 0 }} /></strong></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '60px', height: 13, marginTop: 0 }} /></strong>
                    <span style={{ display: 'inline-block', width: '60%' }}><TextRow color='#ddd' style={{ width: '100%', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '70px', height: 13, marginTop: 0 }} /></strong>
                    <span style={{ display: 'inline-block', width: '60%' }}><TextRow color='#ddd' style={{ width: '100%', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2"><strong style={{ display: 'inline-block', width: '60%' }}><TextRow color='#bbbbbb' style={{ height: 13, marginTop: 0 }} /></strong> <span style={{ display: 'inline-block', width: '20%' }}><TextRow color='#ddd' style={{ width: '100%', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 my-1"><strong style={{ display: 'inline-block', width: '80%' }}><TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} /></strong></div>
                <div className="Partt_d1_txt_2"> <span style={{ display: 'inline-block', width: '30%' }}><TextRow color='#ddd' style={{ width: '100%', height: 13, marginTop: 0 }} /></span></div>
                <div className="Partt_d1_txt_2 mt-3"><strong style={{ display: 'inline-block', width: '60%' }}> <TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} /></strong></div>
                <div className="s-def1 s1 mt-2 mb-5">
                    <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                </div>
                <div className="Partt_d1_txt_1 bt-1 pt-4" style={{ borderColor: "#bbbbbb" }}><strong><TextRow color='#bbbbbb' style={{ width: '120px', height: 16, marginTop: 0 }} /></strong></div>
                <div className="Partt_d1_txt_2 my-3"><strong> </strong></div>
                <div className="Partt_d1_txt_2 my-3"><strong><TextRow color='#bbbbbb' style={{ width: '80px', height: 13, marginTop: 0 }} /></strong>
                    <span style={{ display: 'inline-block', width: '60%' }}><TextRow color='#ddd' style={{ width: '100%', height: 13, marginTop: 0 }} /></span></div>
            </div>


        </div>

        <div className="row d-flex bt-1 mt-4 pt-4" style={{ borderColor: '#bbbbbb', marginBottom: '100px' }}>
            <div className="col-md-3 br-1" style={{ borderColor: '#bbbbbb' }}>
                <div className="Partt_d1_txt_1"><strong><TextRow color='#bbbbbb' style={{ width: '130px', height: 18, marginTop: 0 }} /></strong></div>
                <div className="Partt_d1_txt_2 mt-3"><TextRow color='#bbbbbb' style={{ width: '100px', height: 13, marginTop: 0 }} /></div>
                <div className="mt-2">
                    <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                </div>
            </div>
            <div className="col-md-9">
                <div className="row pt-5 pb-3">
                    <div className="col-md-4">
                        <div className="Partt_d1_txt_2 mt-3"><TextRow color='#bbbbbb' style={{ width: '120px', height: 13, marginTop: 0 }} /></div>
                        <div className="mt-2">
                            <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                        </div>
                        <div className="mt-4">
                            <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="mt-5">
                            <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                        </div>
                    </div>
                    <div className="col-md-4">

                        <div className="mt-5">
                            <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                            <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px', marginTop: '15px' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
)



export const IntakeProcess = (

    <div className="custom-modal-dialog Information_modal">
        <div className="custom-modal-header by-1" style={{ borderColor: '#bbbbbb' }}>
            <div className="Modal_title w-100" ><TextRow color='#bbbbbb' style={{ width: '60%', height: 43, marginTop: 0 }} /></div>
            <i style={{ position: 'relative' }}>
                <RoundShape color='#777' style={{ width: '40px', height: '39px', marginTop: '12px', marginRight: '16px' }}></RoundShape>
                <i className="icon icon-close" style={{ position: 'absolute', color: '#fff', top: '22px', left: '12px' }}></i>
            </i>

        </div>

        <div className="custom-modal-body w-100 mx-auto pb-5">
            <div className="row">

                <div className="col-md-12">
                    <div className="py-4 title_sub_modal"><TextRow color='#bbbbbb' style={{ width: '180px', height: 18, marginTop: 0 }} /></div>
                </div>


                <div className="col-md-12 all_notes">
                    <div className="all_notes_1 horizontal_scroll">
                        <div className="single_notes" style={{ borderColor: '#bbbbbb' }}>
                            <div className="flex_break">
                                <div className="single_note_data" style={{ borderColor: '#bbbbbb' }}>
                                    <div><TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} /></div>
                                    <div><TextRow color='#bbbbbb' style={{ width: '80%', height: 13, marginTop: 0 }} /></div>
                                    <div><TextRow color='#bbbbbb' style={{ width: '50%', height: 13, marginTop: 0 }} /></div>
                                    <div className="text-right">
                                        <RoundShape color='#777' style={{ width: '35px', height: '35px', marginTop: '6px', marginRight: '25px', display: 'inline-flex', marginRight: '3px' }}></RoundShape>
                                        <RoundShape color='#777' style={{ width: '35px', height: '35px', marginTop: '6px', marginRight: '25px', display: 'inline-flex', marginRight: '3px' }}></RoundShape>
                                        <RoundShape color='#777' style={{ width: '35px', height: '35px', marginTop: '6px', marginRight: '25px', display: 'inline-flex', marginRight: '3px' }}></RoundShape>
                                    </div>
                                </div>
                                <div className="Single_note_history"><TextRow color='#bbbbbb' style={{ width: '80px', height: 10, marginTop: '6px', float: "right" }} /></div>
                            </div>
                        </div>
                        <div className="single_notes" style={{ borderColor: '#bbbbbb' }}>
                            <div className="flex_break">
                                <div className="single_note_data" style={{ borderColor: '#bbbbbb' }}>
                                    <div><TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} /></div>
                                    <div><TextRow color='#bbbbbb' style={{ width: '80%', height: 13, marginTop: 0 }} /></div>
                                    <div><TextRow color='#bbbbbb' style={{ width: '50%', height: 13, marginTop: 0 }} /></div>
                                    <div className="text-right">
                                        <RoundShape color='#777' style={{ width: '35px', height: '35px', marginTop: '6px', marginRight: '25px', display: 'inline-flex', marginRight: '3px' }}></RoundShape>
                                        <RoundShape color='#777' style={{ width: '35px', height: '35px', marginTop: '6px', marginRight: '25px', display: 'inline-flex', marginRight: '3px' }}></RoundShape>
                                        <RoundShape color='#777' style={{ width: '35px', height: '35px', marginTop: '6px', marginRight: '25px', display: 'inline-flex', marginRight: '3px' }}></RoundShape>
                                    </div>
                                </div>
                                <div className="Single_note_history"><TextRow color='#bbbbbb' style={{ width: '80px', height: 10, marginTop: '6px', float: "right" }} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="row ">
                <div className="col-md-12 py-4"><div className="bt-1" style={{ borderColor: '#bbbbbb' }}></div></div>
                <div className="col-md-12 pt-1 pb-4 title_sub_modal" ><TextRow color='#bbbbbb' style={{ width: '160px', height: 18, marginTop: 0 }} /></div>
            </div>
            <form id="add_note">
                <div className="row d-flex  mb-4">
                    <div className="col-md-8">
                        <div className="py-3 px-3" style={{ borderRadius: '25px', background: '#fff', border: '1px solid #bbbbbb' }}>
                            <div><TextRow color='#bbbbbb' style={{ width: '100%', height: 13, marginTop: 0 }} /></div>
                            <div><TextRow color='#bbbbbb' style={{ width: '80%', height: 13, marginTop: 0 }} /></div>
                            <div><TextRow color='#bbbbbb' style={{ width: '50%', height: 13, marginTop: 0, marginBottom: '45px' }} /></div>
                        </div>
                    </div>
                    <div className="col-md-3 align-items-end d-inline-flex"><RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} /></div>
                </div>
            </form>


            <div className="row">
                <div className="col-md-12 py-4"><div className="bt-1" style={{ borderColor: '#bbbbbb' }}></div></div>
                <div className="col-md-12 pt-1 pb-4 title_sub_modal"><TextRow color='#bbbbbb' style={{ width: '140px', height: 18, marginTop: 0 }} /></div>
            </div>

            <div className="row">
                <div className="col-md-3 mb-4">
                    <label className="title_input"><TextRow color='#bbbbbb' style={{ width: '100px', height: 13, marginTop: 0 }} /></label>
                    <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                </div>
                <div className="col-md-3 mb-4">
                    <label className="title_input"><TextRow color='#bbbbbb' style={{ width: '100px', height: 13, marginTop: 0 }} /></label>
                    <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                </div>
                <div className="col-md-3 mb-4">
                    <label className="title_input"><TextRow color='#bbbbbb' style={{ width: '100px', height: 13, marginTop: 0 }} /></label>
                    <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                </div>
            </div>

            <div className="row d-flex mb-5">
                <div className="col-md-9 align-items-end d-inline-flex"><div className="bt-1 w-100" style={{ borderColor: '#bbbbbb' }}></div></div>
                <div className="col-md-3">
                    <RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} />
                </div>
            </div>





        </div>

        <div className="custom-modal-footer bt-1 mt-5" style={{ borderColor: '#bbbbbb' }}>
            <div className="row d-flex justify-content-end">
                <div className="col-md-3"><RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} /></div>
            </div>
        </div>

    </div>

);

export const ParticipantAbilityLoding = (
    <div>
        <div className="row"><div className="col-md-12"><TextRow color='#ddd' style={{ width: '100%', height: 1, marginTop: 0 }} /></div></div>
        <div className="row d-flex py-2">
            <div className="col-lg-9 col-md-8 align-self-center par_abil_title"><TextRow color='#ddd' style={{ width: '200px', height: 20, marginTop: 0 }} /></div>
            <div className="col-lg-3 col-md-4"><RoundShape color='#CBCBCA' style={{ width: '100%', height: '30px', marginBottom: '3px' }} /></div>
        </div>
        <div className="row"><div className="col-md-12"><TextRow color='#ddd' style={{ width: '100%', height: 1, marginTop: 0 }} /></div></div>
        <div className="row my-4">
            <div className="col-lg-9 col-md-8">
                <div className="row d-flex flex-wrap">
                    <div className="col-md-6">
                        <div className="Partt_d1_txt_3 my-2"><strong><TextRow color='#bbbbbb' style={{ width: '60%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0, display: 'inline-flex' }} /></span></div>
                    </div>
                    <div className="col-md-6">
                        <div className="Partt_d1_txt_3 my-2"><strong><TextRow color='#bbbbbb' style={{ width: '60%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0, display: 'inline-flex' }} /></span></div>
                    </div>
                    <div className="col-md-6">
                        <div className="Partt_d1_txt_3 my-2"><strong><TextRow color='#bbbbbb' style={{ width: '40%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0, display: 'inline-flex' }} /></span></div>
                    </div>
                    <div className="col-md-6">
                        <div className="Partt_d1_txt_3 my-2"><strong><TextRow color='#bbbbbb' style={{ width: '40%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0, display: 'inline-flex' }} /></span></div>
                    </div>
                    <div className="col-md-12 mt-3">
                        <div className="Partt_d1_txt_3"><strong><TextRow color='#bbbbbb' style={{ width: '27%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0, display: 'inline-flex' }} /></span></div>
                    </div>
                    <div className="col-md-12">
                        <div className="Partt_d1_txt_3"><strong><TextRow color='#bbbbbb' style={{ width: '25%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0, display: 'inline-flex' }} /></span></div>
                    </div>
                </div>
                <div className="row"><div className="col-md-12 py-4"><TextRow color='#ddd' style={{ width: '100%', height: 1, marginTop: 0 }} /></div></div>
                <div className="row d-flex flex-wrap">
                    <div className="col-md-12 mb-4">
                        <div className="Partt_d1_txt_3"><strong><TextRow color='#bbbbbb' style={{ width: '25%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0 }} /></span></div>
                    </div>
                    <div className="col-md-12 mb-4">
                        <div className="Partt_d1_txt_3"><strong><TextRow color='#bbbbbb' style={{ width: '25%', height: 13, marginTop: 0, display: 'inline-flex' }} />  </strong>
                            <span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0 }} /></span></div>
                    </div>
                </div>
            </div>
            <div className="col-lg-3 col-md-4">
                <div className="row">
                    <div className="col-md-12">
                        <div className="par_abil_right" style={{borderColor:'#CBCBCA'}}>
                            <div className="par_abil_right_in">
                                <div className="par_abil_txt"><TextRow color='#bbbbbb' style={{ width: '70%', height: 17, marginTop: 0, display: 'inline-flex' }} /></div>
                                <div className="par_abil_1"><RoundShape color='#CBCBCA' style={{ width: '100%', height: '40px', marginBottom: '3px' }} /></div>
                                <div className="par_abil_2 by-1" style={{borderColor:'#CBCBCA'}}><RoundShape color='#CBCBCA' style={{ width: '100%', height: '40px', marginBottom: '3px' }} /></div>
                                <div className="par_abil_3">
                                <RoundShape color='#CBCBCA' style={{ width: '100%', height: '40px', marginBottom: '3px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const FmsId = (
    <div>
        <div className="row"><div className="col-md-12"><TextRow color='#ddd' style={{ width: '100%', height: 1, marginTop: 0 }} /></div></div>
        <div className="row d-flex flex-wrap">
    <div className="col-md-4  py-4 br-1" style={{borderColor:'#CBCBCA'}}>
        <div className="Partt_d1_txt_3 my-2"><strong> <TextRow color='#bbbbbb' style={{ width: '70%', height: 17, marginTop: 0, display: 'inline-flex' }} /></strong>
            <br/><span><TextRow color='#ddd' style={{ width: '76px', height: 13, marginTop: 0 }} /></span></div>
    </div>
    <div className="col-md-4 text-center py-4">
        <div className="Partt_d1_txt_3 my-2"><strong><TextRow color='#bbbbbb' style={{ width: '50%', height: 17, marginTop: 0, display: 'inline-flex' }} /> </strong> </div>
        <div className="FMs_btn m-auto"> <RoundShape color='#CBCBCA' style={{ width: '100%', height: '40px', marginBottom: '3px' }} /></div>
        <div className="Partt_d1_txt_3 my-2"><span><TextRow color='#bbbbbb' style={{ width: '30%', height: 13, marginTop: 0, display: 'inline-flex' }} /> </span> </div>
    </div>
</div>
    </div>
);