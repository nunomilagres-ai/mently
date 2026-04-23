# 🍽️ Reconhecimento de Alimentos por Foto - Setup

## Funcionalidade Implementada

Foi adicionada uma nova funcionalidade de reconhecimento de alimentos por foto usando IA (Claude Vision API). Os utilizadores podem agora:

1. **Tirar uma foto** dos seus alimentos
2. **Fazer upload** de uma imagem da galeria
3. A **IA identifica automaticamente** os alimentos na imagem
4. Os **valores nutricionais são calculados** e preenchidos automaticamente

## Configuração Necessária

### 1. Chave API do Anthropic

A funcionalidade requer uma chave API do Anthropic Claude. Configure-a no Cloudflare:

```bash
# No diretório do projeto mently
wrangler secret put ANTHROPIC_API_KEY
# Cole a sua chave quando solicitado: sk-ant-...
```

### 2. Deploy

Após configurar a chave, faça deploy:

```bash
npm run deploy
# ou
wrangler pages deploy
```

## Como Usar

### Para Utilizadores

1. Aceda à página **Nutrição**
2. Clique em **"Adicionar"** numa refeição (Pequeno-almoço, Almoço, etc.)
3. No modal, clique no botão **"Reconhecer com Foto"** (ícone de câmera)
4. Escolha:
   - **Tirar Foto**: Usa a câmera do dispositivo
   - **Escolher Imagem**: Seleciona da galeria
5. Após selecionar a imagem, clique em **"Analisar com IA"**
6. A IA irá:
   - Identificar todos os alimentos na imagem
   - Estimar as quantidades
   - Calcular todos os valores nutricionais (macros e micros)
7. Se **um alimento** for detectado: o formulário é preenchido automaticamente
8. Se **múltiplos alimentos** forem detectados: todos são adicionados automaticamente

### Dicas para Melhores Resultados

- ✅ Tire fotos com boa iluminação
- ✅ Mostre os alimentos claramente
- ✅ Evite sombras ou reflexos fortes
- ✅ Inclua referências de tamanho quando possível (ex: garfo, prato)
- ✅ Fotografe de cima para baixo

## Arquitetura Técnica

### Frontend
- **Componente**: `src/components/nutrition/FoodPhotoRecognition.jsx`
  - Interface de captura/upload de foto
  - Preview da imagem
  - Estados de loading e erro
  
- **Integração**: `src/pages/Nutrition.jsx`
  - Botão de reconhecimento no modal AddFoodModal
  - Callback para processar alimentos detectados

### Backend
- **API Endpoint**: `functions/api/nutrition/analyze-food.js`
  - Recebe imagem em base64
  - Chama Claude Vision API
  - Processa resposta e valida dados
  - Retorna array de alimentos com nutrientes

### Modelo de IA
- **Claude 3.5 Sonnet** (claude-3-5-sonnet-20241022)
- Capacidades:
  - Visão computacional avançada
  - Reconhecimento de alimentos
  - Estimativa de quantidades
  - Cálculo de valores nutricionais baseado em tabelas portuguesas

## Estrutura de Dados

Cada alimento detectado contém:

```javascript
{
  name: "Nome do alimento",
  amount: 100,              // Quantidade
  unit: "g",                // g, ml, unid, colher, chávena
  kcal: 130,                // Calorias
  protein: 3,               // Proteína (g)
  carbs: 28,                // Hidratos (g)
  fat: 0.3,                 // Gordura (g)
  fiber: 0.4,               // Fibra (g)
  calcium: 10,              // Cálcio (mg)
  iron: 0.5,                // Ferro (mg)
  magnesium: 25,            // Magnésio (mg)
  zinc: 0.6,                // Zinco (mg)
  vitaminC: 0,              // Vitamina C (mg)
  vitaminD: 0,              // Vitamina D (mcg)
  vitaminB12: 0,            // Vitamina B12 (mcg)
  folate: 8,                // Folato (mcg)
  sodium: 1,                // Sódio (mg)
  potassium: 35,            // Potássio (mg)
  omega3: 0                 // Ómega-3 (g)
}
```

## Custos

- **Claude API**: ~$0.003 por imagem (modelo Sonnet)
- Recomendação: Monitorizar uso via dashboard Anthropic

## Melhorias Futuras

- [ ] Cache de alimentos comuns para reduzir chamadas API
- [ ] Histórico de alimentos reconhecidos
- [ ] Ajuste manual de quantidades após reconhecimento
- [ ] Suporte para múltiplas línguas
- [ ] Reconhecimento de rótulos nutricionais
- [ ] Integração com bases de dados nutricionais públicas

## Troubleshooting

### Erro: "API key não configurada"
- Configure a chave: `wrangler secret put ANTHROPIC_API_KEY`

### Erro: "Não foi possível identificar alimentos"
- Verifique a qualidade da foto
- Tente com melhor iluminação
- Fotografe mais de perto

### Erro: "Erro ao processar imagem"
- Verifique a conexão à internet
- Confirme que a chave API está válida
- Verifique logs no Cloudflare Dashboard

## Suporte

Para questões ou problemas, contacte o desenvolvedor ou abra um issue no repositório.