// @ts-nocheck
import { Button, Icon, IconSettings, Input, PageHeader, Tabs, TabsPanel, Textarea ,InputIcon,Tooltip} from "@salesforce/design-system-react";
import { ROUTER_PATH } from "config.js";
import { answerTypeDrpDown, questionStatus, yesOrNoOption ,FillUpAnswerType} from "dropdown/recruitmentdropdown.js";
import jQuery from "jquery";
import { default as React } from "react";
import { Redirect } from "react-router-dom";
import { toast } from "react-toastify";
import { postData } from "service/common.js";
import { ToastUndo } from "service/ToastUndo.js";
import { css } from "../../../../service/common";
import SelectList from "../../oncallui-react-framework/input/SelectList";
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

class AssessmentTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jobTypeOptions: [
                { value: 3, label: "Residential Youth Workers (CYF)" },
                { value: 4, label: "Disability Support Workers" },
                { value: 5, label: "Oncall Job Ready" },
            ],
            locationOptions: [
                { value: "NA", label: "NA" },
                { value: "VIC", label: "VIC" },
                { value: "QLD", label: "QLD" },
            ],
            question_answers_list: [{ question: "", is_mandatory: false, grade: null, answer_type: null,has_error:false, options: [] }],
            oa_template_id: props.props.match.params.id ? props.props.match.params.id:0,
            redirect:null,
            status: 1
        };

        this.rootRef = React.createRef();
        this.reactTable = React.createRef();
        this.documentListRef = React.createRef();
        
    }

    componentDidMount() {
        jQuery(this.rootRef.current).parent(".col-lg-11").removeClass("col-lg-11").addClass("col-lg-12");
        if (this.state.oa_template_id) {
            this.getTemplateData();		               
           }
	}
    /**
     * retrieving the template
     */
    getTemplateData() {
        this.api_request("recruitment/Recruitment_oa_template/get_oa_template", { id: this.state.oa_template_id }, false);
    }

    /**
     * handling the option change event
     */
    handleChangeOptions = (value, key, parent_index, index) => {
        let question_answers_list = this.state.question_answers_list;
        question_answers_list[parent_index]["options"][index][key] = value;
        this.setState({ question_answers_list: question_answers_list }, () => {
            if (key === "is_correct") {
                if (question_answers_list[parent_index]["answer_type"] == 2 || question_answers_list[parent_index]["answer_type"] == 3) {
                    question_answers_list[parent_index]["options"].forEach((val, ind) => {
                        if(ind != index)
                        {
                            question_answers_list[parent_index]["options"][ind]["is_correct"] = false;
                        }
                    });
                    this.setState({ question_answers_list: question_answers_list });
                }
            }
        
        });
    };

    /**
     * handling the status change event
     */
    handleChange = (value, key, index) => {
        let question_answers_list = this.state.question_answers_list;
        question_answers_list[index][key] = value;
        this.setState({ question_answers_list: question_answers_list }, () => {
            if (key === "answer_type") {
                this.handleDifferentAnswerType(index, value);
            }
        });
    };

    /**
     * handling the question delete
     */
    deleteHandler = (index) => {
        let question_answers_list = this.state.question_answers_list;
        question_answers_list.splice(index, 1);
        this.setState({ question_answers_list });
    };
    /**
     * handling the add question
     */
    addNewQuestion = () => {
        let question_answers_list = this.state.question_answers_list;
        question_answers_list[this.state.question_answers_list.length] = { question: "", is_mandatory: false, grade: null, answer_type: null, options: [] };

        this.setState({ ...question_answers_list });
    };
    /**
     * handling the add option
     */
    addOption = (index) => {
        let question_answers_list = this.state.question_answers_list;
        let existing_options = question_answers_list[index]["options"];
        question_answers_list[index]["options"][existing_options.length] = { option: "", is_correct: false };
        this.setState({ ...question_answers_list });
    };

    /**
     * delete options handler
     */
    deleteOptionsHandler=(parent_index, index)=>{
        let question_answers_list = this.state.question_answers_list;
        question_answers_list[parent_index]["options"].splice(index,1)
        this.setState({ ...question_answers_list });
    }
    /**
     * handling the answer type change
     */
    handleDifferentAnswerType = (index, answer_type) => {
        let question_answers_list = this.state.question_answers_list;
        let ary_type = [];
        if (answer_type == 2 || answer_type == 1) {
            ary_type = [
                { option: "", is_correct: false,unique:true },
                { option: "", is_correct: false,unique:true},
                { option: "", is_correct: false,unique:true},
            ];
        } else if (answer_type == 3) {
            ary_type = [
                { option: "True", is_correct: false,unique:true},
                { option: "False", is_correct: false,unique:true},
            ];
        } else if (answer_type == 4) {
            ary_type = [{ option: "", is_correct: false,unique:true}];
        }
        question_answers_list[index]["options"] = [...ary_type];
        this.setState({ ...question_answers_list });
    };

    /**
     * setting options based on answer type
     */
    checkAnswerType = (ansType) => {
        var ary_type = [];
        if (ansType == 2 || ansType == 1) {
            ary_type = [
                { checked: false, value: "", lebel: "A" },
                { checked: false, value: "", lebel: "B" },
                { checked: false, value: "", lebel: "C" },
                { checked: false, value: "", lebel: "D" },
            ];
        } else if (ansType == 3) {
            ary_type = [
                { checked: false, value: "True", lebel: "A" },
                { checked: false, value: "False", lebel: "B" },
            ];
        } else if (ansType == 4) {
            ary_type = [{ checked: true, value: "", lebel: " Key" }];
        }
        return ary_type;
    };

    /**
     * When component is mounted, remove replace the parent element's
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentWillMount() {
        jQuery(this.rootRef.current).parent(".col-lg-11").removeClass("col-lg-11").addClass("col-lg-12");
    }

    /**
     * handling change events of the fields
     */
    selectChange(selectedOption, fieldname) {
        if (fieldname == "answer_type" && this.state.answer_type != selectedOption) {
            this.checkAnswerType(selectedOption);
        }
        let state = this.state;
        state[fieldname] = selectedOption;
        this.setState({ state });
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        return (
            <PageHeader
                details={[
                    {
                        content: (
                            <form id="form_question_1" style={{ display: "inline-block", width: "150%" }}>
                                <Input
                                    id="oa_template_title"
                                    label="Title"
                                    onChange={(event, data) => {
                                        this.setState({ title: data.value });
                                    }}
                                    required={true}
                                    value={this.state.title}
                                    variant="text"
                                />
                            </form>
                        ),
                    },
                    {
                        content: (
                            <form id="form_question_2" style={{ display: "inline-block", width: "150%", marginLeft: 50 }}>
                                <span style={{ width: 100 + "%" }}>
                                    <SelectList
                                        required={true}
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                        placeholder="Job Sub Category"
                                        options={this.state.jobTypeOptions}
                                        onChange={(e) => this.selectChange(e, "job_type")}
                                        value={this.state.job_type}
                                        name="Job Sub Category"
                                        inputRenderer={(props) => <input type="text" name="job_type" {...props} readOnly />}
                                    />
                                </span>
                            </form>
                        ),
                    },
                    {
                        content: (
                            <form id="form_question_3" style={{ display: "inline-block", width: "75%", marginLeft: 120 }}>
                                <SelectList
                                    required={true}
                                    simpleValue={true}
                                    searchable={false}
                                    clearable={false}
                                    placeholder="Select Location"
                                    options={this.state.locationOptions}
                                    onChange={(e) => this.selectChange(e, "location")}
                                    value={this.state.location}
                                    name="Location"
                                    inputRenderer={(props) => <input type="text" name="location" {...props} readOnly />}
                                />
                            </form>
                        ),
                    },
                    {
                        content: (
                            <form id="form_question_4">
                                <SelectList
                                    required={true}
                                    simpleValue={true}
                                    searchable={false}
                                    clearable={false}
                                    placeholder="Status"
                                    disabled={!this.state.oa_template_id}
                                    options={questionStatus("", "")}
                                    onChange={(e) => this.selectChange(e, "status")}
                                    value={this.state.status}
                                    name="Status"
                                    inputRenderer={(props) => <input type="text" name="status" {...props} readOnly />}
                                />
                            </form>
                        ),
                    },
                ]}
                icon={<Icon assistiveText={{ label: "assessment" }} category="standard" name={`file`} size="small" />}
                label={`  `}
                title={this.state.oa_template_id ? "Update Online Assessment" : "Create Online Assessment"}
                variant="record-home"
            />
        );
    }


     /**
     * handling cancel template
     */
    cancelTemplate = () => {
        this.setState({ redirect:  ROUTER_PATH + `admin/recruitment/oa_template`});
    };

    /**
     * Render Q & A
     */
    renderRelatedTab() {
        return (
            <React.Fragment>
                <div className="slds-col slds-m-top_medium pl-3 pr-3" style={{ border: "none", paddingTop: 0, paddingBottom: 0, marginTop: 0}}>
                    {this.renderHeaderAction()}
                </div>
            </React.Fragment>
        );
    }
    
    renderReorderTab(){
        const SortableItem = SortableElement(({value}) => <div className="question_draggable">:: {value}</div>)

        const SortableList = SortableContainer(({items}) => {
            return (
           
                <div>
                   {this.state.question_answers_list.filter(value => value.question.length > 0).map((value, index) => (
                        <SortableItem key={`sort-${index}`} index={index} value={value.question} />
                   ))}
                </div>
            );
        });
        return (
            <React.Fragment>
                <SortableList items={this.state.question_answers_list} onSortEnd={this.onReorderSortEnd} />
            </React.Fragment>
        );
    }
    
    onReorderSortEnd = ({oldIndex, newIndex}) => {
        this.setState(({question_answers_list}) => ({
            question_answers_list: arrayMove(question_answers_list, oldIndex, newIndex),
        }));
    };

     /**
     * common method to handle API request
     */
    api_request = (url, requestData, route_to = false) => {
        this.setState({ loading: true }, () => {
            postData(url, requestData).then((result) => {
                if (result.status) {
                    this.setState({ loading: false });
                    if (route_to) {
                        toast.success(<ToastUndo message={result.msg} showType={"s"} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true,
                        });
                        this.setState({ redirect:  ROUTER_PATH + `admin/recruitment/oa_template`});
                    } else {
                        this.setState({ loading: false, question_answers_list: result.data.question_answers_list }, () => {
                            this.setState({
                                title: result.data.assessment_template.title,
                                location: result.data.assessment_template.location,
                                job_type: result.data.assessment_template.job_type,
                                status: result.data.assessment_template.status,
                            });
                        });
                    }
                } else {
                  
                    toast.error(<ToastUndo message={result.msg} showType={"e"} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true,
                    });
                    this.setState({ loading: false });
                    //this.setState({ redirect:  ROUTER_PATH + `admin/recruitment/oa_template`});
                }
            });
        });
    };

    /**
     * handling save template
     */
    saveTemplate = (e) => {
        if (jQuery("#oa_form_question").valid() && jQuery("#form_question_1").valid() && jQuery("#form_question_2").valid() && jQuery("#form_question_3").valid() && jQuery("#form_question_4").valid()) {
            let assessment_template = {
                title: this.state.title,
                location: this.state.location,
                job_type: this.state.job_type,
                status: this.state.status,
            };
            let requestData = { assessment_template, question_answers_list: this.state.question_answers_list,id: this.state.oa_template_id};
            this.api_request("recruitment/Recruitment_oa_template/create_update_oa_template", requestData, true);
        }else{
            const scrollTop = document.documentElement.getElementsByClassName('tooltip')[0].parentElement.getBoundingClientRect().top + document.documentElement.scrollTop;
            document.documentElement.scrollTop=scrollTop - 150;
        }
       
    };
    /**
     * Render Header action for change owner/ cab certificate
     */
    renderHeaderAction = () => {
        return (
            <React.Fragment>
                <form id="oa_form_question">
                    {this.state.question_answers_list.map((item, index) => (
                        <>
                            {this.state.question_answers_list.length > 1 && (
                                <div className="row mt-3">
                                    <div className="col-md-12 col-lg-12">
                                        <span
                                            onClick={() => {
                                                this.deleteHandler(index);
                                            }}
                                        >
                                            <Icon assistiveText={{ label: "delete" }} category="utility" name="delete" size="small" style={{ float: "right", position: "absolute", top: -10, right: 10, cursor: "pointer" }} />
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="row mt-2" key={index}>
                                <div className="col-md-12 col-lg-12">
                                {this.state.question_answers_list[index]["answer_type"] == 6 && ( <Textarea
                                        label=" "
                                       
                                        required={true}
                                        className="slds-textarea text_area_height_150"
                                        name={"Question_" + index}
                                        label={"Question" + " " + (index + 1)}
                                        placeholder="Describe Question"
                                        onChange={(e) => {
                                            this.handleChange(e.target.value, "fill_up_formatted_question", index);
                                        }}
                                        value={this.state.question_answers_list[index]["fill_up_formatted_question"]}
                                    />)}
                                      {this.state.question_answers_list[index]["answer_type"] != 6 && (  <Textarea
                                        label=" "
                                       
                                        required={true}
                                        className="slds-textarea text_area_height_150"
                                        name={"Question_" + index}
                                        label={"Question" + " " + (index + 1)}
                                        placeholder="Describe Question"
                                        onChange={(e) => {
                                            this.handleChange(e.target.value, "question", index);
                                        }}
                                        value={this.state.question_answers_list[index]["question"]}
                                    />)}
                                </div>
                            </div>
                            <div
                                className="row"
                                style={{
                                    "border-bottom": "1px solid rgb(218, 218, 218)",
                                    "border-right": "1px solid rgb(218, 218, 218)",
                                    "border-left": "1px solid rgb(218, 218, 218)",
                                    position: "relative",
                                    width: "100%",
                                    left: "7px",
                                    height: "80px",
                                    bottom: "5px",
                                }}
                            >
                                <div className="col-md-3 col-lg-3 mt-1">
                                    <SelectList
                                        required={true}
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                        placeholder="Type"
                                        label={"Type"}
                                        options={answerTypeDrpDown()}
                                        onChange={(e) => this.handleChange(e, "answer_type", index)}
                                        value={this.state.question_answers_list[index]["answer_type"]}
                                        name={"Type_" + index}
                                        inputRenderer={(props) => <input type="text" name="answer_type" {...props} readOnly />}
                                    />
                                </div>
                                {this.state.question_answers_list[index]["answer_type"] == 6 &&( <div className="col-md-2 col-lg-2 mt-1">
                                    <SelectList
                                        required={true}
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                        placeholder="FillUpAnswerType"
                                        label={"AnswerType"}
                                        options={FillUpAnswerType()}
                                        onChange={(e) => this.handleChange(e, "blank_question_type", index)}
                                        value={this.state.question_answers_list[index]["blank_question_type"]}
                                        name={"Type_" + index}
                                        inputRenderer={(props) => <input type="text" name="blank_question_type" {...props} readOnly />}
                                    />
                                </div>)}
                                <div className="col-md-2 col-lg-2 mt-1">
                                    <SelectList
                                        required={true}
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                       
                                        placeholder="Mandatory"
                                        options={yesOrNoOption()}
                                        onChange={(e) => this.handleChange(e, "is_mandatory", index)}
                                        value={this.state.question_answers_list[index]["is_mandatory"]}
                                        name={"Mandatory_" + index}
                                        label={"Mandatory"}
                                        inputRenderer={(props) => <input type="text" name="is_mandatory" {...props} readOnly />}
                                    />
                                </div>
                                {this.state.question_answers_list[index]["answer_type"] == 5 &&(  <div className="col-md-3 col-lg-3 mt-1">
                                    <Input
                                        id="oa_question_crop_follow_count"
                                        label="Follow Up Question"
                                        onChange={(event, data) => {
                                            this.handleChange(data.value, "follow_up_questions_crp", index);
                                        }}
                                       
                                        name={"follow_up_questions_crp_" + index}
                                        required={true}
                                        value={this.state.question_answers_list[index]["follow_up_questions_crp"]}
                                        variant="counter"
                                        minValue={1}
                                    />
                                </div>)}
                                <div className="col-md-3 col-lg-3 mt-1">
                                    <Input
                                        id="oa_question_total_grade"
                                        label="Total Grade(Points)"
                                        onChange={(event, data) => {
                                            this.handleChange(data.value, "grade", index);
                                        }}
                                       
                                        name={"Grade_" + index}
                                        required={true}
                                        value={this.state.question_answers_list[index]["grade"]}
                                        variant="counter"
                                        minValue={1}
                                    />
                                </div>
                            </div>
                            <div className="row" style={{ marginLeft: 0 }}>
                                {this.state.question_answers_list[index]["answer_type"] &&  this.state.question_answers_list[index]["answer_type"] < 4 && (<div className="col-md-10 col-lg-10 mt-2"><label className="slds-form-element__label" htmlFor="text-input-id-1">
                                <abbr className="slds-required" title="required">* </abbr> Answer:</label></div>)}
                                {this.state.question_answers_list[index]["answer_type"] && this.state.question_answers_list[index]["answer_type"] < 4 && (<div className="col-md-2 col-lg-2 mt-2">  <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                <abbr className="slds-required" title="required">* </abbr>Correct Answer:</label></div>)}
                            </div>

                            {this.state.question_answers_list[index]["options"] &&
                                this.state.question_answers_list[index]["options"].map((opt_val, opt_ind) => (
                                    <div className="row mt-2" style={{ marginLeft: 0 }}>
                                        <div className="col-md-10 col-lg-10">
                                            {this.state.question_answers_list[index]["answer_type"] < 4 && (
                                                <Input
                                                aria-describedby="error-4"
                                                errorText=""
                                                    id="oa_template_answer"
                                                    onChange={(event, data) => {
                                                        this.handleChangeOptions(data.value, "option", index, opt_ind);
                                                    }}
                                                    iconRight={
                                                        this.state.question_answers_list[index]["options"].length > 2 && (<InputIcon
                                                            assistiveText={{
                                                                icon: 'Delete',
                                                            }}
                                                            name="delete"
                                                            category="utility"
                                                            onClick={() => {
                                                                this.deleteOptionsHandler(index, opt_ind);
                                                            }}
                                                        />)
                                                    }
                                                    required={true}
                                                    value={this.state.question_answers_list[index]["options"][opt_ind]["option"]}
                                                    variant="text"
                                                    name={"Option" + index + "_" + opt_ind}
                                                />
                                            )}
                                        </div>
                                        <div className="col-md-2 col-lg-2"  >
                                            {this.state.question_answers_list[index]["answer_type"] < 4 && (
                                                    <>
                                                    <input
                                                      
                                                        id={"ans_" + index + "_" + opt_ind}
                                                        type="checkbox"
                                                        value={this.state.question_answers_list[index]["options"][opt_ind]["is_correct"]}
                                                        style={{borderNone:'none','position':'absolute'}}
                                                        className="dev_required"
                                                        name={"radio-group"+ index}
                                                        checked={this.state.question_answers_list[index]["options"][opt_ind]["is_correct"] == "1" ? "checked" : ""}
                                                        onChange={(e) => {
                                                            this.handleChangeOptions(e.target.checked, "is_correct", index, opt_ind);
                                                        }}
                                                        required={true}
                                                    />
                                                    <label htmlFor={"ans_" + index + "_" + opt_ind} style={{   right: 71,
                                               position: 'absolute'}}>
                                                        <Icon assistiveText={{ label: "check" }}                                                 
                                                  category="action"  size="xx-small" name="check" 
                                                  /></label>
                                                 
                                               </>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            <div className="row mt-2">
                                {this.state.question_answers_list[index]["answer_type"] && this.state.question_answers_list[index]["answer_type"] < 3 && (
                                    <Button  label="Add Option" style={{ marginLeft: 14 + "px" }} variant="neutral" onClick={() => this.addOption(index)} />
                                )}
                                {this.state.question_answers_list.length - 1 === index && <Button  label="Add Next Question" style={{ marginLeft: 10 + "px" }} onClick={() => this.addNewQuestion(index)} variant="neutral" />}
                            </div>
                        </>
                    ))}
                    <div className="row mt-2" style={{ "border-top": "1px solid #dadada" }}>
                        <div className="button-container" style={{ width: 100 + "%", marginTop: 10 }}>
                            <Button   label="Save" style={{ float: "right", marginLeft: 10, marginRight: 10 }} variant="neutral" onClick={(e) => this.saveTemplate(e)} />
                            <Button   label="Cancel" style={{ float: "right", marginRight: 10 }} onClick={() => this.cancelTemplate()} variant="neutral" />
                        </div>
                    </div>
                </form>
            </React.Fragment>
        );
    };

    /**
     * Render the sidebar
     */
    renderSidebar() {
        const styles = css({
            root: {
                fontSize: 12,
                height: "100%",
                backgroundColor: "white",
                border: "none",
            },
            sidebarBlock: {
                marginBottom: 15,
            },
        });

        return <div style={styles.root} className="SLDSRightSidebar"></div>;
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />;
        }

        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
                fontSize: 13,
            },
        });

        return (
            <div style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    {this.renderPageHeader()}
                    <div className="">
                        <div class="slds-col">
                            <div className="slds-grid slds-wrap slds-gutters_x-small" >
                                <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box ">
                                        <Tabs>
                                            <TabsPanel label="Q & A">{this.renderRelatedTab()}</TabsPanel>
                                        </Tabs>
                                    </div>
                                    {false && <div className="col col-sm-3">{this.renderSidebar()}</div>}
                                </div>
                                {/* Create task for Application */}
                                <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12">
                                    <div className="white_bg_color slds-box task_tab_des" >
                                        <div class="slds-grid slds-grid_vertical ">
                                            <div class="slds-col ">
                                                <Tabs>
                                                    <TabsPanel label="Reorder">{this.renderReorderTab()}</TabsPanel>
                                                </Tabs>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </IconSettings>
            </div>
        );
    }
}

export default AssessmentTemplate;
