
import React, { Component } from 'react';
import ScrollArea from "react-scrollbar";
import classNames from "classnames";


const CustomTbodyComponent = props => (
    <div {...props} className={classNames("rt-tbody", props.className || [])}>
        <div className=" cstmSCroll1">
            <ScrollArea
                speed={0.8}
                className="stats_update_list"
                contentClassName="content"
                horizontal={false}
                style={{ paddingRight: "13px", paddingLeft: "0px", height: '620px', minHeight: '620px' }}
            >{props.children}</ScrollArea>
        </div>
    </div>
);
export default CustomTbodyComponent;