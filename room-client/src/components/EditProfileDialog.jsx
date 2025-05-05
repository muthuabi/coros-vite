import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  IconButton,
  Box,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { CameraAlt, Close, Save } from "@mui/icons-material";
import { useUIState } from "../contexts/UIStateContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import axos from "../axos";
import { toast } from "react-toastify";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const validationSchema = Yup.object({
  firstname: Yup.string().required("First Name is required"),
  lastname: Yup.string().required("Last Name is required"),
  username: Yup.string()
    .required("Username is Required")
    .matches(/^[a-z]/, "Username should start with lowercase alphabet")
    .min(3, "Username should be at least 3 characters")
    .max(20, "Username shouldn't exceed 20 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Invalid Indian Phone Number")
    .nullable(),
  bio: Yup.string().nullable(),
  profilePic: Yup.mixed()
    .nullable()
    .test(
      "fileSize",
      "File too large (max 3MB)",
      (value) => !value || (value && value.size <= MAX_FILE_SIZE)
    )
    .test(
      "fileFormat",
      "Unsupported Format (only jpg, jpeg, png, webp)",
      (value) =>
        !value || (value && SUPPORTED_IMAGE_FORMATS.includes(value.type))
    ),
  socialLinks: Yup.object({
    twitter: Yup.string().url("Invalid URL").nullable(),
    facebook: Yup.string().url("Invalid URL").nullable(),
    instagram: Yup.string().url("Invalid URL").nullable(),
    linkedin: Yup.string().url("Invalid URL").nullable(),
    website: Yup.string().url("Invalid URL").nullable(),
  }),
});

const EditProfileDialog = ({ profile, onUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { uiState, closeUIState } = useUIState();
  const [activeTab, setActiveTab] = useState(0);
  const [previewImage, setPreviewImage] = useState("");

  const formik = useFormik({
    initialValues: {
      firstname: profile?.firstname || "",
      lastname: profile?.lastname || "",
      username: profile?.username || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      bio: profile?.bio || "",
      profilePic: null,
      socialLinks: {
        twitter: profile?.socialLinks?.twitter || "",
        facebook: profile?.socialLinks?.facebook || "",
        instagram: profile?.socialLinks?.instagram || "",
        linkedin: profile?.socialLinks?.linkedin || "",
        website: profile?.socialLinks?.website || "",
      },
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        formData.append("firstname", values.firstname);
        formData.append("lastname", values.lastname);
        formData.append("username", values.username);
        formData.append("email", values.email);
        formData.append("phone", values.phone || "");
        formData.append("bio", values.bio || "");

        formData.append(
          "socialLinks[twitter]",
          values.socialLinks.twitter || ""
        );
        formData.append(
          "socialLinks[facebook]",
          values.socialLinks.facebook || ""
        );
        formData.append(
          "socialLinks[instagram]",
          values.socialLinks.instagram || ""
        );
        formData.append(
          "socialLinks[linkedin]",
          values.socialLinks.linkedin || ""
        );
        formData.append(
          "socialLinks[website]",
          values.socialLinks.website || ""
        );

        if (values.profilePic && typeof values.profilePic !== "string") {
          formData.append("profilePic", values.profilePic);
        }

        const updatePromise = axos.put("/api/user/edit-profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.promise(updatePromise, {
          pending: "Updating profile...",
          success: {
            render({ data }) {
              // Preserve image if server didn't return one
              const updatedUser = data.data.user;
              if (!updatedUser.profilePic && values.profilePic) {
                updatedUser.profilePic =
                  typeof values.profilePic === "string"
                    ? values.profilePic
                    : previewImage;
              }
              onUpdate(updatedUser);
              closeUIState("editprofileDialog");
              return "Profile updated successfully!";
            },
          },
          error: {
            render({ data }) {
              return (
                data?.response?.data?.message || "Failed to update profile"
              );
            },
          },
        });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue("profilePic", file);
      formik.setFieldTouched("profilePic", true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      formik.setFieldValue("profilePic", null);
    }
  };

  const getError = (field) => {
    if (formik.touched[field] && formik.errors[field]) {
      return formik.errors[field];
    }
    return null;
  };

  const getSocialLinkError = (field) => {
    if (
      formik.touched.socialLinks?.[field] &&
      formik.errors.socialLinks?.[field]
    ) {
      return formik.errors.socialLinks[field];
    }
    return null;
  };

  return (
    <Dialog
      open={uiState.editprofileDialog}
      onClose={() => closeUIState("editprofileDialog")}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Profile</Typography>
          <IconButton onClick={() => closeUIState("editprofileDialog")}>
            <Close />
          </IconButton>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Basic Info" />
          <Tab label="Social Links" />
        </Tabs>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {activeTab === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={
                    previewImage ||
                    (formik.values.profilePic &&
                    typeof formik.values.profilePic === "string"
                      ? formik.values.profilePic
                      : null) ||
                    profile?.profilePic ||
                    "/default-avatar.png"
                  }
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <input
                  accept="image/jpg, image/jpeg, image/png, image/webp"
                  style={{ display: "none" }}
                  id="profile-pic-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-pic-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CameraAlt />}
                  >
                    Change Photo
                  </Button>
                </label>
                {formik.values.profilePic && (
                  <Typography title={formik.values.profilePic.name || "Current profile image"} variant="caption"  sx={{ mt: 1,maxWidth: '150px',overflow: 'hidden',
                    whiteSpace: 'nowrap',textOverflow:'ellipsis' }}>
                    {formik.values.profilePic.name || "Current profile image"}
                  </Typography>
                )}
                {formik.errors.profilePic && formik.touched.profilePic && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {formik.errors.profilePic}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="First Name"
                  name="firstname"
                  value={formik.values.firstname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!getError("firstname")}
                  helperText={getError("firstname")}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Last Name"
                  name="lastname"
                  value={formik.values.lastname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!getError("lastname")}
                  helperText={getError("lastname")}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!getError("username")}
                  helperText={getError("username")}
                  fullWidth
                  margin="normal"
                  required
                  disabled
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!getError("email")}
                  helperText={getError("email")}
                  fullWidth
                  margin="normal"
                  type="email"
                  required
                  disabled
                />
                <TextField
                  label="Phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!getError("phone")}
                  helperText={getError("phone")}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Bio"
                  name="bio"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!getError("bio")}
                  helperText={getError("bio")}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Twitter URL"
                name="socialLinks.twitter"
                value={formik.values.socialLinks.twitter}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getSocialLinkError("twitter")}
                helperText={getSocialLinkError("twitter")}
                fullWidth
                margin="normal"
                placeholder="https://twitter.com/username"
              />
              <TextField
                label="Facebook URL"
                name="socialLinks.facebook"
                value={formik.values.socialLinks.facebook}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getSocialLinkError("facebook")}
                helperText={getSocialLinkError("facebook")}
                fullWidth
                margin="normal"
                placeholder="https://facebook.com/username"
              />
              <TextField
                label="Instagram URL"
                name="socialLinks.instagram"
                value={formik.values.socialLinks.instagram}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getSocialLinkError("instagram")}
                helperText={getSocialLinkError("instagram")}
                fullWidth
                margin="normal"
                placeholder="https://instagram.com/username"
              />
              <TextField
                label="LinkedIn URL"
                name="socialLinks.linkedin"
                value={formik.values.socialLinks.linkedin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getSocialLinkError("linkedin")}
                helperText={getSocialLinkError("linkedin")}
                fullWidth
                margin="normal"
                placeholder="https://linkedin.com/in/username"
              />
              <TextField
                label="Website URL"
                name="socialLinks.website"
                value={formik.values.socialLinks.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getSocialLinkError("website")}
                helperText={getSocialLinkError("website")}
                fullWidth
                margin="normal"
                placeholder="https://yourwebsite.com"
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => closeUIState("editprofileDialog")}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={
              formik.isSubmitting ? <CircularProgress size={20} /> : <Save />
            }
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
