export function priceTypeDropdown() {
    return [
        {label: 'Upper Price Limit', value: 1},
        {label: 'National Remote Price', value: 2},
        {label: 'National Very Remote Price', value: 3}
    ]
}

export function LineItemListingFilterStatusDropdown() {
    return [
        {label: 'All Status', value: 'all'},
        {label: 'Active', value: 'active'},
        {label: 'Inactive', value: 'inactive'},
        {label: 'Archive', value: 'archive'}
    ]
}
export function LineItemListingFilterExportStatusDropdown() {
    return [
        {label: 'Private - Active', value: 'active'},
        {label: 'Future - Inactive', value: 'inactive'},
        {label: 'Archived', value: 'archive'}
    ]
}

export function InvoicePaymentStatusDropdown(selected) {
    
    let pr = selected=='payment received' ? true:false;
    let pnr = selected=='payment not received' ? true:false;
    return [
        {label: 'Payment Pending', value: 'payment pending',disabled: true},
        {label: 'Payment Received', value: 'payment received' ,disable:pr},
        {label: 'Payment Not Received', value: 'payment not received',disable:pnr}
    ]
}
export function InvoiceListFilterStatusDropdown(showFundTypeOption) {
    

    let list=[
        { value: 'all', label: 'All' },
        { value: 'invoice_number', label: 'Invoice Number' },
        { value: 'description', label: 'Description' },
        { value: 'invoice_for', label: 'Invoice For' },
        { value: 'addressto', label: 'Addressed To' },
        { value: 'amount', label: 'Amount' },
        { value: 'invoice_date', label: 'Date of Invoice' },
        { value: 'invoice_status', label: 'Status' }
    ];
    let additionalList =[];
    if(showFundTypeOption!= undefined && showFundTypeOption== true){
        additionalList = [ {value: 'fund_type', label: 'Fund Type' }];
    }
    return [...list,...additionalList];
}
export function CreditNoteListFilterStatusDropdown() {
    let list=[
        { value: 'all', label: 'All' },
        { value: 'credit_note_number', label: 'Credit Note Number' },
        { value: 'credit_note_for', label: 'Credit Note For' },
        { value: 'total_amount', label: 'Amount' },
        { value: 'created_date', label: 'Created' },
        { value: 'credit_note_status', label: 'Status' }
    ];
    return list;
}
export function RefundListFilterStatusDropdown() {
    let list=[
        { value: 'all', label: 'All' },
        { value: 'refund_number', label: 'Refund Number' },
        { value: 'refund_for', label: 'Refund For' },
        { value: 'invoice_number', label: 'Invoice Number' },
        { value: 'invoice_amount', label: 'Invoice Amount' },
        { value: 'refund_amount', label: 'Refund Amount' },
        { value: 'refund_created_date', label: 'Created Date' }
    ];
    return list;
}

