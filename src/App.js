import './App.css';
import {Component} from 'react';
import * as tf from '@tensorflow/tfjs';
tf.ENV.set('WEBGL_PACK', false)
// import { CameraFeed } from './camera-feed';
var axios = require('axios');
var qs = require('qs');
const MODEL_URL = './model.json';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


function updateState(value, url){
  console.log("URL CHECK :", url)
  this.setState( {value: value, display:true})
  this.setState({ image: URL.createObjectURL(url) })
}

  
class Count extends Component{
  constructor(props) {
    super(props);
    this.state ={
      value: null,
      display:false,
      image:null,
      model:null
    }
    
  }

  async componentDidMount(){
    updateState = updateState.bind(this)
    var json = 'https://tfecounintg.000webhostapp.com/model.json'
    console.log(json)
    const model = await tf.loadGraphModel(json)
    console.log(model)
    this.setState( {model: model} )
    // localStorage.setItem('json', JSON.parse(JSON.stringify(json)))
    // await require('./model/model.json').save('localstorage://json');
    // Warmup 
    //const tensor = tf.zeros([1,3,340,257])
    //console.log(tensor)
    //var val = model.predict(tensor);
  }

  async onChange(e) {
    // console.log(e.target)
    var u = e.target.files[0]
    console.log("U : ", u)
    this.setState({ image: URL.createObjectURL(u), display:true })
    this.forceUpdate()
    var formData = new FormData();
    formData.append("image", u);
    console.log("IMAGE", u.name)

    var s = await getBase64(u).then(
      data => {
        console.log("DATA :", data)
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
      console.log(JSON.stringify(response.data.value));
      return response.data.value
    })
    .catch(function (error) {
      console.log(error);
    });
    this.setState( {value: x, display:true})
  }

  uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    console.log("HERE :", file);
    this.useModel(file);

   /* const base64url = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });*/
  }

    useModel(e){

    tf.setBackend('cpu')
    var u = e.target.files[0]
    var url = URL.createObjectURL(u)

    console.log("MODEL : ", this.state.model)
    console.log(u)
    var model = this.state.model
    const image = new Image()
    image.src = url
  
    this.setState({image: url, display:true})
    function doStuff() {
      if(image.width===0) {//we want it to match
          setTimeout(doStuff, 50);//wait 50 millisecnds then recheck
          return;
      }
      var tensor = tf.browser.fromPixels(image); //http-server -a 127.0.0.1 --cors -c60
      console.log(tensor);
      tensor = tf.image.resizeBilinear(tensor, [257, 340])
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
      return val.sum()
  }
  var val = doStuff()
  this.setState({value : val})
  console.log("END")
  }


  render() {
    var val = this.state.value
    var image = this.state.image
    var display = this.state.display
    console.log("DISPLAY :", display)
    return (
      display ?
      <div>
        <div>
          <h1>Live counting: select an image !</h1>
          <input type="file" name="file" onChange={(e) => this.useModel(e)} />
        </div>
        <div> 
          <img src={image} alt="file downloaded"/>
          <p> There are {val} persons on the picture </p>
        </div>
      </div>
      :
      <div>
        <h1>Live counting: select an image or take a picture ! </h1>
        <input type="file" name="file" onChange={(e) => this.useModel(e)}/>
        <CameraFeed uploadImage={() => this.uploadImage} useModel={() => this.useModel}/>
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
          console.log(device.label);
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
      console.log("TAKE PICTURE 1")
      const { uploadImage } = this.props;
      var canvas = document.createElement('canvas');
      canvas.width = 680;
      canvas.height = 360;
      const context = canvas.getContext('2d');
      context.drawImage(this.videoPlayer, 0, 0, 680, 360);
      console.log("CONTEXT : ", context)
      console.log("CONTEXT : ", uploadImage)
      canvas.toBlob(this.props.uploadImage());
      // this.props.sendFile(context)
      console.log("TAKE PICTURE 2 : ")
  };

  render() {
      return (
          <div className="c-camera-feed">
              <div className="c-camera-feed__viewer">
                  <video ref={ref => (this.videoPlayer = ref)} width="680" heigh="360" />
              </div>
              <button onClick={this.takePhoto}>Take photo!</button>
              {/* <div className="c-camera-feed__stage">
                  <canvas width="680" height="360" ref={ref => (this.canvas = ref)} />
              </div> */}
          </div>
      );
  }
}

export default Count;
