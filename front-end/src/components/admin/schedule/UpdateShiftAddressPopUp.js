import React, { Component } from 'react';
import { postData, handleAddShareholder, handleRemoveShareholder, getOptionsSuburb, googleAddressFill, selectFilterOptions, onKeyPressPrevent } from 'service/common.js';
import Select, { Async } from 'react-select-plus';
import Modal from 'react-bootstrap/lib/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jQuery from "jquery";
import { connect } from 'react-redux'
import { ToastUndo } from 'service/ToastUndo.js'
import ReactGoogleAutocomplete from "components/admin/externl_component/ReactGoogleAutocomplete";


class UpdateShiftAddressPopUp extends Component {
    constructor(props) {

        super(props);
        this.state = {
            shift_location: []
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState(newProps);
        this.setState({ shift_location: newProps.shift_location });


    }
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        this.setState(state);
    }



    handleShareholderNameChange = (obj, stateName, index, fieldName, value) => {
        var state = {};
        var tempField = {};
        var List = obj.state[stateName];
        List[index][fieldName] = value

        if (fieldName == 'state') {
            List[index]['suburb'] = ''
            List[index]['postal'] = ''
        }

        if (fieldName == 'suburb' && value) {
            List[index]['postal'] = value.postcode
            List[index][fieldName] = value.value;
        }

        state[stateName] = List;
        obj.setState(state);
    }

    componentDidMount() {
        postData('common/Common/get_state', {}).then((result) => {
            if (result.status) {
                var details = result.data
                this.setState({ stateList: details });
            }
        });
    }


    onSubmit = (e) => {
        e.preventDefault()
        jQuery('#updateAddress').validate({ ignore: [] });
        if (jQuery('#updateAddress').valid()) {

            this.setState({ loading: true }, () => {
                postData('schedule/ScheduleDashboard/update_shift_address', this.state).then((result) => {
                    if (result.status) {
                        toast.success(<ToastUndo message={'Shift address update successfully'} showType={'s'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.props.closeModel('address', true)
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false })
                });
            });
        }
    }

    render() {
        return (
            <Modal
                className="Modal fade Modal_A Modal_B Schedule_Module update_shift_location_MODAL "
                show={this.props.modal_show}
                onHide={this.handleHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Body>
                    <form id="updateAddress" onKeyPress={onKeyPressPrevent}>
                        <div className="dis_cell-1">
                            <div className="text text-left by-1 Popup_h_er_1"><span>Updating Shift Location:</span>
                                <a onClick={() => this.props.closeModel('address', false)} className="close_i"><i className="icon icon-cross-icons"></i></a>
                            </div>

                            {this.state.shift_location.map((address, index) => (
                                <div className="P_25_T row AL_flex" key={index + 1}>
                                    <div className="col-md-4">
                                        <label>Location: </label>
                                        <span className="required">
                                            {/* <input type="text" data-rule-required="true" onChange={(e) => handleShareholderNameChange(this, 'shift_location', index, 'address', e.target.value)} value={address.address} name="location" placeholder="Unit #/Street #, Street Name" /> */}
                                            <ReactGoogleAutocomplete className="add_input" key={index + 1} maxlength="100"
                                                required={true}
                                                data-msg-required="Add address"
                                                name={"address_primary" + index}
                                                onPlaceSelected={(place) => googleAddressFill(this, index, 'shift_location', 'street', place)}
                                                types={['address']}
                                                returntype={'array'}
                                                value={address.street || ''}
                                                onChange={(evt) => this.handleShareholderNameChange(this, 'shift_location', index, 'street', evt.target.value)}
                                                onKeyDown={(evt) => this.handleShareholderNameChange(this, 'shift_location', index, 'street', evt.target.value)}
                                                componentRestrictions={{ country: "au" }}
                                            />
                                        </span>
                                    </div>
                                    <div className="col-md-2">
                                        <label>State: </label>
                                        <Select
                                            simpleValue={true}
                                            name="form-field-name"
                                            value="one"
                                            options={this.state.stateList}
                                            clearable={false}
                                            searchable={false}
                                            onChange={(e) => this.handleShareholderNameChange(this, 'shift_location', index, 'state', e)}
                                            value={address.state || ''}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label>Suburb:</label>
                                        <span className="required">
                                            <Select.Async clearable={false}
                                                className="default_validation" required={true}
                                                value={{ label: address.suburb, value: address.suburb }}
                                                cache={false}
                                                filterOptions={selectFilterOptions}
                                                disabled={(address.state) ? false : true}
                                                loadOptions={(e) => getOptionsSuburb(e, address.state)}
                                                onChange={(evt) => this.handleShareholderNameChange(this, 'shift_location', index, 'suburb', evt)}
                                                placeholder="Please Select" />
                                        </span>
                                    </div>
                                    <div className="col-md-2">
                                        <label>Postcode: </label>
                                        <span className="required">
                                            <input type="text" maxlength="6" name="postal" required className="csForm_control bl_bor" onChange={(e) => this.handleShareholderNameChange(this, 'shift_location', index, 'postal', e.target.value)} value={address.postal || ''} />
                                        </span>
                                    </div>

                                    {(this.props.shift_location.length > 1) ?
                                        <div className="col-md-1">

                                            {index > 0 ? <span className="button_plus__" onClick={(e) => handleRemoveShareholder(this, e, index, 'shift_location')}>
                                                <i className="icon icon-decrease-icon Add-2-2" ></i>
                                            </span> : (this.state.shift_location.length == 3) ? '' :
                                                    <span onClick={(e) => handleAddShareholder(this, e, 'shift_location', address)} className="button_plus__"><i className="icon icon-add-icons Add-2-1"></i></span>}

                                        </div>
                                        : ''}
                                </div>
                            ))}



                            <div className="row d-flex justify-content-end mt-5">
                                <div className="col-md-3 P_15_T">
                                    <button disabled={this.state.loading} onClick={this.onSubmit} className="but_submit">Save Changes</button>
                                </div>
                            </div>

                        </div>
                    </form>
                </Modal.Body>
            </Modal>

        )
    }
}

const mapStateToProps = state => ({

})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(UpdateShiftAddressPopUp)