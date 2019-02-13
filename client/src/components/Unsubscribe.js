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
        this.updateTimeout(`${email} has been unsubscribed.`);
      }
      else {
        this.updateTimeout(`${email} does not exist on the mailing list.`);
      }
    }
    else {
        this.updateTimeout(`${email} does not exist on the mailing list.`);
    }
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
            <HiddenContent message={this.state.message} loading={this.state.loading} />
            <Link className='go-home' to='/'>&#8592; Go Home</Link>
          </div>
        </div>
        <Link className="about" to="/about">About &#8594;</Link>
      </div>
    );
  }
}

export default Unsubscribe;
