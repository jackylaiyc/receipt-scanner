export const FAMILY_CATEGORIES = [
  { value: 'Groceries', icon: '🛒' },
  { value: 'Dining Out', icon: '🍽️' },
  { value: 'Gas & Fuel', icon: '⛽' },
  { value: 'Utilities', icon: '💡' },
  { value: 'Healthcare', icon: '🏥' },
  { value: 'Entertainment', icon: '🎬' },
  { value: 'Clothing', icon: '👕' },
  { value: 'Home & Garden', icon: '🏡' },
  { value: 'Education', icon: '📚' },
  { value: 'Travel', icon: '✈️' },
  { value: 'Subscriptions', icon: '📱' },
  { value: 'Personal Care', icon: '💆' },
  { value: 'Pet Care', icon: '🐾' },
  { value: 'Kids & Baby', icon: '👶' },
  { value: 'Auto & Transport', icon: '🚗' },
  { value: 'Gifts & Donations', icon: '🎁' },
  { value: 'Insurance', icon: '🛡️' },
  { value: 'Other', icon: '📦' },
] as const;

export const COMPANY_CATEGORIES = [
  { value: 'Meals & Entertainment', icon: '🍽️' },
  { value: 'Travel & Lodging', icon: '✈️' },
  { value: 'Office Supplies', icon: '📎' },
  { value: 'Software & Subscriptions', icon: '💻' },
  { value: 'Equipment & Hardware', icon: '🖥️' },
  { value: 'Professional Services', icon: '💼' },
  { value: 'Marketing & Advertising', icon: '📣' },
  { value: 'Training & Education', icon: '📚' },
  { value: 'Utilities', icon: '💡' },
  { value: 'Shipping & Postage', icon: '📦' },
  { value: 'Vehicle & Mileage', icon: '🚗' },
  { value: 'Telecommunications', icon: '📡' },
  { value: 'Insurance', icon: '🛡️' },
  { value: 'Contractor Payments', icon: '🤝' },
  { value: 'Bank Fees', icon: '🏦' },
  { value: 'Rent & Lease', icon: '🏢' },
  { value: 'Other', icon: '📋' },
] as const;

export type FamilyCategoryValue = typeof FAMILY_CATEGORIES[number]['value'];
export type CompanyCategoryValue = typeof COMPANY_CATEGORIES[number]['value'];
