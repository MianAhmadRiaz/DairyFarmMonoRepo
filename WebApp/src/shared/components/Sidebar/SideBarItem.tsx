// SideBarItem.tsx

import React from "react";
import { useTheme } from "@emotion/react";
import { tokens } from "../../theme/theme";
import { MenuItem } from "react-pro-sidebar";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface SideBarItemProps {
  title: string;
  to: string;
  icon?: React.ReactNode;
  selected?: string;
  setSelected?: (val: string) => void;
  onPress?: () => void;
  isCollapsed?: boolean;
}

const SideBarItem: React.FC<SideBarItemProps> = ({
  title,
  to,
  icon,
  selected,
  setSelected,
  onPress,
  isCollapsed
}) => {
  const theme = useTheme() as any;
  const colors = tokens(theme.palette.mode);

  const handleClick = () => {
    // Update selected item (if provided)
    if (setSelected) {
      setSelected(title);
    }
    // Call onPress callback (if provided)
    if (onPress) {
      onPress();
    }
  };

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100]
      }}
      onClick={handleClick}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} state={{isCollapsed}} />
    </MenuItem>
  );
};

export default SideBarItem;
