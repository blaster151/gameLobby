import React from 'react';

interface TutorialStep {
  title: string;
  content: string;
  image?: string;
}

interface TutorialProps {
  gameName: string;
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Tutorial({ gameName, steps, isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#333',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        color: 'white',
        border: '2px solid #666',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{gameName} Tutorial</h2>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: '#ccc',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#60a5fa' }}>
            {steps[currentStep].title}
          </h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>
            {steps[currentStep].content}
          </p>
          {steps[currentStep].image && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <img 
                src={steps[currentStep].image} 
                alt={steps[currentStep].title}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
            Step {currentStep + 1} of {steps.length}
          </div>
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '0.5rem',
                }}
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                background: '#60a5fa',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 