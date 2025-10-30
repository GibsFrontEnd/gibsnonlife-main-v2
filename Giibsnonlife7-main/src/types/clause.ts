export interface Clause {
  id: number
  policyNo: string
  headerID: number
  clauseID: string
  subheader1: string
  subheader2: string
  details: string
  certNo: string | null
  remarks: string | null
  tag: string | null
}

export interface ClauseOption {
  memoID: number
  subRiskCode: string
  header: string
}

export interface CreateClauseRequest {
  policyNo: string
  headerID: number
  clauseID: string
  subheader1: string
  subheader2: string
  details: string
  certNo: string
  remarks: string
  tag: string
}

export interface UpdateClauseRequest {
  id: number
  policyNo: string
  headerID: number
  clauseID: string
  subheader1: string
  subheader2: string
  details: string
  certNo: string
  remarks: string
  tag: string
}

export interface ClauseState {
  clauses: Clause[]
  clauseOptions: ClauseOption[]
  currentClause: Clause | null
  loading: {
    fetchClauses: boolean
    fetchClauseOptions: boolean
    createClauses: boolean
    updateClause: boolean
    deleteClause: boolean
  }
  success: {
    createClauses: boolean
    updateClause: boolean
    deleteClause: boolean
  }
  error: {
    fetchClauses: string | null
    fetchClauseOptions: string | null
    createClauses: string | null
    updateClause: string | null
    deleteClause: string | null
  }
}
