import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {TextPost,ImagePost,PollPost,QuestionPost,VideoPost} from './PostFormFields';
import { validationSchema } from './validationSchema';

const PostForm = ({ open, onClose, post, onSuccess, disableQuestion = false }) => {
  const [files, setFiles] = useState([]);
  const formik = useFormik({
    initialValues: {
      type: post?.type || 'text',
      content: post?.content || '',
      questionDetails: post?.questionDetails || { title: '', body: '', tags: [] },
      pollOptions: post?.pollOptions?.map(o => o.text) || [],
      media: post?.media || []
    },
    validationSchema: Yup.object().shape(validationSchema),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        // Append fields based on post type
        // Handle file uploads
        // Submit to API
        const result = await axos[post ? 'put' : 'post'](
          post ? `/api/posts/${post._id}` : '/api/posts',
          formData
        );
        onSuccess(result.data.post);
      } catch (error) {
        console.error('Error submitting post:', error);
      }
    }
  });

  const renderFields = () => {
    switch (formik.values.type) {
      case 'image': return <ImagePost formik={formik} files={files} setFiles={setFiles} />;
      case 'video': return <VideoPost formik={formik} files={files} setFiles={setFiles} />;
      case 'poll': return <PollPost formik={formik} />;
      case 'question': return <QuestionPost formik={formik} />;
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
          {renderFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {post ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PostForm;