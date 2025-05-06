import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box,useMediaQuery } from '@mui/material';
import {useTheme} from '@mui/material/styles';
export const TabContent = ({ value, index, children, otherProps }) => (
  <Box sx={{ display: value !== index ? 'none' : 'block', p: 2 }} {...otherProps}>
    {children}
  </Box>
);

const MyTab = ({ 
  active = 0, 
  labels = [], 
  contents = [], 
  children, 
  tabStyles = {}, 
  labelStyles = {} 
}) => {
  const [value, setValue] = useState(active);
  const theme=useTheme();
  // const isVertical=useMediaQuery(theme.breakpoints.down('sm'));
  const isVertical=false;
  useEffect(() => {
    setValue(active);
  }, [active]);
  const renderContent = () => {
    if (children) {
      return React.Children.map(children, (child, index) =>
        React.cloneElement(child, { value, index })
      );
    }
    return contents.map((content, index) => (
      <TabContent key={index} value={value} index={index}>
        {content}
      </TabContent>
    ));
  };

  return (
    <Box sx={{ width: '100%', ...tabStyles, ...(isVertical && { display: "flex", flexDirection: "row" }) }}>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        orientation={isVertical?"vertical":"horizontal"}
        textColor="primary"
        indicatorColor="primary"
        sx={labelStyles}
      >
        {labels.map((prop, index) => (
          <Tab key={index} label={prop.label || `Tab ${index + 1}`} {...prop} />
        ))}
      </Tabs>
      <Box>
        {renderContent()}
      </Box>
    </Box>
  );
};
export default MyTab;
