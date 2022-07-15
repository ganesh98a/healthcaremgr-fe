import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, toastMessageShow } from 'service/common.js';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import CustomModal from './CustomModal';
import DataTableView from './DataTableView';
import ListSearch from '../view/ListSearch';


/**
 * Renders the add shift member modal component
 */
class SelectionTable extends Component {

    /**
     * default constructor
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            selection: []
        }
    }

    resetSelection(e, idx) {
        e.preventDefault();
        let selection = this.state.selection.filter((item, index) => {
            return index !== idx;
        });
        this.setState({selection});
    }    

    searchList(search) {
        this.setState({search});
    }

    submitSelection(e) {
        e.preventDefault();
        let selection = this.state.selection;
        if (selection && selection.length) {
            this.props.submitSelection(this.state.selection);
        } else {
            toastMessageShow("Select at least one applicant", "e");
        }
    }

    setSelection(e, selection) {
        if (selection && selection.length <= this.props.limit) {
            this.setState({selection});
        } else {
            this.props.events.onMaximumSelection(e, selection);
        }
    }

    /**
     * rendering components
     */
    render() {
        return (
            <CustomModal 
                showModal={true}
                title={this.props.heading || "Add Applicants to The Group Booking"}
                size="large"
                setModal={status => this.props.setModal(status)}
                onClickOkButton={e => this.submitSelection(e)}
                loading={this.props.loading}
                footer={this.props.modalFooter}
                cancel_button={this.props.cancel_button || ''}
                ok_button={this.props.ok_button || ''}
            >
                <ListSearch
                    page={{
                        title: this.props.ListSearchPageTitle || "Applicant"
                    }}
                    id="search-applicants" 
                    iconRight="search" 
                    onSearch={search => {this.searchList(search)}} 
                />
                {(this.state.selection.length > 0) ?
                    <div className="slds-pill_container slds-pill_container_bare">
                        <ul className="slds-listbox slds-listbox_horizontal" role="listbox" aria-label="Selected Options:" aria-orientation="horizontal">
                                {this.state.selection.map((value, idx) => (                                    
                                        <li className="slds-listbox-item" role="presentation" key={idx + 9}>
                                            <span className="slds-pill" role="option" tabIndex="0" aria-selected="true">
                                                <span className="slds-pill__label" title={value.FullName}>{value.FullName}</span>
                                                <span className="slds-icon_container slds-pill__remove" title="Remove" onClick={(e) => this.resetSelection(e, idx)}>
                                                    <svg className="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                                                    </svg>
                                                </span>
                                            </span>
                                        </li>
                                ))}
                        </ul>
                    </div> : ''}
                    <div style={{marginBottom: "5px"}} className="slds-text-title slds-m-top_x-small" aria-live="polite">{this.state.selection.length} Applicant{(this.state.selection.length > 1)?'s':''} Selected</div>
                <DataTableView 
                    listing_api={this.props.listing_api}
                    columns={this.props.columns}
                    sortColumn={this.props.sortColumn}
                    search={this.state.search}
                    onSelectionChange={(e, selection) => this.setSelection(e, selection)}
                    selection={this.state.selection}
                />                
            </CustomModal>
        );
    }
}

export default SelectionTable;