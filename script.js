class AlphabetGame {
    constructor() {
        this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.currentCorrectLetter = '';
        this.score = 0;
        this.audioContext = null; // We'll initialize this when needed
        this.audioCache = new Map(); // Cache for loaded audio files
        this.soundEffects = new Map(); // For storing sound effects
        
        // DOM elements
        this.letterElements = [
            document.getElementById('letter1'),
            document.getElementById('letter2'),
            document.getElementById('letter3')
        ];
        this.playButton = document.getElementById('playSound');
        this.scoreElement = document.getElementById('score');
        this.fireworksElement = document.getElementById('fireworks');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.gameContainer = document.getElementById('gameContainer');

        // Initialize game after preloading both letter sounds and sound effects
        Promise.all([
            this.preloadAudioFiles(),
            this.preloadSoundEffects()
        ]).then(() => {
            // Hide loading screen and show game
            this.loadingScreen.style.display = 'none';
            this.gameContainer.style.display = 'block';
            
            this.initializeGame();
            this.setupEventListeners();
        });
    }

    async preloadAudioFiles() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const loadingPromises = this.letters.map(async letter => {
            try {
                await this.loadAudio(letter);
            } catch (error) {
                console.error(`Failed to load audio for letter ${letter}:`, error);
            }
        });
        
        try {
            await Promise.all(loadingPromises);
            console.log('All audio files loaded successfully');
        } catch (error) {
            console.error('Error preloading audio files:', error);
            // Show error message to user
            this.loadingScreen.innerHTML = `
                <p style="color: #dc2626;">Error loading audio files. Please refresh the page.</p>
            `;
        }
    }

    async preloadSoundEffects() {
        const effects = ['answer-right', 'answer-wrong'];
        
        for (const effect of effects) {
            try {
                const response = await fetch(`audio/${effect}.m4a`);
                const arrayBuffer = await response.arrayBuffer();
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.soundEffects.set(effect, audioBuffer);
            } catch (error) {
                console.error(`Error loading sound effect ${effect}:`, error);
            }
        }
    }

    initializeGame() {
        // Get three random unique letters
        const randomLetters = this.getRandomLetters(3);
        // Randomly select one of the three letters as the correct answer
        const randomIndex = Math.floor(Math.random() * 3);
        this.currentCorrectLetter = randomLetters[randomIndex];

        // Display letters
        this.letterElements.forEach((element, index) => {
            element.textContent = randomLetters[index];
            element.classList.remove('wrong', 'correct');
        });
    }

    getRandomLetters(count) {
        const shuffled = [...this.letters].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    setupEventListeners() {
        this.playButton.addEventListener('click', () => this.playSound());

        this.letterElements.forEach(element => {
            element.addEventListener('click', () => this.checkAnswer(element));
        });
    }

    async loadAudio(letter) {
        if (this.audioCache.has(letter)) {
            return this.audioCache.get(letter);
        }

        try {
            const response = await fetch(`audio/${letter.toLowerCase()}.m4a`);
            const arrayBuffer = await response.arrayBuffer();
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioCache.set(letter, audioBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading audio for letter ${letter}:`, error);
            return null;
        }
    }

    async playSound() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const audioBuffer = await this.loadAudio(this.currentCorrectLetter);
            if (!audioBuffer) {
                console.error('Failed to load audio');
                return;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    checkAnswer(element) {
        if (element.textContent === this.currentCorrectLetter) {
            this.handleCorrectAnswer(element);
        } else {
            this.handleWrongAnswer(element);
        }
    }

    async handleCorrectAnswer(element) {
        element.classList.add('correct');
        this.score += 10;
        this.scoreElement.textContent = this.score;
        await this.playEffect('answer-right');
        this.showFireworks();
        
        // Reset game after a short delay
        setTimeout(() => {
            this.initializeGame();
        }, 1500);
    }

    async handleWrongAnswer(element) {
        element.classList.add('wrong');
        if (this.score > 0) {
            this.score -= 2;
            this.scoreElement.textContent = this.score;
        }
        await this.playEffect('answer-wrong');
    }

    async playEffect(effectName) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const audioBuffer = this.soundEffects.get(effectName);
            if (!audioBuffer) {
                console.error(`Sound effect ${effectName} not found`);
                return;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.error('Error playing sound effect:', error);
        }
    }

    showFireworks() {
        // Simple fireworks effect
        for (let i = 0; i < 5; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + 'vw';
            firework.style.animationDelay = Math.random() * 0.5 + 's';
            this.fireworksElement.appendChild(firework);

            // Remove firework after animation
            setTimeout(() => {
                firework.remove();
            }, 1000);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AlphabetGame();
}); 