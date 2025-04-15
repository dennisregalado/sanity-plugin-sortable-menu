import type {CardTone} from '@sanity/ui'
import type {FormNodeValidation} from 'sanity'

export function getToneFromValidation(
  validations: FormNodeValidation[] | undefined,
): CardTone | undefined {
  if (!Array.isArray(validations) || validations.length === 0) {
    return undefined
  }

  const validationLevels = validations.map((v) => v.level)

  if (validationLevels.includes('error')) {
    return `critical`
  } else if (validationLevels.includes('warning')) {
    return `caution`
  }

  return undefined
}
