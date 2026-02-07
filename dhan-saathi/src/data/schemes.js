// src/data/schemes.js

// Main schemes array used by both list and detail pages
export const schemes = [
  // ---------------- GOVT (Verified) ----------------
  {
    id: "pm-kisan",
    type: "govt",
    tag: "FARMER",
    verified: true,
    image: "money.png",

    title: "PM Kisan Samman Nidhi",
    desc:
      "Eligible farmer families receive annual income support of ₹6,000 in three installments directly to their bank accounts (as per scheme rules).",
    source: "https://pmkisan.gov.in/",
    details: {
      headline:
        "Income support of ₹6,000 per year to eligible farmer families, credited directly to their bank accounts.",
      whatYouGet: [
        "Direct income support of ₹6,000 per year.",
        "Paid in three equal installments directly into the beneficiary’s bank account.",
        "Amount is sent via Direct Benefit Transfer (DBT) after verification.",
      ],
      whoCanApply: [
        "Small and marginal farmer families that own cultivable land (as defined under scheme guidelines).",
        "Citizen of India, with land records in the beneficiary’s name (or as per state rules).",
        "Certain categories such as institutional landholders, income tax payers, and high-income professionals are generally excluded (see latest rules).",
      ],
      howToApply: [
        "Visit the official PM-KISAN portal and use the “Farmers Corner” > “New Farmer Registration” option, OR approach your local revenue/agriculture office / Common Service Centre (CSC).",
        "Provide Aadhaar number, bank account details, and land record details as required.",
        "Get your application verified by local authorities (Patwari/Tehsildar/State Nodal Officer).",
        "Track status using the PM-KISAN portal under “Beneficiary Status”.",
      ],
      documentsRequired: [
        "Aadhaar card.",
        "Bank account details / passbook.",
        "Land ownership / cultivation documents (as per state requirements).",
        "Mobile number (for updates and OTP).",
      ],
      important: [
        "Aadhaar seeding with bank account and land records is important for timely payment.",
        "Installments are transferred only after successful verification by State/UT authorities.",
        "Always check the latest eligibility and payment status only on the official PM-KISAN website or from your local agriculture office.",
      ],
      links: [
        {
          label: "PM-KISAN official website",
          url: "https://pmkisan.gov.in/",
        },
      ],
    },
  },

  {
    id: "mudra",
    type: "govt",
    tag: "SMALL BUSINESS",
    verified: true,
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    desc:
      "Loans up to ₹10 lakh to support micro and small enterprises for manufacturing, trading and services (as per lender/scheme rules).",
    source: "https://www.mudra.org.in/",
    details: {
      headline:
        "Collateral-free loans for micro and small businesses through banks and other lending institutions.",
      whatYouGet: [
        "Term loans or working capital loans for micro and small enterprises.",
        "Loans generally categorized as Shishu, Kishor, and Tarun (based on loan amount limits as per current guidelines).",
        "MUDRA provides refinance support to banks/NBFCs; actual loan terms are set by the lending institution.",
      ],
      whoCanApply: [
        "Non-farm income generating micro and small enterprises in manufacturing, trading, or services.",
        "Existing or new businesses meeting lender norms.",
        "Individuals, proprietary concerns, partnership firms, companies, etc. as per bank rules.",
      ],
      howToApply: [
        "Visit a nearby bank branch / financial institution that offers MUDRA loans.",
        "Discuss your business activity and funding needs with the loan officer.",
        "Fill the loan application form and submit business details, income details, and projections if required.",
        "Bank will process your request as per its internal credit policies.",
      ],
      documentsRequired: [
        "KYC documents (Aadhaar, PAN, etc.) of the applicant(s).",
        "Proof of business (registration / shop act license / GST registration, etc., as applicable).",
        "Bank account statement(s).",
        "Business plan / project report (for higher amounts, as required by bank).",
      ],
      important: [
        "Approval is at the discretion of the lending institution; MUDRA is a refinance scheme, not a direct loan from the Government.",
        "Interest rate, processing charges and collateral norms (if any) are as per bank policy and guidelines.",
        "Always interact directly with bank / authorised institutions; avoid agents promising guaranteed loans.",
      ],
      links: [
        {
          label: "MUDRA official website",
          url: "https://www.mudra.org.in/",
        },
      ],
    },
  },

  {
    id: "pmjdy",
    type: "govt",
    tag: "BANK ACCOUNT",
    verified: true,
    title: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    desc:
      "Financial inclusion program enabling basic savings account with no minimum balance requirement and access to RuPay card & DBT benefits (as applicable).",
    source: "https://pmjdy.gov.in/",
    details: {
      headline:
        "Basic bank account for every household with no minimum balance requirement and access to financial services.",
      whatYouGet: [
        "Basic Savings Bank Deposit (BSBD) account with no minimum balance requirement (conditions may apply).",
        "RuPay debit card (with in-built accidental insurance cover, subject to bank/insurance T&Cs).",
        "Direct Benefit Transfer (DBT) of Government subsidies into the account (for eligible schemes).",
        "Access to overdraft facility (subject to eligibility and bank norms).",
      ],
      whoCanApply: [
        "Any eligible individual not having a basic savings bank account, as per bank KYC rules.",
        "Generally for unbanked individuals/households to enable financial inclusion.",
      ],
      howToApply: [
        "Visit any bank branch or Bank Mitra / Business Correspondent outlet participating in PMJDY.",
        "Ask for opening a PMJDY account or a basic savings bank account under the scheme.",
        "Provide KYC documents and complete account opening form.",
      ],
      documentsRequired: [
        "Officially Valid Document (OVD) such as Aadhaar, Voter ID, PAN, driving license, etc. as per KYC rules.",
        "Passport-size photograph (if required).",
      ],
      important: [
        "Overdraft facility and accident insurance benefits are subject to conditions and bank’s approval.",
        "Usage of the RuPay card (e.g., at least one transaction within a specified period) may be required to keep certain benefits active.",
        "Always confirm latest rules and benefits with the bank or official PMJDY website.",
      ],
      links: [
        {
          label: "PMJDY official website",
          url: "https://pmjdy.gov.in/",
        },
      ],
    },
  },

  {
    id: "apy",
    type: "govt",
    tag: "PENSION",
    verified: true,
    title: "Atal Pension Yojana (APY)",
    desc:
      "Pension scheme for eligible subscribers (typically 18–40) providing a defined pension after 60 based on contributions (subject to rules).",
    source: "https://www.npscra.proteantech.in/scheme-details.php",
    details: {
      headline:
        "Voluntary pension scheme for workers in unorganised sector, offering guaranteed pension after age 60.",
      whatYouGet: [
        "Guaranteed monthly pension (e.g., ₹1,000 to ₹5,000 per month options, as per chosen plan and rules).",
        "Pension starts after the subscriber attains 60 years of age and contributes regularly.",
        "After subscriber, spouse may receive pension; after both, corpus may be returned to nominee (as per rules).",
      ],
      whoCanApply: [
        "Indian citizens aged 18–40 years (as per current rules).",
        "Having a savings bank or post office account.",
        "Not covered by any statutory social security scheme (subject to eligibility criteria).",
      ],
      howToApply: [
        "Visit your bank branch or post office that offers APY.",
        "Fill the APY registration form and choose desired monthly pension amount.",
        "Provide bank account details for auto-debit of contribution.",
        "Ensure regular contributions until age 60 for full benefits.",
      ],
      documentsRequired: [
        "Bank / post office savings account details.",
        "Aadhaar (recommended) and other KYC documents as required.",
        "Mobile number for SMS alerts.",
      ],
      important: [
        "Contribution amount depends on entry age and chosen pension amount.",
        "Delayed or missed contributions may attract penalties or discontinuation, as per rules.",
        "Rules, pension slabs, and contribution tables may change; always check latest official communication.",
      ],
      links: [
        {
          label: "Official APY information (NPS Trust)",
          url: "https://www.npscra.proteantech.in/scheme-details.php",
        },
      ],
    },
  },

  {
    id: "pmjjby",
    type: "govt",
    tag: "LIFE INSURANCE",
    verified: true,
    title: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    desc:
      "Low-cost renewable life insurance cover with annual premium auto-debited from bank/post office account (eligibility as per scheme rules).",
    source: "https://financialservices.gov.in/beta/en/pmjjby",
    details: {
      headline:
        "Low-cost term life insurance scheme renewable every year through your bank/post office account.",
      whatYouGet: [
        "Life insurance cover amount as per current scheme rules (subject to change).",
        "Premium auto-debited annually from your bank or post office account.",
        "Cover is generally for one year at a time, renewable every year (as per rules).",
      ],
      whoCanApply: [
        "Individuals in the eligible age group (usually 18–50 years; check latest rules).",
        "Having a savings bank / post office account.",
        "Willing to give consent for auto-debit of annual premium.",
      ],
      howToApply: [
        "Visit your bank or post office branch where you maintain a savings account.",
        "Ask for PMJJBY enrollment form or use net banking / mobile banking (where available).",
        "Submit consent for auto-debit of premium and required KYC, if not already updated.",
      ],
      documentsRequired: [
        "Bank / post office account details.",
        "KYC documents (Aadhaar, PAN, etc.) if not already updated.",
        "Nominee details.",
      ],
      important: [
        "Cover and premium are subject to yearly renewal and scheme guidelines.",
        "Claim is payable to nominee/beneficiary on death of insured (as per T&Cs).",
        "Always read the latest scheme brochure and exclusions before enrolling.",
      ],
      links: [
        {
          label: "Official PMJJBY information",
          url: "https://financialservices.gov.in/beta/en/pmjjby",
        },
      ],
    },
  },

  {
    id: "pmsby",
    type: "govt",
    tag: "ACCIDENT INSURANCE",
    verified: true,
    title: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    desc:
      "Accident insurance cover with a small annual premium auto-debited from bank/post office account (eligibility and benefits as per scheme rules).",
    source: "https://jansuraksha.in/pmsbyScheme",
    details: {
      headline:
        "Accidental death and disability insurance scheme with small annual premium auto-debited from your account.",
      whatYouGet: [
        "Accidental death and disability cover amount as per current scheme rules.",
        "Very low annual premium auto-debited from your bank/post office account.",
        "Coverage for a period of one year at a time, renewable annually.",
      ],
      whoCanApply: [
        "Individuals in the eligible age group (typically 18–70 years; check latest rules).",
        "Having a participating bank or post office savings account.",
        "Providing consent for automatic annual premium debit.",
      ],
      howToApply: [
        "Visit your bank/post office branch or use net banking / mobile banking where PMSBY is offered.",
        "Fill the PMSBY consent form or enroll online.",
        "Ensure your bank account has sufficient balance at time of premium debit.",
      ],
      documentsRequired: [
        "Savings bank / post office account details.",
        "KYC documents as per bank/insurer norms (if not already updated).",
        "Nominee information.",
      ],
      important: [
        "Only accidental death or disability is covered; natural death is not covered.",
        "Coverage becomes effective only after successful premium debit and confirmation.",
        "Read the latest policy document for exclusions and claim procedures.",
      ],
      links: [
        {
          label: "Official PMSBY information",
          url: "https://jansuraksha.in/pmsbyScheme",
        },
      ],
    },
  },

  {
    id: "pm-svanidhi",
    type: "govt",
    tag: "STREET VENDOR",
    verified: true,
    title: "PM SVANidhi (Street Vendor’s AtmaNirbhar Nidhi)",
    desc:
      "Working capital loans for eligible street vendors to resume livelihoods, with interest subsidy and incentives as applicable (as per rules).",
    source: "https://www.myscheme.gov.in/schemes/pm-svanidhi",
    details: {
      headline:
        "Micro-credit facility for street vendors to access affordable working capital and grow their business.",
      whatYouGet: [
        "Initial working capital loan (amount as per scheme stage and rules).",
        "Interest subsidy on timely or early repayment (credited to borrower’s account).",
        "Incentives for digital transactions and potential access to higher loan amounts on good repayment track record.",
      ],
      whoCanApply: [
        "Street vendors operating in urban areas (including surrounding areas) as per scheme definition.",
        "Vendors identified in survey lists or holding a Certificate of Vending / Identity Card from ULBs.",
        "Certain other vendors verified through processes defined by local bodies (refer latest guidelines).",
      ],
      howToApply: [
        "Apply online via the official PM SVANidhi portal or through Common Service Centres (CSCs).",
        "Approach nearby bank/financial institution partnered under PM SVANidhi.",
        "Provide details of vending activity, location, and KYC documents.",
      ],
      documentsRequired: [
        "KYC documents (Aadhaar, Voter ID, etc.).",
        "Certificate of Vending / identity card (if available).",
        "Proof of business or letter of recommendation from Urban Local Body (if applicable).",
        "Bank account details.",
      ],
      important: [
        "Loan sanction is at the discretion of the lending institution.",
        "Interest subsidy and digital transaction incentives are as per scheme rules and may change over time.",
        "Keep repayment regular to become eligible for enhanced loan amounts in subsequent cycles.",
      ],
      links: [
        {
          label: "PM SVANidhi on MyScheme",
          url: "https://www.myscheme.gov.in/schemes/pm-svanidhi",
        },
      ],
    },
  },

  {
    id: "stand-up-india",
    type: "govt",
    tag: "WOMEN / SC-ST",
    verified: true,
    title: "Stand-Up India",
    desc:
      "Facilitates bank loans for eligible SC/ST and/or women entrepreneurs for greenfield enterprises in manufacturing/services/trading (as per rules).",
    source: "https://www.myscheme.gov.in/schemes/sui",
    details: {
      headline:
        "Bank loans for SC/ST and women entrepreneurs to set up greenfield enterprises in manufacturing, services or trading.",
      whatYouGet: [
        "Composite loans (term loan + working capital) for eligible greenfield projects.",
        "Handholding support and guidance through various channels (as available).",
        "Coverage of a wide range of activities in manufacturing, services and trading sectors.",
      ],
      whoCanApply: [
        "SC/ST and/or women entrepreneurs (as per scheme definition).",
        "New (‘greenfield’) enterprises in manufacturing, services or trading sectors.",
        "Non-individual enterprises where majority stake and controlling shareholding is held by SC/ST or women entrepreneurs.",
      ],
      howToApply: [
        "Visit the Stand-Up India portal and register your application.",
        "Approach a bank branch for support, or use the portal’s handholding agency facilities.",
        "Prepare a business plan/project report and discuss loan requirement with the bank.",
      ],
      documentsRequired: [
        "KYC documents of promoters (Aadhaar, PAN, etc.).",
        "Caste certificate (for SC/ST, where applicable).",
        "Business plan / project report.",
        "Collaterals / security details, if required as per bank policy.",
      ],
      important: [
        "Loan sanction, amount, and terms depend on bank appraisal and policy.",
        "Scheme guidelines may change over time; always refer latest circulars.",
        "Repayment discipline improves access to future credit and banking facilities.",
      ],
      links: [
        {
          label: "Stand-Up India on MyScheme",
          url: "https://www.myscheme.gov.in/schemes/sui",
        },
      ],
    },
  },

  {
    id: "ab-pmjay",
    type: "govt",
    tag: "HEALTH",
    verified: true,
    title: "Ayushman Bharat – PM-JAY",
    desc:
      "Health assurance scheme offering coverage for secondary/tertiary hospitalization to eligible families (benefits as per rules).",
    source: "https://beneficiary.nha.gov.in/",
    details: {
      headline:
        "Government-funded health assurance scheme for eligible families for secondary and tertiary care hospitalization.",
      whatYouGet: [
        "Cashless and paperless access to health services at empanelled hospitals.",
        "Coverage up to a defined amount per eligible family per year for listed procedures (as per current rules).",
        "Covers various medical and surgical procedures; no restriction on family size and age (subject to scheme terms).",
      ],
      whoCanApply: [
        "Eligible families identified as per socio-economic criteria / State guidelines (e.g., SECC data, other lists).",
        "Eligibility can be checked using mobile number, ration card, or other identifiers on the PM-JAY portal.",
      ],
      howToApply: [
        "Eligibility is usually pre-determined; check if your family is covered on the official PM-JAY portal.",
        "If eligible, obtain an e-card from the nearest Common Service Centre (CSC) / empanelled hospital / PM-JAY kiosk.",
        "For treatment, visit empanelled hospitals with your e-card and required documents.",
      ],
      documentsRequired: [
        "Identity proof (Aadhaar, etc.) as accepted under scheme.",
        "Family identification documents (ration card or others as prescribed).",
        "PM-JAY e-card / ID, if already issued.",
      ],
      important: [
        "Scheme coverage, package rates, and eligibility criteria are decided by Government and may change.",
        "Only listed procedures at empanelled hospitals are covered; always confirm eligibility before admission.",
        "For emergencies, contact helpline numbers provided on the official website / e-card.",
      ],
      links: [
        {
          label: "PM-JAY Beneficiary Portal",
          url: "https://beneficiary.nha.gov.in/",
        },
      ],
    },
  },

  // ---------------- BANK / POST OFFICE (Verified) ----------------
  {
    id: "mahila-savings",
    type: "bank",
    tag: "WOMEN",
    verified: true,
    title: "Mahila Samman Savings Certificate",
    desc:
      "Government-backed small savings scheme for women (via post offices/banks as notified) with fixed tenure and interest as per rules.",
    source: "https://www.nsiindia.gov.in/",
    details: {
      headline:
        "Time-bound small savings scheme for women with attractive fixed interest rate for a specified tenure.",
      whatYouGet: [
        "Government-backed savings certificate for a fixed tenor (as per current rules).",
        "Fixed interest rate notified by Government from time to time.",
        "Option to invest up to specified maximum limit per eligible individual (check latest circular).",
      ],
      whoCanApply: [
        "Resident Indian women (and in some cases guardians on behalf of minor girls, as per current rules).",
        "Available through designated post offices and authorised banks.",
      ],
      howToApply: [
        "Visit the nearest designated post office or authorised bank branch.",
        "Ask for Mahila Samman Savings Certificate application form.",
        "Provide KYC, PAN (where applicable), and deposit amount.",
      ],
      documentsRequired: [
        "KYC documents (Aadhaar, PAN, etc.) as required.",
        "Recent photograph (if required).",
        "Cash/cheque/transfer instruction for deposit.",
      ],
      important: [
        "Interest rate, minimum/maximum deposit limits, and tenure are notified by Government and may change for new deposits.",
        "Premature closure rules and interest for such closure are as per scheme guidelines.",
        "Check latest official notification or National Savings Institute website for updated rules.",
      ],
      links: [
        {
          label: "National Savings Institute (Official)",
          url: "https://www.nsiindia.gov.in/",
        },
      ],
    },
  },

  {
    id: "ssy",
    type: "bank",
    tag: "GIRL CHILD",
    verified: true,
    title: "Sukanya Samriddhi Account (SSY)",
    desc:
      "Small savings scheme for a girl child with yearly deposit limit and long-term benefits; available through banks/post offices (as notified).",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89",
    details: {
      headline:
        "Long-term small savings scheme to secure future education/marriage needs of a girl child.",
      whatYouGet: [
        "Attractive interest rate notified by Government for each period.",
        "Tax benefits may be available as per prevailing income tax provisions (check with tax advisor).",
        "Account matures after a defined tenure; partial withdrawals allowed for specified purposes/age (as per rules).",
      ],
      whoCanApply: [
        "Parent/guardian of an eligible girl child (within prescribed age limit, usually up to 10 years at opening; check latest rules).",
        "One account per girl child, up to a specified number of children per family as per scheme rules.",
      ],
      howToApply: [
        "Visit designated post office or authorised bank branch offering SSY.",
        "Fill Sukanya Samriddhi Account opening form for the girl child.",
        "Submit KYC of guardian and proof of age of girl child, along with initial deposit.",
      ],
      documentsRequired: [
        "Birth certificate of the girl child.",
        "KYC documents of guardian (Aadhaar, PAN, etc.).",
        "Photographs of guardian and child (if required).",
      ],
      important: [
        "Minimum and maximum yearly deposit limits apply; interest rate may change for new periods.",
        "Account rules regarding deposits, withdrawals, and closure are as per latest notifications.",
        "Always confirm current rules at the branch or on official small savings website.",
      ],
      links: [
        {
          label: "Official SSY details (NSI India)",
          url: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89",
        },
      ],
    },
  },

  {
    id: "ppf",
    type: "bank",
    tag: "TAX SAVING",
    verified: true,
    title: "Public Provident Fund (PPF)",
    desc:
      "Long-term savings scheme with yearly deposit limits and tax benefits as per rules; available via banks and post offices.",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=169",
    details: {
      headline:
        "Long-term, government-backed savings scheme with tax benefits and attractive risk-free interest.",
      whatYouGet: [
        "Fixed tenure account (usually 15 years) with option for extension (as per rules).",
        "Interest rate decided and notified by Government quarterly.",
        "Potential tax benefits on contribution and interest/maturity under applicable income tax provisions.",
      ],
      whoCanApply: [
        "Resident individuals in India (subject to eligibility rules).",
        "One PPF account per individual (with additional account on behalf of minor child allowed as per rules).",
      ],
      howToApply: [
        "Visit authorised bank branch or post office offering PPF.",
        "Fill in PPF account opening form and complete KYC.",
        "Deposit initial contribution and obtain PPF passbook/statement.",
      ],
      documentsRequired: [
        "KYC documents (Aadhaar, PAN, etc.).",
        "Photograph (if required).",
      ],
      important: [
        "Partial withdrawals and loans against PPF are allowed under specified conditions and years.",
        "Premature closure is restricted and allowed only under specific grounds as notified by Government.",
        "Interest rate and tax provisions can change; always check latest official notification and consult a tax advisor.",
      ],
      links: [
        {
          label: "Official PPF details (NSI India)",
          url: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=169",
        },
      ],
    },
  },

  {
    id: "nsc",
    type: "bank",
    tag: "FIXED INCOME",
    verified: true,
    title: "National Savings Certificate (NSC)",
    desc:
      "Government-backed fixed-income savings bond available through post offices; fixed maturity and interest as notified.",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=91",
    details: {
      headline:
        "Fixed-tenure, government-backed small savings instrument with assured interest.",
      whatYouGet: [
        "One-time investment that grows at a fixed rate of interest over the tenure.",
        "Interest rate notified by Government; interest is typically re-invested and paid at maturity (as per rules).",
        "Possible tax benefits on investment as per prevailing income tax provisions (confirm with advisor).",
      ],
      whoCanApply: [
        "Resident individuals (as per latest eligibility rules).",
        "Available through designated post offices.",
      ],
      howToApply: [
        "Visit the nearest post office offering NSC.",
        "Fill NSC purchase form and provide KYC documents.",
        "Make payment through cash/cheque or from savings account as permitted.",
      ],
      documentsRequired: [
        "KYC documents (Aadhaar, PAN, etc.).",
        "Photograph (if required).",
      ],
      important: [
        "NSC is generally locked-in for the full tenure with limited provisions for premature encashment.",
        "Interest rate is fixed at time of purchase and remains the same for that certificate till maturity.",
        "Tax treatment of earned interest and investment may change; check latest rules.",
      ],
      links: [
        {
          label: "Official NSC details (NSI India)",
          url: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=91",
        },
      ],
    },
  },

  {
    id: "kvp",
    type: "bank",
    tag: "LONG TERM",
    verified: true,
    title: "Kisan Vikas Patra (KVP)",
    desc:
      "Post Office savings certificate where a one-time investment grows over a fixed tenure (returns as per notified rates).",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=56",
    details: {
      headline:
        "Long-term savings certificate where your investment grows at a fixed rate over a specified period.",
      whatYouGet: [
        "Lump sum investment that grows over time; amount approximately doubles over the notified tenure (subject to prevailing rate).",
        "Guaranteed, government-backed returns.",
      ],
      whoCanApply: [
        "Resident individuals (single, joint, or on behalf of minors, as per rules).",
        "Available exclusively at designated post offices.",
      ],
      howToApply: [
        "Visit the nearest post office selling Kisan Vikas Patra.",
        "Fill in KVP application with depositor and nominee details.",
        "Submit KYC and deposit amount.",
      ],
      documentsRequired: [
        "KYC documents (Aadhaar, PAN, etc.).",
        "Photograph (if required).",
      ],
      important: [
        "Premature encashment is restricted and allowed only in certain conditions (e.g., death of holder, court order).",
        "Interest rate and doubling period may be revised for new issues over time.",
        "Tax treatment of interest should be understood clearly from a tax advisor.",
      ],
      links: [
        {
          label: "Official KVP details (NSI India)",
          url: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=56",
        },
      ],
    },
  },

  {
    id: "po-savings",
    type: "bank",
    tag: "POST OFFICE",
    verified: true,
    title: "Post Office Savings Account (SB)",
    desc:
      "Basic savings account offered by India Post with interest and features as per applicable rules.",
    source: "https://www.indiapost.gov.in/",
    details: {
      headline:
        "Simple savings account at the post office for safe deposits and regular savings.",
      whatYouGet: [
        "Interest on savings balance at a rate notified from time to time.",
        "Passbook facility and in many locations, ATM/debit card (as available and per rules).",
        "Can be used for receiving small savings scheme interest, DBT, etc.",
      ],
      whoCanApply: [
        "Individuals (single/joint), minors through guardian, and certain types of accounts as per India Post rules.",
        "Available at designated post offices across India.",
      ],
      howToApply: [
        "Visit a nearby post office branch.",
        "Ask for Savings Bank (SB) account opening form.",
        "Submit KYC documents and initial deposit as per requirement.",
      ],
      documentsRequired: [
        "KYC documents (Aadhaar, PAN, etc.) as required.",
        "Photographs (if required).",
      ],
      important: [
        "Minimum balance requirements, interest rate, and other conditions are as per current India Post rules.",
        "Dormant/inoperative rules may apply if account is not used for a long period.",
        "Always check the latest information at the post office or on the official website.",
      ],
      links: [
        {
          label: "India Post official website",
          url: "https://www.indiapost.gov.in/",
        },
      ],
    },
  },
];

// Small “popular today” list
export const trendingSchemes = [
  { title: "Sukanya Samriddhi Account (SSY)", views: "12.4k people viewed today" },
  { title: "Atal Pension Yojana (APY)", views: "8.1k people viewed today" },
  { title: "PM Jan Dhan Yojana (PMJDY)", views: "5.2k people viewed today" },
];

// Helper to get a scheme by its id
export function getSchemeById(id) {
  return schemes.find((s) => s.id === id);
}