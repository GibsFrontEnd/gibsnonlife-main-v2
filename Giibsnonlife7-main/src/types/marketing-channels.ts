export interface SubChannel {
  channelID: string;
  subChannelID: string;
  subChannelName: string;
  description: string;
}

export interface MktChannel {
  branchID: string;
  channelID: string;
  channelName: string;
  branchName: string;
  subChannels: SubChannel[];
}

export interface CreateMktChannelRequest {
  channelID: string;
  channelName: string;
  branchID: string;
}

export interface UpdateMktChannelRequest {
  channelName: string;
  branchID: string;
}

export interface MarketingChannelsState {
  mktChannels: MktChannel[];
  selectedMktChannel: MktChannel | null;

  loading: {
    fetchMktChannels: boolean;
    fetchMktChannel: boolean;
    createMktChannel: boolean;
    updateMktChannel: boolean;
    deleteMktChannel: boolean;
  };

  error: {
    fetchMktChannels: unknown;
    fetchMktChannel: unknown;
    createMktChannel: unknown;
    updateMktChannel: unknown;
    deleteMktChannel: unknown;
  };

  success: {
    createMktChannel: boolean;
    updateMktChannel: boolean;
    deleteMktChannel: boolean;
  };
}