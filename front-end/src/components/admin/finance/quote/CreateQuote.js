import React, { Component } from 'react';
import { connect } from 'react-redux'
import CreateQuoteDetails from './CreateQuoteDetails'
import CreateNewCustomer from './CreateNewCustomer'
import jQuery from "jquery";
import {BASE_URL} from 'config.js';
import { postData,  googleAddressFillOnState, handleShareholderNameChange, handleAddShareholder, handleRemoveShareholder, toastMessageShow } from 'service/common.js';
import { BrowserRouter as Router,  Redirect } from "react-router-dom";

class CreateQuote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            secondStage: false,
            items: [{funding_type: '', line_ItemId: {}}],
            manual_item: [{item_name: '', description: '', cost: '', charge_by: ''}],
            add_manual_item: false,
            user_details: [],
            old_items: [],
            old_manual_item: [],
        }
    }
    
    googleAddressFillOnState = (fieldValue) => {
        googleAddressFillOnState(this, fieldValue)
    }
    
    stateChange = (key, value) => {
        var state = {};
        if(key === 'add_manual_item' && value){
            state['manual_item'] = [{item_name: '', description: '', cost: '', charge_by: ''}];
        }
        if(key === 'add_manual_item' && !value){
            state['manual_item'] = [{item_name: '', description: '', cost: '', charge_by: ''}];
        }
        if(key === 'suburb'){
            state['suburb'] = value.value;
            state['postcode'] = value.postcode;
        }else{
            state[key] = value;
        }
        this.setState(state);
    }
    
    handleChange = (e) => {
        var state = {};
        state[e.target.name] = (e.target.type === 'checkbox' ? e.target.checked : e.target.value);
        this.setState(state);
    }
    
    submitNewCustomer = (e) => {
        e.preventDefault();
        
        var validate = jQuery("#create_customer").validate({ /* */ });
        if (jQuery("#create_customer").valid()) {
            var user_details = {email: this.state.email, phone: this.state.primary_phone, address: this.state.street + ', ' + this.state.suburb + ', ' + this.state.state + ', ' + this.state.postcode, 
                profile_image: BASE_URL+'mediaShowProfile/p/0/0/MQ%3D%3D',
                name: this.state.name,
            }
            this.setState({ secondStage: true, user_details: user_details });
        }
    }
    
    componentDidMount() {
        this.setState(this.props.match.params);
        this.getUserTypeAndState();
    }
   
    getUserTypeAndState=()=>{
        this.setState({ loading: true });
            postData('finance/FinanceQuoteManagement/get_finance_quote_option_and_details', this.props.match.params).then((result) => {           
            if (result.status) {
                
                this.setState(JSON.parse(JSON.stringify(result.data)));
                if(result.data.manual_item || result.data.items){
                    this.setState({old_items : JSON.parse(JSON.stringify(result.data.items)), old_manual_item: JSON.parse(JSON.stringify(result.data.manual_item))});
                }
            }else{
                this.setState({redirectTrue: true})
            }
            this.setState({ loading: false });
        });
    }
    
    handleShareholderNameChange = (stateName, index, fieldName, value, e) => {
        handleShareholderNameChange(this, stateName, index, fieldName, value, e);
    }
    
    handleAddShareholder = ( e, stateName, object_array) => {
        handleAddShareholder(this, e, stateName, object_array);
    }
    
    handleRemoveShareholder = (e, index, stateName) => {
        handleRemoveShareholder(this, e, index, stateName)
    }
    
    submitQuote = (e, type) => {
        e.preventDefault();

        var validator = jQuery("#create_quote").validate({ ignore: [],});
        var customValidate = true;
        if(jQuery("#create_quote").valid()){
            var customValidate = this.checkLineItemPrice();
        }
        if (jQuery("#create_quote").valid() && customValidate) {
            this.setState({ loading: true, save_type: type}, () => {
                postData('finance/FinanceQuoteManagement/create_update_quote', this.state).then((result) => {
                    if (result.status) {
                        toastMessageShow('Save Quote successfully', 's');
                        this.setState({ redirectTrue: true });
                    } else {
                        toastMessageShow(result.error, 'e');
                    }
                    this.setState({ loading: false });
                });
            })
        }else{
             validator.focusInvalid();
        }
       
    }
    
    checkLineItemPrice = () => {
        var ret = true;
        this.state.items.map((val, index) => {
           var price = this.calculateItemCost(val);
           if(price == 0){
                toastMessageShow("Please remove or change price type those line item whose price is Zero", "e");
                ret = false
            }
        })
        
        return ret;
    }
    
    dynamic_button_name_on_update = () => {
        var status = false;
        if(this.state.quoteId){
            var ret = this.dynamic_button_on_update();
            status = ret;
        }
        
        return status;
    }
    
    
    dynamic_button_on_update = () => {
        var return_status = false;
        var old_manual_item = JSON.parse(JSON.stringify(this.state.old_manual_item));
        var manual_item = JSON.parse(JSON.stringify(this.state.manual_item));
        var remaining_manual_item = JSON.parse(JSON.stringify(this.state.manual_item));

        var old_items = JSON.parse(JSON.stringify(this.state.old_items));
        var items = JSON.parse(JSON.stringify(this.state.items));
        var remaining_item = JSON.parse(JSON.stringify(this.state.items));

        if (old_items.length > 0) {
            old_items.map((val, index) => {
                var item_exist = (typeof items[index] !== "undefined" ) ? true : false;
               
                if (!item_exist) {
                    return_status =  true;
                }
                else if (item_exist && (val['price_type']) != (items[index]['price_type'])) {
                    return_status = true;
                }else if (item_exist && (val['line_ItemId']['value']) != (items[index]['line_ItemId']['value'])) {
                    return_status = true;
                }
                else if (item_exist && (val['qty']) != (items[index]['qty'])) {
                    return_status = true;
                } else {
                    remaining_item.pop();
                    //remaining_item = remaining_item.filter((s, sidx) => index !== sidx);
                }
            })
        }

        if (remaining_item.length > 0) {
            return_status = true;
        }
        
        if(return_status){
            return return_status;
        }
          

        if (old_manual_item.length) {
            old_manual_item.map((val, index) => {
                var item_exist = (typeof manual_item[index]) ? true : false;

                if (!item_exist) {
                    return_status = true;
                }
                else if (item_exist && parseFloat(val['cost']) != parseFloat(manual_item[index]['cost'])) {
                    return_status = true;
                } else {
                    remaining_manual_item.pop();
//                    remaining_manual_item = remaining_manual_item.filter((s, sidx) => index !== sidx);
                }
          
            })
        } 

        if (remaining_manual_item.length > 0) {
            return_status = true;
        }
         
        return return_status;
    }
     
    calculateItemCost = (data) => {
       if(data.line_ItemId && data.qty && data.price_type){ 
           if(data.price_type == 1){
              var cost = (parseInt(data.qty)) * parseFloat(data.line_ItemId.upper_price_limit)
           }else if(data.price_type == 2){
               var cost = (parseInt(data.qty)) * parseFloat(data.line_ItemId.national_price_limit)
           }else{
              var cost = (parseInt(data.qty)) * parseFloat(data.line_ItemId.national_very_price_limit)
           }
       }
       else{
          var cost = 0;
       }
       
       return cost;
    }
    
    
    render() {
        return (
            <React.Fragment>
                 {this.state.redirectTrue ? 
                 <Redirect to={'/admin/finance/quote_dashboard'} />: ''}
            
                {this.state.user_type == 6 && !this.state.secondStage? 
                <CreateNewCustomer {...this.props}  {...this.state} 
                submitNewCustomer={this.submitNewCustomer}
                handleChange={this.handleChange}
                googleAddressFillOnState={this.googleAddressFillOnState}
                stateChange={this.stateChange}
                />:
                <CreateQuoteDetails {...this.props}
                {...this.state} 
                stateChange={this.stateChange}
                handleChange={this.handleChange}
                handleShareholderNameChange={this.handleShareholderNameChange}
                handleAddShareholder={this.handleAddShareholder}
                handleRemoveShareholder={this.handleRemoveShareholder}
                submitQuote={this.submitQuote}
                calculateItemCost={this.calculateItemCost}
                dynamic_button_name_on_update={this.dynamic_button_name_on_update}
                />}
            </React.Fragment>
        );
    }

}

const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispach) => {
    return {

    }
}


export default connect(mapStateToProps, mapDispatchtoProps)(CreateQuote);