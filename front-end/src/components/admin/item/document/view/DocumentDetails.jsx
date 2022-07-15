import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
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
} from '@salesforce/design-system-react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { ROUTER_PATH, BASE_URL} from 'config.js';
import { postData, css, Confirm, toastMessageShow, AjaxConfirm } from '../../../../../service/common.js'

import '../../../scss/components/admin/item/item.scss';
import RolesCard from './Roles.jsx';
import EditDocumentModel from '../EditDocumentModel.jsx';
/**
 * RequestData get the detail of document
 * @param {int} documentId
 */
const requestDocData = (documentId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { document_id: documentId };
        postData('item/document/get_document_detail_by_id', Request).then((result) => {
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
 * Class: DocumentDetails
 */
class DocumentDetails extends React.Component {

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
            document_id: '',
            title: '',
            issue_date_mandatory: false,
            expire_date_mandatory: false,
            reference_number_mandatory: false,
            active: false,
            created_by: '',
            created_at: '',
            updated_by: '',
            updated_at: '',
            document_category: '',
            document_related_to: '',
            openEditModal: false
        }

        this.rootRef = React.createRef();
        this.handleRelatedTab = this.renderRelatedTab.bind(this);
        this.handleDetailsTab = this.renderDetailsTab.bind(this);
    }

    /**
     * When component is mounted, remove replace the parent element
     */
    componentDidMount() {
        const id = this.props.match.params.id;
        this.getDocDetails(id);
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Call getDocDetails
     * param {int} id
     */
    getDocDetails = (id) => {
        requestDocData(
            id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    document_id: raData.document_id,
                    title: raData.title,
                    active: raData.active,
                    issue_date_mandatory: raData.issue_date_mandatory,
                    expire_date_mandatory: raData.expire_date_mandatory,
                    reference_number_mandatory: raData.reference_number_mandatory,
                    document_category: raData.document_category,
                    document_related_to: raData.document_related_to,
                    created_by: raData.created_by,
                    created_at: raData.created_at,
                    updated_by: raData.updated_by,
                    updated_at: raData.updated_at,
                });
            }

        });
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        const header = {
            label: "Document",
            title: this.state.title || ' ',
            icon: {
                category: "standard",
                name: "document",
                label: "Document",
            },
            details: [],
        }

        return (
            <PageHeader
                variant={"object-home"}
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
            <Icon
                assistiveText={{ label: label }}
                category={category}
                name={name}
            />
        );
    }

    /**
     * Render action for `<PageHeader />`
     */
    renderActions = () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" title={`Update Document`} onClick={() => this.showModal()} />
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
        return (
            <div className="slds-grid slds-grid_vertical">
                <div className="slds-col">
                    <div className="slds-grid slds-grid_vertical">
                        <RolesCard
                            document_id={this.props.match.params.id}
                            title={this.state.title}
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
                                {this.state.title || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Active</label>
                            <div className="slds-form-element__control">
                                {this.state.active || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Issue Date Mandatory</label>
                            <div className="slds-form-element__control">
                                {this.state.issue_date_mandatory || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Expire Date Mandatory</label>
                            <div className="slds-form-element__control">
                                {this.state.expire_date_mandatory || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Reference Number Mandatory</label>
                            <div className="slds-form-element__control">
                                {this.state.reference_number_mandatory || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Document category</label>
                            <div className="slds-form-element__control">
                                {this.state.document_category || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Related to</label>
                            <div className="slds-form-element__control">
                                {this.state.document_related_to || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Open create document modal
     */
    showModal = (oppId) => {
        this.setState({ openEditModal: true });
    }

    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, documentId) => {
        this.setState({ openEditModal: false});
        if (status) {
            var id = this.props.match.params.id;
            this.getDocDetails(id);
        }
    }

    /**
     * Render modals
     * - Edit Document
     * 
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openEditModal && (
                        <EditDocumentModel
                            showModal = {this.state.openEditModal}
                            closeModal = {this.closeModal}
                            headingTxt = "Update Document"
                            documentId = {this.props.match.params.id}
                            getDetails = {this.getDocDetails.bind(this)}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    render() {
        // This will only run when you delete document
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <div className="slds-related-tab-details slds" ref={this.rootRef}>
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

export default DocumentDetails;
