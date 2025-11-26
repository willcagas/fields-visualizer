// Number input component that allows typing "e" for scientific notation
import { useState, useEffect, useRef } from 'react'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  title?: string
}

export default function NumberInput({ value, onChange, placeholder, title }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  // Update local state when value prop changes (from external updates)
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue) // Always update the input to allow free typing
    
    // Try to parse, but update state if valid
    const parsed = parseFloat(newValue)
    if (!isNaN(parsed) && newValue.trim() !== '' && newValue.trim() !== '-') {
      onChange(parsed)
    }
  }

  const handleBlur = () => {
    const trimmed = inputValue.trim()
    const parsed = parseFloat(trimmed)
    
    if (isNaN(parsed) || trimmed === '' || trimmed === '-') {
      // Reset to current value if invalid
      setInputValue(value.toString())
    } else {
      // Format the value and update
      onChange(parsed)
      setInputValue(parsed.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="value-input"
      title={title}
    />
  )
}

