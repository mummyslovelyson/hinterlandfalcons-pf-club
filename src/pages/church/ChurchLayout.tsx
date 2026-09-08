import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ChurchSidebar from '@/components/church/ChurchSidebar';
import ChurchHeader from '@/components/church/ChurchHeader';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const ChurchLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="fixed inset-0 flex bg-muted/30 overflow-hidden">
            <div className="hidden md:flex h-full shrink-0">
                <ChurchSidebar />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full">
                <ChurchHeader onMobileMenuToggle={() => setMobileOpen(true)} />

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border [&>button]:text-sidebar-foreground">
                        <SheetTitle className="sr-only">Church navigation</SheetTitle>
                        <ChurchSidebar hideCollapse onNavigate={() => setMobileOpen(false)} />
                    </SheetContent>
                </Sheet>

                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ChurchLayout;
