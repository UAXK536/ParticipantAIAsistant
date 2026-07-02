'use strict';

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('question-input');
const sendBtn = document.getElementById('send-btn');
const toast = document.getElementById('toast');

let sessionId = null;
const history = [];

function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showToast(msg, duration = 4000) {
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, duration);
}

function appendMessage(role, text, sources = []) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'You' : 'AI';

  const inner = document.createElement('div');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  inner.appendChild(bubble);

  if (sources.length > 0) {
    const srcEl = document.createElement('div');
    srcEl.className = 'sources';
    srcEl.appendChild(document.createTextNode('Sources: '));

    sources.forEach((source) => {
      const sourceBadge = document.createElement('span');
      sourceBadge.title = `Score: ${(source.score * 100).toFixed(1)}%`;
      sourceBadge.textContent = source.title;
      srcEl.appendChild(sourceBadge);
    });

    inner.appendChild(srcEl);
  }

  wrap.appendChild(avatar);
  wrap.appendChild(inner);
  messagesEl.appendChild(wrap);
  scrollBottom();
  return bubble;
}

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'msg bot typing-indicator';
  wrap.id = 'typing';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = 'AI';

  const inner = document.createElement('div');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    bubble.appendChild(dot);
  }

  inner.appendChild(bubble);
  wrap.appendChild(avatar);
  wrap.appendChild(inner);
  messagesEl.appendChild(wrap);
  scrollBottom();
}

function hideTyping() {
  const el = document.getElementById('typing');
  if (el) el.remove();
}

async function sendMessage(question) {
  if (!question.trim()) return;
  sendBtn.disabled = true;
  inputEl.value = '';

  appendMessage('user', question);
  showTyping();

  try {
    const body = { question, history };
    if (sessionId) body.sessionId = sessionId;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    hideTyping();

    if (!res.ok) {
      const message = data.error?.message || 'Something went wrong. Please try again.';
      appendMessage('bot', message);
      showToast(message);
      return;
    }

    sessionId = data.sessionId;
    history.push({ role: 'user', content: question });
    history.push({ role: 'assistant', content: data.answer });
    while (history.length > 20) history.splice(0, 2);

    appendMessage('bot', data.answer, data.sources || []);
  } catch (err) {
    hideTyping();
    const message = 'Network error. Please check your connection.';
    appendMessage('bot', message);
    showToast(message);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(inputEl.value);
  }
});

document.querySelectorAll('.topic-btn').forEach((btn) => {
  btn.addEventListener('click', () => sendMessage(btn.dataset.q));
});