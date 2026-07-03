import { createSlice } from '@reduxjs/toolkit'
import { UserState } from 'shared/utils/models/types'

const initialState: UserState = {
  user: undefined,
  rememberMe: false,
  authToken: ''
}

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserState: () => initialState,
    setUser: (state, action) => {
      state.user = action.payload
    }
  }
})

export const { resetUserState, setUser } = slice.actions
export default slice.reducer
