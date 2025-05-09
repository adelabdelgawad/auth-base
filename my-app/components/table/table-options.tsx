import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TableOptionsProps {
  id: number | string
}

/**
 * TableOptions component for an invoice record.
 * Renders an Edit button (or other actions) using the record's id.
 *
 * @param {TableOptionsProps} props - The component props.
 * @returns {JSX.Element} The rendered TableOptions.
 */
export function TableOptions({ id }: TableOptionsProps) {
  return (
    <Link href={`/invoices/${id}`}>
      <Button variant="outline" size="sm">
        Edit
      </Button>
    </Link>
  )
}
