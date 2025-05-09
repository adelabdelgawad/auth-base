// components/NewBranchSheet.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define the form schema with zod for validation
const branchSchema = z.object({
  branch_name: z.string().min(2, "Branch name is required"),
  address: z.string().optional(),
  contact_info: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

type NewBranchSheetProps = {
  onSave: (branch: BranchFormValues) => Promise<void> | void;
};

export default function NewBranchSheet({ onSave }: NewBranchSheetProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      branch_name: "",
      address: "",
      contact_info: "",
    },
  });

  async function onSubmit(data: BranchFormValues) {
    await onSave(data);
    setOpen(false);
    form.reset();
    // Optionally, handle errors or show a toast here
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default">New Branch</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Create New Branch</SheetTitle>
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
              Create Branch
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
