import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, IconButton, Box, Typography, Radio, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/**
 * AnswerOptions component for managing multiple choice answers in admin interface
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of answer options
 * @param {Function} props.onChange - Function called when options change
 * @param {Boolean} props.hasCorrectAnswer - Whether to track correct answer
 */
const AnswerOptions = ({ options = [], onChange, hasCorrectAnswer = true }) => {
    const [answerOptions, setAnswerOptions] = useState(options.length > 0 ? options : [{ id: 1, text: '', isCorrect: true }]);

    useEffect(() => {
        if (options.length > 0 && JSON.stringify(options) !== JSON.stringify(answerOptions)) {
            setAnswerOptions(options);
        }
    }, [options]);

    useEffect(() => {
        onChange && onChange(answerOptions);
    }, [answerOptions, onChange]);

    const handleAddOption = () => {
        const newOption = {
            id: answerOptions.length > 0 ? Math.max(...answerOptions.map(o => o.id)) + 1 : 1,
            text: '',
            isCorrect: false
        };
        setAnswerOptions([...answerOptions, newOption]);
    };

    const handleRemoveOption = (id) => {
        if (answerOptions.length <= 1) return;
        
        const updatedOptions = answerOptions.filter(option => option.id !== id);
        
        // Ensure at least one option is marked as correct
        if (hasCorrectAnswer && !updatedOptions.some(o => o.isCorrect)) {
            updatedOptions[0].isCorrect = true;
        }
        
        setAnswerOptions(updatedOptions);
    };

    const handleTextChange = (id, value) => {
        const updatedOptions = answerOptions.map(option => 
            option.id === id ? { ...option, text: value } : option
        );
        setAnswerOptions(updatedOptions);
    };

    const handleCorrectAnswerChange = (id) => {
        if (!hasCorrectAnswer) return;
        
        const updatedOptions = answerOptions.map(option => ({
            ...option,
            isCorrect: option.id === id
        }));
        setAnswerOptions(updatedOptions);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Answer Options</Typography>
            
            {answerOptions.map((option, index) => (
                <Box key={option.id} display="flex" alignItems="center" mb={1}>
                    {hasCorrectAnswer && (
                        <Radio
                            checked={option.isCorrect}
                            onChange={() => handleCorrectAnswerChange(option.id)}
                            size="small"
                        />
                    )}
                    
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={option.text}
                        onChange={(e) => handleTextChange(option.id, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        sx={{ flexGrow: 1 }}
                    />
                    
                    <IconButton 
                        color="error" 
                        onClick={() => handleRemoveOption(option.id)}
                        disabled={answerOptions.length <= 1}
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            
            <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddOption}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
            >
                Add Option
            </Button>
        </Box>
    );
};

AnswerOptions.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            text: PropTypes.string.isRequired,
            isCorrect: PropTypes.bool
        })
    ),
    onChange: PropTypes.func.isRequired,
    hasCorrectAnswer: PropTypes.bool
};

export default AnswerOptions;