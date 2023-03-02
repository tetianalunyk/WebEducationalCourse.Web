import React, { useState, useEffect } from 'react';
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
  const [allRoles, setAllRoles] = useState();
  const [editedUser, setEditedUser] = useState();

  const handleClose = () => {
    setEditedUser(null);
    setValue(null);
    onClose();
  };

  const handleSubmit = async () => {
    const newRoles = editedUser.roles.filter(r => !allRoles.find(ro => ro.name === r.name));

    const addedRolesPromise = newRoles?.map(role => {
      return usersService.addNewRole(role);
    });

    Promise.all(addedRolesPromise).then(async savedRoles => {
      const userToUpdate = { ...editedUser };
      userToUpdate.roles = editedUser.roles?.flatMap(role => role.id ? role.id : []);
      userToUpdate.roles = userToUpdate.roles.concat(savedRoles?.map(role => role.id));
      if (initialUser) {
        const updatedUser = await usersService.updateUser(userToUpdate);
        if (updatedUser.id) {
          handleClose();
        }
      } else {
        const createdUser = await usersService.createUser(userToUpdate);
        if (createdUser.id) {
          handleClose();
        }
      }
    });
  };

  const handleFisrtNameChange = (e) => {
    setEditedUser((x) => ({
      ...x,
      'firstName': e.target.value
    }))
  };

  const handleLastNameChange = (e) => {
    setEditedUser((x) => ({
      ...x,
      'lastName': e.target.value
    }))
  };

  const handleEmailChange = (e) => {
    setEditedUser((x) => ({
      ...x,
      'email': e.target.value
    }))
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
  };

  const setUserRole = (role) => {
    const userRoles = structuredClone(editedUser.roles);
    const indexId = userRoles.findIndex(r => r.name === role.name);
    if (indexId === -1) {
      userRoles.push(role);

      setEditedUser((x) => ({
        ...x,
        'roles': userRoles
      }));
    }
  }

  useEffect(() => {
    if (initialUser)
      setEditedUser(structuredClone(initialUser));
  }, [initialUser, isVisible]);

  useEffect(() => {
    const fetchAllRoles = async () => {
      await usersService.getAllRoles()
        .then((data) => setAllRoles(data));
    };

    if (isVisible)
      fetchAllRoles();
  }, [isVisible, value]);

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
          <DialogContent sx={{ display: 'inline-grid', 'max-width': '300px;' }} dividers>
            <TextField id="firstName" sx={{ margin: '10px' }} size="small" label="First Name" variant="outlined" onChange={handleFisrtNameChange} value={editedUser?.firstName} error ={editedUser?.firstName.length !== 0 ? false : true }/>
            <TextField id="lastName" sx={{ margin: '10px' }} size="small" label="Last Name" variant="outlined" onChange={handleLastNameChange} value={editedUser?.lastName} error ={editedUser?.lastName.length !== 0 ? false : true }/>
            <TextField id="email" sx={{ margin: '10px' }} size="small" label="Email" variant="outlined" onChange={handleEmailChange} value={editedUser?.email} error ={editedUser?.email.length !== 0 ? false : true }/>
            <Stack direction="row" spacing={1} sx={{ margin: 'auto', padding: '10px', display: 'inline-block'}}>
            {editedUser?.roles?.map((role) => (
                <Chip label={role.name} variant="outlined" onDelete={() => handleRoleDelete(role.id)} />
              ))}
            </Stack>
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
              id="free-solo-with-text-demo"
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
          </DialogContent>
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