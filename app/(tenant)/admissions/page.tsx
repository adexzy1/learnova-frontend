'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Eye, CheckCircle, XCircle, Clock, FileText, MoreHorizontal } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { fetchAdmissions } from '@/lib/api'
import { formatDate } from '@/lib/format'
import type { AdmissionApplication } from '@/types'

function getStatusBadge(status: AdmissionApplication['status']) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case 'under-review':
      return (
        <Badge className="bg-blue-100 text-blue-800 gap-1">
          <FileText className="h-3 w-3" />
          Under Review
        </Badge>
      )
    case 'approved':
      return (
        <Badge className="bg-green-100 text-green-800 gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    case 'enrolled':
      return (
        <Badge className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Enrolled
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function AdmissionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: admissionsResponse, isLoading } = useQuery({
    queryKey: ['admissions', statusFilter],
    queryFn: () => fetchAdmissions({ status: statusFilter }),
  })

  const admissions = admissionsResponse?.data || []

  // Count by status
  const statusCounts = {
    all: admissions.length,
    pending: admissions.filter(a => a.status === 'pending').length,
    'under-review': admissions.filter(a => a.status === 'under-review').length,
    approved: admissions.filter(a => a.status === 'approved').length,
    rejected: admissions.filter(a => a.status === 'rejected').length,
  }

  const columns: ColumnDef<AdmissionApplication>[] = [
    {
      accessorKey: 'applicationNumber',
      header: 'Application No.',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue('applicationNumber')}</span>
      ),
    },
    {
      id: 'applicant',
      header: 'Applicant',
      cell: ({ row }) => {
        const data = row.original.studentData
        return (
          <div>
            <p className="font-medium">
              {data.firstName} {data.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {data.gender}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) => formatDate(row.getValue('submittedAt')),
    },
    {
      id: 'documents',
      header: 'Documents',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.documents.length} file(s)
        </Badge>
      ),
    },
    {
      id: 'examScore',
      header: 'Exam Score',
      cell: ({ row }) => (
        row.original.entranceExamScore ? (
          <span className="font-medium">{row.original.entranceExamScore}%</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admissions/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {row.original.status === 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Start Review
                </DropdownMenuItem>
              </>
            )}
            {row.original.status === 'under-review' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            {row.original.status === 'approved' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  Enroll Student
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Manage student applications and enrollment"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admissions' },
        ]}
        actions={
          <Button asChild>
            <Link href="/admissions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.all}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {statusCounts.pending}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {statusCounts['under-review']}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {statusCounts.approved}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="under-review">Under Review ({statusCounts['under-review']})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <DataTable
            columns={columns}
            data={statusFilter === 'all' ? admissions : admissions.filter(a => a.status === statusFilter)}
            isLoading={isLoading}
            searchPlaceholder="Search applications..."
            emptyMessage="No applications found."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
