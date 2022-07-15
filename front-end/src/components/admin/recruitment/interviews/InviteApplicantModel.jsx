import React, { Component } from 'react';
import {addApplicants, getApplicantsColumns} from '../RecruitmentCommon';
import SelectionMSTable from '../../oncallui-react-framework/view/SelectionMSTable';
import { getApplicantListByInterviewId } from '../actions/RecruitmentInterviewAction.js';
import {Checkbox} from '@salesforce/design-system-react'
import { toastMessageShow, } from 'service/common.js';
import 'react-block-ui/style.css';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../scss/components/admin/item/item.scss';
class InviteApplicantModel extends Component {

    /**
     * setting the initial prop values
     * @param {*} props
     */
     constructor(props) {
        super(props);
        this.state = {
            loading: false,
            openAddApplicants: this.props.openAddApplicants,
            applicantList: [],
            redirectPage: false,
            pageSize: 6,
            page: 0,
            validStatus: 1,
            applicant_count: 0,
            filtered: '',
            sorted: '',
            interview_id: this.props.interview_id,
            interview_type: this.props.interview_type,
            row_selections: [],
            selected_row: [],
        }
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
     fetchApplicantsData = (state) => {
        this.setState({ loading: true });
        getApplicantListByInterviewId(
            this.state.interview_id,
            this.state.pageSize,
            this.state.page,
            this.state.sorted,
            this.state.filtered
        ).then(res => {
            this.setState({
                applicantList: res.rows,
                applicant_count: res.count,
                pages: res.pages,
                loading: false,
                showApplicantArchiveModal: false,
                selected_row:[],
                row_selections: [],
                header_checkbox: false
            });
        });
    }    

    closeApplicantModal = (status)=>{
        if(status){
            this.setState({openAddApplicants : false});
            this.fetchApplicantsData();
            if(this.props.setModalApplicants){
                this.props.setModalApplicants(false);
            }
        }
    }

    /**
     * rendering components
     */
     render() {
        return (
            <React.Fragment>
                {
                    this.props.openAddApplicants && (
                        <SelectionMSTable
                            listing_api="recruitment/GroupBooking/get_applicants_for_group_booking"
                            submitSelection={
                                (selection) => 
                                addApplicants(this, selection, this.fetchApplicantsData)
                            }
                            openAddItems={true}
                            heading={'Group Booking - Invite Attendees'}
                            setModal={status => this.props.setModalApplicants(status)}
                            columns={getApplicantsColumns()}
                            sortColumn="FullName"
                            loading={this.state.loading}
                            modalFooter={
                                <div style={{ float: "left" }}>
                                    <Checkbox
                                        assistiveText={{
                                            label: 'Notify all the selected applicants via email',
                                        }}
                                        id="email_applicants"
                                        labels={{
                                            label: 'Notify all the selected applicants via email',
                                        }}
                                        checked={this.state.email_applicants ? true : false}
                                        name="email_applicants"
                                        onChange={(e) => {
                                            this.setState({ email_applicants: e.target.checked });
                                        }}
                                    />
                                </div>                                
                            }
                            cancel_button={'Later'}
                            ok_button={'Send Invite'}
                            ListSearchPageTitle={'by applicant name, applicant id or job'}
                            limit={this.props.max_applicant? this.props.max_applicant - this.state.applicantList.length : 99999}
                            events={{
                                "onMaximumSelection": (e, selection) => {
                                    e.preventDefault();
                                    toastMessageShow("Max applicants limit reached", "e");
                                }
                            }}
                            closeApplicantModal={this.closeApplicantModal}
                            refreshListView={this.props.refreshListView}
                            addApplicantFromList={true}
                            {...this.state}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        );
    }
}

export default InviteApplicantModel;