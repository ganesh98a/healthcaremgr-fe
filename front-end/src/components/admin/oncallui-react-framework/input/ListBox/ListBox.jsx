import React from 'react';
import { Button } from '@salesforce/design-system-react';
import ListColumn from './ListColumn';
import Loading from '../../view/Loading';

class ListBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            from_list: { ...props.from_list },
            to_list: { ...props.to_list },
            selected: { list: { ...props.from_list, isLeft: true }, item: props.from_list.options[0] }
        };
    }

    leftToRight(e) {
        e.preventDefault();
        if (this.state.selected && this.state.selected.item && this.state.selected.list.isLeft) {
            let selected = this.state.selected;
            let to_list = this.state.to_list;
            to_list.options.push(this.state.selected.item);
            let from_list = this.state.from_list;
            from_list["options"] = from_list.options.filter(item => item.value !== selected.item.value);
            selected["item"] = undefined;
            if (this.props.leftToRight) {
                this.props.leftToRight(from_list, to_list);
            }
            this.setState({ from_list, to_list, selected });
        }
    }

    rightToLeft(e) {
        e.preventDefault();
        if (this.state.selected && this.state.selected.item && !this.state.selected.list.isLeft) {
            let selected = this.state.selected;
            let from_list = this.state.from_list;
            from_list.options.push(this.state.selected.item);
            let to_list = this.state.to_list;
            let to_options = to_list.options.filter(item => item.value !== selected.item.value);
            to_list["options"] = to_options;
            if (this.props.rightToLeft) {
                this.props.rightToLeft(from_list, to_list, selected);
            }
            selected["item"] = undefined;            
            this.setState({ from_list, to_list, selected });
        }
    }

    onItemSelected(e, item, list, isLeft = false) {
        //set selected item in left side
        e.preventDefault();
        let selected = { list: { ...list, isLeft }, item };
        this.setState({ selected });
    }

    componentWillReceiveProps(prevProps) {
        if (JSON.stringify(prevProps.from_list.options) !== JSON.stringify(this.state.from_list.options) || JSON.stringify(prevProps.to_list.options) !== JSON.stringify(this.state.to_list.options)) {
            let { from_list, to_list } = this.state;
            from_list["options"] = prevProps.from_list.options;
            to_list["options"] = prevProps.to_list.options;
            this.setState({ from_list, to_list });
        }
    }

    render() {
        return (
            <div class="slds-form-element" role="group" aria-labelledby="picklist-group-label">
                <span id="picklist-group-label" class="slds-form-element__label slds-form-element__legend">{this.props.heading || ""}</span>
                <div class="slds-form-element__control">
                    <div class="slds-dueling-list">
                        <div class="slds-assistive-text" id="drag-live-region" aria-live="assertive"></div>
                        <div class="slds-assistive-text" id="option-drag-label">Press space bar when on an item, to move it within the list. Cmd/Ctrl plus left and right arrow keys, to move items between lists.</div>
                        <ListColumn selected={this.state.selected.item} onItemSelected={(e, item) => this.onItemSelected(e, item, this.state.from_list, true)} heading={this.state.from_list.heading} options={this.state.from_list.options} loading={this.props.loading} />
                        <div class="slds-dueling-list__column">
                            <Button
                                iconCategory="utility"
                                iconName="right"
                                variant="base"
                                iconSize="medium"
                                className="slds-button_icon slds-button_icon-container"
                                onClick={(e) => this.leftToRight(e)}
                            />
                        </div>
                        <ListColumn onClear={(e, item) => this.onClear(e, item)} clearable onItemSelected={(e, item) => this.onItemSelected(e, item, this.state.to_list)} heading={this.state.to_list.heading} options={this.state.to_list.options} />
                    </div>
                </div >
            </div >
        )

    }

    onClear(e, item) {
        e.preventDefault();
        let to_list = this.state.to_list;
        let to_options = to_list.options.filter(itm => itm.value !== item.value);
        to_list["options"] = to_options;
        this.setState({to_list});
        if (this.props.rightToLeft) {
            let from_list = this.state.from_list;
            this.props.rightToLeft(from_list, to_list, item);
        }
    }
}

export default ListBox;