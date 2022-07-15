import React from 'react';
import { AjaxConfirm, toastMessageShow, get_take_access_lock } from 'service/common';

/**
 * Common archive modal
 * @param props 
 */
const ArchiveModal = (props) => {

    /**
     * main function that handles the archive request
     * for certain data objects, checks if the lock presents or not
     */
    function archiveData() {
        if(props.msg != undefined && (props.msg == 'Shift Skill' || props.msg == 'Shift')) {
            get_take_access_lock('shift', props.parent_id, true).then(ret => {
                if(ret.status == false) {
                    toastMessageShow(ret.error, "e");
                    return false;
                }
                else {
                    return getConfirmation();
                }
            })
        }
        else {
            return getConfirmation();
        }
        return null;
    }

    /**
     * displaying the ajax confirmation
     */
    function getConfirmation() {
        const content = props.content
        const confirmButton = props.confirm_button;
        const isBulkArchive=!props.bulk_archive?false:true;
        const header_title=props.header_title?props.header_title:props.confirm_button
        const cancel=props.cancel?props.cancel:'Cancel'
        let bulk_archive_id=[];
        if(isBulkArchive)
        {
            bulk_archive_id=props.bulk_archive_id;
        }
        AjaxConfirm({ id: props.id,isBulkArchive,bulk_archive_id }, content, props.api_url, { confirm: confirmButton, heading_title:header_title,cancel}).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                props.on_success();
                return true;
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
                props.close_archive_modal()
                return false;
            }
        })
        return null;
    }
    return archiveData();
}

export default ArchiveModal;


