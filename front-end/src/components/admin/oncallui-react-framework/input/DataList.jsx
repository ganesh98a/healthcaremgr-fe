import React from "react";
import SLDSReactTable from "../salesforce/SLDSReactTable";
import FormElement from "./FormElement";
import { requestData } from "../services/common";
import { ARF } from "../services/ARF";

class DataList extends React.Component {
    constructor(props) {
        super()
        this.reactTable = React.createRef();
        this.state = {
            loading: false,
            data_list: [],
            pageSize: 99999,
            page: 0,
            sorted: {},
            filtered: { filter_status: "active" },
            search: props.search
        }
    }
    UNSAFE_componentWillReceiveProps(props) {
        let search = props.search;
        this.setState({filtered: {...this.state.filtered, search_box: search, ...props.filter}});
        }
    fetchData(state) {
        this.setState({loading: true});
        let apiUrl = "imail/Templates/template_listing";
        if (this.props.apiUrl) {
            apiUrl = this.props.apiUrl;
        }
        let { pageSize, page, sorted, filtered } = state;
        requestData(apiUrl, pageSize, page, sorted, filtered).then((res) => {
            this.setState({ data_list: res.rows, pages: res.pages, loading: false });
        });
    }
    render() {
        const displayedColumns = this.props.columns;
        return (
            <React.Fragment>
                <FormElement>
                    <div id={ARF.uniqid(this.props)} className="slds-form-element__control">
                        <FormElement>
                            {this.props.header}
                        </FormElement>
                        <div style={{margin:"10px"}}></div>
                        <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={(state) => this.fetchData(state)}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayedColumns}
                            data={this.state.data_list}
                            defaultPageSize={9999}
                            minRows={1}
                            getTableProps={() => ({ role: 'grid', className: 'slds-table slds-table_bordered slds-table_col-bordered vertical-scroll' })}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No records Found"
                            collapseOnDataChange={true}
                            onRowChange={(e)=>console.log('dd')}
                            resizable
                        />
                        {this.props.footer}
                    </div>
                </FormElement>
            </React.Fragment>
        )
    }
}

export default DataList;