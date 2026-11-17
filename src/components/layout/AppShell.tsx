import { Outlet } from 'react-router'
import { Toast } from '../ui/Toast.tsx'
import { Sidebar } from './Sidebar.tsx'
import { TabBar } from './TabBar.tsx'

/**
 * Layout responsivo: barra de abas embaixo até 1024 px (celular e tablet),
 * menu lateral fixo acima disso (PC).
 */
export function AppShell() {
  return (
    <div className="flex min-h-full">
      <Sidebar />
      {/* pb extra no celular: espaço para a barra de abas e o botão "+" não cobrirem o último cartão */}
      <main className="min-w-0 flex-1 pt-[max(1.5rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(6rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] lg:px-10 lg:pt-10 lg:pb-10">
        <div className="mx-auto w-full max-w-3xl has-[[data-wide]]:max-w-6xl">
          <Outlet />
        </div>
      </main>
      <TabBar />
      <Toast />
    </div>
  )
}
