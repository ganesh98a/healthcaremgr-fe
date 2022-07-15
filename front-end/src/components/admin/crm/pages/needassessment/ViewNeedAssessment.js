import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';

import Button from '@salesforce/design-system-react/lib/components/button';
import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';
import jQuery from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import ReactTable from 'react-table';
import { AjaxConfirm, css, postData, toastMessageShow } from 'service/common.js';

import { BASE_URL, ROUTER_PATH } from '../../../../../config';
import AttachmentCard from '../AttachmentCard';
import CreateNeedAssessmentBox from './CreateNeedAssessmentBox';
import NeedAssessmentDetail from './NeedAssessmentDetail';
import NeedAssessmentPath from './NeedAssessmentPath';
import AvatarIcon from '../../../oncallui-react-framework/view/AvatarIcon';

//import OpportunityContacts from './opportunity/OpportunityContacts';

class ViewNeedAssessment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            editModal: false,
            redirectTo: null,

            activeTab: 'summary',
            account_person: {},
            owner: {},
            contacts: [],
            assessment_assistance:[],
            need_assessment_status_options:[],
            participant_id: "#"
        }

        this.rootRef = React.createRef()

    }

    get_assessment_details = (id) => {
        this.setState({ loading: true })
        postData('sales/NeedAssessment/get_need_assessment_detail', { need_assessment_id: id }).then((result) => {
            if (result.status) {
                this.setState(result.data, () => { });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        })
        .finally(() => this.setState({ loading: false }))
    }

    /**
     * When component is mounted, remove replace the parent element's 
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentDidMount() { 
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')

        var needAssessmentId = this.props.match.params.id;
        this.get_assessment_details(needAssessmentId);
    }

    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.editModal && (
                        // Note: Misleading component name
                        <CreateNeedAssessmentBox 
                            openOppBox={this.state.editModal} 
                            closeModal={() => this.setState({ editModal: false })} 
                            oppId={0} 
                            pageTitle={`Edit need assesment`} 
                            data={{
                                ...this.state,
                                title: this.state.page_title,
                            }} 
                            onUpdate={(id) => this.get_assessment_details(id)}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    renderSummaryTab() {
        const styles = css({
            root: {
                border: 'none',
                paddingTop: 0,
            },
            heading: {
                marginBottom: 15,
                marginTop: 8,
            },
            headingText: {
                fontSize: 15,
                fontWeight: 'normal',
            },
            col: {
                marginBottom: 15,
            }
        })

        const notAvailable = 'N/A'

        const details = [
            {
                label: 'Title',
                value: this.state.page_title
            },
            {
                label: 'Account',
                value: (() => {
                    const label = _.get(this.state, 'account_person.label')
                    if (!label) {
                        return null
                    }
                    
                    let account_type_label = null
                    let account_type = _.get(this.state, 'account_person.account_type')
                    if (account_type == 1) {
                        account_type_label = '(contact)'
                    } else if (account_type == 2) {
                        account_type_label = '(organisation)'
                    }

                    const tooltip = [label, account_type_label].filter(Boolean).join(' ')
                    return <abbr title={tooltip}>{label}</abbr>
                })()
            },
            {
                label: 'Assigned To',
                value: _.get(this.state, 'owner.label')
            },

        ]

        return (
            <div className="row slds-box" style={styles.root}>
                <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Need assessment summary</h3>
                </div>
                {
                    details.map((detail, i) => {
                        return (
                            <div key={i} className="col col-sm-6" style={styles.col}>
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">{detail.label}</label>
                                    <div className="slds-form-element__control">
                                        {detail.value || notAvailable}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )

    }



    handleArchiveNeedAssessment = e => {
        e.preventDefault()

        const id = _.get(this.props, 'match.params.id')

        const msg = `Are you sure you want to archive this need assessment?`
        const confirmButton = `Archive need assessment`

        AjaxConfirm({ need_assessment_id: id }, msg, 'sales/NeedAssessment/archive_need_assessment', { confirm: confirmButton, heading_title: 'Archive need assessment' })
        .then((result) => {
            if (result.status) { 
                toastMessageShow(result.msg, "s");
                this.setState({ redirectTo: ROUTER_PATH + 'admin/crm/needassessment/listing' })
            } else {
                if (result.error) {
                    toastMessageShow(result.error, 'e');
                }
            }
        })

    }
    printNA = e => {
        e.preventDefault()
        const id = _.get(this.props, 'match.params.id')
        this.setState({ loading: true })
        window.location.href = BASE_URL + "sales/NeedAssessment/printna?page_title="+this.state.page_title+"&need_assessment_id="+id;
         this.setState({ loading: false })
    }



    actions = () => {
        let wordprintUrl = 'sales/NeedAssessment/worddown';
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <ButtonGroup variant="list">
                        <Button label="Edit" disabled={this.state.loading} onClick={() => this.setState({ editModal: true })}/>
                        <Button label="Delete" disabled={this.state.loading} onClick={this.handleArchiveNeedAssessment}/>
                        <Button label="Print" disabled={this.state.loading} onClick={this.printNA}/>
                    </ButtonGroup>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    renderRelatedTab() {
        const id = _.get(this.props, 'match.params.id')

        return (
            <React.Fragment>
                <div class="slds-col slds-box" style={{ border: 'none', paddingTop: 0, paddingBottom: 0 }}>
                    <div className="slds-grid slds-grid_vertical">
                        <AttachmentCard 
                            object_type={AttachmentCard.OBJECT_TYPE_NEED_ASSESSMENT}
                            object_id={id}
                            attachments={this.state.attachments}
                            onSuccessUploadNewFiles={() => this.get_assessment_details(id)}
                        />
                    </div>
                </div>
            </React.Fragment>
        )
    }


    render() {
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }

        const details = [
            {
                label: 'Account',
                content: <div className="slds-truncate" title="Account">
                    <a className="SLDS_a_color" href={this.state.participant_id && `${ROUTER_PATH}admin/item/participant/details/${this.state.participant_id}` || '#'}>{this.state.account_person.label}</a>
                </div>,
                truncate: true,
            },
            {
                label: 'Assigned To',
                content: <div className="slds-truncate" title="Owner">
                    <a className="SLDS_a_color" href="#">{this.state.owner.label}</a>
                </div>
            }
        ];

        return (
            <React.Fragment>
                <div className="slds slds-grid slds-grid_vertical" style={{ marginRight: -15 }} ref={this.rootRef}>
                    <div className="slds-col custom_page_header">

                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    this.state.account_person && <AvatarIcon assistiveText="User" avatar={this.state.account_person && this.state.account_person.avatar} category="standard" name="opportunity" /> ||
                                    <Icon
                                        assistiveText={{ label: 'User' }}
                                        category="standard"
                                        name="opportunity"
                                    />
                                }
                                //label="Opportunity"
                                onRenderActions={this.actions}
                                label={`Need assessment`}
                                title={this.state.page_title}
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>
                    <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                    <NeedAssessmentPath 
                        {...this.state}
                        get_assessment_details={this.get_assessment_details}
                    />
                    </div>
                    <div className="slds-col slds-m-top_medium ">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <Tabs id="tabs-example-default">
                                <TabsPanel label="Summary">
                                    { this.renderSummaryTab() }
                                </TabsPanel>
                                <TabsPanel label="Details">
                                    <NeedAssessmentDetail need_assessment_id={this.props.match.params.id} />
                                </TabsPanel>
                                <TabsPanel label="Related">
                                    { this.renderRelatedTab() }
                                </TabsPanel>
                            </Tabs>

                        </IconSettings>
                    </div>
                </div>
                { this.renderModals() }
            </React.Fragment >
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ViewNeedAssessment);