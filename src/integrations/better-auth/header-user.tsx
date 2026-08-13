import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  // Ref, not just state: two clicks in the same tick (dblclick) share the same
  // stale closure before React re-renders, so `isSigningOut` alone can't stop the second one.
  const signOutInFlight = useRef(false)

  if (isPending) {
    return <Skeleton className="size-8 rounded-full" />
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarImage src={session.user.image ?? undefined} alt="" />
          <AvatarFallback>
            {session.user.name.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="outline"
          disabled={isSigningOut}
          onClick={() => {
            if (signOutInFlight.current) return
            signOutInFlight.current = true
            setIsSigningOut(true)
            void authClient.signOut().finally(() => {
              signOutInFlight.current = false
              setIsSigningOut(false)
            })
          }}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" render={<Link to="/login" />}>
      Sign in
    </Button>
  )
}
