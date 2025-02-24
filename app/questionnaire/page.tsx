"use client"

import { useRouter } from "next/navigation"
import Questionnaire from "@/components/questionnaire"

export default function QuestionnairePage() {
  const router = useRouter()

  const handleSubmit = (formData: any) => {
    // Store answers in localStorage
    localStorage.setItem("petMatchPreferences", JSON.stringify(formData))
    // Navigate to results page
    router.push("/results")
  }

  return <Questionnaire onSubmit={handleSubmit} />
}

