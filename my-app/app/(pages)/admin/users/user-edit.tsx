"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useLanguage } from "@/hooks/language-context";
import { Role, UserWithRoles } from "@/types/user";

interface UserEditProps {
  user: UserWithRoles;
  roles: Role[];
  onSave: (data: { userId: number; active: boolean; activeChanged: boolean; addedRoles: number[]; removedRoles: number[] }) => Promise<void>;
}

export function UserEdit({ user, roles, onSave }: UserEditProps) {
  const { t, language } = useLanguage();
  const i18n = t.users.edit;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(user.active);
  const [userRoles, setUserRoles] = useState<Record<number, boolean>>(() => {
    const mapped: Record<number, boolean> = {};
    roles.forEach((role) => {
      mapped[role.id] = user.roles[role.name] || false;
    });
    return mapped;
  });
  const [addedRoles, setAddedRoles] = useState<number[]>([]);
  const [removedRoles, setRemovedRoles] = useState<number[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const activeChanged = active !== user.active;
    const rolesChanged = addedRoles.length > 0 || removedRoles.length > 0;
    setHasChanges(activeChanged || rolesChanged);
  }, [active, addedRoles, removedRoles, user.active]);

  const handleRoleToggle = (roleId: number) => {
    const newValue = !userRoles[roleId];
    setUserRoles((prev) => ({ ...prev, [roleId]: newValue }));

    const roleName = roles.find((r) => r.id === roleId)?.name || "";

    if (newValue && !user.roles[roleName]) {
      setAddedRoles((prev) => [...prev.filter((id) => id !== roleId), roleId]);
      setRemovedRoles((prev) => prev.filter((id) => id !== roleId));
    } else if (!newValue && user.roles[roleName]) {
      setRemovedRoles((prev) => [...prev, roleId]);
      setAddedRoles((prev) => prev.filter((id) => id !== roleId));
    } else {
      setRemovedRoles((prev) => prev.filter((id) => id !== roleId));
      setAddedRoles((prev) => prev.filter((id) => id !== roleId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      userId: user.id,
      active,
      activeChanged: active !== user.active,
      addedRoles,
      removedRoles,
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">{i18n.trigger}</Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{i18n.title}</SheetTitle>
          <SheetDescription>{i18n.description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Row */}
          <div className="grid grid-cols-1 gap-4 border rounded-md p-4 bg-muted/50 text-sm sm:grid-cols-3">
            <div>
              <Label className="text-muted-foreground">{i18n.username}</Label>
              <div>{user.username}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{i18n.fullname}</Label>
              <div>{user.fullname}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">
                {i18n.title_label}
              </Label>
              <div>{user.title}</div>
            </div>
          </div>

          {/* User Status */}
          <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
            <Label className="flex-1">{i18n.user_status}</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Label className={active ? "text-green-500" : "text-red-500"}>
                {active ? i18n.active : i18n.inactive}
              </Label>
              <div dir="ltr">
                <Switch
                  id="user-active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>
            </div>
          </div>

          {/* Role List */}
          <div className="space-y-4">
            <Label>{i18n.roles}</Label>
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex justify-between items-start gap-4"
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
                      checked={userRoles[role.id]}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {i18n.cancel}
            </Button>
            <Button type="submit" disabled={!hasChanges}>
              {i18n.save_changes}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}