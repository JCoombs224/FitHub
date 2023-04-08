import { Component } from '@angular/core';
import { Post } from './post.model';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Comment } from './comment.model';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.css'],
})
export class SocialFeedComponent {
    // Sample data for the social feed
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
  
   // Set to store the liked posts by their index
  likedPosts = new Set<number>();

  // Handles the like functionality for a post
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
  
  // Toggles the visibility of comments on a post
  onComment(post: Post) {
    if (post.showComments) {
      post.comments.forEach((comment) => {
        comment.lastLikes = comment.likes;
      });
    }
    post.showComments = !post.showComments;
  }
  
   // Adds a new comment to a post
  postComment(post: Post) {
    if (post.newComment.trim()) {
      post.comments.push(new Comment('CurrentUsername', post.newComment, 0, [], false, ''));
      post.newComment = '';
      post.commentsCount++;
    }
  }
  // Handles the like functionality for a comment
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
  
   // Adds a new reply to a comment
  postReply(comment, replyContent: string) {
    if (replyContent.trim()) {
      comment.replies.push({
        username: 'CurrentUsername',
        content: replyContent,
      });
    }
  }

   // Loads more posts and adds them to the social feed
  loadMorePosts() {
    const newPosts: Post[] = [
      new Post('Username3', new Date('2023-04-05'), 'Yet another sample post.', 15, [], 0, false, '', 3),
      new Post('Username4', new Date('2023-04-04'), 'And one more sample post.', 25, [], 0, false, '', 4),
    ];

    of(newPosts)
      .pipe(delay(1000))
      .subscribe((loadedPosts) => {
        this.posts = [...this.posts, ...loadedPosts];
      });
  }
}