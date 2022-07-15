import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';

class AddJobCategory extends Component {

    constructor() {
        super();
        this.state = {
            documentsSelected: '',

        }
    }


    render() {
       
       

        return (
            <div className={'customModal ' + (this.props.show ? ' show' : '')}>
                <div className="cstomDialog" style={{ width: '600px' }}>

                    <h3 className="cstmModal_hdng1--">
                            Add Job Category
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.close}></span>
                    </h3>

                    <form>
                        <div className="row mt-5 d-flex justify-content-center remove_after_before">
                            <div className="col-lg-8">
                                <label className="label_2_1_1">Category Name</label>
                                <input type="text" className="border-black" />
                            </div>
                        </div>
                       
                        <div className="row mt-5 mb-3 d-flex justify-content-center remove_after_before">
                        <div className="col-lg-4">
                                <button className="btn-1 outline-btn-1 w-100"> Cancel</button>
                            </div>
                            <div className="col-lg-4">
                                <button className="btn-1 w-100"> Add Category</button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>

        );
    }
}

export default AddJobCategory;

