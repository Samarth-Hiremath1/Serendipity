'use client'

import { useState, FormEvent } from 'react'

interface ProfileFormData {
  name: string
  role: string
  company: string
  current_work: string
  looking_for: string[]
  can_offer: string[]
  interests: string[]
}

interface ProfileSetupFormProps {
  onSubmit: (data: ProfileFormData) => Promise<void>
}

const LOOKING_FOR_OPTIONS = [
  'Co-founder',
  'Investors',
  'Advisors',
  'Job opportunities',
  'Customers',
  'Partners',
  'Mentorship',
  'Collaborators',
]

const CAN_OFFER_OPTIONS = [
  'Technical expertise',
  'Product advice',
  'Fundraising help',
  'Introductions',
  'Mentorship',
  'Design feedback',
  'Marketing guidance',
  'Legal advice',
]

export default function ProfileSetupForm({ onSubmit }: ProfileSetupFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    role: '',
    company: '',
    current_work: '',
    looking_for: [],
    can_offer: [],
    interests: [],
  })

  const [interestInput, setInterestInput] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
    }

    if (!formData.current_work.trim()) {
      newErrors.current_work = 'Current work description is required'
    }

    if (formData.looking_for.length === 0) {
      newErrors.looking_for = 'Please select at least one option'
    }

    if (formData.can_offer.length === 0) {
      newErrors.can_offer = 'Please select at least one option'
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please add at least one interest'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMultiSelect = (field: 'looking_for' | 'can_offer', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const addInterest = () => {
    const trimmed = interestInput.trim()
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
      }))
      setInterestInput('')
      // Clear error when user adds an interest
      if (errors.interests) {
        setErrors((prev) => ({ ...prev, interests: undefined }))
      }
    }
  }

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((item) => item !== interest),
    }))
  }

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInterest()
    }
  }

  const isFormValid = 
    formData.name.trim() &&
    formData.role.trim() &&
    formData.company.trim() &&
    formData.current_work.trim() &&
    formData.looking_for.length > 0 &&
    formData.can_offer.length > 0 &&
    formData.interests.length > 0

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value })
            if (errors.name) setErrors({ ...errors, name: undefined })
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Your full name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="role"
          value={formData.role}
          onChange={(e) => {
            setFormData({ ...formData, role: e.target.value })
            if (errors.role) setErrors({ ...errors, role: undefined })
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.role ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Founder, Engineer, PM"
        />
        {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => {
            setFormData({ ...formData, company: e.target.value })
            if (errors.company) setErrors({ ...errors, company: undefined })
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.company ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Your company or organization"
        />
        {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
      </div>

      {/* Current Work */}
      <div>
        <label htmlFor="current_work" className="block text-sm font-medium text-gray-700 mb-1">
          What are you currently working on? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="current_work"
          value={formData.current_work}
          onChange={(e) => {
            setFormData({ ...formData, current_work: e.target.value })
            if (errors.current_work) setErrors({ ...errors, current_work: undefined })
          }}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.current_work ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your current projects, goals, or focus areas..."
        />
        {errors.current_work && <p className="mt-1 text-sm text-red-500">{errors.current_work}</p>}
      </div>

      {/* Looking For */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are you looking for? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LOOKING_FOR_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                formData.looking_for.includes(option)
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.looking_for.includes(option)}
                onChange={() => toggleMultiSelect('looking_for', option)}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {errors.looking_for && <p className="mt-1 text-sm text-red-500">{errors.looking_for}</p>}
      </div>

      {/* Can Offer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What can you offer? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CAN_OFFER_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                formData.can_offer.includes(option)
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.can_offer.includes(option)}
                onChange={() => toggleMultiSelect('can_offer', option)}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {errors.can_offer && <p className="mt-1 text-sm text-red-500">{errors.can_offer}</p>}
      </div>

      {/* Interests */}
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
          Interests <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="interests"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={handleInterestKeyDown}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add an interest (press Enter)"
          />
          <button
            type="button"
            onClick={addInterest}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Add
          </button>
        </div>
        {formData.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.interests && <p className="mt-1 text-sm text-red-500">{errors.interests}</p>}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isFormValid && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
