// src/lib/matchingAlgorithm.js (Peer-to-Peer Version)

const skillLevels = { 'Beginner': 1, 'Intermediate': 2, 'Expert': 3 };

const calculateSkillMatch = (skillsToLearn, skillsToTeach) => {
  if (!skillsToLearn || skillsToLearn.length === 0) return 0;
  
  let totalScore = 0;
  const mentorSkillMap = new Map(skillsToTeach.map(s => [s.name, skillLevels[s.level]]));

  for (const studentSkill of skillsToLearn) {
    const studentLevel = skillLevels[studentSkill.level];
    const mentorLevel = mentorSkillMap.get(studentSkill.name);

    if (mentorLevel && mentorLevel > studentLevel) {
      totalScore += (mentorLevel - studentLevel) / (Object.keys(skillLevels).length - 1);
    }
  }
  return totalScore / skillsToLearn.length;
};

const calculateMentorLoadScore = (mentor) => {
    if (mentor.capacity === 0) return 0;
    const availableSlots = mentor.capacity - mentor.currentMentees;
    if (availableSlots <= 0) return 0;
    return availableSlots / mentor.capacity;
}

const calculateJaccardSimilarity = (arr1, arr2) => {
    if (!arr1 || !arr2) return 0;
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
};

const calculateCompatibilityScore = (currentUser, potentialMentor) => {
  const weights = { skill: 40, interest: 20, mentorLoad: 25, style: 15 };

  // THE KEY CHANGE: Compare learner's "skillsToLearn" with mentor's "skillsToTeach"
  const skillScore = calculateSkillMatch(currentUser.skillsToLearn, potentialMentor.skillsToTeach);
  
  const interestScore = calculateJaccardSimilarity(currentUser.interests, potentialMentor.interests);
  const mentorLoadScore = calculateMentorLoadScore(potentialMentor);
  const styleScore = currentUser.style === potentialMentor.style ? 1 : 0.25;

  const finalScore = (skillScore * weights.skill) + (interestScore * weights.interest) + (mentorLoadScore * weights.mentorLoad) + (styleScore * weights.style);
  return Math.round(finalScore);
};

export const findTopMentors = (currentUser, allUsers) => {
  // Filter out the current user and mentors who are at full capacity
  const potentialMentors = allUsers.filter(user => 
    user.id !== currentUser.id && user.capacity > user.currentMentees
  );

  const scoredMentors = potentialMentors.map(mentor => ({
    ...mentor,
    matchScore: calculateCompatibilityScore(currentUser, mentor),
  }));

  scoredMentors.sort((a, b) => b.matchScore - a.matchScore);
  return scoredMentors;
};