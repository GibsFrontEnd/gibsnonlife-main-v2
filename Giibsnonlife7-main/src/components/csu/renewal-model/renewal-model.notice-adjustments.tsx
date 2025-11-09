//@ts-nocheck
import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/UI/new-button";
import { Input as NewInput } from "@/components/UI/new-input";
import { Checkbox } from "@/components/UI/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/UI/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/new-select";
import "../../quotations/quotes/Quotations.css";

type RenewalRecord = {
  policyNo: string;
  processDate: string;
  insured: string;
  renewalDate: string;
  sumInsured: number;
  grossPremium: number;
  broker: string;
  status: "PENDING" | "SENT" | "APPROVED";
};

const renewalRecords: RenewalRecord[] = [
  {
    policyNo: "FIR-2025-0001",
    processDate: "2025-11-05",
    insured: "Adetola Ventures Ltd",
    renewalDate: "2026-11-05",
    sumInsured: 120000000,
    grossPremium: 2305000,
    broker: "Alpha Brokers",
    status: "PENDING",
  },
  {
    policyNo: "FIR-2025-0002",
    processDate: "2025-11-06",
    insured: "Simeon & Sons",
    renewalDate: "2026-11-06",
    sumInsured: 85000000,
    grossPremium: 1250000,
    broker: "Unity Brokers",
    status: "SENT",
  },
  {
    policyNo: "FIR-2025-0003",
    processDate: "2025-11-07",
    insured: "Kendall Manufacturing",
    renewalDate: "2026-11-07",
    sumInsured: 265000000,
    grossPremium: 4425000,
    broker: "Lagoon Insurance Brokers",
    status: "APPROVED",
  },
];

const statusBadges: Record<RenewalRecord["status"], string> = {
  PENDING: "qtns-status-pending",
  SENT: "qtns-status-calculated",
  APPROVED: "qtns-status-converted",
};

const RenewalNoticeAdjustments = () => {
  const [searchFilter, setSearchFilter] = useState(false);
  const [criteria, setCriteria] = useState({
    searchField: "policyNo",
    searchValue: "",
    startDate: "",
    endDate: "",
    status: "all",
  });
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  const filteredRecords = useMemo(() => {
    return renewalRecords.filter((record) => {
      const matchesSearch = (() => {
        if (!criteria.searchValue.trim()) return true;
        const value = criteria.searchValue.toLowerCase();
        const fieldValue = (record as any)[criteria.searchField] ?? "";
        return String(fieldValue).toLowerCase().includes(value);
      })();

      const processDate = new Date(record.processDate);
      const afterStart = criteria.startDate
        ? processDate >= new Date(criteria.startDate)
        : true;
      const beforeEnd = criteria.endDate
        ? processDate <= new Date(criteria.endDate)
        : true;

      const matchesStatus =
        criteria.status === "all" || record.status === criteria.status;

      return matchesSearch && afterStart && beforeEnd && matchesStatus;
    });
  }, [criteria]);

  const allDisplayedSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((record) =>
      selectedPolicies.includes(record.policyNo)
    );

  const toggleSelectPolicy = (policyNo: string, shouldSelect: boolean) => {
    setSelectedPolicies((prev) => {
      if (shouldSelect) {
        return prev.includes(policyNo) ? prev : [...prev, policyNo];
      }
      return prev.filter((existing) => existing !== policyNo);
    });
  };

  const toggleSelectAll = (shouldSelect: boolean) => {
    if (shouldSelect) {
      setSelectedPolicies(filteredRecords.map((record) => record.policyNo));
      return;
    }
    setSelectedPolicies([]);
  };

  const handleClearFilters = () => {
    setCriteria({
      searchField: "policyNo",
      searchValue: "",
      startDate: "",
      endDate: "",
      status: "all",
    });
    setSelectedPolicies([]);
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="qtns-container">
      <div className="qtns-header">
        <h1>Renewal Notice Adjustments</h1>
      </div>

      <div className="qtns-controls">
        <Collapsible open={searchFilter} onOpenChange={setSearchFilter}>
          <div className="border rounded-lg mb-2 bg-gray-50">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Search Filter</span>
                </div>
                <Checkbox checked={searchFilter} />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Where
                    </label>
                    <Select
                      value={criteria.searchField}
                      onValueChange={(value) =>
                        setCriteria((prev) => ({
                          ...prev,
                          searchField: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policyNo">Policy No</SelectItem>
                        <SelectItem value="insured">Insured</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="text-sm text-gray-600 mb-1 block">
                      Contains
                    </label>
                    <NewInput
                      value={criteria.searchValue}
                      onChange={(e) =>
                        setCriteria((prev) => ({
                          ...prev,
                          searchValue: e.target.value,
                        }))
                      }
                      placeholder="Enter search value"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Between (From)
                    </label>
                    <NewInput
                      type="date"
                      value={criteria.startDate}
                      onChange={(e) =>
                        setCriteria((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      And (To)
                    </label>
                    <NewInput
                      type="date"
                      value={criteria.endDate}
                      onChange={(e) =>
                        setCriteria((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Status
                    </label>
                    <Select
                      value={criteria.status}
                      onValueChange={(value) =>
                        setCriteria((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="SENT">View Notice Sent</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Button
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
                    onClick={() => setCriteria((prev) => ({ ...prev }))}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      <div className="qtns-table-container">
        {selectedPolicies.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {selectedPolicies.length} selected
            </span>
            <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
              Approve Selected
            </Button>
          </div>
        )}

        {filteredRecords.length === 0 ? (
          <div className="qtns-no-proposals">
            <p>No renewal notices found for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-4 w-12">
                    <Checkbox
                      checked={allDisplayedSelected}
                      onCheckedChange={(value) =>
                        toggleSelectAll(value === true)
                      }
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Policy No
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Process Date
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Insured
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Renewal Date
                  </th>
                  <th className="text-right p-4 font-semibold text-sm">
                    Sum Insured
                  </th>
                  <th className="text-right p-4 font-semibold text-sm">
                    Gross Premium
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Broker
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Status
                  </th>
                  <th className="text-center p-4 font-semibold text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.policyNo}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedPolicies.includes(record.policyNo)}
                        onCheckedChange={(value) =>
                          toggleSelectPolicy(record.policyNo, value === true)
                        }
                        aria-label={`Select policy ${record.policyNo}`}
                      />
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {record.policyNo}
                    </td>
                    <td className="p-4 text-sm">
                      {formatDate(record.processDate)}
                    </td>
                    <td className="p-4 text-sm">{record.insured}</td>
                    <td className="p-4 text-sm">
                      {formatDate(record.renewalDate)}
                    </td>
                    <td className="p-4 text-sm text-right font-medium">
                      {formatCurrency(record.sumInsured)}
                    </td>
                    <td className="p-4 text-sm text-right font-medium">
                      {formatCurrency(record.grossPremium)}
                    </td>
                    <td className="p-4 text-sm">{record.broker}</td>
                    <td className="p-4 text-sm">
                      <span
                        className={`qtns-status-badge ${
                          statusBadges[record.status]
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex justify-center gap-2 flex-nowrap">
                        <Button
                          size="sm"
                          className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white"
                        >
                          Alternate Email
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#0F766E] hover:bg-[#0D9488] text-white"
                        >
                          Edit Renewal
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                        >
                          View Notice
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                        >
                          Send Mail
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewalNoticeAdjustments;
