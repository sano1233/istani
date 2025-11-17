// Istani Fitness - Main JavaScript
// iOS-Styled Interactions and Animations

// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed nav
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  });
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
      });
      navLink.classList.add('active');
    }
  });

  // Nav background blur on scroll
  const nav = document.querySelector('.nav-ios');
  if (scrollY > 50) {
    nav.style.background = 'rgba(0, 0, 0, 0.95)';
  } else {
    nav.style.background = 'rgba(0, 0, 0, 0.8)';
  }
});

// Chat widget toggle
function toggleChat() {
  const chatPanel = document.getElementById('chat-panel');
  const chatFab = document.querySelector('.chat-fab');

  if (chatPanel.style.display === 'none' || !chatPanel.style.display) {
    chatPanel.style.display = 'flex';
    chatFab.style.transform = 'rotate(90deg)';
    // Focus on input when opening
    setTimeout(() => {
      document.getElementById('chat-input').focus();
    }, 300);
  } else {
    chatPanel.style.display = 'none';
    chatFab.style.transform = 'rotate(0deg)';
  }
}

// Handle chat keypress (Enter to send)
function handleChatKeypress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

// Send chat message
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessageToChat(message, 'user');
  input.value = '';

  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message ai typing';
  typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
  typingDiv.id = 'typing-indicator';
  document.getElementById('chat-panel-messages').appendChild(typingDiv);
  scrollChatToBottom();

  // Get AI response
  try {
    const response = await getAIResponse(message);

    // Remove typing indicator
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();

    // Add AI response
    addMessageToChat(response, 'ai');
  } catch (error) {
    console.error('Error getting AI response:', error);
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
    addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
  }
}

// Add message to chat
function addMessageToChat(message, type) {
  const messagesContainer = document.getElementById('chat-panel-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${type}`;

  if (type === 'ai') {
    messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
  } else {
    messageDiv.innerHTML = `<p>${message}</p>`;
  }

  messagesContainer.appendChild(messageDiv);
  scrollChatToBottom();
}

// Scroll chat to bottom
function scrollChatToBottom() {
  const messagesContainer = document.getElementById('chat-panel-messages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Program actions
function startProgram(programType) {
  console.log(`Starting ${programType} program`);

  // Show notification
  showNotification(
    `🎉 Starting ${programType} program! Opening AI Coach to create your personalized plan...`,
  );

  // Open AI coach with context
  setTimeout(() => {
    openAICoach(programType);
  }, 1500);
}

function openAICoach(programType = null) {
  toggleChat();

  if (programType) {
    setTimeout(() => {
      const contextMessage = `I want to start the ${programType} program. Can you create a personalized workout plan for me?`;
      document.getElementById('chat-input').value = contextMessage;
    }, 500);
  }
}

function scrollToPrograms() {
  const programsSection = document.getElementById('programs');
  if (programsSection) {
    const offsetTop = programsSection.offsetTop - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  }
}

function startTrial() {
  showNotification('🚀 Starting your 14-day free trial! Opening registration...');

  // In a real app, this would open a registration modal or redirect
  setTimeout(() => {
    alert(
      'Free trial registration would open here. For demo purposes, you can start chatting with the AI Coach!',
    );
    openAICoach();
  }, 1000);
}

// Notification system
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification-ios';
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: rgba(6, 182, 212, 0.95);
        backdrop-filter: blur(16px);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 600;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Istani Fitness initialized');

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  document
    .querySelectorAll('.program-card-ios, .nutrition-card, .principle-card, .ai-feature')
    .forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s ease';
      observer.observe(el);
    });
});

// Handle errors gracefully
window.addEventListener('error', (e) => {
  console.error('Application error:', e);
});

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment when service worker is ready
    // navigator.serviceWorker.register('/sw.js')
    //     .then(reg => console.log('Service Worker registered'))
    //     .catch(err => console.log('Service Worker registration failed'));
  });
}
