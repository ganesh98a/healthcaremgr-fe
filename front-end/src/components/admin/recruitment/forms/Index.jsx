import React from 'react'
import { connect } from 'react-redux'
import Select from 'react-select-plus'
import ReactTable from 'react-table'
import jQuery from "jquery"
import _ from 'lodash'

import Pagination from "../../../../service/Pagination.js"
import { defaultSpaceInTable } from '../../../../service/custom_value_data'
import { postData, css, toastMessageShow, archiveALL, reFreashReactTable } from '../../../../service/common'
import moment from 'moment'
import { toast } from 'react-toastify'
import { ToastUndo } from '../../../../service/ToastUndo'
import CreateViewPhoneInterview from '../applicants/CreateViewPhoneInterview.js'


const Modal = ({ title, open = false, children, onCloseModal = null }) => {
    const classNames = {
        modalParent: ['customModal', open && 'show'].filter(Boolean).join(' '),
    }

    return (
        <div className={classNames.modalParent}>
            <div className='cstomDialog widBig'>
                <h3 className="cstmModal_hdng1--">
                    {title}
                    <span className="closeModal icon icon-close1-ie" onClick={onCloseModal}></span>
                </h3>
                {children}
            </div>
        </div>
    )
}

/**
 * @typedef {ReturnType<typeof mapStateToProps>} Props
 * 
 * @extends {React.Component<Props>}
 */
class Index extends React.Component {

    constructor(props) {
        super(props)

        this.reactTable = React.createRef()

        this.state = {
            loading: false,
            filtered: {},
            form: {
                isModalOpened: false,
                isSubmitting: false,
                values: {},
            },
            editForm: {
                isModalOpened: false,
                isSubmitting: false,
                values: {},
            },
            previewForm: {
                isModalOpened: false,
                // will add more items here when 'Preview' is clicked {@see this.handleOnClickPreviewForm}
                // when the modal that was launched by 'Preview' is closed, 
                // the `isModalOpened` will be left, other fields will be removed
            },
            category: {
                loading: false,
                options: [],
            },
            data: [],
        }
    }


    /**
     * Pre-fetch category options for create/update forms
     */
    async componentDidMount() {
        await this.fetchCategoryOptions()
    }


    /**
     * Fetch list of forms.
     * This function gets triggered when 
     * - page loads
     * - a new form is created
     * - form was updated
     * 
     * Note: Don't confuse the `state` param with this component state
     */
    fetchData = async (state) => {
        this.setState(() => ({ loading: true }))

        try {
            const { pageSize, page, sorted, filtered } = state
            const { count, data } = await postData('recruitment/RecruitmentForm/index', { pageSize, page, sorted, filtered })
            this.setState(() => ({
                loading: false,
                pages: parseInt(count),
                data,
            }))
        } catch (e) {
            this.setState(() => ({ loading: true }))
        }
    }


    /**
     * Fetch all category options
     * The options usually are CAB day, group interview, phone interview and reference check
     */
    async fetchCategoryOptions() {
        this.setState(p => ({ category: { ...p.category, loading: true } }))

        try {
            const res = await postData('recruitment/RecruitmentForm/interview_types')
            const categoryOptions = res.map(r => {
                return {
                    value: parseInt(r['id']),
                    label: r['name'],
                }
            })
            this.setState(p => ({ category: { ...p.category, options: categoryOptions, loading: false } }))
        } catch (e) {
            this.setState(p => ({ category: { ...p.category, loading: false } }))
        }
    }


    /**
     * Reset category filters
     */
    resetFilters() {
        this.setState(() => ({ filtered: {} }))
    }


    /**
     * Reset search form. Search is reset via DOM 
     * since search input field is an uncontrolled component
     */
    resetSearch() {
        /**
         * @type {HTMLFormElement}
         */
        const searchFormEl = document.querySelector('form[name=SearchForm]')
        if (searchFormEl) {
            searchFormEl.reset()
        }
    }


    /**
     * Display animated alert message
     * 
     * @param {'success'|'danger'} type 
     * @param {string} message 
     */
    toast(type, message) {
        toast.dismiss();

        if (type === 'success') {
            toast.success(<ToastUndo message={message} showType={'s'} />, {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        } else if (type === 'danger') {
            toast.error(<ToastUndo message={message} showType={'e'} />, {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        }
    }

    /**
     * Display page header
     */
    renderPageHeader() {
        return (
            <div className="row pt-5">
                <div className="col-lg-12 col-md-12 main_heading_cmn-">
                    <div className="d-flex justify-content-between">
                        <h1>Forms</h1>
                        <button type="button" className="btn hdng_btn cmn-btn1 icn_btn12" onClick={() => this.setState(p => ({ form: { ...p.form, isModalOpened: true } }))}>
                            Create New
                            <i class="icon icon-add-icons hdng_btIc"></i>
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    /**
     * Fires when search form is submitted via enter key
     * 
     * @param {React.FormEvent<HTMLFormElement>} e 
     */
    handleOnSubmitSearch = e => {
        e.preventDefault()

        const searchKeyword = document.getElementById("SearchInput").value

        this.setState(p => ({
            filtered: {
                ...p.filtered,
                srch_box: searchKeyword,
            }
        }))
    }


    /**
     * Fires the category filter dropdown changes its value
     * 
     * @param {number} id
     */
    handleOnChangeCategoryFilter = id => {
        this.setState(() => ({ filtered: { category: id } }))
    }


    /**
     * Displays search
     */
    renderSearch() {
        const { category } = this.state.filtered
        const { options, loading } = this.state.category

        const categoryOptions = [
            {
                label: 'All',
                value: 0,
            },
            ...options
        ]

        return (
            <div className="row sort_row1-- after_before_remove">
                <div className="col-lg-9 col-md-8 col-sm-8 no_pd_l">
                    <form onSubmit={this.handleOnSubmitSearch} method="post" name="SearchForm">
                        <div className="search_bar right srchInp_sm actionSrch_st">
                            <input type="text" className="srch-inp" placeholder="Search..." id="SearchInput" title="Searchable by title" />
                            <i className="icon icon-search2-ie"></i>
                        </div>
                    </form>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                    <div className="filter_flx">
                        <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                            <Select
                                name="view_by_category"
                                simpleValue={true}
                                searchable={false}
                                placeholder="Filter by: Category"
                                clearable={false}
                                options={categoryOptions}
                                disabled={loading}
                                value={category}
                                onChange={this.handleOnChangeCategoryFilter}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    /**
     * Show modal containing edit form
     * 
     * @param {{ id: number|string }} props 
     */
    displayEditFormModal({ id }) {
        const { data } = this.state
        const form = data.find(d => parseInt(d.id) === parseInt(id))

        this.resetEditForm()

        this.setState(p => ({
            editForm: {
                ...p.editForm,
                isModalOpened: true,
                editingFormId: id,
                values: {
                    ...p.editForm.values,
                    category: form.interview_type,
                    title: form.title,
                }
            }
        }))
    }

    tooltipForQuestionCount(form) {
        const STATUS_ACTIVE = 1
        const STATUS_INACTIVE = 2
        const numActiveQuestions = (form.questions || []).filter(q => parseInt(q.status) === STATUS_ACTIVE).length
        const numInactiveQuestions = (form.questions || []).filter(q => parseInt(q.status) === STATUS_INACTIVE).length
        const totalNumQuestions = (form.questions || []).length
        return `Active: ${numActiveQuestions}, Inactive: ${numInactiveQuestions}, Total: ${totalNumQuestions}`
    }


    /**
     * Hide modal containing edit form
     */
    closeEditFormModal() {
        this.setState(p => ({
            editForm: {
                ...p.editForm,
                isModalOpened: false,
                editingFormId: null,
                values: {},
            }
        }))
    }

    /*
    * archive form
    */
    archiveForm = (formId) => {
        var msg = "Are you sure want to archive this form";
        archiveALL({ formId }, msg, "recruitment/RecruitmentForm/archive_form").then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, "fetchData");
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }


    /**
     * Renders the table of forms
     */
    renderTable() {

        const { data } = this.state
        const STATUS_ACTIVE = 1

        // STATUS_INACTIVE is actually 2 based on tbl_recruitment_additional_questions.status

        /**
         * @type {Array<import('react-table').Column<any> | { headerClassName?: string, className?: string, sortable?: boolean, Cell: ReactTable.Renderer<ReactTable.CellProps<{value: any}>> }>}
         */
        const columns = [
            {
                accessor: 'title',
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__" title={`Form title`}>Title</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span title={defaultSpaceInTable(props.value)}>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: d => (d.interview_category || {}).name,
                id: 'category',
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__" title={`Type of form`}>Category</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: d => `${(d.questions || []).filter(q => parseInt(q.status) === STATUS_ACTIVE).length}`,
                id: 'question_count',
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__" title={`Number of 'active' questions in this form.`}>Question count</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span title={this.tooltipForQuestionCount(props.original)}>{props.value}</span>,
                width: 80,
            },
            {
                accessor: ({ author = {} }) => {
                    if(author == null) return ;
                    const { id, preferredname, firstname, lastname } = author
                    const result = !!preferredname ? preferredname : [firstname, lastname].filter(Boolean).join(' ')
                    return result
                },
                id: 'author',
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__" title={`The user that created the form`}>Created by</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: 'date_created',
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__" title={`Date and time the form was created`}>Created</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => {
                    const formattedTime = moment(props.value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')
                    const timeTooltip = moment(props.value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY h:mm:ss a')
                    return <time dateTime={props.value} title={timeTooltip}>{defaultSpaceInTable(formattedTime)}</time>
                },
                width: 120
            },
            {
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__" title={`List of currently supported actions for the form.\nNote: Removing form is not yet supported`}>Actions</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: ({ original }) => {
                    // unable to use anchor here to display underlined edit link 
                    // because the global styling is interfering with the ability to style this link
                    return (
                        <>
                            <span
                                style={{ textDecoration: 'underline', cursor: 'pointer', marginRight: 10 }}
                                title={`Preview form questions`}
                                onClick={this.handleOnClickPreviewForm(original)}
                            >
                                Preview
                            </span>
                            <span
                                style={{ textDecoration: 'underline', cursor: 'pointer', marginRight: 10 }}
                                title='Modify form title and category'
                                onClick={() => this.displayEditFormModal({ id: original['id'] })}
                            >
                                Edit
                            </span>
                            <span
                                style={{ textDecoration: 'underline', cursor: 'pointer', marginRight: 0 }}
                                title='Archive form'
                                onClick={() => this.archiveForm(original['id'])}
                            >
                                Archive
                            </span>
                        </>
                    )
                }
            }
        ]


        return (
            <div className="row mt-5">
                <div className="col-sm-12 no_pd_l">
                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                        <ReactTable
                            PaginationComponent={Pagination}
                            ref={this.reactTable}
                            // manual="true"
                            manual
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={this.fetchData}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_val: 'title' }}
                            columns={columns}
                            data={data}
                            defaultPageSize={10}
                            minRows={1}
                            // onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={false}
                            previousText={<span className="icon icon-arrow-left privious"></span>}
                            nextText={<span className="icon icon-arrow-right next"></span>}
                            className="-striped -highlight"

                        // SubComponent={(props) => this.renderSubComponent(props)}
                        />

                    </div>
                </div>
            </div>
        )
    }


    /**
     * Clears the content of the form in the 'Generate form' modal
     */
    resetForm() {

        /**
         * @type {HTMLFormElement}
         */
        const el = document.querySelector("form[name='InterviewGeneratorForm']");
        if (el) {
            el.reset()
        }


        this.setStateFormValues({ category: null })
    }


    /**
     * Clears the content of the form in the 'Edit form' modal
     */
    resetEditForm() {
        /**
         * @type {HTMLFormElement}
         */
        const el = document.querySelector("form[name='EditFormForm']");
        if (el) {
            el.reset()
        }

        this.setState(p => ({
            editForm: {
                ...p.editForm,
                values: {}
            }
        }))
    }


    /**
     * Gets the form values of the 'Generate Form' modal
     */
    getFormValues() {
        /** @type {Partial<HTMLInputElement>} */
        const inputEl = document.getElementById('InterviewGeneratorForm-title')

        return {
            title: (inputEl || {}).value,
            category: this.state.form.values.category
        }
    }


    /**
     * Generic helper method to set form values of 'Generate form' modal
     * 
     * @param {{[k: string]: any} | (k: Record<string, any>) => Record<string, any>} newState 
     */
    setStateFormValues(newState) {
        this.setState(p => {
            let newValues = {}

            if (typeof newState === 'function') {
                newValues = newState(p.form.values)
            } else {
                for (let k in newState) {
                    newValues[k] = newState[k]
                }
            }

            return {
                form: {
                    ...p.form,
                    values: {
                        ...p.form.values,
                        ...newValues
                    }
                }
            }
        })
    }

    /**
     * Validate form values of the form inside 'Generate form' modal
     */
    validate() {
        let $form = jQuery(`form[name=InterviewGeneratorForm]`)
        let validator = $form.validate()
        let isValid = $form.valid()

        if (isValid) {
            return true
        }

        validator.focusInvalid()
        return false
    }


    /**
     * Hides the 'Generate form' modal
     */
    closeFormModal = () => {
        this.setState(p => ({
            form: {
                ...p.form,
                isModalOpened: false,
            }
        }))
    }


    /**
     * Fires when the form of 'Generate form' modal is submitted
     * 
     * @param {React.FormEvent<HTMLFormElement>} e 
     */
    handleOnSubmitForm = async e => {
        e.preventDefault()

        const isValid = this.validate()
        if (!isValid) {
            return false
        }

        this.setState(p => ({ form: { ...p.form, isSubmitting: true } }))
        const values = this.getFormValues()

        try {
            const res = await postData('recruitment/RecruitmentForm/create', values)
            if (!!res.status) {
                this.closeFormModal()
                this.toast('success', res.msg)
                this.resetForm() // resets form to as 'form' via DOM and state
                this.resetSearch() // resets search form via DOM
                this.resetFilters() // will automatically reset both cat dropdown and table because both shares the same filter
            } else {
                this.toast('danger', res.error)
            }
        } catch (e) {
            console.error('ERROR', e)
        }

        this.setState(p => ({ form: { ...p.form, isSubmitting: false } }))
    }


    /**
     * Renders the form inside 'Generate form' modal
     */
    renderCreateForm() {
        const { isSubmitting, values } = this.state.form
        const { category } = values
        const { options, loading: isLoadingCategories } = this.state.category

        return (
            <form action="#" method="POST" onSubmit={this.handleOnSubmitForm} name="InterviewGeneratorForm" noValidate>
                {
                    /*
                        Let's not use span.required as it is weirdly styled
                    */
                }
                <div className="csform-group">
                    <label htmlFor="InterviewGeneratorForm-title">
                        Title <b className="text-danger">*</b>
                    </label>
                    <input
                        type="text"
                        name="InterviewGeneratorForm[title]"
                        id="InterviewGeneratorForm-title"
                        required
                        data-msg-required="Title is required"
                        maxLength={255}
                        data-rule-maxlength="255"
                        data-msg-maxlength="Title cannot be more than 255 characters"
                    />
                </div>
                <div className="csform-group" style={{ maxWidth: 320 }}>
                    <label htmlFor="InterviewGeneratorForm-category">Category <b className="text-danger">*</b></label>
                    <Select className="default_validation"
                        name="InterviewGeneratorForm[category]"
                        id="InterviewGeneratorForm-category"
                        placeholder="Select category"
                        value={category}
                        options={options}
                        onChange={({ value: category }) => this.setStateFormValues(v => ({ category }))}
                        clearable={false}
                        searchable
                        required
                        loading={isLoadingCategories}
                        inputProps={{
                            readOnly: true,
                            'data-msg-required': "The interview category is required"
                        }}
                    />
                </div>
                <div className="csform-group text-right">
                    <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                        {isSubmitting ? `Creating...` : `Create`}
                    </button>
                </div>
            </form>
        )
    }

    /**
     * Fires when the form inside 'Edit form' modal is submitted
     */
    handleOnSubmitEditForm = async e => {
        e.preventDefault()

        const { editForm } = this.state
        const { values, editingFormId } = editForm
        const { category } = values

        const v = {
            title: (document.getElementById('EditFormForm-title') || {}).value,
            category: parseInt(category),
        }

        const isValid = (() => {
            let $form = jQuery(`form[name=EditFormForm]`)
            let validator = $form.validate()
            let isValid = $form.valid()

            if (isValid) {
                return true
            }

            validator.focusInvalid()
            return false
        })()

        if (!isValid) {
            return false
        }

        this.setState(p => ({ editForm: { ...p.editForm, isSubmitting: true } }))

        try {
            const res = await postData(`recruitment/RecruitmentForm/update/${editingFormId}`, v)
            if (!!res.status) {
                this.toast('success', res.msg)
                this.closeEditFormModal()
                this.resetEditForm() // resets form to as 'form' via DOM and state
                this.resetSearch() // resets search form via DOM
                this.resetFilters() // will automatically reset both cat dropdown and table because both shares the same filter
            } else {
                this.toast('danger', res.error)
            }
        } catch (e) {
            console.error('ERROR', e)
        }

        this.setState(p => ({ editForm: { ...p.editForm, isSubmitting: false } }))
    }


    /**
     * Renders the form inside 'Edit form' modal
     */
    renderEditForm() {
        const { editForm } = this.state
        const { isSubmitting, values } = editForm
        const { category, title } = values
        const { options, loading: isLoadingCategories } = this.state.category

        return (
            <form action="#" method="POST" onSubmit={this.handleOnSubmitEditForm} name="EditFormForm" noValidate>
                <div className="csform-group">
                    <label htmlFor="EditFormForm-title">
                        Title <b className="text-danger">*</b>
                    </label>
                    <input
                        type="text"
                        name="EditFormForm[title]"
                        id="EditFormForm-title"
                        required
                        defaultValue={title}
                        data-msg-required="Title is required"
                        maxLength={255}
                        data-rule-maxlength="255"
                        data-msg-maxlength="Title cannot be more than 255 characters"
                    />
                </div>
                <div className="csform-group" style={{ maxWidth: 320 }}>
                    <label htmlFor="EditFormForm-category">Category <b className="text-danger">*</b></label>
                    <Select className="default_validation"
                        name="EditFormForm[category]"
                        id="EditFormForm-category"
                        placeholder="Select category"
                        value={category}
                        options={options}
                        onChange={({ value: category }) => {

                            this.setState(p => ({
                                editForm: {
                                    ...p.editForm,
                                    values: { ...this.state.editForm.values, category, }
                                }
                            }))
                        }}
                        clearable={false}
                        searchable
                        required
                        loading={isLoadingCategories}
                        inputProps={{
                            readOnly: true,
                            'data-msg-required': "The interview category is required"
                        }}
                    />
                </div>
                <div className="csform-group text-right">
                    <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                        {isSubmitting ? `Saving...` : `Save`}
                    </button>
                </div>
            </form>
        )
    }

    /**
     * Renders the 'Generate form' modal
     */
    renderModal({ isModalOpened = false }) {
        return (
            <Modal open={isModalOpened} title="Generate Form" onCloseModal={this.closeFormModal}>
                {this.renderCreateForm()}
            </Modal>
        )
    }


    /**
     * Renders 'Edit form' modal 
     */
    renderEditFormModal({ isModalOpened = false }) {
        return (
            <Modal open={isModalOpened} title="Edit form" onCloseModal={() => this.closeEditFormModal()}>
                {this.renderEditForm()}
            </Modal>
        )
    }

    handleOnClickPreviewForm = form => e => {
        e.preventDefault()

        this.setState(p => {
            return {
                previewForm: {
                    ...p.previewForm,
                    ...form,
                    isModalOpened: true
                }
            }
        })

        this.setState(p => ({ previewForm: { ...p.previewForm, ...form } }))
    }



    // Renders modal for 'Preview Form'
    renderPreviewFormModal(previewForm = {}) {
        const form_id = _.get(previewForm, 'id')
        const interview_type = _.get(previewForm, 'interview_category.key_type')
        const interview_type_label = _.get(previewForm, 'interview_category.name')
        const formTitle = _.get(previewForm, 'title', 'N/A')
        const isModalOpened = _.get(previewForm, 'isModalOpened', false)

        const styles = css({
            formTitle: {
                display: 'inline-block',
                maxWidth: 160,
                verticalAlign: 'bottom',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }
        })

        return isModalOpened && (
            <CreateViewPhoneInterview
                interview_status={true}
                interview_form_id={form_id}
                interview_type={interview_type}
                openModel={isModalOpened}
                closeModel={() => this.setState(p => ({ previewForm: { isModalOpened: false } }))}

                // additional props for the sake of reusing this component
                applications={[{ id: 0, position_applied: false }]}
                applicantId={0}
                submittable={false}
                defaultModalHeading={interview_type_label}
                defaultInterviewTypeLabel={[interview_type_label, 'ID'].filter(Boolean).join(' ')}
                formTitle={<span style={styles.formTitle}>{formTitle}</span>}
            />
        )
    }

    render() {
        const { editForm, form, previewForm } = this.state

        return (
            <>
                {this.renderPageHeader()}
                {this.renderSearch()}
                {this.renderTable()}
                {this.renderModal({ isModalOpened: form.isModalOpened })}
                {this.renderEditFormModal({ isModalOpened: editForm.isModalOpened })}
                {this.renderPreviewFormModal(previewForm)}
            </>
        )
    }
}

const mapStateToProps = state => {
    return {

    }
}

export default connect(mapStateToProps)(Index)