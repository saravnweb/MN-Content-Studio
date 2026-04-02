'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CITIES } from '@/lib/cities'
import { Search, Check, X } from 'lucide-react'

interface CityAutocompleteProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  error?: boolean
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Type your city...',
  className = '',
  error = false
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync internal query with external value (e.g. on mount or if value changes externally)
  useEffect(() => {
    if (value !== query && !isOpen) {
      setQuery(value || '')
    }
  }, [value, isOpen, query])

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredCities([])
      return
    }

    const filtered = CITIES.filter(city =>
      city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)
    setFilteredCities(filtered)
  }, [query])

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // Reset query to last selected value if no city was picked
        setQuery(value || '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  const handleSelect = (city: string) => {
    setQuery(city)
    onChange(city)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
    if (e.target.value === '') {
      onChange('')
    }
  }

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full bg-gray-900 border ${
            error ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500'
          } rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 placeholder:font-light focus:outline-none transition-all pr-10`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          <Search size={16} />
        </div>
      </div>

      {isOpen && filteredCities.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-indigo-600/10 hover:text-indigo-400 flex items-center justify-between transition-colors group"
            >
              <span>{city}</span>
              {value === city && <Check size={14} className="text-emerald-500" />}
              <span className="opacity-0 group-hover:opacity-100 text-[10px] uppercase font-bold tracking-tight text-indigo-500/50">Select</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() !== '' && filteredCities.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-4 text-center animate-in fade-in zoom-in-95 duration-100">
          <p className="text-xs text-gray-500">No matching city found</p>
        </div>
      )}
    </div>
  )
}
