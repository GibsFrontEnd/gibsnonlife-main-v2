import type {
  CreateMktChannelRequest,
  MarketingChannelsState,
  MktChannel,
  UpdateMktChannelRequest,
} from "@/types/marketing-channels";
import apiCall from "@/utils/api-call";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchMktChannels = createAsyncThunk(
  "marketingChannels/fetchMktChannels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiCall.get<MktChannel[]>("/MktChannels");
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchMktChannel = createAsyncThunk(
  "marketingChannels/fetchMktChannel",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiCall.get<MktChannel>(`/MktChannels/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createMktChannel = createAsyncThunk(
  "marketingChannels/createMktChannel",
  async (body: CreateMktChannelRequest, { rejectWithValue }) => {
    try {
      const response = await apiCall.post<MktChannel>("/MktChannels", body);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateMktChannel = createAsyncThunk(
  "marketingChannels/updateMktChannel",
  async (
    { id, data }: { id: string; data: UpdateMktChannelRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiCall.put(`/MktChannels/${id}`, data);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteMktChannel = createAsyncThunk(
  "marketingChannels/deleteMktChannel",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiCall.delete(`/MktChannels/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState: MarketingChannelsState = {
  mktChannels: [],
  selectedMktChannel: null,

  loading: {
    fetchMktChannels: false,
    fetchMktChannel: false,
    createMktChannel: false,
    updateMktChannel: false,
    deleteMktChannel: false,
  },
  
  error: {
    fetchMktChannels: null,
    fetchMktChannel: null,
    createMktChannel: null,
    updateMktChannel: null,
    deleteMktChannel: null,
  },

  success: {
    createMktChannel: false,
    updateMktChannel: false,
    deleteMktChannel: false,
  },
};

const marketingChannelsSlice = createSlice({
  name: "marketingChannels",
  initialState,
  reducers: {
    clearMarketingChannelsMessages: (state) => {
      state.error = { ...initialState.error };
      state.success = { ...initialState.success };
    },
    clearSelectedMktChannel: (state) => {
      state.selectedMktChannel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Marketing Channels
      .addCase(fetchMktChannels.pending, (state) => {
        state.loading.fetchMktChannels = true;
        state.error.fetchMktChannels = null;
      })
      .addCase(fetchMktChannels.fulfilled, (state, action) => {
        state.loading.fetchMktChannels = false;
        state.mktChannels = action.payload;
      })
      .addCase(fetchMktChannels.rejected, (state, action) => {
        state.loading.fetchMktChannels = false;
        state.error.fetchMktChannels = action.payload;
      })

      // Fetch Single Marketing Channel
      .addCase(fetchMktChannel.pending, (state) => {
        state.loading.fetchMktChannel = true;
        state.error.fetchMktChannel = null;
        state.selectedMktChannel = null;
      })
      .addCase(fetchMktChannel.fulfilled, (state, action) => {
        state.loading.fetchMktChannel = false;
        state.selectedMktChannel = action.payload;
      })
      .addCase(fetchMktChannel.rejected, (state, action) => {
        state.loading.fetchMktChannel = false;
        state.error.fetchMktChannel = action.payload;
      })

      // Create Marketing Channel
      .addCase(createMktChannel.pending, (state) => {
        state.loading.createMktChannel = true;
        state.error.createMktChannel = null;
      })
      .addCase(createMktChannel.fulfilled, (state, action) => {
        state.loading.createMktChannel = false;
        state.mktChannels.push(action.payload);
        state.success.createMktChannel = true;
      })
      .addCase(createMktChannel.rejected, (state, action) => {
        state.loading.createMktChannel = false;
        state.error.createMktChannel = action.payload;
      })

      // Update Marketing Channel
      .addCase(updateMktChannel.pending, (state) => {
        state.loading.updateMktChannel = true;
        state.error.updateMktChannel = null;
      })
      .addCase(updateMktChannel.fulfilled, (state, action) => {
        state.loading.updateMktChannel = false;
        const { id } = action.payload;
        const index = state.mktChannels.findIndex((channel) => channel.channelID === id);
        if (index !== -1) {
          // Update the channel in the list with the updated data
          const updatedChannel = { ...state.mktChannels[index], ...action.payload.data };
          state.mktChannels[index] = updatedChannel;
        }
        // Update selected channel if it's the same one being updated
        if (state.selectedMktChannel && state.selectedMktChannel.channelID === id) {
          state.selectedMktChannel = { ...state.selectedMktChannel, ...action.payload.data };
        }
        state.success.updateMktChannel = true;
      })
      .addCase(updateMktChannel.rejected, (state, action) => {
        state.loading.updateMktChannel = false;
        state.error.updateMktChannel = action.payload;
      })

      // Delete Marketing Channel
      .addCase(deleteMktChannel.pending, (state) => {
        state.loading.deleteMktChannel = true;
        state.error.deleteMktChannel = null;
      })
      .addCase(deleteMktChannel.fulfilled, (state, action) => {
        state.loading.deleteMktChannel = false;
        const { id } = action.payload;
        state.mktChannels = state.mktChannels.filter((channel) => channel.channelID !== id);
        // Clear selected channel if it was the one being deleted
        if (state.selectedMktChannel && state.selectedMktChannel.channelID === id) {
          state.selectedMktChannel = null;
        }
        state.success.deleteMktChannel = true;
      })
      .addCase(deleteMktChannel.rejected, (state, action) => {
        state.loading.deleteMktChannel = false;
        state.error.deleteMktChannel = action.payload;
      });
  },
});

export const { clearMarketingChannelsMessages, clearSelectedMktChannel } = 
  marketingChannelsSlice.actions;

export const selectMarketingChannels = (state: {
  marketingChannels: MarketingChannelsState;
}) => state.marketingChannels;

export default marketingChannelsSlice.reducer;