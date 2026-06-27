document.addEventListener('DOMContentLoaded', () => {
    // 🐾 Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }, 800); // Show loading screen for at least 0.8s for cuteness
    });

    // 🌙 Night Mode Toggle
    const nightModeBtn = document.getElementById('nightModeBtn');
    let isNightMode = false;
    nightModeBtn.addEventListener('click', () => {
        isNightMode = !isNightMode;
        document.body.classList.toggle('night-mode');
        
        // Change icon and petals
        const icon = nightModeBtn.querySelector('i');
        if (isNightMode) {
            icon.className = 'fa-solid fa-sun';
            petalIconsArray = ['fa-star', 'fa-moon', 'fa-cloud'];
        } else {
            icon.className = 'fa-solid fa-moon';
            petalIconsArray = ['fa-heart', 'fa-leaf', 'fa-star'];
        }
    });

    // Custom Cursor
    const cursor = document.getElementById('cursorPaw');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
    });

    // Hide default cursor for clickable elements and add custom hover effect
    const clickables = document.querySelectorAll('a, button, input, textarea, .gallery-item');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.color = '#ff4757';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.color = 'var(--accent-color)';
        });
    });

    // Smooth Scrolling for Nav Links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Guestbook Form Submission & Firebase Integration
    const messageForm = document.getElementById('messageForm');
    const messageList = document.getElementById('messageList');
    const pagination = document.getElementById('pagination');
    const FIREBASE_URL = 'https://jjong-de843-default-rtdb.firebaseio.com/messages.json';
    
    let globalMessages = [];
    let currentPage = 1;
    const itemsPerPage = 5;

    // Fetch existing messages from Firebase
    async function loadMessages() {
        try {
            messageList.innerHTML = '<p style="text-align:center; color:var(--text-light);">🐾 방명록을 불러오는 중이개...</p>';
            const response = await fetch(FIREBASE_URL);
            if (!response.ok) throw new Error('서버 에러');
            const data = await response.json();
            
            if (data) {
                globalMessages = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                // Sort by timestamp descending (newest first)
                globalMessages.sort((a, b) => b.timestamp - a.timestamp);
            }
            renderPage();
        } catch (error) {
            console.error('Error loading messages:', error);
            messageList.innerHTML = '<p style="text-align:center; color:red;">방명록을 불러오는데 실패했어요 ㅠㅠ</p>';
        }
    }

    function renderPage() {
        messageList.innerHTML = '';
        pagination.innerHTML = '';
        
        if (globalMessages.length === 0) {
            messageList.innerHTML = '<p style="text-align:center; color:var(--text-light);">아직 작성된 방명록이 없어요! 첫 발도장을 찍어주세요 🐾</p>';
            return;
        }
        
        const totalPages = Math.ceil(globalMessages.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageMessages = globalMessages.slice(startIndex, endIndex);
        
        pageMessages.forEach(msg => addMessageToDOM(msg.name, msg.text));
        
        // Render pagination buttons
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderPage();
            });
            pagination.appendChild(btn);
        }
    }

    // Load messages on startup
    loadMessages();

    // Handle new message submission
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('senderName');
        const contentInput = document.getElementById('messageContent');
        const btn = messageForm.querySelector('.submit-btn');
        
        const name = nameInput.value.trim();
        const text = contentInput.value.trim();
        
        if (name && text) {
            // Disable button during submission
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 전송 중...';

            const newMessage = {
                name: name,
                text: text,
                timestamp: Date.now()
            };

            try {
                // Send to Firebase
                const response = await fetch(FIREBASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newMessage)
                });
                
                if (!response.ok) throw new Error('저장 실패');

                // Update global array and re-render page 1
                globalMessages.unshift(newMessage);
                currentPage = 1;
                renderPage();
                
                // Clear form
                nameInput.value = '';
                contentInput.value = '';
                
                // Success effect
                btn.innerHTML = '<i class="fa-solid fa-check"></i> 저장 완료!';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 발도장 꾹 남기기';
                }, 2000);
            } catch (error) {
                console.error('Error saving message:', error);
                alert('방명록 저장에 실패했습니다. 다시 시도해주세요!');
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 발도장 꾹 남기기';
            }
        }
    });

    function addMessageToDOM(name, text, prepend = false) {
        const msgCard = document.createElement('div');
        msgCard.className = 'message-card';
        
        const msgHeader = document.createElement('h4');
        msgHeader.textContent = name;
        
        const msgBody = document.createElement('p');
        msgBody.textContent = text;
        
        msgCard.appendChild(msgHeader);
        msgCard.appendChild(msgBody);
        
        messageList.appendChild(msgCard);
    }

    // 🌸 Falling Petals / Stars Effect
    const petalsContainer = document.getElementById('petals-container');
    let petalIconsArray = ['fa-heart', 'fa-leaf', 'fa-star'];
    setInterval(() => {
        const petal = document.createElement('i');
        const icon = petalIconsArray[Math.floor(Math.random() * petalIconsArray.length)];
        petal.className = `fa-solid ${icon} petal`;
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animationDuration = Math.random() * 3 + 4 + 's';
        petal.style.fontSize = Math.random() * 10 + 10 + 'px';
        petalsContainer.appendChild(petal);
        setTimeout(() => petal.remove(), 7000);
    }, 400);

    // ✨ Sparkle Trail Effect
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.8) {
            const sparkle = document.createElement('i');
            sparkle.className = 'fa-solid fa-sparkles sparkle-trail';
            sparkle.style.left = e.clientX + 'px';
            sparkle.style.top = e.clientY + 'px';
            sparkle.style.fontSize = Math.random() * 10 + 5 + 'px';
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
    });

    // 🎵 Music Player Logic
    const musicBtn = document.getElementById('musicBtn');
    const bgmAudio = document.getElementById('bgmAudio');
    let isPlaying = false;

    // Attempt to auto-play music
    const playMusic = () => {
        bgmAudio.play().then(() => {
            isPlaying = true;
            musicBtn.classList.add('playing');
        }).catch(err => {
            // Browsers often block auto-play without user interaction
            console.log("Auto-play blocked by browser. Waiting for user interaction.");
            isPlaying = false;
        });
    };

    // Try playing immediately
    playMusic();

    // If auto-play was blocked, play on first interaction anywhere
    document.body.addEventListener('click', () => {
        if (!isPlaying && bgmAudio.paused) {
            playMusic();
        }
    }, { once: true });

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent body click from firing
        if (isPlaying) {
            bgmAudio.pause();
            musicBtn.classList.remove('playing');
        } else {
            bgmAudio.play();
            musicBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });

    // 🐶 Bark Sound on Hero Image Click
    const heroImage = document.getElementById('main-dog-image');
    const barkAudio = document.getElementById('barkAudio');
    heroImage.style.cursor = 'pointer';
    
    heroImage.addEventListener('click', () => {
        barkAudio.currentTime = 0;
        barkAudio.play();
        
        // Add a cute little jump animation when clicked
        heroImage.style.transform = 'scale(1.1) translateY(-20px)';
        setTimeout(() => {
            heroImage.style.transform = 'scale(1) translateY(0)';
        }, 300);
    });

    // 🦴 Interactive Toy
    const throwToyBtn = document.getElementById('throwToyBtn');
    const toyChaser = document.getElementById('toyChaser');
    let isChasing = false;

    throwToyBtn.addEventListener('click', () => {
        if (isChasing) return;
        isChasing = true;
        
        // Animate bone throwing
        const bone = throwToyBtn.querySelector('i');
        bone.style.transform = 'translateY(-100px) rotate(360deg)';
        bone.style.transition = 'transform 0.5s';
        
        setTimeout(() => {
            bone.style.transform = 'translateY(0) rotate(0)';
        }, 500);

        // Dog chases
        toyChaser.classList.add('chasing');
        
        // Dog runs back
        setTimeout(() => {
            toyChaser.style.left = '-150px'; // Run back
            setTimeout(() => {
                toyChaser.classList.remove('chasing');
                toyChaser.style.left = ''; // Reset CSS
                isChasing = false;
            }, 2000); // Time to run back
        }, 3000); // Time staying there
    });

});
