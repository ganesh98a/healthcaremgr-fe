import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';



class ImageCropper extends Component {

    constructor() {
        super();
        this.state = {

            crop: {
                aspect: 1 / 1,
                width: 50,
                x: 10,
                y: 10,

            },

            myCrop: null,
            mypixelCrop: null,
            profModShow: false,
            savePath: null

        }
    }



    onSelectFile = e => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ src: reader.result }),
            );
            reader.readAsDataURL(e.target.files[0]);
        }
        else {
            // this.refs.cstmInp1.value = this.state.savePath

        }
    };

    onImageLoaded = (image, pixelCrop) => {
        this.imageRef = image;
        this.setState({
            profModShow: true
        })


    };

    onCropComplete = (crop, pixelCrop) => {
        // this.makeClientCrop(crop, pixelCrop);
        this.setState({
            myCrop: crop,
            mypixelCrop: pixelCrop
        })

    };

    uploadImg1 = () => {

        // console.log(this.refs.cstmInp1.files[0]);
        // if(this.refs.cstmInp1.value.length > 0){
        //     this.setState({
        //         savePath:this.refs.cstmInp1.files[0].name
        //     }, () => {console.log(this.state.savePath)})
        // }

        this.refs.cstmInp1.value = null;
        this.setState({ src: null })
        this.refs.cstmInp1.click();

    }

    showProf = () => {
        const crop = this.state.myCrop;
        const pixelCrop = this.state.mypixelCrop;
        this.makeClientCrop(crop, pixelCrop);

    }

    onCropChange = crop => {
        this.setState({ crop });
    };

    async makeClientCrop(crop, pixelCrop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                pixelCrop,
                'newFile.jpeg',
            );
            this.setState({ croppedImageUrl, profModShow: false });
        }
    }

    getCroppedImg(image, pixelCrop, fileName) {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
            }, 'image/jpeg');
        });
    }




    render() {



        const { crop, croppedImageUrl, src } = this.state;

        return (


            <div className=''>



                <div className='profile_pic_boxUs'>
                    <div className='prof_picUs'>
                        {croppedImageUrl && (

                            <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
                        )}
                    </div>
                    <span className='icon icon-edit6-ie edt_icn' onClick={this.uploadImg1} ></span>
                    <input type="file" onChange={this.onSelectFile} ref={'cstmInp1'} style={{ width: '250px' }} />
                </div>




                <div className={'profModal ' + (this.state.profModShow ? 'show' : '')} >

                    <i className='icon icon-close2-ie cl_prfMod' onClick={() => { this.setState({ profModShow: false }) }}></i>
                    <div className='profmodal_dialog'>
                        {src && (
                            <ReactCrop
                                src={src}
                                crop={crop}
                                onImageLoaded={this.onImageLoaded}
                                onComplete={this.onCropComplete}
                                onChange={this.onCropChange}
                            />
                        )}
                        <span onClick={this.showProf} className='upldPc_spn'>Upload</span>

                    </div>

                </div>
            </div>

                   
        );
    }
}

export default ImageCropper;