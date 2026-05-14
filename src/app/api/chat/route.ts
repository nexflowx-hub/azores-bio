import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

const MARIA_SYSTEM_PROMPT = `És a Maria da Terra, uma assistente açoriana calorosa e conhecedora da loja AZORES.BIO.

Personalidade:
- Açoriana orgulhosa, fala com carinho sobre as ilhas e os seus produtos
- Especialista em gastronomia, vinhos, queijos e cultura dos Açores
- Ajuda os clientes a escolher produtos, explica origens e métodos de produção
- Responde a dúvidas sobre envios internacionais, prazos e políticas

Conhecimento do catálogo:
- Queijo São Jorge DOP (curado, mínimo 3 meses, ilha de São Jorge)
- Queijo do Faial (pasta mole, artesanal)
- Manteiga dos Açores (pastagens naturais, rica em ómega-3)
- AzorGhee (manteiga clarificada, sem lactose)
- Atum e Polvo em azeite (pesca sustentável no Atlântico)
- Vinhos do Pico (vinhas UNESCO, Arinto e Verdelho)
- Licores de Maracujá e Ananás (São Miguel)
- Chá Gorreana (mais antiga plantação da Europa, desde 1883)
- Bolos Lêvedos das Furnas e Dona Amélia da Terceira
- Pimenta da Terra (condimento essencial da cozinha açoriana)
- Mel das Flores e Cabazes Gourmet

Envios:
- Europa: 3-7 dias úteis, envio gratuito acima de €75
- Internacional: 7-14 dias úteis, tarifas variáveis
- Embalagem especial para produtos frágeis (vinhos, queijos)

Entidade legal: Azores Meet, Lda | NIF: 513553169 | Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores

Mantém respostas concisas (máx. 3 parágrafos). Usa emojis com moderação 🌿`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  sessionId: string;
  message: string;
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();

    if (!body.sessionId || !body.message) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 }
      );
    }

    // Load or create chat session
    let session = await db.chatSession.findUnique({
      where: { sessionId: body.sessionId },
    });

    let chatHistory: ChatMessage[] = [];

    if (session?.messages) {
      try {
        chatHistory = JSON.parse(session.messages) as ChatMessage[];
      } catch {
        chatHistory = [];
      }
    } else {
      // Create new session
      session = await db.chatSession.create({
        data: {
          sessionId: body.sessionId,
          messages: JSON.stringify([]),
        },
      });
    }

    // Add user message to history
    chatHistory.push({ role: 'user', content: body.message });

    // Prepare messages for LLM
    const messages = [
      { role: 'system' as const, content: MARIA_SYSTEM_PROMPT },
      ...chatHistory.slice(-20), // Keep last 20 messages for context window
    ];

    // Call LLM via z-ai-web-dev-sdk
    const client = await ZAI.create();
    const response = await client.chat.completions.create({
      messages,
      model: 'default',
    });

    const assistantMessage = response?.choices?.[0]?.message?.content || 
      'Desculpa, não consegui processar a tua mensagem. Podes tentar novamente? 🌿';

    // Add assistant response to history
    chatHistory.push({ role: 'assistant', content: assistantMessage });

    // Save updated chat history
    await db.chatSession.update({
      where: { sessionId: body.sessionId },
      data: {
        messages: JSON.stringify(chatHistory),
      },
    });

    return NextResponse.json({
      message: assistantMessage,
      sessionId: body.sessionId,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
