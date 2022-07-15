import React, { Component } from 'react';

import ReactSelect from './ReactSelect';
import ReactStarSelect from './ReactStarSelect'
import ImageCropper from './ImageCropper';
import axios from 'axios';
import ScrollArea from 'react-scrollbar';
import { Tabs, Tab } from 'react-bootstrap';
import ReactTable from 'react-table'

class UI extends Component {

    state = {
        selectedFile: null,
        cat1: 30,
        file: null
    }

    fileSelectedHandler = (e) => {
        this.setState({
            selectedFile: e.target.files[0]
        })
        //console.log(e.target.files[0]);
    }

    fileUploadHandler = () => {
        const fd = new FormData();
        fd.append('image', this.state.selectedFile, this.state.selectedFile.name);
        axios.post('https://dummy-b14ce.firebaseio.com/iamges.json', fd)
            .then(res => {
                //console.log(res);
            });
    }

    handleChange = (event) => {
        this.setState({ cat1: event.target.value });
    }

    handleChange2 = (event) => {

        if (event.target.files[0] == undefined) {
            this.setState({ file: null })
        }
        else {
            this.setState({
                file: URL.createObjectURL(event.target.files[0])
            })
        }
    }



    render() {

        const data = [{
            firstName: 'Tanner Linsley',
            lastName: "Tanner",
        },
        {
            firstName: 'Tanner Linsley',
            lastName: "Tanner",
        },
        {
            firstName: 'Tanner Linsley',
            lastName: "Tanner",
        }]

        return (
            <section style={{ minHeight: '500px', padding: '50px' }}>

                <div className='container'>

                    <div className='row'>

                        <div className='col-md-4'>

                            <ReactSelect />

                        </div>

                        <div className='col-md-4'>

                            <ReactStarSelect />

                        </div>


                        <div className='col-md-12'>

                            <ImageCropper />

                        </div>


                        {/* <div className='col-md-12'>

                            <input type='file'  onChange={this.fileSelectedHandler} />
                            <button onClick={this.fileUploadHandler}>Upload</button>

                        </div> */}


                        <div className='col-md-12' style={{ margin: '20px 0' }}>
                            <div style={{ visibility: this.state.cat1 < 81 ? 'hidden' : 'visible' }}>
                                <div className={'trvw unused'} > <div>{100 - this.state.cat1}%</div>Unused</div>
                                <div className={'trvw used'}> <div>{this.state.cat1}%</div>Used</div>
                            </div>
                            <div className='main_dv'>
                                <div className='percBreakdown'>
                                    {/* <span><div>80%</div>unused</span> */}
                                    <div className='cat1' style={{ width: this.state.cat1 + '%', height: this.state.cat1 + '%' }}>
                                        <span className={'unusedCat' + ' ' + (this.state.cat1 > 80 ? 'hidee' : '')} style={{ top: - + (100 - this.state.cat1) }}>
                                            <div>{100 - this.state.cat1}%</div>Unused
                                        </span>


                                        <span>
                                            {this.state.cat1 > 80 ? (<div>Percentage Brokedown</div>) : (<div>{this.state.cat1}%</div>)}

                                        </span>
                                    </div>
                                    <div className='hvrDv'></div>
                                </div>


                            </div>

                            <input
                              type="text"
                                id="typeinp"
                                type="range"
                                min="0" max="100"
                                value={this.state.cat1}
                                onChange={this.handleChange}
                                step="1"
                                className='slideRange'

                            />
                        </div>

                    </div>



                    <div className='col-md-12'>

                        <div>
                            <input type="file" onChange={this.handleChange2} />
                            <img src={this.state.file} />
                        </div>

                    </div>

                    <div className='col-md-12 cstmSCroll1'>
                        <ScrollArea
                            speed={0.8}
                            className="area"
                            contentClassName="content"
                            horizontal={false}
                            style={{ height: '450px', paddingRight: '30px' }}
                        >
                            <div>Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                                Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.Some long content.
                            Some long content.Some long content.Some long content.Some long content.</div>
                        </ScrollArea>

                    </div>

                    <div className="Line_base_tabs">
                        <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                            <Tab eventKey="home" title="Home">
                                dfasdfasdfasd
                        </Tab>
                            <Tab eventKey="profile" title="Profile">
                                dfadsfasdfsad dfasdfasd
                        </Tab>
                            <Tab eventKey="contact" title="Contact" disabled>
                                dfadsfdfa dfasdfa dfasdfasd fasdfasd
                        </Tab>
                        </Tabs>
                    </div>

                    <div className="Seek_Q_ul">
                        <div className="Seek_Q_li w-100"><span><i className="icon icon-cross-icons"></i></span>
                            <div>From Wikipedia, the free encyclopedia</div>
                        </div>
                        <div className="Seek_Q_li w-100"><span><i className="icon icon-accept-approve1-ie"></i></span>
                            <div>From Wikipedia, the free encyclopedia</div>
                        </div>
                        <div className="Seek_Q_li w-100"><span><i className="icon icon-accept-approve1-ie"></i></span>
                            <div>From Wikipedia, the free encyclopedia</div>
                        </div>
                        <div className="Seek_Q_li w-100"><span><i className="icon icon-accept-approve1-ie"></i></span>
                            <div>From Wikipedia, the free encyclopedia</div>
                        </div>
                        <div className="Seek_Q_li w-100"><span><i className="icon icon-accept-approve1-ie"></i></span>
                            <div>From Wikipedia, the free encyclopedia</div>
                        </div>
                    </div>

                    <ReactTable
                        data={data}
                        columns={[

                            {
                                Header: "First Name",
                                accessor: "firstName",
                                headerClassName: 'hdrCls',
                                className: (this.state.activeCol === 'firstName') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_1 pl-0 pr-0',
                                Cell: (props) => (<div className="text_ellip_2line text-left">
                                    <strong>{props.original.firstName}</strong>
                                </div>)
                            },
                            {
                                Header: "Last Name",
                                accessor: "lastName",
                                headerClassName: 'hdrCls',
                                className: (this.state.activeCol === 'lastName') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_2  pl-0 pr-0 ',
                                Cell: (props) => (<div className="text_ellip_2line text-left">
                                    {props.original.lastName}
                                </div>)
                            },
                            {
                                Header: "Last Name",
                                accessor: "lastName",
                                headerClassName: 'hdrCls',
                                className: (this.state.activeCol === 'lastName') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_3  pl-0 pr-0',
                                Cell: (props) => (<div className="text_ellip_2line text-right">
                                    <a className="Req_btn_out_1 R_bt_co_green">Approvel</a>
                                </div>)
                            },
                            {
                                Header: "Expand",
                                headerClassName: 'hdrCls',
                                className: (this.state.activeCol === 'lastName') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_4  pl-0 pr-0 ',
                                expander: true,
                                Header: () => <strong>More</strong>,
                                width: 65,
                                Expander: ({ isExpanded, ...rest }) => (
                                    <div className="text-right">
                                        {isExpanded ? (
                                            <i className="icon icon-arrow-down icn_ar1"></i>
                                        ) : (
                                                <i className="icon icon-arrow-right icn_ar1"></i>
                                            )}
                                    </div>
                                ),
                            }


                        ]}

                        defaultPageSize={10}
                        SubComponent={() => <div className="References_table_SubComponent">

                            <div className="col-lg-offset-1 col-lg-10">

                                <div className="row">
                                    <div className="col-lg-3">
                                        <label className="My_Label_">Referentce Status:</label>

                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-12 col-sm-12">
                                        <label className="My_Label_">Relevant Notes:</label>
                                        <textarea className="w-100 border-black" rows="5"></textarea>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-12">

                                    </div>
                                </div>



                            </div>
                        </div>}

                        className="References_table hide_header_ReferencesTable" />

                </div>


                <div className="Award_list_table_">
                    <div className="Award_list_header_">
                        <div className="Award_col_1">
                            <strong>Work Area:</strong>
                        </div>
                        <div className="Award_col_2">
                            <strong>Level:</strong>
                        </div>
                        <div className="Award_col_3">
                            <strong>Paypoint:</strong>
                        </div>
                    </div>

                    <div className="Award_list_">
                        <div className="Award_list_col_1">
                            <strong>1.</strong>
                        </div>
                        <div className="Award_list_col_2">
                            <div className="">

                            </div>
                        </div>
                        <div className="Award_list_col_3">
                            <span className="">
                                <input type="text" className="border-black" />
                            </span>
                        </div>
                        <div className="Award_list_col_4">
                            <span className="">
                                <input type="text" className="border-black" />
                            </span>
                        </div>
                    </div>
                    <div className="Award_list_">
                        <div className="Award_list_col_1">
                            <strong>2.</strong>
                        </div>
                        <div className="Award_list_col_2">
                            <div className="">

                            </div>
                        </div>
                        <div className="Award_list_col_3">
                            <span className="">
                                <input type="text" className="border-black" />
                            </span>
                        </div>
                        <div className="Award_list_col_4">
                            <span className="">
                                <input type="text" className="border-black" />
                            </span>
                        </div>
                    </div>
                    <div className="Award_list_">
                        <div className="Award_list_col_1">
                            <strong>3.</strong>
                        </div>
                        <div className="Award_list_col_2">
                            <div className="">

                            </div>
                        </div>
                        <div className="Award_list_col_3">
                            <span className="">
                                <input type="text" className="border-black" />
                            </span>
                        </div>
                        <div className="Award_list_col_4">
                            <span className="">
                                <input type="text" className="border-black" />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="CheckList_Mand_Option">

                    <div className="Check_Mand_Option_li">
                        <div className="Ch-MO-1"><span>1. Resume</span></div>
                        <div className="Ch-MO-2">
                            <a className="Man_btn_2" href="#">Mandatory</a>
                        </div>
                        <div className="Ch-MO-3">
                            <span>
                                <i className="icon icon-accept-approve2-ie"></i>
                            </span>
                        </div>
                    </div>
                    <div className="Check_Mand_Option_li">
                        <div className="Ch-MO-1"><span>2. Resume</span></div>
                        <div className="Ch-MO-2">
                            <a className="Man_btn_2" href="#">Mandatory</a>
                        </div>
                        <div className="Ch-MO-3">
                            <span>
                                <i className="icon icon-accept-approve2-ie"></i>
                            </span>
                        </div>
                    </div>
                    <div className="Check_Mand_Option_li">
                        <div className="Ch-MO-1"><span>3. Resume</span></div>
                        <div className="Ch-MO-2">
                            <a className="Man_btn_2" href="#">Mandatory</a>
                        </div>
                        <div className="Ch-MO-3">
                            <span>
                                <i className="icon icon-accept-approve2-ie"></i>
                            </span>
                        </div>
                    </div>
                    <div className="Check_Mand_Option_li">
                        <div className="Ch-MO-1"><span>4. Resume</span></div>
                        <div className="Ch-MO-2">
                            <a className="Man_btn_1" href="#">Optional</a>
                        </div>
                        <div className="Ch-MO-3">
                            <span>
                                <i className="icon icon-accept-approve2-ie"></i>
                            </span>
                        </div>
                    </div>
                    <div className="Check_Mand_Option_li">
                        <div className="Ch-MO-1"><span>5. Resume</span></div>
                        <div className="Ch-MO-2">
                            <a className="Man_btn_1" href="#">Optional</a>
                        </div>
                        <div className="Ch-MO-3">
                            <span>
                                <i className="icon icon-accept-approve2-ie"></i>
                            </span>
                        </div>
                    </div>
                    <div className="Check_Mand_Option_li">
                        <div className="Ch-MO-1"><span>6. Resume</span></div>
                        <div className="Ch-MO-2">
                            <a className="Man_btn_1" href="#">Optional</a>
                        </div>
                        <div className="Ch-MO-3">
                            <span>
                                <i className="icon icon-accept-approve2-ie"></i>
                            </span>
                        </div>
                    </div>

                </div>


            </section>
        );
    }
}

export default UI;