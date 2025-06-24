'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Trash2, 
  Download,
  Moon,
  Sun,
  Monitor,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface UserSettings {
  notifications: {
    email: boolean
    quiz_reminders: boolean
    weekly_summary: boolean
  }
  privacy: {
    profile_public: boolean
    show_stats: boolean
  }
  preferences: {
    default_quiz_type: 'multiple_choice' | 'text' | 'mixed'
    auto_save: boolean
  }
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      quiz_reminders: false,
      weekly_summary: true
    },
    privacy: {
      profile_public: false,
      show_stats: true
    },
    preferences: {
      default_quiz_type: 'multiple_choice',
      auto_save: true
    }
  })
  const [loading, setLoading] = useState(false)

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // ここで実際の設定保存APIを呼び出す
      // 現在はローカル状態の更新のみをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('設定が保存されました')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      // ユーザーデータのエクスポート機能
      const userData = {
        profile: session?.user,
        settings,
        exportDate: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(userData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `quizai_data_${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      toast.success('データが正常にエクスポートされました')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('データのエクスポートに失敗しました')
    }
  }

  const deleteAccount = async () => {
    try {
      // アカウント削除API呼び出し
      toast.success('アカウント削除リクエストが送信されました')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('アカウント削除に失敗しました')
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
          <h1 className="text-3xl font-bold">設定</h1>
          <p className="text-muted-foreground">アプリケーションの設定をカスタマイズ</p>
        </div>

        <div className="grid gap-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                外観
              </CardTitle>
              <CardDescription>
                テーマとディスプレイの設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>テーマ</Label>
                  <p className="text-sm text-muted-foreground">
                    アプリケーションの外観を選択
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        ライト
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        ダーク
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        システム
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知
              </CardTitle>
              <CardDescription>
                通知の設定を管理
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>メール通知</Label>
                  <p className="text-sm text-muted-foreground">
                    重要な更新をメールで受信
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    handleSettingChange('notifications', 'email', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>クイズリマインダー</Label>
                  <p className="text-sm text-muted-foreground">
                    定期的な学習リマインダー
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.quiz_reminders}
                  onCheckedChange={(checked) => 
                    handleSettingChange('notifications', 'quiz_reminders', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>週間サマリー</Label>
                  <p className="text-sm text-muted-foreground">
                    週間の学習進捗レポート
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weekly_summary}
                  onCheckedChange={(checked) => 
                    handleSettingChange('notifications', 'weekly_summary', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                プライバシー
              </CardTitle>
              <CardDescription>
                プライバシーとデータの設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>公開プロフィール</Label>
                  <p className="text-sm text-muted-foreground">
                    他のユーザーがプロフィールを表示可能
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.profile_public}
                  onCheckedChange={(checked) => 
                    handleSettingChange('privacy', 'profile_public', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>統計情報の表示</Label>
                  <p className="text-sm text-muted-foreground">
                    学習統計を他のユーザーに表示
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.show_stats}
                  onCheckedChange={(checked) => 
                    handleSettingChange('privacy', 'show_stats', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiz Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                クイズ設定
              </CardTitle>
              <CardDescription>
                クイズ作成と受験の設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>デフォルトクイズタイプ</Label>
                  <p className="text-sm text-muted-foreground">
                    新しいクイズのデフォルトタイプ
                  </p>
                </div>
                <Select
                  value={settings.preferences.default_quiz_type}
                  onValueChange={(value) => 
                    handleSettingChange('preferences', 'default_quiz_type', value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">選択問題</SelectItem>
                    <SelectItem value="text">記述問題</SelectItem>
                    <SelectItem value="mixed">混合</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動保存</Label>
                  <p className="text-sm text-muted-foreground">
                    クイズの進行状況を自動保存
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.auto_save}
                  onCheckedChange={(checked) => 
                    handleSettingChange('preferences', 'auto_save', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                データ管理
              </CardTitle>
              <CardDescription>
                データのエクスポートとアカウント管理
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>データエクスポート</Label>
                  <p className="text-sm text-muted-foreground">
                    すべてのデータをJSONファイルでダウンロード
                  </p>
                </div>
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  エクスポート
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <Label className="text-destructive">危険な操作</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>アカウント削除</Label>
                    <p className="text-sm text-muted-foreground">
                      アカウントとすべてのデータを完全に削除
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>アカウントを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。アカウントとすべてのデータが完全に削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}