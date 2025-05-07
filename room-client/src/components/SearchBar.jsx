import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  InputAdornment,
  IconButton,
  Box
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';

const SearchBar = ({ 
  data, 
  searchFields, 
  placeholder = "Search...",
  onSearch,
  onClear
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      handleClear();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onClear) onClear();
  };

  useEffect(() => {
    if (searchQuery.trim() !== '' && onSearch) {
      const filtered = filterData(data, searchQuery, searchFields);
      onSearch(filtered);
    }
  }, [searchQuery, data, searchFields, onSearch]);

  const filterData = (dataToFilter, query, fields) => {
    if (!query) return dataToFilter || [];
    
    const searchLower = query.toLowerCase();
    return (dataToFilter || []).filter(item => 
      fields.some(field => {
        const fieldValue = getNestedFieldValue(item, field);
        return String(fieldValue).toLowerCase().includes(searchLower);
      })
    );
  };

  const getNestedFieldValue = (obj, path) => {
    return path.split('.').reduce((o, p) => (o || {})[p], obj);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  );
};

export default SearchBar;