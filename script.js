document.addEventListener('DOMContentLoaded', () => {
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
    const FIREBASE_URL = 'https://jjong-de843-default-rtdb.firebaseio.com/messages.json';

    // Fetch existing messages from Firebase
    async function loadMessages() {
        try {
            messageList.innerHTML = '<p style="text-align:center; color:var(--text-light);">🐾 방명록을 불러오는 중이개...</p>';
            const response = await fetch(FIREBASE_URL);
            if (!response.ok) throw new Error('서버 에러');
            const data = await response.json();
            
            messageList.innerHTML = ''; // Clear loading text
            
            if (data) {
                // Firebase returns an object with unique keys, we convert it to an array
                const messagesArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                
                // Sort by timestamp descending (newest first)
                messagesArray.sort((a, b) => b.timestamp - a.timestamp);
                
                messagesArray.forEach(msg => addMessageToDOM(msg.name, msg.text));
            } else {
                messageList.innerHTML = '<p style="text-align:center; color:var(--text-light);">아직 작성된 방명록이 없어요! 첫 발도장을 찍어주세요 🐾</p>';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            messageList.innerHTML = '<p style="text-align:center; color:red;">방명록을 불러오는데 실패했어요 ㅠㅠ</p>';
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

                // Add to top of list immediately for good UX
                addMessageToDOM(name, text, true);
                
                // Clear form
                nameInput.value = '';
                contentInput.value = '';
                
                // Success effect
                btn.innerHTML = '<i class="fa-solid fa-check"></i> 저장 완료!';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 발도장 꾹 남기기';
                }, 2000);

                // Remove the "no messages" text if it was the first message
                if (messageList.querySelector('p')) {
                    const p = messageList.querySelector('p');
                    if (p.textContent.includes('아직 작성된')) {
                        p.remove();
                    }
                }
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
        
        if (prepend && messageList.firstChild) {
            messageList.insertBefore(msgCard, messageList.firstChild);
        } else {
            messageList.appendChild(msgCard);
        }
    }

    // 🌸 Falling Petals Effect
    const petalsContainer = document.getElementById('petals-container');
    const petalIcons = ['fa-heart', 'fa-leaf', 'fa-star'];
    setInterval(() => {
        const petal = document.createElement('i');
        const icon = petalIcons[Math.floor(Math.random() * petalIcons.length)];
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

    musicBtn.addEventListener('click', () => {
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

});
