import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, X, Sparkles } from 'lucide-react'

/**
 * Componente para captura/upload de foto de alimentos e reconhecimento via IA
 * Usa Claude Vision API para identificar alimentos e seus nutrientes
 */
export default function FoodPhotoRecognition({ onFoodDetected, onClose }) {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Processar ficheiro de imagem
  function handleFileSelect(file) {
    if (!file) return
    
    // Validar tipo de ficheiro
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecione uma imagem válida')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem demasiado grande. Máximo 5MB.')
      return
    }

    setImage(file)
    setError(null)

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  // Analisar imagem com IA
  async function analyzeImage() {
    if (!image) return

    setLoading(true)
    setError(null)

    try {
      // Converter imagem para base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64String = reader.result.split(',')[1]
          resolve(base64String)
        }
        reader.onerror = reject
        reader.readAsDataURL(image)
      })

      // Chamar API de reconhecimento
      const response = await fetch('/api/nutrition/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          mimeType: image.type
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao analisar imagem')
      }

      const foods = await response.json()
      
      if (!foods || foods.length === 0) {
        setError('Não foi possível identificar alimentos na imagem. Tente outra foto.')
        return
      }

      // Retornar alimentos detectados
      onFoodDetected(foods)
      
    } catch (err) {
      console.error('Erro ao analisar imagem:', err)
      setError(err.message || 'Erro ao processar imagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-5 pb-8 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-brand-500" />
            <h3 className="font-bold text-gray-900">Reconhecer Alimentos</h3>
          </div>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!preview ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Tire uma foto ou selecione uma imagem dos seus alimentos. 
                A IA irá identificar os alimentos e sugerir os valores nutricionais.
              </p>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-brand-50 border-2 border-brand-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:bg-brand-100 transition-colors"
              >
                <Camera size={32} className="text-brand-500" />
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Tirar Foto</p>
                  <p className="text-xs text-gray-500 mt-1">Usar câmera do dispositivo</p>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:bg-gray-100 transition-colors"
              >
                <Upload size={32} className="text-gray-500" />
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Escolher Imagem</p>
                  <p className="text-xs text-gray-500 mt-1">Selecionar da galeria</p>
                </div>
              </button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div className="bg-blue-50 rounded-xl p-4 mt-6">
                <p className="text-xs font-semibold text-blue-900 mb-2">💡 Dicas para melhores resultados:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Tire a foto com boa iluminação</li>
                  <li>• Mostre os alimentos claramente</li>
                  <li>• Evite sombras ou reflexos</li>
                  <li>• Inclua referências de tamanho se possível</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-auto max-h-96 object-contain"
                />
                {!loading && (
                  <button
                    onClick={() => {
                      setImage(null)
                      setPreview(null)
                      setError(null)
                    }}
                    className="absolute top-2 right-2 bg-white/90 rounded-full p-2 shadow-lg"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {!loading && !error && (
                <button
                  onClick={analyzeImage}
                  className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Analisar com IA
                </button>
              )}

              {loading && (
                <div className="bg-brand-50 rounded-xl p-6 flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-brand-500 animate-spin" />
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">A analisar imagem...</p>
                    <p className="text-xs text-gray-500 mt-1">
                      A IA está a identificar os alimentos e calcular os nutrientes
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Made with Bob
