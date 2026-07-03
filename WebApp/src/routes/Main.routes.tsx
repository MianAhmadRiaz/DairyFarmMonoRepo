import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import AddAnimal from '../scenes/dashboard/Herd Management/AddAnimal';
import MoveToPen from '../scenes/dashboard/Herd Management/MoveToPen';
import RemoveAnimal from '../scenes/dashboard/Herd Management/RemoveAnimal';
import ViewCalves from '../scenes/dashboard/Herd Management/ViewCalves';
import BreedingEvents from '../scenes/dashboard/Breeding Events/BreedingEvents';
import Protocol from '../scenes/dashboard/Breeding Events/Protocol';
import BullBreeding from '../scenes/dashboard/Breeding Events/BullBreeding';
import AiBreeding from '../scenes/dashboard/Breeding Events/AiBreeding';
import HeatDetection from '../scenes/dashboard/Breeding Events/HeatDetection';
import PregnancyCheck from '../scenes/dashboard/Breeding Events/PregnancyCheck';
import Abortion from '../scenes/dashboard/Breeding Events/Abortion';
import AddAbortionEvent from '../scenes/dashboard/Breeding Events/AddAbortionEvent';
import Calving from '../scenes/dashboard/Breeding Events/Calving';
import DryOff from '../scenes/dashboard/Breeding Events/DryOff';
import AddNewAiEvent from '../scenes/dashboard/Breeding Events/AddNewAiEvents';
import AddBullBreedingEvent from '../scenes/dashboard/Breeding Events/AddBullBreedingEvent';
import Login from '../shared/components/Login Screens/Login';
import CmtTest from '../scenes/dashboard/Herd Management/CmtTest';
import AnimalInfo from '../scenes/dashboard/Herd Management/AnimalInfo';
import AddPregnancyTest from '../scenes/dashboard/Breeding Events/AddPregnancyTest';
import HerdDashboard from '../scenes/dashboard/Dashboard';
import AddTreatment from '../scenes/dashboard/Herd Management/AddTreatment';
import Treatments from '../scenes/dashboard/Herd Management/Treatments';
import HerdAlerts from '../scenes/dashboard/Herd Management/HerdAlerts';
import WeightHealth from '../scenes/dashboard/Herd Management/WeightHealth';
import CowProfile from '../scenes/dashboard/Herd Management/CowProfile';
// import AddPregnancyTest from '../scenes/dashboard/Breeding Events/AddPregnancyTest';

const MainRoutes = () => {
  return (
    <Routes>
      {/* Protected Routes - Only accessible when logged in */}
      <Route path="/herd-dashboard" element={<HerdDashboard />} />
      <Route path="/add-animal" element={<AddAnimal />} />
      <Route path="/animal-info" element={<AnimalInfo />} />
      <Route path="/animal/:animalId" element={<CowProfile />} />
      <Route path="/move-to-pen" element={<MoveToPen />} />
      <Route path="/remove-animal" element={<RemoveAnimal />} />
      <Route path="/view-calves" element={<ViewCalves />} />
      <Route path="/breeding-events" element={<BreedingEvents />} />
      <Route path="/protocol" element={<Protocol />} />
      <Route path="/bull-breeding" element={<BullBreeding />} />
      <Route path="/bull-breeding/new" element={<AddBullBreedingEvent />} />
      <Route path="/ai-breeding" element={<AiBreeding />} />
      <Route path="/aibreeding/new" element={<AddNewAiEvent />} />
      <Route path="/heat-detection" element={<HeatDetection />} />
      <Route path="/pregnancy-check" element={<PregnancyCheck />} />
      <Route path="/pregnancy-test/new" element={<AddPregnancyTest />} />
      <Route path="/abortion" element={<Abortion />} />
      <Route path="/abortion/new" element={<AddAbortionEvent />} />
      <Route path="/calving" element={<Calving />} />
      <Route path="/dry-off" element={<DryOff />} />
      <Route path="/treatments" element={<Treatments />} />
      <Route path="/treatments/new" element={<AddTreatment />} />
      <Route path="/herd-alerts" element={<HerdAlerts />} />
      <Route path="/weight-health" element={<WeightHealth />} />
      <Route path="/cmt-test" element={<CmtTest />} />
      {/* Redirect unknown routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/faq" element={<CmtTest />} />
    </Routes>
  );
};

export default MainRoutes;
