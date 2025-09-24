import HomePage from '@/app/components/Layout/HomePage';
import React from 'react'

const CoursePage = async ({ params }:  { params: Promise<{ courseId: string }> }) => {
  const { courseId } = await params;

  return (
    <HomePage pageTitle={courseId.toUpperCase()} />
  )
}


export default CoursePage