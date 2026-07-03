import { ICONS } from 'assets/icons'
import NavRoutes from 'routes/NavRoutes'

export const conditionsType = [
  'Non-Pregnant Heifer',
  'Pregnant Heifer',
  'Cow',
  'Pregnant Cow'
]

export const animals = [
  {
    uuid: '7599070e-fca6-4c28-a317-281df656e223',
    farmId: '0591643d-4ac9-4ad9-a292-eac9e9b8c4a2',
    penId: '2d3b58a0-881b-4356-81bd-ec786d3dc048',
    tagId: 'e347a8dd-a517-422d-8a33-b19c95795eed',
    pregnancyStatusId: null,
    lactationStatusId: null,
    electronicId: 'EID004',
    name: 'oooooo',
    lactation: 2,
    animalType: 'cow',
    breedType: 'Holstein Friesian (USA)',
    purchase_from: 'Farm',
    country: 'india',
    gender: 'male',
    healthStatus: 'milking',
    animalCategory: 'milk',
    ispregnant: false,
    type: 'Cattle',
    arrivalDate: '2025-01-21T19:00:00.000Z',
    birthdate: '2022-04-15T00:00:00.000Z',
    price: 52200,
    animalWeight: 900,
    weightDate: '2024-09-11T00:00:00.000Z',
    picture: ICONS.COOL_COW,
    subcategory: 'Stud',
    pedigreeInfo: {
      damTagId: 'DAM001',
      sireTagId: 'SIRE001'
    },
    inseminated_date: null,
    calving_date: '2023-02-11T00:00:00.000Z',
    last_event: 'protocol',
    createdBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    updatedBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    isDeleted: false,
    createdAt: '2025-01-31T18:34:04.249Z',
    updatedAt: '2025-01-31T18:38:36.120Z',
    tag: {
      uuid: 'e347a8dd-a517-422d-8a33-b19c95795eed',
      name: 'tag0008'
    }
  },
  {
    uuid: 'c0196671-8327-4d2a-b30f-5d84ecd4eb17',
    farmId: '0591643d-4ac9-4ad9-a292-eac9e9b8c4a2',
    penId: '764d0596-4193-4082-ba4c-08fcf4cc65e5',
    tagId: '08c45769-9835-45bb-ab6c-7851f4f98297',
    pregnancyStatusId: null,
    lactationStatusId: null,
    electronicId: 'EID004',
    name: 'ooooops',
    lactation: 3,
    animalType: 'cow',
    breedType: 'Holstein Friesian (USA)',
    purchase_from: 'Farm',
    country: 'india',
    gender: 'female',
    healthStatus: 'milking',
    animalCategory: 'milk',
    ispregnant: false,
    type: 'Cattle',
    arrivalDate: '2025-01-21T19:00:00.000Z',
    birthdate: '2022-04-15T00:00:00.000Z',
    price: 52200,
    animalWeight: 900,
    weightDate: '2024-09-11T00:00:00.000Z',
    picture: ICONS.COOL_COW,
    subcategory: 'Stud',
    pedigreeInfo: {
      damTagId: 'DAM001',
      sireTagId: 'SIRE001'
    },
    inseminated_date: null,
    calving_date: '2025-01-11T00:00:00.000Z',
    last_event: null,
    createdBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    updatedBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    isDeleted: false,
    createdAt: '2025-01-30T19:28:50.402Z',
    updatedAt: '2025-01-30T19:35:52.931Z',
    tag: {
      uuid: '08c45769-9835-45bb-ab6c-7851f4f98297',
      name: 'tag0005'
    }
  },
  {
    uuid: 'e5ef94d6-0d13-4c20-b331-37beafb7497a',
    farmId: '0591643d-4ac9-4ad9-a292-eac9e9b8c4a2',
    penId: '2d3b58a0-881b-4356-81bd-ec786d3dc048',
    tagId: '62c99ad8-6998-4019-8e4e-9561efe55d8e',
    pregnancyStatusId: null,
    lactationStatusId: null,
    electronicId: 'EID005',
    name: 'moon',
    lactation: 4,
    animalType: 'cow',
    breedType: 'Holstein Friesian (USA)',
    purchase_from: 'Farm',
    country: 'india',
    gender: 'female',
    healthStatus: 'milking',
    animalCategory: 'milk',
    ispregnant: false,
    type: 'Cattle',
    arrivalDate: '2025-01-21T19:00:00.000Z',
    birthdate: '2022-04-15T00:00:00.000Z',
    price: 42200,
    animalWeight: 800,
    weightDate: '2024-09-11T00:00:00.000Z',
    picture: ICONS.COOL_COW,
    subcategory: 'Stud',
    pedigreeInfo: {
      damTagId: 'DAM004',
      sireTagId: 'SIRE004'
    },
    inseminated_date: null,
    calving_date: '2024-07-11T00:00:00.000Z',
    last_event: null,
    createdBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    updatedBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    isDeleted: false,
    createdAt: '2025-01-30T19:27:48.500Z',
    updatedAt: '2025-01-30T19:27:48.500Z',
    tag: {
      uuid: '62c99ad8-6998-4019-8e4e-9561efe55d8e',
      name: 'tag0004'
    }
  },
  {
    uuid: 'd74c815b-82cc-499e-b1c5-e39d34872723',
    farmId: '0591643d-4ac9-4ad9-a292-eac9e9b8c4a2',
    penId: '2d3b58a0-881b-4356-81bd-ec786d3dc048',
    tagId: '3ecaf207-630f-4789-8fa2-f760eed6eac6',
    pregnancyStatusId: null,
    lactationStatusId: null,
    electronicId: 'EID006',
    name: 'mocky',
    lactation: 2,
    animalType: 'cattle',
    breedType: 'Holstein Friesian (USA)',
    purchase_from: 'Farm d',
    country: 'pakistan',
    gender: 'female',
    healthStatus: 'milking',
    animalCategory: 'milk',
    ispregnant: false,
    type: 'Cattle',
    arrivalDate: '2024-01-21T19:00:00.000Z',
    birthdate: '2022-04-15T00:00:00.000Z',
    price: 22200,
    animalWeight: 800,
    weightDate: '2024-09-11T00:00:00.000Z',
    picture: ICONS.COOL_COW,
    subcategory: 'Stud',
    pedigreeInfo: {
      damTagId: 'DAM004',
      sireTagId: 'SIRE004'
    },
    inseminated_date: null,
    calving_date: '2024-09-11T00:00:00.000Z',
    last_event: null,
    createdBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    updatedBy: '6ef5d5f8-8889-4ab9-b883-c0a6ab2b4caa',
    isDeleted: false,
    createdAt: '2025-01-30T19:26:36.705Z',
    updatedAt: '2025-01-30T19:26:36.705Z',
    tag: {
      uuid: '3ecaf207-630f-4789-8fa2-f760eed6eac6',
      name: 'tag0006'
    }
  }
]

export const breedingEvents = [
  {
    id: '1',
    title: 'PROTOCOL',
    screen: NavRoutes.PROTOCOL,
    description: 'Setting Schedule of Cows Injection before AI Breeding.',
    image: ICONS.PROTOCOL
  },
  {
    id: '2',
    title: 'AI BREEDING',
    screen: NavRoutes.AI_BREEDING,

    description: 'Artificial insemination of cows through injection.',
    image: ICONS.AIBREEDING
  },
  {
    id: '3',
    title: 'BULL BREEDING',
    screen: NavRoutes.BULL_BREEDING,

    description: 'Natural breeding of cow through bull.',
    image: ICONS.BULLBREEDING
  },
  {
    id: '4',
    title: 'HEAT DETECTION',
    screen: NavRoutes.HEAT_DETECTION,

    description: 'Detect heat of animals for insemination.',
    image: ICONS.HEATDETECTION
  },
  {
    id: '5',
    title: 'PREGNANCY CHECK',
    screen: NavRoutes.PREGNANCY_CHECK,

    description: 'Check Cow Pregnancy After Breeding.',
    image: ICONS.PREGNANCYCHECK
  },
  {
    id: '6',
    title: 'ABORTION',
    screen: 'Abortion',

    description: 'Abortion of Cattle.',
    image: ICONS.ABORTION
  },
  {
    id: '7',
    title: 'CALVING',
    screen: 'Calving',

    description: 'After 270 days, it’s time for Calving.',
    image: ICONS.CALVING
  },
  {
    id: '8',
    title: 'DRY OFF',
    screen: 'Dry Off',

    description: 'Remove Cow from Milking.',
    image: ICONS.DRYOFF
  }
]

export const protocolData = [
  { particular: 'Min DIM', hours: '40', date: '-', time: '-' },
  { particular: 'Max DIM', hours: '1000000', date: '-', time: '-' },
  { particular: 'GnRH', hours: '0', date: '-', time: '-' },
  { particular: 'PGF2a', hours: '7', date: '-', time: '-' },
  { particular: 'GnRH', hours: '2', date: '-', time: '-' },
  { particular: 'GnRH', hours: '7', date: '-', time: '-' },
  { particular: 'PGF2a', hours: '7', date: '-', time: '-' },
  { particular: 'GnRH', hours: '1', date: '-', time: '-' },
  { particular: 'GnRH', hours: '1', date: '-', time: '-' },
  { particular: 'Breeding Animals', hours: '1', date: '-', time: '-' }
]
