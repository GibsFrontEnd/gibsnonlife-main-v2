"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MarketingChannel, UpdateChannelData } from "./marketing-channels-page"

interface EditChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: MarketingChannel | null
  onSubmit: (id: string, data: UpdateChannelData) => Promise<void>
}

export function EditChannelDialog({ open, onOpenChange, channel, onSubmit }: EditChannelDialogProps) {
  const [formData, setFormData] = useState<UpdateChannelData>({
    channelName: "",
    branchID: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (channel) {
      setFormData({
        channelName: channel.channelName,
        branchID: channel.branchID,
      })
    }
  }, [channel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channel || !formData.channelName || !formData.branchID) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(channel.channelID, formData)
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
          <DialogTitle>Edit Marketing Channel</DialogTitle>
          <DialogDescription>Update the marketing channel information. Channel ID cannot be changed.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-channelID">Channel ID</Label>
              <Input id="edit-channelID" value={channel.channelID} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Channel ID cannot be modified</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-channelName">Channel Name</Label>
              <Input
                id="edit-channelName"
                value={formData.channelName}
                onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                placeholder="Enter channel name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-branchID">Branch ID</Label>
              <Input
                id="edit-branchID"
                value={formData.branchID}
                onChange={(e) => setFormData({ ...formData, branchID: e.target.value })}
                placeholder="Enter branch ID"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
