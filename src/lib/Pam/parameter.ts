import type { Cli } from '@wollybeard/kit'
import type { OakSchema } from '../../schema/oak-schema.js'

export interface Parameter<$Schema extends OakSchema = OakSchema> {
  _tag: 'Basic'
  name: Cli.Param
  type: $Schema
}
