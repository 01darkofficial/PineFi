import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    goals: [],
    lastUpdated: null,
    needsRefresh: true,
    status: 'idle'
};
const goalsSlcie = createSlice({
    name: 'goals',
    initialState,
    reducers: {
        setGoals: (state, action) => {
            state.goals = action.payload;
            state.lastUpdated = Date.now();
        },
        addGoal: (state, action) => {
            state.goals.unshift(action.payload);
        },
        deleteGoal: (state, action) => {
            state.goals = state.goals.filter(
                t => t.id !== action.payload
            );
        },
        markDataFresh: (state) => {
            state.needsRefresh = false;
            state.status = 'succeeded';
        },
        markDataStale: (state) => {
            state.needsRefresh = true;
        },
        setLoading: (state) => {
            state.status = 'loading';
        },
        setError: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        }
    }
});
export const {
    setGoals,
    addGoal,
    deleteGoal,
    markDataFresh,
    markDataStale,
    setLoading,
    setError
} = goalsSlcie.actions;

export default goalsSlcie.reducer;