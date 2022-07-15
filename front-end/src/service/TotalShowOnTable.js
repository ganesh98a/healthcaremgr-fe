import React from 'react';

const TotalShowOnTable = (props) => {
    const classdata = props.showonHeader? '' :'table_footer-1  text-left';
   const color = props.color ? props.color : 'color';
    return (
        <span className={classdata+ (props.countData > 0 ? " " : " ")}><span>{props.lableTitel}:</span> {props.countData}</span>
    );
}
TotalShowOnTable.defaultProps = {
    countData: 0,
    lableTitel: 'Total',
    showonHeader: false,

};

export { TotalShowOnTable };