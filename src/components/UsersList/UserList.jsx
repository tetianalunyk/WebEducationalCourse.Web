import React, { useState, useEffect } from 'react';
import { Confirm } from 'react-admin';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import UserCreateUpdateModal from '../UserCreateUpdateModal/UserCreateUpdateModal';
import { usersService } from '../../services/UsersService';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import CreateIcon from '@mui/icons-material/Create';
import TextField from '@mui/material/TextField';
import './UserList.css'
import { filesService } from '../../services/FilesService';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#1976d2a6',
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        whiteSpace: 'pre',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#e1f5fe',
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function UserList() {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filterValue, setFilterValue] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(null);

    const handleFilter = (e) => {
        const filterValue = e.target.value.toLowerCase().trim();
        setFilterValue(filterValue);
        setFilteredUsers(users.filter(u => u.firstName.toLowerCase().includes(filterValue) || u.lastName.toLowerCase().includes(filterValue) || u.email.toLowerCase().includes(filterValue)));
    };

    const handleClickOpen = (user) => {
        setOpen(true);
        setSelectedUser(user);
    };
    const handleClose = () => {
        setOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmOpen = (user) => {
        setSelectedUser(user);
        setConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
    };

    const handleConfirm = async () => {
        if (selectedUser) {
            await usersService.deleteUserById(selectedUser.id)
                .then(async res => {
                    await filesService.deleteFile(selectedUser.imageBlobKey);
                })
                .catch(err => {
                    console.log(err);
                    //todo: handle error
                });
        }
        setConfirmOpen(false);
    };

    const renderRowActions = (row) => {
        return (
            <StyledTableCell>
                <div align='center'>
                    <IconButton aria-label="Edit" onClick={() => handleClickOpen(row)}>
                        <CreateIcon color="info" />
                    </IconButton>
                    <IconButton aria-label="Delete" onClick={() => handleConfirmOpen(row)}>
                        <DeleteForeverIcon color="primary" />
                    </IconButton>
                </div>
            </StyledTableCell>
        )
    };

    useEffect(() => {
        const fetchUsers = async () => {
            await usersService.getAllUsers()
                .then((data) => {
                    const userPromises = data?.map(async user => ({
                        ...user,
                        image: user.imageBlobKey ? await filesService.getFileById(user.imageBlobKey) : null
                    }));
                    Promise.all(userPromises).then(users => {
                        setUsers(users);
                        setFilteredUsers(users);
                    });
                })
                .catch(err => {
                    console.log(err);
                    //todo: handle error
                });
        };

        if (!open)
            fetchUsers();
    }, [open, isConfirmOpen]);

    return (
        <>
            <div className='action-bar'>
                <Button variant="outlined" onClick={() => setOpen(true)}>
                    New
                </Button>
                <TextField
                    data-testid='filter'
                    label="Filter"
                    id="filter"
                    defaultValue={filterValue}
                    size="small"
                    onChange={handleFilter}
                />
            </div>
            <TableContainer sx={{ width: '90%', margin: 'auto' }} component={Paper} testid='table'>
                <Table aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align="center">Picture</StyledTableCell>
                            <StyledTableCell align="center">First Name</StyledTableCell>
                            <StyledTableCell align="center">Last Name</StyledTableCell>
                            <StyledTableCell align="center">Email</StyledTableCell>
                            <StyledTableCell align="center">Roles</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers?.map((user) => (
                            <StyledTableRow key={user.id}>
                                <StyledTableCell align="center" component="th" scope="row">
                                    {user.image && (
                                        <img
                                            src={`${URL.createObjectURL(user.image)}`}
                                            alt={user.firstName}
                                            loading="lazy"
                                            width='60px'
                                        />
                                    )}
                                </StyledTableCell>
                                <StyledTableCell align="center">{user.firstName}</StyledTableCell>
                                <StyledTableCell align="center">{user.lastName}</StyledTableCell>
                                <StyledTableCell align="center">{user.email}</StyledTableCell>
                                <StyledTableCell align="center">{user.roles.map(r => `${r.name}\n`)}</StyledTableCell>
                                <StyledTableCell align="center" component={() => renderRowActions(user)}></StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <UserCreateUpdateModal isVisible={open} onClose={handleClose} initialUser={selectedUser} />
            <Confirm
                cancel='Cancel'
                confirm='Delete'
                isOpen={isConfirmOpen}
                title="Delete user"
                content="Are you sure you want to delete this user permanently?"
                onConfirm={handleConfirm}
                onClose={handleConfirmClose}
            />
        </>
    );
}