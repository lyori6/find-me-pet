"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface Pet {
  id: number
  name: string
  type: string
  breed: string
  image: string
}

interface PetCardProps {
  pet: Pet
}

export default function PetCard({ pet }: PetCardProps) {
  const router = useRouter()

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card
        className="overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-lg"
        onClick={() => router.push(`/pet/${pet.id}`)}
      >
        <div className="relative h-48">
          <Image
            src={pet.image || "/placeholder.svg"}
            alt={`${pet.name}, a ${pet.breed} ${pet.type}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{pet.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {pet.type} - {pet.breed}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

