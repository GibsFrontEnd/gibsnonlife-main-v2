"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { MarketingChannel } from "./marketing-channels-page"

interface DeleteChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: MarketingChannel | null
  onConfirm: (id: string) => Promise<void>
}

export function DeleteChannelDialog({ open, onOpenChange, channel, onConfirm }: DeleteChannelDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!channel) return

    setLoading(true)
    try {
      await onConfirm(channel.channelID)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
    }
  }

  if (!channel) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Marketing Channel</DialogTitle>
          </div>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the marketing channel and all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
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
                  {channel.subChannels.length} sub-channel{channel.subChannels.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            )}
          </div>
          {channel.subChannels.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Warning:</strong> This will also delete all {channel.subChannels.length} sub-channel
              {channel.subChannels.length !== 1 ? "s" : ""} associated with this channel.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete Channel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
