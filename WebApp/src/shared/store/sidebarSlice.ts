// src/store/sidebarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  sidebarCollapsed: boolean;
}

const initialState: SidebarState = {
  sidebarCollapsed: false
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    }
  }
});

export const { toggleSidebar, setSidebarCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer;
