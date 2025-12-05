export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
}

export interface Repo {
  name: string;
  fullName: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}

export interface Collaborator {
  username: string;
  interactions: number;
}

export interface Emoji {
  emoji: string;
  count: number;
}

export interface Comment {
  preview: string;
  url: string;
  length: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Stats {
  totalCommits: number;
  commitsByMonth: Record<number, number>;
  commitsByHour: number[];
  commitsByDay: number[];
  prsOpened: number;
  prsMerged: number;
  issuesOpened: number;
  issuesClosed: number;
  reviewsGiven: number;
  topCollaborators: Collaborator[];
}

export interface RepoStats {
  topRepos: Repo[];
  languages: Record<string, number>;
  totalRepos: number;
}

export interface SocialStats {
  topEmojis: Emoji[];
  memorableComments: Comment[];
  totalComments: number;
}

export interface ActivityPatterns {
  hourlyActivity: number[];
  dailyActivity: number[];
  monthlyActivity: number[];
  longestStreak: number;
  busiestMonth: string;
  peakHour: number;
  peakDay: string;
  totalActiveDays: number;
}

export interface WrappedData {
  user: UserProfile;
  year: number;
  stats: Stats;
  repos: RepoStats;
  social: SocialStats;
  patterns: ActivityPatterns;
  achievements: Achievement[];
  generatedAt: string;
}
