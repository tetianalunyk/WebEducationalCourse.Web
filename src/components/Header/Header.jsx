import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { NavLink } from "react-router-dom";
import Login from '../Login/Login';


export default function Header() {

  const [open, setOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState(localStorage.getItem('loggedUser'));

  const handleClose = () => {
    setOpen(false);
  };

  const Logout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('loggedUser');
    setLoggedUser(null);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" sx={{ flexGrow: 1 }} ><NavLink to='/management/users'>Users</ NavLink ></Button>
            <Button color="inherit" sx={{ flexGrow: 1 }} ><NavLink to='/management/models'>Models</ NavLink ></Button>
            {loggedUser ?
              <>
                <p style={{ width: '150px' }}>{loggedUser}</p>
                <Button color="inherit" sx={{ marginLeft: '64%' }} onClick={Logout} >Logout</Button>
              </>
              :
              <Button color="inherit" sx={{ marginLeft: '75%' }} onClick={() => setOpen(true)} >Login</Button>
            }
          </Toolbar>
        </AppBar>
      </Box>
      <Login isVisible={open} onClose={handleClose} setLoggedUser={setLoggedUser} />
    </>
  );
}