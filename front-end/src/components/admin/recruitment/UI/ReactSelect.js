import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';

import Select from 'react-select-plus';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';




const caretIcon = (
    <i className="icon icon-edit1-ie"></i>
);

const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {
        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>
                <div className="Per_Select">
                    <div className="Per_txt">{this.props.option.value}</div>
                    <div className="Per_icon"><i className="icon icon-star2-ie"></i></div>
                </div>
            </div>
        );
    }
});
class ReactSelect extends Component {

    constructor() {
        super();
        this.state = {
            cstmSelectHandler: false,

        }
    }





    render() {

        var options = [
            { value: 'Fiat', label: 'Fiat' },
            { value: 'Alta Remove', label: 'Alta Remove' },
            { value: 'Ferrari', label: 'Ferrari' },
            { value: 'Mercedes', label: 'Mercedes' },
            { value: 'Testle', label: 'Testle' },
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }

        ];


        return (
            <div className="cmn_select_dv star_slct ">
                <Select
                    name="view_by_status"
                    options={options}
                    required={true}
                    simpleValue={true}
                    searchable={false}
                    clearable={false}
                    placeholder="Filter by: Unread"
                    onChange={(e) => this.setState({ filterVal: e })}
                    value={this.state.filterVal}
                    optionComponent={GravatarOption}
                    multi={true}
                />
            </div>
        );
    }
}

export default ReactSelect;