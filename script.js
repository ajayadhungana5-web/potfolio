// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- Custom Cursor Logic ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const hoverables = document.querySelectorAll('.hoverable, .hoverable-input');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Immediate dot follow
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Cursor trails with staggered delay
    document.querySelectorAll('.cursor-trail').forEach((trail, index) => {
        trail.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 150 + index * 100, fill: "forwards" });
    });

    // Delayed outline follow
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });

    // Premium Spotlight Effect
    document.body.style.setProperty('--mouse-x', `${posX}px`);
    document.body.style.setProperty('--mouse-y', `${posY}px`);
});

hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('cursor-hover');
    });
});

// --- Magnetic Button Effect ---
const magnets = document.querySelectorAll('.magnetic-btn');
magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', (e) => {
        const rect = magnet.getBoundingClientRect();
        // Calculate distance from center
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Move button towards mouse (magnetic pull)
        gsap.to(magnet, {
            x: x * 0.5,
            y: y * 0.5,
            rotate: x * 0.05,
            duration: 0.5,
            ease: "power3.out"
        });

        // Move content slightly less for depth (parallax)
        gsap.to(magnet.querySelectorAll('span, div'), {
            x: x * 0.2,
            y: y * 0.2,
            duration: 0.5,
            ease: "power3.out"
        });
    });

    magnet.addEventListener('mouseleave', () => {
        // Elastic snap back
        gsap.to(magnet, {
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.3)"
        });
        gsap.to(magnet.querySelectorAll('span, div'), {
            x: 0,
            y: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.3)"
        });
    });
});


// --- Enhanced ID Card Physics with Rope Bending & Dragging ---
const idSystem = document.getElementById('id-system');
const idBadge = document.getElementById('id-badge');
const badgeGlare = document.getElementById('badge-glare');
const ropePath = document.getElementById('rope-path');

if (idSystem && idBadge && ropePath) {
    // Physics variables
    let isDragging = false;
    let velocity = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    let targetRotation = { x: 0, y: 0, z: 0 };
    let mouseStart = { x: 0, y: 0 };
    let currentPosition = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };

    // Physics constants
    const SPRING_STRENGTH = 0.15;
    const DAMPING = 0.85;
    const ROPE_FLEXIBILITY = 80;
    const MAX_ROTATION = 35;

    // Update rope path based on card position
    function updateRopePath(rotX, rotY, rotZ) {
        // Calculate rope bend based on rotation
        const ropeHeight = 200;
        const ropeWidth = 40;

        // Calculate control points for bezier curve
        const bendX = (rotZ / MAX_ROTATION) * ROPE_FLEXIBILITY;
        const bendY = (rotX / MAX_ROTATION) * 30;

        // Create curved path
        const startX = ropeWidth / 2;
        const startY = 0;
        const endX = ropeWidth / 2;
        const endY = ropeHeight;

        // Control points for S-curve
        const cp1X = startX + bendX * 0.3;
        const cp1Y = ropeHeight * 0.25 + bendY;
        const cp2X = startX + bendX * 0.7;
        const cp2Y = ropeHeight * 0.75 - bendY;

        const pathD = `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
        ropePath.setAttribute('d', pathD);
    }

    // Animation loop for smooth physics
    function animateCard() {
        // Spring physics towards target rotation
        rotation.x += (targetRotation.x - rotation.x) * SPRING_STRENGTH;
        rotation.y += (targetRotation.y - rotation.y) * SPRING_STRENGTH;
        rotation.z += (targetRotation.z - rotation.z) * SPRING_STRENGTH;

        // Apply damping
        rotation.x *= DAMPING;
        rotation.y *= DAMPING;
        rotation.z *= DAMPING;

        // Apply rotation
        gsap.set(idSystem, {
            rotateX: rotation.x,
            rotateY: rotation.y,
            rotateZ: rotation.z,
            force3D: true
        });

        // Update rope path
        updateRopePath(rotation.x, rotation.y, rotation.z);

        requestAnimationFrame(animateCard);
    }

    // Start animation loop
    animateCard();

    // Ambient swinging animation (when not interacting)
    let ambientSwing = gsap.to(targetRotation, {
        z: 3,
        y: 2,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
    });

    // Mouse/Touch move handler
    function handleMove(e) {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (isDragging) {
            // Calculate drag distance
            const deltaX = clientX - lastMousePos.x;
            const deltaY = clientY - lastMousePos.y;

            // Update velocity
            velocity.x = deltaX;
            velocity.y = deltaY;

            // Calculate rotation based on drag
            targetRotation.z = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, deltaX * 2));
            targetRotation.x = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, -deltaY * 1.5));
            // Accumulate Y for full 3D flip
            targetRotation.y += deltaX * 0.8;

            lastMousePos.x = clientX;
            lastMousePos.y = clientY;
        } else {
            // Hover effect - subtle movement
            const rect = idBadge.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = clientX - centerX;
            const distanceY = clientY - centerY;

            // Calculate rotation (less intense than drag)
            targetRotation.x = (distanceY / (rect.height / 2)) * -15;
            // Only apply hover rotation if we're near 0 or 180
            const snappedY = Math.round(targetRotation.y / 180) * 180;
            targetRotation.y = snappedY + (distanceX / (rect.width / 2)) * 15;
            targetRotation.z = (distanceX / (rect.width / 2)) * 8;

            // Update glare position
            const percentX = ((clientX - rect.left) / rect.width) * 100;
            const percentY = ((clientY - rect.top) / rect.height) * 100;

            if (badgeGlare) {
                gsap.to(badgeGlare, {
                    backgroundPosition: `${percentX}% ${percentY}%`,
                    opacity: 1,
                    duration: 0.1
                });
            }
        }
    }

    // Mouse down / Touch start
    function handleStart(e) {
        isDragging = true;
        idSystem.classList.add('dragging');
        ambientSwing.pause();

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        mouseStart.x = clientX;
        mouseStart.y = clientY;
        lastMousePos.x = clientX;
        lastMousePos.y = clientY;

        e.preventDefault();
    }

    // Mouse up / Touch end
    function handleEnd() {
        if (!isDragging) return;

        isDragging = false;
        idSystem.classList.remove('dragging');

        // Apply momentum to Y only for smooth spins
        targetRotation.y += velocity.x * 2;

        // Find nearest 180 degree marking to flip perfectly front or back
        const snappedY = Math.round(targetRotation.y / 180) * 180;

        // Spring back to neutral/snapped position
        gsap.to(targetRotation, {
            x: 0,
            y: snappedY,
            z: 0,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)",
            onComplete: () => {
                // Adjust ambient spin based on which side is showing
                ambientSwing.pause();
                ambientSwing = gsap.to(targetRotation, {
                    z: 3,
                    y: snappedY + 2,
                    duration: 2.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // Hide glare
        if (badgeGlare) gsap.to(badgeGlare, { opacity: 0, duration: 0.5 });

        // Reset velocity
        velocity.x = 0;
        velocity.y = 0;
    }

    // Event listeners
    idSystem.addEventListener('mousedown', handleStart);
    idSystem.addEventListener('touchstart', handleStart, { passive: false });

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    // Hover events for non-dragging interactions
    idSystem.addEventListener('mouseenter', () => {
        if (!isDragging) {
            ambientSwing.pause();
        }
    });

    idSystem.addEventListener('mouseleave', () => {
        if (!isDragging) {
            // Reset rotation
            gsap.to(targetRotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                ease: "elastic.out(1, 0.4)",
                onComplete: () => {
                    ambientSwing.play();
                }
            });

            // Hide glare
            gsap.to(badgeGlare, { opacity: 0, duration: 0.5 });
        }
    });
}

// --- Split Text Function (Alternative to paid GSAP SplitText) ---
// --- Split Text Function (Alternative to paid GSAP SplitText) ---
function splitTextIntoSpans(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'char inline-block will-change-transform';
            span.innerHTML = char === ' ' ? '&nbsp;' : char;
            el.appendChild(span);
        });
    });
}

// --- Loader Animation ---
splitTextIntoSpans('#loader-word');
splitTextIntoSpans('.hero-text-line'); // Split hero text too

const tl = gsap.timeline();

// Loader chars reveal
tl.to('#loader-word .char', {
    y: 0,
    stagger: 0.05,
    duration: 0.8,
    ease: "power4.out"
})
    // Wait a bit
    .to({}, { duration: 0.5 })
    // Loader slide up
    .to('#loader', {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut"
    })
    // Premium Hero Text Staggered Reveal
    .from('.hero-text-line .char', {
        y: 150,
        rotate: 10,
        opacity: 0,
        stagger: {
            amount: 0.8,
            from: "start"
        },
        duration: 1.5,
        ease: "power4.out"
    }, "-=0.6")
    // Hero sub-elements reveal
    .from('.hero-reveal', {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out"
    }, "-=1.0");

// --- Scroll Animations ---

// About Me Section Animations
const aboutSection = document.getElementById('about');
if (aboutSection) {
    // Photos stack animation
    gsap.from('.about-photo', {
        scrollTrigger: {
            trigger: aboutSection,
            start: 'top 75%',
        },
        y: 100,
        x: (index) => index * -30,
        rotate: (index) => (index === 0 ? -5 : 5),
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "back.out(1.2)"
    });

    // Parallax sub-elements for photo stack
    gsap.to('.about-photo:nth-child(2)', {
        scrollTrigger: {
            trigger: aboutSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        y: -40,
        rotate: 8
    });

    // Text reveal stagger
    gsap.from('.about-reveal', {
        scrollTrigger: {
            trigger: aboutSection,
            start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
    });
}

// Expertise Cards Stagger
gsap.from('.expertise-card', {
    scrollTrigger: {
        trigger: '#expertise',
        start: 'top 70%',
    },
    y: 50,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: "power3.out"
});

// Section Titles Reveal
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: {
            trigger: title,
            start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
    });
});

// Section Fades
gsap.utils.toArray('.section-fade').forEach(fade => {
    gsap.from(fade, {
        scrollTrigger: {
            trigger: fade,
            start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out"
    });
});


// Infinite Marquee Animation
gsap.to('.marquee-container h2', {
    xPercent: -50,
    ease: "none",
    duration: 20,
    repeat: -1
});

// ============================================
// EXPERTISE SECTION ANIMATIONS
// ============================================

// Animate Progress Bars on Scroll
gsap.utils.toArray('.expertise-card .bg-brand-green').forEach((bar) => {
    const targetWidth = bar.parentElement.querySelector('.bg-brand-green').style.width ||
        bar.classList.toString().match(/w-\[(\d+)%\]/)?.[1] ||
        bar.classList.toString().match(/w-full/) ? '100' : '98';

    // Set initial width to 0
    gsap.set(bar, { width: '0%' });

    ScrollTrigger.create({
        trigger: bar,
        start: 'top 80%',
        onEnter: () => {
            gsap.to(bar, {
                width: targetWidth + '%',
                duration: 1.5,
                ease: 'power3.out',
                delay: 0.2
            });
        },
        once: true
    });
});

// Progress bar animations were kept, card entrance animations removed since they are handled by staggered animation earlier.

// Mouse tracking and 3D Tilt for cards
document.querySelectorAll('.expertise-card, .project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            ease: "power2.out",
            duration: 0.4
        });

        // Set variables for inner glow
        card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
        card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            ease: "power2.out",
            duration: 0.8
        });
    });
});

// Floating 3D Shapes Animation
gsap.to('.shape-1', {
    y: '-=60',
    rotateX: 360,
    rotateY: 180,
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});
gsap.to('.shape-2', {
    y: '+=100',
    x: '-=40',
    rotateZ: 360,
    rotateX: 45,
    duration: 25,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});
gsap.to('.shape-3', {
    y: '-=40',
    x: '+=60',
    rotateX: -180,
    rotateZ: 180,
    duration: 15,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// --- Tic Tac Toe Mini Game Logic ---
const ticBoard = document.getElementById('tictactoe-board');
const ticCells = document.querySelectorAll('.tic-cell');
const gameStatus = document.getElementById('game-status');
const resetBtn = document.getElementById('reset-game');

if (ticBoard && ticCells.length > 0) {
    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let isPlayerTurn = true; // Player is X, AI is O

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function handleCellClick(e) {
        const cell = e.target;
        const cellIndex = parseInt(cell.getAttribute('data-index'));

        if (board[cellIndex] !== '' || !gameActive || !isPlayerTurn) return;

        // Player Move
        makeMove(cellIndex, 'X');

        if (checkWin('X')) {
            endGame('YOU WIN!');
            return;
        }

        if (board.indexOf('') === -1) {
            endGame('DRAW!');
            return;
        }

        // AI Turn
        isPlayerTurn = false;
        gameStatus.innerText = "AI THINKING...";
        gameStatus.style.color = "#888";

        setTimeout(() => {
            makeAiMove();
        }, 600);
    }

    function makeMove(index, player) {
        board[index] = player;
        ticCells[index].innerText = player;
        ticCells[index].classList.add(player === 'X' ? 'tic-x' : 'tic-o');
    }

    function makeAiMove() {
        if (!gameActive) return;

        // Simple AI: Try to win, block, or pick random
        let bestMove = -1;

        // 1. Try to win
        bestMove = findWinningMove('O');

        // 2. Block player
        if (bestMove === -1) bestMove = findWinningMove('X');

        // 3. Take center
        if (bestMove === -1 && board[4] === '') bestMove = 4;

        // 4. Random empty cell
        if (bestMove === -1) {
            const emptyCells = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
            if (emptyCells.length > 0) {
                bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        }

        if (bestMove !== -1) {
            makeMove(bestMove, 'O');

            if (checkWin('O')) {
                endGame('AI WINS!');
                return;
            }

            if (board.indexOf('') === -1) {
                endGame('DRAW!');
                return;
            }
        }

        isPlayerTurn = true;
        gameStatus.innerText = "YOUR TURN (X)";
        gameStatus.style.color = "#00ff66";
    }

    function findWinningMove(player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];

            if (board[a] === player && board[b] === player && board[c] === '') return c;
            if (board[a] === player && board[c] === player && board[b] === '') return b;
            if (board[b] === player && board[c] === player && board[a] === '') return a;
        }
        return -1;
    }

    function checkWin(player) {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] === player && board[b] === player && board[c] === player) {
                roundWon = true;
                ticCells[a].classList.add('tic-win');
                ticCells[b].classList.add('tic-win');
                ticCells[c].classList.add('tic-win');
                break;
            }
        }
        return roundWon;
    }

    function endGame(message) {
        gameActive = false;
        gameStatus.innerText = message;
        if (message === 'YOU WIN!' || message === 'AI WINS!') {
            gameStatus.style.color = message === 'YOU WIN!' ? "#fff" : "#ff3333";
        } else {
            gameStatus.style.color = "#888"; // Draw
        }
    }

    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        isPlayerTurn = true;
        gameStatus.innerText = "YOUR TURN (X)";
        gameStatus.style.color = "#00ff66";

        ticCells.forEach(cell => {
            cell.innerText = '';
            cell.classList.remove('tic-x', 'tic-o', 'tic-win');
        });
    }

    ticCells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
}

// --- Contact Form AJAX Submission (Web3Forms — silent, no redirect) ---
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
        submitBtn.innerHTML = '<span>Sending...</span> <i class="ph ph-spinner animate-spin ml-2"></i>';
        formStatus.classList.add('hidden');

        const name = contactForm.querySelector('[name="name"]').value.trim();
        const email = contactForm.querySelector('[name="email"]').value.trim();
        const message = contactForm.querySelector('[name="message"]').value.trim();

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: '0197a8f3-4c26-4b4b-ab1b-4c375226acdc',
                    name: name,
                    email: email,
                    message: message,
                    subject: 'New message from portfolio!'
                })
            });

            const result = await response.json();

            if (result.success) {
                formStatus.textContent = '✅ Message sent! I\'ll get back to you soon.';
                formStatus.className = 'text-brand-green font-sans text-sm text-center mt-2';
                contactForm.reset();
            } else {
                formStatus.textContent = '❌ Failed to send. Please try again.';
                formStatus.className = 'text-red-400 font-sans text-sm text-center mt-2';
            }
        } catch (error) {
            formStatus.textContent = '❌ Network error. Please try again later.';
            formStatus.className = 'text-red-400 font-sans text-sm text-center mt-2';
        } finally {
            formStatus.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            submitBtn.innerHTML = originalBtnHtml;

            setTimeout(() => {
                formStatus.classList.add('hidden');
            }, 8000);
        }
    });
}

// --- Horizontal Scroll for Work Section ---
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const workStrip = document.getElementById('work-strip');
    const workSection = document.getElementById('work');
    const workCards = gsap.utils.toArray('.work-card');
    const progressLabel = document.getElementById('work-progress-label');
    const workDots = document.querySelectorAll('.work-dot');

    if (workStrip && workSection && workCards.length > 0) {

        const tween = gsap.to(workStrip, {
            x: () => -(workStrip.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: workSection,
                start: "top top",
                end: () => `+=${workStrip.scrollWidth - window.innerWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const totalCards = workCards.length;
                    let activeIndex = Math.min(
                        totalCards - 1,
                        Math.floor(progress * totalCards)
                    );
                    if (progress > 0.95) activeIndex = totalCards - 1;

                    if (progressLabel) {
                        progressLabel.textContent = `0${activeIndex + 1} / 0${totalCards}`;
                    }

                    if (workDots) {
                        workDots.forEach((dot, index) => {
                            if (index === activeIndex) {
                                dot.style.width = '24px';
                                dot.style.backgroundColor = '#00ff66';
                            } else {
                                dot.style.width = '8px';
                                dot.style.backgroundColor = 'rgba(255,255,255,0.2)';
                            }
                        });
                    }
                }
            }
        });
    }
}
