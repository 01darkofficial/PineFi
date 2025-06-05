import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    transactions: [],
    lastUpdated: null,
    needsRefresh: true,
    status: 'idle'
};

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        setTransactions: (state, action) => {
            state.transactions = action.payload;
            state.lastUpdated = Date.now();
        },
        addTransaction: (state, action) => {
            state.transactions.unshift(action.payload);
        },
        deleteTransaction: (state, action) => {
            state.transactions = state.transactions.filter(
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
    setTransactions,
    addTransaction,
    deleteTransaction,
    markDataFresh,
    markDataStale,
    setLoading,
    setError
} = transactionsSlice.actions;

export default transactionsSlice.reducer;