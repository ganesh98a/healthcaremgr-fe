/*All dropdown of FMS area*/
export function fmsTestDropDown() {
   return [{value:'Current',label:'Current'},{value:'Expire',label:'Expire'}];
}

export function againstCategory() {
  return [
         {value:1,label:'Member of Public'},
         {value:2,label:'HCM Member'},
         {value:3,label:'HCM Participant'},
         {value:4,label:'HCM (General)'},
         {value:5,label:'HCM User/Admin'},
         {value:6,label:'HCM Organisation'},
         {value:7,label:'HCM Site'},
         ];
}

export function initiatorCategory() {
   return [
        {value:5,label:'Member of Public'},
        {value:1,label:'HCM Member'},
        {value:2,label:'HCM Participant'},
        {value:6,label:'HCM (General)'},
        {value:7,label:'HCM User/Admin'},
        {value:3,label:'HCM Organisation'},
        {value:8,label:'HCM Site'},
        ];
}

export function addressCategory(key) {
    var interpreter = [{value: 1, label: 'Own Home'}, {value: 2, label: 'Family Home'}, {value: 3, label: "Mum's House"}, {value: 4, label: "Dad's House"}, {value: 5, label: "Relative's House"}, {value: 6, label: "Friend's House"}, {value: 7, label: "HCM House"}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function fmsSearchByDropDown() {
  return [{value:'-1',label:'All'},{value:'0',label:'New'},{value:'1',label:'Ongoing'},{value:'2',label:'Completed'}];
}

export function respondDropDown() {
  return [{value:'Phone',label:'Phone'},{value:'Email',label:'Email'},{value:'Imail',label:'Imail'}];
}

export function monitorDropDown() {
  return [{value:'Logs',label:'Logs'},{value:'Analysis',label:'Analysis'}];
}

export function statusOptionFms(key) {
   var option = [{value: '0', label: 'Ongoing'}, {value: '1', label: 'Completed'}];

   if(key){
        var index = option.findIndex(x => x.value == key)
        //alert(option[index].value);
        return option[index].value;
    }else {
        return option;
    }
}

 export function caseDetailPrimaryCategory(key) {
   /* var interpreter = [{value: 1, label: 'Please Select'}, {value: 2, label: 'Grievence'}, {value: 3, label: "Staff Performance"}, {value: 4, label: "Serious Misconduct"}, {value: 5, label: "Investigation"}, {value: 6, label: "Cat 1 Investigation"}, {value: 7, label: "Own Alert"}, {value: 8, label: "Client Mismatch"}, {value: 9, label: "Client Survey Response"}, {value: 10, label: "Now Works For Organisation"}, {value: 11, label: "Cat 1 Incident"}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }*/
}


