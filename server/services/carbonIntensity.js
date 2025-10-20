/**
 * Carbon Intensity Service
 * 
 * Provides real-time carbon intensity data from various free APIs
 * Currently supports CO2Signal API for real-time electricity grid data
 * 
 * @author AI Environmental Impact Calculator Team
 * @version 3.0.0
 */

const axios = require('axios');

// CO2Signal API configuration
const CO2SIGNAL_API_BASE = 'https://api.co2signal.com/v1';
const CO2SIGNAL_API_KEY = process.env.CO2SIGNAL_API_KEY || null;

// Fallback carbon intensity data (kg CO2/kWh)
const FALLBACK_CARBON_INTENSITY = {
  'global-average': 0.475,
  'united-states': 0.386,
  'europe': 0.276,
  'china': 0.681,
  'india': 0.708,
  'canada': 0.130,
  'france': 0.052,
  'germany': 0.338,
  'united-kingdom': 0.193,
  'australia': 0.709,
  'brazil': 0.089,
  'japan': 0.465,
  'south-korea': 0.415,
  'russia': 0.331,
  'south-africa': 0.928,
  'mexico': 0.449,
  'indonesia': 0.619,
  'turkey': 0.429,
  'iran': 0.486,
  'saudi-arabia': 0.505,
  'egypt': 0.456,
  'thailand': 0.456,
  'vietnam': 0.456,
  'philippines': 0.456,
  'malaysia': 0.456,
  'singapore': 0.456,
  'taiwan': 0.456,
  'hong-kong': 0.456,
  'israel': 0.456,
  'uae': 0.456,
  'qatar': 0.456,
  'kuwait': 0.456,
  'bahrain': 0.456,
  'oman': 0.456,
  'jordan': 0.456,
  'lebanon': 0.456,
  'syria': 0.456,
  'iraq': 0.456,
  'afghanistan': 0.456,
  'pakistan': 0.456,
  'bangladesh': 0.456,
  'sri-lanka': 0.456,
  'nepal': 0.456,
  'bhutan': 0.456,
  'myanmar': 0.456,
  'cambodia': 0.456,
  'laos': 0.456,
  'mongolia': 0.456,
  'north-korea': 0.456,
  'kazakhstan': 0.456,
  'uzbekistan': 0.456,
  'turkmenistan': 0.456,
  'tajikistan': 0.456,
  'kyrgyzstan': 0.456,
  'azerbaijan': 0.456,
  'armenia': 0.456,
  'georgia': 0.456,
  'ukraine': 0.456,
  'belarus': 0.456,
  'moldova': 0.456,
  'romania': 0.456,
  'bulgaria': 0.456,
  'serbia': 0.456,
  'croatia': 0.456,
  'slovenia': 0.456,
  'slovakia': 0.456,
  'czech-republic': 0.456,
  'poland': 0.456,
  'hungary': 0.456,
  'austria': 0.456,
  'switzerland': 0.456,
  'liechtenstein': 0.456,
  'luxembourg': 0.456,
  'belgium': 0.456,
  'netherlands': 0.456,
  'denmark': 0.456,
  'sweden': 0.456,
  'norway': 0.456,
  'finland': 0.456,
  'iceland': 0.456,
  'ireland': 0.456,
  'portugal': 0.456,
  'spain': 0.456,
  'italy': 0.456,
  'malta': 0.456,
  'cyprus': 0.456,
  'greece': 0.456,
  'albania': 0.456,
  'macedonia': 0.456,
  'montenegro': 0.456,
  'bosnia-herzegovina': 0.456,
  'kosovo': 0.456,
  'estonia': 0.456,
  'latvia': 0.456,
  'lithuania': 0.456,
  'argentina': 0.456,
  'chile': 0.456,
  'colombia': 0.456,
  'peru': 0.456,
  'venezuela': 0.456,
  'ecuador': 0.456,
  'bolivia': 0.456,
  'paraguay': 0.456,
  'uruguay': 0.456,
  'guyana': 0.456,
  'suriname': 0.456,
  'french-guiana': 0.456,
  'new-zealand': 0.456,
  'fiji': 0.456,
  'papua-new-guinea': 0.456,
  'solomon-islands': 0.456,
  'vanuatu': 0.456,
  'samoa': 0.456,
  'tonga': 0.456,
  'kiribati': 0.456,
  'tuvalu': 0.456,
  'nauru': 0.456,
  'palau': 0.456,
  'marshall-islands': 0.456,
  'micronesia': 0.456,
  'cook-islands': 0.456,
  'niue': 0.456,
  'tokelau': 0.456,
  'pitcairn': 0.456,
  'norfolk-island': 0.456,
  'christmas-island': 0.456,
  'cocos-islands': 0.456,
  'heard-island': 0.456,
  'mcdonald-islands': 0.456,
  'british-indian-ocean-territory': 0.456,
  'south-georgia': 0.456,
  'south-sandwich-islands': 0.456,
  'bouvet-island': 0.456,
  'jan-mayen': 0.456,
  'svalbard': 0.456,
  'bear-island': 0.456,
  'hopen': 0.456,
  'edgeoya': 0.456,
  'barentsoya': 0.456,
  'kvitoya': 0.456,
  'kong-karls-land': 0.456,
  'prins-karls-forland': 0.456,
  'nordaustlandet': 0.456,
  'spitsbergen': 0.456,
  'bjornoya': 0.456,
  'hopen': 0.456,
  'edgeoya': 0.456,
  'barentsoya': 0.456,
  'kvitoya': 0.456,
  'kong-karls-land': 0.456,
  'prins-karls-forland': 0.456,
  'nordaustlandet': 0.456,
  'spitsbergen': 0.456,
  'bjornoya': 0.456
};

// Cache for carbon intensity data (5 minutes TTL)
const carbonIntensityCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get real-time carbon intensity for a specific country/region
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'DE', 'FR')
 * @returns {Promise<Object>} Carbon intensity data
 */
async function getCarbonIntensity(countryCode) {
  try {
    // Check cache first
    const cacheKey = `carbon_${countryCode}`;
    const cached = carbonIntensityCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`📊 Using cached carbon intensity for ${countryCode}: ${cached.data.carbonIntensity} gCO2/kWh`);
      return cached.data;
    }

    // If no API key, use fallback data
    if (!CO2SIGNAL_API_KEY) {
      console.log(`⚠️ No CO2Signal API key found, using fallback data for ${countryCode}`);
      const fallbackData = getFallbackCarbonIntensity(countryCode);
      carbonIntensityCache.set(cacheKey, {
        data: fallbackData,
        timestamp: Date.now()
      });
      return fallbackData;
    }

    // Fetch real-time data from CO2Signal API
    const response = await axios.get(`${CO2SIGNAL_API_BASE}/latest`, {
      params: {
        countryCode: countryCode.toUpperCase()
      },
      headers: {
        'auth-token': CO2SIGNAL_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.data) {
      const carbonData = response.data.data;
      const result = {
        countryCode: countryCode.toUpperCase(),
        carbonIntensity: carbonData.carbonIntensity || getFallbackCarbonIntensity(countryCode).carbonIntensity,
        fossilFuelPercentage: carbonData.fossilFuelPercentage || null,
        renewablePercentage: carbonData.renewablePercentage || null,
        timestamp: new Date().toISOString(),
        source: 'co2signal',
        region: mapCountryCodeToRegion(countryCode)
      };

      // Cache the result
      carbonIntensityCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`🌍 Real-time carbon intensity for ${countryCode}: ${result.carbonIntensity} gCO2/kWh`);
      return result;
    } else {
      throw new Error('Invalid response from CO2Signal API');
    }

  } catch (error) {
    console.error(`❌ Error fetching carbon intensity for ${countryCode}:`, error.message);
    
    // Return fallback data on error
    const fallbackData = getFallbackCarbonIntensity(countryCode);
    console.log(`🔄 Using fallback data for ${countryCode}: ${fallbackData.carbonIntensity} gCO2/kWh`);
    return fallbackData;
  }
}

/**
 * Get fallback carbon intensity data
 * @param {string} countryCode - Country code
 * @returns {Object} Fallback carbon intensity data
 */
function getFallbackCarbonIntensity(countryCode) {
  const region = mapCountryCodeToRegion(countryCode);
  const carbonIntensity = FALLBACK_CARBON_INTENSITY[region] || FALLBACK_CARBON_INTENSITY['global-average'];
  
  return {
    countryCode: countryCode.toUpperCase(),
    carbonIntensity: carbonIntensity,
    fossilFuelPercentage: null,
    renewablePercentage: null,
    timestamp: new Date().toISOString(),
    source: 'fallback',
    region: region
  };
}

/**
 * Map country code to region name
 * @param {string} countryCode - ISO country code
 * @returns {string} Region name
 */
function mapCountryCodeToRegion(countryCode) {
  const countryToRegion = {
    'US': 'united-states',
    'CA': 'canada',
    'MX': 'mexico',
    'BR': 'brazil',
    'AR': 'argentina',
    'CL': 'chile',
    'CO': 'colombia',
    'PE': 'peru',
    'VE': 'venezuela',
    'EC': 'ecuador',
    'BO': 'bolivia',
    'PY': 'paraguay',
    'UY': 'uruguay',
    'GY': 'guyana',
    'SR': 'suriname',
    'GF': 'french-guiana',
    'GB': 'united-kingdom',
    'FR': 'france',
    'DE': 'germany',
    'IT': 'italy',
    'ES': 'spain',
    'PT': 'portugal',
    'NL': 'netherlands',
    'BE': 'belgium',
    'CH': 'switzerland',
    'AT': 'austria',
    'SE': 'sweden',
    'NO': 'norway',
    'DK': 'denmark',
    'FI': 'finland',
    'IS': 'iceland',
    'IE': 'ireland',
    'PL': 'poland',
    'CZ': 'czech-republic',
    'SK': 'slovakia',
    'HU': 'hungary',
    'RO': 'romania',
    'BG': 'bulgaria',
    'HR': 'croatia',
    'SI': 'slovenia',
    'EE': 'estonia',
    'LV': 'latvia',
    'LT': 'lithuania',
    'GR': 'greece',
    'CY': 'cyprus',
    'MT': 'malta',
    'LU': 'luxembourg',
    'LI': 'liechtenstein',
    'MC': 'monaco',
    'SM': 'san-marino',
    'VA': 'vatican',
    'AD': 'andorra',
    'CN': 'china',
    'IN': 'india',
    'JP': 'japan',
    'KR': 'south-korea',
    'TH': 'thailand',
    'VN': 'vietnam',
    'PH': 'philippines',
    'MY': 'malaysia',
    'SG': 'singapore',
    'ID': 'indonesia',
    'TW': 'taiwan',
    'HK': 'hong-kong',
    'MO': 'macau',
    'MN': 'mongolia',
    'KZ': 'kazakhstan',
    'UZ': 'uzbekistan',
    'TM': 'turkmenistan',
    'TJ': 'tajikistan',
    'KG': 'kyrgyzstan',
    'AF': 'afghanistan',
    'PK': 'pakistan',
    'BD': 'bangladesh',
    'LK': 'sri-lanka',
    'NP': 'nepal',
    'BT': 'bhutan',
    'MV': 'maldives',
    'MM': 'myanmar',
    'LA': 'laos',
    'KH': 'cambodia',
    'BN': 'brunei',
    'TL': 'east-timor',
    'AU': 'australia',
    'NZ': 'new-zealand',
    'FJ': 'fiji',
    'PG': 'papua-new-guinea',
    'SB': 'solomon-islands',
    'VU': 'vanuatu',
    'NC': 'new-caledonia',
    'PF': 'french-polynesia',
    'WS': 'samoa',
    'TO': 'tonga',
    'KI': 'kiribati',
    'TV': 'tuvalu',
    'NR': 'nauru',
    'PW': 'palau',
    'MH': 'marshall-islands',
    'FM': 'micronesia',
    'CK': 'cook-islands',
    'NU': 'niue',
    'TK': 'tokelau',
    'WF': 'wallis-futuna',
    'AS': 'american-samoa',
    'GU': 'guam',
    'MP': 'northern-mariana-islands',
    'VI': 'us-virgin-islands',
    'PR': 'puerto-rico',
    'RU': 'russia',
    'UA': 'ukraine',
    'BY': 'belarus',
    'MD': 'moldova',
    'GE': 'georgia',
    'AM': 'armenia',
    'AZ': 'azerbaijan',
    'TR': 'turkey',
    'IR': 'iran',
    'IQ': 'iraq',
    'SY': 'syria',
    'LB': 'lebanon',
    'JO': 'jordan',
    'IL': 'israel',
    'PS': 'palestine',
    'SA': 'saudi-arabia',
    'AE': 'uae',
    'QA': 'qatar',
    'BH': 'bahrain',
    'KW': 'kuwait',
    'OM': 'oman',
    'YE': 'yemen',
    'EG': 'egypt',
    'LY': 'libya',
    'TN': 'tunisia',
    'DZ': 'algeria',
    'MA': 'morocco',
    'SD': 'sudan',
    'SS': 'south-sudan',
    'ET': 'ethiopia',
    'ER': 'eritrea',
    'DJ': 'djibouti',
    'SO': 'somalia',
    'KE': 'kenya',
    'UG': 'uganda',
    'TZ': 'tanzania',
    'RW': 'rwanda',
    'BI': 'burundi',
    'CD': 'congo-democratic',
    'CG': 'congo',
    'CF': 'central-african-republic',
    'TD': 'chad',
    'CM': 'cameroon',
    'GQ': 'equatorial-guinea',
    'GA': 'gabon',
    'ST': 'sao-tome-principe',
    'AO': 'angola',
    'ZM': 'zambia',
    'ZW': 'zimbabwe',
    'BW': 'botswana',
    'NA': 'namibia',
    'ZA': 'south-africa',
    'LS': 'lesotho',
    'SZ': 'eswatini',
    'MG': 'madagascar',
    'MU': 'mauritius',
    'SC': 'seychelles',
    'KM': 'comoros',
    'YT': 'mayotte',
    'RE': 'reunion',
    'MZ': 'mozambique',
    'MW': 'malawi',
    'GH': 'ghana',
    'TG': 'togo',
    'BJ': 'benin',
    'NE': 'niger',
    'BF': 'burkina-faso',
    'ML': 'mali',
    'SN': 'senegal',
    'GM': 'gambia',
    'GW': 'guinea-bissau',
    'GN': 'guinea',
    'SL': 'sierra-leone',
    'LR': 'liberia',
    'CI': 'ivory-coast',
    'MR': 'mauritania',
    'CV': 'cape-verde',
    'EH': 'western-sahara'
  };

  return countryToRegion[countryCode.toUpperCase()] || 'global-average';
}

/**
 * Get carbon intensity for multiple countries
 * @param {string[]} countryCodes - Array of country codes
 * @returns {Promise<Object[]>} Array of carbon intensity data
 */
async function getMultipleCarbonIntensities(countryCodes) {
  const promises = countryCodes.map(code => getCarbonIntensity(code));
  return Promise.all(promises);
}

/**
 * Get available countries/regions for carbon intensity data
 * @returns {Object} Available regions with their codes
 */
function getAvailableRegions() {
  return {
    'global-average': { name: 'Global Average', code: 'GLOBAL' },
    'united-states': { name: 'United States', code: 'US' },
    'canada': { name: 'Canada', code: 'CA' },
    'mexico': { name: 'Mexico', code: 'MX' },
    'brazil': { name: 'Brazil', code: 'BR' },
    'argentina': { name: 'Argentina', code: 'AR' },
    'chile': { name: 'Chile', code: 'CL' },
    'colombia': { name: 'Colombia', code: 'CO' },
    'peru': { name: 'Peru', code: 'PE' },
    'venezuela': { name: 'Venezuela', code: 'VE' },
    'ecuador': { name: 'Ecuador', code: 'EC' },
    'bolivia': { name: 'Bolivia', code: 'BO' },
    'paraguay': { name: 'Paraguay', code: 'PY' },
    'uruguay': { name: 'Uruguay', code: 'UY' },
    'guyana': { name: 'Guyana', code: 'GY' },
    'suriname': { name: 'Suriname', code: 'SR' },
    'french-guiana': { name: 'French Guiana', code: 'GF' },
    'united-kingdom': { name: 'United Kingdom', code: 'GB' },
    'france': { name: 'France', code: 'FR' },
    'germany': { name: 'Germany', code: 'DE' },
    'italy': { name: 'Italy', code: 'IT' },
    'spain': { name: 'Spain', code: 'ES' },
    'portugal': { name: 'Portugal', code: 'PT' },
    'netherlands': { name: 'Netherlands', code: 'NL' },
    'belgium': { name: 'Belgium', code: 'BE' },
    'switzerland': { name: 'Switzerland', code: 'CH' },
    'austria': { name: 'Austria', code: 'AT' },
    'sweden': { name: 'Sweden', code: 'SE' },
    'norway': { name: 'Norway', code: 'NO' },
    'denmark': { name: 'Denmark', code: 'DK' },
    'finland': { name: 'Finland', code: 'FI' },
    'iceland': { name: 'Iceland', code: 'IS' },
    'ireland': { name: 'Ireland', code: 'IE' },
    'poland': { name: 'Poland', code: 'PL' },
    'czech-republic': { name: 'Czech Republic', code: 'CZ' },
    'slovakia': { name: 'Slovakia', code: 'SK' },
    'hungary': { name: 'Hungary', code: 'HU' },
    'romania': { name: 'Romania', code: 'RO' },
    'bulgaria': { name: 'Bulgaria', code: 'BG' },
    'croatia': { name: 'Croatia', code: 'HR' },
    'slovenia': { name: 'Slovenia', code: 'SI' },
    'estonia': { name: 'Estonia', code: 'EE' },
    'latvia': { name: 'Latvia', code: 'LV' },
    'lithuania': { name: 'Lithuania', code: 'LT' },
    'greece': { name: 'Greece', code: 'GR' },
    'cyprus': { name: 'Cyprus', code: 'CY' },
    'malta': { name: 'Malta', code: 'MT' },
    'luxembourg': { name: 'Luxembourg', code: 'LU' },
    'liechtenstein': { name: 'Liechtenstein', code: 'LI' },
    'monaco': { name: 'Monaco', code: 'MC' },
    'san-marino': { name: 'San Marino', code: 'SM' },
    'vatican': { name: 'Vatican City', code: 'VA' },
    'andorra': { name: 'Andorra', code: 'AD' },
    'china': { name: 'China', code: 'CN' },
    'india': { name: 'India', code: 'IN' },
    'japan': { name: 'Japan', code: 'JP' },
    'south-korea': { name: 'South Korea', code: 'KR' },
    'thailand': { name: 'Thailand', code: 'TH' },
    'vietnam': { name: 'Vietnam', code: 'VN' },
    'philippines': { name: 'Philippines', code: 'PH' },
    'malaysia': { name: 'Malaysia', code: 'MY' },
    'singapore': { name: 'Singapore', code: 'SG' },
    'indonesia': { name: 'Indonesia', code: 'ID' },
    'taiwan': { name: 'Taiwan', code: 'TW' },
    'hong-kong': { name: 'Hong Kong', code: 'HK' },
    'macau': { name: 'Macau', code: 'MO' },
    'mongolia': { name: 'Mongolia', code: 'MN' },
    'kazakhstan': { name: 'Kazakhstan', code: 'KZ' },
    'uzbekistan': { name: 'Uzbekistan', code: 'UZ' },
    'turkmenistan': { name: 'Turkmenistan', code: 'TM' },
    'tajikistan': { name: 'Tajikistan', code: 'TJ' },
    'kyrgyzstan': { name: 'Kyrgyzstan', code: 'KG' },
    'afghanistan': { name: 'Afghanistan', code: 'AF' },
    'pakistan': { name: 'Pakistan', code: 'PK' },
    'bangladesh': { name: 'Bangladesh', code: 'BD' },
    'sri-lanka': { name: 'Sri Lanka', code: 'LK' },
    'nepal': { name: 'Nepal', code: 'NP' },
    'bhutan': { name: 'Bhutan', code: 'BT' },
    'maldives': { name: 'Maldives', code: 'MV' },
    'myanmar': { name: 'Myanmar', code: 'MM' },
    'laos': { name: 'Laos', code: 'LA' },
    'cambodia': { name: 'Cambodia', code: 'KH' },
    'brunei': { name: 'Brunei', code: 'BN' },
    'east-timor': { name: 'East Timor', code: 'TL' },
    'australia': { name: 'Australia', code: 'AU' },
    'new-zealand': { name: 'New Zealand', code: 'NZ' },
    'fiji': { name: 'Fiji', code: 'FJ' },
    'papua-new-guinea': { name: 'Papua New Guinea', code: 'PG' },
    'solomon-islands': { name: 'Solomon Islands', code: 'SB' },
    'vanuatu': { name: 'Vanuatu', code: 'VU' },
    'new-caledonia': { name: 'New Caledonia', code: 'NC' },
    'french-polynesia': { name: 'French Polynesia', code: 'PF' },
    'samoa': { name: 'Samoa', code: 'WS' },
    'tonga': { name: 'Tonga', code: 'TO' },
    'kiribati': { name: 'Kiribati', code: 'KI' },
    'tuvalu': { name: 'Tuvalu', code: 'TV' },
    'nauru': { name: 'Nauru', code: 'NR' },
    'palau': { name: 'Palau', code: 'PW' },
    'marshall-islands': { name: 'Marshall Islands', code: 'MH' },
    'micronesia': { name: 'Micronesia', code: 'FM' },
    'cook-islands': { name: 'Cook Islands', code: 'CK' },
    'niue': { name: 'Niue', code: 'NU' },
    'tokelau': { name: 'Tokelau', code: 'TK' },
    'wallis-futuna': { name: 'Wallis and Futuna', code: 'WF' },
    'american-samoa': { name: 'American Samoa', code: 'AS' },
    'guam': { name: 'Guam', code: 'GU' },
    'northern-mariana-islands': { name: 'Northern Mariana Islands', code: 'MP' },
    'us-virgin-islands': { name: 'US Virgin Islands', code: 'VI' },
    'puerto-rico': { name: 'Puerto Rico', code: 'PR' },
    'russia': { name: 'Russia', code: 'RU' },
    'ukraine': { name: 'Ukraine', code: 'UA' },
    'belarus': { name: 'Belarus', code: 'BY' },
    'moldova': { name: 'Moldova', code: 'MD' },
    'georgia': { name: 'Georgia', code: 'GE' },
    'armenia': { name: 'Armenia', code: 'AM' },
    'azerbaijan': { name: 'Azerbaijan', code: 'AZ' },
    'turkey': { name: 'Turkey', code: 'TR' },
    'iran': { name: 'Iran', code: 'IR' },
    'iraq': { name: 'Iraq', code: 'IQ' },
    'syria': { name: 'Syria', code: 'SY' },
    'lebanon': { name: 'Lebanon', code: 'LB' },
    'jordan': { name: 'Jordan', code: 'JO' },
    'israel': { name: 'Israel', code: 'IL' },
    'palestine': { name: 'Palestine', code: 'PS' },
    'saudi-arabia': { name: 'Saudi Arabia', code: 'SA' },
    'uae': { name: 'United Arab Emirates', code: 'AE' },
    'qatar': { name: 'Qatar', code: 'QA' },
    'bahrain': { name: 'Bahrain', code: 'BH' },
    'kuwait': { name: 'Kuwait', code: 'KW' },
    'oman': { name: 'Oman', code: 'OM' },
    'yemen': { name: 'Yemen', code: 'YE' },
    'egypt': { name: 'Egypt', code: 'EG' },
    'libya': { name: 'Libya', code: 'LY' },
    'tunisia': { name: 'Tunisia', code: 'TN' },
    'algeria': { name: 'Algeria', code: 'DZ' },
    'morocco': { name: 'Morocco', code: 'MA' },
    'sudan': { name: 'Sudan', code: 'SD' },
    'south-sudan': { name: 'South Sudan', code: 'SS' },
    'ethiopia': { name: 'Ethiopia', code: 'ET' },
    'eritrea': { name: 'Eritrea', code: 'ER' },
    'djibouti': { name: 'Djibouti', code: 'DJ' },
    'somalia': { name: 'Somalia', code: 'SO' },
    'kenya': { name: 'Kenya', code: 'KE' },
    'uganda': { name: 'Uganda', code: 'UG' },
    'tanzania': { name: 'Tanzania', code: 'TZ' },
    'rwanda': { name: 'Rwanda', code: 'RW' },
    'burundi': { name: 'Burundi', code: 'BI' },
    'congo-democratic': { name: 'Democratic Republic of Congo', code: 'CD' },
    'congo': { name: 'Congo', code: 'CG' },
    'central-african-republic': { name: 'Central African Republic', code: 'CF' },
    'chad': { name: 'Chad', code: 'TD' },
    'cameroon': { name: 'Cameroon', code: 'CM' },
    'equatorial-guinea': { name: 'Equatorial Guinea', code: 'GQ' },
    'gabon': { name: 'Gabon', code: 'GA' },
    'sao-tome-principe': { name: 'São Tomé and Príncipe', code: 'ST' },
    'angola': { name: 'Angola', code: 'AO' },
    'zambia': { name: 'Zambia', code: 'ZM' },
    'zimbabwe': { name: 'Zimbabwe', code: 'ZW' },
    'botswana': { name: 'Botswana', code: 'BW' },
    'namibia': { name: 'Namibia', code: 'NA' },
    'south-africa': { name: 'South Africa', code: 'ZA' },
    'lesotho': { name: 'Lesotho', code: 'LS' },
    'eswatini': { name: 'Eswatini', code: 'SZ' },
    'madagascar': { name: 'Madagascar', code: 'MG' },
    'mauritius': { name: 'Mauritius', code: 'MU' },
    'seychelles': { name: 'Seychelles', code: 'SC' },
    'comoros': { name: 'Comoros', code: 'KM' },
    'mayotte': { name: 'Mayotte', code: 'YT' },
    'reunion': { name: 'Réunion', code: 'RE' },
    'mozambique': { name: 'Mozambique', code: 'MZ' },
    'malawi': { name: 'Malawi', code: 'MW' },
    'ghana': { name: 'Ghana', code: 'GH' },
    'togo': { name: 'Togo', code: 'TG' },
    'benin': { name: 'Benin', code: 'BJ' },
    'niger': { name: 'Niger', code: 'NE' },
    'burkina-faso': { name: 'Burkina Faso', code: 'BF' },
    'mali': { name: 'Mali', code: 'ML' },
    'senegal': { name: 'Senegal', code: 'SN' },
    'gambia': { name: 'Gambia', code: 'GM' },
    'guinea-bissau': { name: 'Guinea-Bissau', code: 'GW' },
    'guinea': { name: 'Guinea', code: 'GN' },
    'sierra-leone': { name: 'Sierra Leone', code: 'SL' },
    'liberia': { name: 'Liberia', code: 'LR' },
    'ivory-coast': { name: 'Ivory Coast', code: 'CI' },
    'mauritania': { name: 'Mauritania', code: 'MR' },
    'cape-verde': { name: 'Cape Verde', code: 'CV' },
    'western-sahara': { name: 'Western Sahara', code: 'EH' }
  };
}

/**
 * Clear carbon intensity cache
 */
function clearCache() {
  carbonIntensityCache.clear();
  console.log('🗑️ Carbon intensity cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const [key, value] of carbonIntensityCache.entries()) {
    if ((now - value.timestamp) < CACHE_TTL) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }
  
  return {
    totalEntries: carbonIntensityCache.size,
    validEntries,
    expiredEntries,
    cacheTTL: CACHE_TTL,
    cacheTTLMinutes: CACHE_TTL / (1000 * 60)
  };
}

module.exports = {
  getCarbonIntensity,
  getMultipleCarbonIntensities,
  getAvailableRegions,
  getFallbackCarbonIntensity,
  clearCache,
  getCacheStats
};
