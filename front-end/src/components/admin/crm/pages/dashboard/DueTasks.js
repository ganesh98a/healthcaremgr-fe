import React, { Component } from 'react';
import ReactTable from "react-table";
import { Link } from 'react-router-dom';
import { postData} from '../../../../../service/common.js';
import { ROUTER_PATH } from '../../../../../config.js';
import CustomTbodyComponent from './CustomTbodyComponent';


class DueTasks extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        activeCol: '',
        data: [],
      }
    }
    crmParticipantDueTask = () => {
      postData('crm/Dashboard/crm_task_list', this.state).then((result) => {
        // console.log(result);
        if (result.status) {
          this.setState({ data: result.data.data });
  
        } else {
          this.setState({ error: result.error });
        }
      });
    }
    componentWillMount() {
      this.crmParticipantDueTask();
    }
    render() {
      const tabledata = [
        { ndis: '000 000 000', name: 'Roy Agasthyan', overdueaction: 'Plan Delegation', status: 'Pending Phone Contact', date: '26/10/2019', action: "Phone Screening" },
        { ndis: '000 000 000', name: 'Sam Thomason', overdueaction: 'Plan Delegation', status: 'Pending Phone Contact', date: '22/10/2019', action: "Phone Screening" },
        {
          ndis: '000 000 000', name: 'Michael Jackson', overdueaction: 'Plan Delegation', status: 'Pending Phone Contact', date: '36/10/2019', action: "Phone Screening"
        }]
  
      return (
        <div className="Req-Dashboard_tBL">
          <div className="PD_Al_div1">
            <div className="PD_Al_h_txt pt-3 lt_heads">Due Tasks:</div>
            <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
              <ReactTable
                data={this.state.data}
                columns={[
                  {
                    Header: "Task", accessor: "taskname",
                    headerClassName: 'hdrCls', className: (this.state.activeCol === 'name') ? 'borderCellCls' : 'T_align_m1'
                  },
                  {
                    Header: "Participant", accessor: "fullname",
                    headerClassName: 'hdrCls', className: (this.state.activeCol === 'status') ? 'borderCellCls' : 'T_align_m1'
                  },
                  {
                    Header: "Due Date", accessor: "duedate",
                    headerClassName: 'hdrCls', className: (this.state.activeCol === 'date') ? 'borderCellCls' : 'T_align_m1',
                    maxWidth: 120,
                  },
                  {
                    Header: "", headerStyle: { border: '0px solid #000' },
                    maxWidth: 55,
                    Cell: row => (<span className="PD_Al_icon justify-content-center">
                      <Link to={ROUTER_PATH + 'admin/crm/tasks/' + row.original.task_id} title="View"><i className="icon icon-view2-ie LA_i1"></i></Link>
                    </span>)
                  },
                ]}
                defaultPageSize={11}
                pageSize={this.state.data.length}
                showPagination={false}
                sortable={false}
                TbodyComponent={CustomTbodyComponent}
                className="-striped -highlight"
              />
            </div>
            <Link className="btn-1 w-100" to={ROUTER_PATH + 'admin/crm/tasks'}>View All</Link>
          </div>
        </div>
      )
    }
  }
  export default DueTasks;