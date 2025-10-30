import { useEffect, useState } from "react";
import { Button } from "@/components/UI/new-button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  OutsideDismissDialog,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/new-input";
import { Label } from "@/components/UI/label";
import type { CreateMktChannelRequest } from "@/types/marketing-channels";
import { useAppDispatch, useAppSelector } from "@/hooks/use-apps";
import {
  clearMarketingChannelsMessages,
  createMktChannel,
  selectMarketingChannels,
} from "@/features/reducers/companyReducers/marketingChannelSlice";
import { useToast } from "@/components/UI/use-toast";

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChannelDialog({
  open,
  onOpenChange,
}: CreateChannelDialogProps) {
  const [formData, setFormData] = useState<CreateMktChannelRequest>({
    channelID: "",
    channelName: "",
    branchID: "",
  });
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  // const [loading, setLoading] = useState(false);
  const { loading, error, success } = useAppSelector(selectMarketingChannels);

  useEffect(() => {
    if (success.createMktChannel) {
      dispatch(clearMarketingChannelsMessages());
      toast({
        title: "Success",
        description: "Marketing Channel created successfully.",
      });
      onOpenChange(false);
      setFormData({ channelID: "", channelName: "", branchID: "" });
    } else if (error.createMktChannel) {
      dispatch(clearMarketingChannelsMessages());
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    }
  }, [success.createMktChannel, error.createMktChannel, toast, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.channelID || !formData.channelName || !formData.branchID) {
      return;
    }

    dispatch(createMktChannel(formData));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading.createMktChannel) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setFormData({ channelID: "", channelName: "", branchID: "" });
      }
    }
  };

  return (
    <OutsideDismissDialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={""}>
        <DialogHeader>
          <DialogTitle>Create Marketing Channel</DialogTitle>
          <div>
            Add a new marketing channel to your system. Fill in all the required
            information.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 pt-0">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="channelID">Channel ID</Label>
              <Input
                id="channelID"
                value={formData.channelID}
                onChange={(e: any) =>
                  setFormData({ ...formData, channelID: e.target.value })
                }
                placeholder="Enter channel ID"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channelName">Channel Name</Label>
              <Input
                id="channelName"
                value={formData.channelName}
                onChange={(e: any) =>
                  setFormData({ ...formData, channelName: e.target.value })
                }
                placeholder="Enter channel name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branchID">Marketing Channel ID</Label>
              <Input
                id="branchID"
                value={formData.branchID}
                onChange={(e: any) =>
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
              onClick={() => handleOpenChange(false)} // @ts-ignore
              disabled={loading}
            >
              Cancel
            </Button>
            {/* @ts-ignore */}
            <Button className="flex-1" type="submit" loading={loading.createMktChannel}>
              Create Channel
            </Button>
          </div>
        </form>
      </DialogContent>
    </OutsideDismissDialog>
  );
}
