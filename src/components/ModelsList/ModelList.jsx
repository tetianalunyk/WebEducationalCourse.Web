import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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
import ModelCreateUpdateModal from '../ModelCreateUpdateModal/ModelCreateUpdateModal';
import { modelsService } from '../../services/ModelsService';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import CreateIcon from '@mui/icons-material/Create';
import TextField from '@mui/material/TextField';
import './ModelList.css'
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

export default function ModelList() {
    const [open, setOpen] = useState(false);
    const [models, setModels] = useState([]);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [filterValue, setFilterValue] = useState('');
    const [filteredModels, setFilteredModels] = useState(null);
    const navigate = useNavigate();

    const handleFilter = (e) => {
        const filterValue = e.target.value.toLowerCase().trim();
        setFilterValue(filterValue);
        setFilteredModels(models.filter(u => u.name.toLowerCase().includes(filterValue) || u.description.toLowerCase().includes(filterValue) || u.updatedByFirstName.toLowerCase().includes(filterValue) || u.updatedByLastName.toLowerCase().includes(filterValue)));
    };

    const handleClickOpen = (model) => {
        setOpen(true);
        setSelectedModel(model);
    };
    const handleClose = () => {
        setOpen(false);
        setSelectedModel(null);
    };

    const handleConfirmOpen = (model) => {
        setSelectedModel(model);
        setConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
    };

    const handleConfirm = async () => {
        if (selectedModel)
            await modelsService.deleteModelById(selectedModel.id)
                .then(async res => {
                    if (selectedModel.previewBlobKey) {
                        await filesService.deleteFile(selectedModel.previewBlobKey);
                    }

                    if (selectedModel.fileKey) {
                        await filesService.deleteFile(selectedModel.fileKey);
                    }

                    setConfirmOpen(false);
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

    const formatDate = (date) => {
        const newDate = new Date(date);
        const year = newDate.getFullYear();
        const day = ("0" + newDate.getDate()).slice(-2)
        const month = ("0" + (newDate.getMonth() + 1)).slice(-2)
        const hour = newDate.getHours();
        const minutes = newDate.getMinutes();

        return `${day}.${month}.${year} ${hour}:${minutes}`;
    };

    useEffect(() => {
        const fetchModels = async () => {
            await modelsService.getAllModels()
                .then((data) => {
                    const modelPromises = data?.map(async model => ({
                        ...model,
                        image: model.previewBlobKey ? await filesService.getFileById(model.previewBlobKey) : null
                    }));
                    Promise.all(modelPromises).then(models => {
                        setModels(models);
                        setFilteredModels(models);
                    });
                })
                .catch(err => {
                    if (err.message === '401')
                        navigate('/login');
                    else
                        navigate('/error');
                });
        };

        if (!open)
            fetchModels();
    }, [open, isConfirmOpen, navigate]);

    return (
        <>
            <div className='action-bar'>
                <Button variant="outlined" onClick={() => setOpen(true)}>
                    New
                </Button>
                <TextField
                    testid='filter'
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
                            <StyledTableCell align="center">Name</StyledTableCell>
                            <StyledTableCell align="center">Description</StyledTableCell>
                            <StyledTableCell align="center">Tags</StyledTableCell>
                            <StyledTableCell align="center">Last Update</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredModels?.map((model) => (
                            <StyledTableRow key={model.id}>
                                <StyledTableCell align="center" component="th" scope="row">
                                    {model.image && (
                                        <img
                                            src={`${URL.createObjectURL(model.image)}`}
                                            alt={model.Name}
                                            loading="lazy"
                                            width='60px'
                                        />
                                    )}
                                </StyledTableCell>
                                <StyledTableCell align="center">{model.name}</StyledTableCell>
                                <StyledTableCell align="center">{model.description}</StyledTableCell>
                                <StyledTableCell align="center">{model.tags?.map(r => `${r.name}\n`)}</StyledTableCell>
                                <StyledTableCell align="center">{`${formatDate(model.updatedAt)} by ${model.updatedByFirstName} ${model.updatedByLastName}`}</StyledTableCell>
                                <StyledTableCell align="center" component={() => renderRowActions(model)}></StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ModelCreateUpdateModal isVisible={open} onClose={handleClose} initialModel={selectedModel} />
            <Confirm
                cancel='Cancel'
                confirm='Delete'
                isOpen={isConfirmOpen}
                title="Delete model"
                content="Are you sure you want to delete this model permanently?"
                onConfirm={handleConfirm}
                onClose={handleConfirmClose}
            />
        </>
    );
}