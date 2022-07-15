export function validate_english_name(value) {
    // optional
    if (!value) {
        return true
    }

    var trimmedValue = ''.concat(value).trim();
    
    // optional
    if (!trimmedValue) {
        return true
    }

    // don't allow if there's no letters
    if (!/[a-z]/i.test(trimmedValue)) {
        return false;
    }

    // Allow these chars only
    if (!/^[a-z ,\.'-]+$/i.test(trimmedValue)) {
        return false;
    }

    // special chars at the end, except dot
    if (/[',-]$/gi.test(trimmedValue)) {
        return false;
    }

    // special chars at the beiginning (except .)
    if (/^[',-]/gi.test(trimmedValue)) {
        return false;
    }

    // special chars at the beiginning (including .)
    if (/^[',-\.]/gi.test(trimmedValue)) {
        return false;
    }

    // special chars that were allowed previously are sitting 
    // next to each other are not allowed
    if (/([-',\. ])([-',\.])/gi.test(trimmedValue)) {
        return false
    }

    // double spaces not allowed
    if (/\s\s/gi.test(trimmedValue)) {
        return false;
    }

    return true;
}