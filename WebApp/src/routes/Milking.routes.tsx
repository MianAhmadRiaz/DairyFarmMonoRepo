import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MilkingDashbaord from '../scenes/Milking/MilkDashboard';
import ListOfMilkingAnimals from '../scenes/Milking/ApprovedMilk';
import AddMilingSession from '../scenes/Milking/AddMilkingSession';
import MilkInOut from '../scenes/Milking/MilkInOut';
import DailyMilkReport from '../scenes/Milking/DailyMilkReport';
import AverageMilkReport from '../scenes/Milking/AverageMilkReport';
import MilkDifferenceReport from '../scenes/Milking/MilkDifferenceReport';
import CowMilkingGraph from '../scenes/Milking/CowMilkingGraph';
import MilkOut from '../scenes/Milking/MilkOut';

const MilkingRoutes = () => {
  return (
    <Routes>
      <Route path="/milk-dashboard" element={<MilkingDashbaord />} />
      <Route path="/add-milking-session" element={<AddMilingSession />} />
      <Route path="/list-of-milking" element={<ListOfMilkingAnimals />} />
      <Route path="/milk-in-out" element={<MilkInOut />} />
      <Route path="/daily-milk-report" element={<DailyMilkReport />} />
      <Route path="/average-milk-report" element={<AverageMilkReport />} />
      <Route path="/milk-out" element={<MilkOut />} />
      <Route
        path="/milk-difference-report"
        element={<MilkDifferenceReport />}
      />
      <Route path="/cow-milking-report" element={<CowMilkingGraph />} />
    </Routes>
  );
};

export default MilkingRoutes;
