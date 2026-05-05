import React from 'react';
import {
    Button,
    TextField,
    Typography,
    Switch,
    FormControlLabel,
    Avatar
} from '@mui/material';
import './userDetail.css';
import axios from 'axios';

class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: undefined,
            currentUser: undefined,
            editing: false,

            first_name: '',
            last_name: '',
            location: '',
            description: '',
            occupation: '',
            website: '',
            profile_photo: '',
            dark_mode: false
        };
    }

    componentDidMount() {
        this.loadUser();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.userId !== this.props.match.params.userId) {
            this.loadUser();
        }
    }

    loadUser = () => {
        const userId = this.props.match.params.userId;

        axios.get('/admin/me')
            .then((response) => {
                this.setState({ currentUser: response.data });
            })
            .catch(() => {
                this.setState({ currentUser: undefined });
            });

        axios.get('/user/' + userId)
            .then((response) => {
                const user = response.data;

                this.setState({
                    user: user,
                    editing: false,

                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    location: user.location || '',
                    description: user.description || '',
                    occupation: user.occupation || '',
                    website: user.website || '',
                    profile_photo: user.profile_photo || '',
                    dark_mode: user.dark_mode || false
                });

                if (this.props.changeMainContent) {
                    this.props.changeMainContent(
                        user.first_name + ' ' + user.last_name
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    handleSave = () => {
        const userId = this.state.user._id;

        axios.put('/user/' + userId, {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            location: this.state.location,
            description: this.state.description,
            occupation: this.state.occupation,
            website: this.state.website,
            profile_photo: this.state.profile_photo,
            dark_mode: this.state.dark_mode
        })
            .then((response) => {
                const updatedUser = response.data;

                this.setState({
                    user: updatedUser,
                    editing: false
                });

                if (this.props.changeMainContent) {
                    this.props.changeMainContent(
                        updatedUser.first_name + ' ' + updatedUser.last_name
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    handleCancel = () => {
        const user = this.state.user;

        this.setState({
            editing: false,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            location: user.location || '',
            description: user.description || '',
            occupation: user.occupation || '',
            website: user.website || '',
            profile_photo: user.profile_photo || '',
            dark_mode: user.dark_mode || false
        });
    };

    render() {
        const { user, currentUser, editing } = this.state;

        if (!user) {
            return <Typography>Loading user...</Typography>;
        }

        const isOwnProfile =
            currentUser && currentUser._id === user._id;

        return (
            <div>
                <Typography variant="h5" gutterBottom>
                    User Profile
                </Typography>

                {this.state.profile_photo && (
                    <Avatar
                        src={this.state.profile_photo}
                        alt={this.state.first_name}
                        sx={{ width: 100, height: 100, marginBottom: 2 }}
                    />
                )}

                {editing ? (
                    <div>
                        <TextField
                            label="First Name"
                            fullWidth
                            margin="normal"
                            value={this.state.first_name}
                            onChange={(e) => this.setState({ first_name: e.target.value })}
                        />

                        <TextField
                            label="Last Name"
                            fullWidth
                            margin="normal"
                            value={this.state.last_name}
                            onChange={(e) => this.setState({ last_name: e.target.value })}
                        />

                        <TextField
                            label="Location"
                            fullWidth
                            margin="normal"
                            value={this.state.location}
                            onChange={(e) => this.setState({ location: e.target.value })}
                        />

                        <TextField
                            label="Description"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
                            value={this.state.description}
                            onChange={(e) => this.setState({ description: e.target.value })}
                        />

                        <TextField
                            label="Occupation"
                            fullWidth
                            margin="normal"
                            value={this.state.occupation}
                            onChange={(e) => this.setState({ occupation: e.target.value })}
                        />

                        <TextField
                            label="Personal Website"
                            fullWidth
                            margin="normal"
                            value={this.state.website}
                            onChange={(e) => this.setState({ website: e.target.value })}
                        />

                        <TextField
                            label="Profile Photo URL"
                            fullWidth
                            margin="normal"
                            value={this.state.profile_photo}
                            onChange={(e) => this.setState({ profile_photo: e.target.value })}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.dark_mode}
                                    onChange={(e) => this.setState({ dark_mode: e.target.checked })}
                                />
                            }
                            label="Dark Mode"
                        />

                        <div>
                            <Button
                                variant="contained"
                                onClick={this.handleSave}
                                sx={{ marginRight: 1 }}
                            >
                                Save
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={this.handleCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <TextField
                            label="First Name"
                            fullWidth
                            margin="normal"
                            disabled
                            value={user.first_name || ''}
                        />

                        <TextField
                            label="Last Name"
                            fullWidth
                            margin="normal"
                            disabled
                            value={user.last_name || ''}
                        />

                        <TextField
                            label="Location"
                            fullWidth
                            margin="normal"
                            disabled
                            value={user.location || ''}
                        />

                        <TextField
                            label="Description"
                            fullWidth
                            margin="normal"
                            disabled
                            multiline
                            rows={3}
                            value={user.description || ''}
                        />

                        <TextField
                            label="Occupation"
                            fullWidth
                            margin="normal"
                            disabled
                            value={user.occupation || ''}
                        />

                        <TextField
                            label="Personal Website"
                            fullWidth
                            margin="normal"
                            disabled
                            value={user.website || ''}
                        />

                        <TextField
                            label="Dark Mode"
                            fullWidth
                            margin="normal"
                            disabled
                            value={user.dark_mode ? 'Enabled' : 'Disabled'}
                        />

                        {user.website && (
                            <Button
                                variant="contained"
                                component="a"
                                href={user.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ marginRight: 1 }}
                            >
                                Visit Website
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            component="a"
                            href={'#/photos/' + user._id}
                            sx={{ marginRight: 1 }}
                        >
                            View Photos
                        </Button>

                        {isOwnProfile && (
                            <Button
                                variant="outlined"
                                onClick={() => this.setState({ editing: true })}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default UserDetail;