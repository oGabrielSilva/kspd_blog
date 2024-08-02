import { UINewStack } from '@app/components/home/stack/UINewStack'
import { UITopAppBar } from '@app/components/shared/UITopAppBar'
import HomeContextProvider from '@app/context/HomeContext'
import { EditPostPage } from '@app/pages/EditPostPage'
import { HomePage } from '@app/pages/HomePage'
import { SessionPage } from '@app/pages/SessionPage'
import { UserPage } from '@app/pages/UserPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

interface IPageProps extends IChildren {}

const Page = ({ children }: IPageProps) => (
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
    path: '/edit-post/:uid',
    element: (
      <>
        <div>
          <UITopAppBar removeGoBackButton removeOffcanvas />
          <div data-page-container>
            <HomeContextProvider>
              <EditPostPage />
            </HomeContextProvider>
          </div>
        </div>
      </>
    ),
  },
  {
    path: '/new-stack',
    element: (
      <>
        <div>
          <UITopAppBar removeAvatar removeGoBackButton removeOffcanvas />
          <div data-page-container>
            <HomeContextProvider>
              <div className="container p-5">
                <UINewStack closeWinwWhenFinished />
              </div>
            </HomeContextProvider>
          </div>
        </div>
      </>
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
