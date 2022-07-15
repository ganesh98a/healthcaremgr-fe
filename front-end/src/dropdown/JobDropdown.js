export function jobOpeningStatus(key) {
    var interpreter = [
        {value: 0, label: 'Draft'},
        {value: 2, label: 'Closed'},
        {value: 3, label: 'Live'},
        {value: 5, label: 'Scheduled'},
    ];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function recurringType(key) {
    var interpreter = [
        {value: 1, label: 'Weekly'},
        {value: 2, label: 'Monthly'},
    ];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function jobStage2DropDown(key) {
    var interpreter = [
        {value: 6, label: 'CAB Day'},
        {value: 9, label: 'Offers'},
    ];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}