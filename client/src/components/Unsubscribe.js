import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Content from './Content';
import HiddenContent from './HiddenContent';

class Unsubscribe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.directEmail,
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

  handleErrors = (res) => {
    if (!res.ok) {
      this.updateTimeout(`An error has occurred.`);
      throw Error(res.statusText);    
    }
    return res;
  }

  handleChange = (e) => {
    const prop = e.target.id;
    this.setState({ [prop]: e.target.value })
  }

  onSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true, message: '' });
    const email = this.state.email;
    fetch(`/api/exists/${email}`)
    .then(this.handleErrors)
    .then((res) => res.json())
    .then((exists) => {
      if (exists) {
        let key = Object.keys(exists)[0];
        let active = exists[key].active;
        if (active) {
          fetch(`/api/unsubscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key })
          })
          .then(this.handleErrors)
          .then(() => {
            this.updateTimeout(`${email} has been unsubscribed.`);
          })
        }
        else {
          this.updateTimeout(`${email} does not exist on the mailing list.`);
        }
      }
      else {
        this.updateTimeout(`${email} does not exist on the mailing list.`);
      }     
    })
    .catch((error) => console.log(error));
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
              <label className="clearfix" htmlFor="email">Email Address</label>
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
