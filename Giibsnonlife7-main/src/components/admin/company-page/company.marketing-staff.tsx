import { Badge } from '@/components/UI/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card'
import { Button } from '@/components/UI/new-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table'
import { fetchMktStaffs, selectMarketingStaff } from '@/features/reducers/companyReducers/marketingStaffSlice'
import { useAppDispatch, useAppSelector } from '@/hooks/use-apps'
import type { MktStaff } from '@/types/marketing-staff'
import { formatCurrency, formatDate } from '@/utils/ui-utilities'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import MarketingStaffCreateDialog from "@/components/admin/company-page/marketing-staff/create-marketing-staff-dialog"
import { MarketingStaffEditDialog } from "@/components/admin/company-page/marketing-staff/edit-marketing-staff-dialog"
import { MarketingStaffDeleteDialog } from "@/components/admin/company-page/marketing-staff/delete-marketing-staff-dialog"

const CompanyMarketingStaff = () => {
  const dispatch = useAppDispatch()
  const { mktStaffs, loading, error } = useAppSelector(selectMarketingStaff)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<MktStaff | null>(null)

  useEffect(() => {
    dispatch(fetchMktStaffs())
  }, [dispatch])

  const handleEdit = (staff: MktStaff) => {
    setSelectedStaff(staff)
    setEditDialogOpen(true)
  }

  const handleDelete = (staff: MktStaff) => {
    setSelectedStaff(staff)
    setDeleteDialogOpen(true)
  }

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = mktStaffs
    ? Math.ceil(mktStaffs.length / pageSize)
    : 0;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentMktStaffs = [...mktStaffs]?.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading.fetchMktStaffs) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading marketing staff...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error.fetchMktStaffs) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>Failed to load marketing staff. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Marketing Staff</h1>
          <p className="text-muted-foreground">Manage your marketing team members and their targets</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mktStaffs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mktStaffs.filter((staff) => staff.active === 1).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Targets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mktStaffs.reduce((sum, staff) => sum + staff.curTarget, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(mktStaffs.map((staff) => staff.mktUnitID)).size}</div>
          </CardContent>
        </Card>
      </div>

      {mktStaffs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Marketing Staff Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first marketing staff member.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="hidden md:block">
        <Card className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Group Head</TableHead>
                <TableHead>Marketing Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Target</TableHead>
                <TableHead>Previous Target</TableHead>
                <TableHead>Budget Period</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMktStaffs.map((staff) => (
                <TableRow key={staff.mktStaffID}>
                  <TableCell className="font-medium">{staff.staffName}</TableCell>
                  <TableCell>{staff.groupName}</TableCell>
                  <TableCell>{staff.groupHead}</TableCell>
                  <TableCell>{staff.mktUnit}</TableCell>
                  <TableCell>
                    <Badge variant={staff.active === 1 ? "default" : "secondary"}>
                      {staff.active === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-primary">{formatCurrency(staff.curTarget)}</TableCell>
                  <TableCell>{formatCurrency(staff.prevTarget)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(staff?.budyear1)} - {formatDate(staff?.budyear2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(staff)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="md:hidden grid grid-cols-1 gap-6">
        {currentMktStaffs.map((staff) => (
          <Card key={staff.mktStaffID} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{staff.staffName}</CardTitle>
                  <CardDescription>{staff.groupName}</CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant={staff.active === 1 ? "default" : "secondary"}>
                    {staff.active === 1 ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Group Head:</span>
                  <span className="font-medium">{staff.groupHead}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Marketing Unit:</span>
                  <span className="font-medium">{staff.mktUnit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget Started:</span>
                  <span className="font-medium">{formatDate(staff?.budyear1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget Ended:</span>
                  <span className="font-medium">{formatDate(staff?.budyear2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Target:</span>
                  <span className="font-bold text-primary">{formatCurrency(staff.curTarget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Previous Target:</span>
                  <span className="font-medium">{formatCurrency(staff.prevTarget)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(staff)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentMktStaffs && totalPages > 1 && (
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
                disabled={currentPage === 1 || loading.fetchMktStaffs}
                className="hidden sm:flex h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)} // @ts-ignore
                disabled={currentPage === 1 || loading.fetchMktStaffs}
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
                        disabled={loading.fetchMktStaffs}
                        className={`h-8 w-8 p-0 text-xs sm:text-sm ${currentPage === pageNum
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
                disabled={currentPage === totalPages || loading.getAllProducts}
                className="h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)} // @ts-ignore
                disabled={currentPage === totalPages || loading.getAllProducts}
                className="hidden sm:flex h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <MarketingStaffCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      <MarketingStaffEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} staff={selectedStaff} />

      <MarketingStaffDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} staff={selectedStaff} />
    </div>
  )
}

export default CompanyMarketingStaff