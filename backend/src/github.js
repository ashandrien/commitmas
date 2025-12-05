const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

async function fetchGitHubWrapped(accessToken, username) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3+json'
  };

  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01T00:00:00Z`;
  const endOfYear = `${currentYear}-12-31T23:59:59Z`;

  try {
    // Fetch user profile
    const userProfile = await fetchUserProfile(headers);
    
    // Fetch contribution stats
    const contributionStats = await fetchContributionStats(headers, username, startOfYear);
    
    // Fetch repository stats
    const repoStats = await fetchRepoStats(headers, username);
    
    // Fetch PR and issue stats
    const prIssueStats = await fetchPRAndIssueStats(headers, username, startOfYear);
    
    // Fetch comments and emojis
    const socialStats = await fetchSocialStats(headers, username, startOfYear);
    
    // Fetch activity patterns
    const activityPatterns = await fetchActivityPatterns(headers, username, startOfYear);
    
    // Calculate achievements
    const achievements = calculateAchievements(contributionStats, prIssueStats, activityPatterns, socialStats);

    return {
      user: userProfile,
      year: currentYear,
      stats: {
        ...contributionStats,
        ...prIssueStats
      },
      repos: repoStats,
      social: socialStats,
      patterns: activityPatterns,
      achievements,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in fetchGitHubWrapped:', error.message);
    throw error;
  }
}

async function fetchUserProfile(headers) {
  const response = await axios.get(`${GITHUB_API}/user`, { headers });
  return {
    username: response.data.login,
    name: response.data.name,
    avatar: response.data.avatar_url,
    bio: response.data.bio,
    followers: response.data.followers,
    following: response.data.following,
    publicRepos: response.data.public_repos
  };
}

async function fetchContributionStats(headers, username, startOfYear) {
  // Fetch user's events to calculate commits
  let totalCommits = 0;
  let page = 1;
  const commitsByMonth = {};
  const commitsByHour = Array(24).fill(0);
  const commitsByDay = Array(7).fill(0);
  
  // Initialize months
  for (let i = 0; i < 12; i++) {
    commitsByMonth[i] = 0;
  }

  try {
    while (page <= 10) { // Limit to 10 pages to avoid rate limiting
      const response = await axios.get(`${GITHUB_API}/users/${username}/events`, {
        headers,
        params: { per_page: 100, page }
      });

      if (response.data.length === 0) break;

      for (const event of response.data) {
        if (event.type === 'PushEvent' && new Date(event.created_at) >= new Date(startOfYear)) {
          const commits = event.payload.commits?.length || 0;
          totalCommits += commits;
          
          const date = new Date(event.created_at);
          commitsByMonth[date.getMonth()] += commits;
          commitsByHour[date.getHours()] += commits;
          commitsByDay[date.getDay()] += commits;
        }
      }

      page++;
    }
  } catch (error) {
    console.error('Error fetching events:', error.message);
  }

  return {
    totalCommits,
    commitsByMonth,
    commitsByHour,
    commitsByDay
  };
}

async function fetchRepoStats(headers, username) {
  const repos = [];
  const languages = {};
  let page = 1;

  try {
    while (page <= 5) {
      const response = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
        headers,
        params: { per_page: 100, page, sort: 'pushed' }
      });

      if (response.data.length === 0) break;

      for (const repo of response.data) {
        repos.push({
          name: repo.name,
          fullName: repo.full_name,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updatedAt: repo.updated_at
        });

        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      }

      page++;
    }
  } catch (error) {
    console.error('Error fetching repos:', error.message);
  }

  // Sort repos by recent activity and get top 5
  const topRepos = repos.slice(0, 5);

  // Calculate language percentages
  const totalLangs = Object.values(languages).reduce((a, b) => a + b, 0);
  const languagePercentages = {};
  for (const [lang, count] of Object.entries(languages)) {
    languagePercentages[lang] = Math.round((count / totalLangs) * 100);
  }

  // Sort languages by percentage
  const sortedLanguages = Object.entries(languagePercentages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    topRepos,
    languages: Object.fromEntries(sortedLanguages),
    totalRepos: repos.length
  };
}

async function fetchPRAndIssueStats(headers, username, startOfYear) {
  let prsOpened = 0;
  let prsMerged = 0;
  let issuesOpened = 0;
  let issuesClosed = 0;
  let reviewsGiven = 0;
  const collaborators = {};

  try {
    // Fetch PRs created by user
    const prsResponse = await axios.get(`${GITHUB_API}/search/issues`, {
      headers,
      params: {
        q: `author:${username} type:pr created:>=${startOfYear.split('T')[0]}`,
        per_page: 100
      }
    });
    prsOpened = prsResponse.data.total_count;

    // Count merged PRs
    for (const pr of prsResponse.data.items || []) {
      if (pr.pull_request?.merged_at) {
        prsMerged++;
      }
    }

    // Fetch issues created by user
    const issuesResponse = await axios.get(`${GITHUB_API}/search/issues`, {
      headers,
      params: {
        q: `author:${username} type:issue created:>=${startOfYear.split('T')[0]}`,
        per_page: 100
      }
    });
    issuesOpened = issuesResponse.data.total_count;

    // Count closed issues
    for (const issue of issuesResponse.data.items || []) {
      if (issue.state === 'closed') {
        issuesClosed++;
      }
    }

    // Fetch PR reviews given
    const reviewsResponse = await axios.get(`${GITHUB_API}/search/issues`, {
      headers,
      params: {
        q: `reviewed-by:${username} type:pr created:>=${startOfYear.split('T')[0]}`,
        per_page: 100
      }
    });
    reviewsGiven = reviewsResponse.data.total_count;

    // Extract collaborators from PRs and issues
    for (const item of [...(prsResponse.data.items || []), ...(issuesResponse.data.items || [])]) {
      if (item.user && item.user.login !== username) {
        collaborators[item.user.login] = (collaborators[item.user.login] || 0) + 1;
      }
    }

  } catch (error) {
    console.error('Error fetching PR/Issue stats:', error.message);
  }

  // Get top collaborators
  const topCollaborators = Object.entries(collaborators)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([username, count]) => ({ username, interactions: count }));

  return {
    prsOpened,
    prsMerged,
    issuesOpened,
    issuesClosed,
    reviewsGiven,
    topCollaborators
  };
}

async function fetchSocialStats(headers, username, startOfYear) {
  const emojis = {};
  const comments = [];
  let page = 1;

  // Common emoji patterns
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|:\w+:/gu;

  try {
    // Fetch user's issue comments
    while (page <= 5) {
      const response = await axios.get(`${GITHUB_API}/users/${username}/events`, {
        headers,
        params: { per_page: 100, page }
      });

      if (response.data.length === 0) break;

      for (const event of response.data) {
        if (new Date(event.created_at) < new Date(startOfYear)) continue;

        let commentBody = null;
        let commentUrl = null;

        if (event.type === 'IssueCommentEvent') {
          commentBody = event.payload.comment?.body;
          commentUrl = event.payload.comment?.html_url;
        } else if (event.type === 'PullRequestReviewCommentEvent') {
          commentBody = event.payload.comment?.body;
          commentUrl = event.payload.comment?.html_url;
        } else if (event.type === 'CommitCommentEvent') {
          commentBody = event.payload.comment?.body;
          commentUrl = event.payload.comment?.html_url;
        }

        if (commentBody) {
          // Extract emojis
          const foundEmojis = commentBody.match(emojiRegex) || [];
          for (const emoji of foundEmojis) {
            emojis[emoji] = (emojis[emoji] || 0) + 1;
          }

          // Store comment for "memorable comments"
          comments.push({
            body: commentBody,
            url: commentUrl,
            length: commentBody.length,
            createdAt: event.created_at
          });
        }
      }

      page++;
    }
  } catch (error) {
    console.error('Error fetching social stats:', error.message);
  }

  // Sort emojis by frequency
  const topEmojis = Object.entries(emojis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));

  // Get longest and most recent memorable comments
  const memorableComments = comments
    .sort((a, b) => b.length - a.length)
    .slice(0, 3)
    .map(c => ({
      preview: c.body.substring(0, 200) + (c.body.length > 200 ? '...' : ''),
      url: c.url,
      length: c.length
    }));

  return {
    topEmojis,
    memorableComments,
    totalComments: comments.length
  };
}

async function fetchActivityPatterns(headers, username, startOfYear) {
  const hourlyActivity = Array(24).fill(0);
  const dailyActivity = Array(7).fill(0);
  const monthlyActivity = Array(12).fill(0);
  let currentStreak = 0;
  let longestStreak = 0;
  let lastActivityDate = null;
  const activityDates = new Set();

  try {
    let page = 1;
    while (page <= 10) {
      const response = await axios.get(`${GITHUB_API}/users/${username}/events`, {
        headers,
        params: { per_page: 100, page }
      });

      if (response.data.length === 0) break;

      for (const event of response.data) {
        const eventDate = new Date(event.created_at);
        if (eventDate < new Date(startOfYear)) continue;

        hourlyActivity[eventDate.getHours()]++;
        dailyActivity[eventDate.getDay()]++;
        monthlyActivity[eventDate.getMonth()]++;
        
        // Track unique activity dates for streak calculation
        const dateStr = eventDate.toISOString().split('T')[0];
        activityDates.add(dateStr);
      }

      page++;
    }
  } catch (error) {
    console.error('Error fetching activity patterns:', error.message);
  }

  // Calculate streaks
  const sortedDates = Array.from(activityDates).sort();
  let tempStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Find busiest month
  const busiestMonthIndex = monthlyActivity.indexOf(Math.max(...monthlyActivity));
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Find peak hour
  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

  // Find peak day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const peakDay = dailyActivity.indexOf(Math.max(...dailyActivity));

  return {
    hourlyActivity,
    dailyActivity,
    monthlyActivity,
    longestStreak,
    busiestMonth: monthNames[busiestMonthIndex],
    peakHour,
    peakDay: dayNames[peakDay],
    totalActiveDays: activityDates.size
  };
}

function calculateAchievements(contributionStats, prIssueStats, activityPatterns, socialStats) {
  const achievements = [];

  // Night Owl - most commits after midnight (10pm - 4am)
  const nightHours = [22, 23, 0, 1, 2, 3, 4];
  const nightCommits = nightHours.reduce((sum, h) => sum + (contributionStats.commitsByHour[h] || 0), 0);
  if (nightCommits > 10) {
    achievements.push({
      id: 'night-owl',
      name: 'Night Owl',
      description: `Made ${nightCommits} commits between 10pm and 4am`,
      icon: '🦉'
    });
  }

  // Early Bird - most commits before 8am (5am - 8am)
  const earlyHours = [5, 6, 7];
  const earlyCommits = earlyHours.reduce((sum, h) => sum + (contributionStats.commitsByHour[h] || 0), 0);
  if (earlyCommits > 10) {
    achievements.push({
      id: 'early-bird',
      name: 'Early Bird',
      description: `Made ${earlyCommits} commits between 5am and 8am`,
      icon: '🐦'
    });
  }

  // Bug Squasher - closed many issues
  if (prIssueStats.issuesClosed >= 10) {
    achievements.push({
      id: 'bug-squasher',
      name: 'Bug Squasher',
      description: `Closed ${prIssueStats.issuesClosed} issues this year`,
      icon: '🐛'
    });
  }

  // Code Reviewer - gave many reviews
  if (prIssueStats.reviewsGiven >= 10) {
    achievements.push({
      id: 'code-reviewer',
      name: 'Code Reviewer',
      description: `Reviewed ${prIssueStats.reviewsGiven} pull requests`,
      icon: '👀'
    });
  }

  // Streak Master - long contribution streak
  if (activityPatterns.longestStreak >= 7) {
    achievements.push({
      id: 'streak-master',
      name: 'Streak Master',
      description: `Maintained a ${activityPatterns.longestStreak}-day contribution streak`,
      icon: '🔥'
    });
  }

  // PR Machine - opened many PRs
  if (prIssueStats.prsOpened >= 20) {
    achievements.push({
      id: 'pr-machine',
      name: 'PR Machine',
      description: `Opened ${prIssueStats.prsOpened} pull requests`,
      icon: '🚀'
    });
  }

  // Social Butterfly - many comments
  if (socialStats.totalComments >= 50) {
    achievements.push({
      id: 'social-butterfly',
      name: 'Social Butterfly',
      description: `Left ${socialStats.totalComments} comments across GitHub`,
      icon: '🦋'
    });
  }

  // Commit Champion - many commits
  if (contributionStats.totalCommits >= 500) {
    achievements.push({
      id: 'commit-champion',
      name: 'Commit Champion',
      description: `Made ${contributionStats.totalCommits} commits this year`,
      icon: '🏆'
    });
  } else if (contributionStats.totalCommits >= 100) {
    achievements.push({
      id: 'committed',
      name: 'Committed',
      description: `Made ${contributionStats.totalCommits} commits this year`,
      icon: '💪'
    });
  }

  // Weekend Warrior - active on weekends
  const weekendActivity = (contributionStats.commitsByDay[0] || 0) + (contributionStats.commitsByDay[6] || 0);
  if (weekendActivity >= 20) {
    achievements.push({
      id: 'weekend-warrior',
      name: 'Weekend Warrior',
      description: `Made ${weekendActivity} commits on weekends`,
      icon: '⚔️'
    });
  }

  return achievements;
}

module.exports = { fetchGitHubWrapped };
