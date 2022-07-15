import React from 'react'
import '../scss/components/admin/salesforce/lightning/SLDS.scss'

const paths = {
    close: `M14.6 11.9l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.3-.7-.3-1 0L12.6 10c-.1.2-.4.2-.6 0L6 3.9c-.3-.3-.7-.3-1 0l-1 .9c-.3.3-.3.7 0 1l6.1 6.1c.1.1.1.4 0 .6L4 18.6c-.3.3-.3.7 0 1l.9.9c.3.3.7.3 1 0l6.1-6c.2-.2.5-.2.6 0l6.1 6c.3.3.7.3 1 0l.9-.9c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z`,
    search: `M22.9 20.9l-6.2-6.1c1.3-1.8 1.9-4 1.6-6.4-.6-3.9-3.8-7.1-7.8-7.4C5 .4.4 5 1 10.5c.3 4 3.5 7.3 7.4 7.8 2.4.3 4.6-.3 6.4-1.5l6.1 6.1c.3.3.7.3 1 0l.9-1c.3-.3.3-.7.1-1zM3.7 9.6c0-3.2 2.7-5.9 5.9-5.9 3.3 0 6 2.7 6 5.9 0 3.3-2.7 6-6 6-3.2 0-5.9-2.6-5.9-6z`,
    down: `M3.8 6.5h16.4c.4 0 .8.6.4 1l-8 9.8c-.3.3-.9.3-1.2 0l-8-9.8c-.4-.4-.1-1 .4-1z`,
    clear: `M12 .9C5.9.9.9 5.9.9 12s5 11.1 11.1 11.1 11.1-5 11.1-11.1S18.1.9 12 .9zm2.3 11.5l3.6 3.6c.1.2.1.4 0 .6l-1.3 1.3c-.2.2-.5.2-.7 0l-3.6-3.6c-.2-.2-.4-.2-.6 0l-3.6 3.6c-.2.2-.5.2-.7 0l-1.3-1.3c-.1-.2-.1-.4 0-.6l3.6-3.6c.2-.2.2-.5 0-.7L6.1 8.1c-.2-.2-.2-.5 0-.7l1.3-1.3c.2-.1.4-.1.6 0l3.7 3.7c.2.2.4.2.6 0l3.6-3.6c.2-.2.5-.2.7 0l1.3 1.3c.1.2.1.4 0 .6l-3.6 3.6c-.2.2-.2.5 0 .7z`
}

/**
 * 
 * @param {React.SVGAttributes<SVGSVGElement> & { icon: keyof paths }} props
 */
export const SLDSIcon = props => {
    const svgProps = {
        ...props,
        icon: undefined,
    }

    // @todo. This if-block is just to make this component load instantly
    // At the moment, loading svg through the use of <use /> is network heavy
    // I haven't figured out how to optimize 
    if (props.icon in paths) {
        return (
            <svg {...svgProps}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d={paths[props.icon]}/>
                </svg>
            </svg>
        )
    }

    // @todo: Optimize this to reduce network request
    return (
        <svg {...svgProps}>
            <use href={`/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#${props.icon}`} />
        </svg>
    )
}