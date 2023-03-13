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
import { modelsService } from '../../services/ModelsService';
import { filesService } from '../../services/FilesService';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import './ModelCreateUpdateModal.css';

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

export default function ModelCreateUpdateModal(props) {
    const { isVisible, onClose, initialModel } = props;
    const [value, setValue] = useState(null);
    const [allTags, setAllTags] = useState([]);
    const [editedModel, setEditedModel] = useState(null);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [filePreviewBlob, setFilePreviewBlob] = useState(null);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(true);

    const handleClose = () => {
        setEditedModel(null);
        setValue(null);
        setFilePreview(null);
        setFilePreviewBlob(null);
        setFile(null);
        setErrors({});
        setIsFormValid(true);
        setAllTags([]);
        onClose();
    };

    const handleSubmit = async () => {
        const isFormCorrect = validateForm();

        if (!isFormCorrect) {
            return setIsFormValid(isFormCorrect);
        }

        const newTags = editedModel?.tags.filter(r => !allTags.find(ro => ro.name === r.name));

        const addedTagsPromise = newTags?.map(tag => {
            return modelsService.addNewTag(tag);
        });

        if (addedTagsPromise) {
            Promise.all(addedTagsPromise).then(async savedTags => {
                const modelToUpdate = { ...editedModel };
                modelToUpdate.tags = editedModel.tags?.flatMap(tag => tag.id ? tag.id : []);
                modelToUpdate.tags = modelToUpdate.tags.concat(savedTags?.map(tag => tag.id));
                if (filePreview) {
                    if (initialModel && initialModel.previewBlobKey) {
                        await filesService.updateFile(editedModel.previewBlobKey, filePreview);
                    } else {
                        const createdFile = await filesService.addFile(filePreview);
                        modelToUpdate.previewBlobKey = createdFile._id;
                    }
                }

                if (file) {
                    if (initialModel && initialModel.fileKey) {
                        await filesService.updateFile(editedModel.fileKey, file);
                    } else {
                        const createdFile = await filesService.addFile(file);
                        modelToUpdate.fileKey = createdFile._id;
                    }
                }

                if (initialModel) {
                    const updatedModel = await modelsService.updateModel(modelToUpdate);
                    if (updatedModel.id) {
                        handleClose();
                    }
                } else {
                    const createdModel = await modelsService.createModel(modelToUpdate);
                    if (createdModel.id) {
                        handleClose();
                    }
                }
            });
        }
    };

    const validateForm = () => {
        let isFormCorrect;
        if (initialModel) {
            isFormCorrect = !errors.name && !errors.tags && !errors.file && (file || initialModel.fileKey);

        } else {
            isFormCorrect = Object.values(errors).length === 3 && Object.values(errors).every(value => {
                if (value === null) {
                    return true;
                }
                return false;
            });
        }
        if (!editedModel?.name) {
            setErrors(x => ({
                ...x,
                name: 'This field cannot be empty!'
            }));
        }

        if (!editedModel?.tags) {
            setErrors(x => ({
                ...x,
                tags: 'At least one tag should be added!'
            }));
        }

        if (!(file || initialModel?.fileKey)) {
            setErrors(x => ({
                ...x,
                file: 'File should be added!'
            }));
        }

        return isFormCorrect;
    }

    const handleNameChange = (e) => {
        const value = e.target.value;
        setEditedModel((x) => ({
            ...x,
            'name': value
        }));

        if (!value) {
            setErrors(x => ({
                ...x,
                name: 'This field cannot be empty!'
            }));
            return;
        }

        setErrors(x => ({
            ...x,
            name: null
        }));
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setEditedModel((x) => ({
            ...x,
            'description': value
        }));
    };

    const handleTagDelete = (id) => {
        const modelTags = structuredClone(editedModel.tags);
        const indexId = modelTags.findIndex(tag => tag.id === id);
        if (indexId !== -1) {
            modelTags.splice(indexId, 1);
        }

        setEditedModel((x) => ({
            ...x,
            'tags': modelTags
        }));

        if (modelTags.length === 0) {
            setErrors((x) => ({
                ...x,
                'tags': 'At leact one tag should be added!'
            }));
        }
    };

    const setModelTag = (tag) => {
        const modelTags = editedModel?.tags ? structuredClone(editedModel.tags) : [];
        const indexId = modelTags.findIndex(r => r.name === tag.name);
        if (indexId === -1) {
            modelTags.push(tag);

            setEditedModel((x) => ({
                ...x,
                'tags': modelTags
            }));

            setErrors((x) => ({
                ...x,
                'tags': null
            }));
        }
    };

    const uploadPreviewFile = (e) => {
        const blob = URL.createObjectURL(e.target.files[0]);
        setFilePreviewBlob(blob);
        setFilePreview(e.target.files[0]);
    };

    const uploadFile = (e) => {
        setFile(e.target.files[0]);
        setErrors(x => ({
            ...x,
            file: null
        }))
    };

    useEffect(() => {
        if (initialModel) {
            setEditedModel(structuredClone(initialModel));
            if (initialModel.image) {
                setFilePreview(initialModel.image);
                setFilePreviewBlob(URL.createObjectURL(initialModel.image));
            }
        }
    }, [initialModel, isVisible]);

    useEffect(() => {
        const fetchAllTags = async () => {
            await modelsService.getAllTags()
                .then((data) => setAllTags(data));
        };

        if (isVisible)
            fetchAllTags();
    }, [isVisible, value, file, filePreview]);

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
                        Model Profile
                    </BootstrapDialogTitle>
                    <DialogContent sx={{ display: 'inline-grid', maxWidth: '350px;' }} >
                        {filePreviewBlob && (
                            <div style={{ 'margin': 'auto', padding: '10px' }}>
                                <img
                                    src={`${filePreviewBlob}`}
                                    alt={editedModel?.name}
                                    loading="lazy"
                                    width='90px'
                                    align='center'
                                />
                            </div>
                        )}
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ width: '93%', margin: '10px' }}
                        >
                            Change Preview
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={uploadPreviewFile}
                            />
                        </Button>
                        <TextField id="name" aria-label='name' sx={{ margin: '10px', marginTop: '20px' }} size="small" label="Name" variant="outlined" onChange={handleNameChange} value={editedModel?.name} />
                        {errors.name &&
                            <Box>
                                <span className="error-message">{errors.name}</span>
                            </Box>
                        }
                        <TextField id="description" aria-label='description' sx={{ margin: '10px' }} size="small" label="Description" multiline rows={2} onChange={handleDescriptionChange} value={editedModel?.description} />

                        <Stack direction="row" spacing={1} sx={{ margin: 'auto', padding: '10px', display: 'inline-block' }}>
                            {editedModel?.tags?.map((tag) => (
                                <Chip key={tag.id} label={tag.name} variant="outlined" onDelete={() => handleTagDelete(tag.id)} />
                            ))}
                        </Stack>
                        {errors.tags &&
                            <Box>
                                <span className="error-message">{errors.tags}</span>
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
                                    const newTag = {
                                        name: newValue.inputValue,
                                    };
                                    setModelTag(newTag);
                                    setValue(newTag);
                                } else {
                                    setModelTag(newValue);
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
                            id="tags"
                            options={allTags}
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
                                <TextField sx={{ margin: '10px', width: '93%' }} {...params} label="Tags" />
                            )}
                        />
                        {file && <p style={{ margin: 10 + 'px' }}>Selected file: {file.name}</p>}
                        {errors.file &&
                            <Box>
                                <span className="error-message">{errors.file}</span>
                            </Box>
                        }
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ width: '93%', margin: '10px' }}
                            id='file'
                        >
                            Change File
                            <input
                                hidden
                                type="file"
                                onChange={uploadFile}
                            />
                        </Button>
                    </DialogContent>
                    {!isFormValid &&
                        <Alert severity="error">
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