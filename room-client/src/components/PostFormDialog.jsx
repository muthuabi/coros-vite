import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axos from '../axos';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Chip,
  MenuItem,
  CircularProgress,
  Typography
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { useUIState } from '../contexts/UIStateContext';
import MarkupEditor from './posts/MarkupEditor';

const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const validationSchema = Yup.object().shape({
  type: Yup.string()
    .required('Post type is required')
    .oneOf(['text', 'image', 'video', 'question', 'poll'], 'Invalid post type'),
  content: Yup.string().when('type', {
    is: (type) => type !== 'question',
    then: Yup.string().required('Content is required').max(5000, 'Content too long'),
    otherwise: Yup.string()
  }),
  questionDetails: Yup.object().when('type', {
    is: 'question',
    then: Yup.object().shape({
      title: Yup.string().required('Question title is required').max(200, 'Title too long'),
      body: Yup.string().required('Question body is required').max(10000, 'Content too long'),
      tags: Yup.array().of(Yup.string().max(20, 'Tag too long')).max(5, 'Maximum 5 tags allowed')
    })
  }),
  pollOptions: Yup.array().when('type', {
    is: 'poll',
    then: Yup.array()
      .of(Yup.string().required('Option cannot be empty').max(100, 'Option too long'))
      .min(2, 'At least 2 options required')
      .max(5, 'Maximum 5 options allowed')
  }),
  media: Yup.mixed().when('type', {
    is: (type) => ['image', 'video'].includes(type),
    then: Yup.mixed()
      .test('fileSize', 'File too large', (value) => !value || value.size <= MAX_FILE_SIZE)
      .test('fileType', 'Unsupported file type', (value) => !value || SUPPORTED_FILE_TYPES.includes(value.type))
  })
});

const PostFormDialog = ({ post, onSuccess }) => {
  const { uiState, closeUIState } = useUIState();
  const [previewImages, setPreviewImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [pollOptionInput, setPollOptionInput] = useState('');

  const formik = useFormik({
    initialValues: {
      type: post?.type || 'text',
      content: post?.content || '',
      questionDetails: {
        title: post?.questionDetails?.title || '',
        body: post?.questionDetails?.body || '',
        tags: post?.questionDetails?.tags || []
      },
      pollOptions: post?.pollOptions?.map(opt => opt.text) || [],
      media: post?.media || []
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('type', values.type);
        formData.append('content', values.content);

        if (values.type === 'question') {
          formData.append('questionDetails[title]', values.questionDetails.title);
          formData.append('questionDetails[body]', values.questionDetails.body);
          values.questionDetails.tags.forEach(tag => formData.append('questionDetails[tags]', tag));
        }

        if (values.type === 'poll') {
          values.pollOptions.forEach((option, index) => {
            formData.append(`pollOptions[${index}]`, option);
          });
        }

        if (['image', 'video'].includes(values.type)) {
          if (values.media instanceof File) {
            formData.append('media', values.media);
          } else if (Array.isArray(values.media)) {
            values.media.forEach(file => {
              if (file instanceof File) formData.append('media', file);
            });
          }
        }

        const request = post
          ? axos.put(`/api/posts/${post._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          : axos.post('/api/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        toast.promise(request, {
          pending: post ? 'Updating post...' : 'Creating post...',
          success: {
            render({ data }) {
              onSuccess(data.data.post);
              closeUIState('postModal');
              return post ? 'Post updated successfully!' : 'Post created successfully!';
            }
          },
          error: {
            render({ data }) {
              return data?.response?.data?.message || (post ? 'Failed to update post' : 'Failed to create post');
            }
          }
        });
      } catch (error) {
        console.error('Error submitting post:', error);
      }
    }
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const filePreviews = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
      setPreviewImages(filePreviews);
      formik.setFieldValue('media', files[0]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formik.values.questionDetails.tags.length < 5) {
      const newTags = [...formik.values.questionDetails.tags, tagInput.trim()];
      formik.setFieldValue('questionDetails.tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = formik.values.questionDetails.tags.filter((_, i) => i !== index);
    formik.setFieldValue('questionDetails.tags', newTags);
  };

  const handleAddPollOption = () => {
    if (pollOptionInput.trim() && formik.values.pollOptions.length < 5) {
      const newOptions = [...formik.values.pollOptions, pollOptionInput.trim()];
      formik.setFieldValue('pollOptions', newOptions);
      setPollOptionInput('');
    }
  };

  const handleRemovePollOption = (index) => {
    const newOptions = formik.values.pollOptions.filter((_, i) => i !== index);
    formik.setFieldValue('pollOptions', newOptions);
  };

  return (
    <Dialog open={uiState.postModal} onClose={() => closeUIState('postModal')} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{post ? 'Edit Post' : 'Create New Post'}</Typography>
          <IconButton onClick={() => closeUIState('postModal')}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <TextField
            select
            label="Post Type"
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.type && Boolean(formik.errors.type)}
            helperText={formik.touched.type && formik.errors.type}
            fullWidth
            sx={{ mb: 3 }}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="image">Image</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="question">Question</MenuItem>
            <MenuItem value="poll">Poll</MenuItem>
          </TextField>

          {formik.values.type === 'question' && (
            <>
              <TextField
                label="Question Title"
                name="questionDetails.title"
                value={formik.values.questionDetails.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.questionDetails?.title && Boolean(formik.errors.questionDetails?.title)}
                helperText={formik.touched.questionDetails?.title && formik.errors.questionDetails?.title}
                fullWidth sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" gutterBottom>Question Details</Typography>
              <MarkupEditor
                content={formik.values.questionDetails.body}
                onChange={(content) => formik.setFieldValue('questionDetails.body', content)}
              />
              {formik.touched.questionDetails?.body && formik.errors.questionDetails?.body && (
                <Typography color="error" variant="caption">{formik.errors.questionDetails.body}</Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Add Tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  fullWidth
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formik.values.questionDetails.tags.map((tag, i) => (
                    <Chip key={i} label={tag} onDelete={() => handleRemoveTag(i)} />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {formik.values.type === 'poll' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Add Poll Option"
                value={pollOptionInput}
                onChange={(e) => setPollOptionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPollOption()}
                fullWidth
              />
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formik.values.pollOptions.map((option, i) => (
                  <Chip key={i} label={option} onDelete={() => handleRemovePollOption(i)} />
                ))}
              </Box>
            </Box>
          )}

          {['text', 'image', 'video'].includes(formik.values.type) && (
            <Box sx={{ mt: 2 }}>
              <MarkupEditor
                content={formik.values.content}
                onChange={(content) => formik.setFieldValue('content', content)}
              />
              {formik.touched.content && formik.errors.content && (
                <Typography color="error" variant="caption">{formik.errors.content}</Typography>
              )}
              {['image', 'video'].includes(formik.values.type) && (
                <Box mt={2}>
                  <Button variant="contained" component="label">
                    Upload File
                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                  </Button>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    {previewImages.map(({ preview }, i) => (
                      <img key={i} src={preview} alt="preview" height="80" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeUIState('postModal')}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {formik.isSubmitting ? <CircularProgress size={24} /> : post ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PostFormDialog;
