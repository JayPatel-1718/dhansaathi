// Occupation categories for quick selection
export const OCCUPATIONS = {
    farmer: { en: "🌾 I am a Farmer", hi: "🌾 मैं एक किसान हूँ" },
    student: { en: "📚 I am a Student", hi: "📚 मैं एक छात्र हूँ" },
    elderly: { en: "👴 I am Elderly", hi: "👴 मैं बुजुर्ग हूँ" },
    woman: { en: "👩 I am a Woman", hi: "👩 मैं एक महिला हूँ" },
    youth: { en: "🧑 I am Youth", hi: "🧑 मैं युवा हूँ" },
    laborer: { en: "🏗️ I am a Laborer", hi: "🏗️ मैं एक मजदूर हूँ" },
};

// Comprehensive Scheme Database
export const SCHEME_DB = {
    farmers: [
        {
            id: 'pm_kisan',
            name: 'PM-KISAN',
            desc: 'Direct income support to farmers for crop production',
            eligibility: 'All farmers cultivating land',
            amount: '₹2,000 per month',
            officialUrl: 'https://pmkisan.gov.in',
            tags: ['Income Support', 'Direct Benefit']
        },
        {
            id: 'soil_health',
            name: 'Soil Health Card Scheme',
            desc: 'Free soil testing and guidance for better crops',
            eligibility: 'All farmers',
            amount: 'Free soil testing',
            officialUrl: 'https://soilhealth.dac.gov.in',
            tags: ['Agriculture', 'Free Service']
        },
        {
            id: 'crop_insurance',
            name: 'Pradhan Mantri Fasal Bima Yojana',
            desc: 'Crop insurance for protection against crop loss',
            eligibility: 'Farmers with agricultural land',
            amount: 'Premium support',
            officialUrl: 'https://pmfby.gov.in',
            tags: ['Insurance', 'Protection']
        }
    ],
    students: [
        {
            id: 'scholarship_merit',
            name: 'Merit Scholarship',
            desc: 'Scholarship for academically excellent students',
            eligibility: 'Students with merit (above 80% marks)',
            amount: '₹5,000 - ₹15,000 per year',
            officialUrl: 'https://scholarships.gov.in',
            tags: ['Education', 'Merit-Based']
        },
        {
            id: 'girl_child',
            name: 'Beti Bachao, Beti Padhao',
            desc: 'Financial assistance for girls\' education',
            eligibility: 'Girl child students up to 12th',
            amount: 'Variable',
            officialUrl: 'https://wcd.nic.in',
            tags: ['Girls', 'Education']
        },
        {
            id: 'nsh_scheme',
            name: 'National Scholarship Portal',
            desc: 'Gateway to access various scholarships',
            eligibility: 'All students meeting criteria',
            amount: 'Variable',
            officialUrl: 'https://scholarships.gov.in',
            tags: ['Education', 'Portal']
        }
    ],
    elderly: [
        {
            id: 'aadhaar_pension',
            name: 'Aadhaar Enabled Payment System',
            desc: 'Direct pension deposit through Aadhaar',
            eligibility: 'Senior citizens aged 60+',
            amount: '₹3,000-₹5,000 per month',
            officialUrl: 'https://pensions.nic.in',
            tags: ['Pension', 'Senior Citizens']
        },
        {
            id: 'apjy',
            name: 'Atal Pension Yojana',
            desc: 'Guaranteed minimum pension for retirement',
            eligibility: 'Age 18-40 at enrollment',
            amount: 'Minimum ₹1,000/month',
            officialUrl: 'https://www.pib.gov.in',
            tags: ['Pension', 'Retirement']
        },
        {
            id: 'indira_awas',
            name: 'Indira Awas Yojana',
            desc: 'Housing assistance for elderly poor',
            eligibility: 'BPL elderly families',
            amount: '₹70,000 - ₹1,20,000',
            officialUrl: 'https://pmay-g.nic.in',
            tags: ['Housing', 'Elderly']
        }
    ],
    women: [
        {
            id: 'ujjwala',
            name: 'PM Ujjwala Yojana',
            desc: 'Free LPG gas connection for women',
            eligibility: 'All adult women BPL families',
            amount: 'Free connection',
            officialUrl: 'https://ujjwalayojana.com',
            tags: ['Fuel', 'Women']
        },
        {
            id: 'shakti',
            name: 'Nari Shakti Puraskaar',
            desc: 'Recognition and awards for exceptional women',
            eligibility: 'Women with outstanding contribution',
            amount: '₹2,00,000 award',
            officialUrl: 'https://wcd.nic.in',
            tags: ['Award', 'Women']
        },
        {
            id: 'stree_swavalamban',
            name: 'Stree Swavalamban Yojana',
            desc: 'Microfinance for women self-help groups',
            eligibility: 'Women SHGs',
            amount: 'Loan up to ₹5,00,000',
            officialUrl: 'https://www.sidbi.in',
            tags: ['Microfinance', 'Women']
        }
    ],
    youth: [
        {
            id: 'startup_india',
            name: 'Startup India',
            desc: 'Support for innovative startups',
            eligibility: 'Registered startups aged less than 7 years',
            amount: 'Tax benefits + loans',
            officialUrl: 'https://www.startupindia.gov.in',
            tags: ['Startups', 'Loans']
        },
        {
            id: 'skill_india',
            name: 'Skill India Mission',
            desc: 'Free skill development training',
            eligibility: 'Youth aged 15-45',
            amount: 'Free training + certification',
            officialUrl: 'https://www.skillindia.gov.in',
            tags: ['Skills', 'Training']
        },
        {
            id: 'nsap',
            name: 'National Apprenticeship Promotion',
            desc: 'Apprenticeship opportunities',
            eligibility: 'Youth with ITI/diploma',
            amount: 'Stipend + training',
            officialUrl: 'https://www.apprenticeshipindia.org',
            tags: ['Apprenticeship', 'Training']
        }
    ],
    laborers: [
        {
            id: 'eshram',
            name: 'eShram Portal',
            desc: 'Social security for unorganized workers',
            eligibility: 'Unorganized sector workers',
            amount: 'Insurance + benefits',
            officialUrl: 'https://eshram.gov.in',
            tags: ['Social Security', 'Workers']
        },
        {
            id: 'atal_bhimaji',
            name: 'Atal Bhimaji Ayushman Yojana',
            desc: 'Health insurance for unorganized workers',
            eligibility: 'Construction/unorganized workers',
            amount: 'Free health insurance',
            officialUrl: 'https://www.atalayushman.gov.in',
            tags: ['Health', 'Insurance']
        },
        {
            id: 'bhamashah',
            name: 'Bhamashah Card',
            desc: 'State support for registered workers',
            eligibility: 'Registered laborers (state specific)',
            amount: 'Various benefits',
            officialUrl: 'https://bhamashah.rajasthan.gov.in',
            tags: ['Support', 'Workers']
        }
    ]
};

// FAQ Database
export const GENERAL_FAQS = {
    en: {
        'how to apply': 'Most schemes allow online applications through official portals. Visit the scheme website and look for "Apply Online" or "Registration" button.',
        'documents needed': 'Common documents: Aadhaar, Bank Account details, Income certificate (if required), Land certificate (for farmers), Educational certificates (for students).',
        'application status': 'Check status using your application number or Aadhaar on the official scheme portal.',
        'rejected application': 'If rejected, review the rejection reason and correct the information. You can usually reapply after the adjustment period.',
        'payment methods': 'Most schemes use direct bank transfer. Ensure your bank account is linked with Aadhaar.',
        'duplicate schemes': 'You can apply for multiple schemes if you meet their individual eligibility criteria.',
        'contact help': 'Contact the official helpline number available on the scheme website or visit the nearest government office.'
    },
    hi: {
        'कैसे आवेदन करें': 'अधिकांश योजनाएं आधिकारिक पोर्टल के माध्यम से ऑनलाइन आवेदन की अनुमति देती हैं। योजना वेबसाइट पर जाएं और "ऑनलाइन आवेदन करें" या "पंजीकरण" बटन खोजें।',
        'आवश्यक दस्तावेज़': 'सामान्य दस्तावेज़: आधार, बैंक खाता विवरण, आय प्रमाण पत्र (यदि आवश्यक हो), भूमि प्रमाण पत्र (किसानों के लिए), शैक्षणिक प्रमाण पत्र।',
        'आवेदन स्थिति': 'अपने आवेदन संख्या या आधार का उपयोग करके आधिकारिक योजना पोर्टल पर स्थिति जांचें।',
        'अस्वीकृत आवेदन': 'यदि अस्वीकृत किया गया है, तो अस्वीकृति के कारण की समीक्षा करें और जानकारी सही करें।',
        'भुगतान विधि': 'अधिकांश योजनाएं सीधे बैंक ट्रांसफर का उपयोग करती हैं।',
        'बहु योजनाएं': 'आप यदि प्रत्येक योजना की पात्रता मानदंड पूरी करते हैं तो कई योजनाओं के लिए आवेदन कर सकते हैं।',
        'सहायता संपर्क': 'योजना वेबसाइट पर उपलब्ध आधिकारिक हेल्पलाइन नंबर पर संपर्क करें।'
    }
};

// Query Analysis Engine
export const analyzeQuery = (query, language) => {
    const lowerQuery = query.toLowerCase();
    
    // Check if user is self-identifying
    if (lowerQuery.includes('farmer') || lowerQuery.includes('किसान')) {
        return {
            text: language === 'hi' 
                ? '✅ बहुत अच्छा! किसानों के लिए सरकारी योजनाएं देख रहे हैं। यहाँ कुछ प्रमुख हैं:'
                : '✅ Great! Let me show you government schemes for farmers:',
            type: 'recommendation',
            data: SCHEME_DB.farmers
        };
    }
    
    if (lowerQuery.includes('student') || lowerQuery.includes('छात्र')) {
        return {
            text: language === 'hi' 
                ? '📚 छात्रों के लिए विभिन्न छात्रवृत्ति योजनाएं उपलब्ध हैं:'
                : '📚 Here are scholarship schemes available for students:',
            type: 'recommendation',
            data: SCHEME_DB.students
        };
    }
    
    if (lowerQuery.includes('elderly') || lowerQuery.includes('बुजुर्ग') || lowerQuery.includes('pension') || lowerQuery.includes('पेंशन')) {
        return {
            text: language === 'hi' 
                ? '👴 वरिष्ठ नागरिकों के लिए पेंशन और सहायता योजनाएं:'
                : '👴 Pension and support schemes for senior citizens:',
            type: 'recommendation',
            data: SCHEME_DB.elderly
        };
    }
    
    if (lowerQuery.includes('woman') || lowerQuery.includes('women') || lowerQuery.includes('महिला')) {
        return {
            text: language === 'hi' 
                ? '👩 महिलाओं के लिए विशेष योजनाएं और सहायता:'
                : '👩 Special schemes for women:',
            type: 'recommendation',
            data: SCHEME_DB.women
        };
    }
    
    if (lowerQuery.includes('youth') || lowerQuery.includes('युवा')) {
        return {
            text: language === 'hi' 
                ? '🧑 युवाओं के लिए रोजगार और कौशल विकास योजनाएं:'
                : '🧑 Employment and skill development schemes for youth:',
            type: 'recommendation',
            data: SCHEME_DB.youth
        };
    }
    
    if (lowerQuery.includes('laborer') || lowerQuery.includes('worker') || lowerQuery.includes('मजदूर')) {
        return {
            text: language === 'hi' 
                ? '🏗️ मजदूरों और असंगठित श्रमिकों के लिए सामाजिक सुरक्षा योजनाएं:'
                : '🏗️ Social security schemes for workers:',
            type: 'recommendation',
            data: SCHEME_DB.laborers
        };
    }
    
    // FAQ matching
    const faqDb = language === 'hi' ? GENERAL_FAQS.hi : GENERAL_FAQS.en;
    for (const [key, answer] of Object.entries(faqDb)) {
        if (lowerQuery.includes(key)) {
            return {
                text: answer,
                type: 'faq'
            };
        }
    }
    
    // Default response
    return {
        text: language === 'hi' 
            ? 'कृपया बताएं कि आप कौन हैं (किसान, छात्र, बुजुर्ग, महिला, या मजदूर) ताकि मैं आपके लिए उपयुक्त योजनाएं सुझा सकूँ।'
            : 'Please tell me who you are (farmer, student, elderly, woman, or laborer) so I can suggest relevant schemes for you.',
        type: 'neutral'
    };
};
