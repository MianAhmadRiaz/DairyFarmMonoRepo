import { Box, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';

export const MobileCollapseWrapper: React.FC<{
  title: string,
  children: React.ReactNode
}> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box className="border rounded-lg shadow-sm mb-4">
      <Box
        className="cursor-pointer bg-gray-100 p-3 flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <Typography variant="subtitle1">{title}</Typography>
        <span>{open ? '-' : '+'}</span>
      </Box>
      {open && <Box className="p-3">{children}</Box>}
    </Box>
  );
};
