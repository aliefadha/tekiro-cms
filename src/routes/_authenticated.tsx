import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Save current location for redirect after login
          redirect: location.href,
        },
      })
    }
  },

  component: () => <DashboardLayout />,
})
