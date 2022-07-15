import React, { Component } from 'react';
import { postData } from '../../../service/common.js';
import Modal from 'react-bootstrap/lib/Modal';
import 'react-block-ui/style.css';
import ScrollArea from "react-scrollbar";

class ScheduleHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            roster_history: [],
            loading: false,

        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({ newProps }, () => {
            if (newProps.open_history) {
                this.get_shift_history();
            }
        });
    }

    get_shift_history = () => {
        postData('schedule/ScheduleListing/get_roster_loges', { rosterId: this.props.rosterId }).then((result) => {
            if (result.status) {
                this.setState({ roster_history: result.data })
            } else {
                this.reset_msg();
                this.setState({ error: result.error });
            }
        });
    }

    render() {
        return (
            <div>

                <Modal
                    className="Modal_A width_700"

                    show={this.props.open_history}

                    onHide={this.handleHide}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Body>
                        <div className="dis_cell">
                            <div className="text text-left Popup_h_er_1">
                                <span>Roster History Logs</span>
                                <a onClick={this.props.closeHistory} className="close_i"><i className="icon icon-cross-icons"></i></a>
                            </div>

                            <div className="row P_25_T" >
                            <div className="col-md-12">
                                <div className="flex_ul_div heading_list_net mb-3">
                                    <div className="br-1">Date: </div>
                                    <div className="br-1">Time: </div>
                                    <div>Description: </div>
                                </div>
                                <div className=" cstmSCroll1">
                                    <ScrollArea
                                        speed={0.8}
                                        // className="stats_update_list"
                                        contentClassName="content"
                                        horizontal={false}
                                        style={{ paddingRight: "0px", paddingLeft: "0px",  minHeight: 'auto', maxHeight:'350px' }}
                                    >
                                        {this.state.roster_history.map((value, idx) => (
                                            <div className="flex_ul_div" key={idx}>
                                                <div>{value.created}</div>
                                                <div>{value.time}</div>
                                                <div>{value.title}</div>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-5 col-sm-offset-7 P_15_T">
                                    <button onClick={this.props.closeHistory} className="but_submit">Finished</button>
                                </div>
                            </div>

                        </div>
                    </Modal.Body>
                </Modal>

            </div>
        );
    }
}
export default ScheduleHistory;

