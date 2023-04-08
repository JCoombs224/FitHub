export class Comment {
  constructor(
    public username: string,
    public content: string,
    public likes: number,
    public replies: Reply[],
    public showReplyBox: boolean,
    public newReply: string,
    public liked: boolean = false,
    public lastLikes: number = 0
  ) {}
}

export class Reply {
  constructor(
    public username: string,
    public content: string,
  ) {}
}
