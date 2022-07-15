import React, { Component } from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false, error: ''};
    }

    componentDidCatch(error, info) {
        //do not comment this console.log
        console.log(error);
        // Display fallback UI
        this.setState({hasError: true, error: error});

        // You can also log the error to an error reporting service
        //logErrorToMyService(error, info);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return(
                    <React.Fragment>
                        <div>
                            <div className="error_bg" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' }}>
                                <div>
                                    <h2 className="text-center">Oops!</h2>
                                    <p className="text-center">Something went wrong.</p>
                                    <div className="pt-4"><a className="but px-5 VEC_btn" style={{width: '140px', marginLeft: 'auto', marginRight: 'auto'}} href={'/admin/dashboard/'}>Back To Home</a></div>    
                                </div>
                            </div>
                        </div>        
                    </React.Fragment>
            )}

            return this.props.children;
    }
}

export default ErrorBoundary;