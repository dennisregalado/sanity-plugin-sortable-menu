import type { FieldProps } from 'sanity'

export function TreeField(props: FieldProps) {
  return <div style={{
    marginLeft: 50,
  }}>
    {props.children}
  </div>
}