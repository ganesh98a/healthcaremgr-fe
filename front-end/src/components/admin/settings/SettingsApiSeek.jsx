import { Button, Input } from '@salesforce/design-system-react';
import jQuery from 'jquery';
import React from 'react';
import { AjaxConfirm, css, postData, toastMessageShow } from '../../../service/common';
/**
 * Component to display form to configure see api credentials
 */
class SettingsApiSeek extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			isSubmitting: false,
			seekUsername: '',
			seekPassword: '',
			seekAdvertiserName: '',
			seekAdvertiserId: ''
		};

		/**
         * Will be used by jQuery validation
         * 
         * @type {React.Ref<HTMLFormElement>}
         */
		this.formEl = React.createRef();
	}

	// Load the configurations when component is mounted
	async componentDidMount() {
		this.setState({ loading: true });

		try {
			const { status, data } = await postData('admin/settings/seek_settings');
			if (status) {
				this.setState(data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ loading: false });
		}
	}

	/**
     * Handles client side validation and form submission. 
     * Will warn the user before submitting as this is a very dangerous operation
     * 
     * @param {React.FormEvent<HTMLFormElement>} e
     */
	handleOnSubmit = async (e) => {
		e.preventDefault();
		// validate, exit early if not valid
		jQuery(this.formEl.current).validate();
		if (!jQuery(this.formEl.current).valid()) {
			return;
		}
		this.setState({ isSubmitting: true });
		const confirmSave =
			'Are your sure you want to make changes to your Seek configuration? We recommend backing up your Seek credentials before proceeding.';
		const reqData = {
			seekUsername: this.state.seekUsername,
			seekPassword: this.state.seekPassword,
			seekAdvertiserName: this.state.seekAdvertiserName,
			seekAdvertiserId: this.state.seekAdvertiserId
		};
		AjaxConfirm(reqData, confirmSave, `admin/settings/save_seek_settings`, {
			confirm: 'Continue',
			heading_title: 'Save'
		}).then((conf_result) => {
			if (conf_result.status) {
				toastMessageShow(conf_result.msg, 's');
			} else {
				toastMessageShow(conf_result.error, 'e');
			}
			this.setState({ isSubmitting: false });
		});
	};

	render() {
		// TODO: Currently contains copied and pasted code from UpdatePassword.js
		// resulting will bunch of misleading classnames

		const { loading, isSubmitting } = this.state;

		const styles = css({
			centerAlign: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			},
			saveBtn: {
				maxWidth: 345
			}
		});

		return (
			<form ref={this.formEl} noValidate>
				<div className="row py-2 " style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="input_2">
							<label className="slds-form-element__label" htmlFor="text-input-id-1">
								<abbr className="slds-required" title="required">
									*{' '}
								</abbr>{' '}
								Seek Username
							</label>
							<Input
								type="text"
								className="input_3"
								name="seekUsername"
								id="Seek-username"
								placeholder="Seek Username"
								value={this.state.seekUsername}
								onChange={(e) => this.setState({ seekUsername: e.target.value })}
								required
							/>
						</div>
					</div>
				</div>
				<div className="row py-2 " style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="input_2">
							<label className="slds-form-element__label" htmlFor="text-input-id-1">
								<abbr className="slds-required" title="required">
									*{' '}
								</abbr>{' '}
								Seek Password
							</label>
							<Input
								type="password"
								className="input_3"
								name="seekPassword"
								id="Seek-password"
								placeholder="Seek Password"
								value={this.state.seekPassword}
								onChange={(e) => this.setState({ seekPassword: e.target.value })}
								required
							/>
						</div>
					</div>
				</div>
				<div className="row py-2 " style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="input_2">
							<label className="slds-form-element__label" htmlFor="text-input-id-1">
								<abbr className="slds-required" title="required">
									*{' '}
								</abbr>{' '}
								Advertiser Account Name
							</label>
							<Input
								type="text"
								className="input_3"
								name="seekAdvertiserName"
								id="Seek-advertiser_name"
								placeholder="Advertiser Account Name"
								value={this.state.seekAdvertiserName}
								onChange={(e) => this.setState({ seekAdvertiserName: e.target.value })}
								required
							/>
						</div>
					</div>
				</div>{' '}
				<div className="row py-2 " style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="input_2">
							<label className="slds-form-element__label" htmlFor="text-input-id-1">
								<abbr className="slds-required" title="required">
									*{' '}
								</abbr>{' '}
								Advertiser Account ID
							</label>
							<Input
								type="text"
								className="input_3"
								name="seekAdvertiserId"
								id="Seek-advertiser_id"
								placeholder="Advertiser Account ID"
								value={this.state.seekAdvertiserId}
								onChange={(e) => this.setState({ seekAdvertiserId: e.target.value })}
								required
							/>
						</div>
					</div>
				</div>
				<div className="row py-2 " style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="login_but" style={{ float: 'right' }}>
							{/* misleading classname 'but_login orange'. Class name is 'orange' but the button is colored as violet */}
							<Button
								variant="brand"
								disabled={loading || isSubmitting}
								onClick={this.handleOnSubmit}
								className="but_login orange"
								title={`DANGER: Back-up your credentials before saving!`}
								style={styles.saveBtn}
							>
								{isSubmitting ? `Saving` : `Save`}
							</Button>
						</div>
					</div>
				</div>
			</form>
		);
	}
}

export default SettingsApiSeek;
