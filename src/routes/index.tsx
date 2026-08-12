import { Link, createFileRoute } from '@tanstack/react-router'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

const FEATURES = [
  {
    title: 'Type-Safe Routing',
    description: 'Routes and links stay in sync across every page.',
  },
  {
    title: 'Server Functions',
    description:
      'Call server code from your UI without creating API boilerplate.',
  },
  {
    title: 'Streaming by Default',
    description:
      'Ship progressively rendered responses for faster experiences.',
  },
  {
    title: 'Tailwind Native',
    description:
      'Design quickly with utility-first styling and reusable tokens.',
  },
]

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-14 pb-8">
      <Card>
        <CardHeader>
          <Badge variant="secondary">TanStack Start Base Template</Badge>
          <CardTitle className="font-display max-w-3xl text-4xl leading-tight sm:text-6xl">
            Start simple, ship quickly.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base sm:text-lg">
            This base starter intentionally keeps things light: two routes,
            clean structure, and the essentials you need to build from scratch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button size="lg" render={<Link to="/about" />}>
            About This Starter
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={
              <a
                href="https://tanstack.com/router"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Router Guide
          </Button>
        </CardContent>
      </Card>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
            <li>
              Edit <code>src/routes/index.tsx</code> to customize the home page.
            </li>
            <li>
              Update <code>src/components/header.tsx</code> and{' '}
              <code>src/components/footer.tsx</code> for brand links.
            </li>
            <li>
              Add routes in <code>src/routes</code> and tweak design tokens in{' '}
              <code>src/styles.css</code>.
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
