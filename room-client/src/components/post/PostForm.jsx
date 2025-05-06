import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, Box, Typography, Button, Tabs, Tab
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {TextPost, ImagePost, PollPost, QuestionPost, VideoPost} from './PostFormFields';

// Define validation schemas for different post types
const getValidationSchema = (postType) => {
  const baseSchema = {
    content: Yup.string().when('type', {
      is: (type) => ['text', 'image', 'video'].includes(type),
      then: Yup.string().required('Content is required')
    }),
  };

  if (postType === 'poll') {
    return Yup.object().shape({
      ...baseSchema,
      pollOptions: Yup.array()
        .of(Yup.string().required('Poll option cannot be empty'))
        .min(2, 'You need at least 2 options')
        .test(
          'unique-options',
          'Poll options must be unique',
          function (options) {
            const uniqueOptions = new Set(options.map(opt => opt.trim().toLowerCase()));
            return uniqueOptions.size === options.length;
          }
        )
    });
  }

  if (postType === 'question') {
    return Yup.object().shape({
      questionDetails: Yup.object().shape({
        title: Yup.string().required('Question title is required'),
        body: Yup.string().required('Question body is required'),
        tags: Yup.array().min(1, 'Add at least one tag')
      })
    });
  }

  return Yup.object().shape(baseSchema);
};
const POST_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'poll', label: 'Poll' },
  { value: 'question', label: 'Question' },
];
const PostForm = ({ open, onClose, post, onSuccess, disableQuestion = false }) => {
  const [files, setFiles] = useState([]);
  
  const formik = useFormik({
    initialValues: {
      type: post?.type || 'text',
      content: post?.content || '',
      questionDetails: post?.questionDetails || { title: '', body: '', tags: [] },
      pollOptions: post?.pollOptions?.map(o => o.text) || ['', ''],
      media: post?.media || []
    },
    validationSchema: Yup.lazy(values => getValidationSchema(values.type)),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('type', values.type);
        
        if (values.type !== 'question') {
          formData.append('content', values.content);
        }

        if (values.type === 'question') {
          formData.append('questionDetails', JSON.stringify(values.questionDetails));
        }
        
        if (values.type === 'poll') {
          formData.append('pollOptions', JSON.stringify(
            values.pollOptions.filter(opt => opt.trim() !== '').map(opt => ({ text: opt }))
          ));
        }
        
        files.forEach(file => {
          formData.append('media', file);
        });
        
        const result = await axios[post ? 'put' : 'post'](
          post ? `/api/posts/${post._id}` : '/api/posts',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        onSuccess(result.data.post);
      } catch (error) {
        console.error('Error submitting post:', error);
      }
    }
  });

  // ... rest of the component remains the same ...

  const handleTypeChange = (event, newValue) => {
    formik.setFieldValue('type', newValue);
    formik.setFieldTouched('type', true);
  };

  const renderFields = () => {
    switch (formik.values.type) {
      case 'image': return <ImagePost formik={formik} files={files} setFiles={setFiles} />;
      case 'video': return <VideoPost formik={formik} files={files} setFiles={setFiles} />;
      case 'poll': return <PollPost formik={formik} />;
      case 'question': return disableQuestion ? <TextPost formik={formik} /> : <QuestionPost formik={formik} />;
      default: return <TextPost formik={formik} />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {post ? 'Edit Post' : 'Create New Post'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {!post && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={formik.values.type} 
                onChange={handleTypeChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                {POST_TYPES.filter(type => !(disableQuestion && type.value === 'question')).map(type => (
                  <Tab 
                    key={type.value} 
                    value={type.value} 
                    label={type.label} 
                  />
                ))}
              </Tabs>
            </Box>
          )}
          
          {renderFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {post ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PostForm;