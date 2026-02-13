import { redirect } from 'next/navigation'

export const metadata = { title: 'Invoices — Client Portal' }

export default function InvoicesPage() {
  redirect('/portal/billing')
}
