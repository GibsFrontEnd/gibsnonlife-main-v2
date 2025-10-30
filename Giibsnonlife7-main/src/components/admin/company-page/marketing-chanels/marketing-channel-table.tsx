"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Search, RefreshCw } from "lucide-react"
import type { MarketingChannel } from "./marketing-channels-page"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, ChevronRight } from "lucide-react"

interface MarketingChannelsTableProps {
  channels: MarketingChannel[]
  loading: boolean
  onEdit: (channel: MarketingChannel) => void
  onDelete: (channel: MarketingChannel) => void
  onRefresh: () => void
}

export function MarketingChannelsTable({
  channels,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}: MarketingChannelsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const filteredChannels = channels.filter(
    (channel) =>
      channel.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.channelID.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleRowExpansion = (channelId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(channelId)) {
      newExpanded.delete(channelId)
    } else {
      newExpanded.add(channelId)
    }
    setExpandedRows(newExpanded)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Channel ID</TableHead>
                <TableHead>Channel Name</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead>Sub Channels</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Channel ID</TableHead>
              <TableHead>Channel Name</TableHead>
              <TableHead>Branch Name</TableHead>
              <TableHead>Sub Channels</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChannels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No channels found matching your search." : "No marketing channels found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredChannels.map((channel) => (
                <>
                  <TableRow key={channel.channelID}>
                    <TableCell>
                      {channel.subChannels.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(channel.channelID)}
                          className="h-6 w-6 p-0"
                        >
                          {expandedRows.has(channel.channelID) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{channel.channelID}</TableCell>
                    <TableCell className="font-medium">{channel.channelName}</TableCell>
                    <TableCell>{channel.branchName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {channel.subChannels.length} sub-channel{channel.subChannels.length !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(channel)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(channel)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(channel.channelID) && channel.subChannels.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <div className="bg-muted/30 p-4 border-t">
                          <h4 className="font-medium mb-3 text-sm">Sub Channels</h4>
                          <div className="grid gap-2">
                            {channel.subChannels.map((subChannel) => (
                              <div
                                key={subChannel.subChannelID}
                                className="flex items-center justify-between p-3 bg-background rounded border"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{subChannel.subChannelName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {subChannel.subChannelID}
                                    </Badge>
                                  </div>
                                  {subChannel.description && (
                                    <p className="text-sm text-muted-foreground">{subChannel.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
