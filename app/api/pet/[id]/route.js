import { getAccessToken } from '@/app/utils/petfinder';

// Helper function to generate enhanced descriptions
function enhanceDescription(pet) {
  if (!pet || !pet.description) return pet;
  
  // Original description
  const originalDesc = pet.description;
  console.log('Original description length:', originalDesc.length);
  
  // Generate additional content based on pet attributes
  let enhancedParts = [];
  
  // Add personality traits based on species and attributes
  if (pet.type === 'Dog') {
    if (pet.age === 'Baby' || pet.age === 'Young') {
      enhancedParts.push(`${pet.name} is a playful and energetic ${pet.age.toLowerCase()} ${pet.breeds.primary} who is still learning about the world. ${pet.gender === 'Male' ? 'He' : 'She'} loves to explore and is curious about everything around ${pet.gender === 'Male' ? 'him' : 'her'}.`);
    } else if (pet.age === 'Adult') {
      enhancedParts.push(`As an adult ${pet.breeds.primary}, ${pet.name} has a well-developed personality and knows what ${pet.gender === 'Male' ? 'he' : 'she'} wants. ${pet.gender === 'Male' ? 'He' : 'She'} combines playfulness with moments of calm reflection.`);
    } else if (pet.age === 'Senior') {
      enhancedParts.push(`${pet.name} is a dignified senior ${pet.breeds.primary} with a wealth of life experience. ${pet.gender === 'Male' ? 'He' : 'She'} prefers a relaxed lifestyle but still enjoys daily walks and quality time with ${pet.gender === 'Male' ? 'his' : 'her'} human companions.`);
    }
  } else if (pet.type === 'Cat') {
    if (pet.age === 'Baby' || pet.age === 'Young') {
      enhancedParts.push(`${pet.name} is an inquisitive and lively ${pet.age.toLowerCase()} ${pet.breeds.primary} who brings joy to every corner of the home. ${pet.gender === 'Male' ? 'He' : 'She'} is discovering the wonders of toys, climbing, and cozy nap spots.`);
    } else if (pet.age === 'Adult') {
      enhancedParts.push(`As an adult ${pet.breeds.primary}, ${pet.name} has mastered the perfect balance of independence and affection. ${pet.gender === 'Male' ? 'He' : 'She'} knows when to seek attention and when to enjoy some peaceful solitude.`);
    } else if (pet.age === 'Senior') {
      enhancedParts.push(`${pet.name} is a wise senior ${pet.breeds.primary} who has perfected the art of relaxation. ${pet.gender === 'Male' ? 'He' : 'She'} enjoys quiet companionship and will reward you with gentle purrs and loving gazes.`);
    }
  }
  
  // Add description based on size (for dogs)
  if (pet.type === 'Dog' && pet.size) {
    if (pet.size === 'Small') {
      enhancedParts.push(`Being a smaller dog, ${pet.name} would fit well in various living situations, including apartments. ${pet.gender === 'Male' ? 'He' : 'She'} doesn't need a huge yard but does enjoy regular walks and playtime.`);
    } else if (pet.size === 'Medium') {
      enhancedParts.push(`As a medium-sized dog, ${pet.name} is versatile and adaptable to different home environments. ${pet.gender === 'Male' ? 'He' : 'She'} enjoys a good balance of indoor comfort and outdoor activities.`);
    } else if (pet.size === 'Large' || pet.size === 'XLarge') {
      enhancedParts.push(`Being a larger dog, ${pet.name} would thrive in a home with adequate space to move around comfortably. ${pet.gender === 'Male' ? 'He' : 'She'} enjoys regular exercise and would make an excellent companion for active individuals or families.`);
    }
  }
  
  // Add temperament based on environment preferences
  if (pet.environment) {
    let environmentTraits = [];
    
    if (pet.environment.children === true) {
      environmentTraits.push(`gentle and patient with children`);
    }
    
    if (pet.environment.dogs === true) {
      environmentTraits.push(`sociable with other dogs`);
    }
    
    if (pet.environment.cats === true) {
      environmentTraits.push(`comfortable around cats`);
    }
    
    if (environmentTraits.length > 0) {
      const traitsText = environmentTraits.join(', ').replace(/, ([^,]*)$/, ' and $1');
      enhancedParts.push(`${pet.name} is ${traitsText}, making ${pet.gender === 'Male' ? 'him' : 'her'} a wonderful addition to ${environmentTraits.length > 1 ? 'multi-pet households' : 'homes with existing pets'}.`);
    }
  }
  
  // Add coat/grooming info if available
  if (pet.coat) {
    if (pet.coat === 'Short') {
      enhancedParts.push(`With a short coat, ${pet.name} requires minimal grooming - just occasional brushing to keep ${pet.gender === 'Male' ? 'his' : 'her'} coat healthy and reduce shedding.`);
    } else if (pet.coat === 'Medium') {
      enhancedParts.push(`${pet.name}'s medium-length coat benefits from regular brushing to prevent tangles and keep it looking its best. This grooming time can be a wonderful bonding opportunity.`);
    } else if (pet.coat === 'Long') {
      enhancedParts.push(`${pet.name}'s beautiful long coat requires dedicated grooming attention, including regular brushing to prevent mats and tangles. The effort is well worth it for such a stunning companion.`);
    } else if (pet.coat === 'Wire') {
      enhancedParts.push(`${pet.name}'s wiry coat has a distinctive texture that requires specific grooming techniques. Regular hand-stripping or trimming helps maintain the proper coat texture and appearance.`);
    } else if (pet.coat === 'Hairless') {
      enhancedParts.push(`As a hairless pet, ${pet.name} requires special skin care, including regular baths with gentle shampoo and protection from extreme temperatures and sun exposure.`);
    } else if (pet.coat === 'Curly') {
      enhancedParts.push(`${pet.name}'s adorable curly coat requires regular grooming to prevent matting. The unique texture adds to ${pet.gender === 'Male' ? 'his' : 'her'} charm and character.`);
    }
  }
  
  // Add adoption appeal
  enhancedParts.push(`${pet.name} is waiting for a loving forever home where ${pet.gender === 'Male' ? 'he' : 'she'} can share ${pet.gender === 'Male' ? 'his' : 'her'} affection and bring joy to your life. Could you be the perfect match for this wonderful ${pet.type.toLowerCase()}?`);
  
  // Combine original description with enhanced parts
  const enhancedDescription = originalDesc + '\n\n' + enhancedParts.join('\n\n');
  console.log('Enhanced description length:', enhancedDescription.length);
  
  // Update the pet object with the enhanced description
  pet.description = enhancedDescription;
  
  return pet;
}

export async function GET(request, { params }) {
  const petId = params.id;
  
  if (!petId) {
    return Response.json({ error: 'Pet ID is required' }, { status: 400 });
  }
  
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://api.petfinder.com/v2/animals/${petId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch pet details from Petfinder API');
    }
    
    const data = await response.json();
    
    // Enhance the pet description
    data.animal = enhanceDescription(data.animal);
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching pet details:', error);
    return Response.json(
      { error: 'Failed to fetch pet details. Please try again later.' },
      { status: 500 }
    );
  }
}
