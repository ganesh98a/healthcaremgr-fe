import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {css } from 'service/common.js';
import { connect } from 'react-redux'
import ReactHtmlParser from 'react-html-parser';
import { Link } from 'react-router-dom';
import {COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME} from 'config.js';

/**
 * Email Activity
 */
class EmailActivityLogDetail extends Component {
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
            to_list.map((to, index) => {
                let to_name = to.recipient;
                let to_id = to.recipient_id;
                let to_url = "/admin/crm/contact/details/" + to_id;
                if (to.recipient_entity_type == 1) {
                    to_url = "/admin/crm/contact/details/" + to_id;
                } else if (to.recipient_entity_type == 4) {
                    to_url = "/admin/crm/leads/" + to_id;
                }
                toSpan.push(
                    <span className="slds-text-body_medium slds-truncate" title={to_name}>
                        <Link to={to_url}>{to_name}</Link>
                    </span>
                )
            });
        }
        
        return toSpan;
    }

    /**
     * Render Cc contact list
     * @param {array} cc_list
     */
    renderCc = (cc_list) => {
        let ccSpan = [] ;
        cc_list.map((cc, index) => {
            let cc_name = cc.recipient;
            let cc_id = cc.recipient_id;
            let cc_url = "/admin/crm/contact/details/" + cc_id;
            if (cc.recipient_entity_type == 1) {
                cc_url = "/admin/crm/contact/details/" + cc_id;
            } else if (cc.recipient_entity_type == 4) {
                cc_url = "/admin/crm/leads/" + cc_id;
            }
            ccSpan.push(
                <span className="slds-text-body_medium slds-truncate" title={cc_url}>
                    <Link to={cc_url}>{cc_name}</Link>
                </span>
            )
        });
        return ccSpan;
    }

    /**
     * Render attachment list
     * @param {array} attach_list 
     */
    renderAttachment = (attach_list) => {
        let attachSpan = [] ;
        attach_list.map((attachment, index) => {
            let attach_name = attachment.filename;
            let activity_id = attachment.activity_id;
            let attach_url = attachment.file_show_url;
            attachSpan.push(                
                <span className="slds-text-body_medium slds-truncate" title={attach_url}>
                   <a className="" title="View/download attachment" target="_blank" href={COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod10 + '/?url=' + attach_url}>{attach_name}</a>
                </span>
            )
        });
        return attachSpan;
    }

    render() {
        let related_to_url = '';
        if (this.props.related_type == 1) {
            related_to_url = "/admin/crm/opportunity/" + this.props.related_to;
        } else if (this.props.related_type == 10) {
            related_to_url = "/admin/finance/invoice/details/" + this.props.related_to;
        } else if (this.props.related_type == 2) {
            related_to_url = "/admin/crm/leads/" + this.props.related_to;
        } else if (this.props.related_type == 3) {
            related_to_url = "/admin/crm/serviceagreements/" + this.props.related_to;
        } else if (this.props.related_type == 4) {
            related_to_url = "/admin/crm/needassessment/" + this.props.related_to;
        } else if (this.props.related_type == 5) {
            related_to_url = "/admin/crm/riskassessment/details/" + this.props.related_to;
        } else if (this.props.related_type == 6) {
            related_to_url = "/admin/schedule/details/" + this.props.related_to;
        } else if (this.props.related_type == 7) {
            related_to_url = "/admin/finance/timesheet/details/" + this.props.related_to;
        }else if (this.props.related_type == 8) {
            related_to_url = "/admin/recruitment/application_details/" +this.props.applicant_id  +"/"+ this.props.related_to;
       }else if (this.props.related_type == 9) {
        related_to_url = "/admin/recruitment/interview_details/" +this.props.related_to;
       }
        const styles = css({
            scroll: {
                overflow: 'hidden',
                overflowX: 'auto',
            }
        });
        return (
            <React.Fragment>
                <article className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium" id="task-item-expanded" aria-hidden="false" style={styles.scroll}>
                    <ul className="slds-list_horizontal slds-wrap">
                        <li className="slds-grid slds-grid_vertical slds-size_2-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">To</span>
                            {this.renderTo(this.props.to_user)}
                        </li>
                        {
                            this.props.cc_user && this.props.cc_user.length > 0 ?
                                <li className="slds-grid slds-grid_vertical slds-size_2-of-2 slds-p-bottom_small">
                                    <span className="slds-text-title slds-p-bottom_x-small">Cc</span>
                                    {this.renderCc(this.props.cc_user)}
                                </li>
                            :
                                ''
                        }
                        {
                            this.props.bcc_user && this.props.bcc_user.length > 0?
                                <li className="slds-grid slds-grid_vertical slds-size_2-of-2 slds-p-bottom_small">
                                    <span className="slds-text-title slds-p-bottom_x-small">Bcc</span>
                                    {this.renderTo(this.props.bcc_user)}
                                </li>
                            :
                                ''
                        }
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Subject</span>
                            <span className="slds-text-body_medium slds-truncate" >{this.props.subject || "N/A"}</span>
                        </li>
                    </ul>
                    <div>
                        <span class="slds-text-title">Content</span>
                        <p class="slds-p-top_x-small">{ReactHtmlParser(this.props.comment)}</p>
                    </div>
                    <ul className="slds-list_horizontal slds-wrap mt-4">
                        {
                            this.props.attachment && this.props.attachment.length > 0?
                                <li className="slds-grid slds-grid_vertical slds-size_2-of-2 slds-p-bottom_small">
                                    <span className="slds-text-title slds-p-bottom_x-small">Attachment</span>
                                    {this.renderAttachment(this.props.attachment)}
                                </li>
                            : ''
                        }
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

export default connect(mapStateToProps, mapDispatchtoProps)(EmailActivityLogDetail);