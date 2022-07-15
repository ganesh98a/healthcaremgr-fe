import React, { Component } from 'react';
import { connect } from 'react-redux'

import Imail from '../admin/notification/Imail';
import Notification from '../admin/notification/Notification';
import InfographicSidebar from './notification/InfographicSidebar';
class RightMenu extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { RightMenuOpen, NotificationType } = this.props
		
		const style = {
			width: (RightMenuOpen && NotificationType === 'infographics') ? 666 : undefined
		}

		return (
			<div className="navbar-my navbar-inverse-my navbar-fixed-top" id="sidebar-wrapper_new" role="navigation" style={style}>
				{((this.props.RightMenuOpen && this.props.NotificationType == 'notification') ?
					<Notification />:''
				)}

				{((this.props.RightMenuOpen && this.props.NotificationType == 'imail') ?
					<Imail />:''
				)}
				{
					(this.props.RightMenuOpen && this.props.NotificationType === 'infographics') && (
						<InfographicSidebar />
					)
				}

			</div>
		)
	}
}
const mapStateToProps = state => ({
	RightMenuOpen: state.NotificationReducer.RightMenuOpen,
	NotificationType: state.NotificationReducer.NotificationType,
})

const mapDispatchtoProps = (dispach) => ({

})

export default connect(mapStateToProps, mapDispatchtoProps)(RightMenu);