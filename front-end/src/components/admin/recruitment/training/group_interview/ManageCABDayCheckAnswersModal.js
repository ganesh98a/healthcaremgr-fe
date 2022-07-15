import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'




class ManageCABModal extends Component {

    constructor() {
        super();
        this.state = {

        }
    }



    render() {
        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }
        ];

        const data = [
            {
                DeviceNo: "1. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",
            },
            {
                DeviceNo: "2. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "3. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "4. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "5. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "6. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "7. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "8. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "9. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "10. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            },
            {
                DeviceNo: "11. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",

            }

        ];

        return (
            <div className={'customModal ' + (this.props.showModal ? ' show' : '')}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        CAB Day Questionaire Applicant Answers
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModal}></span>
                    </h3>
                    <div className="row mt-5 mb-5">
                        <div className="col-lg-12">

                            <div className="data_table_cmn dataTab_accrdn_cmn  header_center  tbl_flx2  hide_header_ReferencesTable CAB_table_">
                                <ReactTable
                                    columns={[

                                        {
                                            Header: "   Device No:", accessor: "DeviceNo",
                                            headerClassName: 'hdrCls',
                                            className: (this.state.activeCol === 'name') && this.state.resizing ? 'borderCellCls' : 'border_remove_ incorrect_Cls',
                                       
                                            Cell: (props) => (<div className="text_ellip_2line text-left">{props.original.DeviceNo} </div>)
                                        },
                                        {
                                            Header: "     Actions:", accessor: "QuestionID", maxWidth: 45, 
                                            headerClassName: 'hdrCls',
                                            className: (this.state.activeCol === 'name') && this.state.resizing ? 'borderCellCls' : 'border_remove_',
                                       
                                            Cell: (props) => (<div className="icon_CAB_table">
                                                <i className="icon icon-accept-approve2-ie"></i>
                                                {/* <i className="icon icon-close2-ie"></i> */}
                                            </div>)
                                        },
                                        {
                                            expander: true,
                                            Header: () => <strong></strong>,
                                            width: 55,
                                            headerStyle: { border: "0px solid #fff" },
                                            Expander: ({ isExpanded, ...rest }) =>
                                                <div >
                                                    {isExpanded
                                                        ? <i className="icon icon-arrow-down icn_ar1"></i>
                                                        : <i className="icon icon-arrow-right icn_ar1"></i>}
                                                </div>,
                                            style: {
                                                cursor: "pointer",
                                                fontSize: 25,
                                                padding: "0",
                                                textAlign: "center",
                                                userSelect: "none"
                                            }

                                        }

                                    ]}
                                    defaultPageSize={3}
                                    data={data}
                                    pageSize={data.length}
                                    showPagination={false}
                                    className=""
                                    SubComponent={(props) =>
                                        <AnswersBox {...props} />
                                    }

                                />
                            </div>

                        </div>

                    </div>


                    <div className="row bt-1" style={{ paddingTop: "15px" }}>
                        <div className="col-md-12 text-right">
                            <button className="btn cmn-btn1 new_task_btn">Add Devices</button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}


class AnswersBox extends React.Component {
    render() {
      return (
        <React.Fragment>
            <div className="CAB_Day_question_ul__">
                <div  className="CAB_Day_question_li__ right_answers">
                    <h3>Correct Answers</h3>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
                <div  className="CAB_Day_question_li__ wrong_answers">
                    <h3>Applicant Answers</h3>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
        </React.Fragment>
      )
    };
  }

export default ManageCABModal;