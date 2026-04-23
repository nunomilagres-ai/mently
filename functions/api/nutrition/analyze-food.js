// POST /api/nutrition/analyze-food
// Analisa imagem de alimentos usando Claude Vision API
import { getAuthUser, unauthorized, json } from '../../_auth.js'

export async function onRequestPost({ request, env }) {
  const user = await getAuthUser(request, env)
  if (!user) return unauthorized()

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const { image, mimeType } = body

  if (!image || !mimeType) {
    return json({ error: 'Campos obrigatórios: image (base64), mimeType' }, 400)
  }

  // Validar tipo de imagem
  if (!mimeType.startsWith('image/')) {
    return json({ error: 'Apenas imagens são permitidas' }, 415)
  }

  // Obter chave API do Anthropic (pode estar em env ou localStorage do user)
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return json({ error: 'API key não configurada no servidor' }, 500)
  }

  try {
    // Chamar Claude Vision API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: image
              }
            },
            {
              type: 'text',
              text: `Analisa esta imagem e identifica todos os alimentos visíveis. Para cada alimento, estima a quantidade e fornece os valores nutricionais completos.

IMPORTANTE: Responde APENAS com um array JSON válido, sem texto adicional, markdown ou explicações. Formato:

[
  {
    "name": "nome do alimento em português",
    "amount": quantidade estimada (número),
    "unit": "g" ou "ml" ou "unid" ou "colher" ou "chávena",
    "kcal": calorias (número),
    "protein": proteína em gramas (número),
    "carbs": hidratos de carbono em gramas (número),
    "fat": gordura em gramas (número),
    "fiber": fibra em gramas (número),
    "calcium": cálcio em mg (número),
    "iron": ferro em mg (número),
    "magnesium": magnésio em mg (número),
    "zinc": zinco em mg (número),
    "vitaminC": vitamina C em mg (número),
    "vitaminD": vitamina D em mcg (número),
    "vitaminB12": vitamina B12 em mcg (número),
    "folate": folato em mcg (número),
    "sodium": sódio em mg (número),
    "potassium": potássio em mg (número),
    "omega3": ómega-3 em gramas (número)
  }
]

Regras:
- Se não conseguires identificar alimentos, retorna array vazio: []
- Todos os valores numéricos devem ser números, não strings
- Usa valores nutricionais realistas baseados em tabelas nutricionais portuguesas
- Se não tiveres certeza de um micronutriente, usa 0
- Sê preciso nas quantidades estimadas
- Considera porções típicas portuguesas`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro Claude API:', errorText)
      return json({ error: 'Erro ao processar imagem com IA' }, 500)
    }

    const data = await response.json()
    const textContent = data.content?.[0]?.text

    if (!textContent) {
      return json({ error: 'Resposta inválida da IA' }, 500)
    }

    // Extrair JSON da resposta (remover markdown se existir)
    let jsonText = textContent.trim()
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    let foods
    try {
      foods = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.error('Texto recebido:', textContent)
      return json({ error: 'Não foi possível processar a resposta da IA' }, 500)
    }

    // Validar estrutura
    if (!Array.isArray(foods)) {
      return json({ error: 'Formato de resposta inválido' }, 500)
    }

    // Validar e limpar cada alimento
    const validFoods = foods.filter(food => {
      return food.name && 
             typeof food.kcal === 'number' && 
             typeof food.protein === 'number' &&
             typeof food.carbs === 'number' &&
             typeof food.fat === 'number'
    }).map(food => ({
      name: food.name,
      amount: food.amount || 100,
      unit: food.unit || 'g',
      kcal: food.kcal || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      calcium: food.calcium || 0,
      iron: food.iron || 0,
      magnesium: food.magnesium || 0,
      zinc: food.zinc || 0,
      vitaminC: food.vitaminC || 0,
      vitaminD: food.vitaminD || 0,
      vitaminB12: food.vitaminB12 || 0,
      folate: food.folate || 0,
      sodium: food.sodium || 0,
      potassium: food.potassium || 0,
      omega3: food.omega3 || 0
    }))

    return json(validFoods)

  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    return json({ error: 'Erro interno ao processar imagem' }, 500)
  }
}

// Made with Bob
