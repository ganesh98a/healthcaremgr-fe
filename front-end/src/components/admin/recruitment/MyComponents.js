import React, { Component } from 'react';

import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';

import LineChart from 'react-linechart';
import 'react-linechart/dist/styles.css';


class MyComponents extends Component {

    intervalID = 0;

    constructor(){
        super();
        this.state = {
           
            ReviewOnline:'',
            InterviewStatus:'',
            grpInterviewStatus:'',
           

            sliderArray: [
                {img:'http://placehold.it/500x350?text=1', text:'1 :lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..'},
                {img:'http://placehold.it/500x350?text=2', text:'2 :lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..'},
                {img:'http://placehold.it/500x350?text=3', text:'3 :lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..lorem ipsum is a free text made for free printing and typesetting works lorem ipsum is a free..'}
            ],

          
            activeRow:0,
            trans:10,
            transition1:'all ease 0s',
            loadSlide:true
          
        }
    }

    changeIntStatus = (value, key) => {
        var state = {};
        state[key] = value;
        this.setState(state);
    }

    componentDidMount() {

        const sliderArray = this.state.sliderArray;
      
        // array copy the 1st item of list

        const CreateObj = {...sliderArray[0] };

        const arraycopy = this.state.sliderArray;
        arraycopy.push(CreateObj);
        this.setState({sliderArray:arraycopy })

        this.intervalID = setInterval(this.SlideFunct, 4000);
     
    }

   

    slideNav = () => {
        
        if(this.state.loadSlide){
            this.SlideFunct();
            this.setState({loadSlide:false})
        }

       setTimeout(() => {this.setState({loadSlide:true})}, 1000)
    
    }
    
    // loadSl = () => {
    //     this.setState({loadSlide:true})
    // }

    SlideFunct = () => {
       
        const {sliderArray, activeRow} = this.state;
        let arrayLength = sliderArray.length;  
        
            this.setState({
                activeRow: activeRow + 1,
                trans:this.state.trans - 400,
                transition1:'all ease 1s',
            })
 
            if(activeRow === (arrayLength - 2)){
                setTimeout(this.slideOneFunc, 1000)    
            }  

           clearInterval(this.intervalID); 
           this.intervalID = setInterval(this.SlideFunct,  3000);
          
    }


    slideOneFunc = () => {
        this.setState({
            activeRow: 0,
            trans:0,
            transition1:'all ease 0s'
        })
    }

    
    
   


    render() {

        var Timelineoptions = [
            { value: 'success', label: 'Successful' },
            { value: 'pending', label: 'Pending',  },
            { value: 'cancelled', label: 'Cancelled',  }
        ];

        const data = [
            {                                   
                color: "steelblue", 
                points: [{x: 1, y: 2}, {x: 3, y: 5}, {x: 7, y: -3}],

            },
            {                                   
                color: "red", 
                points: [{x: 2, y: 1}, {x: 5, y: 3}, {x:-2, y:5}, {x: -3, y: 7} ],

            }
        ];

       
      return (
        <React.Fragment>
          
                <div className='row'>

                        <div className='col-md-4'>
                                        <div className="filter_fields__ cmn_select_dv timeLine_slct">
                                            <Select name="view_by_status "
                                                required={true} simpleValue={true}
                                                searchable={false} Clearable={false} 
                                                placeholder="Select"
                                                options={Timelineoptions}
                                                onChange={(value) => this.changeIntStatus(value, 'ReviewOnline')}
                                                value={this.state.ReviewOnline}
                                                className={this.state.ReviewOnline}
                                            />
                                        </div> 
                            
                        
                        </div>

                        <div className='col-md-4'>

                                        <div className="filter_fields__ cmn_select_dv timeLine_slct">
                                            <Select name="view_by_status "
                                                required={true} simpleValue={true}
                                                searchable={false} Clearable={false} 
                                                placeholder="Select"
                                                options={Timelineoptions}
                                                onChange={(value) => this.changeIntStatus(value, 'InterviewStatus')}
                                                value={this.state.InterviewStatus}
                                                className={this.state.InterviewStatus}
                                            />
                                        </div>
                        
                        
                        </div>

                        <div className='col-md-4'>

                                    <div className="filter_fields__ cmn_select_dv timeLine_slct">
                                        <Select name="view_by_status "
                                                required={true} simpleValue={true}
                                                searchable={false} Clearable={false} 
                                                placeholder="Select"
                                                options={Timelineoptions}
                                                onChange={(value) => this.changeIntStatus(value, 'grpInterviewStatus')}
                                                value={this.state.grpInterviewStatus}
                                                className={this.state.grpInterviewStatus}
                                        />
                                    </div>

                        
                        </div>

{/*                         
                    <div className='col-md-12' style={{marginTop:'80px'}}>

                        
                        {
                            this.state.sliderArray.map((slide, i) => {
                                return(
                                    
                                    <div className={this.state.activeRow === i ? 'row myRow active':'row myRow'} key={i} >
                                        <div className='col-md-6'>
                                            <p>{slide.text}</p>
                                        </div>
                                        <div className ='col-md-6'>
                                            <img src={slide.img}  style={{width:'100%'}}/>
                                        </div>    
                                    </div>

                                )
                            })
                        }

                        
                         
                     
                    </div>
 */}

                    <div className='col-md-12'>
                        <div className='col-md-6'>
                            
                            <div className='slideBox' style={{border:'solid 1px red'}}>
                                <div style={{transform:'translateY(' + this.state.trans +'px)', transition:this.state.transition1}}>
                                {
                                    this.state.sliderArray.map((slide, i) => {
                                    return(
                                        <div key={i} className={'slides' + ' ' + (this.state.activeRow===i? 'active': '')}>
                                            <p>{slide.text}</p>
                                        </div>
                                    
                                        )
                                    })
                                }
                                </div>
                            </div>
                        </div>

                        <div className='col-md-6'>
                        {
                                    this.state.sliderArray.map((slide, i) => {
                                    return(
                                        <div className={'imgSlide' + ' ' + (this.state.activeRow===i? 'active': '')} key={i}>
                                            <img src={slide.img}  style={{width:'100%'}}/>
                                        </div>
                                    )
                            })
                        }
                        </div>

                    </div>

                    
                    <div className='text-center'> 
                        <span style={{cursor:'pointer'}}>
                            <span onClick={this.slideNav} 
                            style={{cursor:'pointer', fontSize:'20px', fontWeight:'bold', pointerEvents:!this.state.loadSlide?'none':'all', userSelect:'none'}}>>></span>
                        </span>
                    </div>

                     <div style={{width: '100px'}}>
                            <h1>My First LineChart</h1>
                            <LineChart 
                                // width={600}
                                height={150}
                                data={data}
                                 // hidePoints={true}
                            />
                        </div>  

                  {/* <i className='' onClick={this.translate} style={{cursor:'pointer'}}>>></i> */}


                      

                </div>

                <hr/>
        </React.Fragment>
        );
    }
}

export default MyComponents;