
const getImageURL = (relativePath) => {
  if (!relativePath) return null;
  const baseURL = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseURL}/files/${relativePath}`;
};

module.exports = getImageURL;
