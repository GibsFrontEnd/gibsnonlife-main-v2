import { useEffect, useState } from "react";
import Quotes from "../../components/quotations/quotes/quotations.quotes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { getAllRisks } from "../../features/reducers/adminReducers/riskSlice";
import { AppDispatch, RootState } from "@/features/store";
import { useDispatch, useSelector } from "react-redux";
import {useParams } from "react-router-dom"




const QuoteQuotations = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { risks } = useSelector((state: RootState) => state.risks)
  const { businessId: businessIdParam } = useParams<{ businessId?: string }>()
  const businessId = businessIdParam ?? null

  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any)
  }, [dispatch])
  
  
// get a single tab object based on businessId (or "All" if none / not found)
const tabs = (() => {
  if (!businessId) {
    return { title: "All", content: <Quotes businessId={null} /> };
  }

  const risk = risks.find(r => String(r.riskID) === String(businessId));
  if (risk) {
    return { title: risk.riskName, content: <Quotes businessId={risk.riskID} /> };
  }

  if (businessId =="Package") {
    return { title: "Package", content: <Quotes businessId={"Package"} /> };
  }

  // fallback if param doesn't match any risk
  return { title: "All", content: <Quotes businessId={null} /> };
})();

  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)

  // ✅ Whenever risks change, update the default active tab
  useEffect(() => {
    if (tabs) {
      setActiveTab(tabs.title)
    }
  }, [tabs, activeTab])
  return (
    <div className="max-w-[1200px] mx-auto mb-10">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-[#111827] m-0">Quotes</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap">
            <TabsTrigger
              key={tabs.title}
              value={tabs.title}
              className="flex-1 min-w-[100px] hover:bg-neutral-200"
            >
              {tabs.title}
            </TabsTrigger>
        </TabsList>

          <TabsContent key={tabs.title} value={tabs.title}>
            {tabs.content}
          </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteQuotations;

