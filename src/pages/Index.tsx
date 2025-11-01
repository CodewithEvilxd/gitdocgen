import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Github, Download, Copy, CheckCircle2, FolderTree, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';


interface RepoData {
  name: string;
  description: string;
  clone_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  html_url: string;
  owner: {
    login: string;
    html_url: string;
  };
  license: {
    name: string;
  } | null;
  topics?: string[];
  default_branch: string;
}

interface FileContent {
  name: string;
  type: string;
  path: string;
  sha?: string;
  download_url?: string;
}

interface TreeNode {
  name: string;
  type: string;
  children?: TreeNode[];
}

export default function Index() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/CodewithEvilxd/gitdocgen');
  const [loading, setLoading] = useState(false);
  const [documentation, setDocumentation] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [includeFolderTree, setIncludeFolderTree] = useState(true);
  const [includeAISummary, setIncludeAISummary] = useState(true);
  const [includeCodeReplication, setIncludeCodeReplication] = useState(false);

  const extractRepoInfo = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  };

  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '__pycache__', 'venv', '.venv'];

  const getAuthHeaders = (): Record<string, string> => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return token ? { Authorization: `token ${token}` } : {};
  };

  const fetchDirectoryContents = async (owner: string, repo: string, path = ''): Promise<FileContent[]> => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) return [];
    return await response.json();
  };

  const buildFileTree = async (owner: string, repo: string, path = '', depth = 0, maxDepth = 3): Promise<TreeNode[]> => {
    if (depth >= maxDepth) return [];

    const contents = await fetchDirectoryContents(owner, repo, path);
    const tree: TreeNode[] = [];

    for (const item of contents) {
      if (ignoreDirs.includes(item.name)) continue;
      
      if (item.type === 'dir') {
        const children = await buildFileTree(owner, repo, item.path, depth + 1, maxDepth);
        tree.push({
          name: item.name,
          type: 'dir',
          children: children.length > 0 ? children : undefined
        });
      } else {
        tree.push({
          name: item.name,
          type: 'file'
        });
      }
    }

    return tree.sort((a, b) => {
      if (a.type === 'dir' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const getAllFiles = async (owner: string, repo: string, path = '', files: FileContent[] = []): Promise<FileContent[]> => {
    const contents = await fetchDirectoryContents(owner, repo, path);
    for (const item of contents) {
      if (item.type === 'file') {
        files.push(item);
      } else if (item.type === 'dir' && !ignoreDirs.includes(item.name)) {
        await getAllFiles(owner, repo, item.path, files);
      }
    }
    return files;
  };

  const renderTree = (nodes: TreeNode[], prefix = '', isLast = true): string => {
    // const renderTree = (nodes: TreeNode[], prefix = '', isLast = true): string => {
    let result = '';
    
    nodes.forEach((node, index) => {
      const isLastNode = index === nodes.length - 1;
      const connector = isLastNode ? '└── ' : '├── ';
      const icon = node.type === 'dir' ? '📁 ' : '📄 ';
      
       const currentPrefix = isLast ? prefix : '│   ' + prefix;
      // result += prefix + connector + icon + node.name + '\n';
        result += currentPrefix + connector + icon + node.name + '\n';

      
      if (node.children && node.children.length > 0) {
        const newPrefix = prefix + (isLastNode ? '    ' : '│   ');
        result += renderTree(node.children, newPrefix, isLastNode);
      }
    });
    
    return result;
  };

  const generateAISummary = async (repoData: RepoData, contents: FileContent[], languages: Record<string, number>): Promise<string> => {
    // Analyze repository structure and content
    const hasTests = contents.some(f => f.name.toLowerCase().includes('test') || f.name === 'tests' || f.name === '__tests__');
    const hasCI = contents.some(f => f.name === '.github' || f.name === '.gitlab-ci.yml' || f.name === '.circleci');
    const hasDocker = contents.some(f => f.name === 'Dockerfile' || f.name === 'docker-compose.yml');
    const hasDocs = contents.some(f => f.name === 'docs' || f.name === 'documentation');
    
    const primaryLanguage = Object.keys(languages)[0] || 'Unknown';
    const languageCount = Object.keys(languages).length;
    
    // Determine project type based on files and structure
    let projectType = 'software project';
    if (contents.some(f => f.name === 'package.json')) {
      if (contents.some(f => f.name === 'next.config.js' || f.name === 'next.config.ts')) {
        projectType = 'Next.js web application';
      } else if (contents.some(f => f.name === 'vite.config.js' || f.name === 'vite.config.ts')) {
        projectType = 'Vite-powered web application';
      } else if (contents.some(f => f.name === 'tsconfig.json')) {
        projectType = 'TypeScript/JavaScript application';
      } else {
        projectType = 'Node.js application';
      }
    } else if (contents.some(f => f.name === 'requirements.txt' || f.name === 'setup.py')) {
      projectType = 'Python application';
    } else if (contents.some(f => f.name === 'pom.xml')) {
      projectType = 'Java Maven project';
    } else if (contents.some(f => f.name === 'build.gradle')) {
      projectType = 'Java Gradle project';
    } else if (contents.some(f => f.name === 'Cargo.toml')) {
      projectType = 'Rust project';
    } else if (contents.some(f => f.name === 'go.mod')) {
      projectType = 'Go application';
    }

    // Build quality indicators
    const qualityIndicators: string[] = [];
    if (hasTests) qualityIndicators.push('✅ Includes test suite');
    if (hasCI) qualityIndicators.push('✅ CI/CD pipeline configured');
    if (hasDocker) qualityIndicators.push('✅ Docker support');
    if (hasDocs) qualityIndicators.push('✅ Documentation available');
    if (repoData.license) qualityIndicators.push(`✅ Licensed under ${repoData.license.name}`);

    // Generate intelligent summary
    let summary = `### 🤖 AI-Generated Project Analysis\n\n`;
    summary += `**Project Type:** ${projectType}\n\n`;
    summary += `**Primary Language:** ${primaryLanguage}${languageCount > 1 ? ` (+ ${languageCount - 1} other${languageCount > 2 ? 's' : ''})` : ''}\n\n`;
    
    if (repoData.topics && repoData.topics.length > 0) {
      summary += `**Topics:** ${repoData.topics.map(t => `\`${t}\``).join(', ')}\n\n`;
    }

    summary += `**Project Maturity:**\n`;
    summary += `- ${repoData.stargazers_count} stars indicate ${repoData.stargazers_count > 100 ? 'strong' : repoData.stargazers_count > 10 ? 'moderate' : 'emerging'} community interest\n`;
    summary += `- ${repoData.forks_count} forks suggest ${repoData.forks_count > 50 ? 'active' : repoData.forks_count > 10 ? 'growing' : 'initial'} community contributions\n`;
    summary += `- ${repoData.open_issues_count} open issues ${repoData.open_issues_count > 50 ? '(actively maintained)' : repoData.open_issues_count > 0 ? '(under development)' : '(stable)'}\n\n`;

    if (qualityIndicators.length > 0) {
      summary += `**Quality Indicators:**\n`;
      qualityIndicators.forEach(indicator => {
        summary += `${indicator}\n`;
      });
      summary += '\n';
    }

    // Add smart recommendations
    summary += `**Recommended Use Cases:**\n`;
    if (projectType.includes('web application')) {
      summary += `- Building modern web applications with ${primaryLanguage}\n`;
      summary += `- Learning web development best practices\n`;
    } else if (projectType.includes('Python')) {
      summary += `- Data processing and analysis\n`;
      summary += `- Backend API development\n`;
    } else if (projectType.includes('Java')) {
      summary += `- Enterprise application development\n`;
      summary += `- Building scalable backend services\n`;
    }
    
    if (hasDocker) {
      summary += `- Containerized deployment scenarios\n`;
    }
    if (hasTests) {
      summary += `- Learning testing methodologies\n`;
    }

    return summary;
  };

  const callOpenAIAPI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - return mock response for demo
        return `## Mock AI Response (Rate Limited)

Since the OpenAI API is rate limited, here's a sample code replication prompt structure:

**Project Analysis:**
- This appears to be a software project
- Main technologies: Check repository languages in the GitHub API response
- Key files to recreate: package.json, main source files, configuration files

**To recreate this project:**

1. Initialize project: \`npm init -y\` or equivalent for your package manager
2. Install dependencies: Copy package.json dependencies and devDependencies
3. Create file structure: Mirror the repository folder structure shown above
4. Implement code: Use the file contents provided in the prompt above
5. Configure build tools: Copy configuration files (webpack, babel, etc.)
6. Set up environment: Copy .env.example files and configure environment variables
7. Test the application: Run build and test commands as specified in package.json

**Note:** This is a mock response due to API rate limiting. Get a valid OpenAI API key with credits for real AI-powered code replication that analyzes your specific repository files.`;
      }
      throw new Error(`Failed to call OpenAI API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated';
  };

  const generateCodeReplicationPrompt = async (repoData: RepoData, allFiles: FileContent[]): Promise<string> => {
    // Fetch content for each file using GitHub API instead of raw URLs to avoid CORS
    const fileContents: { path: string; content: string }[] = [];
    for (const file of allFiles.slice(0, 10)) { // Limit to 10 files to avoid too many requests
      try {
        const response = await fetch(`https://api.github.com/repos/${repoData.owner.login}/${repoData.name}/contents/${file.path}`, { headers: getAuthHeaders() });
        if (response.ok) {
          const data = await response.json();
          if (data.content && data.encoding === 'base64') {
            const content = atob(data.content);
            fileContents.push({ path: file.path, content });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${file.path}:`, error);
      }
    }

    const prompt = `You are an expert software engineer. I want you to recreate this exact GitHub repository: ${repoData.html_url}

Repository details:
- Name: ${repoData.name}
- Description: ${repoData.description}
- Language: ${Object.keys(await fetch(`https://api.github.com/repos/${repoData.owner.login}/${repoData.name}/languages`, { headers: getAuthHeaders() }).then(r => r.json()))[0]}

Here are the files from the repository:

${fileContents.map(f => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}

Please provide:
1. Complete code for each file to recreate this project exactly
2. A step-by-step guide to set up and run the project
3. All necessary dependencies and configurations

Make sure the code is 100% identical and functional.`;

    const aiResponse = await callOpenAIAPI(prompt);
    return `## 🤖 AI-Generated Code Replication Prompt\n\n**Use this prompt with an AI agent to recreate the exact same project:**\n\n\`\`\`\n${prompt}\n\`\`\`\n\n**AI Response:**\n\n${aiResponse}`;
  };

  const generateDocumentation = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      setError('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
      return;
    }

    setLoading(true);
    setError('');
    setDocumentation('');

    try {
      // Fetch repository information from GitHub API
      const repoResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, { headers: getAuthHeaders() });

      if (!repoResponse.ok) {
        throw new Error('Repository not found or not accessible');
      }

      const repoData: RepoData = await repoResponse.json();

      // Fetch repository contents
      const contentsResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents`, { headers: getAuthHeaders() });
      const contents: FileContent[] = await contentsResponse.json();

      // Fetch languages
      const languagesResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/languages`, { headers: getAuthHeaders() });
      const languages: Record<string, number> = await languagesResponse.json();

      // Build folder tree if enabled
      let folderTree = '';
      if (includeFolderTree) {
        toast.info('Building folder structure tree...');
        const tree = await buildFileTree(repoInfo.owner, repoInfo.repo);
        folderTree = renderTree(tree);
      }

      // Generate AI summary if enabled
      let aiSummary = '';
      if (includeAISummary) {
        toast.info('Generating AI-powered analysis...');
        aiSummary = await generateAISummary(repoData, contents, languages);
      }

      // Generate code replication prompt if enabled
      let codeReplicationPrompt = '';
      if (includeCodeReplication) {
        try {
          toast.info('Generating code replication prompt with OpenAI...');
          const allFiles = await getAllFiles(repoInfo.owner, repoInfo.repo);
          codeReplicationPrompt = await generateCodeReplicationPrompt(repoData, allFiles);
        } catch (error) {
          console.error('Failed to generate code replication prompt:', error);
          toast.error('Failed to generate code replication prompt. Continuing without it.');
          codeReplicationPrompt = '## Code Replication Prompt\n\n*Failed to generate AI prompt. Please check your Gemini API key and try again.*';
        }
      }

      // Generate README content
      const readme = generateReadmeContent(repoData, contents, languages, folderTree, aiSummary, codeReplicationPrompt);
      setDocumentation(readme);
      toast.success('Documentation generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate documentation');
      toast.error('Failed to generate documentation');
    } finally {
      setLoading(false);
    }
  };

  const generateReadmeContent = (repoData: RepoData, contents: FileContent[], languages: Record<string, number>, folderTree: string, aiSummary: string, codeReplicationPrompt: string = '') => {
    const languageList = Object.keys(languages).join(', ');
    const hasPackageJson = contents.some((file: FileContent) => file.name === 'package.json');
    const hasRequirementsTxt = contents.some((file: FileContent) => file.name === 'requirements.txt');
    const hasPomXml = contents.some((file: FileContent) => file.name === 'pom.xml');

    let installSection = '';
    if (hasPackageJson) {
      installSection = `## Installation

\`\`\`bash
# Clone the repository
git clone ${repoData.clone_url}

# Navigate to project directory
cd ${repoData.name}

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
\`\`\``;
    } else if (hasRequirementsTxt) {
      installSection = `## Installation

\`\`\`bash
# Clone the repository
git clone ${repoData.clone_url}

# Navigate to project directory
cd ${repoData.name}

# Install dependencies
pip install -r requirements.txt
\`\`\``;
    } else if (hasPomXml) {
      installSection = `## Installation

\`\`\`bash
# Clone the repository
git clone ${repoData.clone_url}

# Navigate to project directory
cd ${repoData.name}

# Build the project
mvn clean install
\`\`\``;
    } else {
      installSection = `## Installation

\`\`\`bash
# Clone the repository
git clone ${repoData.clone_url}

# Navigate to project directory
cd ${repoData.name}
\`\`\``;
    }

    const folderStructureSection = folderTree ? `

## 📁 Project Structure

\`\`\`
${repoData.name}/
${folderTree}
\`\`\`
` : '';

    const aiSummarySection = aiSummary ? `

${aiSummary}
` : '';

    return `# ${repoData.name}

${repoData.description || 'A GitHub repository'}

## 📋 Table of Contents

- [About](#about)${aiSummary ? '\n- [AI-Generated Project Analysis](#ai-generated-project-analysis)' : ''}${codeReplicationPrompt ? '\n- [Code Replication Prompt](#code-replication-prompt)' : ''}
- [Technologies](#technologies)${folderTree ? '\n- [Project Structure](#project-structure)' : ''}
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🎯 About

${repoData.description || 'This project provides various functionalities and features.'}

**Repository Stats:**
- ⭐ Stars: ${repoData.stargazers_count}
- 🍴 Forks: ${repoData.forks_count}
- 👁️ Watchers: ${repoData.watchers_count}
- 🐛 Open Issues: ${repoData.open_issues_count}
${aiSummarySection}
${codeReplicationPrompt ? `

${codeReplicationPrompt}
` : ''}
## 🛠️ Technologies

This project is built with:

${languageList ? `- ${languageList.split(', ').join('\n- ')}` : '- Check repository for details'}
${folderStructureSection}
${installSection}

## 🚀 Usage

\`\`\`bash
# Add specific usage instructions here
# Example: npm start, python main.py, etc.
\`\`\`

For detailed usage instructions, please refer to the project documentation or source code.

## ✨ Features

- Feature 1: [Describe key feature]
- Feature 2: [Describe key feature]
- Feature 3: [Describe key feature]

*Note: Review the codebase to identify and list specific features*

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

${repoData.license ? `This project is licensed under the ${repoData.license.name} - see the [LICENSE](LICENSE) file for details.` : 'License information not available. Please check the repository for license details.'}

## 📧 Contact

**Project Link:** [${repoData.html_url}](${repoData.html_url})

**Author:** [${repoData.owner.login}](${repoData.owner.html_url})

---

*Generated with ❤️ by Raj*
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(documentation);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReadme = () => {
    const blob = new Blob([documentation], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('README.md downloaded!');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                GitHub Documentation Generator
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Generate comprehensive README files for your repositories</p>
            </div>
            <Badge variant="secondary" className="ml-auto gap-1 text-xs">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">AI-Powered</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                Repository Input
              </CardTitle>
              <CardDescription className="text-sm">
                Enter your GitHub repository URL to generate documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">GitHub Repository URL</label>
                <Input
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateDocumentation()}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Example: https://github.com/facebook/react
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-linear-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <Checkbox
                    id="aiSummary"
                    checked={includeAISummary}
                    onCheckedChange={(checked) => setIncludeAISummary(checked as boolean)}
                  />
                  <label
                    htmlFor="aiSummary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Include AI-powered project analysis
                  </label>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Checkbox
                    id="folderTree"
                    checked={includeFolderTree}
                    onCheckedChange={(checked) => setIncludeFolderTree(checked as boolean)}
                  />
                  <label
                    htmlFor="folderTree"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <FolderTree className="w-4 h-4 text-blue-600" />
                    Include folder structure tree
                  </label>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Checkbox
                    id="codeReplication"
                    checked={includeCodeReplication}
                    onCheckedChange={(checked) => setIncludeCodeReplication(checked as boolean)}
                  />
                  <label
                    htmlFor="codeReplication"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Generate code replication prompt (uses OpenAI)
                  </label>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={generateDocumentation}
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Documentation
                  </>
                )}
              </Button>

              {/* Features List */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 text-sm">What's included:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Project overview and description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <span>AI-powered project analysis (NEW!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Technology stack detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Folder structure tree (optional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Installation instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Repository statistics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Quality indicators & recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <span>AI-powered code replication prompt (NEW!)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Generated Documentation
                </span>
                {documentation && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadReadme}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                Your README.md content will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentation ? (
                <Textarea
                  value={documentation}
                  readOnly
                  className="font-mono text-xs sm:text-sm h-[400px] sm:h-[600px] resize-none"
                />
              ) : (
                <div className="h-[400px] sm:h-[600px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50">
                  <div className="text-center space-y-3 p-4 sm:p-6">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-300" />
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Enter a GitHub repository URL and click "Generate Documentation"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The generated README will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-6 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This tool now features intelligent project analysis and AI-powered code replication! It automatically detects project type,
                  analyzes code structure, identifies quality indicators (tests, CI/CD, Docker), evaluates
                  project maturity, and provides smart recommendations for use cases. Plus, generate detailed prompts
                  for AI agents to recreate projects exactly. All without requiring any API keys for basic features!
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs font-medium border">
                    No Authentication Required
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs font-medium border">
                    Public Repos Only
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs font-medium border">
                    Instant Generation
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs font-medium border">
                    AI Analysis
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs font-medium border">
                    Folder Tree Visualization
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs font-medium border">
                    Code Replication
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      {/* <footer className="border-t mt-12 py-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with ❤️ By Raj</p>
        </div>
      </footer> */}
      <footer className="border-t mt-8 sm:mt-12 py-4 sm:py-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-linear-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50">
            <span className="text-xs sm:text-sm text-muted-foreground">Built with</span>
            <span className="text-red-500 text-base sm:text-lg">❤️</span>
            <span className="text-xs sm:text-sm text-muted-foreground">by</span>
            <span className="font-bold tracking-wide bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-sm sm:text-base">
              Raj
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}