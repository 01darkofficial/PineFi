import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import transactionsReducer from "./transactionsSlice"
import budgetsReducer from "./budgetsSlice"
import goalsReducer from "./goalsSlice"

const rootReducer = combineReducers({
    auth: authReducer,
    transactions: transactionsReducer,
    budgets: budgetsReducer,
    goals: goalsReducer
});

export default rootReducer;