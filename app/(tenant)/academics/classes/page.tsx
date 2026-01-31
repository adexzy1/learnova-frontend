'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2, Users, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'

import { PageHeader } from '@/components/shared/page-header'
import { fetchClasses } from '@/lib/api'
import { classLevelSchema, classArmSchema, type ClassLevelFormData, type ClassArmFormData } from '@/schemas'
import type { ClassLevel, ClassArm } from '@/types'

export default function ClassesPage() {
  const queryClient = useQueryClient()
  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [armDialogOpen, setArmDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassLevel | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  })

  const classForm = useForm<ClassLevelFormData>({
    resolver: zodResolver(classLevelSchema),
    defaultValues: {
      name: '',
      order: 1,
    },
  })

  const armForm = useForm<ClassArmFormData>({
    resolver: zodResolver(classArmSchema),
    defaultValues: {
      classLevelId: '',
      name: '',
      capacity: 40,
    },
  })

  const classMutation = useMutation({
    mutationFn: async (data: ClassLevelFormData) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success(editingClass ? 'Class updated!' : 'Class created!')
      setClassDialogOpen(false)
      setEditingClass(null)
      classForm.reset()
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  const armMutation = useMutation({
    mutationFn: async (data: ClassArmFormData) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Class arm created!')
      setArmDialogOpen(false)
      setSelectedClassId(null)
      armForm.reset()
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  const handleAddArm = (classLevelId: string) => {
    setSelectedClassId(classLevelId)
    armForm.reset({ classLevelId, name: '', capacity: 40 })
    setArmDialogOpen(true)
  }

  const handleEditClass = (classLevel: ClassLevel) => {
    setEditingClass(classLevel)
    classForm.reset({
      name: classLevel.name,
      order: classLevel.order,
    })
    setClassDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Classes & Arms"
          description="Manage class levels and their arms"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Academics', href: '/academics' },
            { label: 'Classes' },
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Arms"
        description="Manage class levels and their arms"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Academics', href: '/academics' },
          { label: 'Classes' },
        ]}
        actions={
          <Dialog open={classDialogOpen} onOpenChange={(open) => {
            setClassDialogOpen(open)
            if (!open) {
              setEditingClass(null)
              classForm.reset()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Class Level
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? 'Edit Class Level' : 'Create Class Level'}
                </DialogTitle>
                <DialogDescription>
                  {editingClass 
                    ? 'Update the class level details.' 
                    : 'Add a new class level to the school structure.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...classForm}>
                <form 
                  onSubmit={classForm.handleSubmit((data) => classMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={classForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name</FormLabel>
                        <FormControl>
                          <Input placeholder="JSS 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={classForm.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setClassDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={classMutation.isPending}>
                      {classMutation.isPending ? 'Saving...' : editingClass ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Class Arm Dialog */}
      <Dialog open={armDialogOpen} onOpenChange={(open) => {
        setArmDialogOpen(open)
        if (!open) {
          setSelectedClassId(null)
          armForm.reset()
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class Arm</DialogTitle>
            <DialogDescription>
              Add a new arm to this class level.
            </DialogDescription>
          </DialogHeader>

          <Form {...armForm}>
            <form 
              onSubmit={armForm.handleSubmit((data) => armMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={armForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="A, B, C..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={armForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setArmDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={armMutation.isPending}>
                  {armMutation.isPending ? 'Adding...' : 'Add Arm'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Classes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes?.map((classLevel) => (
          <Card key={classLevel.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                {classLevel.name}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditClass(classLevel)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddArm(classLevel.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Arm
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {classLevel.arms.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No arms yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddArm(classLevel.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Arm
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {classLevel.arms.map((arm) => (
                    <div 
                      key={arm.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{classLevel.name} {arm.name}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{arm.capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!classes || classes.length === 0) && (
        <Card className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No classes yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Get started by creating your first class level.
            </p>
            <Button onClick={() => setClassDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Class Level
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
