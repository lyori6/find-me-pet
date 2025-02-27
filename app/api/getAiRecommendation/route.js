import OpenAI from 'openai';

// Initialize OpenAI client with better error handling for token issues
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not defined in environment variables');
    throw new Error('OpenAI API key is missing');
  }
  
  return new OpenAI({
    apiKey,
    maxRetries: 3, // Add retries for transient errors
    timeout: 60000, // Increase timeout to 60 seconds
  });
};

// Get a fresh client for each request
const getClient = () => {
  try {
    return getOpenAIClient();
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    throw error;
  }
};

export async function POST(request) {
  try {
    // Get a fresh client for each request to avoid token expiration issues
    const openai = getClient();
    
    // Extract data from the request
    const { selectedTypes, zipCode, filteredAnimals } = await request.json();
    
    // Add detailed debugging
    console.log('API REQUEST DETAILS:');
    console.log('- Zip Code:', zipCode);
    console.log('- Selected Types:', selectedTypes);
    console.log('- Number of filtered animals:', filteredAnimals?.length || 'None');
    
    // Check if we actually have pet data
    if (!filteredAnimals || !Array.isArray(filteredAnimals) || filteredAnimals.length === 0) {
      console.log('- No pets available in request');
      return Response.json({ 
        error: "No animals provided in the request" 
      }, { status: 400 });
    }
    
    // Log a sample pet to verify data structure
    const samplePet = filteredAnimals[0];
    console.log('- Sample pet:', JSON.stringify({
      id: samplePet.id,
      name: samplePet.name,
      type: samplePet.type
    }));
    
    // Normalize the pet types for comparison
    const normalizeType = (type) => {
      if (!type) return '';
      type = String(type).toLowerCase().trim();
      // Handle singular/plural forms
      if (type === 'dogs') return 'dog';
      if (type === 'cats') return 'cat';
      if (type === 'rabbits') return 'rabbit';
      return type;
    };
    
    // Get normalized selected types
    const normalizedSelectedTypes = (selectedTypes || []).map(normalizeType);
    console.log('Normalized selected types:', normalizedSelectedTypes);
    
    // Prepare pet data in a clear, structured format
    const petData = filteredAnimals.slice(0, 10).map((animal, index) => {
      const normalizedType = normalizeType(animal.type);
      
      // Include the animal in the filtered list if it matches the selected types
      // If no types are selected, include all animals
      const matchesSelectedType = normalizedSelectedTypes.length === 0 || 
                                 normalizedSelectedTypes.includes(normalizedType);
                                 
      if (matchesSelectedType) {
        console.log(`Including pet ${animal.name} (${animal.id}) of type ${animal.type} in the recommendation data`);
      }
      
      return {
        id: animal.id,
        name: animal.name,
        type: animal.type,
        breed: animal.breeds?.primary || 'Unknown',
        age: animal.age || 'Unknown',
        size: animal.size || 'Medium',
        gender: animal.gender || 'Unknown',
        characteristics: [
          animal.colors?.primary ? `${animal.colors.primary} color` : null,
          animal.attributes?.spayed_neutered ? 'fixed' : null,
          animal.attributes?.house_trained ? 'house trained' : null,
          animal.environment?.children === true ? 'good with children' : null,
          animal.environment?.dogs === true ? 'good with dogs' : null,
          animal.environment?.cats === true ? 'good with cats' : null,
        ].filter(Boolean).join(', '),
        matchesType: matchesSelectedType
      };
    });
    
    // Filter to only include pets that match the selected types
    const matchingPets = petData.filter(pet => pet.matchesType);
    
    // If we have no matching pets, use all pets
    const petsToRecommend = matchingPets.length > 0 ? matchingPets : petData;
    
    console.log(`Found ${petsToRecommend.length} pets matching the criteria out of ${petData.length} total`);
    
    // Format the pet data as a clear, numbered list for the AI
    const formattedPetList = petsToRecommend.map((pet, i) => 
      `${i+1}. ${pet.name} (ID: ${pet.id})
  - Type: ${pet.type}
  - Breed: ${pet.breed}
  - Age: ${pet.age}
  - Size: ${pet.size}
  - Gender: ${pet.gender}
  - Characteristics: ${pet.characteristics || 'None specified'}`
    ).join('\n\n');
    
    // Create a clear, concise prompt
    const petType = selectedTypes && selectedTypes.length > 0 
      ? selectedTypes.join(' or ') 
      : 'any pet';
      
    const promptTemplate = `
I am looking for ${petType} near ${zipCode}.

Here are the available pets to choose from - ONLY recommend one from this list:

${formattedPetList}

${process.env.OPENAI_PROMPT || `
Based on these available animals, provide a single recommendation for the best match. Your response should:
1. Select ONE specific pet from the list above
2. Provide a friendly, compassionate explanation (2-3 sentences) of why this pet might be a good match
3. Include 3 specific matching qualities (expressed as percentages between 70-95%) that make this pet a good companion.

Your response should ONLY include:
- Name of the selected pet
- Brief explanation of why it's a good match
- Three match qualities with percentages.

DO NOT include any other information. Keep your response concise and focused.
`}
`;

    // Generate the AI recommendation with improved system message
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the more reliable model
      messages: [
        { 
          role: "system", 
          content: `
You are a helpful pet adoption assistant who recommends the perfect pet match from a list of available animals.

IMPORTANT RULES:
1. You MUST ONLY recommend pets from the numbered list provided - no exceptions
2. You MUST include the pet's exact name as provided in the list
3. You MUST provide 3 matching qualities with percentages between 70-95%
4. DO NOT apologize, give disclaimers, or add additional commentary
5. DO NOT mention that you're an AI or that you're selecting from a list
6. DO NOT make up information not included in the list

Format your recommendation exactly like this example:
---
I recommend Bella.

Bella would be a perfect companion because she's a friendly and affectionate cat who enjoys cuddles and playtime. Her gentle nature makes her ideal for a family seeking a loving pet.

Affectionate: 85%
Playfulness: 80%
Gentleness: 90%
---
` 
        },
        { role: "user", content: promptTemplate }
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    // Extract the response text
    const recommendationText = completion.choices[0].message.content.trim();
    
    // Log the raw AI response for debugging
    console.log('Raw AI recommendation response:', recommendationText);
    
    // Extract pet name from the response - look for "I recommend [Name]" pattern
    const nameMatch = recommendationText.match(/I recommend ([^\.]+)/i);
    let petName = nameMatch ? nameMatch[1].trim() : null;
    
    // If no name match, try to find a name at the beginning of a line
    if (!petName) {
      const lines = recommendationText.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (line && !line.toLowerCase().startsWith('i recommend') && line.length < 30) {
          // Check if this line matches any pet names
          const matchingPet = petsToRecommend.find(pet => 
            line.toLowerCase().includes(pet.name.toLowerCase())
          );
          if (matchingPet) {
            petName = matchingPet.name;
            break;
          }
        }
      }
    }
    
    // If still no pet name, use the first pet as fallback
    if (!petName && petsToRecommend.length > 0) {
      console.log("Could not extract pet name from AI response, using first pet as fallback");
      petName = petsToRecommend[0].name;
    }
    
    // Find the pet ID by matching the name
    let petId = null;
    const matchingPet = petsToRecommend.find(pet => 
      pet.name.toLowerCase() === (petName || '').toLowerCase()
    );
    
    if (matchingPet) {
      petId = matchingPet.id;
      console.log(`Found matching pet ID ${petId} for name ${petName}`);
    } else if (petsToRecommend.length > 0) {
      // If no matching pet, use the first one as fallback
      petId = petsToRecommend[0].id;
      petName = petsToRecommend[0].name;
      console.log(`No pet matched by name. Using first pet ${petName} (${petId}) as fallback`);
    }
    
    // Extract reason for the match - everything between the name and the stats
    let matchReason = '';
    if (petName) {
      const nameIndex = recommendationText.toLowerCase().indexOf(petName.toLowerCase());
      if (nameIndex !== -1) {
        const afterName = recommendationText.substring(nameIndex + petName.length);
        
        // Look for patterns that typically indicate the start of stats section
        const statsSectionIndicators = [
          /\n\s*[A-Za-z\s]+:\s*\d+\s*%/, // Line break followed by "Something: XX%"
          /\.\s*[A-Za-z\s]+:\s*\d+\s*%/, // Period followed by "Something: XX%"
          /\n\n/                         // Double line break
        ];
        
        let cutoffIndex = afterName.length;
        
        // Find the earliest indicator of stats section
        for (const pattern of statsSectionIndicators) {
          const match = afterName.match(pattern);
          if (match && match.index < cutoffIndex) {
            // For newline or period patterns, cut at the match start
            // For other patterns that include the stat name, cut precisely before the stat starts
            if (pattern.toString().includes('\\n\\n')) {
              cutoffIndex = match.index;
            } else {
              cutoffIndex = match.index;
              // If we matched a pattern with a period, include the period in the reason text
              if (pattern.toString().includes('\\.')) {
                cutoffIndex += 1; // Include the period
              }
            }
          }
        }
        
        // Extract the text up to our determined cutoff point
        matchReason = afterName.substring(0, cutoffIndex).trim();
        
        // Clean up the match reason
        matchReason = matchReason.replace(/^\W+|\W+$/g, ''); // Remove leading/trailing non-word chars
        
        // Final check - if the matchReason contains a percentage pattern, truncate it there
        const percentCheck = matchReason.search(/\d+\s*%/);
        if (percentCheck !== -1) {
          matchReason = matchReason.substring(0, percentCheck).trim();
        }
      }
    }
    
    // Extract stats with percentages
    const stats = [];
    const statsRegex = /([A-Za-z\s]+):\s*(\d+)\s*%/g;
    let statsMatch;
    while ((statsMatch = statsRegex.exec(recommendationText)) !== null) {
      stats.push({
        label: statsMatch[1].trim(),
        value: parseInt(statsMatch[2])
      });
    }
    
    // Create default stats if none were found
    if (stats.length === 0) {
      console.log("No stats found in AI response, using defaults");
      stats.push(
        { label: "Compatibility", value: 85 },
        { label: "Adaptability", value: 80 },
        { label: "Care Level", value: 75 }
      );
    }
    
    // Limit to 3 stats
    const limitedStats = stats.slice(0, 3);
    
    // Create the final recommendation object
    const recommendation = {
      petId,
      petName,
      matchReason: matchReason || `${petName} would be a great companion for your home based on your preferences.`,
      stats: limitedStats
    };
    
    // Return the structured recommendation
    return Response.json({
      recommendation,
      rawResponse: recommendationText
    });
    
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    
    return Response.json({ 
      error: "Failed to generate AI recommendation: " + (error.message || "Unknown error")
    }, { status: 500 });
  }
}
