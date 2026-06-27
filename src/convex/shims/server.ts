interface MutationDef {
  args: unknown;
  handler: unknown;
}

interface QueryDef {
  args: unknown;
  handler: unknown;
}

interface ActionDef {
  args: unknown;
  handler: unknown;
}

export function mutation(_def: MutationDef): MutationDef {
  return _def;
}

export function query(_def: QueryDef): QueryDef {
  return _def;
}

export function action(_def: ActionDef): ActionDef {
  return _def;
}

export function internalMutation(_def: MutationDef): MutationDef {
  return _def;
}

export function internalQuery(_def: QueryDef): QueryDef {
  return _def;
}

export function internalAction(_def: ActionDef): ActionDef {
  return _def;
}

export function defineSchema(_tables: unknown): unknown {
  return _tables;
}

export function defineTable(_fields: unknown, _indexes?: unknown): unknown {
  return { fields: _fields, indexes: _indexes };
}
