import * as Yup from 'yup';
const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validationSchema = {
  content: Yup.string()
    .when('type', {
      is: (type) => ['text', 'image', 'video', 'poll'].includes(type),
      then: Yup.string().required('This field is required').max(2000, 'Too long')
    }),
    
  'questionDetails.title': Yup.string()
    .when('type', {
      is: 'question',
      then: Yup.string().required('Title is required').max(200, 'Title too long')
    }),
    
  'questionDetails.body': Yup.string()
    .when('type', {
      is: 'question',
      then: Yup.string().required('Detailed explanation is required')
    }),
    
  'questionDetails.tags': Yup.array()
    .when('type', {
      is: 'question',
      then: Yup.array()
        .of(Yup.string().max(20, 'Tag too long'))
        .max(5, 'Maximum 5 tags allowed')
    }),
    
  pollOptions: Yup.array()
    .when('type', {
      is: 'poll',
      then: Yup.array()
        .min(2, 'Need at least 2 options')
        .max(5, 'Maximum 5 options allowed')
        .of(Yup.string().required('Option cannot be empty').max(100, 'Option too long'))
    }),
    
  media: Yup.mixed()
    .when('type', {
      is: 'image',
      then: Yup.mixed()
        .test('fileSize', 'File too large (max 5MB)', (value) => {
          if (!value) return true;
          return value.size <= MAX_FILE_SIZE;
        })
        .test('fileType', 'Unsupported image format', (value) => {
          if (!value) return true;
          return SUPPORTED_IMAGE_FORMATS.includes(value.type);
        })
    })
    .when('type', {
      is: 'video',
      then: Yup.mixed()
        .test('fileSize', 'File too large (max 5MB)', (value) => {
          if (!value) return true;
          return value.size <= MAX_FILE_SIZE;
        })
        .test('fileType', 'Unsupported video format', (value) => {
          if (!value) return true;
          return SUPPORTED_VIDEO_FORMATS.includes(value.type);
        })
    })
};

export default validationSchema;