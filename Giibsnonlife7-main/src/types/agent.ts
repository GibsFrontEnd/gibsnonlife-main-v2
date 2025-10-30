export interface Agent {
  partyID: string
  stateID: string | null
  party: string | null
  description: string | null
  partyType: string | null
  address: string | null
  mobilePhone: string | null
  landPhone: string | null
  email: string | null
  fax: string | null
  insContact: string | null
  finContact: string | null
  creditLimit: number | null
  comRate: number | null
  startDate: string | null
  expiryDate: string | null
  remarks: string | null
  tag: string | null
  deleted: number
  active: number
  submittedBy: string | null
  submittedOn: string | null
  modifiedBy: string | null
  modifiedOn: string | null
  z_NAICOM_ID: string | null
}

export interface CreateAgentRequest {
  PartyID: string
  StateID: string
  Party: string
  Description: string
  PartyType: string
  Address: string
  mobilePhone: string
  LandPhone: string
  Email: string
  Fax: string
  InsContact: string
  FinContact: string
  CreditLimit: number
  ComRate: number
  StartDate: string
  ExpiryDate: string
  Remarks: string
  Tag: string
  Deleted: number
  Active: number
  SubmittedBy: string
  ModifiedBy: string
  Z_NAICOM_ID: string
}

export interface AgentPaginationResponse {
  data: Agent[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface AgentState {
  agents: Agent[]
  currentAgent: Agent | null
  pagination: {
    pageNumber: number
    pageSize: number
    totalRecords: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  loading: {
    getAllAgents: boolean
    getAgent: boolean
    createAgent: boolean
    updateAgent: boolean
    deleteAgent: boolean
  }
  error: {
    getAllAgents: string | null
    getAgent: string | null
    createAgent: string | null
    updateAgent: string | null
    deleteAgent: string | null
  }
  success: {
    createAgent: boolean
    updateAgent: boolean
    deleteAgent: boolean
  }
}
