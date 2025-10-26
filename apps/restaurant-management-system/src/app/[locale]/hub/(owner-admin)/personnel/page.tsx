'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Search, UserPlus } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Badge } from '@repo/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { toast } from '@repo/ui/lib/toast';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { InviteStaffDialog } from '@/features/personnel/components/InviteStaffDialog';
import { ChangeRoleDialog } from '@/features/personnel/components/ChangeRoleDialog';
import { SuspendUserDialog } from '@/features/personnel/components/SuspendUserDialog';
import {
  getStaffMembers,
  reactivateUser,
} from '@/features/personnel/services/personnel.service';
import { personnelKeys } from '@/features/personnel/queries/personnel.keys';
import type {
  StaffMember,
  StaffFilters,
  Role,
  UserStatus,
} from '@/features/personnel/types/personnel.types';

export default function PersonnelPage() {
  const t = useTranslations('personnel');
  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore((state) => state.selectedStoreId);

  const [filters, setFilters] = useState<StaffFilters>({
    role: '',
    status: '',
    search: '',
  });
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Fetch staff members
  const { data: staffMembers, isLoading } = useQuery({
    queryKey: personnelKeys.staff(selectedStoreId || ''),
    queryFn: () => getStaffMembers(selectedStoreId || ''),
    enabled: !!selectedStoreId,
  });

  // Reactivate user mutation
  const reactivateMutation = useMutation({
    mutationFn: (userId: string) =>
      reactivateUser(selectedStoreId || '', userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: personnelKeys.staff(selectedStoreId || ''),
      });
      toast.success(t('reactivate.success'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('reactivate.error'));
    },
  });

  // Filter staff members
  const filteredStaff = ((staffMembers as StaffMember[]) || []).filter(
    (member) => {
      if (filters.role && member.role !== filters.role) return false;
      if (filters.status && member.status !== filters.status) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          member.email.toLowerCase().includes(search) ||
          member.name?.toLowerCase().includes(search)
        );
      }
      return true;
    }
  );

  const handleChangeRole = (member: StaffMember) => {
    setSelectedStaff(member);
    setChangeRoleDialogOpen(true);
  };

  const handleSuspend = (member: StaffMember) => {
    setSelectedStaff(member);
    setSuspendDialogOpen(true);
  };

  const handleReactivate = async (member: StaffMember) => {
    await reactivateMutation.mutateAsync(member.id);
  };

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<
      UserStatus,
      'default' | 'secondary' | 'destructive'
    > = {
      active: 'default',
      pending: 'secondary',
      suspended: 'destructive',
    };

    return <Badge variant={variants[status]}>{t(`status.${status}`)}</Badge>;
  };

  if (!selectedStoreId) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">{t('noStoreSelected')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('inviteStaff')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-9"
              />
            </div>

            <Select
              value={filters.role}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, role: value as Role | '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filterByRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allRoles')}</SelectItem>
                <SelectItem value="OWNER">{t('roles.OWNER')}</SelectItem>
                <SelectItem value="ADMIN">{t('roles.ADMIN')}</SelectItem>
                <SelectItem value="CHEF">{t('roles.CHEF')}</SelectItem>
                <SelectItem value="CASHIER">{t('roles.CASHIER')}</SelectItem>
                <SelectItem value="SERVER">{t('roles.SERVER')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value as UserStatus | '',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allStatuses')}</SelectItem>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="suspended">
                  {t('status.suspended')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">{t('noStaffFound')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.role')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name || '—'}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`roles.${member.role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t('actions.title')}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(member)}
                            disabled={member.status === 'suspended'}
                          >
                            {t('actions.changeRole')}
                          </DropdownMenuItem>
                          {member.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() => handleSuspend(member)}
                              className="text-destructive"
                            >
                              {t('actions.suspend')}
                            </DropdownMenuItem>
                          ) : member.status === 'suspended' ? (
                            <DropdownMenuItem
                              onClick={() => handleReactivate(member)}
                            >
                              {t('actions.reactivate')}
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <InviteStaffDialog
        storeId={selectedStoreId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <ChangeRoleDialog
        storeId={selectedStoreId}
        staffMember={selectedStaff}
        open={changeRoleDialogOpen}
        onOpenChange={setChangeRoleDialogOpen}
      />

      <SuspendUserDialog
        storeId={selectedStoreId}
        staffMember={selectedStaff}
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
      />
    </div>
  );
}
