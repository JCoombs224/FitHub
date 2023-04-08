// post.model.ts
import { Comment } from './comment.model';

// A class representing a Post with various properties
export class Post {
  constructor(
    public username: string, // The username of the person who made the post
    public date: Date, // The date when the post was created
    public content: string, // The content of the post
    public likes: number, // The number of likes the post has received
    public comments: Comment[], // An array containing the comments on the post
    public commentsCount: number, // The number of comments on the post
    public showComments = false, // A boolean indicating whether the comments should be shown
    public newComment: string, // The content of a new comment being composed
    public id: number, // The unique identifier of the post
    public liked: boolean = false, // A boolean indicating whether the current user has liked the post
  ) {}
}
