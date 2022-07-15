import React from 'react'
import classNames from 'classnames'

import { SLDSIcon } from './SLDS'
import { css } from '../../../../service/common'

/**
 * 
 * @param {object} props 
 * @param {string | number | JSX.Element} props.heading
 * @param {string | number | JSX.Element} props.tagline
 * @param {(e: React.MouseEvent<HTMLButtonElement>) => void} props.onClose
 */
const SLDSModalHeader = ({ heading, tagline, onClose }) => {
    return (
        <div className="slds-modal__header">
            <button type="button" className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onClick={onClose}>
                <SLDSIcon icon="close" className={`slds-button__icon slds-button__icon_large`} aria-hidden="true"/>
                <span class="slds-assistive-text">Close</span>
            </button>
            <h2 class="slds-modal__title slds-hyphenate">{heading}</h2>
            {tagline && <p class="slds-m-top_x-small">{tagline}</p>}
        </div>
    )
}

/**
 * 
 * @param {(React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { size: 'small'|'medium'|'large' }} props 
 */
const SLDSModalContent = ({size = 'medium', ...props}) => {
    return (
        <div className="slds-modal__content">
            <section className={`clearfix slds-p-around_${size}`}>
                {props.children}
            </section>
        </div>
    )
}


/**
 * 
 * @param {object} props 
 * @param {string | JSX.Element} [props.cancelButtonLabel]
 * @param {string | JSX.Element} [props.submitButtonLabel]
 * @param {boolean} [props.isSubmitting]
 * @param {(e: React.MouseEvent<HTMLButtonElement>) => void} [props.onCancel]
 * @param {boolean} [props.disableSubmit]
 * 
 */
const SLDSModalFooter = ({ cancelButtonLabel = 'Cancel', submitButtonLabel = 'Submit', isSubmitting = false, onCancel= undefined, disableSubmit = false }) => {
    const styles = css({
        root: {
            position: 'static',
        }
    })

    return (
        <div className="slds-modal__footer" style={styles.root}>
            <button type="button" className="slds-button slds-button_neutral" onClick={onCancel}>{cancelButtonLabel}</button>
            {!disableSubmit && <button type="submit" className="slds-button slds-button_brand" disabled={isSubmitting}>{submitButtonLabel}</button>}
        </div>
    )
}


const SLDSModalForm = React.forwardRef(
    
    /**
     * @typedef {typeof defaultProps} Props
     * @param {React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & Props} props 
     * @param {React.Ref<HTMLFormElement>} ref
     */
    (props, ref) => {

    const styles = css({
        root: {
            fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif`,
        },
    })

    const formProps = {
        ...props,
        wrapperProps: undefined,
        backdropProps: false,
    }

    return (
        <React.Fragment>
            <section 
                role="dialog" 
                tabIndex="-1" 
                aria-modal="true" 
                aria-describedby="modal-content-id-1" 
                style={styles.root}
                {...props.wrapperProps}
                className={classNames(`SLDSModalForm slds-modal slds-fade-in-open slds-modal_${props.size}`, props.wrapperProps.className)}
            >
                <form {...formProps} ref={ref} className={classNames('slds-modal__container', props.className)}>
                    <SLDSModalHeader onClose={props.onClose} heading={props.heading} tagline={props.tagLine} />
                    <SLDSModalContent size={props.size}>
                        {props.children}
                    </SLDSModalContent>
                    <SLDSModalFooter 
                        onCancel={props.onCancel} 
                        disableSubmit={props.disabled} 
                        cancelButtonLabel={props.disabled ? `Close` : props.cancelButtonLabel} 
                        submitButtonLabel={props.submitButtonLabel} 
                        isSubmitting={props.isSubmitting}
                    />
                </form>
            </section>
            <div className="slds-backdrop slds-backdrop_open" style={styles.backdrop} onClick={props.onClose} {...props.backdropProps} />
        </React.Fragment>
    )
})

const defaultProps = {
    open: false,

    /**
     * @type {string | number | JSX.Element}
     */
    heading: undefined,

    /**
     * @type {string | number | JSX.Element}
     */
    tagLine: undefined,

    /**
     * @type {(e: React.MouseEvent<HTMLButtonElement>) => void}
     */
    onCancel: undefined,

    /**
     * @type {(e: React.MouseEvent<HTMLDivElement>) => void}
     */
    onClose: undefined,

    cancelButtonLabel: `Cancel`,
    submitButtonLabel: `Submit`,
    isSubmitting: false,

    /**
     * @type {React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>}
     */
    wrapperProps: {},

    /**
     * @type {React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>}
     */
    backdropProps: {},

    disabled: false,

    isSubmitting: false,

    /**
     * @type {'large'|'medium'|'small'}
     */
    size: 'medium',
}

SLDSModalForm.defaultProps = defaultProps
export default SLDSModalForm