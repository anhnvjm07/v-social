import { User } from "@modules/auth/models/User.model";

/**
 * Extract usernames from content that are mentioned using @username format
 * @param content - The content to extract mentions from
 * @returns Array of unique usernames (without @ symbol)
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  
  if (!matches) {
    return [];
  }

  // Extract usernames (remove @ symbol) and get unique values
  const usernames = matches.map((match) => match.substring(1));
  return [...new Set(usernames)];
}

/**
 * Validate usernames exist in database and return their user IDs
 * @param usernames - Array of usernames to validate
 * @returns Array of user IDs for valid usernames
 */
export async function validateMentions(usernames: string[]): Promise<string[]> {
  if (usernames.length === 0) {
    return [];
  }

  const users = await User.find({
    username: { $in: usernames },
  }).select("_id");

  return users.map((user) => user._id.toString());
}

