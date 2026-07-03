import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  FileDownload as CSVIcon,
  PictureAsPdf as PDFIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface TableControlsProps {
  columns: Column[];
  onColumnVisibilityChange: (columnId: string) => void;
  onCopy: () => void;
  onCSV: () => void;
  onPDF: () => void;
  onPrint: () => void;
}

const TableControls: React.FC<TableControlsProps> = ({
  columns,
  onColumnVisibilityChange,
  onCopy,
  onCSV,
  onPDF,
  onPrint
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        mb: { xs: 2, sm: 0 }
      }}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<VisibilityIcon />}
        onClick={handleMenuClick}
        sx={{
          textTransform: 'none',
          borderColor: '#005f73',
          color: '#005f73',
          flex: { xs: 1, sm: 'none' }
        }}
      >
        Column visibility
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            maxHeight: 300,
            width: 200
          }
        }}
      >
        {columns.map(column => (
          <MenuItem
            key={column.id}
            onClick={() => {
              onColumnVisibilityChange(column.id);
            }}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={column.visible}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary={column.label} />
          </MenuItem>
        ))}
      </Menu>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton size="small" onClick={onCopy} sx={{ color: '#005f73' }}>
          <CopyIcon />
        </IconButton>
        <IconButton size="small" onClick={onCSV} sx={{ color: '#005f73' }}>
          <CSVIcon />
        </IconButton>
        <IconButton size="small" onClick={onPDF} sx={{ color: '#005f73' }}>
          <PDFIcon />
        </IconButton>
        <IconButton size="small" onClick={onPrint} sx={{ color: '#005f73' }}>
          <PrintIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TableControls;
