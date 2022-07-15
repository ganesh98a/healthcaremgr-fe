
import React from 'react';

const GenderAnalysisChart = (props) => {
let totalGenderPer = props.calculatePercentage(props.genderData,'total');

    return (
        <div className="col-lg-4 col-md-4 DG_aa-1">
        <h4 className="mb-3"> Gender Demographic Analysis:</h4>
        <div className="px-5">
            <div className="DG-aa-2a">
                Of the 50% of Participants that are
                    HCM Managed
                                        </div>
        </div>



        <div className="Gender_chart__ mt-5">
            <div className="Gender_title__">
                <div className="G_t0_">Male</div>
                <div className="G_t0_">Female</div>
            </div>

            <div className="Gender_body_">
            {props.genderData.length >0 ? props.genderData.map((value, idxx) => {
                let malePer = value.hasOwnProperty('data') ? props.calculatePercentage(value.data,'male'):0;
                let femalePer = value.hasOwnProperty('data') ? props.calculatePercentage(value.data,'female'):0;
                return(
                <div className="Gender_list01_" key={idxx}>
                    <div className="Gender_list01a_">
                        <div className="Gender_grhap_">
                            <div className="male_per__">
                                <div style={{width:malePer+'%'}}>
                                <div className="custom_tooltip__">
                                    <div className="custom_tooltip01__">
                                        <span>Male: </span><span>{value.hasOwnProperty('data') && value.data.hasOwnProperty('male') ? parseInt(value.data.male) :0}</span>
                                    </div>
                                    <div className="custom_tooltip02__">
                                        <span>Percentage: </span><span>{malePer.toFixed(2)}%</span>
                                    </div>
                                </div>
                                </div>

                            </div>
                            <div  className="female_per__">
                                <div style={{width:femalePer+'%'}}>
                                <div className="custom_tooltip__">
                                    <div className="custom_tooltip01__">
                                        <span>Female: </span><span>{value.hasOwnProperty('data') && value.data.hasOwnProperty('female') ? parseInt(value.data.female) :0}</span>
                                    </div>
                                    <div className="custom_tooltip02__">
                                        <span>Percentage: </span><span>{femalePer.toFixed(2)}%</span>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="Gender_agge_"> {value.hasOwnProperty('title') ? value.title:''}</div>
                </div>)}) : (<React.Fragment />) }
            </div>

            <div className="Gender_total_ bt-1">
                <div className="Gender_total01_">Total by Gender</div>
                <div className="Gender_total02_">

                <div className="Gender_list01_">
                    <div className="Gender_list01a_">
                        <div className={"Gender_grhap_ " + ((totalGenderPer.hasOwnProperty('male') && totalGenderPer.male<= '20') || (totalGenderPer.hasOwnProperty('female') && totalGenderPer.female<= '20') ? 'perAlignment' : '' )}>
                            <div className="male_per__">
                                <div style={{width:(totalGenderPer.hasOwnProperty('male')?(isNaN(totalGenderPer.male)?0:totalGenderPer.male):0)+'%'}}><span>{(totalGenderPer.hasOwnProperty('male')?totalGenderPer.male.toFixed(2):0)+'%'}</span></div>
                            </div>
                            <div  className="female_per__">
                                <div style={{width:(totalGenderPer.hasOwnProperty('female')?(isNaN(totalGenderPer.female)?0:totalGenderPer.female):0)+'%'}}><span>{(totalGenderPer.hasOwnProperty('female')?totalGenderPer.female.toFixed(2):0)+'%'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>


                </div>
            </div>
        </div>




    </div>
    );
}
GenderAnalysisChart.defaultProps = {
    genderData:[{title:'U18',data:{male:50,female:60}}],
    showToolTip:true,
    calculatePercentage:(propData,type) =>{
        if(type =='male' || type =='female'){
            let per =0;
            let male = propData.hasOwnProperty('male') ? parseInt(propData.male):0;
            let female = propData.hasOwnProperty('female')? parseInt(propData.female):0;
            let total = male+female;
            if(type =='male'){
                per =total >0 ?  male/total : 0;

            }else if(type =='female'){
                per =total >0 ?  female/total : 0;
            }
            per = per *100;
            return per;
        }else if(type =='total'){
            let perMale =0;
            let perFemale =0;
            var totalMale = 0;
            var totalFemale = 0;
            propData.map((value, idxx) => {
                totalMale += value.hasOwnProperty('data') && value.data.hasOwnProperty('male') ? parseInt(value.data.male) : 0;
                totalFemale += value.hasOwnProperty('data') && value.data.hasOwnProperty('female') ? parseInt(value.data.female) : 0;
                return ('');
            });
            let totalGender =  totalMale+totalFemale;
            perMale = totalMale/totalGender;
            perFemale = totalFemale/totalGender;
            perMale = perMale *100;
            perFemale = perFemale *100;
            let dataGender = {};
            dataGender['male'] = isNaN(perMale)?0:perMale;
            dataGender['female'] = isNaN(perFemale)?0:perFemale;
            return dataGender;
        }else{
            return 0;
        }

    }


};

export { GenderAnalysisChart };
