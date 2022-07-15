import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, handleShareholderNameChange, handleChangeChkboxInput } from 'service/common.js';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Spinner from '@salesforce/design-system-react/lib/components/spinner';


class DiagnosisAdd extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            selected_item: 0,
            searchResult: [],
            srch_box: '',
            srch_param: '',
        }

    }

    componentDidMount() {
        if (this.props.isResultAlreadySelected) {
            this.loadSelectedData();
        }
    }

    /*
    *here active line item is call when dialog is first time open 
    *on back button we populate stae with old data
    */
    loadSelectedData = () => {
        this.setState({ loading: true });
        this.setState({ searchResult: this.props.searchResult }, () => {
            this.setState({ loading: false });
        });
    }

    searchData = (e) => {
        e.preventDefault();
        var requestData = { srch_box: this.state.srch_box, need_assessment_id: this.props.need_assessment_id };
        this.setState({ loading: true });
        postData('sales/NeedAssessment/get_diagnosis', requestData).then((result) => {
            if (result.status) {
                this.updateSearchResult();                
                this.setState({ searchResult: [...this.state.searchResult,...result.data] }, () => {
                    this.setState({ loading: false });
                });

            } else {
                toastMessageShow(result.msg, "e");
                this.setState({ loading: false });
            }
        });
    }

    updateSearchResult = (e) => {
        var temp = [];
        this.state.searchResult.map((value, idx) => {
            if (value.selected) {
                temp = [...temp, value];
            }
        })
        if(temp)
            this.setState({'searchResult':temp});
    }

    render() {
        var selected_count = 0;
        this.state.searchResult.map((value, idx) => {
            if (value.selected) {
                selected_count += 1;
            }
        })
        return (
            <div>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <div>
                        <Modal
                            isOpen={this.props.openAddDiagnosis}
                            footer={[
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeDiagnosisDialog(false)} />,
                                <Button disabled={this.state.loading} label="Next" variant="brand" onClick={e => this.props.closeDiagnosisDialog(true)} />,
                            ]}
                            onRequestClose={this.toggleOpen}
                            heading="Add Diagnosis"
                            size="medium"
                            className="slds_custom_modal"
                            onRequestClose={() => this.props.closeDiagnosisDialog(false)}
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
                                                            <input type="text" className="slds-input slds-combobox__input" id="combobox-unique-id-20" aria-autocomplete="list" autoComplete="off" role="textbox" placeholder="Search" name="srch_box" onChange={(e) => handleChangeChkboxInput(this, e)} />
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
                                            {(this.state.searchResult.length > 0) ?
                                                this.state.searchResult.map((value, idx) => (
                                                    (value.selected) ?
                                                        <li className="slds-listbox-item" role="presentation" key={idx + 9}>
                                                            <span className="slds-pill" role="option" tabIndex="0" aria-selected="true">
                                                                <span className="slds-pill__label" title={value.label}>{value.label}</span>
                                                                <span className="slds-icon_container slds-pill__remove" title="Remove" onClick={(e) => handleShareholderNameChange(this, 'searchResult', idx, 'selected', false, e)}>
                                                                    <svg className="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                                                                    </svg>
                                                                </span>
                                                            </span>
                                                        </li> : ''
                                                )) : ''}
                                        </ul>
                                    </div>
                                    <div className="slds-text-title slds-m-top_x-small" aria-live="polite">{selected_count} Item {(selected_count > 1) ? '(s)' : ''} Selected</div>
                                </div>
                                <div className="slds-scrollable slds-grow">
                                    <div className="slds-scrollable_none">

                                        <table aria-multiselectable="true" className="slds-table slds-no-row-hover slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols" role="grid">
                                            <thead>
                                                <tr className="slds-line-height_reset">
                                                    <th className="" scope="col" style={{ width: "5%" }}></th>
                                                    <th aria-label="Search Term" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Search Term">Search Term</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Search Term column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-66" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>

                                                    <th aria-label="Prefered Term" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "45%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Prefered Term">Prefered Term</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Prefered Term column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-65" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    
                                                    {/*<th aria-label="Parent" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Parent">Parent</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Parent column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-67" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th aria-label="Child Count" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                        <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">
                                                            <span className="slds-assistive-text">Sort by: </span>
                                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                <span className="slds-truncate" title="Child Count">Child Count</span>
                                                                <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                    <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </a>
                                                        <div className="slds-resizable">
                                                            <input type="range" aria-label="Child Count column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-67" max="1000" min="20" tabIndex="-1" />
                                                            <span className="slds-resizable__handle">
                                                                <span className="slds-resizable__divider"></span>
                                                            </span>
                                                        </div>
                                                    </th>*/}
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
                                                    (this.state.searchResult.length == 0) ?
                                                        <tr><td role="gridcell" colSpan="3"><div className="slds-truncate">&nbsp;</div></td></tr> : ''
                                                }

                                                {
                                                    this.state.searchResult.map((value, idx) => {
                                                        var activeClass = '';
                                                        if (value.selected)
                                                            activeClass = 'slds-hint-parent slds-is-selected';
                                                        else
                                                            activeClass = 'slds-hint-parent';

                                                        return <tr className={activeClass} key={idx} aria-selected={(value.selected) ? 'true' : 'false'} key={idx}>

                                                            <td className="slds-text-align_right" role="gridcell">
                                                                <div className="slds-checkbox_add-button">

                                                                    <input type="checkbox" className="slds-assistive-text" id={'add-checkbox-' + value.conceptId} value={'add-checkbox-' + value.conceptId} tabIndex="-1" onChange={(e) => handleShareholderNameChange(this, 'searchResult', idx, 'selected', e.target.checked)} checked={value.selected ? true : false} />
                                                                    <label htmlFor={'add-checkbox-' + value.conceptId} className="slds-checkbox_faux" >
                                                                        <span className="slds-assistive-text">Select item 2</span>
                                                                    </label>
                                                                </div>
                                                            </td>

                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={value.search_term}>{value.search_term}</div>
                                                            </td>

                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={value.label}>{value.label}</div>
                                                            </td>
                                                            
                                                            {/*<td role="gridcell">
                                                                <div className="slds-truncate" title={value.parent}>{value.parent}</div>
                                                            </td>
                                                            <td role="gridcell">
                                                                <div className="slds-truncate" title={value.child_count}>{value.child_count}</div>
                                                            </td>*/}
                                                        </tr>
                                                    })}
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

export default DiagnosisAdd;