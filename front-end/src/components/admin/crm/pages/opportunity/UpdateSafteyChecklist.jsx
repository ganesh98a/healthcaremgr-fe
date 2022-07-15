
import React, { Component } from 'react';
import _ from 'lodash'
import jQuery from 'jquery'
import { Link } from 'react-router-dom';
import moment from 'moment';
import { ROUTER_PATH } from 'config.js';
import { postData, toastMessageShow, handleShareholderNameChange } from 'service/common.js';
import { connect } from 'react-redux'


import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Icon from '@salesforce/design-system-react/lib/components/icon';

import { get_contact_details_for_view, archive_contact } from "components/admin/crm/actions/ContactAction.jsx"
import './print.css';

export const cc = (_this, key, idx, str, value) => {
    handleShareholderNameChange(_this, key, idx, str, value)
}

export const Radio = (props) => {
    let { item, idx, idx2, col, _this } = props;
    let checked = false;
    if ((item.item_value === "1" && col === "yes") || (item.item_value === "0" && col === "no") || (item.item_value === "2" && col === "na")) {
        checked = true;
    }
    let value = col === "yes" ? 1 : col === "no" ? 0 : 2;
    return (
        <div className="slds-form-element__control">
            <span className="slds-radio slds-float_left">
                <input type="radio" value={value} id={`item_${idx}_${idx2}_${col}`} name={`item_${idx}_${idx2}`} onChange={e => { _this.setItemValue(e, item, idx, idx2) }} checked={checked} />
                <label className="slds-radio__label" htmlFor={`item_${idx}_${idx2}_${col}`}>
                    <span className="slds-radio_faux"></span>
                    <span className="slds-form-element__label">&nbsp;</span>
                </label>
            </span>
        </div>
    )
}

class UpdateSafteyChecklist extends Component {

    constructor(props) {
        super(props);
        this.state = {
            items: []
        }
        this.rootRef = React.createRef()
    }

    setItemValue(e, item, rowIdx, itemIdx) {
        //e.preventDefault();
        let items = this.state.items;
        let eitem = items[item.category_name][itemIdx];
        eitem["item_value"] = e.target.value;
        items[item.category_name][itemIdx] = eitem;
        this.setState({ items });
    }

    setItemDetails(e, item, rowIdx, itemIdx) {
        //e.preventDefault();
        let items = this.state.items;
        let eitem = items[item.category_name][itemIdx];
        eitem["item_details"] = e.target.value;
        items[item.category_name][itemIdx] = eitem;
        this.setState({ items });
    }

    componentDidMount() {
        let opportunity_id = this.props.match.params.opportunity_id;
        if (opportunity_id) {
            this.get_checklist_details(opportunity_id);
        } else {
            let participant_id = this.props.match.params.participant_id;
            this.get_checklist_details(null, participant_id);
        }
    }

    // To get checklist details by id
    get_checklist_details = (opportunity_id, participant_id) => {
        this.setState({ loading: true });
        postData('sales/Opportunity/get_staff_safety_checklist_items', { opportunity_id, participant_id }).then((result) => {
            if (result.status) {
                this.setState({ loading: false });
                this.setState({ items: result.data, opportunity: result.opportunity, updated_by_name: result.updated_by_name, updated_by: result.updated_by, updated_at: result.updated_at, participant_id: result.participant_id || result.participant && result.participant.participant_id, participant: result.participant });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        });
    }

    componentWillReceiveProps(newProps) {
        var contactId = this.props.match.params.id;
        var updatedContactId = newProps.match.params.id;

        if (contactId != updatedContactId) {
            this.props.get_contact_details_for_view({ contactId: updatedContactId });
        }
    }


    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    print(id) {        
        let printWindow = window.open('', 'PRINT', 'height=400,width=600');
        let title = "";
        if (this.state.opportunity) {
            title = this.state.opportunity.topic +' - (' +this.state.opportunity.opportunity_number+')';
            printWindow.document.write('<html><head><title>Staff Safety Checklist - ' + title  + '</title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write('<hr />');
        } else if (this.state.participant) {
            title = this.state.participant.name;
            printWindow.document.write('<html><head><title>Staff Safety Checklist - ' + title  + '</title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write('<hr />');
        }
        printWindow.document.write(document.getElementById(id).innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close(); // necessary for IE >= 10
        printWindow.focus(); // necessary for IE >= 10*/
        printWindow.print();
        printWindow.close();
        return true;
    }

    actions = () => (
        <React.Fragment>
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Download" onClick={(e) => {
                        this.print("checklist-data");
                    }} />
                </ButtonGroup>
            </PageHeaderControl>
        </React.Fragment>
    );

    closeModal = (status) => {
        this.setState({ openCreateModal: false });
        this.get_task_details(this.props.match.params.id);
    }

    /**
    * Renders the details tab
    */
    renderChecklistItems() {
        let rows = [];
        this.state.items && Object.keys(this.state.items).map((cat_name, idx) => {
            rows.push(
                <tr key={`row-${idx}`} class="">
                    <td role="gridcell">
                        <div class="slds-truncate" title="Item"><b>{cat_name}</b></div>
                    </td>
                    <td role="gridcell">
                        <div class="slds-truncate" title="Yes">&nbsp;</div>
                    </td>
                    <td role="gridcell">
                        <div class="slds-truncate" title="No">&nbsp;</div>
                    </td>
                    <td role="gridcell">
                        <div class="slds-truncate" title="N/A">&nbsp;</div>
                    </td>
                    <td role="gridcell">
                        <div class="slds-truncate" title="Details/Action Required">&nbsp;</div>
                    </td>
                </tr>
            );
            rows = this.renderItems(rows, cat_name, idx);

        })
        return (
            <table class="slds-table slds-table_fixed-layout slds-table_header-fixed slds-table_resizable-cols slds-table_bordered">
                <tbody>
                    <tr class="">
                        <th style={{width: "50%"}} role="gridcell">
                            <div class="slds-truncate" title="Item">&nbsp;</div>
                        </th>
                        <th style={{width: "5%"}} role="gridcell">
                            <div class="slds-truncate" title="Yes">Yes</div>
                        </th>
                        <th style={{width: "5%"}} role="gridcell">
                            <div class="slds-truncate" title="No">No</div>
                        </th>
                        <th style={{width: "5%"}} role="gridcell">
                            <div class="slds-truncate" title="N/A">N/A</div>
                        </th>
                        <th role="gridcell">
                            <div class="slds-truncate" title="Details/Action Required">Details/Action Required</div>
                        </th>
                    </tr>
                    {
                        rows
                    }
                </tbody>
            </table>
        )
    }

    saveChecklistItem() {
        let opportunity_id = this.props.match.params.opportunity_id;
        let participant_id = this.state.participant_id || null;
        this.setState({ loading: true });
        postData('sales/Opportunity/save_staff_safety_checklist_items', { opportunity_id, participant_id, items: this.state.items }).then((result) => {
            if (result.status) {
                this.setState({ loading: false });
                toastMessageShow("Checklist updated successfully", "s");
                //this.get_checklist_details(opportunity_id);
                window.location.reload();
            } else {
                toastMessageShow('something went wrong', "e");
            }
        });
    }

    renderItems(rows, cat_name, idx) {
        this.state.items[cat_name] && this.state.items[cat_name].map((item, idx2) => {
            rows.push(
                <tr key={`row-${idx}`} class="">
                    <td role="gridcell">
                        <div style={{whiteSpace: "break-spaces"}} class="slds-truncate" title="Item">{item.item_name}</div>
                    </td>
                    <td role="gridcell">
                        <Radio item={item} idx={idx} idx2={idx2} col="yes" _this={this} />
                    </td>
                    <td role="gridcell">
                        <Radio item={item} idx={idx} idx2={idx2} col="no" _this={this} />
                    </td>
                    <td role="gridcell">
                        <Radio item={item} idx={idx} idx2={idx2} col="na" _this={this} />
                    </td>
                    <td role="gridcell">
                        <div class="" title="Details/Action Required">
                            <textarea style={{width:"100%", border:"1px solid #dddbda", height:this.getAutoHeight(item.item_details)}} onKeyUp={e => this.autoSize(e)} value={item.item_details} onChange={e => this.setItemDetails(e, item, idx, idx2)} />
                        </div>
                    </td>
                </tr>
            )
        }
        )
        return rows;
    }

    getAutoHeight(value) {
        if (!value) {
            return "62px";
        }
        let lines = value.split("\n");
        if (lines.length > 2) {
            return (lines.length * 22) + "px";
        }
    }

    autoSize(e) {
        e.preventDefault();
        if (e.keyCode === 13) {
            let scrolll = e.target.scrollHeight;
            e.target.style.height = (3 + scrolll) + "px";
        }
    }
    selectChange=(e)=>{
       console.log(e.currentTarget.value,'e');
    }
    render() {
        let det_link = this.props.match.params.opportunity_id && `${ROUTER_PATH}admin/crm/opportunity/${this.props.match.params.opportunity_id || this.props.match.params.participant_id}/`;
        if (this.props.match.params.participant_id) {
            det_link = `${ROUTER_PATH}admin/item/participant/details/${this.props.match.params.participant_id}`;
        }

        let details = [
            {
                label: 'Related To',
                content: <Link style={{ color: '#0070d2' }} to={det_link}>{this.state.opportunity && this.state.opportunity.opportunity_number || this.state.participant && this.state.participant.name}</Link>
            },
            {
                label: 'Last Updated By',
                content: 
                (<>
                <select onChange={(e)=>this.selectChange(e)}>
                <option ></option>
                <option >option2</option>
                <option >option3</option>
                <option >option3</option>
                </select>
                </>)
            },
            {
                label: 'Last Updated On',
                content: this.state.updated_at && moment(this.state.updated_at).format("DD/MM/YYYY") || "N/A"
            }
        ]        

        return (
            <React.Fragment>
                <div className="slds-grid slds-grid_vertical slds" ref={this.rootRef} style={{ "fontFamily": "Salesforce Sans, Arial, Helvetica, sans-serif", "margin-right": "-15px", "fontSize": "13px" }}>
                    <div className="slds-col custom_page_header">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    <Icon
                                        assistiveText={{ label: 'Staff/Enviornment Checklist' }}
                                        category="utility"
                                        name="list"
                                    />
                                }
                                label="Staff/Enviornment Checklist"
                                onRenderActions={this.actions}
                                title="Enviornment Checklist"
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>

                    <div className="slds-col slds-m-top_medium">
                        <div className="slds-grid">
                            <div className="slds-col slds-size_12-of-12  slds-p-right_small">
                                <div className="white_bg_color slds-box">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <div id="checklist-data" className="container-fluid">
                                            {this.renderChecklistItems()}
                                        </div>
                                        <table>
                                            <tr>
                                                <td>&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style={{ textAlign: "right" }} colSpan="5">
                                                    <Link className="slds-button slds-button_neutral" to={det_link}>Cancel</Link>

                                                    <Button className="slds-button slds-button_brand" disabled={this.state.loading} label="Save" onClick={(e) => {
                                                        e.preventDefault();
                                                        this.saveChecklistItem();
                                                    }}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                    </IconSettings >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment >
        );
    }
}


const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_details_for_view: (request) => dispatch(get_contact_details_for_view(request)),
        archive_contact: (id) => dispatch(archive_contact(id)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(UpdateSafteyChecklist);