import {createAsyncThunk  , createSlice} from '@reduxjs/toolkit'
import axiosClient from './utils/axiosClient.js'

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData , { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/users/register', userData)
      return response.data.user ; 
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials , { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/users/login', credentials)
      return response.data.user ; 
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/users/checkAuth' ,{ withCredentials: true })
      return response.data.user
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/users/logout')
      return null;
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
   
  },
  extraReducers: (builder) => {

    builder
    //register user case
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || "Failed to register"
        state.isAuthenticated = false
        state.user = null
      })

      //login user case
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || "Failed to login"
        state.isAuthenticated = false
        state.user = null
      })

      //check auth case
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || "Failed to check authentication"
        state.isAuthenticated = false
        state.user = null
      })

      //logout case
      .addCase(logout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.error = null
        state.isAuthenticated = false
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || "Failed to logout"
        state.isAuthenticated = false
        state.user = null
      })

  },
})

export default authSlice.reducer ;
