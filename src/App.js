import './App.css';
import {Component} from 'react';
import * as tf from '@tensorflow/tfjs';
// import Dropdown from 'react-bootstrap/Dropdown'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { SpinnerCircular, SpinnerRoundFilled } from 'spinners-react';
import { Conv2DBackpropFilter } from '@tensorflow/tfjs';

tf.ENV.set('WEBGL_PACK', false)
// import { CameraFeed } from './camera-feed';
var axios = require('axios');
var qs = require('qs');

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


function updateState(value, url){
  this.setState( {value: value, display:true})
  this.setState({ image: URL.createObjectURL(url) })
}

async function uploadImage(file) {
  console.log("UPLOAD")
  const formData = new FormData();
  formData.append('file', file);
  console.log(file)
  var url = URL.createObjectURL(file)
  console.log("URL : ", url)
  
  this.setState({ image: url, loading:true })
  if( this.state[this.state.modelname] === null){
    var json = 'http://127.0.0.1:8080/'+this.state.modelname+'/model.json' 
    var model = await tf.loadGraphModel(json)
    this.setState( { [this.state.modelname]: model} )
  }

  const image = new Image()
  image.src = url
  image.onload = async () => {
    var nbr = this.doStuff(image)
    var v = await nbr.array()
    this.setState( {value: v.toFixed(), image: url, display:true} )
  }
}

  
class Count extends Component{
  constructor(props) {
    super(props);
    this.state ={
      value: null,
      display:false,
      loading: false,
      image:null,
      ShanghaiA:null,
      ShanghaiB:null,
      A10:null,
      modelname:'ShanghaiA',
      resolutionHeight: null,
      resolutionWidth: null,
      modelResolution: {ShanghaiA: [113,86], ShanghaiB: [256,192], A10: [113, 86]}
    }
    
  }

  async componentDidMount(){
    updateState = updateState.bind(this)
    uploadImage = uploadImage.bind(this)
    var json = 'https://tfecounintg.000webhostapp.com/model.json'
    // var json = 'http://127.0.0.1:8080/ShanghaiA/model.json'
    const model = await tf.loadGraphModel(json)
    var resolutionWidth = 113
    var resolutionHeight = 86
    while(resolutionWidth < window.innerWidth/1.5 && resolutionHeight < window.innerHeight/1.5){
      resolutionWidth = resolutionWidth * (4/3)
      resolutionHeight = resolutionHeight * (4/3)
    }

    this.setState( {ShanghaiA: model, resolutionHeight: resolutionHeight, resolutionWidth: resolutionWidth} )
  }

  async onChange(e) {
    var u = e.target.files[0]
    this.setState({ image: URL.createObjectURL(u), display:true })
    this.forceUpdate()
    var formData = new FormData();
    formData.append("image", u);

    var s = await getBase64(u).then(
      data => {
        return data
      }
    );
    

    var data = qs.stringify({
      'image': s 
    });
    var config = {
      method: 'post',
      url: 'http://localhost:3000/count',
      headers: { },
      data:data
    };
    
    let x = await axios(config)
    .then(function (response) {
      return response.data.value
    })
    .catch(function (error) {
      console.log(error);
    });
    this.setState( {value: x, display:true})
  }


  async useModel(e){
    this.setState( {display: false, loading:true} )
    tf.setBackend('cpu')
    var u = e.target.files[0]
    var url = URL.createObjectURL(u)
    console.log('URL UPLOAD : ', url)

    if( this.state[this.state.modelname] === null){
      var json = 'http://127.0.0.1:8080/'+this.state.modelname+'/model.json' 
      var model = await tf.loadGraphModel(json)
      this.setState( { [this.state.modelname]: model} )
    }

    const image = new Image()
    image.src = url
    image.onload = async () => {
      var nbr = this.doStuff(image)
      var v = await nbr.array()
      console.log("ROUNDED : ",v.toFixed())
      this.setState( {value: v.toFixed(), image: url, display:true} )
    }
  }

  doStuff(image) {

    var model = this.state[this.state.modelname]
    var resolution = this.state.modelResolution[this.state.modelname]
    var tensor = tf.browser.fromPixels(image); //http-server -a 127.0.0.1 --cors -c60
    tensor = tf.image.resizeBilinear(tensor, [resolution[1], resolution[0]])
    var tensor3 = tensor.div(tf.scalar(255).toFloat());
    /*mean of natural image*/
    let meanRgb = {  red : 0.485,  green: 0.456,  blue: 0.406 }
    let stdRgb = { red: 0.229,  green: 0.224,  blue: 0.225 }

    let indices = [
                tf.tensor1d([0], "int32"),
                tf.tensor1d([1], "int32"),
                tf.tensor1d([2], "int32")
    ];
    
    let centeredRgb = {
      red: tf.gather(tensor3,indices[0],2)
               .sub(tf.scalar(meanRgb.red))
               .div(tf.scalar(stdRgb.red))
               .squeeze(),
      
      green: tf.gather(tensor3,indices[1],2)
               .sub(tf.scalar(meanRgb.green))
               .div(tf.scalar(stdRgb.green))
               .squeeze(),
      
      blue: tf.gather(tensor3,indices[2],2)
               .sub(tf.scalar(meanRgb.blue))
               .div(tf.scalar(stdRgb.blue))
               .squeeze(),
  }
  var finaltens = tf.stack([
    centeredRgb.red, centeredRgb.green, centeredRgb.blue
  ]).expandDims(0);

  var val = model.predict(finaltens);
  (val.sum()).print()
  return val.sum();
  }

  


  render() {
    var image = this.state.image
    var display = this.state.display
    var loading = this.state.loading
    return (
      display ?
      <div>
          <h1>Live counting: select an image !</h1>
          <div>
            <Button onClick={() => this.setState( {display: false, loading:false} )}> Go back </Button><br></br>
           Select a model :
         <Dropdown>
           <Dropdown.Toggle variant="primary" id="dropdown-custom-1">
            {this.state.modelname}
           </Dropdown.Toggle>

           <Dropdown.Menu >
             <Dropdown.Item href="#/action-1" onClick={ () => this.setState( {modelname: 'ShanghaiA' } )}> ShanghaiA (crowded scenes)</Dropdown.Item>
             <Dropdown.Item href="#/action-2" onClick={ () => this.setState( {modelname: 'ShanghaiB' } )}> ShanghaiB (non crowded scenes)</Dropdown.Item>
             <Dropdown.Item href="#/action-3" onClick={ () => this.setState( {modelname: 'A10' } )}> A10 (auditoriums)</Dropdown.Item>
          </Dropdown.Menu>
         </Dropdown>
         </div>
        <div> Select a picture : 
        <Form.Group controlId="formFile" className="w-25">
          <Form.Control type="file" onChange={(e) => {this.useModel(e)} } /> 
        </Form.Group> 
        </div><br></br>
        <div> 
          <img src={image} alt="file downloaded" width={this.state.resolutionWidth} height={this.state.resolutionHeight}/>
          <p> There are {this.state.value} persons on the picture </p>
        </div>
      </div>
      : loading ?
      <div>
        It is loading
        <SpinnerRoundFilled color='01090C'/>
      </div>
      :
      <div>
        <h1>Live counting: select an image or take a picture ! </h1>
         <div>
           Select a model :
         <Dropdown>
           <Dropdown.Toggle variant="primary" id="dropdown-custom-1">
            {this.state.modelname}
           </Dropdown.Toggle>

           <Dropdown.Menu >
             <Dropdown.Item href="#/action-1" onClick={ () => this.setState( {modelname: 'ShanghaiA' } )}> ShanghaiA (crowded scenes)</Dropdown.Item>
             <Dropdown.Item href="#/action-2" onClick={ () => this.setState( {modelname: 'ShanghaiB' } )}> ShanghaiB (non crowded scenes)</Dropdown.Item>
             <Dropdown.Item href="#/action-3" onClick={ () => this.setState( {modelname: 'A10' } )}> A10 (auditoriums)</Dropdown.Item>
          </Dropdown.Menu>
         </Dropdown>
         </div>
        <div> Select a picture : 
        <Form.Group controlId="formFile" className="w-25">
          <Form.Control type="file" onChange={(e) => this.useModel(e)} /> 
        </Form.Group> 
        </div><br></br>
        <p>Or take a live picture :</p>
        <CameraFeed uploadImage={() => uploadImage} useModel={() => this.useModel}/>
      </div>
    )
  }
}





class CameraFeed extends Component {
  constructor(props) {
      super(props);
    }
  /**
   * Processes available devices and identifies one by the label
   * @memberof CameraFeed
   * @instance
   */
  processDevices(devices) {
      devices.forEach(device => {
          this.setDevice(device);
      });
  }

  /**
   * Sets the active device and starts playing the feed
   * @memberof CameraFeed
   * @instance
   */
  async setDevice(device) {
      const { deviceId } = device;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { deviceId } });
      this.videoPlayer.srcObject = stream;
      this.videoPlayer.play();
  }

  /**
   * On mount, grab the users connected devices and process them
   * @memberof CameraFeed
   * @instance
   * @override
   */
  async componentDidMount() {
      const cameras = await navigator.mediaDevices.enumerateDevices();
      this.processDevices(cameras);
  }

  /**
   * Handles taking a still image from the video feed on the camera
   * @memberof CameraFeed
   * @instance
   */
  takePhoto = () => {
      const { uploadImage } = this.props;
      var canvas = document.createElement('canvas');
      canvas.width = 680;
      canvas.height = 360;
      const context = canvas.getContext('2d');
      context.drawImage(this.videoPlayer, 0, 0, 680, 360);
      canvas.toBlob(this.props.uploadImage());
      // this.props.sendFile(context)
  };

  render() {
      return (
          <div className="c-camera-feed">
              <div className="c-camera-feed__viewer">
                  <video ref={ref => (this.videoPlayer = ref)} width="680" heigh="360" />
              </div>
              <Button onClick={this.takePhoto}>Take photo!</Button>
              {/* <div className="c-camera-feed__stage">
                  <canvas width="680" height="360" ref={ref => (this.canvas = ref)} />
              </div> */}
          </div>
      );
  }
}

export default Count;
