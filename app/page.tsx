import { redirect } from 'next/navigation'

// The proxy sends signed-out visitors to /welcome before this renders.
export default function Home() {
  redirect('/today')
}
