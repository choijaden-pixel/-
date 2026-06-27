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

    // Guestbook Form Submission
    const messageForm = document.getElementById('messageForm');
    const messageList = document.getElementById('messageList');

    // Add some default messages
    const initialMessages = [
        { name: '주인 언니', text: '우리 예쁜 쫑이! 아프지 말고 오래오래 함께하자 사랑해 💕' },
        { name: '동네 멍멍이 친구', text: '쫑이야 다음에 또 공원에서 만나서 같이 놀자 왈왈!' }
    ];

    initialMessages.forEach(msg => addMessageToDOM(msg.name, msg.text));

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('senderName');
        const contentInput = document.getElementById('messageContent');
        
        const name = nameInput.value.trim();
        const text = contentInput.value.trim();
        
        if (name && text) {
            addMessageToDOM(name, text);
            
            // Clear form
            nameInput.value = '';
            contentInput.value = '';
            
            // Add a little celebration effect (could be confetti, but let's just do a simple scale animation on the button)
            const btn = messageForm.querySelector('.submit-btn');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> 남겨졌어요!';
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 발도장 꾹 남기기';
            }, 2000);
        }
    });

    function addMessageToDOM(name, text) {
        const msgCard = document.createElement('div');
        msgCard.className = 'message-card';
        
        const msgHeader = document.createElement('h4');
        msgHeader.textContent = name;
        
        const msgBody = document.createElement('p');
        msgBody.textContent = text;
        
        msgCard.appendChild(msgHeader);
        msgCard.appendChild(msgBody);
        
        // Add to top of list
        if (messageList.firstChild) {
            messageList.insertBefore(msgCard, messageList.firstChild);
        } else {
            messageList.appendChild(msgCard);
        }
    }
});
