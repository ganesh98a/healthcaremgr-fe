import React from 'react';
import moment from 'moment'
import Label from './Label';

const OncallSingleRow = React.forwardRef(

    (props, ref) => {
        
        const formatDate = (sDate, sFormat) => {
            
            let isValidDate = moment(sDate)
            if (isValidDate.isValid()) {
                return isValidDate.format(sFormat)
            }
            
            return ''
        }
        
        const _displayContent = (props) => {
            switch (props.type) {
                case 'text':  
                    return <>
                        
                        <div className="slds-form-element__control">
                        {props.value &&
                            <Label text={props.value} />
                        }
                        {!props.value &&
                            <span>&nbsp;&nbsp;</span>
                        }
                        </div>
                    </>
                case 'radio':
                    return <>
                        <div className="slds-form-element__control">
                           {
                            props.options.map((i) => (
                              <span>{i.value === props.value ? <Label text={i.label} />: '' }</span>
                            ))
                          }
                        </div>
                    </>
                case 'select':
                    return <>
                        <div className="slds-form-element__control">
                           {
                            props.options.map((i) => (
                              <span>{i.value === props.value ? <Label text={i.label} />: '' }</span>
                            ))
                          }
                        </div>
                    </>
                
                case 'date':
                    return <>

                        <div className="slds-form-element__control">
                            <Label text={formatDate(props.value, props.format)} />
                        </div>
                    </>
                
                default:
                    return <>
                        <div className="slds-form-element__control">
                        
                        {Array.isArray(props.value) && props.value.map((childOptions , idx)=> 
                            
                            <p><Label text={childOptions} /> </p>
                            
                        )}
            
                        {!Array.isArray(props.value) &&
                            <Label text={props.value} />
                        }
                        {!props.value &&
                            <span>&nbsp;&nbsp;</span>
                        }
                        </div>
                    </>
            }
        }

    

        return (
            <div className={props.colclass} style={props.style} id={props.name}>
                <div className="slds-form-element">
                    <Label text={props.label} style={props.style} />

                    {(_displayContent(props))}
				
                </div>
            </div>
			
        )
		
	}

)

OncallSingleRow.defaultProps = {
    readOnly: true,
    disabled: false,
	colclass: 'col col-lg-6 col-sm-6'
}


export default OncallSingleRow;