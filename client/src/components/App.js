import React, { Component } from 'react';
import '../styles/App.css';
import Form from './Form';
import Content from './Content';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div class="container">
          <header className="App-header">
            <h1>Cat GIF a Day</h1>
          </header>
          <Content/>
          <Form/>
        </div>
      </div>
    );
  }
}

export default App;
