import type { Cli } from '@wollybeard/kit'
import { Str } from '@wollybeard/kit'
import type { Settings } from '../../Settings/_.ts'
import type { Environment } from './types.js'

/**
 * Parse the specification for a parameter's environment support.
 */
export const processEnvironment = (settings: Settings.Output, name: Cli.Param): Environment => {
  const hasEnvironment = settings.parameters.environment[name.canonical]?.enabled
    ?? settings.parameters.environment.$default.enabled
  return hasEnvironment
    ? {
      enabled: hasEnvironment,
      namespaces: (
        settings.parameters.environment[name.canonical]?.prefix
          ?? settings.parameters.environment.$default.prefix
      ).map((_) => Str.Case.camel(_)),
    }
    : null
}
