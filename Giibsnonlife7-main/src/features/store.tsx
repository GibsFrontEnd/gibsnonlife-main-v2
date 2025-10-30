import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducers/authSlice";
import roleReducer from "./reducers/adminReducers/roleSlice";
import uiReducer from "./reducers/uiReducers/uiSlice";
import permissionReducer from "./reducers/adminReducers/permissionSlice";
import userReducer from "./reducers/adminReducers/userSlice";
import riskReducer from "./reducers/adminReducers/riskSlice";
import productReducer from "./reducers/productReducers/productSlice";
import subRiskSectionReducer from "./reducers/productReducers/subRiskSectionSlice"
import subRiskSMIReducer from "./reducers/productReducers/subRiskSMISlice";
import partyTypeReducer from "./reducers/adminReducers/partyTypeSlice";
import policyReducer from "./reducers/csuReducers/policySlice";
import branchReducer from "./reducers/companyReducers/branchSlice";
import customerReducer from "./reducers/csuReducers/customerSlice";
import partyReducer from "./reducers/csuReducers/agentSlice";
import marketingStaffReducer from "./reducers/companyReducers/marketingStaffSlice";
import regionReducer from './reducers/productReducers/regionSlice';
import quoteReducer from './reducers/quoteReducers/quotationSlice'
import companySlice from "./reducers/companyReducers/companySlice";
import marketingChannelsReducer from "./reducers/companyReducers/marketingChannelSlice";
import clauseReducer from "./reducers/quoteReducers/clauseSlice";
import motorQuotationReducer from "./reducers/quoteReducers/motorQuotationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    users: userReducer,
    risks: riskReducer,
    products: productReducer,
    subRiskSections: subRiskSectionReducer,
    subRiskSMIs: subRiskSMIReducer,
    partyTypes: partyTypeReducer,
    policies: policyReducer,
    regions: regionReducer,
    branches: branchReducer,
    customers: customerReducer,
    parties: partyReducer,
    marketingStaff: marketingStaffReducer,
    quotations: quoteReducer,
    companies: companySlice,
    marketingChannels: marketingChannelsReducer,
    clauses: clauseReducer,
    motorQuotations: motorQuotationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
