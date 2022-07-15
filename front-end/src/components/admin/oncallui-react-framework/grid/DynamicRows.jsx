import React from 'react'
import { ARF } from "../services/ARF";
import Row from './Row';
import Text from '../input/Text';
import Col33 from '../grid/Col33';
import Label from '../input/Label';

class DynamicRows extends React.Component {

    constructor(props) {
        super(props);
        let style = props.style || {}
        this.style = props.border && {
            border: "1px solid #dddbda",
            padding: "10px",
            ...style
        }

        this.state = {
            cols: props.cols || [],
            data: props.data || [],
            inputs: []
        };
        props.data.map((rowData, i) => {
            props.cols.map((col, index) => {
                let key = col.accessor || "";
                this.setInputValue(key, i, index, rowData[key]);
            });
        });
    }

    renderHeader(cols) {
        return (
            <Row>
                {
                    cols.map(col => {
                        return <Col33 style={{marginLeft: '2em'}}><Label text={col.label} required /></Col33>
                    })
                }
            </Row>
        );
    }

    getKeyComponent(key, cols) {
        let comp = "";
        cols.filter(col => {
                            if (col.accessor === key) {
                                comp = col.component;
                            }
                        }
                    );
        return comp;
    }

    setInputValue(e, accessor, rowIndex, colIndex, Comp) {
        let value = "";
        if (typeof e === "object") {
            value = e.target.value;
        } else {
            value = e;
        }
        let inputs = this.state.inputs;
        let cell = {[accessor] : value};
        let row = inputs[rowIndex] || [];
        row[colIndex] = cell;
        inputs[rowIndex] = row;
        if (Comp && typeof Comp.props.onChange) {
            Comp.props.onChange(value, accessor, rowIndex, colIndex);
        }
        this.setState({inputs});
    }

    getInputValue(accessor, rowIndex, colIndex, Comp) {
        let inputs = this.state.inputs;
        if (inputs.length) {
            let row = inputs[rowIndex];
            let cell = row && row[colIndex] || undefined;
            let value = cell && cell[accessor];
            if (Comp && typeof Comp.props.value === "function") {
                return Comp.props.value(rowIndex, colIndex, accessor);
            }
            return  value || "";
        }
        return "";
    }

    handleOnClick() {
        console.log(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data && typeof prevProps.data === "object") {
            let inputs = [];
            let data = prevProps.data;
            Object.keys(data).map(key => {
                inputs.push(data[key]);
            });
            if (JSON.stringify(inputs) !== JSON.stringify(this.state.inputs)) {
                this.setState({inputs});
            }
        }        
    }

    renderRows() {
        let {inputs, cols} = this.state;
        if (inputs) {
            return (
                inputs.map((rowData, i) => {
                    return (
                        <Row>
                            {
                                cols.map((col, index) => {
                                    let key = col.accessor || "";
                                    let Comp = this.getKeyComponent(key, cols)();
                                    return (
                                        <Col33 style={{marginLeft: '2em'}}>
                                            {React.cloneElement(Comp, {value: this.getInputValue(key, i, index, Comp), onChange: (e) => this.setInputValue(e, key, i, index, Comp), onClick: (e) => Comp.props.onClick(e, key, i, index)})}
                                        </Col33>
                                    )
                                })
                            }
                            <div style={{padding: "6px", textAlign: "center", cursor:"pointer"}} className="col-lg-1 col-sm-12" onClick={() => this.removeRow(i)}>X</div>
                        </Row>
                    )
                })
            )
        }
    }

    addMore() {
        let inputs = this.state.inputs || [];
        let rowIndex = inputs.length;
        inputs[rowIndex] = Object.keys(this.state.cols[0]);
        if (this.props.onAddMore) {
            this.props.onAddMore(inputs);
        }
        this.setState(inputs);
    }

    removeRow(rowIndex) {
        let inputs = this.state.inputs;
        inputs.splice(rowIndex, 1);
        if (this.props.onRemoveRow) {
            this.props.onRemoveRow(inputs);
        }
        this.setState(inputs);
    }

    render() {
        return (
            <div style={this.style} id={ARF.uniqid} className={this.props.className || "row py-1 mt-3"}>
                {
                    this.props.cols && this.renderHeader(this.props.cols)
                }
                {
                    this.props.data && this.renderRows()
                }
                {this.props.children}
                { this.props.addmore && <div style={{margin:"5px", cursor:"pointer"}} class="col-lg-3 col-sm-3" onClick={this.addMore.bind(this)}>+ Add Row</div> }
            </div>
        )
    }
}
export default DynamicRows;