import React from 'react';

import { Dropdown, DataTableColumn, DataTableCell, DataTableRowActions, IconSettings } from '@salesforce/design-system-react';
import DataTable from '../salesforce/components/data-table';
import { postData, toastMessageShow } from 'service/common';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import { flag_style, unsucessful_style } from '../../oncallui-react-framework/services/common.js';

const CustomDataTableCell = ({ children, ...props }) => {
    if (props && props.item && (props.label == '') && props.item.flagged_status=='2') {    
        return (<DataTableCell title={'Applicant is flagged'} {...props} disabled={true}>
            <span style={props.item.flagged_status=='2' ? flag_style() : ''}></span>              
        </DataTableCell>)
    }else if(props && props.item && (props.label == '')  && props.item.application_process_status=='8')   {
        return (<DataTableCell title={'Application is unsuccessful'} {...props} disabled={true}>
                <span style={unsucessful_style()}></span>              
        </DataTableCell>)
    }  
    else {
        if (props && props.item && (props.label == 'Applicant Name')) {
        return (<DataTableCell title={children} {...props}>
                <Link id={'memlink'} to={ROUTER_PATH + 'admin/recruitment/applicant/'+props.item.applicant_id}
                    className="vcenter default-underlined slds-truncate"
                    style={{ color: '#0070d2' }}>
                    {children}
                </Link>           
        </DataTableCell>)}
        else if (props && props.item && (props.label == 'Application Id')) {
            return (<DataTableCell title={children} {...props}>
                    <Link id={'memlink'} to={ROUTER_PATH + 'admin/recruitment/application_details/' + props.item.applicant_id + '/' + props.item.application_id}
                        className="vcenter default-underlined slds-truncate"
                        style={{ color: '#0070d2' }}>
                        {children}
                    </Link>
            </DataTableCell>)}
            else if (props && props.item && (props.label == 'Email' || props.label == 'Job Title' || props.label == 'Application Status')) {
                return (<DataTableCell title={children} {...props}>
                        <span
                            className="vcenter default-underlined slds-truncate"
                            style={{ color: '#000' }}>
                            {children}
                        </span>
                </DataTableCell>)}
                else{
                    return (<DataTableCell title={children} {...props}>
                        <a
                            href="javascript:void(0);"
                            onClick={(event) => {
                                event.preventDefault();
                            }}
                        >
                            {children}
                        </a>
                    </DataTableCell>)
            }
    }
};

CustomDataTableCell.displayName = DataTableCell.displayName;

class DataTableView extends React.Component {

    page = 0;

    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            isLoading: false,
            columns: props.columns,
            sortColumn: props.sortColumn,
            sortColumnDirection: {
                opportunityName: 'asc',
            },
            items: [],
            selection: [],
            hasMore: true
        };
    }

    componentDidMount() {
        this.loadList();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.search !== this.props.search) {
            this.page = 0;
            this.setState({items: []}, this.loadList());
        }
        if (JSON.stringify(prevProps.selection) !== JSON.stringify(this.props.selection)) {
            this.setState({selection: this.props.selection});
        }
    }

    loadList = () => {
        if (this.state.isLoading) {
            return true;
        }
        this.setState({ isLoading: true });
        var req = { pageSize: 20, page: this.page, filtered: {search: this.props.search || ""} }
        postData(this.props.listing_api, req).then((result) => {
            this.setState({ isLoading: false });
            if (result.status) {
                const items = this.state.items.slice().concat(result.data);
                this.setState({ items, hasMore: result.data.length ? true : false }, () => {
                    this.page = this.page + 1;
                });
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    handleChanged = (event, data) => {
        let array = [];
        data.selection.forEach((e, i) => {
            if (e.flagged_status != '2' && e.application_process_status !='8') {
                array.push(e);
            }
        })
        this.setState({ selection: array });
        this.props.onSelectionChange(event, array);
    };

    handleRowAction = (item, action) => {
        //console.log(item, action);
    };

    handleSort = (sortColumn, ...rest) => {
        if (this.props.log) {
            this.props.log('sort')(sortColumn, ...rest);
        }

        const sortProperty = sortColumn.property;
        const { sortDirection } = sortColumn;
        const newState = {
            sortColumn: sortProperty,
            sortColumnDirection: {
                [sortProperty]: sortDirection,
            },
            items: [...this.state.items],
        };

        // needs to work in both directions
        newState.items = newState.items.sort((a, b) => {
            let val = 0;

            if (a[sortProperty] > b[sortProperty]) {
                val = 1;
            }
            if (a[sortProperty] < b[sortProperty]) {
                val = -1;
            }

            if (sortDirection === 'desc') {
                val *= -1;
            }

            return val;
        });

        this.setState(newState);
    };

    handleLoadMore = () => {
        if (!this.isLoading) {
            setTimeout(() => {
                const moreItems = this.state.items.map((item) => {
                    const copy = { ...item };
                    return copy;
                });
                this.page = this.page + 1;
                const items = this.state.items.slice().concat(moreItems);

                this.setState({ items, hasMore: this.state.hasMore }, () => {
                    this.isLoading = false;
                });
            }, 1000);
        }
        this.isLoading = true;
    };

    render() {
        return (
            <div
                className={'modal-selection-table-pad'}
                style={{
                    height: '200px',
                }}
            >

                <DataTable
                    assistiveText={{
                        actionsHeader: 'actions',
                        columnSort: 'sort this column',
                        columnSortedAscending: 'asc',
                        columnSortedDescending: 'desc',
                        selectAllRows: 'Select all rows',
                        selectRow: 'Select this row',
                    }}
                    fixedHeader
                    fixedLayout
                    items={this.state.items}
                    id="DataTableExample-FixedHeaders"
                    onRowChange={this.handleChanged}
                    onSort={this.handleSort}
                    selection={this.props.selection || this.state.selection}
                    selectRows="checkbox"
                    hasMore={this.state.hasMore}
                    onLoadMore={this.loadList}
                >
                    {
                        this.state.columns && this.state.columns.map((col, key) => {

                            let colkey = col.accessor || col.id || undefined;
                            return (
                                
                                colkey && colkey !== "actions" && <DataTableColumn
                                    key={`col-${key}`}
                                    isSorted={this.state.sortColumn === colkey}
                                    label={col._label}
                                    primaryColumn
                                    property={colkey}
                                    sortable = {col.sortable}
                                    sortDirection={this.state.sortColumnDirection.colkey}
                                    width={col.width}
                                >
                                    <CustomDataTableCell
                                        key={`cell-${key}`}
                                    />
                                </DataTableColumn> || <DataTableRowActions
                                
                                    options={[]}
                                    menuPosition="overflowBoundaryElement"
                                    onAction={this.handleRowAction}
                                    dropdown={<Dropdown length="7" />}
                                />
                            )
                        })
                    }

                </DataTable>
            </div>
        );
    }
}

export default DataTableView;