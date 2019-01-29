import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class DirectUnsubscribe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false
    };
  };

  componentDidMount = async () => {
    const { id } = this.props.match.params;
    const decrypted = await fetch('/api/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id })
    })
    if (decrypted.status === 200) {
      this.setState({ success: true });
    }
  };

  render() {
    return (
      <div className="App">
        <div className="outer">
          <div className="container">
            { this.state.success ? 
              (<h1>You have been unsubscribed.</h1>) 
              : 
              (<h1>Invalid key or error occurred.</h1>)}
            <Link className="go-home" to="/">&#8592; Go Home</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default DirectUnsubscribe;
