import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    budgets: [],
    lastUpdated: null,
    needsRefresh: true,
    status: 'idle' // 'idle' | 'loading' | 'succeeded' | 'failed'
};

const budgetsSlice = createSlice({
    name: 'budgets',
    initialState,
    reducers: {
        setBudgets: (state, action) => {
            state.budgets = action.payload;
            state.lastUpdated = Date.now();
        },
        addBudgets: (state, action) => {
            state.budgets.unshift(action.payload);
        },
        deleteBudgets: (state, action) => {
            state.budgets = state.budgetes.filter(
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
    setBudgets,
    addBudgets,
    deleteBudgets,
    markDataFresh,
    markDataStale,
    setLoading,
    setError
} = budgetsSlice.actions;

export default budgetsSlice.reducer;