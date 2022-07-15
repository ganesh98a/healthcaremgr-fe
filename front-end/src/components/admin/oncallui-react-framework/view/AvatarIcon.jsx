import { Avatar, Icon } from '@salesforce/design-system-react';
import React from 'react';
import './user-avatar.scss';

import DefaultPic from "../object/DefaultPic"
/**
 * @example <AvatarIcon assistiveText="" avatar={this.state.avatar} category="standard" name="user" />
 */
const AvatarIcon = props => {
    let avatar = props.avatar;
    return (
        avatar && <Avatar
            assistiveText={{ label: props.assistiveText || 'Avatar image' }}
            imgSrc={props.avatar}
            imgAlt="Profile Pic"
            size={props.size || "medium"}
            title={false}
        /> ||
        <Icon
            assistiveText={{ label: props.assistiveText }}
            category={props.category || "standard"}
            name={props.name}
        />
    )
}

export default AvatarIcon;