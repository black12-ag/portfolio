// Master Translation Keys for Complete Multi-Language Support
// This file contains all translation keys used across the entire application

export interface MasterTranslations {
  // ===== NAVIGATION & HEADER =====
  nav: {
    home: string;
    properties: string;
    hotels: string;
    experiences: string;
    becomeHost: string;
    help: string;
    signIn: string;
    signUp: string;
    profile: string;
    dashboard: string;
    settings: string;
    logout: string;
    language: string;
    currency: string;
    menu: string;
    close: string;
  };

  // ===== NAVIGATION ACTIONS =====
  navigation: {
    back: string;
    returnToHome: string;
    nextPage: string;
    previousPage: string;
    goToTop: string;
  };

  // ===== HOMEPAGE =====
  home: {
    title: string;
    subtitle: string;
    description: string;
    searchPlaceholder: string;
    findHotels: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    rooms: string;
    search: string;
    topHotels: string;
    topAreas: string;
    featuredDestinations: string;
    whyChooseUs: string;
    bookings: string;
    countries: string;
    languages: string;
    support: string;
    popularDestinations: string;
    discoverHotels: string;
    readyToExplore: string;
  };

  // ===== HOTEL DETAIL =====
  hotel: {
    notFound: string;
    notFoundDescription: string;
    amenities: string;
    description: string;
    reviews: string;
    location: string;
    policies: string;
    roomTypes: string;
    availability: string;
    bookNow: string;
    reserve: string;
    checkAvailability: string;
    contactHost: string;
    messageHost: string;
    addToWishlist: string;
    removeFromWishlist: string;
    shareProperty: string;
    viewPhotos: string;
    virtualTour: string;
    showOnMap: string;
    hostAndContact: string;
    propertyInquiry: string;
    verified: string;
    superhost: string;
    description: string;
    reviewsCount: string;
    reviewsText: string;
    overallRating: string;
    roomSelected: string;
    roomSelectedDescription: string;
    datesSelected: string;
    datesSelectedDescription: string;
    bookingComplete: string;
    bookingCompleteDescription: string;
    yourBooking: string;
    hasBeenConfirmed: string;
    experienceComfort: string;
    locatedInHeart: string;
    modernAmenities: string;
    defaultDescription: string;
  };

  // ===== REVIEWS =====
  reviews: {
    title: string;
    overallRating: string;
    totalReviews: string;
    writeReview: string;
    readAllReviews: string;
    sortBy: string;
    filterBy: string;
    mostRecent: string;
    mostHelpful: string;
    highestRating: string;
    lowestRating: string;
    allCategories: string;
    cleanliness: string;
    service: string;
    location: string;
    value: string;
    overall: string;
    verified: string;
    helpful: string;
    notHelpful: string;
    reply: string;
    report: string;
    writeYourReview: string;
    yourRating: string;
    yourComment: string;
    selectCategory: string;
    submitReview: string;
    cancel: string;
    signInToReview: string;
    reviewSubmitted: string;
    reviewSubmittedDescription: string;
    thankYouForReview: string;
    ratingBreakdown: string;
    excellent: string;
    good: string;
    average: string;
    poor: string;
    terrible: string;
    business: string;
    leisure: string;
    family: string;
    stayType: string;
    verifiedStay: string;
    recommendedBy: string;
    guestsFoundHelpful: string;
  };

  // ===== ROOMS =====
  rooms: {
    availableRoomTypes: string;
    standardRoom: string;
    instantBook: string;
    selectRoom: string;
    viewDetails: string;
    maxGuests: string;
    bedConfiguration: string;
    roomSize: string;
    amenities: string;
    features: string;
    pricePerNight: string;
    available: string;
    freeCancellation: string;
    breakfastIncluded: string;
  };

  // ===== CONTACT =====
  contact: {
    title: string;
    chatSupport: string;
    phone: string;
    email: string;
    website: string;
  };

  // ===== SEARCH & FILTERS =====
  search: {
    filters: string;
    sortBy: string;
    priceRange: string;
    starRating: string;
    propertyType: string;
    amenities: string;
    location: string;
    nearMe: string;
    allAreas: string;
    adults: string;
    children: string;
    found: string;
    noResults: string;
    showMore: string;
    showLess: string;
    clearAll: string;
    apply: string;
    cancel: string;
    loading: string;
  };

  // ===== PROPERTY DETAIL =====
  property: {
    details: string;
    overview: string;
    amenities: string;
    rooms: string;
    location: string;
    reviews: string;
    policies: string;
    availability: string;
    photos: string;
    virtualTour: string;
    bookNow: string;
    checkAvailability: string;
    selectRoom: string;
    addToWishlist: string;
    removeFromWishlist: string;
    share: string;
    contactHost: string;
    messageHost: string;
    viewOnMap: string;
    getDirections: string;
    nearbyPlaces: string;
    checkInOut: string;
    cancellationPolicy: string;
    houseRules: string;
    importantInfo: string;
    verified: string;
    superhost: string;
    instantBook: string;
    totalPrice: string;
    perNight: string;
    taxes: string;
    fees: string;
    subtotal: string;
    propertiesAndHotels: string;
    properties: string;
    hotels: string;
    for: string;
    guest: string;
    guests: string;
    found: string;
    foundResults: string;
    error: string;
    errorDescription: string;
    resultsFound: string;
    allProperties: string;
    verifiedOnly: string;
    superhostOnly: string;
    bestMatches: string;
    noResults: string;
  };

  // ===== AUTHENTICATION =====
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    pleaseSignIn: string;
    signInToBook: string;
    welcome: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    newPassword: string;
    confirmPassword: string;
  };

  // ===== BOOKING FLOW =====
  booking: {
    bookingDetails: string;
    guestInfo: string;
    payment: string;
    confirmation: string;
    whosComing: string;
    specialRequests: string;
    paymentMethod: string;
    creditCard: string;
    paypal: string;
    applePay: string;
    bookingConfirmed: string;
    bookingFailed: string;
    bookingId: string;
    checkInDate: string;
    checkOutDate: string;
    totalNights: string;
    totalGuests: string;
    confirmAndPay: string;
    processing: string;
    completed: string;
    cancelled: string;
    pending: string;
    modify: string;
    cancel: string;
    download: string;
    receipt: string;
    selectDates: string;
    selectDatesDescription: string;
    guests: string;
    addDates: string;
    bookInstantly: string;
    reserveNow: string;
    noChargeYet: string;
  };

  // ===== CHECKOUT =====
  checkout: {
    guestDetails: string;
    payment: string;
    reviewAndBook: string;
    noBookingData: string;
    noBookingDataDescription: string;
    fillRequiredFields: string;
    guestInfoRequired: string;
    selectPaymentMethod: string;
    paymentMethodRequired: string;
    agreeToTerms: string;
    mustAgreeToTerms: string;
    bookingFailed: string;
    bookingFailedDescription: string;
    invalidPromoCode: string;
    invalidPromoCodeDescription: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests: string;
    enterFirstName: string;
    enterLastName: string;
    enterEmail: string;
    enterPhone: string;
    specialRequestsPlaceholder: string;
    enterPromoCode: string;
    applied: string;
    apply: string;
    completeBooking: string;
    nextStep: string;
  };

  // ===== PAYMENT =====
  payment: {
    processing: string;
    complete: string;
    failed: string;
    method: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    billingAddress: string;
    paymentProcessing: string;
    completePayment: string;
    securePayment: string;
    paypalPayment: string;
    applePayPayment: string;
    bankTransfer: string;
  };

  // ===== PROPERTY DETAIL =====
  property: {
    notFound: string;
    hostContact: string;
    messageHost: string;
    bookNow: string;
    checkAvailability: string;
    guestReviews: string;
    amenities: string;
    houseRules: string;
    cancellationPolicy: string;
    location: string;
    nearbyPlaces: string;
    hosted: string;
    by: string;
  };

  // ===== BOOKING CONFIRMATION =====
  confirmation: {
    bookingConfirmed: string;
    thankYou: string;
    bookingDetails: string;
    downloadReceipt: string;
    emailSent: string;
    bookingReference: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    totalAmount: string;
    contactProperty: string;
    needHelp: string;
    modifyBooking: string;
    cancelBooking: string;
  };

  // ===== MY BOOKINGS =====
  bookings: {
    title: string;
    myBookings: string;
    noBookings: string;
    noBookingsDescription: string;
    upcoming: string;
    past: string;
    cancelled: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    status: string;
    confirmed: string;
    pending: string;
    cancelled: string;
    viewDetails: string;
    modify: string;
    cancel: string;
  };

  // ===== WISHLIST =====
  wishlist: {
    title: string;
    myWishlist: string;
    saved: string;
    noItems: string;
    noItemsDescription: string;
    addToWishlist: string;
    removeFromWishlist: string;
    viewProperty: string;
    book: string;
    signInRequired: string;
    removedFromWishlist: string;
    removedDescription: string;
    addedToWishlist: string;
    addedDescription: string;
  };

  // ===== PROFILE =====
  profile: {
    title: string;
    myProfile: string;
    personalInfo: string;
    accountSettings: string;
    preferences: string;
    privacy: string;
    notifications: string;
    payments: string;
    security: string;
    helpCenter: string;
    signOut: string;
    editProfile: string;
    saveChanges: string;
    cancel: string;
  };

  // ===== STAFF PORTAL =====
  staff: {
    portal: string;
    dashboard: string;
    manager: string;
    reception: string;
    housekeeping: string;
    maintenance: string;
    kitchen: string;
    security: string;
    quickActions: string;
    todaySummary: string;
    tasksCompleted: string;
    urgentItems: string;
    staffOnDuty: string;
    notifications: string;
    emergency: string;
    callSecurity: string;
    emergencyChat: string;
    approveRequests: string;
    staffOverview: string;
    reports: string;
    roomAssignments: string;
    cleaningStatus: string;
    supplies: string;
    lostFound: string;
    workOrders: string;
    equipmentStatus: string;
    preventiveTasks: string;
    inventory: string;
    activeOrders: string;
    menuPlanning: string;
    staffSchedule: string;
    incidentReports: string;
    accessControl: string;
    cctvMonitoring: string;
    patrolSchedule: string;
  };

  // ===== RECEPTION =====
  reception: {
    dashboard: string;
    checkInToday: string;
    checkOutToday: string;
    guestsInHouse: string;
    availableRooms: string;
    pendingPayments: string;
    maintenanceRequests: string;
    cleaningInProgress: string;
    upcomingCheckIns: string;
    totalRevenue: string;
    occupancyRate: string;
    guestManagement: string;
    roomManagement: string;
    calendarView: string;
    paymentProcessing: string;
    quickCheckIn: string;
    newBooking: string;
    alerts: string;
    recentActivities: string;
    performanceMetrics: string;
  };

  // ===== ADMIN PANEL =====
  admin: {
    dashboard: string;
    userManagement: string;
    propertyManagement: string;
    bookingManagement: string;
    contentManagement: string;
    systemSettings: string;
    analytics: string;
    reports: string;
    agentManagement: string;
    supportConsole: string;
    localizationSettings: string;
    contactsSettings: string;
    policiesEditor: string;
    generalSettings: string;
    customerServicePortal: string;
    auditLogs: string;
    backupRestore: string;
    securitySettings: string;
    integrations: string;
    apiManagement: string;
  };

  // ===== PROFILE & ACCOUNT =====
  profile: {
    myProfile: string;
    personalInfo: string;
    accountSettings: string;
    bookings: string;
    wishlist: string;
    reviews: string;
    payments: string;
    notifications: string;
    security: string;
    privacy: string;
    verification: string;
    loyaltyProgram: string;
    referrals: string;
    documents: string;
    travelers: string;
    savedSearches: string;
    alerts: string;
    invoices: string;
    tickets: string;
    wallet: string;
    coupons: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    dateOfBirth: string;
    gender: string;
    emergencyContact: string;
    profilePicture: string;
    changePassword: string;
    twoFactorAuth: string;
    loginHistory: string;
    deleteAccount: string;
  };

  // ===== CUSTOMER SERVICE =====
  customerService: {
    helpCenter: string;
    contactUs: string;
    liveChat: string;
    submitTicket: string;
    faq: string;
    safetyInfo: string;
    reportIssue: string;
    accessibility: string;
    cancellationOptions: string;
    supportAgent: string;
    ticketNumber: string;
    priority: string;
    status: string;
    category: string;
    subject: string;
    description: string;
    attachments: string;
    responses: string;
    resolved: string;
    escalate: string;
    chatHistory: string;
    satisfaction: string;
    feedback: string;
    rating: string;
    helpful: string;
    notHelpful: string;
  };

  // ===== COMMON ACTIONS =====
  actions: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    remove: string;
    update: string;
    create: string;
    view: string;
    download: string;
    upload: string;
    share: string;
    copy: string;
    print: string;
    export: string;
    import: string;
    refresh: string;
    reload: string;
    reset: string;
    clear: string;
    submit: string;
    continue: string;
    back: string;
    next: string;
    previous: string;
    finish: string;
    confirm: string;
    approve: string;
    reject: string;
    pending: string;
    processing: string;
    completed: string;
    failed: string;
    retry: string;
    undo: string;
    redo: string;
  };

  // ===== COMMON TERMS =====
  common: {
    yes: string;
    no: string;
    ok: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    required: string;
    optional: string;
    available: string;
    unavailable: string;
    online: string;
    offline: string;
    active: string;
    inactive: string;
    enabled: string;
    disabled: string;
    public: string;
    private: string;
    draft: string;
    published: string;
    archived: string;
    new: string;
    recent: string;
    popular: string;
    featured: string;
    recommended: string;
    trending: string;
    top: string;
    best: string;
    all: string;
    none: string;
    other: string;
    total: string;
    subtotal: string;
    discount: string;
    tax: string;
    fee: string;
    price: string;
    cost: string;
    free: string;
    paid: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    thisMonth: string;
    thisYear: string;
    lastWeek: string;
    lastMonth: string;
    lastYear: string;
    minute: string;
    minutes: string;
    hour: string;
    hours: string;
    day: string;
    days: string;
    week: string;
    weeks: string;
    month: string;
    months: string;
    year: string;
    years: string;
    ago: string;
    from: string;
    to: string;
    at: string;
    by: string;
    in: string;
    on: string;
    with: string;
    without: string;
    and: string;
    or: string;
    of: string;
    for: string;
    about: string;
    more: string;
    less: string;
    most: string;
    least: string;
    first: string;
    last: string;
    early: string;
    late: string;
    high: string;
    low: string;
    fast: string;
    slow: string;
    easy: string;
    hard: string;
    good: string;
    bad: string;
    excellent: string;
    poor: string;
    average: string;
  };

  // ===== MESSAGES & NOTIFICATIONS =====
  messages: {
    welcome: string;
    goodbye: string;
    thankyou: string;
    sorry: string;
    congratulations: string;
    warning: string;
    error: string;
    success: string;
    info: string;
    confirmation: string;
    saved: string;
    deleted: string;
    updated: string;
    created: string;
    failed: string;
    tryAgain: string;
    sessionExpired: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    networkError: string;
    validationError: string;
    requiredField: string;
    invalidFormat: string;
    passwordMismatch: string;
    emailExists: string;
    weakPassword: string;
    strongPassword: string;
    loginSuccess: string;
    loginFailed: string;
    logoutSuccess: string;
    signupSuccess: string;
    signupFailed: string;
    profileUpdated: string;
    bookingConfirmed: string;
    bookingCancelled: string;
    paymentSuccess: string;
    paymentFailed: string;
    emailSent: string;
    emailFailed: string;
    uploadSuccess: string;
    uploadFailed: string;
    connectionLost: string;
    connectionRestored: string;
    newMessage: string;
    newNotification: string;
    systemMaintenance: string;
    updateAvailable: string;
    featureUnavailable: string;
    comingSoon: string;
  };

  // ===== FORMS & VALIDATION =====
  forms: {
    validation: {
      required: string;
      invalid: string;
      tooShort: string;
      tooLong: string;
      mustMatch: string;
      mustBeNumber: string;
      mustBeEmail: string;
      mustBePhone: string;
      mustBeUrl: string;
      mustBeDate: string;
      futureDate: string;
      pastDate: string;
      minimumAge: string;
      maximumAge: string;
      minimumLength: string;
      maximumLength: string;
      specialCharacters: string;
      onlyLetters: string;
      onlyNumbers: string;
      noSpaces: string;
      fileSize: string;
      fileType: string;
      imageSize: string;
      videoLength: string;
    };
    placeholders: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
      fullName: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      zipCode: string;
      search: string;
      message: string;
      comment: string;
      feedback: string;
      notes: string;
      description: string;
      title: string;
      url: string;
      date: string;
      time: string;
      amount: string;
      quantity: string;
      choose: string;
      select: string;
      upload: string;
      browse: string;
    };
  };

  // ===== FOOTER =====
  footer: {
    about: string;
    company: string;
    careers: string;
    press: string;
    investors: string;
    blog: string;
    community: string;
    support: string;
    hostResources: string;
    communityForum: string;
    hostingResponsibly: string;
    associates: string;
    destinations: string;
    europe: string;
    asia: string;
    northAmerica: string;
    southAmerica: string;
    africa: string;
    oceania: string;
    giftCards: string;
    stayUpdated: string;
    newsletter: string;
    enterEmail: string;
    subscribe: string;
    contactUs: string;
    downloadApp: string;
    appStore: string;
    googlePlay: string;
    languagesCurrency: string;
    followUs: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    sitemap: string;
  };
}

// English base translations
export const enTranslations: MasterTranslations = {
  nav: {
    home: 'Home',
    properties: 'Properties',
    hotels: 'Hotels',
    experiences: 'Experiences',
    becomeHost: 'Become a Host',
    help: 'Help',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    profile: 'Profile',
    dashboard: 'Dashboard',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
    currency: 'Currency',
    menu: 'Menu',
    close: 'Close',
  },
  navigation: {
    back: 'Back',
    returnToHome: 'Return to Home',
    nextPage: 'Next Page',
    previousPage: 'Previous Page',
    goToTop: 'Go to Top',
  },
  home: {
    title: 'Find Your Perfect Stay',
    subtitle: 'Discover amazing places to stay around the world',
    description: 'Your gateway to extraordinary experiences. Discover, book, and create unforgettable memories with trusted accommodations worldwide.',
    searchPlaceholder: 'Where are you going?',
    findHotels: 'Find Hotels',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    rooms: 'Rooms',
    search: 'Search',
    topHotels: 'Top Hotels',
    topAreas: 'Top Areas',
    featuredDestinations: 'Featured Destinations',
    whyChooseUs: 'Why Choose Us',
    bookings: 'Bookings',
    countries: 'Countries',
    languages: 'Languages',
    support: '24/7 Support',
    popularDestinations: 'Popular destinations',
    discoverHotels: 'Discover the best hotels across Addis Ababa\'s prime locations',
    readyToExplore: '🏨 Ready to explore amazing places?',
  },
  hotel: {
    notFound: 'Hotel Not Found',
    notFoundDescription: "The hotel you're looking for doesn't exist or has been removed.",
    amenities: 'Amenities',
    description: 'Description',
    reviews: 'Reviews',
    location: 'Location',
    policies: 'Policies',
    roomTypes: 'Room Types',
    availability: 'Availability',
    bookNow: 'Book Now',
    reserve: 'Reserve',
    checkAvailability: 'Check Availability',
    contactHost: 'Contact Host',
    messageHost: 'Message Host',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    shareProperty: 'Share Property',
    viewPhotos: 'View Photos',
    virtualTour: 'Virtual Tour',
    showOnMap: 'Show on Map',
    hostAndContact: 'Host & Contact',
    propertyInquiry: 'Property Inquiry',
    verified: 'Verified',
    superhost: 'Superhost',
    reviewsCount: 'reviews',
    reviewsText: 'Reviews',
    overallRating: 'Overall Rating',
    roomSelected: 'Room Selected! 🏨',
    roomSelectedDescription: 'selected',
    datesSelected: 'Dates Selected! 📅',
    datesSelectedDescription: 'Selected dates',
    bookingComplete: 'Booking Complete! 🎉',
    bookingCompleteDescription: 'has been confirmed',
    yourBooking: 'Your booking',
    hasBeenConfirmed: 'has been confirmed.',
    experienceComfort: 'Experience comfort and luxury at',
    locatedInHeart: 'Located in the heart of',
    modernAmenities: 'this property offers modern amenities and exceptional service for both business and leisure travelers.',
    defaultDescription: 'A wonderful place to stay with excellent service and amenities.',
  },
  reviews: {
    title: 'Reviews',
    overallRating: 'Overall Rating',
    totalReviews: 'Total Reviews',
    writeReview: 'Write a Review',
    readAllReviews: 'Read All Reviews',
    sortBy: 'Sort by',
    filterBy: 'Filter by',
    mostRecent: 'Most Recent',
    mostHelpful: 'Most Helpful',
    highestRating: 'Highest Rating',
    lowestRating: 'Lowest Rating',
    allCategories: 'All Categories',
    cleanliness: 'Cleanliness',
    service: 'Service',
    location: 'Location',
    value: 'Value',
    overall: 'Overall',
    verified: 'Verified',
    helpful: 'Helpful',
    notHelpful: 'Not Helpful',
    reply: 'Reply',
    report: 'Report',
    writeYourReview: 'Write Your Review',
    yourRating: 'Your Rating',
    yourComment: 'Your Comment',
    selectCategory: 'Select Category',
    submitReview: 'Submit Review',
    cancel: 'Cancel',
    signInToReview: 'Please sign in to write a review',
    reviewSubmitted: 'Review Submitted',
    reviewSubmittedDescription: 'Thank you for your feedback!',
    thankYouForReview: 'Thank you for your review!',
    ratingBreakdown: 'Rating Breakdown',
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
    terrible: 'Terrible',
    business: 'Business',
    leisure: 'Leisure',
    family: 'Family',
    stayType: 'Stay Type',
    verifiedStay: 'Verified Stay',
    recommendedBy: 'Recommended by',
    guestsFoundHelpful: 'guests found this helpful',
  },
  rooms: {
    availableRoomTypes: 'Available Room Types',
    standardRoom: 'Standard Room',
    instantBook: 'Instant Book',
    selectRoom: 'Select Room',
    viewDetails: 'View Details',
    maxGuests: 'Max Guests',
    bedConfiguration: 'Bed Configuration',
    roomSize: 'Room Size',
    amenities: 'Amenities',
    features: 'Features',
    pricePerNight: 'per night',
    available: 'available',
    freeCancellation: 'Free cancellation',
    breakfastIncluded: 'Breakfast included',
  },
  contact: {
    title: 'Contact',
    chatSupport: 'Chat support',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
  },
  search: {
    filters: 'Filters',
    sortBy: 'Sort By',
    priceRange: 'Price Range',
    starRating: 'Star Rating',
    propertyType: 'Property Type',
    amenities: 'Amenities',
    location: 'Location',
    nearMe: 'Near Me',
    allAreas: 'All Areas',
    adults: 'Adults',
    children: 'Children',
    found: 'Found',
    noResults: 'No results found',
    showMore: 'Show More',
    showLess: 'Show Less',
    clearAll: 'Clear All',
    apply: 'Apply',
    cancel: 'Cancel',
    loading: 'Loading...',
  },
  property: {
    details: 'Details',
    overview: 'Overview',
    amenities: 'Amenities',
    rooms: 'Rooms',
    location: 'Location',
    reviews: 'Reviews',
    policies: 'Policies',
    availability: 'Availability',
    photos: 'Photos',
    virtualTour: 'Virtual Tour',
    bookNow: 'Book Now',
    checkAvailability: 'Check Availability',
    selectRoom: 'Select Room',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    share: 'Share',
    contactHost: 'Contact Host',
    messageHost: 'Message Host',
    viewOnMap: 'View on Map',
    getDirections: 'Get Directions',
    nearbyPlaces: 'Nearby Places',
    checkInOut: 'Check-in / Check-out',
    cancellationPolicy: 'Cancellation Policy',
    houseRules: 'House Rules',
    importantInfo: 'Important Information',
    verified: 'Verified',
    superhost: 'Superhost',
    instantBook: 'Instant Book',
    totalPrice: 'Total Price',
    perNight: 'per night',
    taxes: 'Taxes',
    fees: 'Fees',
    subtotal: 'Subtotal',
    propertiesAndHotels: 'Properties & Hotels',
    properties: 'Properties',
    hotels: 'Hotels',
    for: 'for',
    guest: 'guest',
    guests: 'guests',
    found: 'Found',
    in: 'in',
    error: 'Search Error',
    errorDescription: 'Something went wrong. Please try again.',
    resultsFound: 'results found',
    allProperties: 'All Properties',
    verifiedOnly: 'Verified Only',
    superhostOnly: 'Superhost Only',
    bestMatches: 'Here are the best matches for your search criteria',
    noResults: '🔍 No results found for your search criteria',
  },
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    pleaseSignIn: 'Please sign in',
    signInToBook: 'Sign in to complete your booking.',
    welcome: 'Welcome',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
  },
  booking: {
    bookingDetails: 'Booking Details',
    guestInfo: 'Guest Information',
    payment: 'Payment',
    confirmation: 'Confirmation',
    whosComing: "Who's Coming?",
    specialRequests: 'Special Requests',
    paymentMethod: 'Payment Method',
    creditCard: 'Credit Card',
    paypal: 'PayPal',
    applePay: 'Apple Pay',
    bookingConfirmed: 'Booking Confirmed',
    bookingFailed: 'Booking Failed',
    bookingId: 'Booking ID',
    checkInDate: 'Check-in Date',
    checkOutDate: 'Check-out Date',
    totalNights: 'Total Nights',
    totalGuests: 'Total Guests',
    confirmAndPay: 'Confirm and Pay',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    modify: 'Modify',
    cancel: 'Cancel',
    download: 'Download',
    receipt: 'Receipt',
    selectDates: 'Select dates',
    selectDatesDescription: 'Please choose check-in and check-out dates.',
    guests: 'Guests',
    addDates: 'Add dates',
    bookInstantly: 'Book Instantly',
    reserveNow: 'Reserve Now',
    noChargeYet: 'You won\'t be charged yet',
  },
  checkout: {
    guestDetails: 'Guest Details',
    payment: 'Payment',
    reviewAndBook: 'Review & Book',
    noBookingData: 'No booking data found',
    noBookingDataDescription: 'Please start your booking from a property page',
    fillRequiredFields: 'Please fill in all required fields',
    guestInfoRequired: 'Guest information is required to continue',
    selectPaymentMethod: 'Please select a payment method',
    paymentMethodRequired: 'Payment method is required to continue',
    agreeToTerms: 'Please agree to terms and conditions',
    mustAgreeToTerms: 'You must agree to the terms to complete booking',
    bookingFailed: 'Booking failed',
    bookingFailedDescription: 'There was an error processing your booking. Please try again.',
    invalidPromoCode: 'Invalid promo code',
    invalidPromoCodeDescription: 'Please check your promo code and try again',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    specialRequests: 'Special Requests',
    enterFirstName: 'Enter first name',
    enterLastName: 'Enter last name',
    enterEmail: 'Enter email address',
    enterPhone: 'Enter phone number',
    specialRequestsPlaceholder: 'Any special requests or preferences',
    enterPromoCode: 'Enter promo code',
    applied: 'Applied',
    apply: 'Apply',
    completeBooking: 'Complete Booking',
    nextStep: 'Next Step',
  },
  payment: {
    processing: 'Processing',
    complete: 'Complete',
    failed: 'Failed',
    method: 'Payment Method',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    cardholderName: 'Cardholder Name',
    billingAddress: 'Billing Address',
    paymentProcessing: 'Payment Processing',
    completePayment: 'Complete Payment',
    securePayment: 'Secure Payment',
    paypalPayment: 'PayPal Payment',
    applePayPayment: 'Apple Pay',
    bankTransfer: 'Bank Transfer',
  },
  propertyDetail: {
    notFound: 'Property Not Found',
    hostContact: 'Host & Contact',
    messageHost: 'Message Host',
    bookNow: 'Book Now',
    checkAvailability: 'Check Availability',
    guestReviews: 'Guest Reviews',
    amenities: 'Amenities',
    houseRules: 'House Rules',
    cancellationPolicy: 'Cancellation Policy',
    location: 'Location',
    nearbyPlaces: 'Nearby Places',
    hosted: 'Hosted',
    by: 'by',
  },
  confirmation: {
    bookingConfirmed: 'Booking Confirmed',
    thankYou: 'Thank you for your booking!',
    bookingDetails: 'Booking Details',
    downloadReceipt: 'Download Receipt',
    emailSent: 'Confirmation email sent',
    bookingReference: 'Booking Reference',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    totalAmount: 'Total Amount',
    contactProperty: 'Contact Property',
    needHelp: 'Need Help?',
    modifyBooking: 'Modify Booking',
    cancelBooking: 'Cancel Booking',
  },
  bookings: {
    title: 'My Bookings',
    myBookings: 'My Bookings',
    noBookings: 'No bookings found',
    noBookingsDescription: 'You have no bookings yet. Start exploring and book your perfect stay!',
    upcoming: 'Upcoming',
    past: 'Past',
    cancelled: 'Cancelled',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    status: 'Status',
    confirmed: 'Confirmed',
    pending: 'Pending',
    viewDetails: 'View Details',
    modify: 'Modify',
    cancel: 'Cancel',
  },
  wishlist: {
    title: 'My Wishlist',
    myWishlist: 'My Wishlist',
    saved: 'Saved',
    noItems: 'No items saved',
    noItemsDescription: 'Save properties you love and access them easily later.',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    viewProperty: 'View Property',
    book: 'Book',
    signInRequired: 'You need to be signed in to add properties to your wishlist.',
    removedFromWishlist: 'Removed from wishlist',
    removedDescription: 'Property has been removed from your wishlist.',
    addedToWishlist: 'Added to wishlist',
    addedDescription: 'Property has been added to your wishlist.',
  },
  profile: {
    title: 'Profile',
    myProfile: 'My Profile',
    personalInfo: 'Personal Information',
    accountSettings: 'Account Settings',
    preferences: 'Preferences',
    privacy: 'Privacy',
    notifications: 'Notifications',
    payments: 'Payments',
    security: 'Security',
    helpCenter: 'Help Center',
    signOut: 'Sign Out',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
  },
  staff: {
    portal: 'Staff Portal',
    dashboard: 'Dashboard',
    manager: 'Manager',
    reception: 'Reception',
    housekeeping: 'Housekeeping',
    maintenance: 'Maintenance',
    kitchen: 'Kitchen',
    security: 'Security',
    quickActions: 'Quick Actions',
    todaySummary: "Today's Summary",
    tasksCompleted: 'Tasks Completed',
    urgentItems: 'Urgent Items',
    staffOnDuty: 'Staff On Duty',
    notifications: 'Notifications',
    emergency: 'Emergency',
    callSecurity: 'Call Security',
    emergencyChat: 'Emergency Chat',
    approveRequests: 'Approve Requests',
    staffOverview: 'Staff Overview',
    reports: 'Reports',
    roomAssignments: 'Room Assignments',
    cleaningStatus: 'Cleaning Status',
    supplies: 'Supplies',
    lostFound: 'Lost & Found',
    workOrders: 'Work Orders',
    equipmentStatus: 'Equipment Status',
    preventiveTasks: 'Preventive Tasks',
    inventory: 'Inventory',
    activeOrders: 'Active Orders',
    menuPlanning: 'Menu Planning',
    staffSchedule: 'Staff Schedule',
    incidentReports: 'Incident Reports',
    accessControl: 'Access Control',
    cctvMonitoring: 'CCTV Monitoring',
    patrolSchedule: 'Patrol Schedule',
  },
  reception: {
    dashboard: 'Reception Dashboard',
    checkInToday: 'Check-ins Today',
    checkOutToday: 'Check-outs Today',
    guestsInHouse: 'Guests In-House',
    availableRooms: 'Available Rooms',
    pendingPayments: 'Pending Payments',
    maintenanceRequests: 'Maintenance Requests',
    cleaningInProgress: 'Cleaning In Progress',
    upcomingCheckIns: 'Upcoming Check-ins',
    totalRevenue: 'Total Revenue',
    occupancyRate: 'Occupancy Rate',
    guestManagement: 'Guest Management',
    roomManagement: 'Room Management',
    calendarView: 'Calendar View',
    paymentProcessing: 'Payment Processing',
    quickCheckIn: 'Quick Check-in',
    newBooking: 'New Booking',
    alerts: 'Alerts',
    recentActivities: 'Recent Activities',
    performanceMetrics: 'Performance Metrics',
  },
  admin: {
    dashboard: 'Admin Dashboard',
    userManagement: 'User Management',
    propertyManagement: 'Property Management',
    bookingManagement: 'Booking Management',
    contentManagement: 'Content Management',
    systemSettings: 'System Settings',
    analytics: 'Analytics',
    reports: 'Reports',
    agentManagement: 'Agent Management',
    supportConsole: 'Support Console',
    localizationSettings: 'Localization Settings',
    contactsSettings: 'Contacts Settings',
    policiesEditor: 'Policies Editor',
    generalSettings: 'General Settings',
    customerServicePortal: 'Customer Service Portal',
    auditLogs: 'Audit Logs',
    backupRestore: 'Backup & Restore',
    securitySettings: 'Security Settings',
    integrations: 'Integrations',
    apiManagement: 'API Management',
  },
  userProfile: {
    myProfile: 'My Profile',
    personalInfo: 'Personal Information',
    accountSettings: 'Account Settings',
    bookings: 'Bookings',
    wishlist: 'Wishlist',
    reviews: 'Reviews',
    payments: 'Payments',
    notifications: 'Notifications',
    security: 'Security',
    privacy: 'Privacy',
    verification: 'Verification',
    loyaltyProgram: 'Loyalty Program',
    referrals: 'Referrals',
    documents: 'Documents',
    travelers: 'Travelers',
    savedSearches: 'Saved Searches',
    alerts: 'Alerts',
    invoices: 'Invoices',
    tickets: 'Tickets',
    wallet: 'Wallet',
    coupons: 'Coupons',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    country: 'Country',
    zipCode: 'ZIP Code',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    emergencyContact: 'Emergency Contact',
    profilePicture: 'Profile Picture',
    changePassword: 'Change Password',
    twoFactorAuth: 'Two-Factor Authentication',
    loginHistory: 'Login History',
    deleteAccount: 'Delete Account',
  },
  customerService: {
    helpCenter: 'Help Center',
    contactUs: 'Contact Us',
    liveChat: 'Live Chat',
    submitTicket: 'Submit Ticket',
    faq: 'FAQ',
    safetyInfo: 'Safety Information',
    reportIssue: 'Report Issue',
    accessibility: 'Accessibility',
    cancellationOptions: 'Cancellation Options',
    supportAgent: 'Support Agent',
    ticketNumber: 'Ticket Number',
    priority: 'Priority',
    status: 'Status',
    category: 'Category',
    subject: 'Subject',
    description: 'Description',
    attachments: 'Attachments',
    responses: 'Responses',
    resolved: 'Resolved',
    escalate: 'Escalate',
    chatHistory: 'Chat History',
    satisfaction: 'Satisfaction',
    feedback: 'Feedback',
    rating: 'Rating',
    helpful: 'Helpful',
    notHelpful: 'Not Helpful',
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    remove: 'Remove',
    update: 'Update',
    create: 'Create',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    share: 'Share',
    copy: 'Copy',
    print: 'Print',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    reload: 'Reload',
    reset: 'Reset',
    clear: 'Clear',
    submit: 'Submit',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    confirm: 'Confirm',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    retry: 'Retry',
    undo: 'Undo',
    redo: 'Redo',
  },
  common: {
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    required: 'Required',
    optional: 'Optional',
    available: 'Available',
    unavailable: 'Unavailable',
    online: 'Online',
    offline: 'Offline',
    active: 'Active',
    inactive: 'Inactive',
    enabled: 'Enabled',
    disabled: 'Disabled',
    public: 'Public',
    private: 'Private',
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
    new: 'New',
    recent: 'Recent',
    popular: 'Popular',
    featured: 'Featured',
    recommended: 'Recommended',
    trending: 'Trending',
    top: 'Top',
    best: 'Best',
    all: 'All',
    none: 'None',
    other: 'Other',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Tax',
    fee: 'Fee',
    price: 'Price',
    cost: 'Cost',
    free: 'Free',
    paid: 'Paid',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    lastYear: 'Last Year',
    minute: 'Minute',
    minutes: 'Minutes',
    hour: 'Hour',
    hours: 'Hours',
    day: 'Day',
    days: 'Days',
    week: 'Week',
    weeks: 'Weeks',
    month: 'Month',
    months: 'Months',
    year: 'Year',
    years: 'Years',
    ago: 'Ago',
    from: 'From',
    to: 'To',
    at: 'At',
    by: 'By',
    in: 'In',
    on: 'On',
    with: 'With',
    without: 'Without',
    and: 'And',
    or: 'Or',
    of: 'Of',
    for: 'For',
    about: 'About',
    more: 'More',
    less: 'Less',
    most: 'Most',
    least: 'Least',
    first: 'First',
    last: 'Last',
    early: 'Early',
    late: 'Late',
    high: 'High',
    low: 'Low',
    fast: 'Fast',
    slow: 'Slow',
    easy: 'Easy',
    hard: 'Hard',
    good: 'Good',
    bad: 'Bad',
    excellent: 'Excellent',
    poor: 'Poor',
    average: 'Average',
  },
  messages: {
    welcome: 'Welcome',
    goodbye: 'Goodbye',
    thankyou: 'Thank You',
    sorry: 'Sorry',
    congratulations: 'Congratulations',
    warning: 'Warning',
    error: 'Error',
    success: 'Success',
    info: 'Information',
    confirmation: 'Confirmation',
    saved: 'Saved',
    deleted: 'Deleted',
    updated: 'Updated',
    created: 'Created',
    failed: 'Failed',
    tryAgain: 'Please try again',
    sessionExpired: 'Session expired',
    unauthorized: 'Unauthorized',
    forbidden: 'Access forbidden',
    notFound: 'Not found',
    serverError: 'Server error',
    networkError: 'Network error',
    validationError: 'Validation error',
    requiredField: 'This field is required',
    invalidFormat: 'Invalid format',
    passwordMismatch: 'Passwords do not match',
    emailExists: 'Email already exists',
    weakPassword: 'Password is too weak',
    strongPassword: 'Strong password',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    logoutSuccess: 'Logout successful',
    signupSuccess: 'Account created successfully',
    signupFailed: 'Account creation failed',
    profileUpdated: 'Profile updated',
    bookingConfirmed: 'Booking confirmed',
    bookingCancelled: 'Booking cancelled',
    paymentSuccess: 'Payment successful',
    paymentFailed: 'Payment failed',
    emailSent: 'Email sent',
    emailFailed: 'Email failed to send',
    uploadSuccess: 'Upload successful',
    uploadFailed: 'Upload failed',
    connectionLost: 'Connection lost',
    connectionRestored: 'Connection restored',
    newMessage: 'New message',
    newNotification: 'New notification',
    systemMaintenance: 'System maintenance',
    updateAvailable: 'Update available',
    featureUnavailable: 'Feature unavailable',
    comingSoon: 'Coming soon',
  },
  forms: {
    validation: {
      required: 'This field is required',
      invalid: 'Invalid value',
      tooShort: 'Too short',
      tooLong: 'Too long',
      mustMatch: 'Fields must match',
      mustBeNumber: 'Must be a number',
      mustBeEmail: 'Must be a valid email',
      mustBePhone: 'Must be a valid phone number',
      mustBeUrl: 'Must be a valid URL',
      mustBeDate: 'Must be a valid date',
      futureDate: 'Date must be in the future',
      pastDate: 'Date must be in the past',
      minimumAge: 'Minimum age required',
      maximumAge: 'Maximum age exceeded',
      minimumLength: 'Minimum length required',
      maximumLength: 'Maximum length exceeded',
      specialCharacters: 'Special characters not allowed',
      onlyLetters: 'Only letters allowed',
      onlyNumbers: 'Only numbers allowed',
      noSpaces: 'Spaces not allowed',
      fileSize: 'File size too large',
      fileType: 'Invalid file type',
      imageSize: 'Image size too large',
      videoLength: 'Video too long',
    },
    placeholders: {
      email: 'Enter your email',
      password: 'Enter your password',
      confirmPassword: 'Confirm your password',
      firstName: 'Enter your first name',
      lastName: 'Enter your last name',
      fullName: 'Enter your full name',
      phone: 'Enter your phone number',
      address: 'Enter your address',
      city: 'Enter your city',
      country: 'Select your country',
      zipCode: 'Enter ZIP code',
      search: 'Search...',
      message: 'Enter your message',
      comment: 'Enter your comment',
      feedback: 'Enter your feedback',
      notes: 'Enter notes',
      description: 'Enter description',
      title: 'Enter title',
      url: 'Enter URL',
      date: 'Select date',
      time: 'Select time',
      amount: 'Enter amount',
      quantity: 'Enter quantity',
      choose: 'Choose...',
      select: 'Select...',
      upload: 'Upload file',
      browse: 'Browse files',
    },
  },
  footer: {
    about: 'About',
    company: 'Company',
    careers: 'Careers',
    press: 'Press',
    investors: 'Investors',
    blog: 'Blog',
    community: 'Community',
    support: 'Support',
    hostResources: 'Host Resources',
    communityForum: 'Community Forum',
    hostingResponsibly: 'Hosting Responsibly',
    associates: 'Associates',
    destinations: 'Destinations',
    europe: 'Europe',
    asia: 'Asia',
    northAmerica: 'North America',
    southAmerica: 'South America',
    africa: 'Africa',
    oceania: 'Oceania',
    giftCards: 'Gift Cards',
    stayUpdated: 'Stay Updated',
    newsletter: 'Newsletter',
    enterEmail: 'Enter your email',
    subscribe: 'Subscribe',
    contactUs: 'Contact Us',
    downloadApp: 'Download Our App',
    appStore: 'App Store',
    googlePlay: 'Google Play',
    languagesCurrency: 'Languages & Currency',
    followUs: 'Follow Us',
    copyright: '© 2024 Metah. All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    sitemap: 'Sitemap',
  },
};
