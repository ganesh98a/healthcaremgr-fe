import React from "react";
//TODO
class SearchList extends React.Component {
    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <div style={{
                    height: '200px', "overflow-y": 'scroll'
                }} className="slds-grid slds-grid_vertical slds-box">
                    <Card
                        id="ExampleCard"
                        filter={
                            <CardFilter placeholder="Search" onChange={this.handleFilterChange} />
                        }
                        heading={false}
                    >
                        <DataTable
                            fixedHeader
                            fixedLayout

                            selectRows="radio"
                            items={[
                                { id: '1', name: 'Cloudhub', description: 'asa  as as  asasa' },
                                { id: '1', name: 'Cloudhub', description: 'asa  as as  asasa' },
                                { id: '1', name: 'Cloudhub', description: 'asa  as as  asasa' },
                                { id: '1', name: 'Cloudhub', description: 'asa  as as  asasa' },
                                { id: '1', name: 'Cloudhub', description: 'asa  as as  asasa' },
                                { id: '1', name: 'Cloudhub', description: 'asa  as as  asasa' }
                            ]} id="DataTableExample-1">
                            <DataTableColumn
                                label="Template"
                                property="name"
                                truncate
                            />
                            <DataTableColumn
                                label="Description"
                                property="description"
                                truncate
                            />
                        </DataTable>
                    </Card>
                </div>
            </IconSettings>
        )
    }
}