import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Unsubscribe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
    };
  };

  handleChange = (e) => {
    this.setState({ text: e.target.value })
  }

  updateTimeout = () => {
    const text = document.getElementById('message');
    window.clearTimeout(this.state.timeout);
    let timeout = window.setTimeout(() => {
      text.innerHTML = "";
    }, 5000)
    this.setState({ timeout });
  }

  onSubmit = async e => {
    e.preventDefault();
    const email = document.getElementById('emailUnsub').value;
    const text = document.getElementById('message');
    const exists = await fetch('/api/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email })
    })
    let existsRes = await exists.text();
    existsRes = JSON.parse(existsRes);
    if (existsRes) {
      let key = ""
      for (let k in existsRes) {
        key = k;
      }
      let active = existsRes[key].active;
      if (active) {
        const unsub = await fetch(`/api/unsubscribe/${key}`);
        if (unsub) {
          text.innerHTML = "Email address has been unsubscribed."
          this.updateTimeout();
        }   
      }
      else {
        text.innerHTML = "Email address has previously been unsubscribed."
        this.updateTimeout();
      }
    }
    else {
        text.innerHTML = "Email address not found."
        this.updateTimeout();
    }
  };

  render() {
    return (
      <div className="outer">
        <div className="flex-wrap-start">
          <Link className="go-home" to="/">&#8592; Go Home</Link>
        </div>
        <div className="App">
          <div className="container">
            <header className="App-header">
              <h1>Unsubscribe</h1>
            </header>
            <form onSubmit={this.onSubmit}>
              <span className="clearfix">Email Address</span>
              <input id="emailUnsub" type="email" name="email" value={this.state.text} onChange={this.handleChange}/>
              <br/>
              <button className="clearfix" disabled={!this.state.text}>Submit</button>
            </form>
            <p id="message"></p>
          </div>
        </div>
      </div>
    );
  }
}

export default Unsubscribe;
