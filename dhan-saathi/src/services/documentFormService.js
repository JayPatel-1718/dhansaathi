// Document Form Analysis Service
// Uses Google Gemini Vision API to analyze form images and provide guidance

export async function analyzeFormImage(imageBase64) {
  try {
    // This would call your backend or a vision API
    // For now, return mock guidance based on common form fields
    
    // In production, you'd do:
    // const response = await fetch('YOUR_BACKEND_API/analyze-form', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: imageBase64 })
    // });
    
    // For demo, we'll return AI-like structured guidance
    return generateFormGuidance([
      'District',
      'Mother Name',
      'Aadhaar Number',
      'Bank Account Details'
    ]);
  } catch (error) {
    console.error('Form analysis error:', error);
    throw error;
  }
}

function generateFormGuidance(fieldNames) {
  const guidance = {
    fields: [
      {
        field: 'District (जिला)',
        type: 'Text',
        importance: 'Required',
        steps: [
          'Look at the envelope or document header',
          'Write your home district name clearly',
          'Example: Rohtak, Delhi, Mumbai'
        ],
        examples: 'Rohtak, Delhi, Mumbai, Bangalore',
        mistakes: 'Do not abbreviate. Write full district name.',
        tip: '✓ Check your Aadhar card for correct district'
      },
      {
        field: "Mother's Name (माँ का नाम)",
        type: 'Text',
        importance: 'Required',
        steps: [
          'Write exactly as it appears on your Aadhaar card',
          'Use CAPITAL LETTERS or follow original format',
          'Include all parts of the name (first, middle, last)'
        ],
        examples: 'Savitri Devi, Kareena Singh',
        mistakes: 'Do not change spelling or abbreviate the name',
        tip: '✓ Copy from Aadhaar or birth certificate for accuracy'
      },
      {
        field: 'Aadhaar Number (आधार)',
        type: 'Number',
        importance: 'Critical',
        steps: [
          'Find your Aadhaar card (yellow colored)',
          'Copy the 12-digit number carefully',
          'Check each digit twice before submitting'
        ],
        examples: '1234 5678 9012 (or 123456789012)',
        mistakes: 'Do not skip digits. Do not add extra numbers.',
        tip: '✓ Aadhaar is always 12 digits (no spaces needed)'
      },
      {
        field: 'Bank Account Details (बैंक विवरण)',
        type: 'Text',
        importance: 'Required',
        steps: [
          'Get your bank passbook or debit card',
          'Write your bank name (SBI, ICICI, Axis, etc)',
          'Copy account number from passbook',
          'Add IFSC code from bank letter or website'
        ],
        examples: 'SBI, Account: 98765432100, IFSC: SBIN0001234',
        mistakes: 'Do not mix account numbers. Do not guess IFSC.',
        tip: '✓ IFSC code is usually in the top-left of your passbook'
      }
    ],
    summary: 'Follow these simple steps to fill your form correctly. Take your time and double-check each field!'
  };
  
  return guidance;
}

export function extractFormFields(guidance) {
  return guidance.fields.map(f => ({
    ...f,
    helpText: f.steps.join(' → ')
  }));
}
