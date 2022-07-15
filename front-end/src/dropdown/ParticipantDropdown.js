/* 
 * this file for participant
 * In which dropdown function
 */

export function listParticipantDropdown() {
    return [
        {label: 'Filter by Type', value: ''},
        {label: 'Participants with Shifts', value: 'with_shift'},
        {label: 'Participants without Shifts', value: 'without_shift'},
        {label: 'Participants with funding greater than', value: 'founding_greather_than'},
        {label: 'Participants with funding less than', value: 'founding_less_than'},
        {label: 'Participants with less than 30 days left on their plan', value: 'less_than_30days_left_plan'},
        {label: 'Participants with more than 30 days left on their plan', value: 'more_than_30days_left_plan'},
        {label: 'Participants with Portal Access', value: 'portal_access'},
        {label: 'Participants without Portal Access', value: 'without_portal_access'},
        {label: 'New Participants within the last 30 days', value: 'new_paticipant_in_30days'},
        {label: 'Participants below 18 years of age', value: 'below_age_18year'},
        {label: 'Participants with NDIS funding', value: 'with_ndis_funding'},
        {label: 'Participants without NDIS funding', value: 'without_ndis_funding'},
        {label: 'Participants with Private funding', value: 'private_funding'},
        {label: 'Participants with open FMS', value: 'open_fms'},
    ]
}
export function listViewSitesOption() {
    return  [
        {value: 2, label: 'Current'},
        {value: 1, label: 'Archive'},
    ]
}
export function interpretertDropdown(key, clearable) {
    var interpreter = []
    if(clearable == 'clearable'){
        interpreter = [{value: '', label: 'Select'}]
    }
    
    var interpreter = [...interpreter, {value: 1, label: 'Simultaneous Interpreting'},
        {value: 2, label: 'Consecutive Interpreting'},
        {value: 3, label: 'On-Demand Phone Interpreting'}
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}

export function ethnicityDropdown(key) {

    var interpreter = [
        {value: 1, label: 'African'}, 
        {value: 2, label: 'Asian'},
        {value: 3, label: 'Caucasian'},
        {value: 4, label: 'European'},
        {value: 5, label: 'Indigenous Australian'},
        {value: 6, label: 'Islander'},
        {value: 7, label: 'Latin-American'},
        {value: 8, label: 'Middle-Eastern'},
        {value: 9, label: 'N/A'},
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}
export function HearingOption(key) {
    var interpreter = [{value: 1, label: 'Yes'}, {value: 2, label: 'No'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else{
        return interpreter;
    }

}

export function religiousDropdown(key) {

    var interpreter = [
        {value: 1, label: 'Anglican'}, 
        {value: 2, label: 'Atheist'}, 
        {value: 3, label: 'Buddhist'}, 
        {value: 4, label: 'Catholic'},
        {value: 5, label: 'Other Christian'},
        {value: 6, label: 'Hindi'},
        {value: 7, label: 'Islamic'},
        {value: 8, label: 'Judaism'},
        {value: 9, label: 'Sikhism'},
        {value: 10, label: 'N/A'},
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}

export function prefterLanguageDropdown(key) {
    var interpreter = [
        {value: 1, label: 'English'}, 
        {value: 2, label: 'Chinese'},
        {value: 3, label: 'Spanish'},
        {value: 4, label: 'Hindi'},
        {value: 5, label: 'Arabic'},
        {value: 6, label: 'Portuguese'},
        {value: 7, label: 'Bengali'},
        {value: 8, label: 'Russian'},
        {value: 9, label: 'Japanese'},
        {value: 10, label: 'Punjabi'},
        {value: 11, label: 'Other'},
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}

export function cognitionDropdown(key) {

    var interpreter = [{value: 1, label: 'Very Good'}, {value: 2, label: 'Good'}, {value: 3, label: 'Fair'}, {value: 4, label: 'Poor'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}


export function communicationDropdown(key) {

    var interpreter = [{value: 1, label: 'Verbal'}, {value: 2, label: 'Non-Verbal'},{value: 3, label: 'Aids'}, {value: 4, label: 'Other'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function genderDropdown(key) {
    var interpreter = [{value: 1, label: 'Male'}, {value: 2, label: 'Female'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function preferContactDropdown(key) {
    var interpreter = [{value: 1, label: 'Phone'}, {value: 2, label: 'Email'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function sitCategoryListDropdown(key) {
    var interpreter = [
        {value: 1, label: 'Own Home'}, 
        {value: 2, label: 'Family Home'}, 
        {value: 3, label: "Mum's House"}, 
        {value: 4, label: "Dad's House"}, 
        {value: 5, label: "Relative's House"}, 
        {value: 6, label: "Friend's House"}, 
    //    {value: 7, label: "HCM House"}
    ]

    if (key > 0 && interpreter[key - 1]) {
        
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }else{
        return '';
    }
}

export function ocDepartmentDropdown(key) {
    var interpreter = [
        {value: 1, label: 'NDIS'}, 
        {value: 2, label: 'Out of Home Care'}, 
        {value: 3, label: "Disability Accommodation Servies"}
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function relationDropdown(key, clearable) {
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

export function listViewDocsOption(key) {
    var interpreter = [{value: 'alphabetical', label: 'Alphabetical'},
        {value: 'newest_first', label: 'Newest First'},
        {value: 'older_first', label: 'Oldest First'}]

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function listFiltergDocsOption(key) {
    var interpreter = [{value: 'current', label: 'Current Docs'},
        {value: 'archive', label: 'Archive Docs'}]

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function getGoalsClassNane(key, status) {
    var interpreter = [{value: 0, label: 'Refused_to_Participate', text: 'Refused to Participate'},
        {value: 1, label: 'Hand_over_hand_physical_Assistance', text: 'Hand over hand physical Assistance'},
        {value: 2, label: 'Partial_Physical_Assistance', text: 'Partial Physical Assistance'},
        {value: 3, label: 'Model', text: 'Model'},
        {value: 4, label: 'Full_Assistance_Direct_Verbal', text: 'Full Assistance Direct Verbal'},
        {value: 5, label: 'Indirect_Verbal', text: 'Indirect Verbal'},
        {value: 6, label: 'Gesture', text: 'Gesture'},
        {value: 7, label: 'Natural_CueIndependen', text: 'Natural CueIndependen'}
    ]



    if (key && status) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else if (key && !status) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].text;
    }
}

export function getOptionViewGoals(key) {
    var interpreter = [
        {value:'active', label: 'Active'},
        {value:'upcoming', label: 'Upcoming'}
    ]
    return interpreter;  
}

export function getAboriginalOrTSI() {
    var interpreter = [
        {value: 1, label: 'No'},
        {value: 2, label: 'Yes'},
        {value: 3, label: 'Unknown'},
        {value: 4, label: 'Prefer Not to Say'}
    ]
    return interpreter;  
}

export function LivingSituationOption() {

    var interpreter = [

        {value: 1, label: 'Own Home / living alone'},
        {value: 2, label: 'Own Home / living with family'},
        {value: 3, label: 'Living in supported accommodation'},
        {value: 4, label: 'Homeless'},
        {value: 5, label: 'Temporary (living with friends, family or other accom)'},
        {value: 6, label: 'At risk (eg. eviction, behind in rent, family violence)'},
        {value: 7, label: 'Other'},
    ]
    return interpreter;  
}

export function docsServiceOption(optionType) {
    let data;
    if(optionType == 'service_docs'){
        data = [
            {value: 2, label: 'Option 2'},
            {value: 1, label: 'Option 1'},
        ];
    }else if(optionType == 'SIL_docs'){
        data = [
            {value: 2, label: 'Option 3'},
            {value: 1, label: 'Option 4'},
        ];
    }
    return  data;
}
export function docsSiLOption() {
    return  [
        {value: 2, label: 'Option 2'},
        {value: 1, label: 'Option 1'},
    ]
}

