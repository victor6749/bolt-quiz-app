'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Trophy, Target, Eye, Download } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'

interface QuizAttempt {
  id: string
  score: number
  totalQuestions: number
  completedAt: string
  answers: string
  quizSet: {
    title: string
    description: string
  } | null
  quizSetId: string
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttempts()
  }, [])

  const fetchAttempts = async () => {
    try {
      const response = await fetch('/api/quiz/attempts')
      if (response.ok) {
        const data = await response.json()
        setAttempts(data)
      } else {
        throw new Error('履歴の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching attempts:', error)
      toast.error('履歴の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const exportAttemptResults = (attempt: QuizAttempt) => {
    try {
      const answers = JSON.parse(attempt.answers)
      const resultsData = {
        quiz: {
          title: attempt.quizSet?.title || '不明なクイズ',
          description: attempt.quizSet?.description || ''
        },
        results: {
          score: attempt.score,
          total: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          completedAt: attempt.completedAt
        },
        answers: answers
      }

      const dataStr = JSON.stringify(resultsData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `quiz_results_${attempt.quizSet?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unknown'}_${new Date(attempt.completedAt).toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      toast.success('結果が正常にエクスポートされました！')
    } catch (error) {
      console.error('Error exporting results:', error)
      toast.error('結果のエクスポートに失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">クイズ履歴</h1>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">クイズ履歴</h1>
          <p className="text-muted-foreground">過去のクイズ挑戦と進捗を確認</p>
        </div>

        {attempts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">まだクイズに挑戦していません。</p>
              <p className="text-sm text-muted-foreground mt-1">
                最初のクイズに挑戦して、ここで進捗を確認しましょう！
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard">
                  クイズを作成する
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => {
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100)
              
              return (
                <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">
                          {attempt.quizSet?.title || '削除されたクイズ'}
                        </CardTitle>
                        {attempt.quizSet?.description && (
                          <CardDescription>{attempt.quizSet.description}</CardDescription>
                        )}
                      </div>
                      <Badge className={getScoreColor(percentage)}>
                        {attempt.score}/{attempt.totalQuestions} ({percentage}%)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true, locale: ja })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {attempt.totalQuestions}問
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportAttemptResults(attempt)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          結果出力
                        </Button>
                        {attempt.quizSet && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/quiz/${attempt.quizSetId}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              再挑戦
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}