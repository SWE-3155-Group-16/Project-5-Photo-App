import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import './TopBar.css';
import axios from 'axios';

/**
 * TopBar component with "Add Photo" button (visible only when logged in).
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,         // logged-in user object or null
      dialogOpen: false,         // controls upload dialog visibility
      selectedFile: null,        // File object chosen by user
      previewUrl: null,          // local object URL for preview
      uploading: false,          // upload in-progress flag
      uploadError: null,         // error message string
      uploadSuccess: false,      // success flag
    };
    this.fileInputRef = React.createRef();
  }

  componentDidMount() {
    this.checkAuth();
  }

  checkAuth() {
    axios.get('/admin/me')
      .then(res => this.setState({ currentUser: res.data.user }))
      .catch(() => this.setState({ currentUser: null }));
  }

  handleOpenDialog = () => {
    this.setState({
      dialogOpen: true,
      selectedFile: null,
      previewUrl: null,
      uploadError: null,
      uploadSuccess: false,
    });
  };

  handleCloseDialog = () => {
    const { previewUrl, uploading } = this.state;
    if (uploading) return; // prevent closing mid-upload
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    this.setState({
      dialogOpen: false,
      selectedFile: null,
      previewUrl: null,
      uploadError: null,
      uploadSuccess: false,
    });
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { previewUrl } = this.state;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const newPreview = URL.createObjectURL(file);
    this.setState({ selectedFile: file, previewUrl: newPreview, uploadError: null, uploadSuccess: false });
  };

  handleUpload = () => {
    const { selectedFile } = this.state;
    if (!selectedFile) {
      this.setState({ uploadError: 'Please select an image file first.' });
      return;
    }

    this.setState({ uploading: true, uploadError: null });

    const formData = new FormData();
    formData.append('photo', selectedFile);

    axios.post('/photos/new', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        this.setState({ uploading: false, uploadSuccess: true });
        // Notify parent / trigger re-render if callback provided
        if (this.props.onPhotoUploaded) {
          this.props.onPhotoUploaded();
        }
        // Auto-close after brief success message
        setTimeout(() => this.handleCloseDialog(), 1500);
      })
      .catch(err => {
        const msg = err.response?.data?.error || 'Upload failed. Please try again.';
        this.setState({ uploading: false, uploadError: msg });
      });
  };

  handleLogout = () => {
    axios.post('/admin/logout')
      .then(() => {
        this.setState({ currentUser: null });
        window.location.reload();
      })
      .catch(console.error);
  };

  render() {
    const { currentUser, dialogOpen, selectedFile, previewUrl, uploading, uploadError, uploadSuccess } = this.state;

    return (
      <>
        <AppBar className="topbar-appBar" position="absolute">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5" color="inherit">
              PhotoShare
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentUser && (
                <>
                  <Typography variant="body1" color="inherit" sx={{ mr: 1 }}>
                    Hi, {currentUser.first_name || currentUser.name}!
                  </Typography>

                  {/* Add Photo button — only shown when logged in */}
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddAPhotoIcon />}
                    onClick={this.handleOpenDialog}
                    sx={{ mr: 1, fontWeight: 600 }}
                  >
                    Add Photo
                  </Button>

                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={this.handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}

              {!currentUser && (
                <Button variant="outlined" color="inherit" href="#/login">
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Photo Upload Dialog */}
        <Dialog open={dialogOpen} onClose={this.handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Upload a New Photo</DialogTitle>

          <DialogContent>
            {uploadSuccess ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                Photo uploaded successfully!
              </Alert>
            ) : (
              <>
                {uploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                  </Alert>
                )}

                {/* File picker */}
                <Box sx={{ mb: 2 }}>
                  <input
                    ref={this.fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={this.handleFileChange}
                    id="photo-file-input"
                  />
                  <label htmlFor="photo-file-input">
                    <Button
                      variant="outlined"
                      component="span"
                      disabled={uploading}
                      sx={{ mr: 2 }}
                    >
                      Choose File
                    </Button>
                  </label>
                  <Typography variant="body2" component="span" color="text.secondary">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </Typography>
                </Box>

                {/* Image preview */}
                {previewUrl && (
                  <Box
                    sx={{
                      width: '100%',
                      maxHeight: 300,
                      overflow: 'hidden',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      mb: 1,
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={this.handleCloseDialog} disabled={uploading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={this.handleUpload}
              disabled={!selectedFile || uploading || uploadSuccess}
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <AddAPhotoIcon />}
            >
              {uploading ? 'Uploading…' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

export default TopBar;
