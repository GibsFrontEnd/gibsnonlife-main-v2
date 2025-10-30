import { useEffect, useState } from "react";
import { Button } from "../../UI/new-button";
import { useAppDispatch, useAppSelector } from "../../../hooks/use-apps";
import ConfirmationModal from "../../Modals/ConfirmationModal";
import SearchBar from "../../SearchBar";
import {
  clearMessages,
  deleteRole,
  getAllRoles,
  selectRoles,
} from "../../../features/reducers/adminReducers/roleSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../UI/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../UI/pagination";
import {
  selectUiState,
  setShowCreateRoleDialog,
  setShowDeleteRoleDialog,
  setShowEditRoleDialog,
} from "../../../features/reducers/uiReducers/uiSlice";
import type { Role } from "../../../types/role";
import { CreateRole, EditRole } from "../../components.roles";

const SecurityRoles = () => {
  const dispatch = useAppDispatch();

  const { roles, success, loading, error } = useAppSelector(selectRoles);
  const { showDeleteRoleDialog } = useAppSelector(selectUiState);

  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoles = roles.filter((role) =>
    role.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);

  const [roleIdToDelete, setRoleIdToDelete] = useState<
    number | null | undefined
  >(null);

  const currentData = filteredRoles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);

  const confirmDeleteRole = async (roleId: number | null | undefined) => {
    if (roleId === null) {
      console.log("No Role Id");
      return;
    }

    dispatch(deleteRole(roleId));

    if (success.deleteRole) {
      dispatch(clearMessages());
      setRoleIdToDelete(null);
      dispatch(setShowDeleteRoleDialog(false));
    } else if (error.deleteRole) {
      console.log(error);
    }
  };

  if (error.getAllRoles) {
    console.error("Error fetching Roles:", error);
  }

  return (
    <div className="p-4 flex flex-col gap-6 bg-[#f8f9fa] min-h-[calc(100vh_-_64px)]">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <SearchBar
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Button
          className="bg-primary-blue text-white"
          onClick={() => dispatch(setShowCreateRoleDialog(true))}
        >
          Add New Role
        </Button>
      </div>

      {loading.getAllRoles ? (
        <div className="flex justify-center items-center h-[200px] text-base text-neutral-gray">
          Loading...
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-tableShadow">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead>S/N</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Last Modified By</TableHead>
                <TableHead>Last Modified On</TableHead>
                {/* <TableHead>Base Salary</TableHead> */}
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {currentData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-neutral-placeholder p-6"
                  >
                    No roles found
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((role, index) => (
                  <TableRow key={role.roleID}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{role.roleName}</TableCell>
                    <TableCell>{role.roleDescription}</TableCell>
                    <TableCell>{role.modifiedBy}</TableCell>
                    <TableCell>{role.modifiedOn}</TableCell>
                    <TableCell className="flex gap-2 items-center justify-end">
                      {/* <Button
                        asLink
                        to={`/admin/Role/${role.id}/units`}
                        className="action-button view"
                      >
                        View Units
                      </Button> */}
                      <Button
                        className="action-button edit"
                        onClick={() => {
                          setRoleToEdit(role);
                          dispatch(setShowEditRoleDialog(true));
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="action-button delete"
                        onClick={() => {
                          setRoleIdToDelete(role.roleID);
                          dispatch(setShowDeleteRoleDialog(true));
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center px-4 w-full mt-4">
            <div className="text-sm text-neutral-gray">
              Showing{" "}
              <span className="font-medium">
                {filteredRoles.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                      currentPage * rowsPerPage,
                      filteredRoles.length
                    )} of ${filteredRoles.length}`
                  : "0 to 0 of 0"}
              </span>{" "}
              Roles
            </div>

            <Pagination className="flex items-end w-max !mx-0 ml-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className="bg-primary-blue cursor-pointer flex items-center text-white hover:bg-primary-blue/75"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1} className="cursor-pointer">
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    className="bg-primary-blue cursor-pointer flex items-center text-white hover:bg-primary-blue/75"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      <CreateRole />
      <EditRole role={roleToEdit} />

      {showDeleteRoleDialog && (
        <ConfirmationModal
          title="Delete Role"
          message="Are you sure you want to delete this Role and its related units? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => confirmDeleteRole(roleIdToDelete)}
          onCancel={() => dispatch(setShowDeleteRoleDialog(false))}
          isLoading={loading.deleteRole}
        />
      )}
    </div>
  );
};

export default SecurityRoles;
