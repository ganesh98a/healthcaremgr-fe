import React from 'react';
import { Spinner } from '@salesforce/design-system-react';

export default function Loading(props) {
    return (
        <div style={{ position: 'relative', height: props.height || '5rem' }}>
            <Spinner
                size="small"
                variant="base"
                assistiveText={{ label: 'Loading...' }}
            />
        </div>
    )
}