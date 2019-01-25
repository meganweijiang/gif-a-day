import React, { Component } from 'react';
import '../styles/App.css';
import Form from './Form';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Cat GIF a Day</h1>
        </header>
        <Form/>
      </div>
    );
  }
}

export default App;
