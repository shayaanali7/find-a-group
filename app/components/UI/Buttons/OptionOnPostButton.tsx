'use client'
import React, { useEffect, useState, useRef } from 'react'
import { AlertTriangle, BookOpen, CheckCircle, Clock, Ellipsis, Flag, Trash2 } from 'lucide-react';
import ModalScreen from '../Modals/ModalScreen';
import { createClient } from '../../../utils/supabase/client';
import getUserClient from '../../../utils/supabaseComponets/getUserClient';
import { getUsernameClient } from '../../../utils/supabaseComponets/clientUtils';
import { HiQuestionMarkCircle } from 'react-icons/hi';

const OptionOnPostButton = ({post, isOwnPost, isComment}: {post: string, isOwnPost: boolean, isComment?: boolean }) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [confirmationPanelOpen, setConfirmationPanelOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [deletePost, setDeletePost] = useState<boolean>(false);
  const [reportPost, setReportPost] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickForReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(false);
    setReportPost(true);
    setConfirmationPanelOpen(true);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(false);
    setDeletePost(true);
    setConfirmationPanelOpen(true);
  };

  const handleDeletePost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const supabase = createClient();
      if (isComment) {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('comment_id', post)
        if (error) throw new Error()
      }
      else {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('post_id', post)
        if (error) throw new Error()
      }

    } catch (error) {
      if (isComment) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
      } else {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    } finally {
      setTimeout(() => {
        setSuccess(true);
      }, 1000)
      setTimeout(() => {
        setDeletePost(false);
        setConfirmationPanelOpen(false);
      }, 1000)
      window.location.reload();
    }
  }

  const handleReportPost = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!reportReason.trim()) {
      alert('Please enter a reason for reporting.');
      return;
    }

    try {
      setIsLoading(true);
      const user =  await getUserClient();
      const username = await getUsernameClient(user);
      const supabase = createClient();

      if (isComment) {
        const { data, error: postIdError } = await supabase
          .from('comments')
          .select('post_id')
          .eq('comment_id', post)
        if (postIdError) {
          throw new Error();
        }
        if (!data) return;
        console.log(data);

        const { error } = await supabase
          .from('post_reports')
          .insert({
            post_id: data[0].post_id,
            comment_id: post,
            reason: reportReason,
            user_id: user.id,
            username: username.data?.username
          });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('post_reports')
          .insert({
            post_id: post,
            reason: reportReason,
            user_id: user.id,
            username: username.data?.username
          });
        if (error) throw new Error(error.message);
      }
      setSuccess(true);
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Failed to report post. Please try again.');
    } finally {
      setTimeout(() => {
        setConfirmationPanelOpen(false);
        setReportPost(false);
        setReportReason('');
        setSuccess(false);
      }, 1500);
      setIsLoading(false);
    }
  };

  const handleCloseModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmationPanelOpen(false);
    setDeletePost(false);
    setReportPost(false);
  };

  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  return (
    <>
      <div className='flex justify-end w-full relative' ref={dropdownRef}>
        <button 
          onClick={toggleOptions}
          className='p-1 hover:bg-gray-100 rounded-full transition-colors duration-200'
          aria-label="Post options"
        >
          <Ellipsis className="w-5 h-5 text-gray-500" />
        </button>

        <div className={`absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px] transition-all duration-200 origin-top-right ${
          showOptions 
            ? 'opacity-100 scale-100 transform translate-y-0' 
            : 'opacity-0 scale-95 transform -translate-y-2 pointer-events-none'
        }`}>
          <div className='py-1'>
            <button
              onClick={handleClickForReport}
              className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150'
            >
              <Flag className="w-4 h-4" />
              {isComment ? 'Report': 'Report Post'}
            </button>
            
            {isOwnPost && (
              <button
                onClick={handleClick}
                className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150'
              >
                <Trash2 className="w-4 h-4" />
                {isComment ? 'Delete': 'Delete Post'}
              </button>
            )}
          </div>
        </div>
      </div>

      {(confirmationPanelOpen && deletePost) && ( 
        <ModalScreen 
          isOpen={confirmationPanelOpen} 
          handleClose={handleCloseModal} 
          height='50vh' 
          width='85vh'
        >
          <div className='flex flex-col h-full text-black' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-md'>
                <AlertTriangle className='w-6 h-6 text-red-600' />
              </div>
              <h1 className='text-2xl font-bold text-gray-800'>{isComment ? 'Delete Comment': 'Delete Post'}</h1>
            </div>

            <div className='flex-grow space-y-4'>
              <p className='text-gray-600 text-lg'>
                {`Are you sure you want to delete this ${isComment ? 'comment' : 'post'}? This action cannot be undone.`}
              </p>
              
              <ul className='text-sm text-gray-600 space-y-2'>
                <li className='flex items-center gap-2'>
                  <AlertTriangle className='w-4 h-4 text-red-500' />
                  {`This ${isComment ? 'comment' : 'post'} will be permanently removed.`}
                </li>
                <li className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-orange-500' />
                  {`All ${isComment ? 'interactions' : 'comments and interactions'} will be lost.`}
                </li>
                <li className='flex items-center gap-2'>
                  <BookOpen className='w-4 h-4 text-gray-500' />
                  Other users will no longer be able to view this content.
                </li>
              </ul>
            </div>

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2'>
              <button
                onClick={handleCloseModal}
                className='w-32 py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow-md border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Close
              </button>

              {success ? (
                <button
                  disabled
                  className='w-32 py-2 px-8 rounded-full font-semibold text-white bg-green-500 shadow-lg border border-green-600 flex items-center justify-center gap-2 cursor-default'
                >
                  <CheckCircle className='w-5 h-5' />
                  Deleted
                </button>
              ) : (
                <button
                  onClick={handleDeletePost}
                  disabled={isLoading}
                  className={`w-32 py-2 px-8 rounded-full font-semibold text-white shadow-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                    isLoading
                      ? 'bg-purple-300 border-purple-300 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 border-purple-500'
                  }`}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </ModalScreen>
      )}

      {(confirmationPanelOpen && reportPost) && ( 
        <ModalScreen 
          isOpen={confirmationPanelOpen} 
          handleClose={handleCloseModal} 
          height='80vh' 
          width='110vh'
        >
          <div className='flex flex-col h-full text-black' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-md'>
                <AlertTriangle className='w-6 h-6 text-red-600' />
              </div>
              <h1 className='text-2xl font-bold text-gray-800'>{`Report This ${isComment ? 'Comment' : 'Post'}`}</h1>
            </div>

            <div className='flex-grow space-y-4'>
              <p className='text-gray-600 text-lg'>
                {`Please provide a reason for reporting this ${isComment ? 'comment' : 'post'}. Your report will help us review the content.`}
              </p>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className='w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-300'
                placeholder={`Explain why this ${isComment ? 'comment': 'post'} should be removed...`}
              />
              <h1 className='font-semibold '>Possible reasons for reporting:</h1>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li className='flex items-center gap-2'>
                  <AlertTriangle className='w-4 h-4 text-red-500' />
                  Abuse, hate speech, or policy violation
                </li>
                <li className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-orange-500' />
                  Spam or misleading content
                </li>
                <li className='flex items-center gap-2'>
                  <HiQuestionMarkCircle className='w-4 h-4 text-gray-500' />
                  Not appropriate for the platform
                </li>
              </ul>
            </div>

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2'>
              <button
                onClick={handleCloseModal}
                className='w-32 py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow-md border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Close
              </button>

              {success ? (
                <button
                  disabled
                  className='w-32 py-2 px-8 rounded-full font-semibold text-white bg-green-500 shadow-lg border border-green-600 flex items-center justify-center gap-2 cursor-default'
                >
                  <CheckCircle className='w-5 h-5' />
                  Reported
                </button>
              ) : (
                <button
                  onClick={handleReportPost}
                  disabled={isLoading}
                  className={`w-32 py-2 px-8 text-center rounded-full font-semibold text-white shadow-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                    isLoading
                      ? 'bg-purple-300 border-purple-300 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 border-purple-500'
                  }`}
                >
                  {isLoading ? 'Reporting...' : 'Report'}
                </button>
              )}
            </div>
          </div>
        </ModalScreen>
      )}
    </>
  );
}

export default OptionOnPostButton;