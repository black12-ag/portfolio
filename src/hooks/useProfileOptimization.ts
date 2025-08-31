import { useCallback, useMemo } from 'react';
import { useProfileStore } from '@/store/profileStore';

export function useProfileOptimization() {
  const store = useProfileStore((state) => state);

  // Memoized selectors to prevent unnecessary re-renders
  const memoizedSelectors = useMemo(() => ({
    getPaymentMethods: () => store.methods,
    getTransactions: () => store.transactions,
    getTravelers: () => store.travelers,
    getDocuments: () => store.documents,
    getReviews: () => store.reviews,
    getAlerts: () => store.alerts,
    getSavedSearches: () => store.savedSearches,
    getNotificationPrefs: () => store.notificationPrefs,
    getVerificationState: () => store.verification,
    getLoyaltyInfo: () => ({
      points: store.loyaltyPoints,
      tier: store.loyaltyTier
    }),
    getUnreadCounts: () => store.unreadCounts
  }), [store]);

  // Optimized action creators with useCallback
  const addPaymentMethod = useCallback(store.addMethod, [store.addMethod]);
  const removePaymentMethod = useCallback(store.removeMethod, [store.removeMethod]);
  const makeDefaultPaymentMethod = useCallback(store.makeDefaultMethod, [store.makeDefaultMethod]);
  const addTraveler = useCallback(store.addTraveler, [store.addTraveler]);
  const removeTraveler = useCallback(store.removeTraveler, [store.removeTraveler]);
  const addDocument = useCallback(store.addDocument, [store.addDocument]);
  const removeDocument = useCallback(store.removeDocument, [store.removeDocument]);
  const updateVerification = useCallback(store.setVerification, [store.setVerification]);
  const updateNotificationPrefs = useCallback(store.setNotificationPrefs, [store.setNotificationPrefs]);
  const markAllRead = useCallback(store.markAllRead, [store.markAllRead]);
  const addReview = useCallback(store.addReview, [store.addReview]);
  const removeReview = useCallback(store.removeReview, [store.removeReview]);
  const addAlert = useCallback(store.addAlert, [store.addAlert]);
  const updateAlert = useCallback(store.updateAlert, [store.updateAlert]);
  const removeAlert = useCallback(store.removeAlert, [store.removeAlert]);
  const addSavedSearch = useCallback(store.addSavedSearch, [store.addSavedSearch]);
  const removeSavedSearch = useCallback(store.removeSavedSearch, [store.removeSavedSearch]);
  const toggleSavedSearchAlerts = useCallback(store.toggleSavedSearchAlerts, [store.toggleSavedSearchAlerts]);
  const addPoints = useCallback(store.addPoints, [store.addPoints]);
  const redeemPoints = useCallback(store.redeemPoints, [store.redeemPoints]);
  const addCoupon = useCallback(store.addCoupon, [store.addCoupon]);
  const removeCoupon = useCallback(store.removeCoupon, [store.removeCoupon]);

  const optimizedActions = useMemo(() => ({
    // Payment methods
    addPaymentMethod,
    removePaymentMethod,
    makeDefaultPaymentMethod,

    // Travelers
    addTraveler,
    removeTraveler,

    // Documents
    addDocument,
    removeDocument,

    // Verification
    updateVerification,

    // Notifications
    updateNotificationPrefs,
    markAllRead,

    // Reviews
    addReview,
    removeReview,

    // Alerts
    addAlert,
    updateAlert,
    removeAlert,

    // Saved searches
    addSavedSearch,
    removeSavedSearch,
    toggleSavedSearchAlerts,

    // Loyalty
    addPoints,
    redeemPoints,

    // Coupons
    addCoupon,
    removeCoupon
  }), [
    addPaymentMethod, removePaymentMethod, makeDefaultPaymentMethod,
    addTraveler, removeTraveler, addDocument, removeDocument,
    updateVerification, updateNotificationPrefs, markAllRead,
    addReview, removeReview, addAlert, updateAlert, removeAlert,
    addSavedSearch, removeSavedSearch, toggleSavedSearchAlerts,
    addPoints, redeemPoints, addCoupon, removeCoupon
  ]);

  return {
    selectors: memoizedSelectors,
    actions: optimizedActions
  };
}

// Specialized hooks for specific profile sections
export function usePaymentMethods() {
  const { selectors, actions } = useProfileOptimization();
  
  return useMemo(() => ({
    methods: selectors.getPaymentMethods(),
    addMethod: actions.addPaymentMethod,
    removeMethod: actions.removePaymentMethod,
    makeDefault: actions.makeDefaultPaymentMethod
  }), [selectors, actions]);
}

export function useTravelers() {
  const { selectors, actions } = useProfileOptimization();
  
  return useMemo(() => ({
    travelers: selectors.getTravelers(),
    addTraveler: actions.addTraveler,
    removeTraveler: actions.removeTraveler
  }), [selectors, actions]);
}

export function useNotifications() {
  const { selectors, actions } = useProfileOptimization();
  
  return useMemo(() => ({
    preferences: selectors.getNotificationPrefs(),
    unreadCounts: selectors.getUnreadCounts(),
    updatePreferences: actions.updateNotificationPrefs,
    markAllRead: actions.markAllRead
  }), [selectors, actions]);
}

export function useLoyalty() {
  const { selectors, actions } = useProfileOptimization();
  
  return useMemo(() => ({
    ...selectors.getLoyaltyInfo(),
    addPoints: actions.addPoints,
    redeemPoints: actions.redeemPoints
  }), [selectors, actions]);
}
