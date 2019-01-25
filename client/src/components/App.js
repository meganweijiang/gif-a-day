import React, { Component } from 'react';
import '../styles/App.css';
import Form from './Form';
import Content from './Content';
import { Link } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <div className="outer">
        <div className="flex-wrap-start">
          <p className="unsub">Need to <Link to="/unsubscribe">unsubscribe</Link>?</p>
        </div>
        <div className="App">
          <div className="container">
            <header className="App-header">
              <h1>Cat GIF a Day</h1>
            </header>
            <Content/>
            <Form/>
          </div>
        </div>
    </div>
    );
  }
}

export default App;
