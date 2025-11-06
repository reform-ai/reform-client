/**
 * In-App Purchases - Premium Content
 * Concise IAP system for additional features
 */

export const PURCHASABLE_ITEMS = {
  ADVANCED_AI: {
    id: 'advanced_ai',
    name: 'Advanced AI Models',
    description: 'Upgraded pose detection and analysis',
    price: 2.99,
    type: 'one_time',
  },
  CUSTOM_VOICE: {
    id: 'custom_voice',
    name: 'Custom Trainer Voice',
    description: 'Choose your trainer\'s voice',
    price: 1.99,
    type: 'one_time',
  },
  PREMIUM_THEME: {
    id: 'premium_theme',
    name: 'Premium Theme Pack',
    description: 'Beautiful dark and light themes',
    price: 0.99,
    type: 'one_time',
  },
  REMOVE_ADS: {
    id: 'remove_ads',
    name: 'Remove Ads',
    description: 'Ad-free experience',
    price: 4.99,
    type: 'subscription',
  },
};

export class InAppPurchases {
  constructor() {
    this.purchasedItems = [];
  }

  // Purchase item
  async purchaseItem(itemId) {
    const item = PURCHASABLE_ITEMS[itemId];
    if (!item) {
      throw new Error('Item not found');
    }

    // In real app, integrate with App Store / Play Store
    // For now, simulate purchase
    if (!this.purchasedItems.includes(itemId)) {
      this.purchasedItems.push(itemId);
      return {
        success: true,
        item,
        message: `Purchased ${item.name} for $${item.price}`,
      };
    }

    return {
      success: false,
      message: 'Already purchased',
    };
  }

  // Check if item is purchased
  hasPurchased(itemId) {
    return this.purchasedItems.includes(itemId);
  }

  // Get purchased items
  getPurchasedItems() {
    return this.purchasedItems.map(id => PURCHASABLE_ITEMS[id]);
  }
}

export default InAppPurchases;
