import React from "react";
import { Box, Typography } from "@mui/material";

const StatWidget = ({ label, value, color = "textPrimary", alignment = "center" }) => {
    return (
        <Box display="flex" flexDirection="column" alignItems={alignment} mt={2}>
            <Typography variant="body2" color="textSecondary">
                {label}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={color}>
                {value}
            </Typography>
        </Box>
    );
};

export default StatWidget;
