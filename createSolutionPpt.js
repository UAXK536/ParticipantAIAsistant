'use strict';

const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Participant AI Assistant';
pptx.subject = 'AI Assistant Solution Overview';
pptx.title = 'Participant AI Assistant Solution';
pptx.company = 'Participant AI Assistant';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-US',
};
pptx.defineLayout({ name: 'LAYOUT_WIDE', width: 13.333, height: 7.5 });

const colors = {
  navy: '172033',
  blue: '2563EB',
  purple: '7C3AED',
  teal: '0F766E',
  green: '16A34A',
  amber: 'D97706',
  red: 'DC2626',
  slate: '475569',
  light: 'F8FAFC',
  border: 'CBD5E1',
  white: 'FFFFFF',
};

function addBase(slide, title, kicker) {
  slide.background = { color: colors.light };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.18,
    fill: { color: colors.blue },
    line: { color: colors.blue },
  });
  slide.addText(kicker || 'Participant AI Assistant', {
    x: 0.55,
    y: 0.35,
    w: 5.4,
    h: 0.28,
    fontFace: 'Aptos',
    fontSize: 9,
    bold: true,
    color: colors.purple,
    margin: 0,
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.72,
    w: 11.9,
    h: 0.55,
    fontFace: 'Aptos Display',
    fontSize: 28,
    bold: true,
    color: colors.navy,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 1.42,
    w: 12.2,
    h: 0,
    line: { color: colors.border, width: 1 },
  });
}

function addFooter(slide, page) {
  slide.addText('Node.js + Express + RAG + Local Knowledge Fallback', {
    x: 0.55,
    y: 7.05,
    w: 7.3,
    h: 0.22,
    fontSize: 8,
    color: colors.slate,
    margin: 0,
  });
  slide.addText(String(page), {
    x: 12.45,
    y: 7.03,
    w: 0.35,
    h: 0.24,
    fontSize: 9,
    bold: true,
    color: colors.slate,
    align: 'right',
    margin: 0,
  });
}

function addBulletList(slide, items, x, y, w, h, options = {}) {
  slide.addText(items.map((item) => ({
    text: item,
    options: { bullet: { indent: 16 }, hanging: 4, breakLine: true },
  })), {
    x,
    y,
    w,
    h,
    fontFace: 'Aptos',
    fontSize: options.fontSize || 15,
    color: options.color || colors.navy,
    breakLine: false,
    fit: 'shrink',
    paraSpaceAfterPt: options.paraSpaceAfterPt || 10,
    valign: 'mid',
  });
}

function addCard(slide, title, body, x, y, w, h, accent) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: colors.white },
    line: { color: colors.border, width: 1 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.08,
    h,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(title, {
    x: x + 0.24,
    y: y + 0.18,
    w: w - 0.42,
    h: 0.28,
    fontSize: 14,
    bold: true,
    color: colors.navy,
    margin: 0,
  });
  slide.addText(body, {
    x: x + 0.24,
    y: y + 0.58,
    w: w - 0.42,
    h: h - 0.76,
    fontSize: 11.5,
    color: colors.slate,
    fit: 'shrink',
    breakLine: false,
    margin: 0,
  });
}

function addStep(slide, number, title, body, x, y, w, accent) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 1.18,
    rectRadius: 0.08,
    fill: { color: colors.white },
    line: { color: colors.border, width: 1 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x + 0.18,
    y: y + 0.25,
    w: 0.52,
    h: 0.52,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(number, {
    x: x + 0.18,
    y: y + 0.34,
    w: 0.52,
    h: 0.18,
    fontSize: 11,
    bold: true,
    color: colors.white,
    align: 'center',
    margin: 0,
  });
  slide.addText(title, {
    x: x + 0.85,
    y: y + 0.18,
    w: w - 1.05,
    h: 0.25,
    fontSize: 13,
    bold: true,
    color: colors.navy,
    margin: 0,
  });
  slide.addText(body, {
    x: x + 0.85,
    y: y + 0.5,
    w: w - 1.05,
    h: 0.48,
    fontSize: 10.4,
    color: colors.slate,
    fit: 'shrink',
    margin: 0,
  });
}

function slide1() {
  const slide = pptx.addSlide();
  slide.background = { color: colors.navy };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: colors.navy },
    line: { color: colors.navy },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.26,
    fill: { color: colors.blue },
    line: { color: colors.blue },
  });
  slide.addText('Participant AI Assistant', {
    x: 0.8,
    y: 1.45,
    w: 11.4,
    h: 0.8,
    fontFace: 'Aptos Display',
    fontSize: 40,
    bold: true,
    color: colors.white,
    margin: 0,
  });
  slide.addText('AI-powered self-service for loyalty program participants', {
    x: 0.82,
    y: 2.42,
    w: 8.4,
    h: 0.42,
    fontSize: 18,
    color: 'DDE7FF',
    margin: 0,
  });
  slide.addText('Built with Node.js, Express, RAG, OpenAI integration, and a local knowledge-base fallback for resilient demos.', {
    x: 0.82,
    y: 3.18,
    w: 7.4,
    h: 0.95,
    fontSize: 16,
    color: colors.white,
    fit: 'shrink',
    margin: 0,
  });
  addCard(slide, 'POC Scope', 'Points, badges, cases, recognition, product claims, and Learn & Earn questions answered through a browser chat UI.', 8.65, 1.55, 3.75, 1.45, colors.blue);
  addCard(slide, 'Current Demo Mode', 'Local Q&A and knowledge-base answers continue to work even when the OpenAI API key has quota or billing issues.', 8.65, 3.2, 3.75, 1.45, colors.green);
  slide.addText('Solution Overview Deck', {
    x: 0.82,
    y: 6.55,
    w: 3.6,
    h: 0.24,
    fontSize: 10,
    bold: true,
    color: 'C7D2FE',
    margin: 0,
  });
  slide.addText('1', {
    x: 12.45,
    y: 7.03,
    w: 0.35,
    h: 0.24,
    fontSize: 9,
    bold: true,
    color: 'C7D2FE',
    align: 'right',
    margin: 0,
  });
}

function slide2() {
  const slide = pptx.addSlide();
  addBase(slide, 'Need: Problem Statement', 'Why this matters');
  addBulletList(slide, [
    'Participants repeatedly ask support teams for simple loyalty information: earned points, pending points, badge status, recognitions, claims, and redemption rules.',
    'Manual support creates slower response times, higher operational cost, and inconsistent answers across channels.',
    'Loyalty data is spread across program rules, ledgers, claims, recognition activity, and learning progress.',
    'Traditional FAQ pages are static and hard to search, especially when users ask in natural language.',
    'OpenAI API availability can be affected by key, quota, or billing issues, so the demo needs a reliable fallback path.',
  ], 0.8, 1.85, 7.4, 4.45, { fontSize: 15 });
  addCard(slide, 'Example User Need', '"How much points I have earned till date?"\n"Why are my points pending?"\n"Who has given me recognition most?"', 8.55, 1.85, 3.75, 1.9, colors.purple);
  addCard(slide, 'Impact', 'Without automation, these simple questions still become tickets, calls, or manual lookups.', 8.55, 4.05, 3.75, 1.35, colors.red);
  addFooter(slide, 2);
}

function slide3() {
  const slide = pptx.addSlide();
  addBase(slide, 'Benefits', 'Business and participant value');
  addCard(slide, 'Instant Answers', 'Participants get immediate responses for points, badges, recognition, product claims, cases, and Learn & Earn questions.', 0.75, 1.85, 3.65, 1.45, colors.blue);
  addCard(slide, 'Reduced Support Load', 'Routine questions are handled by self-service, reducing tickets and freeing administrators for higher-value issues.', 4.85, 1.85, 3.65, 1.45, colors.green);
  addCard(slide, 'Consistent Guidance', 'Answers are grounded in a controlled knowledge base instead of ad hoc support responses.', 8.95, 1.85, 3.65, 1.45, colors.purple);
  addCard(slide, 'Interactive Experience', 'Quick-topic buttons and natural language chat make the assistant easier than searching static FAQs.', 0.75, 3.75, 3.65, 1.45, colors.teal);
  addCard(slide, 'Demo Resilience', 'Local Q&A fallback keeps the solution usable when OpenAI quota, billing, or keys are unavailable.', 4.85, 3.75, 3.65, 1.45, colors.amber);
  addCard(slide, 'Extensible Design', 'New participant questions can be added directly into the knowledge base and surfaced in the UI.', 8.95, 3.75, 3.65, 1.45, colors.blue);
  addFooter(slide, 3);
}

function slide4() {
  const slide = pptx.addSlide();
  addBase(slide, 'Approach', 'How the solution works');
  addStep(slide, '1', 'Participant asks a question', 'User enters a question in the browser chat or selects a quick topic.', 0.75, 1.85, 3.55, colors.blue);
  addStep(slide, '2', 'Direct Q&A match', 'High-confidence personal Q&A entries answer instantly from the local knowledge base.', 4.9, 1.85, 3.55, colors.green);
  addStep(slide, '3', 'RAG retrieval', 'When OpenAI is available, embeddings retrieve relevant knowledge-base documents through vector search.', 9.05, 1.85, 3.55, colors.purple);
  addStep(slide, '4', 'LLM response', 'The LLM generates a grounded answer using retrieved context and returns source documents.', 0.75, 3.6, 3.55, colors.teal);
  addStep(slide, '5', 'Fallback response', 'If OpenAI is missing, unauthorized, or quota-limited, the app returns local knowledge-base answers.', 4.9, 3.6, 3.55, colors.amber);
  addStep(slide, '6', 'Browser UI', 'The frontend displays answer, sources, and friendly error messages without CSP violations.', 9.05, 3.6, 3.55, colors.blue);
  slide.addText('Core components: Express API, knowledgeBase.js, ragService.js, vectorStore.js, app.js frontend, Helmet security middleware.', {
    x: 0.85,
    y: 5.65,
    w: 11.7,
    h: 0.42,
    fontSize: 13,
    color: colors.slate,
    align: 'center',
    margin: 0,
  });
  addFooter(slide, 4);
}

function slide5() {
  const slide = pptx.addSlide();
  addBase(slide, 'Differentiation', 'What makes this solution stand out');
  addCard(slide, 'Personalized Runtime Q&A', 'Supports user-specific demo questions such as earned points, pending points, recognition count, top recognizer, badge progress, and product-claim status.', 0.75, 1.75, 5.75, 1.45, colors.blue);
  addCard(slide, 'RAG + Deterministic Fallback', 'Combines AI search and generation with direct knowledge-base answers, so demos remain reliable when API quota is unavailable.', 6.85, 1.75, 5.75, 1.45, colors.green);
  addCard(slide, 'Source Transparency', 'Responses include source titles and scores, helping users understand where an answer came from.', 0.75, 3.55, 3.65, 1.35, colors.purple);
  addCard(slide, 'Security-Aware Frontend', 'Helmet CSP is respected by serving JavaScript from /app.js rather than blocked inline scripts.', 4.85, 3.55, 3.65, 1.35, colors.teal);
  addCard(slide, 'Easy Extension', 'New categories and Q&A entries can be added in one controlled knowledge-base file.', 8.95, 3.55, 3.65, 1.35, colors.amber);
  slide.addText('Key message: This is not just an FAQ page. It is a chat-driven loyalty assistant with controlled knowledge, API integration, fallback behavior, and a working browser demo.', {
    x: 1.05,
    y: 5.65,
    w: 11.2,
    h: 0.48,
    fontSize: 13.5,
    bold: true,
    color: colors.navy,
    align: 'center',
    margin: 0,
  });
  addFooter(slide, 5);
}

function slide6() {
  const slide = pptx.addSlide();
  addBase(slide, 'Demo', 'Recommended walkthrough');
  addBulletList(slide, [
    'Open http://localhost:3000 and show the browser-based Participant AI Assistant.',
    'Click "Earned points" to show the direct answer: "You have earned 2500 points till date."',
    'Click "Pending reason" to show process-failure explanation and administrator guidance.',
    'Click "Top recognizer" to show: "Mark Steel has given you the most recognition."',
    'Click "My badge" or "Next badge" to show badge status and next milestone.',
    'Click "My claims" or "Claim points" to show product-claim summary and earned points.',
    'Mention that OpenAI can be enabled with a valid API key, while the current local fallback keeps the demo working.',
  ], 0.85, 1.75, 7.15, 4.85, { fontSize: 14.5, paraSpaceAfterPt: 8 });
  addCard(slide, 'Demo Commands', 'Install: npm install\nRun: npm start\nDev mode: npm run dev\nTest: npm test', 8.5, 1.85, 3.8, 1.85, colors.blue);
  addCard(slide, 'Success Criteria', 'Answer appears in chat\nSources are shown\nNo CSP console error\nWorks even when OpenAI quota is unavailable', 8.5, 4.05, 3.8, 1.75, colors.green);
  addFooter(slide, 6);
}

slide1();
slide2();
slide3();
slide4();
slide5();
slide6();

pptx.writeFile({ fileName: 'Participant_AI_Assistant_Solution.pptx' });