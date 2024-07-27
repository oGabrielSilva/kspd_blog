import { UITopAppBar } from '@app/components/shared/UITopAppBar'
import HomeContextProvider from '@app/context/HomeContext'
import { HomePage } from '@app/pages/HomePage'
import { SessionPage } from '@app/pages/SessionPage'
import { UserPage } from '@app/pages/UserPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const Page = ({ children }: IChildren) => (
  <div>
    <UITopAppBar />
    <div data-page-container>{children}</div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <HomeContextProvider>
        <Page>
          <HomePage />
        </Page>
      </HomeContextProvider>
    ),
  },
  {
    path: '/session',
    element: (
      <Page>
        <SessionPage />
      </Page>
    ),
  },
  {
    path: '/user',
    element: (
      <Page>
        <UserPage />
      </Page>
    ),
  },
])

export function Router() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}
