import { render } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider, useStore } from '../../store'

/**
 * Renders a component with both MemoryRouter and StoreProvider.
 * Use for page/component tests that need store access and routing.
 */
export function renderWithStore(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <StoreProvider>{ui}</StoreProvider>
    </MemoryRouter>
  )
}

/**
 * Returns a live store hook result wrapped in StoreProvider.
 * Use for unit-testing store actions directly without rendering a page.
 *
 * @example
 * const store = useTestStore()
 * act(() => store.addContact({ name: 'Alice' }))
 * expect(store.data.contacts).toHaveLength(seedContactCount + 1)
 */
export function useTestStore() {
  const { result } = renderHook(() => useStore(), {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <StoreProvider>{children}</StoreProvider>
      </MemoryRouter>
    ),
  })
  return result
}

/**
 * Convenience: run an action inside act() and return the updated store ref.
 */
export async function storeAct(storeRef, fn) {
  await act(async () => { fn(storeRef.current) })
  return storeRef.current
}
