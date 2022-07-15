import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import BlockUi from 'react-block-ui'

import '../scss/components/admin/notification/InfographicSidebar.scss'
import { fetchInfographics } from './actions/InfographicSidebarActions'
import { BASE_URL,JIRA_URL } from '../../../config'

const styles = {
    blockUi: {
        height: '100%',
    },
    iconInfo: {
        fontSize: 24,
        verticalAlign: 'middle',
        marginLeft: 20,
    },
}

/**
 * Renders sidebar containing infographic blocks
 */
class InfographicSidebar extends React.Component {

    /**
     * Fetch infographics when this component is mounted.
     * 
     * This will actually fetch again when closed and opened (remounted)
     * In admin portal, right sidebar will always be remounted (unlike in admin portal which will not)
     */
    componentDidMount() {
        const { dispatch, location } = this.props
        const { pathname } = location || {}

        dispatch(fetchInfographics(pathname))
    }

    /**
     * Handler when right arrow was clicked. Will close this sidebar as result
     * 
     * @param {React.MouseEvent<HTMLSpanElement>} e
     */
    handleOnClickClose = e => {
        const { dispatch } = this.props
        
        dispatch({ 
            type: 'setToggleInfographicSidebar', 
            object: {
                LeftMenuOpen: false, 
                RightMenuOpen: false, 
                NotificationType: ''
            }
        })
    }


    render() {
        const { infographics, loading } = this.props

        return (
            <BlockUi blocking={loading} tag="div" style={styles.blockUi}>
                <div className="infographic-sidebar">
                    <div className="infographic-sidebar-header">
                        <h3 className="d-inline-block">
                            Page information
                        </h3>
                        <span className="icon icon-info d-inline-block" style={styles.iconInfo}></span>
                        <span className="icon-right-arrow d-inline-block" onClick={this.handleOnClickClose}>
                            <span style={{ display: 'inline-block', transform: 'rotate(180deg)'}}>
                                <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation" tabIndex="-1" title="ArrowBack" width="33">
                                    <path d="
                                    M20 11
                                    H7.83
                                    l5.59-5.59
                                    L12 4
                                    l-8 8 8 8 1.41-1.41
                                    L7.83 13
                                    H20v-2z" fill="white" stroke="transparent"></path>
                                </svg>
                            </span>
                        </span>
                    </div>
                    <div className="infographic-sidebar-list">
                        {
                            !loading && (infographics || []).length === 0 && (
                                <div className="no-infographics">
                                    <h4>There are no infographics available</h4>
                                </div>
                            )
                        }
                        {
                            (infographics || []).length > 0 && infographics.map((helpBlock, i) => {

                                const infographicsBaseUrl = `${BASE_URL}uploads/infographics`

                                let src = '/assets/images/no-image-available.png'
                                if (helpBlock.block_image) {
                                    src = `${infographicsBaseUrl}/${helpBlock.block_image}`
                                }
        
                                return (
                                    <React.Fragment key={i}>
                                        {i > 0 && <hr/>}
                                        <div className="infographic-sidebar-block">
                                            <img src={src}/>
                                            <h4>
                                                <b>{helpBlock.block_title}</b>
                                            </h4>
                                            <p>{helpBlock.block_desc}</p>
                                        </div>
                                    </React.Fragment>
                                )
                            })
                        }
                    </div>
                    <div className="infographic-sidebar-footer text-center">
                        <h4>
                            <b>Can't find what you're looking for?</b>
                        </h4>
                        <a href={JIRA_URL} target="_blank" className="btn btn-primary">
                            <b>
                                Click here to access the Help Desk
                            </b>
                        </a>
                    </div>
                </div>

            </BlockUi>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const { location } = ownProps
    const { pathname } = location || {}
    const { data, loading } = state.infographics 

    return {
        infographics: (pathname in data) ? data[pathname].items : [],
        loading
    }
}

export default withRouter(connect(mapStateToProps)(InfographicSidebar))