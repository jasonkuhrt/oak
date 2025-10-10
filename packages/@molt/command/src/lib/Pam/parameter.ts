import type { Cli } from '@wollybeard/kit'
import type { MoltSchema } from '../../schema/molt-schema.js'

export interface Parameter<$Schema extends MoltSchema = MoltSchema> {
  _tag: 'Basic'
  name: Cli.FlagName.FlagName
  type: $Schema
}
