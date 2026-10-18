import { db } from '../config/db.js';

export const analyzeSymptoms = (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide symptom description.' });
    }

    const inputLower = symptoms.toLowerCase();
    const triageRules = db.get('triageRules');

    // 1. High emergency detection
    const emergencyTriggers = ['severe chest pain', 'cannot breathe', 'unconscious', 'paralysis', 'slurred speech', 'heavy bleeding', 'stroke'];
    const isLifeThreatening = emergencyTriggers.some(t => inputLower.includes(t));

    if (isLifeThreatening) {
      return res.json({
        success: true,
        urgency: 'critical',
        isEmergency: true,
        recommendation: 'Immediate Emergency Care / Trauma Triage',
        primaryDept: 'Emergency & Trauma Wing',
        guidance: '⚠️ RED TRIAGE ALERT: The symptoms you described may indicate a critical, life-threatening emergency. Do not wait for an OPD slot. Call emergency services immediately (911 / 112) or proceed to the nearest emergency room.',
        suggestedDoctor: 'Emergency Duty Officer'
      });
    }

    // 2. Rule-based matching
    let bestMatch = null;
    let maxMatchScore = 0;

    for (const rule of triageRules) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (inputLower.includes(kw.toLowerCase())) {
          score += 2;
        }
      }
      if (score > maxMatchScore) {
        maxMatchScore = score;
        bestMatch = rule;
      }
    }

    if (bestMatch && maxMatchScore > 0) {
      return res.json({
        success: true,
        urgency: bestMatch.urgency,
        isEmergency: bestMatch.urgency === 'urgent',
        recommendation: bestMatch.recommendation,
        primaryDept: bestMatch.primaryDept,
        suggestedDoctor: bestMatch.suggestedDoctor,
        guidance: bestMatch.guidance
      });
    }

    // Fallback general guidance
    res.json({
      success: true,
      urgency: 'routine',
      isEmergency: false,
      recommendation: 'General Medicine / Comprehensive OPD Consultation',
      primaryDept: 'General Medicine',
      suggestedDoctor: 'Dr. Sophia Patel, MBBS, MD',
      guidance: 'Based on your input, our clinical system recommends a primary consultation in General Medicine. The physician can run standard diagnostic panels and refer you to specialized clinics if warranted.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to analyze symptoms.' });
  }
};

export const chatAssistant = (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required.' });
    }

    const qLower = query.toLowerCase();

    // 1. Emergency detection
    const emergencyTriggers = ['chest tightness', 'chest pain', 'tightness', 'shortness of breath', 'cannot breathe', 'unconscious', 'severe bleeding', 'stroke'];
    if (emergencyTriggers.some(t => qLower.includes(t))) {
      return res.json({
        success: true,
        answer: "⚠️ URGENT CLINICAL ALERT: Symptoms such as chest tightness or breathing distress require prompt clinical evaluation. Please visit MediFlow's 24/7 Emergency & Trauma Wing immediately or consult Dr. Sarah Jenkins in Cardiology OPD. If pain is severe or radiating, call emergency services (112 / 911).",
        matchedTopic: 'emergency'
      });
    }

    // 2. FAQ matching
    const faqs = db.get('faqs') || [];
    for (const faq of faqs) {
      if (faq.keywords.some(kw => qLower.includes(kw))) {
        return res.json({
          success: true,
          answer: faq.answer,
          matchedTopic: faq.keywords[0]
        });
      }
    }

    // 3. Symptom Triage matching
    const triageRules = db.get('triageRules') || [];
    for (const rule of triageRules) {
      if (rule.keywords.some(kw => qLower.includes(kw.toLowerCase()))) {
        return res.json({
          success: true,
          answer: `🩺 Clinical Suggestion: The symptoms you described relate to ${rule.primaryDept}. We recommend booking an appointment with ${rule.suggestedDoctor} (${rule.primaryDept}). ${rule.guidance}`,
          matchedTopic: rule.primaryDept
        });
      }
    }

    // 4. Default assistant response
    res.json({
      success: true,
      answer: "I am MediFlow's Clinical AI assistant. You can ask me about OPD consultation timings, booking procedures, real-time queue tracking, doctors across our 6 specialties, or symptom triage checks. For acute distress, please reach our 24/7 emergency wing.",
      matchedTopic: 'general'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to process AI chat query.' });
  }
};
