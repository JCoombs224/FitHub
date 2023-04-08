// A class representing a Comment with various properties
export class Comment {
  constructor(
    public username: string, // The username of the person who made the comment
    public content: string, // The content of the comment
    public likes: number, // The number of likes the comment has received
    public replies: Reply[], // An array containing the replies to the comment
    public showReplyBox: boolean, // A boolean indicating whether the reply box should be shown
    public newReply: string, // The content of a new reply being composed
    public liked: boolean = false, // A boolean indicating whether the current user has liked the comment
    public lastLikes: number = 0 // The number of likes the comment had when last updated
  ) {}
}

// A class representing a Reply with various properties
export class Reply {
  constructor(
    public username: string, // The username of the person who made the reply
    public content: string, // The content of the reply
  ) {}
}