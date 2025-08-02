'use client'

import ModelManager from '../../components/ModelManager';

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModelManager 
        isOpen={true}
        onClose={() => {}}
        onBackToSettings={() => {}}
        onModelsChange={() => {}}
      />
    </div>
  );
} 