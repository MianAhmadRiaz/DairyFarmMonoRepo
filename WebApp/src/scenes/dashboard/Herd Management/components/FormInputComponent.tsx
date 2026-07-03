import React, { useState } from "react";
import {
  Grid,
  MenuItem,
  Modal,
  TextField,
  CircularProgress
} from "@mui/material";
import AddItemModal from "../../../Item Modal/AddItemModal"; // your existing modal

export interface DropdownObject {
  uuid: string;
  name: string;
}

interface FormInputComponentProps {
  label: string;   // e.g. “Pen ID”, “Tag ID”, “Animal Type”, etc.
  name: string;    // e.g. “penId”, “tagId”, “animalType”...
  options: DropdownObject[];
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;

  disableAddModal?: boolean;

  // Called if you want to fetch from the server onFocus (only once user opens)
  onFetchNeeded?: () => Promise<void>;

  // Called if user clicks “Add New ____”
  onAddItem?: (newName: string) => Promise<DropdownObject>;
}

const FormInputComponent: React.FC<FormInputComponentProps> = ({
  label,
  name,
  options,
  formData,
  setFormData,
  disableAddModal,
  onFetchNeeded,
  onAddItem
}) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<DropdownObject[]>(options);

  const handleOpenModal = () => {
    console.log(`handleOpenModal => label=${label}`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log(`handleCloseModal => label=${label}`);
    setModalOpen(false);
  };

  const handleAddItem = async (newItem: string) => {
    console.log(`${label} => handleAddItem => newItem=`, newItem);
    if (!onAddItem) return;

    try {
      setLoading(true);
      const createdObj = await onAddItem(newItem);
      console.log("Created object =>", createdObj);

      // add to localOptions
      setLocalOptions((prev) => [...prev, createdObj]);

      // store in formData
      setFormData({
        ...formData,
        [name]: createdObj
      });
    } catch (error) {
      console.error(`Failed to add new ${label}`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = async () => {
    console.log(`${label} => handleFocus...`);
    if (!onFetchNeeded) return;

    setLoading(true);
    await onFetchNeeded();
    setLoading(false);
  };

  const handleSelectChange = (value: string) => {
    console.log(`${label} => handleSelectChange => value=`, value);
    const found = localOptions.find((opt) => opt.uuid === value);
    if (found) {
      setFormData({ ...formData, [name]: found });
    }
  };

  // current value => if formData[name] is an object, use .uuid
  let currentValue = "";
  if (formData[name] && formData[name].uuid) {
    currentValue = formData[name].uuid;
  }

  return (
    <>
      <Grid item xs={12} md={4}>
        {loading && <CircularProgress size={20} />}
        <TextField
          fullWidth
          select
          label={label}
          name={name}
          variant="outlined"
          onFocus={handleFocus}
          value={currentValue}
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          {localOptions.map((opt) => (
            <MenuItem key={opt.uuid} value={opt.uuid}>
              {opt.name}
            </MenuItem>
          ))}

          {!disableAddModal && onAddItem && (
            <MenuItem
              onClick={handleOpenModal}
              sx={{
                color: "#1976d2",
                fontWeight: "bold",
                borderTop: "1px solid #ddd"
              }}
            >
              Add New {label}
            </MenuItem>
          )}
        </TextField>
      </Grid>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <AddItemModal
          label={label}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAdd={handleAddItem}
        />
      </Modal>
    </>
  );
};

export default FormInputComponent;
