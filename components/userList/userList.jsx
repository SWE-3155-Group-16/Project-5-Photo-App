import React from 'react';
import { Link } from 'react-router-dom';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
}
from '@mui/material';
import './userList.css';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    // Fetch user list from the server
    fetch('/user/list')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          users: data,
          loading: false,
        });
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        this.setState({
          error: error.message,
          loading: false,
        });
      });
  }

  render() {
    const { users, loading, error } = this.state;

    if (loading) {
      return <Typography variant="body2">Loading users...</Typography>;
    }

    if (error) {
      return <Typography variant="body2" color="error">Error loading users: {error}</Typography>;
    }

    return (
      <div>
        <Typography variant="h6" style={{ marginBottom: '16px' }}>
          Users
        </Typography>
        <List component="nav">
          {users.map((user, index) => (
            <div key={user._id}>
              <Link to={`/users/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItem sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, cursor: 'pointer' }}>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                    secondary={user.occupation}
                  />
                </ListItem>
              </Link>
              {index < users.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
