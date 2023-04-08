import { Comment } from './comment.model';

export class Post {
  constructor(
    public username: string,
    public date: Date,
    public content: string,
    public likes: number,
    public comments: Comment[],
    public commentsCount: number,
    public showComments = false,
    public newComment: string,
    public id: number,
    public liked: boolean = false,
  ) {}
}