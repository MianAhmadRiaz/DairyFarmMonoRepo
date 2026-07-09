import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {  getAllTags } from "../../../shared/services/herdinfo.services"; // Import the tag API

interface DropdownObject {
  uuid: string;
  name: string;
}

const CmtTest: React.FC = () => {
  const { t } = useTranslation();
  const [tagOptions, setTagOptions] = useState<DropdownObject[]>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Fetch tags from the API when the component mounts
  useEffect(() => {
    console.log("Fetching tags...");
    (async () => {
      try {
        const tags = await getAllTags()
        ;
        console.log("Fetched tags:", tags);
        setTagOptions(tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    })();
  }, []);

  const handleRegisterEvent = () => {
    console.log("Registering event:", {
      tagId: selectedTag,
      date: eventDate,
      remarks: remarks
    });
    alert(t("herd.cmtTest.eventRegistered"));
  };

  const handleCancel = () => {
    setSelectedTag("");
    setEventDate("");
    setRemarks("");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f9fbfa",
        minHeight: "100vh",
        p: 4,
        marginLeft: "370px",
        marginRight: "200px",
        fontFamily: "sans-serif"
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        {t("herd.cmtTest.title")}
      </Typography>

      {/* --- First Card: Form --- */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          p: 3,
          mb: 3,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Row 1: Tag ID + Date */}
        <Box
          sx={{
            display: "flex",
            flexDirection: ["column", "row"],
            gap: 2,
            mb: 2
          }}
        >
          {/* Tag ID Dropdown */}
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography fontWeight="500" mb={1}>
              {t("herd.cmtTest.tagId")}
            </Typography>
            <TextField
              fullWidth
              select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              variant="outlined"
              placeholder={t("herd.cmtTest.selectTag")}
            >
              {tagOptions.map((tag) => (
                <MenuItem key={tag.uuid} value={tag.uuid}>
                  {tag.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Date Picker */}
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography fontWeight="500" mb={1}>
              {t("herd.cmtTest.date")}
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Row 2: Remarks textarea */}
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <Typography fontWeight="500" mb={1}>
            {t("herd.cmtTest.enterRemarks")}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t("herd.cmtTest.enterRemarks")}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            variant="outlined"
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#295d5d", "&:hover": { backgroundColor: "#1f4848" }, textTransform: "none" }}
            onClick={handleRegisterEvent}
          >
            {t("herd.cmtTest.registerEvent")}
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#e0e0e0", color: "#333", "&:hover": { backgroundColor: "#cfcfcf" }, textTransform: "none" }}
            onClick={handleCancel}
          >
            {t("common.cancel")}
          </Button>
        </Box>
      </Box>

      {/* --- Second Card: Recent Event --- */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          p: 3,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
          {t("herd.cmtTest.recentEvent")}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <TextField placeholder={t("common.search")} size="small" sx={{ maxWidth: "200px" }} />
          <TextField type="date" size="small" />
          <TextField type="date" size="small" />
          <Button
            variant="contained"
            sx={{ backgroundColor: "#c7e596", color: "#333", textTransform: "none", "&:hover": { backgroundColor: "#b8d986" } }}
          >
            {t("common.search")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CmtTest;
