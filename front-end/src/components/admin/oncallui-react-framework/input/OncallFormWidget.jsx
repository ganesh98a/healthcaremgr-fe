import React from 'react';
import OncallSingleRow from './OncallSingleRow';

const OncallFormWidget = React.forwardRef(
    
    (props, ref) => {

        return (
            <>
            {
                props.formElement.map((options) => {
                   
                    return (
                    
                    
                        <div className={options.rowclass}>
                            {Array.isArray(options.child) && options.child.map(childOptions => 
                               <OncallSingleRow {...childOptions} />
                            )}
                            
                        </div>
                    );
                    
                })
            }
            </>
        );
    }

)

OncallFormWidget.defaultProps = {
	rowclass: 'row'
}


export default OncallFormWidget;