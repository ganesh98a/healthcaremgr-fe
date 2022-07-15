import React, { Component } from 'react';
import CKEditor from "react-ckeditor-component";


class Editor extends Component {


    constructor(){
        super();
        this.state = {
           content: ''
           
           
        }
    }

    updateContent = (newContent) => {this.setState({content: newContent})}
    
    onChange = (evt) =>{
      var newContent = evt.editor.getData();
      this.setState({
        content: newContent
      })
    }

    componentDidMount(){
    	import ('../../admin/recruitment/assets/css/editor.css');
    }
   

    render() {


      return (
        	<div className='cstmEditor bigHg'>
                <CKEditor 
                   	activeClass="p10" 
                    content={this.state.content} 
                  	// events={{
                   //          "blur": this.onBlur,
                   //          "afterPaste": this.afterPaste,
                   //          "change": this.onChange
                   //  }}
                />
            </div>
        );
    }
}

export default Editor;