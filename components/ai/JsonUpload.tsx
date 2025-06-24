'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Loader2, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { QuizData } from '@/lib/gemini'

interface JsonUploadProps {
  onGenerate: (quizData: any) => void
  disabled?: boolean
}

export function JsonUpload({ onGenerate, disabled }: JsonUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<QuizData | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const jsonFile = acceptedFiles[0]
    if (jsonFile && jsonFile.type === 'application/json') {
      setFile(jsonFile)
      validateJsonFile(jsonFile)
    } else {
      toast.error('JSONファイルを選択してください')
    }
  }, [])

  const validateJsonFile = async (file: File) => {
    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      
      // クイズデータの構造を検証
      if (!jsonData.title || !jsonData.questions || !Array.isArray(jsonData.questions)) {
        throw new Error('無効なクイズデータ形式です')
      }

      // 各問題の構造を検証
      for (const question of jsonData.questions) {
        if (!question.id || !question.question || !question.type) {
          throw new Error('問題データに必要なフィールドが不足しています')
        }
        
        if (question.type === 'multiple_choice' && (!question.options || !Array.isArray(question.options))) {
          throw new Error('選択問題にはoptionsが必要です')
        }
        
        if (question.correct_answer === undefined || question.correct_answer === null) {
          throw new Error('正解データが不足しています')
        }
      }

      setPreviewData(jsonData)
      toast.success('JSONファイルが正常に読み込まれました')
    } catch (error) {
      console.error('JSON validation error:', error)
      toast.error(error instanceof Error ? error.message : 'JSONファイルの形式が正しくありません')
      setFile(null)
      setPreviewData(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false,
    disabled: disabled || isProcessing
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !previewData) {
      toast.error('JSONファイルを選択してください')
      return
    }

    setIsProcessing(true)

    try {
      // JSONデータをそのまま渡す
      onGenerate(previewData)
      setFile(null)
      setPreviewData(null)
      toast.success('クイズデータが正常に読み込まれました！')
    } catch (error) {
      console.error('Error processing JSON:', error)
      toast.error('クイズデータの処理に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreviewData(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          JSONファイルからクイズ読み込み
        </CardTitle>
        <CardDescription>
          クイズデータが含まれたJSONファイルをアップロードしてください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
              } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {isDragActive ? (
                <p>JSONファイルをここにドロップしてください...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium">クリックしてアップロードまたはドラッグ&ドロップ</p>
                  <p className="text-xs text-muted-foreground">JSONファイルのみ</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  {previewData && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {previewData && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium">{previewData.title}</h4>
                  {previewData.description && (
                    <p className="text-sm text-muted-foreground">{previewData.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {previewData.questions.length}問の問題が含まれています
                  </p>
                </div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={disabled || isProcessing || !file || !previewData}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                クイズを読み込み
              </>
            )}
          </Button>
        </form>

        {/* JSON形式の例 */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">JSONファイルの形式例:</h4>
          <pre className="text-xs text-muted-foreground overflow-x-auto">
{`{
  "title": "サンプルクイズ",
  "description": "クイズの説明",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "問題文は？",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correct_answer": 0,
      "explanation": "解説文"
    },
    {
      "id": 2,
      "type": "text",
      "question": "記述問題は？",
      "correct_answer": "正解",
      "explanation": "解説文"
    }
  ]
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}