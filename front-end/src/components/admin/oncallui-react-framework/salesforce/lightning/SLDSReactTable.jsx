import React from 'react'
import ReactTable from 'react-table'
import classNames from 'classnames'
import 'react-table/react-table.css'

import '../scss/components/admin/salesforce/lightning/SLDSReactTable.scss'

// Not yet ready for reuse
const UNSTABLE_SLDSReactTable = React.forwardRef(
    /**
     * 
     * @param {import('react-table').TableProps} props 
     */
    (props, ref) => {
        return (
            <ReactTable
                ref={ref} 
                resizable={false}
                getTableProps={() => ({ role: 'grid', className: 'slds-table' })}
                {...props}
                style={{
                    fontSize: 13,
                    fontFamily: `'Salesforce Sans', Arial, Helvetica, sans-serif`,
                    ...props.style,
                }}
                className={classNames('SLDSReactTable', props.className)}
            />
        )
    }
)

export default UNSTABLE_SLDSReactTable