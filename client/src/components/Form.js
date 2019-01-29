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
    const type = document.getElementById('option-select').value;
    const exists = await fetch('/api/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    let existsRes = await exists.text();
    existsRes = JSON.parse(existsRes);
    if (existsRes) {
      const key = Object.keys(existsRes)[0];
      const active = existsRes[key].active;
      const currentType = existsRes[key].type;
      if (active === 1) {
        if (currentType !== type) {
          const updateType = await fetch('/api/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, type })
          })
          if (updateType) {
            document.getElementById('email').value = '';
            this.setState({ message: "Your mailing preferences have been updated." });
            this.updateTimeout();
          }
        }
        else {
          this.setState({ message: "Email address is already on the mailing list and active." });
          this.updateTimeout();     
        }
      }
      else {
        const update = await fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, type })
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
        body: JSON.stringify({ email, type })
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
          <div class="select-container">
            <span class="select-text">I would like a&nbsp;</span>
            <select id="option-select">
              <option value="cat">Cat</option>
              <option value="dog">Dog</option>
            </select>
            <span class="select-text">&nbsp;GIF everyday.</span>
          </div>
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