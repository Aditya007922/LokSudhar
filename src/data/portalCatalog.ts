export interface DepartmentInfo {
  id: string;
  name: string;
  nameHi: string;
  nodalOfficer: string;
  nodalOfficerHi: string;
  helpline: string;
  email: string;
  slaDays: number;
  categories: Array<{ en: string; hi: string }>;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'sanitation',
    name: 'Municipal Sanitation & Solid Waste Management',
    nameHi: 'नगर स्वच्छता एवं ठोस अपशिष्ट प्रबंधन विभाग',
    nodalOfficer: 'Chief Sanitation Officer (Civic Circle I)',
    nodalOfficerHi: 'मुख्य स्वच्छता अधिकारी (नागरिक मंडल I)',
    helpline: '1800-11-4401 (Prototype Desk)',
    email: 'sanitation-desk@loksudhar-prototype.org',
    slaDays: 3,
    categories: [
      { en: 'Uncollected Door-to-Door Garbage', hi: 'घर-घर कचरा संग्रहण न होना' },
      { en: 'Overflowing Public Dustbin / Dump Yard', hi: 'सार्वजनिक कूड़ेदान का ओवरफ्लो' },
      { en: 'Street Sweeping Not Conducted', hi: 'सड़क की सफाई न होना' },
      { en: 'Dead Animal Removal Request', hi: 'मृत पशु हटाने का अनुरोध' },
    ],
  },
  {
    id: 'water',
    name: 'Drinking Water Supply & Jal Board',
    nameHi: 'पेयजल आपूर्ति एवं जल बोर्ड विभाग',
    nodalOfficer: 'Executive Engineer (Water Distribution)',
    nodalOfficerHi: 'अधिशासी अभियंता (जल वितरण)',
    helpline: '1800-11-4402 (Prototype Desk)',
    email: 'water-desk@loksudhar-prototype.org',
    slaDays: 2,
    categories: [
      { en: 'No Water Supply / Low Pressure', hi: 'जल आपूर्ति बाधित / कम दबाव' },
      { en: 'Contaminated / Muddy Drinking Water', hi: 'दूषित / मटमैला पेयजल' },
      { en: 'Pipeline Leakage & Water Wastage', hi: 'पाइपलाइन रिसाव एवं जल अपव्यय' },
      { en: 'Handpump / Public Standpost Repair', hi: 'हैंडपंप / सार्वजनिक नल मरम्मत' },
    ],
  },
  {
    id: 'roads',
    name: 'Roads, Footpaths & Public Works (PWD)',
    nameHi: 'सड़क, फुटपाथ एवं लोक निर्माण विभाग (PWD)',
    nodalOfficer: 'Superintending Engineer (Urban Roads)',
    nodalOfficerHi: 'अधीक्षण अभियंता (शहरी सड़कें)',
    helpline: '1800-11-4403 (Prototype Desk)',
    email: 'roads-desk@loksudhar-prototype.org',
    slaDays: 7,
    categories: [
      { en: 'Deep Potholes / Damaged Road Surface', hi: 'गहरे गड्ढे / क्षतिग्रस्त सड़क' },
      { en: 'Broken Footpath / Pedestrian Hazard', hi: 'टूटा फुटपाथ / पैदल यात्री खतरा' },
      { en: 'Unfinished Road Excavation / Debris', hi: 'अधूरी खुदाई / निर्माण मलबा' },
      { en: 'Damaged Speed Breaker / Signage', hi: 'क्षतिग्रस्त स्पीड ब्रेकर / संकेतक' },
    ],
  },
  {
    id: 'electricity',
    name: 'Street Lighting & Civic Electrical Wing',
    nameHi: 'स्ट्रीट लाइट एवं नागरिक विद्युत प्रभाग',
    nodalOfficer: 'Assistant Engineer (Civic Lighting)',
    nodalOfficerHi: 'सहायक अभियंता (नागरिक प्रकाश व्यवस्था)',
    helpline: '1800-11-4404 (Prototype Desk)',
    email: 'lighting-desk@loksudhar-prototype.org',
    slaDays: 2,
    categories: [
      { en: 'Non-Functional Street Lights', hi: 'बंद या खराब स्ट्रीट लाइट' },
      { en: 'Exposed Live Electrical Junction Box', hi: 'खुला विद्युत जंक्शन बॉक्स' },
      { en: 'Tilted / Damaged Electric Pole', hi: 'झुका या क्षतिग्रस्त बिजली का खंभा' },
      { en: 'Daytime Burning of Street Lights', hi: 'दिन में स्ट्रीट लाइट जलते रहना' },
    ],
  },
  {
    id: 'drainage',
    name: 'Sewerage, Storm Water & Drainage',
    nameHi: 'सीवरेज, वर्षा जल एवं नाला प्रबंधन विभाग',
    nodalOfficer: 'Chief Drainage Engineer',
    nodalOfficerHi: 'मुख्य जल निकासी अभियंता',
    helpline: '1800-11-4405 (Prototype Desk)',
    email: 'drainage-desk@loksudhar-prototype.org',
    slaDays: 3,
    categories: [
      { en: 'Blocked / Overflowing Sewer Line', hi: 'अवरुद्ध / ओवरफ्लो सीवर लाइन' },
      { en: 'Missing or Broken Manhole Cover', hi: 'टूटा या गायब मैनहोल ढक्कन' },
      { en: 'Waterlogging After Rain', hi: 'बारिश के बाद जलभराव' },
      { en: 'Open Drain Cleaning & Desilting', hi: 'खुले नाले की सफाई एवं गाद निकासी' },
    ],
  },
  {
    id: 'parks',
    name: 'Horticulture, Public Parks & Civic Spaces',
    nameHi: 'उद्यान, सार्वजनिक पार्क एवं नागरिक स्थल विभाग',
    nodalOfficer: 'Director (Urban Horticulture)',
    nodalOfficerHi: 'निदेशक (शहरी उद्यानिकी)',
    helpline: '1800-11-4406 (Prototype Desk)',
    email: 'parks-desk@loksudhar-prototype.org',
    slaDays: 5,
    categories: [
      { en: 'Fallen Tree Blocking Road / Footpath', hi: 'सड़क या फुटपाथ पर गिरा पेड़' },
      { en: 'Park Maintenance & Broken Benches', hi: 'पार्क रखरखाव एवं टूटी बेंच' },
      { en: 'Unauthorized Encroachment on Civic Space', hi: 'सार्वजनिक स्थल पर अतिक्रमण' },
      { en: 'Mosquito Fogging / Vector Control', hi: 'फॉगिंग एवं मच्छर नियंत्रण अनुरोध' },
    ],
  },
];

export interface StateLocationData {
  state: string;
  stateHi: string;
  districts: Array<{
    district: string;
    cities: string[];
    coords: [number, number];
  }>;
}

export const INDIA_LOCATIONS: StateLocationData[] = [
  {
    state: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    districts: [
      { district: 'Lucknow', cities: ['Lucknow Municipal Corp', 'Gomti Nagar', 'Alambagh', 'Indira Nagar'], coords: [26.8467, 80.9462] },
      { district: 'Varanasi', cities: ['Varanasi Nagar Nigam', 'Lanka', 'Sigra', 'Sarnath'], coords: [25.3176, 82.9739] },
      { district: 'Gautam Buddha Nagar', cities: ['Noida', 'Greater Noida', 'Dadri'], coords: [28.5355, 77.391] },
      { district: 'Kanpur Nagar', cities: ['Kanpur', 'Swaroop Nagar', 'Kakadeo'], coords: [26.4499, 80.3319] },
    ],
  },
  {
    state: 'NCT of Delhi',
    stateHi: 'राष्ट्रीय राजधानी क्षेत्र दिल्ली',
    districts: [
      { district: 'New Delhi', cities: ['Connaught Place', 'Chanakyapuri', 'Vasant Vihar'], coords: [28.6139, 77.209] },
      { district: 'South Delhi', cities: ['Saket', 'Hauz Khas', 'Greater Kailash'], coords: [28.5245, 77.2066] },
      { district: 'East Delhi', cities: ['Mayur Vihar', 'Preet Vihar', 'Laxmi Nagar'], coords: [28.6279, 77.2946] },
    ],
  },
  {
    state: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
    districts: [
      { district: 'Mumbai Suburban', cities: ['Andheri', 'Bandra', 'Borivali', 'Powai'], coords: [19.1136, 72.8697] },
      { district: 'Pune', cities: ['Pune Municipal Corp', 'Kothrud', 'Shivajinagar', 'Pimpri-Chinchwad'], coords: [18.5204, 73.8567] },
      { district: 'Nagpur', cities: ['Nagpur', 'Dharampeth', 'Sitabuldi'], coords: [21.1458, 79.0882] },
    ],
  },
  {
    state: 'Karnataka',
    stateHi: 'कर्नाटक',
    districts: [
      { district: 'Bengaluru Urban', cities: ['Bengaluru Central', 'Indiranagar', 'Jayanagar', 'Whitefield'], coords: [12.9716, 77.5946] },
      { district: 'Mysuru', cities: ['Mysuru', 'Vijayanagar', 'Hebbal'], coords: [12.2958, 76.6394] },
    ],
  },
  {
    state: 'Tamil Nadu',
    stateHi: 'तमिलनाडु',
    districts: [
      { district: 'Chennai', cities: ['Chennai Corp', 'Adyar', 'Anna Nagar', 'T. Nagar'], coords: [13.0827, 80.2707] },
      { district: 'Coimbatore', cities: ['Coimbatore', 'RS Puram', 'Gandhipuram'], coords: [11.0168, 76.9558] },
    ],
  },
  {
    state: 'Rajasthan',
    stateHi: 'राजस्थान',
    districts: [
      { district: 'Jaipur', cities: ['Jaipur Heritage', 'Malviya Nagar', 'Vaishali Nagar'], coords: [26.9124, 75.7873] },
      { district: 'Udaipur', cities: ['Udaipur', 'Fateh Sagar', 'Hiran Magri'], coords: [24.5854, 73.7125] },
    ],
  },
  {
    state: 'Gujarat',
    stateHi: 'गुजरात',
    districts: [
      { district: 'Ahmedabad', cities: ['Ahmedabad', 'Navrangpura', 'Satellite'], coords: [23.0225, 72.5714] },
      { district: 'Surat', cities: ['Surat', 'Adajan', 'Vesu'], coords: [21.1702, 72.8311] },
    ],
  },
  {
    state: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    districts: [
      { district: 'Kolkata', cities: ['Kolkata Municipal Corp', 'Salt Lake', 'Park Street'], coords: [22.5726, 88.3639] },
      { district: 'Howrah', cities: ['Howrah', 'Shibpur'], coords: [22.5958, 88.2636] },
    ],
  },
];

export const PORTAL_FAQS = [
  {
    id: 'faq-1',
    qEn: 'How do I lodge a citizen grievance on the LokSudhar (लोक सुधार) Portal?',
    qHi: 'मैं लोक सुधार (LokSudhar) पोर्टल पर नागरिक शिकायत कैसे दर्ज करूं?',
    aEn: 'Click "Lodge a Grievance" in the navigation bar or homepage. Select your State, District, City, and concerned Department, pin the exact site on the interactive Leaflet map or capture GPS coordinates, upload up to 3 photographs, enter a detailed description, and submit to receive a unique Reference Number (e.g., LKS-2026-100425).',
    aHi: 'नेविगेशन बार या होमपेज में "शिकायत दर्ज करें" पर क्लिक करें। अपना राज्य, जिला, शहर और संबंधित विभाग चुनें, मानचित्र पर स्थान चिह्नित करें या जीपीएस लोकेशन कैप्चर करें, अधिकतम 3 फोटो अपलोड करें, विवरण लिखें और सबमिट करके एक विशिष्ट संदर्भ संख्या (जैसे LKS-2026-100425) प्राप्त करें।',
  },
  {
    id: 'faq-2',
    qEn: 'How can I track the current status and resolution evidence of my complaint?',
    qHi: 'मैं अपनी शिकायत की वर्तमान स्थिति और समाधान साक्ष्य कैसे ट्रैक कर सकता हूं?',
    aEn: 'Navigate to "Track Grievance" and enter your Reference Number. You will see real-time status updates, assigned department and field worker details, the geo-tagged map pin, an audit timeline of every action taken, and completion photographs uploaded by the field team.',
    aHi: '"शिकायत ट्रैक करें" पर जाएं और अपनी संदर्भ संख्या दर्ज करें। वहां आपको वास्तविक समय की स्थिति, आवंटित विभाग व फील्ड अधिकारी का विवरण, मानचित्र स्थान, संपूर्ण कार्रवाई इतिहास और फील्ड टीम द्वारा अपलोड किए गए समाधान फोटो दिखाई देंगे।',
  },
  {
    id: 'faq-3',
    qEn: 'What is the standard Service Level Agreement (SLA) for redressal?',
    qHi: 'शिकायत निवारण की मानक समय सीमा (SLA) क्या है?',
    aEn: 'Water supply and street lighting emergencies carry a 48-hour SLA. Sanitation and sewerage issues are targeted within 3 working days, while road surfacing and public works carry a 7-day target depending on scope.',
    aHi: 'पेयजल आपूर्ति और स्ट्रीट लाइट की आपात शिकायतों की समय सीमा 48 घंटे है। स्वच्छता और सीवरेज संबंधी शिकायतें 3 कार्य दिवसों में तथा सड़क व लोक निर्माण कार्य 7 दिनों के भीतर निस्तारित किए जाते हैं।',
  },
  {
    id: 'faq-4',
    qEn: 'Is LokSudhar (लोक सुधार) officially affiliated with a Government Ministry?',
    qHi: 'क्या लोक सुधार (LokSudhar) किसी सरकारी मंत्रालय से आधिकारिक रूप से संबद्ध है?',
    aEn: 'No. LokSudhar (लोक सुधार) is an independent civic-technology prototype designed to model transparent, accessible citizen grievance redressal workflows inspired by Indian public service portals. Do not submit confidential personal identity documents.',
    aHi: 'नहीं। लोक सुधार (LokSudhar) एक स्वतंत्र नागरिक-तकनीक प्रोटोटाइप है जिसे भारतीय जन सेवा पोर्टलों की कार्यप्रणाली के मॉडल के रूप में बनाया गया है। कृपया गोपनीय पहचान दस्तावेज अपलोड न करें।',
  },
  {
    id: 'faq-5',
    qEn: 'How do department field officers and administrators coordinate updates?',
    qHi: 'विभागीय फील्ड अधिकारी और प्रशासक अपडेट का समन्वय कैसे करते हैं?',
    aEn: 'Authorized Administrators review incoming grievances in the Admin Portal, assign them to the relevant Department and Field Officer, and monitor SLAs. Department Officers view assigned locations on their Department Operations Portal map, update field progress, and upload completion photographs which trigger instant real-time updates.',
    aHi: 'अधिकृत प्रशासक एडमिन पोर्टल में प्राप्त शिकायतों की समीक्षा कर उन्हें संबंधित विभाग और फील्ड अधिकारी को आवंटित करते हैं। विभागीय अधिकारी अपने कार्य पोर्टल के मानचित्र पर स्थान देखकर कार्य प्रगति अपडेट करते हैं और पूर्णता के फोटो अपलोड करते हैं।',
  },
];
