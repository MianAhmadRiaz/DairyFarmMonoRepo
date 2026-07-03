import React from 'react';
import { CardMedia, Box } from '@mui/material';

const CustomCardMedia = ({ image, alt }) => {
  return (
    <Box
      sx={{
        height: '200px', // Fix the height
        overflow: 'hidden', // Ensure content stays within the bounds
        display: 'flex', // Center the image
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8', // Optional light background
        borderRadius: '8px' // Add rounded corners
      }}
    >
      <CardMedia
        component="img"
        image={image}
        alt={alt}
        sx={{
          height: '100%', // Scale the image to fit the container
          width: 'auto' // Maintain aspect ratio
        }}
      />
    </Box>
  );
};

export default CustomCardMedia;
