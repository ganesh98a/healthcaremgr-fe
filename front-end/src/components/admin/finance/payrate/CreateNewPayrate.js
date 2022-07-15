import React, { Component } from 'react';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import { connect } from 'react-redux'
import { postData, toastMessageShow, handleChangeSelectDatepicker, handleAddShareholder, handleChangeChkboxInput, onlyNumberAllow, handleDateChangeRaw, handleShareholderNameChange  } from 'service/common.js';
import moment from 'moment-timezone';
import jQuery from "jquery";
import BlockUi from 'react-block-ui';
import { Redirect, Link } from 'react-router-dom';
import { REGULAR_EXPRESSION_FOR_NUMBERS } from '../../../../config.js';

import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";
import { customHeading } from '../../../../service/CustomContentLoader.js';

class CreateNewPayrate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            is_save: false,
            pageTitle: 'Create New Payrate',
            payrateCategory: [],
            payrateType: [],
            payrateClassificationLevel: [],
            payrateClassificationPoint: [],
            addtitonalPaypointRatetype: [],
            payPoints: [{ 'increasedBy': '', 'dollarValue': '','rate':'' }],
            isAllowance: false,
            defaultPrefixTitle: 'Payrate',
            defaultSubHeading: 'Paypoints',
            buttonLevel:'Add New Payrate',
            mode:'Add',
            autoGenerateName:''
        }
    }

    componentDidMount() {
        this.getPayrateDropDownValues();
        if (this.props.match.params.id){
            this.setState({buttonLevel:'Update Payrate',payrate_id:this.props.match.params.id,mode:'edit',loading:true},()=>{
                this.getPayrateData();  
            })  
        }
    }

    getPayrateDropDownValues = () => {
        postData('finance/FinancePayrate/get_payrate_dropdown_value', {}).then((result) => {
            if (result.status) {
                this.setState({
                    payrateCategory: result.data.payrateCategory,
                    payrateType: result.data.payrateType,
                    payrateClassificationLevel: result.data.payrateClassificationLevel,
                    payrateClassificationPoint: result.data.payrateClassificationPoint,
                    addtitonalPaypointRatetype: result.data.addtitonalPaypointRatetype,
                });
            }
        });
    }

    getPayrateData = () => {
        postData('finance/FinancePayrate/get_payrate_data', {id:this.props.match.params.id}).then((result) => {
            if (result.status) {
                this.setState(result.data,()=>{
                    this.setState({pageTitle:result.data.page_title,loading:false}) 
                });
            }else{
                this.setState({ loading: false });
                toastMessageShow('Invalid request', 'e');
                this.setState({ is_save: true }, () => { return <Redirect to='admin/finance/payrates_dashboard/' /> });
            }
        });
    }

    handleSavePayRate = (e) => {
        e.preventDefault();
        var validator = jQuery("#payrate_form").validate({ ignore: [] });
        //if(!this.state.loading){
        if (!this.state.loading && jQuery("#payrate_form").valid()) {
            this.setState({ loading: true }, () => {
                postData('finance/FinancePayrate/add_payrate', this.state).then((result) => {
                    if (result.status) {
                        this.setState({ loading: false });
                        toastMessageShow(result.msg, 's');
                        this.setState({ is_save: true }, () => { return <Redirect to='admin/finance/payrates_dashboard/' /> });
                    } else {
                        toastMessageShow(result.msg, 'e');
                        this.setState({ loading: false });
                    }
                });
            });
        }
        else {
            validator.focusInvalid();
        }
    }

    handleChangeCategory(selectedOption, fieldname) {
        var state = {};
        state[fieldname] = selectedOption;
        if (selectedOption == 5) {
            state['isAllowance'] = true;
            state['defaultPrefixTitle'] = 'Allowance';
            state['defaultSubHeading'] = 'Rate';
        }else{
            state['isAllowance'] = false;
        }
        this.setState(state);
    }

    handleShareholderNameChange (obj, stateName, index, fieldName, value, e) {
        if (e) {
            e.preventDefault();
        }

        if(e!=undefined && e.target.pattern)
        {
            const re = eval(e.target.pattern);
            if (e.target.value!='' && !re.test(e.target.value)) {
                return;
            }
        }
        var state = {};
        var List = obj.state[stateName];
        
        if(fieldName == 'dollarValue' && index>0)
        {  
            var baseDollarValue = List[0]['dollarValue'];
            /*if(baseDollarValue > 0){
                let per = this.calculatePercentage(baseDollarValue,value);
                List[index]['increasedBy'] = Math.ceil(per);
            }else{ 
                List[index]['increasedBy'] = 0;
            }*/
        }
        
        List[index][fieldName] = value
        state[stateName] = Object.assign([], List);

        if(fieldName == 'rate' )
        { 
            this.updatePaypointRateType(value,true);
        }
        obj.setState(state, () => {
            if(fieldName == 'dollarValue' && index == 0){
                //this.updateBaseDollarValue();
            }
        });
    }

    handleRemoveShareholder(obj, e, index, stateName) {
        e.preventDefault();
        var state = {};
        var List = obj.state[stateName];
        if(List[index].rate)
        {
            this.updatePaypointRateType(List[index].rate,false);
        }
        state[stateName] = List.filter((s, sidx) => index !== sidx);
        obj.setState(state);
    }

    updatePaypointRateType=(value,action)=>{
        var state = {};
        var List = this.state.addtitonalPaypointRatetype;
        var index = List.findIndex(x => x.value == value);
        List[index]['disabled'] = action
        //JSON.parse(List);
        state['addtitonalPaypointRatetype'] = List;
        this.setState(state); 
    }

    generateName=()=>{
        var name = '';
        if(
           this.state.category && (this.state.payrateCategory).length > 0 && 
           this.state.level_number && (this.state.payrateClassificationLevel).length > 0 && 
           this.state.paypoint && (this.state.payrateClassificationPoint).length > 0 &&
           this.state.payrateType && (this.state.payrateType).length > 0 
           )
        {
            this.state.payrateCategory.map((valueCat, idx) => {
                if(valueCat.value == this.state.category)
                name =  valueCat.label;
            })

            this.state.payrateType.map((valueType, idx) => {
                if(valueType.value == this.state.type)
                name = name+', '+valueType.label;
            })

            this.state.payrateClassificationLevel.map((valueLabel, idx) => {
                if(valueLabel.value == this.state.level_number)
                name = name+', '+valueLabel.label;
            })

            this.state.payrateClassificationPoint.map((valuePp, idx) => {
                if(valuePp.value == this.state.paypoint)
                name = name+', '+valuePp.label;
            })
        }
        return name;
    }

    updateBaseDollarValue=()=>{
        var List = this.state.payPoints; 
        var baseDollarValue = List[0]['dollarValue'];
        if(baseDollarValue > 0)
        {    
            this.state.payPoints.map((innerVal, idx) => {
                if(idx == 0)
                    List[idx]['increasedBy'] = 0;
                else
                    List[idx]['increasedBy'] = this.calculatePercentage(baseDollarValue,innerVal.dollarValue);
            })
            this.setState({payPoints:List});
        }
    }

    calculatePercentage=(baseDllarValue,currentValue)=>{
        //Growth = [(This Field – Base Field) / Base Field] 100"
        return ((currentValue - baseDllarValue)/baseDllarValue) * 100;
    }

    render() {
        return (
            <React.Fragment>
                {(this.state.is_save) ? <Redirect to='/admin/finance/payrates_dashboard' /> : ''}
                <BlockUi tag="div" blocking={this.state.loading}>
                    <div className="row">
                        <div className="col-lg-12">
                        <div className=" py-4">
                        <span className="back_arrow">
                                <Link to="/admin/finance/payrates_dashboard"><span className="icon icon-back1-ie"></span></Link>
                                </span>
                            </div>

                            <div className="by-1">
                                <div className="row d-flex  py-4">
                                    <div className="col-lg-8">
                                        <ReactPlaceholder defaultValue={''} showLoadingAnimation ={true}  customPlaceholder={ customHeading(80)} ready={!this.state.loading}>
                                            <div className="h-h1 color">{this.state.pageTitle} </div>
                                        </ReactPlaceholder>
                                    </div>
                                    <div className="col-lg-4 d-flex align-self-center">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row d-flex justify-content-center mt-5">
                        <form id="payrate_form" method="post" autoComplete="off" className="w-100">
                            <div className="col-lg-12">
                                <div className="Bg_F_moule">
                                    <div className="row d-flex justify-content-center">
                                        <div className="col-lg-8">
                                            <div className="row mt-5  d-flex">
                                                <div className="col-lg-8 col-sm-8 align-self-end">
                                                    <div className="sLT_gray left left-aRRow">
                                                        <Select
                                                            required={true} simpleValue={true}
                                                            className="custom_select default_validation"
                                                            options={this.state.payrateCategory}
                                                            onChange={(e) => this.handleChangeCategory(e, 'category')}
                                                            value={this.state.category}
                                                            clearable={false}
                                                            searchable={false}
                                                            placeholder={'Payrate Category:[Please select]'}
                                                            inputRenderer={(props) => <input type="text" name="payrate_category" {...props} readOnly />}
                                                        />                                                       
                                                    </div>
                                                </div>

                                                {(!this.state.isAllowance)?
                                                <div className="col-lg-4 col-sm-4">
                                                    <div className="sLT_gray left left-aRRow">
                                                        <Select
                                                            required={true} simpleValue={true}
                                                            className="custom_select default_validation"
                                                            options={this.state.payrateType}
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e, 'type')}
                                                            value={this.state.type}
                                                            clearable={false}
                                                            searchable={false}
                                                            placeholder={'Payrate Type:[Please select]'}
                                                            inputRenderer={(props) => <input type="text" name="payrate_type" {...props} readOnly />}
                                                        />
                                                    </div>
                                                </div>:
                                                <div className="col-lg-4 col-sm-4">
                                                <label className="label_2_1_1">Allowance Name</label>
                                                <input type="text" placeholder="Placeholder..." name="allowance_name" onChange={(e) => handleChangeChkboxInput(this, e)} value={this.state.allowance_name || ''}/>
                                            </div>}
                                            </div>

                                            {(!this.state.isAllowance) ?
                                                <div className="row mt-5">
                                                    <div className="col-lg-4 col-sm-4">
                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                required={true} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.payrateClassificationLevel}
                                                                onChange={(e) => handleChangeSelectDatepicker(this, e, 'level_number')}
                                                                value={this.state.level_number}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder={'Level Number:[Please select]'}
                                                                inputRenderer={(props) => <input name="payrate_classfication_level" {...props} readOnly />}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4 col-sm-4">
                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                required={true} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.payrateClassificationPoint}
                                                                onChange={(e) => handleChangeSelectDatepicker(this,e, 'paypoint')}
                                                                value={this.state.paypoint}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder={'Paypoint:[Please select]'}
                                                                inputRenderer={(props) => <input type="text" name="payrate_classfication_paypoint" {...props} readOnly />}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4 col-sm-4">
                                                        <input type="text" disabled placeholder="Auto Generate Name" value={this.generateName()}/>
                                                    
                                                    </div>
                                                </div> : ''}

                                            <div className="row mt-5  d-flex">
                                                <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">{this.state.defaultPrefixTitle} Start Date</label>
                                                    <span className={`cust_date_picker `}>
                                                    <DatePicker autoComplete={'off'} placeholderText={"00/00/0000"} className="text-center" selected={this.state.start_date ? moment(this.state.start_date) : null} name="start_date" required dateFormat="dd-MM-yyyy" onChange={(e) => handleChangeSelectDatepicker(this, e, 'start_date')} required={true} onChangeRaw={handleDateChangeRaw} maxDate={(this.state.end_date) ? moment(this.state.end_date) : null} minDate={moment()}
                                                    /></span>
                                                </div>
                                                <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">{this.state.defaultPrefixTitle} End Date</label>
                                                    <span className={`cust_date_picker `}>
                                                    <DatePicker autoComplete={'off'} placeholderText={"00/00/0000"} className="text-center" selected={this.state.end_date ? moment(this.state.end_date) : null} name="end_date" required dateFormat="dd-MM-yyyy" onChange={(e) => handleChangeSelectDatepicker(this, e, 'end_date')} required={true} onChangeRaw={handleDateChangeRaw} 
                                                        minDate={(this.state.start_date && this.state.start_date != '0000/00/00') ? moment(this.state.start_date) : moment()}
                                                    /></span>
                                                </div>

                                                <div className="col-lg-4 col-sm-4 align-self-end">
                                                <label className="label_2_1_1"></label>
                                                    <div className="sLT_gray left left-aRRow pb-3">
                                                        <strong>Status:  
                                                            {
                                                            (this.state.payrate_status == 1) ?
                                                            (<span className="text-success">Active</span>)
                                                            : ((this.state.payrate_status == 2) ?
                                                            (<span className="text-danger">Archive</span>)
                                                            : (this.state.payrate_status == 0) ?
                                                            (<span className="text-warning">Inactive</span>)
                                                            : '')
                                                            }
                                                            </strong>
                                                    </div>
                                                </div>
                                                
                                            </div>

                                            <div className="row mt-5  d-flex">
                                                <div className="col-lg-12">
                                                    <div className="pAY_heading_01 by-1">
                                                        <div className="tXT_01">{this.state.defaultSubHeading}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {(!this.state.isAllowance) ?
                                                this.state.payPoints.map((value, idx) => (
                                                    <div className="row mt-5  d-flex" key={idx}>
                                                        <div className="col-lg-6 col-sm-6">                                                    
                                                            <label className="label_2_1_1">Rate Type</label>
                                                             <Select
                                                                name={'rate' + idx}
                                                                required={true} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.addtitonalPaypointRatetype}
                                                                onChange={(e) => this.handleShareholderNameChange(this,'payPoints',idx,'rate',e)}
                                                                value={value.rate}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder=''
                                                                //disabled={(idx == 0)?true:false}
                                                                inputRenderer={(props) => <input type="text" type="text" name="addtitonal_paypoint_ratetype" {...props} readOnly />}
                                                            />                                                                                                            
                                                        </div>
                                                        <div className="col-lg-6 col-sm-6">
                                                            <div className="row d-flex">

                                                                <div className="col-lg-5 col-sm-5">
                                                                    <label className="label_2_1_1">Dollar Value</label>
                                                                    <input type="text" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} required name={'dollarValue' + idx} value={value.dollarValue} onChange={(e) => this.handleShareholderNameChange(this, 'payPoints', idx, 'dollarValue', e.target.value, e)} min="1" max="9999"/>
                                                                </div>

                                                                <div className="col-lg-5 col-sm-5 align-self-end pb-1">
                                                                    {/*<div className="btn cmn-btn1 btn-block vw_btn">Increase by {value.increasedBy} %</div>*/}
                                                                    <label className="label_2_1_1">Increase by</label>
                                                                    <input type="text" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} required name={'increasedBy' + idx} value={value.increasedBy} onChange={(e) => this.handleShareholderNameChange(this, 'payPoints', idx, 'increasedBy', e.target.value, e)}/>
                                                                </div>

                                                                <div className="col-lg-2 col-sm-2 align-self-center">
                                                                    <label className="label_2_1_1">&nbsp;</label>
                                                                    <div>
                                                                        {idx > 0 ? <span onClick={(e) => this.handleRemoveShareholder(this, e, idx, 'payPoints')} className="icon icon-remove2-ie aDDitional_bTN_F1">
                                                                        </span> : (this.state.payPoints.length == 15) ? '' : <span className="icon icon-add2-ie aDDitional_bTN_F0" onClick={(e) => handleAddShareholder(this, e, 'payPoints', value)}>
                                                                        </span>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                )) :
                                                <React.Fragment >
                                                     <div className="row mt-5  d-flex">
                                                <div className="col-lg-6 col-sm-6">
                                                                                                                        
                                                            <label className="label_2_1_1">Rate Type</label>
                                                             <Select
                                                                name={'allowance_rate_type'}
                                                                required={true} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.addtitonalPaypointRatetype}
                                                                onChange={(e) => handleChangeSelectDatepicker(this,e,'allowance_rate_type')}
                                                                value={this.state.allowance_rate_type}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder=''
                                                                //disabled={(idx == 0)?true:false}
                                                                inputRenderer={(props) => <input type="text" type="text" name="allowance_rate_type" {...props} readOnly />}
                                                            />                                                        
                                                                                                                    
                                                        </div>

                                               
                                                    <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">Allowance rate</label>
                                                    <input type="text" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} required name={'allowance_rate'}  value={this.state.allowance_rate || ''} onChange={(e)=> handleChangeChkboxInput(this,e)}/>
                                                    </div>
                                                </div>
                                                </React.Fragment>
                                            }

                                            <div className="row mt-5  d-flex">
                                                <div className="col-lg-12 col-sm-12">
                                                    <div className="pAY_heading_01 by-1">
                                                        <div className="tXT_01">Comment</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-5  d-flex">
                                                <div className="col-lg-12">
                                                    <textarea className="w-100" name="comments" onChange={(e) => handleChangeChkboxInput(this, e)} value={(this.state.comments)?this.state.comments:''}></textarea>
                                                </div>
                                            </div>

                                            <div className="row mt-5  d-flex justify-content-end">
                                                <div className="col-lg-3">
                                                    <a onClick={this.handleSavePayRate} className="C_NeW_BtN w-100">
                                                        <span>{this.state.buttonLevel}</span><i className="icon icon icon-add-icons"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </BlockUi>
            </React.Fragment >
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


export default connect(mapStateToProps, mapDispatchtoProps)(CreateNewPayrate);