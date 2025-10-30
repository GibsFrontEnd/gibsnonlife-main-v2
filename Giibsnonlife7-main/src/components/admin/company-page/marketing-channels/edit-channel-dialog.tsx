import { useState, useEffect } from "react";
import { Button } from "@/components/UI/new-button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  OutsideDismissDialog,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/new-input";
import { Label } from "@/components/UI/label";
import type {
  MktChannel as MarketingChannel,
  UpdateMktChannelRequest,
} from "@/types/marketing-channels";
import { useToast } from "@/components/UI/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/use-apps";
import {
  clearMarketingChannelsMessages,
  fetchMktChannels,
  selectMarketingChannels,
  updateMktChannel,
} from "@/features/reducers/companyReducers/marketingChannelSlice";

interface EditChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: MarketingChannel | null;
}

export function EditChannelDialog({
  open,
  onOpenChange,
  channel,
}: EditChannelDialogProps) {
  const [formData, setFormData] = useState<UpdateMktChannelRequest>({
    channelName: "",
    branchID: "",
  });
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  // const [loading, setLoading] = useState(false);
  const { loading, error, success } = useAppSelector(selectMarketingChannels);

  useEffect(() => {
    if (channel) {
      setFormData({
        channelName: channel.channelName,
        branchID: channel.branchID,
      });
    }
  }, [channel]);

  useEffect(() => {
    if (success.updateMktChannel) {
      dispatch(clearMarketingChannelsMessages());
      toast({
        title: "Success",
        description: "Marketing Channel edited successfully.",
      });
      onOpenChange(false);
      dispatch(fetchMktChannels());
      setFormData({ channelName: "", branchID: "" });
    } else if (error.updateMktChannel) {
      dispatch(clearMarketingChannelsMessages());
      toast({
        title: "Error",
        description: "Failed to edit channel. Please try again.",
        variant: "destructive",
      });
    }
  }, [success.updateMktChannel, error.updateMktChannel, toast, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel || !formData.channelName || !formData.branchID) {
      return;
    }

    dispatch(updateMktChannel({ id: channel.channelID, data: formData }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading.updateMktChannel) {
      onOpenChange(newOpen);
    }
  };

  if (!channel) return null;

  return (
    <OutsideDismissDialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Edit Marketing Channel</DialogTitle>
          <div>
            Update the marketing channel information. Channel ID cannot be
            changed.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 pt-0">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-channelID">Channel ID</Label>
              <Input
                id="edit-channelID"
                value={channel.channelID}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Channel ID cannot be modified
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-channelName">Channel Name</Label>
              <Input
                id="edit-channelName"
                value={formData.channelName}
                onChange={(e) =>
                  setFormData({ ...formData, channelName: e.target.value })
                }
                placeholder="Enter channel name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-branchID">Branch ID</Label>
              <Input
                id="edit-branchID"
                value={formData.branchID}
                onChange={(e) =>
                  setFormData({ ...formData, branchID: e.target.value })
                }
                placeholder="Enter branch ID"
                required
              />
            </div>
          </div>
          <div className="w-full flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)} //@ts-ignore
              disabled={loading.updateMktChannel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              // @ts-ignore
              type="submit"
              disabled={loading.updateMktChannel}
            >
              Update Channel
            </Button>
          </div>
        </form>
      </DialogContent>
    </OutsideDismissDialog>
  );
}
