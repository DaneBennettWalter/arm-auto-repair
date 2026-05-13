import express from 'express'

// ==========================================
// VALIDATION TYPES AND INTERFACES
// ==========================================

export interface ValidationField {
  required?: boolean
  type?: 'string' | 'number' | 'email' | 'uuid' | 'boolean' | 'array' | 'date'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  enum?: string[]
  custom?: (value: any) => boolean | string
}

export interface ValidationSchema {
  [field: string]: ValidationField
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  data?: Record<string, any>
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export function sanitizeString(str: unknown, maxLength = 500): string {
  if (typeof str !== 'string') return ''
  return str.trim().slice(0, maxLength)
}

export function stripHtml(str: unknown, maxLength = 500): string {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLength)
}

// ==========================================
// CORE VALIDATION FUNCTION
// ==========================================

export function validate(data: any, schema: ValidationSchema): ValidationResult {
  const errors: ValidationError[] = []
  const validatedData: Record<string, any> = {}

  for (const [fieldName, field] of Object.entries(schema)) {
    const value = data[fieldName]

    // Check if field is required
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`
      })
      continue
    }

    // If field is not required and empty, skip validation
    if (!field.required && (value === undefined || value === null || value === '')) {
      validatedData[fieldName] = null
      continue
    }

    // Type validation and conversion
    let processedValue = value

    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a string`
          })
          continue
        }
        processedValue = sanitizeString(value, field.maxLength || 5000)
        break

      case 'number':
        const numValue = Number(value)
        if (isNaN(numValue) || !isFinite(numValue)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid number`
          })
          continue
        }
        processedValue = numValue
        break

      case 'email':
        if (typeof value !== 'string' || !isValidEmail(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid email address`
          })
          continue
        }
        processedValue = value.toLowerCase().trim()
        break

      case 'uuid':
        if (typeof value !== 'string' || !isValidUUID(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid UUID`
          })
          continue
        }
        processedValue = value.toLowerCase()
        break

      case 'boolean':
        if (typeof value === 'boolean') {
          processedValue = value
        } else if (typeof value === 'string') {
          processedValue = value.toLowerCase() === 'true'
        } else {
          processedValue = Boolean(value)
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be an array`
          })
          continue
        }
        processedValue = value
        break

      case 'date':
        if (typeof value !== 'string' || !isValidDate(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid date`
          })
          continue
        }
        processedValue = new Date(value)
        break
    }

    // Length validation for strings
    if (field.type === 'string' && typeof processedValue === 'string') {
      if (field.minLength && processedValue.length < field.minLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${field.minLength} characters long`
        })
        continue
      }
      if (field.maxLength && processedValue.length > field.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be no more than ${field.maxLength} characters long`
        })
        continue
      }
    }

    // Numeric range validation
    if (field.type === 'number' && typeof processedValue === 'number') {
      if (field.min !== undefined && processedValue < field.min) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${field.min}`
        })
        continue
      }
      if (field.max !== undefined && processedValue > field.max) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be no more than ${field.max}`
        })
        continue
      }
    }

    // Array length validation
    if (field.type === 'array' && Array.isArray(processedValue)) {
      if (field.minLength && processedValue.length < field.minLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must have at least ${field.minLength} items`
        })
        continue
      }
      if (field.maxLength && processedValue.length > field.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must have no more than ${field.maxLength} items`
        })
        continue
      }
    }

    // Pattern validation
    if (field.pattern && typeof processedValue === 'string') {
      if (!field.pattern.test(processedValue)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} format is invalid`
        })
        continue
      }
    }

    // Enum validation
    if (field.enum && !field.enum.includes(processedValue)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be one of: ${field.enum.join(', ')}`
      })
      continue
    }

    // Custom validation
    if (field.custom) {
      const customResult = field.custom(processedValue)
      if (typeof customResult === 'string') {
        errors.push({
          field: fieldName,
          message: customResult
        })
        continue
      } else if (customResult === false) {
        errors.push({
          field: fieldName,
          message: `${fieldName} is invalid`
        })
        continue
      }
    }

    validatedData[fieldName] = processedValue
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? validatedData : undefined
  }
}

// ==========================================
// EXPRESS MIDDLEWARE FACTORY
// ==========================================

export function validateMiddleware(schema: ValidationSchema) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = validate(req.body, schema)
    
    if (!result.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors
      })
    }

    // Replace req.body with validated and sanitized data
    req.body = result.data

    next()
  }
}

// ==========================================
// QUERY PARAMETER VALIDATION
// ==========================================

export function validateQuery(query: any, schema: ValidationSchema): ValidationResult {
  return validate(query, schema)
}

export function validateQueryMiddleware(schema: ValidationSchema) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = validateQuery(req.query, schema)
    
    if (!result.valid) {
      return res.status(400).json({
        error: 'Query validation failed',
        details: result.errors
      })
    }

    // Replace req.query with validated data
    req.query = result.data as any

    next()
  }
}

// ==========================================
// COMMON VALIDATION SCHEMAS
// ==========================================

export const authSchemas = {
  register: {
    email: { required: true, type: 'email' as const },
    password: { required: true, type: 'string' as const, minLength: 6, maxLength: 128 },
    displayName: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 }
  },
  
  login: {
    email: { required: true, type: 'email' as const },
    password: { required: true, type: 'string' as const, maxLength: 128 }
  },
  
  updateProfile: {
    displayName: { type: 'string' as const, minLength: 1, maxLength: 100 },
    bio: { type: 'string' as const, maxLength: 500 },
    avatarUrl: { type: 'string' as const, maxLength: 500, pattern: /^https?:\/\/.+/ }
  },
  
  changePassword: {
    currentPassword: { required: true, type: 'string' as const, maxLength: 128 },
    newPassword: { required: true, type: 'string' as const, minLength: 6, maxLength: 128 }
  }
}

export const paymentSchemas = {
  createPayment: {
    toUserId: { required: true, type: 'uuid' as const },
    amount: { required: true, type: 'number' as const, min: 0.01, max: 999999 },
    description: { type: 'string' as const, maxLength: 500 },
    type: { type: 'string' as const, enum: ['p2p', 'invoice', 'payroll', 'subscription'] },
    paymentMethod: { type: 'string' as const, enum: ['card', 'ach', 'btc', 'wallet'] },
    invoiceId: { type: 'string' as const, maxLength: 100 }
  },

  walletDeposit: {
    amount: { required: true, type: 'number' as const, min: 1, max: 10000 }
  },

  walletSend: {
    toUserId: { required: true, type: 'uuid' as const },
    amount: { required: true, type: 'number' as const, min: 0.01, max: 999999 },
    description: { type: 'string' as const, maxLength: 500 }
  },

  createInvoice: {
    customerEmail: { required: true, type: 'email' as const },
    customerName: { required: true, type: 'string' as const, maxLength: 200 },
    description: { type: 'string' as const, maxLength: 1000 },
    lineItems: { 
      required: true, 
      type: 'array' as const, 
      minLength: 1, 
      maxLength: 100,
      custom: (items: any[]) => {
        if (!Array.isArray(items)) return 'Line items must be an array'
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (!item.description || typeof item.description !== 'string') {
            return `Line item ${i + 1} must have a description`
          }
          if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 99999) {
            return `Line item ${i + 1} must have a valid quantity`
          }
          if (typeof item.unitAmount !== 'number' || item.unitAmount < 0 || item.unitAmount > 999999) {
            return `Line item ${i + 1} must have a valid unit amount`
          }
        }
        return true
      }
    },
    dueDate: { type: 'date' as const }
  }
}

export const socialSchemas = {
  createPost: {
    content: { required: true, type: 'string' as const, minLength: 1, maxLength: 5000 },
    type: { type: 'string' as const, enum: ['text', 'image', 'video', 'link', 'poll', 'auto'] },
    visibility: { type: 'string' as const, enum: ['public', 'friends', 'private'] },
    businessId: { type: 'uuid' as const },
    projectId: { type: 'uuid' as const },
    propertyId: { type: 'uuid' as const }
  },

  updatePost: {
    content: { type: 'string' as const, minLength: 1, maxLength: 5000 },
    visibility: { type: 'string' as const, enum: ['public', 'friends', 'private'] }
  },

  createComment: {
    content: { required: true, type: 'string' as const, minLength: 1, maxLength: 1000 }
  },

  connectionRequest: {
    userId: { required: true, type: 'uuid' as const }
  }
}

export const propertySchemas = {
  createProperty: {
    name: { required: true, type: 'string' as const, maxLength: 200 },
    address: { type: 'string' as const, maxLength: 500 },
    city: { type: 'string' as const, maxLength: 200 },
    state: { type: 'string' as const, maxLength: 50 },
    zip: { type: 'string' as const, maxLength: 20 },
    type: { type: 'string' as const, enum: ['residential', 'commercial', 'mixed', 'land'] },
    units: { type: 'number' as const, min: 1, max: 9999 },
    squareFootage: { type: 'number' as const, min: 1, max: 999999999 },
    yearBuilt: { type: 'number' as const, min: 1800, max: 2030 },
    purchasePrice: { type: 'number' as const, min: 0, max: 999999999 },
    currentValue: { type: 'number' as const, min: 0, max: 999999999 },
    monthlyRent: { type: 'number' as const, min: 0, max: 999999 },
    notes: { type: 'string' as const, maxLength: 2000 }
  }
}

export const querySchemas = {
  pagination: {
    limit: { type: 'number' as const, min: 1, max: 100 },
    offset: { type: 'number' as const, min: 0 }
  },

  search: {
    q: { type: 'string' as const, minLength: 1, maxLength: 100 }
  }
}