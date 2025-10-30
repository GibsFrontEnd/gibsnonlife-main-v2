"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateChannelData } from "./marketing-channels-page"

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateChannelData) => Promise<void>
}

export function CreateChannelDialog({ open, onOpenChange, onSubmit }: CreateChannelDialogProps) {
  const [formData, setFormData] = useState<CreateChannelData>({
    channelID: "",
    channelName: "",
    branchID: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.channelID || !formData.channelName || !formData.branchID) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      setFormData({ channelID: "", channelName: "", branchID: "" })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setFormData({ channelID: "", channelName: "", branchID: "" })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Marketing Channel</DialogTitle>
          <DialogDescription>
            Add a new marketing channel to your system. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="channelID">Channel ID</Label>
              <Input
                id="channelID"
                value={formData.channelID}
                onChange={(e) => setFormData({ ...formData, channelID: e.target.value })}
                placeholder="Enter channel ID"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channelName">Channel Name</Label>
              <Input
                id="channelName"
                value={formData.channelName}
                onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                placeholder="Enter channel name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branchID">Branch ID</Label>
              <Input
                id="branchID"
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
              {loading ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
