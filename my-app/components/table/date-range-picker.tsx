"use client";
export const dynamic = "force-dynamic";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  parse,
  isSameDay,
  subDays,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange as DayPickerDateRange } from "react-day-picker";
import { toast } from "sonner"
// Import shadcn Sheet components
import { Sheet, SheetContent, SheetDescription, SheetHeader,  SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Spinner } from "../ui/spinner";

interface DateRangePickerProps {
  placeholder?: string;
  additionalParamstoDelete?: string;
}

export default function DateRangePicker({
  placeholder = "Pick a Date Range",
  additionalParamstoDelete= ""
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false); // Spinner state

  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  // Extract dates from URL query parameters (if available)
  const urlStartDate = searchParams?.get("startDate");
  const urlEndDate = searchParams?.get("endDate");
  const defaultFrom = searchParams?.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : undefined;

  const defaultTo = searchParams?.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : undefined;

  // Maintain the selected date range
  const [date, setDate] = React.useState<DayPickerDateRange>({
    from: defaultFrom,
    to: defaultTo,
  });

  React.useEffect(() => {
    if (
      isLoading &&
      date?.from &&
      urlStartDate &&
      isSameDay(parse(urlStartDate, "yyyy-MM-dd", new Date()), date.from) &&
      ((date.to &&
        urlEndDate &&
        isSameDay(parse(urlEndDate, "yyyy-MM-dd", new Date()), date.to)) ||
        (!date.to && !urlEndDate))
    ) {
      setIsLoading(false); // Stop loading when URL matches selected date

    }
  }, [searchParams, isLoading, date, urlStartDate, urlEndDate]);

  const handleDateSelect = (newDateRange: DayPickerDateRange | undefined) => {
    // If user picks both from & to, set them
    if (newDateRange?.from && newDateRange?.to) {
      setDate(newDateRange);
    }
    // If user only picks "from"
    else if (newDateRange?.from) {
      setDate({ from: newDateRange.from, to: undefined });
    }
  };

  const handleSaveButtonClick = () => {
    setIsLoading(true); // Start loading

    const params = new URLSearchParams(searchParams?.toString() || "");

    if (!date?.from && !date?.to) {
      params.delete("startDate");
      params.delete("endDate");
      if (additionalParamstoDelete){
        params.delete(additionalParamstoDelete) 
      }

      replace(`${pathname}?${params.toString()}`);
      setOpen(false);
      return;
    }

    if (!date?.from) {
      toast.error("Please select a start date.");
      return;
    }
    if (!date?.to) {
      toast.error("Please select an end date.");
      return;
    }

    params.set("startDate", format(date.from, "yyyy-MM-dd"));
    params.set("endDate", format(date.to, "yyyy-MM-dd"));

    replace(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const handleCancelButtonClick = () => {
    setOpen(false);
  };

  // Helper functions for predefined ranges
  const selectThisMonth = () => {
    const now = new Date();
    setDate({
      from: startOfMonth(now),
      to: endOfMonth(now),
    });
  };

  const selectLastMonth = () => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    setDate({
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Button that triggers the Sheet */}
      <SheetTrigger asChild>
        <Button size="lg" variant="outline">
          <CalendarIcon className="mx-2 w-5 h-5 opacity-60" />

          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        {isLoading && <Spinner className="absolute left-[-30px] h-5 w-5 text-blue-500" />}
        </Button>
      </SheetTrigger>

      {/* Sheet Content */}
      <SheetContent side="right" className="w-full max-w-md p-0">
        {/* Custom Header (top bar) */}
        <SheetHeader>
          <DialogTitle></DialogTitle>
        <SheetDescription>Select Date Range</SheetDescription>
        </SheetHeader>
        {/* <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold"></h3>
        </div> */}

        {/* Main Content */}
        <div className="flex-col">
          <div className="flex gap-4 p-3">
            {/* Left side with quick picks */}
            <div className="space-y-2 pt-4">
              <Button
                className="w-full text-left"
                onClick={() =>
                  handleDateSelect({
                    from: new Date(),
                    to: new Date(),
                  })
                }
              >
                Today
              </Button>

              <Button
                className="w-full text-left"
                onClick={() =>
                  handleDateSelect({
                    from: subDays(new Date(), 1),
                    to: subDays(new Date(), 1),
                  })
                }
              >
                Yesterday
              </Button>
              <Button className="w-full text-left" onClick={selectThisMonth}>
                This Month
              </Button>
              <Button className="w-full text-left" onClick={selectLastMonth}>
                Last Month
              </Button>
            </div>

            {/* Right side with the calendar */}
            <div>
              <Calendar
                initialFocus
                mode="range"
                selected={date}
                onSelect={handleDateSelect}
              />
            </div>
          </div>

          {/* Bottom row with Clear, Cancel, and OK */}
          <div className="flex w-full space-x-2 p-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDate({ from: undefined, to: undefined })} // Clears the selection
            >
              Clear
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelButtonClick}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSaveButtonClick}>
              OK
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
