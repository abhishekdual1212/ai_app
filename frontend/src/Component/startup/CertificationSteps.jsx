import React, { useMemo, useState } from 'react';
import AvoidPenalty from './outcomes/AvoidPenalty';
import BestPractices from './outcomes/BestPractices';
import CertificationDocs from './outcomes/CertificationDocs';
import Documents from './outcomes/document';


const Chevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StepCheckbox = ({ checked }) => (
  <span
    className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
      checked ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-300'
    }`}
  >
    {checked && (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </span>
);

const HeaderSelect = ({ label }) => (
  <div className="rounded-md bg-white/90 shadow-sm ring-1 ring-slate-200">
    <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-slate-700">
      <span className="text-[12px] font-semibold tracking-wide">{label}</span>
      <Chevron open={false} />
    </button>
  </div>
);

const tabs = ['How To avoid Penalty', 'Industry best practice', 'Certification', 'Documents'];

const CertificationSteps = () => {
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: 'Initial Preparations',
      isCompleted: false,
      content: 'Gather required documents, assign responsible personnel and align timelines.'
    },
    {
      id: 2,
      title: 'Submit Form D-1',
      isCompleted: false,
      content: 'Prepare and submit Form D-1 with supporting documentation.'
    },
    {
      id: 3,
      title: 'Select an Authorized Testing Entity (ATE)',
      isCompleted: false,
      content: 'Shortlist and onboard an ATE appropriate for your prototype and category.'
    },
    {
      id: 4,
      title: 'Application Review and Prototype Testing',
      isCompleted: false,
      content: 'ATE evaluation and controlled environment testing.',
      notes: [
        'The ATE evaluates documents for compliance and conducts prototype testing, including laboratory and flight tests under controlled airspace.',
        'Flight tests are restricted to a height of 15m and 50m from personnel.',
        'A comprehensive test report with recommendations is submitted to DGCA.'
      ]
    },
    {
      id: 5,
      title: 'Application Review and Prototype Testing',
      isCompleted: true,
      content: 'Address observations and submit revised documentation if required.'
    },
    {
      id: 6,
      title: 'Maintenance of Certification',
      isCompleted: true,
      content: 'Ensure continuous compliance, periodic audits, and record keeping.'
    },
    {
      id: 7,
      title: 'Key Considerations',
      isCompleted: true,
      content: 'Understand operational constraints and safety requirements.'
    }
  ]);

  const [transferAchieved, setTransferAchieved] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [openIEC, setOpenIEC] = useState(false);
  const [openTypeCert, setOpenTypeCert] = useState(false);

  const completedCount = useMemo(() => steps.filter(s => s.isCompleted).length, [steps]);
  const currentIndex = useMemo(() => {
    const idx = steps.findIndex(s => !s.isCompleted);
    return idx === -1 ? steps.length - 1 : idx;
  }, [steps]);

  const toggleDropdown = (id) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s)));
  };

  const toggleStepComplete = (id) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s)));
  };

  return (
    <div className="w-full bg-[#eaf0fb] px-4 py-6 sm:px-6 lg:px-10 mx-3">
      <div className="mx-auto max-w-[1100px]">
        {/* Top tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 rounded-full bg-white/90 p-1 shadow-sm ring-1 ring-slate-200 md:inline-flex">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-colors md:text-sm ${
                  activeTab === t ? 'bg-[#1545f0] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {activeTab === 'Checklist' && (
          <>
            {/* Progress timeline */}
            <div className="relative mb-6 mt-2 hidden h-8 items-center md:flex">
              <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-300" />
              {[0,1,2,3,4,5,6].map((i) => (
                <span
                  key={i}
                  className={`relative mx-8 inline-flex h-2.5 w-2.5 -translate-y-[2px] rounded-full ${
                    i < completedCount ? 'bg-emerald-500' : 'bg-white ring-1 ring-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Header selects */}
            <div className="grid gap-3 md:max-w-[720px]">
              <div className="rounded-md bg-white/90 shadow-sm ring-1 ring-slate-200">
                <button type="button" onClick={() => setOpenIEC(!openIEC)} className="flex w-full items-center justify-between px-4 py-3 text-slate-700">
                  <span className="text-[12px] font-semibold tracking-wide">IMPORT EXPORT CERTIFICATION (IEC)</span>
                  <Chevron open={openIEC} />
                </button>
                {openIEC && (
                  <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600">Select or manage IEC related workflows.</div>
                )}
              </div>

              <div className="rounded-md bg-white/90 shadow-sm ring-1 ring-slate-200">
                <button type="button" onClick={() => setOpenTypeCert(!openTypeCert)} className="flex w-full items-center justify-between px-4 py-3 text-slate-700">
                  <span className="text-[12px] font-semibold tracking-wide">TYPE CERTIFICATE</span>
                  <Chevron open={openTypeCert} />
                </button>
                {openTypeCert && (
                  <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600">Choose the applicable certificate type to proceed.</div>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="mt-3 space-y-2 md:max-w-[720px]">
              {steps.map((step) => {
                const isDone = step.isCompleted;
                return (
                  <div
                    key={step.id}
                    className={`rounded-md ring-1 ring-slate-200 shadow-sm ${
                      isDone ? 'bg-emerald-50' : 'bg-[#fffdf0]'
                    }`}
                  >
                    <div className="flex items-start gap-3 px-3 py-3 sm:px-4">
                      <button type="button" aria-label="toggle-complete" onClick={() => toggleStepComplete(step.id)} className="mt-0.5">
                        <StepCheckbox checked={isDone} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <button type="button" onClick={() => toggleDropdown(step.id)} className="flex w-full items-center justify-between">
                          <p className="truncate text-left text-sm font-medium text-slate-800">Step {step.id} • {step.title}</p>
                          <Chevron open={Boolean(step.isOpen)} />
                        </button>
                        {step.isOpen && (
                          <div className="mt-2 select-text text-xs text-slate-600">
                            <p className="leading-relaxed">{step.content}</p>
                            {step.notes && (
                              <ul className="mt-2 list-disc space-y-1 pl-5">
                                {step.notes.map((n, idx) => (
                                  <li key={idx}>{n}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Achieved section */}
            <div className="md:max-w-[720px]">
              <div className={`mt-4 rounded-md ring-1 ring-slate-200 shadow-sm ${transferAchieved ? 'bg-emerald-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">Achieved</span>
                  </span>
                  <div className="ml-4 flex-1">
                    <button type="button" onClick={() => setTransferAchieved(!transferAchieved)} className="flex w-full items-center justify-between text-left text-sm text-slate-800">
                      <span>Transfer of UIN</span>
                      <Chevron open={transferAchieved} />
                    </button>
                  </div>
                </div>
                {transferAchieved && (
                  <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600">UIN transferred successfully. View details or download acknowledgment.</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'How To avoid Penalty' && (
          <div className="mt-3">
            <AvoidPenalty />
          </div>
        )}

        {activeTab === 'Industry best practice' && (
          <div className="mt-3">
            <BestPractices />
          </div>
        )}

        {activeTab === 'Certification' && (
          <div className="mt-3">
            <CertificationDocs />
          </div>
        )}
        {activeTab === 'Documents' && (
          <div className="mt-3">
            <Documents />
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationSteps;