// components/branch-edit.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Branch } from "@/types"; // Adjust path as needed

const branchSchema = z.object({
  branch_name: z.string().min(2, "Branch name is required"),
  address: z.string().optional(),
  contact_info: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

type BranchEditSheetProps = {
  branch: Branch;
  onSave: (data: BranchFormValues) => Promise<void> | void;
};

export default function BranchEditSheet({ branch, onSave }: BranchEditSheetProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      branch_name: branch.branch_name || "",
      address: branch.address || "",
      contact_info: branch.contact_info || "",
    },
  });

  // Update form values if the branch prop changes
  // (e.g. if editing a different branch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => {
    form.reset({
      branch_name: branch.branch_name || "",
      address: branch.address || "",
      contact_info: branch.contact_info || "",
    });
  });

  async function onSubmit(data: BranchFormValues) {
    await onSave(data);
    setOpen(false);
    // Optionally: show toast, refresh table, etc.
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit Branch</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="branch_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Branch Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Info</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact Info" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
