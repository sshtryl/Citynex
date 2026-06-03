import { ProtectedRoute } from "@/components/protectedRoute"
import { HomeContent } from "@/components/homeContent"

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  )
}