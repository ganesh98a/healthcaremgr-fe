import '../../../scss/components/admin/crm/pages/sales/RiskAssessment/RiskAssessmentDetails.scss';

import {
    Button,
    ButtonGroup,
    Card,
    Icon,
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Tabs,
    TabsPanel,
} from '@salesforce/design-system-react';
import classNames from 'classnames';
import { living_situation_option } from 'dropdown/SalesDropdown.js';
import jQuery from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { BASE_URL, ROUTER_PATH } from '../../../../../config.js';
import { AjaxConfirm, css, postData, toastMessageShow } from '../../../../../service/common';
import AttachmentCard from '../AttachmentCard.jsx';
import CreateOpportunityPopUp from '../opportunity/CreateOpportunityBox';
import CreateLivingSituation from './CreateLivingSituation';
import EditRiskAssessmentModel from './EditRiskAssessmentModel';
import RiskAssessmentStatusPath from './RiskAssessmentStatusPath';
import RiskBehaviourSupport from './RiskBehaviourSupport.jsx';
import RiskCourtActions from './RiskCourtActions.jsx';
import RiskMatrixDetails from './RiskMatrixDetails.jsx';
import AvatarIcon from '../../../oncallui-react-framework/view/AvatarIcon';
import OncallFormWidget from '../../../oncallui-react-framework/input/OncallFormWidget';
/**
 * RequestData get the detail of risk assessment
 * @param {int} riskAssessmentId
 */
const requestRAData = (riskAssessmentId) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { risk_assessment_id: riskAssessmentId };
        postData('sales/RiskAssessment/get_risk_assessment_detail_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
                };
                resolve(res);
            } else {
                const res = {
                    data: []
                };
                resolve(res);
            }
        });
    });
};

/**
 * 
 * @param {object} props
 * @param {string} [props.subject]
 * @param {string} [props.datetime]
 * @param {string} [props.variant]
 * @param {boolean} [props.expandable]
 * @param {string} [props.icon]
 * @param {any[]} [props.actions]
 * @param {string} [props.description]
 */
export const TimelineItem = ({
    subject,
    datetime = undefined,
    variant = 'event',
    expandable = true,
    icon = 'call',
    actions = [],
    description = undefined,

}) => {

    const timelineClassNames = classNames({
        'slds-timeline__item': true,
        'slds-timeline__item_expandable': expandable,
    })

    return (
        <li>
            <div className={classNames([timelineClassNames, `slds-timeline__item_${variant}`])}>
                <div className="slds-media">
                    <div className="slds-media__figure">
                        {/* "action","custom","doctype","standard","utility" */}
                        <Button
                            type="button"
                            title="Toggle details"
                            iconName="switch"
                            iconCategory="utility"
                            variant="icon"
                            aria-controls="call-item-base"
                            iconClassName={['slds-timeline__details-action-icon']}
                        />
                        <Icon
                            category="standard"
                            name={icon}
                            containerClassName={['slds-timeline__icon']}
                            size="small"
                            title={'Activity'}
                        />
                    </div>

                    <div className="slds-media__body">
                        <div className="slds-grid slds-grid_align-spread slds-timeline__trigger">
                            <div className="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                                <h3 className="slds-truncate sdls-timeline-subject" title={subject}>
                                    {subject}
                                </h3>
                            </div>
                            <div className="slds-timeline__actions slds-timeline__actions_inline">
                                {
                                    datetime && (
                                        <p className="slds-timeline__date">
                                            <time dateTime={datetime}
                                                title={moment(datetime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD hh:mm a')}>
                                                {moment(datetime, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')}
                                            </time>
                                        </p>
                                    )
                                }
                                {
                                    (actions || []).length > 0 && (
                                        <Button
                                            variant="icon"
                                            aria-haspopup="true"
                                            title="More Options"
                                            iconName="down"
                                            iconVariant="border-filled"
                                            iconSize="x-small"
                                        />
                                    )
                                }
                            </div>
                        </div>
                        {
                            description && (
                                <p className="slds-m-horizontal_xx-small">
                                    {description}
                                </p>
                            )
                        }
                    </div>
                </div>
            </div>
        </li>
    )
}

/**
 * Class: RiskAssessmentDetails
 */
class RiskAssessmentDetails extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }

    constructor(props) {
        super(props);
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            stageActiveIndex: 0,
            stage_index: 0,
            stage_status: 1,
            openEditModal: false,
            riskAssessmentId: "",
            redirectTo: false,
            refereence_id: "",
            status: "",
            created_by: "",
            created_date: "",
            openOppBox: false,
            living_situation: {},
            
                }

        this.rootRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);
        this.handleRelatedTab = this.renderRelatedTab.bind(this);
        this.handleDetailsTab = this.renderDetailsTab.bind(this);
    }
    printRA = e => {
        e.preventDefault()
        const id = _.get(this.props, 'props.match.params.id')
        this.setState({ loading: true })
        window.location.href = BASE_URL + "sales/RiskAssessment/printra?page_title="+this.state.topic+"&risk_assessment_id="+id;
         this.setState({ loading: false })
    }

    /**
     * When component is mounted, remove replace the parent element
     */
    componentDidMount() {
        const id = _.get(this.props, 'props.match.params.id');
        this.getRADetails(id);
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Call requestRAData
     * param {int} id
     */
    getRADetails = (id) => {
        requestRAData(
            id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    risk_assessment_id: raData.risk_assessment_id,
                    reference_id: raData.reference_id,
                    topic: raData.topic,
                    owner_id: raData.owner_id,
                    owner: raData.owner,
                    account_id: raData.account_id,
                    account_person: raData.account_person,
                    account_type: raData.account_type,
                    status: raData.status,
                    risk_status: raData.risk_status,
                    created_by: raData.created_by,
                    behaviour_support_matrices: raData.behaviour_support_matrices,
                    probability_options: raData.probability_options,
                    impact_options: raData.impact_options,
                    matrices: raData.matrices,
                    created_date: moment(raData.created_date).format("DD/MM/YYYY"),
                    living_situation: raData.living_situation,
                });
            }

        });
    }

    /**
     * Update the stage index
     * param {int} stage
     */
    handleClick = (stage) => {
        const state = this.state;
        state['stage_index'] = stage;
        this.setState(state);
    }

    /**
     * Renders link for related account. 
     * Account can link back to 'organisation' or 'contact'
     */
    renderRelatedAccountLink() {
        const ACCOUNT_TYPE_CONTACT = 1
        const ACCOUNT_TYPE_ORGANISATION = 2
        const accountType = _.get(this.state, 'account_type', ACCOUNT_TYPE_CONTACT)
        const accountId = _.get(this.state, 'account_person.value')
        let tooltip = undefined

        if (parseInt(accountType) === ACCOUNT_TYPE_ORGANISATION) {
            const org = _.get(this.state, 'account_person.label', null)
            if (!org) {
                return this.props.notAvailable
            }

            tooltip = `${org} (organisation)`

            return <Link to={ROUTER_PATH + `admin/crm/organisation/details/${accountId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{org}</Link>
        } else if (parseInt(accountType) === ACCOUNT_TYPE_CONTACT) {
            const person = _.get(this.state, 'account_person.label', null)
            if (!person) {
                return this.props.notAvailable
            }

            tooltip = `${person} (contact)`

            return <Link to={ROUTER_PATH + `admin/crm/contact/details/${accountId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{person}</Link>
        }

        return this.props.notAvailable
    }

    /**
     * Renders the link related to owner.
     * The link generated will link back to **Members** module
     */
    renderRelatedOwnerLink() {
        const memberId = _.get(this.state, 'owner.value', null)
        const owner = _.get(this.state, 'owner.label', null)
        if (!owner) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/support_worker/about/${memberId}/details`
        const tooltip = `${owner} \nClicking will take you to Members module`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{owner}</Link>
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        const header = {
            label: "Risk Assessment",
            title: this.state.topic || '',
            icon: {
                category: "standard",
                name: "service_contract",
                label: "User",
            },
            details: [
                {
                    label: 'Account',
                    content: this.renderRelatedAccountLink(),
                },
                {
                    label: 'Assigned To',
                    content: this.renderRelatedOwnerLink(),
                }
            ],
        }

        return (
            <PageHeader
                variant={"record-home"}
                title={header.title}
                icon={this.renderIcon(header.icon)}
                onRenderActions={this.renderActions}
                details={header.details}
                label={header.label}
            />
        )
    }

    /**
     * Render icon
     */
    renderIcon = ({ label, category, name }) => {
        return (
            <AvatarIcon assistiveText={label} avatar={this.state.account_person && this.state.account_person.avatar || ""} category={category} name={name} />
        );
    }

    /**
     * Render action for `<PageHeader />`
     */
    renderActions = () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" title={`Update Risk Assessment`} onClick={this.editRiskAssessment} />
                    <Button label="Delete" title={`Remove Risk Assessment`} onClick={this.deleteRiskAssessment} />
                    <Button label="Print" disabled={this.state.loading} onClick={this.printRA}/>
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     * Render Left side tab
     */
    renderTab = () => {
        const tab = [
            {
                label: "Related",
                content: this.handleRelatedTab,
            },
            {
                label: "Details",
                content: this.handleDetailsTab,
            }
        ]
        return (
            <Tabs>
                {
                    tab.map((tabbar, index) => {
                        return (
                            <TabsPanel label={tabbar.label} key={index}>
                                {tabbar.content()}
                            </TabsPanel>
                        )
                    })
                }
            </Tabs>
        );
    }


    /**
     * Render related tab
     *
     */
    renderRelatedTab() {
        const id = _.get(this.props, 'props.match.params.id');
        var living_situation = this.state.living_situation;
        var _living_situation_option = living_situation_option();
        console.log(living_situation, "living_situation")

        return (
            <div className="slds-grid slds-grid_vertical">
                <div className="slds-col">
                    <div className="slds-grid slds-grid_vertical">
                        <Card
                            headerActions={<Button label="New" onClick={this.showOppCreateModal} />}
                            heading="Opportunity (0)"
                            className="slds-card-bor"
                            icon={<Icon category="standard" name="opportunity" size="small" />}
                        >
                        </Card>
                    </div>
                </div>
                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                        <AttachmentCard 
                            object_type={AttachmentCard.OBJECT_TYPE_RISK_ASSESSMENT}
                            object_id={id}
                            attachments={this.state.attachments}
                            onSuccessUploadNewFiles={() => this.getRADetails(id)}
                        />
                    </div>
                </div>
                

                    <div className="slds-col slds-m-top_medium">
                        <div className="slds-grid slds-grid_vertical">
                            {/* <Card
                                headerActions={<Button label={living_situation ? "Updated" : "New"} onClick={this.showLivingModal} />}
                                heading="Living Situation"
                                className="slds-card-bor"
                                icon={<Icon category="standard" name="opportunity" size="small" />}
                            >
                                {living_situation ?
                                    <div class="slds-form" style={{ marginLeft: "41px" }}>
                                        <div class="slds-grid ">
                                            <div class="slds-col">
                                                <fieldset class="slds-form-element" >
                                                    <legend class="slds-form-element__legend slds-form-element__label">
                                                        Living Situation</legend>
                                                    {_living_situation_option.map((val, index) => {
                                                        if (val.value == living_situation.living_situation) {
                                                            return <>
                                                                <span class="slds-radio" key={index + 1}>
                                                                    <label class="slds-radio__label" for={"alone" + index}>
                                                                        <span class="slds-form-element__label">{val.label}</span>
                                                                    </label>
                                                                </span>

                                                                {val.sda_agencey_name ?
                                                                    <div>
                                                                        <label class="slds-form-element__legend slds-form-element__label" for="Agency">Agency</label>
                                                                        <div class="slds-form-element__control " style={{ fontSize: "0.8125rem" }}>
                                                                            {living_situation.living_situation_agency}
                                                                        </div>
                                                                    </div> : ""}
                                                            </>
                                                        }
                                                    })}
                                                </fieldset>
                                            </div>

                                            <div class="slds-col">
                                                <fieldset class="slds-form-element">
                                                    <legend class="slds-form-element__legend slds-form-element__label">
                                                        Informal Support
                                                 </legend>

                                                    <span class="slds-radio">
                                                        <label class="slds-radio__label" >
                                                            <span class="slds-form-element__label">{living_situation.informal_support == 1 ? "No" : "Yes"}</span>
                                                        </label>
                                                    </span>

                                                    {living_situation.informal_support == 2 ?
                                                        <div>
                                                            <label class="slds-form-element__legend slds-form-element__label" for="Agency">Description</label>
                                                            <div class="slds-form-element__control" style={{ fontSize: "0.8125rem" }}>
                                                                {living_situation.informal_support_describe}
                                                            </div>
                                                        </div> : ""}
                                                </fieldset>
                                            </div>


                                            <div class="slds-col">
                                                <fieldset class="slds-form-element">
                                                    <legend class="slds-form-element__legend slds-form-element__label">
                                                        Risk due to lack of informal support</legend>

                                                    <span class="slds-radio">
                                                        <label class="slds-radio__label">
                                                            <span class="slds-form-element__label">{living_situation.lack_of_informal_support == 1 ? "No" : "Yes"}</span>
                                                        </label>
                                                    </span>

                                                    {living_situation.lack_of_informal_support == 2 ?
                                                        <div>
                                                            <label class="slds-form-element__legend slds-form-element__label" for="Agency">Description</label>
                                                            <div class="slds-form-element__control" style={{ fontSize: "0.8125rem" }}>
                                                                {living_situation.lack_of_informal_support_describe}
                                                            </div>
                                                        </div> : ""}


                                                </fieldset>
                                            </div>

                                        </div>
                                    </div> : ""}
                            </Card> */}
                        </div>
                    </div>
                </div>
        )
    }


    /**
     * Renders the details tab
     */
    renderDetailsTab() {
        const notAvailable = 'N/A';
        const id = _.get(this.props, 'props.match.params.id');

        const styles = css({
            headingText: {
                fontSize: 15,
                fontWeight: 'normal',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
            },
            hr: {
                marginTop: 15,
                marginBottom: 15,
                border: 0,
                borderTop: '1px solid #eee',
                width: 'auto'
            },
            row: {
                marginLeft: -15,
                marginRight: -15,
            },
            col: {
                paddingLeft: 15,
                paddingRight: 15,
                marginBottom: 15,
            },
            tableParent: {
                marginTop: 10,
            }
        })
        
        var formProps = [
            {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.reference_id, label: "ID", name:"reference_id" },
                   { value: this.state.status, label: "Status", name:"Status" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.state.created_by, label: "Created By", name:"created_by" },
                   { value: this.state.created_date, label: "Created Date", name:"created_date" }, 
                ],
            }
        ];

        return (
            <div className="slds-detailed-tab container-fluid">
                <OncallFormWidget formElement={formProps} />
                <CreateLivingSituation
                            openOppBox={this.state.openLvingSitBox}
                            closeModal={this.closeLivingModal}
                            risk_assessment_id={id}
                            pageTitle={'New Opportunity'}
                            data={this.state}
                />
                 <div className="row" style={styles.row}>
                    <div className="col col-12" style={styles.col}>
                        <div style={styles.tableParent}>
                            <RiskBehaviourSupport
                                key={Date.now()}
                                risk_assessment_id={this.state.risk_assessment_id}
                                behvsupportmatrices={this.state.behaviour_support_matrices}
                                onUpdate={() => this.getRADetails(id)}
                            />
                        </div>
                    </div>
                </div>
               <RiskCourtActions
                    risk_assessment_id={_.get(this.props, 'props.match.params.id')}
                />
                <div className="row" style={styles.row}>
                    <div className="col col-12" style={styles.col}>
                        <div style={styles.tableParent}>
                            <RiskMatrixDetails
                                key={Date.now()}
                                risk_assessment_id={this.state.risk_assessment_id}
                                probability_options={this.state.probability_options}
                                impact_options={this.state.impact_options}
                                matrices={this.state.matrices}
                                onUpdate={() => this.getRADetails(id)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Render Activity
     */
    renderActivity = () =>  {
        return (
            <React.Fragment>
                { this.renderSidebar() }
            </React.Fragment>
        );
    };

    /**
     * Render the sidebar
     */
    renderSidebar() {
        return (
            <div className="SLDSRightSidebar">
                <div className="sidebar-block">
                    <h3>Activity</h3>
                    <br/>
                    <Tabs variant="scoped" id="tabs-example-scoped">
                        <TabsPanel label="Task">
                        <div className="slds-col row slds-gutters">
                            <div className="slds-col col-lg-8 col-md-8">
                                <div className="slds-form-element">
                                    <div className="slds-form-element__control">
                                    <input type="text" id="text-input-id-1" placeholder="Placeholder Text" required="" className="slds-input slds-input-height" />
                                    </div>
                                </div>
                            </div>
                            <div className="slds-col col-lg-4 col-md-4">
                                <button className="slds-button slds-button_brand">New</button>
                            </div>
                        </div>
                        </TabsPanel>
                    </Tabs>
                </div>
            </div>
        );
    }

    /*
     * Assign the risk assessment id and open edit modal true
     * get risk_assessment_id
     */
    editRiskAssessment = () => {
        const riskAssessmentId = _.get(this.props, 'props.match.params.id');
        this.setState({
            openEditModal: true,
            editRiskAssessmentId: riskAssessmentId
        });
    }

    /**
     * Close the edit modal when user save the risk assessment
     */
    closeEditModal = (status) => {
        this.setState({ openEditModal: false });
        if (status) {
            this.getRADetails(this.state.editRiskAssessmentId);
        }
    }

    /**
     * Open delete modal
     */
    deleteRiskAssessment = () => {
        const id = _.get(this.props, 'props.match.params.id')
        if (!id) {
            console.error(`ID is required to delete riskk assessment`);
        }

        const msg = 'Are you sure you want to delete this risk assessment ?';
        const confirmButton = 'Confirm';

        AjaxConfirm({ risk_assessment_id: id }, msg, 'sales/RiskAssessment/delete_risk_assessment', { confirm: confirmButton, heading_title: 'Delete Risk Assessment' }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s")
                this.setState({ redirectTo: ROUTER_PATH + `admin/crm/riskassessment/listing` })
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Open opportunity create modal
     */
    showOppCreateModal = () => {
        this.setState({ openOppBox: true })
    }

    /**
     * Close opportunity create modal
     */
    closeOppCreateModal = () => {
        this.setState({ openOppBox: false });
    }

    /**
     * Open living create/update modal
     */
    showLivingModal = () => {
        this.setState({ openLvingSitBox: true })
    }

    /**
     * Close opportunity create modal
     */
    closeLivingModal = (status) => {
        const id = _.get(this.props, 'props.match.params.id')
        if (status) {
            this.getRADetails(id);
        }
        this.setState({ openLvingSitBox: false });
    }

    /**
     * Render modals
     * - Edit Risk Assessment
     * - Create Opportunity
     */
    renderModals() {
        const id = _.get(this.props, 'props.match.params.id')

        return (
            <React.Fragment>
                {
                    this.state.openEditModal && (
                        <EditRiskAssessmentModel
                            showModal={this.state.openEditModal}
                            riskAssessmentId={this.state.editRiskAssessmentId}
                            closeModal={this.closeEditModal}
                            headingTxt="Edit Risk Assessment"
                        />
                    )
                }
                {
                    this.state.openOppBox && (
                        <CreateOpportunityPopUp
                            openOppBox={this.state.openOppBox}
                            closeModal={this.closeOppCreateModal}
                            oppId={''}
                            pageTitle={'New Opportunity'}
                            data={this.state}
                        />
                    )
                }

                {
                    this.state.openLvingSitBox && (
                        <CreateLivingSituation
                            openOppBox={this.state.openLvingSitBox}
                            closeModal={this.closeLivingModal}
                            risk_assessment_id={id}
                            pageTitle={'New Opportunity'}
                            data={this.state}
                        />
                    )
                }
            </React.Fragment>
        )
    }


    render() {
        // This will only run when you delete risk assessment
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <div className="RiskAssessmentDetails slds" ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            {this.renderPageHeader()}
                        </div>
                        <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                            <RiskAssessmentStatusPath
                                {...this.state}
                                getRADetails={this.getRADetails}
                            />
                        </div>
                        <div className="slds-col">
                            <div className="slds-gutters row">
                                <div className="slds-col col-lg-12 col-md-12 slds-m-top_medium">
                                    {this.renderTab()}
                                </div>
                                {/* <div className="slds-col col-lg-4 col-md-4 slds-m-top_medium">
                                    <div className=" slds-box slds-box-bg">
                                        { this.renderActivity() }
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    {this.renderModals()}
                </IconSettings>
            </div>
        )
    };
};

export default RiskAssessmentDetails;
