import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
  PageHeader,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import { invokeApig } from '../libs/awsLib';
import './Home.css';
import config from '../config.js';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import 'graphiql/graphiql.css'

const title = process.env.REACT_APP_TCM_TITLE || 'Scratch - A simple note taking app';

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      notes: [],
    };
  }

  async componentDidMount() {
    document.title = title;
    if (this.props.userToken === null) {
      return;
    }

    this.setState({ isLoading: true });

    try {
      const results = await this.notes();
      this.setState({ notes: results });
    }
    catch(e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  notes() {
    return invokeApig({ path: '/notes' }, this.props.userToken);
  }

  renderNotesList(notes) {
    return [{}].concat(notes).map((note, i) => (
      i !== 0
        ? ( <ListGroupItem
              key={note.noteId}
              href={`/notes/${note.noteId}`}
              onClick={this.handleNoteClick}
              header={note.content.trim().split('\n')[0]}>
                { "Created: " + (new Date(note.createdAt)).toLocaleString() }
            </ListGroupItem> )
        : ( <ListGroupItem
              key="new"
              href="/notes/new"
              onClick={this.handleNoteClick}>
                <h4><b>{'\uFF0B'}</b> Create a new note</h4>
            </ListGroupItem> )
    ));
  }

  handleNoteClick = (event) => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute('href'));
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p>{title}</p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg">Login</Link>
          <Link to="/signup" className="btn btn-success btn-lg">Signup</Link>
        </div>
      </div>
    );
  }

  graphQLFetcher(graphQLParams) {
    return fetch(config.graphqlURL, {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'foobar' },
      body: JSON.stringify(graphQLParams),
    }).then(function (response) {
      return response.json();
    });
  }

  renderGraphiQL() {
    var q = `# default query
{
  policy {
    _id
  }
}`
    return <GraphiQL
      fetcher={this.graphQLFetcher}
      response='{"data":{"policy":{"_id":"c1ac5bde-9e2c-45d5-b72b-a5ac691944ea"}}}'
      defaultQuery={q}
      />;
  }

  render() {
    return (
      <div className="Home">
        { this.props.userToken === null
          ? this.renderLander()
          : this.renderGraphiQL() }
      </div>
    );
  }
}

export default withRouter(Home);
