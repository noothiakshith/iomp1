
import React, { useState } from 'react';
import type { RepoData, Commit, Issue, PullRequest, Contributor, RepoFile, ActiveView as ActiveViewEnum } from '../types';
import { ActiveView } from '../types'; // Enum import
import { FileTreeItem } from './FileTreeItem';
import { CommitListItem } from './CommitListItem';
import { IssueListItem } from './IssueListItem';
// Corrected import statement: 'Kport' changed to 'import' and PullRequestListItem path verified
import { PullRequestListItem } from './PullRequestListItem'; 
import { ContributorListItem } from './ContributorListItem'; 
import { CodeIcon } from './icons/CodeIcon';
import { GitCommitIcon } from './icons/GitCommitIcon';
import { IssueOpenedIcon } from './icons/IssueOpenedIcon';
import { PullRequestIcon } from './icons/PullRequestIcon';
import { UsersIcon } from './icons/UsersIcon'; // Placeholder for contributors icon
import { FolderIcon } from './icons/FolderIcon'; // Placeholder for files icon
import { InfoIcon } from './icons/InfoIcon'; // Placeholder for overview icon
import { formatDistanceToNowStrict } from 'date-fns';


interface RepoViewProps {
  repoData: RepoData;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow flex items-center">
    <div className="p-2 bg-gray-600 rounded-md mr-3">{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-100">{value}</p>
    </div>
  </div>
);


export const RepoView: React.FC<RepoViewProps> = ({ repoData }) => {
  const [activeView, setActiveView] = useState<ActiveViewEnum>(ActiveView.OVERVIEW);

  const renderActiveView = () => {
    switch (activeView) {
      case ActiveView.OVERVIEW:
        return (
          <div className="space-y-6 p-2 md:p-4">
            <h2 className="text-2xl font-semibold text-indigo-400 mb-3">{repoData.fullName}</h2>
            <p className="text-gray-300">{repoData.description || 'No description provided.'}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard label="Stars" value={repoData.stars.toLocaleString()} icon={<StarIcon className="w-5 h-5 text-yellow-400"/>} />
                <StatCard label="Forks" value={repoData.forks.toLocaleString()} icon={<GitForkIcon className="w-5 h-5 text-blue-400"/>} />
                <StatCard label="Open Issues" value={repoData.openIssuesCount.toLocaleString()} icon={<IssueOpenedIcon className="w-5 h-5 text-green-400"/>} />
                <StatCard label="Language" value={repoData.language || 'N/A'} icon={<CodeIcon className="w-5 h-5 text-purple-400"/>} />
                {repoData.license && <StatCard label="License" value={repoData.license} icon={<ScaleIcon className="w-5 h-5 text-gray-400"/>} />}
                 {repoData.updatedAt && <StatCard label="Last Updated" value={formatDistanceToNowStrict(new Date(repoData.updatedAt), { addSuffix: true })} icon={<ClockIcon className="w-5 h-5 text-teal-400"/>} />}
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-200 mt-6 mb-2">Repository Files</h3>
                 <div className="bg-gray-750 p-4 rounded-md max-h-96 overflow-y-auto border border-gray-700">
                    {repoData.files && repoData.files.length > 0 ? (
                        repoData.files.map(file => <FileTreeItem key={file.path} file={file} />)
                    ) : (
                        <p className="text-gray-500">No file structure data available.</p>
                    )}
                </div>
            </div>
          </div>
        );
      case ActiveView.FILES:
        return (
            <div className="p-2 md:p-4">
                <h3 className="text-xl font-semibold text-gray-200 mb-3">File Structure</h3>
                 <div className="bg-gray-750 p-4 rounded-md max-h-[60vh] overflow-y-auto border border-gray-700">
                    {repoData.files && repoData.files.length > 0 ? (
                        repoData.files.map(file => <FileTreeItem key={file.path} file={file} />)
                    ) : (
                        <p className="text-gray-500">No file structure data available.</p>
                    )}
                </div>
            </div>
        );
      case ActiveView.COMMITS:
        return (
          <div className="space-y-3 p-2 md:p-4 max-h-[70vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Recent Commits ({repoData.commits.length})</h3>
            {repoData.commits.length > 0 ? repoData.commits.map(commit => <CommitListItem key={commit.sha} commit={commit} />) : <p className="text-gray-500">No commits found.</p>}
          </div>
        );
      case ActiveView.ISSUES:
        return (
          <div className="space-y-3 p-2 md:p-4 max-h-[70vh] overflow-y-auto">
             <h3 className="text-xl font-semibold text-gray-200 mb-3">Issues ({repoData.issues.length})</h3>
            {repoData.issues.length > 0 ? repoData.issues.map(issue => <IssueListItem key={issue.id} issue={issue} />) : <p className="text-gray-500">No issues found.</p>}
          </div>
        );
      case ActiveView.PULL_REQUESTS:
        return (
          <div className="space-y-3 p-2 md:p-4 max-h-[70vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Pull Requests ({repoData.pullRequests.length})</h3>
            {/* Corrected: PullRequestListItem is now correctly imported and can be used */}
            {repoData.pullRequests.length > 0 ? repoData.pullRequests.map(pr => <PullRequestListItem key={pr.id} pr={pr} />) : <p className="text-gray-500">No pull requests found.</p>}
          </div>
        );
      case ActiveView.CONTRIBUTORS:
        return (
          <div className="p-2 md:p-4 max-h-[70vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Top Contributors ({repoData.contributors.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {repoData.contributors.length > 0 ? repoData.contributors.map(contrib => <ContributorListItem key={contrib.login} contributor={contrib} />) : <p className="text-gray-500">No contributors data available.</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ view: ActiveViewEnum; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center justify-center sm:justify-start text-sm sm:text-base px-3 py-3 font-medium rounded-t-md transition-colors duration-150
        ${activeView === view ? 'bg-gray-750 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'}`}
    >
      {icon} <span className="ml-2 hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 border-b border-gray-700">
        <nav className="flex space-x-1 sm:space-x-2 p-2 overflow-x-auto">
          <TabButton view={ActiveView.OVERVIEW} label="Overview" icon={<InfoIcon className="w-5 h-5"/>} />
          <TabButton view={ActiveView.FILES} label="Files" icon={<FolderIcon className="w-5 h-5"/>} />
          <TabButton view={ActiveView.COMMITS} label="Commits" icon={<GitCommitIcon className="w-5 h-5"/>} />
          <TabButton view={ActiveView.ISSUES} label="Issues" icon={<IssueOpenedIcon className="w-5 h-5"/>} />
          <TabButton view={ActiveView.PULL_REQUESTS} label="Pull Requests" icon={<PullRequestIcon className="w-5 h-5"/>} />
          <TabButton view={ActiveView.CONTRIBUTORS} label="Contributors" icon={<UsersIcon className="w-5 h-5"/>} />
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto bg-gray-750 p-1"> {/* Ensure this part scrolls */}
        {renderActiveView()}
      </div>
    </div>
  );
};

// Placeholder icons (should be actual SVG components)
const StarIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>;
const GitForkIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM11 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM5 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm6.5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-3.5-1A2.502 2.502 0 0 0 10.5 8a.5.5 0 0 1 1 0 3.502 3.502 0 0 1-3.5 3.5h-1A3.502 3.502 0 0 1 3.5 8a.5.5 0 0 1 1 0 2.502 2.502 0 0 0 2.5 2.5h1A2.502 2.502 0 0 0 10.5 8a2.5 2.5 0 0 0-2.5-2.5h-1A2.5 2.5 0 0 0 5.5 8a.5.5 0 0 1-1 0A3.5 3.5 0 0 1 8 4.5h1A3.5 3.5 0 0 1 12.5 8a.5.5 0 0 1-1 0A2.5 2.5 0 0 0 9 5.5h-1A2.5 2.5 0 0 0 5.5 8a2.5 2.5 0 0 0 2.5 2.5H9a2.5 2.5 0 0 0 2-1z"></path></svg>;
const ScaleIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6zM6 5a1 1 0 00-1 1v3h10V6A1 1 0 0015 5H6z" clipRule="evenodd"></path></svg>;
const ClockIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>;