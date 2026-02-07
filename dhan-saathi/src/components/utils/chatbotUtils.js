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

// Banking & Financial Terms Glossary
export const FINANCIAL_GLOSSARY = {
    en: {
        'KYC': 'Know Your Customer - Bank verification process where they check your identity using Aadhaar, PAN, or passport. Required to open account.',
        'NEFT': 'National Electronic Funds Transfer - Free way to transfer money between banks. Takes 1-2 hours. Good for small to medium amounts (up to ₹2 lakh).',
        'RTGS': 'Real Time Gross Settlement - Fast money transfer between banks within minutes. Used for large amounts above ₹2 lakh. Has transaction charges.',
        'IMPS': 'Immediate Payment Service - Instant money transfer any time. Works 24/7 even on holidays. Used for urgent transfers.',
        'UPI': 'Unified Payments Interface - Send/receive money instantly using mobile number or virtual ID. No charges. Example: Google Pay, PhonePe, Paytm.',
        'PIN': 'Personal Identification Number - Secret 4-6 digit code for your bank account. NEVER share with anyone.',
        'OTP': 'One-Time Password - 6-digit code sent to verify transactions. Valid for few minutes only. Required for online banking and e-commerce.',
        'EMI': 'Equated Monthly Installment - Fixed monthly payment for loans. Includes principal + interest. Example: ₹50,000 loan = ₹5,000 EMI for 10 months.',
        'Interest Rate': 'Percentage charged by bank on borrowed money. Higher rate = more cost. Example: 10% interest on ₹1 lakh = ₹10,000 per year.',
        'CIF': 'Customer Information File - Your complete banking record with the bank. Used for account verification.',
        'Cheque': 'Written order to pay money from your bank account. Takes 3-7 days to clear. Safer than cash for large amounts.',
        'Savings Account': 'Basic bank account for regular deposits and withdrawals. Pays low interest (4-5%). Free for salary account holders.',
        'Current Account': 'Business bank account for traders/companies. No deposit/withdrawal limits. Costs monthly charges. Does not earn interest.',
        'Fixed Deposit (FD)': 'Lock your money in bank for fixed time (3 months-10 years) at fixed interest rate (7-8%). Cannot withdraw early without penalty.',
        'Credit Score': 'Number (300-900) showing your borrowing trustworthiness. Based on loan repayment history. Higher score = easier loan approval.'
    },
    hi: {
        'आधार': 'आपकी पहचान का सरकारी दस्तावेज़। 12 अंकों का नंबर। बैंक खाता खोलने के लिए जरूरी।',
        'बैंक ट्रांसफर': 'एक खाते से दूसरे खाते में पैसे भेजना। तीन तरीके: NEFT (1-2 घंटे, मुफ्त, ₹2 लाख तक), RTGS (तुरंत, चार्ज, ₹2 लाख से ज्यादा), IMPS (तुरंत, हर समय)।',
        'यूपीआई': 'मोबाइल से तुरंत पैसे भेजना। उदाहरण: Google Pay, PhonePe, Paytm। कोई चार्ज नहीं।',
        'ब्याज': 'बैंक आपके पैसे को रखने के लिए जो प्रतिशत देता है। बचत खाता = 4-5%, FD = 7-8%।',
        'ईएमआई': 'कर्ज की मासिक किस्त। उदाहरण: ₹1 लाख कर्ज = ₹10,000 ईएमआई/महीने 10 महीने तक।',
        'क्रेडिट स्कोर': 'आपकी कर्ज लेने की योग्यता (300-900 नंबर)। जितना ज्यादा = आसान कर्ज।',
        'बचत खाता': 'सामान्य बैंक खाता। कम ब्याज (4-5%)। पैसे कभी भी निकाल सकते हो।',
        'फिक्स्ड डिपोजिट': 'निर्धारित समय (3 महीने-10 साल) के लिए पैसे बैंक में रोकना। अच्छा ब्याज (7-8%)। पहले निकालने पर जुर्माना।'
    }
};

// Investment Terms Glossary
export const INVESTMENT_GLOSSARY = {
    en: {
        'Stock': 'Small ownership (share) in a company. Buy shares = part owner. Stock price changes = profit/loss. High risk but high return.',
        'Mutual Fund': 'Professional fund manager invests YOUR money in stocks/bonds mix. Lower risk than individual stocks. Good for beginners with ₹500+.',
        'SIP': 'Systematic Investment Plan - Invest fixed amount monthly in mutual funds automatically. Safer than one-time investment. Example: ₹1,000/month for 5 years.',
        'Bond': 'Loan you give to government/company. They pay you fixed interest. Very safe, low return. Example: 8% interest per year.',
        'Dividend': 'Part of company profit distributed to shareholders. Example: Own 10 shares worth ₹100 each, get ₹5 dividend = ₹50 extra income.',
        'PPF': 'Public Provident Fund - Government backed savings scheme. Invest for 15 years, get 7.8% guaranteed interest, tax-free. Best for long-term.',
        'RD': 'Recurring Deposit - Deposit fixed amount monthly (₹500+) for fixed period. Get lump sum at end with interest. Safe and disciplined.',
        'Gold Investment': 'Buy physical gold, jewelry, or digital gold. Wealth protection. Price changes with market. Small returns compared to stocks.',
        'Real Estate': 'Buy property/land. Value appreciates over time. Need large capital. Generates rental income. Long-term investment.',
        'Risk vs Return': 'More risk = potential for higher returns. Less risk = lower but guaranteed returns. Choose based on age and goals.'
    },
    hi: {
        'शेयर': 'कंपनी के मालिकाना हक का टुकड़ा। खरीदो = आधिकारी का हिस्सा। कीमत बदले = लाभ/नुकसान। ज्यादा रिस्क।',
        'म्यूचुअल फंड': 'एक्सपर्ट आपके पैसे को शेयर/बांड में लगाता है। कम रिस्क। शुरुआत के लिए अच्छा। ₹500+ से शुरू करो।',
        'एसआईपी': 'हर महीने निर्धारित रकम म्यूचुअल फंड में डालना। सुरक्षित तरीका। उदाहरण: ₹1,000/महीने 5 साल के लिए।',
        'बांड': 'सरकार को कर्ज देना। वो हर साल ब्याज देता है। बहुत सुरक्षित। कम रिटर्न।',
        'पीपीएफ': 'पब्लिक प्रोविडेंट फंड - सरकार की योजना। 15 साल रखो, 7.8% ब्याज पाओ, कोई टैक्स नहीं। लंबी बचत के लिए बेहतरीन।',
        'आवर्ती जमा': 'हर महीने ₹500+ जमा करो, निर्धारित समय बाद ब्याज के साथ पाओ। सुरक्षित और अनुशासित।',
        'सोना': 'छल्ले, जेवरात, या डिजिटल सोना खरीदो। संपत्ति सुरक्षा। कीमत बाजार के अनुसार बदले। कम रिटर्न।',
        'जमीन/मकान': 'संपत्ति खरीदो। समय के साथ कीमत बढ़े। किराया आय। लंबी बचत।'
    }
};

// Investment Tips
export const INVESTMENT_TIPS = {
    en: [
        '💡 Start with emergency fund: Keep 3-6 months expenses in savings account before investing.',
        '💡 Understand before investing: Never invest in something you dont understand. Ask questions!',
        '💡 Diversify: Dont put all money in one investment. Spread across stocks, bonds, gold, FDs.',
        '💡 Time in market beats timing: Invest regularly (SIP) rather than trying to time the market.',
        '💡 Inflation eater: Must stay ahead of inflation (7-8%). Savings alone wont work after 20 years.',
        '💡 Age-based risk: Young = more risk (stocks). Older = less risk (FDs, bonds). Adjust as you age.',
        '💡 Tax saving: Use PPF, ELSS, insurance for tax benefits while investing.',
        '💡 Check track record: Review fund performance for 5-10 years before investing.',
        '💡 Avoid over-trading: Frequent buying/selling creates costs and taxes. Long-term is cheaper.',
        '💡 Read terms: Always read scheme documents, charges, and lock-in period before committing.'
    ],
    hi: [
        '💡 आपातकालीन निधि पहले: निवेश करने से पहले 3-6 महीने का खर्च बचत खाते में रखो।',
        '💡 समझकर निवेश करो: कभी भी ऐसा कुछ न खरीदो जो तुम समझते नहीं। सवाल पूछो!',
        '💡 विविधता रखो: सब पैसा एक जगह न डालो। शेयर, बांड, सोना, एफडी में फैलाओ।',
        '💡 नियमित निवेश करो: हर महीने निवेश करना (एसआईपी) बेहतर है समय लगाने से।',
        '💡 महंगाई को मारो: 7-8% बढ़ोतरी के साथ रखो। बचत अकेले काफी नहीं।',
        '💡 उम्र के अनुसार: युवा = ज्यादा रिस्क। बुजुर्ग = कम रिस्क। समय के साथ बदलो।',
        '💡 टैक्स बचाओ: पीपीएफ, एलएस, बीमा से टैक्स फायदा लो।',
        '💡 पुरानी परफॉर्मेंस देखो: निवेश से पहले 5-10 साल का रिकॉर्ड जांचो।',
        '💡 बार-बार खरीद-बिक्री न करो: इससे खर्च और टैक्स बढ़ता है। लंबी बचत सस्ती है।',
        '💡 शर्तें पढ़ो: योजना के दस्तावेज़, चार्ज, लॉक-इन अवधि पढ़ो।'
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
        'contact help': 'Contact the official helpline number available on the scheme website or visit the nearest government office.',
        'what is kyc': 'KYC (Know Your Customer) is bank verification using Aadhaar, PAN, or passport. Required to open account or do large transactions.',
        'how to save money': 'Create budget, cut unnecessary spending, use FDs/RDs for savings, automate transfers. Even ₹500/month helps!',
        'investment beginners': 'Start with mutual fund SIP (₹500/month), PPF (₹500/year), or RD. Avoid stocks initially. Learn first, then invest.',
        'inflation meaning': 'Rising prices of things. ₹100 item becomes ₹107 after 7% inflation. Your money buys less. Invest to keep up!',
        'compound interest': 'Earning interest on your interest! Example: ₹10,000 at 10% becomes ₹11,000, then ₹12,100. Magic of long-term investing!',
        'tax saving': 'Special investments that reduce your tax: PPF (15 year), ELSS mutual fund (3 year), insurance, home loan interest.',
        'emergency fund': 'Keep 3-6 months expenses in bank as safety net before investing. Use this ONLY for real emergencies.'
    },
    hi: {
        'कैसे आवेदन करें': 'अधिकांश योजनाएं आधिकारिक पोर्टल के माध्यम से ऑनलाइन आवेदन की अनुमति देती हैं। योजना वेबसाइट पर जाएं और "ऑनलाइन आवेदन करें" या "पंजीकरण" बटन खोजें।',
        'आवश्यक दस्तावेज़': 'सामान्य दस्तावेज़: आधार, बैंक खाता विवरण, आय प्रमाण पत्र (यदि आवश्यक हो), भूमि प्रमाण पत्र (किसानों के लिए), शैक्षणिक प्रमाण पत्र।',
        'आवेदन स्थिति': 'अपने आवेदन संख्या या आधार का उपयोग करके आधिकारिक योजना पोर्टल पर स्थिति जांचें।',
        'अस्वीकृत आवेदन': 'यदि अस्वीकृत किया गया है, तो अस्वीकृति के कारण की समीक्षा करें और जानकारी सही करें।',
        'भुगतान विधि': 'अधिकांश योजनाएं सीधे बैंक ट्रांसफर का उपयोग करती हैं।',
        'बहु योजनाएं': 'आप यदि प्रत्येक योजना की पात्रता मानदंड पूरी करते हैं तो कई योजनाओं के लिए आवेदन कर सकते हैं।',
        'सहायता संपर्क': 'योजना वेबसाइट पर उपलब्ध आधिकारिक हेल्पलाइन नंबर पर संपर्क करें।',
        'केवाईसी क्या है': 'बैंक वेरिफिकेशन। आधार, पीएएन, या पासपोर्ट से। खाता खोलने और बड़े लेन-देन के लिए जरूरी।',
        'पैसे कैसे बचाएं': 'बजट बनाओ, अनावश्यक खर्च कम करो, एफडी/आरडी में डालो। हर महीने ₹500 भी मदद करता है!',
        'शुरुआत कैसे करें': 'एसआईपी (₹500/महीने), पीपीएफ (₹500/साल), या आरडी से शुरू करो। शेयर अभी न खरीदो। पहले सीखो।',
        'महंगाई का अर्थ': 'चीजों की कीमत बढ़ना। ₹100 की चीज ₹107 हो जाए। तुम्हारे पैसे की ताकत कम हो। निवेश करो!',
        'चक्रवृद्धि ब्याज': 'ब्याज पर ब्याज। उदाहरण: ₹10,000 पर 10% = ₹11,000, फिर ₹12,100। लंबी बचत की शक्ति!',
        'टैक्स बचत': 'खास निवेश जो टैक्स कम करते हैं: पीपीएफ, एलएस, बीमा, होम लोन।',
        'आपातकालीन निधि': '3-6 महीने का खर्च बैंक में रखो। सिर्फ असली आपातकाल में लो।'
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
    
    // Financial glossary matching (banking terms)
    const financialGlossary = language === 'hi' ? FINANCIAL_GLOSSARY.hi : FINANCIAL_GLOSSARY.en;
    for (const [term, definition] of Object.entries(financialGlossary)) {
        const searchTerms = term.toLowerCase().split(' ');
        if (searchTerms.some(t => lowerQuery.includes(t))) {
            return {
                text: `📊 ${term}: ${definition}`,
                type: 'financial_term'
            };
        }
    }
    
    // Investment glossary matching
    const investmentGlossary = language === 'hi' ? INVESTMENT_GLOSSARY.hi : INVESTMENT_GLOSSARY.en;
    for (const [term, definition] of Object.entries(investmentGlossary)) {
        const searchTerms = term.toLowerCase().split(' ');
        if (searchTerms.some(t => lowerQuery.includes(t))) {
            return {
                text: `💰 ${term}: ${definition}`,
                type: 'investment_term'
            };
        }
    }
    
    // Investment tips
    if (lowerQuery.includes('tip') || lowerQuery.includes('सुझाव') || 
        lowerQuery.includes('invest') || lowerQuery.includes('निवेश') ||
        lowerQuery.includes('advice') || lowerQuery.includes('सलाह')) {
        const tips = language === 'hi' ? INVESTMENT_TIPS.hi : INVESTMENT_TIPS.en;
        return {
            text: language === 'hi' ? '💡 निवेश के सुझाव:' : '💡 Investment Tips:',
            type: 'investment_tips',
            data: tips
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
    
    // Check for financial keywords
    if (lowerQuery.includes('bank') || lowerQuery.includes('बैंक') ||
        lowerQuery.includes('money') || lowerQuery.includes('पैसा') ||
        lowerQuery.includes('save') || lowerQuery.includes('बचत') ||
        lowerQuery.includes('interest') || lowerQuery.includes('ब्याज') ||
        lowerQuery.includes('loan') || lowerQuery.includes('कर्ज')) {
        return {
            text: language === 'hi'
                ? '💼 बैंकिंग और वित्त के बारे में पूछें! मैं आपको बचत खाता, ब्याज, कर्ज, स्थानांतरण और अन्य बैंकिंग सेवाओं के बारे में जानकारी दे सकता हूँ।'
                : '💼 Ask me about banking and finance! I can help with savings accounts, interest, loans, transfers, and other banking services.',
            type: 'financial_guidance'
        };
    }
    
    // Default response
    return {
        text: language === 'hi' 
            ? 'कृपया बताएं कि आप कौन हैं (किसान, छात्र, बुजुर्ग, महिला, या मजदूर) ताकि मैं आपके लिए उपयुक्त योजनाएं सुझा सकूँ। या आप बैंकिंग, निवेश और वित्त के बारे में भी पूछ सकते हैं।'
            : 'Please tell me who you are (farmer, student, elderly, woman, or laborer) so I can suggest relevant schemes. You can also ask about banking, investments, and finances.',
        type: 'neutral'
    };
};
