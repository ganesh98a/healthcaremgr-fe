
import React from 'react';
import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";
import { TextBlock, MediaBlock, TextRow, RectShape, RoundShape, ContentLoader, Circle, Rect } from 'react-placeholder/lib/placeholders';
import {CURRENCY_SYMBOL} from 'config.js';


const currencyFormatUpdate = (num, currencySymbol) => {
    return   currencySymbol + (num!=undefined ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'):num)
}
const CounterShowOnBox = (props) => {
    const classNameDataAdded = { ',': 'comma_cls', '.': 'dot_cls' };
    if (props.mode == 'defualt' && !props.placeHoldeShow) {
        return (
            <div className={"counter_wrapper " + props.classNameAdd}>
                <div className="counter_div">
                    <div className="counter_text">
                        {props.checkLengthData(props.counterTitle, props.minNumber)}
                    </div>
                    <span className="counter_lines"></span>
                </div>
            </div>
        );
    } else if (props.mode == 'recruitment' && !props.placeHoldeShow) {

        return (
            <div className="text-center">
                <span className="mnNumBox">
                    <div className="num_stats2">
                        {
                            props.checkLengthDataArr(props.counterTitle, props.minNumber).map((apli, i) => {
                                return (
                                    <span key={i}>{apli}</span>
                                )
                            })
                        }
                    </div>
                </span>
            </div>
        )
    } else if (props.mode == 'crm' && !props.placeHoldeShow) {

        return (
            <div className="text-center">
                <span className="mnNumBox">
                    <div className="num_stats2">
                        {
                            props.checkLengthDataArr(props.counterTitle, props.minNumber).map((apli, i) => {
                                return (
                                    <span key={i}>{apli}</span>
                                )
                            })
                        }
                    </div>
                </span>
            </div>
        )
    } else if (props.mode == 'other' && !props.placeHoldeShow) {

        let extraParm = {};
        if (props.currencyFormat && props.currencySymbol != '') {
            extraParm['currencyFormat'] = props.currencySymbol;
            classNameDataAdded[props.currencySymbol] = props.currencySymbolClass;
        }
        let sourceData = props.checkLengthDataArr(props.counterTitle, props.minNumber, extraParm);
        // let extraClassForSamallBox = sourceData.length > 10 ? 'mnSmallNumBox' : props.checkLengthDataArr.length;
        let extraClassForSamallBox = sourceData.length > 10 && sourceData.length <12 ? 'mnSmallNumBox' : sourceData.length>= 12?'mnExtraSmallNumBox':'';
        return (
            <div className="text-center">
                <span className={"mnNumBox " + extraClassForSamallBox}>
                    <div className="num_stats2">
                        {
                            props.checkLengthDataArr(props.counterTitle, props.minNumber, extraParm).map((apli, i) => {
                                return (
                                    <span key={i} className={classNameDataAdded.hasOwnProperty(apli) ? classNameDataAdded[apli] : ''}>{apli}</span>
                                )
                            })
                        }
                    </div>
                </span>
            </div>
        )
    } else if (props.placeHoldeShow) {
        return (<ReactPlaceholder showLoadingAnimation={true} ready={props.placeHoldeShow}>
            <div className="w-100">
                <div className="text-center">
                    <span className="mnNumBox 3">
                        <div className="num_stats2">
                        <RectShape defaultValue={''} showLoadingAnimation={true} color='#818181' style={{ width: '45px', height: '70px', 'borderRadius': 0, display: 'inline-block', marginRight:'0px' }} />
                        <RectShape defaultValue={''} showLoadingAnimation={true} color='#a7a7a7' style={{ width: '45px', height: '70px', 'borderRadius': 0, display: 'inline-block', marginRight:'0px' }} />
                        <RectShape defaultValue={''} showLoadingAnimation={true} color='#cdcdcd' style={{ width: '45px', height: '70px', 'borderRadius': 0, display: 'inline-block', marginRight:'0px' }} />
                        </div>
                    </span>
                </div>
            </div>
            {/* <div className="status_box1 d-flex flex-wrap">
                <div className="row d-flex flex-wrap after_before_remove w-100">
                 
                    <div className="row d-flex flex-wrap w-100">
                        <div className="col-lg-5 col-md-12 col-sm-12 colJ-1">
                        <RectShape defaultValue={''} showLoadingAnimation={true} color='#818181' style={{ width: '20px', height: '100px', 'borderRadius': 0, display: 'inline-block' }} />
                        <RectShape defaultValue={''} showLoadingAnimation={true} color='#a7a7a7' style={{ width: '20px', height: '80px', 'borderRadius': 0, display: 'inline-block' }} />
                        <RectShape defaultValue={''} showLoadingAnimation={true} color='#cdcdcd' style={{ width: '20px', height: '60px', 'borderRadius': 0, display: 'inline-block' }} />
                        </div>
                       
                    </div>
                </div>
            </div> */}
        </ReactPlaceholder>);
    } else {
        return (<React.Fragment />);
    }

}
CounterShowOnBox.defaultProps = {
    placeHoldeShow: false,
    counterTitle: 0,
    minNumber: 3,
    checkLengthData: (number, width) => {
        let numberData = number != undefined && number != null  ? number.toString().length : 0;
        let numberDataCalc = width + 1 - numberData;
        numberDataCalc = numberDataCalc < 0 ? 0 : numberDataCalc;
        let data = new Array(numberDataCalc).join('0') + number.toString();
        //let data = number!=0?new Array(numberDataCalc).join('0') + number:new Array(numberDataCalc).join('0');
        return data;
        //return new Array(width + 1 - (number.toString() + '').length).join('0') + number;
    },
    checkLengthDataArr: (number, width, extraParm) => {
        let currencyFormat = extraParm != undefined && extraParm != null && typeof (extraParm) == 'object' && extraParm.hasOwnProperty('currencyFormat') ? true : false;
        let currencySymbol = currencyFormat == true ? extraParm.currencyFormat : '';
        let numberData = number != undefined && number != null ? number.toString().length : 0;
        let numberDataCalc = width + 1 - numberData;
        numberDataCalc = numberDataCalc < 0 ? 0 : numberDataCalc;
        let data = new Array(numberDataCalc).join('0') + number.toString();
        //let data = number!=0?new Array(numberDataCalc).join('0') + number:new Array(numberDataCalc).join('0');
        if (currencyFormat) {
            data = currencyFormatUpdate(data, currencySymbol);
        }
        return data.split('');

    },
    classNameAdd: '',
    mode: 'defualt',
    currencyFormat: false,
    currencySymbol: CURRENCY_SYMBOL,
    currencySymbolClass: ''


};

export { CounterShowOnBox };