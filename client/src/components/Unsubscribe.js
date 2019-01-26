import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import loading from '../images/loader.gif';
import Content from './Content';

class Unsubscribe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      message: '',
      timeout: null,
    };
  };

  handleChange = (e) => {
    this.setState({ text: e.target.value })
  }

  updateTimeout = () => {
    const text = document.getElementById('message');
    window.clearTimeout(this.state.timeout);
    text.style.visibility = 'visible';
    let timeout = window.setTimeout(() => {
      text.style.visibility = 'hidden';
    }, 5000)
    this.setState({ timeout });
  }

  onSubmit = async e => {
    e.preventDefault();
    document.getElementById('loading').style.visibility = 'visible';
    const email = document.getElementById('emailUnsub').value;
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
          this.setState({ message: "Email address has been unsubscribed." });
          this.updateTimeout();
        }   
      }
      else {
        this.setState({ message: "Email address is not currently subscribed." });
        this.updateTimeout();
      }
    }
    else {
        this.setState({ message: "Email address is not currently subscribed." });
        this.updateTimeout();
    }
    document.getElementById('loading').style.visibility = 'hidden';
  };

  render() {
    return (
      <div className="App">
        <div className="outer">
          <div className="container">
            <Link className="go-home" to="/">&#8592; Go Home</Link>
            <header className="App-header">
              <h1>Unsubscribe</h1>
            </header>
            <Content isHome={false} />
            <form onSubmit={this.onSubmit}>
              <span className="clearfix">Email Address</span>
              <input id="emailUnsub" type="email" name="email" value={this.state.text} onChange={this.handleChange}/>
              <br/>
              <button className="clearfix" disabled={!this.state.text}>Submit</button>
            </form>
            <p id="message">{this.state.message}</p>
            <img id="loading" src={loading} alt=""/>
          </div>
        </div>
      </div>
    );
  }
}

export default Unsubscribe;
