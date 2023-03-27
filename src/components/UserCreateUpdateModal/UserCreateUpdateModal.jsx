import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { usersService } from '../../services/UsersService';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import './UserCreateUpdateModal.css';
import { filesService } from '../../services/FilesService';

const filter = createFilterOptions();

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;


  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export default function UserCreateUpdateModal(props) {
  const { isVisible, onClose, initialUser } = props;
  const [value, setValue] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [editedUser, setEditedUser] = useState(null);
  const [file, setFile] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(true);
  let navigate = useNavigate();

  const handleClose = () => {
    setEditedUser(null);
    setValue(null);
    setFile(null);
    setFileBlob(null);
    setErrors({});
    setIsFormValid(true);
    setAllRoles([]);
    onClose();
  };

  const handleSubmit = async () => {
    let isFormCorrect;
    if (initialUser) {
      isFormCorrect = !errors.firstName && !errors.lastName && !errors.email && !errors.roles;

    } else {
      isFormCorrect = Object.values(errors).length === 5 && Object.values(errors).every(value => {
        if (value === null) {
          return true;
        }
        return false;
      });
    }

    if (!isFormCorrect) {
      return setIsFormValid(isFormCorrect);
    }

    const newRoles = editedUser?.roles.filter(r => !allRoles.find(ro => ro.name === r.name));

    const addedRolesPromise = newRoles?.map(role => {
      return usersService.addNewRole(role);
    });

    if (addedRolesPromise) {
      Promise.all(addedRolesPromise)
        .then(async savedRoles => {
          const userToUpdate = { ...editedUser };
          userToUpdate.roles = editedUser.roles?.flatMap(role => role.id ? role.id : []);
          userToUpdate.roles = userToUpdate.roles.concat(savedRoles?.map(role => role.id));
          if (initialUser && initialUser.imageBlobKey) {
            await filesService.updateFile(editedUser.imageBlobKey, file)
              .then(async file => {
                await usersService.updateUser(userToUpdate)
                  .then(res => {
                    handleClose();
                  });
              });
          } else {
            await filesService.addFile(file)
              .then(async file => {
                userToUpdate.imageBlobKey = file._id;
                await usersService.createUser(userToUpdate)
                  .then(res => {
                    handleClose();
                  });
              });
          }
        })
        .catch(err => {
          switch (err.message) {
            case '401':
              navigate('/unauthorized');
              break;
            case '403':
              navigate('/forbidden');
              break;
            case '500':
              navigate('/internalError');
              break;
            default:
              navigate('/');
          }
        });
    }
  };

  const handleFisrtNameChange = (e) => {
    const value = e.target.value;
    setEditedUser((x) => ({
      ...x,
      'firstName': value
    }));

    if (!value) {
      setErrors(x => ({
        ...x,
        firstName: 'This field cannot be empty!'
      }));
      return;
    }

    if (value && !value.match(/^[a-zA-Z]+$/)) {
      setErrors(x => ({
        ...x,
        firstName: 'This field must contain letters only!'
      }));
      return;
    }

    setErrors(x => ({
      ...x,
      firstName: null
    }));
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setEditedUser((x) => ({
      ...x,
      'lastName': value
    }));

    if (!value) {
      setErrors(x => ({
        ...x,
        lastName: 'This field cannot be empty!'
      }));
      return;
    }

    if (value && !value.match(/^[a-zA-Z]+$/)) {
      setErrors(x => ({
        ...x,
        lastName: 'This field must contain letters only!'
      }));
      return;
    }

    setErrors(x => ({
      ...x,
      lastName: null
    }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEditedUser((x) => ({
      ...x,
      'email': value
    }));

    if (!value) {
      setErrors(x => ({
        ...x,
        email: 'This field cannot be empty!'
      }));
      return;
    }

    let lastAtPos = value.lastIndexOf("@");
    let lastDotPos = value.lastIndexOf(".");

    if (
      !(
        lastAtPos < lastDotPos &&
        lastAtPos > 0 &&
        value.indexOf("@@") === -1 &&
        lastDotPos > 2 &&
        value.length - lastDotPos > 2
      )
    ) {
      setErrors(x => ({
        ...x,
        email: 'Email is not valid!'
      }));
      return;
    }

    setErrors(x => ({
      ...x,
      email: null
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setEditedUser((x) => ({
      ...x,
      'password': value
    }));

    if (!value) {
      setErrors(x => ({
        ...x,
        password: 'This field cannot be empty!'
      }));
      return;
    }

    setErrors(x => ({
      ...x,
      password: null
    }));
  };


  const handleRoleDelete = (id) => {
    const userRoles = structuredClone(editedUser.roles);
    const indexId = userRoles.findIndex(role => role.id === id);
    if (indexId !== -1) {
      userRoles.splice(indexId, 1);
    }

    setEditedUser((x) => ({
      ...x,
      'roles': userRoles
    }));

    setErrors((x) => ({
      ...x,
      'roles': 'At leact one role should be added!'
    }));
  };

  const setUserRole = (role) => {
    const userRoles = editedUser?.roles ? structuredClone(editedUser.roles) : [];
    const indexId = userRoles.findIndex(r => r.name === role.name);
    if (indexId === -1) {
      userRoles.push(role);

      setEditedUser((x) => ({
        ...x,
        'roles': userRoles
      }));

      setErrors((x) => ({
        ...x,
        'roles': null
      }));
    }
  };

  const uploadFile = (e) => {
    const blob = URL.createObjectURL(e.target.files[0]);
    setFileBlob(blob);
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    if (initialUser) {
      setEditedUser(structuredClone(initialUser));
      if (initialUser.image) {
        setFile(initialUser.image);
        setFileBlob(URL.createObjectURL(initialUser.image));
      }
    }
  }, [initialUser, isVisible]);

  useEffect(() => {
    const fetchAllRoles = async () => {
      await usersService.getAllRoles()
        .then((data) => setAllRoles(data));
    };

    if (isVisible)
      fetchAllRoles();
  }, [isVisible, value, file]);

  return (
    <div>
      <Box
        component="form">
        <BootstrapDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={isVisible}
        >
          <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose} sx={{ background: '#bbdefb' }}>
            User Profile
          </BootstrapDialogTitle>
          <DialogContent sx={{ display: 'inline-grid', maxWidth: '340px;' }} >
            {fileBlob && (
              <div style={{ 'margin': 'auto', padding: '20px' }}>
                <img
                  src={`${fileBlob}`}
                  alt={editedUser?.firstName}
                  loading="lazy"
                  width='110px'
                  align='center'
                />
              </div>
            )}
            <TextField id="firstName" aria-label='firstName' sx={{ margin: '10px' }} size="small" label="First Name" variant="outlined" onChange={handleFisrtNameChange} value={editedUser?.firstName} />
            {errors.firstName &&
              <Box>
                <span className="error-message">{errors.firstName}</span>
              </Box>
            }
            <TextField id="lastName" aria-label='lastName' sx={{ margin: '10px' }} size="small" label="Last Name" variant="outlined" onChange={handleLastNameChange} value={editedUser?.lastName} />
            {errors.lastName &&
              <Box>
                <span className="error-message">{errors.lastName}</span>
              </Box>
            }
            <TextField id="email" aria-label='email' sx={{ margin: '10px' }} size="small" label="Email" variant="outlined" onChange={handleEmailChange} value={editedUser?.email} />
            {errors.email &&
              <Box>
                <span className="error-message">{errors.email}</span>
              </Box>
            }
            <TextField id="password" aria-label='password' sx={{ margin: '10px' }} size="small" type='password' label="Password" variant="outlined" onChange={handlePasswordChange} value={editedUser?.password} />
            {errors.password &&
              <Box>
                <span className="error-message">{errors.lastName}</span>
              </Box>
            }
            <Stack direction="row" spacing={1} sx={{ margin: 'auto', padding: '10px', display: 'inline-block' }}>
              {editedUser?.roles?.map((role) => (
                <Chip key={role.id} label={role.name} variant="outlined" onDelete={() => handleRoleDelete(role.id)} />
              ))}
            </Stack>
            {errors.roles &&
              <Box>
                <span className="error-message">{errors.roles}</span>
              </Box>
            }
            <Autocomplete
              size="small"
              value={value}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  setValue({
                    name: newValue,
                  });
                } else if (newValue && newValue.inputValue) {
                  const newRole = {
                    name: newValue.inputValue,
                  };
                  setUserRole(newRole);
                  setValue(newRole);
                } else {
                  setUserRole(newValue);
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some((option) => inputValue === option.name);
                if (inputValue !== '' && !isExisting) {
                  filtered.push({
                    inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="roles"
              options={allRoles}
              getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option.name === 'string') {
                  return option.name;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                  return option.inputValue;
                }
                // Regular option
                return option.name;
              }}
              renderOption={(props, option) => <li {...props}>{option.name}</li>}
              sx={{ width: 300 }}
              freeSolo
              renderInput={(params) => (
                <TextField sx={{ margin: '10px', width: '93%' }} {...params} label="Roles" />
              )}
            />
            <Button
              variant="contained"
              component="label"
              sx={{ width: '93%', margin: 'auto' }}
            >
              Change Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={uploadFile}
              />
            </Button>
          </DialogContent>
          {!isFormValid &&
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              The form isn't filled correct — <strong>check it out!</strong>
            </Alert>
          }
          <DialogActions>
            <Button autoFocus onClick={handleSubmit}>
              Save changes
            </Button>
          </DialogActions>
        </BootstrapDialog>
      </Box>
    </div>
  );
}