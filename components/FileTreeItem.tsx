
import React, { useState } from 'react';
import type { RepoFile } from '../types';
import { FolderIcon, FolderOpenIcon } from './icons/FolderIcon'; // FolderOpenIcon to be created or use Chevron
import { DocumentIcon } from './icons/DocumentIcon';
import { ChevronRightIcon, ChevronDownIcon } from './icons/ChevronIcons'; // To be created

interface FileTreeItemProps {
  file: RepoFile;
  level?: number;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ file, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDirectory = file.type === 'dir';

  const handleToggle = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
  };

  const indentStyle = { paddingLeft: `${level * 1.5}rem` };

  return (
    <div className="text-sm">
      <div
        className={`flex items-center py-1.5 px-2 rounded hover:bg-gray-700 cursor-pointer ${isDirectory ? 'font-medium' : ''}`}
        style={indentStyle}
        onClick={handleToggle}
      >
        {isDirectory ? (
          isOpen ? <ChevronDownIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
        ) : (
          <span className="w-4 mr-2 flex-shrink-0"></span> // Placeholder for alignment
        )}
        {isDirectory ? (
          isOpen ? <FolderOpenIcon className="w-4 h-4 mr-1.5 text-indigo-400 flex-shrink-0" /> : <FolderIcon className="w-4 h-4 mr-1.5 text-indigo-400 flex-shrink-0" />
        ) : (
          <DocumentIcon className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
        )}
        <span className="truncate text-gray-200 hover:text-gray-50">{file.name}</span>
      </div>
      {isOpen && isDirectory && file.children && (
        <div className="border-l border-gray-600 ml-[calc(0.75rem+2px)]"> {/* Adjust margin to align border with icon center */}
          {file.children.map((child) => (
            <FileTreeItem key={child.path} file={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
