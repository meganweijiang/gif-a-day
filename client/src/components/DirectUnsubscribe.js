import React, { Component } from 'react';
import Unsubscribe from './Unsubscribe';

class DirectUnsubscribe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null
    }
  }

  handleErrors = (res) => {
    if (!res.ok) {
      throw Error(res.statusText);    
    }
    return res;
  }

  componentDidMount = () => {
    const id = String(this.props.match.params.id);
    fetch('/api/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })
    })
    .then(this.handleErrors)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      const email = res.email;
      this.setState({ email });
    })
    .catch((err) => {
      console.log(err);
      this.setState({ email : '' });
    })
  }

  render() {
    return (
      <div>
        { this.state.email !== null && <Unsubscribe directEmail={this.state.email} /> }
      </div>
    );
  }
}

export default DirectUnsubscribe;
