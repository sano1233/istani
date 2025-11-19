#!/usr/bin/env python3
"""
Gemini AI Integration MCP Server for ISTANI Fitness Platform
Provides UI enhancement, image generation, and code review capabilities
"""

import os
import sys
import json
import asyncio
import argparse
import subprocess
from typing import Any, Dict, List, Optional
from datetime import datetime
from pathlib import Path

# Configuration
GEMINI_ENABLED = os.getenv('GEMINI_ENABLED', 'true').lower() == 'true'
GEMINI_AUTO_CONSULT = os.getenv('GEMINI_AUTO_CONSULT', 'false').lower() == 'true'
GEMINI_CLI_COMMAND = os.getenv('GEMINI_CLI_COMMAND', 'gemini')
GEMINI_TIMEOUT = int(os.getenv('GEMINI_TIMEOUT', '300'))
GEMINI_RATE_LIMIT = float(os.getenv('GEMINI_RATE_LIMIT', '2'))
GEMINI_MAX_CONTEXT = int(os.getenv('GEMINI_MAX_CONTEXT', '4000'))
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

class GeminiMCPServer:
    """MCP Server for Gemini AI integration"""

    def __init__(self, project_root: str = None):
        self.project_root = project_root or os.getcwd()
        self.history: List[Dict] = []
        self.stats = {
            'consultations': 0,
            'errors': 0,
            'total_tokens': 0
        }
        self.enabled = GEMINI_ENABLED
        self.auto_consult = GEMINI_AUTO_CONSULT

    async def execute_gemini_command(self, prompt: str, context: str = None) -> Dict[str, Any]:
        """Execute Gemini CLI command with prompt"""
        try:
            if not self.enabled:
                return {
                    'success': False,
                    'error': 'Gemini integration is disabled'
                }

            # Build command
            full_prompt = prompt
            if context:
                full_prompt = f"{prompt}\n\nContext:\n{context}"

            cmd = [
                GEMINI_CLI_COMMAND,
                '-p', full_prompt,
                '--model', GEMINI_MODEL
            ]

            # Execute command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.project_root
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=GEMINI_TIMEOUT
            )

            if process.returncode != 0:
                error_msg = stderr.decode()
                self.stats['errors'] += 1
                return {
                    'success': False,
                    'error': f'Gemini CLI error: {error_msg}'
                }

            response = stdout.decode()
            self.stats['consultations'] += 1

            # Add to history
            self.history.append({
                'timestamp': datetime.now().isoformat(),
                'prompt': prompt,
                'response': response
            })

            return {
                'success': True,
                'response': response,
                'timestamp': datetime.now().isoformat()
            }

        except asyncio.TimeoutError:
            self.stats['errors'] += 1
            return {
                'success': False,
                'error': 'Gemini consultation timed out'
            }
        except Exception as e:
            self.stats['errors'] += 1
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }

    async def enhance_ui(self, component_path: str, requirements: str) -> Dict[str, Any]:
        """Use Gemini to enhance UI components"""
        prompt = f"""You are a senior UI/UX designer and React/TypeScript expert.

Analyze the component at {component_path} and suggest improvements based on these requirements:
{requirements}

Provide:
1. Specific UI/UX improvements
2. Accessibility enhancements
3. Performance optimizations
4. Modern design patterns
5. Code examples for key improvements

Focus on:
- Tailwind CSS best practices
- Next.js 15 optimization
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA)
- Performance (Core Web Vitals)"""

        return await self.execute_gemini_command(prompt)

    async def generate_ui_description(self, ui_type: str, context: str) -> Dict[str, Any]:
        """Generate detailed UI descriptions for image generation"""
        prompt = f"""You are a UI designer creating detailed descriptions for AI image generation.

Create a detailed visual description for: {ui_type}

Context: {context}

Provide a detailed description including:
1. Layout and structure
2. Color scheme and theme
3. Typography and spacing
4. Visual elements and icons
5. Interactive elements
6. Accessibility features

Format the description to be suitable for DALL-E 3 or similar image generation models."""

        return await self.execute_gemini_command(prompt)

    async def analyze_codebase(self, pattern: str) -> Dict[str, Any]:
        """Analyze entire codebase for patterns using Gemini's massive context"""
        prompt = f"""Analyze the ISTANI fitness platform codebase for: {pattern}

Use @ syntax to reference files and provide comprehensive analysis including:
1. Current implementation
2. Issues or improvements needed
3. Best practices recommendations
4. Security considerations
5. Performance optimizations

Focus on Next.js 15, TypeScript, and Supabase best practices."""

        return await self.execute_gemini_command(prompt)

    async def review_component(self, file_path: str) -> Dict[str, Any]:
        """Review a specific component for quality and best practices"""
        prompt = f"""Review the component at @{file_path}

Provide detailed analysis:
1. Code quality and TypeScript usage
2. React/Next.js best practices
3. Performance considerations
4. Accessibility issues
5. Security concerns
6. Suggested improvements with code examples

Be specific and actionable."""

        return await self.execute_gemini_command(prompt)

    async def get_status(self) -> Dict[str, Any]:
        """Get current status and statistics"""
        return {
            'enabled': self.enabled,
            'auto_consult': self.auto_consult,
            'stats': self.stats,
            'history_size': len(self.history),
            'model': GEMINI_MODEL,
            'project_root': self.project_root
        }

    def clear_history(self):
        """Clear consultation history"""
        self.history = []

    def toggle_auto_consult(self, enable: bool = None):
        """Toggle auto-consultation"""
        if enable is None:
            self.auto_consult = not self.auto_consult
        else:
            self.auto_consult = enable
        return self.auto_consult

# MCP Protocol Implementation
async def handle_mcp_message(server: GeminiMCPServer, message: Dict) -> Dict:
    """Handle MCP protocol messages"""

    method = message.get('method')
    params = message.get('params', {})

    if method == 'tools/list':
        return {
            'tools': [
                {
                    'name': 'enhance_ui',
                    'description': 'Enhance UI components with Gemini AI',
                    'inputSchema': {
                        'type': 'object',
                        'properties': {
                            'component_path': {
                                'type': 'string',
                                'description': 'Path to the component file'
                            },
                            'requirements': {
                                'type': 'string',
                                'description': 'Requirements for enhancement'
                            }
                        },
                        'required': ['component_path', 'requirements']
                    }
                },
                {
                    'name': 'generate_ui_description',
                    'description': 'Generate detailed UI descriptions for image generation',
                    'inputSchema': {
                        'type': 'object',
                        'properties': {
                            'ui_type': {
                                'type': 'string',
                                'description': 'Type of UI element (e.g., "workout card", "progress dashboard")'
                            },
                            'context': {
                                'type': 'string',
                                'description': 'Context and requirements'
                            }
                        },
                        'required': ['ui_type', 'context']
                    }
                },
                {
                    'name': 'analyze_codebase',
                    'description': 'Analyze entire codebase with Gemini massive context',
                    'inputSchema': {
                        'type': 'object',
                        'properties': {
                            'pattern': {
                                'type': 'string',
                                'description': 'What to analyze for'
                            }
                        },
                        'required': ['pattern']
                    }
                },
                {
                    'name': 'review_component',
                    'description': 'Review a specific component for quality',
                    'inputSchema': {
                        'type': 'object',
                        'properties': {
                            'file_path': {
                                'type': 'string',
                                'description': 'Path to component file'
                            }
                        },
                        'required': ['file_path']
                    }
                },
                {
                    'name': 'gemini_status',
                    'description': 'Get Gemini integration status',
                    'inputSchema': {
                        'type': 'object',
                        'properties': {}
                    }
                }
            ]
        }

    elif method == 'tools/call':
        tool_name = params.get('name')
        tool_args = params.get('arguments', {})

        if tool_name == 'enhance_ui':
            result = await server.enhance_ui(
                tool_args.get('component_path'),
                tool_args.get('requirements')
            )
        elif tool_name == 'generate_ui_description':
            result = await server.generate_ui_description(
                tool_args.get('ui_type'),
                tool_args.get('context')
            )
        elif tool_name == 'analyze_codebase':
            result = await server.analyze_codebase(
                tool_args.get('pattern')
            )
        elif tool_name == 'review_component':
            result = await server.review_component(
                tool_args.get('file_path')
            )
        elif tool_name == 'gemini_status':
            result = await server.get_status()
        else:
            result = {
                'success': False,
                'error': f'Unknown tool: {tool_name}'
            }

        return {
            'content': [
                {
                    'type': 'text',
                    'text': json.dumps(result, indent=2)
                }
            ]
        }

    return {'error': f'Unknown method: {method}'}

async def run_stdio_mode(server: GeminiMCPServer):
    """Run in stdio mode for Claude Desktop integration"""
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break

            message = json.loads(line)
            response = await handle_mcp_message(server, message)

            print(json.dumps(response), flush=True)

        except KeyboardInterrupt:
            break
        except Exception as e:
            error_response = {
                'error': str(e)
            }
            print(json.dumps(error_response), flush=True)

def main():
    parser = argparse.ArgumentParser(description='Gemini MCP Server')
    parser.add_argument('--mode', choices=['stdio', 'http'], default='stdio',
                       help='Server mode (stdio for Claude Desktop, http for HTTP API)')
    parser.add_argument('--project-root', type=str, default=None,
                       help='Project root directory')
    parser.add_argument('--port', type=int, default=8006,
                       help='HTTP server port (http mode only)')

    args = parser.parse_args()

    # Create server
    server = GeminiMCPServer(project_root=args.project_root)

    # Run based on mode
    if args.mode == 'stdio':
        asyncio.run(run_stdio_mode(server))
    else:
        print(f"HTTP mode on port {args.port} (not implemented yet)")
        print("Use stdio mode for Claude Desktop integration")

if __name__ == '__main__':
    main()
