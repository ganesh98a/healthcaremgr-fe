import React, { Component } from 'react';
import {css } from 'service/common.js';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';

/**
 * SMS Activity
 */
class SMSActivityLogDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    /**
     * Render To contact list
     * @param {array} to_list 
     */
    renderTo = (to_list) => {
        let toSpan = [] ;
        if(to_list){
            let to_list_len = to_list.length;
            to_list.map((to, index) => {
                let to_name = to.recipient;
                let to_id = to.recipient_id;
                let applicant_id = to.recipient_applicant_id || 0;
                let to_url = "/admin/crm/contact/details/" + to_id;
                if (to.recipient_entity_type == 1) {
                    to_url = "/admin/crm/contact/details/" + to_id;
                } else if (to.recipient_entity_type == 4) {
                    to_url = "/admin/crm/leads/" + to_id;
                } else if (to.recipient_entity_type == 8) {
                    to_url = "/admin/recruitment/application_details/" + applicant_id + '/' + to_id;
                }
                let spearate = '';
                if ((to_list_len - 1) !== index) {
                    spearate = ', ';
                }
                toSpan.push(
                    <span className="slds-text-body_medium slds-truncate" style={{float: "left"}} title={to_name}>
                        <Link to={to_url}>{to_name}</Link>{spearate}
                    </span>
                )
            });
        }
        
        return <div>{toSpan}</div>;
    }

    render() {
        let related_to_url = '';
        switch(Number(this.props.related_type)) {
            case 1:
                related_to_url = "/admin/crm/opportunity/" + this.props.related_to;
                break;
            case 2:
                related_to_url = "/admin/crm/leads/" + this.props.related_to;
                break;
            case 3:
                related_to_url = "/admin/crm/serviceagreements/" + this.props.related_to;
                break;
            case 4:
                related_to_url = "/admin/crm/needassessment/" + this.props.related_to;
                break;
            case 5:
                related_to_url = "/admin/crm/riskassessment/details/" + this.props.related_to;
                break;
            case 6:
                related_to_url = "/admin/schedule/details/" + this.props.related_to;
                break;
            case 7:
                related_to_url = "/admin/finance/timesheet/details/" + this.props.related_to;
                break;
            case 8:
                related_to_url = "/admin/recruitment/application_details/" +this.props.applicant_id  +"/"+ this.props.related_to;
                break;
            case 9:
                related_to_url = "/admin/recruitment/interview_details/" +this.props.related_to;
                break;
            case 10:
                related_to_url = "/admin/finance/invoice/details/" + this.props.related_to;
                break;
            default:
                break;
        }
        
        const styles = css({
            scroll: {
                overflow: 'hidden',
                overflowX: 'auto',
            }
        });

        let comments = this.props.comment;
        let comment_lines = [];
        if (comments && comments.includes("\n")) {
            comment_lines = comments.split("\n");
        } else {
            comment_lines.push(comments);
        }

        return (
            <React.Fragment>
                <article className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium" id="task-item-expanded" aria-hidden="false" style={styles.scroll}>
                    <ul className="slds-list_horizontal slds-wrap">
                        <li className="slds-grid slds-grid_vertical slds-size_2-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">To</span>
                            {this.renderTo(this.props.to_user)}
                        </li>
                    </ul>
                    <div>
                        <span class="slds-text-title">Content</span>
                        <p class="slds-p-top_x-small slds-timeline__item_details">{comment_lines.map(cmt => cmt && <p>{cmt}</p> || <br />)}</p>
                    </div>
                    <ul className="slds-list_horizontal slds-wrap mt-4">
                        <li className="slds-grid slds-grid_vertical slds-size_2-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Related To</span>
                            <span className="slds-text-body_medium slds-truncate" title={this.props.related_to_label}>
                                <Link to={related_to_url}>{this.props.related_to_label}</Link>
                            </span>
                        </li>
                    </ul>
                </article>
            </React.Fragment>
        );        
    }
}

// Get the page title and type from reducer
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(SMSActivityLogDetail);