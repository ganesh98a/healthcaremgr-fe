import 'react-table/react-table.css';
import { Icon, IconSettings, PageHeader, Tabs, TabsPanel } from '@salesforce/design-system-react';
import React from 'react';
import { checkItsNotLoggedIn, css } from '../../service/common';
import SettingsApiDocuSign from './settings/SettingsApiDocuSign.jsx';
import SettingsApiSeek from './settings/SettingsApiSeek.jsx';

class SettingsApi extends React.Component {
	constructor(props) {
		super(props);

		checkItsNotLoggedIn();
		this.rootRef = React.createRef();
		this.tabs = [ 'DocuSign Settings', 'Seek Settings' ];
	}

	/**
     * render header part
     */
	renderHeader() {
		return (
			<React.Fragment>
				<PageHeader
					icon={
						<Icon
							assistiveText={{
								label: 'Update API settings'
							}}
							category="standard"
							name="settings"
							style={{
								backgroundColor: '#56aadf',
								fill: '#ffffff',
								
							}}
							title="Update API settings"
						/>
					}
					title={'Update API settings'}
					label={<span />}
					truncate
					variant="object-home"
				/>
			</React.Fragment>
		);
	}

	render() {
		const styles = css({
			root: {
				fontFamily: 'Salesforce Sans, Arial, Helvetica, sans-serif',
				fontSize: 13,
				padding: 15
			},
			boxPosition:{
                marginTop:15
			}
		});

		return (
			<React.Fragment>
				<div className="slds" style={styles.root} ref={this.rootRef}>
					<IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
						{this.renderHeader()}
						<div className="white_bg_color slds-box" style={styles.boxPosition}>
							{
								<Tabs>
									{this.tabs.map((tabname) => (
										<TabsPanel label={tabname}>
											{tabname == 'DocuSign Settings' && <SettingsApiDocuSign />}
											{tabname == 'Seek Settings' && <SettingsApiSeek />}
										</TabsPanel>
									))}
								</Tabs>
							}
						</div>
					</IconSettings>
				</div>
			</React.Fragment>
		);
	}
}
export default SettingsApi;
