import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';

import 'react-table/react-table.css'
import { css } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';


import {
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Icon,
    Button,
    Dropdown,
    DropdownTrigger} from '@salesforce/design-system-react'

import ListSearch from '../ListSearch';

class ListViewHeader extends Component {

    constructor(props) {
        super();
        this.state = {
            loading: false,
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            refresh: props.refresh
        }
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    setTableParams = () => {
        var search_re = { search: this.state.search, filter_opportunity_status: this.state.filter_opportunity_status };
        this.setState({ filtered: search_re });
    }

    handleOnSelectColumnSelectorItem = option => {
        const value = option.value

        let cols = [...this.state.displayed_columns]
        if (cols.indexOf(value) >= 0) {
            cols = cols.filter(col => col !== value)
        } else {
            cols = [...this.state.displayed_columns, value]
        }
        this.setState({ displayed_columns: cols })
        this.props.set_state({ displayed_columns: cols });
    }

    renderStatusFilters() {
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={this.state.opportunity_status_option}
                onSelect={value => this.filterChange('filter_opportunity_status', value.value)}
                length={null}
            // value={this.state.filter_opportunity_status} // uncontrolled component
            >
                <DropdownTrigger title={`Filter by status`}>
                    <Button
                        assistiveText={{ icon: 'Filter' }}
                        iconCategory="utility"
                        iconName="filterList"
                        iconVariant="more"
                        variant="icon"
                    // disabled={true}
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {

        const mapColumnsToOptions = columns.map(col => ({
            value: col.id || col.accessor,
            label: col._label,
        }))

        return (
            <Dropdown
                align="right"
                checkmark
                multiple
                assistiveText={{ icon: 'More' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={mapColumnsToOptions}
                value={this.state.default_displayed_columns}
                onSelect={(option) => this.handleOnSelectColumnSelectorItem(option)}
            >
                <DropdownTrigger>
                    <Button
                        title={`Show/hide columns`}
                        assistiveText={{ icon: 'Show/hide columns' }}
                        iconCategory="utility"
                        iconName="table"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    


    /**
     * @param {object} param
     * @param {import('react-table').Column[]} [param.columns]
     */
    handleOnRenderControls = ({ columns = [] }) => () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <ListSearch onSearch={(search) => this.props.onSearch(search)} placeholder="Search events" page={this.props.page} />
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderColumnSelector({ columns })}
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        const columns = this.props.get_columns();
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            icon={
                                <Icon
                                    assistiveText={{
                                        label: this.props.page.title || "List"
                                    }}
                                    category="standard"
                                    name={this.props.page.icon || "custom"}
                                    style={{
                                        backgroundColor: '#ea7600',
                                        fill: '#ffffff',
                                    }}
                                    title={this.props.page.title || "List"}
                                />
                            }
                            onRenderActions={this.props.on_render_actions || undefined}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title={this.props.page.title || "List"}
                            label={<span />}
                            trail={this.props.page.trail || undefined} //<a href="javascript:void(0);">Setup</a>
                            truncate
                            variant="object-home"
                        />
                    </IconSettings>
                </div>
            </React.Fragment>

        )
    }

}
const mapStateToProps = (state) => ({
    
})
const mapDispatchtoProps = (dispatch) => {
    return {
        
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListViewHeader);