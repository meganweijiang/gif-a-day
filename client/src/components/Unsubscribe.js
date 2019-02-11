import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Content from './Content';
import HiddenContent from './HiddenContent';

class Unsubscribe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
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
    const exists = await fetch(`/api/exists/${email}`);
    const existsRes = await exists.json();
    if (existsRes) {
      let key = Object.keys(existsRes)[0];
      let active = existsRes[key].active;
      if (active) {
        await fetch(`/api/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key })
        });
        this.setState({ message: "Email address has been unsubscribed." });
        this.updateTimeout();
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
    this.setState({ loading: false });
  };

  render() {
    return (
      <div className="App">
        <div className="outer">
          <div className="container">
            <header className="App-header">
              <h1>Unsubscribe</h1>
            </header>
            <Content isHome={false} />
            <form onSubmit={this.onSubmit}>
              <span className="clearfix">Email Address</span>
              <input id="email" type="email" name="email" value={this.state.email} onChange={this.handleChange}/>
              <br/>
              <button className="clearfix" disabled={!this.state.email}>Submit</button>
            </form>
            <HiddenContent showMessage={this.state.showMessage} message={this.state.message} loading={this.state.loading} />
            <Link className='go-home' to='/'>&#8592; Go Home</Link>
          </div>
        </div>
        <Link className="about" to="/about">About &#8594;</Link>
      </div>
    );
  }
}

export default Unsubscribe;
