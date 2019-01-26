import React, { Component } from 'react';
import loading from '../images/loader.gif';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      timeout: null,
      message: ''
    };
  };

  updateTimeout = () => {
    const text = document.getElementById('message');
    window.clearTimeout(this.state.timeout);
    text.style.visibility = 'visible';
    let timeout = window.setTimeout(() => {
      text.style.visibility = 'hidden';
    }, 5000)
    this.setState({ timeout });
  }

  handleChange = (e) => {
    this.setState({ text: e.target.value })
  }

  onSubmit = async e => {
    e.preventDefault();
    document.getElementById('loading').style.visibility = 'visible';
    const email = document.getElementById('email').value;
    const exists = await fetch('/api/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    let existsRes = await exists.text();
    console.log(existsRes);
    existsRes = JSON.parse(existsRes);
    if (existsRes) {
      let key = ""
      for (let k in existsRes) {
        key = k;
      }
      const active = existsRes[key].active;
      if (active === 1) {
        this.setState({ message: "Email address is already on the mailing list and active." });
        this.updateTimeout();
      }
      else {
        const update = await fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key })
        })
        if (update) {
          document.getElementById('email').value = '';
          this.setState({ message: "Welcome back to the mailing list!" });
          this.updateTimeout();
        }
      }
    }
    else {
      const add = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      if (add) {
        document.getElementById('email').value = '';
        this.setState({ message: "Email address has been added to the mailing list!" });
        this.updateTimeout();
      }
    }
    document.getElementById('loading').style.visibility = 'hidden';
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <span className="clearfix">Email Address</span>
          <input id="email" type="email" name="email" value={this.state.text} onChange={this.handleChange}/>
          <br/>
          <button className="clearfix" disabled={!this.state.text}>Submit</button>
        </form>
        <p id="message">{this.state.message}</p>
        <img id="loading" src={loading} alt=""/>
      </div>
    )
  }
}

export default Form;