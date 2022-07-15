import React, { Component } from 'react';
import { toastMessageShow, AjaxConfirm } from 'service/common.js';
import { Button, Dropdown, DropdownTrigger } from '@salesforce/design-system-react';
import CreateListViewModal from "./CreateListViewModal";
import { ROUTER_PATH } from 'config.js';




class ListViewControls extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openCreateModal: false,
            to_update: false,
            share_settings: false,   
        }
    }

    componentDidMount() {
        
    }

    /**
     * determine the column based on selected list.  
     * If its all means we should not allow to edit and delete.
     */
    determineListingControlColumns() {
        // if (this.props.checkdefault == 'all') {
             let isRenameDisabled = this.checkIsRenameDisabled();
             let isDeleteDisabled = this.checkIsDeleteDisabled()
            return [
                { label: 'LIST VIEW CONTROLS', type: 'header' },
                { label: 'New', value: 'new' , disabled: 'false'},
                { label: 'Rename', value: 'rename', disabled: isRenameDisabled },
                { label: 'Delete', value: 'delete', disabled: isDeleteDisabled },
                { label: 'Sharing Settings', value: 'settings', disabled : this.props.is_own_list && this.props.checkdefault != 'all' ? 'false' : 'true'},
            ]
        // } 
        
        
    }


    checkIsRenameDisabled(){
        return this.props.is_own_list&&this.props.user_view_by==1&&this.props.renameFilterEnabled?'false':'true';
    }
    
    checkIsDeleteDisabled(){
        return this.props.is_own_list&&this.props.user_view_by==1&&this.props.deleteFilterEnabled?'false':'true';
    }
    /* set the state value to create/edit list */
    openModal = (e) => {
        if(e.disabled=='false'){
            if (e.value == 'new') {
                this.setState({ openCreateModal: true, to_update: false, share_settings: false });
            } else if (e.value == 'rename') {
                this.setState({ openCreateModal: true, to_update: true, share_settings: false });
            }else if (e.value == 'settings') {
                this.setState({ openCreateModal: true, share_settings: true, to_update: false, });
            }
            else {
                this.handleOnArchiveLead()
            }
        }
       
    }

    closeModal = (status) => {
        this.setState({ openCreateModal: false });
    }

    /**
    * To delete the list view
    * @param {*} id
    *
    */
    handleOnArchiveLead = () => {
        const id = this.props.selected_filter_data.value

        const msg = `If you delete this list view it will be permanently removed. Are you sure you want to delete?`
        const confirmButton = `Delete`

        AjaxConfirm({ id }, msg, `common/ListViewControls/archive_filter_list`, { confirm: confirmButton, heading_title: `Delete` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.props.get_default_pinned_data(this.props.filter_related_type);
                /* this.setState({ redirectTo: ROUTER_PATH + `admin/crm/contact/listing` });
                this.props.get_list_view_related_type(this.props.filter_related_type);
                this.props.get_list_view_controls_by_id(this.props.filter_related_type, this.props.selected_filter_data.value, 'delete','get'); */
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })

    }

    render() {
        const listColumns = this.determineListingControlColumns();

        return (
            <React.Fragment>
                <Dropdown
                    align="right"
                    multiple
                    assistiveText={{ icon: 'More' }}
                    iconCategory="utility"
                    iconName="settings"
                    iconVariant="more"
                    options={listColumns}
                    onSelect={(e) => this.openModal(e)}
                >
                    <DropdownTrigger>
                        <Button
                            title={`List View Controls`}
                            assistiveText={{ icon: 'List View Controls' }}
                            iconCategory="utility"
                            iconName="settings"
                            iconVariant="more"
                            variant="icon"
                        />
                    </DropdownTrigger>
                </Dropdown>

                {
                    this.state.openCreateModal && (
                        <CreateListViewModal
                            showModal={this.state.openCreateModal}
                            closeModal={this.closeModal}
                            toUpdate={this.state.to_update}
                            shareSettings={this.state.share_settings}
                            {...this.props}
                        />
                    )
                }

            </React.Fragment >
        );
    }
}

export default ListViewControls


