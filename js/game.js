// Основная игровая логика
class GameEngine {
    constructor() {
        this.gameState = this.createInitialState();
        this.localState = this.createLocalState();
        this.dragState = this.createDragState();
        
        // Привязка методов к контексту
        this.handleChoice = this.handleChoice.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    // Создание начального состояния игры
    createInitialState() {
        return {
            stats: { ...GAME_CONFIG.initialStats },
            metrics: { ...GAME_CONFIG.initialMetrics },
            currentDecisionIndex: 0,
            currentTerm: 1,
            difficulty: 1,
            completedDecisions: [],
            gameOver: false,
            gameWon: false,
            totalDecisions: 0,
            swipesLeft: 0,
            swipesRight: 0,
            temporaryEffects: [],
            countries: [],
            globalCrises: [],
            accumulativeTrackers: {
                ecology_neglect: 0,
                military_weakness: 0,
                economic_instability: 0,
                social_unrest: 0,
                diplomatic_isolation: 0,
                science_stagnation: 0
            },
            lastRandomEvent: null,
            gameStats: {
                totalDecisions: 0,
                swipesLeft: 0,
                swipesRight: 0,
                maxStats: { ...GAME_CONFIG.initialStats },
                minStats: { ...GAME_CONFIG.initialStats },
                completedTerms: 0,
                highestDifficulty: 1,
                advisorInteractions: { 
                    military: 0, society: 0, ecology: 0, 
                    economy: 0, science: 0, diplomacy: 0 
                },
                criticalDecisions: 0,
                balancedDecisions: 0,
                extremeDecisions: 0,
                randomEventsTriggered: 0,
                globalCrisesTriggered: 0,
                accumulativeEventsTriggered: 0,
                gameEndType: 'ongoing',
                finalStats: { ...GAME_CONFIG.initialStats },
                finalMetrics: { ...GAME_CONFIG.initialMetrics },
                playStyle: 'balanced'
            }
        };
    }

    // Создание локального состояния интерфейса
    createLocalState() {
        const saved = localStorage.getItem('game-theme');
        return {
            isDarkTheme: saved ? saved === 'dark' : true,
            isSoundEnabled: true,
            showEndDialog: false,
            cardTransform: '',
            swipeIndicator: null,
            achievements: [],
            streakCount: 0,
            lastChoiceTime: Date.now(),
            isAnimating: false,
            animationKey: 0,
            showMobileStats: false,
            randomEventNotification: null
        };
    }

    // Создание состояния перетаскивания
    createDragState() {
        return {
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            initialTransform: ''
        };
    }

    // Получение текущего решения
    getCurrentDecision() {
        // Если есть случайное событие, показываем его
        if (this.gameState.lastRandomEvent) {
            return {
                id: -1,
                title: this.gameState.lastRandomEvent.title,
                description: this.gameState.lastRandomEvent.description,
                advisor: 'military',
                urgency: 'critical',
                leftChoice: {
                    text: "Минимальные меры",
                    effects: this.scaleEffects(this.gameState.lastRandomEvent.effects, 0.5),
                    corruption: (this.gameState.lastRandomEvent.corruptionEffect || 0) * 0.5,
                    satisfaction: (this.gameState.lastRandomEvent.satisfactionEffect || 0) * 0.5
                },
                rightChoice: {
                    text: "Решительные действия", 
                    effects: this.gameState.lastRandomEvent.effects,
                    corruption: this.gameState.lastRandomEvent.corruptionEffect || 0,
                    satisfaction: this.gameState.lastRandomEvent.satisfactionEffect || 0
                },
                eventType: 'random',
                temporaryEffects: this.gameState.lastRandomEvent.temporaryEffects,
                reputationEffects: this.gameState.lastRandomEvent.reputationEffects
            };
        }

        const availableDecisions = GAME_DECISIONS.filter(decision => 
            !this.gameState.completedDecisions.includes(decision.id)
        );
        
        if (availableDecisions.length === 0) {
            return GAME_DECISIONS[this.gameState.currentDecisionIndex % GAME_DECISIONS.length];
        }
        
        return availableDecisions[this.gameState.currentDecisionIndex % availableDecisions.length];
    }

    // Масштабирование эффектов
    scaleEffects(effects, scale) {
        const scaledEffects = {};
        Object.entries(effects).forEach(([key, value]) => {
            scaledEffects[key] = Math.floor(value * scale);
        });
        return scaledEffects;
    }

    // Проверка случайных событий
    checkRandomEvent(currentStats, difficulty) {
        const difficultyMod = DIFFICULTY_MODIFIERS[difficulty] || DIFFICULTY_MODIFIERS[8];
        const adjustedEventChance = difficultyMod.eventChance * 0.5;
        
        if (Math.random() > adjustedEventChance) return null;

        const eligibleEvents = RANDOM_EVENTS.filter(event => {
            if (!event.requirements) return true;
            
            return Object.entries(event.requirements).every(([key, requirement]) => {
                const statValue = currentStats[key] || 0;
                if (requirement.min !== undefined && statValue < requirement.min) return false;
                if (requirement.max !== undefined && statValue > requirement.max) return false;
                return true;
            });
        });

        if (eligibleEvents.length === 0) return null;

        const totalProbability = eligibleEvents.reduce((sum, event) => sum + event.probability, 0);
        let randomValue = Math.random() * totalProbability;
        
        for (const event of eligibleEvents) {
            randomValue -= event.probability;
            if (randomValue <= 0) return event;
        }

        return null;
    }

    // Проверка накопительных событий
    checkAccumulativeEvents(stats, trackers) {
        if (trackers.ecology_neglect >= GAME_CONFIG.accumulativeThreshold && stats.ecology < 30) {
            return RANDOM_EVENTS.find(event => event.id === 'climate_disaster') || null;
        }
        
        if (trackers.military_weakness >= GAME_CONFIG.accumulativeThreshold && stats.military < 25) {
            return RANDOM_EVENTS.find(event => event.id === 'military_coup') || null;
        }
        
        if (trackers.economic_instability >= GAME_CONFIG.accumulativeThreshold && stats.economy < 25) {
            return RANDOM_EVENTS.find(event => event.id === 'economic_collapse') || null;
        }
        
        if (trackers.social_unrest >= GAME_CONFIG.accumulativeThreshold && stats.society < 25) {
            return RANDOM_EVENTS.find(event => event.id === 'revolution') || null;
        }
        
        return null;
    }

    // Применение эффектов решения
    applyEffects(effects, isLeftChoice) {
        const currentDecision = this.getCurrentDecision();
        
        let newStats = { ...this.gameState.stats };
        let newMetrics = { ...this.gameState.metrics };
        
        // Получаем модификаторы сложности
        const difficultyMod = DIFFICULTY_MODIFIERS[this.gameState.difficulty] || DIFFICULTY_MODIFIERS[8];
        
        // Применяем временные эффекты
        this.gameState.temporaryEffects.forEach(tempEffect => {
            Object.entries(tempEffect.effects).forEach(([key, value]) => {
                if (newStats.hasOwnProperty(key)) {
                    newStats[key] = Math.max(0, Math.min(100, newStats[key] + value));
                }
            });
        });
        
        // Применяем эффекты коррупции и удовлетворенности
        const corruptionPenalty = (newMetrics.corruption - 50) * 0.01;
        const satisfactionBonus = (newMetrics.satisfaction - 50) * 0.005;
        
        // Применяем эффекты решения с модификаторами
        Object.entries(effects).forEach(([key, value]) => {
            if (newStats.hasOwnProperty(key)) {
                let adjustedValue = value * difficultyMod.effectMultiplier;
                
                if (Math.abs(value) >= 5) {
                    if (value > 0) {
                        adjustedValue *= (1 + satisfactionBonus);
                    } else {
                        adjustedValue *= (1 + corruptionPenalty);
                    }
                }
                
                adjustedValue = Math.round(adjustedValue);
                newStats[key] = Math.max(0, Math.min(100, newStats[key] + adjustedValue));
            }
        });

        // Обновляем метрики
        const choice = isLeftChoice ? currentDecision.leftChoice : currentDecision.rightChoice;
        if (choice.corruption !== undefined) {
            newMetrics.corruption = Math.max(0, Math.min(100, newMetrics.corruption + choice.corruption));
        }
        if (choice.satisfaction !== undefined) {
            newMetrics.satisfaction = Math.max(0, Math.min(100, newMetrics.satisfaction + choice.satisfaction));
        }

        // Обновляем накопительные трекеры
        let newTrackers = { ...this.gameState.accumulativeTrackers };
        
        if (newStats.ecology < 30) newTrackers.ecology_neglect += difficultyMod.accumulativeRate;
        if (newStats.military < 30) newTrackers.military_weakness += difficultyMod.accumulativeRate;
        if (newStats.economy < 30) newTrackers.economic_instability += difficultyMod.accumulativeRate;
        if (newStats.society < 30) newTrackers.social_unrest += difficultyMod.accumulativeRate;
        if (newStats.diplomacy < 30) newTrackers.diplomatic_isolation += difficultyMod.accumulativeRate;
        if (newStats.science < 30) newTrackers.science_stagnation += difficultyMod.accumulativeRate;

        // Проверяем накопительные события
        const accumulativeEvent = this.checkAccumulativeEvents(newStats, newTrackers);
        let newRandomEvent = accumulativeEvent;
        
        // Если нет накопительного события, проверяем обычные
        if (!newRandomEvent) {
            newRandomEvent = this.checkRandomEvent(newStats, this.gameState.difficulty);
        }
        
        // Если только что обработали случайное событие, убираем его
        if (this.gameState.lastRandomEvent && currentDecision.id === -1) {
            newRandomEvent = null;
            
            if (this.gameState.lastRandomEvent.accumulativeTrigger) {
                newTrackers[this.gameState.lastRandomEvent.accumulativeTrigger] = 0;
            }
        }

        // Обновляем временные эффекты
        let newTemporaryEffects = this.gameState.temporaryEffects
            .map(effect => ({ ...effect, duration: effect.duration - 1 }))
            .filter(effect => effect.duration > 0);

        // Добавляем новый временный эффект если есть
        if (currentDecision.temporaryEffects) {
            newTemporaryEffects.push({
                id: `temp_${Date.now()}`,
                effects: currentDecision.temporaryEffects.effects,
                duration: currentDecision.temporaryEffects.duration,
                description: currentDecision.temporaryEffects.description
            });
        }

        // Обновляем игровую статистику
        const newGameStats = { ...this.gameState.gameStats };
        newGameStats.totalDecisions++;
        if (isLeftChoice) newGameStats.swipesLeft++;
        else newGameStats.swipesRight++;
        
        if (newRandomEvent) {
            if (newRandomEvent.accumulativeTrigger) {
                newGameStats.accumulativeEventsTriggered++;
            } else {
                newGameStats.randomEventsTriggered++;
            }
        }

        // Обновляем статистики
        Object.keys(newStats).forEach(key => {
            if (newStats[key] > newGameStats.maxStats[key]) {
                newGameStats.maxStats[key] = newStats[key];
            }
            if (newStats[key] < newGameStats.minStats[key]) {
                newGameStats.minStats[key] = newStats[key];
            }
        });

        if (currentDecision.id !== -1 && currentDecision.advisor) {
            newGameStats.advisorInteractions[currentDecision.advisor]++;
        }

        const effectValues = Object.values(effects);
        const maxEffect = Math.max(...effectValues.map(Math.abs));
        if (maxEffect >= 20) newGameStats.extremeDecisions++;
        else if (maxEffect <= 5) newGameStats.balancedDecisions++;

        if (currentDecision.urgency === 'critical') newGameStats.criticalDecisions++;

        newGameStats.highestDifficulty = Math.max(newGameStats.highestDifficulty, this.gameState.difficulty);
        newGameStats.finalStats = { ...newStats };
        newGameStats.finalMetrics = { ...newMetrics };

        // Проверяем условия окончания игры
        const values = Object.values(newStats);
        let gameOver = values.some(val => val <= 0 || val >= 100);
        let defeatReason = '';
        
        if (newMetrics.corruption >= 90) {
            gameOver = true;
            defeatReason = 'Коррупция достигла критического уровня';
        }
        
        if (newMetrics.satisfaction <= 10) {
            gameOver = true;
            defeatReason = 'Народ полностью потерял доверие к власти';
        }
        
        const newDecisionIndex = this.gameState.currentDecisionIndex + 1;
        const newTerm = Math.ceil(newDecisionIndex / GAME_CONFIG.decisionsPerTerm) + 1;
        const newDifficulty = Math.min(8, Math.ceil(newDecisionIndex / 5));
        const gameWon = newTerm > GAME_CONFIG.maxTerms && !gameOver;

        newGameStats.completedTerms = newTerm - 1;
        
        if (gameOver) {
            newGameStats.gameEndType = 'defeat';
            newGameStats.defeatReason = defeatReason;
        } else if (gameWon) {
            newGameStats.gameEndType = 'victory';
        }

        // Обновляем состояние игры
        this.gameState = {
            ...this.gameState,
            stats: newStats,
            metrics: newMetrics,
            currentDecisionIndex: newDecisionIndex,
            currentTerm: Math.min(newTerm, GAME_CONFIG.maxTerms),
            difficulty: newDifficulty,
            completedDecisions: currentDecision.id === -1 
                ? this.gameState.completedDecisions 
                : [...this.gameState.completedDecisions, currentDecision.id],
            gameOver,
            gameWon,
            totalDecisions: newGameStats.totalDecisions,
            swipesLeft: newGameStats.swipesLeft,
            swipesRight: newGameStats.swipesRight,
            temporaryEffects: newTemporaryEffects,
            accumulativeTrackers: newTrackers,
            lastRandomEvent: newRandomEvent,
            gameStats: newGameStats
        };

        // Обновляем достижения
        this.checkAchievements();

        // Показываем уведомление о случайном событии
        if (newRandomEvent && !this.localState.randomEventNotification) {
            this.showEventNotification(newRandomEvent);
        }
    }

    // Проверка достижений
    checkAchievements() {
        const newAchievements = [];

        const achievementChecks = [
            {
                condition: this.gameState.gameStats.totalDecisions === 1,
                id: 'first_decision',
                achievement: {
                    id: 'first_decision',
                    name: 'ПЕРВЫЙ ШАГ',
                    description: 'Примите своё первое решение как правитель.',
                    icon: '👑',
                    rarity: 'common',
                    unlocked: true,
                    unlockedAt: new Date()
                }
            },
            {
                condition: this.gameState.currentTerm >= 2 && Object.values(this.gameState.stats).every(v => v >= 30 && v <= 70),
                id: 'balanced_ruler',
                achievement: {
                    id: 'balanced_ruler',
                    name: 'МАСТЕР БАЛАНСА',
                    description: 'Сохраняйте все показатели между 30-70% в течение целого срока.',
                    icon: '⚖️',
                    rarity: 'epic',
                    unlocked: true,
                    unlockedAt: new Date()
                }
            },
            {
                condition: this.gameState.gameStats.randomEventsTriggered >= 3,
                id: 'crisis_manager',
                achievement: {
                    id: 'crisis_manager',
                    name: 'КРИЗИС-МЕНЕДЖЕР',
                    description: 'Переживите 3+ случайных события.',
                    icon: '⚡',
                    rarity: 'epic',
                    unlocked: true,
                    unlockedAt: new Date()
                }
            },
            {
                condition: this.gameState.stats.diplomacy >= 80,
                id: 'diplomat',
                achievement: {
                    id: 'diplomat',
                    name: 'ВЕЛИКИЙ ДИПЛОМАТ',
                    description: 'Достигните 80+ пунктов дипломатии.',
                    icon: '🕊️',
                    rarity: 'rare',
                    unlocked: true,
                    unlockedAt: new Date()
                }
            },
            {
                condition: this.gameState.stats.science >= 85,
                id: 'technocrat',
                achievement: {
                    id: 'technocrat',
                    name: 'ПОКОРИТЕЛЬ КОСМОСА',
                    description: 'Достигните 85+ пунктов науки.',
                    icon: '🚀',
                    rarity: 'rare',
                    unlocked: true,
                    unlockedAt: new Date()
                }
            },
            {
                condition: this.gameState.metrics.corruption <= 15 && this.gameState.currentTerm >= 3,
                id: 'clean_hands',
                achievement: {
                    id: 'clean_hands',
                    name: 'ЧИСТЫЕ РУКИ',
                    description: 'Держите коррупцию ниже 15% в течение 3 сроков.',
                    icon: '✨',
                    rarity: 'epic',
                    unlocked: true,
                    unlockedAt: new Date()
                }
            },
            {
                condition: this.gameState.gameWon,
                id: 'victory',
                achievement: {
                    id: 'victory',
                    name: 'ВЕЛИКИЙ ПРАВИТЕЛЬ',
                    description: 'Успешно завершите все 5 сроков правления.',
                    icon: '🏆',
                    rarity: 'legendary',
                    unlocked: true,
                    unlockedAt: new Date()
                }
            }
        ];

        achievementChecks.forEach(({ condition, id, achievement }) => {
            if (condition && !this.localState.achievements.find(a => a.id === id)) {
                newAchievements.push(achievement);
            }
        });

        if (newAchievements.length > 0) {
            this.localState.achievements = [...this.localState.achievements, ...newAchievements];
            newAchievements.forEach(achievement => {
                this.showAchievementNotification(achievement);
            });
            
            if (this.localState.isSoundEnabled) {
                SoundSystem.achievement();
            }
        }
    }

    // Обработка выбора
    async handleChoice(isLeftChoice) {
        if (this.gameState.gameOver || this.gameState.gameWon || this.localState.isAnimating) return;
        
        this.localState.isAnimating = true;
        
        try {
            const decision = this.getCurrentDecision();
            const effects = isLeftChoice ? decision.leftChoice.effects : decision.rightChoice.effects;
            
            // Обновляем streak
            const now = Date.now();
            if (now - this.localState.lastChoiceTime < CONSTANTS.NOTIFICATION_DURATION) {
                this.localState.streakCount++;
            } else {
                this.localState.streakCount = 1;
            }
            this.localState.lastChoiceTime = now;
            
            // Звуковые эффекты
            if (this.localState.isSoundEnabled) {
                isLeftChoice ? SoundSystem.swipeLeft() : SoundSystem.swipeRight();
                
                if (this.localState.streakCount >= CONSTANTS.STREAK_THRESHOLD) {
                    setTimeout(() => SoundSystem.notification(), 100);
                }
            }

            // Анимация карточки
            const direction = isLeftChoice ? -1 : 1;
            this.localState.cardTransform = `translateX(${direction * CONSTANTS.CARD_TRANSLATE_DISTANCE}px) rotate(${direction * CONSTANTS.CARD_ROTATION_DEGREES}deg) scale(${CONSTANTS.MIN_CARD_SCALE})`;
            this.localState.swipeIndicator = isLeftChoice ? 'left' : 'right';
            
            // Применяем эффекты
            this.applyEffects(effects, isLeftChoice);
            
            // Обновляем UI
            this.updateUI();
            
            // Сброс анимации
            setTimeout(() => {
                this.localState.cardTransform = '';
                this.localState.swipeIndicator = null;
                this.localState.animationKey++;
                this.localState.isAnimating = false;
                this.updateUI();
            }, CONSTANTS.ANIMATION_DURATION);
            
        } catch (error) {
            console.error('Ошибка при обработке выбора:', error);
            this.localState.cardTransform = '';
            this.localState.swipeIndicator = null;
            this.localState.animationKey++;
            this.localState.isAnimating = false;
            this.updateUI();
        }
    }

    // Обработка клавиатуры
    handleKeyPress(e) {
        if (this.gameState.gameOver || this.gameState.gameWon || this.localState.showEndDialog || this.localState.isAnimating) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const keyActions = {
            'ArrowLeft': () => this.handleChoice(true),
            'a': () => this.handleChoice(true),
            'A': () => this.handleChoice(true),
            'ArrowRight': () => this.handleChoice(false),
            'd': () => this.handleChoice(false),
            'D': () => this.handleChoice(false),
            'Escape': () => this.localState.showEndDialog && this.hideEndDialog(),
            'r': () => (this.gameState.gameOver || this.gameState.gameWon) && this.resetGame(),
            'R': () => (this.gameState.gameOver || this.gameState.gameWon) && this.resetGame()
        };

        const action = keyActions[e.key];
        if (action) {
            e.preventDefault();
            action();
        }
    }

    // Начало перетаскивания мышью
    handleMouseDown(e) {
        if (this.gameState.gameOver || this.gameState.gameWon || this.localState.isAnimating) return;
        
        this.dragState.isDragging = true;
        this.dragState.startX = e.clientX;
        this.dragState.startY = e.clientY;
        this.dragState.currentX = e.clientX;
        this.dragState.currentY = e.clientY;
        
        if (this.localState.isSoundEnabled) {
            SoundSystem.cardFlip();
        }
        
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    // Перемещение мыши
    handleMouseMove(e) {
        if (!this.dragState.isDragging) return;
        
        this.dragState.currentX = e.clientX;
        this.dragState.currentY = e.clientY;
        
        const offset = {
            x: this.dragState.currentX - this.dragState.startX,
            y: this.dragState.currentY - this.dragState.startY
        };
        
        this.updateDragTransform(offset);
    }

    // Окончание перетаскивания мышью
    handleMouseUp(e) {
        if (!this.dragState.isDragging) return;
        
        const offset = {
            x: this.dragState.currentX - this.dragState.startX,
            y: this.dragState.currentY - this.dragState.startY
        };
        
        this.endDrag(offset);
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    // Начало касания
    handleTouchStart(e) {
        if (this.gameState.gameOver || this.gameState.gameWon || this.localState.isAnimating) return;
        
        const touch = e.touches[0];
        this.dragState.isDragging = true;
        this.dragState.startX = touch.clientX;
        this.dragState.startY = touch.clientY;
        this.dragState.currentX = touch.clientX;
        this.dragState.currentY = touch.clientY;
        
        if (this.localState.isSoundEnabled) {
            SoundSystem.cardFlip();
        }
    }

    // Перемещение касания
    handleTouchMove(e) {
        if (!this.dragState.isDragging) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.dragState.currentX = touch.clientX;
        this.dragState.currentY = touch.clientY;
        
        const offset = {
            x: this.dragState.currentX - this.dragState.startX,
            y: this.dragState.currentY - this.dragState.startY
        };
        
        this.updateDragTransform(offset);
    }

    // Окончание касания
    handleTouchEnd(e) {
        if (!this.dragState.isDragging) return;
        
        const offset = {
            x: this.dragState.currentX - this.dragState.startX,
            y: this.dragState.currentY - this.dragState.startY
        };
        
        this.endDrag(offset);
    }

    // Обновление трансформации во время перетаскивания
    updateDragTransform(offset) {
        const rotation = offset.x * CONSTANTS.CARD_ROTATION_FACTOR;
        const scale = 1 - Math.abs(offset.x) * CONSTANTS.CARD_SCALE_FACTOR;
        
        this.localState.cardTransform = `translateX(${offset.x}px) rotate(${rotation}deg) scale(${Math.max(CONSTANTS.MIN_CARD_SCALE, scale)})`;
        
        if (Math.abs(offset.x) > CONSTANTS.SWIPE_THRESHOLD) {
            this.localState.swipeIndicator = offset.x > 0 ? 'right' : 'left';
        } else {
            this.localState.swipeIndicator = null;
        }
        
        this.updateCardTransform();
    }

    // Завершение перетаскивания
    endDrag(offset) {
        this.dragState.isDragging = false;
        
        if (Math.abs(offset.x) > GAME_CONFIG.minSwipeDistance) {
            const isLeftChoice = offset.x < 0;
            this.handleChoice(isLeftChoice);
        } else {
            this.localState.cardTransform = '';
            this.localState.swipeIndicator = null;
            this.updateCardTransform();
        }
    }

    // Переключение темы
    toggleTheme() {
        this.localState.isDarkTheme = !this.localState.isDarkTheme;
        localStorage.setItem('game-theme', this.localState.isDarkTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', this.localState.isDarkTheme);
        
        if (this.localState.isSoundEnabled) {
            SoundSystem.buttonClick();
        }
    }

    // Переключение звука
    toggleSound() {
        this.localState.isSoundEnabled = !this.localState.isSoundEnabled;
        SoundSystem.setEnabled(this.localState.isSoundEnabled);
        
        if (this.localState.isSoundEnabled) {
            SoundSystem.buttonClick();
        }
    }

    // Сброс игры
    resetGame() {
        this.gameState = this.createInitialState();
        this.localState.showEndDialog = false;
        this.localState.cardTransform = '';
        this.localState.swipeIndicator = null;
        this.localState.achievements = [];
        this.localState.streakCount = 0;
        this.localState.lastChoiceTime = Date.now();
        this.localState.isAnimating = false;
        this.localState.animationKey = 0;
        this.localState.showMobileStats = false;
        this.localState.randomEventNotification = null;
        
        if (this.localState.isSoundEnabled) {
            SoundSystem.buttonClick();
        }
        
        this.updateUI();
    }

    // Показ уведомления о достижении
    showAchievementNotification(achievement) {
        const achievementSystem = document.getElementById('achievementSystem');
        if (!achievementSystem) return;

        const notification = UIComponents.createAchievementNotification(achievement);
        achievementSystem.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Показ уведомления о событии
    showEventNotification(event) {
        this.localState.randomEventNotification = event;
        
        const eventNotifications = document.getElementById('eventNotifications');
        if (!eventNotifications) return;

        const notification = UIComponents.createEventNotification(event);
        eventNotifications.appendChild(notification);
        
        if (this.localState.isSoundEnabled) {
            SoundSystem.randomEvent();
        }
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.localState.randomEventNotification = null;
        }, CONSTANTS.NOTIFICATION_DURATION);
    }

    // Показ диалога окончания игры
    showEndDialog() {
        this.localState.showEndDialog = true;
        
        if (this.localState.isSoundEnabled) {
            setTimeout(() => {
                this.gameState.gameWon ? SoundSystem.victory() : SoundSystem.defeat();
            }, 500);
        }
        
        setTimeout(() => {
            this.updateEndDialog();
        }, 1500);
    }

    // Скрытие диалога окончания игры
    hideEndDialog() {
        this.localState.showEndDialog = false;
        this.updateEndDialog();
    }

    // Обновление интерфейса - будет реализовано в основном скрипте
    updateUI() {
        // Эта функция будет переопределена в основном скрипте
    }

    // Обновление трансформации карточки
    updateCardTransform() {
        // Эта функция будет переопределена в основном скрипте
    }

    // Обновление диалога окончания игры
    updateEndDialog() {
        // Эта функция будет переопределена в основном скрипте
    }
}

// Экспорт для других модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
} else {
    window.GameEngine = GameEngine;
}