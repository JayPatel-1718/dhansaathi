// Enhanced Document Form Analysis Service
// Uses Vision API to detect forms and extract fields

export async function detectAndAnalyzeForm(imageBase64) {
  try {
    // First, verify if it's actually a form
    const isFormResult = await verifyIsForm(imageBase64);
    
    if (!isFormResult.isForm) {
      return {
        success: false,
        error: isFormResult.issue,
        isForm: false
      };
    }

    // Extract fields from the form
    const extractedFields = await extractFormFieldsFromImage(imageBase64);
    
    // Generate guidance for each field
    const guidance = generateDetailedGuidance(extractedFields);
    
    return {
      success: true,
      isForm: true,
      guidance: guidance,
      detectedFields: extractedFields
    };
  } catch (error) {
    console.error('Form analysis error:', error);
    return {
      success: false,
      error: 'Failed to analyze form. Please try another image.',
      isForm: false
    };
  }
}

async function verifyIsForm(imageBase64) {
  try {
    // This checks if image contains form-like patterns
    // In production, integrate with Google Gemini or Claude Vision API
    
    // Mock verification
    return {
      isForm: true,
      confidence: 0.95,
      formType: 'government_form'
    };
  } catch (error) {
    return {
      isForm: false,
      issue: 'Could not analyze image'
    };
  }
}

async function extractFormFieldsFromImage(imageBase64) {
  try {
    // In production, this would call Gemini Vision API
    // For now, return mock extracted fields
    
    const extractedFields = [
      { name: 'Full Name', type: 'text', required: true, visible: true },
      { name: 'Date of Birth', type: 'date', required: true, visible: true },
      { name: 'Address', type: 'textarea', required: true, visible: true },
      { name: 'Phone Number', type: 'tel', required: true, visible: true },
      { name: 'Email', type: 'email', required: false, visible: true },
      { name: 'Aadhar Number', type: 'text', required: true, visible: true },
      { name: 'Signature', type: 'signature', required: true, visible: true }
    ];
    
    return extractedFields;
  } catch (error) {
    throw error;
  }
}

function generateDetailedGuidance(fields) {
  const fieldGuidanceMap = {
    'full name': {
      steps: [
        'Write your full name exactly as it appears on your Aadhar',
        'Use capital letters',
        'Include first, middle, and last name'
      ],
      stepsHindi: [
        'अपना पूरा नाम लिखें जैसा आधार कार्ड में है',
        'बड़े अक्षरों में लिखें',
        'पहला नाम, मध्य नाम और अंतिम नाम सभी शामिल करें'
      ],
      examples: 'Rajesh Kumar Singh, Priya Sharma',
      mistakes: 'Do not shorten or abbreviate your name',
      tip: '✓ Copy directly from your Aadhar card for accuracy',
      importance: 'Critical'
    },
    'date of birth': {
      steps: [
        'Enter your date of birth (DD-MM-YYYY format)',
        'Double-check with your Aadhar card',
        'Do not approximate or guess'
      ],
      stepsHindi: [
        'अपनी जन्म तिथि दर्ज करें (DD-MM-YYYY प्रारूप)',
        'अपने आधार कार्ड से दोबारा जांचें',
        'अनुमान न लगाएं'
      ],
      examples: '15-06-1990, 22-03-1985',
      mistakes: 'Do not use different format. Do not approximate.',
      tip: '✓ This must match your official documents exactly',
      importance: 'Critical'
    },
    'address': {
      steps: [
        'Write your current residential address',
        'Include house number, street name, and locality',
        'Add city, district, state, and PIN code'
      ],
      stepsHindi: [
        'अपना वर्तमान आवासीय पता लिखें',
        'घर संख्या, सड़क का नाम और मोहल्ला शामिल करें',
        'शहर, जिला, राज्य और पिन कोड जोड़ें'
      ],
      examples: '123 MG Road, New Delhi, Delhi 110001',
      mistakes: 'Do not use incomplete addresses. Do not use abbreviations.',
      tip: '✓ Address must match your official documents',
      importance: 'Required'
    },
    'phone number': {
      steps: [
        'Enter your 10-digit mobile number',
        'Do not add country code or spaces',
        'Ensure it\'s an active number'
      ],
      stepsHindi: [
        '10 अंकों का मोबाइल नंबर दर्ज करें',
        'देश कोड या स्पेस न जोड़ें',
        'सुनिश्चित करें कि यह एक सक्रिय नंबर है'
      ],
      examples: '9876543210, 9123456789',
      mistakes: 'Do not add country code. Do not include spaces.',
      tip: '✓ Use the phone number where you can receive SMS',
      importance: 'Required'
    },
    'email': {
      steps: [
        'Enter your email address',
        'Make sure you can still access it',
        'Check for correct @ symbol and domain'
      ],
      stepsHindi: [
        'अपना ईमेल पता दर्ज करें',
        'सुनिश्चित करें कि आप अभी भी इसे एक्सेस कर सकते हैं',
        '@ प्रतीक और डोमेन सही हैं या नहीं जांचें'
      ],
      examples: 'yourname@gmail.com, name@yahoo.com',
      mistakes: 'Do not skip @ symbol. Do not misspell domain.',
      tip: '✓ Use an email you check regularly',
      importance: 'Required'
    },
    'aadhar number': {
      steps: [
        'Find your Aadhar card (yellow colored)',
        'Copy the 12-digit number carefully',
        'Check each digit twice before final entry'
      ],
      stepsHindi: [
        'अपना आधार कार्ड खोजें (पीले रंग का)',
        '12 अंकों की संख्या को ध्यान से कॉपी करें',
        'अंतिम प्रविष्टि से पहले प्रत्येक अंक को दोबारा जांचें'
      ],
      examples: '123456789012, 987654321098',
      mistakes: 'Do not skip digits. Do not add extra zeros.',
      tip: '✓ Aadhar is always 12 digits without spaces',
      importance: 'Critical'
    },
    'signature': {
      steps: [
        'Sign in the designated area with pen (black/blue ink)',
        'Make sure your signature fits in the box',
        'Do not print your name, use your regular signature'
      ],
      stepsHindi: [
        'निर्दिष्ट क्षेत्र में पेन (काली/नीली स्याही) से हस्ताक्षर करें',
        'सुनिश्चित करें कि आपका हस्ताक्षर बॉक्स में फिट हो',
        'अपना नाम प्रिंट न करें, अपना सामान्य हस्ताक्षर करें'
      ],
      examples: 'Your regular signature (as in official documents)',
      mistakes: 'Do not print name. Do not sign outside box.',
      tip: '✓ Your signature should match your official style',
      importance: 'Critical'
    }
  };

  const guidedFields = fields.map(field => {
    const fieldNameLower = field.name.toLowerCase();
    const guidance = fieldGuidanceMap[fieldNameLower] || createGenericGuidance(field);
    
    return {
      field: field.name,
      fieldType: field.type,
      required: field.required,
      importance: guidance.importance || (field.required ? 'Required' : 'Optional'),
      type: getFieldType(field.type),
      steps: guidance.steps || guidance.englishSteps,
      stepsHindi: guidance.stepsHindi || guidance.steps,
      examples: guidance.examples,
      mistakes: guidance.mistakes,
      tip: guidance.tip
    };
  });

  return {
    fields: guidedFields,
    summary: 'Follow these simple steps to fill your form correctly. Take your time and double-check each field!',
    formType: 'government_form',
    totalFields: guidedFields.length
  };
}

function createGenericGuidance(field) {
  return {
    steps: [
      `Carefully fill in the ${field.name} field`,
      `Make sure the information is accurate and complete`,
      `Reference your official documents if needed`,
      `Double-check before submitting`
    ],
    stepsHindi: [
      `${field.name} फील्ड को ध्यान से भरें`,
      `सुनिश्चित करें कि जानकारी सटीक और पूर्ण है`,
      `यदि आवश्यक हो तो अपने आधिकारिक दस्तावेजों का संदर्भ लें`,
      `जमा करने से पहले दोबारा जांचें`
    ],
    examples: 'Check your official documents for exact information',
    mistakes: 'Do not leave this field blank or enter incorrect information',
    tip: '✓ Take time to fill this field accurately',
    importance: field.required ? 'Required' : 'Optional'
  };
}

function getFieldType(type) {
  const typeMap = {
    'text': 'Text',
    'email': 'Email',
    'tel': 'Phone',
    'date': 'Date',
    'number': 'Number',
    'textarea': 'Text Area',
    'signature': 'Signature',
    'checkbox': 'Checkbox',
    'radio': 'Radio Button'
  };
  return typeMap[type] || 'Text';
}

export function extractFormFields(guidance) {
  return guidance.fields.map(f => ({
    ...f,
    helpText: f.steps.join(' → ')
  }));
}

// Keep legacy function for backward compatibility
export async function analyzeFormImage(imageBase64) {
  const result = await detectAndAnalyzeForm(imageBase64);
  if (result.success) {
    return result.guidance;
  } else {
    throw new Error(result.error);
  }
}