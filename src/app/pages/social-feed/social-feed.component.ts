import { Component } from '@angular/core';
import { Post } from './post.model';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Comment } from './comment.model';


@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.css'],
})
export class SocialFeedComponent {
  posts: Post[] = [
    new Post(
      'Username1',
      new Date('2023-04-07'),
      'This is a sample post in the social feed.',
      10,
      [new Comment('Commenter1', 'Sample comment 1', 0, [], false, '')],
      1,
      false,
      '',
      1
    ),
    new Post(
      'Username2',
      new Date('2023-04-06'),
      'This is another sample post.',
      20,
      [new Comment('Commenter2', 'Sample comment 2', 0, [], false, '')],
      1,
      false,
      '',
      2
    ),
  ];
  

  likedPosts = new Set<number>();

  onLike(post: Post) {
    const postId = this.posts.indexOf(post);
    if (this.likedPosts.has(postId)) {
      post.likes--;
      this.likedPosts.delete(postId);
    } else {
      post.likes++;
      this.likedPosts.add(postId);
    }
    post.liked = this.likedPosts.has(postId);
  }
  
  onComment(post: Post) {
    if (post.showComments) {
      post.comments.forEach((comment) => {
        comment.lastLikes = comment.likes;
      });
    }
    post.showComments = !post.showComments;
  }
  
  postComment(post: Post) {
    if (post.newComment.trim()) {
      post.comments.push(new Comment('CurrentUsername', post.newComment, 0, [], false, ''));
      post.newComment = '';
      post.commentsCount++;
    }
  }

  onCommentLike(comment: Comment) {
    const postIndex = this.posts.findIndex(post => post.comments.includes(comment));
    const post = this.posts[postIndex];
    const commentIndex = post.comments.indexOf(comment);
    if (!comment.liked) {
      comment.likes++;
      comment.liked = true;
    } else {
      comment.likes--;
      comment.liked = false;
    }
    if (post.showComments) {
      this.posts[postIndex].comments[commentIndex].liked = comment.liked;
    } else {
      this.posts[postIndex].comments[commentIndex] = comment;
    }
  }
  
  

  postReply(comment, replyContent: string) {
    if (replyContent.trim()) {
      comment.replies.push({
        username: 'CurrentUsername', // Replace with the current user's name
        content: replyContent,
      });
    }
  }

  loadMorePosts() {
    const newPosts: Post[] = [
      new Post('Username3', new Date('2023-04-05'), 'Yet another sample post.', 15, [], 0, false, '', 3),
      new Post('Username4', new Date('2023-04-04'), 'And one more sample post.', 25, [], 0, false, '', 4),
    ];

    of(newPosts)
      .pipe(delay(1000)) // Simulate an API call with a delay
      .subscribe((loadedPosts) => {
        this.posts = [...this.posts, ...loadedPosts];
      });
  }
}