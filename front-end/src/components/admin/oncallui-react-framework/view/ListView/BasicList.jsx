import React, { Component } from 'react';
import jQuery from 'jquery';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


import { IconSettings } from '@salesforce/design-system-react'
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'

import { postData, reFreshReactTable, css } from '../../services/common.js';


class BasicList extends Component {

    constructor(props) {
        super();
        this.state = {
            dataRows: [],
            filter_status: props.filter_status || 'all',
            displayed_columns: props.displayed_columns, //Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            selectfilteroptions: props.filter_options
        }
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    requestData(pageSize, page, sorted, filtered) {
        if (!this.props.list_api_url) {
            throw new Error("Missing props: list_api_url")
        }
        return new Promise((resolve) => {
            // request json
            var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, search: this.props.search };
            postData(this.props.list_api_url, Request).then((result) => {
                if (result.status) {
                    let filteredData = result.data;
                    const res = {
                        rows: filteredData,
                        pages: (result.count)
                    };
                    resolve(res);
                } else {
                    const res = {
                        rows: [],
                        pages: 0
                    };
                    resolve(res);
                }

            });

        });
    }

    componentDidUpdate(props) {
        const { refresh_list } = this.props;
        if (props.refresh_list !== refresh_list) {
            reFreshReactTable(this, "fetchData");
        }
    }

    componentDidMount() {
        jQuery(this.rootRef.current).parent(`.col-lg-11`).removeClass(`col-lg-11`).addClass(`col-lg-12`);
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent(`.col-lg-12`).removeClass(`col-lg-12`).addClass(`col-lg-11`)
    }

    showselectedfilters = (type) => {
        this.setState({ showselectfilters: false, showselectedfilters: !type });
    }
    fetchData = (state) => {
        this.setState({
            fil_pageSize: state.pageSize,
            fil_page: state.page,
            fil_sorted: state.sorted,
            fil_filtered: state.filtered,
            loading: true
        });
        this.requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                dataRows: res.rows,
                pages: res.pages,
                loading: false
            });
            if (this.props.list_api_callback) {
                this.props.list_api_callback(res);
            }
        });
    }

    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.props.displayed_columns;
        //const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0)
        
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.props.ref || this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={(e) => this.fetchData(e)}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={columns}
                            data={this.state.dataRows}
                            defaultPageSize={9999}
                            minRows={1}
                            selection={[]}
                            selectRows="checkbox"
                            onPageSizeChange={this.props.onPageSizeChange || (() => {return false})}
                            noDataText="No records Found"
                            collapseOnDataChange={true}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            resizable={true}
                        />
                    </IconSettings>
                </div>
            </React.Fragment>
        )
    }

}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType
})

const mapDispatchtoProps = () => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps, null, { withRef: true })(BasicList);