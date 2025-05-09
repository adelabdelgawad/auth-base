"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Select, { type SingleValue } from "react-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useLanguage } from "@/hooks/language-context";
import { DomainUser, Role, UserCreate, UserWithRoles } from "@/types/user";

interface NewUserSheetProps {
  roles: Role[];
  usersList: DomainUser[];
  onSave: (user: UserCreate) => Promise<void>;
}

export function NewUserSheet({ roles, usersList, onSave }: NewUserSheetProps) {
  const { t, language } = useLanguage();
  const i18n = t.users.create;

  const [open, setOpen] = useState(false);

  const initialRoles: Record<string, boolean> = useMemo(() => {
    const result: Record<string, boolean> = {};
    roles.forEach((role) => {
      result[role.id] = false;
    });
    return result;
  }, [roles]);

  const initialFormData = useMemo(
    (): UserWithRoles => ({
      id: 0,
      username: "",
      fullname: "",
      title: "",
      roles: initialRoles,
      ar_roles: initialRoles,
      active: true,
    }),
    [initialRoles]
  );

  const [formData, setFormData] = useState<UserWithRoles>(initialFormData);
  const [selectedUser, setSelectedUser] = useState<DomainUser | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasUser = formData.username || formData.fullname || formData.title;
    const hasRoleChanges = Object.values(formData.roles).some((v) => v);
    setHasChanges(Boolean(hasUser) || hasRoleChanges);
  }, [formData]);

  const userOptions = usersList.map((user) => ({
    value: user.username,
    label: `${user.fullname} (${user.title})`,
  }));

  const handleUserSelect = (
    option: SingleValue<{ value: string; label: string }>
  ) => {
    const selected =
      usersList.find((u) => u.username === option?.value) || null;
    setSelectedUser(selected);

    if (selected) {
      const { username, fullname, title } = selected;
      setFormData((prev) => ({ ...prev, username, fullname, title }));
    } else {
      setFormData((prev) => ({
        ...prev,
        username: "",
        fullname: "",
        title: "",
      }));
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleId]: !prev.roles[roleId],
      },
    }));
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSelectedUser(null);
    setHasChanges(false);
  }, [initialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRoles = Object.entries(formData.roles)
      .filter((entry) => entry[1])
      .map((entry) => Number(entry[0]));

    const userToCreate: UserCreate = {
      id: formData.id,
      username: formData.username,
      fullname: formData.fullname,
      title: formData.title,
      roles: selectedRoles,
      active: formData.active,
    };

    await onSave(userToCreate);
    resetForm();
    setOpen(false);
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default">{i18n.new_user}</Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{i18n.title}</SheetTitle>
          <SheetDescription>{i18n.description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="user-select">{i18n.select_user}</Label>
              <Select
                id="user-select"
                options={userOptions}
                value={
                  selectedUser
                    ? {
                        value: selectedUser.username,
                        label: `${selectedUser.fullname} (${selectedUser.title})`,
                      }
                    : null
                }
                onChange={handleUserSelect}
                isClearable
                placeholder={i18n.select_user_placeholder}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="new-user-active" className="flex-1">
                {i18n.status}
              </Label>
              <div className="flex items-center space-x-2">
                <Label
                  className={
                    formData.active ? "text-green-500" : "text-red-500"
                  }
                >
                  {formData.active ? i18n.active : i18n.disabled}
                </Label>
                <div dir="ltr">
                  <Switch
                    id="new-user-active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, active: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>{i18n.roles}</Label>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <Label htmlFor={`role-${role.id}`}>
                        {language === "ar" && role.ar_name
                          ? role.ar_name
                          : role.name}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" && role.ar_description
                          ? role.ar_description
                          : role.description}
                      </div>
                    </div>
                    <div dir="ltr">
                      <Switch
                        id={`role-${role.id}`}
                        checked={formData.roles[role.id]}
                        onCheckedChange={() =>
                          handleRoleToggle(role.id.toString())
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {i18n.cancel}
            </Button>
            <Button type="submit" disabled={!hasChanges}>
              {i18n.create}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}