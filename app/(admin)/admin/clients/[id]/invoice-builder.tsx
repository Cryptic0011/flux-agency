'use client'

import { useState, useTransition } from 'react'
import { sendInvoiceAction } from '../actions'

interface Project {
  id: string
  name: string
}

export function InvoiceBuilder({
  clientId,
  projects,
}: {
  clientId: string
  projects: Project[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState([{ description: '', amount: '' }])
  const [selectedProject, setSelectedProject] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  function addItem() {
    setItems([...items, { description: '', amount: '' }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: 'description' | 'amount', value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function handleSubmit() {
    setError(null)
    setSuccess(false)

    const validItems = items.filter((item) => item.description && parseFloat(item.amount) > 0)
    if (validItems.length === 0) {
      setError('At least one line item with a description and amount is required.')
      return
    }

    const formData = new FormData()
    formData.set('client_id', clientId)
    if (selectedProject) formData.set('project_id', selectedProject)
    formData.set(
      'items',
      JSON.stringify(validItems.map((item) => ({ description: item.description, amount: parseFloat(item.amount) })))
    )

    startTransition(async () => {
      try {
        await sendInvoiceAction(formData)
        setSuccess(true)
        setItems([{ description: '', amount: '' }])
        setSelectedProject('')
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
        }, 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send invoice')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
      >
        Create Invoice
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">New Invoice</h3>
        <button
          onClick={() => {
            setIsOpen(false)
            setError(null)
            setSuccess(false)
          }}
          className="text-gray-400 hover:text-white text-sm"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Invoice sent successfully!
        </div>
      )}

      <div className="space-y-4">
        {/* Project selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Project (optional)</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
          >
            <option value="">No specific project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Line items */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Line Items</label>
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="$ Amount"
                  min="0"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                  className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
                />
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-2 text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="text-sm text-neon-purple hover:text-neon-purple/80"
        >
          + Add Line Item
        </button>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-dark-600/50 pt-4">
          <span className="text-sm font-medium text-gray-300">Total</span>
          <span className="text-lg font-bold text-white">${total.toFixed(2)}</span>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full rounded-lg bg-neon-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send Invoice'}
        </button>
      </div>
    </div>
  )
}
