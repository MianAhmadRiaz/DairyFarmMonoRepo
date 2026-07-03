import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateRecipe from '../scenes/Feeding/CreateRecipe';
import ViewRecipe from '../scenes/Feeding/ViewRecipe';
import ShedFeedReport from '../scenes/Feeding/ShedFeedReport';
import DatewiseShedFeedReport from '../scenes/Feeding/DateWIseShedFeedReport';
import ShedFeedStockPrint from '../scenes/Feeding/ShedFeedStockPrint';
import ConductedProcessReport from '../scenes/Feeding/ConductFeedVandaFormulation';
import CreateFeedFormulation from '../scenes/Feeding/CreateFeedFormulation';
import ViewFeedFormulation from '../scenes/Feeding/ViewFeedFormulation';
import ConductFeedVandaFormulation from '../scenes/Feeding/ConductFeedVandaFormulation';
import ViewConductedVanda from '../scenes/Feeding/ViewConductedVandaFormulation';
import ApplyFeedRecipeShed from '../scenes/Feeding/ApplyFeedRecipeShed';
import ApplyFeedRecipeAdjustableShed from '../scenes/Feeding/ApplyFeedRecipeAdjustableShed';

const FeedingRoutes = () => {
  return (
    <Routes>
      {/* Protected Routes - Only accessible when logged in */}
      <Route path="/create-recipe" element={<CreateRecipe />} />
      <Route path="/view-recipe" element={<ViewRecipe />} />
      <Route path="/shed-feed-report" element={<ShedFeedReport />} />
      <Route
        path="/date-wise-shed-feed-report"
        element={<DatewiseShedFeedReport />}
      />
      <Route
        path="/shed-feed-stock-print"
        element={<ShedFeedStockPrint />}
      ></Route>
      <Route
        path="/conducted-vanda-feed-formulation"
        element={<ConductFeedVandaFormulation />}
      ></Route>

      <Route
        path="/create-feed-formulation"
        element={<CreateFeedFormulation />}
      ></Route>
      <Route
        path="/view-feed-formulation"
        element={<ViewFeedFormulation />}
      ></Route>
      <Route
        path="/view-conducted-vanda-formulation"
        element={<ViewConductedVanda />}
      ></Route>
      <Route
        path="/apply-feed-recipe-shed"
        element={<ApplyFeedRecipeShed />}
      ></Route>
      <Route
        path="/apply-feed-recipeA-adjustable-shed"
        element={<ApplyFeedRecipeAdjustableShed />}
      ></Route>
    </Routes>
  );
};

export default FeedingRoutes;
