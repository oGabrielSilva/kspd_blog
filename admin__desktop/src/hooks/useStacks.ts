import { StackContext } from '@app/context/StackContext'
import { useContext } from 'react'

export function useStacks() {
  const { stacks, update, reloadStacks } = useContext(StackContext)

  return { stacks, update, reloadStacks }
}
