import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface BaseProps {
  label: string
  error?: string
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' }
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' }
type SelectProps = BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    as: 'select'
    options: { value: string; label: string }[]
  }

type FormFieldProps = InputProps | TextareaProps | SelectProps

const inputClasses =
  'w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple transition-colors text-sm'

export function FormField(props: FormFieldProps) {
  const { label, error, as = 'input', ...rest } = props

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          className={`${inputClasses} min-h-[100px] resize-y`}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <select className={inputClasses} {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}>
          {(props as SelectProps).options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input className={inputClasses} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}
