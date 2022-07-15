import React from "react";
import { Input, InputIcon } from '@salesforce/design-system-react'

class ListSearch extends React.Component {
    constructor() {
        super();
        this.state = {
            search: ""
        }
    }

    submitSearch() {
        return false;
    }

    onChange(search) {   
        this.setState({ search });        
    }

    handleKeyDown = (e) => {        
        if (((e.key === 'Backspace' && e.target.value.length <= 1) || (e.key === 'Enter')) && this.props.onSearch) {
            let search = e.target.value;
            if (e.key === 'Backspace' && search.length === 1) {
                search = '';
            }
            this.props.onSearch(search);
        }
    }

    render() {
        return (
            <div style={{ "margin-bottom": "5px" }}>
                {this.props.label && <label className="slds-form-element__label">
                    {this.props.label}
                </label>
                }
                <Input
                    iconLeft={
                        <InputIcon
                            assistiveText={{
                                icon: 'Search',
                            }}
                            name="search"
                            category="utility"
                        />
                    }
                    iconRight={
                        <InputIcon
                            assistiveText={{
                                icon: 'Clear',
                            }}
                            name="clear"
                            category="utility"
                            onClick={() => {
                                this.setState({search: ""})
                            }}
                        />
                    }
                    id="list-search-1"
                    placeholder={this.props.placeholder || `Search ${this.props.page.title || "List"}`}
                    onChange={(e) => this.onChange(e.target.value)}
                    onKeyDown={(e) => this.handleKeyDown(e)}
                    value={this.state.search}
                />
            </div>
        )
    }
}

export default ListSearch;