import type { Name } from '@molt/name'
import type { MoltSchema } from '../../schema/molt-schema.js'

export interface Parameter<$Schema extends MoltSchema = MoltSchema> {
  _tag: 'Basic'
  name: Name.Data.NameParsed
  type: $Schema
}
