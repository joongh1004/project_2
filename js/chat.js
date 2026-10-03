/**
 * LISTEN Chat - Enneagram Bible Content Curator & Counseling Chatbot
 */

const ListenChat = (function() {
  let userProfile = null;
  let chatMessages = [];
  const CHAT_STORAGE_KEY = 'listen_chat_messages_v1';

  // Sample Spiritual Guidance Database by Enneagram Type
  const ENNEAGRAM_SPIRITUAL_GUIDANCE = {
    1: {
      title: "개혁가 (The Reformer)",
      counsel: "완벽함에 대한 부담과 내면의 일그러짐을 스스로 다 고치려 하지 마세요. 하나님은 이미 당신을 그리스도 안에서 완전하다 하십니다.",
      verses: ["수고하고 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라 (마태복음 11:28)", "너희의 선함이 사람 앞에 나타나지 않게 하라 (마태복음 6:1)"],
      quickTags: ["완벽주의해소", "스트레스완화", "은혜와휴식", "비판적마음"]
    },
    2: {
      title: "조력자 (The Helper)",
      counsel: "남을 돕느라 자신의 영적 잔이 마르지 않게 하세요. 당신이 누군가를 돕기 이전에, 하나님이 먼저 당신을 온전히 사랑하십니다.",
      verses: ["너의 하나님 여호와가 너의 가운데에 계시니 그는 구원을 베푸실 전능자시라 (스바냐 3:17)"],
      quickTags: ["인정욕구", "자기돌봄", "사랑과경계", "번아웃극복"]
    },
    3: {
      title: "성취자 (The Achiever)",
      counsel: "성과와 세상의 평판이 당신의 가치를 결정하지 않습니다. 하나님 앞에서는 아무 일도 이루지 않아도 당신은 그분의 소중한 자녀입니다.",
      verses: ["사람이 만일 온 천하를 얻고도 제 목숨을 잃으면 무엇이 유익하리요 (마태복음 16:26)"],
      quickTags: ["진정성", "성과압박", "하나님의가치", "정체성"]
    },
    4: {
      title: "개성가 (The Individualist)",
      counsel: "깊은 외로움과 감정의 기복 속에서도 하나님의 신실하신 손길이 함께합니다. 당신의 고유한 감성은 하나님 나라의 아름다운 찬양입니다.",
      verses: ["여호와는 마음이 상한 자를 가까이 하시고 충심으로 통회하는 자를 구원하시는도다 (시편 34:18)"],
      quickTags: ["외로움극복", "감성묵상", "자기연민퇴치", "시편기도"]
    },
    5: {
      title: "탐구자 (The Investigator)",
      counsel: "지식과 정보를 모으는 것만으로 영적 고립을 채울 수 없습니다. 하나님을 믿는 마음으로 세상을 향해 담대히 걸어 나오세요.",
      verses: ["너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 (잠언 3:5)"],
      quickTags: ["불안과신뢰", "지혜와믿음", "고립감해소", "하나님관점"]
    },
    6: {
      title: "수호자 (The Loyalist)",
      counsel: "미래에 대한 두려움과 안전에 대한 불안을 선하신 선한 목자 되신 하나님께 맡기세요. 주님 안에는 참된 안전이 있습니다.",
      verses: ["아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 구하라 (빌립보서 4:6)"],
      quickTags: ["불안퇴치", "담대한믿음", "평안의기도", "안전함"]
    },
    7: {
      title: "열정가 (The Enthusiast)",
      counsel: "새로운 자극과 즐거움을 찾아 헤매지 않아도, 십자가 안에는 썩지 않고 고갈되지 않는 진정한 기쁨과 평안이 있습니다.",
      verses: ["주께서 생명의 길을 내게 보이시리니 주의 앞에는 충만한 기쁨이 있고 (시편 16:11)"],
      quickTags: ["진정한기쁨", "영적절제", "참된만족", "깊은묵상"]
    },
    8: {
      title: "도전자 (The Challenger)",
      counsel: "스스로를 통제하고 싸우려 하지 않아도 됩니다. 가장 강력한 능력은 온유함과 겸손으로 십자가를 지신 예수님의 사랑에 있습니다.",
      verses: ["나는 마음이 온유하고 겸손하니 나의 멍에를 메고 내게 배우라 (마태복음 11:29)"],
      quickTags: ["온유함", "용서와포용", "하나님의주권", "리더십"]
    },
    9: {
      title: "평화주의자 (The Peacemaker)",
      counsel: "갈등이 무서워 조용히 머무르지 마세요. 하나님께서 당신에게 주신 소명과 목소리를 높여 세상을 적극적으로 화평하게 하세요.",
      verses: ["화평하게 하는 자는 복이 있나니 그들이 하나님의 아들이라 일컬음을 받을 것임이요 (마태복음 5:9)"],
      quickTags: ["평화와용기", "소명발견", "무기력탈출", "결단"]
    }
  };

  /**
   * Initialize Chat Controller
   */
  async function init() {
    loadUserProfile();
    loadChatHistory();
    renderChatUI();
  }

  function loadUserProfile() {
    const saved = localStorage.getItem('enneagram_result');
    if (saved) {
      try {
        userProfile = JSON.parse(saved);
      } catch(e) {}
    }

    if (!userProfile) {
      // Default sample profile if test not taken yet
      userProfile = {
        primaryType: 1,
        wing: "1w9",
        title: "평화로운 개혁가 (1w9)",
        description: "올바른 원칙을 지키면서도 내면의 평화를 추구하는 기질입니다."
      };
    }
  }

  function loadChatHistory() {
    const savedLog = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedLog) {
      try {
        chatMessages = JSON.parse(savedLog);
      } catch(e) {}
    }

    // Add Initial Welcome Message if empty
    if (chatMessages.length === 0) {
      const guidance = ENNEAGRAM_SPIRITUAL_GUIDANCE[userProfile.primaryType] || ENNEAGRAM_SPIRITUAL_GUIDANCE[1];
      chatMessages.push({
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `안녕하세요! **${userProfile.title || '성도'}**님 🕊️\n\nLISTEN 영적 대화 상담실에 오신 것을 환영합니다.\n\n*${guidance.counsel}*\n\n오늘 마음에 느껴지는 생각이나 고민, 또는 도움이 필요한 상태를 말씀해 주시면, 성경 말씀과 함께 **맞춤형 인터넷 컨텐츠(찬양, 영상, 칼럼)**를 추천해 드릴게요!`,
        quickTags: guidance.quickTags
      });
    }
  }

  function saveChatHistory() {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
  }

  /**
   * User sends a message
   */
  async function sendMessage(text, tag = '') {
    if (!text && !tag) return;

    const userText = text || `#${tag}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Push User Message
    chatMessages.push({
      sender: 'user',
      timestamp,
      text: userText
    });
    renderChatUI();

    // Show bot typing indicator
    const typingMsg = { sender: 'bot', isTyping: true };
    chatMessages.push(typingMsg);
    renderChatUI();

    // Fetch recommendations from Metadata DB
    const query = text || tag;
    const recommendations = await ContentDB.getRecommendations(userProfile.wing, query, tag);

    // Simulate natural AI response delay
    setTimeout(() => {
      // Remove typing indicator
      chatMessages = chatMessages.filter(m => !m.isTyping);

      // Formulate Bot Response
      const botResponse = generateBotResponse(userText, recommendations, tag);
      chatMessages.push(botResponse);

      saveChatHistory();
      renderChatUI();
    }, 800);
  }

  /**
   * Generate Bot Response with recommendations
   */
  function generateBotResponse(query, contents, tag) {
    const mainType = userProfile.primaryType || 1;
    const guidance = ENNEAGRAM_SPIRITUAL_GUIDANCE[mainType] || ENNEAGRAM_SPIRITUAL_GUIDANCE[1];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const randomVerse = guidance.verses[Math.floor(Math.random() * guidance.verses.length)];

    let text = `**${userProfile.title}**님의 마음을 깊이 헤아려 봅니다. 🌿\n\n📖 **묵상 말씀**:\n> "${randomVerse}"\n\n`;

    if (tag) {
      text += `'**#${tag}**'에 관한 상황 속에서 하나님께서 주시는 평안이 함께하기를 원합니다. `;
    } else {
      text += `말씀하신 '*${query}*'에 대한 생각 속에 하나님의 뜻과 안식이 임하기를 기도합니다. `;
    }

    if (contents.length > 0) {
      text += `\n\n👇 **${userProfile.wing}** 성향과 마음에 맞춘 **추천 인터넷 컨텐츠**를 준비했습니다:`;
    } else {
      text += `\n\n더 많은 묵상 컨텐츠가 관리자에 의해 꾸준히 추가될 예정입니다.`;
    }

    return {
      sender: 'bot',
      timestamp,
      text,
      cards: contents.slice(0, 3) // Recommend top 3
    };
  }

  /**
   * Clear Chat Log
   */
  function clearChat() {
    chatMessages = [];
    localStorage.removeItem(CHAT_STORAGE_KEY);
    loadChatHistory();
    renderChatUI();
  }

  /**
   * Render Chat UI into DOM
   */
  function renderChatUI() {
    const container = document.getElementById('chat-messages-list');
    if (!container) return;

    container.innerHTML = chatMessages.map((msg, index) => {
      if (msg.isTyping) {
        return `
          <div class="chat-bubble-wrapper bot">
            <div class="avatar">LISTEN</div>
            <div class="chat-bubble typing">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        `;
      }

      const isBot = msg.sender === 'bot';
      const formattedText = msg.text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');

      let cardsHtml = '';
      if (msg.cards && msg.cards.length > 0) {
        cardsHtml = `
          <div class="recommendation-cards-container">
            ${msg.cards.map(card => `
              <div class="content-card">
                <div class="card-thumb" style="background-image: url('${card.thumbnailUrl || 'images/default_thumb.jpg'}')">
                  <span class="badge ${card.category}">${getCategoryLabel(card.category)}</span>
                </div>
                <div class="card-body">
                  <h4 class="card-title">${card.title}</h4>
                  <p class="card-summary">${card.summary}</p>
                  ${card.bibleVerse ? `<div class="card-verse">📖 ${card.bibleVerse}</div>` : ''}
                  <div class="card-tags">
                    ${(card.tags || []).map(t => `<span class="tag">#${t}</span>`).join('')}
                  </div>
                  <a href="${card.url}" target="_blank" rel="noopener" class="card-btn">
                    <span>컨텐츠 보기 / 재생</span> ↗
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      let tagsHtml = '';
      if (msg.quickTags && msg.quickTags.length > 0) {
        tagsHtml = `
          <div class="quick-tags-wrapper">
            ${msg.quickTags.map(tag => `
              <button class="quick-tag-btn" onclick="ListenChat.sendMessage('', '${tag}')">#${tag}</button>
            `).join('')}
          </div>
        `;
      }

      return `
        <div class="chat-bubble-wrapper ${msg.sender}">
          ${isBot ? '<div class="avatar">LISTEN</div>' : ''}
          <div class="bubble-content-box">
            <div class="chat-bubble ${msg.sender}">
              ${formattedText}
            </div>
            ${cardsHtml}
            ${tagsHtml}
            <span class="chat-timestamp">${msg.timestamp}</span>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  function getCategoryLabel(cat) {
    const map = {
      music: '🎵 찬양/CCM',
      video: '🎬 설교/영상',
      article: '📝 영성칼럼',
      book: '📚 묵상집',
      podcast: '🎙️ 팟캐스트'
    };
    return map[cat] || '✨ 묵상';
  }

  return {
    init,
    sendMessage,
    clearChat
  };
})();

window.ListenChat = ListenChat;
