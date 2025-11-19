import { NextRequest, NextResponse } from 'next/server';
import { apiManager } from '@/lib/api-integrations';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { component_name, current_code, requirements, generate_image = false } = body;

    if (!component_name || !requirements) {
      return NextResponse.json(
        { error: 'component_name and requirements are required' },
        { status: 400 },
      );
    }

    const enhancementPrompt = `You are a senior UI/UX designer and React/TypeScript expert for the ISTANI fitness platform.

Component: ${component_name}
${current_code ? `Current Implementation:\n\`\`\`typescript\n${current_code}\n\`\`\`` : ''}

Requirements: ${requirements}

Provide comprehensive UI/UX enhancements:

1. Design Improvements:
   - Modern, clean aesthetic
   - Fitness-focused design language
   - Mobile-first responsive layout
   - Dark mode compatible

2. Accessibility:
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Focus indicators

3. Performance:
   - Next.js 15 optimizations
   - Lazy loading
   - Image optimization
   - Core Web Vitals

4. User Experience:
   - Intuitive interactions
   - Clear visual hierarchy
   - Smooth animations
   - Loading states

5. Implementation:
   - TypeScript with strict types
   - Tailwind CSS best practices
   - Reusable component patterns
   - Error boundaries

Provide specific code examples and explain the improvements.`;

    const geminiResult = await apiManager.gemini.generateContent(enhancementPrompt);

    const result: any = {
      success: true,
      component_name,
      enhancements: geminiResult,
      timestamp: new Date().toISOString(),
    };

    if (generate_image) {
      const imagePrompt = `Modern fitness app UI design for ${component_name}. ${requirements}. Professional, clean, mobile-first interface with dark mode support. High quality app design screenshot.`;

      try {
        const imageResult = await apiManager.openai.generateImage(imagePrompt, {
          size: '1024x1024',
          quality: 'standard',
        });

        result.design_mockup = imageResult.data;
      } catch (imageError: any) {
        result.image_error = imageError.message;
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('UI enhancement error:', error);
    return NextResponse.json(
      {
        error: 'Failed to enhance UI',
        message: error.message,
      },
      { status: 500 },
    );
  }
}
