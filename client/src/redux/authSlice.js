import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isLoggedIn: false,
    user: null,
    tokens: {
        access: null,
        refresh: null
    }
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.tokens = {
                access: action.payload.accessToken,
                refresh: action.payload.refreshToken
            };
        },
        logout: (state) => {
            Object.assign(state, initialState);
        },
        updateNetWorth: (state, action) => {
            if (state.user) {
                state.user.netWorth = action.payload;
            }
        },
    }
});
export const { login, logout, updateNetWorth } = authSlice.actions;
export default authSlice.reducer;