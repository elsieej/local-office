import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '#/db/index'
import { todos } from '#/db/schema'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'
import { Field, FieldGroup } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Item, ItemContent, ItemGroup, ItemTitle } from '#/components/ui/item'

const CREATE_TODO_SCHEMA = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
})

const getTodos = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await db.query.todos.findMany({
    orderBy: [desc(todos.createdAt)],
  })
})

const createTodo = createServerFn({
  method: 'POST',
})
  .validator(CREATE_TODO_SCHEMA)
  .handler(async ({ data }) => {
    await db.insert(todos).values({ title: data.title })
    return { success: true }
  })

export const Route = createFileRoute('/demo/drizzle')({
  component: DemoDrizzle,
  loader: async () => await getTodos(),
})

function DemoDrizzle() {
  const router = useRouter()
  const todoList = Route.useLoaderData()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const title = new FormData(form).get('title')

    if (typeof title !== 'string' || title.trim() === '') {
      return
    }

    try {
      await createTodo({ data: { title } })
      router.invalidate()
      form.reset()
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <img src="/drizzle.svg" alt="" className="size-8" />
          <CardTitle className="font-display text-3xl">Drizzle Demo</CardTitle>
          <CardDescription>
            Todos read and written through a server function.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {todoList.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No todos yet</EmptyTitle>
                <EmptyDescription>Create one below.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className="gap-2">
              {todoList.map((todo) => (
                <Item key={todo.id} variant="outline">
                  <ItemContent>
                    <ItemTitle>{todo.title}</ItemTitle>
                  </ItemContent>
                  <Badge variant="secondary">#{todo.id}</Badge>
                </Item>
              ))}
            </ItemGroup>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field orientation="responsive">
                <Input
                  name="title"
                  placeholder="Add a new todo..."
                  aria-label="Todo title"
                  maxLength={200}
                  required
                />
                <Button type="submit">Add Todo</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Powered by Drizzle ORM</CardTitle>
          <CardDescription>
            Next-generation ORM for Node.js &amp; TypeScript with PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm font-medium">Setup Instructions:</p>
          <ol className="text-muted-foreground list-inside list-decimal space-y-2 text-sm">
            <li>
              Configure your <code>DATABASE_URL</code> in .env.local
            </li>
            <li>
              Run: <code>npm run db:generate</code>
            </li>
            <li>
              Run: <code>npm run db:migrate</code>
            </li>
            <li>
              Optional: <code>npm run db:studio</code>
            </li>
          </ol>
        </CardContent>
      </Card>
    </main>
  )
}
