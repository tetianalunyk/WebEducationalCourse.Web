import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { usersService } from '../../services/UsersService';
import AuthService from '../../services/AuthService';
import Alert from '@mui/material/Alert';
import './Login.css';

const authService = new AuthService();

export default function Login(props) {
    const [isFormValid, setIsFormValid] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        validateLogin(value);
    };

    const validateLogin = (value) => {
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
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    };

    const validatePassword = (value) => {
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
        setIsFormValid(true);
        validateLogin(email);
        validatePassword(password);

        if (errors.password || errors.email) {
            setIsFormValid(false);
            return;
        }
        await authService.login({
            email: email,
            password: password
        })
            .then(async token => {
                localStorage.setItem('accessToken', token.accessToken);
                localStorage.setItem('refreshToken', token.refreshToken);
                var loggedUser = await usersService.getUserById(token.userID);
                localStorage.setItem('loggedUser', loggedUser.email);
                //setLoggedUser(loggedUser.email);
            })
            .catch(err => {
                console.log(err);
                //todo: handle error
            });
    };

    return (
        <div>
            <Box component="form" className="loginForm">
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
                {!isFormValid &&
                        <Alert severity="error" sx={{margin: '20px'}}>
                            The form isn't filled correct — <strong>check it out!</strong>
                        </Alert>
                    }
                <Button autoFocus onClick={handleSubmit}>
                    Login
                </Button>
            </Box>
        </div>
    );
}