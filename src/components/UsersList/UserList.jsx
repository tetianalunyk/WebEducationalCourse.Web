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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#01579b',
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
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
    const [users, setUsers] = useState();
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState();

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirmOpen = (id) => {
        setConfirmOpen(true);
        setSelectedUserId(id);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
    };

    const handleConfirm = async () => {
        if (selectedUserId)
            await usersService.deleteUserById(selectedUserId);
        setConfirmOpen(false);
    };

    const renderRowActions = (row) => {
        return (
            <div align='center'>
                <IconButton aria-label="Example" onClick={handleClickOpen}>
                    <CreateIcon color="info" />
                </IconButton>
                <IconButton aria-label="Example" onClick={() => handleConfirmOpen(row.id)}>
                    <DeleteForeverIcon color="primary" />
                </IconButton>
            </div>
        )
    };

    useEffect(() => {
        const fetchUsers = async () => {
            await usersService.getAllUsers()
                .then((data) => setUsers(data));
        };

        if (!open)
            fetchUsers();
    }, [open, isConfirmOpen]);

    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen}>
                New
            </Button>
            <TableContainer sx={{ width: '90%', margin: 'auto' }} component={Paper}>
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
                        {users?.map((user) => (
                            <StyledTableRow key={user.id}>
                                <StyledTableCell align="center" component="th" scope="row">
                                    {user.imageBlobKey}
                                </StyledTableCell>
                                <StyledTableCell align="center">{user.firstName}</StyledTableCell>
                                <StyledTableCell align="center">{user.lastName}</StyledTableCell>
                                <StyledTableCell align="center">{user.email}</StyledTableCell>
                                <StyledTableCell align="center">{user.roles.map(r => r.name)}</StyledTableCell>
                                <StyledTableCell align="center" component={() => renderRowActions(user)}></StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <UserCreateUpdateModal isVisible={open} onClose={handleClose} />
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