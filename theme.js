// ─── TOWNLY THEME ────────────────────────────────────────────────────────────

export const Colors = {
  cream: '#FAF7F2',
  warmWhite: '#FFF9F2',
  green: '#4CAF7D',
  greenLight: '#E8F5EE',
  orange: '#F4845F',
  orangeLight: '#FEF0EB',
  red: '#E05252',
  redLight: '#FDEAEA',
  yellow: '#F5A623',
  yellowLight: '#FEF6E7',
  blue: '#5B8DEF',
  blueLight: '#EEF3FD',
  purple: '#9B59B6',
  purpleLight: '#F3E9F9',
  dark: '#1A1A2E',
  gray: '#8A8A9A',
  border: '#EDE8E0',
  white: '#FFFFFF',
};

export const Shadow = {
  small: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const Categories = [
  { id: 'safety',         emoji: '🔴', label: 'Safety',         color: '#E05252', bg: '#FDEAEA' },
  { id: 'infrastructure', emoji: '🔠', label: 'Infrastructure', color: '#F4845F', bg: '#FEF0EB' },
  { id: 'animals',        emoji: '🐾', label: 'Animals',        color: '#F5A623', bg: '#FEF6E7' },
  { id: 'community',      emoji: '🏢', label: 'Community',      color: '#5B8DEF', bg: '#EEF3FD' },
  { id: 'positive',       emoji: '🌿', label: 'Positive',       color: '#4CAF7D', bg: '#E8F5EE' },
  { id: 'other',          emoji: '✦', label: 'Other',          color: '#8A8A9A', bg: '#F5F5F5' },
];

export const Badges = [
  {
    id: 'block_captain',
    emoji: '🏆',
    label: 'Block Captain',
    description: 'Top contributor in your zip code this month',
    color: '#F5A623',
    bg: '#FEF6E7',
    requirement: 'Post 20+ verified reports',
  },
  {
    id: 'trusted_reporter',
    emoji: '✅',
    label: 'Trusted Reporter',
    description: '90%+ of your reports verified by neighbors',
    color: '#4CAF7D',
    bg: '#E8F5EE',
    requirement: '90% accuracy rate',
  },
  {
    id: 'good_samaritan',
    emoji: '🤝',
    label: 'Good Samaritan',
    description: 'Helped 10+ neighbors in your area',
    color: '#5B8DEF',
    bg: '#EEF3FD',
    requirement: 'Help 10+ neighbors',
  },
  {
    id: 'first_responder',
    emoji: '⚡',
    label: 'First Responder',
    description: 'First to report 5+ incidents in your zip',
    color: '#E05252',
    bg: '#FDEAEA',
    requirement: 'First to report 5 incidents',
  },
  {
    id: 'community_voice',
    emoji: '📢',
    label: 'Community Voice',
    description: 'Your reports received 100+ total upvotes',
    color: '#9B59B6',
    bg: '#F3E9F9',
    requirement: '100+ total upvotes',
  },
];
