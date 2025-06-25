import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { quizAttemptDb, quizSetDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all attempts for the user
    const attempts = await quizAttemptDb.findMany({ userId: session.user.id })
    
    // Get quiz details for each attempt
    const attemptsWithQuizDetails = await Promise.all(
      attempts.map(async (attempt) => {
        const quizSet = await quizSetDb.findUnique({ id: attempt.quizSetId })
        return {
          ...attempt,
          quizSet: quizSet ? {
            title: quizSet.title,
            description: quizSet.description
          } : null
        }
      })
    )

    // Sort by completion date (newest first)
    attemptsWithQuizDetails.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )

    return NextResponse.json(attemptsWithQuizDetails)
  } catch (error) {
    console.error('Error fetching quiz attempts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}