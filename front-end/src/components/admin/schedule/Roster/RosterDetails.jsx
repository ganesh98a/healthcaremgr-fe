import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';
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
    Card,
    MediaObject,
    Dropdown
} from '@salesforce/design-system-react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { ROUTER_PATH,BASE_URL} from 'config.js';
import { postData, css } from 'service/common.js'
import RosterStage from './RosterStage.jsx';
import { openAddEditShiftModal } from '../ScheduleCommon';
import ShiftCard from './shift/ShiftCard.jsx';
import RosterModal from './RosterModal.jsx';
import OncallFormWidget from '../../oncallui-react-framework/input/OncallFormWidget';
import { setSubmenuShow } from 'components/admin/actions/SidebarAction';

/**
 * RequestData get the detail of roster
 * @param {int} rosterId
 */
const requestRTData = (rosterId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { roster_id: rosterId };
        postData('schedule/roster/get_roster_detail_by_id', Request).then((result) => {
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
 * Class: RosterDetails
 */
 class RosterDetails extends React.Component {
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
            roster_id:  this.props.match.params.id,
            shift_id: '',
            openCreateModal: false,
            rosterDetails: '',
            RosterModal:false
        }
        this.rootRef = React.createRef();
    }

     /**
     * When component is mounted, remove replace the parent element
     */
      componentDidMount() {
        const id = this.props.match.params.id;
        this.getRTetails(id);
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        this.props.setSubmenuShow(0);
    }

    /**
     * Call requestRTData
     * param {int} id
     */
     getRTetails = (id) => {
        requestRTData(
            id,
        ).then(res => {
            var ros_id = this.props.match.params.id;
            var raData = res.data;
            if (raData) {
                this.setState(raData);
                this.setState({'edit_data':raData});
                var account = {
                        label: raData.account,
                        value: raData.account_id,
                        account_type: raData.account_type,
                    };
                var owner = {
                    value: raData.owner_id,
                    label: raData.owner_label
                };
                this.setState({ rosterDetails: { account: account, roster_id: ros_id, owner: owner } });
            }

        });
    }

    /**
     * Renders the page header
     */
    renderPageHeader = () => {
        const header = {
            label: "Roster",
            title: this.state.roster_no || '',
            icon: {
                category: "standard",
                name: "work_plan_template",
                label: "Roster",
            },
            details: [
                {
                    label: 'Account',
                    content: this.renderRelatedAccountLink(),
                },
                {
                    label: 'Contact',
                    content: this.renderRelatedContactLink(),
                },
                {
                    label: 'Owner',
                    content: this.renderRelatedOwnerLink(),
                },
                {
                    label: 'Type',
                    content: this.state.roster_type_label || '',
                },
                {
                    label: 'Start Date',
                    content: this.state.start_date || '',
                },
                {
                    label: 'End Date',
                    content: this.state.end_date || '',
                },
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
                onRenderActions={this.actions}
            />
        )
    }

    /**
     * Action renderer for `<PageHeader />`
     */
     actions = () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list">
                    <Button label="Clone" title={`Clone roster`} />
                    <Button label="Edit" onClick={()=>this.showModal()} title={`Update roster`} />
                    <Button label="Deactivate" title={`Deactivate roster`} />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     * Render icon
     */
     renderIcon = ({ label, category, name }) => {
        return (
            <Icon
                assistiveText={{ label: label }}
                category={category}
                name={name}
            />
        );
    }

    /**
     * Renders the link related to account
     */
     renderRelatedAccountLink() {
        let account = null
        let account_type_label = null
        let account_link = null
       
        if (!this.state.account) {
            return account
        }
        account = _.get(this.state, 'account') || '';
        if (this.state.account_type == 1) {
            account_link = ROUTER_PATH + `admin/item/participant/details/${_.get(this.state, 'account_id')}`;
            account_type_label = '(Participant)';
        } else if (this.state.account_type == 2) {
            account_type_label = '(Organisation)'
            account_link = ROUTER_PATH + `admin/crm/organisation/details/${_.get(this.state, 'account_id')}`
        }

        if (account_link) {
            return (
                <Link 
                    to={account_link} 
                    title={[account, account_type_label].filter(Boolean).join(' ')} 
                    className="reset"
                    style={{ color: '#006dcc' }}
                >
                    {account}
                </Link>
            )
        }
        return (
            <span title={[account, account_type_label].filter(Boolean).join(' ')}>
                {account}
            </span>
        )
    }

    /**
     * Renders link for related account. 
     */
     renderRelatedContactLink() {
        const contact = _.get(this.state, 'contact_label')
        const contactId = _.get(this.state, 'contact_id')
        let tooltip = undefined
        if (!contactId) {
            return this.props.notAvailable
        }

        tooltip = `${contact} (contact)`

        return <Link to={ROUTER_PATH + `admin/crm/contact/details/${contactId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{contact}</Link>

    }

    /**
     * Renders link for related owner. 
     */
     renderRelatedOwnerLink() {
        const owner = _.get(this.state, 'owner_label')
        const ownerId = _.get(this.state, 'owner_id')
        let tooltip = undefined
        if (!ownerId) {
            return this.props.notAvailable
        }

        tooltip = `${owner} (Owner)`

        return <Link to={ROUTER_PATH + `admin/user/details/${ownerId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{owner}</Link>

    }

    /**
     * Render modals
     * - Create Roster
     * - Edit Roster
     * 
     */
     renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.rosterModalOpen && (
                        <RosterModal
                            showModal = {this.state.rosterModalOpen}
                            closeModal = {this.closeModal}
                            headingTxt = {this.state.modalHeading}
                            reference_id={this.state.rosterDetails['roster_id']}
                            roster_data={this.state.edit_data}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Roster modal open
     */
    showModal = (heading ='Update',roster_id='') => {
        this.setState({ rosterModalOpen: true, modalHeading: heading })
    }
       /**
     * to close the modal
     */
        closeModal = (status) => {
            this.setState({ rosterModalOpen: false });
            if (status) {
                const id = this.props.match.params.id;
                this.getRTetails(id);
            }
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
                {this.renderShiftCard()}
            </div>
        )
    }

    getFormatedDate(dDate) {
        return dDate ? moment(dDate).format("DD/MM/YYYY HH:mm") : ''
    }

    /**
     * Renders the details tab
     */
    renderDetailsTab() {
        const notAvailable = 'N/A';
        const id = _.get(this.props, 'props.match.params.id');
        
        var formProps = [
            {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.account, label: "Account", name:"account" },
                   { value: this.state.contact_label, label: "Contact", name:"contact" },
                ],
            },
            {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.owner_label, label: "Owner", name:"owner" },
                   { value: this.state.roster_type_label, label: "Type", name:"Type" },
                ],
            },
            {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.funding_type_label, label: "Funding Type", name:"funding_type" },
                   { value: this.state.status_label, label: "Status", name:"status" },
                ],
            },
            {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.created_by, label: "Created by", name:"created_by" },
                   { value: this.getFormatedDate(this.state.created), label: "Created Date", name:"created_date" },
                ],
            },
            {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.updated_by, label: "Last Modified By", name:"last_modified_by" },
                   { value: this.getFormatedDate(this.state.updated), label: "Last Modified Date", name:"last_modified_date" },
                ],
            }
        ]
        
        return (
            <div className="slds-detailed-tab container-fluid">
                <OncallFormWidget formElement={formProps} />
            </div>
        );
    }

    renderShiftCard = () => {
        // Card style
        const styles = css({
            card: {

                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3 slds_my_card">
                <div className="slds-grid slds-grid_vertical">
                    <ShiftCard
                        stage={this.state.stage}
                        roster_id={this.props.match.params.id}
                        rosterDetails={this.state.rosterDetails}
                        page_name={'roster'}
                    />
                </div>
            </div>
        );
    }

    render() {
        // This will only run when you delete particpant
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <div className="rosterDetails slds" ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            {this.renderPageHeader()}
                        </div>
                        <RosterStage
                            {...this.state}
                            roster_stage={this.state.stage || ''}
                            roster_id={this.state.roster_id || ''}
                        />
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
                </IconSettings>
                {this.renderModals()}
            </div>
        );
    }
 }

 const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        setSubmenuShow: (result) => dispatch(setSubmenuShow(result))
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(RosterDetails);