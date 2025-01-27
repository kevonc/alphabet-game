async function generateLetterAudio() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    for (const letter of letters) {
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.pitch = 1.2; // Slightly higher pitch for kid-friendly sound
        
        // Speak the letter
        window.speechSynthesis.speak(utterance);
        
        // You would need to record this audio output
        // This is just a demonstration
        console.log(`Generated audio for letter ${letter}`);
    }
}

// Run the function
generateLetterAudio(); 