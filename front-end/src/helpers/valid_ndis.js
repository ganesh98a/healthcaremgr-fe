export function valid_ndis(value) {
    // optional
    if (!value) {
        return true
    }

    var trimmedValue = ''.concat(value).trim();
    
    // optional
    if (!trimmedValue) {
        return true
    }

    const noSpaces = trimmedValue.replace(/\s+/g, '')

    if (/^\d{9}$/g.test(noSpaces)) {
        return true
    }

    return false
}