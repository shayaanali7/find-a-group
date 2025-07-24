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
  number_of_likes?: number;
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
        .select('comment_id, user_id, context, created_at, updated_at, number_of_likes, parent_comment_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
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
      }

      const channel = supabase
        .channel(`comments:${postId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          },
          (payload) => {
            setComments(prev => [...prev, payload.new as Comment]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          },
          (payload) => {
            setComments(prev => prev.map(comment => comment.comment_id === (payload.new as Comment).comment_id ? payload.new as Comment : comment))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          },
          (payload) => {
            setComments(prev => prev.filter(comment => comment.created_at !== payload.old.created_at))
          }
        )
        .subscribe();

        const likesChannel = supabase
        .channel(`comment_likes:${postId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comment_likes'
          },
          (payload) => {
            setCommentLikes(prev => [...prev, payload.new as CommentLike]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'comment_likes'
          },
          (payload) => {
            setCommentLikes(prev => prev.filter(like => 
              !(like.comment_id === (payload.old as CommentLike).comment_id && 
                like.user_id === (payload.old as CommentLike).user_id)
            ));
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(likesChannel);
      };
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

  const handleLikeClick = async (commentId: number) => {
    if (!currentUser) return;

    const comment = comments.find(c => c.comment_id === commentId);
    if (!comment) return;

    const isLiked = isCommentLiked(commentId);
    if (isLiked) {
      setCommentLikes(prev => prev.filter(like => 
        !(like.comment_id === commentId && like.user_id === currentUser)
      ));
      setComments(prev => prev.map(c => 
        c.comment_id === commentId 
          ? { ...c, number_of_likes: Math.max((c.number_of_likes || 0) - 1, 0) }
          : c
      ));

      try {
        const supabase = await createClient();
        const { error: deleteError } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser);
        
        if (deleteError) {
          console.error('Error deleting like:', deleteError.message);
          setCommentLikes(prev => [...prev, { comment_id: commentId, user_id: currentUser }]);
          setComments(prev => prev.map(c => 
            c.comment_id === commentId 
              ? { ...c, number_of_likes: (c.number_of_likes || 0) + 1 }
              : c
          ));
          return;
        }

        const { error: updateError } = await supabase
          .from('comments')
          .update({ number_of_likes: Math.max((comment.number_of_likes || 0) - 1, 0) })
          .eq('comment_id', commentId);
        
        if (updateError) {
          console.error('Error updating comment likes:', updateError.message);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setCommentLikes(prev => [...prev, { comment_id: commentId, user_id: currentUser }]);
        setComments(prev => prev.map(c => 
          c.comment_id === commentId 
            ? { ...c, number_of_likes: (c.number_of_likes || 0) + 1 }
            : c
        ));
      }
    } else {
      setCommentLikes(prev => [...prev, { comment_id: commentId, user_id: currentUser }]);
      setComments(prev => prev.map(c => 
        c.comment_id === commentId 
          ? { ...c, number_of_likes: (c.number_of_likes || 0) + 1 }
          : c
      ));
      
      try {
        const supabase = await createClient();
        const { error: insertError } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: currentUser });
        
        if (insertError) {
          console.error('Error inserting like:', insertError.message);
          setCommentLikes(prev => prev.filter(like => 
            !(like.comment_id === commentId && like.user_id === currentUser)
          ));
          setComments(prev => prev.map(c => 
            c.comment_id === commentId 
              ? { ...c, number_of_likes: Math.max((c.number_of_likes || 0) - 1, 0) }
              : c
          ));
          return;
        }

        const { error: updateError } = await supabase
          .from('comments')
          .update({ number_of_likes: (comment.number_of_likes || 0) + 1 })
          .eq('comment_id', commentId);
        
        if (updateError) {
          console.error('Error updating comment likes:', updateError.message);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setCommentLikes(prev => prev.filter(like => 
          !(like.comment_id === commentId && like.user_id === currentUser)
        ));
        setComments(prev => prev.map(c => 
          c.comment_id === commentId 
            ? { ...c, number_of_likes: Math.max((c.number_of_likes || 0) - 1, 0) }
            : c
        ));
      }
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
            number_of_likes: 0
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

  const CommentItem = React.memo(({ 
    comment, 
    depth = 0 
  }: { 
    comment: ThreadedComment, 
    depth?: number 
  }) => {
    const userProfile = commentsUser.find(user => user.userId === comment.user_id);
    const isLiked = isCommentLiked(comment.comment_id);
    const maxDepth = 6;
    const currentDepth = Math.min(depth, maxDepth);
    const hasReplies = comment.replies.length > 0;
    const repliesCollapsed = collapsedReplies.has(comment.comment_id);

    return (
      <div className={`${currentDepth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div 
          className="border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 p-4 transition-all duration-150"
        >
          <div className="flex items-start gap-3">
            <Link
              href={userProfile?.username ? `/user/${userProfile?.username}` : '/profilePage'}
              className="flex items-start gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              {userProfile?.profilePictureUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image 
                    src={userProfile?.profilePictureUrl} 
                    width={32} 
                    height={32} 
                    alt={`${userProfile.name || userProfile.username}'s profile picture`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                  {userProfile?.name || 'Unknown User'}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-xs whitespace-nowrap">
                  <span>@{userProfile?.username || 'unknown'}</span>
                  <span>• {formatDate(comment.created_at)}</span>
                </div>
              </div>
            </Link>
          </div>

          <div className='pl-12'>
            <div className="min-w-0 flex-1">
              <div className="mb-2 mt-2">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-sm w-full overflow-wrap break-word">
                  {comment.context}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-3 pt-2">
                <button 
                  className={`flex items-center space-x-1 transition-colors duration-150 text-sm ${
                    isLiked 
                      ? 'text-purple-500 hover:text-purple-600' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`} 
                  onClick={() => handleLikeClick(comment.comment_id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
                  />
                  <span>{comment.number_of_likes || 0}</span>
                  <span>{isLiked ? 'Likes' : 'Like'}</span>
                </button>
                
                <button 
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors duration-150 text-sm" 
                  onClick={(e) => handleReplyClick(comment.comment_id, e)}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{replyingTo === comment.comment_id ? 'Cancel' : 'Reply'}</span>
                </button>

                {hasReplies && (
                  <button 
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-150 text-sm"
                    onClick={(e) => toggleRepliesCollapse(comment.comment_id, e)}
                  >
                    {repliesCollapsed ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Show {comment.replies.length} replies</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Hide replies</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {replyingTo === comment.comment_id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${userProfile?.name || 'Unknown User'}...`}
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        rows={3}
                        maxLength={500}
                        autoFocus
                      />
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {replyText.length}/500
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleReplyCancel}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplySubmit(comment.comment_id)}
                            disabled={!replyText.trim() || isSubmittingReply}
                            className="px-4 py-1.5 bg-purple-500 text-white rounded-md text-sm hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSubmittingReply ? 'Posting...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>  
        </div>
        {hasReplies && !repliesCollapsed && (
          <div className="space-y-1">
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.comment_id}
                comment={reply} 
                depth={currentDepth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  });
  CommentItem.displayName = 'CommentItem';
  const organizedComments = React.useMemo(() => organizeComments(comments), [comments]);

  return (
    <div className="space-y-1 max-w-full">
      {organizedComments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">💬</div>
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 px-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {comments.length} Comment{comments.length !== 1 ? 's' : ''}
            </h3>
          </div>
          
          {organizedComments.map((comment) => (
            <CommentItem 
              key={comment.comment_id}
              comment={comment}
              depth={0}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default RenderCommentSection