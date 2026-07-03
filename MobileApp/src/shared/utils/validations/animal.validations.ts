import * as Yup from 'yup'

export const animalValidationSchema = Yup.object().shape({
  penId: Yup.string().required('Pend ID is required'),
  tagId: Yup.string().required('Tag ID is required'),
  eId: Yup.string().required('Electronic ID is required'),
  animalName: Yup.string().required('Animal Name is required'),
  animalType: Yup.string().required('Animal Type is required'),
  breedType: Yup.string().required('Breed Type is required'),
  purchasedFrom: Yup.string().required('Purchased From is required'),
  country: Yup.string().required('Country is required'),
  gender: Yup.string().required('Gender is required'),
  type: Yup.string().required('Type is required'),

  arrivalDate: Yup.string().required('Arrival Date is required'),
  birthDate: Yup.string().required('Birth Date is required'),
  price: Yup.string().required('price is required'),
  weight: Yup.string().required('Weight is required'),
  weightDate: Yup.string().required('Weight Date is required'),
  subCategory: Yup.string().required('Animal Subcategory is required')
})
