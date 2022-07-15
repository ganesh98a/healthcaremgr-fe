import React from 'react';
// import PDFViewer from 'custom_component/pdf-viewer-reactjs';


const initPDFViewer = (element, loadData) => {
    //console.log('loadData',loadData);
    if (loadData != undefined && loadData != null && typeof (loadData) == 'object' && loadData.hasOwnProperty('src') && loadData.src != '') {

        const iframe = document.createElement("iframe");
        iframe.src = loadData.src;
        iframe.id='iframeTitle'
        iframe.title = 'Advertisement';
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.className = "pdf_viewer_my " + (loadData.hasOwnProperty('extraclassName') ? loadData.extraclassName : '');

        element.appendChild(iframe);
        //console.log('test',document.getElementsByTagName("iframe")[0],window.frames);
    } else {
        const divData = document.createElement("div");
        divData.innerHTML = 'Pdf not available';
        divData.className = 'no_record py-2 w-100';
        element.appendChild(divData);
    }
};


class PDFViewerMY extends React.Component {
    constructor(props) {
        super(props);
        this.viewerRef = React.createRef();
    }

    componentDidMount() {
        const element = this.viewerRef.current;
        initPDFViewer(element, this.props.loadData);
    }

    styleLoad = (styleData) => {
        let styleDataAdd = {};
        if (styleData != undefined && styleData != null && typeof (styleData) == 'object') {
            styleDataAdd = Object.assign({}, styleData);
        }
        if (!styleDataAdd.hasOwnProperty('width')) {
            styleDataAdd['width'] = '100%';
        }
        if (!styleDataAdd.hasOwnProperty('height')) {
            styleDataAdd['height'] = '900px';
        }
        return styleDataAdd;
    }

    render() {
        return (
            <div>

                    {/* <PDFViewer
                        css={'my_pdf_viewer'}
                        document={this.props.loadData}
                        navbarOnTop={true}
                    />  */}

                <div
                    ref={this.viewerRef}
                    id="viewer"
                    style={this.styleLoad(this.props.extraStyle)}
                />
            </div>

        );
    }
}
PDFViewerMY.defaultProps = {
    loadData: {
        src: '',
        extraclassName: ''
    },
    extraStyle: {},

};

export default PDFViewerMY;
