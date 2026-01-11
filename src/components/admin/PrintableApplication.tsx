import { forwardRef } from 'react';
import { Registration, PATHFINDER_CLASSES } from '@/types/registration';
import { cn } from '@/lib/utils';
import { CheckCircle2, Square } from 'lucide-react';

interface PrintableApplicationProps {
    application: Registration;
}

const PrintableApplication = forwardRef<HTMLDivElement, PrintableApplicationProps>(
    ({ application }, ref) => {

        const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };

        return (
            <div ref={ref} className="p-8 max-w-4xl mx-auto bg-white text-black print:p-0">
                <style type="text/css" media="print">
                    {`
            @page { size: A4; margin: 20mm; }
            body { -webkit-print-color-adjust: exact; }
          `}
                </style>

                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-primary pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        {/* Logo Placeholder - assuming local asset or text if no logo file */}
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
                            <span className="font-bold text-2xl text-primary">PF</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-wide">Santasi SDA Pathfinder Club</h1>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider">Membership Application Form</p>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <p className="font-semibold">Application ID</p>
                        <p className="font-mono text-lg">{application.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Applicant Details */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="col-span-1">
                        {application.applicant.profileImage ? (
                            <img
                                src={application.applicant.profileImage}
                                alt="Profile"
                                className="w-full aspect-square object-cover rounded-md border border-gray-300"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-gray-100 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
                                No Photo
                            </div>
                        )}
                    </div>
                    <div className="col-span-3 grid grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Full Name</span>
                            <div className="border-b border-gray-300 pb-1 font-medium">{application.applicant.fullName}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Date of Birth</span>
                            <div className="border-b border-gray-300 pb-1">{formatDate(application.applicant.dateOfBirth)} (Age: {application.applicant.age})</div>
                        </div>

                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Phone</span>
                            <div className="border-b border-gray-300 pb-1">{application.applicant.phone}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Grade</span>
                            <div className="border-b border-gray-300 pb-1">{application.applicant.grade}</div>
                        </div>

                        <div className="col-span-2">
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Address</span>
                            <div className="border-b border-gray-300 pb-1">{application.applicant.address}</div>
                        </div>

                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">School</span>
                            <div className="border-b border-gray-300 pb-1">{application.applicant.school}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">School Type</span>
                            <div className="border-b border-gray-300 pb-1">{application.applicant.schoolType}</div>
                        </div>

                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Church</span>
                            <div className="border-b border-gray-300 pb-1">{application.applicant.church}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Preferred Club</span>
                            <div className="border-b border-gray-300 pb-1">{application.applicant.preferredClubName}</div>
                        </div>
                    </div>
                </div>

                {/* Section Divider */}
                <div className="w-full h-px bg-gray-200 mb-6"></div>

                {/* Membership Info */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase text-primary mb-4 border-b border-primary pb-2">Membership Information</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Completed Classes</p>
                            <div className="flex flex-wrap gap-2">
                                {PATHFINDER_CLASSES.map(cls => (
                                    <div key={cls} className="flex items-center gap-2 text-sm">
                                        {application.membership.completedClasses.includes(cls) ? (
                                            <CheckCircle2 className="h-4 w-4 text-black" />
                                        ) : (
                                            <Square className="h-4 w-4 text-gray-300" />
                                        )}
                                        <span className={cn(application.membership.completedClasses.includes(cls) ? "font-medium" : "text-gray-400")}>
                                            {cls}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Honors Earned</span>
                                <div className="border-b border-gray-300 pb-1 min-h-[1.5rem]">{application.membership.honorsEarned || 'None listed'}</div>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Dress Uniform</span>
                                    <div className="font-medium">{application.membership.hasFullDressUniform ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Field Uniform</span>
                                    <div className="font-medium">{application.membership.hasFullFieldUniform ? 'Yes' : 'No'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guardian Info */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase text-primary mb-4 border-b border-primary pb-2">Parent / Guardian Information</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Guardian Name</span>
                            <div className="border-b border-gray-300 pb-1 font-medium">{application.guardian.fullName}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Relationship</span>
                            <div className="border-b border-gray-300 pb-1">{application.guardian.relationship}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Phone</span>
                            <div className="border-b border-gray-300 pb-1">{application.guardian.phone}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Occupation</span>
                            <div className="border-b border-gray-300 pb-1">{application.guardian.occupation}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Master Guide?</span>
                            <div className="font-medium">{application.guardian.isMasterGuide ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">Areas of Assistance</span>
                            <div className="border-b border-gray-300 pb-1">{application.guardian.areasOfAssistance.join(', ') || 'None'}</div>
                        </div>
                    </div>
                </div>

                {/* Consent & Signature */}
                <div className="mt-8 pt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold uppercase mb-2">Declaration of Consent</h3>
                    <p className="text-xs text-gray-600 mb-4 italic leading-relaxed">
                        I hereby certify that the information provided above is correct. I agree to support the regulations of the Pathfinder Club and to cooperate with the leaders. I understand that the club is not responsible for any liability.
                    </p>

                    <div className="grid grid-cols-2 gap-8 mt-8">
                        <div>
                            <div className="h-16 border-b border-gray-400 flex items-end">
                                {application.consent.signature.startsWith('data:image') ? (
                                    <img src={application.consent.signature} alt="Signature" className="h-14 mb-1" />
                                ) : (
                                    <span className="font-script text-lg">{application.consent.signature}</span>
                                )}
                            </div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mt-1">Signature of Applicant / Guardian</span>
                        </div>
                        <div>
                            <div className="h-16 border-b border-gray-400 flex items-end">
                                <span className="mb-1">{formatDate(application.consent.signatureDate)}</span>
                            </div>
                            <span className="block text-xs uppercase text-gray-500 font-semibold mt-1">Date Signed</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-gray-400">
                    <p>Generated on {new Date().toLocaleDateString()} • Santasi SDA Pathfinder Club</p>
                </div>
            </div>
        );
    }
);

PrintableApplication.displayName = 'PrintableApplication';

export default PrintableApplication;
