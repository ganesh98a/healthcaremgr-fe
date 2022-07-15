import React from 'react';

import { postData, toastMessageShow } from 'service/common.js';

export const addApplicants = (obj, selection = [], refreshList, val) => {
    var url = 'recruitment/GroupBooking/add_group_booking_applicants';
    // Allow only validation is passed
    if (!obj.state.loading) {
        obj.setState({ loading: true });
        let req = {};
        let selected_applicants = [];
        if (selection && selection.length) {
            selection.map(selected => {
                req = {
                    applicant_id: selected.applicant_id,
                    application_id: selected.application_id,
                    job_id: selected.jobId,
                    interview_id: obj.state.interview_id,
                    interview_applicant_id: "",
                    interview_type: obj.state.interview_type,
                };
                selected_applicants.push(req);
            })

        }
        let applicant_req = {
            selected_applicants: selected_applicants
        }
        postData('recruitment/RecruitmentInterview/check_applicant_interview_exists', applicant_req).then((result) => {
            if (result.status) {
                // Call Api
                postData(url, { selected_applicants, email_applicants: obj.state.email_applicants ? 1 : 0, selected_interview_type: obj.state.interview_type }).then((result) => {
                    if (result.status) {
                        // Trigger success pop
                        toastMessageShow(result.msg, 's');
                        refreshList(obj.state);
                        obj.setState({ openAddApplicants: false });
                        if (obj.refreshPropsList) {
                            obj.refreshPropsList();
                        }
                    } else {
                        // Trigger error pop
                        toastMessageShow(result.error, "e");
                    }
                    obj.setState({ loading: false });
                });

            } else { 
                refreshList(obj.state);              
                toastMessageShow(result.error, "e");
            }
        });

        
    }
}

export const getApplicantsColumns = () => {
    return [
        {
            _label: '',
            accessor: "icon",
            id: 'icon', 
            width: '30px' ,
            sortable: false         
        },
        {
            _label: 'Applicant Name',
            accessor: "FullName",
            id: 'FullName',
            Cell: (props, item) => {
                return (
                    <>
                        <a href="#">
                            {item.FullName}
                        </a>
                    </>
                )
            },
            sortable: true        

        },
        {
            _label: 'Email',
            accessor: "email",
            id: 'email'
        },
        {
            _label: 'Application Id',
            accessor: "id",
            id: 'id'
        },
        {
            _label: 'Job',
            accessor: "job_position",
            id: 'job_position'
        },
        {
            _label: 'Applicant Id',
            accessor: "applicant_id",
            id: 'applicant_id'
        },
        {
            _label: 'Application Status',
            accessor: "process_status_label",
            id: 'process_status_label'
        }
    ]
}

export function getNotesTypes(flip = false) {
    let options = [{label: "Profile", value: "1"}, {label: "Training", value: "2"}, {label: "Supervision", value: "3"}, {label: "OGA", value: "4"}];
    if (flip) {
        let flipped = {};
        options.map(opt => {
            flipped[opt.value] = opt.label
        })
        return flipped;
    }
    return options;
}