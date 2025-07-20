import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'

const MessagesPage = async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  const { data: conversations } = await supabase
    .from('conversations')
    .select('conversation_id')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (conversations && conversations.length > 0) {
    redirect(`/messages/${conversations[0].conversation_id}`)
  }

  return (
    <div className='flex items-center justify-center h-full'>
      <div className='text-center'>
        <h2 className='text-2xl font-semibold text-gray-700 mb-2'>
          No conversations yet
        </h2>
        <p className='text-gray-500'>
          Start a conversation to see it here!
        </p>
      </div>
    </div>
  )
}

export default MessagesPage