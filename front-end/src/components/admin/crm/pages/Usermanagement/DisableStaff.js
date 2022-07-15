import React, { Component } from 'react';
import { postData, getOptionsCrmMembers, handleChangeChkboxInput } from '../../../../../service/common.js';
import Select from 'react-select-plus';
import jQuery from 'jquery';
import { toast } from 'react-toastify';
import ReactTable from 'react-table';
import { ToastUndo } from 'service/ToastUndo.js';
import { staffDisableAccount, staffAllocatedAccount } from '../../../../../dropdown/CrmDropdown.js';
import Scrollbar from 'perfect-scrollbar-react';
import classNames from 'classnames';

const CustomTbodyComponent = props => (
	<div {...props} className={classNames('rt-tbody', props.className || [])}>
		<Scrollbar>{props.children}</Scrollbar>
	</div>
);
class DisableStaff extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			key: 1,
			filterVal: '',
			showModal: false,
			staff_detail: [],
			loading: false,
			staff_disable_note: '',
			account_allocated_staff_to: '',
			disableAccount: '',
			allocatedAccount: '',
			staff_id: '',
			staff_name: '',
			staff_disable: {},
			search: '',
			custom_search: false
		};
	}

	componentWillReceiveProps(newProps) {
		this.setState({ newProps }, () => {
			if (newProps.showModal) {
				this.get_staff_detail();
				this.setState({ staff_detail: [] });
				this.setState({ staff_disable_note: '', disableAccount: '', allocatedAccount: '' });
			}
		});
	}

	get_staff_detail = (value = '') => {
		this.setState({ loading: true }, () => {
			postData('crm/CrmStaff/get_staff_details', { id: this.props.staffId, disable: true, allocation: value }).then(result => {
				if (result.status) {
					this.setState({ staff_detail: result.data });
				}
			});
		});

		this.setState({ loading: false });
	};

	submit = e => {
		e.preventDefault();
		jQuery('#updateDisableStaff').validate({ ignore: [] });
		jQuery('#disableAccount')
			.attr('name', 'disableAccount')
			.attr('data-msg', 'This field is required');
		jQuery('#allocatedAccount')
			.attr('name', 'allocatedAccount')
			.attr('data-msg', 'This field is required');

		if (this.state.custom_search) {
			jQuery('#account_allocated_staff_to')
				.attr('name', 'account_allocated_staff_to')
				.attr('data-msg', 'This field is required');
		}
		if (jQuery('#updateDisableStaff').valid()) {
			this.setState({
				staff_disable: {
					disableAccount: this.state.disableAccount,
					account_allocated_staff_to: this.state.account_allocated_staff_to.value,
					allocatedAccount: this.state.allocatedAccount,
					staff_id: this.props.staffId,
					staff_disable_note: this.state.staff_disable_note,
					update_mode: '1',
					staff_details: this.state.staff_detail.assigned_participant
				}
			});
			this.setState({ loading: true }, () => {
				postData('crm/CrmStaff/add_update_disable_recruiter_staff', this.state.staff_disable).then(result => {
					if (result.status) {
						toast.dismiss();
						toast.success(<ToastUndo message={result.msg} showType={'s'} />, {
							//   toast.success(result.msg, {
							position: toast.POSITION.TOP_CENTER,
							hideProgressBar: true
						});
						this.props.closeModal(true);
						// this.props.disableRedirect();
						if (typeof this.props.list != 'undefined') this.props.list();
						this.setState({ redirect: true, disableAccount: '', account_allocated_staff_to: '', allocatedAccount: '', staff_disable_note: '' });
					} else {
						toast.dismiss();
						toast.error(<ToastUndo message={result.error} showType={'e'} />, {
							//   toast.error(result.error, {
							position: toast.POSITION.TOP_CENTER,
							hideProgressBar: true
						});
					}
					this.setState({ loading: false });
				});
			});
		}
	};

	handleSelect = (e, p_id) => {
		let state = this.state.staff_detail.assigned_participant;
		state.map(function(value, i) {
			if (state[i].p_id == p_id) {
				state[i].label.label = e.label;
				state[i].changed_id = e.value;
			}
		});
		this.setState(state);
	};

	render() {
		const columns = [
			{ Header: 'Name:', accessor: 'FullName', className: '_align_c__', Cell: props => <span>{props.value}</span> },
			{
				Header: 'Stage:',
				accessor: 'stage_name',
				className: '_align_c__',
				Cell: props => <span className="title_input pl-0">{props.value}</span>
			},
			{
				headerClassName: '_align_c__ header_cnter_tabl',
				Header: 'Allocate to:',
				accessor: 'label',
				className: '_align_c__ td_Overflow',
				Cell: props => (
					<div>
						<span className="requireds modify_select s2">
							<div className="search_icons_right modify_select default_validation left_validation">
								<Select.Async
									cache={false}
									clearable={false}
									name="custom_allocate"
									required={true}
									value={props.value}
									loadOptions={e => getOptionsCrmMembers(e, this.props.staffId)}
									placeholder="Search"
									onChange={e => this.handleSelect(e, props.original.p_id)}
									className={'custom_select'}
								/>
							</div>
						</span>
					</div>
				)
			}

			//  { Header: "End Date:", accessor: "updated", headerStyle: { border: "0px solid #fff" } },
		];
		let assigned = typeof this.state.staff_detail.assigned_participant == 'undefined' ? [] : this.state.staff_detail.assigned_participant;

		return (
			<div className={this.props.showModal ? 'customModal show' : 'customModal'}>
				<div className="custom-modal-dialog Information_modal task_modal">
					<form id="updateDisableStaff">
						<div className="custom-modal-header by-1">
							<div className="Modal_title">Disable participant intake user</div>

							<i className="icon icon-close1-ie Modal_close_i" onClick={this.props.closeModal}></i>
						</div>
						<div className="custom-modal-body w-80 mx-auto">
							<div className="row">
								<div className="col-md-12 my-3 mt-5">
									<h4 className="my-0" style={{ fontWeight: 'normal' }}>
										Disable <b>{this.state.staff_detail.FullName}</b> account:
									</h4>
								</div>
							</div>
							<div className="row">
								<div className="Dis_R_Mdiv">
									<div className="col-md-6">
										<div className="row d-flex">
											<div className="col-md-8 px-0">
												<div className="w-100 select_custom_101">
													<Select
														id="disableAccount"
														name="disableAccount"
														options={staffDisableAccount(0)}
														required={true}
														simpleValue={true}
														searchable={true}
														clearable={false}
														placeholder="Filter by: Unread"
														onChange={e => this.setState({ disableAccount: e })}
														value={this.state.disableAccount}
														className={('custom_select', 'default_validation')}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="row">
								<div className="col-md-12 my-3 mt-5">
									<h4 className="my-0">Account Allocations:</h4>
									<label className="title_input pl-0">Where would you like to Re-allocate all recruiters current assigned Incomplete participants to:</label>
								</div>
							</div>

							<div className="row">
								<div className="Dis_R_Mdiv">
									<div className="col-md-6">
										<div className="row d-flex">
											<div className="col-md-8 px-0">
												<div className="w-100 select_custom_101">
													<Select
														name="allocatedAccount"
														id="allocatedAccount"
														options={staffAllocatedAccount(0)}
														required={true}
														simpleValue={true}
														searchable={true}
														clearable={false}
														placeholder="Filter by: Unread"
														onChange={e =>
															this.setState({ allocatedAccount: e }, () => (e == 2 ? this.setState({ custom_search: true }) : this.setState({ custom_search: false })), this.get_staff_detail(e))
														}
														value={this.state.allocatedAccount}
														className={('custom_select', 'default_validation')}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="row">
								<div className="col-md-12">
									<h4 className="my-2 mt-5">Allocate Participant to:</h4>
									<ul style={{ marginLeft: '10px' }}>
										<li style={{ listStyle: 'disc', marginLeft: '10px' }}>Staff user will not be changed for tasks, whose due date is passed.</li>
										<li style={{ listStyle: 'disc', marginLeft: '10px' }}>Staff user will not be changed for Parked or Rejected participants.</li>
									</ul>
								</div>
								<div className="col-md-12 mb-3">
									{this.state.custom_search ? (
										<div className="search_icons_right modify_select">
											<Select.Async
												cache={false}
												clearable={false}
												name="account_allocated_staff_to"
												id="account_allocated_staff_to"
												required={true}
												value={this.state.account_allocated_staff_to ? this.state.account_allocated_staff_to : ''}
												loadOptions={e => getOptionsCrmMembers(e, this.props.staffId)}
												placeholder="Search"
												onChange={e => this.setState({ account_allocated_staff_to: e })}
												className={('custom_select', 'default_validation')}
											/>
										</div>
									) : (
										''
									)}
								</div>
								<div className="col-md-12 Tab_Overflow__ Req-Disable-Recruiter-tBL">
									<div className="listing_table PL_site th_txt_center__ odd_even_tBL  H-Set_tBL Remove-Margin-tBL">
										<ReactTable
											columns={columns}
											data={assigned}
											pageSize={assigned != undefined ? assigned.length : 0}
											minRows={4}
											showPagination={false}
											className="-striped -highlight"
											TbodyComponent={CustomTbodyComponent}
											style={{
												minHeight: '250px',
												maxHeight: '320px'
											}}
										/>
									</div>
								</div>
							</div>

							<div className="row pt-5">
								<div className="col-md-12 pb-4">
									<div className="border-das_line"></div>
								</div>
								<div className="col-md-12 my-3">
									<h4 className="my-0">Add Relevant Notes:</h4>
								</div>
								<div className="col-md-12 task_N_txt">
									<textarea
										className="form-control"
										value={this.state.staff_disable_note}
										onChange={e => handleChangeChkboxInput(this, e)}
										name="staff_disable_note"
										data-rule-required="true"
										wrap="soft"></textarea>
								</div>
							</div>
						</div>

						<div className="custom-modal-footer bt-1 mt-5 px-0 pb-4">
							<div className="row d-flex justify-content-end">
								<div className="col-md-3">
									<button disabled={this.state.loading} onClick={this.submit} className="btn-1 w-100">
										Disable
									</button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

export default DisableStaff;
