import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../store"
import type { Customer, CustomerState, CreateCustomerRequest, CustomerPolicy } from "../../../types/customer"
import { decryptData } from "../../../utils/encrypt-utils";


const API_BASE_URL = "https://core-api.newgibsonline.com/api";

// You'll need to get this token from your auth system
const getAuthToken = () => {
  try {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;
    return decryptData(encryptedToken);
  } catch (err) {
    console.warn("Failed to get token", err);
    return null;
  }
};

// Async thunks
interface GetCustomersParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  insuredType?:string;
}

export const getAllCustomers = createAsyncThunk<
  Customer[],
  GetCustomersParams | undefined,
  { rejectValue: string }
>(
  "customers/getAllCustomers",
  async (params = {} as GetCustomersParams, { rejectWithValue }) => {
        try {
const AUTH_TOKEN = getAuthToken();

      const { pageNumber=1, pageSize=20, searchTerm="" ,insuredType=""} = params;

      const query = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        searchTerm,
        insuredType,
      }).toString();
console.log(`${API_BASE_URL}/customers?${query}`);

      const response = await fetch(`${API_BASE_URL}/customers?${query}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + AUTH_TOKEN,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data);

      return data.data as Customer[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch customers"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData: CreateCustomerRequest, { rejectWithValue }) => {
        try {
const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as Customer
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create customer")
    }
  },
)

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async (
    { customerID, customerData }: { customerID: string; customerData: CreateCustomerRequest },
    { rejectWithValue },
  ) => {
        try {
const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/customers/${customerID}`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { customerID, customerData: data as Customer }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update customer")
    }
  },
)

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (customerID: string, { rejectWithValue }) => {
        try {
const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/customers/${customerID}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: AUTH_TOKEN,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return customerID
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete customer")
    }
  },
)

export const getCustomerPolicies = createAsyncThunk(
  "customers/getCustomerPolicies",
  async (customerID: string, { rejectWithValue }) => {
        try {
const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/customers/${customerID}/policies`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: AUTH_TOKEN,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as CustomerPolicy[]
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch customer policies")
    }
  },
)

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  customerPolicies: [],
  loading: {
    getAllCustomers: false,
    createCustomer: false,
    updateCustomer: false,
    deleteCustomer: false,
    getCustomerPolicies: false,
  },
  error: {
    getAllCustomers: null,
    createCustomer: null,
    updateCustomer: null,
    deleteCustomer: null,
    getCustomerPolicies: null,
  },
  success: {
    createCustomer: false,
    updateCustomer: false,
    deleteCustomer: false,
  },
}

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload
    },
    clearMessages: (state) => {
      state.error = {
        getAllCustomers: null,
        createCustomer: null,
        updateCustomer: null,
        deleteCustomer: null,
        getCustomerPolicies: null,
      }
      state.success = {
        createCustomer: false,
        updateCustomer: false,
        deleteCustomer: false,
      }
    },
  },
  extraReducers: (builder) => {
    // Get all customers
    builder
      .addCase(getAllCustomers.pending, (state) => {
        state.loading.getAllCustomers = true
        state.error.getAllCustomers = null
      })
      .addCase(getAllCustomers.fulfilled, (state, action) => {
        state.loading.getAllCustomers = false
        state.customers = action.payload
      })
      .addCase(getAllCustomers.rejected, (state, action) => {
        state.loading.getAllCustomers = false
        state.error.getAllCustomers = action.payload as string
      })

    // Create customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading.createCustomer = true
        state.error.createCustomer = null
        state.success.createCustomer = false
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading.createCustomer = false
        state.success.createCustomer = true
        state.customers.unshift(action.payload)
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading.createCustomer = false
        state.error.createCustomer = action.payload as string
      })

    // Update customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.loading.updateCustomer = true
        state.error.updateCustomer = null
        state.success.updateCustomer = false
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading.updateCustomer = false
        state.success.updateCustomer = true
        const index = state.customers.findIndex((c) => c.insuredID === action.payload.customerID)
        if (index !== -1) {
          state.customers[index] = action.payload.customerData
        }
        if (state.currentCustomer?.insuredID === action.payload.customerID) {
          state.currentCustomer = action.payload.customerData
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading.updateCustomer = false
        state.error.updateCustomer = action.payload as string
      })

    // Delete customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.loading.deleteCustomer = true
        state.error.deleteCustomer = null
        state.success.deleteCustomer = false
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading.deleteCustomer = false
        state.success.deleteCustomer = true
        state.customers = state.customers.filter((c) => c.insuredID !== action.payload)
        if (state.currentCustomer?.insuredID === action.payload) {
          state.currentCustomer = null
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading.deleteCustomer = false
        state.error.deleteCustomer = action.payload as string
      })

    // Get customer policies
    builder
      .addCase(getCustomerPolicies.pending, (state) => {
        state.loading.getCustomerPolicies = true
        state.error.getCustomerPolicies = null
      })
      .addCase(getCustomerPolicies.fulfilled, (state, action) => {
        state.loading.getCustomerPolicies = false
        state.customerPolicies = action.payload
      })
      .addCase(getCustomerPolicies.rejected, (state, action) => {
        state.loading.getCustomerPolicies = false
        state.error.getCustomerPolicies = action.payload as string
      })
  },
})

export const { setCurrentCustomer, clearMessages } = customerSlice.actions

export const selectCustomers = (state: RootState) => state.customers

export default customerSlice.reducer
