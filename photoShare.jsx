import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@mui/material';
import './styles/main.css';

// Import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import UserComments from './components/userComments/userComments';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    // photoRefreshKey is incremented after a successful upload so UserPhotos re-fetches
    this.state = { photoRefreshKey: 0 };
  }

  handlePhotoUploaded = () => {
    this.setState(prev => ({ photoRefreshKey: prev.photoRefreshKey + 1 }));
  };

  render() {
    const { photoRefreshKey } = this.state;

    return (
      <HashRouter>
        <div>
          <TopBar onPhotoUploaded={this.handlePhotoUploaded} />
          <div className="main-topbar-buffer" />
          <Grid container spacing={2} style={{ padding: '16px' }}>
            <Grid item xs={12} sm={3}>
              <Paper className="main-grid-item">
                <UserList />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route exact path="/" render={() => (
                    <Typography variant="body1">
                      Welcome to PhotoShare! Select a user from the list to view their photos.
                    </Typography>
                  )} />
                  <Route path="/users/:userId"
                    render={props => <UserDetail {...props} />}
                  />
                  <Route path="/photos/:userId"
                    render={props => <UserPhotos {...props} refreshKey={photoRefreshKey} />}
                  />
                  <Route path="/comments/:userId"
                    render={props => <UserComments {...props} />}
                  />
                  <Route path="/users" component={UserList} />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
