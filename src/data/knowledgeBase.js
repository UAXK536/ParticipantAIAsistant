'use strict';

/**
 * Loyalty Domain Knowledge Base
 * Covers: Points, Badges, Cases, Recognition, Product Claims, Learn & Earn
 */
const documents = [
  // ─── POINTS SYSTEM ──────────────────────────────────────────────────────────
  {
    id: 'points-overview',
    category: 'points',
    title: 'Points System Overview',
    content: `Our loyalty points system rewards participants for every interaction with the program.
Points are the core currency of the loyalty program. Every eligible activity earns points that can
be redeemed for rewards. Points are tracked in real-time and available instantly after activity completion.
The points balance is visible on the participant dashboard. Points never expire as long as the account
remains active with at least one qualifying activity every 12 months.`,
  },
  {
    id: 'points-earning',
    category: 'points',
    title: 'How to Earn Points',
    content: `Participants can earn points through multiple channels:
- Purchases: Earn 10 points per dollar spent on eligible products.
- Learn and Earn modules: Earn 50-200 points per completed training module.
- Product claims: Earn 25 bonus points per approved product claim submission.
- Recognition received: Earn 15 points every time a peer recognizes you.
- Daily check-in: Earn 5 points per day for logging into the portal.
- Completing a profile: Earn 100 one-time bonus points for completing your profile.
- Referrals: Earn 500 points for each new participant you successfully refer.
- Case resolution participation: Earn 10 points when you help resolve a case.`,
  },
  {
    id: 'points-redemption',
    category: 'points',
    title: 'How to Redeem Points',
    content: `Points can be redeemed in several ways:
- Gift cards: 500 points = $5 gift card (major retailers supported).
- Merchandise: Browse the rewards catalog and redeem points for branded or partner merchandise.
- Charitable donations: Donate points to supported charities at 100 points per $1.
- Event tickets: Redeem points for loyalty event access and VIP experiences.
- Travel vouchers: Accumulate 5,000+ points and redeem for travel discounts.
Redemption is processed within 3-5 business days. Minimum redemption is 100 points.
Points cannot be transferred between accounts. Partial-point redemptions are not allowed;
you must have the full required amount.`,
  },
  {
    id: 'points-balance',
    category: 'points',
    title: 'Checking Points Balance',
    content: `You can check your points balance through:
- Participant portal dashboard (real-time balance).
- Mobile app — the balance appears on the home screen.
- Monthly email statement sent on the 1st of each month.
- Calling the loyalty helpline at 1-800-LOYALTY (automated balance inquiry).
- SMS: Text BALANCE to 54321 to receive your current balance.
Points transactions (earnings and redemptions) are visible in the Activity section of your portal.
You can download a 12-month statement from the Reports section.`,
  },
  {
    id: 'points-expiry',
    category: 'points',
    title: 'Points Expiry Policy',
    content: `Points expiry rules:
- Standard points are valid for 24 months from the date they are earned.
- Bonus points (from promotions) expire after 90 days unless otherwise stated.
- If an account is inactive (no earn or redemption activity) for 12 consecutive months,
  all accumulated points may be forfeited.
- Participants receive an email warning 60 days, 30 days, and 7 days before points expire.
- Expired points cannot be reinstated under normal circumstances; contact support for exceptions.`,
  },

  // ─── PARTICIPANT RUNTIME Q&A ───────────────────────────────────────────────
  {
    id: 'participant-earned-points-total',
    category: 'participant-points',
    title: 'Participant Earned Points Total',
    questions: [
      'How much points I have earned till date?',
      'How many points have I earned till date?',
      'Tell me earned points?',
      'Tell me my earned points?',
      'How many earned points do I have?',
    ],
    answer: 'You have earned 2500 points till date.',
    content: `Question: How much points I have earned till date?
Answer: You have earned 2500 points till date.

Question: Tell me earned points?
Answer: You have earned 2500 points till date.`,
  },
  {
    id: 'participant-pending-points-total',
    category: 'participant-points',
    title: 'Participant Pending Points Total',
    questions: [
      'Tell me pending points?',
      'How many pending points do I have?',
      'What are my pending points?',
      'Show pending points',
    ],
    answer: 'You have 25 points in pending status.',
    content: `Question: Tell me pending points?
Answer: You have 25 points in pending status.`,
  },
  {
    id: 'participant-pending-points-reason',
    category: 'participant-points',
    title: 'Participant Pending Points Reason',
    questions: [
      'Why my points are in pending status?',
      'Why points are pending?',
      'Why are my points pending?',
      'Why are points stuck?',
    ],
    answer: 'I have checked the system. Your points are pending due to a process failure. I can see the points in the ledger, but due to an unknown reason the points are stuck. Please contact your administrator.',
    content: `Question: Why my points are in pending status?
Answer: I have checked the system. Your points are pending due to a process failure. I can see the points in the ledger, but due to an unknown reason the points are stuck. Please contact your administrator.

Question: Why points are pending?
Answer: I have checked the system. Your points are pending due to a process failure. I can see the points in the ledger, but due to an unknown reason the points are stuck. Please contact your administrator.`,
  },

  // ─── PARTICIPANT BADGE Q&A ─────────────────────────────────────────────────
  {
    id: 'participant-current-badge',
    category: 'participant-badges',
    title: 'Participant Current Badge',
    questions: [
      'What is my current badge?',
      'Which badge do I have?',
      'Tell me my badge status?',
      'Show my current badge',
    ],
    answer: 'Your current badge is Silver Badge.',
    content: `Question: What is my current badge?
Answer: Your current badge is Silver Badge.`,
  },
  {
    id: 'participant-earned-badges',
    category: 'participant-badges',
    title: 'Participant Earned Badges',
    questions: [
      'How many badges I have earned?',
      'How many badges have I earned?',
      'Tell me earned badges?',
      'Which badges have I earned?',
    ],
    answer: 'You have earned 4 badges: Silver Badge, First Purchase Badge, Learning Champion Badge, and Recognition Star Badge.',
    content: `Question: How many badges I have earned?
Answer: You have earned 4 badges: Silver Badge, First Purchase Badge, Learning Champion Badge, and Recognition Star Badge.`,
  },
  {
    id: 'participant-next-badge',
    category: 'participant-badges',
    title: 'Participant Next Badge Progress',
    questions: [
      'What is my next badge?',
      'How many points needed for next badge?',
      'How much more points for Gold badge?',
      'Tell me next badge progress?',
    ],
    answer: 'Your next badge is Gold Badge. You need 7500 more lifetime points to reach Gold Badge.',
    content: `Question: What is my next badge?
Answer: Your next badge is Gold Badge. You need 7500 more lifetime points to reach Gold Badge.`,
  },

  // ─── BADGES ─────────────────────────────────────────────────────────────────
  {
    id: 'badges-overview',
    category: 'badges',
    title: 'Badges Overview',
    content: `Badges are digital achievements that recognize participant milestones and contributions
to the loyalty program. Badges appear on the participant profile and can be shared on social media.
There are four badge tiers: Bronze, Silver, Gold, and Platinum. Each tier comes with increasing
privileges and bonus point multipliers. Badges are awarded automatically when the criteria are met
and are permanent — they are never removed from your profile.`,
  },
  {
    id: 'badges-tiers',
    category: 'badges',
    title: 'Badge Tiers and Benefits',
    content: `Badge tiers and their benefits:
- Bronze Badge: Awarded at 500 lifetime points. Benefits: 1.1x point multiplier, early access to new products.
- Silver Badge: Awarded at 2,500 lifetime points. Benefits: 1.25x point multiplier, priority support queue, monthly bonus of 50 points.
- Gold Badge: Awarded at 10,000 lifetime points. Benefits: 1.5x point multiplier, dedicated account manager, quarterly VIP event invitations, 200 monthly bonus points.
- Platinum Badge: Awarded at 50,000 lifetime points. Benefits: 2x point multiplier, personal concierge, exclusive Platinum catalog, 500 monthly bonus points, invitation to annual gala.
Multipliers are applied automatically at the time of earning activities.`,
  },
  {
    id: 'badges-types',
    category: 'badges',
    title: 'Special Achievement Badges',
    content: `Special badges recognize specific achievements beyond points milestones:
- First Purchase Badge: Awarded on first eligible purchase.
- Learning Champion Badge: Awarded when completing 10 Learn & Earn modules.
- Recognition Star Badge: Awarded when receiving 25 peer recognitions.
- Community Leader Badge: Awarded for submitting 50 approved product claims.
- Streak Badge: Awarded for logging in 30 consecutive days.
- Ambassador Badge: Awarded after successfully referring 10 participants.
- Top Earner Badge: Awarded to the top 1% of monthly point earners.
Special badges provide cosmetic perks and can unlock limited-time promotions.`,
  },
  {
    id: 'badges-how-to-earn',
    category: 'badges',
    title: 'How to Earn Badges',
    content: `To earn tier badges, accumulate the required lifetime points.
Special badges are earned automatically when the specific criteria are met.
Progress toward each badge is visible in the Achievements section of your dashboard.
You will receive an in-app notification and email when a badge is awarded.
Badges cannot be purchased or transferred.`,
  },

  // ─── CASES ──────────────────────────────────────────────────────────────────
  {
    id: 'cases-overview',
    category: 'cases',
    title: 'Support Cases Overview',
    content: `The cases system allows participants to raise, track, and resolve support requests.
A case is created whenever a participant has an issue that requires investigation or action
from the loyalty program team. Cases are assigned a unique case number for reference.
All communication regarding the case happens within the portal's case thread, and
participants are notified by email at each status change.`,
  },
  {
    id: 'cases-create',
    category: 'cases',
    title: 'How to Create a Support Case',
    content: `To create a support case:
1. Log in to the participant portal and go to the Support section.
2. Click 'New Case' and select the category: Points Dispute, Badge Issue, Product Claim Problem, Technical Issue, or General Enquiry.
3. Provide a detailed description of the problem and any relevant reference numbers.
4. Attach supporting documents (screenshots, receipts) up to 10MB per file.
5. Submit the case. You will receive a case number and confirmation email within 5 minutes.
Cases can also be created by calling the helpline or emailing support@loyalty.com with "New Case" in the subject line.`,
  },
  {
    id: 'cases-tracking',
    category: 'cases',
    title: 'Tracking Case Status',
    content: `Case statuses in the portal:
- Open: Case has been received and is awaiting assignment.
- In Progress: A support agent is actively investigating the issue.
- Pending Participant: Additional information or documents are required from you.
- Escalated: Case has been escalated to the specialist or management team.
- Resolved: The issue has been addressed and a resolution provided.
- Closed: The case is fully concluded and archived.
Target response times: First response within 24 hours, standard cases resolved within 5 business days,
complex cases within 10 business days. You can reply to any case from the portal to add information.`,
  },
  {
    id: 'cases-escalation',
    category: 'cases',
    title: 'Case Escalation Process',
    content: `If you are not satisfied with the resolution or if the case has been open for more than
10 business days without update, you can escalate:
1. Open the case in the portal and click 'Escalate'.
2. Select the escalation reason from the dropdown.
3. Add a comment describing why you are escalating.
Escalated cases are reviewed by a senior agent within 24 hours.
Cases can also be escalated by calling the helpline and quoting your case number and requesting escalation.
Escalation does not create a new case — it upgrades the priority of the existing case.`,
  },

  // ─── RECOGNITION ────────────────────────────────────────────────────────────
  {
    id: 'recognition-overview',
    category: 'recognition',
    title: 'Peer Recognition Overview',
    content: `The Recognition feature allows participants to acknowledge and celebrate each other's
contributions, milestones, and behaviours within the loyalty program. Recognition builds a positive
community culture and provides both the sender and recipient with loyalty points.
Recognition is visible on the recipient's public profile (unless the recipient opts for private mode).`,
  },
  {
    id: 'recognition-send',
    category: 'recognition',
    title: 'How to Send Recognition',
    content: `To send recognition to a fellow participant:
1. Go to the Recognition section of the portal or the recipient's profile.
2. Click 'Recognise' and choose a recognition type: Great Work, Going Above & Beyond,
   Team Player, Innovation, Customer Focus, or Leadership.
3. Write a personalised message (20-500 characters).
4. Optionally attach a virtual badge or reward (costs additional points from your account).
5. Submit the recognition.
Senders earn 5 points per recognition sent (up to 10 recognitions per day).
Recipients earn 15 points per recognition received.
Recognition can be given to any active participant. You cannot recognise yourself.`,
  },
  {
    id: 'recognition-receive',
    category: 'recognition',
    title: 'Managing Received Recognition',
    content: `When you receive recognition:
- You are notified via email and in-app notification.
- 15 points are automatically added to your balance.
- The recognition appears on your profile under 'Recognitions Received'.
- You can reply to the recognition with a thank-you message.
- You can set your recognition feed to private if you prefer not to display recognitions publicly.
- Receiving 25 recognitions unlocks the Recognition Star badge.
- All recognitions are monitored for appropriateness; inappropriate content is removed.`,
  },
  {
    id: 'recognition-leaderboard',
    category: 'recognition',
    title: 'Recognition Leaderboard',
    content: `The Recognition Leaderboard displays the most recognised participants over a rolling 30-day period.
Top 3 participants on the leaderboard each month receive bonus points:
- 1st place: 500 bonus points.
- 2nd place: 300 bonus points.
- 3rd place: 150 bonus points.
The leaderboard resets on the 1st of each month. Historical leaderboard results are visible in the
Hall of Fame section. The leaderboard can be filtered by team, region, or company-wide view.`,
  },

  // ─── PARTICIPANT RECOGNITION Q&A ───────────────────────────────────────────
  {
    id: 'participant-recognition-received-total',
    category: 'participant-recognition',
    title: 'Participant Recognition Received Total',
    questions: [
      'How many recognition I have received?',
      'How many recogniton I have received?',
      'How many recognitions have I received?',
      'Tell me received recognition?',
    ],
    answer: 'You have received 12 recognitions.',
    content: `Question: How many recognition I have received?
Answer: You have received 12 recognitions.`,
  },
  {
    id: 'participant-top-recognizer',
    category: 'participant-recognition',
    title: 'Participant Top Recognition Sender',
    questions: [
      'Who have given me recognition most?',
      'Who has given me recognition most?',
      'Who recognized me the most?',
      'Who gave me most recognition?',
    ],
    answer: 'Mark Steel has given you the most recognition.',
    content: `Question: Who have given me recognition most?
Answer: Mark Steel has given you the most recognition.`,
  },
  {
    id: 'participant-recognition-earned-points',
    category: 'participant-recognition',
    title: 'Participant Recognition Earned Points',
    questions: [
      'How many points I have earned through recognition?',
      'How many points have I earned through recognition?',
      'Tell me recognition points?',
      'How much recognition points have I earned?',
    ],
    answer: 'You have earned 450 points through recognition.',
    content: `Question: How many points I have earned through recognition?
Answer: You have earned 450 points through recognition.`,
  },

  // ─── PRODUCT CLAIMS ─────────────────────────────────────────────────────────
  {
    id: 'claims-overview',
    category: 'product-claims',
    title: 'Product Claims Overview',
    content: `The Product Claims feature enables participants to earn points by submitting proof of
purchase or usage for eligible products and services. Claims verify that participants are actively
using and promoting the program's partner products. Approved claims result in point rewards and
may contribute toward special badge milestones.`,
  },
  {
    id: 'claims-eligible',
    category: 'product-claims',
    title: 'Eligible Products for Claims',
    content: `Eligible products for claims include:
- Category A (Partner Products): Products from registered program partners earn 100-500 points per claim.
- Category B (Loyalty Branded Products): Official program merchandise earns 50-200 points per claim.
- Category C (Service Engagements): Using partner services (e.g., booking travel through the loyalty portal) earns 25-100 points.
Full list of eligible products and current point values is available in the Claim Catalog section.
Products are periodically added or removed. Claims for ineligible products will be declined.
A maximum of one claim per product per 30-day period applies.`,
  },
  {
    id: 'claims-submit',
    category: 'product-claims',
    title: 'How to Submit a Product Claim',
    content: `To submit a product claim:
1. Navigate to Product Claims in the portal.
2. Search for the product using the product name, barcode, or SKU.
3. Select the product and enter the purchase date and quantity.
4. Upload proof of purchase (receipt, invoice, or photo of product) — accepted formats: JPG, PNG, PDF up to 5MB.
5. Review claim details and submit.
Claims are reviewed within 2-3 business days. You will receive email notification of approval or rejection.
Approved claims immediately credit points to your account. Rejected claims include a reason code;
you may re-submit with corrected documentation within 14 days.`,
  },
  {
    id: 'claims-status',
    category: 'product-claims',
    title: 'Claim Status and Tracking',
    content: `Claim statuses:
- Submitted: Claim received and queued for review.
- Under Review: A claims analyst is verifying the documentation.
- Additional Info Required: You must supply more documentation or information.
- Approved: Claim verified; points have been credited.
- Rejected: Claim could not be verified; a reason code is provided.
You can view all claim history in the My Claims section. Claims can be filtered by date, status, or product.
If your claim is rejected and you believe the decision is incorrect, raise a Case from the Claims detail view.
A claim can be appealed once. Re-submitted claims that are rejected are final.`,
  },

  // ─── PARTICIPANT PRODUCT CLAIM Q&A ─────────────────────────────────────────
  {
    id: 'participant-product-claims-summary',
    category: 'participant-product-claims',
    title: 'Participant Product Claims Summary',
    questions: [
      'How many product claims I have submitted?',
      'How many product claims have I submitted?',
      'Tell me product claims summary?',
      'Show my product claims',
    ],
    answer: 'You have submitted 8 product claims. 6 are approved, 2 are pending, and 0 are rejected.',
    content: `Question: How many product claims I have submitted?
Answer: You have submitted 8 product claims. 6 are approved, 2 are pending, and 0 are rejected.`,
  },
  {
    id: 'participant-pending-product-claims',
    category: 'participant-product-claims',
    title: 'Participant Pending Product Claims',
    questions: [
      'How many product claims are pending?',
      'Tell me pending product claims?',
      'Why my product claim is pending?',
      'Why are my product claims pending?',
    ],
    answer: 'You have 2 product claims pending. They are currently under review because the uploaded proof of purchase needs additional validation.',
    content: `Question: How many product claims are pending?
Answer: You have 2 product claims pending. They are currently under review because the uploaded proof of purchase needs additional validation.`,
  },
  {
    id: 'participant-product-claim-points',
    category: 'participant-product-claims',
    title: 'Participant Product Claim Points',
    questions: [
      'How many points I have earned through product claims?',
      'How many points have I earned through product claims?',
      'Tell me product claim points?',
      'How much product claim points have I earned?',
    ],
    answer: 'You have earned 300 points through approved product claims.',
    content: `Question: How many points I have earned through product claims?
Answer: You have earned 300 points through approved product claims.`,
  },

  // ─── LEARN AND EARN ─────────────────────────────────────────────────────────
  {
    id: 'learn-overview',
    category: 'learn-and-earn',
    title: 'Learn and Earn Overview',
    content: `Learn and Earn is the educational component of the loyalty program. Participants
complete training modules, quizzes, videos, and courses about the program, partner products,
and industry knowledge. Completing each learning activity earns loyalty points. Learn and Earn
activities also count towards badge progress. There are no deadlines on most modules — complete
them at your own pace.`,
  },
  {
    id: 'learn-catalog',
    category: 'learn-and-earn',
    title: 'Learning Catalog',
    content: `The learning catalog includes the following types of content:
- Quick Bites (5-10 min): Short videos or infographics. Earn 25 points each.
- Modules (20-30 min): Interactive courses with quizzes at the end. Earn 75 points each.
- Deep Dives (60+ min): In-depth courses with certification upon completion. Earn 200 points each.
- Live Webinars: Attend scheduled live sessions. Earn 100 points per attended session.
- Assessments: Stand-alone knowledge tests. Earn up to 150 points based on score.
Categories include: Loyalty Program Fundamentals, Partner Product Knowledge, Customer Engagement,
Industry Trends, Leadership Development, and Compliance Training.`,
  },
  {
    id: 'learn-completion',
    category: 'learn-and-earn',
    title: 'Completing Learning Activities',
    content: `How to complete learning activities and earn points:
1. Browse the Learn & Earn section and choose a module.
2. Complete the module content (video, reading, or interactive steps).
3. Pass the assessment at the end with a score of 70% or higher to earn full points.
   Scores between 50-69% earn half points. Below 50% earns no points.
4. Points are credited immediately upon completion.
5. You may retake a failed assessment after a 24-hour waiting period.
Completed modules show a checkmark and cannot earn points again unless marked as refreshable
(refreshable modules reset every 12 months for re-earning).`,
  },
  {
    id: 'learn-certifications',
    category: 'learn-and-earn',
    title: 'Certifications and Advanced Learning',
    content: `Participants can earn certifications by completing a defined set of related Deep Dive modules.
Available certifications:
- Loyalty Program Expert: Complete 5 Deep Dive modules in Loyalty Fundamentals. Earns 1,000 bonus points and a digital certificate badge.
- Partner Product Specialist: Complete 3 Deep Dives per product category. Earns 500 bonus points per category.
- Compliance Champion: Complete all Compliance Training modules. Earns 750 bonus points and required for certain program tiers.
Certificates are downloadable as PDFs and shareable on LinkedIn. Certifications are valid for 2 years,
after which the refreshable modules must be re-completed to renew certification.`,
  },
  {
    id: 'learn-tracking',
    category: 'learn-and-earn',
    title: 'Tracking Learning Progress',
    content: `Your learning progress is tracked in the My Learning dashboard:
- Progress bar for each active course or certification path.
- Completed, In Progress, and Not Started filters.
- Total points earned from learning activities (visible in the Points Activity feed).
- Completion certificates downloadable from the Achievements section.
- Learning streak: consecutive days with a completed activity; maintain a 7-day streak for 50 bonus points.
Managers and team leads can view their team's aggregate learning progress in the Team Dashboard (if enabled).`,
  },
];

module.exports = documents;
