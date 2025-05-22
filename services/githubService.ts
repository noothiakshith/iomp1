import type { RepoData, Commit, Issue, PullRequest, Contributor, RepoFile } from '../types';
import { GITHUB_API_BASE_URL } from '../constants';

const GITHUB_TOKEN = undefined; // For local development, you could set a token here, but it should NOT be committed.
                               // In a real app, this would be handled server-side or via secure OAuth.

const commonHeaders: HeadersInit = {
  'Accept': 'application/vnd.github.v3+json',
};
if (GITHUB_TOKEN) {
  commonHeaders['Authorization'] = `token ${GITHUB_TOKEN}`;
}

const MAX_ITEMS_PER_PAGE = 30; // Max items for paginated resources like commits, issues, PRs

// Helper to construct RepoFile from GitHub API tree data
const mapGitHubTreeToRepoFile = (item: any, currentPath: string = ''): RepoFile => {
  const fullPath = currentPath ? `${currentPath}/${item.path}` : item.path;
  return {
    name: item.path, // In recursive calls, item.path is the name
    path: fullPath,
    type: item.type === 'tree' ? 'dir' : 'file',
    sha: item.sha,
    size: item.size, // May not always be present for 'tree' type from recursive call
    // Content is not fetched here to save API calls
  };
};

const buildFileTree = (tree: any[], basePath: string = ''): RepoFile[] => {
  const fileMap: { [key: string]: RepoFile } = {};
  const rootFiles: RepoFile[] = [];

  for (const item of tree) {
    const pathParts = item.path.split('/');
    let currentLevel = fileMap;
    let currentPathForMap = '';
    let parentChildrenList: RepoFile[] = rootFiles; // Start with root unless a parent is found

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      currentPathForMap = currentPathForMap ? `${currentPathForMap}/${part}` : part;

      if (i === pathParts.length - 1) { // Leaf node (file or an empty dir explicitly listed)
        const repoFile: RepoFile = {
          name: part,
          path: item.path, // Full path from tree item
          type: item.type === 'tree' ? 'dir' : 'file',
          sha: item.sha,
          size: item.size,
          children: item.type === 'tree' ? [] : undefined,
          // content: item.type === 'file' ? item.content : undefined // Content not fetched by default tree API
        };
        if (parentChildrenList === rootFiles && !pathParts.slice(0, i).join('/')) { // Direct child of root
            rootFiles.push(repoFile);
        } else {
            const parentPath = pathParts.slice(0, i).join('/');
            const parentNode = findNodeByPath(rootFiles, parentPath);
            if (parentNode && parentNode.children) {
                parentNode.children.push(repoFile);
            } else {
                 // This case might happen if parent wasn't a 'tree' or if tree is not perfectly ordered.
                 // For simplicity, add to root if parent not found properly.
                 rootFiles.push(repoFile);
            }
        }
        fileMap[item.path] = repoFile; // Add to map for quick lookup if needed
      } else { // Directory part
        let dirNode = findNodeByPath(rootFiles, pathParts.slice(0, i + 1).join('/'));
        if (!dirNode) {
          dirNode = {
            name: part,
            path: pathParts.slice(0, i + 1).join('/'),
            type: 'dir',
            children: [],
            sha: (item.type === 'tree' && i === pathParts.length -1 ) ? item.sha : undefined // sha only if this part itself is a tree entry
          };
          if (parentChildrenList === rootFiles && !pathParts.slice(0, i).join('/')) {
             rootFiles.push(dirNode);
          } else {
            const parentPath = pathParts.slice(0, i).join('/');
            const parentNode = findNodeByPath(rootFiles, parentPath);
            if (parentNode && parentNode.children) {
                parentNode.children.push(dirNode);
            } else {
                rootFiles.push(dirNode); // Fallback
            }
          }
           fileMap[dirNode.path] = dirNode;
        }
        parentChildrenList = dirNode.children!;
      }
    }
  }
  return rootFiles;
};

// Helper to find a node in the partially built tree
const findNodeByPath = (nodes: RepoFile[], path: string): RepoFile | null => {
    for (const node of nodes) {
        if (node.path === path) return node;
        if (node.type === 'dir' && node.children) {
            const found = findNodeByPath(node.children, path);
            if (found) return found;
        }
    }
    return null;
};


export const fetchRepoData = async (owner: string, repo: string): Promise<RepoData> => {
  const repoUrl = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`;
  
  try {
    // 1. Fetch basic repo data
    const repoRes = await fetch(repoUrl, { headers: commonHeaders });
    if (!repoRes.ok) {
      if (repoRes.status === 404) throw new Error(`Repository ${owner}/${repo} not found.`);
      if (repoRes.status === 403) throw new Error(`GitHub API rate limit exceeded or access forbidden. If this is a private repo, ensure a token with 'repo' scope is configured.`);
      throw new Error(`Failed to fetch repository data: ${repoRes.status} ${repoRes.statusText}`);
    }
    const repoDetails = await repoRes.json();

    // 2. Fetch other data in parallel
    const [
        commitsRes, 
        issuesRes, 
        pullsRes, 
        contributorsRes,
        // No direct branch data needed if we use default_branch for tree
    ] = await Promise.all([
      fetch(`${repoUrl}/commits?per_page=${MAX_ITEMS_PER_PAGE}`, { headers: commonHeaders }),
      fetch(`${repoUrl}/issues?state=all&per_page=${MAX_ITEMS_PER_PAGE}`, { headers: commonHeaders }), // Fetch open and closed
      fetch(`${repoUrl}/pulls?state=all&per_page=${MAX_ITEMS_PER_PAGE}`, { headers: commonHeaders }),   // Fetch open, closed, merged
      fetch(`${repoUrl}/contributors?per_page=${MAX_ITEMS_PER_PAGE}`, { headers: commonHeaders }),
    ]);

    // Process responses
    const commitsData = commitsRes.ok ? await commitsRes.json() : [];
    const issuesData = issuesRes.ok ? await issuesRes.json() : [];
    const pullsData = pullsRes.ok ? await pullsRes.json() : [];
    const contributorsData = contributorsRes.ok ? await contributorsRes.json() : [];
    
    // 3. Fetch file tree (recursive)
    let files: RepoFile[] = [];
    if (repoDetails.default_branch) {
        const treeUrl = `${repoUrl}/git/trees/${repoDetails.default_branch}?recursive=1`;
        const treeRes = await fetch(treeUrl, { headers: commonHeaders });
        if (treeRes.ok) {
            const treeData = await treeRes.json();
            if (treeData.tree) {
                 // The recursive tree is flat, needs structuring.
                files = buildFileTree(treeData.tree);
            } else {
                console.warn("File tree data is missing 'tree' property:", treeData);
            }
        } else {
            console.warn(`Failed to fetch file tree: ${treeRes.status}`);
            // Try to fetch root contents as a fallback (non-recursive)
            const rootContentsUrl = `${repoUrl}/contents`;
            const rootContentsRes = await fetch(rootContentsUrl, {headers: commonHeaders});
            if (rootContentsRes.ok) {
                const rootContentsData = await rootContentsRes.json();
                files = rootContentsData.map((item: any) => ({
                    name: item.name,
                    path: item.path,
                    type: item.type, // 'dir' or 'file'
                    sha: item.sha,
                    size: item.size,
                    url: item.html_url,
                    // No children or content fetched here for simplicity
                }));
            } else {
                 console.warn(`Failed to fetch root contents as fallback: ${rootContentsRes.status}`);
            }
        }
    } else {
        console.warn("Default branch not found, cannot fetch file tree.");
    }


    // Map to application types
    const commits: Commit[] = commitsData.map((c: any) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name || c.author?.login || 'Unknown',
      date: c.commit.author?.date || new Date().toISOString(),
      url: c.html_url,
    }));

    const issues: Issue[] = issuesData.map((i: any) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      user: i.user?.login || 'Unknown',
      date: i.created_at,
      url: i.html_url,
      state: i.state, // 'open' or 'closed'
      labels: i.labels.map((l: any) => ({ name: l.name, color: l.color })),
    }));

    const pullRequests: PullRequest[] = pullsData.map((p: any) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      user: p.user?.login || 'Unknown',
      date: p.created_at,
      url: p.html_url,
      state: p.merged_at ? 'merged' : p.state, // 'open', 'closed', 'merged'
    }));

    const contributors: Contributor[] = contributorsData.map((c: any) => ({
      login: c.login,
      avatarUrl: c.avatar_url,
      contributions: c.contributions,
      htmlUrl: c.html_url,
    }));

    return {
      fullName: repoDetails.full_name,
      name: repoDetails.name,
      owner: repoDetails.owner?.login,
      description: repoDetails.description,
      stars: repoDetails.stargazers_count,
      forks: repoDetails.forks_count,
      openIssuesCount: repoDetails.open_issues_count, // This is open issues, issues array above has all
      defaultBranch: repoDetails.default_branch,
      url: repoDetails.html_url,
      files,
      commits,
      issues,
      pullRequests,
      contributors,
      language: repoDetails.language,
      license: repoDetails.license?.name,
      updatedAt: repoDetails.updated_at,
    };

  } catch (error: any) {
    console.error('Error fetching repository data:', error);
    // Re-throw with a user-friendly message or specific error type
    if (error.message.includes("rate limit exceeded")) {
         throw new Error("GitHub API rate limit exceeded. Please try again later or configure an API token.");
    }
    throw new Error(`Failed to analyze repository: ${error.message}`);
  }
};
