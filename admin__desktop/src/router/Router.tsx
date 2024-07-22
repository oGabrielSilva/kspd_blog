import { HomePage } from '@app/pages/HomePage'
import { SessionPage } from '@app/pages/SessionPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/session', element: <SessionPage /> },
])

export function Router() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}
