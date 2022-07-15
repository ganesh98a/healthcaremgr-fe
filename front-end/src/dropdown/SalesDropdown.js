export function living_situation_option(key) {
    var interpreter = [
        { value: 1, label: 'Lives Alone', sda_agencey_name: false },
        { value: 2, label: 'Lives with family', sda_agencey_name: false },
        { value: 3, label: 'Lives with other', sda_agencey_name: false },
        { value: 4, label: 'SDA', sda_agencey_name: true },
    ]

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        if (index >= 0) {
            return interpreter[index].label;
        } else {
            return "N/A"
        }

    } else {
        return interpreter;
    }
}

export function living_informal_option(key) {
    var interpreter = [
        { value: 1, label: 'No', sda_agencey_name: false },
        { value: 2, label: 'Yes, Please describe', other: true },
    ]

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        if (index >= 0) {
            return interpreter[index].label;
        } else {
            return "N/A"
        }

    } else {
        return interpreter;
    }
}

export function lack_of_living_informal_option(key) {
    var interpreter = [
        { value: 1, label: 'No', sda_agencey_name: false },
        { value: 2, label: 'Yes, Please describe', other: true },
    ]

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        if (index >= 0) {
            return interpreter[index].label;
        } else {
            return "N/A"
        }

    } else {
        return interpreter;
    }
}