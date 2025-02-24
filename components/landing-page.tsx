import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-text">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-tight">Welcome to PetMatch</h1>
      <p className="text-xl md:text-2xl text-subtle text-center mb-12 max-w-2xl">
        Find your perfect pet companion based on your lifestyle!
      </p>
      <Link href="/questionnaire">
        <Button
          size="lg"
          className="text-xl px-12 py-6 bg-gradient-to-r from-primary to-primary-light text-white hover:scale-105 active:scale-98 transition-transform duration-200 shadow-lg hover:shadow-xl"
        >
          Get Started
        </Button>
      </Link>
    </div>
  )
}

