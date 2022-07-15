import React, { Component } from 'react';


class SuccessPopUp extends Component {


    render() {


        return (
            <div className={'successBg_popUp ' + (this.props.show? 'show' : '')}>
                <div className='popUp_bx_1'>
                    <div className='text-right'>
                        <i className='icon icon-close1-ie close_ic' onClick={this.props.close}></i>
                    </div>
                    <div className='popMsg'>{this.props.children}</div>
                    <i className='icon icon-accept-approve1-ie aprv_ic'></i>
                </div>
            </div>

        );
    }
}

export default SuccessPopUp;

