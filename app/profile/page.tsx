'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, Trophy, Target, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface UserStats {
  totalQuizzes: number
  totalAttempts: number
  averageScore: number
  monthlyUsage: {
    used: number
    limit: number
  }
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
    fetchUserStats()
  }, [session])

  const fetchUserStats = async () => {
    try {
      // これらのAPIエンドポイントは実装が必要ですが、
      // 現在のデータ構造に基づいてモックデータを表示
      const mockStats: UserStats = {
        totalQuizzes: 5,
        totalAttempts: 12,
        averageScore: 78,
        monthlyUsage: {
          used: 3,
          limit: 10
        }
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // ここで実際のプロフィール更新APIを呼び出す
      // 現在は名前の更新のみをシミュレート
      await update({ name })
      setIsEditing(false)
      toast.success('プロフィールが更新されました')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('プロフィールの更新に失敗しました')
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p>ログインが必要です</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">プロフィール</h1>
          <p className="text-muted-foreground">アカウント情報と統計を管理</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  プロフィール情報を表示・編集できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                    <AvatarFallback className="text-2xl">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{session.user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                    <Badge variant={session.user?.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {session.user?.role === 'ADMIN' ? '管理者' : 'ユーザー'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">表示名</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="表示名を入力"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{session.user?.name || '未設定'}</span>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          編集
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>メールアドレス</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{session.user?.email}</span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        保存
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setIsEditing(false)
                          setName(session.user?.name || '')
                        }}
                      >
                        キャンセル
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">統計情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : stats ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">作成クイズ</span>
                      </div>
                      <span className="font-semibold">{stats.totalQuizzes}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">挑戦回数</span>
                      </div>
                      <span className="font-semibold">{stats.totalAttempts}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" />
                        <span className="text-sm">平均スコア</span>
                      </div>
                      <span className="font-semibold">{stats.averageScore}%</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">月間AI使用量</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">
                          {stats.monthlyUsage.used}/{stats.monthlyUsage.limit}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">統計情報を読み込めませんでした</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">アカウント情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>登録日: 2024年1月</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>プラン: 無料</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}