import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  handleSubmit = async event => {
    event.preventDefault();

    await axios.post('/api/values', {
      index: this.state.index
    });
    this.setState({ index: '' });
  };

  async fetchValues() {
    console.log('hello');
    const values = await axios.get('/api/values/current');

    console.log('values', values);
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    const indexes = await axios.get('/api/values/all');
    console.log('indexes', indexes);
    this.setState({ seenIndexes: indexes.data });
  }

  renderSeenIndexes() {
    console.log('this.state.seenIndexes', this.state.seenIndexes);
    return this.state.seenIndexes.map(({ i_number }) => i_number).join(',');
  }

  renderCalculatedValue() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }

    console.log('entries', entries);

    return entries;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={event => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Value</h3>
        {this.renderCalculatedValue()}
      </div>
    );
  }
}

export default Fib;
