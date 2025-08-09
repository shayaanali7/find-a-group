'use client'
import { createClient } from '@/app/utils/supabase/client';
import { getProfileInformationClient } from '@/app/utils/supabaseComponets/clientUtils';
import OptionOnPostButton from '@/app/components/OptionOnPostButton';
import getUserClient from '@/app/utils/supabaseComponets/getUserClient';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState, useMemo, memo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

interface CommentsData {
  comments: Comment[];
  users: CommentsUser[];
  likes: CommentLike[];
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

const CommentSkeleton = memo(function CommentSkelton({ isReply = false }: { isReply?: boolean }) {
  return (
    <div className={`${isReply ? 'ml-6 border-l border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="min-w-0 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="mb-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-6 bg-gray-200 rounded-full w-12"></div>
          <div className="h-6 bg-gray-200 rounded-full w-12"></div>
        </div>
      </div>
    </div>
  )
});

const CommentsLoadingSkeleton = memo(function CommentsLoadingSkelton() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
      </div>
      <div className="space-y-4">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
        <div className="ml-6">
          <CommentSkeleton isReply />
        </div>
        <CommentSkeleton />
      </div>
    </div>
  )
});

const CommentItem = memo(function CommentItem({ 
  comment, 
  depth, 
  userInfo, 
  isLiked, 
  likeCount, 
  isLikeLoading,
  replyingTo,
  replyText,
  isSubmittingReply,
  collapsedReplies,
  onLikeClick,
  onReplyClick,
  onReplyCancel,
  onReplySubmit,
  onToggleReplies,
  onReplyTextChange,
  formatDate,
  getUserInfo,
  isCommentLiked,
  getCommentLikeCount,
  likeLoadingStates,
  currentUserId 
}: {
  comment: ThreadedComment;
  depth: number;
  userInfo: CommentsUser;
  isLiked: boolean;
  likeCount: number;
  isLikeLoading: boolean;
  replyingTo: number | null;
  replyText: string;
  isSubmittingReply: boolean;
  collapsedReplies: Set<number>;
  onLikeClick: (commentId: number) => void;
  onReplyClick: (commentId: number, event?: React.MouseEvent) => void;
  onReplyCancel: () => void;
  onReplySubmit: (commentId: number) => void;
  onToggleReplies: (commentId: number, event?: React.MouseEvent) => void;
  onReplyTextChange: (text: string) => void;
  formatDate: (date: string) => string;
  getUserInfo: (userId: string) => CommentsUser;
  isCommentLiked: (commentId: number) => boolean;
  getCommentLikeCount: (commentId: number) => number;
  likeLoadingStates: Set<number>;
  currentUserId: string | null;
}) {
  const hasReplies = comment.replies && comment.replies.length > 0;
  const areRepliesCollapsed = collapsedReplies.has(comment.comment_id);

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 transform transition-all hover:scale-101 duration-300">
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
              <div className="w-8 h-8 bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
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

          <div className='flex justify-end items-center gap-2 ml-auto'>
            <OptionOnPostButton 
              post={comment.comment_id.toString()} 
              isOwnPost={currentUserId === comment.user_id}
              isComment={true} 
            />
          </div>
        </div>

        <div className="mb-3">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {comment.context}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onLikeClick(comment.comment_id)}
            disabled={isLikeLoading}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
              isLiked
                ? 'text-purple-600 hover:bg-gray-100'
                : 'text-gray-500 hover:text-purple-600 hover:bg-gray-100'
            } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLikeLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Heart
                size={16}
                className={isLiked ? 'fill-current' : ''}
              />
            )}
            <span>{likeCount}</span>
          </button>

          <button
            onClick={(e) => onReplyClick(comment.comment_id, e)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <MessageCircle size={16} />
            <span>Reply</span>
          </button>

          {hasReplies && (
            <button
              onClick={(e) => onToggleReplies(comment.comment_id, e)}
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
              onChange={(e) => onReplyTextChange(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={onReplyCancel}
                disabled={isSubmittingReply}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onReplySubmit(comment.comment_id)}
                disabled={!replyText.trim() || isSubmittingReply}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmittingReply && <Loader2 size={14} className="animate-spin" />}
                {isSubmittingReply ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {hasReplies && !areRepliesCollapsed && (
        <div className="mt-2">
          {comment.replies.map(reply => {
            const replyUserInfo = getUserInfo(reply.user_id);
            const replyIsLiked = isCommentLiked(reply.comment_id);
            const replyLikeCount = getCommentLikeCount(reply.comment_id);
            const replyIsLikeLoading = likeLoadingStates.has(reply.comment_id);
            
            return (
              <CommentItem
                key={reply.comment_id}
                comment={reply}
                depth={depth + 1}
                userInfo={replyUserInfo} 
                isLiked={replyIsLiked}       
                likeCount={replyLikeCount}      
                isLikeLoading={replyIsLikeLoading}
                replyingTo={replyingTo}
                replyText={replyText}
                isSubmittingReply={isSubmittingReply}
                collapsedReplies={collapsedReplies}
                onLikeClick={onLikeClick}
                onReplyClick={onReplyClick}
                onReplyCancel={onReplyCancel}
                onReplySubmit={onReplySubmit}
                onToggleReplies={onToggleReplies}
                onReplyTextChange={onReplyTextChange}
                formatDate={formatDate}
                getUserInfo={getUserInfo}
                isCommentLiked={isCommentLiked}
                getCommentLikeCount={getCommentLikeCount}
                likeLoadingStates={likeLoadingStates}
                currentUserId={currentUserId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

const fetchCommentsData = async (postId: string): Promise<CommentsData> => {
  const supabase = await createClient();
  
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('comment_id, user_id, context, created_at, updated_at, parent_comment_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (commentsError) {
    throw new Error(`Error fetching comments: ${commentsError.message}`);
  }

  if (!commentsData || commentsData.length === 0) {
    return { comments: [], users: [], likes: [] };
  }

  const uniqueUserIds = [...new Set(commentsData.map(c => c.user_id))];
  const userPromises = uniqueUserIds.map(async (userId) => {
    const profile = await getProfileInformationClient(userId);
    if (profile) {
      return {
        userId,
        name: profile.name || 'Unknown User',
        username: profile.username || 'Unknown User',
        profilePictureUrl: profile.profile_picture_url || ''
      };
    }
    return {
      userId,
      name: 'Unknown User',
      username: 'unknown',
      profilePictureUrl: ''
    };
  });
  
  const users = await Promise.all(userPromises);
  const commentIds = commentsData.map(c => c.comment_id);
  const { data: likesData, error: likesError } = await supabase
    .from('comment_likes')
    .select('comment_id, user_id')
    .in('comment_id', commentIds);
    
  if (likesError) {
    console.error('Error fetching comment likes:', likesError.message);
  }

  return {
    comments: commentsData,
    users,
    likes: likesData || []
  };
};

const addComment = async ({ postId, userId, context, parentCommentId }: {
  postId: string;
  userId: string;
  context: string;
  parentCommentId?: number;
}) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      post_id: postId,
      user_id: userId,
      context: context.trim(),
      parent_comment_id: parentCommentId,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error adding comment: ${error.message}`);
  }
  
  return data;
};

const toggleCommentLike = async ({ commentId, userId, isLiked }: {
  commentId: number;
  userId: string;
  isLiked: boolean;
}) => {
  const supabase = await createClient();
  
  if (isLiked) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Error removing like: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId });
    
    if (error) {
      throw new Error(`Error adding like: ${error.message}`);
    }
  }
  
  return { commentId, userId, isLiked: !isLiked };
};

const RenderCommentSection = ({ postId }: { postId: string }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [collapsedReplies, setCollapsedReplies] = useState<Set<number>>(new Set());
  const [likeLoadingStates, setLikeLoadingStates] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();
  const {
    data: commentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchCommentsData(postId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      const previousComments = queryClient.getQueryData(['comments', postId]);
      if (previousComments && currentUser) {
        const optimisticComment: Comment = {
          comment_id: Date.now(),
          user_id: currentUser,
          context: newComment.context,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          parent_comment_id: newComment.parentCommentId,
        };

        queryClient.setQueryData(['comments', postId], (old: CommentsData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            comments: [...old.comments, optimisticComment]
          };
        });
      }

      return { previousComments };
    },
    onError: (err, newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
      console.error('Error adding comment:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: toggleCommentLike,
    onMutate: async ({ commentId, userId, isLiked }) => {
      setLikeLoadingStates(prev => new Set(prev).add(commentId));
      
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData(['comments', postId]);

      queryClient.setQueryData(['comments', postId], (old: CommentsData | undefined) => {
        if (!old) return old;
        
        let updatedLikes;
        if (isLiked) {
          updatedLikes = old.likes.filter(like => 
            !(like.comment_id === commentId && like.user_id === userId)
          );
        } else {
          updatedLikes = [...old.likes, { comment_id: commentId, user_id: userId }];
        }
        
        return {
          ...old,
          likes: updatedLikes
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
      console.error('Error toggling like:', err);
    },
    onSettled: (data) => {
      if (data) {
        setLikeLoadingStates(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.commentId);
          return newSet;
        });
      }
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserClient();
      if (user && user.id) {
        setCurrentUser(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!commentsData?.comments.length) return;

    const setupRealtimeSubscription = async () => {
      const supabase = await createClient();
      const commentIds = commentsData.comments.map(c => c.comment_id);

      const channel = supabase
        .channel(`comments:${postId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        })
        .subscribe();

      const likesChannel = supabase
        .channel(`comment_likes:${postId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
          filter: `comment_id=in.(${commentIds.join(',')})`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(likesChannel);
      };
    };

    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [postId, commentsData?.comments, queryClient]);

  const userLookupMap = useMemo(() => {
    if (!commentsData?.users) return new Map();
    const map = new Map<string, CommentsUser>();
    commentsData.users.forEach(user => {
      map.set(user.userId, user);
    });
    return map;
  }, [commentsData?.users]);

  const likesMap = useMemo(() => {
    if (!commentsData?.likes) return { userLikesMap: new Map(), likeCountsMap: new Map() };
    const userLikesMap = new Map<string, Set<number>>();
    const likeCountsMap = new Map<number, number>();
    
    commentsData.likes.forEach(like => {
      if (!userLikesMap.has(like.user_id)) {
        userLikesMap.set(like.user_id, new Set());
      }
      userLikesMap.get(like.user_id)!.add(like.comment_id);
      
      likeCountsMap.set(
        like.comment_id, 
        (likeCountsMap.get(like.comment_id) || 0) + 1
      );
    });
    
    return { userLikesMap, likeCountsMap };
  }, [commentsData?.likes]);

  const threadedComments = useMemo(() => {
    if (!commentsData?.comments) return [];
    return organizeComments(commentsData.comments);
  }, [commentsData?.comments]);

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const isCommentLiked = useCallback((commentId: number) => {
    return currentUser && likesMap.userLikesMap.get(currentUser)?.has(commentId) || false;
  }, [currentUser, likesMap.userLikesMap]);

  const getCommentLikeCount = useCallback((commentId: number) => {
    return likesMap.likeCountsMap.get(commentId) || 0;
  }, [likesMap.likeCountsMap]);

  const handleLikeClick = useCallback((commentId: number) => {
    if (!currentUser) return;
    
    const isLiked = isCommentLiked(commentId);
    toggleLikeMutation.mutate({ commentId, userId: currentUser, isLiked });
  }, [currentUser, isCommentLiked, toggleLikeMutation]);

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

  const handleReplySubmit = useCallback((parentCommentId: number) => {
    if (!replyText.trim() || !currentUser) return;

    addCommentMutation.mutate({
      postId,
      userId: currentUser,
      context: replyText.trim(),
      parentCommentId,
    }, {
      onSuccess: () => {
        setReplyText('');
        setReplyingTo(null);
      }
    });
  }, [replyText, currentUser, postId, addCommentMutation]);

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

  const getUserInfo = useCallback((userId: string) => {
    return userLookupMap.get(userId) || {
      userId,
      name: 'Unknown User',
      username: 'unknown',
      profilePictureUrl: ''
    };
  }, [userLookupMap]);

  const renderComment = useCallback((comment: ThreadedComment, depth: number = 0) => {
    const userInfo = getUserInfo(comment.user_id);
    const isLiked = isCommentLiked(comment.comment_id);
    const likeCount = getCommentLikeCount(comment.comment_id);
    const isLikeLoading = likeLoadingStates.has(comment.comment_id);

    return (
      <CommentItem
        key={comment.comment_id}
        comment={comment}
        depth={depth}
        userInfo={userInfo}
        isLiked={isLiked}
        likeCount={likeCount}
        isLikeLoading={isLikeLoading}
        replyingTo={replyingTo}
        replyText={replyText}
        isSubmittingReply={addCommentMutation.isPending}
        collapsedReplies={collapsedReplies}
        onLikeClick={handleLikeClick}
        onReplyClick={handleReplyClick}
        onReplyCancel={handleReplyCancel}
        onReplySubmit={handleReplySubmit}
        onToggleReplies={toggleRepliesCollapse}
        onReplyTextChange={setReplyText}
        formatDate={formatDate}
        getUserInfo={getUserInfo}
        isCommentLiked={isCommentLiked}
        getCommentLikeCount={getCommentLikeCount}
        likeLoadingStates={likeLoadingStates}
        currentUserId={currentUser}
      />
    );
  }, [
    getUserInfo,
    isCommentLiked,
    getCommentLikeCount,
    likeLoadingStates,
    replyingTo,
    replyText,
    addCommentMutation.isPending,
    collapsedReplies,
    handleLikeClick,
    handleReplyClick,
    handleReplyCancel,
    handleReplySubmit,
    toggleRepliesCollapse,
    formatDate,
    currentUser
  ]);

  if (isLoading) {
    return <CommentsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading comments</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const comments = commentsData?.comments || [];
  
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