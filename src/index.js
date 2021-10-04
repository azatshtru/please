import React from "react";
import ReactDOM from 'react-dom';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, query, limitToLast, set } from 'firebase/database';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

initializeApp(firebaseConfig);

const database = getDatabase();

function UsernameInput(props){
  return(
    <form>
      <div>
        <label>username</label>
        <input type="text" name="username" value={props.user} onChange={(event) => props.onChange(event.target.value)}/>
      </div>
      <div>
        <lable>room_code</lable>
        <input type="text" name="roomcode" value={props.roomcode} onChange={(event) => props.onChangeRoom(event.target.value)}/>
      </div>
      <div>
        <input type="submit" value={'Sign In'} onClick={(event) => {
          event.preventDefault();
          props.onClick();
        }} /> 
      </div>
    </form>
  );
}

function TextLabel(props){
  return (<li><span style={{color: 'violet'}}>{props.name + ": "}</span>{props.text}</li>);
}

function TextsContainer(props){
  if(props.texts == null){
    return (<ol><li>{"💜please."}</li></ol>);
  }
  if (props.texts[props.room] == null){
    return (<ol><li>{"💜please."+props.room}</li></ol>);
  }
  const textrows = []
  for (let [key, value] of Object.entries(props.texts[props.room])) {
    
    textrows.push(<TextLabel key={key} name={value['user']} text={value['text']} />);
  }

  return (<ol>{textrows}</ol>);
}

function TextInput(props){
  return (
    <form>
      <input type="text" name="textmessage" value={props.text} onChange={(event) => props.onChange(event.target.value)} />
      <input type="submit" value="send" onClick={(event) => {
          event.preventDefault();
          props.onClick();
        }
      } />
    </form>
  );
}

function Core(props) {
  return (
    <div>
      <TextsContainer texts={props.texts} room={props.room} />
      <TextInput text={props.text} onChange={(txt) => props.onChange(txt)} onClick={() => props.onClick()} />
    </div>
  )
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: '',
      room: '',
      signedIn: false,
      text: '',
    }
  }

  handleUsernameInput(username){
    this.setState({user: username});
  }

  handleRoomcodeInput(roomcode){
    this.setState({room: roomcode});
  }

  handleSignIn(){
    if(this.state.user === '' || this.state.room === ''){ return; }
    this.setState({signedIn: true});
  }

  handleTextInput(textmessage){
    this.setState({text: textmessage});
  }

  handleSend(){
    if(this.state.text === ""){ return; }
    set(push(ref(database, 'texts/'+this.state.room)), {
      user: this.state.user,
      text: this.state.text,
    });
    this.setState({text: ""});
  }

  render(){
    return (
      <div>
        {this.state.signedIn ? 
          <Core 
            texts={this.props.texts}
            room={this.state.room}
            text={this.state.text} 
            onChange={(text) => this.handleTextInput(text)} 
            onClick={() => this.handleSend()}
          /> :
          <UsernameInput 
            user={this.state.user} 
            roomcode={this.state.room}
            onChange={(user) => this.handleUsernameInput(user)} 
            onChangeRoom={(room) => this.handleRoomcodeInput(room)}
            onClick={() => this.handleSignIn()}
          />
        }
        
      </div>
    )
  }
}

const textsRef = query(ref(database, 'texts/'), limitToLast(12));
onValue(textsRef, (snapshot) => {
  const textData = snapshot.val();
  ReactDOM.render(
    <React.StrictMode>
      <App texts={textData} />
    </React.StrictMode>,
    document.getElementById('root')
  );
});

