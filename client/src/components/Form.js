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
      loading: false
    };
  };

  componentWillUnmount = () => {
    window.clearTimeout(this.state.timeout);
  }

  updateTimeout = (message) => {
    this.setState({ email: '', message, loading: false });
    window.clearTimeout(this.state.timeout);
    let timeout = window.setTimeout(() => {
      this.setState({ message: '' });
    }, 3000)
    this.setState({ timeout });
  }

  handleChange = (e) => {
    const prop = e.target.id;
    this.setState({ [prop]: e.target.value })
  }

  onSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true, message: '' });
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
          this.updateTimeout(`Mailing preferences for ${email} have been updated.`);
        }
        else {
          this.updateTimeout(`${email} is already on the mailing list.`);     
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
        this.updateTimeout(`Welcome back to the mailing list, ${email}!`);
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
      this.updateTimeout(`${email} has been added to the mailing list!`);
    }
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
        <HiddenContent message={this.state.message} loading={this.state.loading} />
      </div>
    )
  }
}

export default Form;