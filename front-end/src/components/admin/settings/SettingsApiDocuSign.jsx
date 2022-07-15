import { Button, Input } from '@salesforce/design-system-react';
import jQuery from 'jquery';
import React from 'react';
import { AjaxConfirm, css, postData, toastMessageShow } from '../../../service/common';

/**
 * Component to display form to configure docusign api credentials
 */
class SettingsApiDocuSign extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			isSubmitting: false,
			DocuSignUsername: '',
			DocuSignPassword: '',
			DocuSignIntegratorKey: ''
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
			const { status, data } = await postData('admin/settings/docusign_settings');
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
			'Are your sure you want to make changes to your DocuSign configuration? We recommend backing up your DocuSign credentials before proceeding.';

		const reqData = {
			DocuSignUsername: this.state.DocuSignUsername,
			DocuSignPassword: this.state.DocuSignPassword,
			DocuSignIntegratorKey: this.state.DocuSignIntegratorKey
		};
		AjaxConfirm(reqData, confirmSave, `admin/settings/save_docusign_settings`, {
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
			<form ref={this.formEl} onSubmit={this.handleOnSubmit} noValidate>
				<div className="row py-2" style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="input_2">
							<label className="slds-form-element__label" htmlFor="text-input-id-1">
								<abbr className="slds-required" title="required">
									*{' '}
								</abbr>{' '}
								Docusign Username
							</label>
							<Input
								type="text"
								className="input_3"
								name="DocuSignUsername"
								id="Docusign-username"
								placeholder="Docusign Username"
								value={this.state.DocuSignUsername}
								onChange={(e) => this.setState({ DocuSignUsername: e.target.value })}
								required
							/>
						</div>
					</div>
                    </div>
                    <div className="row py-2"  style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="input_2">
							<label className="slds-form-element__label" htmlFor="text-input-id-1">
								<abbr className="slds-required" title="required">
									*{' '}
								</abbr>{' '}
								Docusign Password
							</label>
							<Input
								type="password"
								className="input_3"
								name="DocuSignPassword"
								id="Docusign-password"
								placeholder="Docusign Password"
								value={this.state.DocuSignPassword}
								onChange={(e) => this.setState({ DocuSignPassword: e.target.value })}
								required
							/>
						</div>
					</div>
                    </div>
                    <div className="row py-2"  style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="input_2">
							<label className="slds-form-element__label" htmlFor="text-input-id-1">
								<abbr className="slds-required" title="required">
									*{' '}
								</abbr>Integrator Key
							</label>
							<Input
								type="text"
								className="input_3"
								name="DocuSignIntegratorKey"
								id="Docusign-integrator_key"
								placeholder="Integrator Key"
								value={this.state.DocuSignIntegratorKey}
								onChange={(e) => this.setState({ DocuSignIntegratorKey: e.target.value })}
								required
							/>
						</div>
					</div>
				</div>
           
				<div className="row py-2"  style={styles.centerAlign}>
					<div className="col-xs-3">
						<div className="login_but" style={{ float: 'right' }}>
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

export default SettingsApiDocuSign;
