import HomePage from '@/app/components/HomePage';
import React from 'react'

const CoursePage = async ({ params }:  { params: { courseId: string }}) => {
  const { courseId } = await params;

  return (
    <HomePage pageTitle={courseId.toUpperCase()} />
  )
}

export default CoursePage