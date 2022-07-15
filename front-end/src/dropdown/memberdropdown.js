/*All dropdown of member area*/

export function memberQualViewBy() {
   return [{value:'Current',label:'Current'},{value:'Archive',label:'Archive'}];
}

export function memberWorkAreaViewBy() {
   return [{value:'Current',label:'Current'},{value:'Archive',label:'Archive'}];
}

export function memberAboutViewBy() {
   return [{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}];
}

export function memberAboutTravelDistance() {
   return [{value:'10',label:'10km and over'},{value:'20',label:'20km and over'},{value:'30',label:'30km and over'}];
}

export function memberAdditionalTravelDistance() {
   return [{value:'5',label:'5km'},{value:'10',label:'10km'},{value:'20',label:'20km'},{value:'30',label:'30km'}];
}

export function memberYesNo() {
   return [{value:1,label:'Yes'},{value:2,label:'No'}];
}

export function memberWorkArea(givenKey) {
	var myArray = [{value:1,label:'Client & NDIS Services'},{value:2,label:'Out Of Home Care'},{value:3,label:'Disability Accommodation'},{value:4,label:'Casual Staff Service — Disability'},{value:5,label:'Casual Staff Service —  Welfare'},{value:6,label:'Private'}];

	if(givenKey == 0)
		return myArray;
		else
		return myArray[givenKey-1].label;
}

export function memberPositionAward(givenKey) {
	var myArray = [{value:1,label:'Social & Community Services'},{value:2,label:'Crisis Accommodation'}];

	if(givenKey == 0)
		return myArray;
		else
		return myArray[givenKey-1].label;
}

export function memberWorkAreaStatus(givenKey) {
	var myArray = [{value:1,label:'Yes'},{value:2,label:'Yes, But not Preferred'},{value:3,label:'No, At Members Request'},{value:4,label:'No, Inexperienced'},{value:5,label:'No'},{value:6,label:'No, HCM Request'}];

	if(givenKey == 0)
   		return myArray;
	else
		return myArray[givenKey-1].label;
}

export function memberAward(givenKey) {
	var myArray = [{value:1,label:'Paypoint 1'},{value:2,label:'Paypoint 2'},{value:3,label:'Paypoint 3'},{value:4,label:'Paypoint 4'},{value:5,label:'Paypoint 5'}];

	if(givenKey == 0)
   		return myArray;
	else
		return myArray[givenKey-1].label;
}

export function memberPositionLevel(givenKey) {
	var myArray = [{value:1,label:'Level 1'},{value:2,label:'Level 2'},{value:3,label:'Level 3'},{value:4,label:'Level 4'},{value:5,label:'Level 5'}];

	if(givenKey == 0)
   		return myArray;
	else
		return myArray[givenKey-1].label;
}

export function memberSpecialAgreementViewBy() {
   return [{value:'Current',label:'Current'},{value:'Expire',label:'Expire'}];
}

export function shifRosterOption(givenKey) {
	var myArray =  [{value: 'shifts', label: 'Shifts'}, {value: 'contact_history', label: 'Contact History'}, {value: 'overview', label: 'Overview'}];
	if(givenKey == 0)
   		return myArray;
	else
		return myArray[givenKey-1].label;
}

export function statusOptionMember() {
   return [{value: 1, label: 'Active'}, {value: 0, label: 'Inactive'}];
}

export function contactHistoryViewBy() {
	var myArray =  [{value: '', label: 'Select'},{value: 'iMail', label: 'iMail'}, {value: 'phone_call', label: 'Phone Call'}];
	return myArray;		
}

export function MonthDropdown(givenKey) {
	var myArray =  [
					{value: '1', label: 'Jan'}, {value: '2', label: 'Feb'}, {value: '3', label: 'March'},
					{value: '4', label: 'Apr'}, {value: '5', label: 'May'}, {value: '6', label: 'Jun'},
					{value: '7', label: 'July'}, {value: '8', label: 'Aug'}, {value: '9', label: 'Sep'},
					{value: '10', label: 'Oct'}, {value: '11', label: 'Nov'}, {value: '12', label: 'Dec'}
					];
	if(givenKey == 0)
   		return myArray;
	else
		return myArray[givenKey-1].label;
}

export function dashboardFilterByType(givenKey, clearable) {
    var myArray =  [];
    
    if(clearable == 'clearable'){
        myArray =  [{value: '', label: 'Filter by type'}]
    }
    
	myArray =  [...myArray,
    {value: 1, label: 'Members with Shift'},
    {value: 2, label: 'Members without any Shift'},
    {value: 3, label: 'Members who have open FMS'},
    {value: 4, label: 'Members with a Special agreement(s)'},
    {value: 5, label: 'Members with a Availability'},
    {value: 6, label: 'Members with Quals expiring in the next 30 Days'},
];
	if(givenKey == 0)
   		return myArray;
	else
		return myArray[givenKey-1].label;
}

export function ViewByFms(key) {
   var option = [{value: '2', label: 'Ongoing'}, {value: '1', label: 'Completed'}]; //{value: '0,1', label: 'View By'},

   if(key){
        var index = option.findIndex(x => x.value == key)
        return option[index].value;
    }else {
        return option;
    }
}

export function qualsTitleDrpDwn(givenKey) {

   var option = [{value: '1', label: 'Police Check'},{value: '2', label: 'WWCC'}, {value: '3', label: 'First Aid'},{value: '4', label: 'Fire Safety'},{value: '5', label: 'CPR'},{value: '6', label: 'Anaphylaxis'}];

	if(givenKey == 0)
   		return option;
	else
		return option[givenKey-1].label;
}

export function memberRelationDropdown(key, clearable) {
    var interpreter = []
    if(clearable == 'clearable'){
        interpreter = [{value: '', label: 'Select'}] 
     }
     interpreter = [...interpreter, {value: 'Brother', label: 'Brother'},
        {value: 'Sister', label: 'Sister'},
        {value: 'Father', label: 'Father'},
        {value: 'Mother', label: 'Mother'},
        {value: 'Guardian', label: 'Guardian'}]
    
    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function memberPreferContactDropdown(key) {
    var interpreter = [{value: 1, label: 'Phone'}, {value: 2, label: 'Email'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function contactHistoryLogContactType(givenKey) {
  var option = [{value: '-1', label: 'All'},{value: '1', label: 'Email'},{value: '2', label: 'Phone'}, {value: '3', label: 'SMS'},{value: '4', label: 'Chat'},{value: '5', label: 'Fax'}];
  if(givenKey == 0)
      return option;
  else
    return option[givenKey-1].label;
}

export function hour(givenKey) {
  var myArray = [{value:1,label:'1'},{value:2,label:'2'},{value:3,label:'3'},{value:4,label:'4'},{value:5,label:'5'},{value:6,label:'6'}];

  if(givenKey == 0)
    return myArray;
    else
    return myArray[givenKey-1].label;
}