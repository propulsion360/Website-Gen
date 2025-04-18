import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FormProgressProps {
  sections: string[];
  currentSection: number;
  onSectionClick: (index: number) => void;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  sections,
  currentSection,
  onSectionClick,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {sections.map((section, index) => (
          <React.Fragment key={section}>
            <button
              onClick={() => onSectionClick(index)}
              className={`relative flex flex-col items-center ${
                index <= currentSection ? 'text-primary' : 'text-gray-400'
              }`}
              disabled={index > currentSection}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${index <= currentSection ? 'bg-primary text-white' : 'bg-gray-200'}
                transition-colors duration-200
              `}>
                {index < currentSection ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="mt-2 text-sm font-medium">
                {section}
              </span>
              {index <= currentSection && (
                <motion.div
                  className="absolute -bottom-1 w-full h-0.5 bg-primary"
                  layoutId="progress"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                />
              )}
            </button>
            {index < sections.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 