import React, { ChangeEvent, useEffect, useState,useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Select,
  useTheme
} from "@mui/material";
import { tokens } from "../../../shared/theme/theme";
import {
  fetchPenList,
  addPen,
  addTag,
  fetchAnimalTypes,
  addAnimalType,
  fetchBreedTypes,
  fetchAnimalSubCategories,
  addanimal,
  addBreedType,
  addSubCategory,
  getAllTags,
  fetchBull,
  fetchAnimals,
  
} from "../../../shared/services/herdinfo.services";
import { useScrollToTopOnMount } from "../../../shared/components/Hooks/useScrollToTop";
import AddItemModal from "../../Item Modal/AddItemModal";
import { ToastContainer, toast ,Id} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dropdown, { Option } from "../../../shared/components/Dropdown";
import PageContainer from '../../../shared/components/Layout/PageContainer';

interface DropdownObject {
  uuid: string;
  name: string;
}



const AddAnimal = () => {
  const { t } = useTranslation();
  // Ensure page starts from top when component mounts
  useScrollToTopOnMount();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Form data for new animal
  const [formData, setFormData] = useState<any>({
    penId: "",
    tagId: "",
    animalType: "",
    breedType: "",
    subcategory: "",
    electronicId: "",
    name: "",
    purchase_from: "",
    country: "",
    gender: "",
    type: "Non-Pregnant Heifer",
    arrivalDate: "",
    birthdate: "",
    price: "",
    animalWeight: "",
    weightDate: "",
    picture: "",
    pedigreeInfo: { sireTagId: "", damTagId: "" },
    lactation: "",
    inseminated_dates: "",
    pregnancyDays: "",
    animalCategory:""
  });

  // Dropdown options for penIDs, tagIDs, animalTypes, breedTypes, etc.
  const [dropdownOptions, setDropdownOptions] = useState<{
    penIDs: DropdownObject[];
    tagIDs: DropdownObject[];
    animalTypes: DropdownObject[];
    breedTypes: DropdownObject[];
    subCategories: DropdownObject[];
        bull: DropdownObject[];

  }>({
    penIDs: [],
    tagIDs: [],
    animalTypes: [],
    breedTypes: [],
    subCategories: [],
    bull:[]
  });
  const toastId = useRef<Id | null>(null); 
  const heiferOnly = ["Non-Pregnant Heifer", "Pregnant Heifer"].includes(formData.type);

  const categoryOptions: Option[] = heiferOnly
    ? [{ value: "heifers", label: t("herd.addAnimal.categoryHeifer") }]
    : [
        { value: "milk", label: t("herd.addAnimal.categoryMilking") },
        { value: "dry", label: t("herd.addAnimal.categoryDry") }
      ];
  // Whether to show the Pedigree Info fields
  const [showPedigree, setShowPedigree] = useState(false);
  const navigate = useNavigate();
  // Controls the "Add New Pen ID" modal open/close
  const [isAddPenModalOpen, setIsAddPenModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddAnimalTypeModalOpen, setIsAddAnimalTypeModalOpen] = useState(false);
    const [isAddBreedTypeModalOpen, setIsAddBreedTypeModalOpen] = useState(false);
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false);
  const [femaleAnimals, setFemaleAnimals] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [pens, tags, aTypes, bTypes, subs,bulls] = await Promise.all([
          fetchPenList(),
        getAllTags(false), // Direct API call to get ALL tags
          fetchAnimalTypes(),
          fetchBreedTypes(),
          fetchAnimalSubCategories(),
          fetchBull()
        ]);

      


        setDropdownOptions({
          penIDs: pens,
          tagIDs: tags,
          animalTypes: aTypes,
          breedTypes: bTypes,
          subCategories: subs,
          bull:bulls
        });
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
      }
    })();
  }, []);

useEffect(() => {
  const fetchFemaleAnimals = async () => {
    try {
      // Assuming fetchAnimals returns AnimalInfoRow[] directly
      const animals = await fetchAnimals(true);
      const filtered = animals.filter(animal => 
        animal.gender === "female"
      );
      setFemaleAnimals(filtered);
    } catch (error) {
      console.error("Error fetching female animals:", error);
    }
  };

  fetchFemaleAnimals();
}, []);


useEffect(() => {
  if (["Non-Pregnant Heifer", "Pregnant Heifer"].includes(formData.type)) {
    setFormData((prev:any) => ({ ...prev, animalCategory: "heifer" }));
  }
}, [formData.type]);




// const handleCategoryChange = (event: { value: any; }) => {
//   const { value } = event;
//   alert(`Selected Category: ${event}`);
//   setCategory(value);
//   formData.animalCategory=value;
//   setFormData((prev: any) => ({
//     ...prev,
//     animalCategory: value
//   }));
// };
const handleCategoryChange = (e: SelectChangeEvent<string>) => {
  const value = e.target.value;
  setFormData((prev:any) => ({ ...prev, animalCategory: value }));
};

// useEffect(() => {
//   console.log(`Selected Category: ${category}`);
//   setFormData((prev: any) => ({
//     ...prev,
//     animalCategory: category
//   }));
// }, [category]);




  const handleAddNewPen = async (newPenName: string) => {
    try {
      // 1) Call your backend to add a new pen
      const createdPen = await addPen({ name: newPenName });
      

      // 2) Update pen list so the newly added pen shows up in the dropdown
      setDropdownOptions((prev) => ({
        ...prev,
        penIDs: [...prev.penIDs, createdPen]
      }));

      // 3) Automatically select that new pen in your form
      setFormData((prev: any) => ({
        ...prev,
        penId: createdPen.uuid
      }));

      // 4) Close the modal
      setIsAddPenModalOpen(false);
    } catch (err) {
      console.error("Error adding new pen =>", err);
    }
  };

   // New handler for adding tags
  const handleAddNewTag = async (newTagName: string) => {
    try {
      const createdTag = await addTag({ name: newTagName });
      setDropdownOptions(prev => ({
        ...prev,
        tagIDs: [...prev.tagIDs, createdTag]
      }));
      setFormData((prev: any) => ({
        ...prev,
        tagId: createdTag.uuid
      }));
      setIsAddTagModalOpen(false);
    } catch (err) {
      console.error("Error adding new tag =>", err);
    }
  };
  const handleAddNewAnimalType = async (newAnimalType: string) => {
  try {
    const createdAnimalType = await addAnimalType({ name: newAnimalType });
    setDropdownOptions(prev => ({
      ...prev,
      animalTypes: [...prev.animalTypes, createdAnimalType]
    }));
    setFormData((prev: any) => ({
      ...prev,
      animalType: createdAnimalType.uuid
    }));
    setIsAddAnimalTypeModalOpen(false);
  } catch (err) {
    console.error("Error adding new animal type =>", err);
  }
};

  const handleAddNewBreedType = async (newBreedType: string) => {
  try {
    const createdBreed = await addBreedType({ name: newBreedType });
    setDropdownOptions(prev => ({
      ...prev,
      breedTypes: [...prev.breedTypes, createdBreed]
    }));
    setFormData((prev: any) => ({
      ...prev,
      breedType: createdBreed.uuid
    }));
    setIsAddBreedTypeModalOpen(false);
  } catch (err) {
    console.error("Error adding new breed type =>", err);
  }
};

const handleAddNewSubCategory = async (newSubCategory: string) => {
  try {
    const createdSub = await addSubCategory({ name: newSubCategory });
    setDropdownOptions(prev => ({
      ...prev,
      subCategories: [...prev.subCategories, createdSub]
    }));
    setFormData((prev: any) => ({
      ...prev,
      subcategory: createdSub.uuid
    }));
    setIsAddSubCategoryModalOpen(false);
  } catch (err) {
    console.error("Error adding new subcategory =>", err);
  }
};
  

const handleInputChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
  const name = e.target.name as string;
  const value = e.target.value;

  if (name === "sireTagId" || name === "damTagId") {
      setFormData((prev: any) => ({
          ...prev,
          pedigreeInfo: {
              ...prev.pedigreeInfo,
              [name]: value
          }
      }));
  } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
  }
};

  /**
   * Submit the final form to the backend
   */
  


const handleSubmit = async () => {
  const requiredFields = [
    "penId", "tagId", "animalType", "breedType", "subcategory", "electronicId",
    "name", "purchase_from", "country", "gender", "type", "arrivalDate",
    "birthdate", "price", "animalWeight", "weightDate", "picture", "animalCategory"
  ];

  const missingFields = requiredFields.filter((field) => {
    const value = formData[field];
    return value === null || value === undefined || value === "";
  });

  if (missingFields.length > 0) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
    toastId.current = toast.warn(t("herd.addAnimal.warnRequired"));
}
    return;
  }
  // Step 2: Type-specific required fields (like AI date, pregnancy days, etc.)
if (formData.type === "Pregnant Cow") {
  if (!formData.inseminated_dates || !formData.lactation || !formData.lastCalvingDate) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warn(t("herd.addAnimal.warnRequired"));
    }
    return;
  }
}

if (formData.type === "Cow") {
  if (!formData.lactation || !formData.lastCalvingDate) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warn(t("herd.addAnimal.warnRequired"));
    }
    return;
  }
}

if (formData.type === "Pregnant Heifer") {
  if (!formData.pregnancyDays) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warn(t("herd.addAnimal.warnRequired"));
    }
    return;
  }
}

if (showPedigree) {
  const { sireTagId, damTagId } = formData.pedigreeInfo || {};

  if (!sireTagId || !damTagId) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warn(t("herd.addAnimal.warnRequired"));
    }
    return;
  }
}

  const numberFields = ["price", "animalWeight", "pregnancyDays", "lactation"];
  const invalidNumbers = numberFields.filter(
    field => formData[field] !== "" && isNaN(Number(formData[field]))
  );

  if (invalidNumbers.length > 0) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warn(t("herd.addAnimal.invalidNumbers", { fields: invalidNumbers.join(', ') }));
    }
    return;
  }

  try {
    setIsSubmitting(true);

    const finalPayload = {
      ...formData,
      price: Number(formData.price),
      animalWeight: Number(formData.animalWeight),
      pregnancyDays: Number(formData.pregnancyDays),
      lactation: Number(formData.lactation),
      inseminated_dates: formData.inseminated_dates
        ? new Date(formData.inseminated_dates).toISOString()
        : null,
      ispregnant: formData.type === "Pregnant Cow" || formData.type === "Pregnant Heifer",
      is_calve: showPedigree
    };

    if (!(formData.type === "Cow" || formData.type === "Pregnant Cow")) {
      delete finalPayload.lactation;
    }

    await addanimal(finalPayload);

    toast.dismiss();
    toast.success(t("herd.addAnimal.addSuccess"));
   
     setTimeout(() => {
      window.location.reload();
    }, 1500);


  } catch (error) {
    console.error("AddAnimal => error in handleSubmit =>", error);
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.error(t("herd.addAnimal.addError"));
    }
   
  }finally {
    setIsSubmitting(false);
  }
};

  // Update the Cancel button handler
  const handleCancel = () => {
    window.location.reload(); // Refresh to reset form
  };



  return (

  <PageContainer title={t("herd.addAnimal.title")} maxWidth={1200}>
       <Box sx={{
               backgroundColor: theme.palette.background.paper,
               p: { xs: 2, sm: 4, md: 3 },
              borderRadius: '8px',
              marginBottom: '30px',
              position: 'relative',
              boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}>

      <Grid container spacing={4}>
        {/** PEN ID  */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.addAnimal.penId")}
            name="penId"
            variant="outlined"
            value={formData.penId}
            onChange={handleInputChange}
          >
            {dropdownOptions.penIDs.map((option) => (
              <MenuItem key={option.uuid} value={option.uuid}>
                {option.name}
              </MenuItem>
            ))}

            {/* Add New Pen ID option */}
            <MenuItem
              onClick={() => setIsAddPenModalOpen(true)}
              sx={{
                color: "#1976d2",
                fontWeight: "bold",
                borderTop: "1px solid #ddd"
              }}
            >
              {t("herd.addAnimal.addNewPen")}
            </MenuItem>
          </TextField>
        </Grid>

        {/** TAG ID  */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.addAnimal.tagId")}
            name="tagId"
            variant="outlined"
            value={formData.tagId}
            onChange={handleInputChange}
          >
            {dropdownOptions.tagIDs.map((option) => (
              <MenuItem key={option.uuid} value={option.uuid}>
                {option.name}
              </MenuItem>
            ))}
              {/* Add New Tag ID option */}
          <MenuItem
            onClick={() => setIsAddTagModalOpen(true)}
            sx={{
              color: "#1976d2",
              fontWeight: "bold",
              borderTop: "1px solid #ddd"
            }}
          >
            {t("herd.addAnimal.addNewTag")}
          </MenuItem>
          </TextField>
        </Grid>

        {/** ELECTRONIC ID */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label={t("herd.addAnimal.electronicId")}
            name="electronicId"
            variant="outlined"
            value={formData.electronicId}
            onChange={handleInputChange}
          />
        </Grid>

        {/** ANIMAL NAME */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label={t("herd.addAnimal.animalName")}
            name="name"
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
          />
        </Grid>

        {/** ANIMAL TYPE */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.addAnimal.animalType")}
            name="animalType"
            variant="outlined"
            value={formData.animalType || ""}
            onChange={handleInputChange}
          >
            {dropdownOptions.animalTypes.map((option) => (
              <MenuItem key={option.uuid} value={option.uuid}>
                {option.name}
              </MenuItem>
            ))}
            <MenuItem
              onClick={() => setIsAddAnimalTypeModalOpen(true)}
              sx={{
                color: "#1976d2",
                fontWeight: "bold",
                borderTop: "1px solid #ddd"
              }}
            >
              {t("herd.addAnimal.addNewAnimalType")}
            </MenuItem>
          </TextField>
        </Grid>

        {/** BREED TYPE */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.addAnimal.breedType")}
            name="breedType"
            variant="outlined"
            value={formData.breedType}
            onChange={handleInputChange}
          >
            {dropdownOptions.breedTypes.map((option) => (
              <MenuItem key={option.uuid} value={option.uuid}>
                {option.name}
              </MenuItem>
            ))}
             <MenuItem
      onClick={() => setIsAddBreedTypeModalOpen(true)}
      sx={{
        color: "#1976d2",
        fontWeight: "bold",
        borderTop: "1px solid #ddd"
      }}
    >
      {t("herd.addAnimal.addNewBreedType")}
    </MenuItem>
          </TextField>
        </Grid>

        {/** PURCHASED FROM */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.addAnimal.purchasedFrom")}
            name="purchase_from"
            variant="outlined"
            value={formData.purchase_from}
            onChange={handleInputChange}
          >
            <MenuItem value="australia">{t("herd.addAnimal.countryAustralia")}</MenuItem>
            <MenuItem value="america">{t("herd.addAnimal.countryAmerica")}</MenuItem>
            <MenuItem value="canada">{t("herd.addAnimal.countryCanada")}</MenuItem>
          </TextField>
        </Grid>

        {/** COUNTRY */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label={t("herd.addAnimal.country")}
            name="country"
            variant="outlined"
            value={formData.country}
            onChange={handleInputChange}
          />
        </Grid>

        {/** GENDER */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.addAnimal.gender")}
            name="gender"
            variant="outlined"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <MenuItem value="male">{t("herd.addAnimal.male")}</MenuItem>
            <MenuItem value="female">{t("herd.addAnimal.female")}</MenuItem>
          </TextField>
        </Grid>

        {/** TYPE => Non-Pregnant Heifer, Pregnant Heifer, Cow, Pregnant Cow */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.addAnimal.type")}
            name="type"
            variant="outlined"
            value={formData.type}
            onChange={handleInputChange}
            disabled={formData.gender === "male"}
          >
            {["Non-Pregnant Heifer", "Pregnant Heifer", "Cow", "Pregnant Cow"].map(
              (option) => (
                <MenuItem key={option} value={option}>
                  {t("herd.addAnimal.types." + option, option)}
                </MenuItem>
              )
            )}
          </TextField>
        </Grid>

<Grid item xs={12} md={4}>
        {formData.gender !== "male" && (
          <Dropdown
            label={t("herd.addAnimal.animalCategory")}
            name="animalCategory"
            value={formData.animalCategory}
            options={categoryOptions}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, animalCategory: e.target.value }))
            }
          />
        )}
</Grid>
      </Grid>

      {/* SUBSECTION: Type-specific info */}
      <Grid item xs={12}>
        <Typography variant="h6" fontWeight="bold" sx={{ mt: "20px", mb: "10px" }}>
          {t("herd.addAnimal.typeSection")}
        </Typography>
      </Grid>

        <Box
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F4F8F7',
          padding: "20px",
          borderRadius: "8px",
          marginTop: "10px"
        }}
      >        
        <Grid container spacing={4}>
          {/* ARRIVAL DATE */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addAnimal.arrivalDate")}
              type="date"
              name="arrivalDate"
              variant="outlined"
              value={formData.arrivalDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* BIRTHDATE */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addAnimal.birthdate")}
              type="date"
              name="birthdate"
              variant="outlined"
              value={formData.birthdate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* PRICE */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addAnimal.price")}
              name="price"
              variant="outlined"
              value={formData.price}
              onChange={handleInputChange}
            />
          </Grid>

          {/* ANIMAL WEIGHT */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addAnimal.animalWeight")}
              name="animalWeight"
              variant="outlined"
              value={formData.animalWeight}
              onChange={handleInputChange}
            />
          </Grid>

          {/* WEIGHT DATE */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addAnimal.weightDate")}
              type="date"
              name="weightDate"
              variant="outlined"
              value={formData.weightDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* PICTURE (file upload) */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addAnimal.picture")}
              type="file"
              name="picture"
              InputLabelProps={{ shrink: true }}
              value={formData.picture}
              onChange={handleInputChange}
            />
          </Grid>

          {/* SUBCATEGORY */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label={t("herd.addAnimal.subCategory")}
              name="subcategory"
              variant="outlined"
              value={formData.subcategory}
              onChange={handleInputChange}
            >
              {dropdownOptions.subCategories.map((option) => (
                <MenuItem key={option.uuid} value={option.uuid}>
                  {option.name}
                </MenuItem>
              ))}
              <MenuItem
      onClick={() => setIsAddSubCategoryModalOpen(true)}
      sx={{
        color: "#1976d2",
        fontWeight: "bold",
        borderTop: "1px solid #ddd"
      }}
    >
      {t("herd.addAnimal.addNewSubcategory")}
    </MenuItem>
            </TextField>
          </Grid>

          {/* PEDIGREE INFO => yes/no => sire/dam */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label={t("herd.addAnimal.pedigreeInfo")}
              name="pedigreeCheck"
              variant="outlined"
              value={showPedigree ? "Yes" : "No"}
              onChange={(e) => setShowPedigree(e.target.value === "Yes")}
            >
              {["Yes", "No"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option === "Yes" ? t("herd.addAnimal.yes") : t("herd.addAnimal.no")}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {showPedigree && (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label={t("herd.addAnimal.bull")}
                  name="sireTagId"
                  variant="outlined"
                  value={formData.pedigreeInfo.sireTagId}
                  onChange={handleInputChange}
 >
            {dropdownOptions.bull.map((option) => (
              <MenuItem key={option.uuid} value={option.uuid}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                select
                  fullWidth
                  label={t("herd.addAnimal.motherTag")}
                  name="damTagId"
                  variant="outlined"
                  value={formData.pedigreeInfo.damTagId}
                  onChange={handleInputChange}
                 >
    {femaleAnimals.map((animal) => (
      <MenuItem key={animal.tagId} value={animal.tagId}>
        {animal.tag?.name || t("herd.addAnimal.unnamedTag")}
      </MenuItem>
    ))}
  </TextField>
              </Grid>
            </>
          )}
          {/* If type= “Cow” or “Pregnant Cow” => noOfLactations + lastCalvingDate */}
          {(formData.type === "Cow" || formData.type === "Pregnant Cow") && (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t("herd.addAnimal.noOfLactations")}
                  name="lactation"
                  variant="outlined"
                  value={formData.lactation}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t("herd.addAnimal.lastCalvingDate")}
                  type="date"
                  name="lastCalvingDate"
                  variant="outlined"
                  value={formData.lastCalvingDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* If type= “Pregnant Cow” => AI date */}
          {formData.type === "Pregnant Cow" && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t("herd.addAnimal.aiDate")}
                type="date"
                name="inseminated_dates"
                variant="outlined"
                value={formData.inseminated_dates}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {/* If type= “Pregnant Heifer” => pregnancyDays */}
          {formData.type === "Pregnant Heifer" && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t("herd.addAnimal.pregnancyDays")}
                name="pregnancyDays"
                variant="outlined"
                value={formData.pregnancyDays}
                onChange={handleInputChange}
              />
            </Grid>
          )}
        </Grid>
      </Box>
 <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 4 }}></Box>
  <Button
    variant="contained"
    sx={{ backgroundColor: "#005f73", color: "#ffffff", marginTop: "20px",padding:"7px 50px" }}
    onClick={handleSubmit}
  >
     {isSubmitting ? (
      <CircularProgress size={24} sx={{ color: "#0F7C8F" }} /> // Show spinner
    ) : (
      t("herd.addAnimal.add")
     )}
  </Button>
  <Button
  variant="contained"
  sx={{
    marginTop: "20px",
    padding: "6px 40px",
    marginLeft: "15px",
    color: '#6a757d',
    borderColor: '#d6d6d6',
    textTransform: 'none',
    borderRadius: '6px',
    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#CECECE'
  }}
  onClick={() => {
    // Clear all form fields
    setFormData({
      penId: "",
      tagId: "",
      animalType: "",
      breedType: "",
      subcategory: "",
      electronicId: "",
      name: "",
      purchase_from: "",
      country: "",
      gender: "",
      type: "Non-Pregnant Heifer",
      arrivalDate: "",
      birthdate: "",
      price: "",
      animalWeight: "",
      weightDate: "",
      picture: "",
      pedigreeInfo: { sireTagId: "", damTagId: "" },
      lactation: "",
      inseminated_dates: "",
      pregnancyDays: "",
      animalCategory: ""
    });
    setShowPedigree(false);
  }}
>
  {t("common.cancel")}
</Button>


      {/**
       * ADD NEW PEN MODAL
       * This reuses your existing AddItemModal component.
       */}
      <AddItemModal
        label={t("herd.addAnimal.modalPenId")}
        isOpen={isAddPenModalOpen}
        onClose={() => setIsAddPenModalOpen(false)}
        onAdd={handleAddNewPen}
      />
 {/* Add New Tag Modal */}
      <AddItemModal
        label={t("herd.addAnimal.modalTagId")}
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onAdd={handleAddNewTag}
      />
      
<AddItemModal
  label={t("herd.addAnimal.modalAnimalType")}
  isOpen={isAddAnimalTypeModalOpen}
  onClose={() => setIsAddAnimalTypeModalOpen(false)}
  onAdd={handleAddNewAnimalType}
/>

<AddItemModal
  label={t("herd.addAnimal.modalBreedType")}
  isOpen={isAddBreedTypeModalOpen}
  onClose={() => setIsAddBreedTypeModalOpen(false)}
  onAdd={handleAddNewBreedType}
/>



<AddItemModal
  label={t("herd.addAnimal.modalSubcategory")}
  isOpen={isAddSubCategoryModalOpen}
  onClose={() => setIsAddSubCategoryModalOpen(false)}
  onAdd={handleAddNewSubCategory}
/>
<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>
    </Box>
    </PageContainer>


  );
};

export default AddAnimal;