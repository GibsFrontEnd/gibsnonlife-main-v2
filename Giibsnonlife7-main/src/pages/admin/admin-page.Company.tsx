import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import CompanySettings from "@/components/admin/company-page/company.settings";
import CompanyBranches from "@/components/admin/company-page/company.branches";
import CompanyRegions from "@/components/admin/company-page/company.regions";
import CompanyUnitGroups from "@/components/admin/company-page/company.unit-groups";
import CompanyMarketingStaff from "@/components/admin/company-page/company.marketing-staff";
import CompanyBusinessSectors from "@/components/admin/company-page/company.business-sectors";
import CompanyAutoNumbers from "@/components/admin/company-page/company.auto-numbers";
import CompanyMailGroup from "@/components/admin/company-page/company.mail-group";
import PartyTypes from "../../components/admin/product-page/party/party.types";
import CompanyMarketingChannels from "@/components/admin/company-page/company.marketing-channels";

const tabs = [
  { title: "Branches", content: <CompanyBranches /> },
  { title: "Regions", content: <CompanyRegions /> },
  {title: "PartyTypes", content: <PartyTypes />},
  { title: "Marketing Staff", content: <CompanyMarketingStaff /> },
  { title: "Marketing Channels", content: <CompanyMarketingChannels /> },
  { title: "Units/Groups", content: <CompanyUnitGroups /> },
  { title: "Business Sectors", content: <CompanyBusinessSectors /> },
  { title: "Auto Numbers", content: <CompanyAutoNumbers /> },
  { title: "Mail Group", content: <CompanyMailGroup /> },
  { title: "Settings", content: <CompanySettings /> },
];

const AdminCompany = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.title);

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.title}
              value={tab.title}
              className="flex-1 min-w-[150px] hover:bg-neutral-200"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent value={tab.title}>{tab.content}</TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminCompany;
