import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import { usersService } from '../../services/UsersService';
import AuthService from '../../services/AuthService';
const authService = new AuthService();



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

export default function Login(props) {
    const { isVisible, onClose, setLoggedUser } = props;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleClose = () => {
        onClose();
        setEmail('');
        setPassword('');
        setErrors({});
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

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
        setPassword(value);

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

    const handleSubmit = async () => {
        var token = await authService.login({
            email: email,
            password: password
        });
            localStorage.setItem('accessToken', token.accessToken);
            localStorage.setItem('refreshToken', token.refreshToken);
            var loggedUser = await usersService.getUserById(token.userID);
            localStorage.setItem('loggedUser', loggedUser.email);
            setLoggedUser(loggedUser.email);
            handleClose();
    };

    return (
        <div>
            <Box
                component="form">
                <BootstrapDialog
                    onClose={handleClose}
                    aria-labelledby="Login"
                    open={isVisible}
                >
                    <BootstrapDialogTitle id="login" onClose={handleClose} sx={{ background: '#bbdefb' }}>
                        Model Profile
                    </BootstrapDialogTitle>
                    <DialogContent sx={{ display: 'inline-grid', maxWidth: '350px;' }} >
                        <TextField id="email" aria-label='email' sx={{ margin: '10px', marginTop: '20px' }} size="small" label="Email" variant="outlined" onChange={handleEmailChange} value={email} />
                        {errors.email &&
                            <Box>
                                <span className="error-message">{errors.email}</span>
                            </Box>
                        }
                        <TextField id="Password" aria-label='password' type="password" sx={{ margin: '10px' }} size="small" label="Password" variant='outlined' onChange={handlePasswordChange} value={password} />
                        {errors.password &&
                            <Box>
                                <span className="error-message">{errors.password}</span>
                            </Box>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={handleSubmit}>
                            Login
                        </Button>
                    </DialogActions>
                </BootstrapDialog>
            </Box>
        </div>
    );
}