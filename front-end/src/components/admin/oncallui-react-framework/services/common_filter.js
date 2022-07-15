import moment from "moment-timezone";
import {  toastMessageShow } from './common.js';


export function validateFilterLogic(filter_logic, filter_operand, filter_arr) {


    let validated_data= {
        error_msg : '',
        isValidFilter: true
    };
     // to catch the extra value added error logic value
     filter_operand.forEach(check => {
        if (check > filter_arr.length) {
            validated_data['error_msg'] = 'Some filter conditions are defined but not referenced in your filter logic.'
            validated_data['isValidFilter'] = false;
        }
    })
    // to catch the missed logic value
    if(validated_data.isValidFilter){
        for(let i=1; i<=filter_arr.length; i++){
            if(!filter_operand.includes(i)){
                validated_data['error_msg'] = 'Some filter conditions are defined but not referenced in your filter logic.'
                validated_data['isValidFilter'] = false;
            }
        }
    }
   // to catch the operand and operator length
    if (validated_data.isValidFilter) {
        let logic_str = filter_logic.split(' ');
        let get_operator = [];

        logic_str.forEach(check => {
            check = check.toLowerCase() ? check.toLowerCase() : check;
            if (check == 'or' || check == 'and') {
                get_operator.push(check);
            }
        })
        if (get_operator.length == filter_operand.length || get_operator.length >= filter_operand.length) {
            validated_data['error_msg'] = 'Your filter is missing right operand to AND or OR.';
            validated_data['isValidFilter'] = false;
        }
    }

    return validated_data;
}


export function  removeParanthesisAndCheckOperandOperator(filter_logic_data,key,entry_length){
    let filter_str = '';
    let ch_str = '';
    let hasNumber = /\d/;
    let count = 0;
    let changeOperand = '';
    // remove paranthesis
        filter_logic_data.forEach((filter_data) => {
            if(filter_data.includes('(') || filter_data.includes(')')){
                filter_data = filter_data.replace('(','').trim();
                filter_data = filter_data.replace(')','').trim();
                filter_str = filter_str + filter_data;
            } else{
                filter_str = filter_str + filter_data;
            }
        })
    // change lower case and find the prefix/sufix operator

        let index = filter_str.toLowerCase().indexOf(key+1);

        if (index != filter_str.length - 1) {
            let getANDOperator = filter_str.substring(index, index+5);
            let getOROperator = filter_str.substring(index, index+4);
            if (getANDOperator.toLowerCase().includes('and')) {
                filter_str = filter_str.replace(getANDOperator, '');
            } else {
                filter_str = filter_str.replace(getOROperator, '');
            }
        } else {
            let getANDOperator = filter_str.substring(index-5, index+1);
            let getOROperator = filter_str.substring(index-4,index+1);
            if (getANDOperator.toLowerCase().includes('and')) {
                filter_str = filter_str.replace(getANDOperator, '');
            } else {
                filter_str = filter_str.replace(getOROperator, '');
            }
        }
        // remove the unwanted white space and shift the operand and operator
        changeOperand = filter_str.replace(/\s\s+/g, ' ');
        changeOperand = changeOperand.split('');
            changeOperand.forEach((filter_data) => {
                if (hasNumber.test(filter_data)) {
                    count = count + 1
                    ch_str = ch_str + count;
                } else {
                    ch_str = ch_str + filter_data;
                }
            })

    return ch_str;
}

// Return the default filter logic if the logic is incorrect
export function returnDefaultLogic(filter_str, key) {
    let ch_str = filter_str;
    if (key == 5) {
        ch_str = '1 AND 2 AND 3 AND 4 AND 5';
    } else if (key == 4) {
        ch_str = '1 AND 2 AND 3 AND 4';
    } else if (key == 3) {
        ch_str = '1 AND 2 AND 3';
    } else if (key == 2) {
        ch_str = '1 AND 2';
    } else if (key == 1) {
        ch_str = '1';
    }
    return ch_str;
}

// validating the removed paranthesis and shifted operand/operator logic
export function validateLogic(filter_str , allEntries, returnDefault = true){
    var hasNumber = /\d/;
    let isValidFilterLogic = false;
    let filter_operand_length=0;
    let filter_operand = [];
    let validated_data = [];
    let ch_str = filter_str;
        if (hasNumber.test(filter_str) && allEntries) {
            filter_operand = filter_str.match(/\d+/g).map(Number)
            filter_operand_length = filter_str ? filter_operand.length : 0;
            validated_data = validateFilterLogic(filter_str, filter_operand, allEntries);
            if (!returnDefault) {
                return validated_data;
            }
            isValidFilterLogic = validated_data.isValidFilter;
            if(!isValidFilterLogic)  {
                ch_str = returnDefaultLogic(ch_str , allEntries.length-1)
            }
        } else if (filter_str.trim().length != 0 && allEntries) {
            ch_str = returnDefaultLogic(ch_str , allEntries.length-1)
        }
         return ch_str ;
}

// Retunr the day start and end date
export function getStartAndEndDate(selected_val) {
    var curr = new Date;
    var start_end_date = '';
    var start_date = '';
    var end_date = '';
    if (selected_val == 'this week') {
        start_date = new Date(curr.setDate(curr.getDate() - curr.getDay()));
        end_date = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
        start_end_date = moment(start_date).format('YYYY-MM-DD') +',' + moment(end_date).format('YYYY-MM-DD');
    }else if(selected_val == 'last week'){
        start_date = new Date(curr.setDate(curr.getDate() - curr.getDay() - 1));
        end_date = new Date(curr.setDate(start_date.getDate() - 6));
        start_end_date = moment(end_date).format('YYYY-MM-DD')+ ',' + moment(start_date).format('YYYY-MM-DD');
    } else if (selected_val == 'next week') {
        start_date = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
        end_date = new Date(curr.setDate(curr.getDate() - curr.getDay() + 13));
        start_end_date = moment(start_date).format('YYYY-MM-DD')+ ',' + moment(end_date).format('YYYY-MM-DD');
    } else if (selected_val == 'this month') {
        start_date = new Date(curr.getFullYear(), curr.getMonth(), 1);
        end_date = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        start_end_date = moment(start_date).format('YYYY-MM-DD')+ ',' + moment(end_date).format('YYYY-MM-DD');
    } else if (selected_val == 'last month') {
        start_date = new Date(curr.getFullYear(), (curr.getMonth() - 1), 1);
        end_date = new Date(curr.getFullYear(), (curr.getMonth() - 1) + 1, 0);
        start_end_date = moment(start_date).format('YYYY-MM-DD')+ ',' + moment(end_date).format('YYYY-MM-DD');
    } else if (selected_val == 'next month') {
        start_date = new Date(curr.getFullYear(), (curr.getMonth() + 1), 1);
        end_date = new Date(curr.getFullYear(), (curr.getMonth() + 1) + 1, 0);
        start_end_date = moment(start_date).format('YYYY-MM-DD')+ ',' + moment(end_date).format('YYYY-MM-DD');
    } else if (selected_val == 'today') {
        start_end_date = moment(curr).format('YYYY-MM-DD')+ ',' + moment(curr).format('YYYY-MM-DD');
    } else if (selected_val == 'yesterday') {
        start_date = new Date(curr.setDate(curr.getDate()-1));
        start_end_date = moment(start_date).format('YYYY-MM-DD')+ ',' + moment(start_date).format('YYYY-MM-DD');
    } else if (selected_val == 'tomorrow') {
        start_date = new Date(curr.setDate(curr.getDate()+1));
        start_end_date = moment(start_date).format('YYYY-MM-DD')+ ',' + moment(start_date).format('YYYY-MM-DD');
    } else if (selected_val == 'this year') {
        start_date = curr.getFullYear()+'-01-01'+' 00:00:00';
        end_date = curr.getFullYear()+'-12-31'+' 23:59:59';
        start_end_date = start_date+','+end_date;
    } else if (selected_val == 'last year') {
        start_date = (curr.getFullYear()-1)+'-01/01'+' 00:00:00';
        end_date = (curr.getFullYear()-1)+'-12-31'+' 23:59:59';
        start_end_date = start_date+','+end_date;
    } else if (selected_val == 'next year') {
        start_date = (curr.getFullYear()+1)+'-01-01'+' 00:00:00';
        end_date = (curr.getFullYear()+1)+'-12-31'+' 23:59:59';
        start_end_date = start_date+','+end_date;
    }
    return start_end_date;

}

export function validateTheFilterString(filterStr){
    let filterData =  false;
    if(filterStr=='this week' || filterStr=='last week' || filterStr=='this month'
    || filterStr=='last month'|| filterStr=='yesterday'|| filterStr=='today'
    || filterStr=='this year'|| filterStr=='last year'){
        filterData = true;
    }
    return filterData;
}
// To get default pin details by id
export function get_list_view_default_pinned(obj, result) {
    return new Promise((resolve, reject) => {
        if (result.status) {
            if(result.data){
                 let filter_data = result.data.filter_data ? JSON.parse(result.data.filter_data): [];
                 if(filter_data.length>0){
                     filter_data.forEach((fData) => {
                         if(fData.selected_date_range!=''){
                          fData['selected_date_range']='10/10/2020,12/10/2020'
                         }
                      })
                 }
                 if (result.data.pinned_id) {
                    window.location.hash = result.data.pinned_id;
                 }
                 obj.setState({
                 filter_title: result.data.label,
                 filter_logic: result.data.filter_logic ? result.data.filter_logic : filter_data ? returnDefaultLogic(result.data.filter_logic, filter_data.length) : '',
                 default_filter_logic: result.data.filter_logic ? result.data.filter_logic : filter_data ? returnDefaultLogic(result.data.filter_logic, filter_data.length) : '',
                 selectedfilval: filter_data,
                 filter_list_id: result.data.value,
                 selected_filter_data: result.data,
                 checkdefault: result.data.value,
                 showFilter: true,
                 pinned_id: result.data.pinned_id,
                 list_id: result.data.list_id,
                 user_view_by: result.data.user_view_by,
                 is_own_list: result.isOwnList,
                 showaddfiltbtn: filter_data ? filter_data.length >= 5 ? false : true : true,
                 dateErr: '',
                 list_control_data: result.data
             },() => {
                 sessionStorage.setItem('filterarray', JSON.stringify(filter_data));
             });


         }else{
            obj.setState({
                 filter_title: 'All '+obj.props.page_name,
                 filter_logic: '',
                 selectedfilval: [],
                 filter_list_id: '',
                 selected_filter_data: '',
                 checkdefault: 'all',
                 showFilter: false,
                 pinned_id: 0,
                 list_control_data: []
             },() => {
                 });
         }
         } else {
             toastMessageShow(result.error, "e");
         }
    });
}
// To get task details by id
export function get_list_view_related_type(obj, result, pageName) {
    return new Promise((resolve, reject) => {
        if(result.data){
            if (result.status ) {
                let data = []
                data = [{ label: 'LIST VIEW CONTROLS', type: 'header' }]
    
    
                obj.setState({ is_any_data_pinned: false });
                if (result.data.list_control_option.length > 0) {
                    result.data.list_control_option.forEach((resultData) => {
                        if (resultData.pinned_id) {
                            resultData.label = resultData.label + ' (Pinned list)';
                            obj.setState({ is_any_data_pinned: true });
                        }
                        data.push(resultData);
                    });
                }
    
                if (!obj.state.is_any_data_pinned) {
                    data.splice(1, 0, { label: 'All ' + pageName + ' (Pinned list)', value: 'all' });
                } else {
                    data.splice(1, 0, { label: 'All ' + pageName, value: 'all' });
                }
                obj.setState({ list_control_option: data }, () => {
                });
            } else {
                toastMessageShow('something went wrong', "e");
            }
        }
       
    });
}
// To get task details by id
export function get_list_view_by_id(obj, result, event){
    return new Promise((resolve, reject) => {
        if (result.status) {
            if (event == 'update' || event == 'onChange') {
                let filter_data = result.data.filter_data ? JSON.parse(result.data.filter_data): [];
                if(filter_data.length>0){
                    filter_data.forEach((fData) => {
                        if(fData.selected_date_range!=''){
                         fData['selected_date_range']=getStartAndEndDate(fData.select_filter_value);
                        }
                     })
                }

                obj.setState({
                    filter_title: result.data.label,
                    filter_logic: result.data.filter_logic ? result.data.filter_logic : filter_data ? returnDefaultLogic(result.data.filter_logic, filter_data.length) : '',
                    default_filter_logic: result.data.filter_logic ? result.data.filter_logic : filter_data ? returnDefaultLogic(result.data.filter_logic, filter_data.length) : '',
                    selectedfilval: filter_data,
                    filter_list_id: result.data.value,
                    selected_filter_data: result.data,
                    checkdefault: result.data.value,
                    pinned_id: result.data.pinned_id,
                    user_view_by: result.data.user_view_by,
                    showFilter: true,
                    is_own_list: result.isOwnList,
                    showaddfiltbtn: filter_data ? filter_data.length >= 5 ? false : true : true,
                    dateErr: '',
                    list_control_data: result.data
                }, () => {
                    sessionStorage.setItem('filterarray', JSON.stringify(filter_data));
                });
            } else {
                obj.setState({
                    showFilter: false,
                    showselectedfilters: false,
                    showselectfilters: false,
                    showaddfiltbtn:true,
                    list_control_data: []
                }, () => {
                });
            }
        }
});
}