import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { modelsService } from '../../services/ModelsService';
import { filesService } from '../../services/FilesService';
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import PreviewIcon from '@mui/icons-material/Preview';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

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

function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const [model, setModel] = useState(row);

    const handleModelHistoryOpen = async (row) => {
        if (!row.history) {
            const currModel = {
                modelId: row.id,
                createdAt: row.updatedAt,
                createdBy: `${row.updatedByFirstName} ${row.updatedByLastName}`,
                fileKey: row.fileKey,
                isLast: true
            };

            await modelsService.getModelHistoryById(row.id)
                .then(modelHistory => {
                    modelHistory.unshift(currModel);
                    setModel(x => ({
                        ...x,
                        history: modelHistory
                    }));
                })
                .catch(err => {
                    console.log(err);
                })
        }
    };

    const handlePreviewOpen = (model) => {
        //setOpen(true);
        //setSelectedModel(model);
    };

    const handleFileDownload = async (name, fileKey) => {
        await filesService.getFileById(fileKey)
            .then(file => {
                const fileUrl = URL.createObjectURL(file);
                const link = document.createElement('a')

                link.setAttribute('href', fileUrl)
                link.setAttribute('download', name)
                link.style.display = 'none'

                document.body.appendChild(link)

                link.click()

                document.body.removeChild(link)
            })
            .catch(err => {
                console.log(err);
            })
    };

    const renderRowActions = (name, fileKey) => {
        return (
            <StyledTableCell>
                <div align='center'>
                    <Button aria-label="Preview" onClick={() => handlePreviewOpen(row)} endIcon={<PreviewIcon color="primary" />}>
                        Preview
                    </Button>
                    <Button aria-label="Download" onClick={() => handleFileDownload(name, fileKey)} endIcon={<FileDownloadIcon color="primary" />}>
                        Download
                    </Button>
                </div>
            </StyledTableCell>
        )
    };

    const formatDate = (date) => {
        const newDate = new Date(date);
        const year = newDate.getFullYear();
        const day = ("0" + newDate.getDate()).slice(-2)
        const month = ("0" + (newDate.getMonth() + 1)).slice(-2)
        const hour = ("0" + newDate.getHours()).slice(-2)
        const minutes = ("0" + newDate.getMinutes()).slice(-2)

        return `${day}.${month}.${year} ${hour}:${minutes}`;
    };

    return (
        <React.Fragment>
            <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <StyledTableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon onClick={() => handleModelHistoryOpen(model)} />}
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="center">
                    {model.name}
                </StyledTableCell>
                <StyledTableCell align="center">{model.description}</StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: 'pre' }}>{model.tags?.map(r => `${r.name}\n`)}</StyledTableCell>
                <StyledTableCell align="center" component={() => renderRowActions(model.name, model.fileKey)}></StyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
                <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell align="center">Date</StyledTableCell>
                                        <StyledTableCell align="center">User</StyledTableCell>
                                        <StyledTableCell align="center">Actions</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {model.history?.map((historyRow, index) => (
                                        <StyledTableRow key={index}>
                                            <StyledTableCell component="th" scope="row" align="center">
                                                {historyRow.isLast && <ArrowForwardIcon color="success" />}
                                                {formatDate(historyRow.createdAt)}
                                            </StyledTableCell>
                                            <StyledTableCell align="center" >{historyRow.createdBy}</StyledTableCell>
                                            <StyledTableCell align="center" component={() => renderRowActions(model.name, historyRow.fileKey)}></StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    );
}


export default function ModelHistoryComponent() {
    const [models, setModels] = useState([]);
    const [filterValue, setFilterValue] = useState('');
    const [filteredTags, setFilteredTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const navigate = useNavigate();

    const handleFilter = (e) => {
        const filterValue = e.target.value.toLowerCase().trim();
        setFilterValue(filterValue);
    };

    const handleTagSearchSelect = (e, value) => {
        setFilteredTags(value);
    }

    useEffect(() => {
        const fetchModels = async () => {
            const searchParams = new URLSearchParams({
                filter: filterValue,
                tags: filteredTags.map(x => x.name)
            });

            await modelsService.getAllModels(searchParams)
                .then((data) => {
                    const modelPromises = data?.map(async model => ({
                        ...model,
                        image: model.previewBlobKey ? await filesService.getFileById(model.previewBlobKey) : null
                    }));
                    Promise.all(modelPromises).then(models => {
                        setModels(models);
                    });
                })
                .catch(err => {
                    navigate('/error');
                });
        };

        fetchModels();
    }, [navigate, filterValue, filteredTags]);

    useEffect(() => {
        const fetchAllTags = async () => {
            await modelsService.getAllTags().then(data => {
                setAllTags(data);
            })
                .catch(err => {

                });
        };

        fetchAllTags();
    }, []);

    return (
        <>
            <div className='action-bar'>
            <Stack spacing={3} sx={{ width: 500 }}>
                <Autocomplete
                    multiple
                    size='small'
                    id="tags"
                    options={allTags}
                    onChange={handleTagSearchSelect}
                    getOptionLabel={(option) => option.name}
                    filterSelectedOptions
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Selected Tags"
                            placeholder="Tags"
                        />
                    )}
                />
                </Stack>
                <TextField
                    data-testid='filter'
                    label="Filter"
                    id="filter"
                    defaultValue={filterValue}
                    size="small"
                    onChange={handleFilter}
                />
            </div>
            <TableContainer sx={{ width: '90%', margin: 'auto' }} component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align="center" />
                            <StyledTableCell align="center">Model Name</StyledTableCell>
                            <StyledTableCell align="center">Description</StyledTableCell>
                            <StyledTableCell align="center">Tags</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {models.map((row) => (
                            <Row key={row.name} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}