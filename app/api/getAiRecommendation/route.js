import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { selectedTypes, zipCode, filteredAnimals } = body;
    
    if (!filteredAnimals || !Array.isArray(filteredAnimals)) {
      return Response.json({ error: 'Invalid data format. Animals data is required.' }, { status: 400 });
    }

    // Sample pets (limit to 5 for reasonable prompt size)
    const petSamples = filteredAnimals.slice(0, 5).map(animal => ({
      id: animal.id,
      name: animal.name,
      type: animal.type,
      breed: animal.breeds?.primary || 'Unknown',
      age: animal.age || 'Unknown',
      size: animal.size || 'Unknown',
      characteristics: [
        animal.colors?.primary,
        animal.attributes?.spayed_neutered ? 'fixed' : 'not fixed',
        animal.attributes?.house_trained ? 'house trained' : 'not house trained',
        ...Object.entries(animal.environment || {})
          .filter(([_, value]) => value === true)
          .map(([key]) => `good with ${key}`)
      ].filter(Boolean)
    }));

    // Construct the prompt based on user preferences
    const petType = selectedTypes && selectedTypes.length > 0 
      ? selectedTypes.join(' or ') 
      : 'any pet';
    
    const prompt = `
You are a helpful pet adoption assistant. A user is searching for ${petType} in zip code ${zipCode}.
Here are 5 pets that match their initial search criteria:

${petSamples.map((pet, index) => `
${index + 1}. ${pet.name} (ID: ${pet.id}):
   - Type: ${pet.type}
   - Breed: ${pet.breed}
   - Age: ${pet.age}
   - Size: ${pet.size}
   - Characteristics: ${pet.characteristics.join(', ')}
`).join('\n')}

Based on these available animals, provide a single recommendation for the best match. Your response should:
1. Select ONE specific pet from the list above
2. Provide a friendly, compassionate explanation (2-3 sentences) of why this pet might be a good match
3. Include 3 specific matching qualities (expressed as percentages between 70-95%) that make this pet a good companion

Your response should ONLY include:
- Name of the selected pet
- Brief explanation of why it's a good match
- Three match qualities with percentages

DO NOT include any other information. Keep your response concise and focused.
`;

    // Generate the AI recommendation 
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful pet adoption assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    // Extract the response text
    const recommendationText = completion.choices[0].message.content.trim();
    
    // Parse the recommendation text to extract structured data
    // Note: This parsing is simplified and may need refinement
    const lines = recommendationText.split('\n').filter(line => line.trim());
    
    // Try to extract pet name (usually the first line or starts with "Name:")
    let petName = filteredAnimals[0].name; // Default fallback
    let matchReason = "";
    const stats = [];
    
    // Basic parsing logic (this could be improved with regex for better extraction)
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key.toLowerCase().includes('name')) {
          petName = value;
        }
      } else if (line.includes('%')) {
        // This is likely a stat
        const match = line.match(/(.+?)(\d+)%/);
        if (match) {
          stats.push({
            label: match[1].trim(),
            value: parseInt(match[2], 10)
          });
        }
      } else if (line.length > 20 && !line.startsWith('-')) {
        // This is likely the match reason
        matchReason = line;
      }
    }
    
    // Return the structured recommendation
    return Response.json({
      recommendation: {
        petName,
        matchReason: matchReason || `${petName} seems like a great fit for your lifestyle!`,
        stats: stats.length ? stats : [
          { label: "Compatibility", value: 85 },
          { label: "Adaptability", value: 80 },
          { label: "Care Level", value: 75 }
        ]
      },
      rawResponse: recommendationText
    });
    
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    return Response.json(
      { error: 'Failed to generate recommendation. Please try again later.' },
      { status: 500 }
    );
  }
}
