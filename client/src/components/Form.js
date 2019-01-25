import React, { Component } from 'react';
import database from '../firebase/firebase';
import loading from '../images/loading.gif';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  };

  // emailExists = (email) => {
  //   return new Promise((resolve, reject) => {
  //     database.ref('emails').orderByChild('email').equalTo(email).once("value", snapshot => {
  //       if (snapshot.val() !== null) {
  //         resolve(snapshot.val());
  //       }
  //       resolve(false);
  //     })
  //   })
  // };

  // addEmail = (email) => {
  //   return new Promise((resolve, reject) => {
  //     database.ref('emails').push({
  //       email: email,
  //       active: 1
  //     })
  //     .then(() => resolve(true))
  //     .catch(e => {
  //       console.log("Error: ", e)
  //       reject();
  //     });
  //   })
  // };

  // updateEmail = (email, key) => {
  //   return new Promise((resolve, reject) => {
  //     database.ref(`emails/${key}/active`).set(1)
  //     .then(() => resolve(true))
  //     .catch(e => {
  //       console.log("Error: ", e)
  //       reject();
  //     });
  //   })
  // };

  handleChange = (e) => {
    this.setState({ text: e.target.value })
  }

  onSubmit = async e => {
    e.preventDefault();
    document.getElementById('loading').style.visibility = 'visible';
    const email = document.getElementById('email').value;
    const text = document.getElementById('submitted');
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
      const active = existsRes[key].active;
      if (active === 1) {
        text.innerHTML = "Email address is already on the mailing list and active."
        setTimeout(() => {
          text.innerHTML = "";
        }, 5000);
      }
      else {
        const update = await fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key: key })
        })
        if (update) {
          document.getElementById('email').value = '';
            text.innerHTML = "Welcome back to the mailing list!"
            setTimeout(() => {
              text.innerHTML = "";
          }, 5000)
        }
      }
    }
    else {
      const add = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      })
      if (add) {
        document.getElementById('email').value = '';
          text.innerHTML = "Email address has been added to the mailing list!"
          setTimeout(() => {
            text.innerHTML = "";
        }, 5000)
      }
    }
    document.getElementById('loading').style.visibility = 'hidden';
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          Email Address: <input id="email" type="email" name="email" value={this.state.text} onChange={this.handleChange}/>
          <button disabled={!this.state.text}>Submit</button>
        </form>
        <p id="submitted"></p>
        <img id="loading" src={loading} alt=""/>
      </div>
    )
  }
}

export default Form;