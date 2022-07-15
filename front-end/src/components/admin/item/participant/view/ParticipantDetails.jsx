import React from 'react';
import _ from 'lodash';
import jQuery from 'jquery';
import moment from 'moment';
import {
    IconSettings,
    PageHeaderControl,
    ButtonGroup,
    Button,
    Icon,
    PageHeader,
    Tabs,
    TabsPanel,
    Card} from '@salesforce/design-system-react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { ROUTER_PATH} from 'config.js';
import { postData } from '../../../../../service/common.js'
import '../../../scss/components/admin/item/Participant.scss';
import EditParticipantModel from '../EditParticipantModel';
import ParticipantGoals from '../ParticipantGoals';
import LocationCard from './location/LocationCard.jsx';
import ParticipantMembers from '../ParticipantMembers';
import DocumentCard from '../../../member/view/document/DocumentCard';
import ParticipantSACard from './ParticipantSACard.jsx';
import ConsentForm from './ConsentForm.jsx';
import ParticipantNeedAssessment from '../ParticipantNeedAssessment';
import ParticipantRiskAssessment from '../ParticipantRiskAssessment.jsx';
import ParticipantShiftCard from '../../../../admin/item/participant/shift/ParticipantShiftCard';
import ListTrackedGoals from './ListTrackedGoals'
import AvatarIcon from '../../../oncallui-react-framework/view/AvatarIcon.jsx';
import ParticipantSADocumentCard from './ParticipantSADocumentCard';
import OpportunitySafetyChecklist from '../../../crm/pages/opportunity/OpportunitySafetyChecklist.jsx';

/**
 * RequestData get the detail of participant
 * @param {int} participantId
 */
const requestRAData = (participantId) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { participant_id: participantId };
        postData('item/participant/get_participant_detail_by_id', Request).then((result) => {
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
 * Class: ParticipantDetails
 */
class ParticipantDetails extends React.Component {

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
            participant_id: '',
            name: '',
            cost_book_name: '',
            contact_id: '',
            active: '',
            created_by: '',
            created_at: '',
            updated_by: '',
            updated_at: '',
            contact: '',
            ndis_number: '',
            editCreateModal: false,
            work_type: '',
            middlename: '',
            previous_name: '',
        }

        this.rootRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);
        this.handleRelatedTab = this.renderRelatedTab.bind(this);
        this.handleDetailsTab = this.renderDetailsTab.bind(this);
    }

    /**
     * When component is mounted, remove replace the parent element
     */
    componentDidMount() {
        const id = this.props.match.params.id;
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
                    participant_id: raData.participant_id,
                    name: raData.contact,
                    contact_id: raData.contact_id,
                    cost_book_name: raData.cost_book_name,
                    active: raData.active,
                    created_by: raData.created_by,
                    created_at: raData.created_at,
                    updated_by: raData.updated_by,
                    updated_at: raData.updated_at,
                    contact: raData.contact,
                    ndis_number: raData.ndis_number,
                    work_type: raData.role_label,
                    avatar: raData.avatar,
                    middlename: raData.middlename,
                    previous_name: raData.previous_name,
                });
                var account = {
                    label: raData.name,
                    value: raData.participant_id,
                    account_type: 1,
                };
               
                this.setState({ rosterDetails: { account: account, participant_id: raData.participant_id } });
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
    renderRelatedContactLink() {
        const contact = _.get(this.state, 'contact')
        const contactId = _.get(this.state, 'contact_id')
        let tooltip = undefined
        if (!contactId) {
            return this.props.notAvailable
        }

        tooltip = `${contact} (contact)`

        return <Link to={ROUTER_PATH + `admin/crm/contact/details/${contactId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{contact}</Link>

    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        const header = {
            label: "Participant",
            title: this.state.name || '',
            icon: {
                category: "standard",
                name: "channel_program_members",
                label: "Participant",
            },
            details: [
                {
                    label: 'Contact',
                    content: this.renderRelatedContactLink(),
                },
                {
                    label: 'NDIS Number',
                    content: this.state.ndis_number,
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
            <AvatarIcon assistiveText={label} avatar={this.state.avatar || ""} category={category} name={name} />
        );
    }

    /**
     * Render action for `<PageHeader />`
     */
    renderActions = () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" title={`Update Participant`} onClick={() => this.setState({ openEditModal: true })}/>
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
                content: this.renderRelatedTab(),
            },
            {
                label: "Details",
                content: this.renderDetailsTab(),
            },
            {
                label: "Tracker",
                content: this.renderTrackerTab(),
            }
        ]
        return (
            <Tabs>
                {
                    tab.map((tabbar, index) => {
                        return (
                            <TabsPanel label={tabbar.label} key={index}>
                                {tabbar.content}
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
        if(this.state.participant_id == '') {
            return (
                <React.Fragment>

                </React.Fragment>
            )
        }
        return (
            <div className="slds-grid slds-grid_vertical">
                <div className="slds-col">
                    <div className="slds-grid slds-grid_vertical slds_my_card">
                        <ParticipantSACard
                            participant_id={this.props.match.params.id}
                            participant_name={this.state.name}                            
                        />
                        <ParticipantSADocumentCard
                            participant_id={this.props.match.params.id}
                            participant_name={this.state.name} 
                        />
                        <ConsentForm
                            participant_id={this.props.match.params.id}
                            participant_name={this.state.name}                            
                        >
                        </ConsentForm>
                        <ParticipantNeedAssessment
                            participant_id={this.props.match.params.id}
                            participant_name={this.state.name}
                            contact_id={this.state.contact_id}
                            contact_name={this.state.contact}
                        />
                        <ParticipantRiskAssessment
                            participant_id={this.props.match.params.id}
                            participant_name={this.state.name}
                            contact_id={this.state.contact_id}
                            contact_name={this.state.contact}
                        />
                        <Card
                            headerActions={<Button label="New"/>}
                            heading="Schedules (0)"
                            className="slds-card-bor"
                            icon={<Icon category="standard" name="date_input" size="small" />}
                        >
                        </Card>
                        <Card
                            headerActions={<Button label="New"/>}
                            heading="Need Assessments (0)"
                            className="slds-card-bor"
                            icon={<Icon category="standard" name="service_contract" size="small" />}
                        >
                        </Card>
                        <Card
                            headerActions={<Button label="New"/>}
                            heading="Risk Assessments (0)"
                            className="slds-card-bor"
                            icon={<Icon category="standard" name="opportunity" size="small" />}
                        >
                        </Card>          
                        <ParticipantShiftCard
                            stage={this.state.stage}
                            participant_id={this.props.match.params.id}
                            rosterDetails={this.state.rosterDetails}
                            page_name={'participants'}
                        />
                        
                        <ParticipantMembers participant_id={this.props.match.params.id} />
                        <ParticipantGoals
                            participant_id={this.state.participant_id}
                        />
                        <LocationCard
                            participant_id={this.props.match.params.id}
                            participant_name={this.state.name}
                        />
                        <DocumentCard
                            entity_id={this.props.match.params.id}
                            url={'item/participant/get_participant_document_list'}
                            user_page={'participants'}
                        />
                        <OpportunitySafetyChecklist
                            participant_id={this.props.match.params.id}
                        />
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
        return (
            <div className="slds-detailed-tab container-fluid">
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Name</label>
                            <div className="slds-form-element__control">
                                {this.state.name || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Service Type</label>
                            <div className="slds-form-element__control">
                                {this.state.work_type || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Middle Name</label>
                            <div className="slds-form-element__control">
                                {this.state.middlename || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Previous Name</label>
                            <div className="slds-form-element__control">
                                {this.state.previous_name || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Contact</label>
                            <div className="slds-form-element__control">
                                {this.state.contact || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">NDIS Number</label>
                            <div className="slds-form-element__control">
                                {this.state.ndis_number || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Active</label>
                            <div className="slds-form-element__control">
                                {this.state.active || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Cost Book</label>
                            <div className="slds-form-element__control">
                                {this.state.cost_book_name || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Created By</label>
                            <div className="slds-form-element__control">
                                {this.state.created_by || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Created Date</label>
                            <div className="slds-form-element__control">
                                {
                                    moment(this.state.created_at).isValid() ? moment(this.state.ccreated_at).format("DD/MM/YYYY") : notAvailable
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Last Modified By</label>
                            <div className="slds-form-element__control">
                                {this.state.updated_by || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Last Modified Date</label>
                            <div className="slds-form-element__control">
                                {
                                    moment(this.state.updated_at).isValid() ? moment(this.state.updated_at).format("DD/MM/YYYY") : notAvailable
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    renderTrackerTab()
        {
            return (<>
            <div className="slds-col slds-m-top_medium pl-3 pr-3" style={{ border: 'none', paddingTop: 0, paddingBottom: 0, marginTop: 0 }}>
            <ListTrackedGoals participant_id={this.props.match.params.id}/>
               </div>
            </>)
        }
    /**
     * Close the modal when user save the participant and refresh the details
     * Get the Unique reference id
     */
    closeModal = (status, participantId) => {
        this.setState({ openEditModal: false} );
        if(status){
            if (participantId) {
                this.getRADetails(participantId);
            }
        }

    }

    /**
     * Render modals
     * - Update Participant
     *
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openEditModal && (
                        <EditParticipantModel
                            showModal = {this.state.openEditModal}
                            closeModal = {this.closeModal}
                            headingTxt = "Update Participant"
                            participant_id={this.props.match.params.id}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    render() {
        // This will only run when you delete particpant
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <div className="ParticipantDetails slds" ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            {this.renderPageHeader()}
                        </div>
                        <div className="slds-col">
                            <div className="slds-gutters row">
                                <div className="col-lg-12 col-md-12 slds-m-top_medium">
                                    <div className="white_bg_color slds-box">
                                        {this.renderTab()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderModals()}
                </IconSettings>
            </div>
        )
    };
};

export default ParticipantDetails;
