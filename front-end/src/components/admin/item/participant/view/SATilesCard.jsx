import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { css } from 'service/common.js';

import {
    Icon,
    Dropdown
} from '@salesforce/design-system-react';
import '../../../scss/components/admin/member/member.scss';
import '../../../scss/components/admin/item/item.scss';
class SATilesCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sub_organisation: [],
        }
    }

    render() {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
        return (
            <React.Fragment>
                <article class="slds-tile slds-media slds-card__tile slds-hint-parent">
                    <div class="slds-media__figure">
                        <span class={"slds-icon_container slds-icon-standard-"+ this.props.icon.name} >
                            <Icon category={this.props.icon.category} name={this.props.icon.name} size={this.props.icon.size} />
                            <span class="slds-assistive-text">{this.props.title}</span>
                        </span>
                    </div>
                    <div class="slds-media__body slds-tbl-card">
                        <div class="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                            <h3 class="slds-tile__title slds-truncate" >
                                <Link to={this.props.url || "#"} title={this.props.title} style={{ color: '#0070d2' }}>{this.props.title}</Link>
                            </h3>
                        </div>
                        <div class="slds-tile__detail">

                                {this.props.title_details.map((val, index) => (
                                    <dl class="slds-list_horizontal slds-wrap lower_font_size">
                                        <dt class="slds-item_label slds-text-color_weak slds-tile-lbl" title={val.label}><span class="slds-truncate dismax-wid">{val.label}</span><span>:</span></dt>

                                        <dd class="slds-item_detail slds-truncate slds-tile-val" title={val.value}>{val.value}</dd>
                                    </dl>
                                ))}

                        </div>
                    </div>
                </article>
            </React.Fragment >
        );
    }
}

export default SATilesCard;