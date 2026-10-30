const express = require('express');
const router = express.Router();

// Rule-based knowledge response engine for clinical blood donation questions
const getKnowledgeResponse = (userPrompt = '') => {
  const query = userPrompt.toLowerCase().trim();

  if (query.includes('eligib') || query.includes('can i donate') || query.includes('criteria') || query.includes('check eligibility')) {
    return (
      "🩸 **Donor Eligibility Guidelines:**\n" +
      "• **Age:** 18 to 65 years old.\n" +
      "• **Weight:** At least 45–50 kg (depending on local regulations).\n" +
      "• **Hemoglobin:** Minimum 12.5 g/dL.\n" +
      "• **Donation Interval:** Minimum 90 days (3 months) for men and 120 days (4 months) for women for whole blood.\n" +
      "• **Pulse & BP:** Normal blood pressure (100–140 systolic / 60–90 diastolic).\n" +
      "⚠️ *Note: Final eligibility is subject to on-site medical checkup and confidential hemoglobin screening.*"
    );
  }

  if (query.includes('compatib') || query.includes('type') || query.includes('group') || query.includes('who can receive')) {
    return (
      "🧬 **Blood Compatibility Summary:**\n" +
      "• **O-Negative (O-):** Universal Red Cell Donor (can donate to all blood types).\n" +
      "• **AB-Positive (AB+):** Universal Red Cell Recipient (can receive all blood types).\n" +
      "• **A+:** Can receive from A+, A-, O+, O- and donate to A+, AB+.\n" +
      "• **B+:** Can receive from B+, B-, O+, O- and donate to B+, AB+.\n" +
      "⚠️ *Clinical safety reminder: Laboratory cross-matching is mandatory before every medical transfusion.*"
    );
  }

  if (query.includes('tip') || query.includes('health') || query.includes('before') || query.includes('after') || query.includes('prepar')) {
    return (
      "🥗 **Health Tips for Donors:**\n" +
      "• **Before Donation:** Drink 500ml extra water, eat a healthy non-fatty meal 2 hours prior, avoid alcohol for 24 hours.\n" +
      "• **During Donation:** Relax; the whole collection takes just 8–10 minutes.\n" +
      "• **After Donation:** Rest for 10 minutes, drink refreshments, avoid heavy lifting for 24 hours, and stay well-hydrated."
    );
  }

  if (query.includes('benefit') || query.includes('why') || query.includes('motivation') || query.includes('save')) {
    return (
      "❤️ **Why Donate Blood?**\n" +
      "• **Save Lives:** One single blood donation can be separated into red cells, plasma, and platelets to save up to 3 patients.\n" +
      "• **Health Checkup:** You receive a free mini-health screening (BP, hemoglobin, pulse).\n" +
      "• **Cardiovascular Wellness:** Regular donation helps maintain healthy iron stores in the body."
    );
  }

  if (query.includes('camp') || query.includes('near') || query.includes('location') || query.includes('find nearest')) {
    return (
      "📍 **Finding Blood Camps & Donors:**\n" +
      "You can visit the **Blood Camp** page in the top menu to view scheduled donation drives and reserve your slot. " +
      "You can also use the **Search Donors** or **Maps** pages to view verified nearby donors by blood group and pincode!"
    );
  }

  return (
    "Hello! I am your Blood Donation Assistant 💉.\n" +
    "I can help you with:\n" +
    "• Checking donation eligibility and medical criteria\n" +
    "• Blood group compatibility rules\n" +
    "• Health tips before and after donating\n" +
    "• Finding upcoming blood camps\n\n" +
    "How can I assist you today?"
  );
};

// Chatbot query endpoint
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: 'Please provide a valid question or message.' });
  }

  // Check if OPENAI_API_KEY is available in backend environment
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a warm, helpful medical-assistant bot for a Blood Donation Management System. Emphasize donor eligibility, safety, and reiterate that software advice is not a clinical clearance.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 300
      });
      return res.json({ reply: completion.choices[0].message.content });
    } catch (err) {
      console.warn('OpenAI backend call failed, using clinical rule engine:', err.message);
    }
  }

  // High-reliability clinical rule-based responder
  const reply = getKnowledgeResponse(message);
  res.json({ reply });
});

module.exports = router;

