import { Link } from '@tanstack/react-router'
import { ChevronDownIcon } from 'lucide-react'
import BetterAuthHeader from '#/integrations/better-auth/header-user'
import ThemeToggle from '#/components/theme-toggle'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

const DEMO_LINKS = [
  { to: '/demo/drizzle', label: 'Drizzle' },
  { to: '/demo/better-auth', label: 'Better Auth' },
] as const

export default function Header() {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-lg">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3">
        <Button variant="ghost" size="lg" render={<Link to="/" />}>
          <span className="bg-primary size-2 rounded-full" />
          <span className="font-display text-base font-semibold">
            LocalOffice
          </span>
        </Button>

        <div className="order-3 flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto">
          <Button
            variant="ghost"
            render={<Link to="/" />}
            className="data-[status=active]:bg-muted"
          >
            Home
          </Button>
          <Button
            variant="ghost"
            render={<Link to="/about" />}
            className="data-[status=active]:bg-muted"
          >
            About
          </Button>
          <Button
            variant="ghost"
            render={
              <a
                href="https://tanstack.com/start/latest/docs/framework/react/overview"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Docs
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost">
                  Demos
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                {DEMO_LINKS.map((link) => (
                  <DropdownMenuItem
                    key={link.to}
                    render={<Link to={link.to} />}
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Follow TanStack on X"
            className="hidden sm:inline-flex"
            render={
              <a
                href="https://x.com/tan_stack"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z"
                  />
                </svg>
              </a>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go to TanStack GitHub"
            className="hidden sm:inline-flex"
            render={
              <a
                href="https://github.com/TanStack"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  />
                </svg>
              </a>
            }
          />
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
