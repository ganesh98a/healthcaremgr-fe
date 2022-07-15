import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, css, handleChange, queryOptionData, AjaxConfirm } from 'service/common.js';
import 'react-block-ui/style.css';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { Input, Timepicker, ButtonGroup, Dropdown, Spinner } from '@salesforce/design-system-react';
import moment from 'moment';
import SLDSReactTable from '../salesforce/lightning/SLDSReactTable'


class CopyShiftsModal extends Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            weeks_list: this.props.weeks_list,
            weeks_list_selected: [],
            subheader_checkbox: false
        }
    }

    /**
     * when submit button is clicked on the modal
     */
    onSubmit = (e) => {
        e.preventDefault();
        this.setState({ loading: true });

        var req = {
            weeks_list_selected: this.state.weeks_list_selected,
            shifts: this.props.shifts_list
        }
        postData('schedule/ScheduleDashboard/copy_shift_weekly_intervals', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                let msg = result.hasOwnProperty('msg') ? result.msg : '';
                toastMessageShow(result.msg, 's');
                this.props.closeModal(true);
            } 
            else if(result.status == false && result.account_shift_overlap == true) {
                var confirm_msg = result.error + ', Do you want to continue?';
                req.skip_account_shift_overlap = true;
                AjaxConfirm(req, confirm_msg, `schedule/ScheduleDashboard/copy_shift_weekly_intervals`, { confirm: 'Continue', heading_title:  "Copy Shifts" }).then(conf_result => {
                    if (conf_result.status) {
                        let msg = conf_result.hasOwnProperty('msg') ? conf_result.msg : '';
                        toastMessageShow(conf_result.msg, 's');
                        this.props.closeModal(true);
                    }
                    else {
                        toastMessageShow(conf_result.error, "e");
                    }
                })
            }
            else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * when checkboxes are clicked inside the data table
     */
    handleMultiSubCheckbox = (e, checkid) => {
        let tempArr = this.state.weeks_list_selected;
        if(checkid == undefined) {
            this.state.weeks_list.map((row) => {
                var index = tempArr.indexOf(row.week);
                if(e.target.checked == true) {
                    this.setState({subheader_checkbox: true});
                    if(index == -1) {
                        tempArr.push(row.week);
                    }
                }
                else if (index > -1) {
                    this.setState({subheader_checkbox: false});
                    tempArr.splice(index, 1);
                }
            });
        }
        else {
            var index = tempArr.indexOf(checkid);
            if(e.target.checked == true) {
                if(index == -1) {
                    tempArr.push(checkid);
                }
            }
            else if (index > -1) {
                this.setState({subheader_checkbox: false});
                tempArr.splice(index, 1);
            }
        }
        this.setState({weeks_list_selected: tempArr});
        if(tempArr.length == this.state.weeks_list.length) {
            this.setState({subheader_checkbox: true});
        }
    }

    /**
     * mounting all the components
     */
    componentDidMount() { }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'id',
                accessor: "id",
                id: 'id',
                Header: props => (
                    <div style={{width:'2rem'}} className="slds-checkbox">
                        <input type="checkbox" name="subheader_checkbox" id="subheader_checkbox" onChange={(e) => this.handleMultiSubCheckbox(e)} checked={this.state.subheader_checkbox} />
                        <label className="slds-checkbox__label" htmlFor="subheader_checkbox">
                            <span className="slds-checkbox_faux"></span>
                        </label>
                    </div>
                    ),
                    sortable: false,
                width:'2rem',
                Cell: props => {
                    var checkid = props.original.week;
                    var check_index = this.state.weeks_list_selected.indexOf(checkid);
                    var checked = (check_index == -1) ? false : true;
                    return (
                    <div style={{width:'2rem'}} className="slds-checkbox">
                        <input type="checkbox" name={checkid} id=
                        {checkid} onChange={(e) => this.handleMultiSubCheckbox(e, checkid)} checked={checked}/>
                        <label className="slds-checkbox__label" htmlFor={checkid}>
                            <span className="slds-checkbox_faux"></span>
                        </label>
                    </div>
                    )
                }
            },
            {
                _label: 'Week Starting',
                accessor: "week",
                id: 'week',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{moment(props.value).format('dddd, DD/MM/YYYY')}</span>
            }
        ]
    }

    /**
     * rendering components
     */
    render() {
        const columns = this.determineColumns();
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
            <div>
                <Modal
                size="small"
                heading={"Copy Shifts"}
                isOpen={this.props.openModal}
                footer={[
                    <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal()} />,
                    <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />
                ]}
                onRequestClose={() => this.props.closeModal(false)} >
                <div className="col-lg-12">
                    <div className="row py-2">
                        {this.state.loading ? <div style={{ position: 'relative', height: '15rem', width:'100%' }}>
                        <Spinner
                            size="large"
                            variant="base"
                            assistiveText={{ label: 'Main Frame Loading...' }}
                        />
                        </div> : 
                        <div className="col-sm-6">
                            <div className="slds-form-element pb-2">
                                <label className="slds-form-element__label" >Select the weeks to copy shifts to:</label>
                            </div>
                            <div style={{width:'100%'}}>
                                <SLDSReactTable
                                    PaginationComponent={() => false}
                                    ref={this.reactTable}
                                    manual="true"
                                    loading={this.state.loading}
                                    pages={this.state.pages}
                                    columns={columns}
                                    data={this.state.weeks_list}
                                    defaultPageSize={9999}
                                    minRows={1}
                                    selection={[]}
                                    selectRows="checkbox"
                                    getTableProps={() => ({ className: 'slds-table slds-table_bordered slds-table_striped slds-tbl-roles' })}
                                    onPageSizeChange={this.onPageSizeChange}
                                    noDataText="No records Found"
                                    collapseOnDataChange={true} 
                                    resizable={true} 
                                />
                            </div>
                        </div>
                        }
                    </div>
                </div>
                </Modal>
            </div>
            </IconSettings>
        );
    }
}

export default CopyShiftsModal;
