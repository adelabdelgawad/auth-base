
// components/TableSkeleton.tsx
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number; // Optional prop to customize number of skeleton rows
}

export default function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-8 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-24 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-24 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-16 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-32 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-24 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-16 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-12 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-20 mx-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}