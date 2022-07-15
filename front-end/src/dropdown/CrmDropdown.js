/*
 * this file for crmparticipant
 * In which dropdown function
 */

export function listParticipantDropdown() {
    return [
        { label: 'Select', value: '' },
        { label: 'Participants with Shifts', value: 'with_shift' },
        { label: 'Participants without Shifts', value: 'without_shift' },
        { label: 'Participants with funding greater than', value: 'founding_greather_than' },
        { label: 'Participants with funding less than', value: 'founding_less_than' },
        { label: 'Participants with less than 30 days left on their plan', value: 'less_than_30days_left_plan' },
        { label: 'Participants with more than 30 days left on their plan', value: 'more_than_30days_left_plan' },
        { label: 'Participants with Portal Access', value: 'portal_access' },
        { label: 'Participants without Portal Access', value: 'without_portal_access' },
        { label: 'New Participants within the last 30 days', value: 'new_paticipant_in_30days' },
        { label: 'Incomplete Participants', value: 'incomplete_participant' },
        { label: 'Participants below 18 years of age', value: 'below_age_18year' },
        { label: 'Participants with NDIS funding', value: 'with_ndis_funding' },
        { label: 'Participants without NDIS funding', value: 'without_ndis_funding' },
        { label: 'Participants with Private funding', value: 'private_funding' },
        { label: 'Participants with open FMS', value: 'open_fms' },
    ]
}
export function listViewSitesOption() {
    return [
        { value: 2, label: 'Current' },
        { value: 1, label: 'Archive' },
    ]
}
export function interpretertDropdown(key, clearable) {
    var interpreter = []
    if (clearable == 'clearable') {
        interpreter = [{ value: '', label: 'Select' }]
    }

    var interpreter = [...interpreter, { value: 1, label: 'Simultaneous Interpreting' },
    { value: 2, label: 'Consecutive Interpreting' },
    { value: 3, label: 'On-Demand Phone Interpreting' }
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}



export function ethnicityDropdown2(keys = null, values = '', other = '') {

    var interpreter = [
        { value: 1, label: 'African' },
        { value: 2, label: 'Asian' },
        { value: 3, label: 'Caucasian' },
        { value: 4, label: 'European' },
        { value: 5, label: 'Indigenous Australian' },
        { value: 6, label: 'Islander' },
        { value: 7, label: 'Latin-American' },
        { value: 8, label: 'Middle-Eastern' }
    ]

    let data = '';
    if (values != '' && values != null) {
        values.forEach(function (k) {
            if (k > 0) {
                if (k == 10) {
                    data += other;
                    data += ' ';
                }
                else {
                    data += interpreter[k - 1].label;
                    data += ' ';
                }
            }
        });
        return data;
    } else {
        if (keys != null) {
            keys = (keys == '') ? [] : keys;
            keys.forEach(function (k) {
                if (k > 0) {
                    interpreter[k - 1].checked = true;
                }
            });
        }
        return interpreter;
    }

}

export function religiousDropdown2(keys = null, values = '', other = '') {

    var interpreter = [
        { value: 1, label: 'Anglican' },
        { value: 2, label: 'Atheist' },
        { value: 3, label: 'Buddhist' },
        { value: 4, label: 'Catholic' },
        { value: 5, label: 'Other Christian' },
        { value: 6, label: 'Hindi' },
        { value: 7, label: 'Islamic' },
        { value: 8, label: 'Judaism' },
        { value: 9, label: 'Sikhism' },
    ]

    let data = '';
    if (values != '' && values != null) {
        values.forEach(function (k) {
            if (k > 0) {
                if (k == 10) {
                    data += other;
                    data += ' ';
                }
                else {
                    data += interpreter[k - 1].label;
                    data += ' ';
                }
            }
        });
        return data;
    } else {
        if (keys != null) {
            keys = (keys == '') ? [] : keys;
            keys.forEach(function (k) {
                if (k > 0) {
                    interpreter[k - 1].checked = true;
                }
            });
        }
        return interpreter;
    }

}

export function ethnicityDropdown(key) {

    var interpreter = [
        { value: 1, label: 'African' },
        { value: 2, label: 'Asian' },
        { value: 3, label: 'Caucasian' },
        { value: 4, label: 'European' },
        { value: 5, label: 'Indigenous Australian' },
        { value: 6, label: 'Islander' },
        { value: 7, label: 'Latin-American' },
        { value: 8, label: 'Middle-Eastern' }
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }


}
export function HearingOption(key) {
    var interpreter = [{ value: 1, label: 'Yes' }, { value: 2, label: 'No' }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else {
        return interpreter;
    }

}

export function religiousDropdown(key) {

    var interpreter = [
        { value: 1, label: 'Anglican' },
        { value: 2, label: 'Atheist' },
        { value: 3, label: 'Buddhist' },
        { value: 4, label: 'Catholic' },
        { value: 5, label: 'Other Christian' },
        { value: 6, label: 'Hindi' },
        { value: 7, label: 'Islamic' },
        { value: 8, label: 'Judaism' },
        { value: 9, label: 'Sikhism' },
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}

export function prefterLanguageDropdown(key) {
    var interpreter = [
        { value: 1, label: 'English' },
        { value: 2, label: 'Chinese' },
        { value: 3, label: 'Spanish' },
        { value: 4, label: 'Hindi' },
        { value: 5, label: 'Arabic' },
        { value: 6, label: 'Portuguese' },
        { value: 7, label: 'Bengali' },
        { value: 8, label: 'Russian' },
        { value: 9, label: 'Japanese' },
        { value: 10, label: 'Punjabi' },
        { value: 11, label: 'Other' },
    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}

export function cognitionDropdown(key) {

    var interpreter = [{ value: 1, label: 'Very Good' }, { value: 2, label: 'Good' }, { value: 3, label: 'Fair' }, { value: 4, label: 'Poor' }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}


export function communicationDropdown(key = null, values = '') {

    var interpreter = [{ value: 1, label: 'Verbal' }, { value: 2, label: 'Non-Verbal' }, { value: 3, label: 'Aids' }, { value: 4, label: 'Other' }]
    let data = '';
    if (values != '' && values != null) {
        if (values > 0) {
            data += interpreter[values - 1].label;
            data += ' ';
        }
        return data;
    } else {
        if (key > 0 && key != null) {
            return interpreter[key - 1].label;
        } else if (key == 0) {
            return interpreter;
        }
    }
}

export function genderDropdown(key) {
    var interpreter = [{ value: 1, label: 'Male' }, { value: 2, label: 'Female' }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function preferContactDropdown(key) {
    var interpreter = [{ value: 1, label: 'Phone' }, { value: 2, label: 'Email' }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function sitCategoryListDropdown(key) {
    var interpreter = [{ value: 1, label: 'Own Home' }, { value: 2, label: 'Family Home' }, { value: 3, label: "Mum's House" }, { value: 4, label: "Dad's House" }, { value: 5, label: "Relative's House" }, { value: 6, label: "Friend's House" }, { value: 7, label: "HCM House" }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function ocDepartmentDropdown(key) {
    var interpreter = [{ value: 1, label: 'NDIS' }, { value: 2, label: 'Out of Home Care' }, { value: 3, label: "Disability Accommodation Servies" }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function relationDropdown(key, clearable) {
    var interpreter = []
    if (clearable == 'clearable') {
        interpreter = [{ value: '', label: 'Select' }]
    }
    interpreter = [...interpreter, { value: 'Primary_carer', label: 'Primary carer' },
    { value: 'Participant', label: 'Participant' },
    { value: 'Legal_guardian', label: 'Legal guardian' },
    { value: 'Support coordinator', label: 'Support coordinator' },
    { value: 'Case_manager', label: 'Case manager' },
    { value: 'Family_member', label: 'Family member' },
    { value: 'Other', label: 'Other' }

    ]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}
export function CognitiveLevel(key, clearable) {
    var interpreter = []
    if (clearable == 'clearable') {
        interpreter = [{ value: '', label: 'Select' }]
    }
    interpreter = [...interpreter, { value: 'Very Good', label: 'Very Good' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}



export function listViewDocsOption(key) {
    var interpreter = [{ value: 'alphabetical', label: 'Alphabetical' },
    { value: 'newest_first', label: 'Newest First' },
    { value: 'older_first', label: 'Oldest First' },
    { value: 'archived', label: 'Archived' }]

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function getGoalsClassNane(key, status) {
    var interpreter = [{ value: 0, label: 'Refused_to_Participate', text: 'Refused to Participate' },
    { value: 1, label: 'Hand_over_hand_physical_Assistance', text: 'Hand over hand physical Assistance' },
    { value: 2, label: 'Partial_Physical_Assistance', text: 'Partial Physical Assistance' },
    { value: 3, label: 'Model', text: 'Model' },
    { value: 4, label: 'Full_Assistance_Direct_Verbal', text: 'Full Assistance Direct Verbal' },
    { value: 5, label: 'Indirect_Verbal', text: 'Indirect Verbal' },
    { value: 6, label: 'Gesture', text: 'Gesture' },
    { value: 7, label: 'Natural_CueIndependen', text: 'Natural CueIndependen' }
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
        { value: 'active', label: 'Active' },
        { value: 'upcoming', label: 'Upcoming' }
    ]
    return interpreter;
}

export function getAboriginalOrTSI() {
    var interpreter = [
        { value: 1, label: 'No' },
        { value: 2, label: 'Yes' },
        { value: 3, label: 'Unknown' },
        { value: 4, label: 'Prefer Not to Say' }
    ]
    return interpreter;
}

export function LivingSituationOption() {

    var interpreter = [

        { value: 1, label: 'Own Home / living alone' },
        { value: 2, label: 'Own Home / living with family' },
        { value: 3, label: 'Living in supported accommodation' },
        { value: 4, label: 'Homeless' },
        { value: 5, label: 'Temporary (living with friends, family or other accom)' },
        { value: 6, label: 'At risk (eg. eviction, behind in rent, family violence)' },
        { value: 7, label: 'Other' },
    ]
    return interpreter;
}

export function staffDisableAccount(key) {
    var disableActStatus = [
        // { value: '', label: 'Select' },
        { value: '1', label: 'Temp Pause User Account' },
        { value: '2', label: 'Permanently Disable' },
        { value: '3', label: 'Schedule Pause or Disable' }
    ];

    if (key > 0) {
        return disableActStatus[key - 1].label;
    } else if (key == 0) {
        return disableActStatus;
    }

}

export function staffAllocatedAccount(key) {
    var allocatedActStatus = [
        // { value: '', label: 'Select' },
        { value: '1', label: 'Auto Allocation' },
        { value: '2', label: 'Custom Selection (Search)' }
    ];

    if (key > 0) {
        return allocatedActStatus[key - 1].label;
    } else if (key == 0) {
        return allocatedActStatus;
    }

}


export function bookingstatusDropDown(key) {

    var bookingstatusDropDown = [

        { value: '4', label: 'In-Progress' },
        { value: '2', label: 'Parked' },
        { value: '3', label: 'Successful' }
    ];

    if (key > 0) {
        return bookingstatusDropDown[key - 1].label;
    } else if (key == 0) {
        return bookingstatusDropDown;
    }


}
export function rejectedStatusDropDown(key) {

    var bookingstatusDropDown = [
        { value: '5', label: 'Rejected' }
    ];

    if (key > 0) {
        return bookingstatusDropDown[key - 1].label;
    } else if (key == 0) {
        return bookingstatusDropDown;
    }


}

export function nextActionDropDown(key) {

    var nextActionDropDown = [
        { value: '', label: 'Select Action' },
        { value: '1', label: 'Phone Screening' },
        { value: '2', label: 'Call' },
    ];
    if (key > 0) {
        return nextActionDropDown[key - 1].label;
    } else if (key == 0) {
        return nextActionDropDown;
    }


}
export function AssistanceCheckbox(keys = null, values = '', other = '') {
    var AssistanceCheckbox = [
        { label: 'Independent', value: '1', checked: false },
        { value: '2', label: 'Assist', checked: false },
        { value: '3', label: 'Walking Stick', checked: false },
        { value: '4', label: 'Walking Frame', checked: false },
        { value: '5', label: 'Shower/ Bath', checked: false },
        { value: '6', label: 'Toileting', checked: false },
        { value: '7', label: 'Grooming', checked: false },
        { value: '8', label: 'Dressing', checked: false },
        { value: '9', label: 'Manual Hoist', checked: false },
        { value: '10', label: 'Other', checked: false }
    ];
    let data = '';
    if (values != '' && values != null) {
        values.forEach(function (k) {
            if (k > 0) {
                if (k == 10) {
                    data += other;
                    data += ' ';
                }
                else {
                    data += AssistanceCheckbox[k - 1].label;
                    data += ' ';
                }
            }
        });
        return data;
    } else {
        if (keys != null) {
            keys = (keys == '') ? [] : keys;
            keys.forEach(function (k) {
                if (k > 0) {
                    AssistanceCheckbox[k - 1].checked = true;
                }
            });
        }
        return AssistanceCheckbox;
    }
}


export function MobilityCheckbox(keys = null, values = '', other = '') {
    var MobilityCheckbox = [
        { value: '1', label: 'Independent', checked: false },
        { value: '2', label: 'Assist', checked: false },
        { value: '3', label: 'Walking Stick', checked: false },
        { value: '4', label: 'Walking Frame', checked: false },
        { value: '5', label: 'Manual Hoist', checked: false },
        { value: '6', label: 'Shower Chair', checked: false },
        { value: '7', label: 'Wheel Chair', checked: false },
        { value: '8', label: 'L Frame', checked: false },
        { value: '9', label: 'Ceiling Hoist', checked: false },
        { value: '10', label: 'Other', checked: false }
    ];
    let data = "";
    if (values != '' && values != null) {
        values.forEach(function (k) {
            if (k > 0) {
                if (k == 4) {
                    data += other;
                    data += ' ';
                }
                else {
                    data += MobilityCheckbox[k - 1].label;
                    data += ' ';
                }
            }
        });
        return data;
    } else {
        if (keys != null) {
            keys = (keys == '') ? [] : keys;
            keys.forEach(function (k) {
                if (k > 0) {

                    MobilityCheckbox[k - 1].checked = true;
                }
            });
        }
        return MobilityCheckbox;
    }

}
export function LanguageCheckbox(keys = null, values = '', other = '') {
    var LanguageCheckbox = [

        { value: '1', label: 'Bengali', checked: false },
        { value: '2', label: 'Punjabi', checked: false },
        { value: '3', label: 'Russian', checked: false },
        { value: '4', label: 'English', checked: false },
        { value: '5', label: 'Arabic', checked: false },
        { value: '6', label: 'Spanish', checked: false },
        { value: '7', label: 'Chinese', checked: false },
        { value: '8', label: 'Hindi', checked: false },
        { value: '9', label: 'Japanese', checked: false },
        { value: '10', label: 'Portuguese', checked: false },
        { value: '11', label: 'Others', checked: false },
    ];
    let data = '';
    if (values != '' && values != null && values != 'undefined') {
        values.forEach(function (k) {
            if (k > 0) {
                if (k == 11) {
                    data += other;
                    data += ' ';
                }
                else {
                    data += LanguageCheckbox[k - 1].label;
                    data += ' ';
                }
            }
        });
        return data;
    } else {
        //   console.log(keys);
        if (keys != null) {
            keys = (keys == '') ? [] : keys;
            keys.forEach(function (k) {
                if (k > 0) {
                    LanguageCheckbox[k - 1].checked = true;
                }
            });
        }


        return LanguageCheckbox;
    }
}

export function ShiftDays(keys = null, values = '') {
    var ShiftDays = [
        { value: '1', label: 'MON', checked: false, data: [] },
        { value: '2', label: 'TUE', checked: false, data: [] },
        { value: '3', label: 'WED', checked: false, data: [] },
        { value: '4', label: 'THU', checked: false, data: [] },
        { value: '5', label: 'FRI', checked: false, data: [] },
        { value: '6', label: 'SAT', checked: false, data: [] },
        { value: '7', label: 'SUN', checked: false, data: [] },
    ];
    if (keys != null) {
        Object.keys(keys).forEach(function (k, v) {
            switch (k) {

                case '1': ShiftDays[0].data = keys[k]; break;
                case '2': ShiftDays[1].data = keys[k]; break;
                case '3': ShiftDays[2].data = keys[k]; break;
                case '4': ShiftDays[3].data = keys[k]; break;
                case '5': ShiftDays[4].data = keys[k]; break;
                case '6': ShiftDays[5].data = keys[k]; break;
                case '7': ShiftDays[6].data = keys[k]; break;
            }

        })
    }

    return ShiftDays;

}

export function ShiftCheckbox(keys = null, values = '') {
    var ShiftCheckbox = [
        { value: '1', label: '', checked: false },
        { value: '2', label: '', checked: false },
        { value: '3', label: '', checked: false },
        { value: '4', label: '', checked: false },
    ];
    let data = '';
    if (values != '' && values != null) {
        values.forEach(function (k) {
            if (k > 0) {
                data += ShiftCheckbox[k - 1].label;
                data += ' ';
            }
        });
        return data;
    } else {
        if (keys != null) {
            keys.forEach(function (k) {
                if (k > 0 && k < 5) {
                    ShiftCheckbox[k - 1].checked = true;
                }
            });
        }
        return ShiftCheckbox;
    }
}
export function ShiftRequirement(keys = null, values = '') {
    var ShiftRequirement = [
        { value: '1', label: 'In-home Support', checked: false },
        { value: '2', label: 'Shower Chair', checked: false },
        { value: '3', label: 'Wheel Chair', checked: false },
        { value: '4', label: 'Ceiling Hoist', checked: false },
    ];
    let data = '';
    if (values != '' && values != null) {
        values = values.split(",");
        values.forEach(function (k) {
            if (k > 0) {
                data += ShiftRequirement[k - 1].label;
                data += '   ';
            }
        });
        return data;
    } else {
        if (keys != null) {
            keys.forEach(function (k) {
                if (k > 0) {
                    ShiftRequirement[k - 1].checked = true;
                }
            });
        }
        return ShiftRequirement;
    }
}
export function getStagesStatus(key, fund_lock = false) {
    var stagesStatus = [];
    if (fund_lock) {
        stagesStatus = [
            { value: '0', label: 'Pending', disabled:true },
            { value: '1', label: 'Success' },
            { value: '2', label: 'UnSuccess' },
            { value: '3', label: 'In-Progress' },
        ];
    }
    else {
        stagesStatus = [
            { value: '0', label: 'Pending' , disabled:true },
            { value: '1', label: 'Success' },
            { value: '2', label: 'UnSuccess' },
            { value: '3', label: 'In-Progress' },
            { value: '4', label: 'Parked' },

        ];
    }
    if (key > 0) {
        return stagesStatus[key - 1].label;
    } else if (key == 0) {
        return stagesStatus;
    }

}
export function getParticipantState(key) {
    var participantState = [
        { value: '', label: 'Select State' },
        { value: '1', label: 'Prospective ' },
        { value: '2', label: 'Parked ' },
        { value: '3', label: 'Rejected  ' },
        { value: '4', label: 'Active ' },
    ];
    if (key > 0) {
        return participantState[key - 1].label;
    } else if (key == 0) {
        return participantState;
    }

}
export function getmartialStatus(key) {
    var martialState = [
        { value: '', label: 'Select Marital Status' },
        { value: '1', label: 'Married' },
        { value: '2', label: 'Single' },
        { value: '3', label: 'Divorced ' },
    ];
    if (key > 0) {
        return martialState[key - 1].label;
    } else if (key == 0) {
        return martialState;
    }

}
export function priorityTask(key, clearable) {
    var interpreter = []
    if (clearable == 'clearable') {
        interpreter = [{ value: '', label: 'Select The Priority' }]
    }
    interpreter = [...interpreter,
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' }]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }
}

export function priorityList(key) {

    var priorityList = [
        { value: '0', label: 'All' },
        { value: '1', label: 'Low' },
        { value: '2', label: 'Medium' },
        { value: '3', label: 'High' }
    ];
    if (key > 0) {
        return priorityList[key - 1].label;
    } else if (key == 0) {
        return priorityList;
    }
}
export function leftFunnel(key) {

    var priorityList = [
        { value: '0', label: 'Select', disabled: true },
        { value: '1', label: 'Current Month' },
        { value: '2', label: 'Current Quarter' },
        { value: '3', label: 'Current Year' }

    ];
    if (key > 0) {
        return priorityList[key - 1].label;
    } else if (key == 0) {
        return priorityList;
    }
}
export function listDocumentListBy(key) {

    var docManagementList = [
        { value: '0', label: 'Current Documents' },
        { value: '1', label: 'NDIS Plan' },
        { value: '2', label: 'Behavioral Support Plan' },
        { value: '5', label: 'Other Relevant Plan' },
        { value: '6', label: 'Service Agreement Document' },
        { value: '7', label: 'Funding Consent' },
        { value: '8', label: 'Final Service Agreement Document' },
        { value: '9', label: 'Other Attachments' },
        { value: '123', label: 'Archived Documents' }
    ];
    if (key > 0) {
        return docManagementList[key - 1].label;
    } else if (key == 0) {
        return docManagementList;
    }
}
export function listDocumentList(key) {

    var docManagementList = [
        { value: '1', label: 'NDIS Plan' },
        { value: '2', label: 'Behavioral Support Plan' },
        { value: '5', label: 'Other Relevant Plan' },
        { value: '6', label: 'Service Agreement Document' },
        { value: '7', label: 'Funding Consent' },
        { value: '8', label: 'Final Service Agreement Document' },
        { value: '9', label: 'Other Attachments' }
    ];
    if (key > 0) {
        return docManagementList[key - 1].label;
    } else if (key == 0) {
        return docManagementList;
    }
}


export function preferredContact() {
    var interpreter = [
        { value: 1, label: 'Phone' },
        { value: 2, label: 'Email' },
    ]
    return interpreter;
}

export function riskAssessmentStatus() {
    var riskAssessmentStatus = [
        { value: '1', label: 'Draft' },
        { value: '2', label: 'Active' },
        { value: '3', label: 'InActive' },
    ]
    return riskAssessmentStatus;
}

export function riskAssessmentStatusFilter() {
    var riskAssessmentStatusFilter = [
        { value: 'all', label: 'All' },
        { value: 'draft', label: 'Draft' },
        { value: 'final', label: 'Active' },
        { value: 'inactive', label: 'InActive' },        
    ]
    return riskAssessmentStatusFilter;
}

// export function primaryContact() {
//     var interpreter = [
//         { value: 1, label: 'Participant' },
//         { value: 2, label: 'Next of Kin' },
//         { value: 3, label: 'Referee' },
//         { value: 4, label: 'Other' },
//     ]
//     return interpreter;
// }
