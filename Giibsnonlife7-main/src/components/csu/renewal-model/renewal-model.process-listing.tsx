//@ts-nocheck
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRisks } from "@/features/reducers/adminReducers/riskSlice";
import type { AppDispatch, RootState } from "@/features/store";
import { Button } from "@/components/UI/new-button";
import { Label } from "@/components/UI/label";

const ProcessRenewalListing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { risks } = useSelector((s: RootState) => s.risks);

  const [period1, setPeriod1] = useState("");
  const [period2, setPeriod2] = useState("");
  const [classOfBusiness, setClassOfBusiness] = useState("");

  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any);
  }, [dispatch]);

  // Set default dates (current month to next year same month)
  useEffect(() => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    setPeriod1(today.toISOString().split("T")[0]);
    setPeriod2(nextYear.toISOString().split("T")[0]);
  }, []);

  const handleClickHereToStart = () => {
    // Process the renewal listing
    console.log({ period1, period2, classOfBusiness });
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-800 to-purple-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white text-green-700 rounded-full text-sm font-bold shadow-md">
              i
            </div>
            <h2 className="text-xl font-bold text-white">
              Process Month Batch Renewal Listing
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Info Section */}
            <div className="lg:w-[320px] bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0 mt-0.5">
                  i
                </div>
                <div>
                  <h3 className="text-base font-semibold text-blue-900 mb-2">
                    Next Month Processing Info
                  </h3>
                  <p className="text-sm text-blue-800 mb-2">
                    Please select the month range for the Batch month Renewal.
                  </p>
                  <p className="text-sm text-blue-700">
                    Select the next month to be processed and ensure you run
                    this process once.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex-1">
              <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Period 1 Of Month
                    </Label>
                    <input
                      type="date"
                      value={period1}
                      onChange={(e) => setPeriod1(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Period 2 Of Month
                    </Label>
                    <input
                      type="date"
                      value={period2}
                      onChange={(e) => setPeriod2(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Class Of Business
                    </Label>
                    <select
                      value={classOfBusiness}
                      onChange={(e) => setClassOfBusiness(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="">- select -</option>
                      {risks &&
                        risks.map((risk) => (
                          <option key={risk.riskID} value={risk.riskID}>
                            {risk.riskName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-start">
                  <Button
                    onClick={handleClickHereToStart}
                    className="px-8 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <span>▶</span>
                    <span>Click Here To Start</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessRenewalListing;
