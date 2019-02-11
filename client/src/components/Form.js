import React, { Component } from 'react';
import HiddenContent from './HiddenContent';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      type: 'cat',
      message: '',
      timeout: null,
      loading: false,
      showMessage: false
    };
  };

  updateTimeout = () => {
    window.clearTimeout(this.state.timeout);
    this.setState({ showMessage: true });
    let timeout = window.setTimeout(() => {
      this.setState({ showMessage: false });
    }, 3000)
    this.setState({ timeout });
  }

  handleChange = (e) => {
    const prop = e.target.id;
    this.setState({ [prop]: e.target.value })
  }

  onSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true, showMessage: false });
    const email = this.state.email;
    const type = this.state.type;
    const exists = await fetch(`/api/exists/${email}`);
    const existsRes = await exists.json();
    if (existsRes) {
      const key = Object.keys(existsRes)[0];
      const active = existsRes[key].active;
      const currentType = existsRes[key].type;
      if (active === 1) {
        if (currentType !== type) {
          fetch('/api/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, type })
          })
          this.setState({ email: '', message: "Your mailing preferences have been updated." });
          this.updateTimeout();
        }
        else {
          this.setState({ message: "Email address is already on the mailing list and active." });
          this.updateTimeout();     
        }
      }
      else {
        await fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, type })
        })
        this.setState({ email: '', message: "Welcome back to the mailing list!" });
        this.updateTimeout();
      }
    }
    else {
      await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type })
      })
      this.setState({ email: '', message: "Email address has been added to the mailing list!" });
      this.updateTimeout();
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <div className="select-container">
            <span className="select-text">I would like a&nbsp;</span>
            <select id="type" onChange={this.handleChange}>
              <option value="cat">cat</option>
              <option value="dog">dog</option>
            </select>
            <span className="select-text">&nbsp;GIF everyday.</span>
          </div>
          <span className="clearfix">Email Address</span>
          <input id="email" type="email" name="email" value={this.state.email} onChange={this.handleChange}/>
          <br/>
          <button className="clearfix" disabled={!this.state.email}>Submit</button>
        </form>
        <HiddenContent showMessage={this.state.showMessage} message={this.state.message} loading={this.state.loading} />
      </div>
    )
  }
}

export default Form;