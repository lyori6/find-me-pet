"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/ui/icons"

// Mock data for demonstration purposes
const mockPetData = {
  id: 123,
  name: "Buddy",
  type: "Dog",
  species: "Dog",
  breeds: { primary: "Golden Retriever", secondary: null, mixed: false, unknown: false },
  age: "Young",
  gender: "Male",
  size: "Large",
  coat: "Long",
  colors: { primary: "Golden", secondary: null, tertiary: null },
  attributes: {
    spayed_neutered: true,
    house_trained: true,
    declawed: null,
    special_needs: false,
    shots_current: true,
  },
  environment: { children: true, dogs: true, cats: false },
  tags: ["Friendly", "Playful", "Energetic", "Loyal", "Affectionate"],
  description:
    "Buddy is a lovable Golden Retriever who's full of energy and always ready for adventure. He's great with kids and other dogs, making him the perfect family companion. Buddy is house trained and up to date on his shots. He loves long walks, playing fetch, and cuddling on the couch. If you're looking for a loyal and affectionate friend, Buddy might be the perfect match for you!",
  photos: [
    {
      small: "/placeholder.svg?height=300&width=300",
      medium: "/placeholder.svg?height=600&width=600",
      large: "/placeholder.svg?height=1200&width=1200",
      full: "/placeholder.svg?height=1200&width=1200",
    },
    {
      small: "/placeholder.svg?height=300&width=300",
      medium: "/placeholder.svg?height=600&width=600",
      large: "/placeholder.svg?height=1200&width=1200",
      full: "/placeholder.svg?height=1200&width=1200",
    },
  ],
  videos: [],
  status: "adoptable",
  published_at: "2023-04-20T18:48:51+0000",
  contact: {
    email: "adopt@example.com",
    phone: "(555) 555-5555",
    address: {
      address1: "123 Adoption Lane",
      address2: null,
      city: "Petville",
      state: "CA",
      postcode: "12345",
      country: "US",
    },
  },
  _links: {
    self: { href: "/v2/animals/123" },
    type: { href: "/v2/types/dog" },
    organization: { href: "/v2/organizations/CA123" },
  },
}

export default function PetPage() {
  const { id } = useParams()
  const [pet, setPet] = useState(mockPetData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simulate API call
    const timer = setTimeout(() => {
      // In a real application, you would fetch the pet data using the id
      // For now, we'll just use the mock data
      setPet({ ...mockPetData, id: Number(id) })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Link href="/results">
          <Button variant="ghost">
            <Icons.arrowLeft className="mr-2 h-4 w-4" /> Back to Results
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">{pet.name}</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">About {pet.name}</h2>
              <p className="text-gray-700">{pet.description}</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Breed:</strong> {pet.breeds.primary}
                  </p>
                  <p>
                    <strong>Age:</strong> {pet.age}
                  </p>
                  <p>
                    <strong>Gender:</strong> {pet.gender}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Size:</strong> {pet.size}
                  </p>
                  <p>
                    <strong>Coat:</strong> {pet.coat}
                  </p>
                  <p>
                    <strong>Color:</strong> {pet.colors.primary}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">Environment</h2>
              <div className="grid grid-cols-3 gap-4">
                <EnvironmentItem icon="🧒" label="Kids" value={pet.environment.children} />
                <EnvironmentItem icon="🐕" label="Dogs" value={pet.environment.dogs} />
                <EnvironmentItem icon="🐈" label="Cats" value={pet.environment.cats} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Carousel className="w-full max-w-xl mx-auto mb-8">
            <CarouselContent>
              {pet.photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-2">
                      <Image
                        src={photo.medium || "/placeholder.svg"}
                        alt={`${pet.name} - Photo ${index + 1}`}
                        width={600}
                        height={600}
                        className="rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Attributes</h2>
          <div className="flex flex-wrap gap-2">
            {pet.attributes.spayed_neutered && <Badge>Spayed/Neutered</Badge>}
            {pet.attributes.house_trained && <Badge>House Trained</Badge>}
            {pet.attributes.special_needs && <Badge variant="destructive">Special Needs</Badge>}
            {pet.attributes.shots_current && <Badge>Shots Current</Badge>}
          </div>
        </div>

        {pet.tags.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-2">Personality</h2>
            <div className="flex flex-wrap gap-2">
              {pet.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p>
              <strong>Email:</strong>
            </p>
            <p>{pet.contact.email}</p>
          </div>
          <div>
            <p>
              <strong>Phone:</strong>
            </p>
            <p>{pet.contact.phone}</p>
          </div>
          <div>
            <p>
              <strong>Location:</strong>
            </p>
            <p>
              {pet.contact.address.city}, {pet.contact.address.state} {pet.contact.address.postcode}
            </p>
          </div>
        </div>
      </Card>

      <div>
        <Link href={pet._links.self.href} target="_blank" rel="noopener noreferrer">
          <Button className="w-full text-xl py-6 bg-gradient-to-r from-primary to-primary-light text-white hover:scale-105 active:scale-98 transition-transform duration-200 shadow-lg hover:shadow-xl">
            Adopt {pet.name}
          </Button>
        </Link>
      </div>
    </div>
  )
}

function EnvironmentItem({ icon, label, value }: { icon: string; label: string; value: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg ${value ? "bg-gradient-to-br from-primary/20 to-secondary/20" : "bg-gray-100"}`}
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="font-medium">{label}</span>
      {value ? <Icons.check className="text-green-500 mt-2" /> : <Icons.x className="text-red-500 mt-2" />}
    </div>
  )
}

