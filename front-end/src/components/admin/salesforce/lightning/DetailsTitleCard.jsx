import React from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import {
    Icon,
    IconSettings
} from '@salesforce/design-system-react';
import { css } from '../../../../service/common';

/**
 * Edit Icon Render
 */
const editIcon = React.forwardRef(
    /**
     * @param {Props} props
     */
    (props) => {
        const styles = props.styles;
    return (
        <div className="slds-size_1-of-12 slds-medium-size_1-of-12 slds-large-size_1-of-12" style={styles.iconAlign}>
            <Icon
                assistiveText={{ label: 'edit' }}
                category="utility"
                name="edit"
                size="x-small"
            />
        </div>
    )
})

/**
 * Split container
 */
export const DetailsTitle = React.forwardRef(
/**
 * @param {Props} props
 */
(props) => {
    const notAvailable = 'N/A';
    const details = props.details;
    const styles = css({
        root: {
            border: 'none',
            marginBottom: '1rem',
        },
        heading: {
            marginBottom: 15,
            marginTop: 8,
        },
        headingText: {
            fontSize: 14,
            fontWeight: 'normal',
            color: '#4d5145',
        },
        col: {
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #dddbda',
            paddingLeft: 0,
        },
        iconAlign: {
            textAlign: 'right',
        },
        wordWrap: {
            wordWrap: 'break-word',
            paddingRight: 5,
        },
        caption: {
            marginBottom: 15,
            marginTop: 25,
        },
        captionText: {
            fontSize: 15,
            fontWeight: 'normal',
        },
    })
    return (
        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
            <div className="slds-grid slds-wrap slds-gutters_x-small">
                {
                    details.map((detail, i) => {
                        const cell_width = (detail.cell_width) ? detail.cell_width : 2;
                        return (
                            (detail.caption) ? <div className="col-sm-12" style={styles.caption}>
                                <h3 style={styles.captionText}>{detail.caption}</h3>
                            </div> : 
                            <div key={i} className={"slds-col slds-size_1-of-1 slds-medium-size_1-of-1 slds-large-size_1-of-"+cell_width}>
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">{detail.label}</label>
                                    <div className="slds-col slds-grid " style={styles.col}>
                                        <div className="slds-form-element__control slds-size_11-of-12 slds-medium-size_11-of-12 slds-large-size_11-of-12" title={detail.title} style={styles.wordWrap}>
                                            {detail.value || notAvailable}                                        
                                        </div>
                                        { detail.editIcn && <editIcon styles={styles} />}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </IconSettings>
    )
})


/**
 * Default props set 
 */
const defaultProps = {
    details: [],
}

DetailsTitle.defaultProps = defaultProps;

