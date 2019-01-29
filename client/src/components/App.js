import React, { Component } from 'react';
import '../styles/App.scss';
import Form from './Form';
import Content from './Content';
import { Link } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="outer">
          <div className="container">
            <header className="App-header">
              <h1>GIF a Day</h1>
            </header>
            <Content isHome={true} />
            <Form/>
            <p className="unsub">Need to <Link to="/unsubscribe">unsubscribe</Link>?</p>
          </div>
        </div>
        <Link className="about" to="/about">About &#8594;</Link>
      </div>
    );
  }
}

export default App;
