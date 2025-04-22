import React, { useState,useEffect } from 'react';
import { 
  TextField, Chip, Box,IconButton, Stack 
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Image as ImageIcon, Close } from '@mui/icons-material';
import MarkupEditor from "./MarkupEditor";
const TextPost = ({ formik }) => {
    return (
      <TextField
        label="Content"
        name="content"
        value={formik.values.content}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.content && Boolean(formik.errors.content)}
        helperText={formik.touched.content && formik.errors.content}
        multiline
        rows={6}
        fullWidth
      />
    );
  };


const ImagePost = ({ formik, files, setFiles }) => {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    
    const newPreviews = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
    
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  return (
    <>
      <TextField
        label="Caption"
        name="content"
        value={formik.values.content}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.content && Boolean(formik.errors.content)}
        helperText={formik.touched.content && formik.errors.content}
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 2 }}
      />
      
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleFileChange}
        multiple
      />
      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<ImageIcon />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Upload Images
        </Button>
      </label>
      
      <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', py: 1 }}>
        {previews.map((preview, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <img
              src={preview.preview}
              alt="Preview"
              style={{
                height: 100,
                width: 'auto',
                borderRadius: 4
              }}
            />
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'background.paper'
              }}
              onClick={() => removeImage(index)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </>
  );
};

const VideoPost = ({ formik, files, setFiles }) => {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    
    const newPreviews = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeVideo = (index) => {
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
    
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  return (
    <>
      <TextField
        label="Description"
        name="content"
        value={formik.values.content}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.content && Boolean(formik.errors.content)}
        helperText={formik.touched.content && formik.errors.content}
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 2 }}
      />
      
      <input
        accept="video/*"
        style={{ display: 'none' }}
        id="video-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="video-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<VideoLibrary />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Upload Video
        </Button>
      </label>
      
      <Stack spacing={2}>
        {previews.map((preview, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <video
              controls
              style={{
                width: '100%',
                maxHeight: 300,
                borderRadius: 4
              }}
            >
              <source src={preview.preview} type={preview.file.type} />
            </video>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'background.paper'
              }}
              onClick={() => removeVideo(index)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </>
  );
};

const PollPost = ({ formik }) => {
  const [optionInput, setOptionInput] = useState('');

  const handleAddOption = () => {
    if (optionInput.trim() && formik.values.pollOptions.length < 5) {
      formik.setFieldValue(
        'pollOptions', 
        [...formik.values.pollOptions, optionInput.trim()]
      );
      setOptionInput('');
    }
  };

  const removeOption = (index) => {
    const newOptions = [...formik.values.pollOptions];
    newOptions.splice(index, 1);
    formik.setFieldValue('pollOptions', newOptions);
  };

  return (
    <>
      <TextField
        label="Poll Question"
        name="content"
        value={formik.values.content}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.content && Boolean(formik.errors.content)}
        helperText={formik.touched.content && formik.errors.content}
        fullWidth
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Add Poll Option"
          value={optionInput}
          onChange={(e) => setOptionInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
          fullWidth
          sx={{ mb: 1 }}
        />
        <Button
          onClick={handleAddOption}
          startIcon={<Add />}
          disabled={!optionInput.trim() || formik.values.pollOptions.length >= 5}
        >
          Add Option
        </Button>
      </Box>
      
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {formik.values.pollOptions.map((option, index) => (
          <Chip
            key={index}
            label={option}
            onDelete={() => removeOption(index)}
          />
        ))}
      </Stack>
      
      {formik.touched.pollOptions && formik.errors.pollOptions && (
        <Box sx={{ color: 'error.main', mt: 1 }}>
          {formik.errors.pollOptions}
        </Box>
      )}
    </>
  );
};



const QuestionPost = ({ formik }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && formik.values.questionDetails.tags.length < 5) {
      formik.setFieldValue(
        'questionDetails.tags', 
        [...formik.values.questionDetails.tags, tagInput.trim()]
      );
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    const newTags = [...formik.values.questionDetails.tags];
    newTags.splice(index, 1);
    formik.setFieldValue('questionDetails.tags', newTags);
  };

  return (
    <>
      <TextField
        label="Question Title"
        name="questionDetails.title"
        value={formik.values.questionDetails.title}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.questionDetails?.title && 
              Boolean(formik.errors.questionDetails?.title)}
        helperText={formik.touched.questionDetails?.title && 
                   formik.errors.questionDetails?.title}
        fullWidth
        sx={{ mb: 2 }}
      />
      
      <Typography variant="subtitle2" gutterBottom>
        Detailed Explanation
      </Typography>
      <MarkupEditor
        content={formik.values.questionDetails.body}
        onChange={(content) => 
          formik.setFieldValue('questionDetails.body', content)
        }
      />
      {formik.touched.questionDetails?.body && 
       formik.errors.questionDetails?.body && (
        <Box sx={{ color: 'error.main', mt: 1 }}>
          {formik.errors.questionDetails.body}
        </Box>
      )}
      
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Add Tags (Press Enter)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          helperText="Max 5 tags, each tag should be short"
          fullWidth
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          {formik.values.questionDetails.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => removeTag(index)}
            />
          ))}
        </Stack>
      </Box>
    </>
  );
};

export {VideoPost,ImagePost,TextPost,PollPost,QuestionPost};