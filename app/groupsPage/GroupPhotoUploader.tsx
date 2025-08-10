import React, { useRef, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GroupInfo, UserProfileLayout } from '@/app/interfaces/interfaces'

interface GroupData {
  groupInfo: GroupInfo
  groupMembers: any[]
  messages: any[]
  isUserMember: boolean
  isOwner: boolean
}

interface GroupPhotoUploaderProps {
  groupInfo: GroupInfo
  groupId: string
  isOwner: boolean
  currentUser: UserProfileLayout | undefined
}

const supabase = createClient()

const GroupPhotoUploader: React.FC<GroupPhotoUploaderProps> = ({
  groupInfo,
  groupId,
  isOwner,
  currentUser
}) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const updateGroupPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      // Remove old photo if exists
      if (groupInfo.photo_url) {
        const oldFileName = groupInfo.photo_url.split('/').pop()
        if (oldFileName) {
          await supabase.storage.from('group-photos').remove([`${oldFileName}`])
        }
      }
      
      // Upload new photo
      const fileExt = file.name.split('.').pop()
      const fileName = `${groupId}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('group-photos')
        .upload(fileName, file, { upsert: true })
      
      if (uploadError) {
        throw new Error(`Failed to upload photo: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('group-photos')
        .getPublicUrl(fileName)

      // Update group record
      const { error: updateError } = await supabase
        .from('groups')
        .update({ photo_url: publicUrl })
        .eq('id', groupId)
      
      if (updateError) {
        throw new Error(`Failed to update group photo: ${updateError.message}`)
      }
      
      return publicUrl
    },
    onSuccess: (newPhotoUrl) => {
      queryClient.setQueryData(['groupData', groupId, currentUser?.id], (oldData: GroupData | undefined) =>
        oldData ? { 
          ...oldData, 
          groupInfo: { ...oldData.groupInfo, photo_url: newPhotoUrl } 
        } : oldData
      )
      setIsUploadingPhoto(false)
    },
    onError: (error) => {
      console.error('Error updating group photo:', error)
      setIsUploadingPhoto(false)
    }
  })

  const removeGroupPhotoMutation = useMutation({
    mutationFn: async () => {
      // Remove photo from storage
      if (groupInfo.photo_url) {
        const fileName = groupInfo.photo_url.split('/').pop()
        if (fileName) {
          await supabase.storage.from('group-photos').remove([fileName])
        }
      }
      
      // Update group record to remove photo URL
      const { error: updateError } = await supabase
        .from('groups')
        .update({ photo_url: null })
        .eq('id', groupId)
      
      if (updateError) {
        throw new Error(`Failed to remove group photo: ${updateError.message}`)
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['groupData', groupId, currentUser?.id], (oldData: GroupData | undefined) =>
        oldData ? { 
          ...oldData, 
          groupInfo: { ...oldData.groupInfo, photo_url: undefined } 
        } : oldData
      )
    },
    onError: (error) => {
      console.error('Error removing group photo:', error)
    }
  })

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !isOwner) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setIsUploadingPhoto(true)
    updateGroupPhotoMutation.mutate(file)
  }

  const handlePhotoClick = () => {
    if (isOwner && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOwner) {
      removeGroupPhotoMutation.mutate()
    }
  }

  const getGroupInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'G'
  }

  return (
    <div className='relative group'>
      {groupInfo?.photo_url ? (
        <div className='relative'>
          <img 
            src={groupInfo.photo_url} 
            alt={groupInfo.name}
            className={`w-10 h-10 rounded-full object-cover border-2 border-purple-200 ${
              isOwner ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''
            }`}
            onClick={handlePhotoClick}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div 
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center text-white font-semibold hidden ${
              isOwner ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''
            }`} 
            onClick={handlePhotoClick}
          >
            <span className='text-sm'>{getGroupInitial(groupInfo.name)}</span>
          </div>
          {isOwner && (
            <>
              <div 
                className='absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer' 
                onClick={handlePhotoClick}
              >
                <Upload className='w-4 h-4 text-white' />
              </div>
              <button 
                onClick={handleRemovePhoto}
                className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity' 
                title='Remove photo'
              >
                <X className='w-3 h-3 text-white' />
              </button>
            </>
          )}
          {isUploadingPhoto && (
            <div className='absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500'></div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold relative ${
            isOwner ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''
          }`} 
          onClick={handlePhotoClick}
        >
          <span className='text-sm'>{getGroupInitial(groupInfo.name)}</span>
          {isOwner && (
            <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer'>
              <Upload className='w-4 h-4 text-white' />
            </div>
          )}
          {isUploadingPhoto && (
            <div className='absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500'></div>
            </div>
          )}
        </div>
      )}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handlePhotoChange} 
        className="hidden" 
        disabled={!isOwner || isUploadingPhoto} 
      />
    </div>
  )
}

export default GroupPhotoUploader