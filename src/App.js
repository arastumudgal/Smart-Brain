import './App.css';
import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Rank from './components/Rank/Rank.js';
import SignIn from './components/SignIn/SignIn.js';
import Register from './components/Register/Register.js';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: "38751ca0a5dd4835805791d9066a4841"
});

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}



class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageURL:'',
      box: {},
      route:'SignIn',
      isSignedIn:false,
      user:{
        id:'',
      name:'',
      email:'',
      entries:0,
      joined:''
      }

    }
  }

loadUser = (data) =>{
  this.setState({user:{
    id:data.id,
  name:data.name,
  email:data.email,
  entries:data.entries,
  joined:data.joined
}
  })
}

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
    this.setState({box:box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

onButtonSubmit = () => {
     this.setState({imageURL: this.state.input})

     app.models.predict(
    Clarifai.FACE_DETECT_MODEL,
    // THE JPG
    this.state.input)
    .then(response => {
      if(response){
        fetch('http://localhost:3000/image',{
          method:'put',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            id:this.state.user.id,
          })
      })
      .then(response=>response.json())
      .then(count=>{
        this.setState(Object.assign(this.state.user, {entries:count}))
      })
    }
      this.displayFaceBox(this.calculateFaceLocation(response))})
    .catch(err=>console.log(err));
};
onRouteChange = (route) =>{
  if(route==='signout'){
    this.setState({isSignedIn: false})
  }
  else if(route==='home'){
    this.setState({isSignedIn: true})

  }
  this.setState({route: route});
}
  render(){
    return ( <
      div className = "App" >
      <Particles className = 'particles'params = {particlesOptions}/>
      <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/ >
      {this.state.route === 'home'
      ?
      <div>
      <Logo / >
      <Rank / >
      <ImageLinkForm onInputChange={this.onInputChange}
       onButtonSubmit={this.onButtonSubmit}/>
       <FaceRecognition box={this.state.box} imageURL={this.state.imageURL} />
       </div>

       :(
         this.state.route === 'SignIn'
         ?
         <SignIn onRouteChange={this.onRouteChange}/>
         :
         <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

       )


      }

      </div>
    );
  }

}

export default App;
