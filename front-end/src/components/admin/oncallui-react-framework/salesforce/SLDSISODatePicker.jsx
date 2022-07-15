import React from 'react';
import moment from 'moment'
import { DatePicker, Input, Button } from '@salesforce/design-system-react'

//import '../../scss/components/admin/salesforce/lightning/SLDSISODatePicker.scss'

/**
 * @typedef {object} Props
 * @property {{nextMonth: string,openCalendar: string,previousMonth: string,year: string}} [assistiveText]
 * @property {'left'|'right'} [align]
 * @property {string|string[]|Record<string, boolean>} [className]
 * @property {boolean} [disabled]
 * @property {(data: {date: Date}) => boolean} [dateDisabled]
 * @property {(date: Date) => string} [formatter]
 * @property {string} [formattedValue]
 * @property {boolean} [hasStaticAlignment]
 * @property {string} [id]
 * @property {{ abbreviatedWeekDays: string[], label: string, months: string[], placeholder: string, today: string, weekDays: string[]}} [labels]
 * @property {boolean} [isOpen]
 * @property {boolean} [isIsoWeekday]
 * @property {'absolute'|'overflowBoundaryElement'|'relative'} [menuPosition]
 * @property {(e: React.Event) => void} [onCalendarFocus]
 * @property {(e: React.Event, data: {date: Date, formattedDate: string, timezoneOffset: number}) => void} [onChange]
 * @property {() => void} [onClose]
 * @property {() => void} [onOpen]
 * @property {() => void} [onRequestClose]
 * @property {() => void} [onRequestOpen]
 * @property {(str: string) => Date} [parser]
 * @property {number} [relativeYearFrom]
 * @property {number} [relativeYearTo]
 * @property {string|string[]|Record<string, boolean>} [triggerClassName]
 * @property {Date|string} [value]
 * @property {string} [placeholder]
 * @property {boolean} [required]
 * 
 * // Additional props
 * @property {() => void} [onClear]
 * @property {React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>} [inputProps]
 * @property {boolean} [clearable]
 * @property {boolean} [backspaceRemoves]
 * @property {string} [format]
 * @property {string} [isoDateTimeFormat]
 * 
 * // Note: No input props
 */

/**
 * Readonly date-picker derived from design-system-react's Datepicker component.
 * 
 * This component requires `ref` in order to work.
 * 
 * You can clear the value of date-picker by pressing backspace. 
 * Alternatively pass `clearable=true` to display a 'close' icon to clear the datepicker value 
 * 
 * When value inside field changes, the onChange will produce date string 
 * formatted as `YYYY-MM-DD HH:mm:ss` (similar to mysql `Y-m-d H:i:s`)
 * 
 * Note: You cannot pass input props because it is already been used internally. Use `inputProps` instead
 */
export const SLDSISODatePicker = React.forwardRef(
    
    /**
     * @param {Props} props
     * @param {React.Ref<DatePicker>} ref
     */
    (props, ref) => {
    
        // const [open, setOpen] = React.useState(false)
        const [lastValidDate, setLastValidDate] = React.useState(null)
        
        
        const isoDateTimeFormat = props.isoDateTimeFormat
        let dateMoment = null
        if (props.value instanceof Date) {
            dateMoment = moment(props.value)
        } else if (typeof props.value === 'string') {
            dateMoment = moment(props.value, isoDateTimeFormat)
        }
    
        let dateValue = null
        if (dateMoment && dateMoment.isValid()) {
            dateValue = dateMoment.toDate()
        }
    
        /**
         * @param {React.KeyboardEvent} e
         */
        const handleKeyDown = ref => e => {
            const keys = {
                ENTER: 13,
                ESCAPE: 27,
                SPACE: 32,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                TAB: 9,
                DELETE: 46,
                BACKSPACE: 8,
            };
    
            if (props.backspaceRemoves && e.keyCode === keys.BACKSPACE) {
                return clearValue()
            } else {
                const { instanceRef } = ref.current || {}
                if (instanceRef && 'handleKeyDown' in instanceRef) {
                    return instanceRef.handleKeyDown(e)
                }
            }
        }
    
        const clearValue = () => {
            setLastValidDate(null)
            
            if (props.onClear) {
                props.onClear()
            }
    
            const { instanceRef } = ref.current || {}
            if (instanceRef && 'handleInputChange' in instanceRef) {
                instanceRef.handleInputChange({target: { value: '' }})
            }
        }
    
        const classNames = [
            'SLDSISODatePicker',
            lastValidDate && 'SLDSISODatePicker-has_value'
        ].filter(Boolean).join(' ')
    
        const inputProps = {
            ...SLDSISODatePicker.defaultProps.inputProps,
            // ...(props.input && props.input.props),
            ...props.inputProps,
        }
    
        /* eslint-disable */
        return (
            <div style={{ position: 'relative' }} className={classNames} >
                <DatePicker
                    ref={ref} 
                    {...props}
                    // isOpen={open}
                    // onRequestOpen={() => setOpen(true)}
                    // onRequestClose={() => setOpen(false)}
                    parser={(dateString) => dateString && moment(dateString, props.format) || new Date("")}
                    formatter={date => date ? moment(date).format(props.format) : ''}
                    onChange={(event, data) => {
                        if (typeof props.onChange === "function") {
                            let dateYmdHis = null
                            const momentDate = moment(data.date, props.format, false)
                            if (momentDate.isValid()) {
                                setLastValidDate(momentDate)
                                dateYmdHis = data.date
                            }
        
                            return props.onChange(dateYmdHis)
                        }
                    }}
                    input={<Input {...inputProps} onKeyDown={handleKeyDown(ref)}/>}
                    value={dateValue}
                    isClearable={props.clearable}
                />
                {
                    (props.clearable && lastValidDate) && (
                        <Button 
                            variant={'icon'}
                            iconCategory="utility"
                            iconName="clear"
                            iconSize="medium"
                            style={{
                                position: 'absolute',
                                marginLeft: -26,
                                top: 8,
                            }}
                            onClick={clearValue}
                        />
                    )
                }
            </div>
        )
    }
)
    
SLDSISODatePicker.defaultProps = {
    format: 'DD/MM/YYYY',
    isoDateTimeFormat: `YYYY-MM-DD HH:mm:ss`,
    // clearable: false,
    backspaceRemoves: false,
    inputProps: {
        // readOnly: true,
    }
}


/**
 * Specialized `SLDSISODatePicker` for date of birth
 */
export const SLDSISODateOfBirthPicker = React.forwardRef(
    /**
     * @param {Props} props
     * @param {React.Ref<DatePicker>} ref
     */
    (props, ref) => {
    return (
        <SLDSISODatePicker ref={ref}
            relativeYearFrom={-110} // going back 110 years
            relativeYearTo={1}
            dateDisabled={(data) => {
                const { date } = data
                const dateYmd = moment(date).format('YYYY-MM-DD')
                const todayYmd = moment().format('YYYY-MM-DD')
                
                const isAfter = moment(dateYmd).isAfter(todayYmd)

                return isAfter
            }}
            {...props}
        />
    )
})

    