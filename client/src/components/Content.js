import React, { Component } from 'react';

class Content extends Component {

  // getGif = () => {
  //   return new Promise((resolve, reject) => {
  //     fetch('https://api.giphy.com/v1/gifs/random?tag=cat&api_key=')
  //       .then(response => response.json())
  //       .then(body => {
  //         const url = body.data.images.original.url;
  //         resolve(url);
  //       })
  //       .catch(err => {
  //         reject(err);
  //       });
  //   })
  // }

  // componentDidMount = () => {
  //   this.getGif()
  //     .then((res) => {
  //       document.getElementById("gif").style.content = `url(${res})`;
  //     })
  // }

  render() {
    return (
      <div>
        <img id="gif" alt=""/>
      </div>
    );
  }
}

export default Content;
