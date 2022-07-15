import { valid_ndis } from '../../helpers/valid_ndis'

test('valid_ndis', () => {
    const valid = [
        '',  // optional
        ' ', // optional
        '012345678', // 9 numbers is valid
        '012 345 678', // can also account for spaces
        '012  345   678', // can also account for multiple spaces
        '0    12345678', // can also account for multiple spaces
    ]

    for (let i = 0; i < valid.length; i++) {
        expect(valid_ndis(valid[i])).toEqual(true)
    }
})

test('invalid NDIS number', () => {
    const invalid = [
        '12345678q', // no letters allowed
        '12345678', // must be exactly 9 letters
        '1234567890', // must be exactly 9 letters
        'JOSHUAOROZCO',
        '1.3456e-9' // no special chars
    ]
    
    for (let i = 0; i < invalid.length; i++) {
        expect(valid_ndis(invalid[i])).toEqual(false)
    }
})

