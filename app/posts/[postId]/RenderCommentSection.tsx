'use client'
import { createClient } from '@/app/utils/supabase/client';
import { getProfileInformationClient } from '@/app/utils/supabaseComponets/clientUtils';
import getUserClient from '@/app/utils/supabaseComponets/getUserClient';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react'

interface Comment {
  comment_id: number;
  user_id: string;
  context: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: number;
}

interface ThreadedComment extends Comment {
  replies: ThreadedComment[];
}

interface CommentsUser {
  userId: string,
  name: string,
  username: string,
  profilePictureUrl: string
}

interface CommentLike {
  comment_id: number;
  user_id: string;
}

const organizeComments = (comments: Comment[]): ThreadedComment[] => {
  const commentMap = new Map<number, ThreadedComment>();
  const rootComments: ThreadedComment[] = [];

  comments.forEach(comment => {
    commentMap.set(comment.comment_id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.comment_id)!;
    
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
};

const RenderCommentSection = ({ postId }: { postId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsUser, setCommentsUser] = useState<CommentsUser[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<CommentLike[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [collapsedReplies, setCollapsedReplies] = useState<Set<number>>(new Set());

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserClient();
      if (user && user.id) {
        setCurrentUser(user.id);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      const supabase = await createClient();
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('comment_id, user_id, context, created_at, updated_at, parent_comment_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError.message);
      }
      
      if (commentsData) {
        setComments(commentsData);
        setCommentsUser([]);

        const userPromises = commentsData.map(async (comment) => {
          const profile = await getProfileInformationClient(comment.user_id);
          if (profile) {
            return {
              userId: comment.user_id,
              name: profile.name || 'Unknown User',
              username: profile.username || 'Unknown User',
              profilePictureUrl: profile.profile_picture_url || ''
            };
          }
          return null;
        });
        
        const users = await Promise.all(userPromises);
        const validUsers = users.filter(user => user !== null) as CommentsUser[];
        setCommentsUser(validUsers);

        // Get comment IDs for filtering likes
        const commentIds = commentsData.map(c => c.comment_id);

        const { data: likesData, error: likesError } = await supabase
          .from('comment_likes')
          .select('comment_id, user_id')
          .in('comment_id', commentIds);
          
        if (likesError) {
          console.error('Error fetching comment likes:', likesError.message);
        }
        if (likesData) {
          setCommentLikes(likesData);
        }

        // Comments subscription
        const channel = supabase
          .channel(`comments:${postId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          }, async (payload) => {
            const newComment = payload.new as Comment;
            setComments(prev => [...prev, newComment]);
            
            // Fetch user info for the new comment
            const profile = await getProfileInformationClient(newComment.user_id);
            if (profile) {
              const newUser = {
                userId: newComment.user_id,
                name: profile.name || 'Unknown User',
                username: profile.username || 'Unknown User',
                profilePictureUrl: profile.profile_picture_url || ''
              };
              setCommentsUser(prev => {
                // Avoid duplicates
                if (!prev.find(user => user.userId === newUser.userId)) {
                  return [...prev, newUser];
                }
                return prev;
              });
            }
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          }, (payload) => {
            setComments(prev => prev.map(comment => 
              comment.comment_id === (payload.new as Comment).comment_id 
                ? payload.new as Comment 
                : comment
            ));
          })
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          }, (payload) => {
            setComments(prev => prev.filter(comment => 
              comment.created_at !== payload.old.created_at
            ));
          })
          .subscribe();

        // Fixed comment likes subscription - filter by comment IDs from this post
        const likesChannel = supabase
          .channel(`comment_likes:${postId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'comment_likes',
            filter: `comment_id=in.(${commentIds.join(',')})`  // Only listen to likes for this post's comments
          }, (payload) => {
            const newLike = payload.new as CommentLike;
            // Only add if it's for a comment on this post
            if (commentIds.includes(newLike.comment_id)) {
              setCommentLikes(prev => {
                // Avoid duplicates
                const exists = prev.some(like => 
                  like.comment_id === newLike.comment_id && 
                  like.user_id === newLike.user_id
                );
                if (!exists) {
                  return [...prev, newLike];
                }
                return prev;
              });
            }
          })
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'comment_likes',
            filter: `comment_id=in.(${commentIds.join(',')})`  // Only listen to unlikes for this post's comments
          }, (payload) => {
            const deletedLike = payload.old as CommentLike;
            setCommentLikes(prev => prev.filter(like => 
              !(like.comment_id === deletedLike.comment_id && 
                like.user_id === deletedLike.user_id)
            ));
          })
          .subscribe();
        
        return () => {
          supabase.removeChannel(channel);
          supabase.removeChannel(likesChannel);
        };
      }
    };
    
    fetchComments();
  }, [postId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const isCommentLiked = (commentId: number) => {
    return currentUser && commentLikes.some(like => 
      like.comment_id === commentId && like.user_id === currentUser
    );
  };

  const getCommentLikeCount = (commentId: number) => {
    return commentLikes.filter(like => like.comment_id === commentId).length;
  };

  const handleLikeClick = async (commentId: number) => {
    if (!currentUser) return;

    const isLiked = isCommentLiked(commentId);
    const supabase = await createClient();
    
    try {
      if (isLiked) {
        // Optimistically update UI
        setCommentLikes(prev => prev.filter(like => 
          !(like.comment_id === commentId && like.user_id === currentUser)
        ));
        
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser);
        
        if (error) {
          console.error('Error deleting like:', error.message);
          // Revert optimistic update on error
          setCommentLikes(prev => [...prev, { comment_id: commentId, user_id: currentUser }]);
        }
      } else {
        // Optimistically update UI
        setCommentLikes(prev => [...prev, { comment_id: commentId, user_id: currentUser }]);
        
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: currentUser });
        
        if (error) {
          console.error('Error inserting like:', error.message);
          // Revert optimistic update on error
          setCommentLikes(prev => prev.filter(like => 
            !(like.comment_id === commentId && like.user_id === currentUser)
          ));
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleReplyClick = useCallback((comment_id: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (replyingTo === comment_id) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo(comment_id);
      setReplyText('');
    }
  }, [replyingTo]);

  const handleReplyCancel = useCallback(() => {
    setReplyingTo(null);
    setReplyText('');
  }, []);

  const handleReplySubmit = async(parentCommentId: number) => {
    if (!replyText.trim() || !currentUser) return;

    setIsSubmittingReply(true);
    const supabase = await createClient();
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: currentUser,
            context: replyText.trim(),
            parent_comment_id: parentCommentId,
          }
        ]);
      if (error) {
        console.error('Error adding reply:', error.message);
      } else {
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  }

  const toggleRepliesCollapse = useCallback((commentId: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setCollapsedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const getUserInfo = (userId: string) => {
    return commentsUser.find(user => user.userId === userId) || {
      userId,
      name: 'Unknown User',
      username: 'unknown',
      profilePictureUrl: ''
    };
  };

  const renderComment = (comment: ThreadedComment, depth: number = 0) => {
    const userInfo = getUserInfo(comment.user_id);
    const isLiked = isCommentLiked(comment.comment_id);
    const likeCount = getCommentLikeCount(comment.comment_id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const areRepliesCollapsed = collapsedReplies.has(comment.comment_id);

    return (
      <div
        key={comment.comment_id}
        className={`${depth > 0 ? 'ml-6 border-l border-gray-200 pl-4' : ''} mb-4`}
      >
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Link 
                  href={userInfo?.username ? `/user/${userInfo?.username}` : '/profilePage'}
                  className="flex items-start gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {userInfo?.profilePictureUrl ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image 
                        src={userInfo?.profilePictureUrl} 
                        width={32} 
                        height={32} 
                        alt={`${userInfo.name || userInfo.username}'s profile picture`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {userInfo?.name.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                      {userInfo?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs whitespace-nowrap">
                      <span>@{userInfo?.username || 'unknown'}</span>
                      <span>• {formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                </Link>
          </div>

          <div className="mb-3">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {comment.context}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLikeClick(comment.comment_id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
                isLiked
                  ? 'text-purple-600 hover:bg-gray-100'
                  : 'text-gray-500 hover:text-purple-600 hover:bg-gray-100'
              }`}
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-current' : ''}
              />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={(e) => handleReplyClick(comment.comment_id, e)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <MessageCircle size={16} />
              <span>Reply</span>
            </button>

            {hasReplies && (
              <button
                onClick={(e) => toggleRepliesCollapse(comment.comment_id, e)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                {areRepliesCollapsed ? (
                  <>
                    <ChevronDown size={16} />
                    <span>Show {comment.replies.length} replies</span>
                  </>
                ) : (
                  <>
                    <ChevronUp size={16} />
                    <span>Hide replies</span>
                  </>
                )}
              </button>
            )}
          </div>

          {replyingTo === comment.comment_id && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={handleReplyCancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReplySubmit(comment.comment_id)}
                  disabled={!replyText.trim() || isSubmittingReply}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingReply ? 'Replying...' : 'Reply'}
                </button>
              </div>
            </div>
          )}
        </div>
        {hasReplies && !areRepliesCollapsed && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const threadedComments = organizeComments(comments);
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Comments ({comments.length})
        </h2>
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      <div className="space-y-4">
        {threadedComments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

export default RenderCommentSection;