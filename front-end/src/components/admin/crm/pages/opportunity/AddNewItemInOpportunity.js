import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Spinner from '@salesforce/design-system-react/lib/components/spinner';
import React, { Component } from 'react';
import {
    checkItsNotLoggedIn,
    handleChangeChkboxInput,
    handleShareholderNameChange,
    postData,
    toastMessageShow,
} from 'service/common.js';

class AddNewItemInOpportunity extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            redirectPage: false,
            selected_item: 0,
            activeLineItem: [],
            selectedLineItems: [],
            srch_box:'',
        }
        
    }

    componentDidMount() {
        this.manageActiveLineItem();
        if (this.props.selectedLineItem) {
            this.setState({
                selectedLineItems: this.props.selectedLineItem
            })
        }
        if (this.props.activeLineItem) {
            this.setState({
                activeLineItem: this.props.activeLineItem
            })
        }
    }

    /*
    *here active line item is call when dialog is first time open 
    *on back button we populate stae with old data
    */
    manageActiveLineItem =()=>{
        this.setState({ loading: true });
        if(this.props.callGetLineItem){
            var requestData = { srch_box: this.state.srch_box,opp_id:this.props.opp_id };
            this.getActiveLineItem(requestData);
        }else{
            this.setState({ activeLineItem: this.props.activeLineItem }, () => {
                //console.log('xx back btn',this.state.activeLineItem)
                this.setState({ loading: false });
            });
        }
    }

    getActiveLineItem = (requestData) => {
        this.setState({ loading: true });
        postData('sales/Opportunity/get_finance_active_line_item_listing',requestData).then((result) => {
            if (result.status) {
                let lineItem = result.data;
                let selectedLineItems = this.state.selectedLineItems;
                lineItem.map((value, idx) => {
                    let findIndexLI = selectedLineItems.findIndex((x) => x.id === value.id);
                    if (value.selected && findIndexLI === -1) {
                        // value.selected = true;
                        selectedLineItems.push(value);
                    }
                    if (findIndexLI > -1) {
                        value.selected = true;
                        lineItem[idx].selected = true;
                    }
                }) ;
                this.setState({ activeLineItem: result.data, selectedLineItems: selectedLineItems }, () => {
                    //console.log('xx API reposne',this.state.activeLineItem)
                    this.setState({ loading: false });
                });
            } else {
                toastMessageShow('Something went wrong', "e");
                this.setState({ loading: false });
            }
        });
    }

    searchData = (e) => {
        e.preventDefault();
        var requestData = { srch_box: this.state.srch_box,opp_id:this.props.opp_id };
        this.getActiveLineItem(requestData);
    }

    //Handle line item selection
    handleItemselect(e, idx, category_ref, line_item_number) {
        
        handleShareholderNameChange(this, 'activeLineItem', idx, 'selected', e.target.checked).then(status => {
            //Check only child element for parent selection already completed or not completed            
            if (status) {
                this.onSelectLineItem(idx, true, e);
                this.selectParentLineItem(category_ref, line_item_number);                
            }
        });
    }

    /**
     * onChangeselect
     * @param {int} idx 
     * @param {boolean} selectCond 
     * @param {*} e 
     */
    onSelectLineItem = (idx, selectCond, e) => {
        let lineItem = [];
        let selectedLineItems = this.state.selectedLineItems;
        var result = false;
        if (selectCond) {
            lineItem = this.state.activeLineItem[idx];
        } else {
            lineItem = this.state.selectedLineItems[idx];
        }

        if (lineItem.category_ref === '') {
            this.state.selectedLineItems.forEach((item, i) => {
                if (lineItem.category_ref == '' && item.category_ref === lineItem.line_item_number) {
                    result = true;
                }
            });
        }

        if (result) {
            toastMessageShow('Selected parent item has child line item', "e");
            return;
        }

        if (lineItem && lineItem.id) {
            let findIndexLI = selectedLineItems.findIndex((x) => x.id === lineItem.id);
            let activeItemIndex = this.state.activeLineItem.findIndex((x) => x.id === lineItem.id);
            if (findIndexLI > -1) {
                if (!result) {
                    selectedLineItems.splice(findIndexLI, 1);
                    if (activeItemIndex > -1) {
                        let activeItems = this.state.activeLineItem;
                        activeItems[activeItemIndex].selected = false;
                        this.setState({ activeLineItem: activeItems });
                    }
                }
            } else {
                lineItem.selected = true;
                selectedLineItems.push(lineItem);
            }
            this.setState({ selectedLineItems: selectedLineItems }, () => {});
        }    
    } 

    //Select parentItem while select the child item
    selectParentLineItem(item_ref, line_item_number) {        
        let tempitem = this.state.activeLineItem;
        this.state.activeLineItem.map((item, itemid) => {               
            //Select parent item if parent not alreay select
            if (item.line_item_number === item_ref && !item.selected) {
                let newItem = item;
                newItem.selected = true;
                let selectedItems = this.state.selectedLineItems;
                
                selectedItems.push(newItem);
                this.setState({ selectedLineItems: selectedItems });

                tempitem[itemid].selected = true;                
                this.setState({tempitem});
            } else if(item_ref == '' && item.line_item_number === line_item_number) {
               //Disable Parent item on parent item clickif Child item selected
                if(this.checkChildItem(line_item_number) == true) {                   
                    tempitem[itemid].selected = true;                   
                    this.setState({tempitem});
                    toastMessageShow('Selected parent line item has child line item', "e");
                }
            }
        });
    }

    //Check child items found while click the parent selection
    checkChildItem(line_item_number) {     
        for (const item of this.state.activeLineItem) {
            if (item.category_ref === line_item_number && item.selected) {    
                return true;
            }
          }
    }

    render() {
        var selected_count = 0;
        this.state.selectedLineItems.map((value, idx) => {
            if (value.selected) {
                selected_count += 1;
            }
        }) 

        return (
            <div>               
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <div>
                        <Modal
                            isOpen={this.props.openItemDialog}
                            footer={[
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeItemDialog(false,false)} />,
                                <Button disabled={this.state.loading} label="Next" variant="brand" onClick={e => this.props.closeItemDialog(false,true) } />,
                            ]}
                            onRequestClose={this.toggleOpen}
                            heading={this.props.agreement_id ? "Update Add Items" : "Add Items"}
                            size="large"
                            className="slds_custom_modal"
                            onRequestClose={() => this.props.closeItemDialog(false)}
                            dismissOnClickOutside={false}
                        >
                            <div className="slds-col slds-grid slds-grid_vertical slds-nowrap">
                                <div className="slds-p-vertical_x-small slds-p-horizontal_large slds-shrink-none slds-theme_shade">
                                    <div className="slds-form-element">
                                        <label className="slds-form-element__label slds-assistive-text" htmlFor="combobox-unique-id-20">Search</label>
                                        <div className="slds-form-element__control">
                                            <div className="slds-combobox_container">
                                                <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-expanded="false" aria-haspopup="listbox" role="combobox">
                                                    <form id="srch_task" autoComplete="off" onSubmit={this.searchData} method="post">
                                                        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                                            <input type="text" className="slds-input slds-combobox__input" id="combobox-unique-id-20" aria-autocomplete="list" autoComplete="off" role="textbox" placeholder="Search Line item by name and number" name="srch_box" onChange={(e) => handleChangeChkboxInput(this, e)}/>
                                                            <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">
                                                                <svg className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                                                    <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#search"></use>
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    </form>
                                                    <div id="listbox-unique-id" role="listbox" className="slds-dropdown slds-dropdown_fluid">
                                                        <ul className="slds-listbox slds-listbox_vertical" role="presentation">
                                                            <li role="presentation" className="slds-listbox__item">
                                                                <div id="listbox-option-unique-id-01" className="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                                                                    <span className="slds-media__figure">
                                                                        <span className="slds-icon_container slds-icon-standard-account">
                                                                            <svg className="slds-icon slds-icon_small" aria-hidden="true">
                                                                                <use href="/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#account"></use>
                                                                            </svg>
                                                                        </span>
                                                                    </span>
                                                                    <span className="slds-media__body">
                                                                        <span className="slds-listbox__option-text slds-listbox__option-text_entity">Acme</span>
                                                                        <span className="slds-listbox__option-meta slds-listbox__option-meta_entity">Account • San Francisco</span>
                                                                    </span>
                                                                </div>
                                                            </li>
                                                            <li role="presentation" className="slds-listbox__item">
                                                                <div id="listbox-option-unique-id-02" className="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                                                                    <span className="slds-media__figure">
                                                                        <span className="slds-icon_container slds-icon-standard-account">
                                                                            <svg className="slds-icon slds-icon_small" aria-hidden="true">
                                                                                <use href="/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#account"></use>
                                                                            </svg>
                                                                        </span>
                                                                    </span>
                                                                    <span className="slds-media__body">
                                                                        <span className="slds-listbox__option-text slds-listbox__option-text_entity">Salesforce.com, Inc.</span>
                                                                        <span className="slds-listbox__option-meta slds-listbox__option-meta_entity">Account • San Francisco</span>
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="slds-pill_container slds-pill_container_bare">
                                       <ul className="slds-listbox slds-listbox_horizontal" role="listbox" aria-label="Selected Options:" aria-orientation="horizontal">
                                            {(this.state.selectedLineItems.length > 0) ?
                                                this.state.selectedLineItems.map((value, idx) => (
                                                    (value.selected) ?
                                                        <li className="slds-listbox-item" role="presentation" key={idx + 9}>
                                                            <span className="slds-pill" role="option" tabIndex="0" aria-selected="true">
                                                                <span className="slds-pill__label" title={value.line_item_name}>{value.line_item_name}</span>
                                                                <span className="slds-icon_container slds-pill__remove" title="Remove" onClick={(e) => {
                                                                this.onSelectLineItem(idx, false, e);
                                                            }}>
                                                                    <svg className="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                                                                    </svg>
                                                                </span>
                                                            </span>
                                                        </li> : ''
                                                )) : ''}
                                        </ul>
                                    </div>
                                    <div className="slds-text-title slds-m-top_x-small" aria-live="polite">{selected_count} Item {(selected_count > 1)?'(s)':''} Selected</div>
                                </div>
                                <div className="slds-scrollable slds-grow">
                                    <div className="slds-scrollable_none">

                                        <table aria-multiselectable="true" className="slds-table slds-no-row-hover slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols" role="grid">
                                            <thead>
                                                <tr className="slds-line-height_reset">
                                                    <th className="" scope="col" style={{ width: "5%" }}></th>
                                                    <th aria-label="Item" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "45%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Item">Item</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Item column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-65" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th aria-label="Item Number" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Item Number">Item Number</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Item Number column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-66" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    
                                                    <th aria-label="ONCALL provided" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="ONCALL provided">ONCALL provided</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="ONCALL provided column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-67" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th aria-label="Purpose" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Purpose">Purpose</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Support Category column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-67" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th aria-label="Support Type" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Support Type">Support Type</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Support Category column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-67" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(this.state.loading) ?
                                                    <div style={{ position: 'relative', height: '5rem' }}>
                                                        <Spinner
                                                            size="small"
                                                            variant="base"
                                                            assistiveText={{ label: 'Main Frame Loading...' }}
                                                        />
                                                    </div> : ''}

                                                {
                                                    this.state.activeLineItem.map((value, idx) => {
                                                        var activeClass = '';
                                                        if(value.selected)
                                                            activeClass ='slds-hint-parent slds-is-selected';
                                                        else
                                                            activeClass ='slds-hint-parent';
                                                        
                                                        return <tr className={activeClass} key={idx} aria-selected={(value.selected) ? 'true' : 'false'} >
                                                            
                                                            <td className="slds-text-align_right" role="gridcell">
                                                                <div className="slds-checkbox_add-button">

                                                                    <input type="checkbox" className="slds-assistive-text" id={'add-checkbox-'+value.id} value={'add-checkbox-'+value.id}  tabIndex="-1" onChange={(e) => this.handleItemselect(e, idx, value.category_ref, value.line_item_number)} checked={value.selected?true:false}
                                                                    />                                                                    
                                                                    <label htmlFor={'add-checkbox-'+value.id} className="slds-checkbox_faux" >
                                                                        <span className="slds-assistive-text">Select item 2</span>
                                                                    </label>
                                                                </div>
                                                            </td>

                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={value.line_item_name}>{value.line_item_name}</div>
                                                            </td>
                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={value.line_item_number}>{value.line_item_number}</div>
                                                            </td>
                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={'ONCALL provided'}>{value.oncall_provided}</div>                     
                                                            </td>
                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={value.support_purpose}>{value.support_purpose}</div>

                                                            </td>
                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={value.support_type}>{value.support_type}</div>

                                                            </td>
                                                        </tr>
                                                    }) }

                                            </tbody>

                                        </table>

                                    </div>
                                </div>
                            </div>
                        </Modal >
                    </div >
                </IconSettings >
            </div >
        );
    }
}

export default AddNewItemInOpportunity;