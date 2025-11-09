import { useState } from "react";
import ProcessRenewalListing from "@/components/csu/renewal-model/renewal-model.process-listing";
import RenewalNoticeAdjustments from "@/components/csu/renewal-model/renewal-model.notice-adjustments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";

const tabs = [
  { title: "Process Renewal Listing", content: <ProcessRenewalListing /> },
  {
    title: "Renewal Notice Adjustments",
    content: <RenewalNoticeAdjustments />,
  },
];

const CSURenewalModel = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.title);

  return (
    <div className="max-w-[1200px] mx-auto my-0">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-[#111827] m-0">
          Renewal Model
        </h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.title}
              value={tab.title}
              className="flex-1 min-w-[100px] hover:bg-neutral-200"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.title} value={tab.title}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CSURenewalModel;
