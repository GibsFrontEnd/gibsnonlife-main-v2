import { useEffect } from "react";
import { Button } from "@/components/UI/new-button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  OutsideDismissDialog,
} from "@/components/UI/dialog";
import { Badge } from "@/components/UI/badge";
import { AlertTriangle } from "lucide-react";
import type { MktChannel as MarketingChannel } from "@/types/marketing-channels";
import { useToast } from "@/components/UI/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/use-apps";
import {
  clearMarketingChannelsMessages,
  deleteMktChannel,
  fetchMktChannels,
  selectMarketingChannels,
} from "@/features/reducers/companyReducers/marketingChannelSlice";

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: MarketingChannel | null;
}

export function DeleteChannelDialog({
  open,
  onOpenChange,
  channel,
}: DeleteChannelDialogProps) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  // const [loading, setLoading] = useState(false);
  const { loading, error, success } = useAppSelector(selectMarketingChannels);

  useEffect(() => {
    if (success.deleteMktChannel) {
      dispatch(clearMarketingChannelsMessages());
      toast({
        title: "Success",
        description: "Marketing Channel deleted successfully.",
      });
      onOpenChange(false);
      dispatch(fetchMktChannels());
    } else if (error.deleteMktChannel) {
      dispatch(clearMarketingChannelsMessages());
      toast({
        title: "Error",
        description: "Failed to delete channel. Please try again.",
        variant: "destructive",
      });
    }
  }, [success.deleteMktChannel, error.deleteMktChannel, toast, onOpenChange]);

  const handleConfirm = async () => {
    if (!channel) return;

    dispatch(deleteMktChannel(channel.channelID));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
    }
  };

  if (!channel) return null;

  return (
    <OutsideDismissDialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Marketing Channel</DialogTitle>
          </div>
          <div>
            This action cannot be undone. This will permanently delete the
            marketing channel and all associated data.
          </div>
        </DialogHeader>
        <div className="p-6 pt-0">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Channel ID:</span>
              <Badge variant="outline">{channel.channelID}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Channel Name:</span>
              <span className="text-sm">{channel.channelName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Branch:</span>
              <span className="text-sm">{channel.branchName}</span>
            </div>
            {channel.subChannels.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sub Channels:</span>
                <Badge variant="secondary">
                  {channel.subChannels.length} sub-channel
                  {channel.subChannels.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            )}
          </div>
          {channel.subChannels.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Warning:</strong> This will also delete all{" "}
              {channel.subChannels.length} sub-channel
              {channel.subChannels.length !== 1 ? "s" : ""} associated with this
              channel.
            </p>
          )}
        </div>
        <div className="w-full flex gap-4 pb-6 px-6">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)} //@ts-ignore
            disabled={loading.deleteMktChannel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={handleConfirm}
            loading={loading.deleteMktChannel}
          >
            Delete Channel
          </Button>
        </div>
      </DialogContent>
    </OutsideDismissDialog>
  );
}
