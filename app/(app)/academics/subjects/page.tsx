"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/table/data-table";
import useSubjectService from "./_service/useSubjectService";
import { DeleteSubjectDialog } from "./_components/delete-dialog";
import { CreateSubjectDialog } from "./_components/create-dialog";
import { EditSubjectDialog } from "./_components/edit-dialog";
import { getColumns } from "./_components/columns";
import { DataTablePagination } from "@/components/shared/table/pagination";

export default function SubjectsPage() {
  const {
    subjects,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingSubject,
    setEditingSubject,
    form,
    mutation,
    deleteMutation,
    handleEdit,
    handleDelete,
    meta,
    pagination,
    setPagination,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteSubject,
    setDeleteSubject,
  } = useSubjectService();

  const columns = getColumns({ handleEdit, handleDelete });

  const handleCreateSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleEditSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Subjects"
          description="Manage subjects offered in the school"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academics", href: "/academics" },
            { label: "Subjects" },
          ]}
          actions={
            <CreateSubjectDialog
              open={dialogOpen && !editingSubject}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  form.reset();
                }
              }}
              form={form}
              onSubmit={handleCreateSubmit}
              isPending={mutation.isPending}
            />
          }
        />

        <DataTable
          columns={columns}
          data={subjects || []}
          isLoading={isLoading}
          emptyMessage="No subjects found. Add your first subject."
        />

        <DataTablePagination
          page={pagination.page}
          pageSize={pagination.per_page}
          totalPages={meta?.lastPage || 0}
          hasNextPage={meta?.hasNextPage || false}
          hasPrevPage={meta?.hasPrevPage || false}
          onPaginationChange={(pagination) =>
            setPagination({
              page: pagination.page,
              per_page: pagination.pageSize,
            })
          }
        />
      </div>

      <EditSubjectDialog
        open={dialogOpen && !!editingSubject}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingSubject(null);
            form.reset();
          }
        }}
        form={form}
        onSubmit={handleEditSubmit}
        isPending={mutation.isPending}
      />

      <DeleteSubjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        subjectName={deleteSubject?.name || ""}
        onConfirm={() => {
          if (deleteSubject) {
            deleteMutation.mutate(deleteSubject.id);
          }
        }}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
