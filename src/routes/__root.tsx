import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { AuthState } from '@/auth'
import { AuthProvider } from '@/auth'

interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <AuthProvider>
        <Outlet />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </AuthProvider>
    </>
  ),
})
