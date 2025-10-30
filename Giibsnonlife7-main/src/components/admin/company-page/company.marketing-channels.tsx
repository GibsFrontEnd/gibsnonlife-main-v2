import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Button } from "@/components/UI/new-button";
import {
  fetchMktChannels,
  selectMarketingChannels,
} from "@/features/reducers/companyReducers/marketingChannelSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/use-apps";
import type { MktChannel } from "@/types/marketing-channels";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { MarketingChannelsTable } from "./marketing-channels/marketing-channel-table";
import { CreateChannelDialog } from "./marketing-channels/create-channel-dialog";
import { EditChannelDialog } from "./marketing-channels/edit-channel-dialog";
import { DeleteChannelDialog } from "./marketing-channels/delete-channel.dialog";

const CompanyMarketingChannels = () => {
  const dispatch = useAppDispatch();
  const { mktChannels, loading, error } = useAppSelector(
    selectMarketingChannels
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<MktChannel | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchMktChannels());
  }, [dispatch]);

  const handleEdit = (channel: MktChannel) => {
    setSelectedChannel(channel);
    setEditDialogOpen(true);
  };

  const handleDelete = (channel: MktChannel) => {
    setSelectedChannel(channel);
    setDeleteDialogOpen(true);
  };

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = mktChannels ? Math.ceil(mktChannels.length / pageSize) : 0;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentMktChannels = [...mktChannels]?.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // if (loading.fetchMktChannels) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <div className="flex items-center justify-center h-64">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  //           <p className="text-muted-foreground">
  //             Loading marketing channel...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (error.fetchMktChannels) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Data
            </CardTitle>
            <CardDescription>
              Failed to load marketing channel. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 mb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Marketing Channels
              </CardTitle>
              <CardDescription>
                Manage your marketing channels and their configurations
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MarketingChannelsTable
            channels={currentMktChannels}
            loading={loading.fetchMktChannels}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefresh={() => dispatch(fetchMktChannels())}
          />
        </CardContent>
      </Card>

      {currentMktChannels && totalPages > 1 && (
        <div className="border-t border-blue-100 p-4 bg-blue-50/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 order-2 sm:order-1">
              Page{" "}
              <span className="font-medium text-blue-600">{currentPage}</span>{" "}
              of <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)} // @ts-ignore
                disabled={currentPage === 1 || loading.fetchMktChannels}
                className="hidden sm:flex h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)} // @ts-ignore
                disabled={currentPage === 1 || loading.fetchMktChannels}
                className="h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from(
                  {
                    length: Math.min(
                      window.innerWidth < 640 ? 3 : 5,
                      totalPages
                    ),
                  },
                  (_, i) => {
                    let pageNum: number;
                    const maxVisible = window.innerWidth < 640 ? 3 : 5;
                    if (totalPages <= maxVisible) {
                      pageNum = i + 1;
                    } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                      pageNum = i + 1;
                    } else if (
                      currentPage >=
                      totalPages - Math.floor(maxVisible / 2)
                    ) {
                      pageNum = totalPages - maxVisible + 1 + i;
                    } else {
                      pageNum = currentPage - Math.floor(maxVisible / 2) + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => goToPage(pageNum)} // @ts-ignore
                        disabled={loading.fetchMktChannels}
                        className={`h-8 w-8 p-0 text-xs sm:text-sm ${
                          currentPage === pageNum
                            ? "bg-blue-900 hover:bg-blue-900"
                            : "border-blue-900 text-blue-900 hover:bg-blue-50"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>
              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)} // @ts-ignore
                disabled={
                  currentPage === totalPages || loading.fetchMktChannels
                }
                className="h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)} // @ts-ignore
                disabled={
                  currentPage === totalPages || loading.fetchMktChannels
                }
                className="hidden sm:flex h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreateChannelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditChannelDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        channel={selectedChannel}
      />

      <DeleteChannelDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        channel={selectedChannel}
      />
    </div>
  );
};

export default CompanyMarketingChannels;
