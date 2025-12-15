import { User } from "@modules/auth/models/User.model";
import { NotFoundError, ConflictError } from "@shared/utils/errors";
import { UserProfileResponse, UpdateProfileDto } from "../types/users.types";
import { Post } from "@modules/posts/models/Post.model";
import { Follow } from "@modules/follows/models/Follow.model";
import { cloudinaryService } from "@shared/config/cloudinary";

class UsersService {
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get stats in parallel
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
    ]);

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      isEmailVerified: user.isEmailVerified,
      stats: {
        postsCount,
        followersCount,
        followingCount,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
    avatarFile?: Express.Multer.File
  ): Promise<UserProfileResponse> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Validate username unique if username is being changed
    if (data.username && data.username !== user.username) {
      const existingUser = await User.findOne({
        username: data.username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new ConflictError("Username already taken");
      }
    }

    // Upload new avatar if provided
    if (avatarFile) {
      // Delete old avatar from Cloudinary if exists
      if (user.avatar) {
        try {
          // Extract public_id from avatar URL
          const urlParts = user.avatar.split("/");
          const publicIdWithExt = urlParts
            .slice(urlParts.indexOf("social-media") + 1)
            .join("/");
          const publicId = publicIdWithExt.split(".")[0];
          if (publicId) {
            await cloudinaryService.deleteFile(publicId);
          }
        } catch (error) {
          // Ignore error if avatar doesn't exist in Cloudinary
          console.warn("Error deleting old avatar:", error);
        }
      }

      // Upload new avatar
      const uploadResult = await cloudinaryService.uploadFile(avatarFile, {
        folder: "social-media/avatars",
        resource_type: "image",
      });

      user.avatar = uploadResult.secure_url;
    }

    // Update fields
    if (data.firstName !== undefined) {
      user.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      user.lastName = data.lastName;
    }
    if (data.username !== undefined) {
      user.username = data.username;
    }
    if (data.bio !== undefined) {
      user.bio = data.bio;
    }

    await user.save();

    // Return updated profile with stats
    return this.getUserProfile(userId);
  }
}

export const usersService = new UsersService();

