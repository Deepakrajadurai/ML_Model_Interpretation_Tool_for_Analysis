import React from 'react';
import { X, Link2, Download, Github } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Share Analysis</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Link2 className="w-5 h-5 text-primary-400" />
              <span className="font-semibold text-white">Shareable Link</span>
            </div>
            <div className="p-2 bg-slate-600 rounded text-sm font-mono text-slate-300 break-all">
              https://explainability-explorer.com/share/abc123def456
            </div>
            <button className="mt-2 text-sm text-primary-400 hover:text-primary-300">
              Copy Link
            </button>
          </div>

          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="w-5 h-5 text-secondary-400" />
              <span className="font-semibold text-white">Download Recording</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Your analysis has been recorded as a GIF for easy sharing
            </p>
            <button className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 
                             text-white rounded-lg transition-colors">
              Download GIF
            </button>
          </div>

          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Github className="w-5 h-5 text-accent-400" />
              <span className="font-semibold text-white">GitHub Discussions</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Share your findings with the ML explainability community
            </p>
            <button className="px-4 py-2 bg-accent-600 hover:bg-accent-700 
                             text-white rounded-lg transition-colors">
              Post to Discussions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};