// Quiz Topics and Questions Database
const quizTopics = {
    technology: {
        name: "Technology",
        icon: "💻",
        questions: [
            {
                question: "Which company created JavaScript?",
                options: ["Microsoft", "Netscape", "Oracle", "Google"],
                correct: 1
            },
            {
                question: "What does CPU stand for?",
                options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Central Process Utility"],
                correct: 0
            },
            {
                question: "What year was the first iPhone released?",
                options: ["2005", "2006", "2007", "2008"],
                correct: 2
            }
        ]
    },
    science: {
        name: "Science",
        icon: "🔬",
        questions: [
            {
                question: "What is the chemical symbol for gold?",
                options: ["Ag", "Au", "Fe", "Cu"],
                correct: 1
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correct: 1
            },
            {
                question: "What is the fastest land animal?",
                options: ["Lion", "Cheetah", "Gazelle", "Leopard"],
                correct: 1
            }
        ]
    },
    history: {
        name: "History",
        icon: "📜",
        questions: [
            {
                question: "Who was the first President of the United States?",
                options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
                correct: 2
            },
            {
                question: "In which year did World War II end?",
                options: ["1943", "1944", "1945", "1946"],
                correct: 2
            },
            {
                question: "Which empire built the Machu Picchu?",
                options: ["Aztec", "Maya", "Inca", "Olmec"],
                correct: 2
            }
        ]
    },
    gaming: {
        name: "Gaming",
        icon: "🎮",
        questions: [
            {
                question: "Which company created Mario?",
                options: ["Sega", "Nintendo", "Sony", "Microsoft"],
                correct: 1
            },
            {
                question: "What is the best-selling video game of all time?",
                options: ["Minecraft", "Tetris", "GTA V", "Wii Sports"],
                correct: 0
            },
            {
                question: "In which year was the first PlayStation released?",
                options: ["1993", "1994", "1995", "1996"],
                correct: 1
            }
        ]
    }
};

class QuizGame {
    constructor() {
        this.currentTopic = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.playerName = '';
        this.basePoints = 100;
        this.timeBonus = 10; // points per second left
        this.questionTime = 30; // seconds per question
        this.achievements = {
            speedster: { name: "Speedster", icon: "⚡", desc: "Answer in under 5 seconds" },
            perfectScore: { name: "Perfect Score", icon: "🎯", desc: "Get all questions correct" },
            quickLearner: { name: "Quick Learner", icon: "🎓", desc: "Score over 500 points" },
            topicMaster: { name: "Topic Master", icon: "👑", desc: "Get highest score in a topic" }
        };

        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.topicScreen = document.createElement('div');
        this.topicScreen.className = 'screen';
        this.topicScreen.id = 'topic-screen';
        this.quizScreen = document.getElementById('quiz-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.leaderboardScreen = document.getElementById('leaderboard-screen');

        // Create topics screen content
        this.topicScreen.innerHTML = `
            <h2>Choose a Topic</h2>
            <div class="topics-grid"></div>
        `;
        document.querySelector('.container').appendChild(this.topicScreen);

        // Add topics to grid
        const topicsGrid = this.topicScreen.querySelector('.topics-grid');
        Object.entries(quizTopics).forEach(([key, topic]) => {
            const topicButton = document.createElement('button');
            topicButton.className = 'topic-btn btn';
            topicButton.dataset.topic = key;
            topicButton.innerHTML = `${topic.icon}<br>${topic.name}`;
            topicsGrid.appendChild(topicButton);
        });
    }

    initializeEventListeners() {
        // Start button
        const startBtn = document.querySelector('#start-screen .btn');
        startBtn.addEventListener('click', () => this.startQuiz());

        // Topic selection
        const topicBtns = document.querySelectorAll('.topic-btn');
        topicBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectTopic(btn.dataset.topic));
        });

        // Name input enter key
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startQuiz();
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startQuiz() {
        this.playerName = document.getElementById('player-name').value.trim();
        if (!this.playerName) {
            this.showFeedback('Please enter your name!', false);
            document.getElementById('player-name').focus();
            return;
        }
        this.showScreen('topic-screen');
    }

    selectTopic(topicKey) {
        this.currentTopic = topicKey;
        this.currentQuestions = [...quizTopics[topicKey].questions];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.questionTimes = [];
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.endQuiz();
            return;
        }

        this.showScreen('quiz-screen');
        const question = this.currentQuestions[this.currentQuestionIndex];
        
        document.getElementById('question').textContent = question.question;
        
        const optionsHtml = question.options.map((option, index) => `
            <button class="btn option-btn" data-index="${index}">${option}</button>
        `).join('');
        
        document.getElementById('options').innerHTML = optionsHtml;
        
        // Add click handlers to options
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => this.checkAnswer(parseInt(btn.dataset.index)));
        });

        // Start timer
        this.timeLeft = this.questionTime;
        this.updateTimer();
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.updateTimer(), 1000);
    }

    updateTimer() {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = this.timeLeft;
        
        if (this.timeLeft <= 10) {
            timerEl.classList.add('warning');
        }
        
        if (this.timeLeft <= 0) {
            clearInterval(this.timer);
            this.checkAnswer(-1);
        }
        this.timeLeft--;
    }

    showFeedback(message, isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 1500);
    }

    checkAnswer(selectedIndex) {
        clearInterval(this.timer);
        const timeSpent = this.questionTime - this.timeLeft;
        this.questionTimes.push(timeSpent);
        
        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correct;
        
        // Visual feedback on buttons
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === question.correct) {
                btn.classList.add('correct');
            } else if (index === selectedIndex) {
                btn.classList.add('incorrect');
            }
        });

        // Calculate score
        if (isCorrect) {
            this.correctAnswers++;
            const timeBonus = this.timeLeft * this.timeBonus;
            const pointsEarned = this.basePoints + timeBonus;
            this.score += pointsEarned;
            this.showFeedback(`Correct! +${pointsEarned} points`, true);
        } else {
            this.showFeedback('Incorrect!', false);
        }

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showQuestion();
        }, 1500);
    }

    endQuiz() {
        const finalScore = this.score;
        const totalQuestions = this.currentQuestions.length;
        const averageTime = Math.round(this.questionTimes.reduce((a, b) => a + b, 0) / totalQuestions);
        const perfectScore = this.correctAnswers === totalQuestions;
        const fastestAnswer = Math.min(...this.questionTimes);
        
        // Calculate achievements
        const earnedAchievements = [];
        if (fastestAnswer < 5) earnedAchievements.push(this.achievements.speedster);
        if (perfectScore) earnedAchievements.push(this.achievements.perfectScore);
        if (finalScore > 500) earnedAchievements.push(this.achievements.quickLearner);

        // Save to leaderboard with enhanced data
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        const entry = {
            name: this.playerName,
            topic: quizTopics[this.currentTopic].name,
            score: finalScore,
            date: new Date().toISOString(),
            stats: {
                correctAnswers: this.correctAnswers,
                totalQuestions,
                averageTime,
                fastestAnswer,
                achievements: earnedAchievements
            }
        };

        // Check for topic master achievement
        const topicHighScore = Math.max(...leaderboard
            .filter(e => e.topic === entry.topic)
            .map(e => e.score), 0);
        if (finalScore > topicHighScore) {
            entry.stats.achievements.push(this.achievements.topicMaster);
        }

        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.score - a.score);
        if (leaderboard.length > 50) leaderboard.length = 50; // Store more entries
        
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));

        // Show result screen with animations
        const resultScreen = document.getElementById('result-screen');
        resultScreen.innerHTML = `
            <h2>Quiz Complete!</h2>
            <div class="score" id="final-score">Score: ${finalScore}</div>
            <div class="stats-container">
                <div class="stat">
                    <div class="stat-value">${this.correctAnswers}/${totalQuestions}</div>
                    <div class="stat-label">Correct Answers</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${averageTime}s</div>
                    <div class="stat-label">Avg. Time</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${fastestAnswer}s</div>
                    <div class="stat-label">Fastest Answer</div>
                </div>
            </div>
            ${earnedAchievements.length ? `
                <div class="achievements-container">
                    <h3>Achievements Earned!</h3>
                    <div class="achievements-grid">
                        ${earnedAchievements.map(a => `
                            <div class="achievement">
                                <div class="achievement-icon">${a.icon}</div>
                                <div class="achievement-info">
                                    <div class="achievement-name">${a.name}</div>
                                    <div class="achievement-desc">${a.desc}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            <button class="btn" onclick="showLeaderboard()">View Leaderboard</button>
        `;

        this.showScreen('result-screen');
    }

    showLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        const topicStats = this.calculateTopicStats(leaderboard);
        
        // Create filter controls
        const leaderboardScreen = document.getElementById('leaderboard-screen');
        leaderboardScreen.innerHTML = `
            <h2>Leaderboard</h2>
            <div class="leaderboard-controls">
                <select class="filter-select" id="topic-filter">
                    <option value="all">All Topics</option>
                    ${Object.values(quizTopics).map(topic => 
                        `<option value="${topic.name}">${topic.icon} ${topic.name}</option>`
                    ).join('')}
                </select>
                <select class="filter-select" id="time-filter">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>
            <div class="topic-stats">
                ${Object.entries(topicStats).map(([topic, stats]) => `
                    <div class="topic-stat">
                        <div class="topic-name">${topic}</div>
                        <div class="topic-highscore">High: ${stats.highScore}</div>
                        <div class="topic-avgScore">Avg: ${Math.round(stats.avgScore)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="leaderboard" id="leaderboard-list"></div>
            <button class="btn" onclick="resetQuiz()">Play Again</button>
        `;

        // Add filter event listeners
        document.getElementById('topic-filter').addEventListener('change', () => this.filterLeaderboard());
        document.getElementById('time-filter').addEventListener('change', () => this.filterLeaderboard());
        
        this.filterLeaderboard();
        this.showScreen('leaderboard-screen');
    }

    filterLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        const topicFilter = document.getElementById('topic-filter').value;
        const timeFilter = document.getElementById('time-filter').value;
        
        let filtered = [...leaderboard];

        // Apply topic filter
        if (topicFilter !== 'all') {
            filtered = filtered.filter(entry => entry.topic === topicFilter);
        }

        // Apply time filter
        const now = new Date();
        switch (timeFilter) {
            case 'today':
                filtered = filtered.filter(entry => 
                    new Date(entry.date).toDateString() === now.toDateString()
                );
                break;
            case 'week':
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                filtered = filtered.filter(entry => 
                    new Date(entry.date) > weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                filtered = filtered.filter(entry => 
                    new Date(entry.date) > monthAgo
                );
                break;
        }

        // Update leaderboard display with safety checks for missing properties
        const leaderboardHtml = filtered.map((entry, index) => `
            <div class="leaderboard-item ${entry.name === this.playerName ? 'current-player' : ''}">
                <div class="rank">${this.getRankEmoji(index + 1)}#${index + 1}</div>
                <div class="player-info">
                    <div class="name">${entry.name}</div>
                    <div class="topic">${entry.topic}</div>
                    ${(entry.stats?.achievements?.length) ? `
                        <div class="mini-achievements">
                            ${entry.stats.achievements.map(a => a.icon).join(' ')}
                        </div>
                    ` : ''}
                </div>
                <div class="score-info">
                    <div class="score">${entry.score}</div>
                    <div class="stats">
                        <span title="Correct Answers">${entry.stats?.correctAnswers || 0}/${entry.stats?.totalQuestions || 0}</span>
                        <span title="Average Time">${entry.stats?.averageTime || 0}s</span>
                    </div>
                    <div class="date">${this.formatDate(entry.date)}</div>
                </div>
            </div>
        `).join('');

        document.getElementById('leaderboard-list').innerHTML = leaderboardHtml || 
            '<div class="no-entries">No entries found</div>';
    }

    calculateTopicStats(leaderboard) {
        const stats = {};
        Object.values(quizTopics).forEach(topic => {
            const topicEntries = leaderboard.filter(e => e.topic === topic.name);
            if (topicEntries.length) {
                stats[topic.name] = {
                    highScore: Math.max(...topicEntries.map(e => e?.score || 0)),
                    avgScore: topicEntries.reduce((sum, e) => sum + (e?.score || 0), 0) / topicEntries.length
                };
            } else {
                stats[topic.name] = {
                    highScore: 0,
                    avgScore: 0
                };
            }
        });
        return stats;
    }

    getRankEmoji(rank) {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString();
        }
    }

    resetQuiz() {
        this.currentTopic = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        if (this.timer) clearInterval(this.timer);
        document.getElementById('player-name').value = '';
        this.showScreen('start-screen');
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new QuizGame();
    
    // Add global handlers with proper binding
    window.startQuiz = () => quiz.startQuiz();
    window.showLeaderboard = () => quiz.showLeaderboard.call(quiz);  // Fix: Bind to quiz instance
    window.resetQuiz = () => quiz.resetQuiz();
});