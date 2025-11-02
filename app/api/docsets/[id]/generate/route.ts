import { NextRequest, NextResponse } from 'next/server';
import { docsets, generations } from '@/app/lib/docsets-store';

const API_BASE_URL = process.env.DOCSETS_API_URL || 'https://060de239.voltagepark.studio';
const BEARER_TOKEN = process.env.DOCSETS_BEARER_TOKEN;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let docset = docsets.get(id);

    // Special handling for sample docset - create it on-the-fly if needed
    const SAMPLE_DOCSET_ID = process.env.NEXT_PUBLIC_SAMPLE_DOCSET_ID;
    if (!docset && id === SAMPLE_DOCSET_ID) {
      // Create sample docset entry in store
      docset = {
        id: SAMPLE_DOCSET_ID,
        status: 'ready',
        name: 'Attention Is All You Need (Sample)',
        description: 'Sample document for demonstration',
        factory_id: 'default',
        user_id: 'sample_user',
        documents: [],
        createdAt: new Date().toISOString(),
      };
      docsets.set(SAMPLE_DOCSET_ID, docset);
    }

    if (!docset) {
      return NextResponse.json(
        { error: 'Docset not found' },
        { status: 404 }
      );
    }

    // Allow questions even if docset is still ingesting - the API handles async processing
    // Only block if the docset has failed
    if (docset.status === 'failed') {
      return NextResponse.json(
        { error: 'Docset processing failed. Please try uploading again.' },
        { status: 400 }
      );
    }

    if (!BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      content_prompt, 
      format_prompt,
      messages, // OpenAI-style messages array
      top_k = 8 
    } = body;

    // Support both old format (content_prompt) and new format (messages)
    if (!content_prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      return NextResponse.json(
        { error: 'Either content_prompt or messages array is required' },
        { status: 400 }
      );
    }
    
    // Extract the current question from messages or content_prompt
    const currentQuestion = content_prompt || (messages && messages.length > 0 
      ? messages[messages.length - 1].content 
      : '');

    // Extract factory_id from query params
    const searchParams = request.nextUrl.searchParams;
    const factory_id = searchParams.get('factory_id') || docset.factory_id;

    // Prepare form data for upstream API
    const upstreamFormData = new FormData();
    
    // Convert messages array to content_prompt with conversation history
    let finalContentPrompt = content_prompt || currentQuestion;
    
    if (messages && messages.length > 0) {
      // Format: "Previous conversation:\nUser: question1\nAssistant: answer1\n...\nCurrent question: [question]"
      const conversationHistory = [];
      
      // Add all messages except the last one (which is the current question)
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        conversationHistory.push(`${role}: ${msg.content}`);
      }
      
      // Build final prompt with context
      if (conversationHistory.length > 0) {
        finalContentPrompt = `Previous conversation:\n${conversationHistory.join('\n\n')}\n\nCurrent question: ${currentQuestion}`;
      } else {
        finalContentPrompt = currentQuestion;
      }
    }
    
    // Prepare data field
    const dataField: any = {
      docset_id: id,
      text: {
        content_prompt: finalContentPrompt
      }
    };
    
    if (format_prompt) {
      dataField.text.format_prompt = format_prompt;
    }
    
    upstreamFormData.append('data', JSON.stringify(dataField));
    
    // Prepare factory_settings
    const factorySettings = {
      top_k: top_k
    };
    upstreamFormData.append('factory_settings', JSON.stringify(factorySettings));
    
    // Prepare metadata
    const metadata = {
      user_id: docset.user_id
    };
    upstreamFormData.append('metadata', JSON.stringify(metadata));

    // Call upstream API using /vpstudio/transform endpoint
    const response = await fetch(`${API_BASE_URL}/vpstudio/transform`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'X-Factory-Id': factory_id,
      },
      body: upstreamFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Generation failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to generate answer: ${response.status}` },
        { status: response.status }
      );
    }

    let data = await response.json();
    const jobId = data.id || data.job_id;
    
    console.log('Generation job created:', jobId, 'Status:', data.status);

    // Poll for job completion to get the actual answer
    let finalData = data;
    const maxAttempts = 90; // 90 attempts = 3 minutes (90 * 2 seconds)
    const pollInterval = 2000; // 2 seconds
    
    if (data.status !== 'completed') {
      console.log('Job not completed, polling for answer...');
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        try {
          const statusUrl = new URL(`${API_BASE_URL}/vpstudio/transform/${jobId}`);
          statusUrl.searchParams.set('user_id', docset.user_id);
          
          const statusResponse = await fetch(statusUrl.toString(), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${BEARER_TOKEN}`,
              'X-Factory-Id': factory_id,
            },
          });
          
          if (statusResponse.ok) {
            finalData = await statusResponse.json();
            const status = finalData.status;
            const progress = finalData.execution?.progress || 0;
            
            console.log(`Poll attempt ${attempt + 1}/${maxAttempts}: status=${status}, progress=${progress}`);
            
            if (status === 'completed') {
              console.log('Job completed, got answer. Full response:', JSON.stringify(finalData, null, 2));
              break;
            }
            
            if (status === 'failed' || finalData.error) {
              console.error('Job failed:', finalData.error);
              break;
            }
          }
        } catch (pollError) {
          console.error(`Poll attempt ${attempt + 1} failed:`, pollError);
        }
      }
    }
    
    // Extract answer from output field
    let content = '';
    let section_label = '';
    
    console.log('Extracting content from response. Output:', finalData.output);
    console.log('Artifacts:', finalData.artifacts);
    
    if (finalData.output && Array.isArray(finalData.output) && finalData.output.length > 0) {
      // Look for 'message' type (not 'text')
      const messageOutput = finalData.output.find((o: any) => o.type === 'message' || o.type === 'text');
      console.log('Found message output:', messageOutput);
      if (messageOutput) {
        content = messageOutput.content || '';
      }
    }
    
    // Fallback to data.content if available
    if (!content && finalData.content) {
      content = finalData.content;
    }
    
    console.log('Extracted content length:', content.length);
    console.log('Content preview:', content.substring(0, 200));
    
    const wordCount = content ? content.split(/\s+/).length : 0;

    // Store generation in local cache
    const generationId = jobId || finalData.generation_id || `gen_${Date.now()}`;
    generations.set(generationId, {
      id: generationId,
      docset_id: id,
      generation_id: generationId,
      question: currentQuestion,
      section_label,
      content,
      word_count: wordCount,
      status: finalData.status || 'processing',
      createdAt: finalData.created_at || new Date().toISOString(),
      completedAt: finalData.status === 'completed' ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({
      docset_id: id,
      job_id: jobId,
      generation_id: generationId,
      section_label,
      content,
      word_count: wordCount,
      status: finalData.status || 'processing',
      processing_time_ms: finalData.execution?.duration_seconds ? finalData.execution.duration_seconds * 1000 : undefined,
      created_at: finalData.created_at || new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating answer:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

