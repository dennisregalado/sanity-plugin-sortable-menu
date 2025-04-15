import React, {createContext, useContext} from 'react'
import {FlattenedItem} from '../types'
import {ArrayOfObjectsInputProps} from 'sanity'

interface TreeContextType {
  props: ArrayOfObjectsInputProps
  flattenedItems: FlattenedItem[]
  setFlattenedItems: (items: FlattenedItem[]) => void
  maxDepth: number
  indentation: number
}

const TreeContext = createContext<TreeContextType | undefined>(undefined)

export const useTree = () => {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider')
  }
  return context
}

export const TreeProvider: React.FC<{
  children: React.ReactNode
  value: TreeContextType
}> = ({children, value}) => {
  return <TreeContext.Provider value={{...value}}>{children}</TreeContext.Provider>
}
