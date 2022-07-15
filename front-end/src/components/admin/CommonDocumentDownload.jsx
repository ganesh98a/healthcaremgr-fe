import React, { Component } from 'react';
import {css, postData} from '../../service/common';
import jQuery from 'jquery';
import { BASE_URL } from '../../config.js';

const requestData = (post_url, module_id, base_url) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { module_name: module_id};
        postData(post_url, Request).then((result) => {
            if (result.status) {
                window.setTimeout(function(){                
                    window.location.href = base_url + '&link=' + result.token;
                }, 2000); 
            } else {                
                resolve(false);            
            }
           
        });

    });
};

class CommonDocumentDownload extends Component {
    constructor(props) { 
        super(props);
        this.state = {           
            url: 'common',            
            message: ''
            
        }
    }
    componentDidMount() {        
        jQuery('#navbarheader, footer').hide();
        let params = this.props.props.location.search;
        params =  params.replace('%3D', '');
        params = params.replace('?url=', '');
      
        this.setState({base_url: BASE_URL + params}, () => {
            this.fetchDocumentData(this.state);
        });

    }
    fetchDocumentData = (state, instance) => {
                
         requestData(
             'common/Common/verifydocumentDownload',           
             this.props.props.match.params.module_id,
             this.state.base_url,
         ).then(res => {
             if(!res) {
                window.location.href = '/admin/no_access';
             }
             
         });
     }
  
    /**
     * Render Page Header
     */
   
    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center'
            }
        })
        return (
            <React.Fragment>
                <div className="container-fluid fixed_size">
                    <div className="slds slds-grid slds-grid_horizontal" style={styles.root}>
                        <div className="slds-col col-lg-12 custom_page_header max-width-res">
                           
                            <h2 > {this.state.message} </h2>
                        </div>
                    </div>
                </div>
            </React.Fragment >
        );
    }
}

export default CommonDocumentDownload;
