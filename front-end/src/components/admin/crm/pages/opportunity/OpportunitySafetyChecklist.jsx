import React from 'react'
import { Card, Icon, MediaObject } from '@salesforce/design-system-react'
import { css, postData } from '../../../../../service/common'
import { ROUTER_PATH } from '../../../../../config'
import moment from 'moment';

export const Tile = (props) => {
    const styles = css({
        icon: {
            backgroundColor: '#baac93', // brown
        }
    })
    let item = props.item;
    let last_updated = moment(item.updated_at).format('DD/MM/YYYY');
    let updated_by_name = item.updated_by_name;
    let det_link = props.opportunity_id && `${ROUTER_PATH}admin/item/opportunity/safetychecklist/${props.opportunity_id}`;
    if (props.participant_id) {
        det_link = `${ROUTER_PATH}admin/item/participant/safetychecklist/${props.participant_id}`;
    }
    return (
        <MediaObject
            body={(
                <React.Fragment>
                    <h3 className="slds-tile__title slds-truncate" title="Environment Checklist">
                        <a style={{color: "rgb(0, 112, 210)"}} href={det_link} className="">Environment Checklist</a>
                    </h3>
                    <div className="slds-tile__detail">
                        <dl className="slds-list_horizontal slds-wrap">
                            {
                                <React.Fragment>
                                    <dt style={{ width: "27%" }} className="slds-item_label slds-text-color_weak" title="Last Updated On">
                                        Last Updated On:
                                    </dt>
                                    <dd className="slds-item_detail" title={last_updated}>
                                        {last_updated}
                                    </dd>
                                    <dt style={{ width: "27%" }} className="slds-item_label slds-text-color_weak" title="Last Updated By">
                                        Last Updated By:
                                    </dt>
                                    <dd className="slds-item_detail" title={updated_by_name}>
                                        {updated_by_name}
                                    </dd>
                                </React.Fragment>
                            }
                        </dl>
                    </div>
                </React.Fragment>
            )}
            className="slds-tile"
            figure={<Icon category="standard" name={"file"} size="small" style={styles.icon} />}
        // verticalCenter
        />
    )
}

class OpportunitySafetyChecklist extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            safetyChecklist: undefined
        }

        this.formRef = React.createRef()
        this.inputFile = React.createRef()
    }

    componentDidMount() {
        this.getChecklist()
    }

    getChecklist() {
        const { opportunity_id, participant_id } = this.props
        postData('sales/Opportunity/get_staff_safety_checklist', { opportunity_id, participant_id }).then(res => {
            if (res.status) {
                this.setState({ safetyChecklist: res.data })
            }
        })
    }

    render() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            },
            rowParent: {
                borderRadius: 0,
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none',
            },
            form: {
                display: 'block'
            }
        })
        let uplink = this.props.opportunity_id && `${ROUTER_PATH}admin/item/opportunity/safetychecklist/${this.props.opportunity_id}` || `${ROUTER_PATH}admin/item/participant/safetychecklist/${this.props.participant_id}`;
        return (
            <React.Fragment>
                <form onSubmit={this.handleSubmit} encType="multipart/form-data" style={styles.form} ref={this.formRef} noValidate>
                    <Card
                        headerActions={
                            <React.Fragment>
                                <div className="slds-no-flex">
                                    <a href={uplink} className="slds-button slds-button_neutral">
                                        Update
                                    </a>
                                </div>
                            </React.Fragment>
                        }
                        heading={`Environment/Staff Safety Checklist`}
                        style={styles.card}
                        icon={
                            <Icon
                                category="standard"
                                name="document"
                                size="small"
                            />
                        }
                    >
                        {
                            this.state.safetyChecklist && (
                                <div className="slds-box" style={styles.rowParent}>
                                    <div className="row">
                                        {
                                            <div className="col col-sm-8" style={{ marginBottom: 15 }}>
                                                <Tile
                                                    item={this.state.safetyChecklist}
                                                    opportunity_id={this.props.opportunity_id}
                                                    participant_id={this.props.participant_id}
                                                />
                                            </div>
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </Card>
                </form>
            </React.Fragment>
        )
    }
}
export default OpportunitySafetyChecklist