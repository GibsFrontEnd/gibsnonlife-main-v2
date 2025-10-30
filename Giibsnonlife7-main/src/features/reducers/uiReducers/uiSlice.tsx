// src/store/slices/uiSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  // Role dialogs
  showCreateRoleDialog: boolean;
  showEditRoleDialog: boolean;
  showDeleteRoleDialog: boolean;
  showViewRoleDetailsDialog: boolean;

  // Permission dialogs
  showCreatePermissionDialog: boolean;
  showEditPermissionDialog: boolean;
  showDeletePermissionDialog: boolean;
  showViewPermissionDetailsDialog: boolean;

  // User dialogs
  showCreateUserDialog: boolean;
  showEditUserDialog: boolean;
  showDeleteUserDialog: boolean;
  showViewUserDetailsDialog: boolean;
  showChangePasswordDialog: boolean;

  // Risk dialogs
  showCreateRiskDialog: boolean;
  showEditRiskDialog: boolean;
  showDeleteRiskDialog: boolean;
  showViewRiskDetailsDialog: boolean;

  // Sub Risk Section dialogs
  showCreateSubRiskSectionDialog: boolean;
  showEditSubRiskSectionDialog: boolean;
  showDeleteSubRiskSectionDialog: boolean;
  showViewSubRiskSectionDetailsDialog: boolean;

  // Product dialogs
  showCreateProductDialog: boolean;
  showEditProductDialog: boolean;
  showDeleteProductDialog: boolean;
  showViewProductDetailsDialog: boolean;

  // Policy dialogs
  showCreatePolicyDialog: boolean;
  showEditPolicyDialog: boolean;
  showDeletePolicyDialog: boolean;
  showViewPolicyDetailsDialog: boolean;
  showRenewPolicyDialog: boolean;
  showPolicyDetailsDialog: boolean;

  // Party type dialogs
  showCreatePartyTypeDialog: boolean;
  showEditPartyTypeDialog: boolean;
  showDeletePartyTypeDialog: boolean;
  showViewPartyTypeDetailsDialog: boolean;

  // Customer dialogs
  showCreateCustomerDialog: boolean;
  showEditCustomerDialog: boolean;
  showDeleteCustomerDialog: boolean;
  showCustomerDetailsDialog: boolean;
  showViewCustomerDetailsDialog: boolean;

  // Agent dialogs
  showCreateAgentDialog: boolean;
  showEditAgentDialog: boolean;
  showDeleteAgentDialog: boolean;
  showAgentDetailsDialog: boolean;
  showViewAgentDetailsDialog: boolean;

  // Region dialogs
  showCreateRegionDialog: boolean;
  showEditRegionDialog: boolean;
  showDeleteRegionDialog: boolean;
  showViewRegionDetailsDialog: boolean;

  // Branch dialogs
  showCreateBranchDialog: boolean;
  showEditBranchDialog: boolean;
  showDeleteBranchDialog: boolean;
  showViewBranchDetailsDialog: boolean;

  // Company dialogs (NEW)
  showCreateCompanyDialog: boolean;
  showEditCompanyDialog: boolean;
  showDeleteCompanyDialog: boolean;
  showViewCompanyDetailsDialog: boolean;

  // Quotation / Proposal / Quote dialogs (merged from File 1)
  showCreateProposalDialog: boolean;
  showEditProposalDialog: boolean;
  showDeleteProposalDialog: boolean;
  showViewProposalDetailsDialog: boolean;

  showCreateQuoteDialog: boolean;
  showEditQuoteDialog: boolean;
  showDeleteQuoteDialog: boolean;
  showViewQuoteDetailsDialog: boolean;

  showQuoteEditorDialog: boolean;
  showSectionEditorDialog: boolean;
  showConvertToPolicyDialog: boolean;

  // ... add any other dialogs here as needed
}

const initialState: UiState = {
  // Role dialogs
  showCreateRoleDialog: false,
  showEditRoleDialog: false,
  showDeleteRoleDialog: false,
  showViewRoleDetailsDialog: false,

  // Permission dialogs
  showCreatePermissionDialog: false,
  showEditPermissionDialog: false,
  showDeletePermissionDialog: false,
  showViewPermissionDetailsDialog: false,

  // User dialogs
  showCreateUserDialog: false,
  showEditUserDialog: false,
  showDeleteUserDialog: false,
  showViewUserDetailsDialog: false,
  showChangePasswordDialog: false,

  // Risk dialogs
  showCreateRiskDialog: false,
  showEditRiskDialog: false,
  showDeleteRiskDialog: false,
  showViewRiskDetailsDialog: false,

  // Sub Risk Section dialogs
  showCreateSubRiskSectionDialog: false,
  showEditSubRiskSectionDialog: false,
  showDeleteSubRiskSectionDialog: false,
  showViewSubRiskSectionDetailsDialog: false,

  // Customer dialogs
  showCreateCustomerDialog: false,
  showEditCustomerDialog: false,
  showDeleteCustomerDialog: false,
  showCustomerDetailsDialog: false,
  showViewCustomerDetailsDialog: false,

  // Agent dialogs
  showCreateAgentDialog: false,
  showEditAgentDialog: false,
  showDeleteAgentDialog: false,
  showAgentDetailsDialog: false,
  showViewAgentDetailsDialog: false,

  // Party type dialogs
  showCreatePartyTypeDialog: false,
  showEditPartyTypeDialog: false,
  showDeletePartyTypeDialog: false,
  showViewPartyTypeDetailsDialog: false,

  // Policy dialogs
  showCreatePolicyDialog: false,
  showEditPolicyDialog: false,
  showDeletePolicyDialog: false,
  showViewPolicyDetailsDialog: false,
  showRenewPolicyDialog: false,
  showPolicyDetailsDialog: false,

  // Product dialogs
  showCreateProductDialog: false,
  showEditProductDialog: false,
  showDeleteProductDialog: false,
  showViewProductDetailsDialog: false,

  // Region dialogs
  showCreateRegionDialog: false,
  showEditRegionDialog: false,
  showDeleteRegionDialog: false,
  showViewRegionDetailsDialog: false,

  // Branch dialogs
  showCreateBranchDialog: false,
  showEditBranchDialog: false,
  showDeleteBranchDialog: false,
  showViewBranchDetailsDialog: false,

  // Company dialogs (NEW)
  showCreateCompanyDialog: false,
  showEditCompanyDialog: false,
  showDeleteCompanyDialog: false,
  showViewCompanyDetailsDialog: false,

  // Quotation / Proposal / Quote dialogs (merged from File 1)
  showCreateProposalDialog: false,
  showEditProposalDialog: false,
  showDeleteProposalDialog: false,
  showViewProposalDetailsDialog: false,

  showCreateQuoteDialog: false,
  showEditQuoteDialog: false,
  showDeleteQuoteDialog: false,
  showViewQuoteDetailsDialog: false,

  showQuoteEditorDialog: false,
  showSectionEditorDialog: false,
  showConvertToPolicyDialog: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Role reducers
    setShowCreateRoleDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateRoleDialog = action.payload;
    },
    setShowEditRoleDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditRoleDialog = action.payload;
    },
    setShowDeleteRoleDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteRoleDialog = action.payload;
    },
    setShowViewRoleDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewRoleDetailsDialog = action.payload;
    },

    // Permission reducers
    setShowCreatePermissionDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreatePermissionDialog = action.payload;
    },
    setShowEditPermissionDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditPermissionDialog = action.payload;
    },
    setShowDeletePermissionDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeletePermissionDialog = action.payload;
    },
    setShowViewPermissionDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewPermissionDetailsDialog = action.payload;
    },

    // User reducers
    setShowCreateUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateUserDialog = action.payload;
    },
    setShowEditUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditUserDialog = action.payload;
    },
    setShowDeleteUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteUserDialog = action.payload;
    },
    setShowViewUserDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewUserDetailsDialog = action.payload;
    },
    setShowChangePasswordDialog: (state, action: PayloadAction<boolean>) => {
      state.showChangePasswordDialog = action.payload;
    },

    // Risk reducers
    setShowCreateRiskDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateRiskDialog = action.payload;
    },
    setShowEditRiskDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditRiskDialog = action.payload;
    },
    setShowDeleteRiskDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteRiskDialog = action.payload;
    },
    setShowViewRiskDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewRiskDetailsDialog = action.payload;
    },

    // Sub Risk Section reducers
    setShowCreateSubRiskSectionDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateSubRiskSectionDialog = action.payload;
    },
    setShowEditSubRiskSectionDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditSubRiskSectionDialog = action.payload;
    },
    setShowDeleteSubRiskSectionDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteSubRiskSectionDialog = action.payload;
    },
    setShowViewSubRiskSectionDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewSubRiskSectionDetailsDialog = action.payload;
    },

    // Product reducers
    setShowCreateProductDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateProductDialog = action.payload;
    },
    setShowEditProductDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditProductDialog = action.payload;
    },
    setShowDeleteProductDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteProductDialog = action.payload;
    },
    setShowViewProductDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewProductDetailsDialog = action.payload;
    },

    // Party type reducers
    setShowCreatePartyTypeDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreatePartyTypeDialog = action.payload;
    },
    setShowEditPartyTypeDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditPartyTypeDialog = action.payload;
    },
    setShowDeletePartyTypeDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeletePartyTypeDialog = action.payload;
    },
    setShowViewPartyTypeDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewPartyTypeDetailsDialog = action.payload;
    },

    // Policy reducers
    setShowCreatePolicyDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreatePolicyDialog = action.payload;
    },
    setShowEditPolicyDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditPolicyDialog = action.payload;
    },
    setShowDeletePolicyDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeletePolicyDialog = action.payload;
    },
    setShowRenewPolicyDialog: (state, action: PayloadAction<boolean>) => {
      state.showRenewPolicyDialog = action.payload;
    },
    setShowPolicyDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showPolicyDetailsDialog = action.payload;
    },
    // FIXED: correctly set the policy details view flag
    setShowViewPolicyDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewPolicyDetailsDialog = action.payload;
    },

    // Region reducers
    setShowCreateRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateRegionDialog = action.payload;
    },
    setShowEditRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditRegionDialog = action.payload;
    },
    setShowDeleteRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteRegionDialog = action.payload;
    },
    setShowViewRegionDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewRegionDetailsDialog = action.payload;
    },

    // Customer reducers
    setShowCreateCustomerDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateCustomerDialog = action.payload;
    },
    setShowEditCustomerDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditCustomerDialog = action.payload;
    },
    setShowDeleteCustomerDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteCustomerDialog = action.payload;
    },
    setShowCustomerDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showCustomerDetailsDialog = action.payload;
    },
    setShowViewCustomerDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewCustomerDetailsDialog = action.payload;
    },

    // Agent reducers
    setShowCreateAgentDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateAgentDialog = action.payload;
    },
    setShowEditAgentDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditAgentDialog = action.payload;
    },
    setShowDeleteAgentDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteAgentDialog = action.payload;
    },
    setShowAgentDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showAgentDetailsDialog = action.payload;
    },
    setShowViewAgentDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewAgentDetailsDialog = action.payload;
    },

    // Branch reducers
    setShowCreateBranchDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateBranchDialog = action.payload;
    },
    setShowEditBranchDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditBranchDialog = action.payload;
    },
    setShowDeleteBranchDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteBranchDialog = action.payload;
    },
    setShowViewBranchDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewBranchDetailsDialog = action.payload;
    },

    // ----------------------------
    // Company reducers (NEW)
    // ----------------------------
    setShowCreateCompanyDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateCompanyDialog = action.payload;
    },
    setShowEditCompanyDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditCompanyDialog = action.payload;
    },
    setShowDeleteCompanyDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteCompanyDialog = action.payload;
    },
    setShowViewCompanyDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewCompanyDetailsDialog = action.payload;
    },

    // ----------------------------
    // Quotation / Proposal / Quote reducers (from File 1)
    // ----------------------------
    setShowCreateProposalDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateProposalDialog = action.payload;
    },
    setShowEditProposalDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditProposalDialog = action.payload;
    },
    setShowDeleteProposalDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteProposalDialog = action.payload;
    },
    setShowViewProposalDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewProposalDetailsDialog = action.payload;
    },

    setShowCreateQuoteDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateQuoteDialog = action.payload;
    },
    setShowEditQuoteDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditQuoteDialog = action.payload;
    },
    setShowDeleteQuoteDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteQuoteDialog = action.payload;
    },
    setShowViewQuoteDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewQuoteDetailsDialog = action.payload;
    },

    setShowQuoteEditorDialog: (state, action: PayloadAction<boolean>) => {
      state.showQuoteEditorDialog = action.payload;
    },
    setShowSectionEditorDialog: (state, action: PayloadAction<boolean>) => {
      state.showSectionEditorDialog = action.payload;
    },
    setShowConvertToPolicyDialog: (state, action: PayloadAction<boolean>) => {
      state.showConvertToPolicyDialog = action.payload;
    },

    // ... add other reducers as needed
  },
});

export const {
  // role actions
  setShowCreateRoleDialog,
  setShowEditRoleDialog,
  setShowDeleteRoleDialog,
  setShowViewRoleDetailsDialog,

  // permission actions
  setShowCreatePermissionDialog,
  setShowEditPermissionDialog,
  setShowDeletePermissionDialog,
  setShowViewPermissionDetailsDialog,

  // user actions
  setShowCreateUserDialog,
  setShowEditUserDialog,
  setShowDeleteUserDialog,
  setShowViewUserDetailsDialog,
  setShowChangePasswordDialog,

  // risk actions
  setShowCreateRiskDialog,
  setShowEditRiskDialog,
  setShowDeleteRiskDialog,
  setShowViewRiskDetailsDialog,

  // sub-risk actions
  setShowCreateSubRiskSectionDialog,
  setShowEditSubRiskSectionDialog,
  setShowDeleteSubRiskSectionDialog,
  setShowViewSubRiskSectionDetailsDialog,

  // product actions
  setShowCreateProductDialog,
  setShowEditProductDialog,
  setShowDeleteProductDialog,
  setShowViewProductDetailsDialog,

  // customer actions
  setShowCreateCustomerDialog,
  setShowEditCustomerDialog,
  setShowDeleteCustomerDialog,
  setShowCustomerDetailsDialog,
  setShowViewCustomerDetailsDialog,

  // agent actions
  setShowCreateAgentDialog,
  setShowEditAgentDialog,
  setShowDeleteAgentDialog,
  setShowAgentDetailsDialog,
  setShowViewAgentDetailsDialog,

  // policy actions
  setShowCreatePolicyDialog,
  setShowEditPolicyDialog,
  setShowDeletePolicyDialog,
  setShowViewPolicyDetailsDialog,
  setShowRenewPolicyDialog,
  setShowPolicyDetailsDialog,

  // party type actions
  setShowCreatePartyTypeDialog,
  setShowEditPartyTypeDialog,
  setShowDeletePartyTypeDialog,
  setShowViewPartyTypeDetailsDialog,

  // region actions
  setShowCreateRegionDialog,
  setShowEditRegionDialog,
  setShowDeleteRegionDialog,
  setShowViewRegionDetailsDialog,

  // branch actions
  setShowCreateBranchDialog,
  setShowEditBranchDialog,
  setShowDeleteBranchDialog,
  setShowViewBranchDetailsDialog,

  // Company actions (NEW)
  setShowCreateCompanyDialog,
  setShowEditCompanyDialog,
  setShowDeleteCompanyDialog,
  setShowViewCompanyDetailsDialog,

  // Quotation / Proposal / Quote actions (from File 1)
  setShowCreateProposalDialog,
  setShowEditProposalDialog,
  setShowDeleteProposalDialog,
  setShowViewProposalDetailsDialog,

  setShowCreateQuoteDialog,
  setShowEditQuoteDialog,
  setShowDeleteQuoteDialog,
  setShowViewQuoteDetailsDialog,

  setShowQuoteEditorDialog,
  setShowSectionEditorDialog,
  setShowConvertToPolicyDialog,
} = uiSlice.actions;

export const selectUiState = (state: { ui: UiState }) => state.ui;

export default uiSlice.reducer;
