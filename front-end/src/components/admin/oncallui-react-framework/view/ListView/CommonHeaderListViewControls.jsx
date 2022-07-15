import React, { Component } from 'react';
import { Dropdown, Button, Popover, ButtonGroup } from '@salesforce/design-system-react';
import { postData, toastMessageShow} from '../../services/common';


class CommonHeaderListViewControls extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
    }
    /**
     *  set the pinned and unpin the list view using related type and id
     * * @param {*} related_type, filter_list_id
     */
    pinAndUnpinFilterList = (e) => {
        var req = {
            pin_list_id: this.props.filter_list_id,
            related_type: this.props.filter_related_type
        }

        postData('common/ListViewControls/pin_unpin_filter', req).then((result) => {
            if (result.status) {
                toastMessageShow(this.props.filter_title + ' was pinned', 's');
                this.props.get_default_pinned_data(this.props.filter_related_type);
                this.props.get_list_view_controls_by_id(this.props.filter_related_type, this.props.filter_list_id, 'update','pin_unpin');
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            }
        });
    }
    /**
     * set the default pinned data using related type
     * * @param {*} related_type
     */
    setDefaultPin = (e) => {
        var req = {
            related_type: this.props.filter_related_type
        }

        postData('common/ListViewControls/default_pin_filter', req).then((result) => {
            if (result.status) {
                toastMessageShow(this.props.filter_title + ' was pinned', 's');
                this.props.get_default_pinned_data(this.props.filter_related_type);
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            }
        });
    }

    renderPinData() {
        return (
            <React.Fragment>
                {!this.props.is_any_data_pinned && this.props.checkdefault == 'all' && !this.props.pinned_id ?
                    <Popover
                        align="right"
                        id="popover-walkthrough"
                        stepText="To unpin, pin another list view"
                        variant="walkthrough"
                        {...this.props}
                    >
                        <div>
                            <Button
                                title={`To unpin, pin another list view`}
                                iconCategory="utility"
                                iconName="pinned"
                                variant="icon"
                                iconSize="large"
                                iconVariant="border-filled"
                            />
                        </div>

                    </Popover> :
                    this.props.checkdefault == 'all' ?
                        <Button
                            title={`Pin this list view`}
                            iconCategory="utility"
                            iconName="pin"
                            variant="icon"
                            iconSize="large"
                            iconVariant="border-filled" onClick={e => {
                                e.preventDefault();
                                this.setDefaultPin(e);
                            }}
                        /> : ''
                }

                {this.props.pinned_id && this.props.is_any_data_pinned && this.props.checkdefault != 'all' ?
                    <Popover
                        align="right"
                        id="popover-walkthrough"
                        stepText="To unpin, pin another list view"
                        variant="walkthrough-action"
                        {...this.props}
                    >
                        <div>
                            <Button
                                title={`To unpin, pin another list view`}
                                iconCategory="utility"
                                iconName="pinned"
                                variant="icon"
                                iconSize="large"
                                iconVariant="border-filled"
                            />
                        </div>
                    </Popover>
                    : this.props.checkdefault != 'all' ?
                        <Button
                            title={`Pin this list view`}
                            assistiveText={{ icon: 'Pin this list view' }}
                            iconCategory="utility"
                            iconName="pin"
                            variant="icon"
                            iconSize="large"
                            iconVariant="border-filled"
                            onClick={e => {
                                e.preventDefault();
                                this.pinAndUnpinFilterList(e);
                            }}
                        /> : ''
                }
            </React.Fragment>
        )
    }

    render() {

        return (
            <React.Fragment>
                <ButtonGroup id="button-group-list-1" variant="list">
                    <Dropdown
                        assistiveText={{ icon: 'Name Switcher' }}
                        buttonClassName="slds-button_icon-small"
                        buttonVariant="icon"
                        iconCategory="utility"
                        iconName="down"
                        id="page-header-name-switcher-dropdown"
                        options={this.props.list_control_option}
                        onSelect={(e) => this.props.onListViewChange(e)}
                        value={this.props.checkdefault}
                    />
                    {this.renderPinData()}
                </ButtonGroup>

            </React.Fragment >
        );
    }
}

export default CommonHeaderListViewControls


