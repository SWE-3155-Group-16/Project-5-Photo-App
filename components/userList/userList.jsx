import React from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Box,
} from '@mui/material';
import './userList.css';
import axios from 'axios';

/**
 * Define UserList, a React component of project #5
 * Now includes green photo count bubble and red comment count bubble per user.
 * Clicking the red comment bubble navigates to the user's comment list view.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: undefined,
      user_id: undefined
    };
  }

  componentDidMount() {
    this.handleUserListChange();
  }

  componentDidUpdate() {
    const new_user_id = this.props.match?.params.userId;
    const current_user_id = this.state.user_id;

    if (current_user_id !== new_user_id) {
      this.setState({ user_id: new_user_id });
    }
  }

  handleUserListChange() {
    axios.get('/user/list')
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch(() => {
        console.error('Error loading users');
      });
  }

  render() {
    return this.state.users ? (
      <div>
        <List component="nav">
          {this.state.users.map(user => (
            <ListItemButton
              selected={this.state.user_id === user._id}
              key={user._id}
              divider={true}
              component="a"
              href={'#/users/' + user._id}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <ListItemText primary={user.first_name + ' ' + user.last_name} />

              <Box
                sx={{ display: 'flex', gap: 0.75, ml: 1, flexShrink: 0 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Green bubble: number of photos */}
                <Chip
                  label={user.photoCount ?? 0}
                  size="small"
                  component="a"
                  href={'#/photos/' + user._id}
                  clickable
                  sx={{
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 22,
                    minWidth: 28,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#388e3c' },
                  }}
                  title={`${user.photoCount ?? 0} photo(s)`}
                />

                {/* Red bubble: number of comments authored */}
                <Chip
                  label={user.commentCount ?? 0}
                  size="small"
                  component="a"
                  href={'#/comments/' + user._id}
                  clickable
                  sx={{
                    backgroundColor: '#f44336',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 22,
                    minWidth: 28,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#c62828' },
                  }}
                  title={`${user.commentCount ?? 0} comment(s)`}
                />
              </Box>
            </ListItemButton>
          ))}
        </List>
      </div>
    ) : (
      <div />
    );
  }
}

export default UserList;
