import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_TEXT } from "../constants";

// Reuse the existing AI client initialization
const API_KEY = typeof process !== 'undefined' && process.env && process.env.API_KEY 
                ? process.env.API_KEY 
                : undefined;

let ai: GoogleGenAI | null = null;
let initError: Error | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error: any) {
    console.error("Failed to initialize GoogleGenAI:", error);
    initError = error;
    ai = null;
  }
}

export interface CodeMetrics {
  quality: {
    maintainability: number; // 0-100
    reliability: number; // 0-100
    security: number; // 0-100
    performance: number; // 0-100
  };
  duplication: {
    percentage: number;
    duplicatedBlocks: Array<{
      startLine: number;
      endLine: number;
      duplicateOf: string;
    }>;
  };
  testCoverage: {
    estimatedCoverage: number;
    criticalPaths: string[];
    suggestedTests: string[];
  };
  performance: {
    timeComplexity: string;
    spaceComplexity: string;
    bottlenecks: Array<{
      location: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
  };
}

export interface CodeAnalysisResult {
  complexity: {
    score: number;
    explanation: string;
    suggestions: string[];
  };
  security: {
    vulnerabilities: Array<{
      severity: 'high' | 'medium' | 'low';
      description: string;
      lineNumber?: number;
      fix?: string;
    }>;
    summary: string;
  };
  style: {
    issues: Array<{
      type: 'warning' | 'suggestion';
      description: string;
      lineNumber?: number;
      fix?: string;
    }>;
    summary: string;
  };
  documentation: {
    overview: string;
    functions: Array<{
      name: string;
      description: string;
      parameters?: Array<{
        name: string;
        type: string;
        description: string;
      }>;
      returnType?: string;
      returnDescription?: string;
    }>;
  };
  metrics: CodeMetrics;
}

export const analyzeCode = async (
  code: string,
  language: string
): Promise<CodeAnalysisResult> => {
  if (!ai) {
    throw new Error("AI service is not available. API key might be missing or invalid.");
  }

  try {
    // 1. Analyze Code Complexity
    const complexityPrompt = `Analyze the complexity of this ${language} code. Consider:
    - Cyclomatic complexity
    - Cognitive complexity
    - Time and space complexity
    - Code nesting levels
    - Function/method length
    Provide a score from 1-10 (10 being most complex) and explain why.
    Also suggest ways to reduce complexity.
    
    Code:
    ${code}`;

    const complexityResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: complexityPrompt,
    });

    if (!complexityResponse.text) {
      throw new Error("Failed to get complexity analysis from AI model");
    }

    // 2. Security Analysis
    const securityPrompt = `Analyze this ${language} code for security vulnerabilities. Consider:
    - Input validation
    - Authentication/Authorization
    - Data exposure
    - Injection vulnerabilities
    - Common security patterns
    List any vulnerabilities found with severity and suggested fixes.
    
    Code:
    ${code}`;

    const securityResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: securityPrompt,
    });

    if (!securityResponse.text) {
      throw new Error("Failed to get security analysis from AI model");
    }

    // 3. Code Style Analysis
    const stylePrompt = `Analyze this ${language} code for style and best practices. Consider:
    - Naming conventions
    - Code organization
    - Documentation
    - Error handling
    - Design patterns
    List any style issues or suggestions for improvement.
    
    Code:
    ${code}`;

    const styleResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: stylePrompt,
    });

    if (!styleResponse.text) {
      throw new Error("Failed to get style analysis from AI model");
    }

    // 4. Generate Documentation
    const docPrompt = `Generate comprehensive documentation for this ${language} code. Include:
    - Overall code purpose and functionality
    - Function/method documentation with parameters and return types
    - Usage examples
    - Important notes or warnings
    
    Code:
    ${code}`;

    const docResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: docPrompt,
    });

    if (!docResponse.text) {
      throw new Error("Failed to get documentation from AI model");
    }

    // 5. Code Metrics Analysis
    const metricsPrompt = `Analyze this ${language} code for comprehensive metrics. Consider:
    - Code quality metrics (maintainability, reliability, security, performance)
    - Code duplication patterns
    - Test coverage estimation
    - Performance characteristics and bottlenecks
    Provide detailed metrics in a structured format.
    
    Code:
    ${code}`;

    const metricsResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: metricsPrompt,
    });

    if (!metricsResponse.text) {
      throw new Error("Failed to get metrics analysis from AI model");
    }

    // Parse and structure the responses
    const complexityText = complexityResponse.text;
    const securityText = securityResponse.text;
    const styleText = styleResponse.text;
    const docText = docResponse.text;

    // Extract complexity score (assuming it's mentioned in the response)
    const complexityScore = parseInt(complexityText.match(/score:?\s*(\d+)/i)?.[1] || '5');

    const metricsText = metricsResponse.text;
    const metrics = parseCodeMetrics(metricsText);

    return {
      complexity: {
        score: complexityScore,
        explanation: complexityText,
        suggestions: complexityText.split('\n').filter(line => line.toLowerCase().includes('suggestion')),
      },
      security: {
        vulnerabilities: parseSecurityVulnerabilities(securityText),
        summary: securityText,
      },
      style: {
        issues: parseStyleIssues(styleText),
        summary: styleText,
      },
      documentation: {
        overview: docText,
        functions: parseFunctionDocumentation(docText),
      },
      metrics: metrics,
    };
  } catch (error: any) {
    console.error("Error in code analysis:", error);
    throw new Error(`Code analysis failed: ${error.message}`);
  }
};

// Helper functions to parse AI responses
function parseSecurityVulnerabilities(text: string) {
  if (!text) return [];
  
  const vulnerabilities = [];
  const lines = text.split('\n');
  let currentVuln: any = null;

  for (const line of lines) {
    if (!line) continue;
    
    if (line.toLowerCase().includes('severity:')) {
      if (currentVuln) vulnerabilities.push(currentVuln);
      currentVuln = {
        severity: line.toLowerCase().includes('high') ? 'high' : 
                 line.toLowerCase().includes('medium') ? 'medium' : 'low',
        description: '',
      };
    } else if (currentVuln) {
      if (line.toLowerCase().includes('fix:')) {
        currentVuln.fix = line.split('fix:')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('line')) {
        const lineMatch = line.match(/line\s*(\d+)/i);
        if (lineMatch) currentVuln.lineNumber = parseInt(lineMatch[1]);
      } else {
        currentVuln.description += line + '\n';
      }
    }
  }
  if (currentVuln) vulnerabilities.push(currentVuln);
  return vulnerabilities;
}

function parseStyleIssues(text: string) {
  if (!text) return [];
  
  const issues = [];
  const lines = text.split('\n');
  let currentIssue: any = null;

  for (const line of lines) {
    if (!line) continue;
    
    if (line.toLowerCase().includes('issue:') || line.toLowerCase().includes('suggestion:')) {
      if (currentIssue) issues.push(currentIssue);
      currentIssue = {
        type: line.toLowerCase().includes('suggestion') ? 'suggestion' : 'warning',
        description: '',
      };
    } else if (currentIssue) {
      if (line.toLowerCase().includes('fix:')) {
        currentIssue.fix = line.split('fix:')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('line')) {
        const lineMatch = line.match(/line\s*(\d+)/i);
        if (lineMatch) currentIssue.lineNumber = parseInt(lineMatch[1]);
      } else {
        currentIssue.description += line + '\n';
      }
    }
  }
  if (currentIssue) issues.push(currentIssue);
  return issues;
}

function parseFunctionDocumentation(text: string) {
  if (!text) return [];
  
  const functions = [];
  const lines = text.split('\n');
  let currentFunc: any = null;

  for (const line of lines) {
    if (!line) continue;
    
    if (line.toLowerCase().includes('function') || line.toLowerCase().includes('method')) {
      if (currentFunc) functions.push(currentFunc);
      const nameMatch = line.match(/(?:function|method)\s+(\w+)/i);
      currentFunc = {
        name: nameMatch ? nameMatch[1] : 'Unknown',
        description: '',
        parameters: [],
      };
    } else if (currentFunc) {
      if (line.toLowerCase().includes('parameter:')) {
        const paramMatch = line.match(/parameter:\s*(\w+)\s*\((\w+)\)\s*:\s*(.+)/i);
        if (paramMatch) {
          currentFunc.parameters.push({
            name: paramMatch[1],
            type: paramMatch[2],
            description: paramMatch[3] || '',
          });
        }
      } else if (line.toLowerCase().includes('returns:')) {
        const returnMatch = line.match(/returns:\s*(\w+)\s*:\s*(.+)/i);
        if (returnMatch) {
          currentFunc.returnType = returnMatch[1];
          currentFunc.returnDescription = returnMatch[2] || '';
        }
      } else {
        currentFunc.description += line + '\n';
      }
    }
  }
  if (currentFunc) functions.push(currentFunc);
  return functions;
}

function parseCodeMetrics(text: string): CodeMetrics {
  if (!text) {
    return {
      quality: {
        maintainability: 0,
        reliability: 0,
        security: 0,
        performance: 0,
      },
      duplication: {
        percentage: 0,
        duplicatedBlocks: [],
      },
      testCoverage: {
        estimatedCoverage: 0,
        criticalPaths: [],
        suggestedTests: [],
      },
      performance: {
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        bottlenecks: [],
      },
    };
  }

  const metrics: CodeMetrics = {
    quality: {
      maintainability: 0,
      reliability: 0,
      security: 0,
      performance: 0,
    },
    duplication: {
      percentage: 0,
      duplicatedBlocks: [],
    },
    testCoverage: {
      estimatedCoverage: 0,
      criticalPaths: [],
      suggestedTests: [],
    },
    performance: {
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      bottlenecks: [],
    },
  };

  const lines = text.split('\n');
  let currentSection: string | null = null;

  for (const line of lines) {
    if (!line) continue;

    // Parse quality metrics
    if (line.toLowerCase().includes('maintainability:')) {
      metrics.quality.maintainability = parseInt(line.match(/\d+/)?.[0] || '0');
    } else if (line.toLowerCase().includes('reliability:')) {
      metrics.quality.reliability = parseInt(line.match(/\d+/)?.[0] || '0');
    } else if (line.toLowerCase().includes('security:')) {
      metrics.quality.security = parseInt(line.match(/\d+/)?.[0] || '0');
    } else if (line.toLowerCase().includes('performance:')) {
      metrics.quality.performance = parseInt(line.match(/\d+/)?.[0] || '0');
    }

    // Parse duplication metrics
    if (line.toLowerCase().includes('duplication:')) {
      metrics.duplication.percentage = parseInt(line.match(/\d+/)?.[0] || '0');
    } else if (line.toLowerCase().includes('duplicated block:')) {
      const blockMatch = line.match(/lines (\d+)-(\d+)/i);
      if (blockMatch) {
        metrics.duplication.duplicatedBlocks.push({
          startLine: parseInt(blockMatch[1]),
          endLine: parseInt(blockMatch[2]),
          duplicateOf: line.split('duplicate of:')[1]?.trim() || 'Unknown',
        });
      }
    }

    // Parse test coverage
    if (line.toLowerCase().includes('test coverage:')) {
      metrics.testCoverage.estimatedCoverage = parseInt(line.match(/\d+/)?.[0] || '0');
    } else if (line.toLowerCase().includes('critical path:')) {
      metrics.testCoverage.criticalPaths.push(line.split('critical path:')[1]?.trim() || '');
    } else if (line.toLowerCase().includes('suggested test:')) {
      metrics.testCoverage.suggestedTests.push(line.split('suggested test:')[1]?.trim() || '');
    }

    // Parse performance metrics
    if (line.toLowerCase().includes('time complexity:')) {
      metrics.performance.timeComplexity = line.split('time complexity:')[1]?.trim() || 'Unknown';
    } else if (line.toLowerCase().includes('space complexity:')) {
      metrics.performance.spaceComplexity = line.split('space complexity:')[1]?.trim() || 'Unknown';
    } else if (line.toLowerCase().includes('bottleneck:')) {
      const impactMatch = line.match(/impact:\s*(high|medium|low)/i);
      metrics.performance.bottlenecks.push({
        location: line.split('at:')[1]?.split('impact:')[0]?.trim() || 'Unknown',
        description: line.split('bottleneck:')[1]?.split('at:')[0]?.trim() || '',
        impact: (impactMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'low',
      });
    }
  }

  return metrics;
} 