import { User } from "@modules/auth/models/User.model";
import { Post } from "@modules/posts/models/Post.model";
import { Follow } from "@modules/follows/models/Follow.model";
import {
  SearchType,
  SearchQueryParams,
  SearchResult,
  SearchResponse,
} from "../types/search.types";
import mongoose from "mongoose";

class SearchService {
  async search(
    query: string,
    type: SearchType,
    params: SearchQueryParams,
    userId?: string
  ): Promise<SearchResponse> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const sortOrder = params.sortOrder || "desc";
    const searchQuery = query.trim();

    const results: SearchResult = {};

    // Search users
    if (type === "users" || type === "all") {
      const users = await this.searchUsers(searchQuery, page, limit, sortOrder);
      results.users = users;
    }

    // Search posts
    if (type === "posts" || type === "all") {
      const posts = await this.searchPosts(
        searchQuery,
        page,
        limit,
        sortOrder,
        userId,
        params.filters
      );
      results.posts = posts;
    }

    // Search hashtags
    if (type === "hashtags" || type === "all") {
      const hashtags = await this.searchHashtags(
        searchQuery,
        page,
        limit,
        userId
      );
      results.hashtags = hashtags;
    }

    // Calculate total for pagination
    let total = 0;
    if (type === "users" || type === "all") {
      total += results.users?.length || 0;
    }
    if (type === "posts" || type === "all") {
      total += results.posts?.length || 0;
    }
    if (type === "hashtags" || type === "all") {
      total += results.hashtags?.length || 0;
    }

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async searchUsers(
    query: string,
    page: number,
    limit: number,
    sortOrder: "asc" | "desc"
  ) {
    const skip = (page - 1) * limit;
    const regex = new RegExp(query, "i");

    const users = await User.find({
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { username: { $regex: regex } },
        { email: { $regex: regex } },
      ],
    })
      .select("firstName lastName username avatar bio email")
      .sort({ firstName: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return users;
  }

  private async searchPosts(
    query: string,
    page: number,
    limit: number,
    sortOrder: "asc" | "desc",
    userId?: string,
    filters?: any
  ) {
    const skip = (page - 1) * limit;
    const regex = new RegExp(query, "i");

    // Build base query
    const baseQuery: any = {
      content: { $regex: regex },
    };

    // Apply visibility filter
    if (!userId) {
      baseQuery.visibility = "public";
    } else {
      // For logged in users, include public, own private/followers, and followers posts
      const visibilityConditions: any[] = [{ visibility: "public" }];

      // Own posts
      visibilityConditions.push({
        $and: [
          { author: new mongoose.Types.ObjectId(userId) },
          { visibility: { $in: ["private", "followers"] } },
        ],
      });

      baseQuery.$or = visibilityConditions;
    }

    // Apply additional filters
    if (filters?.dateFrom || filters?.dateTo) {
      baseQuery.createdAt = {};
      if (filters.dateFrom) {
        baseQuery.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        baseQuery.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    if (filters?.userId) {
      baseQuery.author = filters.userId;
    }

    // Determine sort field
    const sortField = "createdAt";
    const sort: any = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const posts = await Post.find(baseQuery)
      .populate("author", "firstName lastName username avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter posts based on visibility rules for followers posts
    const filteredPosts = [];
    for (const post of posts) {
      const canView = await this.canViewPost(post, userId);
      if (canView) {
        filteredPosts.push(post);
      }
    }

    return filteredPosts;
  }

  private async searchHashtags(
    query: string,
    page: number,
    limit: number,
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const hashtag = query.startsWith("#") ? query.substring(1) : query;
    const regex = new RegExp(`#${hashtag}\\b`, "i");

    // Build base query for posts containing hashtag
    const baseQuery: any = {
      content: { $regex: regex },
    };

    // Apply visibility filter
    if (!userId) {
      baseQuery.visibility = "public";
    } else {
      const visibilityConditions: any[] = [{ visibility: "public" }];
      visibilityConditions.push({
        $and: [
          { author: new mongoose.Types.ObjectId(userId) },
          { visibility: { $in: ["private", "followers"] } },
        ],
      });
      baseQuery.$or = visibilityConditions;
    }

    const posts = await Post.find(baseQuery)
      .populate("author", "firstName lastName username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter posts based on visibility rules
    const filteredPosts: any[] = [];
    for (const post of posts) {
      const canView = await this.canViewPost(post, userId);
      if (canView) {
        filteredPosts.push(post);
      }
    }

    // Extract unique hashtags and count
    const hashtagMap = new Map<string, number>();
    filteredPosts.forEach((post: any) => {
      const hashtags = post.content.match(/#\w+/g) || [];
      hashtags.forEach((tag: string) => {
        const normalizedTag = tag.toLowerCase();
        if (normalizedTag.includes(hashtag.toLowerCase())) {
          hashtagMap.set(normalizedTag, (hashtagMap.get(normalizedTag) || 0) + 1);
        }
      });
    });

    const hashtagResults = Array.from(hashtagMap.entries()).map(([tag, count]) => ({
      tag,
      count,
      posts: filteredPosts.filter((post: any) =>
        post.content.toLowerCase().includes(tag)
      ),
    }));

    return hashtagResults.slice(0, limit);
  }

  private async canViewPost(post: any, userId?: string): Promise<boolean> {
    // Public posts: always visible
    if (post.visibility === "public") {
      return true;
    }

    // If user not logged in, only public posts are visible
    if (!userId) {
      return false;
    }

    // Get author ID (handle both Mongoose document and plain object)
    const authorId =
      typeof post.author === "object" && post.author._id
        ? post.author._id.toString()
        : post.author.toString();

    // Private posts: only author can view
    if (post.visibility === "private") {
      return authorId === userId;
    }

    // Followers posts: author or followers can view
    if (post.visibility === "followers") {
      // Author can always view their own posts
      if (authorId === userId) {
        return true;
      }

      // Check if user is following the author
      const follow = await Follow.findOne({
        follower: userId,
        following: authorId,
      });

      return !!follow;
    }

    return false;
  }
}

export const searchService = new SearchService();

