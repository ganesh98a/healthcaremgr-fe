import React from 'react';
import { Avatar, Icon, IconSettings } from '@salesforce/design-system-react';
import './user-avatar.scss';
import CustomModal from './CustomModal';
import ImageCrop from './ImageCrop';
import { postData, toastMessageShow } from '../../../../service/common';
import DefaultPic from '../object/DefaultPic';

class UserAvatar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showEditModal: false,
            loading: false,
            avatar: props.avatar || ""
        }
    }

    componentDidUpdate(props, state) {
        if (!state.avatar && props.avatar) {
            this.setState({ avatar: props.avatar });
        }
    }

    openEdit(e) {
        this.setState({ showEditModal: true });
    }
    closeEditModal(e) {
        this.setState({ showEditModal: false });
    }

    updateAvatar(e) {
        e.preventDefault();
        if (!this.state.avatar) {
            return false;
        }
        this.setState({ loading: true });
        this.props.onUpdateAvatar(this.state.avatar);
        this.setState({ loading: false, showEditModal: false });
    }

    uploadAvatar(e) {
        e.preventDefault();
        if (!this.state.avatar) {
            return false;
        }
        const formData = { avatar: this.state.avatar };
        this.setState({ loading: true });
        postData(
            "common/Common/upload_user_avatar",
            formData
        ).then(res => {
            this.setState({ loading: false, showEditModal: false });
            if (res.status) {
                toastMessageShow("Profile picture updated successfully", "s");
            }
        });
    }

    setAvatarData(data) {
        this.setState({ avatar: data });
        if (!data) {
            this.props.onUpdateAvatar("");
        }
    }

    blobToBase64(blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise(resolve => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    };

    render() {
        let style = this.props.style || "";
        let iconStyle = this.props.iconStyle || "";
        return (
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <div style={{ ...style }} id="user-avatar-col" className="user-avatar">
                    <Avatar
                        assistiveText={{ icon: 'Avatar image' }}
                        imgSrc={this.state.avatar || DefaultPic}
                        imgAlt="Profile Pic"
                        size="medium"
                        title={false}
                    />
                    <div style={{ ...iconStyle }} className="avatar-icons">
                        <span id="edit-btn" className="icon-bg" onClick={e => this.openEdit(e)}>
                            <Icon
                                category="utility"
                                name="edit"
                                size="small"
                                className="qrf-avatar-icon"
                            />
                        </span>
                        <span className="icon-bg" onClick={e => { e.preventDefault(); this.setAvatarData("") }}>
                            <Icon
                                category="utility"
                                name="clear"
                                size="small"
                                className="qrf-avatar-icon"
                            />
                        </span>
                    </div>
                    {
                        this.state.showEditModal && <CustomModal
                            id="update-profile-pic"
                            title="Update Profile Picture"
                            ok_button="Submit"
                            onClickOkButton={(e) => this.updateAvatar(e)}
                            showModal={this.state.showEditModal}
                            setModal={(status) => this.closeEditModal(status)}
                            size="small"
                            style={{ overFlowY: "hidden" }}
                            loading={this.state.loading}
                        >
                            <ImageCrop
                                onCropCompleted={blob => this.blobToBase64(blob).then(data => {
                                    this.setAvatarData(data)
                                })
                                }
                                maxCropSize="300"
                                loading={this.state.loading}
                            />
                        </CustomModal>
                    }
                </div>
            </IconSettings>
        )
    }
}

export default UserAvatar;