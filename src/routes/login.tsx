import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Spinner } from '#/components/ui/spinner'

const SIGN_IN_SCHEMA = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const SIGN_UP_SCHEMA = SIGN_IN_SCHEMA.extend({
  name: z.string().trim().min(1, 'Name is required'),
})

const DUPLICATE_EMAIL_CODE = 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const { data: session, isPending } = authClient.useSession()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsDuplicateEmail(false)

    const schema = isSignUp ? SIGN_UP_SCHEMA : SIGN_IN_SCHEMA
    const parsed = schema.safeParse({ email, password, name })

    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setIsLoading(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        if (result.error.code === DUPLICATE_EMAIL_CODE) {
          setIsDuplicateEmail(true)
        }
        setError(result.error.message || 'Authentication failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  function handleModeSwitch() {
    setIsSignUp(!isSignUp)
    setError('')
    setIsDuplicateEmail(false)
  }

  if (isPending) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <Spinner className="size-6" />
      </main>
    )
  }

  if (session?.user) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-3xl">
              Welcome back
            </CardTitle>
            <CardDescription>
              You&apos;re signed in as {session.user.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={session.user.image ?? undefined} alt="" />
              <AvatarFallback>
                {session.user.name.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {session.user.name}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {session.user.email}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                void authClient.signOut()
              }}
            >
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-3xl">
            {isSignUp ? 'Create an account' : 'Sign in'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Enter your information to create an account'
              : 'Enter your email below to login to your account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {isSignUp && (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </Field>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                    {isDuplicateEmail && (
                      <>
                        {' '}
                        <button
                          type="button"
                          className="font-medium underline underline-offset-4"
                          onClick={handleModeSwitch}
                        >
                          Sign in instead
                        </button>
                        ?
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner data-icon="inline-start" />}
                {isLoading
                  ? 'Please wait'
                  : isSignUp
                    ? 'Create account'
                    : 'Sign in'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <Button variant="link" size="sm" onClick={handleModeSwitch}>
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
