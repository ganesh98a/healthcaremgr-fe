import { validate_english_name } from '../../helpers/validate_english_name'

it('valid optional english human name', () => {
    const valid = [
        '',
        ' ',
        'Joshua',
        'Joshua Orozco',
        'Joshua Jr.',
        'Joshua Jr.',
        'Joshua Sr',
        `Mathias d'Arras`,
        'Martin Luther King, Jr.',
        'Hector Sausage-Hausen',
        'Hector-Sausage-Hausen',
        'Joshua Orozco the Third',
    ]
    
    const invalid = [
        'Joshua Orozco 3rd', // sorry numbers not allowed!
        '@@@@',
        'joshuaorozco@example.net',
        'Joshua Orozco 3',
        '0444000000',
        '@Nicholas@',
        '@Nicholas@#',
        `Mathias d'Arras,`,
        `Mathias d''Arras`,
        `Mathias  d Arras`, // this maybe too strict?
        `Mathias* d Arras`,
        `Mathias..d Arras`,
        'Hector--Sausage-Hausen',
        '.InvalidName',
        `\'InvalidName`, // is this allowed?
        '-InvalidName',
        ',InvalidName',
        'InvalidName,',
        `InvalidName'`,
        `InvalidName-`,
    ]

    for (let i = 0; i < valid.length; i++) {
        expect(validate_english_name(valid[i])).toEqual(true)
    }

    for (let i = 0; i < invalid.length; i++) {
        expect(validate_english_name(invalid[i])).toEqual(false)
    }
})