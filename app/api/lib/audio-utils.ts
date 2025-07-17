const MAX_DURATION_MINUTES = 10
const MAX_FILE_SIZE_MB = 50

export function validateAudioLimits(duration?: number, fileSizeBytes?: number): {
  isValid: boolean
  message?: string
  warnings: string[]
} {
  const warnings: string[] = []
  
  // Check duration
  if (duration && duration > MAX_DURATION_MINUTES * 60) {
    return {
      isValid: false,
      message: `Audio duration (${Math.round(duration)}s) exceeds maximum limit of ${MAX_DURATION_MINUTES} minutes. Please use a shorter audio file.`,
      warnings
    }
  }
  
  // Check file size
  if (fileSizeBytes && fileSizeBytes > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return {
      isValid: false,
      message: `File size (${Math.round(fileSizeBytes / 1024 / 1024)}MB) exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB. Please use a smaller file.`,
      warnings
    }
  }
  
  // Add informational warnings
  if (duration) {
    if (duration > 5 * 60) { // 5 minutes
      warnings.push(`Large audio file (${Math.round(duration)}s). Processing may take longer.`)
    }
    warnings.push(`Audio duration: ${Math.round(duration)}s`)
  }
  
  return {
    isValid: true,
    warnings
  }
}

export function getAudioLimits() {
  return {
    maxDurationMinutes: MAX_DURATION_MINUTES,
    maxDurationSeconds: MAX_DURATION_MINUTES * 60,
    maxFileSizeMB: 50 // Reasonable file size limit
  }
} 